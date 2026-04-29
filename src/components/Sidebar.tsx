'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Users, FileText,
  DollarSign, UserCircle, LogOut, Menu, X, Brain, Zap,
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
  const [plano, setPlano] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/psicologos')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.plano) setPlano(d.plano) })
      .catch(() => null)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (pathname === '/agenda' || pathname.startsWith('/agenda/')) {
      setNovasSessoes(0)
    }
  }, [pathname])

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
      <div className="flex items-center gap-3 px-6 py-7 border-b border-white/10">
        <div className="bg-[#3b82f6] rounded-xl p-2 shadow-inner">
          <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-white font-semibold text-base leading-tight tracking-wide">
            PsiPlanner
          </p>
          <p className="text-[#93c5fd] text-xs font-light mt-0.5">Gestão em saúde</p>
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
                  ? 'bg-[#3b82f6] text-white shadow-sm'
                  : 'text-[#93c5fd] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="bg-[#3b82f6] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {novasSessoes}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade / Plano */}
      <div className="px-4 pb-3">
        {plano === 'pro' ? (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10">
            <Zap className="w-4 h-4 text-[#fbbf24] shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium text-[#fbbf24]">Plano Pro ativo</span>
          </div>
        ) : (
          <Link
            href="/planos"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors"
          >
            <Zap className="w-4 h-4 shrink-0" strokeWidth={2} />
            Assinar Pro — R$ 50/mês
          </Link>
        )}
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[#93c5fd] hover:bg-white/10 hover:text-white transition-all duration-150"
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
        className="fixed top-4 left-4 z-40 lg:hidden bg-[#1e3a8a] text-[#93c5fd] p-2.5 rounded-xl shadow-md"
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
        className={`fixed top-0 left-0 h-full w-64 bg-[#1e3a8a] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-[#93c5fd] hover:text-white transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e3a8a] shrink-0 h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  )
}
