import * as Evolu from '@evolu/react';
import * as JSONSchema from '@effect/schema/JSONSchema';
import * as S from '@effect/schema/Schema';
import * as ParseResult from '@effect/schema/ParseResult';
import { cast } from '@evolu/react';
import { Option } from 'effect';
import normalizeUrl from 'normalize-url';

import { ReadabilitySchema } from '../api/scrape-url/schemas';

export const PositiveNumber = Evolu.PositiveInt;

export const NonEmptyString50 = Evolu.String.pipe(
  S.minLength(1),
  S.maxLength(50),
  S.brand('NonEmptyString50'),
);
export type NonEmptyString50 = S.Schema.Type<typeof NonEmptyString50>;

export const decodeNonEmptyString50 = S.decodeEither(NonEmptyString50);

// "" -> null
// "0" -> 0
// "1" -> 1
// "-1" -> null
// "1.5" -> 1.5
// "-1.5" -> null
// ~Schema<string, number | null, never>
// how do I make this transformer to be the type of Schema ?
export const NullablePositiveNumber = S.transform(
  S.String,
  S.NullOr(S.Number),
  {
    decode: (s: string): number | null => {
      if (s === '') return null;

      const n = parseFloat(s);

      if (n < 0) return null;
      if (isNaN(n)) return null;
      if (!isFinite(n)) return null;

      return n;
    },
    encode: (n: number | null): string => {
      if (n === null) return '';

      return n.toString();
    },
  },
);

const NormalizedUrlString = S.String.pipe(
  S.filter((value) => {
    try {
      const normalizedUrl = normalizeUrl(value);
      return new URL(normalizedUrl).toString() === normalizedUrl;
    } catch (_) {
      return false;
    }
  }),
  S.brand('NormalizedUrlString'),
);
export type NormalizedUrlString = S.Schema.Type<typeof NormalizedUrlString>;

const NormalizeUrlString = S.transformOrFail(S.String, NormalizedUrlString, {
  decode: (value, _, ast) =>
    ParseResult.try({
      try: () => {
        // TODO: how to write this so I don't need to dbl the logic in NormalizedUrlString AND NormalizeUrlString?
        const normalizedUrl = normalizeUrl(value);
        const toString = new URL(normalizedUrl).toString();
        return toString;
      },
      catch: (err) =>
        new ParseResult.Type(
          ast,
          value,
          err instanceof Error ? err.message : undefined,
        ),
    }),
  encode: ParseResult.succeed,
});

export const decodeUrl = S.decodeEither(NormalizeUrlString);

// boolean => sqlite boolean
const BooleanToSqliteBoolean = S.transform(S.Boolean, Evolu.SqliteBoolean, {
  decode: (bool: boolean) => {
    if (bool === true) {
      return 1;
    }
    return 0;
  },
  encode: (sqliteBoolean: number | null): boolean => {
    if (sqliteBoolean === null) return false;
    if (sqliteBoolean === 0) return false;
    return true;
  },
});

export const decodeSQLiteBoolean = S.decodeEither(BooleanToSqliteBoolean);

export const NumberFromString = S.NumberFromString.pipe(S.finite(), S.nonNaN());

const CocktailId = Evolu.id('cocktail');
export type CocktailId = S.Schema.Type<typeof CocktailId>;

const IngredientId = Evolu.id('ingredient');
export type IngredientId = S.Schema.Type<typeof IngredientId>;

const CocktailIngredientId = Evolu.id('cocktail_ingredient');
export type CocktailIngredientId = S.Schema.Type<typeof CocktailIngredientId>;

const UnitId = Evolu.id('unit');
export type UnitId = S.Schema.Type<typeof UnitId>;

const CocktailTable = Evolu.table({
  id: CocktailId,
  name: S.NullOr(NonEmptyString50), // allowing this to be null as a way to indicate that the cocktail is a template and we should scrap the url to populate the name (and subsequently the ingredients)
  url: S.NullOr(NormalizedUrlString),
  urlContent: S.NullOr(ReadabilitySchema), // NOTE: https://www.evolu.dev/docs/patterns#json
  // madeThis: S.NullOr(Date), // TODO: add this feature
});
type CocktailTable = S.Schema.Type<typeof CocktailTable>;

const IngredientTable = Evolu.table({
  id: IngredientId,
  name: NonEmptyString50,
});
type IngredientTable = S.Schema.Type<typeof IngredientTable>;

