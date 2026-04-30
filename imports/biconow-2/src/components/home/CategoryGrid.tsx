import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { 
  Zap, 
  Wrench, 
  Paintbrush, 
  Truck, 
  ChefHat, 
  Laptop, 
  Music, 
  Shield,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const CATEGORIES = [
  { 
    name: 'Eletricista', 
    count: '1.2k Pros', 
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800',
    icon: Zap,
    color: 'from-amber-400/80 to-amber-600/90',
    accent: 'bg-amber-400'
  },
  { 
    name: 'Encanador', 
    count: '850 Pros', 
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800',
    icon: Wrench,
    color: 'from-blue-400/80 to-blue-600/90',
    accent: 'bg-blue-400'
  },
  { 
    name: 'Reforma', 
    count: '420 Pros', 
    image: 'https://images.unsplash.com/photo-1503387762-592dea58ef23?auto=format&fit=crop&q=80&w=800',
    icon: Paintbrush,
    color: 'from-purple-400/80 to-purple-600/90',
    accent: 'bg-purple-400'
  },
  { 
    name: 'Entregas', 
    count: '2.1k Pros', 
    image: 'https://images.unsplash.com/photo-1512403754473-27835f7b9984?auto=format&fit=crop&q=80&w=800',
    icon: Truck,
    color: 'from-emerald-400/80 to-emerald-600/90',
    accent: 'bg-emerald-400'
  },
  { 
    name: 'Chef de Cozinha', 
    count: '150 Pros', 
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
    icon: ChefHat,
    color: 'from-rose-400/80 to-rose-600/90',
    accent: 'bg-rose-400'
  },
  { 
    name: 'Suporte TI', 
    count: '310 Pros', 
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800',
    icon: Laptop,
    color: 'from-indigo-400/80 to-indigo-600/90',
    accent: 'bg-indigo-400'
  },
  { 
    name: 'Aulas de Música', 
    count: '95 Pros', 
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1000',
    icon: Music,
    color: 'from-violet-400/80 to-violet-600/90',
    accent: 'bg-violet-400'
  },
  { 
    name: 'Segurança', 
    count: '55 Pros', 
    image: 'https://images.unsplash.com/photo-1454165833767-027ee8179ab1?auto=format&fit=crop&q=80&w=800',
    icon: Shield,
    color: 'from-slate-600/80 to-slate-800/90',
    accent: 'bg-slate-600'
  }
];

export default function CategoryGrid() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  return (
    <section id="explore" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-brand-accent rounded-full" />
              <span className="text-sm font-bold uppercase tracking-wider text-brand-accent">Categorias Locais</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight">Explore por <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-accent-secondary">Categoria</span></h2>
              
              {/* Carousel Nav for mobile */}
              <div className="flex gap-2 md:hidden">
                <button 
                  onClick={() => emblaApi?.scrollPrev()}
                  className="p-2 bg-brand-surface rounded-xl border border-brand-primary/5 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => emblaApi?.scrollNext()}
                  className="p-2 bg-brand-surface rounded-xl border border-brand-primary/5 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-brand-primary/60 max-w-md text-base md:text-lg mt-4">Encontre especialistas talentosos no seu bairro para qualquer necessidade.</p>
          </div>
          <button className="hidden md:block px-6 py-3 bg-brand-surface border border-brand-primary/10 rounded-full text-sm font-bold hover:bg-brand-primary hover:text-white transition-all shadow-sm">
            Ver todas as categorias
          </button>
        </div>

        {/* Desktop Grid / Mobile Carousel */}
        <div className="md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 px-1">
              {CATEGORIES.map((cat, idx) => (
                <div key={idx} className="flex-[0_0_80%] min-w-0">
                  <CategoryCard cat={cat} idx={idx} isMobile />
                </div>
              ))}
            </div>
          </div>

          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="hidden md:block">
              <CategoryCard cat={cat} idx={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ cat, idx, isMobile = false }: { cat: any, idx: number, isMobile?: boolean }) {
  return (
    <motion.div
      initial={isMobile ? {} : { opacity: 0, y: 20 }}
      whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className={cn(
        "group relative rounded-[40px] overflow-hidden cursor-pointer shadow-2xl shadow-brand-primary/5 border border-transparent hover:border-white/50 transition-all",
        isMobile ? "h-[400px]" : "h-80"
      )}
    >
      <img 
        src={cat.image} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        referrerPolicy="no-referrer"
      />
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t opacity-80 group-hover:opacity-90 transition-opacity",
        cat.color
      )} />
      
      <div className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 group-hover:scale-110 transition-transform">
        <cat.icon className="w-5 h-5 text-white" />
      </div>

      <div className="absolute bottom-8 left-8 right-8">
        <div className={cn("w-8 h-1 rounded-full mb-4 opacity-70", cat.accent)} />
        <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">{cat.count}</p>
        <h3 className="text-white text-2xl font-black">{cat.name}</h3>
        <div className="flex items-center gap-2 mt-4 opacity-0 md:group-hover:opacity-100 transition-opacity translate-y-4 md:group-hover:translate-y-0 duration-300">
          <span className="text-white text-xs font-bold uppercase tracking-tighter">Explorar serviços</span>
          <div className="w-4 h-px bg-white/50" />
        </div>
      </div>
    </motion.div>
  );
}


