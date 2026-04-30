import Navbar from '@/src/components/layout/Navbar';
import Hero from '@/src/components/home/Hero';
import CategoryGrid from '@/src/components/home/CategoryGrid';
import FeaturedPros from '@/src/components/home/FeaturedPros';
import Testimonials from '@/src/components/home/Testimonials';
import NearbyMap from '@/src/components/home/NearbyMap';
import PricingPlans from '@/src/components/home/PricingPlans';
import AppDownload from '@/src/components/home/AppDownload';
import BecomeProSection from '@/src/components/home/BecomeProSection';
import Footer from '@/src/components/layout/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      
      {/* Video Modal */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-primary/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl shadow-brand-accent/20"
            >
              <button 
                onClick={() => setShowVideo(false)}
                className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="BicoNow How it Works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Proof Bar */}
      <section className="py-8 bg-brand-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20">
            <span className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">Confiado por líderes da indústria</span>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-30 grayscale invert">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6" referrerPolicy="no-referrer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg" className="h-6" referrerPolicy="no-referrer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" className="h-6" referrerPolicy="no-referrer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" className="h-6" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      <CategoryGrid />

      {/* Trust/Verification Banner */}
      <section className="py-12 bg-green-50 border-y border-green-100 italic">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <span className="font-bold text-green-900">100% de Profissionais com Identidade Verificada</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-green-200" />
          <p className="text-green-700 text-sm font-medium">Segurança e confiança em primeiro lugar em cada contratação.</p>
        </div>
      </section>

      {/* Video Content Section */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-accent/10 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-primary rounded-[40px] md:rounded-[60px] p-8 md:p-16 lg:p-24 overflow-hidden relative shadow-2xl shadow-brand-primary/20">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-accent-secondary/20 rounded-full blur-[100px] animate-pulse" />
            
            <div className="lg:flex items-center gap-20 relative z-10">
              <div className="lg:w-1/2 mb-12 lg:mb-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 mb-8">
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-ping" />
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Passo a Passo</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-8 leading-[1.1]">
                  A maneira mais <span className="text-brand-accent italic">fácil</span> de resolver as coisas.
                </h2>
                <div className="space-y-8">
                  {[
                    { title: "Poste seu 'bico'", desc: "Em segundos seu pedido estará no ar para nossa rede." },
                    { title: "Escolha o Pro", desc: "Compare orçamentos e veja avaliações reais de vizinhos." },
                    { title: "Tudo pronto!", desc: "Pague com segurança só após a conclusão do serviço." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-brand-accent font-black text-xl group-hover:bg-brand-accent group-hover:text-white transition-all">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-1">{step.title}</h4>
                        <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="relative group p-2 bg-white/5 border border-white/10 rounded-[48px] backdrop-blur-sm">
                  <div className="relative aspect-[4/5] md:aspect-video rounded-[40px] overflow-hidden bg-brand-primary shadow-inner">
                    <video 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                    >
                      <source src="https://assets.mixkit.co/videos/preview/mixkit-handyman-working-with-a-drill-4050-large.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary to-transparent opacity-60" />
                    
                    {/* Fake Player Controls */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowVideo(true)}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl relative"
                      >
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                        <Play className="w-8 h-8 fill-brand-primary text-brand-primary ml-1" />
                      </motion.button>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-widest">Agora assistindo</p>
                          <p className="text-sm font-medium text-white/70">Como contratar com segurança</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex gap-1">
                        {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-white/40 rounded-full" />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedPros />

      <Testimonials />

      <NearbyMap />

      <PricingPlans />

      <AppDownload />

      <BecomeProSection />

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">

        <div className="absolute inset-0 bg-brand-accent/5 -z-10" />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-5xl md:text-6xl font-black tracking-tight mb-8">Pronto para limpar sua lista?</h2>
            <p className="text-xl text-brand-primary/60 mb-10 max-w-2xl mx-auto font-medium">Junte-se a mais de 50.000 pessoas que recebem ajuda todos os dias através do BicoNow.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-10 py-5 bg-brand-primary text-white rounded-[24px] font-bold text-lg hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/10">
                Começar hoje mesmo
              </button>
              <button className="px-10 py-5 bg-white text-brand-primary rounded-[24px] font-bold text-lg border border-brand-primary/10 hover:bg-brand-surface transition-all">
                Saiba mais
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
