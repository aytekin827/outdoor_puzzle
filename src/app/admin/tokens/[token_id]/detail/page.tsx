import { db } from "@/db";
import { games, qrTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Save, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

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
    await db.delete(qrTokens).where(eq(qrTokens.id, tokenRecord!.id)).run();
    redirect("/admin/tokens");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-end items-end">
        <form action={handleDelete}>
          <button type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all">
            <Trash2 className="w-4 h-4" /> 삭제
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">토큰(Token) 수정</h1>
          <p className="text-slate-400 font-mono text-xs mt-2 uppercase">{tokenRecord.id}</p>
        </div>

        <form action={handleUpdate} className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">연결된 게임</label>
            <select name="gameId" defaultValue={tokenRecord.gameId} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
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
