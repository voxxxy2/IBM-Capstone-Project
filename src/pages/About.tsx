
export default function About() {
  return (
    <div className="card p-6 space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Tentang Aplikasi</h2>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Aplikasi catatan ringan yang fokus pada produktivitas, privasi, dan kemudahan penggunaan.
          Data disimpan lokal di peramban (localStorage). PWA siap offline.
        </p>
      </div>
      <section className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Fitur Utama</h3>
        <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-zinc-200 space-y-1">
          <li>✍️ CRUD catatan + preview Markdown</li>
          <li>🏷️ Tag & pencarian cepat; ⭐ favorit; 📌 pinned</li>
          <li>🗑️ Trash: restore & empty</li>
          <li>🌓 Dark mode</li>
          <li>📤 Ekspor/Impor JSON & CSV</li>
          <li>🌦️ Widget cuaca (Open-Meteo) tanpa API key</li>
          <li>⏰ Reminder lokal (Notification API)</li>
          <li>📱 PWA: installable + offline</li>
        </ul>
      </section>
    </div>
  )
}
