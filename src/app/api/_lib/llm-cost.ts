import { HAIKU, SONNET, OPUS } from './claude-models';

const costPerMillionInputTokens = 0.25;
const costPerMillionOutputTokens = 1.25;

const costPerModel: Record<string, { input: number; output: number }> = {
  [HAIKU]: {
    input: costPerMillionInputTokens,
    output: costPerMillionOutputTokens,
  },
  [SONNET]: {
    input: 3,
    output: 15,
  },
  [OPUS]: {
    input: 15,
    output: 75,
  },
};

export const getLLMCost = (response: {
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
}): number => {
  if (!costPerModel[response.model]) {
    // TODO: log error?
    return -1;
  }

  const {
    input: inputCostPerMillionInputTokens,
    output: outputCostPerMillionOutputTokens,
  } = costPerModel[response.model];

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const inputCost = (inputTokens / 1000000) * inputCostPerMillionInputTokens;
  const outputCost =
    (outputTokens / 1000000) * outputCostPerMillionOutputTokens;
  return inputCost + outputCost;
};
