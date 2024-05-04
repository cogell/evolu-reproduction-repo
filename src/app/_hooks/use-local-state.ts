import { useEffect, useState } from 'react';

import * as S from '@effect/schema/Schema';
import { Option } from 'effect';

const isCallable = (fn: unknown): fn is CallableFunction =>
  typeof fn === 'function';

const handleDefault = <T extends unknown>(
  defaultValue: ((s: T | undefined) => T) | T,
  value: T | undefined,
): T => {
  if (isCallable(defaultValue)) {
    // console.log('we think its callable');
    return defaultValue(value);
  }

  return value || defaultValue;
};

const MapSchema = S.Struct({
  dataType: S.Literal('Map'),
  value: S.Array(S.Tuple(S.String, S.Any)),
});
type MapSchema = S.Schema.Type<typeof MapSchema>;

const replacer = (key: string, value: unknown) => {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    } as MapSchema;
  }

  return value;
};

const reviver = (key: string, value: unknown) => {
  const optionalMap = S.decodeUnknownOption(MapSchema)(value);
  if (Option.isSome(optionalMap)) {
    return new Map(optionalMap.value.value);
  }

  return value;
};

function useLocalState<T extends unknown>(
  key: string,
  defaultValue: ((s: T | undefined) => T) | T,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return handleDefault(defaultValue, undefined);
    }

    const savedValue = localStorage.getItem(key);

    if (savedValue === null || savedValue === 'undefined') {
      return handleDefault(defaultValue, undefined);
    }

    return handleDefault(defaultValue, JSON.parse(savedValue, reviver));
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value, replacer));
  }, [value, key]);

  return [value, setValue] as [T, typeof setValue];
}

export default useLocalState;
