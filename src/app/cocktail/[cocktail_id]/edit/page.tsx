import Button from '@/app/_components/Button';
import { CocktailId } from '../../../_lib/Db';
import Edit from './Edit';
import Link from 'next/link';
import { Stack } from '@/../styled-system/jsx';

const Page = ({
  params: { cocktail_id },
}: {
  params: {
    cocktail_id: CocktailId;
  };
}) => {
  return (
    <div>
      <Stack>
        <Edit cocktailId={cocktail_id} />
        <Link href={`/cocktail/${cocktail_id}`}>
          <Button>Back</Button>
        </Link>
      </Stack>
    </div>
  );
};

export default Page;
