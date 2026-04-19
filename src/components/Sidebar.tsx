'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  DollarSign,
  UserCircle,
  LogOut,
  Menu,
  X,
  Leaf,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, badge: true },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/recibos', label: 'Recibos', icon: FileText },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/perfil', label: 'Meu Perfil', icon: UserCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [novasSessoes, setNovasSessoes] = useState(0)

  useEffect(() => { setOpen(false) }, [pathname])

  // Quando o usuário abre a agenda, zera o badge
  useEffect(() => {
    if (pathname === '/agenda' || pathname.startsWith('/agenda/')) {
      setNovasSessoes(0)
    }
  }, [pathname])

  // Verifica novas sessões a cada 30s
  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch('/api/sessoes/novas')
        if (res.ok) {
          const data = await res.json()
          if (!pathname.startsWith('/agenda')) setNovasSessoes(data.count ?? 0)
        }
      } catch { /* silencioso */ }
    }
    verificar()
    const interval = setInterval(verificar, 30_000)
    return () => clearInterval(interval)
  }, [pathname])

  async function handleLogout() {
    await signOut({ callbackUrl: '/login' })
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-[#244D3F]">
        <div className="bg-[#5A9E7C] rounded-xl p-2 shadow-inner">
          <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-white font-semibold text-base leading-tight tracking-wide">
            PsiPlanner
          </p>
          <p className="text-[#A8D5BC] text-xs font-light mt-0.5">Gestão psicológica</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const showBadge = badge && novasSessoes > 0 && !active
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#5A9E7C] text-white shadow-sm'
                  : 'text-[#A8D5BC] hover:bg-[#244D3F] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="bg-[#5A9E7C] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {novasSessoes}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-5 border-t border-[#244D3F]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#A8D5BC] hover:bg-[#244D3F] hover:text-white transition-all duration-150"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-[#1B3A2F] text-[#A8D5BC] p-2.5 rounded-xl shadow-md"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1B3A2F] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-[#A8D5BC] hover:text-white transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1B3A2F] shrink-0 h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  )
}
