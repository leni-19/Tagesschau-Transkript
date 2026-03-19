import { getTranscriptById } from '@/utils/transcriptParser';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TranscriptPage({ params }: { params: { id: string } }) {
  const transcript = await getTranscriptById(params.id);

  if (!transcript) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 py-12 px-6 md:py-20 selection:bg-blue-200">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 mb-10 transition-colors group bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Zurück zum Dashboard
        </Link>
        
        <article className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <header className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md px-5 py-2 rounded-full text-sm font-mono tracking-widest mb-6 border border-white/20 shadow-inner">
                {transcript.date}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-4">
                {transcript.title.replace('vom', 'vom\n')}
              </h1>
            </div>
          </header>

          <div className="p-8 md:p-16">
            {transcript.imageDescription && (
              <div className="mb-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-slate-200/60 shadow-inner flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 shrink-0">
                  📷
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Visuelle Zusammenfassung</h3>
                  <p className="text-slate-700 italic leading-relaxed md:text-lg">{transcript.imageDescription}</p>
                </div>
              </div>
            )}

            <div className="prose prose-slate prose-lg max-w-none 
              prose-p:leading-loose prose-p:text-slate-700
              prose-strong:text-blue-900 prose-strong:bg-blue-50 prose-strong:px-2 prose-strong:py-1 prose-strong:rounded-lg prose-strong:font-mono prose-strong:text-sm prose-strong:mr-3 prose-strong:shadow-sm prose-strong:border prose-strong:border-blue-100">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 m-0">
                  Wörtliches Protokoll
                </h2>
              </div>
              
              <div dangerouslySetInnerHTML={{ __html: transcript.transcriptHtml }} className="space-y-6 md:space-y-8" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
