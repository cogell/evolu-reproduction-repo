'use client';

import * as S from '@effect/schema/Schema';
import { H2, H4 } from '@/app/_components/Typography';
import {
  NonEmptyString50,
  evolu,
  withProvider,
  IngredientId,
  ingredientsAll,
  useLocalDb,
} from './_lib/Db';
import Input from '@/app/_components/Input';
import Label from '@/app/_components/Label';
import Button from '@/app/_components/Button';
import { use, useEffect, useId, useMemo, useState } from 'react';
import { ExtractRow, cast, useQuery } from '@evolu/react';
import { css } from '@/../styled-system/css';
import { HStack, Stack } from '@/../styled-system/jsx';
import Fuse from 'fuse.js';
import { useRouter } from 'next/navigation';

const CreateAnIngredient = () => {
  const id = useId();

  const [name, setName] = useState('');

  const createIngredient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    evolu.create('ingredients', { name: S.decodeSync(NonEmptyString50)(name) });
  };

  return (
    <div>
      <H4>Create an Ingredient</H4>

      <form onSubmit={createIngredient}>
        <HStack>
          <Label htmlFor={`${id}-name`}>Ingredient Name</Label>
          <Input
            id={`${id}-name`}
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
          <Button type="submit">Create</Button>
        </HStack>
      </form>
    </div>
  );
};

const Search = ({
  ingredients,
  setFilteredIngredients,
}: {
  ingredients: readonly ExtractRow<typeof ingredientsAll>[];
  setFilteredIngredients: React.Dispatch<
    React.SetStateAction<readonly ExtractRow<typeof ingredientsAll>[]>
  >;
}) => {
  const id = useId();
  const [search, setSearch] = useState('');

  const fuseIngredients = useMemo(() => {
    return new Fuse(ingredients, {
      threshold: 0.3,
      includeScore: true,
      keys: ['name'],
    });
  }, [ingredients]);

  // console.log('search', search);
  // console.log('fuseIngredients.search(search)', fuseIngredients.search(search));

  useEffect(() => {
    if (search.length === 0) {
      setFilteredIngredients(ingredients);
      return;
    }
    setFilteredIngredients(fuseIngredients.search(search).map((i) => i.item));
  }, [search]);

  return (
    <HStack>
      <Label htmlFor={`${id}-name`}>Search</Label>
      <Input
        type="text"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        placeholder="Search"
        css={{
          width: '100%',
        }}
      />
    </HStack>
  );
};

const IngredientList = () => {
  const router = useRouter();
  const { create } = useLocalDb();
  const { rows: ingredients } = useQuery(ingredientsAll);

  const onDelete = (id: IngredientId) => {
    evolu.update('ingredients', { id, isDeleted: true });
  };

  const [filteredIngredients, setFilteredIngredients] = useState(ingredients);

  useEffect(() => {
    setFilteredIngredients(ingredients);
  }, [ingredients]);

  const createNewIngredient = () => {
    const { id } = create('ingredients', {
      name: S.decodeSync(NonEmptyString50)('New Ingredient'),
    });

    router.push(`/ingredients/${id}`);
  };

  return (
    <div>
      <Stack>
        <Search
          ingredients={ingredients}
          setFilteredIngredients={setFilteredIngredients}
        />
        <Button onClick={createNewIngredient}>Create New Ingredient</Button>
      </Stack>
      {filteredIngredients.map((i) => (
        <div
          key={i.id}
          className={css({
            borderBottom: `1px solid token(colors.text.primary)`,
            py: 2,

            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <a href={`/ingredients/${i.id}`}>{i.name}</a>
          <Button visual="warning" onClick={() => onDelete(i.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

const Ingredients = () => {
  return (
    <div>
      <H2>
        <a href="/ingredients">Ingredients</a>
      </H2>
      {/* <CreateAnIngredient /> */}
      <IngredientList />
    </div>
  );
};

export default withProvider(Ingredients);
