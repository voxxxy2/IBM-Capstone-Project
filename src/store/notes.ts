
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Note } from '../types'

type State = { notes: Note[] }
type Actions = {
  createNote: (partial: { title: string; body: string; tags: string[] }) => Note
  updateNote: (id: string, update: Partial<Omit<Note, 'id' | 'createdAt'>>) => void
  deleteNote: (id: string) => void
  purgeNote: (id: string) => void
  restoreNote: (id: string) => void
  purgeAllTrash: () => void
  importNotes: (arr: Note[]) => void
  toggleStar: (id: string) => void
  togglePin: (id: string) => void
  setReminder: (id: string, when: number | null) => void
}

const initial: State = { notes: [] }

export const useNotes = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      createNote: ({ title, body, tags }) => {
        const now = Date.now()
        const n: Note = {
          id: nanoid(10),
          title: title.trim() || 'Untitled',
          body,
          tags: tags.map(t => t.trim()).filter(Boolean),
          starred: false,
          pinned: false,
          trashed: false,
          createdAt: now,
          updatedAt: now,
          reminderAt: null,
        }
        set(s => ({ notes: [n, ...s.notes] }))
        return n
      },
      updateNote: (id, update) => {
        set(s => ({
          notes: s.notes.map(n =>
            n.id === id
              ? { ...n, ...update, tags: update.tags ? update.tags.map(t => t.trim()).filter(Boolean) : n.tags, updatedAt: Date.now() }
              : n
          ),
        }))
      },
      deleteNote: (id) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, trashed: true, updatedAt: Date.now() } : n) })),
      purgeNote: (id) => set(s => ({ notes: s.notes.filter(n => n.id !== id) })),
      restoreNote: (id) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, trashed: false, updatedAt: Date.now() } : n) })),
      purgeAllTrash: () => set(s => ({ notes: s.notes.filter(n => !n.trashed) })),
      importNotes: (arr) => set(() => ({ notes: arr })),
      toggleStar: (id) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, starred: !n.starred, updatedAt: Date.now() } : n) })),
      togglePin: (id) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n) })),
      setReminder: (id, when) => set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, reminderAt: when, updatedAt: Date.now() } : n) })),
    }),
    { name: 'granite-notes', storage: createJSONStorage(() => localStorage), version: 2 }
  )
)
