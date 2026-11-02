/**
 * Quick end-to-end check for the Gemini route.
 *
 * Usage:
 *   1. Add GEMINI_API_KEY to .env.local
 *   2. npm run dev            (in another terminal)
 *   3. npm run smoke:api
 *
 * Override the target with SMOKE_URL=http://localhost:3000/api/generate
 */
const endpoint = process.env.SMOKE_URL || 'http://localhost:3000/api/generate';

const payload = {
  fileName: 'smoke-test.txt',
  text: `Photosynthesis is the process used by green plants to convert light energy into chemical energy.
Chlorophyll in the chloroplasts absorbs sunlight, carbon dioxide enters through the stomata, and water is
drawn up by the roots. The plant produces glucose for growth and releases oxygen as a by-product.`,
};

const startedAt = Date.now();

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
const body = await response.json().catch(() => null);

console.log(`\n${response.status} ${response.statusText} (${elapsed}s)\n`);
console.log(JSON.stringify(body, null, 2));

if (body?.data?.quiz) {
  console.log(`\n✓ ${body.data.quiz.length} questions | ${body.data.keyPoints.length} key points`);
}

process.exit(response.ok ? 0 : 1);
