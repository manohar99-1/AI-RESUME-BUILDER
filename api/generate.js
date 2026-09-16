// Vercel serverless function: POST /api/generate
// Body: { mode: 'extract' | 'enhance' | 'tailor', text?, resumeData?, jobDescription? }
// Keeps OPENROUTER_API_KEY server-side. Set it in Vercel project env vars.

const SCHEMA_HINT = `{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "", "links": [""] },
  "summary": "",
  "education": [{ "school": "", "degree": "", "location": "", "start": "", "end": "", "details": "" }],
  "skills": [""],
  "projects": [{ "name": "", "description": "", "bullets": [""], "tech": "", "link": "" }],
  "experience": [{ "company": "", "role": "", "location": "", "start": "", "end": "", "bullets": [""] }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "achievements": [""]
}`;

// Free-tier-friendly models tried in order; first success wins.
// openrouter/free is a router that auto-selects from whatever free models
// are currently available, so it stays correct even as OpenRouter's free
// lineup changes. The two concrete slugs below are a backup in case that
// router itself has an off moment.
const MODEL_FALLBACK = [
  'openrouter/free',
  'qwen/qwen3-coder:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
];

function buildPrompt(mode, { text, resumeData, jobDescription }) {
  if (mode === 'extract') {
    return {
      system: `You are a precise resume data-extraction engine. Read the raw text (which may come from OCR of images, a PDF, a DOCX, or pasted text and may be messy) and pull out every real fact about the person. Return ONLY valid JSON matching exactly this shape, with no markdown fences and no commentary:\n${SCHEMA_HINT}\nRules: never invent facts not present in the source text. If a field is unknown, use "" or []. Preserve dates and numbers exactly as given. Group loose skill mentions into the skills array as individual strings.`,
      user: text,
    };
  }
  if (mode === 'enhance') {
    return {
      system: `You are a professional resume editor. Improve grammar, clarity, and impact of the bullet points and summary in the given resume JSON. Use strong action verbs and concise phrasing. Do NOT invent new achievements, numbers, or facts that are not implied by the original content. Return ONLY the same JSON shape back, fully populated, no markdown fences, no commentary.`,
      user: JSON.stringify(resumeData),
    };
  }
  if (mode === 'tailor') {
    return {
      system: `You are a resume strategist. Given a candidate's resume JSON and a target job description, reorder and reweight bullets and skills to foreground what's most relevant, and lightly rephrase for keyword alignment with the job description. Do NOT invent facts, employers, dates, or metrics that are not already present. Return ONLY the same JSON shape back, no markdown fences, no commentary.`,
      user: JSON.stringify({ resumeData, jobDescription }),
    };
  }
  throw new Error('Unknown mode');
}

function extractJson(raw) {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY. Set it in your hosting provider\'s environment variables.' });
    return;
  }

  const { mode } = req.body || {};
  if (!['extract', 'enhance', 'tailor'].includes(mode)) {
    res.status(400).json({ error: 'mode must be one of extract, enhance, tailor' });
    return;
  }

  let prompt;
  try {
    prompt = buildPrompt(mode, req.body);
  } catch (e) {
    res.status(400).json({ error: e.message });
    return;
  }

  let lastError = null;
  for (const model of MODEL_FALLBACK) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: prompt.system },
            { role: 'user', content: prompt.user },
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        lastError = `${model}: HTTP ${response.status}`;
        continue;
      }

      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content;
      if (!raw) {
        lastError = `${model}: empty response`;
        continue;
      }

      const parsed = extractJson(raw);
      res.status(200).json({ result: parsed, modelUsed: model });
      return;
    } catch (e) {
      lastError = `${model}: ${e.message}`;
    }
  }

  res.status(502).json({ error: `All models failed. Last error: ${lastError}` });
}
