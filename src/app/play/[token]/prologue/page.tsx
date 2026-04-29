"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Slide {
  imageUrl: string;
  description: string;
}

export default function ProloguePage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [showText, setShowText] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isEnteringNickname, setIsEnteringNickname] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/game/by-token/${token}`);
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();
        setGame(data.game);
        setPlayer(data.player);
        if (data.player?.nickname) {
          setNickname(data.player.nickname);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  // Helper to safely parse slides
  const slides: Slide[] = (() => {
    if (!game?.prologueSlidesJson) return [];
    try {
      const parsed = JSON.parse(game.prologueSlidesJson);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(s => typeof s === 'string' ? { imageUrl: s, description: "" } : s);
    } catch {
      return [];
    }
  })();

  const finishPrologue = async (finalNickname: string) => {
    setSubmitting(true);
    try {
      await fetch("/api/game/prologue-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: finalNickname })
      });
      router.push(`/play/${token}/missions`);
    } catch (err) {
      console.error(err);
      router.push(`/play/${token}/missions`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (slides.length === 0) {
      if (player?.nickname) {
        finishPrologue(player.nickname);
      } else {
        setIsEnteringNickname(true);
      }
      return;
    }

    const currentSlide = slides[slideIndex];
    
    // If text is not shown and there is a description, show it first
    if (!showText && currentSlide.description) {
      setShowText(true);
      return;
    }

    // Otherwise, move to next slide or nickname input
    if (slideIndex < slides.length - 1) {
      setSlideIndex(prev => prev + 1);
      setShowText(false);
    } else {
      if (player?.nickname) {
        finishPrologue(player.nickname);
      } else {
        setIsEnteringNickname(true);
      }
    }
  };

  const handleSkip = () => {
    if (player?.nickname) {
      finishPrologue(player.nickname);
    } else {
      setIsEnteringNickname(true);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentSlide = slides[slideIndex];

  return (
    <div className="flex flex-col flex-1 relative bg-black overflow-hidden h-full">
      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-[60]">
        <button onClick={handleSkip} className="bg-black/40 text-white/70 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
          SKIP
        </button>
      </div>

      <div className="flex-1 relative w-full h-full" onClick={handleNext}>
        {slides.length > 0 ? (
          <>
            {/* Background Image */}
            <img
              key={currentSlide.imageUrl}
              src={currentSlide.imageUrl}
              alt="Prologue background"
              className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
            />
            
            {/* Overlay Gradient (only when text is shown) */}
            <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${showText ? "opacity-100" : "opacity-0"}`} />

            {/* Text Content */}
            {showText && currentSlide.description && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div 
                  className="w-full max-w-lg max-h-[70vh] overflow-y-auto hide-scrollbar bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl"
                  onClick={(e) => e.stopPropagation()} // Allow scrolling without triggering next
                >
                  <p className="text-white text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-medium">
                    {currentSlide.description}
                  </p>
                  
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={handleNext}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                      {slideIndex < slides.length - 1 ? "다음 슬라이드" : "이름 설정하기"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Click Guide */}
            {!showText && (
              <div className="absolute bottom-12 left-0 right-0 text-center animate-bounce">
                <span className="bg-black/60 text-white/90 text-xs px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-md border border-white/10 font-bold tracking-tight">
                  화면을 탭하여 계속하기
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-white">
            <div className="glass-panel p-8">
              <h2 className="text-xl font-bold mb-4">프롤로그가 없습니다</h2>
              <button onClick={() => setIsEnteringNickname(true)} className="mt-4 px-8 py-4 bg-emerald-500 text-black font-black rounded-xl">임무 시작하기</button>
            </div>
          </div>
        )}

        {/* Nickname Input Overlay */}
        {isEnteringNickname && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={(e) => e.stopPropagation()}>
            <div className="glass-panel p-8 w-full max-w-sm flex flex-col gap-6 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                <h2 className="text-emerald-500 font-bold tracking-[0.2em] text-[10px] mb-2 uppercase">Secret Trail</h2>
                <h1 className="text-2xl font-black text-white leading-tight">플레이어 이름</h1>
                <p className="text-slate-400 mt-2 text-xs">게임에서 사용하실 이름을 입력해주세요.</p>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="이름 입력 (최대 12자)"
                  autoFocus
                  className="px-4 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all text-center text-lg font-black"
                />
                <button
                  onClick={() => finishPrologue(nickname)}
                  disabled={!nickname.trim() || submitting}
                  className="group relative flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  {submitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>임무 수락</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
