import { NextResponse } from "next/server";
import { db } from "@/db";
import { players, playSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPlayerSessionContext, ensurePlaySession } from "@/lib/game-session";

export async function POST() {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const now = Date.now();

    await db.update(players)
      .set({ status: "playing", startedAt: player.startedAt ?? now })
      .where(eq(players.id, player.id))
      .run();

    await db.update(playSessions)
      .set({
        status: "playing",
        startedAt: session.startedAt ?? now,
        updatedAt: now,
      })
      .where(eq(playSessions.id, session.id))
      .run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
