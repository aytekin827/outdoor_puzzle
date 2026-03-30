import { db } from "@/db";
import { completionPhotos, games, players, playSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatDateTime(value: number | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default async function PhotoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ photo_id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { photo_id } = await params;
  const { returnTo } = await searchParams;

  const photo = await db.select().from(completionPhotos).where(eq(completionPhotos.id, photo_id)).get();
  if (!photo) {
    redirect("/admin/results/photos");
  }

  const session = await db.select().from(playSessions).where(eq(playSessions.id, photo.playSessionId)).get();
  const player = session ? await db.select().from(players).where(eq(players.id, session.playerId)).get() : null;
  const game = session ? await db.select().from(games).where(eq(games.id, session.gameId)).get() : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">인증샷 상세</h1>
          <p className="text-slate-400 text-sm">인증샷과 연결된 플레이 세션 정보를 함께 확인합니다.</p>
        </div>
        <Link href={returnTo || "/admin/results/photos"} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
          목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-500 text-sm">플레이어</p>
          <p className="text-2xl font-bold text-white mt-2">{player?.nickname || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-500 text-sm">게임</p>
          <p className="text-2xl font-bold text-white mt-2">{game?.title || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-500 text-sm">업로드 시각</p>
          <p className="text-2xl font-bold text-white mt-2">{formatDateTime(photo.uploadedAt)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.assetUrl} alt="인증샷" className="w-full rounded-2xl border border-slate-800 object-cover max-h-[720px]" />
        <div className="text-sm text-slate-400 flex flex-wrap gap-6">
          <span>형식: {photo.mimeType || "-"}</span>
          <span>파일 크기: {photo.fileSize ? `${Math.round(photo.fileSize / 1024)}KB` : "-"}</span>
          <span>상태: {photo.status}</span>
        </div>
      </div>
    </div>
  );
}
