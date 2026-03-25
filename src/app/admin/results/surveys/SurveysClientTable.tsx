"use client";

import { DataTable } from "@/components/DataTable";

type SurveyRow = {
  id: string;
  gameId: string;
  nickname: string;
  gameTitle: string;
  groupType: string;
  groupTypeLabel: string;
  ageRange: string;
  gender: string;
  satisfactionLabel: string;
  difficultyLabel: string;
  comment: string;
  submittedAt: number;
};

export function SurveysClientTable({ data }: { data: SurveyRow[] }) {
  const uniqueGames = Array.from(new Map(data.map((item) => [item.gameId, item.gameTitle])).entries())
    .filter(([id, title]) => id && title)
    .map(([id, title]) => ({ label: String(title), value: String(id) }));

  return (
    <DataTable<SurveyRow>
      data={data}
      searchKeys={["nickname", "gameTitle", "groupType", "ageRange", "gender", "comment"]}
      searchHelpText="검색어: 플레이어명, 게임명, 그룹 유형, 연령대, 성별, 후기"
      searchPlaceholder="설문 결과 검색"
      basePath="/admin/results/surveys"
      defaultSort={{ key: "submittedAt", direction: "desc" }}
      filters={[
        ...(uniqueGames.length > 0 ? [{ key: "gameId", label: "게임", options: uniqueGames }] : []),
        {
          key: "gender",
          label: "성별",
          options: [
            { label: "남성", value: "male" },
            { label: "여성", value: "female" },
            { label: "기타", value: "other" },
            { label: "응답 안 함", value: "prefer_not_to_say" },
          ],
        },
      ]}
      columns={[
        { key: "nickname", label: "플레이어" },
        { key: "gameTitle", label: "게임" },
        { key: "groupTypeLabel", label: "그룹 유형" },
        { key: "ageRange", label: "연령대" },
        { key: "satisfactionLabel", label: "만족도" },
        { key: "difficultyLabel", label: "난이도" },
      ]}
    />
  );
}
