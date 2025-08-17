
import { Link } from 'react-router-dom'
import type { Note } from '../types'
import { useNotes } from '../store/notes'

export default function NoteCard({ note }: { note: Note }) {
  const toggleStar = useNotes(s => s.toggleStar)
  const togglePin = useNotes(s => s.togglePin)
  const date = new Date(note.updatedAt).toLocaleString()
  const preview = note.body.length > 240 ? note.body.slice(0, 240).trim() + '…' : note.body
  const hasReminder = typeof note.reminderAt === 'number' && !!note.reminderAt
  const reminderStr = hasReminder && note.reminderAt ? new Date(note.reminderAt).toLocaleString() : null

  return (
    <div className="card p-4 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/edit/${note.id}`} className="text-base font-semibold leading-6 text-gray-900 dark:text-zinc-100 hover:underline">
          {note.title || 'Untitled'}
        </Link>
        <div className="flex gap-2">
          <button onClick={() => togglePin(note.id)} className={`chip ${note.pinned ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-500/20 dark:border-blue-400 dark:text-blue-200' : ''}`} title="Pin">
            {note.pinned ? '📌 Pinned' : '📌 Pin'}
          </button>
          <button onClick={() => toggleStar(note.id)} className={`chip ${note.starred ? 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-500/20 dark:border-yellow-400 dark:text-yellow-200' : ''}`} title="Star">
            {note.starred ? '★ Starred' : '☆ Star'}
          </button>
        </div>
      </div>
      {preview && <p className="text-sm leading-6 text-gray-700 dark:text-zinc-200">{preview}</p>}
      {note.tags.length > 0 && <div className="flex flex-wrap gap-2">{note.tags.map(t => <span key={t} className="chip">#{t}</span>)}</div>}
      <div className="flex items-center justify-between text-xs mt-1">
        <div className="text-gray-500 dark:text-zinc-400">Updated {date}</div>
        {hasReminder && reminderStr && <div className="chip" title={`Pengingat: ${reminderStr}`}>⏰ {reminderStr}</div>}
      </div>
    </div>
  )
}
