'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserCircle, Users, Link2, Check, X, ChevronRight } from 'lucide-react'

const STORAGE_KEY = 'onboarding_dismissed'

interface Step {
  icon: React.ElementType
  title: string
  description: string
  cta: string
  href: string
  done: boolean
}

interface Props {
  semPerfil: boolean
  semPacientes: boolean
  userId: string | undefined
}

export function OnboardingModal({ semPerfil, semPacientes, userId }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === '1'
  })

  const steps: Step[] = [
    {
      icon: UserCircle,
      title: 'Complete seu perfil',
      description: 'Adicione nome, CRP e informações de contato para gerar PDFs completos.',
      cta: 'Ir para Perfil',
      href: '/perfil',
      done: !semPerfil,
    },
    {
      icon: Users,
      title: 'Cadastre seu primeiro paciente',
      description: 'Adicione os dados do paciente para poder agendar sessões.',
      cta: 'Ir para Pacientes',
      href: '/pacientes',
      done: !semPacientes,
    },
    {
      icon: Link2,
      title: 'Compartilhe seu link de agendamento',
      description: 'Envie seu link personalizado para os pacientes agendarem online.',
      cta: 'Ver no Dashboard',
      href: '/dashboard',
      done: !!userId && false, // always actionable
    },
  ]

  const allDone = steps.every(s => s.done)

  if (dismissed || allDone) return null

  const completedCount = steps.filter(s => s.done).length

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-8 py-7 text-white">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            aria-label="Fechar onboarding"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-1">Bem-vindo ao PsiPlanner!</div>
          <h2 className="text-xl font-bold mb-2">Vamos configurar sua conta 🚀</h2>
          <p className="text-sm text-indigo-200">
            {completedCount} de {steps.length} etapas concluídas
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-indigo-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="px-8 py-6 space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={i}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                  step.done
                    ? 'border-green-100 bg-green-50'
                    : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <div className={`rounded-xl p-2.5 shrink-0 ${step.done ? 'bg-green-100' : 'bg-indigo-100'}`}>
                  {step.done
                    ? <Check className="w-5 h-5 text-green-600" />
                    : <Icon className="w-5 h-5 text-indigo-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${step.done ? 'text-green-700' : 'text-[#0f172a]'}`}>
                    {step.done ? <s className="text-green-600">{step.title}</s> : step.title}
                  </p>
                  {!step.done && (
                    <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{step.description}</p>
                  )}
                </div>
                {!step.done && (
                  <Link
                    href={step.href}
                    onClick={dismiss}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {step.cta} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        <div className="px-8 pb-6">
          <button
            onClick={dismiss}
            className="w-full text-center text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors py-2"
          >
            Pular por agora — posso fazer isso depois
          </button>
        </div>
      </div>
    </div>
  )
}
