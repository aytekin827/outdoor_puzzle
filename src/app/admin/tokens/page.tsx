import { db } from "@/db";
import { games, qrTokens } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { TokensClientTable } from "./TokensClientTable";

export const dynamic = 'force-dynamic';

export default async function TokensPage() {
  const tokensRaw = await db.select({
    id: qrTokens.id,
    token: qrTokens.token,
    gameId: qrTokens.gameId,
    isUsed: qrTokens.isUsed,
    usedAt: qrTokens.usedAt,
    createdAt: qrTokens.createdAt,
    gameTitle: games.title,
  })
    .from(qrTokens)
    .leftJoin(games, eq(qrTokens.gameId, games.id))
    .orderBy(desc(qrTokens.createdAt))
    .all();

  const data = tokensRaw.map(t => ({
    ...t,
    usedAt_date: t.usedAt,
    usedAt_time: t.usedAt,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">토큰</h1>
          <p className="text-slate-400">방탈출 게임 참여 코드 생성을 관리합니다.</p>
        </div>
        <Link href="/admin/tokens/new" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/25 border border-primary/20">
          <Plus className="w-5 h-5" /> 토큰 생성
        </Link>
      </div>

      <TokensClientTable data={data} />
    </div>
  );
}
