'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'blogeletricista-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      document.documentElement.setAttribute('data-theme', stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return <>{children}</>
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem(STORAGE_KEY, next)
}
