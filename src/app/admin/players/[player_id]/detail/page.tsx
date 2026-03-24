import { db } from "@/db";
import { players, games, submissions, missions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, CheckCircle, XCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PlayerDetailPage({ params }: { params: { player_id: string } }) {
  const playerRecord = await db.select().from(players).where(eq(players.id, params.player_id)).get();
  
  if (!playerRecord) {
    redirect("/admin/players");
  }

  const game = await db.select().from(games).where(eq(games.id, playerRecord.gameId)).get();
  
  const allSubmissions = await db.select({
    id: submissions.id,
    submittedAnswer: submissions.submittedAnswer,
    isCorrect: submissions.isCorrect,
    submittedAt: submissions.submittedAt,
    missionTitle: missions.title,
    orderIndex: missions.orderIndex
  })
  .from(submissions)
  .leftJoin(missions, eq(submissions.missionId, missions.id))
  .where(eq(submissions.playerId, playerRecord.id))
  .all();

  async function handleDelete() {
    "use server";
    // We should also delete submissions here or setup cascades
    await db.delete(submissions).where(eq(submissions.playerId, playerRecord!.id)).run();
    await db.delete(players).where(eq(players.id, playerRecord!.id)).run();
    redirect("/admin/players");
  }

  const mins = (playerRecord.startedAt && playerRecord.completedAt) 
    ? Math.floor((playerRecord.completedAt - playerRecord.startedAt) / 60000) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <Link href="/admin/players" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Players
        </Link>
        <form action={handleDelete}>
          <button type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all">
            <Trash2 className="w-4 h-4" /> Reset / Delete Player
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Basic Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-2">{playerRecord.nickname}</h1>
            <div className="space-y-4 text-sm mt-4 border-t border-slate-800 pt-4">
              <p className="flex justify-between"><span className="text-slate-400">Game:</span> <span className="font-bold text-primary">{game?.title}</span></p>
              <p className="flex justify-between"><span className="text-slate-400">Status:</span> <span className="uppercase font-bold text-slate-200">{playerRecord.status}</span></p>
              {mins > 0 && <p className="flex justify-between"><span className="text-slate-400">Completion Time:</span> <span className="font-bold text-emerald-400">{mins} mins</span></p>}
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent Submissions</h2>
          
          <div className="space-y-4">
            {allSubmissions.length === 0 ? (
              <p className="text-slate-400 text-sm">No puzzle submissions yet.</p>
            ) : allSubmissions.map((sub, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary font-bold mb-1">Mission #{sub.orderIndex}</p>
                  <p className="text-sm text-slate-300">"{sub.submittedAnswer}"</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {sub.isCorrect ? <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold"><CheckCircle className="w-4 h-4"/> Correct</span> : <span className="text-red-400 flex items-center gap-1 text-xs font-bold"><XCircle className="w-4 h-4"/> Incorrect</span>}
                  <span className="text-slate-500 text-xs">{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
