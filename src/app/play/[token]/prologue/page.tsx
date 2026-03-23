"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

export default function ProloguePage() {
  const { token } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<any>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/game/by-token/${token}`);
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();
        setGame(data.game);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const handleNext = () => {
    if (!game) return;
    if (game.prologueType === "slide") {
      const slides = JSON.parse(game.prologueSlidesJson || "[]");
      if (slideIndex < slides.length - 1) {
        setSlideIndex(prev => prev + 1);
      } else {
        router.push(`/play/${token}/mission`);
      }
    } else {
      router.push(`/play/${token}/mission`);
    }
  };

  const handleSkip = () => {
    router.push(`/play/${token}/mission`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to safely parse slides
  const slides = game?.prologueType === "slide" && game.prologueSlidesJson
    ? JSON.parse(game.prologueSlidesJson)
    : [];

  return (
    <div className="flex flex-col flex-1 relative bg-black/50">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={handleSkip} className="bg-black/40 text-white/70 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
          SKIP
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {game?.prologueType === "video" && game?.prologueVideoUrl ? (
          <video 
            src={game.prologueVideoUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-cover animate-in fade-in duration-1000"
            onEnded={() => router.push(`/play/${token}/mission`)}
          />
        ) : game?.prologueType === "slide" && slides.length > 0 ? (
          <div className="w-full h-full relative" onClick={handleNext}>
            {/* Using Next Image or standard img */}
            <img 
              key={slideIndex}
              src={slides[slideIndex]} 
              alt="Prologue slide" 
              className="w-full h-full object-cover animate-in fade-in slide-in-from-right-10 duration-500"
            />
            {/* Instruction Overlay */}
            <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/60 text-white/90 text-sm px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-md">
                탭해서 다음으로 <ArrowRight className="w-4 h-4"/>
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-white">
            <h2 className="text-xl font-bold mb-4">프롤로그 데이터가 없습니다</h2>
            <button onClick={handleNext} className="mt-4 px-6 py-3 bg-primary text-black font-bold rounded-xl">임무 시작</button>
          </div>
        )}
      </div>
    </div>
  );
}
