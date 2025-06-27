
'use server'

import { config } from 'dotenv'
config()

import MistralClient from '@mistralai/mistralai'
import { z } from 'zod'
import { type RepoSearchResult } from '@/lib/types'

const RepoSearchResultSchema = z.array(
    z.object({
        name: z.string().describe("The full name of the repository, e.g., 'facebook/react'"),
        description: z.string().describe("A concise, one-sentence summary of the repository's purpose."),
        url: z.string().url().describe("The full GitHub URL of the repository."),
    })
)

const MistralResponseSchema = z.object({
    repositories: RepoSearchResultSchema,
});


export async function searchRepos(query: string): Promise<RepoSearchResult[]> {
    const mistralApiKey = process.env.MISTRAL_API_KEY
    const serpApiKey = process.env.SERPAPI_API_KEY

    if (!mistralApiKey) {
        throw new Error('MISTRAL_API_KEY is not set in environment variables.')
    }
    if (!serpApiKey) {
        throw new Error('SERPAPI_API_KEY is not set in environment variables.')
    }

    const mistralClient = new MistralClient(mistralApiKey)

    // 1. Search GitHub using SerpAPI via Google Search for better stability
    let serpApiResults;
    try {
        const searchQuery = `site:github.com ${query}`;
        const params = new URLSearchParams({
            engine: "google",
            api_key: serpApiKey,
            q: searchQuery,
            num: "10", // Fetch more results for the AI to filter
        });
        const url = `https://serpapi.com/search.json?${params.toString()}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SerpAPI request failed with status ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();

        if (data.error) {
            throw new Error(`SerpAPI returned an error: ${data.error}`);
        }

        serpApiResults = data.organic_results;

    } catch (error: any) {
        console.error("SerpAPI Error:", error);
        throw new Error(`Failed to fetch search results from GitHub. ${error.message}`);
    }
    
    if (!serpApiResults || serpApiResults.length === 0) {
        return [];
    }

    const relevantSerpData = serpApiResults
        .filter((result: any) => result.link && result.link.startsWith("https://github.com/"))
        .map((result: any) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
        }));


    // 2. Use Mistral to select and format the best results
    const prompt = `
        You are a helpful assistant for developers. Based on the following JSON data of Google search results for repositories on GitHub for the query "${query}", please select the top 5 most relevant and interesting repositories.

        For each one, provide:
        1. The repository name in 'owner/repo' format. You MUST extract this from the URL. For example, if the URL is 'https://github.com/facebook/react', the name is 'facebook/react'.
        2. A concise, one-sentence summary of its purpose based on its title and snippet.
        3. Its full GitHub URL.

        Return the result as a JSON object with a single key "repositories" that contains an array of these objects. Each object in the array should have 'name', 'description', and 'url' keys.

        Search Results Data:
        ${JSON.stringify(relevantSerpData, null, 2)}
    `;

    try {
        const chatResponse = await mistralClient.chat({
            model: 'mistral-small-latest',
            messages: [{ role: 'user', content: prompt }],
            responseFormat: { type: 'json_object' }
        });

        const content = chatResponse.choices[0].message.content;
        const parsedJson = JSON.parse(content);

        // Validate the response with Zod
        const validatedData = MistralResponseSchema.parse(parsedJson);

        return validatedData.repositories;
    } catch (error) {
        console.error("Mistral API or Zod parsing error:", error);
        throw new Error("Failed to process search results with AI.");
    }
}
