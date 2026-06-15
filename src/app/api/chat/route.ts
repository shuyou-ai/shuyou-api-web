import { AI_MODEL } from '../../../lib/ai/model';
import { PROMPT } from '../../../lib/ai/prompts';
import { errorHandler, getMostRecentUserMessage } from '../../../lib/utils';
import { createIdGenerator, streamText } from 'ai';

export const maxDuration = 50;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', {
        status: 404,
      });
    }

    const result = streamText({
      model: AI_MODEL,
      system: PROMPT,
      messages,
      experimental_generateMessageId: createIdGenerator({
        prefix: 'msgs',
      }),
    });

    return result.toDataStreamResponse({
      getErrorMessage:
        process.env.NODE_ENV === 'development' ? errorHandler : undefined,
    });
  } catch (error) {
    console.log(error);
  }
}
