"use client";

import { ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Mission {
  id: string;
  title: string | null;
  closingInstruction: string | null;
  closingInstructionType: string | null;
  closingInstructionVideoUrl: string | null;
  closingInstructionSlidesJson: string | null;
  imageUrl?: string | null;
}

interface ClosingInstructionClientProps {
  token: string;
  mission: Mission;
  nextMissionId: string | null;
}

export function ClosingInstructionClient({ token, mission, nextMissionId }: ClosingInstructionClientProps) {
  const router = useRouter();
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

  const hasSlides = mission.closingInstructionType === "slide" && slides.length > 0;

  const handleNextStage = () => {
    if (nextMissionId) {
      router.push(`/play/${token}/mission?missionId=${nextMissionId}`);
    } else {
      router.push(`/play/${token}/complete`);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-transparent font-sans">
      {/* Fixed Header */}
      <header className="z-50 flex items-center justify-between h-16 px-6 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/play/${token}/missions`)}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white/90">{mission.title}</span>
          </div>
        </div>

        <div className="glass-panel px-3 py-1.5 font-black text-[11px] tracking-widest text-emerald-400 border-emerald-500/20 bg-emerald-500/10 uppercase">
          Mission Clear
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 hide-scrollbar animate-in fade-in duration-500 pb-24">
        <div className="w-full max-w-lg md:max-w-xl mx-auto flex flex-col gap-6">
          {hasSlides ? (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {slides.map((slide, index) => (
                <div key={index} className="flex flex-col gap-6">
                  {slide.description && (
                    <div className="glass-panel p-6 border border-white/10 shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-emerald-500/30" />
                        <span className="text-emerald-500 font-black text-[10px] tracking-widest uppercase">Part {index + 1}</span>
                        <div className="h-px flex-1 bg-emerald-500/30" />
                      </div>
                      <p className="text-white text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium text-center">
                        {slide.description}
                      </p>
                    </div>
                  )}
                  
                  {slide.imageUrl && (
                    <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black/20">
                      <img 
                        src={slide.imageUrl} 
                        alt={`Instruction ${index + 1}`} 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="glass-panel p-8 text-center border border-white/10 shadow-xl">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  정답입니다!
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <p className="text-slate-200 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
                  {mission.closingInstruction || "다음 목적지로 이동해 주세요."}
                </p>
              </div>

              {mission.imageUrl && (
                <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black/20">
                  <img 
                    src={mission.imageUrl} 
                    alt="Mission guidance" 
                    className="w-full h-auto object-contain" 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="z-50 p-4 pb-8 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
        <div className="max-w-lg md:max-w-xl mx-auto w-full flex flex-col gap-4">
          <button
            onClick={handleNextStage}
            className="group w-full flex items-center justify-between bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <span className="text-xl tracking-tighter">
              {nextMissionId ? "다음 미션으로" : "최종 완료"}
            </span>
            <div className="bg-black/10 group-hover:bg-black/20 p-2 rounded-lg transition-colors">
              <ChevronRight className="w-6 h-6 stroke-[3px]" />
            </div>
          </button>

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
