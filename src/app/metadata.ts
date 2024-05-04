import { Metadata } from 'next';

export const title = '🍹 Cocktails';
export const description = 'Create, edit, and share your favorite cocktails';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
  },
};
