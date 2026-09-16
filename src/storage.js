const KEY = 'resumeforge:versions'

export function listVersions() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveVersion(name, resumeData, template) {
  const versions = listVersions()
  const entry = {
    id: crypto.randomUUID(),
    name,
    template,
    resumeData,
    savedAt: new Date().toISOString(),
  }
  versions.unshift(entry)
  localStorage.setItem(KEY, JSON.stringify(versions.slice(0, 20)))
  return entry
}

export function deleteVersion(id) {
  const versions = listVersions().filter((v) => v.id !== id)
  localStorage.setItem(KEY, JSON.stringify(versions))
}
