import { NextRequest, NextResponse } from "next/server";
import { getPlayerSessionContext, logEvent } from "@/lib/game-session";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player || !playSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const nickname = body.nickname;
    
    if (nickname) {
      await db.update(players)
        .set({ nickname: nickname.trim() })
        .where(eq(players.id, player.id))
        .run();
    }

    await logEvent(playSession.id, "prologue_completed");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
