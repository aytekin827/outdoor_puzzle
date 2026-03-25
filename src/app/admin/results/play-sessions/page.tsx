import { db } from "@/db";
import { games, playSessions, players, postGameSurveys, completionPhotos } from "@/db/schema";
import { PlaySessionsClientTable } from "./PlaySessionsClientTable";

export const dynamic = "force-dynamic";

function formatDuration(ms: number | null) {
  if (!ms) {
    return "-";
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}분 ${seconds}초`;
}

export default async function PlaySessionsPage() {
  const sessions = await db.select().from(playSessions).all();
  const playerRows = await db.select().from(players).all();
  const gameRows = await db.select().from(games).all();
  const surveyRows = await db.select().from(postGameSurveys).all();
  const photoRows = await db.select().from(completionPhotos).all();

  const playersById = new Map(playerRows.map((row) => [row.id, row]));
  const gamesById = new Map(gameRows.map((row) => [row.id, row]));
  const surveySessionIds = new Set(surveyRows.map((row) => row.playSessionId));
  const photoSessionIds = new Set(photoRows.map((row) => row.playSessionId));

  const tableData = sessions.map((session) => {
    const player = playersById.get(session.playerId);
    const game = gamesById.get(session.gameId);

    return {
      id: session.id,
      gameId: session.gameId,
      nickname: player?.nickname || "이름 없음",
      gameTitle: game?.title || "알 수 없는 게임",
      status: session.status,
      startedAt: session.startedAt ?? 0,
      endedAt: session.endedAt ?? 0,
      totalDurationMs: session.totalDurationMs ?? 0,
      totalDurationLabel: formatDuration(session.totalDurationMs ?? null),
      hintCount: session.hintCount,
      wrongSubmissionCount: session.wrongSubmissionCount,
      surveySubmitted: surveySessionIds.has(session.id) ? "제출" : "미제출",
      photoUploaded: photoSessionIds.has(session.id) ? "업로드" : "없음",
      locationPermissionState: session.locationPermissionState || "-",
    };
  });

  const completedCount = tableData.filter((item) => item.status === "completed").length;
  const activeCount = tableData.filter((item) => item.status === "playing").length;
  const abandonedCount = tableData.filter((item) => item.status === "abandoned").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">플레이 세션</h1>
        <p className="text-slate-400 text-sm">
          개별 플레이 결과를 확인하고 세션별 진행 상태, 소요 시간, 힌트 사용, 결과 제출 현황을 검토합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">전체 세션</p>
          <p className="text-3xl font-bold text-white mt-2">{tableData.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">완료 세션</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{completedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">진행/이탈</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">
            {activeCount} / <span className="text-rose-400">{abandonedCount}</span>
          </p>
        </div>
      </div>

      <PlaySessionsClientTable data={tableData} />
    </div>
  );
}
