import { db } from "@/db";
import { postGameSurveys } from "@/db/schema";
import { SurveySegmentsClientTable } from "./SurveySegmentsClientTable";

export const dynamic = "force-dynamic";

type Segment = {
  id: string;
  segmentType: string;
  segmentLabel: string;
  responseCount: number;
  shareLabel: string;
  averageSatisfactionLabel: string;
  averageDifficultyLabel: string;
};

function buildSegments(
  rows: Array<{ ageRange: string; groupType: string; groupTypeOther: string | null; gender: string; satisfactionScore: number; difficultyScore: number }>,
  key: "ageRange" | "gender" | "groupType",
  label: string,
): Segment[] {
  const total = rows.length;
  const bucket = new Map<string, typeof rows>();

  for (const row of rows) {
    const value =
      key === "groupType" ? row.groupTypeOther || row.groupType : row[key];
    const list = bucket.get(value) || [];
    list.push(row);
    bucket.set(value, list);
  }

  return Array.from(bucket.entries()).map(([segmentLabel, values]) => ({
    id: `${label}-${segmentLabel}`,
    segmentType: label,
    segmentLabel,
    responseCount: values.length,
    shareLabel: total > 0 ? `${Math.round((values.length / total) * 100)}%` : "0%",
    averageSatisfactionLabel: `${(values.reduce((sum, item) => sum + item.satisfactionScore, 0) / values.length).toFixed(1)}/5`,
    averageDifficultyLabel: `${(values.reduce((sum, item) => sum + item.difficultyScore, 0) / values.length).toFixed(1)}/5`,
  }));
}

export default async function SurveysAnalyticsPage() {
  const surveyRows = await db.select().from(postGameSurveys).all();

  const segmentRows = [
    ...buildSegments(surveyRows, "ageRange", "연령대"),
    ...buildSegments(surveyRows, "groupType", "그룹 유형"),
    ...buildSegments(surveyRows, "gender", "성별"),
  ];

  const averageSatisfaction =
    surveyRows.length > 0
      ? (surveyRows.reduce((sum, item) => sum + item.satisfactionScore, 0) / surveyRows.length).toFixed(1)
      : "-";
  const averageDifficulty =
    surveyRows.length > 0
      ? (surveyRows.reduce((sum, item) => sum + item.difficultyScore, 0) / surveyRows.length).toFixed(1)
      : "-";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">설문 분석</h1>
        <p className="text-slate-400 text-sm">연령대, 그룹 유형, 성별 기준으로 만족도와 난이도 응답 차이를 비교합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">총 응답 수</p>
          <p className="text-3xl font-bold text-white mt-2">{surveyRows.length}</p>
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

      <SurveySegmentsClientTable data={segmentRows} />
    </div>
  );
}
