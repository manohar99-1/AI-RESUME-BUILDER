function normalize(s) {
  return (s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function dedupeBullets(bullets) {
  const seen = new Set()
  const out = []
  for (const b of bullets || []) {
    const n = normalize(b)
    if (!n || seen.has(n)) continue
    seen.add(n)
    out.push(b)
  }
  return out
}

// Drops the description if it's just a restatement of the bullets (either the
// bullets concatenated match it, or it's a near-duplicate of any single bullet).
function cleanDescription(description, bullets) {
  const normDesc = normalize(description)
  if (!normDesc) return description || ''
  const bulletNorms = (bullets || []).map(normalize)
  const joined = bulletNorms.join(' ')
  const isDuplicate =
    (joined && joined.includes(normDesc)) ||
    bulletNorms.some((b) => b.length > 15 && (b.includes(normDesc) || normDesc.includes(b)))
  return isDuplicate ? '' : description
}

function dedupeItem(item) {
  const bullets = dedupeBullets(item.bullets)
  return { ...item, bullets, description: cleanDescription(item.description, bullets) }
}

export function dedupeResumeData(data) {
  return {
    ...data,
    experience: (data.experience || []).map((job) => ({ ...job, bullets: dedupeBullets(job.bullets) })),
    projects: (data.projects || []).map(dedupeItem),
    achievements: dedupeBullets(data.achievements),
  }
}
