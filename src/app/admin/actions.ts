"use server";

import { db } from "@/db";
import { games, missions, qrTokens, players, submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateGame(id: string, data: any) {
  await db.update(games).set(data).where(eq(games.id, id)).run();
  revalidatePath("/admin/games");
}

export async function addMission(data: any) {
  await db.insert(missions).values({
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...data
  }).run();
  revalidatePath("/admin/missions");
}

export async function updateMission(id: string, data: any) {
  await db.update(missions).set(data).where(eq(missions.id, id)).run();
  revalidatePath("/admin/missions");
}

export async function deleteMission(id: string) {
  await db.delete(missions).where(eq(missions.id, id)).run();
  revalidatePath("/admin/missions");
}

export async function generateQrTokens(gameId: string, count: number, prefix: string) {
  const newTokens = Array.from({ length: count }).map((_, i) => ({
    id: crypto.randomUUID(),
    token: `${prefix}-${Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2, '0')).join('')}`,
    gameId,
    isUsed: false,
    createdAt: Date.now()
  }));
  
  await db.insert(qrTokens).values(newTokens).run();
  revalidatePath("/admin/tokens");
}

export async function deleteQrToken(id: string) {
  // Clear players first
  const associatedPlayers = await db.select().from(players).where(eq(players.qrTokenId, id)).all();
  for (const p of associatedPlayers) {
    await db.delete(submissions).where(eq(submissions.playerId, p.id)).run();
  }
  await db.delete(players).where(eq(players.qrTokenId, id)).run();
  await db.delete(qrTokens).where(eq(qrTokens.id, id)).run();
  revalidatePath("/admin/tokens");
}

export async function resetQrToken(id: string) {
  await db.update(qrTokens).set({ isUsed: false, usedAt: null }).where(eq(qrTokens.id, id)).run();
  revalidatePath("/admin/tokens");
}

export async function deletePlayer(id: string) {
  // Must delete submissions first due to FK constraints (or PRAGMA foreign_keys)
  // Since we haven't enabled ON DELETE CASCADE specifically at sqlite level, let's delete manually
  await db.delete(submissions).where(eq(submissions.playerId, id)).run();
  await db.delete(players).where(eq(players.id, id)).run();
  revalidatePath("/admin/players");
  revalidatePath("/admin");
}
