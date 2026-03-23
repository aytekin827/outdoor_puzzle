"use client";

import { useEffect, useState } from "react";
import { Award, Clock, Target, Loader2 } from "lucide-react";

export default function CompletePage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch("/api/game/result");
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Format time taken
  const ms = result?.timeSpentMs || 0;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);

  const totalAttempts = result?.missionStats?.reduce((acc: number, m: any) => acc + m.attempts, 0) || 0;
  const totalMissions = result?.missionStats?.length || 0;

  return (
    <div className="flex-1 flex flex-col justify-center p-6 relative animate-in slide-in-from-bottom-10 fade-in duration-700">
      
      {/* Background confetti light effect */}
      <div className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay pointer-events-none" />

      <div className="glass-panel p-8 flex flex-col items-center w-full max-w-sm mx-auto relative overflow-hidden z-10 border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
        
        <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-yellow-500/30">
          <Award className="w-12 h-12 text-yellow-500" />
        </div>

        <h2 className="text-primary font-bold tracking-widest text-sm mb-2 uppercase">MISSION COMPLETED</h2>
        <h1 className="text-3xl font-extrabold text-white mb-2 text-center leading-tight">임무 완수</h1>
        <p className="text-slate-300 text-center mb-8">수고하셨습니다, <span className="font-bold text-white">{result?.nickname}</span> 요원님.</p>

        {/* Stats */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="bg-black/30 p-4 rounded-xl flex flex-col items-center border border-white/5">
            <Clock className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-xs text-slate-400 mb-1">소요 시간</span>
            <span className="text-xl font-bold text-white">{minutes}분 {seconds}초</span>
          </div>
          <div className="bg-black/30 p-4 rounded-xl flex flex-col items-center border border-white/5">
            <Target className="w-6 h-6 text-rose-400 mb-2" />
            <span className="text-xs text-slate-400 mb-1">총 시도 횟수</span>
            <span className="text-xl font-bold text-white">{totalAttempts}회</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="w-full">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 ml-1">상세 기록</h3>
          <div className="space-y-2">
            {result?.missionStats?.map((m: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-200 truncate pr-2 flex-1"><span className="text-slate-500 mr-2">{idx+1}.</span>{m.title}</span>
                <span className="font-medium text-slate-400 flex-shrink-0">{m.attempts}회 시도</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
