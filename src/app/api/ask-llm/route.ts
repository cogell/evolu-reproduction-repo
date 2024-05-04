/**
 * extremely reusable ask llm api
 *
 * - takes a prompt
 * - takes a json schema to to define how to parse the response
 * - returns a json response
 */

import { HAIKU, literalToModel } from '@/app/api/_lib/claude-models';
import Anthropic from '@anthropic-ai/sdk';
import { Either, Option } from 'effect';
import { decodeModel, decodePrompt, decodeTool } from './schemas';
import { getLLMCost } from '../_lib/llm-cost';
import { decodeClaudeToolResponse } from '../_lib/schemas';
import { error } from 'console';

export const runtime = 'edge';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// sometimes the response will include a little preamble e.g.
//   {
//     { type: 'text',
//     { text: 'Here is the list of ingredients extracted from the recipe article:'
//  },
//  {
//    type: 'tool_use',
//    id: 'toolu_0115FxaWjmNWsLmdxgaBoUEL',
//    name: 'cocktail_ingredients',
//    input: {
//      ingredients: [
//        { name: 'London dry gin', unit: 'ounces', amount: 2 },
//        { name: 'lemon juice, freshly squeezed', unit: 'ounce', amount: 1 },
//        { name: 'simple syrup', unit: 'ounce', amount: 0.5 }
//      ]
//    }
//

export async function POST(req: Request) {
  // const { userId } = auth();

  // if (!userId) {
  //   return new Response(
  //     JSON.stringify({ message: 'You must be logged in to use this api' }),
  //     {
  //       status: 401,
  //     },
  //   );
  // }

  const { prompt, tool, model } = await req.json();

  const toolOption = decodeTool(tool, {
    onExcessProperty: 'preserve',
  });

  const promptOption = decodePrompt(prompt);

  const modelEither = decodeModel(model);

  if (Option.isNone(toolOption)) {
    // TODO: log error
    return new Response(JSON.stringify({ message: 'Invalid tool' }), {
      status: 400,
    });
  }

  if (Option.isNone(promptOption)) {
    // TODO: log error
    return new Response(JSON.stringify({ message: 'Invalid prompt' }), {
      status: 400,
    });
  }

  if (Either.isLeft(modelEither)) {
    // TODO: log error
    return new Response(
      JSON.stringify({ message: 'Invalid model', error: modelEither.left }),
      {
        status: 400,
      },
    );
  }

  const message = await anthropic.beta.tools.messages.create({
    model: literalToModel[modelEither.right],
    max_tokens: 1024,
    tools: [toolOption.value],
    messages: [promptOption.value],
  });

  console.log('message', message);

  // @ts-expect-error: blah
  const toolResponse = await decodeClaudeToolResponse(message);

  if (Either.isLeft(toolResponse)) {
    console.error('toolResponse is left', message);
    console.error(toolResponse.left);

    // TODO: log error
    return new Response(JSON.stringify({ message: toolResponse.left }), {
      status: 400,
    });
  }

  return new Response(
    JSON.stringify({
      // message,
      toolResponse: toolResponse.right,
      cost: getLLMCost(message),
    }),
  );
}
