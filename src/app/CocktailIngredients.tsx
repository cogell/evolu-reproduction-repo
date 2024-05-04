'use client';
import { H2 } from '@/app/_components/Typography';
import { cocktailIngredientsAll, withProvider } from './_lib/Db';
import { useQuery } from '@evolu/react';

const CocktailIngredients = () => {
  const { rows: cocktailIngredients } = useQuery(cocktailIngredientsAll);

  return (
    <div>
      <H2>Cocktail_Ingredients</H2>
      {cocktailIngredients.map((i) => (
        <div key={i.id}>{i.ingredient_id}</div>
      ))}
    </div>
  );
};

export default withProvider(CocktailIngredients);
