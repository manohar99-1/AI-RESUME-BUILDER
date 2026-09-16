async function callApi(body) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data.result
}

export const EMPTY_RESUME = {
  personal: { name: '', title: '', email: '', phone: '', location: '', links: [] },
  summary: '',
  education: [],
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
  achievements: [],
}

export async function extractResumeData(rawText) {
  const result = await callApi({ mode: 'extract', text: rawText })
  // Merge onto EMPTY_RESUME so missing keys never crash the UI.
  return { ...EMPTY_RESUME, ...result }
}

export async function enhanceResumeData(resumeData) {
  const result = await callApi({ mode: 'enhance', resumeData })
  return { ...EMPTY_RESUME, ...result }
}

export async function tailorResumeData(resumeData, jobDescription) {
  const result = await callApi({ mode: 'tailor', resumeData, jobDescription })
  return { ...EMPTY_RESUME, ...result }
}
