import { motion } from 'motion/react';
import { 
  BarChart3, 
  MessageSquare, 
  Settings, 
  PlusCircle, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Star,
  Users,
  LogOut,
  Bell
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Ganhos no Mês', value: 'R$ 2.450', icon: DollarSign, trend: '+12%', color: 'text-green-500' },
  { label: 'Serviços Ativos', value: '04', icon: Clock, trend: 'Novo', color: 'text-brand-accent' },
  { label: 'Visualizações', value: '840', icon: Users, trend: '+5%', color: 'text-blue-500' },
  { label: 'Nota Média', value: '4.9', icon: Star, trend: 'Top Pro', color: 'text-yellow-500' },
];

export default function ProfessionalDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-primary/5 hidden lg:flex flex-col p-8">
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-brand-accent rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <span className="font-display text-xl font-black">BicoNow</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { label: 'Visão Geral', icon: BarChart3, active: true },
            { label: 'Meus Bicos', icon: PlusCircle },
            { label: 'Mensagens', icon: MessageSquare, badge: '3' },
            { label: 'Desempenho', icon: TrendingUp },
            { label: 'Configurações', icon: Settings },
          ].map((item, i) => (
            <button 
              key={i} 
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl text-sm font-bold transition-all",
                item.active 
                  ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/10" 
                  : "text-brand-primary/40 hover:bg-brand-surface hover:text-brand-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.badge && <span className="bg-brand-accent text-white px-2 py-0.5 rounded-full text-[10px]">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 p-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-all mt-auto">
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">Painel Profissional</h1>
            <p className="text-brand-primary/40 text-sm font-medium">Bom dia, Alex! Você tem 3 novas mensagens hoje.</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-white border border-brand-primary/5 rounded-2xl hover:bg-brand-surface transition-all">
              <Bell className="w-6 h-6 text-brand-primary/40" />
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-accent border-2 border-white rounded-full" />
            </button>
            <div className="flex items-center gap-4 p-1.5 bg-white border border-brand-primary/5 rounded-2xl pr-4">
              <div className="w-10 h-10 bg-brand-accent rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100" />
              </div>
              <div>
                <p className="text-sm font-black">Alex Silva</p>
                <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">Plano Pro Plus</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {STATS.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[40px] shadow-xl shadow-brand-primary/5 border border-brand-primary/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn("w-12 h-12 rounded-2xl bg-brand-surface flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={cn("text-xs font-black", stat.color)}>{stat.trend}</span>
              </div>
              <p className="text-brand-primary/40 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-brand-primary/5 border border-brand-primary/5">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black">Solicitações Recentes</h3>
                <button className="text-brand-accent font-bold text-xs uppercase tracking-widest">Ver Todos</button>
              </div>
              <div className="space-y-6">
                {[
                  { name: 'Ricardo Dias', service: 'Instalação de Tomadas', price: 'R$ 150', time: 'Há 2h', status: 'Novo' },
                  { name: 'Letícia Gomaz', service: 'Revisão Elétrica', price: 'R$ 380', time: 'Há 5h', status: 'Pendente' },
                  { name: 'Bruna Mendes', service: 'Manutenção Preventiva', price: 'R$ 220', time: 'Ontem', status: 'Concluído' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-brand-surface rounded-[32px] group hover:bg-brand-primary hover:text-white transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-bold text-brand-primary">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-sm opacity-40">{item.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black mb-1">{item.price}</p>
                      <p className="text-[10px] uppercase font-bold opacity-30">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity/Promotion */}
          <div className="space-y-8">
            <div className="bg-brand-accent p-8 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <TrendingUp className="w-12 h-12 mb-6" />
              <h3 className="text-xl font-black mb-4">Impulsione seu Perfil</h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">Alcance até 10x mais clientes ativando o modo destaque por apenas R$ 9,90/dia.</p>
              <button className="w-full py-4 bg-white text-brand-accent rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Ativar Agora</button>
            </div>

            <div className="bg-white p-8 rounded-[50px] shadow-xl shadow-brand-primary/5 border border-brand-primary/5">
              <h4 className="font-black mb-6">Meta da Semana</h4>
              <div className="h-4 bg-brand-surface rounded-full overflow-hidden mb-4">
                <div className="h-full bg-brand-accent w-2/3" />
              </div>
              <p className="text-sm font-medium text-brand-primary/60">Você está a R$ 800 do seu recorde mensal!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
