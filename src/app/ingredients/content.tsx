'use client';

import { useQuery } from '@evolu/react';
import { ingredientsAll } from '../_lib/Db';
import { withProvider } from '../_lib/Db';

const Content = () => {
  const { rows: ingredients } = useQuery(ingredientsAll);

  return (
    <div>
      {ingredients.map((i) => (
        <div key={i.id}>
          <a href={`/ingredients/${i.id}`}>
            {i.name}, {i.id}
          </a>
        </div>
      ))}
    </div>
  );
};

export default withProvider(Content);
