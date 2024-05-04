'use client';

import { ExtractRow, useQuery } from '@evolu/react';
import {
  UnitId,
  decodeNonEmptyString50,
  unitsAll,
  useEvolu,
  useLocalDb,
  withProvider,
} from './_lib/Db';

import React, { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { useRouter } from 'next/navigation';
import { Either } from 'effect';
import { H2, P } from './_components/Typography';
import { css } from '../../styled-system/css';
import Button from './_components/Button';

const fuseOptions = {
  keys: ['labelSingular', 'labelPlural', 'abbreviation'],
};

const Search = ({
  units,
  setFilteredUnits,
}: {
  units: readonly Unit[];
  setFilteredUnits: (units: readonly Unit[]) => void;
}) => {
  const id = useId();
  const [search, setSearch] = useState('');

  const fuse = useMemo(() => new Fuse(units, fuseOptions), [units]);

  useEffect(() => {
    if (search.length === 0) {
      setFilteredUnits(units);
      return;
    }

    setFilteredUnits(fuse.search(search).map((result) => result.item));
  }, [search]);

  return (
    <div>
      <label htmlFor={`${id}-name`}>Fuzzy Search</label>
      <input
        id={`${id}-name`}
        type="text"
        placeholder="Name"
        value={search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearch(e.target.value);
        }}
      />
    </div>
  );
};

const CreateANewUnit = () => {
  const router = useRouter();
  const { create } = useLocalDb();

  const handleCreateNewUnit = () => {
    const abbreviation = decodeNonEmptyString50('nu');
    const labelSingular = decodeNonEmptyString50('new unit');
    const labelPlural = decodeNonEmptyString50('new units');

    if (
      Either.isLeft(abbreviation) ||
      Either.isLeft(labelSingular) ||
      Either.isLeft(labelPlural)
    ) {
      console.error('abbreviation, labelSingular, or labelPlural is left');
      return;
    }

    const newUnit = create('units', {
      abbreviation: abbreviation.right,
      labelSingular: labelSingular.right,
      labelPlural: labelPlural.right,
      hasAmount: true,
      gatherInGroup: false,
    });

    console.log('newUnit', newUnit);

    router.push(`/units/${newUnit.id}`);
  };

  return (
    <div>
      <button onClick={handleCreateNewUnit}>Create New Unit</button>
    </div>
  );
};

type Unit = ExtractRow<typeof unitsAll>;

const Units = () => {
  const { rows: units } = useQuery(unitsAll);
  const { update } = useEvolu();

  const handleDelete = (id: UnitId) => {
    update('units', { id, isDeleted: true });
  };

  const [filteredUnits, setFilteredUnits] = useState<readonly Unit[]>(units);

  useEffect(() => {
    setFilteredUnits(units);
  }, [units]);

  return (
    <div>
      <H2>Units</H2>
      <Search units={units} setFilteredUnits={setFilteredUnits} />
      <CreateANewUnit />
      <div>
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            className={css({
              borderBottom: `1px solid token(colors.text.primary)`,
              py: 2,

              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <Link href={`/units/${unit.id}`}>
              <P>
                <span>
                  Singular: <b>{unit.labelSingular}</b>,{' '}
                </span>
                <span>Plural: {unit.labelPlural}, </span>
                <span>Abbreviation: {unit.abbreviation}</span>
              </P>
            </Link>

            <Button visual="warning" onClick={() => handleDelete(unit.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default withProvider(Units);
