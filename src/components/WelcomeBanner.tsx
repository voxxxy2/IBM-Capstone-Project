
import { useMemo } from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Selamat dini hari'
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function WelcomeBanner() {
  const greet = useMemo(getGreeting, [])
  const today = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
    } catch { return new Date().toLocaleDateString() }
  }, [])

  const dots = Array.from({ length: 10 }).map(() => ({
    left: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2.8 + Math.random() * 2}s`,
  }))

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-700 welcome-gradient p-5">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {dots.map((d, i) => (
          <span key={i} className="sparkle-dot" style={{ left: d.left as any, animationDelay: d.delay as any, animationDuration: d.duration as any }} />
        ))}
      </div>
      <div className="relative flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          <span className="wave inline-block">👋</span>
          {greet}!
        </div>
        <div className="text-sm sm:ml-auto text-gray-700 dark:text-zinc-300">{today}</div>
      </div>
      <p className="relative mt-2 text-sm text-gray-700 dark:text-zinc-200">
        Selamat datang di <strong>Granite Notes</strong>. Mulai catatan baru, cari ide lama, atau tandai yang penting.
      </p>
    </div>
  )
}
