import { db } from "@/db";
import { missions, games } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export default async function MissionsAdmin(props: { searchParams?: Promise<{ gameFilter?: string }> }) {
  const searchParams = await props.searchParams;
  const gameFilter = searchParams?.gameFilter || "";
  const allGames = db.select().from(games).all();
  
  const conditions = [];
  if (gameFilter) conditions.push(eq(missions.gameId, gameFilter));

  const filteredMissions = db.select().from(missions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(missions.orderIndex)
    .all();

  async function handleAdd(formData: FormData) {
    "use server";
    const gameId = formData.get("gameId") as string;
    const title = formData.get("title") as string;
    const orderIndex = Number(formData.get("orderIndex"));
    const instruction = formData.get("instruction") as string;
    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const hint = formData.get("hint") as string;
    
    if (!gameId) return;

    await db.insert(missions).values({
      id: crypto.randomUUID(),
      gameId,
      title,
      orderIndex,
      checkpointInstruction: instruction,
      riddleQuestion: question,
      answer,
      hint,
      createdAt: Date.now()
    }).run();
    revalidatePath("/admin/missions");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    await db.delete(missions).where(eq(missions.id, formData.get("id") as string)).run();
    revalidatePath("/admin/missions");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold">Missions Management</h1>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Add New Mission</h2>
        <form action={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select name="gameId" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required>
            <option value="">-- Assign to Game --</option>
            {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
          <input name="orderIndex" type="number" placeholder="Order Index (e.g. 1)" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
          <input name="title" placeholder="Mission Title" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
          <input name="answer" placeholder="Exact Answer" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
          <input name="instruction" placeholder="Checkpoint Instruction" className="bg-slate-950 border border-slate-800 p-2 rounded text-white sm:col-span-2" required />
          <input name="question" placeholder="Riddle Question" className="bg-slate-950 border border-slate-800 p-2 rounded text-white sm:col-span-2" required />
          <input name="hint" placeholder="Hint (Optional)" className="bg-slate-950 border border-slate-800 p-2 rounded text-white sm:col-span-2" />
          <button type="submit" className="bg-emerald-500 text-black font-bold py-2 rounded sm:col-span-2 hover:bg-emerald-400">Add Mission</button>
        </form>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Filter Missions</h2>
        <form className="flex gap-4">
          <select name="gameFilter" defaultValue={gameFilter} className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1">
            <option value="">All Games</option>
            {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
          <button type="submit" className="bg-slate-800 text-white font-bold py-2 px-6 rounded hover:bg-slate-700">Filter</button>
        </form>
      </div>

      <div className="space-y-4">
        {filteredMissions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center text-slate-500">No missions found.</div>
        ) : filteredMissions.map((m) => {
          const mGame = allGames.find(g => g.id === m.gameId);
          return (
            <div key={m.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="bg-slate-800 px-2 py-1 rounded text-sm font-bold">#{m.orderIndex}</span>
                  <span className="font-bold text-lg text-white">{m.title}</span>
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs ml-2">{mGame?.title || 'Unknown Game'}</span>
                </div>
                <p className="text-sm text-slate-400"><strong>Go:</strong> {m.checkpointInstruction}</p>
                <p className="text-sm text-slate-400"><strong>Q:</strong> {m.riddleQuestion}</p>
                <p className="text-sm text-emerald-400"><strong>A:</strong> {m.answer}</p>
              </div>
              
              <form action={handleDelete}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="bg-red-500/20 text-red-400 px-4 py-2 rounded hover:bg-red-500/30 text-sm font-bold">
                  Delete
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  );
}
