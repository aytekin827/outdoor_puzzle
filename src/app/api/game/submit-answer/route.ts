import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { missionSessions, missions, players, playSessions, submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  ensureMissionSession,
  ensurePlaySession,
  getCompletedMissionIds,
  getMissionSession,
  getOrderedGameMissions,
  getPlayerSessionContext,
  logLocationEvent,
} from "@/lib/game-session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const missionId = body.missionId;
    const answer = body.answer;
    const { player, playSession } = await getPlayerSessionContext();

    if (!player || !missionId || !answer) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const missionArray = await db.select().from(missions).where(eq(missions.id, missionId)).all();
    if (missionArray.length === 0) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    const mission = missionArray[0];
    if (mission.gameId !== player.gameId) {
      return NextResponse.json({ error: "Invalid mission for player" }, { status: 400 });
    }

    const now = Date.now();
    const missionSession = await ensureMissionSession(session.id, mission);
    const normalizedAnswer = answer.trim();
    const isCorrect = normalizedAnswer.toLowerCase() === mission.answer.trim().toLowerCase();
    const wrongIncrement = isCorrect ? 0 : 1;
    const location = body.location && typeof body.location.latitude === "number" && typeof body.location.longitude === "number"
      ? {
          latitude: body.location.latitude,
          longitude: body.location.longitude,
          accuracyM: typeof body.location.accuracyM === "number" ? body.location.accuracyM : null,
        }
      : null;
    const permissionState = typeof body.permissionState === "string" ? body.permissionState : null;

    await db.insert(submissions).values({
      id: crypto.randomUUID(),
      playerId: player.id,
      playSessionId: session.id,
      missionId,
      submittedAnswer: normalizedAnswer,
      isCorrect,
      submittedAt: now
    }).run();

    if (!missionSession) {
      return NextResponse.json({ error: "Mission session not found" }, { status: 404 });
    }

    await db.update(missionSessions).set({
      submissionCount: missionSession.submissionCount + 1,
      wrongSubmissionCount: missionSession.wrongSubmissionCount + wrongIncrement,
      updatedAt: now,
    }).where(eq(missionSessions.id, missionSession.id)).run();

    await db.update(playSessions).set({
      lastMissionId: mission.id,
      submissionCount: session.submissionCount + 1,
      wrongSubmissionCount: session.wrongSubmissionCount + wrongIncrement,
      updatedAt: now,
    }).where(eq(playSessions.id, session.id)).run();

    if (!isCorrect) {
      return NextResponse.json({ success: true, isCorrect: false });
    }

    const refreshedMissionSession = await getMissionSession(session.id, mission.id);
    if (refreshedMissionSession && !refreshedMissionSession.isCompleted) {
      const startedAt = refreshedMissionSession.startedAt ?? now;
      await db.update(missionSessions).set({
        isCompleted: true,
        endedAt: now,
        durationMs: now - startedAt,
        updatedAt: now,
      }).where(eq(missionSessions.id, refreshedMissionSession.id)).run();
    }

    if (isCorrect) {
      await logLocationEvent({
        playSessionId: session.id,
        missionId: mission.id,
        missionSessionId: refreshedMissionSession?.id ?? missionSession.id,
        eventType: "mission_complete",
        location,
        permissionState,
        payloadJson: JSON.stringify({
          answer: normalizedAnswer,
          isCorrect,
        }),
      });
    }

    const allMissions = await getOrderedGameMissions(player.gameId);
    const completedMissionIds = await getCompletedMissionIds(session.id, player.id);
    const isFinished = completedMissionIds.size >= allMissions.length;

    if (isFinished) {
      const startedAt = session.startedAt ?? player.startedAt ?? now;
      const totalDurationMs = now - startedAt;

      await db.update(players).set({
        status: "completed",
        completedAt: now,
      }).where(eq(players.id, player.id)).run();

      await db.update(playSessions).set({
        status: "completed",
        endedAt: now,
        totalDurationMs,
        updatedAt: now,
      }).where(eq(playSessions.id, session.id)).run();

      return NextResponse.json({ success: true, isCorrect: true, isFinished: true });
    }

    return NextResponse.json({ success: true, isCorrect: true, isFinished: false });
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
