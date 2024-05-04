import Link from 'next/link';

import { css } from '@/../styled-system/css';
import { styled } from '@/../styled-system/jsx';
import type { JsxStyleProps } from '@/../styled-system/types';

const InlineLink = ({
  href,
  children,
  external = false,
  dialog = false,
  onClick,
  ...styleProps
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  dialog?: boolean;
  onClick?: () => void;
} & JsxStyleProps) => {
  const isExternal = href.startsWith('http') || external;

  if (onClick) {
    return (
      <styled.span
        onClick={onClick}
        backgroundColor="background.accent"
        rounded="sm"
        py="0.25rem"
        px="1"
        _hover={{
          filter: 'brightness(97%)',
        }}
        {...styleProps}
      >
        {children}
      </styled.span>
    );
  }

  return (
    <Link href={href} target={isExternal ? '_blank' : ''}>
      <span
        className={css({
          backgroundColor: isExternal
            ? 'background.accentAlt'
            : 'background.accent',
          rounded: 'sm',
          py: '0.01rem',
          px: '1',
          _hover: {
            filter: 'brightness(97%)',
          },
          '@media print': {
            backgroundColor: 'transparent',
            p: 0,
            _hover: {
              filter: 'none',
            },
          },
        })}

        // {...styleProps}
      >
        {children}
      </span>
    </Link>
  );
};

export default InlineLink;
