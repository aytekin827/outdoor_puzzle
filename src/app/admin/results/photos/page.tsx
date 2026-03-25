import { db } from "@/db";
import { completionPhotos, games, players, playSessions } from "@/db/schema";
import { PhotosClientTable } from "./PhotosClientTable";

export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const photos = await db.select().from(completionPhotos).all();
  const sessions = await db.select().from(playSessions).all();
  const playersRows = await db.select().from(players).all();
  const gameRows = await db.select().from(games).all();

  const sessionsById = new Map(sessions.map((row) => [row.id, row]));
  const playersById = new Map(playersRows.map((row) => [row.id, row]));
  const gamesById = new Map(gameRows.map((row) => [row.id, row]));

  const tableData = photos.map((photo) => {
    const session = sessionsById.get(photo.playSessionId);
    const player = session ? playersById.get(session.playerId) : null;
    const game = session ? gamesById.get(session.gameId) : null;

    return {
      id: photo.id,
      gameId: session?.gameId || "",
      nickname: player?.nickname || "이름 없음",
      gameTitle: game?.title || "알 수 없는 게임",
      mimeType: photo.mimeType || "-",
      status: photo.status,
      uploadedAt: photo.uploadedAt,
      uploadedAtLabel: new Date(photo.uploadedAt).toLocaleString(),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">인증샷 결과</h1>
        <p className="text-slate-400 text-sm">업로드된 인증샷을 플레이 세션과 함께 확인하고 운영 검수를 진행합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">총 인증샷 수</p>
          <p className="text-3xl font-bold text-white mt-2">{tableData.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-slate-500 text-sm">활성 인증샷</p>
          <p className="text-3xl font-bold text-rose-400 mt-2">
            {tableData.filter((item) => item.status === "active").length}
          </p>
        </div>
      </div>

      <PhotosClientTable data={tableData} />
    </div>
  );
}
