import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, qrTokens, submissions, missions, games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const playerId = cookieStore.get("playerId")?.value;

    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playerResult = await db.select().from(players).where(eq(players.id, playerId)).all();
    if (playerResult.length === 0) return NextResponse.json({ error: "Player not found" }, { status: 404 });
    const player = playerResult[0];

    const gameResult = await db.select().from(games).where(eq(games.id, player.gameId)).all();
    const game = gameResult[0];

    // Get time spent
    let timeSpentMs = 0;
    if (player.startedAt && player.completedAt) {
      timeSpentMs = player.completedAt - player.startedAt;
    }

    // Get stats
    const allMissions = await db.select().from(missions).where(eq(missions.gameId, game.id)).all();
    const allSubmissions = await db.select().from(submissions).where(eq(submissions.playerId, playerId)).all();

    const missionStats = allMissions.map(mission => {
      const missionSubs = allSubmissions.filter(s => s.missionId === mission.id);
      return {
        title: mission.title,
        attempts: missionSubs.length,
        solved: missionSubs.some(s => s.isCorrect)
      };
    });

    return NextResponse.json({ 
      nickname: player.nickname,
      status: player.status,
      startedAt: player.startedAt,
      completedAt: player.completedAt,
      timeSpentMs,
      missionStats
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
