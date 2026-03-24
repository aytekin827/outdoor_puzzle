"use client";

import { DataTable } from "@/components/DataTable";
import { CheckCircle, Clock } from "lucide-react";

export function TokensClientTable({ data }: { data: any[] }) {
  return (
    <DataTable
      data={data}
      searchKey="token"
      basePath="/admin/tokens"
      columns={[
        { key: "token", label: "Token ID" },
        { 
          key: "gameTitle", 
          label: "Attached Game",
          render: (_val: any, row: any) => <span className="text-slate-400">{row.gameTitle}</span>
        },
        { 
          key: "isUsed", 
          label: "Status",
          render: (val: any) => val ? (
            <span className="flex items-center gap-1.5 text-slate-500 font-bold"><CheckCircle className="w-4 h-4" /> Used</span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Clock className="w-4 h-4" /> Unused</span>
          )
        },
        {
          key: "createdAt",
          label: "Created At",
          render: (val: any) => new Date(val).toLocaleDateString()
        }
      ]}
    />
  );
}
