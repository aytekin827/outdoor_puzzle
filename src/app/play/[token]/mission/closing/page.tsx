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

  return (
    <ClosingInstructionClient 
      token={token} 
      mission={mission} 
    />
  );
}
