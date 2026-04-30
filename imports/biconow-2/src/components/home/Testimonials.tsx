import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useCallback } from 'react';

const TESTIMONIALS = [
  {
    name: "Ana Luiza",
    role: "Cliente",
    content: "Encontrei um eletricista em 10 minutos após um curto-circuito. O BicoNow salvou meu dia!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    name: "Carlos Eduardo",
    role: "Pintor",
    content: "Desde que entrei no Pro Plus, minha agenda está sempre cheia. O investimento se pagou na primeira semana.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    name: "Juliana Santos",
    role: "Cliente",
    content: "Adorei a facilidade de ver as avaliações antes de contratar. Me senti muito mais segura.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    rating: 4
  },
  {
    name: "Marcos Paulo",
    role: "Marido de Aluguel",
    content: "O BicoNow me deu a liberdade que eu precisava. Faço meus próprios horários e ganho bem mais.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    name: "Beatriz Lima",
    role: "Designer",
    content: "Como profissional criativa, o BicoNow me ajudou a encontrar clientes locais que nem sabiam que precisavam de mim.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    name: "Ricardo Oliveira",
    role: "Cliente",
    content: "Sistema muito intuitivo. Postei meu bico e em menos de 5 minutos já tinha 3 propostas excelentes.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 5
  }
];

export default function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section id="depoimentos" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
            Depoimentos
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-brand-primary">
            O que dizem sobre o <span className="text-brand-accent">BicoNow</span>
          </h2>
        </div>

        {/* Mobile View: Carousel */}
        <div className="block lg:hidden relative">
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="bg-brand-surface p-8 rounded-[40px] relative">
                    <Quote className="absolute top-6 right-8 w-12 h-12 text-brand-accent/10" />
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg font-medium text-brand-primary/80 mb-6 italic leading-relaxed">
                      "{t.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <img 
                        src={t.image} 
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover grayscale"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold text-brand-primary">{t.name}</p>
                        <p className="text-xs text-brand-primary/40 uppercase tracking-widest">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={scrollPrev}
              className="p-3 rounded-full bg-brand-primary text-white hover:bg-brand-accent transition-colors shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={scrollNext}
              className="p-3 rounded-full bg-brand-primary text-white hover:bg-brand-accent transition-colors shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-brand-surface p-10 rounded-[50px] relative hover:shadow-xl transition-shadow"
            >
              <Quote className="absolute top-8 right-10 w-16 h-16 text-brand-accent/10" />
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xl font-medium text-brand-primary/80 mb-8 italic leading-relaxed">
                "{t.content}"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={t.image} 
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover grayscale hover:grayscale-0 transition-all cursor-pointer"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-lg text-brand-primary">{t.name}</p>
                  <p className="text-xs text-brand-primary/40 uppercase tracking-widest font-black">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
