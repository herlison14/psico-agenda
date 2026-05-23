import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Máscaras de input ──────────────────────────────────────────────────────
export function maskCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

// ── Fetch helper com tratamento de erro ───────────────────────────────────
/** Faz fetch e retorna o JSON tipado, ou null se a requisição falhar. */
export async function safeJson<T = unknown>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

// ── Status de sessões ─────────────────────────────────────────────────────
export const SESSION_STATUS_BADGE: Record<string, string> = {
  realizado: 'bg-[#eff6ff] text-[#2563eb]',
  agendado:  'bg-blue-50 text-blue-700',
  cancelado: 'bg-red-50 text-red-700',
  faltou:    'bg-orange-50 text-orange-700',
}

export const SESSION_STATUS_LABEL: Record<string, string> = {
  realizado: 'Realizado',
  agendado:  'Agendado',
  cancelado: 'Cancelado',
  faltou:    'Faltou',
}

// ── Formatação ─────────────────────────────────────────────────────────────
export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

