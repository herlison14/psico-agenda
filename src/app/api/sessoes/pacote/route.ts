/**
 * POST /api/sessoes/pacote
 * Cria múltiplas sessões de uma vez (pacote terapêutico).
 * Usado pela JULY após confirmação do paciente.
 */
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: NextRequest) {
  let body: {
    psicologo_id: string
    paciente_id: string
    primeira_sessao_utc: string  // ISO 8601 UTC da primeira sessão
    quantidade: number           // ex: 4, 8, 12
    intervalo_dias: number       // ex: 7 (semanal), 14 (quinzenal), 30 (mensal)
    duracao_min?: number
    valor: number
    observacoes?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const {
    psicologo_id, paciente_id, primeira_sessao_utc,
    quantidade, intervalo_dias, duracao_min = 50, valor, observacoes,
  } = body

  if (!psicologo_id || !paciente_id || !primeira_sessao_utc || !quantidade || !intervalo_dias || !valor) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
  }

  if (quantidade < 1 || quantidade > 52) {
    return NextResponse.json({ error: 'Quantidade deve ser entre 1 e 52.' }, { status: 400 })
  }

  const dt0 = new Date(primeira_sessao_utc)
  if (isNaN(dt0.getTime())) {
    return NextResponse.json({ error: 'primeira_sessao_utc inválido.' }, { status: 400 })
  }

  // Verifica que psicologo_id e paciente_id são válidos
  const { rows: pacRows } = await pool.query(
    'SELECT id FROM pacientes WHERE id = $1 AND psicologo_id = $2 AND ativo = true',
    [paciente_id, psicologo_id],
  )
  if (!pacRows[0]) {
    return NextResponse.json({ error: 'Paciente não encontrado.' }, { status: 404 })
  }

  // Gera datas das sessões
  const datas: Date[] = []
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(dt0.getTime() + i * intervalo_dias * 86_400_000)
    datas.push(d)
  }

  // Verifica conflitos
  const placeholders = datas.map((_, i) => `$${i + 2}`).join(', ')
  const { rows: conflitos } = await pool.query(
    `SELECT data_hora FROM sessoes
     WHERE psicologo_id = $1 AND status = 'agendado' AND deleted_at IS NULL
       AND data_hora IN (${placeholders})`,
    [psicologo_id, ...datas.map(d => d.toISOString())],
  )

  if (conflitos.length > 0) {
    const ocupados = conflitos.map(r =>
      new Date(r.data_hora).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      }),
    ).join(', ')
    return NextResponse.json({ error: `Conflitos de horário: ${ocupados}` }, { status: 409 })
  }

  // Insere todas as sessões em uma única transação
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const sessoesCriadas: { id: string; data_hora: string }[] = []

    for (const dt of datas) {
      const { rows } = await client.query(
        `INSERT INTO sessoes (psicologo_id, paciente_id, data_hora, duracao_min, valor, observacoes, status, pagamento_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'agendado', 'pendente')
         RETURNING id, data_hora`,
        [psicologo_id, paciente_id, dt.toISOString(), duracao_min, valor, observacoes || null],
      )
      sessoesCriadas.push(rows[0])
    }

    await client.query('COMMIT')

    const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://psiplanner.com.br').replace(/\/$/, '')
    const confirmacaoUrl = `${baseUrl}/api/confirmacao/${sessoesCriadas[0].id}`

    console.log('[pacote] %d sessões criadas para psicologo=%s paciente=%s', quantidade, psicologo_id, paciente_id)

    return NextResponse.json({
      ok: true,
      quantidade: sessoesCriadas.length,
      sessoes: sessoesCriadas.map(s => ({
        id: s.id,
        data_hora: new Date(s.data_hora).toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        }),
      })),
      confirmacao_url: confirmacaoUrl,
    }, { status: 201 })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('[pacote] erro ao criar sessões:', err)
    return NextResponse.json({ error: 'Erro ao criar pacote de sessões.' }, { status: 500 })
  } finally {
    client.release()
  }
}
