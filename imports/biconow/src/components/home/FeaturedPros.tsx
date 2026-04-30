import { motion } from 'motion/react';
import { Star, CheckCircle2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/src/lib/utils';

const PROS = [
  {
    name: "Alex Silva",
    category: "Eletricista Mestre",
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
    price: "R$ 150/hr",
    location: "a 2.5 km de distância"
  },
  {
    name: "Mariana Costa",
    category: "Designer de Interiores",
    rating: 5.0,
    reviews: 84,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    price: "R$ 200/hr",
    location: "a 0.8 km de distância"
  },
  {
    name: "João Pedro",
    category: "Especialista em Hidráulica",
    rating: 4.8,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    price: "R$ 120/hr",
    location: "a 4.1 km de distância"
  },
  {
    name: "Beatriz Lima",
    category: "Personal Organizer",
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
    price: "R$ 180/hr",
    location: "a 1.2 km de distância"
  },
  {
    name: "Ricardo Mendes",
    category: "Pintor Profissional",
    rating: 4.7,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    price: "R$ 90/hr",
    location: "a 3.5 km de distância"
  },
  {
    name: "Clara Soares",
    category: "Jardinagem e Paisagismo",
    rating: 5.0,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    price: "R$ 100/hr",
    location: "a 5.0 km de distância"
  },
  { name: 'Ricardo Dias', category: 'Climatização', location: 'Moema, SP', rating: 4.8, reviews: 82, image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400', price: 'R$ 150/h' },
  { name: 'Letícia Gomaz', category: 'Pintura', location: 'Pinheiros, SP', rating: 4.9, reviews: 156, image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400', price: 'Sob consulta' },
  { name: 'Fernando Lima', category: 'Pedreiro', location: 'Guarulhos, SP', rating: 4.7, reviews: 210, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', price: 'R$ 200/dia' },
  { name: 'Carla Silva', category: 'Limpeza', location: 'Tatuapé, SP', rating: 5.0, reviews: 340, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', price: 'R$ 120/faxina' },
];

export default function FeaturedPros() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  return (
    <section id="pros" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 lg:mb-24 gap-6">
          <div className="w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full mb-6 text-brand-accent">
              <Star className="w-4 h-4 fill-brand-accent" />
              <span className="text-xs font-bold uppercase tracking-widest">Os Melhores da Região</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tight">Pros em <span className="text-brand-accent italic">Destaque</span></h2>
              
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
            <p className="text-brand-primary/60 max-w-2xl text-base md:text-lg mt-4">Encontre profissionais talentosos e verificados que foram consistentemente bem avaliados pelos seus vizinhos.</p>
          </div>
        </div>

        {/* Desktop Grid / Mobile Carousel */}
        <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Mobile Carousel Implementation */}
          <div className="md:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 px-1">
              {PROS.map((pro, idx) => (
                <div key={idx} className="flex-[0_0_85%] min-w-0">
                  <ProCard pro={pro} idx={idx} isMobile />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop static grid */}
          {PROS.map((pro, idx) => (
            <div key={idx} className="hidden md:block">
              <ProCard pro={pro} idx={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProCard({ pro, idx, isMobile = false }: { pro: any, idx: number, isMobile?: boolean }) {
  return (
    <motion.div
      initial={isMobile ? {} : { opacity: 0, y: 20 }}
      whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-[40px] p-2 shadow-xl shadow-brand-primary/5 border border-brand-primary/5 overflow-hidden group h-full"
    >
      <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden mb-6">
        <img 
          src={pro.image} 
          alt={pro.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
          {pro.price}
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-xl">{pro.name}</h3>
              <CheckCircle2 className="w-4 h-4 text-brand-accent fill-brand-accent/10" />
            </div>
            <p className="text-sm font-medium text-brand-primary/40 uppercase tracking-wider">{pro.category}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-700">{pro.rating}</span>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-4 py-4 border-y border-brand-primary/5 my-4",
          isMobile ? "flex-col items-start gap-1" : ""
        )}>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-primary/30" />
            <span className="text-sm text-brand-primary/60 font-medium">{pro.location}</span>
          </div>
          <div className="text-sm text-brand-primary/60 font-medium">
            <span className="text-brand-primary font-bold">{pro.reviews}</span> Avaliações
          </div>
        </div>

        <button className="w-full py-4 bg-brand-surface group-hover:bg-brand-accent group-hover:text-white rounded-2xl font-bold text-sm transition-all duration-300">
          Ver Perfil
        </button>
      </div>
    </motion.div>
  );
}
