import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit')

const NAVY  = '#1e3a8a'
const BLUE  = '#2563eb'
const SLATE = '#64748b'
const LIGHT = '#f8fafc'
const GREEN = '#16a34a'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessaoId: string }> },
) {
  const { sessaoId } = await params
  console.log('[confirmacao/pdf] req sessaoId=%s', sessaoId)

  if (!/^[0-9a-f-]{36}$/i.test(sessaoId)) {
    console.warn('[confirmacao/pdf] ID inválido: %s', sessaoId)
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  let s: Record<string, string>
  try {
    const { rows } = await pool.query(
      `SELECT
         s.id, s.data_hora, s.duracao_min, s.valor,
         pac.nome        AS paciente_nome,
         psi.nome        AS psicologo_nome,
         psi.crp         AS psicologo_crp,
         psi.email       AS psicologo_email,
         psi.telefone    AS psicologo_telefone
       FROM sessoes s
       JOIN pacientes  pac ON pac.id = s.paciente_id
       JOIN psicologos psi ON psi.id = s.psicologo_id
       WHERE s.id = $1 AND s.deleted_at IS NULL`,
      [sessaoId],
    )
    if (!rows[0]) {
      console.warn('[confirmacao/pdf] sessão não encontrada: %s', sessaoId)
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 })
    }
    s = rows[0]
  } catch (err) {
    console.error('[confirmacao/pdf] erro DB:', err)
    return NextResponse.json({ error: 'Erro ao buscar sessão.' }, { status: 500 })
  }

  try {
    const dataHora     = new Date(s.data_hora)
    const dataFmt      = format(dataHora, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    const dataCapital  = dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1)
    const horaFmt      = format(dataHora, 'HH:mm', { locale: ptBR })
    const valorFmt     = Number(s.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const emitidoEm    = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    const codCurto     = sessaoId.split('-')[0].toUpperCase()

    const doc    = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'Confirmação de Consulta — PsiPlanner' } })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))

    // ── Cabeçalho ────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(NAVY)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22).text('PsiPlanner', 50, 28)
    doc.fillColor('#93c5fd').font('Helvetica').fontSize(11).text('Gestão inteligente para psicólogos', 50, 56)
    if (s.psicologo_nome) {
      doc.fillColor('#cbd5e1').font('Helvetica').fontSize(10)
         .text(`Consultório de ${s.psicologo_nome}`, 0, 58, { align: 'right', width: doc.page.width - 50 })
    }

    // ── Título ───────────────────────────────────────────────────────────────
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(18).text('Consulta Confirmada', 50, 110)
    doc.fillColor(SLATE).font('Helvetica').fontSize(10)
       .text(`Emitido em: ${emitidoEm}   ·   Cód. ${codCurto}`, 50, 134)

    // ── Card detalhes ─────────────────────────────────────────────────────────
    const cardY = 158
    doc.roundedRect(50, cardY, doc.page.width - 100, 150, 10).fill(LIGHT)
    doc.roundedRect(50, cardY, 6, 150, 3).fill(BLUE)

    function field(label: string, value: string, x: number, y: number, color = '#0f172a') {
      doc.fillColor(SLATE).font('Helvetica').fontSize(9).text(label.toUpperCase(), x, y)
      doc.fillColor(color).font('Helvetica-Bold').fontSize(12).text(value, x, y + 13)
    }

    const col1 = 70, col2 = 290
    field('Data',             dataCapital,                    col1, cardY + 18)
    field('Horario',          `${horaFmt} (Horario de Brasilia)`, col2, cardY + 18)
    field('Duracao',          `${s.duracao_min} minutos`,     col1, cardY + 70)
    field('Valor da sessao',  valorFmt,                       col2, cardY + 70, GREEN)
    field('Paciente',         s.paciente_nome || '—',         col1, cardY + 118)
    if (s.psicologo_nome) {
      const crpStr = s.psicologo_crp ? ` — CRP ${s.psicologo_crp}` : ''
      field('Profissional', `${s.psicologo_nome}${crpStr}`,   col2, cardY + 118)
    }

    // ── Aviso cancelamento ────────────────────────────────────────────────────
    doc.rect(50, cardY + 162, doc.page.width - 100, 38).fill('#fef9c3')
    doc.roundedRect(50, cardY + 162, 4, 38, 2).fill('#f59e0b')
    doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(9)
       .text('ATENCAO: Cancelamentos devem ser informados com ao menos 24h de antecedencia.', 62, cardY + 172)
    doc.fillColor('#92400e').font('Helvetica').fontSize(8.5)
       .text('Ausencias sem aviso implicam na cobranca integral da sessao.', 62, cardY + 184)

    // ── Divisor ───────────────────────────────────────────────────────────────
    const faqY = cardY + 220
    doc.moveTo(50, faqY).lineTo(doc.page.width - 50, faqY).stroke('#e2e8f0')
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(14)
       .text('Politicas de Agendamento e Cancelamento — FAQ', 50, faqY + 14)
    doc.fillColor(SLATE).font('Helvetica').fontSize(9)
       .text(
         'Este guia garante transparencia e compromisso mutuo no processo terapeutico. ' +
         'Ao reservarmos um horario, aquele periodo e dedicado exclusivamente a voce.',
         50, faqY + 34, { width: doc.page.width - 100 },
       )

    // ── Perguntas ─────────────────────────────────────────────────────────────
    const faqs = [
      {
        q: '1. Qual o prazo maximo para cancelar ou remarcar sem custo?',
        a: 'Voce pode cancelar ou remarcar com ate 24 horas de antecedencia, sem nenhuma cobranca. Cancelamentos feitos dentro deste prazo nao geram custo.',
      },
      {
        q: '2. O que acontece se eu cancelar com menos de 24 horas de antecedencia?',
        a: 'O valor integral da sessao sera cobrado. O horario ficou reservado exclusivamente para voce, impedindo que outro paciente pudesse ser atendido.',
      },
      {
        q: '3. E se eu simplesmente faltar sem avisar (No-show)?',
        a: 'A ausencia sem aviso implica na cobranca total da sessao. O compromisso terapeutico inclui o respeito ao tempo reservado e a disponibilidade do profissional.',
      },
      {
        q: '4. Existe tolerancia para atrasos?',
        a: 'Sim — tolerancia de 15 minutos. Porem, a sessao termina no horario original. Atrasos superiores a 15 minutos sem aviso podem ser considerados falta.',
      },
      {
        q: '5. E se eu tiver uma emergencia ou caso de forca maior?',
        a: 'Imprevistos graves (acidentes, internacoes) serao avaliados individualmente, com bom senso e consideracao pela relacao terapeutica.',
      },
      {
        q: '6. Como funcionam as faltas em atendimentos via convenio?',
        a: 'Planos de saude nao remuneram sessoes nao realizadas. Em caso de falta ou cancelamento tardio, o valor particular devera ser pago diretamente ao profissional.',
      },
      {
        q: '7. O que acontece se o psicologo precisar cancelar?',
        a: 'Voce sera avisado com a maior antecedencia possivel. A sessao sera reposta sem custos adicionais em horario conveniente, ou o valor sera abatido.',
      },
    ]

    let cy = faqY + 60
    for (const faq of faqs) {
      if (cy > doc.page.height - 120) { doc.addPage(); cy = 50 }
      doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(9.5)
         .text(faq.q, 50, cy, { width: doc.page.width - 100 })
      const qH = doc.heightOfString(faq.q, { width: doc.page.width - 100 })
      doc.fillColor('#334155').font('Helvetica').fontSize(9.5)
         .text(faq.a, 62, cy + qH + 3, { width: doc.page.width - 112 })
      const aH = doc.heightOfString(faq.a, { width: doc.page.width - 112 })
      cy += qH + aH + 16
    }

    // ── Rodape ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 60
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).stroke('#e2e8f0')
    doc.fillColor(SLATE).font('Helvetica').fontSize(8)
       .text(
         `PsiPlanner · psiplanner.com.br · Documento gerado em ${emitidoEm}`,
         50, footerY + 10, { align: 'center', width: doc.page.width - 100 },
       )
    if (s.psicologo_email || s.psicologo_telefone) {
      doc.fillColor(SLATE).font('Helvetica').fontSize(8)
         .text(
           [s.psicologo_email, s.psicologo_telefone].filter(Boolean).join('   ·   '),
           50, footerY + 22, { align: 'center', width: doc.page.width - 100 },
         )
    }

    doc.end()
    console.log('[confirmacao/pdf] PDF gerado sessaoId=%s', sessaoId)

    return new Promise<Response>((resolve) => {
      doc.on('end', () => {
        const pdf = Buffer.concat(chunks)
        resolve(
          new Response(pdf, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="consulta-${codCurto}.pdf"`,
              'Cache-Control': 'no-store',
            },
          }),
        )
      })
    })
  } catch (err) {
    console.error('[confirmacao/pdf] erro ao gerar PDF:', err)
    return NextResponse.json({ error: 'Erro ao gerar PDF.' }, { status: 500 })
  }
}
