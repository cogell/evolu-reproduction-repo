'use client';

import * as S from '@effect/schema/Schema';
import { ExtractRow, PositiveInt, useQuery } from '@evolu/react';
import {
  CocktailId,
  CocktailIngredientId,
  CocktailIngredientLLMInput,
  IngredientId,
  NonEmptyString50,
  NullablePositiveNumber,
  UnitId,
  cocktailById,
  decodeNonEmptyString50,
  decodeUrl,
  ingredientsAll,
  unitsAll,
  useEvolu,
  withProvider,
} from '../../../_lib/Db';
import { useEffect, useState } from 'react';
import Input from '@/app/_components/Input';
import Label from '@/app/_components/Label';
import { HStack, Stack } from '@/../styled-system/jsx';
import { Either, Option } from 'effect';
import { H1, H2, P } from '@/app/_components/Typography';
import { css } from '@/../styled-system/css';
import Select from '@/app/_components/select';
import Button from '@/app/_components/Button';
import Fuse from 'fuse.js';
import { Prompt, Tool } from '../../../api/ask-llm/schemas';
import * as JSONSchema from '@effect/schema/JSONSchema';
import { decodeReadability } from '../../../api/scrape-url/schemas';
import {
  decodeClaudeToolResponse,
  getToolUseContent,
} from '../../../api/_lib/schemas';
import useSave from '../../../api/_lib/use-save';
import RStack from '../../../_components/RStack';

type Cocktail = ExtractRow<ReturnType<typeof cocktailById>>;
type CocktailIngredient = Cocktail['ingredients'][number];

