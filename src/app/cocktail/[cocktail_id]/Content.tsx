'use client';
import { EvoluProvider, ExtractRow, NotNull, useQuery } from '@evolu/react';
import {
  CocktailId,
  cocktailById,
  cocktailByIdJoined,
  evolu,
  withProvider,
} from '../../_lib/Db';
import { H1, P } from '@/app/_components/Typography';
import { css } from '@/../styled-system/css';
import Button from '@/app/_components/Button';
import { useRouter } from 'next/navigation';
import InlineLink from '@/app/_components/inline-link';
import { Divider } from '@/../styled-system/jsx';
import { useState } from 'react';

// const Ingredients = ({ ingredients }: { ingredients: string[] }) => {
//   return (
//     <div>
//       {ingredients.map((ingredient) => (
//         <div key={ingredient}>{ingredient}</div>
//       ))}
//     </div>
//   );
// };

/**
 *
 * How best to fetch?
 *
 * Right now we are using the supabase client to fetch the data.
 *
 * - [ ] Does the client manage the cache like other common query libraries?
 *
 * Common query libraries:
 * - react-query
 * - swr
 * - urql
 * - rtk-query
 * 
 * - [ ] How would xstate handle this?
 
 */

type Cocktail = ExtractRow<ReturnType<typeof cocktailByIdJoined>>;
type CocktailWithIngredients = Cocktail['ingredients'];

const Ingredients = ({
  ingredients,
}: {
  ingredients: CocktailWithIngredients;
}) => {
  return (
    <div>
      <P>
        <b>Ingredients</b>
      </P>
      {ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className={css({
            display: 'flex',
            flexDirection: 'row',
            // alignItems: 'center',
            gap: 1,
          })}
        >
          {ingredient.unit?.hasAmount && (
            <span
              className={css({
                fontWeight: 'bold',
              })}
            >
              {ingredient.amount}
            </span>
          )}
          {ingredient.unit?.abbreviation !== 'unitless' && (
            <span>{ingredient.unit?.abbreviation}</span>
          )}
          <InlineLink href={`/ingredients/${ingredient.id}`}>
            {ingredient.ingredient?.name}
          </InlineLink>
        </div>
      ))}
    </div>
  );
};

const URLContent = ({ urlContent }: { urlContent: Cocktail['urlContent'] }) => {
  const [showContent, setShowContent] = useState(false);

  if (!urlContent) {
    return null;
  }

  return (
    <div>
      <Button onClick={() => setShowContent(!showContent)}>
        {showContent ? 'Hide Content' : 'Show Content'}
      </Button>
      {showContent && (
        <div dangerouslySetInnerHTML={{ __html: urlContent.content }} />
      )}
    </div>
  );
};

const Content = ({ cocktail }: { cocktail: Cocktail }) => {
  const router = useRouter();

  const onEditClick = () => {
    // navigate to edit page
    router.push(`/cocktail/${cocktail.id}/edit`);
  };

  return (
    <div>
      <H1>{cocktail.name}</H1>
      <Button
        onClick={onEditClick}
        size="sm"
        css={{
          mb: 2,
        }}
      >
        Edit
      </Button>
      <Ingredients ingredients={cocktail.ingredients} />
      {cocktail.url && (
        <P>
          URL:{' '}
          <InlineLink href={cocktail.url} external>
            {cocktail.url}
          </InlineLink>
        </P>
      )}
    </div>
  );
};

const NoCocktail = () => {
  return (
    <div>
      <H1>No Cocktail Found</H1>
    </div>
  );
};

const Controller = ({ id }: { id: CocktailId }) => {
  const { row: cocktail } = useQuery(cocktailByIdJoined(id));

  if (!cocktail) {
    return <NoCocktail />;
  }

  return (
    <>
      <Content cocktail={cocktail} />
      <URLContent urlContent={cocktail.urlContent} />
      <Divider
        className={css({
          my: 8,
        })}
      />
    </>
  );
};

export default withProvider(Controller);
