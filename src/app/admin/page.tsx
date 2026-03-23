import { db } from "@/db";
import { games, players, qrTokens, missions, submissions } from "@/db/schema";
import { Users, QrCode, Gamepad2, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic'; // Prevent caching for dashboard

export default async function AdminDashboard() {
  const allGames = await db.select().from(games).all();
  const allPlayers = await db.select().from(players).all();
  const allTokens = await db.select().from(qrTokens).all();
  
  const usedTokens = allTokens.filter(t => t.isUsed).length;
  const activePlayers = allPlayers.filter(p => p.status === 'playing').length;
  const completedPlayers = allPlayers.filter(p => p.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
        <p className="text-slate-400">전체 시스템 현황을 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-blue-500/10 p-4 rounded-xl">
            <Gamepad2 className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold">Games</p>
            <p className="text-2xl font-bold text-white">{allGames.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-500/10 p-4 rounded-xl">
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold">Total Players</p>
            <p className="text-2xl font-bold text-white">{allPlayers.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-purple-500/10 p-4 rounded-xl">
            <QrCode className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold">QR Tokens List</p>
            <p className="text-2xl font-bold text-white">{usedTokens} / {allTokens.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-yellow-500/10 p-4 rounded-xl">
            <CheckCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold">Completed</p>
            <p className="text-2xl font-bold text-white">{completedPlayers}</p>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Players List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-lg font-bold text-white">최근 참가자</h2>
          </div>
          <div className="p-0 overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-300">
               <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
                 <tr>
                   <th className="px-6 py-4">닉네임</th>
                   <th className="px-6 py-4">상태</th>
                   <th className="px-6 py-4">진행 시간</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {allPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No players yet.</td>
                    </tr>
                 ) : allPlayers.map(p => {
                   let timeStr = "-";
                   if (p.startedAt && p.completedAt) {
                     const mins = Math.floor((p.completedAt - p.startedAt!)/60000);
                     timeStr = `${mins}분 소요`;
                   } else if (p.startedAt) {
                     timeStr = "진행중";
                   }

                   return (
                     <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                       <td className="px-6 py-4 font-bold text-white">{p.nickname}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-semibold ${
                           p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                           p.status === 'playing' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'
                         }`}>
                           {p.status.toUpperCase()}
                         </span>
                       </td>
                       <td className="px-6 py-4">{timeStr}</td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
          </div>
        </div>

        {/* QR Tokens Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-lg font-bold text-white">토큰 발급 현황</h2>
          </div>
          <div className="p-0 overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-300">
               <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase font-semibold">
                 <tr>
                   <th className="px-6 py-4">Token URL (ID)</th>
                   <th className="px-6 py-4">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {allTokens.map(t => (
                   <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                     <td className="px-6 py-4 font-mono text-xs">{t.token}</td>
                     <td className="px-6 py-4">
                       {t.isUsed ? (
                         <span className="text-slate-500 font-bold flex items-center gap-1">
                           <CheckCircle className="w-4 h-4" /> 사용됨
                         </span>
                       ) : (
                         <span className="text-emerald-400 font-bold flex items-center gap-1">
                           <CheckCircle className="w-4 h-4" /> 대기중
                         </span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

      </div>
    </div>
  );
}
