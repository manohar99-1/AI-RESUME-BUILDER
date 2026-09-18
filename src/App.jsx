import { useState, useRef, useEffect } from 'react'
import { extractTextFromFile } from './lib/parseFile'
import { EMPTY_RESUME, extractResumeData, enhanceResumeData, tailorResumeData } from './lib/aiClient'
import { exportResumeToDocx } from './lib/docxExport'
import { listVersions, saveVersion, deleteVersion } from './lib/storage'
import ModernTemplate from './templates/ModernTemplate'
import ClassicTemplate from './templates/ClassicTemplate'
import Field from './components/Field'
import BulletEditor from './components/BulletEditor'

const TEMPLATES = {
  modern: { label: 'Modern', Component: ModernTemplate },
  classic: { label: 'Classic', Component: ClassicTemplate },
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default function App() {
  const [step, setStep] = useState('input') // 'input' | 'editing'
  const [pastedText, setPastedText] = useState('')
  const [files, setFiles] = useState([]) // { name, status, text, error }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resumeData, setResumeData] = useState(clone(EMPTY_RESUME))
  const [template, setTemplate] = useState('modern')
  const [mobileTab, setMobileTab] = useState('edit') // 'edit' | 'preview'
  const [jobDescription, setJobDescription] = useState('')
  const [zoom, setZoom] = useState(0.55)
  const [versions, setVersions] = useState(listVersions())
  const [versionName, setVersionName] = useState('')
  const fileInputRef = useRef(null)
  const previewContainerRef = useRef(null)

  // Auto-fit the preview to the actual screen width every time the Preview
  // tab is opened, so lines never run off-screen requiring sideways
  // scrolling to read — the old fixed default zoom didn't account for the
  // real device width. The user can still zoom in further with the slider.
  useEffect(() => {
    if (mobileTab !== 'preview') return
    const el = previewContainerRef.current
    if (!el) return
    const horizontalPadding = 32 // matches the container's p-4
    const sheetWidthPx = 793.7 // 210mm at 96 CSS px/inch
    const available = el.clientWidth - horizontalPadding
    const fit = Math.min(1, Math.max(0.3, available / sheetWidthPx))
    setZoom(Math.round(fit * 100) / 100)
  }, [mobileTab])

  async function handleFilesSelected(e) {
    const picked = Array.from(e.target.files || [])
    for (const file of picked) {
      const entry = { name: file.name, status: 'reading', text: '', error: '' }
      setFiles((prev) => [...prev, entry])
      try {
        const text = await extractTextFromFile(file)
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name ? { ...f, status: 'done', text } : f))
        )
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) => (f.name === file.name ? { ...f, status: 'error', error: err.message } : f))
        )
      }
    }
    e.target.value = ''
  }

  function removeFile(name) {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  async function handleGenerate() {
    setError('')
    const combined = [pastedText, ...files.filter((f) => f.status === 'done').map((f) => f.text)]
      .filter(Boolean)
      .join('\n\n---\n\n')

    if (!combined.trim()) {
      setError('Add some text or upload at least one file first.')
      return
    }

    setBusy(true)
    try {
      const data = await extractResumeData(combined)
      setResumeData(data)
      setStep('editing')
      setMobileTab('preview')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleEnhance() {
    setBusy(true)
    setError('')
    try {
      const data = await enhanceResumeData(resumeData)
      setResumeData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleTailor() {
    if (!jobDescription.trim()) {
      setError('Paste a job description first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const data = await tailorResumeData(resumeData, jobDescription)
      setResumeData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function updatePersonal(field, value) {
    setResumeData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }))
  }

  function updateTop(field, value) {
    setResumeData((prev) => ({ ...prev, [field]: value }))
  }

  function updateListItem(section, index, field, value) {
    setResumeData((prev) => {
      const list = [...(prev[section] || [])]
      list[index] = { ...list[index], [field]: value }
      return { ...prev, [section]: list }
    })
  }

  function addListItem(section, empty) {
    setResumeData((prev) => ({ ...prev, [section]: [...(prev[section] || []), empty] }))
  }

  function removeListItem(section, index) {
    setResumeData((prev) => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index),
    }))
  }

  function handleSaveVersion() {
    const name = versionName.trim() || `Version ${versions.length + 1}`
    saveVersion(name, resumeData, template)
    setVersions(listVersions())
    setVersionName('')
  }

  function handleLoadVersion(v) {
    setResumeData(clone(v.resumeData))
    setTemplate(v.template || 'modern')
  }

  function handleDeleteVersion(id) {
    deleteVersion(id)
    setVersions(listVersions())
  }

  const PreviewComponent = TEMPLATES[template].Component

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-paper px-5 py-10">
        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 border border-moss/40 px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-moss" />
            <span className="font-mono text-[10.5px] tracking-[0.15em] uppercase text-moss">Resume builder</span>
          </div>
          <h1 className="font-display font-bold text-5xl text-ink mb-3 tracking-tight">Resumeforge</h1>
          <p className="text-ink/70 text-[14px] leading-relaxed mb-6">
            Paste your details, or upload documents — an old resume, certificates, project notes,
            even a photo of a printed certificate. We'll pull it together into a clean resume.
          </p>

          <div className="grid grid-cols-3 gap-2 mb-8 font-mono text-[10px] tracking-wide uppercase">
            <div className="border border-moss/40 text-moss px-2 py-2 text-center">01 · Add info</div>
            <div className="border border-line text-ink/50 px-2 py-2 text-center">02 · Edit</div>
            <div className="border border-line text-ink/50 px-2 py-2 text-center">03 · Export</div>
          </div>

          <label className="block mb-5">
            <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink/50">Paste text</span>
            <textarea
              className="mt-1.5 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-[13px] leading-snug focus:outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
              rows={6}
              placeholder="Paste your experience, education, skills, project notes — anything."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          </label>

          <div className="mb-5">
            <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink/50">Upload files</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,image/*"
              className="hidden"
              onChange={handleFilesSelected}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 w-full rounded-md border border-dashed border-line bg-surface py-3 text-[13px] text-ink/60 hover:border-moss hover:text-moss transition-colors"
            >
              + Add PDF, DOCX, TXT, or an image
            </button>
            <div className="mt-2 space-y-1.5">
              {files.map((f) => (
                <div key={f.name} className="flex items-center justify-between text-[12px] bg-surface rounded-md border border-line px-3 py-2">
                  <span className="truncate">{f.name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span
                      className={
                        f.status === 'done'
                          ? 'text-moss'
                          : f.status === 'error'
                          ? 'text-clay'
                          : 'text-ink/50'
                      }
                    >
                      {f.status === 'reading' ? 'reading…' : f.status === 'done' ? 'ready' : 'failed'}
                    </span>
                    <button onClick={() => removeFile(f.name)} className="text-ink/40">
                      ✕
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-clay text-[13px] mb-3 bg-clay/10 border border-clay/30 rounded-md px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={busy}
            className="w-full bg-moss text-paper py-3.5 text-[14px] font-bold uppercase tracking-wide font-mono disabled:opacity-50 hover:bg-moss/90 transition-colors"
            style={{ boxShadow: busy ? 'none' : '0 0 24px rgba(34,184,166,0.35)' }}
          >
            {busy ? 'Reading your info…' : 'Generate resume'}
          </button>

          {versions.length > 0 && (
            <div className="mt-9">
              <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink/50">Saved versions</span>
              <div className="mt-1.5 space-y-1.5">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-[12px] bg-surface rounded-md border border-line px-3 py-2">
                    <button className="truncate text-left flex-1" onClick={() => { handleLoadVersion(v); setStep('editing'); setMobileTab('preview') }}>
                      {v.name}
                    </button>
                    <button onClick={() => handleDeleteVersion(v.id)} className="text-ink/40 ml-2">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-line px-4 py-3 flex items-center justify-between">
        <button onClick={() => setStep('input')} className="flex items-center gap-1.5 text-[13px] text-ink/60 hover:text-ink transition-colors">
          <span aria-hidden>←</span> <span className="font-display text-[15px] text-ink">Resumeforge</span>
        </button>
        <div className="flex rounded-full border border-line overflow-hidden font-mono text-[10.5px] tracking-wide uppercase">
          <button
            onClick={() => setMobileTab('edit')}
            className={`px-3 py-1.5 transition-colors ${mobileTab === 'edit' ? 'bg-moss text-paper' : 'text-ink/60'}`}
          >
            Edit
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`px-3 py-1.5 transition-colors ${mobileTab === 'preview' ? 'bg-moss text-paper' : 'text-ink/60'}`}
          >
            Preview
          </button>
        </div>
      </header>

      {error && <p className="text-clay text-[13px] px-4 pt-2">{error}</p>}

      {mobileTab === 'edit' ? (
        <div className="px-4 py-4 space-y-6 max-w-md mx-auto">
          <section>
            <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70 mb-2">Template</h2>
            <div className="flex gap-2">
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border ${
                    template === key ? 'bg-moss text-paper border-moss' : 'border-line text-ink/70'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-2">
            <Field label="Name" value={resumeData.personal.name} onChange={(v) => updatePersonal('name', v)} />
            <Field label="Title" value={resumeData.personal.title} onChange={(v) => updatePersonal('title', v)} />
            <Field label="Email" value={resumeData.personal.email} onChange={(v) => updatePersonal('email', v)} />
            <Field label="Phone" value={resumeData.personal.phone} onChange={(v) => updatePersonal('phone', v)} />
            <Field label="Location" value={resumeData.personal.location} onChange={(v) => updatePersonal('location', v)} className="col-span-2" />
            <BulletEditor
              label="Links (one per line)"
              value={resumeData.personal.links}
              onChange={(v) => updatePersonal('links', v)}
              rows={2}
            />
          </section>

          <section>
            <label className="block">
              <span className="text-[12px] font-medium text-ink/70">Summary</span>
              <textarea
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] leading-snug focus:outline-none focus:ring-2 focus:ring-moss/40"
                rows={3}
                value={resumeData.summary || ''}
                onChange={(e) => updateTop('summary', e.target.value)}
              />
            </label>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70">Experience</h2>
              <button
                className="text-[12px] text-moss"
                onClick={() => addListItem('experience', { company: '', role: '', location: '', start: '', end: '', bullets: [] })}
              >
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.experience.map((job, i) => (
                <div key={i} className="border border-line rounded-md p-3 bg-surface space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Role" value={job.role} onChange={(v) => updateListItem('experience', i, 'role', v)} />
                    <Field label="Company" value={job.company} onChange={(v) => updateListItem('experience', i, 'company', v)} />
                    <Field label="Location" value={job.location} onChange={(v) => updateListItem('experience', i, 'location', v)} />
                    <div className="flex gap-2">
                      <Field label="Start" value={job.start} onChange={(v) => updateListItem('experience', i, 'start', v)} />
                      <Field label="End" value={job.end} onChange={(v) => updateListItem('experience', i, 'end', v)} />
                    </div>
                  </div>
                  <BulletEditor label="Bullets" value={job.bullets} onChange={(v) => updateListItem('experience', i, 'bullets', v)} rows={3} />
                  <button className="text-[12px] text-clay" onClick={() => removeListItem('experience', i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70">Projects</h2>
              <button
                className="text-[12px] text-moss"
                onClick={() => addListItem('projects', { name: '', description: '', tech: '', link: '', bullets: [] })}
              >
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.projects.map((proj, i) => (
                <div key={i} className="border border-line rounded-md p-3 bg-surface space-y-2">
                  <Field label="Name" value={proj.name} onChange={(v) => updateListItem('projects', i, 'name', v)} />
                  <Field label="Tech" value={proj.tech} onChange={(v) => updateListItem('projects', i, 'tech', v)} />
                  <Field label="Description" value={proj.description} onChange={(v) => updateListItem('projects', i, 'description', v)} />
                  <BulletEditor label="Bullets" value={proj.bullets} onChange={(v) => updateListItem('projects', i, 'bullets', v)} rows={3} />
                  <button className="text-[12px] text-clay" onClick={() => removeListItem('projects', i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70">Education</h2>
              <button
                className="text-[12px] text-moss"
                onClick={() => addListItem('education', { school: '', degree: '', location: '', start: '', end: '', details: '' })}
              >
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {resumeData.education.map((edu, i) => (
                <div key={i} className="border border-line rounded-md p-3 bg-surface space-y-2">
                  <Field label="Degree" value={edu.degree} onChange={(v) => updateListItem('education', i, 'degree', v)} />
                  <Field label="School" value={edu.school} onChange={(v) => updateListItem('education', i, 'school', v)} />
                  <div className="flex gap-2">
                    <Field label="Start" value={edu.start} onChange={(v) => updateListItem('education', i, 'start', v)} />
                    <Field label="End" value={edu.end} onChange={(v) => updateListItem('education', i, 'end', v)} />
                  </div>
                  <Field label="Details" value={edu.details} onChange={(v) => updateListItem('education', i, 'details', v)} />
                  <button className="text-[12px] text-clay" onClick={() => removeListItem('education', i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <BulletEditor label="Skills (one per line)" value={resumeData.skills} onChange={(v) => updateTop('skills', v)} rows={3} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70">Certifications</h2>
              <button
                className="text-[12px] text-moss"
                onClick={() => addListItem('certifications', { name: '', issuer: '', date: '' })}
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {resumeData.certifications.map((c, i) => (
                <div key={i} className="border border-line rounded-md p-3 bg-surface space-y-2">
                  <Field label="Name" value={c.name} onChange={(v) => updateListItem('certifications', i, 'name', v)} />
                  <Field label="Issuer" value={c.issuer} onChange={(v) => updateListItem('certifications', i, 'issuer', v)} />
                  <Field label="Date" value={c.date} onChange={(v) => updateListItem('certifications', i, 'date', v)} />
                  <button className="text-[12px] text-clay" onClick={() => removeListItem('certifications', i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <BulletEditor label="Achievements (one per line)" value={resumeData.achievements} onChange={(v) => updateTop('achievements', v)} rows={3} />
          </section>

          <section className="space-y-2">
            <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70">AI tools</h2>
            <button
              onClick={handleEnhance}
              disabled={busy}
              className="w-full rounded-md border border-moss text-moss py-2.5 text-[13px] font-medium disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Polish wording with AI'}
            </button>
            <textarea
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px]"
              rows={3}
              placeholder="Paste a job description to tailor this resume to it (optional)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <button
              onClick={handleTailor}
              disabled={busy}
              className="w-full rounded-md border border-clay text-clay py-2.5 text-[13px] font-medium disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Tailor to this job'}
            </button>
          </section>

          <section className="space-y-2 pb-10">
            <h2 className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink/70">Save this version</h2>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-line bg-surface px-3 py-2 text-[13px]"
                placeholder="Version name (e.g. Backend roles)"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
              />
              <button onClick={handleSaveVersion} className="rounded-md bg-ink text-paper px-3 text-[13px]">
                Save
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="px-4 py-4">
          <div className="max-w-md mx-auto mb-3 flex items-center gap-3">
            <label className="text-[12px] text-ink/60 flex items-center gap-2">
              Zoom
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
          </div>
          <div ref={previewContainerRef} className="preview-scroll border border-line rounded-md bg-surface p-4">
            <div className="preview-scale" style={{ '--zoom': zoom }}>
              <PreviewComponent data={resumeData} />
            </div>
          </div>
          <div className="max-w-md mx-auto mt-4 grid grid-cols-2 gap-2 pb-10">
            <button
              onClick={() => window.print()}
              className="rounded-md bg-ink text-paper py-2.5 text-[13px] font-medium"
            >
              Export PDF
            </button>
            <button
              onClick={() => exportResumeToDocx(resumeData, `${resumeData.personal.name || 'resume'}.docx`)}
              className="rounded-md bg-moss text-paper py-2.5 text-[13px] font-medium"
            >
              Export DOCX
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
