import { db } from "@/db";
import {
  eventLogs,
  games,
  locationLogs,
  missionSessions,
  missions,
  playSessions,
  submissions
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { Save, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { ClosingInstructionEditor } from "../../ClosingInstructionEditor";
import { MissionContentEditor } from "../../MissionContentEditor";
import { MissionImageEditor } from "../../MissionImageEditor";
import { CheckpointImageEditor } from "../../CheckpointImageEditor";

export const dynamic = 'force-dynamic';

export default async function MissionDetailPage({ params, searchParams }: { params: Promise<{ mission_id: string }>, searchParams: Promise<{ returnTo?: string }> }) {
  const { mission_id } = await params;
  const { returnTo } = await searchParams;
  const mission = await db.select().from(missions).where(eq(missions.id, mission_id)).get();

  if (!mission) {
    redirect("/admin/missions");
  }

  const allGames = await db.select().from(games).all();

  async function handleUpdate(formData: FormData) {
    "use server";
    const gameId = formData.get("gameId") as string;
    const title = formData.get("title") as string;
    const orderIndex = parseInt(formData.get("orderIndex") as string, 10);
    const riddleQuestion = formData.get("riddleQuestion") as string;
    const missionType = formData.get("missionType") as string;
    const missionVideoUrl = formData.get("missionVideoUrl") as string;
    const missionSlidesJson = formData.get("missionSlidesJson") as string;
    const answer = formData.get("answer") as string;
    const hint = formData.get("hint") as string;
    const imageAssetKey = formData.get("imageAssetKey") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const imageAlt = formData.get("imageAlt") as string;
    const imageCaption = formData.get("imageCaption") as string;
    const checkpointImageUrl = formData.get("checkpointImageUrl") as string;
    const checkpointImageAssetKey = formData.get("checkpointImageAssetKey") as string;
    const closingInstruction = formData.get("closingInstruction") as string;
    const closingInstructionType = formData.get("closingInstructionType") as string;
    const closingInstructionVideoUrl = formData.get("closingInstructionVideoUrl") as string;
    const closingInstructionSlidesJson = formData.get("closingInstructionSlidesJson") as string;
    const description = formData.get("description") as string;
    const returnUrl = formData.get("returnTo") as string;

    if (!gameId || !title || !riddleQuestion || !answer) {
      throw new Error("필수 입력 항목이 누락되었습니다.");
    }

    await db.update(missions).set({
      gameId,
      title,
      orderIndex,
      riddleQuestion,
      missionType: missionType || "text",
      missionVideoUrl: missionVideoUrl || null,
      missionSlidesJson: missionSlidesJson || null,
      answer,
      hint: hint || null,
      imageAssetKey: imageAssetKey || null,
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      imageCaption: imageCaption || null,
      checkpointImageUrl: checkpointImageUrl || null,
      checkpointImageAssetKey: checkpointImageAssetKey || null,
      description: description || null,
      closingInstruction: closingInstruction || null,
      closingInstructionType: closingInstructionType || "text",
      closingInstructionVideoUrl: closingInstructionVideoUrl || null,
      closingInstructionSlidesJson: closingInstructionSlidesJson || null,
    }).where(eq(missions.id, mission_id)).run();

    redirect(returnUrl || "/admin/missions");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const returnUrl = formData.get("returnTo") as string;

    // 1. Clear references and delete logs tied to this mission
    await db.update(playSessions).set({ lastMissionId: null }).where(eq(playSessions.lastMissionId, mission_id)).run();
    await db.delete(missionSessions).where(eq(missionSessions.missionId, mission_id)).run();
    await db.delete(submissions).where(eq(submissions.missionId, mission_id)).run();
    await db.delete(locationLogs).where(eq(locationLogs.missionId, mission_id)).run();
    await db.delete(eventLogs).where(eq(eventLogs.missionId, mission_id)).run();

    // 2. Finally delete the mission
    await db.delete(missions).where(eq(missions.id, mission_id)).run();

    redirect(returnUrl || `/admin/games/${mission!.gameId}/detail`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-end items-end">
        <form action={handleDelete}>
          <input type="hidden" name="returnTo" value={returnTo || ""} />
          <button type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all">
            <Trash2 className="w-4 h-4" /> 삭제
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">미션 수정</h1>
          <p className="text-slate-400 text-sm mt-1">ID: {mission.id}</p>
        </div>

        <form action={handleUpdate} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input type="hidden" name="returnTo" value={returnTo || ""} />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">연결된 게임</label>
            <select name="gameId" defaultValue={mission.gameId} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">미션 제목</label>
            <input name="title" defaultValue={mission.title} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">정렬 순서</label>
            <input type="number" name="orderIndex" defaultValue={mission.orderIndex} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>



          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">미션 간단설명 (리스트 카드용)</label>
            <textarea name="description" defaultValue={mission.description || ""} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none flex-1 focus:border-primary focus:outline-none transition-colors" placeholder="예: 동상의 비밀을 찾아라" />
          </div>

          <MissionImageEditor 
            initialImageUrl={mission.imageUrl}
            initialImageAssetKey={mission.imageAssetKey}
            initialImageAlt={mission.imageAlt}
            initialImageCaption={mission.imageCaption}
          />

          <CheckpointImageEditor
            initialImageUrl={mission.checkpointImageUrl}
            initialImageAssetKey={mission.checkpointImageAssetKey}
          />

          <MissionContentEditor
            initialType={mission.missionType || "text"}
            initialVideoUrl={mission.missionVideoUrl || ""}
            initialSlidesJson={mission.missionSlidesJson || ""}
            initialContent={mission.riddleQuestion || ""}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">정답 (정확히 일치해야 함)</label>
            <input name="answer" defaultValue={mission.answer} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">힌트 (선택 사항)</label>
            <input name="hint" defaultValue={mission.hint || ""} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <ClosingInstructionEditor
            initialType={mission.closingInstructionType || "text"}
            initialVideoUrl={mission.closingInstructionVideoUrl || ""}
            initialSlidesJson={mission.closingInstructionSlidesJson || ""}
            initialContent={mission.closingInstruction || ""}
          />

          <div className="sm:col-span-2 pt-6 border-t border-slate-800">
            <button type="submit" className="w-full px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10">
              <Save className="w-5 h-5" /> 미션 정보 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
