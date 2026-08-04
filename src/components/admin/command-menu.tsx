'use client'

import { useEffect, useState } from 'react'
import {
  ExternalLink,
  FilePlus2,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Moon,
  Palette,
  Settings,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command'

const NAV = [
  { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { label: '文章管理', href: '/admin/posts', icon: FileText },
  { label: '内容管理', href: '/admin/content', icon: LayoutGrid },
  { label: '主题编辑器', href: '/admin/themes', icon: Palette },
  { label: '站点设置', href: '/admin/site', icon: Settings },
  { label: '资产库', href: '/admin/assets', icon: ImageIcon },
]

export function toggleAdminDark() {
  const html = document.documentElement
  const dark = html.classList.toggle('dark')
  try {
    localStorage.setItem('enlab:admin-theme', dark ? 'dark' : 'light')
  } catch {
    /* ignore */
  }
  return dark
}

export function isAdminDark(): boolean {
  try {
    return localStorage.getItem('enlab:admin-theme') === 'dark'
  } catch {
    return false
  }
}

export default function CommandMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const run = (fn: () => void) => {
    setOpen(false)
    setTimeout(fn, 80)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="输入命令或搜索页面…" />
      <CommandList>
        <CommandEmpty>没有找到匹配项</CommandEmpty>
        <CommandGroup heading="导航">
          {NAV.map((item) => (
            <CommandItem key={item.href} value={`导航 ${item.label}`} onSelect={() => run(() => (window.location.href = item.href))}>
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="快捷操作">
          <CommandItem value="动作 写新文章" onSelect={() => run(() => (window.location.href = '/admin/posts/new'))}>
            <FilePlus2 />
            写新文章
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem value="动作 切换深色模式" onSelect={() => run(toggleAdminDark)}>
            <Moon />
            切换深色模式
            <CommandShortcut>⌘⇧D</CommandShortcut>
          </CommandItem>
          <CommandItem value="动作 查看前台" onSelect={() => run(() => window.open('/', '_blank'))}>
            <ExternalLink />
            查看前台
          </CommandItem>
          <CommandItem
            value="动作 退出登录"
            onSelect={() =>
              run(async () => {
                await fetch('/admin/api/logout', { method: 'POST' })
                window.location.href = '/admin/login'
              })
            }
          >
            <LogOut />
            退出登录
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