const Ingredient = ({
  ingredient,
  // onSave,
  onMove,
  isFirst,
  isLast,
}: {
  ingredient: CocktailIngredient;
  // onSave: () => void;
  onMove: (
    direction: 'up' | 'down',
    cocktailIngredientId: CocktailIngredientId,
  ) => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const { update } = useEvolu();
  const { rows: ingredients } = useQuery(ingredientsAll);
  const ingredientsAsSelect: Record<IngredientId, NonEmptyString50> =
    Object.fromEntries(ingredients.map((i) => [i.id, i.name]));

  const { rows: units } = useQuery(unitsAll);
  const unitsAsSelect: Record<UnitId, NonEmptyString50> = Object.fromEntries(
    units.map((i) => [i.id, i.abbreviation]),
  );

  const ingredientName = ingredients.find(
    (i) => i.id === ingredient.ingredient_id,
  )?.name;

  const handleIngredientSelect = (v: IngredientId) => {
    update('cocktail_ingredients', {
      id: ingredient.id,
      ingredient_id: v,
    });
    // onSave();
  };

  const saveAmount = (str: string) => {
    const amountOption = S.decodeOption(NullablePositiveNumber)(str);

    if (!Option.isSome(amountOption)) {
      return;
    }

    if (amountOption.value === ingredient.amount) {
      return;
    }

    update('cocktail_ingredients', {
      id: ingredient.id,
      amount: amountOption.value,
    });
    // onSave();
  };

  const handleUnitSelect = (v: UnitId) => {
    update('cocktail_ingredients', {
      id: ingredient.id,
      unit_id: v,
    });
    // onSave();
  };

  const removeIngredient = () => {
    update('cocktail_ingredients', {
      id: ingredient.id,
      isDeleted: true,
    });
    // onSave();
  };

  return (
    <RStack
      css={{
        my: 2,
        gap: 1,
      }}
    >
      <HStack>
        <Stack gap={0}>
          <span
            onClick={() => onMove('up', ingredient.id)}
            className={css({})}
            style={{
              opacity: isFirst ? 0.25 : 1,
              cursor: isFirst ? 'not-allowed' : 'pointer',
            }}
          >
            ↑
          </span>
          <span
            onClick={() => onMove('down', ingredient.id)}
            className={css({})}
            style={{
              opacity: isLast ? 0.25 : 1,
              cursor: isLast ? 'not-allowed' : 'pointer',
            }}
          >
            ↓
          </span>
        </Stack>
        <Select
          values={ingredientsAsSelect}
          value={ingredient.ingredient_id || ''}
          setValue={handleIngredientSelect}
          placeholder="Select an ingredient..."
        />
        <a href={`/ingredients/${ingredient.ingredient_id}`}>
          {ingredientName}
        </a>
      </HStack>
      <HStack>
        {ingredient.unit?.hasAmount === 1 && (
          <Input
            type="number"
            value={ingredient.amount + '' || ''}
            onDebounceChange={saveAmount}
            debounceDelay={500}
            placeholder="Amount"
            css={{
              width: '6ch',
            }}
          />
        )}
        <Select
          values={unitsAsSelect}
          value={ingredient.unit_id || ''}
          setValue={handleUnitSelect}
          placeholder="Select a unit..."
        ></Select>
        <Button size="sm" visual="warning" onClick={removeIngredient}>
          X
        </Button>
      </HStack>
    </RStack>
  );
};

const EditNoCocktail = () => {
  return (
    <div>
      <H1>Edit</H1>
      <p
        className={css({
          fontStyle: 'italic',
        })}
      >
        {`"Cocktails" will be added here`}
      </p>
    </div>
  );
};

const sanitizeIngredientsOrder = (
  cocktail: Cocktail,
  update: ReturnType<typeof useEvolu>['update'],
) => {
  const currentIngredients = cocktail.ingredients;
  const sortedIngredients = currentIngredients.sort(
    (a, b) => a.order - b.order,
  );

  sortedIngredients.forEach((ingredient, idx) => {
    update('cocktail_ingredients', {
      id: ingredient.id,
      order: S.decodeSync(PositiveInt)(idx + 1),
    });
  });
};

const dataSchema = S.Struct({
  name: S.String,
});

type dataSchema = S.Schema.Type<typeof dataSchema>;

const makeIngredientsPrompt = (recipe: string): Prompt => ({
  role: 'user',
  content: `
  <recipe>
  ${recipe}
  </recipe>

  Read the above recipe article, extract the ingredients from the article, and use the cocktail_ingredients to report the ingredients.
  `,
});

const ingredientsTool: Tool = {
  name: 'cocktail_ingredients',
  description: 'Name the cocktail',
  // @ts-expect-error: JSONSchema is too wide, we only want JSONSchema7Object
  input_schema: JSONSchema.make(CocktailIngredientLLMInput),
};

const searchUnits = (
  units: readonly ExtractRow<typeof unitsAll>[],
  unit: string,
) => {
  const fuseUnits = new Fuse(units, {
    threshold: 0.3,
    includeScore: true,
    keys: ['abbreviation', 'labelSingular', 'labelPlural'],
  });

  const unitFuzzyMatch = fuseUnits.search(unit);
  if (unitFuzzyMatch.length === 0) {
    return null;
  }

  console.log('unitFuzzyMatch', unitFuzzyMatch);

  return unitFuzzyMatch[0].item.id;
};

const searchIngredients = (
  ingredients: readonly ExtractRow<typeof ingredientsAll>[],
  name: string,
) => {
  const fuseIngredients = new Fuse(ingredients, {
    threshold: 0.2,
    includeScore: true,
    keys: ['name'],
  });

  const ingredientFuzzyMatch = fuseIngredients.search(name);
  if (ingredientFuzzyMatch.length === 0) {
    return null;
  }

  console.log('ingredientFuzzyMatch', ingredientFuzzyMatch);

  return ingredientFuzzyMatch[0].item.id;
};

const createOrFindIngredient = (
  cocktailId: CocktailId,
  ingredient: CocktailIngredientLLMInput['ingredients'][number],
  index: number,
  ingredients: readonly ExtractRow<typeof ingredientsAll>[],
  units: readonly ExtractRow<typeof unitsAll>[],
  create: ReturnType<typeof useEvolu>['create'],
  // update: ReturnType<typeof useEvolu>['update'],
) => {
  // eventually we want to be creating a new cocktail_ingredient
  // and to do that we might need to create a new ingredient
  // and to do that we might need to create a new unit

  const { genericType, amount, unit, isGarnish, isTop } = ingredient;

  let unitId = unit ? searchUnits(units, unit) : null;

  // TODO: clean up `let`
  let ingredientId = searchIngredients(ingredients, genericType);

  if (unitId === null) {
    console.log('create new unit for', unit);
    // return;
    // check for isGarnish and isTop
    if (isGarnish) {
      unitId = searchUnits(units, 'garnish');
      console.log('found unit', unitId, 'for unit', 'garnish');
    } else if (isTop) {
      unitId = searchUnits(units, 'top');
      console.log('found unit', unitId, 'for unit', 'top');
    }
  } else {
    console.log('found unit', unitId, 'for unit', unit);
  }

  if (ingredientId === null) {
    console.log('create new ingredient for', genericType);
    const nameDecoded = decodeNonEmptyString50(genericType);

    if (Either.isLeft(nameDecoded)) {
      console.error('nameDecoded is left', nameDecoded.left);
      return;
    }

    const createdIngredient = create('ingredients', {
      name: nameDecoded.right,
    });

    ingredientId = createdIngredient.id;
  } else {
    console.log('found ingredient', ingredientId, 'for ingredient', name);
  }

  create('cocktail_ingredients', {
    cocktail_id: cocktailId,
    ingredient_id: ingredientId,
    unit_id: unitId,
    amount: amount
      ? S.decodeSync(NullablePositiveNumber)(amount.toString())
      : null,
    order: S.decodeSync(PositiveInt)(index + 1),
  });
};

// save boilerplate: decode -> isSome -> isDifferent -> update -> onSuccess / onError
const saveName = (
  newName: string,
  lastName: string,
  cocktailId: CocktailId,
  update: ReturnType<typeof useEvolu>['update'],
  callback: () => void,
) => {
  const nameOption = S.decodeOption(NonEmptyString50)(newName);
  if (!Option.isSome(nameOption)) {
    return;
  }

  // make sure name is different
  if (nameOption.value === lastName) {
    return;
  }

  update('cocktails', { id: cocktailId, name: nameOption.value });
  callback();
};

const saveNameToNull = (
  cocktailId: CocktailId,
  update: ReturnType<typeof useEvolu>['update'],
  callback: () => void,
) => {
  update('cocktails', { id: cocktailId, name: null });
  callback();
};

const askLLMForName = async (
  urlHTMLContent: string,
): Promise<string | null> => {
  const response = await fetch('/api/ask-llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonnet',
      prompt: {
        role: 'user',
        content: `
        <recipe>
        ${urlHTMLContent}
        </recipe>

        Use the \`cocktail_name\` tool to report the name of the cocktail.
        `,
      },
      tool: {
        name: 'cocktail_name',
        description: 'Name the cocktail',
        input_schema: JSONSchema.make(dataSchema),
      },
    }),
  });

  const data = await response.json();

  console.log('data', data);

  const dataParsed = decodeClaudeToolResponse(data.toolResponse);

  if (Either.isLeft(dataParsed)) {
    console.error('dataParsed is left', dataParsed);

    return null;
  }

  const toolUseContent = getToolUseContent(dataParsed.right.content);

  if (!toolUseContent) {
    return null;
  }

  const nameParsed = S.decodeUnknownEither(dataSchema)(toolUseContent.input);

  if (Either.isLeft(nameParsed)) {
    console.error('nameParsed is left', nameParsed);

    return null;
  }

  return nameParsed.right.name;
};

