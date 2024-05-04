/**
 * url-to-cocktail flow:
 *
 * - user copies url
 * - user navigates to cocktail app
 * - user pastes url into input and clicks "create"
 * - app fires POST request to /api/url-to-cocktail
 * -
 *
 * Web API `fetch`: url -> html-string (do I need this if Im using `cheerio`?)
 * cheerio/jsdom: html-string -> `document`
 * readability: `document` -> metadata and content as html-string or text (this step reduces the size of the html-string we pass to the llm)
 * haiku: html-string -> cocktail json
 * ...more steps around checking if the ingredients list has new items, etc...
 *
 * scratch:
 * - running 10x haiku requests PER cocktail will cost 5/10ths of a cent
 */

import { HAIKU } from '../_lib/claude-models';
import { getLLMCost } from '../_lib/llm-cost';

/**
 * MATCHING UNITS
 *
 * - assume no NEW units are discovered
 *
 * API SIDE: --> maybe we can just use fuzzy matching....
 * - give llm a list of of all units
 * - give llm the ingredient to match
 * - ask llm to find the unit that matches the ingredient and return that unit's id
 * CLIENT SIDE:
 * - check that unit id exists
 * - if not, choose null
 */

/**
 * MATCHING INGREDIENTS
 *
 * - this one is a little more complicated
 * - we have to assume there are going to be a lot of new ingredients
 * - try for trimmed, lower case exact match first
 * - if not found, show user top 3 fuzzy matches -> as them to approve new ingredient or choose from existing
 * - if zero fuzzy matches, create new ingredient for them
 *
 */

const jsdom = require('jsdom');
const { Readability } = require('@mozilla/readability');
const Anthropic = require('@anthropic-ai/sdk');
// const { CocktailIngredientInputSchema } = require('../../_lib/Db');

const JSONSchema = require('@effect/schema/JSONSchema');
const S = require('@effect/schema/Schema');
const { auth } = require('@clerk/nextjs/server');

const ingredientSchema = JSONSchema.make(
  S.Struct({
    ingredients: S.Array(
      S.Struct({
        name: S.String,
        amount: S.Number,
        unit: S.String,
      }),
    ),
  }),
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const OPUS = 'claude-3-opus-20240229';

export async function POST(req: Request) {
  auth().protect();

  const { url } = await req.json();

  const response = await fetch(url);
  const html = await response.text();
  const document = new jsdom.JSDOM(html).window.document;

  const readability = new Readability(document);
  const article = await readability.parse();

  const title = article.title;
  // const description = article.excerpt;
  const content = article.content;

  // console.log('ingredientSchema', ingredientSchema);

  const message = await anthropic.beta.tools.messages.create({
    model: HAIKU,
    max_tokens: 1024,
    tools: [
      {
        name: 'list_ingredients',
        description:
          'List the ingredients in the cocktail recipe into well-structured JSON.',
        input_schema: ingredientSchema,
      },
    ],
    messages: [
      {
        role: 'user',
        content: `<recipe>\n${content}\n</recipe>\n\n Use the \`list_ingredients\` tool to list the ingredients in the cocktail recipe.`,
      },
    ],
  });

  console.log('message', message);

  const ingredients = message.content[0].input.ingredients;

  return new Response(
    JSON.stringify({
      name: title,
      ingredients,
      cost: getLLMCost(message),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
