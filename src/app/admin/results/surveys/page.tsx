import { db } from "@/db";
import { games, players, playSessions, postGameSurveys } from "@/db/schema";
import { SurveysClientTable } from "./SurveysClientTable";
import { SurveysAnalytics } from "./SurveysAnalytics";

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

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
           <div className="h-0.5 w-8 bg-primary rounded-full" />
           <span className="text-primary font-black uppercase tracking-widest text-[10px]">Data Intelligence</span>
        </div>
        <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase sm:text-5xl">
          설문 데이터 분석
        </h1>
        <p className="text-slate-400 font-bold mt-2 text-sm max-w-xl leading-relaxed">
          플레이어들이 남긴 만족도와 난이도를 시각화하여 게임의 밸런스와 재미를 종합적으로 분석합니다.
        </p>
      </div>

      <SurveysAnalytics data={tableData} />

      <div className="pt-8 border-t border-slate-800">
        <div className="flex flex-col mb-6">
           <h2 className="text-xl font-bold text-white tracking-tight">전체 설문 데이터</h2>
           <p className="text-xs text-slate-500 font-bold uppercase mt-1">Full Raw Dataset</p>
        </div>
        <SurveysClientTable data={tableData} />
      </div>
    </div>
  );
}
