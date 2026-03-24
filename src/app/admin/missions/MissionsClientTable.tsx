"use client";

import { DataTable } from "@/components/DataTable";

export function MissionsClientTable({ data }: { data: any[] }) {
  return (
    <DataTable
      data={data}
      searchKey="title"
      basePath="/admin/missions"
      columns={[
        { key: "orderIndex", label: "Order" },
        { key: "title", label: "MIssion Title" },
        { key: "riddleQuestion", label: "Question" },
        { key: "answer", label: "Answer" },
        {
          key: "createdAt",
          label: "Created At",
          render: (val: any) => new Date(val).toLocaleDateString()
        }
      ]}
    />
  );
}
