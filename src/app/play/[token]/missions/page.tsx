"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Lock, CheckCircle2, ChevronRight, Map } from "lucide-react";

type MissionItem = {
  id: string;
  type: "prologue" | "mission";
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
};

export default function MissionListPage() {
  const { token } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<MissionItem[]>([]);

  useEffect(() => {
    async function fetchMissions() {
      try {
        const res = await fetch("/api/game/mission-list");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMissions(data.missions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMissions();
  }, []);

  const handleCardClick = (mission: MissionItem) => {
    if (mission.isLocked) return;
    
    if (mission.type === "prologue") {
      router.push(`/play/${token}/prologue`);
    } else {
      // For missions, the mission page itself handles redirecting to the current mission,
      // but if we want to allow re-visiting completed missions, we might need a mission-specific route.
      // For now, let's just go to the generic /mission which takes them to the current one.
      router.push(`/play/${token}/mission`);
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
    <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-700">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Map className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Mission Map</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">미션 리스트</h1>
        <p className="text-slate-400 text-sm mt-1">임무를 선택하여 진행하세요.</p>
      </header>

      <div className="flex flex-col gap-4 max-w-lg mx-auto w-full pb-12">
        {missions.map((mission, index) => (
          <button
            key={mission.id}
            disabled={mission.isLocked}
            onClick={() => handleCardClick(mission)}
            className={`
              relative w-full text-left transition-all duration-300
              glass-panel overflow-hidden group
              ${mission.isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'}
              ${!mission.isLocked && !mission.isCompleted ? 'border-primary/50 shadow-lg shadow-primary/10' : ''}
            `}
          >
            {/* Background Accent */}
            {!mission.isLocked && !mission.isCompleted && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />
            )}

            <div className="p-5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
                  ${mission.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 
                    mission.isLocked ? 'bg-slate-800 text-slate-500' : 'bg-primary/20 text-primary'}
                `}>
                  {mission.isLocked ? <Lock className="w-5 h-5" /> : index + 1}
                </div>
                
                <div>
                  <h3 className={`font-bold transition-colors ${mission.isLocked ? 'text-slate-500' : 'text-white'}`}>
                    {mission.isLocked ? '잠겨 있는 미션' : mission.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {mission.isCompleted ? '수행 완료' : mission.isLocked ? '이전 미션을 완료하세요' : '지금 수행 가능'}
                  </p>
                </div>
              </div>

              {!mission.isLocked && (
                <div className="flex items-center">
                  {mission.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
