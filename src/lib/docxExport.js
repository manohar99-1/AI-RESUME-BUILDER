import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'

const HAIRLINE = {
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '1C1B19', space: 4 },
}

function sectionHeading(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: HAIRLINE,
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 24, color: '1C1B19' })],
  })
}

function bulletList(items) {
  return (items || [])
    .filter(Boolean)
    .map(
      (text) =>
        new Paragraph({
          text,
          bullet: { level: 0 },
          spacing: { after: 40 },
        })
    )
}

function dateRange(start, end) {
  const parts = [start, end].filter(Boolean)
  return parts.length ? parts.join(' — ') : ''
}

export async function exportResumeToDocx(resumeData, fileName = 'resume.docx') {
  const p = resumeData.personal || {}

  const children = []

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: p.name || 'Your Name', bold: true, size: 52 })],
    })
  )
  if (p.title) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: p.title, size: 24, color: '4B4A46' })],
      })
    )
  }
  const contactLine = [p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean).join('   |   ')
  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [new TextRun({ text: contactLine, size: 20, color: '4B4A46' })],
      })
    )
  }

  if (resumeData.summary) {
    children.push(sectionHeading('Summary'))
    children.push(new Paragraph({ text: resumeData.summary, spacing: { after: 80 } }))
  }

  if (resumeData.experience?.length) {
    children.push(sectionHeading('Experience'))
    resumeData.experience.forEach((job) => {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: job.role || '', bold: true }),
            new TextRun({ text: job.company ? `  —  ${job.company}` : '' }),
          ],
        })
      )
      const meta = [job.location, dateRange(job.start, job.end)].filter(Boolean).join('   ')
      if (meta) {
        children.push(new Paragraph({ children: [new TextRun({ text: meta, italics: true, size: 20, color: '4B4A46' })] }))
      }
      children.push(...bulletList(job.bullets))
    })
  }

  if (resumeData.projects?.length) {
    children.push(sectionHeading('Projects'))
    resumeData.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: proj.name || '', bold: true }),
            new TextRun({ text: proj.tech ? `  —  ${proj.tech}` : '' }),
          ],
        })
      )
      if (proj.description) children.push(new Paragraph({ text: proj.description, spacing: { after: 40 } }))
      children.push(...bulletList(proj.bullets))
    })
  }

  if (resumeData.education?.length) {
    children.push(sectionHeading('Education'))
    resumeData.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: edu.degree || '', bold: true }),
            new TextRun({ text: edu.school ? `  —  ${edu.school}` : '' }),
          ],
        })
      )
      const meta = [edu.location, dateRange(edu.start, edu.end)].filter(Boolean).join('   ')
      if (meta) children.push(new Paragraph({ children: [new TextRun({ text: meta, italics: true, size: 20, color: '4B4A46' })] }))
      if (edu.details) children.push(new Paragraph({ text: edu.details }))
    })
  }

  if (resumeData.skills?.length) {
    children.push(sectionHeading('Skills'))
    children.push(new Paragraph({ text: resumeData.skills.filter(Boolean).join('  •  ') }))
  }

  if (resumeData.certifications?.length) {
    children.push(sectionHeading('Certifications'))
    resumeData.certifications.forEach((cert) => {
      const line = [cert.name, cert.issuer, cert.date].filter(Boolean).join('  —  ')
      children.push(new Paragraph({ text: line, spacing: { after: 40 } }))
    })
  }

  if (resumeData.achievements?.length) {
    children.push(sectionHeading('Achievements'))
    children.push(...bulletList(resumeData.achievements))
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { size: 22 } }, // 11pt body text
      },
    },
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, fileName)
}
