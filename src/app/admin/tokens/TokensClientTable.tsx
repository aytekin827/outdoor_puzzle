"use client";

import { DataTable } from "@/components/DataTable";
import { CheckCircle, Clock, QrCode } from "lucide-react";

export function TokensClientTable({ data }: { data: any[] }) {
  const handleCopyQR = async (e: React.MouseEvent, token: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/play/${token}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert(`이미지 복사 완료: ${token}`);
    } catch (err) {
      console.error("Failed to copy image: ", err);
      // Fallback: Copy URL only if image copy fails
      try {
        await navigator.clipboard.writeText(url);
        alert("이미지 복사 실패. 대신 URL이 복사되었습니다.");
      } catch (e2) {
        alert("복사에 실패했습니다.");
      }
    }
  };

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
        },
        {
          key: "id" as any,
          label: "QR",
          render: (_val: any, row: any) => (
            <button
              onClick={(e) => handleCopyQR(e, row.token)}
              className="p-2 bg-slate-800 hover:bg-primary hover:text-white rounded-lg text-primary transition-all flex items-center gap-2 group"
              title="Copy QR Image"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )
        }
      ]}
    />
  );
}
