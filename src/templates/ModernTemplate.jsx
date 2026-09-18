// Inserts zero-width break opportunities at sensible spots (after @, //, .)
// so long emails/URLs wrap at a natural boundary instead of splitting mid-word.
function breakable(text) {
  return (text || '').replace(/([@/.])/g, '$1\u200b')
}

function Bullets({ items }) {
  return (
    <ul className="list-disc list-outside ml-4 space-y-1 text-[14px] leading-snug text-docink/90">
      {(items || []).filter(Boolean).map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

export default function ModernTemplate({ data }) {
  const p = data.personal || {}
  return (
    <div id="resume-sheet" className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-lg flex text-docink font-body">
      {/* Sidebar */}
      <aside className="w-[72mm] bg-docaccent text-docpaper flex flex-col gap-6" style={{ padding: '18mm 12mm' }}>
        <div>
          <h1 className="font-display text-[26px] leading-tight">{p.name || 'Your Name'}</h1>
          {p.title && <p className="text-[13px] text-docpaper/80 mt-1">{p.title}</p>}
        </div>
        <div className="text-[13px] space-y-1 text-docpaper/90 break-words">
          {p.email && <p>{breakable(p.email)}</p>}
          {p.phone && <p>{p.phone}</p>}
          {p.location && <p>{p.location}</p>}
          {(p.links || []).filter(Boolean).map((l, i) => (
            <p key={i}>{breakable(l)}</p>
          ))}
        </div>
        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-[12px] tracking-wide font-semibold border-b border-docpaper/30 pb-1 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.filter(Boolean).map((s, i) => (
                <span key={i} className="text-[12px] bg-docpaper/10 px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.education?.length > 0 && (
          <div>
            <h2 className="text-[12px] tracking-wide font-semibold border-b border-docpaper/30 pb-1 mb-2">Education</h2>
            <div className="space-y-3">
              {data.education.map((e, i) => (
                <div key={i} className="text-[13px]">
                  <p className="font-semibold">{e.degree}</p>
                  <p className="text-docpaper/85">{e.school}</p>
                  <p className="text-docpaper/70 text-[12px]">
                    {[e.start, e.end].filter(Boolean).join(' – ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.certifications?.length > 0 && (
          <div>
            <h2 className="text-[12px] tracking-wide font-semibold border-b border-docpaper/30 pb-1 mb-2">Certifications</h2>
            <div className="space-y-1 text-[13px]">
              {data.certifications.map((c, i) => (
                <p key={i}>{[c.name, c.issuer].filter(Boolean).join(' — ')}</p>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main column */}
      <main className="flex-1 space-y-6" style={{ padding: '18mm 15mm' }}>
        {data.summary && (
          <section>
            <h2 className="text-docaccent2 text-[13px] tracking-wide font-semibold uppercase mb-1">Summary</h2>
            <p className="text-[14px] leading-relaxed">{data.summary}</p>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-docaccent2 text-[13px] tracking-wide font-semibold uppercase mb-2">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((job, i) => (
                <div key={i} className="avoid-break">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-[15px]">
                      {job.role} <span className="font-normal text-docink/70">— {job.company}</span>
                    </p>
                    <p className="text-[12px] text-docink/60 whitespace-nowrap">
                      {[job.start, job.end].filter(Boolean).join(' – ')}
                    </p>
                  </div>
                  {job.location && <p className="text-[12px] text-docink/60">{job.location}</p>}
                  <Bullets items={job.bullets} />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-docaccent2 text-[13px] tracking-wide font-semibold uppercase mb-2">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((proj, i) => (
                <div key={i} className="avoid-break">
                  <p className="font-semibold text-[15px]">
                    {proj.name} {proj.tech && <span className="font-normal text-docink/60 text-[13px]">— {proj.tech}</span>}
                  </p>
                  {proj.description && <p className="text-[13px] text-docink/80 mb-1">{proj.description}</p>}
                  <Bullets items={proj.bullets} />
                </div>
              ))}
            </div>
          </section>
        )}

        {data.achievements?.length > 0 && (
          <section>
            <h2 className="text-docaccent2 text-[13px] tracking-wide font-semibold uppercase mb-2">Achievements</h2>
            <Bullets items={data.achievements} />
          </section>
        )}
      </main>
    </div>
  )
}
