import { motion } from 'motion/react';
import { MapPin, Navigation, Search, Filter, Star, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const NEARBY_PROS = [
  { id: 1, name: 'Alex Silva', category: 'Eletricista', lat: -23.55052, lng: -46.633308, rating: 4.9, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=100' },
  { id: 2, name: 'Mariana Costa', category: 'Designer', lat: -23.555, lng: -46.635, rating: 5.0, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
  { id: 3, name: 'João Pedro', category: 'Hidráulica', lat: -23.548, lng: -46.638, rating: 4.8, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
  { id: 4, name: 'Beatriz Lima', category: 'Organizer', lat: -23.552, lng: -46.630, rating: 4.9, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
];

export default function NearbyMap() {
  const [selectedPro, setSelectedPro] = useState<typeof NEARBY_PROS[0] | null>(null);

  const createCustomIcon = (pro: typeof NEARBY_PROS[0]) => {
    return L.divIcon({
      html: `
        <div class="relative group">
          <div class="w-12 h-12 bg-white rounded-full p-1 shadow-xl border-2 border-indigo-500 transition-transform">
            <img src="${pro.image}" class="w-full h-full rounded-full object-cover" />
            <div class="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>
        </div>
      `,
      className: '',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
    });
  };

  return (
    <section id="mapa" className="py-24 bg-brand-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Header & Info */}
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full mb-6">
              <Navigation className="w-4 h-4 text-brand-accent animate-pulse" />
              <span className="text-brand-accent text-xs font-bold uppercase tracking-widest">Tempo Real</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-6">Pros perto de <span className="text-brand-accent italic">você.</span></h2>
            <p className="text-brand-primary/60 text-lg mb-10 leading-relaxed">
              Veja em tempo real os profissionais que estão atendendo no seu bairro agora mesmo. Rapidez e proximidade garantida.
            </p>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-brand-primary/5 border border-brand-primary/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-primary/40">Sua Localização</p>
                    <p className="font-bold">Centro, São Paulo - SP</p>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
                  <input 
                    type="text" 
                    placeholder="Mudar localização..." 
                    className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-primary/5 rounded-xl text-sm focus:outline-none focus:ring-2 ring-brand-accent/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="bg-brand-primary p-8 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/20 rounded-full blur-3xl" />
                <h4 className="text-xl font-bold mb-2">12 Pros Online</h4>
                <p className="text-white/40 text-sm mb-6 font-medium">Há uma alta demanda por serviços de limpeza hoje na sua região.</p>
                <button className="flex items-center gap-2 text-brand-accent font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
                  Ver lista completa
                  <Navigation className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Map Interface */}
          <div className="lg:w-2/3 w-full">
            <div className="relative aspect-[4/3] bg-brand-primary/5 rounded-[60px] overflow-hidden shadow-2xl border-4 border-white z-0">
              <MapContainer 
                center={[-23.55052, -46.633308]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <ZoomControl position="topright" />
                
                {NEARBY_PROS.map((pro) => (
                  <Marker 
                    key={pro.id} 
                    position={[pro.lat, pro.lng]} 
                    icon={createCustomIcon(pro)}
                    eventHandlers={{
                      click: () => setSelectedPro(pro),
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2">
                        <p className="font-bold text-sm">{pro.name}</p>
                        <p className="text-xs text-brand-primary/60">{pro.category}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Map UI Overlays */}
              <div className="absolute top-8 right-16 flex flex-col gap-2 z-[400]">
                <button className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-brand-surface transition-colors">
                  <Filter className="w-5 h-5 text-brand-primary/60" />
                </button>
              </div>

              {/* Floating Pro Card */}
              <div className="absolute bottom-8 left-8 right-8 lg:left-12 lg:right-12 z-[400]">
                <div className={cn(
                  "bg-white/90 backdrop-blur-md p-6 rounded-[32px] border border-white/50 shadow-2xl transition-all duration-500",
                  selectedPro ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
                )}>
                  {selectedPro && (
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-brand-accent/20">
                        <img src={selectedPro.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-xl font-black">{selectedPro.name}</h4>
                            <p className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest">{selectedPro.category}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-700">{selectedPro.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="px-6 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary/90 transition-all">
                            Ver Perfil
                          </button>
                          <button className="px-6 py-2 bg-brand-surface text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-primary/5 transition-all">
                            Chamar no Chat
                          </button>
                          <button 
                            onClick={() => setSelectedPro(null)}
                            className="p-2 text-brand-primary/30 hover:text-brand-primary ml-auto"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
