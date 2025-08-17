
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useNotes } from '../store/notes'
import { marked } from 'marked'
import confetti from 'canvas-confetti'
import { parseTags } from '../lib/utils'

export default function Edit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notes, createNote, updateNote, deleteNote, togglePin, setReminder } = useNotes(s => ({
    notes: s.notes, createNote: s.createNote, updateNote: s.updateNote, deleteNote: s.deleteNote,
    togglePin: s.togglePin, setReminder: s.setReminder
  }))

  const existing = useMemo(() => notes.find(n => n.id === id), [notes, id])
  const [title, setTitle] = useState(existing?.title ?? '')
  const [body, setBody] = useState(existing?.body ?? '')
  const [tagsInput, setTagsInput] = useState(existing ? existing.tags.join(', ') : '')
  const [reminder, setReminderInput] = useState<string>(() => {
    if (existing?.reminderAt) {
      const d = new Date(existing.reminderAt); const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } return ''
  })

  useEffect(() => {
    if (existing) {
      setTitle(existing.title); setBody(existing.body); setTagsInput(existing.tags.join(', '))
      if (existing.reminderAt) {
        const d = new Date(existing.reminderAt); const pad = (n: number) => String(n).padStart(2, '0')
        setReminderInput(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`)
      } else setReminderInput('')
    } else { setTitle(''); setBody(''); setTagsInput(''); setReminderInput('') }
  }, [existing?.id])

  const onSave = () => {
    const tags = parseTags(tagsInput)
    if (existing) {
      updateNote(existing.id, { title: title.trim() || 'Untitled', body, tags })
      const when = reminder.trim() ? new Date(reminder).getTime() || null : null
      setReminder(existing.id, when)
      confetti({ particleCount: 90, spread: 60, scalar: 0.9, origin: { y: 0.25 } })
      navigate('/', { replace: true })
    } else {
      const n = createNote({ title, body, tags })
      const when = reminder.trim() ? new Date(reminder).getTime() || null : null
      if (when) setReminder(n.id, when)
      confetti({ particleCount: 140, spread: 70, ticks: 200, origin: { y: 0.25 } })
      navigate('/', { replace: true })
    }
  }

  const onDelete = () => {
    if (existing && confirm('Delete this note? This cannot be undone.')) {
      deleteNote(existing.id); navigate('/', { replace: true })
    }
  }

  useEffect(() => {
    const h = () => onSave()
    document.addEventListener('app.save', h as any)
    return () => document.removeEventListener('app.save', h as any)
  }, [title, body, tagsInput, reminder, existing?.id])

  const previewHtml = useMemo(() => (marked.parse(body || '') as string), [body])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <input className="input text-lg" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <div className="ml-auto flex gap-2">
            {existing && (
              <button className={`chip ${existing.pinned ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-500/20 dark:border-blue-400 dark:text-blue-200' : ''}`} onClick={() => togglePin(existing.id)} title="Pin">
                {existing.pinned ? '📌 Unpin' : '📌 Pin'}
              </button>
            )}
            <button className="btn-primary" onClick={onSave} title="Save (Ctrl/Cmd+S)">Save</button>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            {existing && <button className="btn-secondary" onClick={onDelete}>Delete</button>}
          </div>
        </div>

        <textarea className="input min-h-[320px]" placeholder="Write your note… (Markdown supported)" value={body} onChange={e => setBody(e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Tags (comma separated)" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
          <div className="flex gap-2 items-center">
            <input type="datetime-local" className="input" value={reminder} onChange={e => setReminderInput(e.target.value)} aria-label="Reminder time" />
            {existing && existing.reminderAt && (
              <button className="chip" onClick={() => { useNotes.getState().setReminder(existing.id!, null); setReminderInput('') }} title="Hapus reminder">Hapus ⏰</button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-zinc-400">Tip: Gunakan <code>#tags</code>, <code>**bold**</code>, <code>*italic*</code>, dan daftar di Markdown.</div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-2 text-gray-900 dark:text-zinc-100">Preview</h3>
        <div className="space-y-2">
          <div className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{title || 'Untitled'}</div>
          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          <div className="flex flex-wrap gap-2 mt-2">{parseTags(tagsInput).map(t => <span key={t} className="chip">#{t}</span>)}</div>
        </div>
      </div>
    </div>
  )
}
