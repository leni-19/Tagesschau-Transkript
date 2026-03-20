import { getTranscriptById } from '@/utils/transcriptParser';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function extractYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default async function TranscriptPage({ params }: { params: { id: string } }) {
  const transcript = await getTranscriptById(params.id);

  if (!transcript) {
    notFound();
  }

  const videoId = transcript.youtubeUrl ? extractYoutubeId(transcript.youtubeUrl) : null;

  return (
    <main className="min-h-screen bg-[#0a0f1c] text-slate-200 py-12 px-6 md:py-20 font-sans relative overflow-hidden">
      {/* Background Blur Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] opacity-50 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-sm font-semibold tracking-widest uppercase text-slate-400 hover:text-white mb-12 transition-all group bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 backdrop-blur-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-3 transform group-hover:-translate-x-1.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Zurück zur Mediathek
        </Link>
        
        <article className="bg-[#111827]/60 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
          <header className="bg-gradient-to-br from-blue-900/40 via-[#111827] to-[#111827] p-10 md:p-16 border-b border-white/5 relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
            
            <div className="relative z-10">
              <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono tracking-widest text-blue-300 mb-6 border border-white/10">
                AUSSENDUNG {transcript.date}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter text-white mb-2 shadow-sm">
                {transcript.title.replace('vom', 'vom\n')}
              </h1>
            </div>
          </header>

          <div className="p-8 md:p-16">
            
            {videoId && (
              <div className="mb-16 -mt-4 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black aspect-video relative group">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {!videoId && transcript.youtubeUrl && (
              <a href={transcript.youtubeUrl} target="_blank" rel="noopener noreferrer" className="mb-14 block w-full bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-3xl p-6 md:p-8 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">▶</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Auf YouTube ansehen</h3>
                    <p className="text-slate-400 text-sm">Das Video konnte nicht nativ eingebettet werden. Klicke hier zur Originalquelle.</p>
                  </div>
                </div>
              </a>
            )}

            {transcript.imageDescription && (
              <div className="mb-16 bg-white/5 rounded-3xl p-8 md:p-10 border border-white/10 flex flex-col sm:flex-row gap-6 items-start shadow-inner">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/10 shrink-0">
                  📷
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3">Visuelle Beschreibung</h3>
                  <p className="text-slate-400 italic leading-relaxed md:text-lg font-light">{transcript.imageDescription}</p>
                </div>
              </div>
            )}

            <div className="prose prose-invert prose-lg max-w-none 
              prose-p:leading-loose prose-p:text-slate-300 prose-p:font-light
              prose-strong:text-white prose-strong:bg-white/10 prose-strong:px-2.5 prose-strong:py-1 prose-strong:rounded-md prose-strong:font-mono prose-strong:text-sm prose-strong:mr-2 prose-strong:border prose-strong:border-white/10
              prose-h2:text-3xl prose-h2:font-bold prose-h2:text-white prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-white/10
              prose-h3:text-xl prose-h3:text-slate-200">
              
              <div dangerouslySetInnerHTML={{ __html: transcript.transcriptHtml }} className="space-y-8" />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
