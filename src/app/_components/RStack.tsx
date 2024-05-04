/**
 * Stack is vertical on mobile, horizontal on desktop
 */

import { css } from '@/../styled-system/css';

export default function RStack({
  children,
  css: cssProp = {},
}: {
  children: React.ReactNode;
  css?: Parameters<typeof css>[0];
}) {
  return (
    <div
      className={css(
        {
          display: 'flex',
          flexDirection: {
            base: 'column',
            md: 'row',
          },
        },
        cssProp,
      )}
    >
      {children}
    </div>
  );
}
