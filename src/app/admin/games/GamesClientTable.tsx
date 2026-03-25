"use client";

import { DataTable } from "@/components/DataTable";
import { CheckCircle, XCircle } from "lucide-react";

export function GamesClientTable({ data }: { data: any[] }) {
  return (
    <DataTable<any>
      data={data}
      searchKeys={["title", "description"]}
      searchHelpText="검색어 : 게임 제목, 설명"
      basePath="/admin/games"
      columns={[
        { key: "title", label: "제목" },
        { key: "description", label: "설명" },
        {
          key: "isActive",
          label: "Active",
          render: (val: any) => val ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-slate-500" />
        },
        {
          key: "createdAt",
          label: "생성일",
          render: (val: any) => new Date(val).toLocaleDateString()
        }
      ]}
    />
  );
}
