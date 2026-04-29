import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { qrTokens, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { createPlaySessionForPlayer } from "@/lib/game-session";

export async function POST(req: NextRequest) {
  try {
    const { token, nickname } = await req.json();

    if (!token || !nickname) {
      return NextResponse.json({ error: "Missing token or nickname" }, { status: 400 });
    }

    const qrTokenResult = await db.select().from(qrTokens).where(eq(qrTokens.token, token)).all();
    if (qrTokenResult.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const qrToken = qrTokenResult[0];

    if (qrToken.isUsed) {
      return NextResponse.json({ error: "Token already used" }, { status: 403 });
    }

    // Mark as used
    await db.update(qrTokens)
      .set({ isUsed: true, usedAt: Date.now() })
      .where(eq(qrTokens.id, qrToken.id))
      .run();

    // Create player
    const playerId = crypto.randomUUID();
    await db.insert(players).values({
      id: playerId,
      gameId: qrToken.gameId,
      qrTokenId: qrToken.id,
      nickname,
      status: "ready", // ready, playing, completed
    }).run();

    const createdPlayer = {
      id: playerId,
      gameId: qrToken.gameId,
      qrTokenId: qrToken.id,
      nickname,
      startedAt: null,
      completedAt: null,
      status: "ready",
    };
    const playSession = await createPlaySessionForPlayer(createdPlayer);

    // Set cookie
    const cookieStore = await cookies();
    const maxAge = 365 * 24 * 60 * 60; // 1 year
    cookieStore.set("playerId", playerId, { httpOnly: true, path: "/", maxAge });
    if (playSession) {
      cookieStore.set("playSessionId", playSession.id, { httpOnly: true, path: "/", maxAge });
    }
    
    return NextResponse.json({ success: true, playerId, playSessionId: playSession?.id ?? null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
