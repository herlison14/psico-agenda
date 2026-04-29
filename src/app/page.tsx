import Link from 'next/link'

const categorias = [
  { nome: 'Medicina',    simbolo: '⚕️' },
  { nome: 'Psicologia',  simbolo: 'Ψ' },
  { nome: 'Enfermagem',  simbolo: '🪔' },
  { nome: 'Endocrino',   simbolo: '🧬' },
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Fundo natureza */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      </div>

      {/* Painel glassmorphism */}
      <div className="relative z-10 w-full max-w-5xl mx-4 p-12 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">

        {/* Título */}
        <div className="text-center mb-16">
          <h1
            className="text-6xl font-bold text-white mb-4 drop-shadow-md"
            style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
          >
            PsiPlanner
          </h1>
          <p className="text-blue-50 text-xl font-light tracking-wide">
            Gestão inteligente para todos os profissionais de saúde.
          </p>
        </div>

        {/* Categorias */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categorias.map((cat) => (
            <div key={cat.nome} className="relative h-40 flex items-center justify-center group cursor-pointer">
              <span className="absolute inset-0 flex items-center justify-center text-8xl text-white opacity-[0.05] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none select-none">
                {cat.simbolo}
              </span>
              <span className="relative z-20 text-white font-medium text-lg tracking-widest uppercase border-b border-transparent group-hover:border-white/40 transition-all">
                {cat.nome}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg"
          >
            Começar Agora
          </Link>
          <Link
            href="/login"
            className="text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            Já tenho conta →
          </Link>
        </div>
      </div>
    </main>
  )
}
