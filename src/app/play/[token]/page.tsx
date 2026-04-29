"use client";

import { ArrowRight, Loader2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlayLandingPage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [game, setGame] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    async function checkToken() {
      try {
        const res = await fetch(`/api/game/by-token/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "알 수 없는 오류가 발생했습니다.");
          return;
        }

        if (data.player) {
          router.push(`/play/${token}/missions`);
          return;
        }

        if (data.qrToken.isUsed) {
          // Try to resume session for this token
          try {
            const resumeRes = await fetch("/api/session/resume", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token })
            });

            if (resumeRes.ok) {
              router.push(`/play/${token}/missions`);
              return;
            }
          } catch (err) {
            console.error("Failed to resume session:", err);
          }

          setError("유효하지 않은 코드입니다.");
          return;
        }

        setGame(data.game);
      } catch (err) {
        setError("서버와의 통신에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    checkToken();
  }, [token]);

  const handleClaim = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();

    setClaiming(true);
    try {
      const res = await fetch("/api/session/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "입장 실패");
        setClaiming(false);
        return;
      }

      // Navigate directly to prologue
      router.push(`/play/${token}/prologue`);
    } catch (err) {
      setError("입장 중 오류가 발생했습니다.");
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-sm text-slate-400">게임 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-8 flex flex-col items-center max-w-sm md:max-w-lg w-full">
          <XCircle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">입장 불가</h1>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-700 justify-center">
      <div className="glass-panel p-8 w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-primary font-bold tracking-widest text-sm mb-2 uppercase italic">secret trail</h2>
          <h1 className="text-3xl font-extrabold text-white leading-tight">{game?.title}</h1>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <p className="text-slate-300 text-center leading-relaxed">
            {game?.description}<br />
            준비가 되셨나요?
          </p>
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="group relative flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {claiming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>게임 시작하기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
