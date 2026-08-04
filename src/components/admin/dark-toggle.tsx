'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { isAdminDark, toggleAdminDark } from './command-menu'

export default function DarkToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(isAdminDark())
  }, [])

  return (
    <button
      onClick={() => setDark(toggleAdminDark())}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label="切换深色模式"
      title="深色模式 (⌘⇧D)"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
