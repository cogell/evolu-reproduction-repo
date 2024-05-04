export const HAIKU = 'claude-3-haiku-20240307';

export const OPUS = 'claude-3-opus-20240229';

export const SONNET = 'claude-3-sonnet-20240229';

export const literalToModel: Record<'opus' | 'haiku' | 'sonnet', string> = {
  opus: OPUS,
  haiku: HAIKU,
  sonnet: SONNET,
};
