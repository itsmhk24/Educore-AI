/**
 * Copies the PDF.js worker into public/ so it can be served as a static asset.
 *
 * Why: Vite let us `import workerUrl from '...?url'`, which Next.js does not
 * support. The worker must live at a stable public URL instead.
 *
 * Runs automatically on `npm install` (postinstall) and can be re-run any time
 * with `npm run pdf:worker` (e.g. after upgrading pdfjs-dist).
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const source = 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs';
const destination = 'public/pdf.worker.min.mjs';

if (!existsSync(source)) {
  // Installation may be a partial one (e.g. production install without dev deps).
  console.warn(`[pdf-worker] skipped: ${source} not found`);
} else {
  mkdirSync('public', { recursive: true });
  copyFileSync(source, destination);
  console.log(`[pdf-worker] copied ${source} -> ${destination}`);
}
