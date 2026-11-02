import { Type } from '@google/genai';
import type { Schema } from '@google/genai';

export const SYSTEM_INSTRUCTION = `You are EduCore AI, a clear, friendly, and patient learning assistant for students.
Explain the uploaded document in simple, plain language that is easy to understand.
CRITICAL REQUIREMENT: You must base your explanation and quiz ONLY on the uploaded material. Do NOT invent facts, extrapolate unsupported claims, or bring in outside information.
For the quiz, generate between 3 and 5 multiple-choice questions. Each question must have exactly 4 choices, identify the exact correct answer text, and provide a single-sentence explanation grounded in the text. Ensure the correctAnswer exactly matches one of the options.`;

/**
 * Builds the user prompt sent to Gemini. The source text is capped so a large
 * document cannot produce an oversized request.
 */
export function buildPrompt(text: string, fileName?: string): string {
  return `Here is the student's study document text (source: ${fileName || 'Uploaded PDF'}):

${text.slice(0, 35000)}

Please generate:
1. A clear topic title.
2. A simple, plain-language explanation of this content for a student. Use ONLY the provided material and do not invent any facts.
3. 3 to 5 key takeaway bullet points.
4. 3 to 5 multiple-choice questions to test comprehension, with exactly 4 choices each, the exact correct answer, and a concise 1-line explanation based strictly on the text.`;
}

export const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Concise title for the topic (under 8 words)',
    },
    summary: {
      type: Type.STRING,
      description:
        'A simple, plain-language explanation of the uploaded content using only facts from the document. Easy for students to digest.',
    },
    keyPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 to 5 key bullet points summarizing core concepts.',
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: 'Comprehension multiple choice question',
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Array of exactly 4 choices',
          },
          correctAnswer: {
            type: Type.STRING,
            description: 'The exact string matching one of the options',
          },
          explanation: {
            type: Type.STRING,
            description: 'One-line explanation why this answer is correct',
          },
        },
        required: ['question', 'options', 'correctAnswer', 'explanation'],
      },
      description: 'Between 3 and 5 multiple choice questions',
    },
  },
  required: ['title', 'summary', 'keyPoints', 'quiz'],
};
