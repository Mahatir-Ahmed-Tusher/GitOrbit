'use server';

/**
 * @fileOverview An AI flow to explain a block of code.
 *
 * - explainCode - A function that handles the code explanation process.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The source code to be explained.'),
  prompt: z.string().optional().describe('An optional question or prompt to guide the explanation.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.string().describe('A detailed explanation of the provided code snippet.');
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {schema: ExplainCodeInputSchema},
  prompt: `You are an expert software engineer AI assistant. Your task is to explain the provided code snippet clearly and concisely.

Focus on the following:
- What is the overall purpose of the code?
- How does the key logic work?
- Are there any important patterns, algorithms, or language features being used?
{{#if prompt}}
The user has a specific question: "{{prompt}}"
Please address this question in your explanation.
{{/if}}

Code to Explain:
\`\`\`
{{{code}}}
\`\`\`

Explanation:`,
});


const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async input => {
    const response = await prompt(input);
    return response.text;
  }
);
