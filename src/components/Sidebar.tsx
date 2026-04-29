'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Users, FileText,
  DollarSign, UserCircle, LogOut, Menu, X, Brain, Zap, Clock,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { QRCodeSVG } from 'qrcode.react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, badge: true },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/recibos', label: 'Recibos', icon: FileText },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/perfil', label: 'Meu Perfil', icon: UserCircle },
]

const PLANOS_URL = 'https://www.psiplanner.com.br/planos'

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [novasSessoes, setNovasSessoes] = useState(0)
  const [plano, setPlano] = useState<string | null>(null)
  const [trialFim, setTrialFim] = useState<Date | null>(null)

  // Carrega plano e trial_fim
  useEffect(() => {
    fetch('/api/psicologos')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        if (d.plano) setPlano(d.plano)
        if (d.trial_fim) setTrialFim(new Date(d.trial_fim))
      })
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

  // Calcula dias restantes do trial (arredonda para cima)
  const diasRestantes = trialFim
    ? Math.max(0, Math.ceil((trialFim.getTime() - Date.now()) / 86_400_000))
    : null

  // Cores do timer conforme urgência
  const timerColor =
    diasRestantes === null ? ''
    : diasRestantes <= 2  ? 'text-red-400 border-red-500/40 bg-red-500/10'
    : diasRestantes <= 5  ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
    : 'text-[#93c5fd] border-white/10 bg-white/5'

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-white/10 shrink-0">
        <div className="bg-[#3b82f6] rounded-xl p-2 shadow-inner">
          <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-white font-semibold text-base leading-tight tracking-wide">PsiPlanner</p>
          <p className="text-[#93c5fd] text-xs font-light mt-0.5">Gestão em saúde</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-4 py-5 space-y-1">
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

      {/* Card de trial + QR code (só para não-pro) */}
      {plano !== 'pro' && diasRestantes !== null && (
        <div className="px-4 pb-4">
          <Link href="/planos" className="block group">
            <div className={`rounded-2xl border p-4 transition-all group-hover:brightness-110 ${timerColor}`}>
              {/* Timer */}
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {diasRestantes === 0
                    ? 'Trial expirado'
                    : diasRestantes === 1
                    ? '1 dia restante'
                    : `${diasRestantes} dias restantes`}
                </span>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-3">
                <div className="bg-white rounded-xl p-2 shadow-sm">
                  <QRCodeSVG
                    value={PLANOS_URL}
                    size={112}
                    bgColor="#ffffff"
                    fgColor="#1e3a8a"
                    level="M"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                  Renove aqui
                </p>
                <p className="text-[10px] opacity-60 mt-0.5">
                  Aponte a câmera ou clique
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Badge Pro */}
      {plano === 'pro' && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10">
            <Zap className="w-4 h-4 text-[#fbbf24] shrink-0" strokeWidth={2} />
            <span className="text-sm font-medium text-[#fbbf24]">Plano Pro ativo</span>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10 mt-auto shrink-0">
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
