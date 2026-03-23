import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { qrTokens, games, players } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const token = (await params).token;

    const qrTokenResult = await db.select().from(qrTokens).where(eq(qrTokens.token, token)).all();
    if (qrTokenResult.length === 0) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const qrToken = qrTokenResult[0];

    const gameResult = await db.select().from(games).where(eq(games.id, qrToken.gameId)).all();
    const game = gameResult[0];

    let player = null;
    const cookieStore = await cookies();
    const playerId = cookieStore.get("playerId")?.value;

    if (playerId) {
      const playerResult = await db.select().from(players).where(
        and(eq(players.id, playerId), eq(players.qrTokenId, qrToken.id))
      ).all();
      if (playerResult.length > 0) {
        player = playerResult[0];
      }
    }

    return NextResponse.json({ 
      qrToken: { isUsed: qrToken.isUsed }, 
      game,
      player 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
