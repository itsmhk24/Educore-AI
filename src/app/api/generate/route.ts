import { NextResponse } from 'next/server';
import { buildPrompt, RESPONSE_SCHEMA, SYSTEM_INSTRUCTION } from '@/lib/prompt';
import { generateJson } from '@/lib/gemini';
import { validateStudyPack } from '@/lib/validate';

// @google/genai relies on Node APIs, so this route must not run on Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { text, fileName } = (body ?? {}) as { text?: unknown; fileName?: unknown };

  if (typeof text !== 'string' || text.trim().length < 20) {
    return NextResponse.json({ error: "We couldn't read this file." }, { status: 400 });
  }

  try {
    const prompt = buildPrompt(text, typeof fileName === 'string' ? fileName : undefined);

    const rawOutput = await generateJson(prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseSchema: RESPONSE_SCHEMA,
    });

    const data = validateStudyPack(JSON.parse(rawOutput));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Gemini API Error in /api/generate:', err);

    return NextResponse.json(
      {
        error: 'Something went wrong. Please try again.',
        details: err?.message || 'Server error',
      },
      { status: 500 },
    );
  }
}
