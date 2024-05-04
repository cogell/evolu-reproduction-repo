import { IngredientId } from '../../_lib/Db';
import Content from './content';
import InlineLink from '@/app/_components/inline-link';
import { Divider } from '@/../styled-system/jsx';
import { css } from '@/../styled-system/css';

export default function Page({
  params: { ingredient_id },
}: {
  params: {
    ingredient_id: IngredientId;
  };
}) {
  return (
    <div>
      <Content ingredient_id={ingredient_id} />
      <Divider
        className={css({
          my: 8,
        })}
      />
      <InlineLink href={`/ingredients`}>All Ingredients</InlineLink>
    </div>
  );
}
