"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Mission {
  id: string;
  title: string | null;
  closingInstruction: string | null;
  closingInstructionType: string | null;
  closingInstructionVideoUrl: string | null;
  closingInstructionSlidesJson: string | null;
}

interface ClosingInstructionClientProps {
  token: string;
  mission: Mission;
}

export function ClosingInstructionClient({ token, mission }: ClosingInstructionClientProps) {
  const slides: string[] = (() => {
    if (mission.closingInstructionSlidesJson) {
      try {
        return JSON.parse(mission.closingInstructionSlidesJson);
      } catch (_) {
        return [];
      }
    }
    return [];
  })();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isYoutube, setIsYoutube] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  useEffect(() => {
    if (mission.closingInstructionType === "video" && mission.closingInstructionVideoUrl) {
      const videoUrl = mission.closingInstructionVideoUrl;
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (youtubeMatch) {
        setIsYoutube(true);
        setYoutubeId(youtubeMatch[1]);
      }
    }
  }, [mission]);

  return (
    <div className="h-screen bg-transparent text-white flex flex-col relative overflow-hidden font-sans">

      {/* Fixed Header */}
      <header className="z-50 grid grid-cols-3 items-center h-16 px-6 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex justify-start">
          <Link
            href={`/play/${token}/missions`}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </Link>
        </div>

        <div className="flex justify-center">
          <span className="text-primary font-black uppercase tracking-widest text-[11px] italic">Mission Clear</span>
        </div>

        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-2xl mx-auto p-6 sm:p-12 space-y-10 relative z-10">
          <section className="space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-tight">
              정답을<br />맞히셨습니다!
            </h1>
            <p className="text-slate-400 font-bold text-sm tracking-tight">다음 목적지를 확인하고 이동해 주세요.</p>
          </section>

          {/* Media Content */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
            {mission.closingInstructionType === "video" && mission.closingInstructionVideoUrl && (
              <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                {isYoutube && youtubeId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                    title="Closing Instruction"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={mission.closingInstructionVideoUrl}
                    controls
                    className="w-full h-full"
                    playsInline
                  />
                )}
              </div>
            )}

            {mission.closingInstructionType === "slide" && slides.length > 0 && (
              <div className="relative group">
                <div className="aspect-[4/3] sm:aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={slides[currentSlideIndex]}
                    alt={`Slide ${currentSlideIndex + 1}`}
                    className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
                  />
                </div>

                {slides.length > 1 && (
                  <div className="absolute bottom-6 left-0 w-full flex justify-center gap-3">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        className={`h-2 border transition-all rounded-full ${i === currentSlideIndex ? "bg-white w-8 border-white" : "bg-white/20 hover:bg-white/40 w-2 border-transparent"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {mission.closingInstruction && (
              <div className="p-8 sm:p-10 bg-gradient-to-br from-slate-900 to-slate-950 border-t border-slate-800/50">
                <p className="text-white text-lg sm:text-xl font-bold leading-relaxed whitespace-pre-wrap">
                  {mission.closingInstruction}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="z-50 p-6 pb-4 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
          <Link
            href={`/play/${token}/mission`}
            className="group w-full flex items-center justify-between bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-2 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <span className="text-xl tracking-tighter">다음 미션으로</span>
            <div className="bg-black/10 group-hover:bg-black/20 p-2 rounded-xl transition-colors">
              <ChevronRight className="w-6 h-6 stroke-[3px]" />
            </div>
          </Link>

          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            Secret Trail
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
