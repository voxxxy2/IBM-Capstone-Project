
import type { Note } from '../types'
export function allTags(notes: Note[]): string[] {
  const set = new Set<string>()
  for (const n of notes) for (const t of n.tags) set.add(t)
  return Array.from(set).sort((a,b) => a.localeCompare(b))
}
export function parseTags(s: string): string[] {
  return s.split(',').map(t => t.trim()).filter(Boolean)
}
