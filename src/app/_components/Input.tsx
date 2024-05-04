import { ForwardedRef, forwardRef, use, useEffect, useState } from 'react';

import { css } from '@/../styled-system/css';

import useDebounce from '../_hooks/use-debounce';

type DebounceTypes =
  | {
      debounceDelay: number;
      onDebounceChange: (value: string) => void;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
  | {
      debounceDelay?: undefined;
      onDebounceChange: (value: string) => void;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
  | {
      debounceDelay?: undefined;
      onDebounceChange?: undefined;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    };

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  css?: Parameters<typeof css>[0];
  value: string;
} & DebounceTypes;

const inputBaseStyles = {
  py: 1,
  px: 2,
  border: '1px solid token(colors.background.accent)',
  rounded: 'sm',
  '&:focus-visible': {
    outline: '2px solid token(colors.background.accentBright)',
  },
};

const InputWithDebounce = ({
  debounceDelay,
  onDebounceChange,
  css: cssProp,
  ...props
}: InputProps & {
  debounceDelay: number;
  onDebounceChange: (value: string) => void;
}) => {
  const [value, setValue] = useState(props.value);

  // if the value changes, we want to honor that one
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  useDebounce(
    () => {
      onDebounceChange(value);
    },
    debounceDelay,
    [value],
  );

  return (
    <input
      className={css(inputBaseStyles, cssProp)}
      {...props}
      value={value}
      onChange={(e) => {
        props.onChange?.(e);
        setValue(e.target.value);
      }}
    />
  );
};

const Input = forwardRef(
  (
    { css: cssProp = {}, onDebounceChange, ...props }: InputProps,
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    if (onDebounceChange) {
      return (
        <InputWithDebounce
          css={cssProp}
          {...props}
          // onChange={undefined}
          debounceDelay={props.debounceDelay || 1000}
          onDebounceChange={onDebounceChange}
        />
      );
    }

    return (
      <input ref={ref} className={css(inputBaseStyles, cssProp)} {...props} />
    );
  },
);

Input.displayName = 'Input';

export default Input;
