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
  const slides: { imageUrl: string; description: string }[] = (() => {
    if (mission.closingInstructionSlidesJson) {
      try {
        const parsed = JSON.parse(mission.closingInstructionSlidesJson);
        if (Array.isArray(parsed)) {
          return parsed.map(s => typeof s === 'string' ? { imageUrl: s, description: "" } : s);
        }
      } catch (_) {
        return [];
      }
    }
    return [];
  })();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showText, setShowText] = useState(false);

  const hasSlides = mission.closingInstructionType === "slide" && slides.length > 0;
  const currentSlide = hasSlides ? slides[currentSlideIndex] : null;

  const handleNext = () => {
    if (!hasSlides) {
      return;
    }

    if (!showText && currentSlide?.description) {
      setShowText(true);
      return;
    }

    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setShowText(false);
    } else {
      // All slides done, go to next mission list
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
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
          <span className="text-emerald-500 font-black uppercase tracking-widest text-[11px]">Mission Clear</span>
        </div>

        <div className="w-10" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden" onClick={handleNext}>
        {hasSlides ? (
          <div className="absolute inset-0 w-full h-full">
            {/* Background Image */}
            <img
              key={currentSlide?.imageUrl}
              src={currentSlide?.imageUrl}
              alt="Mission location"
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
            />

            {/* Overlay Gradient */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${showText ? "opacity-100" : "opacity-0"}`} />

            {/* Text Overlay */}
            {showText && currentSlide?.description && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div 
                  className="w-full max-w-lg max-h-[70vh] overflow-y-auto hide-scrollbar bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-white text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium text-center">
                    {currentSlide.description}
                  </p>
                  
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={handleNext}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                      {currentSlideIndex < slides.length - 1 ? "다음 슬라이드" : "미션 목록으로"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Click Guide */}
            {!showText && (
              <div className="absolute bottom-12 left-0 right-0 text-center animate-bounce">
                <span className="bg-black/60 text-white/90 text-[10px] px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-md border border-white/10 font-bold uppercase tracking-wider">
                  탭하여 다음 안내 확인
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
             <div className="glass-panel p-8 max-w-md">
                <h2 className="text-2xl font-black text-white mb-4">정답입니다!</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {mission.closingInstruction || "다음 목적지로 이동해 주세요."}
                </p>
             </div>
          </div>
        )}
      </main>

      {/* Fixed Footer */}
      <footer className="z-50 p-6 pb-8 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
        <div className="max-w-lg md:max-w-xl mx-auto w-full flex flex-col gap-4">
          <Link
            href={`/play/${token}/missions`}
            className="group w-full flex items-center justify-between bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <span className="text-xl tracking-tighter">미션 목록으로</span>
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
