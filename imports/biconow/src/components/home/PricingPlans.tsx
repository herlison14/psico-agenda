import { motion, AnimatePresence } from 'motion/react';
import { Check, ShieldCheck, Zap, Star, Crown, X, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Básico',
    price: 'Grátis',
    desc: 'Ideal para quem está começando agora.',
    features: [
      'Até 3 bicos ativos por mês',
      'Suporte via e-mail',
      'Perfil verificado básico',
      'Chat com clientes'
    ],
    button: 'Começar Grátis',
    highlight: false
  },
  {
    name: 'Pro Plus',
    price: 'R$ 9,90',
    period: '/mês',
    desc: 'Para quem quer viver de bicos.',
    features: [
      'Bicos ilimitados',
      'Destaque no mapa da região',
      'Selo de Verificação Premium',
      'Sem taxas de serviço (0%)',
      'Prioridade no suporte 24/7'
    ],
    button: 'Seja Pro Plus',
    highlight: true,
    icon: Star
  },
  {
    name: 'Elite',
    price: 'R$ 19,90',
    period: '/mês',
    desc: 'Empresas e equipes de alta performance.',
    features: [
      'Tudo do Pro Plus',
      'Painel de gestão de equipe',
      'Relatórios de faturamento',
      'Consultoria de marketing local',
      'Ads inclusos no BicoNow'
    ],
    button: 'Seja Elite',
    highlight: false,
    icon: Crown
  }
];

