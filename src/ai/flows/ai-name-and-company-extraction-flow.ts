'use server';
/**
 * @fileOverview This file implements a Genkit flow for extracting potential names and company information from text using AI.
 *
 * - aiNameAndCompanyExtraction - A function that orchestrates the extraction process.
 * - AiNameAndCompanyExtractionInput - The input type for the aiNameAndCompanyExtraction function.
 * - AiNameAndCompanyExtractionOutput - The return type for the aiNameAndCompanyExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNameAndCompanyExtractionInputSchema = z.object({
  text: z
    .string()
    .describe('The raw text from which to extract names and company information.'),
});
export type AiNameAndCompanyExtractionInput = z.infer<
  typeof AiNameAndCompanyExtractionInputSchema
>;

const AiNameAndCompanyExtractionOutputSchema = z.object({
  names: z.array(z.string()).describe('An array of potential names found in the text.'),
  companies: z
    .array(z.string())
    .describe('An array of potential company names found in the text.'),
});
export type AiNameAndCompanyExtractionOutput = z.infer<
  typeof AiNameAndCompanyExtractionOutputSchema
>;

export async function aiNameAndCompanyExtraction(
  input: AiNameAndCompanyExtractionInput
): Promise<AiNameAndCompanyExtractionOutput> {
  return aiNameAndCompanyExtractionFlow(input);
}

const aiNameAndCompanyExtractionPrompt = ai.definePrompt({
  name: 'aiNameAndCompanyExtractionPrompt',
  input: {schema: AiNameAndCompanyExtractionInputSchema},
  output: {schema: AiNameAndCompanyExtractionOutputSchema},
  prompt: `You are an expert at identifying and extracting personal names and company names from unstructured text.

Your task is to analyze the provided text and extract all distinct personal names and company names you can identify.
Do not include email addresses in the output for names or companies.

Text: """{{{text}}}"""

Extract the names and companies into a JSON object with two fields: 'names' (an array of strings for personal names) and 'companies' (an array of strings for company names).

Example Output:
{
  "names": ["John Doe", "Jane Smith"],
  "companies": ["Acme Corp", "Globex Inc"]
}`,
});

const aiNameAndCompanyExtractionFlow = ai.defineFlow(
  {
    name: 'aiNameAndCompanyExtractionFlow',
    inputSchema: AiNameAndCompanyExtractionInputSchema,
    outputSchema: AiNameAndCompanyExtractionOutputSchema,
  },
  async input => {
    const {output} = await aiNameAndCompanyExtractionPrompt(input);
    return output!;
  }
);
