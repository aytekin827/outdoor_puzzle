import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { qrTokens, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { token, nickname } = await req.json();

    if (!token || !nickname) {
      return NextResponse.json({ error: "Missing token or nickname" }, { status: 400 });
    }

    const qrTokenResult = db.select().from(qrTokens).where(eq(qrTokens.token, token)).all();
    if (qrTokenResult.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const qrToken = qrTokenResult[0];

    if (qrToken.isUsed) {
      return NextResponse.json({ error: "Token already used" }, { status: 403 });
    }

    // Mark as used
    db.update(qrTokens)
      .set({ isUsed: true, usedAt: Date.now() })
      .where(eq(qrTokens.id, qrToken.id))
      .run();

    // Create player
    const playerId = crypto.randomUUID();
    db.insert(players).values({
      id: playerId,
      gameId: qrToken.gameId,
      qrTokenId: qrToken.id,
      nickname,
      status: "ready", // ready, playing, completed
    }).run();

    // Set cookie
    (await cookies()).set("playerId", playerId, { httpOnly: true, path: "/" });
    
    return NextResponse.json({ success: true, playerId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
