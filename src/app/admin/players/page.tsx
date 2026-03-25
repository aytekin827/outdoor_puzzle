import { db } from "@/db";
import { games, players } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PlayersClientTable } from "./PlayersClientTable";

export const dynamic = 'force-dynamic';

export default async function PlayersPage() {
  const playersRaw = await db.select({
    id: players.id,
    nickname: players.nickname,
    status: players.status,
    startedAt: players.startedAt,
    completedAt: players.completedAt,
    gameTitle: games.title,
  })
    .from(players)
    .leftJoin(games, eq(players.gameId, games.id))
    .orderBy(desc(players.startedAt))
    .all();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">참가자</h1>
          <p className="text-slate-400">참가자들의 진행 상황을 모니터링할 수 있습니다.</p>
        </div>
      </div>

      <PlayersClientTable data={playersRaw} />
    </div>
  );
}
