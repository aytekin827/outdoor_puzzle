import { db } from "@/db";
import { completionPhotos, games, missions, playSessions, postGameSurveys } from "@/db/schema";
import { GamesAnalyticsClientTable } from "./GamesAnalyticsClientTable";

export const dynamic = "force-dynamic";

function formatDuration(ms: number) {
  if (!ms) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}분 ${seconds}초`;
}

export default async function GamesAnalyticsPage() {
  const gameRows = await db.select().from(games).all();
  const missionRows = await db.select().from(missions).all();
  const sessionRows = await db.select().from(playSessions).all();
  const surveyRows = await db.select().from(postGameSurveys).all();
  const photoRows = await db.select().from(completionPhotos).all();

  const tableData = gameRows.map((game) => {
    const gameMissions = missionRows.filter((mission) => mission.gameId === game.id);
    const gameSessions = sessionRows.filter((session) => session.gameId === game.id);
    const completedSessions = gameSessions.filter((session) => session.status === "completed");
    const gameSurveys = surveyRows.filter((survey) => {
      const session = gameSessions.find((item) => item.id === survey.playSessionId);
      return Boolean(session);
    });
    const gamePhotos = photoRows.filter((photo) => {
      const session = gameSessions.find((item) => item.id === photo.playSessionId);
      return Boolean(session);
    });

    const averageDuration =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((total, session) => total + (session.totalDurationMs ?? 0), 0) /
              completedSessions.length,
          )
        : 0;
    const averageSatisfaction =
      gameSurveys.length > 0
        ? (gameSurveys.reduce((total, survey) => total + survey.satisfactionScore, 0) / gameSurveys.length).toFixed(1)
        : "-";
    const averageDifficulty =
      gameSurveys.length > 0
        ? (gameSurveys.reduce((total, survey) => total + survey.difficultyScore, 0) / gameSurveys.length).toFixed(1)
        : "-";
    const completionRate = gameSessions.length > 0 ? Math.round((completedSessions.length / gameSessions.length) * 100) : 0;

    return {
      id: game.id,
      title: game.title,
      description: game.description || "",
      missionCount: gameMissions.length,
      sessionCount: gameSessions.length,
      completedSessions: completedSessions.length,
      surveyCount: gameSurveys.length,
      photoCount: gamePhotos.length,
      completionRateLabel: `${completionRate}%`,
      averageDurationLabel: formatDuration(averageDuration),
      averageSatisfactionLabel: averageSatisfaction === "-" ? "-" : `${averageSatisfaction}/5`,
      averageDifficultyLabel: averageDifficulty === "-" ? "-" : `${averageDifficulty}/5`,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">게임 분석</h1>
        <p className="text-slate-400 text-sm">게임 단위로 완료율, 평균 플레이 시간, 만족도, 난이도, 인증샷 및 설문 수를 비교합니다.</p>
      </div>

      <GamesAnalyticsClientTable data={tableData} />
    </div>
  );
}
