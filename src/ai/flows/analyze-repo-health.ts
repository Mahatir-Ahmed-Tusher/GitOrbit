'use server';

/**
 * @fileOverview An AI flow to analyze repository health metrics and generate insights.
 *
 * - analyzeRepoHealth - A function that handles the repository health analysis process.
 * - AnalyzeRepoHealthInput - The input type for the analyzeRepoHealth function.
 * - AnalyzeRepoHealthOutput - The return type for the analyzeRepoHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeRepoHealthInputSchema = z.object({
  repoUrl: z.string().describe('The URL of the GitHub repository.'),
  metrics: z.object({
    commitActivity: z.array(z.object({
      week: z.number(),
      total: z.number(),
    })).describe('Weekly commit statistics for the last 12 weeks.'),
    contributors: z.array(z.object({
      author: z.object({
        login: z.string(),
        avatar_url: z.string(),
      }),
      total: z.number(),
    })).describe('Top 10 contributors with their total commits.'),
    issues: z.object({
      open: z.number(),
      closed: z.number(),
    }).describe('Count of open and closed issues.'),
    pulls: z.object({
      open: z.number(),
      closed: z.number(),
    }).describe('Count of open and closed pull requests.'),
  }).describe('Summarized health metrics for the repository.'),
});
export type AnalyzeRepoHealthInput = z.infer<typeof AnalyzeRepoHealthInputSchema>;

const AnalyzeRepoHealthOutputSchema = z
  .string()
  .describe('A detailed analysis of the repository health in markdown format.');
export type AnalyzeRepoHealthOutput = z.infer<typeof AnalyzeRepoHealthOutputSchema>;

export async function analyzeRepoHealth(input: AnalyzeRepoHealthInput): Promise<AnalyzeRepoHealthOutput> {
  return analyzeRepoHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRepoHealthPrompt',
  input: { schema: z.object({
    repoUrl: z.string(),
    metrics: z.string(),
  }) },
  prompt: `You are an expert engineering manager analyzing the health of the repository at {{repoUrl}}. The provided JSON metrics include:
- **Commit Activity**: Weekly commit counts for the last 12 weeks.
- **Contributors**: Top 10 contributors with their total commits.
- **Issues**: Count of open and closed issues.
- **Pulls**: Count of open and closed pull requests.

Metrics:
\`\`\`json
{{metrics}}
\`\`\`

Generate a concise markdown report with:
- **Summary**: A brief assessment of the repository's health.
- **Trends**: Key positive or negative trends (e.g., commit frequency, contributor diversity, issue resolution).
- **Red Flags**: Any concerns (e.g., low activity, many open issues).
- **Recommendations**: 1-2 actionable steps to improve health.

Keep the report under 300 words.`,
});

const analyzeRepoHealthFlow = ai.defineFlow(
  {
    name: 'analyzeRepoHealthFlow',
    inputSchema: AnalyzeRepoHealthInputSchema,
    outputSchema: AnalyzeRepoHealthOutputSchema,
  },
  async input => {
    const metricsString = JSON.stringify(input.metrics);
    const estimatedTokens = Math.ceil((input.repoUrl.length + metricsString.length + 500) / 4); // +500 for prompt
    if (estimatedTokens > 1048575) {
      throw new Error(`Input exceeds token limit: ${estimatedTokens} tokens. Reduce metrics size or use a shorter time range.`);
    }
    const response = await prompt({
      repoUrl: input.repoUrl,
      metrics: metricsString,
    });
    return response.text;
  }
);