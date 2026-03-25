import { db } from "@/db";
import { eventLogs, locationLogs, missions, playSessions } from "@/db/schema";
import { MovementAnalyticsClientTable } from "./MovementAnalyticsClientTable";

export const dynamic = "force-dynamic";

export default async function MovementAnalyticsPage() {
  const locationRows = await db.select().from(locationLogs).all();
  const eventRows = await db.select().from(eventLogs).all();
  const missionRows = await db.select().from(missions).all();
  const sessionRows = await db.select().from(playSessions).all();

  const missionsById = new Map(missionRows.map((row) => [row.id, row]));
  const grantedSessions = sessionRows.filter((row) => row.locationPermissionState === "granted").length;

  const locationGroups = new Map<string, { count: number; latestCapturedAt: number; missionTitle: string; eventType: string }>();
  for (const row of locationRows) {
    const missionTitle = row.missionId ? missionsById.get(row.missionId)?.title || "게임 공통 이벤트" : "게임 공통 이벤트";
    const key = `${row.eventType}:${missionTitle}`;
    const existing = locationGroups.get(key);
    if (existing) {
      existing.count += 1;
      existing.latestCapturedAt = Math.max(existing.latestCapturedAt, row.capturedAt);
    } else {
      locationGroups.set(key, {
        count: 1,
        latestCapturedAt: row.capturedAt,
        missionTitle,
        eventType: row.eventType,
      });
    }
  }

  const tableData = Array.from(locationGroups.entries()).map(([key, value]) => ({
    id: key,
    eventType: value.eventType,
    missionTitle: value.missionTitle,
    count: value.count,
    latestCapturedAtLabel: new Date(value.latestCapturedAt).toLocaleString(),
  }));

  const eventTypeGroups = new Map<string, number>();
  for (const row of eventRows) {
    eventTypeGroups.set(row.eventType, (eventTypeGroups.get(row.eventType) || 0) + 1);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">이동 / 행동 분석</h1>
        <p className="text-slate-400 text-sm">
          위치 수집 권한, 이벤트 유형별 로그 수, 미션별 위치 이벤트 분포를 기반으로 현장 이동 패턴을 확인합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">위치 로그 수</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{locationRows.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">행동 로그 수</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">{eventRows.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">위치 권한 허용 세션</p>
          <p className="text-3xl font-bold text-white mt-2">{grantedSessions}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">행동 이벤트 유형 수</p>
          <p className="text-3xl font-bold text-white mt-2">{eventTypeGroups.size}</p>
        </div>
      </div>

      <MovementAnalyticsClientTable data={tableData} />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white mb-4">이벤트 유형별 집계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from(eventTypeGroups.entries()).map(([eventType, count]) => (
            <div key={eventType} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-slate-500 text-sm">{eventType}</p>
              <p className="text-2xl font-bold text-white mt-2">{count}</p>
            </div>
          ))}
          {eventTypeGroups.size === 0 ? (
            <p className="text-slate-400 text-sm">아직 수집된 행동 이벤트가 없습니다.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
