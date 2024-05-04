import { H1 } from '@/app/_components/Typography';

import Cocktails from './Cocktails';
import Ingredients from './Ingredients';
import Units from './Units';
import { css } from '@/../styled-system/css';
import Mnemonic from './Mnemonic';
import CreateNewCocktail from './CreateNewCocktail';
import CreateNewCocktailByUrl from './CreateNewCocktailByUrl';

export default async function Page() {
  return (
    <div>
      <H1>Cocktail CRUD</H1>
      <CreateNewCocktailByUrl />
      <Mnemonic />
      <CreateNewCocktail />
      <Cocktails />
      <Ingredients />
      <Units />
    </div>
  );
}
