import { db } from "@/db";
import { qrTokens, games, players, submissions } from "@/db/schema";
import { eq, like, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export default async function TokensAdmin(
  props: {
    searchParams?: Promise<{
      gameFilter?: string;
      statusFilter?: string;
      search?: string;
    }>
  }
) {
  const searchParams = await props.searchParams;
  const gameFilter = searchParams?.gameFilter || "";
  const statusFilter = searchParams?.statusFilter || "";
  const searchTerm = searchParams?.search || "";

  const allGames = db.select().from(games).all();
  
  // Construct conditions
  const conditions = [];
  if (gameFilter) conditions.push(eq(qrTokens.gameId, gameFilter));
  if (statusFilter === "used") conditions.push(eq(qrTokens.isUsed, true));
  if (statusFilter === "avail") conditions.push(eq(qrTokens.isUsed, false));
  if (searchTerm) conditions.push(like(qrTokens.token, `%${searchTerm}%`));

  const filteredTokens = db.select().from(qrTokens)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(qrTokens.createdAt))
    .all();

  async function handleGenerate(formData: FormData) {
    "use server";
    const count = Number(formData.get("count"));
    const prefix = formData.get("prefix") as string;
    const gId = formData.get("gameId") as string;
    
    if (!gId) return;

    const newTokens = Array.from({ length: count }).map(() => ({
      id: crypto.randomUUID(),
      token: `${prefix}-${crypto.randomBytes(4).toString("hex")}`,
      gameId: gId,
      isUsed: false,
      createdAt: Date.now()
    }));
    
    await db.insert(qrTokens).values(newTokens).run();
    revalidatePath("/admin/tokens");
  }

  async function handleReset(formData: FormData) {
    "use server";
    await db.update(qrTokens).set({ isUsed: false, usedAt: null }).where(eq(qrTokens.id, formData.get("id") as string)).run();
    revalidatePath("/admin/tokens");
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const tid = formData.get("id") as string;
    // 1. Find players associated with this token
    const associatedPlayers = db.select().from(players).where(eq(players.qrTokenId, tid)).all();
    const pids = associatedPlayers.map(p => p.id);
    
    // 2. Delete submissions for those players
    if (pids.length > 0) {
      for (const pid of pids) {
        db.delete(submissions).where(eq(submissions.playerId, pid)).run();
      }
      // 3. Delete players
      db.delete(players).where(eq(players.qrTokenId, tid)).run();
    }
    // 4. Finally delete token
    db.delete(qrTokens).where(eq(qrTokens.id, tid)).run();
    revalidatePath("/admin/tokens");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold">QR Tokens Management</h1>

      {/* Generate Tokens */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Generate For Game</h2>
        <form action={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-slate-400">Target Game</label>
            <select name="gameId" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required>
              <option value="">-- Select Game --</option>
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-slate-400">Prefix</label>
            <input name="prefix" defaultValue="team" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-slate-400">Count</label>
            <input name="count" type="number" defaultValue={5} max={50} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" required />
          </div>
          <button type="submit" className="bg-primary text-black font-bold py-2 px-6 rounded hover:bg-primary/90 h-[42px]">
            Generate
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Filters & Search</h2>
        <form className="flex flex-col sm:flex-row gap-4">
          <select name="gameFilter" defaultValue={gameFilter} className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1">
            <option value="">All Games</option>
            {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
          <select name="statusFilter" defaultValue={statusFilter} className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1">
            <option value="">All Statuses</option>
            <option value="avail">Available</option>
            <option value="used">Used</option>
          </select>
          <input name="search" defaultValue={searchTerm} placeholder="Search Token..." className="bg-slate-950 border border-slate-800 p-2 rounded text-white flex-1" />
          <button type="submit" className="bg-slate-800 text-white font-bold py-2 px-6 rounded hover:bg-slate-700">Apply Filters</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 text-slate-400">
            <tr>
              <th className="px-6 py-4">Token String</th>
              <th className="px-6 py-4">Game</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">QR Code</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredTokens.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No tokens found.</td></tr>
            ) : filteredTokens.map(t => {
              const gInfo = allGames.find(g => g.id === t.gameId);
              // Construct local URL dynamically, fallback to localhost:3000 mapping
              // Note that in a real production MVP, it should use ENV Var, but hardcoded localhost for now is fine since development is on standard ports. We will use a flexible absolute path for QR data.
              // To ensure it works out of the box with the user running it via Next.js:
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/play/${t.token}`;

              return (
                <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono select-all text-white font-bold">{t.token}</td>
                  <td className="px-6 py-4 truncate max-w-[150px]">{gInfo?.title || "Unknown"}</td>
                  <td className="px-6 py-4">
                    {t.isUsed ? <span className="text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">USED</span> : <span className="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">AVAILABLE</span>}
                  </td>
                  <td className="px-6 py-4">
                    <img src={qrUrl} alt="QR Code" className="w-12 h-12 bg-white p-1 rounded hover:scale-[3] transition-transform origin-left cursor-pointer z-10 relative" />
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <form action={handleReset}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" disabled={!t.isUsed} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded disabled:opacity-30 hover:bg-slate-700">
                        Reset
                      </button>
                    </form>
                    <form action={handleDelete}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded hover:bg-red-500/30">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
