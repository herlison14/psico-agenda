import { motion } from 'motion/react';
import { Shield, TrendingUp, Users, DollarSign, ArrowRight, Star } from 'lucide-react';

export default function BecomeProSection() {
  return (
    <section id="seja-um-pro" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-primary rounded-[40px] md:rounded-[60px] p-8 md:p-16 lg:p-20 overflow-hidden relative shadow-2xl shadow-brand-primary/20">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-accent/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="lg:flex items-center gap-12 lg:gap-16 relative z-10">
            <div className="lg:w-3/5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
                <Shield className="w-3 h-3 text-brand-accent" />
                <span>Oportunidade</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[0.9]">
                Ganhe dinheiro com <br />
                <span className="text-brand-accent underline underline-offset-8 decoration-white/20">seus talentos.</span>
              </h2>
              <p className="text-base md:text-lg text-white/60 max-w-xl mb-10 leading-relaxed md:pr-10">
                Junte-se à maior rede de profissionais locais e encontre clientes prontos para contratar seu talento hoje mesmo.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {[
                  { icon: DollarSign, title: 'Ganhe Mais', desc: 'Retenha 90% do valor.' },
                  { icon: Users, title: 'Sua Região', desc: 'Clientes no seu bairro.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{item.title}</h4>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
 
              <button className="w-full sm:w-auto px-10 py-5 bg-brand-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-brand-accent/20 flex items-center justify-center gap-3">
                Ser um Pro Agora
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
 
            <div className="hidden lg:block lg:w-2/5">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-brand-accent to-brand-accent-secondary rounded-[40px] p-1 shadow-2xl rotate-3">
                  <img 
                    src="https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover rounded-[39px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  className="absolute -bottom-6 -left-12 bg-white text-brand-primary p-6 rounded-[32px] shadow-2xl max-w-[240px] -rotate-3 border border-brand-primary/5"
                >
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="font-black text-xl mb-1 text-brand-accent italic leading-tight">"Renda real."</p>
                  <p className="text-[11px] font-medium text-brand-primary/60">Clientes fixos em menos de um mês.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
