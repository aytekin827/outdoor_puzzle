"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Lock, CheckCircle2, ChevronRight, Map } from "lucide-react";
import { useRef } from "react";

type MissionItem = {
  id: string;
  type: "prologue" | "mission" | "epilogue";
  title: string;
  description: string;
  imageUrl: string | null;
  isCompleted: boolean;
  isLocked: boolean;
};

export default function MissionListPage() {
  const { token } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<MissionItem[]>([]);
  
  // Drag-to-scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const moveDistance = useRef(0);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    moveDistance.current = 0;
    scrollRef.current.classList.add('grabbing');
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    scrollRef.current?.classList.remove('grabbing');
  };

  const handleMouseUp = () => {
    // We delay resetting isDragging slightly or check distance in click handler
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
    scrollRef.current?.classList.remove('grabbing');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Slightly lower multiplier for better control
    moveDistance.current = Math.abs(x - startX.current);
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
      }
    });
  };

  const handleCardClick = (mission: MissionItem) => {
    // If the mouse moved more than 10px, don't trigger click
    if (moveDistance.current > 10) return;
    
    if (mission.isLocked) return;
    
    if (mission.type === "prologue") {
      router.push(`/play/${token}/prologue`);
    } else if (mission.type === "epilogue") {
      router.push(`/play/${token}/complete`);
    } else {
      router.push(`/play/${token}/mission?missionId=${mission.id}`);
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
    <div className="flex-1 flex flex-col animate-in fade-in duration-700 overflow-hidden bg-slate-950 select-none">
      <header className="p-6 pb-2">
        <div className="flex items-center gap-2 text-primary mb-1">
          <Map className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mission Map</span>
        </div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter">임무 목록</h1>
      </header>

      {/* Horizontal Slider Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar flex items-center px-6 gap-6 cursor-grab active:cursor-grabbing"
      >
        {missions.map((mission, index) => (
          <div 
            key={mission.id} 
            className="snap-center shrink-0 w-[85vw] max-w-[340px] aspect-[3/4] relative pointer-events-auto"
          >
            <button
              disabled={mission.isLocked}
              onClick={() => handleCardClick(mission)}
              className={`
                relative w-full h-full text-left transition-all duration-500 rounded-[2rem]
                overflow-hidden flex flex-col group
                ${mission.isLocked ? 'opacity-40 grayscale pointer-events-none' : 'active:scale-95'}
                ${!mission.isLocked && !mission.isCompleted ? 'ring-2 ring-primary ring-offset-4 ring-offset-slate-950 shadow-2xl shadow-primary/20' : 'border border-white/10'}
                bg-slate-900
              `}
            >
              {/* Image Section */}
              <div className="relative h-[55%] w-full overflow-hidden bg-slate-800 pointer-events-none">
                {mission.imageUrl ? (
                  <img 
                    src={mission.imageUrl} 
                    alt={mission.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <Map className="w-12 h-12 text-slate-700" />
                  </div>
                )}
                
                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`
                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md
                    ${mission.isCompleted ? 'bg-emerald-500/80 text-white' : 
                      mission.isLocked ? 'bg-slate-950/60 text-slate-400' : 'bg-primary/80 text-white'}
                  `}>
                    {mission.isCompleted ? 'Clear' : mission.isLocked ? 'Locked' : 'Active'}
                  </div>
                </div>

                {mission.isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center border border-white/10">
                      <Lock className="w-6 h-6 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6 flex flex-col bg-slate-900 relative pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-black text-sm italic">#0{index + 1}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase tracking-tight">
                  {mission.isLocked ? '비밀 임무' : mission.title}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                  {mission.isLocked ? '이전 단계를 완료하여 임무를 해제하세요.' : (mission.description || '임무에 대한 설명이 없습니다.')}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  {mission.isCompleted ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      COMPLETED
                    </div>
                  ) : !mission.isLocked ? (
                    <div className="flex items-center gap-1 text-primary font-black text-xs group-hover:gap-2 transition-all">
                      GO MISSION <ChevronRight className="w-4 h-4" />
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          </div>
        ))}
        {/* Spacer for end scroll padding */}
        <div className="shrink-0 w-6 h-full" />
      </div>

      <footer className="p-8 text-center">
        <div className="inline-flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-full border border-white/5">
          {missions.map((m, i) => (
            <div 
              key={m.id}
              className={`w-1.5 h-1.5 rounded-full transition-all ${m.isCompleted ? 'bg-emerald-500' : m.isLocked ? 'bg-slate-800' : 'bg-primary scale-150'}`}
            />
          ))}
        </div>
      </footer>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .grabbing {
          cursor: grabbing !important;
          scroll-snap-type: none !important;
          scroll-behavior: auto !important;
        }
        .grabbing > * {
          scroll-snap-align: none !important;
        }
      `}</style>
    </div>
  );
}
