function Bullets({ items }) {
  return (
    <ul className="list-disc list-outside ml-5 space-y-1 text-[13px] leading-snug">
      {(items || []).filter(Boolean).map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

function Heading({ children }) {
  return (
    <h2 className="text-[13px] font-semibold tracking-wide uppercase border-b border-ink/30 pb-1 mb-2 mt-5">
      {children}
    </h2>
  )
}

export default function ClassicTemplate({ data }) {
  const p = data.personal || {}
  const contactLine = [p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean).join('   |   ')

  return (
    <div id="resume-sheet" className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-lg px-10 py-10 text-ink font-body">
      <div className="text-center mb-2">
        <h1 className="font-display text-3xl">{p.name || 'Your Name'}</h1>
        {p.title && <p className="text-sm text-ink/70 mt-1">{p.title}</p>}
        {contactLine && <p className="text-[12px] text-ink/70 mt-2">{contactLine}</p>}
      </div>

      {data.summary && (
        <>
          <Heading>Summary</Heading>
          <p className="text-[13px] leading-relaxed">{data.summary}</p>
        </>
      )}

      {data.experience?.length > 0 && (
        <>
          <Heading>Experience</Heading>
          <div className="space-y-3">
            {data.experience.map((job, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-[14px]">{job.role}, {job.company}</p>
                  <p className="text-[11px] text-ink/60 whitespace-nowrap">
                    {[job.start, job.end].filter(Boolean).join(' – ')}
                  </p>
                </div>
                {job.location && <p className="text-[11px] text-ink/60">{job.location}</p>}
                <Bullets items={job.bullets} />
              </div>
            ))}
          </div>
        </>
      )}

      {data.projects?.length > 0 && (
        <>
          <Heading>Projects</Heading>
          <div className="space-y-3">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <p className="font-semibold text-[14px]">
                  {proj.name} {proj.tech && <span className="font-normal text-ink/60 text-[12px]">— {proj.tech}</span>}
                </p>
                {proj.description && <p className="text-[12px] text-ink/80 mb-1">{proj.description}</p>}
                <Bullets items={proj.bullets} />
              </div>
            ))}
          </div>
        </>
      )}

      {data.education?.length > 0 && (
        <>
          <Heading>Education</Heading>
          <div className="space-y-2">
            {data.education.map((e, i) => (
              <div key={i} className="flex justify-between items-baseline">
                <p className="text-[13px]"><span className="font-semibold">{e.degree}</span>, {e.school}</p>
                <p className="text-[11px] text-ink/60 whitespace-nowrap">
                  {[e.start, e.end].filter(Boolean).join(' – ')}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {data.skills?.length > 0 && (
        <>
          <Heading>Skills</Heading>
          <p className="text-[13px]">{data.skills.filter(Boolean).join('  •  ')}</p>
        </>
      )}

      {data.certifications?.length > 0 && (
        <>
          <Heading>Certifications</Heading>
          <div className="text-[13px] space-y-1">
            {data.certifications.map((c, i) => (
              <p key={i}>{[c.name, c.issuer, c.date].filter(Boolean).join(' — ')}</p>
            ))}
          </div>
        </>
      )}

      {data.achievements?.length > 0 && (
        <>
          <Heading>Achievements</Heading>
          <Bullets items={data.achievements} />
        </>
      )}
    </div>
  )
}