const CocktailIngredientTable = Evolu.table({
  id: CocktailIngredientId,
  cocktail_id: CocktailId,
  ingredient_id: S.NullOr(IngredientId),
  unit_id: S.NullOr(UnitId),
  amount: NullablePositiveNumber,
  order: Evolu.PositiveInt,
  // @deprecated
  isGarnish: S.NullOr(Evolu.SqliteBoolean),
});
type CocktailIngredientTable = S.Schema.Type<typeof CocktailIngredientTable>;

export const CocktailIngredientLLMInput = S.Struct({
  ingredients: S.Array(
    S.Struct({
      // name: S.String,
      genericType: S.String,
      maybeSpecificTypes: S.optional(S.Array(S.String)),
      amount: S.optional(S.NullOr(S.Number)),
      unit: S.optional(S.NullOr(S.String)),
      isGarnish: S.optional(S.Boolean),
      isTop: S.optional(S.Boolean),
    }),
  ),
});
export type CocktailIngredientLLMInput = S.Schema.Type<
  typeof CocktailIngredientLLMInput
>;

export const GarnishIngredientLLMInput = S.Struct({
  garnishes: S.Array(S.String),
});
export type GarnishIngredientLLMInput = S.Schema.Type<
  typeof GarnishIngredientLLMInput
>;

export const TopIngredientLLMInput = S.Struct({
  top: S.Array(S.String),
});
export type TopIngredientLLMInput = S.Schema.Type<typeof TopIngredientLLMInput>;

const UnitTable = Evolu.table({
  id: UnitId,
  // @deprecated
  name: S.NullOr(NonEmptyString50),
  labelSingular: NonEmptyString50,
  labelPlural: NonEmptyString50,
  abbreviation: NonEmptyString50,
  hasAmount: Evolu.SqliteBoolean,
  gatherInGroup: Evolu.SqliteBoolean,
});
type UnitTable = S.Schema.Type<typeof UnitTable>;

const Database = Evolu.database({
  cocktails: CocktailTable,
  ingredients: IngredientTable,
  cocktail_ingredients: CocktailIngredientTable,
  units: UnitTable,
});
type Database = S.Schema.Type<typeof Database>;

export const evolu = Evolu.createEvolu(Database, {
  minimumLogLevel: 'trace',
});

// QUERIES START -------------------------------------------------------------

export const cocktailsAll = evolu.createQuery((db) =>
  db
    .selectFrom('cocktails')
    .select(['id', 'name', 'url'])
    .where('isDeleted', 'is not', cast(true)),
);

export const ingredientsAll = evolu.createQuery((db) =>
  db
    .selectFrom('ingredients')
    .select(['id', 'name'])
    .where('isDeleted', 'is not', cast(true))
    .where('name', 'is not', null)
    .$narrowType<{ name: Evolu.NotNull }>()
    .orderBy('name', 'asc'),
);
export type Ingredients = S.Schema.Type<typeof ingredientsAll>;

export const ingredientById = (id: IngredientId) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom('ingredients')
        .select(['id', 'name'])
        .where('id', '=', id)
        .where('isDeleted', 'is not', cast(true)),
    // .where('name', 'is not', null)
    // .$narrowType<{ name: Evolu.NotNull }>()
    {
      logQueryExecutionTime: true,
    },
  );
export type IngredientById = S.Schema.Type<typeof ingredientById>;

export const unitsAll = evolu.createQuery((db) =>
  db
    .selectFrom('units')
    .select(['id', 'abbreviation', 'labelSingular', 'labelPlural'])
    .where('isDeleted', 'is not', cast(true))
    .where('abbreviation', 'is not', null)
    .$narrowType<{ abbreviation: Evolu.NotNull }>()
    .orderBy('createdAt', 'desc'),
);
export type Units = S.Schema.Type<typeof unitsAll>;

export const cocktailIngredientsAll = evolu.createQuery((db) =>
  db
    .selectFrom('cocktail_ingredients')
    .selectAll()
    .where('isDeleted', 'is not', cast(true))
    .$narrowType<{ ingredient_id: Evolu.NotNull }>()
    .orderBy('order'),
);
export type CocktailIngredients = S.Schema.Type<typeof cocktailIngredientsAll>;

export const unitById = (id: UnitId) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom('units')
        .select([
          'id',
          'name',
          'labelSingular',
          'labelPlural',
          'abbreviation',
          'hasAmount',
          'gatherInGroup',
        ])
        .where('id', '=', id)
        .where('isDeleted', 'is not', cast(true)),
    // .where('name', 'is not', null)
    // .$narrowType<{ name: Evolu.NotNull }>(),
  );
export type UnitsById = S.Schema.Type<typeof unitById>;

