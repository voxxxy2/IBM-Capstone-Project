
import type { Note } from '../types'

export function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(filename: string, notes: Note[]) {
  const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"'
  const rows = [
    ['id','title','body','tags','starred','pinned','trashed','createdAt','updatedAt','reminderAt'].join(','),
    ...notes.map(n =>
      [n.id, n.title, n.body, n.tags.join(' '), n.starred, n.pinned, n.trashed, n.createdAt, n.updatedAt, n.reminderAt ?? ''].map(String).map(esc).join(',')
    )
  ].join('\n')
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export function pickJSON(): Promise<any | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = () => {
      const f = input.files?.[0]
      if (!f) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => {
        try { resolve(JSON.parse(String(reader.result))) } catch { resolve(null) }
      }
      reader.readAsText(f)
    }
    input.click()
  })
}
