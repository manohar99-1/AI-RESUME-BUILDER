# Resumeforge — AI Resume Builder

Paste text or upload an old resume / certificates / project notes / photos of documents.
It extracts everything with AI, lets you edit it section by section, pick a template,
optionally tailor it to a job description, and export as PDF or DOCX. Two versions are
saved locally in your browser so you can keep multiple tailored copies.

## How it works
- File parsing (DOCX, PDF, images, text) happens **entirely in your browser** — no file
  ever leaves your device except the extracted plain text, which goes to the AI step.
- AI extraction/enhancement/tailoring calls a small serverless function (`api/generate.js`)
  which talks to OpenRouter. Your OpenRouter key stays server-side — never in the browser.
- PDF export uses the browser's own print-to-PDF. DOCX export is generated client-side.

## Deploy this with no terminal, from your phone

**1. Get a free OpenRouter API key**
Go to openrouter.ai, sign up, and grab a key from the Keys page. Free-tier models are
used by default (with automatic fallback between three of them), so this costs nothing
under normal use.

**2. Put this project on GitHub**
- On github.com, tap **+ → New repository**, name it (e.g. `resume-builder`), create it.
- Open the repo, tap **Add file → Upload files**, and upload every file/folder from this
  project (keep the folder structure — `api/`, `src/`, `public/`, and the root files).
  GitHub's web uploader supports dragging in a whole folder on most mobile browsers; if
  yours doesn't, upload the top-level files first, then open into each folder and upload
  its contents the same way.
- Commit directly to `main`.

**3. Deploy on Vercel (free)**
- Go to vercel.com, sign in with your GitHub account.
- Tap **Add New → Project**, pick the `resume-builder` repo, tap **Import**.
- Before deploying, open **Environment Variables** and add:
  - Name: `OPENROUTER_API_KEY`
  - Value: the key from step 1
- Tap **Deploy**. Vercel builds the Vite frontend and wires up `api/generate.js` as a
  serverless function automatically — no config needed.
- You'll get a live `https://your-project.vercel.app` URL. Open it on your phone.

**4. Updating later**
Any time you want to change something, edit the file on github.com (pencil icon on any
file → edit → commit), or upload a replacement file the same way as step 2. Vercel
redeploys automatically on every commit to `main`.

## Project layout
```
api/generate.js         serverless AI endpoint (extract / enhance / tailor)
src/App.jsx             main app: upload, edit form, preview, export
src/lib/parseFile.js     client-side DOCX/PDF/image(OCR) text extraction
src/lib/aiClient.js      calls api/generate.js
src/lib/docxExport.js    builds a downloadable .docx
src/templates/           Modern and Classic resume layouts
```

## Adding more templates
Duplicate `src/templates/ClassicTemplate.jsx`, restyle it, then register it in the
`TEMPLATES` object near the top of `src/App.jsx`.

## Notes
- Free OpenRouter models can occasionally be slow or rate-limited at peak times; the
  endpoint automatically retries with two fallback models before giving up.
- Everything typed into the editor lives only in your browser's memory and localStorage
  (for saved versions) — there's no database, so clearing browser data clears saved
  versions too.
