import Link from 'next/link';
import { CocktailId } from '../../_lib/Db';
import Content from './Content';
import InlineLink from '@/app/_components/inline-link';

const Page = async ({ params }: { params: { cocktail_id: CocktailId } }) => {
  const { cocktail_id } = params;

  return (
    <div>
      {' '}
      <Content id={cocktail_id} />
      <InlineLink href={`/`}>Back Home</InlineLink>
    </div>
  );
};

export default Page;
