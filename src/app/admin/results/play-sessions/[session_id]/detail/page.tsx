import { db } from "@/db";
import {
  completionPhotos,
  eventLogs,
  games,
  locationLogs,
  missionSessions,
  missions,
  players,
  playSessions,
  postGameSurveys,
  submissions,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Activity, Camera, CheckCircle, ClipboardList, Clock3, MapPin, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDateTime(value: number | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatDuration(ms: number | null | undefined) {
  if (!ms) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}분 ${seconds}초`;
}

export default async function PlaySessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ session_id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { session_id } = await params;
  const { returnTo } = await searchParams;

  const session = await db.select().from(playSessions).where(eq(playSessions.id, session_id)).get();
  if (!session) {
    redirect("/admin/results/play-sessions");
  }

  const player = await db.select().from(players).where(eq(players.id, session.playerId)).get();
  const game = await db.select().from(games).where(eq(games.id, session.gameId)).get();
  const survey = await db.select().from(postGameSurveys).where(eq(postGameSurveys.playSessionId, session.id)).get();
  const photo = await db.select().from(completionPhotos).where(eq(completionPhotos.playSessionId, session.id)).get();
  const missionProgress = await db
    .select({
      id: missionSessions.id,
      orderIndex: missionSessions.orderIndex,
      title: missions.title,
      startedAt: missionSessions.startedAt,
      endedAt: missionSessions.endedAt,
      durationMs: missionSessions.durationMs,
      hintCount: missionSessions.hintCount,
      submissionCount: missionSessions.submissionCount,
      wrongSubmissionCount: missionSessions.wrongSubmissionCount,
      isCompleted: missionSessions.isCompleted,
    })
    .from(missionSessions)
    .leftJoin(missions, eq(missionSessions.missionId, missions.id))
    .where(eq(missionSessions.playSessionId, session.id))
    .orderBy(missionSessions.orderIndex)
    .all();

  const allSubmissions = await db
    .select({
      id: submissions.id,
      submittedAnswer: submissions.submittedAnswer,
      isCorrect: submissions.isCorrect,
      submittedAt: submissions.submittedAt,
      missionTitle: missions.title,
      orderIndex: missions.orderIndex,
    })
    .from(submissions)
    .leftJoin(missions, eq(submissions.missionId, missions.id))
    .where(eq(submissions.playSessionId, session.id))
    .orderBy(desc(submissions.submittedAt))
    .all();

  const recentLocationLogs = await db
    .select({
      id: locationLogs.id,
      eventType: locationLogs.eventType,
      latitude: locationLogs.latitude,
      longitude: locationLogs.longitude,
      accuracyM: locationLogs.accuracyM,
      capturedAt: locationLogs.capturedAt,
      missionTitle: missions.title,
    })
    .from(locationLogs)
    .leftJoin(missions, eq(locationLogs.missionId, missions.id))
    .where(eq(locationLogs.playSessionId, session.id))
    .orderBy(desc(locationLogs.capturedAt))
    .all();

  const recentEventLogs = await db
    .select({
      id: eventLogs.id,
      eventType: eventLogs.eventType,
      payloadJson: eventLogs.payloadJson,
      createdAt: eventLogs.createdAt,
      missionTitle: missions.title,
    })
    .from(eventLogs)
    .leftJoin(missions, eq(eventLogs.missionId, missions.id))
    .where(eq(eventLogs.playSessionId, session.id))
    .orderBy(desc(eventLogs.createdAt))
    .all();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">플레이 세션 상세</h1>
          <p className="text-slate-400 text-sm">
            플레이 진행, 설문, 인증샷, 위치 로그, 행동 로그를 세션 단위로 확인합니다.
          </p>
        </div>
        <Link
          href={returnTo || "/admin/results/play-sessions"}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">{player?.nickname || "이름 없음"}</h2>
            <div className="space-y-4 text-sm mt-4 border-t border-slate-800 pt-4">
              <p className="flex justify-between gap-4"><span className="text-slate-400">게임</span><span className="font-bold text-primary">{game?.title || "-"}</span></p>
              <p className="flex justify-between gap-4"><span className="text-slate-400">상태</span><span className="font-bold uppercase">{session.status}</span></p>
              <p className="flex justify-between gap-4"><span className="text-slate-400">위치 권한</span><span>{session.locationPermissionState || "-"}</span></p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Clock3 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">세션 요약</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-400">시작</span><span>{formatDateTime(session.startedAt)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400">종료</span><span>{formatDateTime(session.endedAt)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400">총 소요 시간</span><span>{formatDuration(session.totalDurationMs)}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400">힌트 사용</span><span>{session.hintCount}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400">정답 제출</span><span>{session.submissionCount}</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-400">오답 수</span><span>{session.wrongSubmissionCount}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">설문 결과</h2>
              </div>
              {survey ? (
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4"><span className="text-slate-400">연령대</span><span>{survey.ageRange}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">그룹 유형</span><span>{survey.groupTypeOther || survey.groupType}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">성별</span><span>{survey.gender}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">만족도</span><span>{survey.satisfactionScore}/5</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-400">난이도</span><span>{survey.difficultyScore}/5</span></div>
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-slate-400 mb-2">후기</p>
                    <p className="whitespace-pre-wrap">{survey.comment || "-"}</p>
                  </div>
                </div>
              ) : <p className="text-slate-400 text-sm">설문 응답이 없습니다.</p>}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-white">인증샷</h2>
              </div>
              {photo ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.assetUrl} alt="인증샷" className="w-full rounded-xl border border-slate-800 object-cover max-h-80" />
                  <div className="text-xs text-slate-500">
                    <p>업로드 시각: {formatDateTime(photo.uploadedAt)}</p>
                    <p>형식: {photo.mimeType || "-"}</p>
                  </div>
                </div>
              ) : <p className="text-slate-400 text-sm">업로드된 인증샷이 없습니다.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-bold text-white">위치 로그</h2>
              </div>
              <div className="space-y-3">
                {recentLocationLogs.length === 0 ? (
                  <p className="text-slate-400 text-sm">수집된 위치 로그가 없습니다.</p>
                ) : recentLocationLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-white">{log.eventType}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(log.capturedAt)}</p>
                    </div>
                    <p className="mt-2 text-slate-300">{log.latitude.toFixed(6)}, {log.longitude.toFixed(6)}</p>
                    <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-500">
                      <span>{log.missionTitle || "게임 공통 이벤트"}</span>
                      <span>정확도 {log.accuracyM ? `${Math.round(log.accuracyM)}m` : "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">행동 로그</h2>
              </div>
              <div className="space-y-3">
                {recentEventLogs.length === 0 ? (
                  <p className="text-slate-400 text-sm">수집된 행동 로그가 없습니다.</p>
                ) : recentEventLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-white">{log.eventType}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{log.missionTitle || "게임 공통 이벤트"}</p>
                    <p className="mt-2 whitespace-pre-wrap break-all text-xs text-slate-500">{log.payloadJson || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">미션별 진행 기록</h2>
            <div className="space-y-4">
              {missionProgress.length === 0 ? (
                <p className="text-slate-400 text-sm">미션 진행 기록이 없습니다.</p>
              ) : missionProgress.map((mission) => (
                <div key={mission.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-primary font-bold">Mission #{mission.orderIndex}</p>
                    <p className="text-sm text-slate-100 font-semibold">{mission.title || "Unknown mission"}</p>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>시작: {formatDateTime(mission.startedAt)}</p>
                      <p>종료: {formatDateTime(mission.endedAt)}</p>
                      <p>소요: {formatDuration(mission.durationMs)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs">
                    {mission.isCompleted ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle className="w-4 h-4" />완료</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" />미완료</span>
                    )}
                    <span className="text-slate-400">제출 {mission.submissionCount}회</span>
                    <span className="text-slate-400">오답 {mission.wrongSubmissionCount}회</span>
                    <span className="text-slate-400">힌트 {mission.hintCount}회</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">정답 제출 기록</h2>
            <div className="space-y-4">
              {allSubmissions.length === 0 ? (
                <p className="text-slate-400 text-sm">정답 제출 기록이 없습니다.</p>
              ) : allSubmissions.map((submission) => (
                <div key={submission.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-primary font-bold mb-1">Mission #{submission.orderIndex}</p>
                    <p className="text-sm text-slate-400 mb-1">{submission.missionTitle || "Unknown mission"}</p>
                    <p className="text-sm text-slate-300">&quot;{submission.submittedAnswer}&quot;</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {submission.isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold"><CheckCircle className="w-4 h-4" />정답</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 text-xs font-bold"><XCircle className="w-4 h-4" />오답</span>
                    )}
                    <span className="text-slate-500 text-xs">{formatDateTime(submission.submittedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
