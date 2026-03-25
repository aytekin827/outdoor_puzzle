"use client";

import { DataTable } from "@/components/DataTable";

type GameAnalyticsRow = {
  id: string;
  title: string;
  description: string;
  missionCount: number;
  sessionCount: number;
  completedSessions: number;
  completionRateLabel: string;
  averageDurationLabel: string;
  averageSatisfactionLabel: string;
  averageDifficultyLabel: string;
};

export function GamesAnalyticsClientTable({ data }: { data: GameAnalyticsRow[] }) {
  return (
    <DataTable<GameAnalyticsRow>
      data={data}
      searchKeys={["title", "description"]}
      searchHelpText="검색어: 게임명, 설명"
      searchPlaceholder="게임 분석 검색"
      basePath="/admin/analytics/games"
      defaultSort={{ key: "completedSessions", direction: "desc" }}
      disableRowClick
      columns={[
        { key: "title", label: "게임" },
        { key: "missionCount", label: "미션 수" },
        { key: "sessionCount", label: "세션 수" },
        { key: "completionRateLabel", label: "완료율" },
        { key: "averageDurationLabel", label: "평균 시간" },
        { key: "averageSatisfactionLabel", label: "평균 만족도" },
        { key: "averageDifficultyLabel", label: "평균 난이도" },
      ]}
    />
  );
}
