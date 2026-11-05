import { GoogleGenAI } from '@google/genai';
import type { Schema } from '@google/genai';

/**
 * Models are tried in order: the primary first, then progressively cheaper
 * fallbacks. This keeps generations working when the primary model is
 * experiencing high demand (503) or the API key has hit its per-model quota
 * (429).
 */
export const PRIMARY_MODEL = 'gemini-3.6-flash';
export const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'] as const;
export const GEMINI_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS] as const;

/** Backwards-compatible alias for the primary model. */
export const GEMINI_MODEL = PRIMARY_MODEL;

/** HTTP statuses that indicate a temporary failure worth trying the next model for. */
const TRANSIENT_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Network/runtime error codes emitted by Node's fetch stack and the Gemini SDK. */
const TRANSIENT_ERROR_CODES = new Set([
  'ABORTED',
  'DEADLINE_EXCEEDED',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  'ETIMEDOUT',
  'INTERNAL',
  'RESOURCE_EXHAUSTED',
  'UNAVAILABLE',
  'UND_ERR_ABORTED',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_CLOSED',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET',
]);

/**
 * Fallback for providers that only expose the failure inside the error
 * message (for example "503 UNAVAILABLE: high demand").
 */
const TRANSIENT_MESSAGE_PATTERN =
  /\b(?:408|425|429|5\d\d)\b|high demand|overloaded|temporarily unavailable|service unavailable|rate.?limit|quota|resource[_ ]exhausted|deadline exceeded|tim(?:e|ed) out|timeout|socket hang up|fetch failed|network error|connection reset/i;

interface GeminiErrorLike {
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
  code?: unknown;
  response?: { status?: unknown } | null;
  error?: { code?: unknown; message?: unknown; status?: unknown } | null;
  cause?: unknown;
}

function parseStatusCode(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && /^\d{3}$/.test(value.trim())) return Number(value);
  return undefined;
}

function getErrorStatus(err: GeminiErrorLike): number | undefined {
  return (
    parseStatusCode(err.status) ??
    parseStatusCode(err.statusCode) ??
    parseStatusCode(err.response?.status) ??
    parseStatusCode(err.error?.status) ??
    parseStatusCode(err.code)
  );
}

function getErrorCode(err: GeminiErrorLike): string | undefined {
  const code = err.code ?? err.error?.code;
  return typeof code === 'string' ? code.toUpperCase() : undefined;
}

/**
 * Returns true for failures where trying a different model is useful:
 * rate limits, service outages, and network/timeout failures. Client errors
 * such as invalid requests or bad credentials fail fast instead.
 */
export function isTransientGeminiError(error: unknown, depth = 0): boolean {
  if (typeof error === 'string') {
    return TRANSIENT_MESSAGE_PATTERN.test(error);
  }

  if (!error || typeof error !== 'object' || depth > 2) {
    return false;
  }

  const err = error as GeminiErrorLike;

  const status = getErrorStatus(err);
  if (status !== undefined && TRANSIENT_HTTP_STATUSES.has(status)) {
    return true;
  }

  const code = getErrorCode(err);
  if (code && TRANSIENT_ERROR_CODES.has(code)) {
    return true;
  }

  const message = [err.message, err.error?.message]
    .filter((part): part is string => typeof part === 'string')
    .join(' ');

  if (TRANSIENT_MESSAGE_PATTERN.test(message)) {
    return true;
  }

  return isTransientGeminiError(err.cause, depth + 1);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error';
}

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
 * Calls Gemini and returns the raw JSON string.
 *
 * Models are attempted in order. A transient failure (503 high demand,
 * 429 rate limit, 5xx, timeout, or network error) moves on to the next
 * fallback model; a non-transient failure (bad request, invalid API key)
 * is thrown immediately because another model would fail the same way.
 */
export async function generateJson(prompt: string, options: GenerateJsonOptions): Promise<string> {
  const ai = getClient();

  let lastError: unknown = null;

  for (let index = 0; index < GEMINI_MODELS.length; index++) {
    const model = GEMINI_MODELS[index];

    try {
      const response = await ai.models.generateContent({
        model,
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

      lastError = new Error(`Gemini model "${model}" returned an empty response.`);
      console.warn(`Gemini model "${model}" returned an empty response.`);
    } catch (err: unknown) {
      lastError = err;
      console.warn(`Gemini model "${model}" failed:`, describeError(err));

      if (!isTransientGeminiError(err)) {
        throw err;
      }
    }

    const nextModel = GEMINI_MODELS[index + 1];
    if (nextModel) {
      console.warn(`Falling back from Gemini model "${model}" to "${nextModel}".`);
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(
    `Gemini API failed for all configured models (${GEMINI_MODELS.join(', ')}).`,
  );
}
