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
    const finishPrologue = async () => {
      try {
        await fetch("/api/game/prologue-complete", { method: "POST" });
        router.push(`/play/${token}/missions`);
      } catch (err) {
        console.error(err);
        router.push(`/play/${token}/missions`);
      }
    };

    if (game.prologueType === "slide") {
      const slides = JSON.parse(game.prologueSlidesJson || "[]");
      if (slideIndex < slides.length - 1) {
        setSlideIndex(prev => prev + 1);
      } else {
        finishPrologue();
      }
    } else {
      finishPrologue();
    }
  };

  const handleSkip = async () => {
    try {
      await fetch("/api/game/prologue-complete", { method: "POST" });
      router.push(`/play/${token}/missions`);
    } catch (err) {
      router.push(`/play/${token}/missions`);
    }
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

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = game?.prologueVideoUrl ? getYouTubeId(game.prologueVideoUrl) : null;

  return (
    <div className="flex flex-col flex-1 relative bg-black">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={handleSkip} className="bg-black/40 text-white/70 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
          SKIP
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {game?.prologueType === "video" && game?.prologueVideoUrl ? (
          youtubeId ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                title="Prologue Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <div className="absolute bottom-12 left-0 right-0 flex justify-center pointer-events-none">
                <button 
                  onClick={handleNext} 
                  className="pointer-events-auto group flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  임무 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <video 
              src={game.prologueVideoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-cover animate-in fade-in duration-1000"
              onEnded={handleSkip}
            />
          )
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
