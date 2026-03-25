import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  completionPhotos,
  games,
  missionSessions,
  playSessions,
  postGameSurveys,
  submissions,
} from "@/db/schema";
import {
  ensurePlaySession,
  getOrderedGameMissions,
  getPlayerSessionContext,
} from "@/lib/game-session";
import { uploadFileToStorage } from "@/lib/storage";

export async function GET() {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const gameRows = await db.select().from(games).where(eq(games.id, player.gameId)).all();
    const surveyRows = await db.select().from(postGameSurveys).where(eq(postGameSurveys.playSessionId, session.id)).all();
    const photoRows = await db.select().from(completionPhotos).where(eq(completionPhotos.playSessionId, session.id)).all();
    const allMissions = await getOrderedGameMissions(player.gameId);
    const allSubmissions = await db.select().from(submissions).where(eq(submissions.playSessionId, session.id)).all();
    const allMissionSessions = await db.select().from(missionSessions).where(eq(missionSessions.playSessionId, session.id)).all();

    const missionStats = allMissions.map((mission) => {
      const missionSubs = allSubmissions.filter((submission) => submission.missionId === mission.id);
      const missionSession = allMissionSessions.find((item) => item.missionId === mission.id);

      return {
        missionId: mission.id,
        title: mission.title,
        attempts: missionSubs.length,
        solved: missionSession?.isCompleted ?? missionSubs.some((submission) => submission.isCorrect),
        startedAt: missionSession?.startedAt ?? null,
        endedAt: missionSession?.endedAt ?? null,
        durationMs: missionSession?.durationMs ?? null,
        hintCount: missionSession?.hintCount ?? 0,
      };
    });

    const game = gameRows[0] ?? null;

    return NextResponse.json({
      nickname: player.nickname,
      status: session.status,
      startedAt: session.startedAt ?? player.startedAt,
      completedAt: session.endedAt ?? player.completedAt,
      timeSpentMs:
        session.totalDurationMs ??
        (session.startedAt && session.endedAt ? session.endedAt - session.startedAt : 0),
      hintCount: session.hintCount,
      submissionCount: session.submissionCount,
      wrongSubmissionCount: session.wrongSubmissionCount,
      missionStats,
      game: game
        ? {
            id: game.id,
            title: game.title,
            epilogueType: game.epilogueType,
            epilogueContent: game.epilogueContent,
            epilogueSlidesJson: game.epilogueSlidesJson,
          }
        : null,
      survey: surveyRows[0] ?? null,
      completionPhoto: photoRows[0] ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await req.json();
    const ageRange = String(body.ageRange || "").trim();
    const groupType = String(body.groupType || "").trim();
    const groupTypeOther = String(body.groupTypeOther || "").trim();
    const gender = String(body.gender || "").trim();
    const satisfactionScore = Number(body.satisfactionScore || 0);
    const difficultyScore = Number(body.difficultyScore || 0);
    const comment = String(body.comment || "").trim();

    if (!ageRange || !groupType || !gender || satisfactionScore < 1 || difficultyScore < 1) {
      return NextResponse.json({ error: "Invalid survey payload" }, { status: 400 });
    }

    const now = Date.now();
    const existing = await db.select().from(postGameSurveys).where(eq(postGameSurveys.playSessionId, session.id)).all();

    if (existing[0]) {
      await db
        .update(postGameSurveys)
        .set({
          ageRange,
          groupType,
          groupTypeOther: groupType === "other" ? groupTypeOther : "",
          gender,
          satisfactionScore,
          difficultyScore,
          comment,
          submittedAt: now,
        })
        .where(eq(postGameSurveys.id, existing[0].id))
        .run();
    } else {
      await db.insert(postGameSurveys).values({
        id: crypto.randomUUID(),
        playSessionId: session.id,
        ageRange,
        groupType,
        groupTypeOther: groupType === "other" ? groupTypeOther : "",
        gender,
        satisfactionScore,
        difficultyScore,
        comment,
        submittedAt: now,
      }).run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { player, playSession } = await getPlayerSessionContext();
    if (!player) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = playSession ?? await ensurePlaySession(player);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const uploaded = await uploadFileToStorage(file, `completion/${session.id}`);
    const now = Date.now();
    const existing = await db.select().from(completionPhotos).where(eq(completionPhotos.playSessionId, session.id)).all();

    if (existing[0]) {
      await db
        .update(completionPhotos)
        .set({
          assetKey: uploaded.key,
          assetUrl: uploaded.url,
          mimeType: file.type,
          fileSize: file.size,
          status: "active",
          uploadedAt: now,
        })
        .where(eq(completionPhotos.id, existing[0].id))
        .run();
    } else {
      await db.insert(completionPhotos).values({
        id: crypto.randomUUID(),
        playSessionId: session.id,
        assetKey: uploaded.key,
        assetUrl: uploaded.url,
        mimeType: file.type,
        fileSize: file.size,
        status: "active",
        uploadedAt: now,
      }).run();
    }

    await db
      .update(playSessions)
      .set({
        completionPhotoUploaded: true,
        updatedAt: now,
      })
      .where(eq(playSessions.id, session.id))
      .run();

    return NextResponse.json({
      success: true,
      photo: {
        assetKey: uploaded.key,
        assetUrl: uploaded.url,
        mimeType: file.type,
        fileSize: file.size,
        uploadedAt: now,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
