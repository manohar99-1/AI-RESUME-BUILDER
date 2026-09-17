const WORD_SERIF = { fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif" }
const WORD_SANS = { fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" }

// Sizes below are chosen to land at standard resume point sizes once printed
// at true physical scale (1pt = 1.333px): 14.5px≈11pt, 13.3px≈10pt, 16px≈12pt.
function Bullets({ items }) {
  return (
    <ul className="list-disc list-outside ml-5 space-y-1 text-[14.5px] leading-[1.45]" style={WORD_SANS}>
      {(items || []).filter(Boolean).map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  )
}

function Heading({ children }) {
  return (
    <h2
      className="text-[13px] font-bold tracking-[0.06em] uppercase border-b border-docink pb-1 mb-2 mt-6 first:mt-0"
      style={WORD_SANS}
    >
      {children}
    </h2>
  )
}

function DateRange({ start, end }) {
  const text = [start, end].filter(Boolean).join(' – ')
  if (!text) return null
  return <span className="text-[13px] text-docink/70 whitespace-nowrap" style={WORD_SANS}>{text}</span>
}

export default function ClassicTemplate({ data }) {
  const p = data.personal || {}
  const contactLine = [p.email, p.phone, p.location, ...(p.links || [])].filter(Boolean).join('   •   ')

  return (
    <div
      id="resume-sheet"
      className="bg-white w-[210mm] min-h-[297mm] mx-auto shadow-lg text-docink"
      style={{ padding: '18mm 22mm' }}
    >
      <div className="text-center mb-5">
        <h1 className="text-[30px] font-bold tracking-tight" style={WORD_SERIF}>
          {p.name || 'Your Name'}
        </h1>
        {p.title && (
          <p className="text-[15px] mt-1" style={WORD_SANS}>
            {p.title}
          </p>
        )}
        {contactLine && (
          <p className="text-[13px] text-docink/70 mt-2" style={WORD_SANS}>
            {contactLine}
          </p>
        )}
      </div>

      {data.summary && (
        <section className="avoid-break">
          <Heading>Summary</Heading>
          <p className="text-[14.5px] leading-[1.5]" style={WORD_SANS}>
            {data.summary}
          </p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section>
          <Heading>Experience</Heading>
          <div className="space-y-4">
            {data.experience.map((job, i) => (
              <div key={i} className="avoid-break">
                <div className="flex justify-between items-baseline gap-3">
                  <p className="text-[15px] font-bold" style={WORD_SANS}>
                    {job.role}
                    {job.company && <span className="font-normal"> · {job.company}</span>}
                  </p>
                  <DateRange start={job.start} end={job.end} />
                </div>
                {job.location && (
                  <p className="text-[13px] italic text-docink/70" style={WORD_SANS}>
                    {job.location}
                  </p>
                )}
                <Bullets items={job.bullets} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.projects?.length > 0 && (
        <section>
          <Heading>Projects</Heading>
          <div className="space-y-4">
            {data.projects.map((proj, i) => (
              <div key={i} className="avoid-break">
                <p className="text-[15px] font-bold" style={WORD_SANS}>
                  {proj.name}
                  {proj.tech && <span className="font-normal text-docink/70"> · {proj.tech}</span>}
                </p>
                {proj.description && (
                  <p className="text-[14.5px] mb-1" style={WORD_SANS}>
                    {proj.description}
                  </p>
                )}
                <Bullets items={proj.bullets} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section>
          <Heading>Education</Heading>
          <div className="space-y-2.5">
            {data.education.map((e, i) => (
              <div key={i} className="avoid-break">
                <div className="flex justify-between items-baseline gap-3">
                  <p className="text-[14.5px]" style={WORD_SANS}>
                    <span className="font-bold">{e.degree}</span>
                    {e.school && <span> · {e.school}</span>}
                  </p>
                  <DateRange start={e.start} end={e.end} />
                </div>
                {e.details && (
                  <p className="text-[13px] text-docink/70" style={WORD_SANS}>
                    {e.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="avoid-break">
          <Heading>Skills</Heading>
          <p className="text-[14.5px] leading-[1.5]" style={WORD_SANS}>
            {data.skills.filter(Boolean).join('  •  ')}
          </p>
        </section>
      )}

      {data.certifications?.length > 0 && (
        <section className="avoid-break">
          <Heading>Certifications</Heading>
          <div className="text-[14.5px] space-y-1" style={WORD_SANS}>
            {data.certifications.map((c, i) => (
              <p key={i}>{[c.name, c.issuer, c.date].filter(Boolean).join(' — ')}</p>
            ))}
          </div>
        </section>
      )}

      {data.achievements?.length > 0 && (
        <section className="avoid-break">
          <Heading>Achievements</Heading>
          <Bullets items={data.achievements} />
        </section>
      )}
    </div>
  )
}
