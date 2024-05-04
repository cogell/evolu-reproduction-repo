'use client';

import { ExtractRow, useQuery } from '@evolu/react';
import {
  NonEmptyString50,
  UnitId,
  unitById,
  useEvolu,
  withProvider,
} from '../../_lib/Db';
import { H1, P } from '@/app/_components/Typography';
import Input from '@/app/_components/Input';
import Label from '@/app/_components/Label';
import { HStack, Stack } from '@/../styled-system/jsx';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { css } from '@/../styled-system/css';
import Button from '@/app/_components/Button';
import * as S from '@effect/schema/Schema';
import { Option } from 'effect';

const NoUnit = ({ unit_id }: { unit_id: UnitId }) => (
  <div>
    <P>
      No unit with id: <pre>{unit_id}</pre> found.
    </P>
  </div>
);

const useSave = (die_off: number = 2000): [boolean, () => void] => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) {
      setTimeout(() => {
        setSaved(false);
      }, die_off);
    }
  }, [saved, die_off]);

  const onSave = () => {
    setSaved(true);
  };

  return [saved, onSave];
};

const Unit = ({ unit }: { unit: ExtractRow<ReturnType<typeof unitById>> }) => {
  const { update } = useEvolu();
  const [saved, onSave] = useSave();

  const handleSave =
    (key: 'name' | 'labelSingular' | 'labelPlural' | 'abbreviation') =>
    (value: string) => {
      // don't save if its the same
      if (value === unit[key]) {
        return;
      }
      const maybeValue = S.decodeOption(NonEmptyString50)(value);

      if (Option.isSome(maybeValue)) {
        update('units', {
          id: unit.id,
          [key]: S.decodeSync(NonEmptyString50)(value),
        });
        onSave();
      }

      // TODO: show error message to user
    };

  const handleCheckboxSave =
    (key: 'hasAmount' | 'gatherInGroup') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;
      update('units', {
        id: unit.id,
        [key]: value,
      });
      onSave();
    };

  return (
    <div>
      <H1>Unit</H1>
      <Stack>
        <HStack>
          <Label htmlFor={`${unit.id}-labelSingular`}>Label Singular</Label>
          <Input
            id={`${unit.id}-labelSingular`}
            type="text"
            placeholder="Label Singular"
            value={unit.labelSingular || ''}
            onDebounceChange={handleSave('labelSingular')}
          />
        </HStack>
        <HStack>
          <Label htmlFor={`${unit.id}-labelPlural`}>Label Plural</Label>
          <Input
            id={`${unit.id}-labelPlural`}
            type="text"
            placeholder="Label Plural"
            value={unit.labelPlural || ''}
            onDebounceChange={handleSave('labelPlural')}
          />
        </HStack>
        <HStack>
          <Label htmlFor={`${unit.id}-abbreviation`}>Abbreviation</Label>
          <Input
            id={`${unit.id}-abbreviation`}
            type="text"
            placeholder="Abbreviation"
            value={unit.abbreviation || ''}
            onDebounceChange={handleSave('abbreviation')}
          />
        </HStack>
        <HStack>
          <Label htmlFor={`${unit.id}-hasAmount`}>Has Amount</Label>
          {/* @ts-expect-error: blah */}
          <Input
            id={`${unit.id}-hasAmount`}
            type="checkbox"
            checked={unit.hasAmount === 1 ? true : false}
            onChange={handleCheckboxSave('hasAmount')}
          />
        </HStack>
        {saved && (
          <P>
            <b>Saved</b>
          </P>
        )}
      </Stack>
      <div
        className={css({
          mt: 4,
        })}
      >
        <Link href={`/`}>
          <Button>Back Home</Button>
        </Link>
      </div>
    </div>
  );
};

const Content = ({ unit_id }: { unit_id: UnitId }) => {
  const { row: unit } = useQuery(unitById(unit_id));

  if (!unit) {
    return <NoUnit unit_id={unit_id} />;
  }

  return <Unit unit={unit} />;
};

export default withProvider(Content);
