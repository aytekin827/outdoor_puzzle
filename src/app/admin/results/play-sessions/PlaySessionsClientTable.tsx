"use client";

import { DataTable } from "@/components/DataTable";

type PlaySessionRow = {
  id: string;
  gameId: string;
  nickname: string;
  gameTitle: string;
  status: string;
  totalDurationLabel: string;
  hintCount: number;
  wrongSubmissionCount: number;
};

export function PlaySessionsClientTable({ data }: { data: PlaySessionRow[] }) {
  const uniqueGames = Array.from(new Map(data.map((item) => [item.gameId, item.gameTitle])).entries())
    .filter(([id, title]) => id && title)
    .map(([id, title]) => ({ label: String(title), value: String(id) }));

  return (
    <DataTable<PlaySessionRow>
      data={data}
      searchKeys={["nickname", "gameTitle", "status"]}
      searchHelpText="검색어: 플레이어명, 게임명, 상태"
      searchPlaceholder="플레이 세션 검색"
      basePath="/admin/results/play-sessions"
      defaultSort={{ key: "startedAt", direction: "desc" }}
      filters={[
        {
          key: "status",
          label: "상태",
          options: [
            { label: "준비", value: "ready" },
            { label: "진행 중", value: "playing" },
            { label: "완료", value: "completed" },
            { label: "이탈", value: "abandoned" },
          ],
        },
        ...(uniqueGames.length > 0 ? [{ key: "gameId", label: "게임", options: uniqueGames }] : []),
      ]}
      columns={[
        { key: "nickname", label: "플레이어" },
        { key: "gameTitle", label: "게임" },
        {
          key: "status",
          label: "상태",
          render: (value) => {
            const tone =
              value === "completed"
                ? "text-emerald-400 bg-emerald-500/10"
                : value === "playing"
                  ? "text-blue-400 bg-blue-500/10"
                  : value === "abandoned"
                    ? "text-rose-400 bg-rose-500/10"
                    : "text-slate-300 bg-slate-700/40";
            return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${tone}`}>{value}</span>;
          },
        },
        {
          key: "totalDurationLabel",
          label: "총 소요 시간",
        },
        {
          key: "hintCount",
          label: "힌트",
        },
        {
          key: "wrongSubmissionCount",
          label: "오답",
        },
      ]}
    />
  );
}
