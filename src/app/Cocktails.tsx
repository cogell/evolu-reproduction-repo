'use client';

import { Suspense, use, useEffect, useState } from 'react';
import Button from '@/app/_components/Button';
import { css } from '@/../styled-system/css';
import Input from '@/app/_components/Input';
import Label from '@/app/_components/Label';
import { HStack } from '@/../styled-system/jsx';
import Link from 'next/link';
import {
  evolu,
  useEvolu,
  NonEmptyString50,
  CocktailId,
  cocktailsAll,
} from './_lib/Db';
import { EvoluProvider, ExtractRow, cast, useQuery } from '@evolu/react';
import * as S from '@effect/schema/Schema';
import { H2 } from '@/app/_components/Typography';
import Fuse from 'fuse.js';

// to create some initial data
// const createFixtures = async (): Promise<void> => {
//   const [cocktails] = await Promise.all([
//     evolu.loadQueries([
//       evolu.createQuery((db) => db.selectFrom('cocktails').selectAll()),
//     ]),
//   ]);

//   const [cocktailsAwaited] = await Promise.all(cocktails);

//   // const cocktailsResolved = await cocktails.rows;

//   // if data exists, dont create it
//   if (cocktailsAwaited.row) {
//     console.log('data exists, skipping fixture creation');
//     return;
//   }

//   evolu.create('cocktails', {
//     name: S.decodeSync(NonEmptyString50)('Old Fashioned'),
//   });
// };

// const isRestoringOwner = (): boolean => {
//   if (!canUseDom) return false;

//   const key = 'evolu:isRestoringOwner';
//   if (isRestoringOwner != null) {
//     localStorage.setItem(key, JSON.stringify(isRestoringOwner));
//   }

//   return localStorage.getItem(key) === 'true';
// };

// if (!isRestoringOwner()) {
//   console.log('isRestoringOwner false');
//   createFixtures();
// }

const CreateACocktail = () => {
  const [name, setName] = useState('');
  const { create } = useEvolu();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    create('cocktails', { name: S.decodeSync(NonEmptyString50)(name) });
  };

  return (
    <form onSubmit={onSubmit}>
      <HStack>
        <Label>
          <span>Cocktail Name</span>
        </Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <Button type="submit">Create</Button>
      </HStack>
    </form>
  );
};

const Search = ({
  cocktails,
  setFilteredCocktails,
}: {
  cocktails: readonly Cocktail[];
  setFilteredCocktails: React.Dispatch<
    React.SetStateAction<readonly Cocktail[]>
  >;
}) => {
  const [search, setSearch] = useState('');

  const fuseCocktails = new Fuse(cocktails, {
    threshold: 0.3,
    includeScore: true,
    keys: ['name'],
  });

  // console.log('search', search);
  // console.log('fuseCocktails.search(search)', fuseCocktails.search(search));

  useEffect(() => {
    if (search.length === 0) {
      setFilteredCocktails(cocktails);
      return;
    }
    setFilteredCocktails(
      fuseCocktails.search(search).map((result) => result.item),
    );
  }, [search]);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredCocktails(cocktails);
      return;
    }
  }, [cocktails]);

  return (
    <HStack>
      <Label htmlFor="name">Fuzzy Search</Label>
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        css={{
          width: '100%',
        }}
      />
    </HStack>
  );
};

type Cocktail = ExtractRow<typeof cocktailsAll>;

const Cocktails = () => {
  const { rows: cocktails } = useQuery(cocktailsAll);
  const { update } = useEvolu();
  const [filteredCocktails, setFilteredCocktails] =
    useState<readonly Cocktail[]>(cocktails);

  const onDelete = (id: CocktailId) => {
    update('cocktails', { id, isDeleted: true });
  };

  return (
    <div>
      <Search
        cocktails={cocktails}
        setFilteredCocktails={setFilteredCocktails}
      />
      {filteredCocktails.map((cocktail) => (
        <div
          key={cocktail.id}
          className={css({
            borderBottom: `1px solid token(colors.text.primary)`,
            py: 2,

            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <Link href={`/cocktail/${cocktail.id}`}>
            <p>{cocktail.name}</p>
          </Link>
          <Button visual="warning" onClick={() => onDelete(cocktail.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

// - [ ] why is evolu so slow to load local data?
// - [ ] why is suspense not working?

const EvoluCocktails = () => {
  return (
    <EvoluProvider value={evolu}>
      <div>
        <H2>Cocktails</H2>
        <Suspense fallback={<div>Loading...</div>}>
          <Cocktails />
        </Suspense>
      </div>
    </EvoluProvider>
  );
};

export default EvoluCocktails;
