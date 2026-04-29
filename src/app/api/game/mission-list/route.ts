import { NextResponse } from "next/server";
import { 
  getPlayerSessionContext, 
  getOrderedGameMissions, 
  getCompletedMissionIds, 
  isPrologueCompleted 
} from "@/lib/game-session";
import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function GET() {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player || !playSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameMissions = await getOrderedGameMissions(player.gameId);
    const completedMissionIds = await getCompletedMissionIds(playSession.id, player.id);
    const prologueDone = await isPrologueCompleted(playSession.id);

    // Fetch game for prologue info
    const gameResult = await db.select().from(games).where(eq(games.id, player.gameId)).all();
    const game = gameResult[0];

    const missions = [
      {
        id: "prologue",
        type: "prologue",
        title: "프롤로그",
        description: game?.description || "게임의 시작을 알리는 이야기입니다.",
        imageUrl: game?.prologueType === 'slide' ? JSON.parse(game.prologueSlidesJson || '[]')[0] : null,
        isCompleted: prologueDone,
        isLocked: false,
      },
      ...gameMissions.map((m, index) => {
        let isLocked = false;
        if (index === 0) {
          isLocked = !prologueDone;
        } else {
          const prevMission = gameMissions[index - 1];
          isLocked = !completedMissionIds.has(prevMission.id);
        }

        return {
          id: m.id,
          type: "mission",
          title: m.title,
          description: m.description || m.checkpointInstruction,
          imageUrl: m.imageUrl,
          isCompleted: completedMissionIds.has(m.id),
          isLocked,
        };
      })
    ];

    return NextResponse.json({ missions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
