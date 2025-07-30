import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { userWithToken } from '@/app/actions/auth';
import { pineconeService } from '@/lib/pinecone';

export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages } = await req.json();
	const session = await userWithToken();

	const result = streamText({
		model: openai('gpt-4o'),
		system: `You are a helpful assistant. Check your knowledge base before answering any questions.`,
		messages,
		tools: {
			ragExternalData: tool({
				description: `get information from your knowledge base to answer questions.`,
				parameters: z.object({
					question: z.string().describe('the users question'),
				}),
				execute: async ({ question }) => pineconeService.retrieveContext({ query: question, namespaceName: session.user?.email!, token: session.paragonUserToken ?? "" }),
			}),
		},
	});

	return result.toDataStreamResponse();
}
