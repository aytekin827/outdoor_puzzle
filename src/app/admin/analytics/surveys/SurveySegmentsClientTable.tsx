"use client";

import { DataTable } from "@/components/DataTable";

type SurveySegmentRow = {
  id: string;
  segmentType: string;
  segmentLabel: string;
  responseCount: number;
  shareLabel: string;
  averageSatisfactionLabel: string;
  averageDifficultyLabel: string;
};

export function SurveySegmentsClientTable({ data }: { data: SurveySegmentRow[] }) {
  return (
    <DataTable<SurveySegmentRow>
      data={data}
      searchKeys={["segmentType", "segmentLabel"]}
      searchHelpText="검색어: 구분, 항목"
      searchPlaceholder="설문 세그먼트 검색"
      basePath="/admin/analytics/surveys"
      defaultSort={{ key: "responseCount", direction: "desc" }}
      disableRowClick
      columns={[
        { key: "segmentType", label: "구분" },
        { key: "segmentLabel", label: "항목" },
        { key: "responseCount", label: "응답 수" },
        { key: "shareLabel", label: "비중" },
        { key: "averageSatisfactionLabel", label: "평균 만족도" },
        { key: "averageDifficultyLabel", label: "평균 난이도" },
      ]}
    />
  );
}
