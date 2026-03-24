import { db } from "@/db";
import { games, qrTokens } from "@/db/schema";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

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
      <Link href="/admin/tokens" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Tokens
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">Generate QR Token</h1>
          <p className="text-slate-400 text-sm mt-1">Create an entry ticket/passcode for a specific game.</p>
        </div>

        <form action={handleCreate} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Target Game</label>
            <select name="gameId" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              <option value="" disabled>Select a Game</option>
              {allGames.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Custom Token String (Optional)</label>
            <input name="token" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="Leave empty for a random code" />
            <p className="text-xs text-slate-500">If you leave this empty, an 8-character random string will be generated automatically.</p>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <button type="submit" className="w-full px-8 py-3 bg-emerald-500 text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
              <RefreshCw className="w-5 h-5" /> Generate Token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
