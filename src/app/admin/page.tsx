import { db } from "@/db";
import {
  eventLogs,
  games,
  locationLogs,
  missions,
  players,
  playSessions,
  postGameSurveys,
  qrTokens,
} from "@/db/schema";
import {
  Activity,
  ClipboardList,
  Gamepad2,
  MapPin,
  QrCode
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function chunkIntoRows<T>(items: T[], chunkSize: number) {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    rows.push(items.slice(index, index + chunkSize));
  }

  return rows;
}

export default async function AdminDashboard() {
  const allGames = await db.select().from(games).all();
  const allMissions = await db.select().from(missions).all();
  const allPlayers = await db.select().from(players).all();
  const allTokens = await db.select().from(qrTokens).all();
  const allPlaySessions = await db.select().from(playSessions).all();
  const allSurveys = await db.select().from(postGameSurveys).all();
  const allLocationLogs = await db.select().from(locationLogs).all();
  const allEventLogs = await db.select().from(eventLogs).all();

  const usedTokens = allTokens.filter((token) => token.isUsed).length;
  const activePlayers = allPlayers.filter((player) => player.status === "playing").length;
  const completedPlayers = allPlayers.filter((player) => player.status === "completed").length;
  const completedSessions = allPlaySessions.filter((session) => session.status === "completed");
  const locationEnabledSessions = allPlaySessions.filter(
    (session) => session.locationPermissionState === "granted",
  ).length;

  const averageDurationMs =
    completedSessions.length > 0
      ? Math.round(
        completedSessions.reduce((total, session) => total + (session.totalDurationMs ?? 0), 0) /
        completedSessions.length,
      )
      : 0;

  const averageSatisfaction =
    allSurveys.length > 0
      ? (
        allSurveys.reduce((total, survey) => total + survey.satisfactionScore, 0) / allSurveys.length
      ).toFixed(1)
      : "-";

  const summaryCards = [
    {
      label: "게임 수",
      value: allGames.length,
      icon: <Gamepad2 className="w-8 h-8 text-blue-500" />,
      iconBg: "bg-blue-500/10",
    },
    {
      label: "총 미션 수",
      value: allMissions.length,
      icon: <ClipboardList className="w-8 h-8 text-emerald-500" />,
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "사용 토큰",
      value: `${usedTokens} / ${allTokens.length}`,
      icon: <QrCode className="w-8 h-8 text-purple-500" />,
      iconBg: "bg-purple-500/10",
    },
  ];

  const summaryCardRows = chunkIntoRows(summaryCards, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">운영 대시보드</h1>
        <p className="text-slate-400 text-sm">
          기존 운영 현황에 세션, 설문, GPS, 행동 로그 지표를 함께 확인할 수 있도록 확장했습니다
        </p>
      </div>

      <div className="space-y-4">
        {summaryCardRows.map((row, rowIndex) => (
          <div key={`summary-row-${rowIndex}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {row.map((card) => (
              <div
                key={card.label}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"
              >
                <div className={`${card.iconBg} p-4 rounded-xl`}>{card.icon}</div>
                <div>
                  <p className="text-slate-400 text-sm font-semibold">{card.label}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  {card.subValue ? <p className="text-xs text-slate-500 mt-1">{card.subValue}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-orange-500/10 p-4 rounded-xl">
            <MapPin className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold">위치 로그</p>
            <p className="text-2xl font-bold text-white">{allLocationLogs.length}</p>
            <p className="text-xs text-slate-500 mt-1">권한 허용 세션 {locationEnabledSessions}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-indigo-500/10 p-4 rounded-xl">
            <Activity className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-semibold">행동 로그</p>
            <p className="text-2xl font-bold text-white">{allEventLogs.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              세션당 {allPlaySessions.length > 0 ? (allEventLogs.length / allPlaySessions.length).toFixed(1) : "0.0"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white">플레이 운영 현황</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-slate-500">진행 중 플레이어</p>
              <p className="text-2xl font-bold text-white mt-2">{activePlayers}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-slate-500">완료 플레이어</p>
              <p className="text-2xl font-bold text-white mt-2">{completedPlayers}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 col-span-2">
              <p className="text-slate-500">평균 완료 시간</p>
              <p className="text-2xl font-bold text-white mt-2">
                {averageDurationMs > 0 ? formatDuration(averageDurationMs) : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white">수집 데이터 현황</h2>
          </div>
          <div className="p-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span>설문 제출 수</span>
              <span className="font-bold text-white">{allSurveys.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span>세션 수</span>
              <span className="font-bold text-white">{allPlaySessions.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span>위치 로그 누적</span>
              <span className="font-bold text-white">{allLocationLogs.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span>행동 로그 누적</span>
              <span className="font-bold text-white">{allEventLogs.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span>토큰 사용률</span>
              <span className="font-bold text-white">
                {allTokens.length > 0 ? `${Math.round((usedTokens / allTokens.length) * 100)}%` : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
