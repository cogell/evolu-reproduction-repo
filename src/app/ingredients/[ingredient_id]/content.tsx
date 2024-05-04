'use client';

import { H1, H2, P } from '@/app/_components/Typography';
import {
  IngredientId,
  cocktailsByIngredientId,
  decodeNonEmptyString50,
  ingredientById,
  useLocalDb,
  withProvider,
} from '../../_lib/Db';
import { ExtractRow, useQueries, useQuery } from '@evolu/react';
import { HStack } from '@/../styled-system/jsx';
import Label from '@/app/_components/Label';
import Input from '@/app/_components/Input';
import { Either } from 'effect';
import useSave from '../../api/_lib/use-save';
import InlineLink from '@/app/_components/inline-link';
import { Suspense } from 'react';
import Button from '@/app/_components/Button';
import { useRouter } from 'next/navigation';

type Ingredient = ExtractRow<ReturnType<typeof ingredientById>>;

const IngredientEdit = ({ ingredient }: { ingredient: Ingredient }) => {
  const router = useRouter();
  const [save, setSave, onChange] = useSave();
  const { update } = useLocalDb();

  const handleSave = (value: string) => {
    if (value === ingredient.name) {
      return;
    }

    const nameDecoded = decodeNonEmptyString50(value);

    if (Either.isLeft(nameDecoded)) {
      console.error('nameDecoded is left', nameDecoded.left);
      return;
    }

    update('ingredients', { id: ingredient.id, name: nameDecoded.right });
    setSave();
  };

  const handleDelete = () => {
    const confirm = window.confirm(
      'Are you sure you want to delete this ingredient?',
    );
    if (!confirm) {
      return;
    }
    update('ingredients', { id: ingredient.id, isDeleted: true });

    router.push('/');
  };

  return (
    <div>
      <H1>Edit Ingredient</H1>
      <HStack>
        <Label htmlFor={`${ingredient.id}-name`}>Name</Label>
        <Input
          id={`${ingredient.id}-name`}
          type="text"
          placeholder="Name"
          value={ingredient.name || ''}
          onChange={onChange}
          onDebounceChange={handleSave}
          css={{
            width: '100%',
          }}
        />
        {save && (
          <P>
            <b>Saved</b>
          </P>
        )}
      </HStack>
      <Button
        visual="warning"
        onClick={handleDelete}
        css={{
          marginTop: 4,
        }}
      >
        Delete
      </Button>
      <CocktailsWithIngredient ingredient={ingredient} />
    </div>
  );
};

const CocktailsWithIngredient = ({
  ingredient,
}: {
  ingredient: Ingredient;
}) => {
  const { rows: cocktails } = useQuery(cocktailsByIngredientId(ingredient.id));

  if (cocktails.length === 0) {
    return null;
  }

  return (
    <div>
      <P>
        Cocktails using <em>{ingredient.name}</em>
      </P>
      {cocktails.map((c) => (
        <div key={c.id}>
          <InlineLink href={`/cocktail/${c.id}`}>{c.name}</InlineLink>
        </div>
      ))}
    </div>
  );
};

const Controller = ({ ingredient_id }: { ingredient_id: IngredientId }) => {
  const { rows, row: ingredient } = useQuery(ingredientById(ingredient_id));

  console.log('ingredient', ingredient);
  console.log('rows', rows);

  if (!ingredient) {
    return <div>No ingredient with id: {ingredient_id}</div>;
  }

  return <IngredientEdit ingredient={ingredient} />;
};

export default withProvider(Controller);
