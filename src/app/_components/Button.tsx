import Link from 'next/link';
import { forwardRef } from 'react';

import { css, cva } from '@/../styled-system/css';

const buttonRecipe = cva({
  base: {
    cursor: 'pointer',
    backgroundColor: 'button.background',
    rounded: 'sm',
    borderColor: 'transparent',
    p: 2,
    color: 'text.primary',
    // transition: 'all 10s',
    _focus: {},
    _hover: {
      filter: 'brightness(97%)',
    },
    _active: {
      filter: 'brightness(90%)',
    },
    // TODO: this is not working
    // https://github.com/chakra-ui/panda/issues/792
    _disabled: {
      filter: 'saturate(50%)',
      cursor: 'not-allowed',
    },
  },
  variants: {
    visual: {
      primary: {},
      warning: {
        backgroundColor: 'button.warning.background',
        color: 'button.warning.text',
      },
      inverted: {
        border: '1px solid',
        borderColor: 'text.primary',
        backgroundColor: 'background.primary',
        color: 'text.primary',
      },
    },
    size: {
      base: {},
      sm: {
        px: 2,
        py: 0.5,
        // fontSize: '0.75rem',
      },
    },
  },
});

type VisualVariants = (typeof buttonRecipe.variantMap)['visual'][number];
type SizeVariants = (typeof buttonRecipe.variantMap)['size'][number];

const Button = forwardRef(
  (
    {
      type = 'button',
      disabled = false,
      children,
      onClick,
      visual = 'primary',
      size = 'base',
      css: cssProps,
      href,
      ...props
    }: {
      type?: 'button' | 'submit';
      disabled?: boolean;
      children: React.ReactNode;
      onClick?: () => void;
      visual?: VisualVariants;
      size?: SizeVariants;
      props?: any;
      css?: any;
      href?: string;
    },
    ref: any, // TODO: how to type this?
  ) => {
    const isLinkButton = href;

    const buttonComponent = (
      <button
        ref={ref}
        className={css(
          buttonRecipe.raw({ visual: visual, size: size }),
          cssProps,
        )}
        type={type}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );

    if (isLinkButton) {
      return <Link href={href}>{buttonComponent}</Link>;
    }

    return buttonComponent;
  },
);

Button.displayName = 'Button';

export default Button;
