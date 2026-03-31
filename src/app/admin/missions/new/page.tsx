import { db } from "@/db";
import { games, missions } from "@/db/schema";
import { redirect } from "next/navigation";
import { MissionImageEditor } from "../MissionImageEditor";

export const dynamic = 'force-dynamic';

export default async function NewMissionPage({ searchParams }: { searchParams: Promise<{ gameId?: string, returnTo?: string }> }) {
  const { gameId, returnTo } = await searchParams;
  const allGames = await db.select().from(games).all();

  async function handleCreate(formData: FormData) {
    "use server";
    const gameId = formData.get("gameId") as string;
    const title = formData.get("title") as string;
    const orderIndexStr = formData.get("orderIndex") as string;
    const orderIndex = parseInt(orderIndexStr || "0", 10);
    const checkpointInstruction = formData.get("checkpointInstruction") as string;
    const riddleQuestion = formData.get("riddleQuestion") as string;
    const answer = formData.get("answer") as string;
    const hint = formData.get("hint") as string;
    const imageAssetKey = formData.get("imageAssetKey") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const imageAlt = formData.get("imageAlt") as string;
    const imageCaption = formData.get("imageCaption") as string;
    const returnUrl = formData.get("returnTo") as string;
    
    // Validate required fields to prevent DB errors
    if (!gameId || !title || !riddleQuestion || !answer) {
      throw new Error("필수 입력 항목이 누락되었습니다 (게임, 제목, 문제, 정답은 필수입니다).");
    }

    await db.insert(missions).values({
      id: crypto.randomUUID(),
      gameId,
      orderIndex,
      title,
      checkpointInstruction,
      riddleQuestion,
      answer,
      hint: hint || null,
      imageAssetKey: imageAssetKey || null,
      imageUrl: imageUrl || null,
      imageAlt: imageAlt || null,
      imageCaption: imageCaption || null,
      createdAt: Date.now()
    }).run();
    
    redirect(returnUrl || `/admin/missions`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">새 미션 등록</h1>
          <p className="text-slate-400 text-sm mt-1">게임 진행을 위한 체크포인트와 퀴즈를 설계합니다.</p>
        </div>

        <form action={handleCreate} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input type="hidden" name="returnTo" value={returnTo || ""} />
          
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">연결된 게임</label>
            <select name="gameId" defaultValue={gameId || ""} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              <option value="" disabled>게임을 선택해 주세요</option>
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">미션 제목</label>
            <input name="title" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="예: 첫 번째 관문" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">정렬 순서 (숫자)</label>
            <input type="number" name="orderIndex" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="1" />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">체크포인트 위치 안내 (GPS 도달 시 표시)</label>
            <textarea name="checkpointInstruction" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none focus:border-primary focus:outline-none transition-colors" placeholder="예: 입구에 있는 커다란 나무 쪽으로 이동하세요..." />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">문제 / 퀴즈 내용</label>
            <textarea name="riddleQuestion" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none focus:border-primary focus:outline-none transition-colors" placeholder="예: 나무에 달린 잎사귀는 모두 몇 개인가요?" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">정답 (정확히 일치해야 함)</label>
            <input name="answer" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="1234" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">힌트 (선택 사항)</label>
            <input name="hint" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="정답을 유추할 수 있는 힌트" />
          </div>

          <MissionImageEditor />
          
          <div className="sm:col-span-2 pt-4 border-t border-slate-800">
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg transition-colors shadow-lg shadow-white/10">
              미션 생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
