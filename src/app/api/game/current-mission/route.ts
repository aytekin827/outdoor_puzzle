import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playSessions } from "@/db/schema";
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

export async function GET(req: NextRequest) {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const requestedMissionId = searchParams.get("missionId");

    const gameMissions = await getOrderedGameMissions(player.gameId);
    const completedMissionIds = await getCompletedMissionIds(session.id, player.id);

    let currentMission = requestedMissionId 
      ? gameMissions.find(m => m.id === requestedMissionId)
      : gameMissions.find(m => !completedMissionIds.has(m.id));
    const now = Date.now();

    if (currentMission) {
      await ensureMissionSession(session.id, currentMission);
      await db.update(playSessions).set({
        lastMissionId: currentMission.id,
        updatedAt: now,
      }).where(eq(playSessions.id, session.id)).run();
    } else {
      await db.update(playSessions).set({
        updatedAt: now,
      }).where(eq(playSessions.id, session.id)).run();
    }

    const isSolved = currentMission ? completedMissionIds.has(currentMission.id) : false;

    return NextResponse.json({ 
      currentMission: currentMission ? {
        ...currentMission,
        answer: isSolved ? currentMission.answer : undefined
      } : null,
      totalMissions: gameMissions.length,
      completedCount: gameMissions.filter(m => completedMissionIds.has(m.id)).length,
      isCompleted: !requestedMissionId && !currentMission,
      isSolved
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await req.json();
    const eventType = String(body.eventType || "").trim();
    const missionId = typeof body.missionId === "string" ? body.missionId : null;
    const permissionState = typeof body.permissionState === "string" ? body.permissionState : null;
    const location = body.location && typeof body.location.latitude === "number" && typeof body.location.longitude === "number"
      ? {
          latitude: body.location.latitude,
          longitude: body.location.longitude,
          accuracyM: typeof body.location.accuracyM === "number" ? body.location.accuracyM : null,
        }
      : null;

    if (!eventType) {
      return NextResponse.json({ error: "Missing event type" }, { status: 400 });
    }

    const missionSession = missionId ? await getMissionSession(session.id, missionId) : null;

    await logLocationEvent({
      playSessionId: session.id,
      missionId,
      missionSessionId: missionSession?.id ?? null,
      eventType,
      location,
      permissionState,
      payloadJson: JSON.stringify({
        source: "mission-page",
        permissionState,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
