'use server';

/**
 * @fileOverview Explains a Git commit diff using the Gemini API.
 *
 * - explainCommit - A function that handles the commit explanation process.
 * - ExplainCommitInput - The input type for the explainCommit function.
 * - ExplainCommitOutput - The return type for the explainCommit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCommitInputSchema = z.string().describe('The Git commit diff to explain.');
export type ExplainCommitInput = z.infer<typeof ExplainCommitInputSchema>;

const ExplainCommitOutputSchema = z.string().describe('A concise, developer-friendly explanation of the Git commit diff.');
export type ExplainCommitOutput = z.infer<typeof ExplainCommitOutputSchema>;

export async function explainCommit(input: ExplainCommitInput): Promise<ExplainCommitOutput> {
  return explainCommitFlow(input);
}

const PromptInputObjectSchema = z.object({
  input: z.string(),
});

const prompt = ai.definePrompt({
  name: 'explainCommitPrompt',
  input: {schema: PromptInputObjectSchema},
  prompt: `You are an expert software engineer, and you are trying to explain a git diff to a teammate.
Provide a concise, high-level summary of the changes in a few sentences.
Then, provide a bulleted list of the key logic changes. Mention the file paths for each change.

Reminders about the git diff format:
For every file, there are a few metadata lines, like:
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
A line starting with \`+\` means it was added.
A line starting with \`-\` means it was deleted.
A line that starts with neither is code given for context. It is not part of the changes.

Please explain the following diff:

{{{input}}}`,
});

const explainCommitFlow = ai.defineFlow(
  {
    name: 'explainCommitFlow',
    inputSchema: ExplainCommitInputSchema,
    outputSchema: ExplainCommitOutputSchema,
  },
  async input => {
    // Limit input size to avoid large API requests
    const limitedInput = input.length > 20000 ? input.substring(0, 20000) : input;
    const response = await prompt({input: limitedInput});
    return response.text;
  }
);
