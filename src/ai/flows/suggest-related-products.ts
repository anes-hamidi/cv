'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting related products based on the current items in a sale.
 *
 * - suggestRelatedProducts - A function that takes an array of product names and returns a suggestion for a related product.
 * - SuggestRelatedProductsInput - The input type for the suggestRelatedProducts function.
 * - SuggestRelatedProductsOutput - The return type for the suggestRelatedProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedProductsInputSchema = z.object({
  currentItems: z
    .array(z.string())
    .describe('The names of the products currently in the sale.'),
  pastPurchaseData: z
    .string()
    .describe('Past purchase data for the customer, as a JSON string.'),
});
export type SuggestRelatedProductsInput = z.infer<typeof SuggestRelatedProductsInputSchema>;

const SuggestRelatedProductsOutputSchema = z.object({
  suggestion: z
    .string()
    .describe('A suggestion for a related product to add to the sale.'),
  reason: z
    .string()
    .describe('The reason why the product is a good suggestion.'),
});
export type SuggestRelatedProductsOutput = z.infer<typeof SuggestRelatedProductsOutputSchema>;

export async function suggestRelatedProducts(input: SuggestRelatedProductsInput): Promise<SuggestRelatedProductsOutput> {
  return suggestRelatedProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedProductsPrompt',
  input: {schema: SuggestRelatedProductsInputSchema},
  output: {schema: SuggestRelatedProductsOutputSchema},
  prompt: `You are a helpful sales assistant. Given the current items in the sale and the customer's past purchase data, suggest a relevant product to add to the sale.

Current items in sale:
{{#each currentItems}}- {{this}}\n{{/each}}

Past purchase data:
{{{pastPurchaseData}}}

Suggest a single product to add to the sale and briefly explain why it is a good suggestion.
`,
});

const suggestRelatedProductsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedProductsFlow',
    inputSchema: SuggestRelatedProductsInputSchema,
    outputSchema: SuggestRelatedProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
