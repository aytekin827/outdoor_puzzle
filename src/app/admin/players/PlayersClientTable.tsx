"use client";

import { DataTable } from "@/components/DataTable";

export function PlayersClientTable({ data }: { data: any[] }) {
  return (
    <DataTable
      data={data}
      searchHelpText="검색어 : 닉네임"
      searchKey="nickname"
      basePath="/admin/players"
      columns={[
        { key: "nickname", label: "닉네임" },
        {
          key: "gameTitle",
          label: "게임",
          render: (val: any) => <span className="text-slate-400">{val || "-"}</span>
        },
        {
          key: "status",
          label: "상태",
          render: (val: any) => {
            if (val === "completed") return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold uppercase">{val}</span>;
            if (val === "playing") return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase">{val}</span>;
            return <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-bold uppercase">{val}</span>;
          }
        },
        {
          key: "timeTaken",
          label: "소요시간",
          render: (_val: any, row: any) => {
            if (row.startedAt && row.completedAt) {
              const mins = Math.floor((row.completedAt - row.startedAt) / 60000);
              return `${mins} min`;
            } else if (row.startedAt) {
              return <span className="text-yellow-500">In Progress</span>;
            }
            return "-";
          }
        }
      ]}
    />
  );
}
