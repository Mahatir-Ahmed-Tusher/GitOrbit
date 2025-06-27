'use server';

/**
 * @fileOverview A flow to chat with a GitHub repository using AI.
 *
 * - chatWithRepo - A function that handles the chat with repo process.
 * - ChatWithRepoInput - The input type for the chatWithRepo function.
 * - ChatWithRepoOutput - The return type for the chatWithRepo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithRepoInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
  question: z.string().describe('The question to ask about the repository.'),
  context: z.string().describe('The context snippets retrieved from the repo.'),
});
export type ChatWithRepoInput = z.infer<typeof ChatWithRepoInputSchema>;

const ChatWithRepoOutputSchema = z.object({
  answer: z.string().describe('The answer to the question, based on the context.'),
});
export type ChatWithRepoOutput = z.infer<typeof ChatWithRepoOutputSchema>;

export async function chatWithRepo(input: ChatWithRepoInput): Promise<ChatWithRepoOutput> {
  return chatWithRepoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithRepoPrompt',
  input: {schema: ChatWithRepoInputSchema},
  output: {schema: ChatWithRepoOutputSchema},
  prompt: `You are an expert software engineer AI assistant. Your task is to answer questions about a GitHub repository.
You will be given context that includes recent commit history and the code from various files within the repository.
The context is structured with commit messages first, followed by file contents. Each file's content is preceded by a \`// FILE: <path>\` comment.

Analyze the provided information to answer the user's question accurately.
If the question is about recent changes, refer to the commit history.
If the question requires understanding the code, refer to the file contents.
Provide code snippets in your answer when relevant, and mention the file path.

Context from the repository:
{{{context}}}

User's Question:
{{{question}}}

Answer:`,
});

const chatWithRepoFlow = ai.defineFlow(
  {
    name: 'chatWithRepoFlow',
    inputSchema: ChatWithRepoInputSchema,
    outputSchema: ChatWithRepoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
