import { db } from "@/db";
import { missionSessions, missions, games } from "@/db/schema";
import { MissionsAnalyticsClientTable } from "./MissionsAnalyticsClientTable";

export const dynamic = "force-dynamic";

function formatDuration(ms: number) {
  if (!ms) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}분 ${seconds}초`;
}

export default async function MissionsAnalyticsPage() {
  const missionRows = await db.select().from(missions).all();
  const missionSessionRows = await db.select().from(missionSessions).all();
  const gameRows = await db.select().from(games).all();
  const gamesById = new Map(gameRows.map((row) => [row.id, row]));

  const tableData = missionRows.map((mission) => {
    const sessions = missionSessionRows.filter((row) => row.missionId === mission.id);
    const completed = sessions.filter((row) => row.isCompleted);
    const averageDuration =
      completed.length > 0
        ? Math.round(completed.reduce((total, row) => total + (row.durationMs ?? 0), 0) / completed.length)
        : 0;
    const averageHint =
      sessions.length > 0 ? (sessions.reduce((total, row) => total + row.hintCount, 0) / sessions.length).toFixed(1) : "0.0";
    const averageWrong =
      sessions.length > 0
        ? (sessions.reduce((total, row) => total + row.wrongSubmissionCount, 0) / sessions.length).toFixed(1)
        : "0.0";

    return {
      id: mission.id,
      gameId: mission.gameId,
      gameTitle: gamesById.get(mission.gameId)?.title || "알 수 없는 게임",
      title: mission.title,
      startedCount: sessions.length,
      completedCount: completed.length,
      completionRateLabel: sessions.length > 0 ? `${Math.round((completed.length / sessions.length) * 100)}%` : "-",
      averageDurationLabel: formatDuration(averageDuration),
      averageHintLabel: `${averageHint}회`,
      averageWrongLabel: `${averageWrong}회`,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">미션 분석</h1>
        <p className="text-slate-400 text-sm">미션별 완료율, 평균 소요 시간, 힌트 사용, 오답 비율을 비교해 병목 지점을 찾습니다.</p>
      </div>

      <MissionsAnalyticsClientTable data={tableData} />
    </div>
  );
}