const Name = ({ cocktail }: { cocktail: Cocktail }) => {
  const [uiState, setUIState] = useState<
    'idle' | 'asking llm for name' | 'error' | 'success'
  >('idle');
  const [isSaved, onSave, onChange] = useSave();
  const { update } = useEvolu();

  // if name is null, lets try to ask the llm for it
  useEffect(() => {
    if (
      cocktail.name === null &&
      cocktail.url &&
      cocktail.urlContent &&
      uiState === 'idle' // protects from multiple requests
    ) {
      setUIState('asking llm for name');
      askLLMForName(
        cocktail.urlContent.title + ' ' + cocktail.urlContent.content,
      ).then((name) => {
        const nameParsed = S.decodeUnknownEither(NonEmptyString50)(name);

        if (Either.isLeft(nameParsed)) {
          console.error('nameParsed is left', nameParsed);
          setUIState('error');
          return;
        }

        update('cocktails', { id: cocktail.id, name: nameParsed.right });
        setUIState('success');
      });
    }
  }, [cocktail]);

  // remove success state after a few seconds
  useEffect(() => {
    if (uiState === 'success') {
      setTimeout(() => {
        setUIState('idle');
      }, 2000);
    }
  }, [uiState]);

  return (
    <HStack>
      <Label htmlFor={`${cocktail.id}-name`}>Name</Label>
      <Input
        id={`${cocktail.id}-name`}
        type="text"
        placeholder="Name"
        value={cocktail.name || ''}
        onDebounceChange={(s) =>
          saveName(s, cocktail.name || '', cocktail.id, update, () => onSave())
        }
        onChange={onChange}
        css={{
          width: '100%',
        }}
      />
      {isSaved && (
        <P>
          <b>Saved</b>
        </P>
      )}
      {uiState !== 'idle' && (
        <P>
          {uiState === 'asking llm for name' && <b>Asking LLM for name...</b>}
          {uiState === 'error' && <b>Error</b>}
          {uiState === 'success' && <b>Success</b>}
        </P>
      )}
      {/* <Button
        onClick={() => saveNameToNull(cocktail.id, update, () => onSave())}
      >
        Make Name Null
      </Button> */}
    </HStack>
  );
};

