import { ForwardedRef, forwardRef } from 'react';

import { css } from '@/../styled-system/css';

const Input = forwardRef(
  (
    {
      css: cssProp = {},
      ...props
    }: React.InputHTMLAttributes<HTMLTextAreaElement> & {
      css?: Parameters<typeof css>[0];
    },
    ref: ForwardedRef<HTMLTextAreaElement>,
  ) => {
    return (
      <textarea
        ref={ref}
        className={css(
          {
            py: 1,
            px: 2,
            border: '1px solid token(colors.background.accent)',
            rounded: 'sm',

            '&:focus-visible': {
              outline: '2px solid token(colors.background.accentBright)',
            },
          },
          cssProp,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export default Input;
