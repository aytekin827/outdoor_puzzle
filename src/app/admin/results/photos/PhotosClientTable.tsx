"use client";

import { DataTable } from "@/components/DataTable";

type PhotoRow = {
  id: string;
  gameId: string;
  nickname: string;
  gameTitle: string;
  mimeType: string;
  status: string;
  uploadedAt: number;
  uploadedAtLabel: string;
};

export function PhotosClientTable({ data }: { data: PhotoRow[] }) {
  const uniqueGames = Array.from(new Map(data.map((item) => [item.gameId, item.gameTitle])).entries())
    .filter(([id, title]) => id && title)
    .map(([id, title]) => ({ label: String(title), value: String(id) }));

  return (
    <DataTable<PhotoRow>
      data={data}
      searchKeys={["nickname", "gameTitle", "mimeType", "status"]}
      searchHelpText="검색어: 플레이어명, 게임명, 파일 형식, 상태"
      searchPlaceholder="인증샷 검색"
      basePath="/admin/results/photos"
      defaultSort={{ key: "uploadedAt", direction: "desc" }}
      filters={[
        ...(uniqueGames.length > 0 ? [{ key: "gameId", label: "게임", options: uniqueGames }] : []),
        {
          key: "status",
          label: "상태",
          options: [{ label: "활성", value: "active" }],
        },
      ]}
      columns={[
        { key: "nickname", label: "플레이어" },
        { key: "gameTitle", label: "게임" },
        { key: "mimeType", label: "형식" },
        { key: "status", label: "상태" },
        { key: "uploadedAtLabel", label: "업로드 시각" },
      ]}
    />
  );
}
