"use client";

import { Loader2, Play } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StartPage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [game, setGame] = useState<{ title: string; description: string } | null>(null);
  const [player, setPlayer] = useState<{ nickname: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/game/by-token/${token}`);
        const data = await res.json();
        if (res.ok) {
          setGame(data.game);
          setPlayer(data.player);
        } else {
          router.push(`/play/${token}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, router]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await fetch("/api/game/start", { method: "POST" });
      router.push(`/play/${token}/missions`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-6 relative justify-center animate-in zoom-in-95 duration-500">
      <div className="glass-panel p-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
          <Play className="w-10 h-10 text-primary ml-1" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">{game?.title}</h1>
        <p className="text-slate-300 text-sm mb-8 leading-relaxed">
          환영합니다, <span className="text-primary font-bold">{player?.nickname}</span>님.<br />
          {game?.description}
        </p>

        <div className="w-full space-y-4 text-left bg-black/20 p-4 rounded-xl mb-8">
          <h3 className="text-sm font-semibold text-white">주의사항</h3>
          <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
            <li>주변 환경에 주의하며 안전하게 이동하세요.</li>
            <li>다른 사람들에게 정답을 발설하지 마세요.</li>
            <li>브라우저를 닫아도 게임은 이어서 진행할 수 있습니다.</li>
          </ul>
        </div>

        <button
          onClick={handleStart}
          disabled={starting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : "미션 시작하기"}
        </button>
      </div>
    </div>
  );
}
