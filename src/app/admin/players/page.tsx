import { db } from "@/db";
import { players, submissions, games } from "@/db/schema";
import { eq, like, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function PlayersAdmin(
  props: {
    searchParams?: Promise<{ gameFilter?: string, statusFilter?: string, search?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const gameFilter = searchParams?.gameFilter || "";
  const statusFilter = searchParams?.statusFilter || "";
  const searchTerm = searchParams?.search || "";

  const allGames = await db.select().from(games).all();
  
  const conditions = [];
  if (gameFilter) conditions.push(eq(players.gameId, gameFilter));
  if (statusFilter) conditions.push(eq(players.status, statusFilter));
  if (searchTerm) conditions.push(like(players.nickname, `%${searchTerm}%`));

  const filteredPlayers = await db.select().from(players)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(players.startedAt))
    .all();

  const allSubmissions = await db.select().from(submissions).all();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await db.delete(submissions).where(eq(submissions.playerId, id)).run();
    await db.delete(players).where(eq(players.id, id)).run();
    revalidatePath("/admin/players");
    revalidatePath("/admin");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold">Players & Activity Log</h1>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Filters & Search</h2>
        <form className="flex flex-col sm:flex-row gap-4">
          <select name="gameFilter" defaultValue={gameFilter} className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1">
            <option value="">All Games</option>
            {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
          <select name="statusFilter" defaultValue={statusFilter} className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1">
            <option value="">All Statuses</option>
            <option value="ready">Ready (Not Started)</option>
            <option value="playing">Playing</option>
            <option value="completed">Completed</option>
          </select>
          <input name="search" defaultValue={searchTerm} placeholder="Search by Nickname..." className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1" />
          <button type="submit" className="bg-slate-800 text-white font-bold py-2 px-6 rounded hover:bg-slate-700">Filter</button>
        </form>
      </div>

      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center text-slate-500">No players found matching criteria.</div>
        ) : filteredPlayers.map(p => {
          const gInfo = allGames.find(g => g.id === p.gameId);
          const pSubs = allSubmissions.filter(s => s.playerId === p.id).sort((a,b) => b.submittedAt - a.submittedAt);
          
          let duration = "-";
          if (p.startedAt) {
            const end = p.completedAt || Date.now();
            const mins = Math.floor((end - p.startedAt!)/60000);
            duration = `${mins}m`;
          }

          return (
            <details key={p.id} className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary shrink-0">
                    {p.nickname.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      {p.nickname}
                      <span className="text-xs font-normal px-2 py-0.5 bg-slate-800 rounded">{p.status.toUpperCase()}</span>
                    </h3>
                    <p className="text-sm text-slate-400">{gInfo?.title} • {pSubs.length} Attempts • {duration}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-slate-500 text-sm group-open:hidden border border-slate-700 px-3 py-1 rounded">View Logs ▾</span>
                  <span className="text-slate-500 text-sm hidden group-open:block border border-slate-700 px-3 py-1 rounded">Hide Logs ▴</span>
                </div>
              </summary>
              <div className="px-6 pb-6 pt-2 border-t border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-300">Detailed Action Logs</h4>
                  <form action={handleDelete}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs bg-red-500/20 text-red-500 px-3 py-1.5 rounded hover:bg-red-500/30 font-bold">
                      Delete Player Data
                    </button>
                  </form>
                </div>
                {pSubs.length > 0 ? (
                  <ul className="space-y-2">
                    {pSubs.map(s => {
                      const date = new Date(s.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      return (
                        <li key={s.id} className="text-sm flex gap-4 bg-slate-950/50 p-2 rounded">
                          <span className="text-slate-500 w-32 shrink-0">{date}</span>
                          <span className={s.isCorrect ? "text-emerald-400 font-bold w-20" : "text-red-400 w-20"}>
                            {s.isCorrect ? "CORRECT" : "WRONG"}
                          </span>
                          <span className="text-slate-300">Answer given: <strong className="text-white">{s.submittedAnswer}</strong></span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No submissions logged yet.</p>
                )}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  );
}
