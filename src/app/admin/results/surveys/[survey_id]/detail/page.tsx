import { db } from "@/db";
import { games, players, playSessions, postGameSurveys } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDateTime(value: number | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default async function SurveyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ survey_id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { survey_id } = await params;
  const { returnTo } = await searchParams;

  const survey = await db.select().from(postGameSurveys).where(eq(postGameSurveys.id, survey_id)).get();
  if (!survey) {
    redirect("/admin/results/surveys");
  }

  const session = await db.select().from(playSessions).where(eq(playSessions.id, survey.playSessionId)).get();
  const player = session ? await db.select().from(players).where(eq(players.id, session.playerId)).get() : null;
  const game = session ? await db.select().from(games).where(eq(games.id, session.gameId)).get() : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">설문 상세</h1>
          <p className="text-slate-400 text-sm">응답자 정보와 게임 맥락을 함께 확인할 수 있는 설문 상세 화면입니다.</p>
        </div>
        <Link href={returnTo || "/admin/results/surveys"} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
          목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-500 text-sm">플레이어</p>
          <p className="text-2xl font-bold text-white mt-2">{player?.nickname || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-500 text-sm">게임</p>
          <p className="text-2xl font-bold text-white mt-2">{game?.title || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-500 text-sm">제출 시각</p>
          <p className="text-2xl font-bold text-white mt-2">{formatDateTime(survey.submittedAt)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex justify-between gap-4"><span className="text-slate-400">연령대</span><span>{survey.ageRange}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">그룹 유형</span><span>{survey.groupTypeOther || survey.groupType}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">성별</span><span>{survey.gender}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">만족도</span><span>{survey.satisfactionScore}/5</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">난이도</span><span>{survey.difficultyScore}/5</span></div>
        <div className="border-t border-slate-800 pt-4">
          <p className="text-slate-400 mb-2">후기</p>
          <p className="whitespace-pre-wrap text-slate-200">{survey.comment || "-"}</p>
        </div>
      </div>
    </div>
  );
}
