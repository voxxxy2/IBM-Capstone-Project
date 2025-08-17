
import { Link } from 'react-router-dom'
import { useMemo, useState, useEffect, useRef } from 'react'
import type { Note } from '../types'
import { allTags } from '../lib/utils'
import { useNotes } from '../store/notes'
import NoteCard from '../components/NoteCard'
import { downloadJSON, downloadCSV, pickJSON } from '../lib/io'
import WelcomeBanner from '../components/WelcomeBanner'
import WeatherWidget from '../components/WeatherWidget'

type ViewMode = 'grid' | 'list'
const VIEW_KEY = 'granite-notes-view'
const FIRED_KEY = 'granite-notes-fired-reminders'

export default function Home() {
  const notes = useNotes(s => s.notes)
  const importNotes = useNotes(s => s.importNotes)

  const [q, setQ] = useState('')
  const [tag, setTag] = useState<string | null>(null)
  const [onlyStarred, setOnlyStarred] = useState(false)
  const [view, setView] = useState<ViewMode>(() => (localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'))

  const searchRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    const h = () => searchRef.current?.focus()
    document.addEventListener('app.focusSearch', h as any)
    return () => document.removeEventListener('app.focusSearch', h as any)
  }, [])
  useEffect(() => { localStorage.setItem(VIEW_KEY, view) }, [view])

  const tags = useMemo(() => allTags(notes.filter(n => !n.trashed)), [notes])

  const base = useMemo(() => {
    const term = q.trim().toLowerCase()
    return notes
      .filter(n => !n.trashed)
      .filter(n => !onlyStarred || n.starred)
      .filter(n => !tag || n.tags.includes(tag))
      .filter(n => {
        if (!term) return true
        return n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term) || n.tags.some(t => t.toLowerCase().includes(term))
      })
  }, [notes, q, tag, onlyStarred])

  const { pinnedNotes, otherNotes } = useMemo(() => {
    const pinned = base.filter(n => n.pinned).sort((a,b) => b.updatedAt - a.updatedAt)
    const others = base.filter(n => !n.pinned).sort((a,b) => b.updatedAt - a.updatedAt)
    return { pinnedNotes: pinned, otherNotes: others }
  }, [base])

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') { Notification.requestPermission().catch(() => {}) }
  }, [])
  useEffect(() => {
    if (!('Notification' in window)) return
    const fired = new Set<string>(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'))
    const tick = () => {
      const now = Date.now()
      const due = notes.filter(n => !n.trashed && n.reminderAt && n.reminderAt > 0 && n.reminderAt <= now && !fired.has(n.id))
      if (!due.length) return
      if (Notification.permission === 'granted') {
        for (const n of due) {
          const bodyPreview = n.body.length > 120 ? n.body.slice(0,120).trim() + '…' : n.body
          new Notification(n.title || 'Pengingat Catatan', { body: bodyPreview || 'Waktunya cek catatan ini.' })
          fired.add(n.id)
        }
        localStorage.setItem(FIRED_KEY, JSON.stringify(Array.from(fired)))
      }
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [notes])

  const GridOrList = ({ items }: { items: Note[] }) => {
    if (view === 'list') {
      return <div className="flex flex-col gap-3">{items.map(n => <div key={n.id} className="note-enter"><NoteCard note={n} /></div>)}</div>
    }
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(n => <div key={n.id} className="note-enter"><NoteCard note={n} /></div>)}</div>
  }

  return (
    <div className="space-y-4">
      <WelcomeBanner />
      <WeatherWidget />

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <input ref={searchRef} className="input placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="Cari catatan atau tag..." value={q} onChange={e => setQ(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          <button className={`chip ${onlyStarred ? 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-500/20 dark:border-yellow-400 dark:text-yellow-200' : ''}`} onClick={() => setOnlyStarred(v => !v)}>
            {onlyStarred ? '★ Favorit' : '☆ Semua'}
          </button>
          {tags.map(t => (
            <button key={t} className={`chip ${tag === t ? 'chip-active' : ''}`} onClick={() => setTag(tag === t ? null : t)}>{t}</button>
          ))}
          {tag && <button className="chip" onClick={() => setTag(null)}>Hapus filter</button>}
        </div>
        <div className="flex gap-2 md:ml-auto">
          <button className={`chip ${view === 'grid' ? 'chip-active' : ''}`} onClick={() => setView('grid')}>⬛ Grid</button>
          <button className={`chip ${view === 'list' ? 'chip-active' : ''}`} onClick={() => setView('list')}>☰ List</button>
          <Link to="/edit" className="btn-primary">Catatan Baru</Link>
          <button className="chip" onClick={() => downloadJSON('granite-notes-backup.json', { notes })}>Ekspor JSON</button>
          <button className="chip" onClick={() => downloadCSV('granite-notes.csv', notes)}>Ekspor CSV</button>
          <button className="chip" onClick={async () => {
            const data = await pickJSON()
            if (data && Array.isArray(data.notes)) importNotes(data.notes as Note[])
            else alert('Berkas JSON tidak valid.')
          }}>Impor JSON</button>
        </div>
      </div>

      {pinnedNotes.length > 0 && (
        <section className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-zinc-400">Pinned</div>
          <GridOrList items={pinnedNotes} />
        </section>
      )}

      <section className="space-y-2">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-zinc-400">Others</div>
        )}
        {otherNotes.length === 0 ? (
          <div className="card p-8 text-center text-gray-600 dark:text-zinc-300"><p>Tidak ada catatan (di luar pinned) yang cocok.</p></div>
        ) : (<GridOrList items={otherNotes} />)}
      </section>
    </div>
  )
}
