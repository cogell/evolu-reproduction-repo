import { styled } from '@/../styled-system/jsx';

const noMargin = {
  true: {
    marginTop: 0,
    marginBottom: 0,
  },
};

const H1 = styled('h1', {
  base: {
    textStyle: 'h1',
    marginTop: 'calc(1ex / 0.38)',
    marginBottom: 'calc(1ex / 0.82)',
  },
  variants: {
    noMargin,
  },
});

const H2 = styled('h2', {
  base: {
    textStyle: 'h2',
    marginTop: 'calc(1ex / 0.38)',
    marginBottom: 'calc(1ex / 0.82)',
  },
  variants: {
    noMargin,
  },
});

const H3 = styled('h3', {
  base: {
    textStyle: 'h3',
    marginTop: 'calc(1ex / 0.48)',
    marginBottom: 'calc(1ex / 0.62)',
  },
  variants: {
    noMargin,
  },
});

const H4 = styled('h4', {
  base: {
    textStyle: 'h4',
    marginTop: 'calc(1ex / 0.58)',
    marginBottom: 'calc(1ex / 0.62)',
  },
  variants: {
    noMargin,
  },
});

const H5 = styled('h5', {
  base: {
    textStyle: 'h5',
    marginTop: 'calc(1ex / 0.68)',
    marginBottom: 'calc(1ex / 0.62)',
  },
  variants: {
    noMargin,
  },
});

const P = styled('p', {
  base: {
    textStyle: 'p',
    marginTop: 'calc(1ex / 0.42)',
    marginBottom: 'calc(1ex / 0.82)',
  },
  variants: {
    noMargin,
  },
});

const Caption = styled('p', {
  base: {
    textStyle: 'caption',
  },
  variants: {
    noMargin,
  },
});

const LI = styled('li', {
  base: {
    textStyle: 'p',
  },
});

export { H1, H2, H3, H4, H5, P, Caption, LI };
