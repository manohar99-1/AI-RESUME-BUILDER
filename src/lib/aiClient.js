import { dedupeResumeData } from './dedupe'

const REQUEST_TIMEOUT_MS = 50000

async function callApi(body) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('The AI service is taking too long to respond. Please try again in a moment.')
    }
    throw new Error('Could not reach the server. Check your connection and try again.')
  } finally {
    clearTimeout(timeout)
  }
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

function normalizeResult(result) {
  return dedupeResumeData({ ...EMPTY_RESUME, ...result })
}

export async function extractResumeData(rawText) {
  const result = await callApi({ mode: 'extract', text: rawText })
  return normalizeResult(result)
}

export async function enhanceResumeData(resumeData) {
  const result = await callApi({ mode: 'enhance', resumeData })
  return normalizeResult(result)
}

export async function tailorResumeData(resumeData, jobDescription) {
  const result = await callApi({ mode: 'tailor', resumeData, jobDescription })
  return normalizeResult(result)
}
