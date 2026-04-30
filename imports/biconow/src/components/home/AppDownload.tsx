import { motion } from 'motion/react';
import { Apple, Play as GooglePlay, Download, Smartphone } from 'lucide-react';

export default function AppDownload() {
  return (
    <section id="download" className="py-24 bg-brand-primary text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,#6366F1_0%,transparent_50%)] opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:flex items-center gap-24">
          {/* Mockup Simulation */}
          <div className="lg:w-1/2 relative mb-20 lg:mb-0">
            <div className="relative mx-auto w-[280px] h-[580px] bg-[#1a1a1a] rounded-[50px] border-[10px] border-[#333] shadow-2xl shadow-brand-accent/20 overflow-hidden">
              {/* Phone Content Simulation */}
              <div className="absolute top-0 inset-x-0 h-8 bg-[#1a1a1a] z-20 flex justify-center items-end pb-1">
                <div className="w-16 h-4 bg-[#111] rounded-full" />
              </div>
              <div className="p-6 pt-12 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center font-black">B</div>
                  <div className="h-4 w-24 bg-white/10 rounded-full" />
                </div>
                <div className="h-32 w-full bg-brand-accent/10 rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                </div>
              </div>
            </div>
            
            {/* Glow beneath phone */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-accent/60 blur-[100px] -z-10" />
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/4 -right-10 bg-brand-accent p-4 rounded-2xl shadow-2xl"
            >
              <Smartphone className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-8">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Aplicativo Nativo</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
              O BicoNow no <br />
              seu <span className="text-brand-accent">bolso.</span>
            </h2>
            <p className="text-xl text-white/50 mb-12 max-w-xl leading-relaxed font-medium">
              Receba notificações de serviços em tempo real, gerencie seus lucros e converse com clientes de qualquer lugar.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              <button className="flex items-center gap-4 bg-white text-brand-primary p-5 rounded-3xl hover:scale-[1.03] transition-all group shadow-xl">
                <Apple className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Baixar na</p>
                  <p className="font-black text-lg">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 text-white p-5 rounded-3xl hover:bg-white/20 transition-all group">
                <GooglePlay className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Baixar no</p>
                  <p className="font-black text-lg">Google Play</p>
                </div>
              </button>
            </div>

            {/* APK Option */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex items-center justify-between gap-6 hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-brand-accent group-hover:animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Download Direto APK</h4>
                  <p className="text-sm text-white/40">Versão 2.4.0 • Android 8.0+</p>
                </div>
              </div>
              <button 
                onClick={() => window.open('https://example.com/biconow-latest.apk', '_blank')}
                className="px-6 py-3 bg-brand-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-accent/30"
              >
                Baixar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
