"use client";

import { User, Users, Star, Brain, MessageSquare, TrendingUp, ChevronRight } from "lucide-react";

type SurveyRow = {
  id: string;
  gameId: string;
  nickname: string;
  gameTitle: string;
  groupType: string;
  groupTypeLabel: string;
  ageRange: string;
  gender: string;
  satisfactionScore: number;
  difficultyScore: number;
  comment: string;
  submittedAt: number;
};

interface AnalyticsProps {
  data: SurveyRow[];
}

export function SurveysAnalytics({ data }: AnalyticsProps) {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl">
        <p className="text-slate-500">분석할 설문 데이터가 아직 없습니다.</p>
      </div>
    );
  }

  // Helper: Count distribution
  const getDistribution = (key: keyof SurveyRow) => {
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      const val = String(row[key]);
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const satisfactionDist = Array.from({ length: 5 }, (_, i) => {
    const score = i + 1;
    const count = data.filter((r) => r.satisfactionScore === score).length;
    return { score, count, percent: (count / data.length) * 100 };
  }).reverse();

  const difficultyDist = Array.from({ length: 5 }, (_, i) => {
    const score = i + 1;
    const count = data.filter((r) => r.difficultyScore === score).length;
    return { score, count, percent: (count / data.length) * 100 };
  }).reverse();

  const genderLabels: Record<string, string> = {
    male: "남성",
    female: "여성",
    other: "기타",
    prefer_not_to_say: "미응답",
  };

  const avgSatisfaction = (data.reduce((s, r) => s + r.satisfactionScore, 0) / data.length).toFixed(1);
  const avgDifficulty = (data.reduce((s, r) => s + r.difficultyScore, 0) / data.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="총 설문" 
          value={data.length} 
          icon={<Users className="w-5 h-5 text-blue-400" />} 
          color="bg-blue-500/10" 
        />
        <StatCard 
          title="평균 만족도" 
          value={avgSatisfaction} 
          suffix="/5.0" 
          icon={<Star className="w-5 h-5 text-yellow-500" />} 
          color="bg-yellow-500/10" 
        />
        <StatCard 
          title="평균 난이도" 
          value={avgDifficulty} 
          suffix="/5.0" 
          icon={<Brain className="w-5 h-5 text-purple-500" />} 
          color="bg-purple-500/10" 
        />
        <StatCard 
          title="피드백 작성률" 
          value={((data.filter(r => r.comment).length / data.length) * 100).toFixed(0)} 
          suffix="%" 
          icon={<MessageSquare className="w-5 h-5 text-emerald-500" />} 
          color="bg-emerald-500/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-white uppercase tracking-tighter italic">만족도 분포</h3>
          </div>
          <div className="space-y-4">
            {satisfactionDist.map((item) => (
              <div key={item.score} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-400">{item.score}점</span>
                  <span className="text-white">{item.count}명 ({item.percent.toFixed(0)}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-white uppercase tracking-tighter italic">난이도 분포</h3>
          </div>
          <div className="space-y-4">
            {difficultyDist.map((item) => (
              <div key={item.score} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span className="text-slate-400">{item.score}점</span>
                  <span className="text-white">{item.count}명 ({item.percent.toFixed(0)}%)</span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gender Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
          <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            성별 비중
          </h4>
          <div className="flex items-end gap-2 h-32 mb-4">
            {getDistribution("gender").map(([gender, count]) => {
                const percent = (count / data.length) * 100;
                return (
                    <div key={gender} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full bg-blue-500/20 rounded-t-lg relative group transition-all hover:bg-blue-500/40 border-x border-t border-blue-500/30" 
                             style={{ height: `${Math.max(percent, 5)}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white font-bold text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                {count}명 ({percent.toFixed(0)}%)
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{genderLabels[gender] || gender}</span>
                    </div>
                )
            })}
          </div>
        </div>

        {/* Age Range Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
          <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            주요 연령대 Ranking
          </h4>
          <div className="space-y-4">
            {getDistribution("ageRange").slice(0, 4).map(([age, count], idx) => (
                <div key={age} className="flex items-center gap-4">
                    <span className="text-primary font-black italic text-xl w-6">0{idx + 1}</span>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-white mb-1">{age}</div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${(count / data.length) * 100}%` }} />
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 w-8 text-right">{count}회</span>
                </div>
            ))}
          </div>
        </div>

        {/* Group Type Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg">
          <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            인기 그룹 유형
          </h4>
          <div className="space-y-3">
            {getDistribution("groupTypeLabel").slice(0, 3).map(([type, count]) => (
                <div key={type} className="group flex flex-col gap-1">
                    <div className="flex justify-between items-center bg-slate-800/30 group-hover:bg-slate-800/60 transition-colors p-3.5 rounded-2xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-lg">
                                <Users className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-white truncate max-w-[120px]">{type}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black text-blue-400">{count}명</span>
                            <span className="text-[9px] font-bold text-slate-600">{((count/data.length)*100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Comments Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white tracking-tight uppercase italic leading-none">플레이어 생생 후기</h3>
                   <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Voice from the ground</p>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase">Recent Feedbacks</span>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-slate-800 md:divide-x divide-y lg:divide-y-0">
            {data.filter(r => r.comment).slice(0, 4).map((row) => (
                <div key={row.id} className="p-8 hover:bg-slate-800/30 transition-all duration-300 group">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-blue-600/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary shadow-lg shadow-primary/5">
                            {row.nickname[0]}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200">{row.nickname}</span>
                            <span className="text-[9px] font-bold text-slate-600 uppercase italic">Verified Player</span>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute -top-1 -left-2 text-2xl text-slate-800 font-serif">"</span>
                        <p className="text-sm text-slate-400 italic leading-relaxed pl-2 relative z-10 line-clamp-4 group-hover:text-slate-300 transition-colors">
                            {row.comment}
                        </p>
                        <span className="absolute -bottom-4 -right-1 text-2xl text-slate-800 font-serif">"</span>
                    </div>
                </div>
            ))}
        </div>
        {data.filter(r => r.comment).length > 4 && (
            <div className="p-4 bg-slate-900/50 border-t border-slate-800 text-center">
                <button className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto">
                    View More Comments <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, suffix = "", icon, color }: { title: string, value: any, suffix?: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all group relative overflow-hidden shadow-xl">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color.replace('/10', '/30')} blur-[60px] opacity-20 -mr-16 -mt-16 transition-all group-hover:scale-150 duration-700`} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-black text-white italic tracking-tighter animate-in fade-in duration-1000">{value}</span>
            <span className="text-xs font-bold text-slate-500 uppercase">{suffix}</span>
          </div>
        </div>
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>
    </div>
  );
}
