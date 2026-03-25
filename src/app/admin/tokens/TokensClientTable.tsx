"use client";

import { DataTable } from "@/components/DataTable";
import { CheckCircle, Clock, QrCode } from "lucide-react";

export function TokensClientTable({ data }: { data: any[] }) {
  // Get unique games for filtering
  const uniqueGames = Array.from(new Map(data.map(item => [item.gameId, item.gameTitle])).entries())
    .filter(([id, title]) => id && title)
    .map(([id, title]) => ({ label: title, value: id }));

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
      alert(`QR 이미지 복사 완료`);
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
    <DataTable<any>
      data={data}
      searchKeys={["token", "gameTitle"]}
      searchHelpText="검색어 : 토큰 ID, 게임 제목"
      basePath="/admin/tokens"
      defaultSort={{ key: "createdAt", direction: "desc" }}
      filters={uniqueGames.length > 0 ? [
        { key: "gameId", label: "게임", options: uniqueGames }
      ] : []}
      columns={[
        { key: "token", label: "토큰 ID" },
        {
          key: "gameTitle",
          label: "게임",
          render: (_val: any, row: any) => <span className="text-slate-400">{row.gameTitle}</span>
        },
        {
          key: "isUsed",
          label: "상태",
          render: (val: any) => val ? (
            <span className="flex items-center gap-1.5 text-slate-500 font-bold"><CheckCircle className="w-4 h-4" /> 사용됨</span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><Clock className="w-4 h-4" /> 사용가능</span>
          )
        },
        {
          key: "createdAt",
          label: "생성일",
          render: (val: any) => new Date(val).toLocaleDateString()
        },
        {
          key: "id" as any,
          label: "QR코드",
          render: (_val: any, row: any) => (
            <button
              onClick={(e) => handleCopyQR(e, row.token)}
              className="p-2 bg-slate-800 hover:bg-primary hover:text-white rounded-lg text-primary transition-all flex items-center gap-2 group"
              title="QR코드 복사"
            >
              <QrCode className="w-4 h-4" /> 복사
            </button>
          )
        }
      ]}
    />
  );
}
