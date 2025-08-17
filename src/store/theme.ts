
import { create } from 'zustand'

type ThemeState = { dark: boolean; toggle: () => void }

const initial = (() => {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('granite-notes-dark')
  if (saved != null) return saved === '1'
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
})()

export const useTheme = create<ThemeState>((set, get) => ({
  dark: initial,
  toggle: () => {
    const val = !get().dark
    set({ dark: val })
    try { localStorage.setItem('granite-notes-dark', val ? '1' : '0') } catch {}
  }
}))
