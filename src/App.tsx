
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from './store/theme'
import InstallPrompt from './components/InstallPrompt'

function ThemeMount() {
  const dark = useTheme(s => s.dark)
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])
  return null
}

function GlobalHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      const k = e.key.toLowerCase()
      if (mod && k === 's') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('app.save'))
      }
      if (mod && k === 'k') {
        e.preventDefault()
        document.dispatchEvent(new CustomEvent('app.focusSearch'))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  return null
}

function DarkToggle() {
  const dark = useTheme(s => s.dark)
  const toggle = useTheme(s => s.toggle)
  return (
    <button onClick={toggle} className="chip" title="Toggle dark mode">
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}

export default function App() {
  const loc = useLocation()
  return (
    <div className="min-h-screen">
      <ThemeMount />
      <GlobalHotkeys />

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-zinc-900/80 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="font-semibold text-lg">Granite Notes</Link>

          <nav className="flex gap-3">
            <Link to="/" className={`chip ${loc.pathname === '/' ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}>Home</Link>
            <Link to="/trash" className={`chip ${loc.pathname === '/trash' ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}>Trash</Link>
            <Link to="/edit" className="chip">New</Link>
            <Link to="/about" className="chip">About</Link>
            <DarkToggle />
          </nav>

          <div className="ml-auto" />
          <InstallPrompt />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
