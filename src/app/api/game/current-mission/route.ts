import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, missions, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const playerId = cookieStore.get("playerId")?.value;

    if (!playerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playerResult = db.select().from(players).where(eq(players.id, playerId)).all();
    if (playerResult.length === 0) return NextResponse.json({ error: "Player not found" }, { status: 404 });
    const player = playerResult[0];

    // Find all missions for this game to determine total and current
    const gameMissions = db.select().from(missions).where(eq(missions.gameId, player.gameId)).orderBy(missions.orderIndex).all();
    
    // Find submissions to know what is completed
    const playerSubmissions = db.select().from(submissions)
      .where(and(eq(submissions.playerId, playerId), eq(submissions.isCorrect, true)))
      .all();
      
    const completedMissionIds = new Set(playerSubmissions.map(s => s.missionId));

    const currentMission = gameMissions.find(m => !completedMissionIds.has(m.id));

    return NextResponse.json({ 
      currentMission: currentMission || null,
      totalMissions: gameMissions.length,
      completedCount: gameMissions.filter(m => completedMissionIds.has(m.id)).length,
      isCompleted: !currentMission
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
