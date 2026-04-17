'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Psicologo } from '@/types/psico'
import { Loader2, Save, UserCircle, CheckCircle2 } from 'lucide-react'

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
  const d = v.replace(/[^\d/]/g, '')
  return d
}

export default function PerfilPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState<Partial<Psicologo>>({
    nome: '', crp: '', cpf: '', email: '', telefone: '', endereco: '', cidade: '', estado: ''
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
        } else {
          setForm(f => ({ ...f, email: session?.user?.email ?? '' }))
        }
      })
      .catch(err => {
        console.error('[GET /api/psicologos]', err)
        if (!cancelled) setForm(f => ({ ...f, email: session?.user?.email ?? '' }))
      })
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E8E3DB] border-t-[#5A9E7C]" />
      </div>
    )
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none transition-all"
  const labelClass = "block text-sm font-medium text-[#3D5247] mb-1.5"

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#EBF5EF] rounded-xl p-2.5">
          <UserCircle className="w-5 h-5 text-[#2D6A52]" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#1C2B22]" style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}>
            Meu Perfil
          </h1>
          <p className="text-sm text-[#7A8C82]">Dados profissionais exibidos nos recibos</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-[#E8E3DB] p-6 shadow-sm space-y-5">
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
            <label className={labelClass}>E-mail</label>
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

        {sucesso && (
          <div className="flex items-center gap-2 bg-[#EBF5EF] border border-[#A8D5BC] text-[#2D6A52] px-4 py-3 rounded-xl text-sm">
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
            className="flex items-center gap-2 bg-[#1B3A2F] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#244D3F] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={1.75} />}
            Salvar perfil
          </button>
        </div>
      </form>
    </div>
  )
}
