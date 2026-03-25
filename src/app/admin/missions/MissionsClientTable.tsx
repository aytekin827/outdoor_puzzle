"use client";

import { DataTable } from "@/components/DataTable";

export function MissionsClientTable({ data }: { data: any[] }) {
  // Get unique games for filtering
  const uniqueGames = Array.from(new Map(data.map(item => [item.gameId, item.gameTitle])).entries())
    .filter(([id, title]) => id && title)
    .map(([id, title]) => ({ label: title, value: id }));

  return (
    <DataTable<any>
      data={data}
      searchKeys={["title", "riddleQuestion", "answer"]}
      searchHelpText="검색어 : 미션 제목, 문제 내용, 정답"
      basePath="/admin/missions"
      defaultSort={{ key: "createdAt", direction: "desc" }}
      filters={uniqueGames.length > 0 ? [
        { key: "gameId", label: "게임", options: uniqueGames }
      ] : []}
      columns={[
        { key: "orderIndex", label: "순서" },
        {
          key: "gameTitle",
          label: "게임",
          render: (val) => <span className="text-slate-500 text-xs font-semibold">{val || "연결 없음"}</span>
        },
        { key: "title", label: "미션 제목" },
        { key: "riddleQuestion", label: "문제" },
        { key: "answer", label: "정답" },
        {
          key: "createdAt",
          label: "생성일",
          render: (val: any) => new Date(val).toLocaleDateString()
        }
      ]}
    />
  );
}
