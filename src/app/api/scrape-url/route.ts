/**
 * takes a url and returns
 *
 *
 * CONCERNS:
 * - will this make the whole url-2-cocktail process slow?
 * - will this cost more to run a few different api calls?
 */

import { auth } from '@clerk/nextjs/server';
import { Readability } from '@mozilla/readability';
import jsdom from 'jsdom';
import { decode } from 'punycode';
import { decodeReadability } from './schemas';
import { Either } from 'effect';

// export const runtime = 'edge'; // jsdom is not supported in edge, dunno about Readability

export async function POST(req: Request) {
  const { userId } = auth();

  if (!userId) {
    return new Response(
      JSON.stringify({ message: 'You must be logged in to use this api' }),
      {
        status: 401,
      },
    );
  }

  const { url } = await req.json();

  const response = await fetch(url);
  const html = await response.text();
  const document = new jsdom.JSDOM(html).window.document;

  const readability = new Readability(document);
  const article = await readability.parse();

  if (!article) {
    return new Response(
      JSON.stringify({ message: 'Readability.parse returned null' }),
      {
        status: 404,
      },
    );
  }

  const articleParsed = decodeReadability(article);

  if (Either.isLeft(articleParsed)) {
    return new Response(JSON.stringify(articleParsed.left), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(articleParsed.right));
}
