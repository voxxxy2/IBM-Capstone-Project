
import { useMemo } from 'react'
import { useNotes } from '../store/notes'

export default function Trash() {
  const { notes, restoreNote, purgeNote, purgeAllTrash } = useNotes(s => ({
    notes: s.notes, restoreNote: s.restoreNote, purgeNote: s.purgeNote, purgeAllTrash: s.purgeAllTrash
  }))
  const trashed = useMemo(() => notes.filter(n => n.trashed).sort((a,b) => b.updatedAt - a.updatedAt), [notes])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Trash</h2>
        {trashed.length > 0 && <button className="chip" onClick={() => { if (confirm('Empty trash?')) purgeAllTrash() }}>Empty Trash</button>}
      </div>

      {trashed.length === 0 ? (
        <div className="card p-8 text-center text-gray-600 dark:text-zinc-300"><p>Tidak ada catatan di Trash.</p></div>
      ) : (
        <div className="space-y-2">
          {trashed.map(n => (
            <div key={n.id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm opacity-75">{n.body.slice(0,120)}{n.body.length>120?'…':''}</div>
              </div>
              <div className="flex gap-2">
                <button className="chip" onClick={() => restoreNote(n.id)}>Restore</button>
                <button className="chip" onClick={() => { if (confirm('Delete permanently?')) purgeNote(n.id) }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
