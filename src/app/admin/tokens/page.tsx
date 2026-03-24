import { db } from "@/db";
import { qrTokens, games } from "@/db/schema";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TokensClientTable } from "./TokensClientTable";
import { desc, eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function TokensPage() {
  const tokensRaw = await db.select({
    id: qrTokens.id,
    token: qrTokens.token,
    isUsed: qrTokens.isUsed,
    createdAt: qrTokens.createdAt,
    gameTitle: games.title,
  })
  .from(qrTokens)
  .leftJoin(games, eq(qrTokens.gameId, games.id))
  .orderBy(desc(qrTokens.createdAt))
  .all();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">QR Tokens</h1>
          <p className="text-slate-400">Generate entry codes for players to join games.</p>
        </div>
        <Link href="/admin/tokens/new" className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> Generate Token
        </Link>
      </div>
      
      <TokensClientTable data={tokensRaw} />
    </div>
  );
}
