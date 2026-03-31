import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DebugPage({ searchParams }: { searchParams: Promise<{ gameId?: string }> }) {
  const { gameId } = await searchParams;
  let error: string | null = null;
  let columns: any[] = [];
  let gameExists: boolean | null = null;
  
  try {
    // 1. Check columns
    // @ts-ignore
    const result = await db.run({ sql: "PRAGMA table_info(missions)" });
    // @ts-ignore
    columns = result?.results || [];

    // 2. Check if the specific game exists if gameId provided
    if (gameId) {
      const g = await db.select().from(games).where(eq(games.id, gameId)).get();
      gameExists = !!g;
    }
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-8 text-white space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-emerald-400">Database Debugger</h1>
      
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
          <p className="font-bold">Error executing bit:</p>
          <p className="text-sm font-mono">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-slate-300">Target Game Check</h2>
          {gameId ? (
            <div className={`p-4 rounded-lg border ${gameExists ? "bg-emerald-500/10 border-emerald-500/50" : "bg-red-500/10 border-red-500/50"}`}>
              <p className="text-xs text-slate-400 mb-1">Game ID: {gameId}</p>
              <p className="text-lg font-bold">
                {gameExists ? "✅ Game Found" : "❌ Game Not Found!"}
              </p>
              {!gameExists && <p className="text-xs text-red-400 mt-2">Foreign key constraint will FAIL if you try to add mission to this ID.</p>}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Pass ?gameId=UUID to check a specific game.</p>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-lg font-bold mb-4 text-slate-300">Column Count</h2>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-black ${columns.length === 13 ? "text-emerald-500" : "text-amber-500"}`}>
              {columns.length}
            </div>
            <div className="text-sm text-slate-400">
              <p>Columns found in `missions` table.</p>
              <p className={columns.length === 13 ? "text-emerald-400" : "text-red-400 font-bold"}>
                {columns.length === 13 ? "Perfect: Ready for deploy." : "Warning: Migration needed! (Expected 13)"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="font-bold text-slate-300">missions Table Schema Detail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-4">name</th>
                <th className="p-4">type</th>
                <th className="p-4">null?</th>
                <th className="p-4">pk?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {columns.map((c: any) => (
                <tr key={c.cid} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-mono text-emerald-400">{c.name}</td>
                  <td className="p-4 text-slate-300">{c.type}</td>
                  <td className="p-4 text-slate-500">{c.notnull === 1 ? "NOT NULL" : "NULL"}</td>
                  <td className="p-4 text-slate-500">{c.pk === 1 ? "PRIMARY" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {columns.length === 0 && !error && (
          <div className="p-12 text-center text-slate-500">
            Table not found or no columns.
          </div>
        )}
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-sm text-slate-400">
        <h3 className="font-bold text-emerald-400 mb-2">How to Fix Schema Mismatch</h3>
        <code className="block bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 mb-4 select-all">
          npx wrangler d1 migrations apply outdoor_puzzle --remote
        </code>
        <p>This command will apply the latest Drizzle migrations to your production Cloudflare database.</p>
      </div>
    </div>
  );
}
