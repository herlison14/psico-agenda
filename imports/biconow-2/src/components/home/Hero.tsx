import { motion } from 'motion/react';
import { Search, MapPin, Star, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand-accent/5 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest rounded-full">
                #1 Marketplace de Serviços
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs font-semibold ml-1">4.9/5 Nota de Confiança</span>
              </div>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight leading-[0.9] mb-6">
              Tem um <span className="text-brand-accent">Bico?</span><br />
              Ache ajuda <span className="underline decoration-brand-accent/30 underline-offset-8">Agora.</span>
            </h1>
            
            <p className="text-lg text-brand-primary/60 max-w-lg mb-8 leading-relaxed">
              Conecte-se com milhares de profissionais verificados no seu bairro. De encanamento a aulas de violão — nós te ajudamos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex-[2] flex items-center bg-white border border-brand-primary/10 rounded-2xl p-2 shadow-xl shadow-brand-primary/5 focus-within:ring-2 ring-brand-accent/20 transition-all">
                <div className="flex-1 flex items-center px-4 border-r border-brand-primary/10">
                  <Search className="w-5 h-5 text-brand-primary/40 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Conserto de máquina de lavar..." 
                    className="bg-transparent border-none text-sm font-medium w-full focus:outline-none"
                  />
                </div>
                <div className="hidden sm:flex items-center px-4 w-40">
                  <MapPin className="w-4 h-4 text-brand-primary/40 mr-2" />
                  <span className="text-sm font-medium text-brand-primary/60 truncate">Centro</span>
                </div>
                <button className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-all">
                  Buscar
                </button>
              </div>
              <button className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-accent/20">
                <ShieldCheck className="w-5 h-5" />
                Postar um Bico
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[
                { icon: ShieldCheck, label: 'Pros Verificados', color: 'text-green-600' },
                { icon: Zap, label: 'Ajuda no Mesmo Dia', color: 'text-brand-accent' },
                { icon: Star, label: 'Qualidade Garantida', color: 'text-yellow-600' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <item.icon className={cn("w-5 h-5", item.color)} />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary/60">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-[40px] overflow-hidden rotate-2 shadow-2xl shadow-brand-primary/20">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200" 
                alt="Professional working"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating UI elements for "Juice" */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-primary/5"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40">Novo Bico Postado</p>
                <p className="text-sm font-bold">Pedido de Limpeza Doméstica</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-8 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-brand-primary/5 max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/40">Pros Ativos Perto de Você</span>
              </div>
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                ].map((url, i) => (
                  <img 
                    key={i}
                    src={`${url}?auto=format&fit=crop&q=80&w=100`}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-brand-surface border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  +12
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

  );
}

// Utility function duplicated here for safety or import if available
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
