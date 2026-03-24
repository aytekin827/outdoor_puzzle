"use client";

import { DataTable } from "@/components/DataTable";
import { CheckCircle, XCircle } from "lucide-react";

export function GamesClientTable({ data }: { data: any[] }) {
  return (
    <DataTable
      data={data}
      searchKey="title"
      basePath="/admin/games"
      columns={[
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
        { 
          key: "isActive", 
          label: "Active",
          render: (val: any) => val ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-slate-500" />
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
