import { db } from "@/db";
import { games, qrTokens } from "@/db/schema";
import { RefreshCw } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewTokenPage() {
  const allGames = await db.select().from(games).all();

  async function handleCreate(formData: FormData) {
    "use server";
    const gameId = formData.get("gameId") as string;
    const rawToken = formData.get("token") as string;
    const tokenVal = rawToken ? rawToken : crypto.randomUUID().slice(0, 8);

    await db.insert(qrTokens).values({
      id: crypto.randomUUID(),
      gameId,
      token: tokenVal,
      isUsed: false,
      createdAt: Date.now()
    }).run();

    redirect("/admin/tokens");
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">토큰 생성</h1>
          <p className="text-slate-400 text-sm mt-1">특정 게임의 토큰을 생성합니다.</p>
        </div>

        <form action={handleCreate} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">게임 선택</label>
            <select name="gameId" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              <option value="" disabled>Select a Game</option>
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Custom Token String (Optional)</label>
            <input name="token" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="원하는 토큰 값을 입력하세요" />
            <p className="text-xs text-slate-500">비워두면 자동으로 8자리 랜덤 코드가 생성됩니다.</p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button type="submit" className="w-full px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-white/10">
              <RefreshCw className="w-5 h-5" /> 토큰 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
