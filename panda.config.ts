import {
  defineConfig,
  defineGlobalStyles,
  defineTextStyles,
} from '@pandacss/dev';
import { blue, plum, sky, slate, tomato, yellow } from '@radix-ui/colors';

const globalCss = defineGlobalStyles({
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  ':root': {
    fontSize: 'calc(1.15rem + 0.25vw)',
    '@media print': {
      fontSize: '14px',
    },
  },
  'html, body': {
    fontFamily: 'body',
    color: 'text.primary',
    backgroundColor: 'background.primary',
    '@media print': {
      backgroundColor: '#fff',
      color: '#000',
    },
  },
  'ol, ul': {
    ml: '1rem',
  },
  li: {
    position: 'relative',
    pl: '1rem',
    _before: {
      content: '"•"',
      position: 'absolute',
      left: 0,
    },
  },
  em: {
    fontStyle: 'italic',
  },
});

const baseLineHeight = 1.3;

// https://panda-css.com/docs/theming/text-styles
const textStyles = defineTextStyles({
  h1: {
    description: 'Heading 1',
    value: {
      fontFamily: 'heading',
      fontSize: '2.5rem',
      lineHeight: `${baseLineHeight * 2}rem`,
      // '@media print': {
      //   fontSize: '2rem',
      // },
    },
  },
  h2: {
    description: 'Heading 2',
    value: {
      fontFamily: 'heading',
      fontSize: '2rem',
      lineHeight: `${baseLineHeight * 1.5}rem`,
      // '@media print': {
      //   fontSize: '1.5rem',
      // },
    },
  },
  h3: {
    description: 'Heading 3',
    value: {
      fontFamily: 'heading',
      fontSize: '1.5rem',
      lineHeight: `${baseLineHeight * 1.5}rem`,
    },
  },
  h4: {
    description: 'Heading 4',
    value: {
      fontFamily: 'heading',
      fontSize: '1.25rem',
      lineHeight: `${baseLineHeight}rem`,
    },
  },
  h5: {
    description: 'Heading 5',
    value: {
      fontFamily: 'heading',
      fontSize: '1rem',
      lineHeight: `${baseLineHeight}rem`,
    },
  },
  p: {
    description: 'Paragraph',
    value: {
      fontFamily: 'body',
      fontSize: '1rem',
      lineHeight: `${baseLineHeight}rem`,
    },
  },
  caption: {
    description: 'Caption',
    value: {
      fontFamily: 'body',
      fontSize: '0.875rem',
      lineHeight: 'calc(1ex / 0.33)',
    },
  },
});

const interactiveColor = blue.blue5;
const interactiveColorBright = blue.blue9;
const errorColor = tomato.tomato9;

const MASTER_COLUMN_WIDTH = '36rem';

const breakpoints = {
  md: MASTER_COLUMN_WIDTH,
};

// https://panda-css.com/docs/customization/theme
const themeExtended = {
  textStyles,
  breakpoints,
  tokens: {
    fonts: {
      heading: { value: 'var(--font-valkyrie), sans-serif' },
      // heading: { value: 'sans-serif' },
      body: { value: 'var(--font-valkyrie), sans-serif' },
    },
    // https://panda-css.com/docs/customization/theme#colors
    colors: {
      background: {
        primary: { value: slate.slate2 },
        accent: { value: interactiveColor },
        accentBright: { value: interactiveColorBright },
        accentAlt: { value: plum.plum5 },
        callout: { value: yellow.yellow3 },
      },
      text: {
        primary: { value: sky.sky12 },
        secondary: { value: slate.slate11 },
        code: { value: blue.blue12 },
        link: { value: blue.blue9 },
        error: { value: errorColor },
      },
      button: {
        background: { value: interactiveColor },
        warning: {
          background: { value: tomato.tomato9 },
          text: { value: tomato.tomato1 },
        },
      },
      input: {
        border: {
          default: { value: slate.slate8 },
          focus: { value: blue.blue9 },
          error: { value: errorColor },
        },
      },
      divider: {
        default: { value: blue.blue12 }, // same as text.primary
      },
    },
    // https://panda-css.com/docs/customization/theme#spacing
    spacing: {
      '0.25': { value: '0.0625rem' },
    },
  },
};

const staticCss = {
  css: [
    {
      properties: {
        backgroundColor: ['background.accentAlt'],
      },
    },
  ],
};

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  globalCss,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  jsxFramework: 'react',

  // Useful for theme customization
  theme: {
    extend: themeExtended,
  },

  staticCss,

  // The output directory for your css system
  outdir: 'styled-system',
});
