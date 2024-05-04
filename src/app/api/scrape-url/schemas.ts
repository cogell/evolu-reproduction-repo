import * as S from '@effect/schema/Schema';
import { Readability } from '@mozilla/readability';

// see
type ReadabilityParsedLibrary = ReturnType<typeof Readability.prototype.parse>;
export const ReadabilitySchema = S.Struct({
  title: S.String,
  content: S.String,
  excerpt: S.String,
  publishedTime: S.NullOr(S.String),
});

// type X = Equals<ReadabilityParsed, ReadabilityParsed>;

export type ReadabilityParsed = S.Schema.Type<typeof ReadabilitySchema>;

export const decodeReadability = S.decodeEither(ReadabilitySchema);
