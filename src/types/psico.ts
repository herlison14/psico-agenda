export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused'

export interface Psicologo {
  id: string
  nome: string | null
  crp: string | null
  cpf: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  // assinatura
  subscription_status: SubscriptionStatus | null
  trial_start_date: string | null
  trial_end_date: string | null
  current_period_start: string | null
  current_period_end: string | null
  mercado_pago_customer_id: string | null
  mercado_pago_subscription_id: string | null
  // legado (manter compatibilidade com DB atual)
  plano: string | null
  trial_fim: string | null
  created_at: string
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'canceled' | 'refunded'
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto'

export interface Payment {
  id: string
  psicologo_id: string
  mercado_pago_payment_id: string | null
  amount_brl: number
  currency: string
  status: PaymentStatus
  payment_method: PaymentMethod | null
  charge_date: string
  paid_date: string | null
  created_at: string
}

export interface Paciente {
  id: string
  psicologo_id: string
  nome: string
  cpf: string | null
  email: string | null
  telefone: string | null
  valor_sessao: number
  ativo: boolean
  created_at: string
}

export interface Sessao {
  id: string
  psicologo_id: string
  paciente_id: string
  data_hora: string
  duracao_min: number
  valor: number
  status: 'agendado' | 'realizado' | 'cancelado' | 'faltou'
  observacoes: string | null
  notas_clinicas: string | null
  created_at: string
  paciente?: Paciente
}

export interface Recibo {
  id: string
  psicologo_id: string
  paciente_id: string
  sessao_id: string | null
  numero: number
  data_emissao: string
  valor: number
  descricao: string
  created_at: string
  paciente?: Paciente
}
