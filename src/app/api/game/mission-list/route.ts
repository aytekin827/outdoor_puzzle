import { NextResponse } from "next/server";
import { 
  getPlayerSessionContext, 
  getOrderedGameMissions, 
  getCompletedMissionIds, 
  isPrologueCompleted 
} from "@/lib/game-session";

export async function GET() {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player || !playSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gameMissions = await getOrderedGameMissions(player.gameId);
    const completedMissionIds = await getCompletedMissionIds(playSession.id, player.id);
    const prologueDone = await isPrologueCompleted(playSession.id);

    const missions = [
      {
        id: "prologue",
        type: "prologue",
        title: "프롤로그",
        isCompleted: prologueDone,
        isLocked: false, // Prologue is never locked once game starts
      },
      ...gameMissions.map((m, index) => {
        // A mission is locked if the previous item (prologue or previous mission) is not completed
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
