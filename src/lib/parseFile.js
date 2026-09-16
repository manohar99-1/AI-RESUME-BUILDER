import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createWorker } from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

async function readAsArrayBuffer(file) {
  return await file.arrayBuffer()
}

async function extractFromDocx(file) {
  const arrayBuffer = await readAsArrayBuffer(file)
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

async function extractFromPdf(file) {
  const arrayBuffer = await readAsArrayBuffer(file)
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ') + '\n'
  }
  // If a PDF has almost no extractable text, it's likely a scanned image —
  // caller can decide to fall back to OCR on rendered pages if needed.
  return text
}

async function extractFromImage(file, onProgress) {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })
  const {
    data: { text },
  } = await worker.recognize(file)
  await worker.terminate()
  return text
}

async function extractFromText(file) {
  return await file.text()
}

// Returns raw extracted text for any supported input file.
export async function extractTextFromFile(file, onProgress) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.docx')) return extractFromDocx(file)
  if (name.endsWith('.pdf')) return extractFromPdf(file)
  if (name.endsWith('.txt') || name.endsWith('.md')) return extractFromText(file)
  if (file.type.startsWith('image/')) return extractFromImage(file, onProgress)
  throw new Error(
    `Unsupported file type: ${file.name}. Try .docx, .pdf, .txt, or an image (.png/.jpg).`
  )
}
