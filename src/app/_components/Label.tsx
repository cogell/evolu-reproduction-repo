import { ForwardedRef, forwardRef } from 'react';

import { css } from '@/../styled-system/css';

const Label = forwardRef(
  (
    {
      children,
      css: cssProp = {},
      ...props
    }: React.LabelHTMLAttributes<HTMLLabelElement> & {
      css?: Parameters<typeof css>[0];
    },
    ref: ForwardedRef<HTMLLabelElement>,
  ) => (
    <label
      ref={ref}
      className={css(
        {
          textStyle: 'p',
          fontWeight: 'bold',
          mt: 2,
          mb: 1,
          mr: 2,
        },
        cssProp,
      )}
      {...props}
    >
      {children}
    </label>
  ),
);

Label.displayName = 'Label';

export default Label;
