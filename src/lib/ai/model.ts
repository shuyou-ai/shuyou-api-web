import { openai } from '@ai-sdk/openai';

export const AI_MODEL = openai('gpt-4o-mini', {
  structuredOutputs: true,
});
