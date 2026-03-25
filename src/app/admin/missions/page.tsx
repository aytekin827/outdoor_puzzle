import { db } from "@/db";
import { missions, games } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { MissionsClientTable } from "./MissionsClientTable";

export const dynamic = 'force-dynamic';

export default async function MissionsPage() {
  const allMissions = await db.select({
    id: missions.id,
    gameId: missions.gameId,
    gameTitle: games.title,
    orderIndex: missions.orderIndex,
    title: missions.title,
    riddleQuestion: missions.riddleQuestion,
    answer: missions.answer,
    createdAt: missions.createdAt,
  })
  .from(missions)
  .leftJoin(games, eq(missions.gameId, games.id))
  .orderBy(desc(missions.createdAt))
  .all();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">미션(Missions)</h1>
          <p className="text-slate-400">게임의 미션(문제)을 관리합니다.</p>
        </div>
        <Link href="/admin/missions/new?returnTo=/admin/missions" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/25 border border-primary/20">
          <Plus className="w-5 h-5" /> 미션(Mission) 추가
        </Link>
      </div>

      <MissionsClientTable data={allMissions} />
    </div>
  );
}
