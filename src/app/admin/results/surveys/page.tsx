import { db } from "@/db";
import { games, players, playSessions, postGameSurveys } from "@/db/schema";
import { SurveysClientTable } from "./SurveysClientTable";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const surveys = await db.select().from(postGameSurveys).all();
  const sessions = await db.select().from(playSessions).all();
  const playersRows = await db.select().from(players).all();
  const gameRows = await db.select().from(games).all();

  const sessionsById = new Map(sessions.map((row) => [row.id, row]));
  const playersById = new Map(playersRows.map((row) => [row.id, row]));
  const gamesById = new Map(gameRows.map((row) => [row.id, row]));

  const tableData = surveys.map((survey) => {
    const session = sessionsById.get(survey.playSessionId);
    const player = session ? playersById.get(session.playerId) : null;
    const game = session ? gamesById.get(session.gameId) : null;

    return {
      id: survey.id,
      gameId: session?.gameId || "",
      nickname: player?.nickname || "이름 없음",
      gameTitle: game?.title || "알 수 없는 게임",
      groupType: survey.groupType,
      groupTypeLabel: survey.groupTypeOther || survey.groupType,
      ageRange: survey.ageRange,
      gender: survey.gender,
      satisfactionScore: survey.satisfactionScore,
      satisfactionLabel: `${survey.satisfactionScore}/5`,
      difficultyScore: survey.difficultyScore,
      difficultyLabel: `${survey.difficultyScore}/5`,
      comment: survey.comment || "",
      submittedAt: survey.submittedAt,
    };
  });

  const averageSatisfaction =
    tableData.length > 0
      ? (tableData.reduce((total, row) => total + row.satisfactionScore, 0) / tableData.length).toFixed(1)
      : "-";
  const averageDifficulty =
    tableData.length > 0
      ? (tableData.reduce((total, row) => total + row.difficultyScore, 0) / tableData.length).toFixed(1)
      : "-";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">설문 결과</h1>
        <p className="text-slate-400 text-sm">게임 종료 후 수집된 연령대, 그룹 유형, 만족도, 난이도, 후기 데이터를 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">총 설문 수</p>
          <p className="text-3xl font-bold text-white mt-2">{tableData.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">평균 만족도</p>
          <p className="text-3xl font-bold text-white mt-2">{averageSatisfaction}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">평균 난이도</p>
          <p className="text-3xl font-bold text-white mt-2">{averageDifficulty}</p>
        </div>
      </div>

      <SurveysClientTable data={tableData} />
    </div>
  );
}
