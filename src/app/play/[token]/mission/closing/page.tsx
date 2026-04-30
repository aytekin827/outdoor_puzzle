import { db } from "@/db";
import { missions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ClosingInstructionClient } from "./ClosingInstructionClient";

export const dynamic = "force-dynamic";

export default async function ClosingInstructionPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ missionId?: string }>;
}) {
  const { token } = await params;
  const { missionId } = await searchParams;

  if (!missionId) {
    redirect(`/play/${token}/mission`);
  }

  const mission = await db
    .select()
    .from(missions)
    .where(eq(missions.id, missionId))
    .get();

  if (!mission || (!mission.closingInstruction && !mission.closingInstructionType)) {
    redirect(`/play/${token}/mission`);
  }

  const nextMission = await db
    .select({ id: missions.id })
    .from(missions)
    .where(eq(missions.gameId, mission.gameId))
    .orderBy(missions.orderIndex)
    .all();

  const currentIndex = nextMission.findIndex(m => m.id === missionId);
  const nextMissionId = nextMission[currentIndex + 1]?.id || null;

  return (
    <ClosingInstructionClient 
      token={token} 
      mission={mission} 
      nextMissionId={nextMissionId}
    />
  );
}
