'use client';

import * as S from '@effect/schema/Schema';
import Button from '@/app/_components/Button';
import { NonEmptyString50, useEvolu, withProvider } from './_lib/Db';
import { useRouter } from 'next/navigation';
import { H2 } from '@/app/_components/Typography';

// create new cocktail in the database then redirect to cocktails edit page

const CreateNewCocktail = () => {
  const { create } = useEvolu();
  const router = useRouter();

  const onCreateClick = () => {
    const { id: cocktailId } = create('cocktails', {
      name: S.decodeSync(NonEmptyString50)('New Cocktail'),
    });

    router.push(`/cocktail/${cocktailId}/edit`);
    // create new cocktail in the database
    // redirect to cocktails edit page
  };

  return (
    <div>
      <H2>Create New Cocktail</H2>
      <Button onClick={onCreateClick}>Create New Cocktail</Button>
    </div>
  );
};

export default withProvider(CreateNewCocktail);
