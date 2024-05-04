import * as S from '@effect/schema/Schema';

export const ToolSchema = S.Struct({
  name: S.String,
  description: S.String,
  input_schema:
    // TODO: tighten this to proper json schema, like `JsonSchema7Object`
    S.Struct({
      type: S.Literal('object'),
      properties: S.Object,
    }),
});

export type Tool = S.Schema.Type<typeof ToolSchema>;

export const decodeTool = S.decodeOption(ToolSchema);

export const PromptSchema = S.Struct({
  role: S.Literal('user'),
  content: S.String,
});

export type Prompt = S.Schema.Type<typeof PromptSchema>;

export const decodePrompt = S.decodeOption(PromptSchema);

export const ModelSchema = S.Union(
  S.Literal('opus'),
  S.Literal('sonnet'),
  S.Literal('haiku'),
);

export type Model = S.Schema.Type<typeof ModelSchema>;

export const decodeModel = S.decodeEither(ModelSchema);
