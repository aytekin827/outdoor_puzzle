"use client";

import { DataTable } from "@/components/DataTable";

type MissionAnalyticsRow = {
  id: string;
  gameId: string;
  gameTitle: string;
  title: string;
  startedCount: number;
  completedCount: number;
  completionRateLabel: string;
  averageDurationLabel: string;
  averageHintLabel: string;
  averageWrongLabel: string;
};

export function MissionsAnalyticsClientTable({ data }: { data: MissionAnalyticsRow[] }) {
  const uniqueGames = Array.from(new Map(data.map((item) => [item.gameId, item.gameTitle])).entries())
    .filter(([id, title]) => id && title)
    .map(([id, title]) => ({ label: String(title), value: String(id) }));

  return (
    <DataTable<MissionAnalyticsRow>
      data={data}
      searchKeys={["title", "gameTitle"]}
      searchHelpText="검색어: 미션명, 게임명"
      searchPlaceholder="미션 분석 검색"
      basePath="/admin/analytics/missions"
      defaultSort={{ key: "startedCount", direction: "desc" }}
      disableRowClick
      filters={uniqueGames.length > 0 ? [{ key: "gameId", label: "게임", options: uniqueGames }] : []}
      columns={[
        { key: "gameTitle", label: "게임" },
        { key: "title", label: "미션" },
        { key: "startedCount", label: "시작 수" },
        { key: "completedCount", label: "완료 수" },
        { key: "completionRateLabel", label: "완료율" },
        { key: "averageDurationLabel", label: "평균 시간" },
        { key: "averageHintLabel", label: "평균 힌트" },
        { key: "averageWrongLabel", label: "평균 오답" },
      ]}
    />
  );
}