const UrlContent = ({ cocktail }: { cocktail: Cocktail }) => {
  const [hide, setHide] = useState(true);

  return (
    <div>
      {cocktail.urlContent && (
        <Button onClick={() => setHide(!hide)}>
          {hide ? 'Show URL Content' : 'Hide URL Content'}
        </Button>
      )}
      {!hide && (
        <div>
          <H2>URL Content</H2>
          <div
            // @ts-expect-error: blah
            dangerouslySetInnerHTML={{ __html: cocktail.urlContent?.content }}
          />
        </div>
      )}
    </div>
  );
};

const saveUrl = (
  url: string,
  lastUrl: string | null,
  cocktailId: CocktailId,
  update: ReturnType<typeof useEvolu>['update'],
  callback: () => void,
) => {
  const urlEither = decodeUrl(url);

  if (Either.isLeft(urlEither)) {
    return;
  }

  if (urlEither.right === lastUrl) {
    return;
  }

  update('cocktails', { id: cocktailId, url: urlEither.right });
  callback();
};

const scrapeUrl = async (url: string) => {
  const response = await fetch('/api/scrape-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  console.log('data', data);

  const dataParsed = decodeReadability(data);

  if (Either.isLeft(dataParsed)) {
    console.error('dataParsed is left', dataParsed);

    return null;
  }

  return dataParsed.right;
};

const URL = ({ cocktail }: { cocktail: Cocktail }) => {
  const [uiState, setUIState] = useState<
    'idle' | 'reading url content...' | 'error' | 'success'
  >('idle');
  const [isSaved, onSave, onChange] = useSave();
  const { update } = useEvolu();

  // if url is null, lets try to ask the llm for it
  useEffect(() => {
    if (
      cocktail.url &&
      cocktail.urlContent === null &&
      uiState === 'idle' // protects from multiple requests
    ) {
      setUIState('reading url content...');
      scrapeUrl(cocktail.url)
        .then((urlContent) => {
          if (urlContent === null) {
            setUIState('error');
            return;
          }

          update('cocktails', { id: cocktail.id, urlContent });
          setUIState('success');
        })
        .catch((e) => {
          console.error('e', e);
          setUIState('error');
        });
    }
  }, [cocktail]);

  // remove success state after a few seconds
  useEffect(() => {
    if (uiState === 'success') {
      setTimeout(() => {
        setUIState('idle');
      }, 2000);
    }
  }, [uiState]);

  const setURLContentNull = () => {
    update('cocktails', { id: cocktail.id, urlContent: null });
  };

  return (
    <HStack>
      <Label htmlFor={`${cocktail.id}-url`}>URL</Label>
      <Input
        id={`${cocktail.id}-url`}
        type="text"
        placeholder="URL"
        value={cocktail?.url || ''}
        onDebounceChange={(s) =>
          saveUrl(s, cocktail.url, cocktail.id, update, () => onSave())
        }
        css={{
          width: '100%',
        }}
      />
      {isSaved && (
        <P>
          <b>Saved</b>
        </P>
      )}
      {uiState !== 'idle' && (
        <P>
          {uiState === 'reading url content...' && (
            <b>Reading url content...</b>
          )}
          {uiState === 'error' && <b>Error</b>}
          {uiState === 'success' && <b>Success</b>}
        </P>
      )}
      {/* <Button onClick={setURLContentNull}>Set URL Content to null</Button> */}
    </HStack>
  );
};

const askLLMForIngredients = async (url: string) => {
  const response = await fetch('/api/ask-llm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: makeIngredientsPrompt(url),
      tool: ingredientsTool,
      model: 'sonnet',
    }),
  });

  const data = await response.json();

  console.log('data', data);

  const dataParsed = decodeClaudeToolResponse(data.toolResponse);

  if (Either.isLeft(dataParsed)) {
    console.error('dataParsed is left', dataParsed);

    return [];
  }

  const toolUseContent = getToolUseContent(dataParsed.right.content);

  if (!toolUseContent) {
    return [];
  }

  const ingredientsParsed = S.decodeUnknownEither(CocktailIngredientLLMInput)(
    toolUseContent.input,
  );

  if (Either.isLeft(ingredientsParsed)) {
    console.error('ingredientsParsed is left', ingredientsParsed);

    return [];
  }

  return ingredientsParsed.right.ingredients;
};

