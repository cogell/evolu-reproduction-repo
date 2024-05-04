import * as S from '@effect/schema/Schema';
// import { ToolUseBlock } from '@anthropic-ai/sdk/src/resources/beta/tools/messages';

// should match ToolUseBlock
const ToolContentSchema = S.Struct({
  id: S.String,
  type: S.Literal('tool_use'),
  name: S.String,
  input: S.Object, // this should match the input schema of the tool
});

type ToolContentSchema = S.Schema.Type<typeof ToolContentSchema>;

const StringContentSchema = S.Struct({
  text: S.String,
  type: S.Literal('text'),
});

type StringContentSchema = S.Schema.Type<typeof StringContentSchema>;

type ContentSchema = StringContentSchema | ToolContentSchema;

export type Equals<T, S> = [T] extends [S]
  ? [S] extends [T]
    ? true
    : false
  : false;

// this should be true
// type X = Equals<ContentSchema, ToolUseBlock>;

const ClaudeToolResponseSchema = S.Struct({
  model: S.String,
  usage: S.Struct({
    input_tokens: S.Number,
    output_tokens: S.Number,
  }),
  content: S.Array(S.Union(ToolContentSchema, StringContentSchema)),
});

export const decodeClaudeToolResponse = S.decodeEither(
  ClaudeToolResponseSchema,
);

export const getToolUseContent = (
  content: readonly ContentSchema[],
): ToolContentSchema | undefined => {
  return content.find((c) => c.type === 'tool_use') as ToolContentSchema;
};
