# EduCore AI

AI-powered learning assistant for students. Upload a study PDF and get a plain-language explanation, key takeaways, and a comprehension quiz — grounded strictly in the uploaded document.

Built with **Next.js 15 (App Router)**, React 19, Tailwind CSS v4, and the Gemini API.

Product scope and acceptance criteria: [`docs/PRD.md`](docs/PRD.md).

## How it works

1. **PDF text extraction happens in the browser** (`pdfjs-dist`). The file never leaves the device.
   - Max file size: 10 MB
   - Only the first 20 pages are processed (with a truncation notice in the UI)
   - Scanned PDFs without a text layer are rejected with a clear message
2. The extracted text is posted to `POST /api/generate`.
3. The server calls Gemini with a strict JSON response schema and validates the payload before returning it. If the primary model is rate-limited or temporarily unavailable, it automatically falls back to a cheaper model.
4. The UI renders the explanation, key takeaways, and a 3–5 question quiz with scoring and retakes.

## Requirements

- Node.js 18.18+ (Node 22 LTS recommended)
- A Gemini API key — https://aistudio.google.com/apikey

## Local development

```bash
npm install
cp .env.example .env.local   # or create .env.local and paste your key
npm run dev
```

Open http://localhost:3000.

`.env.local`:

```bash
GEMINI_API_KEY="your_key_here"
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke:api` | POST sample text to a running dev server and print the JSON (needs a key) |
| `npm run pdf:worker` | Re-copy `pdfjs-dist` worker into `public/` |
| `npm run samples:pdf` | Regenerate the sample study guide PDF (`pdf-lib`) |

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            # html/body, metadata, self-hosted font
│  ├─ page.tsx              # server entry -> StudyWorkspace
│  ├─ globals.css           # Tailwind v4 + base styles
│  └─ api/generate/route.ts # Gemini route handler (Node runtime)
├─ components/              # Navbar, UploadSection, ExplanationSection, QuizSection, LoadingIndicator
├─ lib/
│  ├─ pdf.ts                # client-side PDF extraction
│  ├─ prompt.ts             # prompt + response schema
│  ├─ gemini.ts             # client, model fallbacks, lazy init
│  └─ validate.ts           # runtime guard for model output
├─ types/                   # shared types
└─ data/sampleNotes.ts      # curated sample PDFs
public/
├─ pdf.worker.min.mjs       # PDF.js worker (copied on install, committed on purpose)
├─ sample_biology_study_guide.pdf
└─ samples/*.pdf
docs/
└─ PRD.md                   # MVP product requirements
```

## Deploying to Vercel

1. Import the repository in Vercel (framework preset is detected automatically).
2. Add `GEMINI_API_KEY` under **Settings → Environment Variables** for Production, Preview, and Development.
3. Deploy. No extra build configuration is needed.

Notes:

- The route runs on the **Node.js runtime** because `@google/genai` needs Node APIs.
- PDFs are parsed in the browser, so the server only receives extracted text (~35k characters max) — well under Vercel's request body limit.
- `public/pdf.worker.min.mjs` is committed deliberately so static assets are complete even if install-time hooks are skipped.

## License

Apache-2.0
