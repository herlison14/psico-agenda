'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Paciente } from '@/types/psico'
import { Plus, Search, Edit2, Users, X, Loader2, UserCheck, UserMinus, BookOpen } from 'lucide-react'

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

const EMPTY: Partial<Paciente> = {
  nome: '', cpf: '', email: '', telefone: '', valor_sessao: 150, ativo: true
}

export default function PacientesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Partial<Paciente>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  async function loadPacientes() {
    const res = await fetch('/api/pacientes')
    const data = await res.json()
    if (Array.isArray(data)) setPacientes(data)
    setLoading(false)
  }

  useEffect(() => { loadPacientes() }, [session])

  function openNew() { setForm(EMPTY); setEditId(null); setErro(''); setModalOpen(true) }
  function openEdit(p: Paciente) { setForm(p); setEditId(p.id); setErro(''); setModalOpen(true) }

  function handleChange(field: keyof Paciente, value: string | number | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome?.trim()) { setErro('Nome é obrigatório.'); return }
    setSaving(true)
    setErro('')

    try {
      const res = editId
        ? await fetch(`/api/pacientes/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/pacientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })

      if (!res.ok) {
        let errorMsg = 'Erro ao salvar.'
        try {
          const data = await res.json()
          errorMsg = data.error ?? errorMsg
        } catch { /* resposta não é JSON */ }
        setErro(errorMsg)
        return
      }
      setModalOpen(false)
      loadPacientes()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(p: Paciente) {
    await fetch(`/api/pacientes/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, ativo: !p.ativo }),
    })
    loadPacientes()
  }

  const filtrados = pacientes.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.email ?? '').toLowerCase().includes(busca.toLowerCase())
  )

  const inputClass = "w-full px-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none transition-all"
  const labelClass = "block text-sm font-medium text-[#3D5247] mb-1.5"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#EBF5EF] rounded-xl p-2.5">
            <Users className="w-5 h-5 text-[#2D6A52]" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1C2B22]" style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}>
              Pacientes
            </h1>
            <p className="text-sm text-[#7A8C82]">{pacientes.filter(p => p.ativo).length} ativos</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#1B3A2F] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#244D3F] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Novo paciente
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8BFB2]" strokeWidth={1.75} />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D4CFC6] rounded-xl text-sm text-[#1C2B22] placeholder:text-[#B0ABA3] focus:ring-2 focus:ring-[#5A9E7C] focus:border-[#5A9E7C] outline-none transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E3DB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E8E3DB] border-t-[#5A9E7C]" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-[#A8BFB2]">
            <Users className="w-10 h-10 mb-3 opacity-40" strokeWidth={1.5} />
            <p className="text-sm">{busca ? 'Nenhum resultado encontrado' : 'Nenhum paciente cadastrado'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDE7]">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#7A8C82] uppercase tracking-wide">Nome</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#7A8C82] uppercase tracking-wide hidden sm:table-cell">Telefone</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#7A8C82] uppercase tracking-wide hidden md:table-cell">E-mail</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#7A8C82] uppercase tracking-wide">Sessão</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-[#7A8C82] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE7]">
                {filtrados.map(p => (
                  <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-4 font-medium text-[#1C2B22]">{p.nome}</td>
                    <td className="px-5 py-4 text-[#7A8C82] hidden sm:table-cell">{p.telefone || '—'}</td>
                    <td className="px-5 py-4 text-[#7A8C82] hidden md:table-cell">{p.email || '—'}</td>
                    <td className="px-5 py-4 text-[#1C2B22] font-medium">
                      {Number(p.valor_sessao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleAtivo(p)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          p.ativo
                            ? 'bg-[#EBF5EF] text-[#2D6A52] hover:bg-[#D4EDDF]'
                            : 'bg-[#F5F0EB] text-[#9A8570] hover:bg-[#EDE6DC]'
                        }`}
                      >
                        {p.ativo
                          ? <><UserCheck className="w-3.5 h-3.5" strokeWidth={2} /> Ativo</>
                          : <><UserMinus className="w-3.5 h-3.5" strokeWidth={2} /> Inativo</>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/pacientes/${p.id}`)}
                          className="p-1.5 hover:bg-[#EBF5EF] rounded-lg text-[#7A8C82] hover:text-[#2D6A52] transition-colors"
                          title="Histórico clínico"
                        >
                          <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 hover:bg-[#EBF5EF] rounded-lg text-[#7A8C82] hover:text-[#2D6A52] transition-colors"
                          title="Editar paciente"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EDE7]">
              <h2 className="font-semibold text-[#1C2B22]">{editId ? 'Editar paciente' : 'Novo paciente'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#A8BFB2] hover:text-[#5A9E7C] transition-colors">
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome completo *</label>
                  <input
                    type="text"
                    value={form.nome ?? ''}
                    onChange={e => handleChange('nome', e.target.value)}
                    required
                    autoFocus
                    placeholder="Nome do paciente"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CPF</label>
                  <input
                    type="text"
                    value={form.cpf ?? ''}
                    onChange={e => handleChange('cpf', maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={form.telefone ?? ''}
                    onChange={e => handleChange('telefone', maskPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>E-mail</label>
                  <input
                    type="email"
                    value={form.email ?? ''}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="paciente@email.com"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Valor padrão da sessão (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#7A8C82]">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.valor_sessao ?? 150}
                      onChange={e => handleChange('valor_sessao', parseFloat(e.target.value))}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm">{erro}</div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm text-[#7A8C82] hover:bg-[#F5F0EB] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#1B3A2F] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#244D3F] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editId ? 'Salvar alterações' : 'Cadastrar paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
