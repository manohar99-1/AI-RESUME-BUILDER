function Bullets({ items }) {
  return (
    <ul className="list-disc list-outside ml-4 space-y-1 text-[13px] leading-snug text-ink/90">
      {(items || []).filter(Boolean).map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

export default function ModernTemplate({ data }) {
  const p = data.personal || {}
  return (
    <div id="resume-sheet" className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-lg flex text-ink font-body">
      {/* Sidebar */}
      <aside className="w-[70mm] bg-moss text-paper flex flex-col gap-6" style={{ padding: '14mm 8mm' }}>
        <div>
          <h1 className="font-display text-2xl leading-tight">{p.name || 'Your Name'}</h1>
          {p.title && <p className="text-sm text-paper/80 mt-1">{p.title}</p>}
        </div>
        <div className="text-[12px] space-y-1 text-paper/90 break-words">
          {p.email && <p>{p.email}</p>}
          {p.phone && <p>{p.phone}</p>}
          {p.location && <p>{p.location}</p>}
          {(p.links || []).filter(Boolean).map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-[11px] tracking-wide font-semibold border-b border-paper/30 pb-1 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.filter(Boolean).map((s, i) => (
                <span key={i} className="text-[11px] bg-paper/10 px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.education?.length > 0 && (
          <div>
            <h2 className="text-[11px] tracking-wide font-semibold border-b border-paper/30 pb-1 mb-2">Education</h2>
            <div className="space-y-3">
              {data.education.map((e, i) => (
                <div key={i} className="text-[12px]">
                  <p className="font-semibold">{e.degree}</p>
                  <p className="text-paper/85">{e.school}</p>
                  <p className="text-paper/70 text-[11px]">
                    {[e.start, e.end].filter(Boolean).join(' – ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.certifications?.length > 0 && (
          <div>
            <h2 className="text-[11px] tracking-wide font-semibold border-b border-paper/30 pb-1 mb-2">Certifications</h2>
            <div className="space-y-1 text-[12px]">
              {data.certifications.map((c, i) => (
                <p key={i}>{[c.name, c.issuer].filter(Boolean).join(' — ')}</p>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main column */}
      <main className="flex-1 space-y-5" style={{ padding: '14mm 10mm' }}>
        {data.summary && (
          <section>
            <h2 className="text-clay text-[13px] tracking-wide font-semibold uppercase mb-1">Summary</h2>
            <p className="text-[13px] leading-relaxed">{data.summary}</p>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-clay text-[13px] tracking-wide font-semibold uppercase mb-2">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((job, i) => (
                <div key={i} className="avoid-break">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-[14px]">
                      {job.role} <span className="font-normal text-ink/70">— {job.company}</span>
                    </p>
                    <p className="text-[11px] text-ink/60 whitespace-nowrap">
                      {[job.start, job.end].filter(Boolean).join(' – ')}
                    </p>
                  </div>
                  {job.location && <p className="text-[11px] text-ink/60">{job.location}</p>}
                  <Bullets items={job.bullets} />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-clay text-[13px] tracking-wide font-semibold uppercase mb-2">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="avoid-break">
                  <p className="font-semibold text-[14px]">
                    {proj.name} {proj.tech && <span className="font-normal text-ink/60 text-[12px]">— {proj.tech}</span>}
                  </p>
                  {proj.description && <p className="text-[12px] text-ink/80 mb-1">{proj.description}</p>}
                  <Bullets items={proj.bullets} />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.achievements?.length > 0 && (
          <section>
            <h2 className="text-clay text-[13px] tracking-wide font-semibold uppercase mb-2">Achievements</h2>
            <Bullets items={data.achievements} />
          </section>
        )}
      </main>
    </div>
  )
}
