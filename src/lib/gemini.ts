import { GoogleGenAI } from '@google/genai';
import type { Schema } from '@google/genai';

/** Model is kept identical to the previous Express implementation. */
export const GEMINI_MODEL = 'gemini-3.8-flash';

const MAX_ATTEMPTS = 3;

let client: GoogleGenAI | null = null;

/**
 * Lazily creates the Gemini client so a missing API key produces a readable
 * 500 response instead of crashing the server at module load time.
 */
function getClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to .env.local for local development or to the project environment variables on Vercel.',
    );
  }

  client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return client;
}

interface GenerateJsonOptions {
  systemInstruction: string;
  responseSchema: Schema;
}

/**
 * Calls Gemini and returns the raw JSON string. Retries up to 3 times on
 * temporary failures (503 high demand / 429 rate limit).
 */
export async function generateJson(prompt: string, options: GenerateJsonOptions): Promise<string> {
  const ai = getClient();

  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: options.responseSchema,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini API attempt ${attempt} failed:`, err?.message || err);

      if (attempt < MAX_ATTEMPTS) {
        // Wait 1.5s then 3s before retrying
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }

  throw lastError || new Error('No response generated');
}