const Ingredients = ({ cocktail }: { cocktail: Cocktail }) => {
  const [uiState, setUIState] = useState<
    'idle' | 'asking llm for ingredient list...' | 'error' | 'success'
  >('idle');
  const { create, update } = useEvolu();
  const { rows: units } = useQuery(unitsAll);
  const { rows: ingredientsDB } = useQuery(ingredientsAll);

  useEffect(() => {
    // just in case shit gets messed up, should never happen
    sanitizeIngredientsOrder(cocktail, update);
  }, []);

  // TODO: even with local db, it might be nice to handle arch concerns else where? maybe effect would do that nicely? but I still want to dispatch events to do it
  // when name is null, scrape url
  // FIXME: make sure this is only called once!
  useEffect(() => {
    if (
      uiState === 'idle' &&
      cocktail.url &&
      cocktail.urlContent &&
      cocktail.ingredients.length === 0
    ) {
      setUIState('asking llm for ingredient list...');
      askLLMForIngredients(cocktail.urlContent.content)
        .then((ingredients) => {
          if (ingredients.length === 0) {
            setUIState('error');
            return;
          }

          if (cocktail.ingredients.length !== 0) {
            console.log('caught runtime dbl run');
            return;
          }

          ingredients.forEach((ingredient, idx) => {
            createOrFindIngredient(
              cocktail.id,
              ingredient,
              idx,
              ingredientsDB,
              units,
              create,
            );
          });

          setUIState('success');
        })
        .catch((e) => {
          console.error('e', e);
          setUIState('error');
        });
    }
  }, [cocktail]);

  useEffect(() => {
    if (uiState === 'success') {
      setTimeout(() => {
        setUIState('idle');
      }, 2000);
    }
  }, [uiState]);

  const askLLMForIngredientsInternal = async () => {
    if (!cocktail.urlContent) {
      return;
    }

    const response = await fetch('/api/ask-llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonnet',
        prompt: makeIngredientsPrompt(cocktail.urlContent.content),
        tool: ingredientsTool,
      }),
    });

    const data = await response.json();

    console.log('data', data);

    const dataParsed = decodeClaudeToolResponse(data.toolResponse);

    if (Either.isLeft(dataParsed)) {
      console.error('dataParsed is left', dataParsed);

      return [];
    }

    const toolUseContent = getToolUseContent(dataParsed.right.content);

    if (!toolUseContent) {
      return [];
    }

    const ingredientsParsed = S.decodeUnknownEither(CocktailIngredientLLMInput)(
      toolUseContent.input,
    );

    if (Either.isLeft(ingredientsParsed)) {
      console.error('ingredientsParsed is left', ingredientsParsed);

      return [];
    }

    console.log('ingredientsParsed', ingredientsParsed);
  };

  const handleMove = (
    direction: 'up' | 'down',
    cocktailIngredientId: CocktailIngredientId,
  ) => {
    // protect against moving the first or last ingredient
    if (
      direction === 'up' &&
      cocktailIngredientId === cocktail?.ingredients[0].id
    ) {
      return;
    }

    if (
      direction === 'down' &&
      cocktailIngredientId ===
        cocktail?.ingredients[cocktail.ingredients.length - 1].id
    ) {
      return;
    }

    const currentIngredient = cocktail?.ingredients.find(
      (i) => i.id === cocktailIngredientId,
    );

    // should never happen
    if (!currentIngredient) {
      return;
    }

    const currentIngredientIndex = cocktail?.ingredients.findIndex(
      (i) => i.id === cocktailIngredientId,
    );

    // should never happen
    if (currentIngredientIndex === -1) {
      return;
    }

    const adjacentIngredientIndex =
      direction === 'up'
        ? currentIngredientIndex - 1
        : currentIngredientIndex + 1;

    const adjacentIngredient = cocktail?.ingredients[adjacentIngredientIndex];

    // should never happen
    if (!adjacentIngredient) {
      return;
    }

    // need to update the order of the current ingredient and the adjacent ingredient
    update('cocktail_ingredients', {
      id: cocktailIngredientId,
      order: S.decodeSync(PositiveInt)(
        direction === 'up'
          ? currentIngredient.order - 1
          : currentIngredient.order + 1,
      ),
    });

    // update the order of the adjacent ingredient
    update('cocktail_ingredients', {
      id: adjacentIngredient.id,
      order: S.decodeSync(PositiveInt)(
        direction === 'up'
          ? adjacentIngredient.order + 1
          : adjacentIngredient.order - 1,
      ),
    });
  };

  const addIngredient = () => {
    const order = cocktail?.ingredients.length + 1 || 1;

    create('cocktail_ingredients', {
      cocktail_id: cocktail.id,
      ingredient_id: null,
      unit_id: null,
      amount: null,
      order: S.decodeSync(PositiveInt)(order),
      isGarnish: false,
    });
  };

  return (
    <Stack>
      {uiState !== 'idle' && (
        <P>
          {uiState === 'asking llm for ingredient list...' && (
            <b>Asking LLM for ingredient list...</b>
          )}
          {uiState === 'error' && <b>Error</b>}
          {uiState === 'success' && <b>Success</b>}
        </P>
      )}
      <Button onClick={askLLMForIngredientsInternal}>
        Ask LLM for ingredient list
      </Button>
      {cocktail.ingredients.map((ingredient, idx) => (
        <Ingredient
          key={ingredient.id}
          ingredient={ingredient}
          isFirst={idx === 0}
          isLast={idx === cocktail.ingredients.length - 1}
          onMove={handleMove}
        />
      ))}
      <Button onClick={addIngredient}>Add Ingredient</Button>
    </Stack>
  );
};

const EditWithCocktail = ({ cocktail }: { cocktail: Cocktail }) => {
  return (
    <div>
      <H1>Edit</H1>
      <Stack>
        <Name cocktail={cocktail} />
        <Ingredients cocktail={cocktail} />
        <URL cocktail={cocktail} />
        <UrlContent cocktail={cocktail} />
      </Stack>
    </div>
  );
};

const Edit = ({ cocktailId }: { cocktailId: CocktailId }) => {
  const { row: cocktail } = useQuery(cocktailById(cocktailId));

  if (!cocktail) {
    return <EditNoCocktail />;
  }

  return <EditWithCocktail cocktail={cocktail} />;
};

export default withProvider(Edit);
