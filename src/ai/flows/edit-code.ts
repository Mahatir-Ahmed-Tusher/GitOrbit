
'use server';

/**
 * @fileOverview An AI flow to edit a block of code based on a natural language prompt.
 *
 * - editCode - A function that handles the code editing process.
 * - EditCodeInput - The input type for the editCode function.
 * - EditCodeOutput - The return type for the editCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditCodeInputSchema = z.object({
  code: z.string().describe('The source code to be edited.'),
  prompt: z.string().describe('The natural language instruction for how to edit the code.'),
});
export type EditCodeInput = z.infer<typeof EditCodeInputSchema>;

const EditCodeOutputSchema = z.object({
    editedCode: z.string().describe('The complete, modified code block.'),
});
export type EditCodeOutput = z.infer<typeof EditCodeOutputSchema>;


export async function editCode(input: EditCodeInput): Promise<EditCodeOutput> {
  return editCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editCodePrompt',
  input: {schema: EditCodeInputSchema},
  output: {schema: EditCodeOutputSchema},
  prompt: `You are an expert software engineer AI assistant.
Your task is to modify the provided code based on the user's instructions.
Analyze the user's request and the code, and then return the complete, modified code.

IMPORTANT: Only output the raw, updated code. Do not include any explanations, comments, or markdown code fences (like \`\`\`) around your response.

User's Request:
"{{{prompt}}}"

Original Code:
\`\`\`
{{{code}}}
\`\`\`

Modified Code:`,
});

const editCodeFlow = ai.defineFlow(
  {
    name: 'editCodeFlow',
    inputSchema: EditCodeInputSchema,
    outputSchema: EditCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
