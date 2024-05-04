'use client';

import Input from '@/app/_components/Input';
import { H2 } from '@/app/_components/Typography';
import Label from '@/app/_components/Label';
import { useState } from 'react';
import { HStack } from '@/../styled-system/jsx';
import { css } from '@/../styled-system/css';
import Button from '@/app/_components/Button';
import {
  decodeUrl,
  useLocalDb,
  withProvider,
  cocktailsAll,
  NormalizedUrlString,
} from './_lib/Db';
import { Either, Option } from 'effect';
import { useRouter } from 'next/navigation';
import { ExtractRow, QueryResult, useQuery } from '@evolu/react';

type Cocktail = ExtractRow<typeof cocktailsAll>;

const findCocktailByUrl = (
  url: NormalizedUrlString,
  cocktails: readonly Cocktail[],
): Cocktail | undefined => {
  return cocktails.find((c) => {
    if (!c.url) {
      return false;
    }
    const normalizedUrl = decodeUrl(c.url); // defensive
    if (Either.isLeft(normalizedUrl)) {
      return false;
    }
    return normalizedUrl.right === url;
  });
};

function CreateNewCocktailByUrl() {
  const [url, setUrl] = useState('');
  const { create } = useLocalDb();
  const router = useRouter();

  const { rows: cocktails } = useQuery(cocktailsAll);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const urlOption = decodeUrl(url);

    if (Either.isLeft(urlOption)) {
      console.error('urlOption is none');
      return;
    }

    const cocktail = findCocktailByUrl(urlOption.right, cocktails);

    if (cocktail) {
      console.log('cocktail found');
      router.push(`/cocktail/${cocktail.id}/edit`);
      return;
    }

    console.log('urlOption', urlOption.right);

    const { id: cocktailId } = create('cocktails', {
      url: urlOption.right,
    });

    router.push(`/cocktail/${cocktailId}/edit`);
  };

  return (
    <div
      className={css({
        width: '100%',
      })}
    >
      <H2>Create New Cocktail By Url</H2>
      <form onSubmit={handleSubmit}>
        <HStack w="100%">
          <Label htmlFor="url">Url</Label>
          <Input
            type="text"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
            placeholder="Paste url here"
            css={{
              width: '100%',
            }}
          />
          <Button type="submit">Create</Button>
        </HStack>
      </form>
    </div>
  );
}

export default withProvider(CreateNewCocktailByUrl);
