import { db } from "@/db";
import { missions, games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MissionDetailPage({ params }: { params: Promise<{ mission_id: string }> }) {
  const { mission_id } = await params;
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
    const checkpointInstruction = formData.get("checkpointInstruction") as string;
    const riddleQuestion = formData.get("riddleQuestion") as string;
    const answer = formData.get("answer") as string;
    const hint = formData.get("hint") as string;

    await db.update(missions).set({
      gameId,
      title,
      orderIndex,
      checkpointInstruction,
      riddleQuestion,
      answer,
      hint
    }).where(eq(missions.id, mission!.id)).run();

    redirect("/admin/missions");
  }

  async function handleDelete() {
    "use server";
    await db.delete(missions).where(eq(missions.id, mission!.id)).run();
    redirect(`/admin/games/${mission!.gameId}/detail`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <Link href={`/admin/games/${mission.gameId}/detail`} className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Game Details
        </Link>
        <form action={handleDelete}>
          <button type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all">
            <Trash2 className="w-4 h-4" /> Delete Mission
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">Edit Mission</h1>
          <p className="text-slate-400 text-sm mt-1">ID: {mission.id}</p>
        </div>

        <form action={handleUpdate} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Attached Game</label>
            <select name="gameId" defaultValue={mission.gameId} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Mission Title</label>
            <input name="title" defaultValue={mission.title} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Order Index</label>
            <input type="number" name="orderIndex" defaultValue={mission.orderIndex} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Checkpoint Location / Instruction</label>
            <textarea name="checkpointInstruction" defaultValue={mission.checkpointInstruction} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none flex-1 focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Riddle / Question</label>
            <textarea name="riddleQuestion" defaultValue={mission.riddleQuestion} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-20 resize-none flex-1 focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Exact Answer</label>
            <input name="answer" defaultValue={mission.answer} required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Hint (Optional)</label>
            <input name="hint" defaultValue={mission.hint || ""} className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>

          <div className="sm:col-span-2 pt-6 border-t border-slate-800">
            <button type="submit" className="w-full px-8 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              <Save className="w-5 h-5" /> Update Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
