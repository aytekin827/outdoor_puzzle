import { NextResponse } from "next/server";
import { getPlayerSessionContext, logEvent } from "@/lib/game-session";

export async function POST() {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player || !playSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await logEvent(playSession.id, "prologue_completed");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
