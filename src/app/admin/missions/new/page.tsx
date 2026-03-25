import { db } from "@/db";
import { games, missions } from "@/db/schema";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function NewMissionPage({ searchParams }: { searchParams: Promise<{ gameId?: string, returnTo?: string }> }) {
  const { gameId, returnTo } = await searchParams;
  const allGames = await db.select().from(games).all();

  async function handleCreate(formData: FormData) {
    "use server";
    const gameId = formData.get("gameId") as string;
    const title = formData.get("title") as string;
    const orderIndex = parseInt(formData.get("orderIndex") as string, 10);
    const checkpointInstruction = formData.get("checkpointInstruction") as string;
    const riddleQuestion = formData.get("riddleQuestion") as string;
    const answer = formData.get("answer") as string;
    const hint = formData.get("hint") as string;
    const returnUrl = formData.get("returnTo") as string;
    
    await db.insert(missions).values({
      id: crypto.randomUUID(),
      gameId,
      orderIndex,
      title,
      checkpointInstruction,
      riddleQuestion,
      answer,
      hint,
      createdAt: Date.now()
    }).run();
    
    redirect(returnUrl || `/admin/missions`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">Create New Mission</h1>
          <p className="text-slate-400 text-sm mt-1">Design a new checkpoint puzzle.</p>
        </div>

        <form action={handleCreate} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <input type="hidden" name="returnTo" value={returnTo || ""} />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Attached Game</label>
            <select name="gameId" defaultValue={gameId || ""} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              <option value="" disabled>Select a Game</option>
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Mission Title</label>
            <input name="title" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="e.g. First Checkpoint" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Order Index (Number)</label>
            <input type="number" name="orderIndex" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="1" />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Checkpoint Location / Instruction</label>
            <textarea name="checkpointInstruction" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none focus:border-primary focus:outline-none transition-colors" placeholder="Go to the big tree at the entrance..." />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Riddle / Question</label>
            <textarea name="riddleQuestion" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none focus:border-primary focus:outline-none transition-colors" placeholder="Count the number of leaves..." />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Exact Answer</label>
            <input name="answer" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="1234" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Hint</label>
            <input name="hint" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="Optional hint" />
          </div>
          
          <div className="sm:col-span-2 pt-4 border-t border-slate-800">
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg transition-colors shadow-lg shadow-white/10">
              Create Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
