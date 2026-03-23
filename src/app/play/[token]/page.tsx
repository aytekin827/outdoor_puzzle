"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowRight, XCircle } from "lucide-react";

export default function PlayLandingPage() {
  const { token } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
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

        if (data.qrToken.isUsed) {
          setError("이미 사용된 큐알 코드입니다.");
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

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    setClaiming(true);
    try {
      const res = await fetch("/api/session/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nickname: nickname.trim() })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "입장 실패");
        setClaiming(false);
        return;
      }
      
      // Navigate to start screen
      router.push(`/play/${token}/start`);
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
        <div className="glass-panel p-8 flex flex-col items-center max-w-sm w-full">
          <XCircle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">입장 불가</h1>
          <p className="text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-700 justify-center">
      <div className="glass-panel p-8 w-full max-w-sm mx-auto flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-primary font-bold tracking-widest text-sm mb-2 uppercase">Outdoor Escape</h2>
          <h1 className="text-3xl font-extrabold text-white leading-tight">{game?.title}</h1>
          <p className="text-slate-400 mt-2 text-sm">{game?.description}</p>
        </div>
        
        <form onSubmit={handleClaim} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="nickname" className="text-sm font-medium text-slate-300">
              요원 닉네임 입력
            </label>
            <input
              id="nickname"
              type="text"
              required
              maxLength={12}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="멋진 닉네임을 지어주세요"
              className="px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 flex-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={!nickname.trim() || claiming}
            className="mt-4 group relative flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {claiming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>게임 준비 완료</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
