import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'

export function verificarAgenteApiKey(req: NextRequest): boolean {
  const apiKey = process.env.AGENTE_API_KEY
  if (!apiKey) return false

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const provided = authHeader.slice(7)
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(apiKey))
  } catch {
    return false
  }
}

export function getPsicologoId(): string {
  const id = process.env.PSICOLOGO_ID
  if (!id) throw new Error('PSICOLOGO_ID não configurado')
  return id
}
