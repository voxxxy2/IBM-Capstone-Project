
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const HIDE_KEY = 'granite-notes-hide-install'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState<boolean>(() => localStorage.getItem(HIDE_KEY) !== '1')

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault?.()
      if (localStorage.getItem(HIDE_KEY) === '1') return
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    const onAppInstalled = () => {
      localStorage.setItem(HIDE_KEY, '1'); setDeferred(null); setVisible(false)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  if (!visible) return null
  const displayModeStandalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as any).standalone === true
  if (displayModeStandalone) return null

  async function onInstall() {
    if (!deferred) { alert('Jika perangkat mendukung, gunakan menu browser untuk menambahkan ke layar utama.'); return }
    try { await deferred.prompt(); await deferred.userChoice; setDeferred(null) } catch {}
  }
  function onHide() { localStorage.setItem(HIDE_KEY, '1'); setVisible(false) }

  return (
    <div className="flex items-center gap-2">
      <button className="btn-primary" onClick={onInstall} title="Install aplikasi">Install App</button>
      <button className="chip" onClick={onHide} title="Sembunyikan tombol install">Sembunyikan</button>
    </div>
  )
}
