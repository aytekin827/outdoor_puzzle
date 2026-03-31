"use client";

import { ChevronRight, FileVideo, Image as ImageIcon, Play, Volume2 } from "lucide-react";
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 via-black to-black opacity-30 pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
      
      <div className="max-w-2xl w-full flex flex-col gap-10 flex-1 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-0.5 w-8 bg-primary rounded-full" />
             <span className="text-primary font-black uppercase tracking-widest text-[10px]">Mission Clear</span>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter sm:text-5xl leading-tight">
            새로운 지령
          </h1>
          <p className="text-slate-500 font-bold text-sm">정답을 맞히셨습니다. 다음 목적지를 확인하세요.</p>
        </header>

        {/* Media Content */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
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
               <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2.5 rounded-xl flex-shrink-0">
                    <Volume2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-white text-lg sm:text-xl font-bold leading-relaxed whitespace-pre-wrap">
                      {mission.closingInstruction}
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pb-16">
          <Link
            href={`/play/${token}/mission`}
            className="group relative w-full flex items-center justify-between bg-primary hover:bg-emerald-400 text-black px-10 py-7 rounded-2xl font-black transition-all shadow-2xl shadow-primary/40 hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            {/* Animated Background Pulse */}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            
            <div className="flex flex-col items-start relative z-10">
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1">Mission Completed</span>
              <span className="text-2xl italic tracking-tighter uppercase leading-none">새로운 미션 도전하기</span>
            </div>
            
            <div className="bg-black/10 group-hover:bg-black/20 p-3 rounded-2xl transition-colors relative z-10 border border-black/5">
              <ChevronRight className="w-8 h-8 stroke-[3.5px] animate-pulse" />
            </div>
          </Link>
          
          <p className="text-center mt-8 text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 opacity-50">
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            Next Phase Initialization
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
          </p>
        </div>
      </div>
    </div>
  );
}
