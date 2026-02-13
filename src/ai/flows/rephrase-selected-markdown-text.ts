'use server';
/**
 * @fileOverview A Genkit flow for rephrasing selected Markdown text.
 *
 * - rephraseSelectedMarkdownText - A function that handles the rephrasing process.
 * - RephraseSelectedMarkdownTextInput - The input type for the rephraseSelectedMarkdownText function.
 * - RephraseSelectedMarkdownTextOutput - The return type for the rephraseSelectedMarkdownText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RephraseSelectedMarkdownTextInputSchema = z.object({
  text: z.string().describe('The selected Markdown text to rephrase.'),
});
export type RephraseSelectedMarkdownTextInput = z.infer<
  typeof RephraseSelectedMarkdownTextInputSchema
>;

const RephraseSelectedMarkdownTextOutputSchema = z.object({
  rephrasedText: z.string().describe('The AI-generated rephrased text.'),
});
export type RephraseSelectedMarkdownTextOutput = z.infer<
  typeof RephraseSelectedMarkdownTextOutputSchema
>;

export async function rephraseSelectedMarkdownText(
  input: RephraseSelectedMarkdownTextInput
): Promise<RephraseSelectedMarkdownTextOutput> {
  return rephraseSelectedMarkdownTextFlow(input);
}

const rephrasePrompt = ai.definePrompt({
  name: 'rephraseSelectedMarkdownTextPrompt',
  input: {schema: RephraseSelectedMarkdownTextInputSchema},
  output: {schema: RephraseSelectedMarkdownTextOutputSchema},
  prompt: `You are an AI assistant specialized in rephrasing text to improve clarity, conciseness, and style.

Rephrase the following Markdown text. Your output should only contain the rephrased text, without any additional commentary or formatting beyond the rephrased content itself.

Selected Markdown Text:
"""{{{text}}}"""

Rephrased Text:`,
});

const rephraseSelectedMarkdownTextFlow = ai.defineFlow(
  {
    name: 'rephraseSelectedMarkdownTextFlow',
    inputSchema: RephraseSelectedMarkdownTextInputSchema,
    outputSchema: RephraseSelectedMarkdownTextOutputSchema,
  },
  async (input) => {
    const {output} = await rephrasePrompt(input);
    return output!;
  }
);
