import { motion, AnimatePresence } from 'motion/react';
import { Search, Menu, User, PlusCircle, X, ChevronRight, Smartphone, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated login state
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-brand-accent rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-brand-accent/20">
                  <span className="text-white font-display font-bold text-2xl">B</span>
                </div>
                <span className="font-display text-2xl font-black tracking-tight">BicoNow</span>
              </Link>

              <div className="hidden lg:flex items-center gap-8">
                <a href="#explore" className="text-sm font-bold text-brand-primary/50 hover:text-brand-accent transition-all">Explorar</a>
                <a href="#mapa" className="text-sm font-bold text-brand-primary/50 hover:text-brand-accent transition-all">Mapa</a>
                <a href="#planos" className="text-sm font-bold text-brand-primary/50 hover:text-brand-accent transition-all">Planos</a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden xl:flex items-center bg-brand-surface border border-brand-primary/5 rounded-2xl px-4 py-2 focus-within:ring-2 ring-brand-accent/10 transition-all">
                <Search className="w-4 h-4 text-brand-primary/30 mr-3" />
                <input 
                  type="text" 
                  placeholder="Encontrar um serviço..." 
                  className="bg-transparent border-none text-sm font-medium focus:outline-none w-56"
                />
              </div>

              <a href="#download" className="hidden lg:flex items-center gap-2 px-3 py-2 border border-brand-primary/5 rounded-xl text-[10px] font-bold text-brand-primary/40 hover:bg-brand-surface transition-all uppercase tracking-tighter">
                <Smartphone className="w-3.5 h-3.5" />
                Baixar App
              </a>

              {!isLoggedIn ? (
                <>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-accent text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black hover:scale-105 transition-all shadow-lg shadow-brand-accent/20"
                  >
                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Postar</span>
                  </button>

                  <Link 
                    to="/dashboard"
                    className="flex p-2.5 sm:p-3 text-brand-primary/40 hover:bg-brand-surface rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-brand-primary/5 items-center gap-2"
                    title="Login"
                  >
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm font-bold hidden md:inline">Entrar</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl text-sm font-black hover:scale-105 transition-all shadow-xl"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Meu Painel
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent"
                    title="Sair"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="lg:hidden p-3 text-brand-primary/40 hover:bg-brand-surface rounded-2xl transition-all flex items-center justify-center"
              >
                {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-brand-primary/5 overflow-hidden shadow-2xl"
            >
              <div className="p-4 space-y-2">
                <a 
                  href="#explore" 
                  onClick={() => setShowMenu(false)}
                  className="flex items-center justify-between p-4 bg-brand-surface rounded-2xl text-brand-primary font-bold"
                >
                  Explorar <ChevronRight className="w-4 h-4 opacity-30" />
                </a>
                <a 
                  href="#mapa" 
                  onClick={() => setShowMenu(false)}
                  className="flex items-center justify-between p-4 bg-brand-surface rounded-2xl text-brand-primary font-bold"
                >
                  Mapa <ChevronRight className="w-4 h-4 opacity-30" />
                </a>
                <a 
                  href="#planos" 
                  onClick={() => setShowMenu(false)}
                  className="flex items-center justify-between p-4 bg-brand-surface rounded-2xl text-brand-primary font-bold"
                >
                  Planos & Destaques <ChevronRight className="w-4 h-4 opacity-30" />
                </a>
                <a 
                  href="#download" 
                  onClick={() => setShowMenu(false)}
                  className="flex items-center justify-between p-4 bg-brand-surface rounded-2xl text-brand-primary font-bold"
                >
                  Baixar App / APK <ChevronRight className="w-4 h-4 opacity-30" />
                </a>
                
                {!isLoggedIn ? (
                  <button 
                    onClick={() => { setShowMenu(false); setShowAuthModal(true); }}
                    className="w-full flex items-center justify-center gap-2 p-5 bg-brand-accent text-white rounded-2xl font-black shadow-xl shadow-brand-accent/20"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Postar um Bico
                  </button>
                ) : (
                  <Link 
                    to="/dashboard"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center justify-center gap-2 p-5 bg-brand-primary text-white rounded-2xl font-black shadow-xl"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Meu Painel
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Auth Modal Placeholder */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-primary/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[40px] p-10 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 text-brand-primary/20 hover:text-brand-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-brand-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-brand-accent" />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Entrar no BicoNow</h3>
                <p className="text-brand-primary/40 font-medium">Acesse seu painel profissional.</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleLoginSuccess}
                  className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 group"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Entrar com Google
                </button>
                <button 
                  onClick={handleLoginSuccess}
                  className="w-full py-4 bg-brand-surface text-brand-primary rounded-2xl font-bold border border-brand-primary/5 hover:bg-brand-primary/5 transition-all"
                >
                  E-mail e Senha
                </button>
              </div>

              <div className="mt-10 p-6 bg-brand-surface rounded-3xl border border-brand-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-bold">Identidade Protegida</span>
                </div>
                <p className="text-[10px] text-brand-primary/40 font-medium leading-relaxed">
                  Utilizamos verificação biométrica e consulta de antecedentes para manter a comunidade segura.
                </p>
              </div>

              <p className="text-center mt-10 text-brand-primary/30 text-xs font-medium uppercase tracking-widest leading-loose">
                Não tem conta? <br />
                <span className="text-brand-accent font-bold cursor-pointer">Cadastre-se como Profissional</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


