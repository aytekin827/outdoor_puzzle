import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { qrTokens, players, playSessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const qrTokenResult = await db.select().from(qrTokens).where(eq(qrTokens.token, token)).all();
    if (qrTokenResult.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const qrToken = qrTokenResult[0];

    if (!qrToken.isUsed || !qrToken.usedAt) {
      return NextResponse.json({ error: "Token not yet used" }, { status: 400 });
    }

    // Check 1 day limit
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - qrToken.usedAt > oneDayInMs) {
      return NextResponse.json({ error: "Token expired (1 day limit)" }, { status: 403 });
    }

    // Find the player associated with this token
    const playerResult = await db.select().from(players).where(eq(players.qrTokenId, qrToken.id)).all();
    if (playerResult.length === 0) {
      return NextResponse.json({ error: "No player found for this token" }, { status: 404 });
    }

    const player = playerResult[0];

    // Find the active play session
    const sessionResult = await db.select().from(playSessions).where(
      and(eq(playSessions.playerId, player.id), eq(playSessions.status, "playing"))
    ).all();
    
    // If no "playing" session, maybe they finished or just started?
    // Let's just find the latest session.
    let playSession = sessionResult[0];
    if (!playSession) {
        const allSessions = await db.select().from(playSessions)
            .where(eq(playSessions.playerId, player.id))
            .orderBy(desc(playSessions.createdAt))
            .limit(1)
            .all();
        playSession = allSessions[0];
    }

    // Set cookies to restore session
    const cookieStore = await cookies();
    cookieStore.set("playerId", player.id, { httpOnly: true, path: "/" });
    if (playSession) {
      cookieStore.set("playSessionId", playSession.id, { httpOnly: true, path: "/" });
    }
    
    return NextResponse.json({ success: true, playerId: player.id, playSessionId: playSession?.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
