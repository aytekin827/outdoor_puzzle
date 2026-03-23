import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, missions, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { missionId, answer } = await req.json();
    const cookieStore = await cookies();
    const playerId = cookieStore.get("playerId")?.value;

    if (!playerId || !missionId || !answer) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Get mission
    const missionArray = db.select().from(missions).where(eq(missions.id, missionId)).all();
    if (missionArray.length === 0) return NextResponse.json({ error: "Mission not found" }, { status: 404 });
    const mission = missionArray[0];

    const isCorrect = answer.trim().toLowerCase() === mission.answer.trim().toLowerCase();

    db.insert(submissions).values({
      id: crypto.randomUUID(),
      playerId,
      missionId,
      submittedAnswer: answer,
      isCorrect,
      submittedAt: Date.now()
    }).run();

    if (isCorrect) {
      // Check if this was the last mission
      const playerArray = db.select().from(players).where(eq(players.id, playerId)).all();
      const player = playerArray[0];

      const allMissions = db.select().from(missions).where(eq(missions.gameId, player.gameId)).orderBy(missions.orderIndex).all();
      const allSubmissions = db.select().from(submissions).where(and(eq(submissions.playerId, playerId), eq(submissions.isCorrect, true))).all();
      
      // If completed count == total count, we finish
      const uniqueCompleted = new Set(allSubmissions.map(s => s.missionId));
      if (uniqueCompleted.size >= allMissions.length) {
        db.update(players).set({ status: 'completed', completedAt: Date.now() }).where(eq(players.id, playerId)).run();
        return NextResponse.json({ success: true, isCorrect: true, isFinished: true });
      }

      return NextResponse.json({ success: true, isCorrect: true, isFinished: false });
    } else {
      return NextResponse.json({ success: true, isCorrect: false });
    }
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
