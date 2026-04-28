import { cookies } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  eventLogs,
  locationLogs,
  missions,
  missionSessions,
  players,
  playSessions,
  submissions,
} from "@/db/schema";

async function getPlayerById(playerId: string) {
  const result = await db.select().from(players).where(eq(players.id, playerId)).all();
  return result[0] ?? null;
}

async function getPlaySessionById(playSessionId: string, playerId: string) {
  const result = await db
    .select()
    .from(playSessions)
    .where(and(eq(playSessions.id, playSessionId), eq(playSessions.playerId, playerId)))
    .all();
  return result[0] ?? null;
}

async function getLatestPlaySession(playerId: string) {
  const result = await db
    .select()
    .from(playSessions)
    .where(eq(playSessions.playerId, playerId))
    .orderBy(desc(playSessions.createdAt))
    .all();
  return result[0] ?? null;
}

export async function getPlayerSessionContext() {
  const cookieStore = await cookies();
  const playerId = cookieStore.get("playerId")?.value;
  const playSessionId = cookieStore.get("playSessionId")?.value;

  if (!playerId) {
    return { cookieStore, player: null, playSession: null };
  }

  const player = await getPlayerById(playerId);
  if (!player) {
    return { cookieStore, player: null, playSession: null };
  }

  let playSession = null;

  if (playSessionId) {
    playSession = await getPlaySessionById(playSessionId, player.id);
  }

  if (!playSession) {
    playSession = await getLatestPlaySession(player.id);
    if (playSession) {
      cookieStore.set("playSessionId", playSession.id, { httpOnly: true, path: "/" });
    }
  }

  return { cookieStore, player, playSession };
}

export async function createPlaySessionForPlayer(player: typeof players.$inferSelect) {
  const now = Date.now();
  const playSessionId = crypto.randomUUID();

  await db.insert(playSessions).values({
    id: playSessionId,
    playerId: player.id,
    gameId: player.gameId,
    qrTokenId: player.qrTokenId,
    status: player.status,
    startedAt: player.startedAt,
    endedAt: player.completedAt,
    totalDurationMs:
      player.startedAt && player.completedAt ? player.completedAt - player.startedAt : null,
    createdAt: now,
    updatedAt: now,
  }).run();

  const result = await db.select().from(playSessions).where(eq(playSessions.id, playSessionId)).all();
  return result[0] ?? null;
}

export async function ensurePlaySession(player: typeof players.$inferSelect) {
  const latest = await getLatestPlaySession(player.id);
  if (latest) {
    return latest;
  }
  return createPlaySessionForPlayer(player);
}

export async function getOrderedGameMissions(gameId: string) {
  return db.select().from(missions).where(eq(missions.gameId, gameId)).orderBy(missions.orderIndex).all();
}

export async function getCompletedMissionIds(playSessionId: string, playerId: string) {
  const completedMissionSessionRows = await db
    .select({ missionId: missionSessions.missionId })
    .from(missionSessions)
    .where(and(eq(missionSessions.playSessionId, playSessionId), eq(missionSessions.isCompleted, true)))
    .all();

  const completedMissionIds = new Set(completedMissionSessionRows.map((row) => row.missionId));

  const sessionCorrectSubmissions = await db
    .select({ missionId: submissions.missionId })
    .from(submissions)
    .where(and(eq(submissions.playSessionId, playSessionId), eq(submissions.isCorrect, true)))
    .all();

  for (const row of sessionCorrectSubmissions) {
    completedMissionIds.add(row.missionId);
  }

  if (completedMissionIds.size === 0) {
    const legacyCorrectSubmissions = await db
      .select({ missionId: submissions.missionId })
      .from(submissions)
      .where(and(eq(submissions.playerId, playerId), eq(submissions.isCorrect, true)))
      .all();

    for (const row of legacyCorrectSubmissions) {
      completedMissionIds.add(row.missionId);
    }
  }

  return completedMissionIds;
}

export async function getMissionSession(playSessionId: string, missionId: string) {
  const result = await db
    .select()
    .from(missionSessions)
    .where(and(eq(missionSessions.playSessionId, playSessionId), eq(missionSessions.missionId, missionId)))
    .all();
  return result[0] ?? null;
}

export async function ensureMissionSession(
  playSessionId: string,
  mission: typeof missions.$inferSelect,
) {
  const existing = await getMissionSession(playSessionId, mission.id);
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const missionSessionId = crypto.randomUUID();

  await db.insert(missionSessions).values({
    id: missionSessionId,
    playSessionId,
    missionId: mission.id,
    orderIndex: mission.orderIndex,
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  }).run();

  const result = await db.select().from(missionSessions).where(eq(missionSessions.id, missionSessionId)).all();
  return result[0] ?? null;
}

type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
};

type LogLocationOptions = {
  playSessionId: string;
  eventType: string;
  missionId?: string | null;
  missionSessionId?: string | null;
  location?: LocationPayload | null;
  permissionState?: string | null;
  payloadJson?: string | null;
};

export async function logLocationEvent(options: LogLocationOptions) {
  const now = Date.now();

  if (options.location) {
    await db.insert(locationLogs).values({
      id: crypto.randomUUID(),
      playSessionId: options.playSessionId,
      missionId: options.missionId ?? null,
      missionSessionId: options.missionSessionId ?? null,
      eventType: options.eventType,
      latitude: options.location.latitude,
      longitude: options.location.longitude,
      accuracyM: options.location.accuracyM ?? null,
      capturedAt: now,
    }).run();
  }

  await db.insert(eventLogs).values({
    id: crypto.randomUUID(),
    playSessionId: options.playSessionId,
    missionId: options.missionId ?? null,
    missionSessionId: options.missionSessionId ?? null,
    eventType: options.eventType,
    payloadJson: options.payloadJson ?? null,
    createdAt: now,
  }).run();

  if (options.permissionState) {
    await db.update(playSessions).set({
      locationPermissionState: options.permissionState,
      updatedAt: now,
    }).where(eq(playSessions.id, options.playSessionId)).run();
  }
}

export async function logEvent(playSessionId: string, eventType: string, payload?: any) {
  const now = Date.now();
  await db.insert(eventLogs).values({
    id: crypto.randomUUID(),
    playSessionId,
    eventType,
    payloadJson: payload ? JSON.stringify(payload) : null,
    createdAt: now,
  }).run();
}

export async function isPrologueCompleted(playSessionId: string) {
  const result = await db
    .select()
    .from(eventLogs)
    .where(and(eq(eventLogs.playSessionId, playSessionId), eq(eventLogs.eventType, "prologue_completed")))
    .all();
  return result.length > 0;
}
