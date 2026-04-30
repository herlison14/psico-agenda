import { motion } from 'motion/react';
import { Mail, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-2xl">B</span>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">BicoNow</span>
            </div>
            <p className="text-white/60 max-w-sm mb-8 leading-relaxed">
              Nossa missão é fortalecer as comunidades locais através de conexões de serviço confiáveis e acessíveis. Encontre o que você precisa, quando precisar.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-brand-accent transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/40">Empresa</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Segurança</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="/blog" className="text-white/60 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-white/40">Suporte</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Termos de Serviço</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Fale Conosco</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:row-reverse md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/5">
            <Mail className="w-4 h-4 text-brand-accent" />
            <span className="text-sm font-medium">Assine nossa newsletter</span>
            <input 
              type="text" 
              placeholder="Email" 
              className="bg-transparent border-none outline-none text-sm w-32"
            />
          </div>
          <p className="text-sm text-white/40">
            © 2026 BicoNow Services Inc. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
