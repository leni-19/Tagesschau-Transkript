import { getTranscripts } from '@/utils/transcriptParser';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const transcripts = await getTranscripts();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12 selection:bg-blue-200">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl flex items-center justify-center text-4xl font-extrabold mb-8 shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-all duration-300">
            TS
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">
            Tagesschau Dashboard
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-light">
            Modernes Protokoll-Archiv der Sendungen. Die Übersicht aktualisiert sich automatisch, sobald neue HTML Dateien im Ordner erscheinen.
          </p>
        </header>

        {transcripts.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-sm p-12 border border-slate-100 text-center py-24 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse border-2 border-slate-100">
              <span className="text-4xl">📂</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800">Keine Transkripte gefunden</h2>
            <p className="text-slate-500 max-w-md">
              Bitte füge HTML-Dateien im Repositorium in den Ordner <code className="bg-slate-100 text-blue-600 px-2 py-1 rounded-md text-sm font-mono tracking-tight">transkripte/</code> hinzu. Die Liste erweitert sich dynamisch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {transcripts.map((item, index) => (
              <Link href={`/transkript/${item.id}`} key={item.id} className={`group block relative bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 overflow-hidden ${index === 0 ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-blue-50/40 ring-1 ring-blue-100/50' : ''}`}>
                
                {index === 0 && (
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/20 rounded-full opacity-50 group-hover:opacity-80 transition-opacity blur-3xl"></div>
                )}

                <div className="flex flex-col h-full relative z-10">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500 font-mono bg-slate-100 px-4 py-1.5 rounded-full">{item.date}</span>
                    {index === 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ring-1 ring-blue-200 shadow-sm">
                        Neuste Sendung
                      </span>
                    )}
                  </div>
                  
                  <h2 className={`font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors leading-tight ${index === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                    {item.title}
                  </h2>
                  
                  <p className="text-slate-500 mb-8 flex-grow line-clamp-4 leading-relaxed">
                    {item.excerpt}
                  </p>
                  
                  {item.imageDescription && (
                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-start space-x-3">
                      <div className="mt-0.5 text-slate-400">🖼️</div>
                      <p className="text-sm text-slate-500 italic line-clamp-2 leading-relaxed">
                        {item.imageDescription}
                      </p>
                    </div>
                  )}

                  <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
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
