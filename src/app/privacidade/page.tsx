import Link from 'next/link'
import { Brain } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade — PsiPlanner',
  description: 'Como o PsiPlanner coleta, trata e protege seus dados pessoais conforme a LGPD.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#1e3a8a] rounded-xl p-2">
              <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-[#0f172a] font-semibold text-lg">PsiPlanner</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8 md:p-12 space-y-8 text-[#334155] leading-relaxed">
          <div>
            <h1 className="text-3xl font-semibold text-[#0f172a] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Política de Privacidade
            </h1>
            <p className="text-sm text-[#64748b]">Última atualização: maio de 2025 · Conforme Lei 13.709/2018 (LGPD)</p>
          </div>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">1. Controlador de Dados</h2>
            <p className="text-sm">
              O controlador dos dados pessoais tratados nesta plataforma é o desenvolvedor do PsiPlanner.
              Para exercer seus direitos ou esclarecer dúvidas:{' '}
              <a href="mailto:contato@psiplanner.com.br" className="text-[#2563eb] hover:underline">
                contato@psiplanner.com.br
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">2. Dados que Coletamos</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-[#0f172a] mb-1">Dados do profissional (Psicólogo):</p>
                <ul className="list-disc list-inside space-y-1 text-[#64748b]">
                  <li>Nome, e-mail, senha (armazenada com hash bcrypt)</li>
                  <li>CRP/CRM, CPF, telefone, endereço profissional</li>
                  <li>Redes sociais e site (opcionais)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-[#0f172a] mb-1">Dados dos pacientes (inseridos pelo profissional):</p>
                <ul className="list-disc list-inside space-y-1 text-[#64748b]">
                  <li>Nome, CPF, e-mail, telefone, valor de sessão</li>
                  <li>Registros de sessões, anotações e prontuários SOAP</li>
                  <li>Gravações de áudio (processadas e descartadas após transcrição)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-[#0f172a] mb-1">Dados de uso e técnicos:</p>
                <ul className="list-disc list-inside space-y-1 text-[#64748b]">
                  <li>Endereço IP (para rate limiting de segurança)</li>
                  <li>Logs de acesso e erros do servidor</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">3. Finalidade e Base Legal</h2>
            <div className="text-sm space-y-2">
              <p><strong>Execução do contrato</strong> (Art. 7º, V, LGPD): prestação do serviço contratado.</p>
              <p><strong>Legítimo interesse</strong> (Art. 7º, IX, LGPD): segurança, prevenção de fraudes, logs técnicos.</p>
              <p><strong>Consentimento</strong> (Art. 7º, I, LGPD): envio de comunicações e newsletters (opcional).</p>
              <p className="text-[#64748b] mt-2">
                Os dados de pacientes são tratados exclusivamente sob responsabilidade do profissional contratante,
                que atua como controlador independente dessas informações perante o titular (paciente).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">4. Compartilhamento de Dados</h2>
            <p className="text-sm mb-2">Compartilhamos dados apenas com os seguintes parceiros, estritamente necessários para o funcionamento:</p>
            <ul className="text-sm list-disc list-inside space-y-1.5 text-[#64748b]">
              <li><strong>Railway</strong> — hospedagem do banco de dados PostgreSQL (Brasil/EUA)</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação (EUA)</li>
              <li><strong>Asaas</strong> — processamento de pagamentos PIX (Brasil)</li>
              <li><strong>Groq / OpenAI</strong> — transcrição de áudio via Whisper (EUA) — áudios não são armazenados</li>
              <li><strong>Anthropic</strong> — geração de prontuários SOAP (EUA) — dados minimizados</li>
            </ul>
            <p className="text-sm text-[#64748b] mt-3">
              Não vendemos, alugamos ou compartilhamos dados pessoais com terceiros para fins comerciais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">5. Transferências Internacionais</h2>
            <p className="text-sm">
              Alguns dados são processados em servidores fora do Brasil (Vercel, Groq, Anthropic). Essas
              transferências ocorrem com garantias adequadas conforme o Art. 33 da LGPD e cláusulas contratuais
              padrão dos respectivos fornecedores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">6. Retenção de Dados</h2>
            <ul className="text-sm list-disc list-inside space-y-1.5">
              <li>Dados de conta: mantidos enquanto a conta estiver ativa.</li>
              <li>Dados de pacientes e sessões: mantidos enquanto o profissional mantiver conta ativa.</li>
              <li>Gravações de áudio: processadas em memória e descartadas imediatamente após transcrição.</li>
              <li>Logs técnicos: retidos por até 90 dias.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">7. Seus Direitos (LGPD)</h2>
            <p className="text-sm mb-3">Você tem os seguintes direitos sobre seus dados pessoais (Art. 18, LGPD):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {[
                ['Acesso', 'Solicitar cópia dos seus dados'],
                ['Correção', 'Corrigir dados incompletos ou incorretos'],
                ['Eliminação', 'Excluir sua conta e todos os dados (disponível no painel)'],
                ['Portabilidade', 'Exportar seus dados em formato estruturado'],
                ['Revogação', 'Retirar consentimento a qualquer momento'],
                ['Oposição', 'Opor-se a tratamentos baseados em legítimo interesse'],
              ].map(([titulo, desc]) => (
                <div key={titulo} className="bg-[#f8fafc] rounded-xl p-3">
                  <p className="font-medium text-[#0f172a] text-xs mb-0.5">{titulo}</p>
                  <p className="text-[#64748b] text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#64748b] mt-3">
              Para exercer esses direitos, acesse seu{' '}
              <Link href="/perfil" className="text-[#2563eb] hover:underline">painel de perfil</Link>{' '}
              ou envie um e-mail para{' '}
              <a href="mailto:contato@psiplanner.com.br" className="text-[#2563eb] hover:underline">
                contato@psiplanner.com.br
              </a>.
              Responderemos em até 15 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">8. Segurança</h2>
            <ul className="text-sm list-disc list-inside space-y-1.5">
              <li>Senhas armazenadas com hash bcrypt (fator 10)</li>
              <li>Tráfego criptografado via HTTPS/TLS</li>
              <li>Rate limiting para prevenção de força bruta</li>
              <li>Autenticação JWT com expiração de sessão</li>
              <li>Tokens de webhook validados por chave secreta</li>
              <li>Banco de dados em rede privada (Railway)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">9. Cookies</h2>
            <p className="text-sm">
              Utilizamos apenas cookies essenciais para manutenção da sessão de autenticação (JWT).
              Não utilizamos cookies de rastreamento ou analytics de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-3">10. Contato e DPO</h2>
            <p className="text-sm">
              Para questões sobre privacidade ou para exercer seus direitos:{' '}
              <a href="mailto:contato@psiplanner.com.br" className="text-[#2563eb] hover:underline">
                contato@psiplanner.com.br
              </a>
            </p>
          </section>

          <div className="pt-4 border-t border-[#f1f5f9]">
            <div className="flex gap-4">
              <Link href="/termos" className="text-sm text-[#2563eb] hover:underline">
                Termos de Uso
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
