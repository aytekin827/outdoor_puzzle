"use client";

import { DataTable } from "@/components/DataTable";

type MovementAnalyticsRow = {
  id: string;
  eventType: string;
  missionTitle: string;
  count: number;
  latestCapturedAtLabel: string;
};

export function MovementAnalyticsClientTable({ data }: { data: MovementAnalyticsRow[] }) {
  return (
    <DataTable<MovementAnalyticsRow>
      data={data}
      searchKeys={["missionTitle", "eventType"]}
      searchHelpText="검색어: 미션명, 이벤트 유형"
      searchPlaceholder="이동/행동 분석 검색"
      basePath="/admin/analytics/movement"
      defaultSort={{ key: "count", direction: "desc" }}
      disableRowClick
      columns={[
        { key: "eventType", label: "이벤트" },
        { key: "missionTitle", label: "미션" },
        { key: "count", label: "로그 수" },
        { key: "latestCapturedAtLabel", label: "최근 수집 시각" },
      ]}
    />
  );
}
