'use server';

/**
 * @fileOverview A flow to generate a high-level technical note for a GitHub repository.
 *
 * - generateRepoNote - A function that handles the repo note generation process.
 * - GenerateRepoNoteInput - The input type for the generateRepoNote function.
 * - GenerateRepoNoteOutput - The return type for the generateRepoNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRepoNoteInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
  context: z.string().describe('The context snippets retrieved from the repo, including code and commit history.'),
});
export type GenerateRepoNoteInput = z.infer<typeof GenerateRepoNoteInputSchema>;

const GenerateRepoNoteOutputSchema = z.string().describe('A detailed, high-level technical overview of the repository.');
export type GenerateRepoNoteOutput = z.infer<typeof GenerateRepoNoteOutputSchema>;

export async function generateRepoNote(input: GenerateRepoNoteInput): Promise<GenerateRepoNoteOutput> {
  return generateRepoNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRepoNotePrompt',
  input: {schema: GenerateRepoNoteInputSchema},
  prompt: `You are an expert senior software engineer creating a technical overview for a new team member.
Analyze the provided context, which includes recent commits and file contents from the repository at {{repoUrl}}.
Based on this context, generate a comprehensive, high-level technical summary.

Your summary should be well-structured and cover the following points in markdown format:
- **What the repo does:** A brief, high-level purpose of the project.
- **Architecture Overview:** Describe the overall architecture (e.g., monolith, microservices, client-server) and how the main parts connect.
- **Key Technologies & Dependencies:** List the main frameworks, languages, and important libraries being used.
- **Structure of Main Components:** Briefly explain the role of the most important folders and files (e.g., 'src/app' for routes, 'src/components' for UI, 'src/lib' for utilities).
- **Getting Started:** Provide a few essential steps for a new developer to get the project running locally.

Here is the context from the repository:
{{{context}}}

Generate the technical overview note:
`,
});

const generateRepoNoteFlow = ai.defineFlow(
  {
    name: 'generateRepoNoteFlow',
    inputSchema: GenerateRepoNoteInputSchema,
    outputSchema: GenerateRepoNoteOutputSchema,
  },
  async input => {
    const response = await prompt(input);
    return response.text;
  }
);
