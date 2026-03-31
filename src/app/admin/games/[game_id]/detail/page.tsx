import { db } from "@/db";
import { 
  completionPhotos, 
  eventLogs, 
  games, 
  locationLogs, 
  missionSessions, 
  missions, 
  playSessions, 
  players, 
  postGameSurveys, 
  qrTokens, 
  submissions 
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PrologueEditor } from "../../PrologueEditor";
import { EpilogueEditor } from "../../EpilogueEditor";

export const dynamic = 'force-dynamic';

export default async function GameDetailPage({ params }: { params: Promise<{ game_id: string }> }) {
  const { game_id } = await params;
  const game = await db.select().from(games).where(eq(games.id, game_id)).get();

  if (!game) {
    redirect("/admin/games");
  }

  const linkedMissions = await db.select().from(missions).where(eq(missions.gameId, game.id)).all();

  async function handleUpdate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const prologueType = formData.get("prologueType") as string;
    const prologueVideoUrl = formData.get("prologueVideoUrl") as string;
    const prologueSlidesJson = formData.get("prologueSlidesJson") as string;
    const epilogueType = formData.get("epilogueType") as string;
    const epilogueContent = formData.get("epilogueContent") as string;
    const epilogueSlidesJson = formData.get("epilogueSlidesJson") as string;
    const isActive = formData.get("isActive") === "on";

    await db.update(games).set({
      title,
      description,
      prologueType,
      prologueVideoUrl,
      prologueSlidesJson,
      epilogueType,
      epilogueContent,
      epilogueSlidesJson,
      isActive,
    }).where(eq(games.id, game_id)).run();

    redirect("/admin/games");
  }

  async function handleDelete() {
    "use server";
    
    // 1. Get dependent IDs
    const playSessionIds = (await db.select({ id: playSessions.id }).from(playSessions).where(eq(playSessions.gameId, game_id)).all()).map(s => s.id);
    const missionIds = (await db.select({ id: missions.id }).from(missions).where(eq(missions.gameId, game_id)).all()).map(m => m.id);

    // 2. Delete logs and analytics tied to sessions
    if (playSessionIds.length > 0) {
      await db.delete(eventLogs).where(inArray(eventLogs.playSessionId, playSessionIds)).run();
      await db.delete(locationLogs).where(inArray(locationLogs.playSessionId, playSessionIds)).run();
      await db.delete(completionPhotos).where(inArray(completionPhotos.playSessionId, playSessionIds)).run();
      await db.delete(postGameSurveys).where(inArray(postGameSurveys.playSessionId, playSessionIds)).run();
      await db.delete(submissions).where(inArray(submissions.playSessionId, playSessionIds)).run();
      await db.delete(missionSessions).where(inArray(missionSessions.playSessionId, playSessionIds)).run();
    }

    // 3. Delete mission sessions and logs tied to missions (backup if any exist without playSessionId matches)
    if (missionIds.length > 0) {
      await db.delete(missionSessions).where(inArray(missionSessions.missionId, missionIds)).run();
      await db.delete(submissions).where(inArray(submissions.missionId, missionIds)).run();
    }

    // 4. Delete sessions, players, missions, and tokens tied to game
    await db.delete(playSessions).where(eq(playSessions.gameId, game_id)).run();
    await db.delete(players).where(eq(players.gameId, game_id)).run();
    await db.delete(missions).where(eq(missions.gameId, game_id)).run();
    await db.delete(qrTokens).where(eq(qrTokens.gameId, game_id)).run();

    // 5. Finally, delete the game itself
    await db.delete(games).where(eq(games.id, game_id)).run();
    
    redirect("/admin/games");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-end items-end">
        <form action={handleDelete}>
          <button type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all">
            <Trash2 className="w-4 h-4" /> 게임 삭제
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h1 className="text-2xl font-bold text-white">게임 수정</h1>
            <p className="text-slate-400 text-sm mt-1">ID: {game.id}</p>
          </div>

          <form action={handleUpdate} className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400">제목</label>
              <input name="title" defaultValue={game.title} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400">설명</label>
              <textarea name="description" defaultValue={game.description || ""} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none flex-1 focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div className="flex gap-4 items-center p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
              <input type="checkbox" id="isActive" name="isActive" defaultChecked={game.isActive ?? true} className="w-5 h-5 accent-primary bg-slate-900 border-slate-700 rounded" />
              <label htmlFor="isActive" className="text-sm font-semibold text-white cursor-pointer select-none">
                Active
              </label>
            </div>

            <PrologueEditor
              initialType={game.prologueType}
              initialVideoUrl={game.prologueVideoUrl || ""}
              initialSlidesJson={game.prologueSlidesJson || ""}
            />

            <EpilogueEditor
              initialType={game.epilogueType || "text"}
              initialContent={game.epilogueContent || ""}
              initialSlidesJson={game.epilogueSlidesJson || "[]"}
            />

            <div className="pt-4 border-t border-slate-800">
              <button type="submit" className="w-full px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10">
                <Save className="w-5 h-5" /> 저장
              </button>
            </div>
          </form>
        </div>

        {/* Linked Missions List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">미션(Missions)</h2>
              <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 font-bold rounded-full">
                {linkedMissions.length}
              </span>
            </div>

            <ul className="space-y-3">
              {linkedMissions.length === 0 ? (
                <p className="text-slate-500 text-sm italic">연결된 미션이 없습니다. 미션 탭에서 추가해주세요.</p>
              ) : linkedMissions.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/missions/${m.id}/detail?returnTo=/admin/games/${game.id}/detail`} className="block border border-slate-800 bg-slate-950 hover:bg-slate-800/50 p-4 rounded-xl transition-all group">
                    <p className="font-bold text-primary mb-1 group-hover:underline">
                      #{m.orderIndex} {m.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate line-clamp-2">
                      {m.checkpointInstruction}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Link href={`/admin/missions/new?gameId=${game.id}&returnTo=/admin/games/${game.id}/detail`} className="text-xs text-primary font-bold hover:underline">
                + 미션 추가
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
