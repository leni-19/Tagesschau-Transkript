import { getTranscripts } from '@/utils/transcriptParser';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const transcripts = await getTranscripts();

  return (
    <main className="min-h-screen bg-[#0a0f1c] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Blur Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[128px] opacity-70 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[128px] opacity-70"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-5xl font-extrabold mb-8 shadow-2xl shadow-blue-600/40 ring-4 ring-blue-500/20 transform hover:scale-110 transition-all duration-500 ease-out">
            TS
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
            Das Archiv
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-normal tracking-wide leading-relaxed">
            Deine kuratierte Mediathek für Tagesschau-Transkripte. Füge einfach neue Dateien in deinem Repository hinzu, und sie erscheinen hier magisch in Echtzeit.
          </p>
        </header>

        {transcripts.length === 0 ? (
          <div className="bg-[#111827]/60 backdrop-blur-2xl rounded-[3rem] p-16 border border-white/5 text-center flex flex-col items-center justify-center shadow-2xl">
            <div className="w-24 h-24 bg-white/5 inline-flex items-center justify-center rounded-[2rem] mb-8 ring-1 ring-white/10 shadow-inner">
              <span className="text-5xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">Es ist noch ganz leer hier!</h2>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
              Gehe in dein GitHub-Repository und lade deine erste HTML-Datei in den <code className="bg-black/30 text-blue-400 px-2.5 py-1 rounded-lg text-sm font-mono tracking-tight mx-1">transkripte/</code> Ordner hoch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {transcripts.map((item, index) => (
              <Link href={`/transkript/${item.id}`} key={item.id} className={`group relative bg-[#111827]/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 hover:border-blue-500/30 hover:bg-[#111827]/80 transition-all duration-500 ease-out overflow-hidden flex flex-col ${index === 0 ? 'md:col-span-2 lg:col-span-2 ring-1 ring-blue-500/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.15)] bg-gradient-to-br from-[#111827]/80 to-blue-900/10' : 'shadow-xl'}`}>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-400 font-mono tracking-widest">{item.date}</span>
                    <div className="flex items-center space-x-3">
                      {item.youtubeUrl && (
                        <span className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center border border-red-500/20">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></span> Video
                        </span>
                      )}
                      {index === 0 && (
                        <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-500/20">
                          Aktuell
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h2 className={`font-bold text-white mb-5 tracking-tight group-hover:text-blue-400 transition-colors duration-300 leading-snug ${index === 0 ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>
                    {item.title}
                  </h2>
                  
                  <p className="text-slate-400 mb-8 flex-grow line-clamp-4 leading-relaxed text-lg font-light">
                    {item.excerpt}
                  </p>
                  
                  {item.imageDescription && (
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-start space-x-4">
                      <div className="mt-1 opacity-70">🖼️</div>
                      <p className="text-sm text-slate-500 italic line-clamp-2 leading-relaxed">
                        {item.imageDescription}
                      </p>
                    </div>
                  )}

                  {/* Play Button Icon */}
                  <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
