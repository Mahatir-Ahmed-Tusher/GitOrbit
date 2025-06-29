'use server';

/**
 * @fileOverview An AI flow to generate a complete web application from a prompt.
 *
 * - generateProject - A function that handles the project generation process.
 * - GenerateProjectInput - The input type for the generateProject function.
 * - GenerateProjectOutput - The return type for the generateProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the web application to generate.'),
});
export type GenerateProjectInput = z.infer<typeof GenerateProjectInputSchema>;

const GenerateProjectOutputSchema = z.object({
  files: z.array(z.object({
    path: z.string().describe("The full file path, e.g., 'src/app/page.tsx'"),
    content: z.string().describe("The complete content of the file."),
  })).describe('An array of file objects representing the complete project structure.'),
});
export type GenerateProjectOutput = z.infer<typeof GenerateProjectOutputSchema>;


export async function generateProject(input: GenerateProjectInput): Promise<GenerateProjectOutput> {
  return generateProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectPrompt',
  input: {schema: GenerateProjectInputSchema},
  output: {schema: GenerateProjectOutputSchema},
  prompt: `You are an expert full-stack developer specializing in Next.js, React, and Tailwind CSS.
Your task is to generate a complete, runnable, and well-structured web application based on the user's prompt.
The output MUST be a single JSON object containing a single key "files", which is an array of file objects.
Each file object must have two string keys: "path" (e.g., 'src/app/page.tsx') and "content".

Follow these instructions carefully:
1.  **Project Structure:** Use the Next.js App Router. Create a logical folder structure (e.g., 'src/app', 'src/components/ui', 'src/lib').
2.  **Styling:** Use Tailwind CSS for all styling. Create a 'src/app/globals.css' file with base Tailwind directives and a 'tailwind.config.ts' file.
3.  **Dependencies:** Include a 'package.json' with necessary dependencies: "react", "react-dom", "next", "tailwindcss", "postcss", "autoprefixer", "typescript", "@types/react", "@types/node". Do NOT include other dependencies unless absolutely necessary.
4.  **Components:** Generate functional, client-side React components ('use client'). Create reusable components in 'src/components/'.
5.  **Placeholders:** For images, use 'https://placehold.co/WIDTHxHEIGHT.png' (e.g., 'https://placehold.co/600x400.png').
6.  **Completeness:** The generated project should be complete and runnable. It should include 'layout.tsx' and 'page.tsx' in 'src/app/'.
7.  **No Explanations:** Only output the raw JSON object. Do not include any text, explanations, or markdown code fences around the JSON.

User's prompt:
"{{{prompt}}}"
`,
});

const generateProjectFlow = ai.defineFlow(
  {
    name: 'generateProjectFlow',
    inputSchema: GenerateProjectInputSchema,
    outputSchema: GenerateProjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
