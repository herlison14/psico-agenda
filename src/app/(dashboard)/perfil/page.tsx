'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Psicologo } from '@/types/psico'
import { Loader2, Save, UserCircle, CheckCircle2, Globe } from 'lucide-react'

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#e1306c">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const IconLinkedin = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#0077b5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

function maskCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

function maskCRP(v: string) {
  return v.replace(/[^\d/]/g, '')
}

export default function PerfilPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState<Partial<Psicologo>>({
    nome: '', crp: '', cpf: '', email: '', telefone: '', endereco: '', cidade: '', estado: '',
    instagram: '', linkedin: '', site_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/psicologos')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        if (data && typeof data === 'object' && !('error' in data)) {
          setForm(data)
        }
      })
      .catch(err => console.error('[GET /api/psicologos]', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [session])

  function handleChange(field: keyof Psicologo, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleMasked(field: keyof Psicologo, value: string, mask: (v: string) => string) {
    setForm(f => ({ ...f, [field]: mask(value) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErro('')
    setSucesso(false)

    const res = await fetch('/api/psicologos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      setErro('Erro ao salvar: ' + (data.error ?? 'Tente novamente.'))
    } else {
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#e2e8f0] border-t-[#3b82f6]" />
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all"
  const labelClass = "block text-sm font-medium text-[#334155] mb-1.5"

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#eff6ff] rounded-xl p-2.5">
          <UserCircle className="w-5 h-5 text-[#2563eb]" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#0f172a]" style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}>
            Meu Perfil
          </h1>
          <p className="text-sm text-[#64748b]">Dados profissionais exibidos nos recibos e página de agendamento</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Dados profissionais ── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-semibold text-[#0f172a] uppercase tracking-wide">Dados profissionais</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nome completo</label>
              <input
                type="text"
                value={form.nome ?? ''}
                onChange={e => handleChange('nome', e.target.value)}
                placeholder="Dr. João Silva"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>CRP</label>
              <input
                type="text"
                value={form.crp ?? ''}
                onChange={e => handleMasked('crp', e.target.value, maskCRP)}
                placeholder="06/123456"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>CPF</label>
              <input
                type="text"
                value={form.cpf ?? ''}
                onChange={e => handleMasked('cpf', e.target.value, maskCPF)}
                placeholder="000.000.000-00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>E-mail de contato</label>
              <input
                type="email"
                value={form.email ?? ''}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="contato@email.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Telefone / WhatsApp</label>
              <input
                type="text"
                value={form.telefone ?? ''}
                onChange={e => handleMasked('telefone', e.target.value, maskPhone)}
                placeholder="(11) 99999-9999"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Endereço do consultório</label>
              <input
                type="text"
                value={form.endereco ?? ''}
                onChange={e => handleChange('endereco', e.target.value)}
                placeholder="Rua das Flores, 123, Sala 4 — Jardim Paulista"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Cidade</label>
              <input
                type="text"
                value={form.cidade ?? ''}
                onChange={e => handleChange('cidade', e.target.value)}
                placeholder="São Paulo"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Estado (UF)</label>
              <input
                type="text"
                value={form.estado ?? ''}
                onChange={e => handleChange('estado', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="SP"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* ── Redes sociais ── */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-[#0f172a] uppercase tracking-wide">Redes sociais</h2>
            <p className="text-xs text-[#64748b] mt-1">Exibidas na sua página de agendamento para os pacientes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <IconInstagram />
                  Instagram
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm">@</span>
                <input
                  type="text"
                  value={form.instagram ?? ''}
                  onChange={e => handleChange('instagram', e.target.value.replace(/^@/, ''))}
                  placeholder="seuperfil"
                  className={inputClass + ' pl-7'}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <IconLinkedin />
                  LinkedIn
                </span>
              </label>
              <input
                type="url"
                value={form.linkedin ?? ''}
                onChange={e => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/seuperfil"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#2563eb]" />
                  Site / link pessoal
                </span>
              </label>
              <input
                type="url"
                value={form.site_url ?? ''}
                onChange={e => handleChange('site_url', e.target.value)}
                placeholder="https://seuconsultorio.com.br"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {sucesso && (
          <div className="flex items-center gap-2 bg-[#eff6ff] border border-[#93c5fd] text-[#2563eb] px-4 py-3 rounded-xl text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Perfil salvo com sucesso!
          </div>
        )}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{erro}</div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
            Salvar perfil
          </button>
        </div>
      </form>
    </div>
  )
}
