"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProloguePage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<any>(null);
  const [slideIndex, setSlideIndex] = useState(0);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token]);

  const finishPrologue = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/game/prologue-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname })
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
    if (!game) return;

    if (game.prologueType === "slide") {
      const slides = JSON.parse(game.prologueSlidesJson || "[]");
      if (slideIndex < slides.length - 1) {
        setSlideIndex(prev => prev + 1);
      } else {
        setIsEnteringNickname(true);
      }
    } else {
      setIsEnteringNickname(true);
    }
  };

  const handleSkip = () => {
    setIsEnteringNickname(true);
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
                탭해서 다음으로 <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-white">
            <h2 className="text-xl font-bold mb-4">프롤로그 데이터가 없습니다</h2>
            <button onClick={() => setIsEnteringNickname(true)} className="mt-4 px-6 py-3 bg-primary text-black font-bold rounded-xl">임무 시작</button>
          </div>
        )}

        {/* Nickname Input Overlay */}
        {isEnteringNickname && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="glass-panel p-8 w-full max-w-sm flex flex-col gap-6 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                <h2 className="text-primary font-bold tracking-widest text-sm mb-2 uppercase italic">Secret Trail</h2>
                <h1 className="text-2xl font-black text-white leading-tight">이름 설정</h1>
                <p className="text-slate-400 mt-2 text-sm">게임에서 사용하실 닉네임을 입력해주세요.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임 입력 (최대 12자)"
                    autoFocus
                    className="px-4 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-center text-lg font-bold"
                  />
                </div>
                <button
                  onClick={finishPrologue}
                  disabled={!nickname.trim() || submitting}
                  className="group relative flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>시작하기</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