export default function PricingPlans() {
  const [showMobilePlans, setShowMobilePlans] = useState(false);

  return (
    <section id="planos" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-brand-accent/5 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full mb-6">
            <Zap className="w-4 h-4 text-brand-accent fill-brand-accent" />
            <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">Planos Profissionais</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-6">Potencialize seu <span className="text-brand-accent">trabalho.</span></h2>
          <p className="text-brand-primary/60 max-w-2xl mx-auto text-lg leading-relaxed">
            Escolha o plano que melhor se adapta ao seu momento e comece a escalar seus ganhos hoje.
          </p>

          {/* Mobile Quick Trigger */}
          <div className="mt-10 lg:hidden">
            <button 
              onClick={() => setShowMobilePlans(true)}
              className="w-full py-6 px-8 bg-brand-primary text-white rounded-[32px] font-black text-lg flex items-center justify-between shadow-2xl shadow-brand-primary/20 group"
            >
              <span>Ver Planos Profissionais</span>
              <div className="w-10 h-10 bg-brand-accent rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChevronRight className="w-6 h-6" />
              </div>
            </button>
            <p className="mt-4 text-sm font-bold text-brand-accent">Planos a partir de R$ 9,90/mês</p>
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-center">
          {PLANS.map((plan, idx) => (
            <div key={idx} className={cn(
              "relative p-10 rounded-[50px] transition-all duration-500",
              plan.highlight 
                ? "bg-brand-primary text-white shadow-2xl shadow-brand-accent/40 scale-105 z-10" 
                : "bg-brand-surface text-brand-primary border border-brand-primary/5 hover:border-brand-accent/20"
            )}>
              {/* Plan Card Content ... */}
              {plan.highlight && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-accent text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                  Mais Popular
                </div>
              )}

              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  {plan.icon && <plan.icon className={cn("w-6 h-6", plan.highlight ? "text-brand-accent" : "text-brand-primary/40")} />}
                  <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-black">{plan.price}</span>
                  {plan.period && <span className={cn("text-lg", plan.highlight ? "text-white/40" : "text-brand-primary/40")}>{plan.period}</span>}
                </div>
                <p className={cn("mt-4 text-sm leading-relaxed", plan.highlight ? "text-white/60" : "text-brand-primary/50")}>
                  {plan.desc}
                </p>
              </div>

              <div className="space-y-5 mb-12">
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-4">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                      plan.highlight ? "bg-white/10" : "bg-brand-accent/10"
                    )}>
                      <Check className={cn("w-4 h-4", plan.highlight ? "text-brand-accent text-white" : "text-brand-accent")} />
                    </div>
                    <span className={cn("text-sm font-medium", plan.highlight ? "text-white/80" : "text-brand-primary/80")}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button className={cn(
                "w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all",
                plan.highlight 
                  ? "bg-brand-accent text-white hover:bg-brand-accent/90 shadow-xl shadow-brand-accent/20" 
                  : "bg-brand-primary text-white hover:scale-[1.02]"
              )}>
                {plan.button}
              </button>
            </div>
          ))}
        </div>

        {/* Mobile Modal/Box view */}
        <AnimatePresence>
          {showMobilePlans && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-brand-primary/80 backdrop-blur-md p-4"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-t-[48px] sm:rounded-[48px] p-8 md:p-12 overflow-y-auto relative shadow-2xl"
              >
                <div className="sticky top-0 right-0 z-20 flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md pb-4 pt-2 -mt-4">
                  <h3 className="text-2xl font-black tracking-tight">Nossos Planos</h3>
                  <button 
                    onClick={() => setShowMobilePlans(false)}
                    className="p-3 bg-brand-surface rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid gap-6">
                  {PLANS.map((plan, idx) => (
                    <div key={idx} className={cn(
                      "p-8 rounded-[40px] border",
                      plan.highlight ? "bg-brand-primary text-white border-brand-accent/30 shadow-xl" : "bg-brand-surface border-brand-primary/5"
                    )}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-xl font-black mb-1">{plan.name}</h4>
                          <p className={cn("text-xs", plan.highlight ? "text-white/60" : "text-brand-primary/40 text-xs font-bold uppercase tracking-widest")}>
                            {plan.desc}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black">{plan.price}</p>
                          {plan.period && <p className={cn("text-[10px] font-bold uppercase", plan.highlight ? "text-white/40" : "text-brand-primary/30")}>{plan.period}</p>}
                        </div>
                      </div>
                      <div className="grid gap-3 mb-8">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-brand-accent flex-shrink-0" />
                            <span className="text-xs font-medium">{f}</span>
                          </div>
                        ))}
                      </div>
                      <button className={cn(
                        "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest",
                        plan.highlight ? "bg-brand-accent text-white" : "bg-brand-primary text-white"
                      )}>
                        {plan.button}
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verification Info */}
        <div className="mt-32 p-12 bg-brand-surface rounded-[60px] border border-brand-primary/5 relative overflow-hidden lg:block hidden">
          <div className="absolute top-0 right-0 p-8">
            <ShieldCheck className="w-32 h-32 text-brand-primary/5 -rotate-12" />
          </div>
          <div className="lg:flex items-center gap-20 relative z-10">
            <div className="lg:w-2/3 mb-10 lg:mb-0">
              <h3 className="text-3xl font-black mb-6">Selo de Confiança BicoNow</h3>
              <p className="text-brand-primary/60 text-lg leading-relaxed mb-8">
                Para garantir a segurança de todos, cada profissional passa por um rigoroso processo de **Verificação de Identidade**. Analisamos documentos, antecedentes e histórico de serviços antes de conceder o selo.
              </p>
              <div className="flex flex-wrap gap-6">
                {[
                  'Consulta CPF/CNPJ',
                  'Ficha Criminal',
                  'Certificados Técnicos',
                  'Fotos Reais'
                ].map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-brand-primary/5">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold text-brand-primary/70">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-brand-primary p-8 rounded-[40px] text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/40">
                    <Check className="w-8 h-8 text-white stroke-[3px]" />
                  </div>
                  <div>
                    <p className="font-black text-xl italic uppercase tracking-tighter">Pro Verificado</p>
                    <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Identidade Confirmada</p>
                  </div>
                </div>
                <p className="text-sm text-white/60 mb-6 italic">"O selo aumentou minhas contratações em mais de 300% no primeiro mês."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1540569014015-19a7ee504e3a?auto=format&fit=crop&q=80&w=100" />
                  </div>
                  <p className="text-xs font-bold">Fernando Lima, Eletricista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
