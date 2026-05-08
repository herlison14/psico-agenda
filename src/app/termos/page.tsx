import Link from 'next/link'
import { Brain } from 'lucide-react'

export const metadata = {
  title: 'Termos de Uso — PsiPlanner',
  description: 'Termos de Uso e condições do serviço PsiPlanner.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#1e3a8a] rounded-xl p-2">
              <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-[#0f172a] font-semibold text-lg">PsiPlanner</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 md:p-12 space-y-8 text-[#334155] leading-relaxed">
          <div>
            <h1 className="text-3xl font-semibold text-[#0f172a] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Termos de Uso
            </h1>
            <p className="text-sm text-[#64748b]">Última atualização: maio de 2025</p>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. Aceitação dos Termos</h2>
            <p className="text-sm">
              Ao criar uma conta ou utilizar o PsiPlanner, você concorda com estes Termos de Uso e com
              nossa Política de Privacidade. Caso não concorde, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Descrição do Serviço</h2>
            <p className="text-sm">
              O PsiPlanner é uma plataforma SaaS destinada exclusivamente a profissionais de saúde mental
              legalmente habilitados (psicólogos, psiquiatras, terapeutas), para gestão de agenda, pacientes,
              financeiro e geração de prontuários auxiliares. O serviço <strong>não substitui</strong> o
              prontuário clínico oficial exigido pelos conselhos profissionais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. Cadastro e Conta</h2>
            <ul className="text-sm list-disc list-inside space-y-1.5">
              <li>Você deve ter 18 anos ou mais e ser profissional de saúde habilitado.</li>
              <li>Você é responsável pela confidencialidade da sua senha.</li>
              <li>Notifique-nos imediatamente sobre qualquer uso não autorizado da sua conta.</li>
              <li>O trial gratuito tem duração de 7 dias. Após esse período, é necessário assinar o plano Pro.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. Assinatura e Pagamento</h2>
            <p className="text-sm">
              O plano Pro custa R$ 50,00/mês, cobrado via PIX. O acesso é liberado após a confirmação do
              pagamento. Você pode cancelar a qualquer momento pelo painel, mantendo acesso até o fim do
              período já pago. Não realizamos reembolso parcial de períodos em curso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. Uso Adequado</h2>
            <p className="text-sm mb-3">É <strong>vedado</strong> utilizar o PsiPlanner para:</p>
            <ul className="text-sm list-disc list-inside space-y-1.5">
              <li>Armazenar dados de pacientes sem seu consentimento informado.</li>
              <li>Compartilhar acesso à conta com terceiros não autorizados.</li>
              <li>Realizar engenharia reversa, scraping ou extração automatizada de dados.</li>
              <li>Qualquer atividade ilegal ou que viole o Código de Ética Profissional.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. Funcionalidades de Inteligência Artificial</h2>
            <p className="text-sm">
              O PsiPlanner oferece transcrição de sessões e geração auxiliar de prontuários SOAP via IA.
              Esses conteúdos são <strong>sugestões auxiliares</strong> e devem ser revisados pelo profissional
              antes de qualquer uso clínico. O PsiPlanner não se responsabiliza por decisões clínicas baseadas
              exclusivamente em saídas de IA.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Disponibilidade e Manutenção</h2>
            <p className="text-sm">
              Buscamos disponibilidade contínua, mas não garantimos 100% de uptime. Podemos realizar
              manutenções programadas com aviso prévio. Não nos responsabilizamos por perdas decorrentes
              de indisponibilidades temporárias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Propriedade Intelectual</h2>
            <p className="text-sm">
              Todo o código, design, marca e conteúdo do PsiPlanner são de propriedade do desenvolvedor.
              Os dados inseridos por você (pacientes, sessões, financeiro) pertencem a você. Não reivindicamos
              propriedade sobre seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Limitação de Responsabilidade</h2>
            <p className="text-sm">
              O PsiPlanner é fornecido &quot;como está&quot;. Em nenhuma hipótese seremos responsáveis por danos
              indiretos, incidentais ou lucros cessantes decorrentes do uso ou incapacidade de uso do serviço,
              até o limite do valor pago nos últimos 3 meses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">10. Rescisão</h2>
            <p className="text-sm">
              Podemos suspender ou encerrar sua conta em caso de violação destes termos. Você pode
              excluir sua conta a qualquer momento pelo painel de perfil, exercendo seu direito de
              esquecimento conforme a LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">11. Alterações nos Termos</h2>
            <p className="text-sm">
              Podemos atualizar estes Termos periodicamente. Notificaremos por e-mail com pelo menos
              15 dias de antecedência. O uso continuado após a vigência constitui aceite das alterações.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">12. Foro e Legislação Aplicável</h2>
            <p className="text-sm">
              Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da Comarca de
              São Paulo/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro.
            </p>
          </section>

          <div className="pt-4 border-t border-[#f1f5f9]">
            <p className="text-sm text-[#64748b]">
              Dúvidas? Entre em contato:{' '}
              <a href="mailto:contato@psiplanner.com.br" className="text-[#2563eb] hover:underline">
                contato@psiplanner.com.br
              </a>
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/privacidade" className="text-sm text-[#2563eb] hover:underline">
                Política de Privacidade
              </Link>
              <Link href="/login" className="text-sm text-[#64748b] hover:underline">
                Voltar ao login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
