import { db } from "@/db";
import { 
  games, 
  qrTokens, 
  players, 
  playSessions, 
  eventLogs, 
  locationLogs, 
  postGameSurveys, 
  completionPhotos, 
  submissions, 
  missionSessions 
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Save } from "lucide-react";
import { redirect } from "next/navigation";
import { DeleteTokenButton } from "./DeleteTokenButton";

export const dynamic = 'force-dynamic';

export default async function TokenDetailPage({ params }: { params: Promise<{ token_id: string }> }) {
  const { token_id } = await params;
  const tokenRecord = await db.select().from(qrTokens).where(eq(qrTokens.id, token_id)).get();

  if (!tokenRecord) {
    redirect("/admin/tokens");
  }

  const allGames = await db.select().from(games).all();

  async function handleUpdate(formData: FormData) {
    "use server";
    const gameId = formData.get("gameId") as string;
    const token = formData.get("token") as string;
    const isUsed = formData.get("isUsed") === "on";

    await db.update(qrTokens).set({
      gameId,
      token,
      isUsed
    }).where(eq(qrTokens.id, tokenRecord!.id)).run();

    redirect("/admin/tokens");
  }

  async function handleDelete() {
    "use server";
    const tid = tokenRecord!.id;

    // 1. Get player IDs and session IDs associated with this token
    const playersList = await db.select({ id: players.id }).from(players).where(eq(players.qrTokenId, tid)).all();
    const playerIds = playersList.map(p => p.id);
    
    const sessionsList = await db.select({ id: playSessions.id }).from(playSessions).where(eq(playSessions.qrTokenId, tid)).all();
    const sessionIds = sessionsList.map(s => s.id);

    if (sessionIds.length > 0) {
      // 2. Delete logs and surveys
      await db.delete(eventLogs).where(inArray(eventLogs.playSessionId, sessionIds)).run();
      await db.delete(locationLogs).where(inArray(locationLogs.playSessionId, sessionIds)).run();
      await db.delete(postGameSurveys).where(inArray(postGameSurveys.playSessionId, sessionIds)).run();
      await db.delete(completionPhotos).where(inArray(completionPhotos.playSessionId, sessionIds)).run();
      await db.delete(submissions).where(inArray(submissions.playSessionId, sessionIds)).run();
      await db.delete(missionSessions).where(inArray(missionSessions.playSessionId, sessionIds)).run();
      
      // 3. Delete sessions
      await db.delete(playSessions).where(inArray(playSessions.id, sessionIds)).run();
    }

    if (playerIds.length > 0) {
      // 4. Delete players
      await db.delete(players).where(inArray(players.id, playerIds)).run();
    }

    // 5. Finally delete the token
    await db.delete(qrTokens).where(eq(qrTokens.id, tid)).run();

    redirect("/admin/tokens");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-end items-end">
        <DeleteTokenButton tokenId={tokenRecord.id} onDelete={handleDelete} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">토큰(Token) 수정</h1>
          <p className="text-slate-400 font-mono text-xs mt-2 uppercase">{tokenRecord.id}</p>
        </div>

        <form action={handleUpdate} className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">연결된 게임</label>
            <select name="gameId" defaultValue={tokenRecord.gameId} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10">
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Token ID String</label>
            <input name="token" defaultValue={tokenRecord.token} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex gap-4 items-center p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
            <input type="checkbox" id="isUsed" name="isUsed" defaultChecked={tokenRecord.isUsed ?? false} className="w-5 h-5 accent-primary bg-slate-900 border-slate-700 rounded" />
            <label htmlFor="isUsed" className="text-sm font-semibold text-white cursor-pointer select-none">
              사용됨
            </label>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button type="submit" className="w-full px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10">
              <Save className="w-5 h-5" /> 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