// maybe could collapse this into one query with `cocktailById` below using https://kysely.dev/docs/recipes/conditional-selects
export const cocktailByIdJoined = (id: CocktailId) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('cocktails')
      .select(['id', 'name', 'url', 'urlContent'])
      .where('id', '=', S.decodeSync(CocktailId)(id))
      .where('isDeleted', 'is not', cast(true))
      .$narrowType<{ name: Evolu.NotNull }>()
      .select((eb) => [
        Evolu.jsonArrayFrom(
          eb
            .selectFrom('cocktail_ingredients')
            .select([
              'cocktail_ingredients.id',
              'cocktail_ingredients.unit_id',
              'cocktail_ingredients.amount',
              'cocktail_ingredients.order',
            ])
            .where('cocktail_ingredients.cocktail_id', '=', id)
            .where('cocktail_ingredients.isDeleted', 'is not', cast(true))
            // .$narrowType<{ ingredient_id: Evolu.NotNull }>()
            .orderBy('cocktail_ingredients.order')
            // get the unit name
            .select((eb) => [
              Evolu.jsonObjectFrom(
                eb
                  .selectFrom('units')
                  .select(['abbreviation', 'hasAmount'])
                  .whereRef('units.id', '=', 'cocktail_ingredients.unit_id'),
              ).as('unit'),
            ])
            // get the ingredient name
            .select((eb) => [
              Evolu.jsonObjectFrom(
                eb
                  .selectFrom('ingredients')
                  .select(['name'])
                  .whereRef(
                    'ingredients.id',
                    '=',
                    'cocktail_ingredients.ingredient_id',
                  )
                  .where('ingredients.isDeleted', 'is not', cast(true)),
              ).as('ingredient'),
            ]),
        ).as('ingredients'),
      ]),
  );
export type CocktailByIdJoined = S.Schema.Type<typeof cocktailByIdJoined>;
1.2;
export const cocktailById = (id: CocktailId) =>
  evolu.createQuery((db) =>
    db
      .selectFrom('cocktails')
      .select(['id', 'name', 'url', 'urlContent'])
      .where('id', '=', S.decodeSync(CocktailId)(id))
      .where('isDeleted', 'is not', cast(true))
      .select((eb) => [
        Evolu.jsonArrayFrom(
          eb
            .selectFrom('cocktail_ingredients')
            .select([
              'cocktail_ingredients.id',
              'cocktail_ingredients.cocktail_id',
              'cocktail_ingredients.ingredient_id',
              'cocktail_ingredients.unit_id',
              'cocktail_ingredients.amount',
              'cocktail_ingredients.order',
            ])
            .where('cocktail_ingredients.cocktail_id', '=', id)
            .where('cocktail_ingredients.isDeleted', 'is not', cast(true))
            .orderBy('cocktail_ingredients.order')
            .where('cocktail_ingredients.cocktail_id', 'is not', null)
            .$narrowType<{ cocktail_id: Evolu.NotNull }>()
            .where('cocktail_ingredients.order', 'is not', null)
            .$narrowType<{ order: Evolu.NotNull }>()
            // get whether the unit has an amount
            .select((eb) => [
              Evolu.jsonObjectFrom(
                eb
                  .selectFrom('units')
                  .select(['hasAmount'])
                  .whereRef('units.id', '=', 'cocktail_ingredients.unit_id'),
              ).as('unit'),
            ]),
        ).as('ingredients'),
      ]),
  );
export type CocktailById = S.Schema.Type<typeof cocktailById>;

// select all cocktails
// select all cocktails with their cocktail_ingredients
// select all cocktails where cocktail_ingredients.ingredient_id = ingredientId
export const cocktailsByIngredientId = (ingredientId: IngredientId) =>
  evolu.createQuery(
    (db) =>
      db
        .selectFrom('cocktails')
        .innerJoin(
          'cocktail_ingredients',
          'cocktail_ingredients.cocktail_id',
          'cocktails.id',
        )
        .innerJoin(
          'ingredients',
          'ingredients.id',
          'cocktail_ingredients.ingredient_id',
        )
        .where('ingredients.id', '=', ingredientId)
        .where('cocktail_ingredients.isDeleted', 'is not', cast(true))
        .selectAll('cocktails'),
    {
      logQueryExecutionTime: true,
    },
  );

export type CocktailsByIngredientId = S.Schema.Type<
  typeof cocktailsByIngredientId
>;

// QUERIES END ---------------------------------------------------------------

export const useEvolu = Evolu.useEvolu<Database>;
export const useLocalDb = useEvolu;

export const withProvider = <P extends {}>(Component: React.FC<P>) => {
  const WithProvider = (props: P) => {
    return (
      <Evolu.EvoluProvider value={evolu}>
        <Component {...props} />
      </Evolu.EvoluProvider>
    );
  };

  return WithProvider;
};
