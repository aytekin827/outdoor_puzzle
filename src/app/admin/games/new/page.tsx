import { db } from "@/db";
import { games } from "@/db/schema";
import { redirect } from "next/navigation";
import { PrologueEditor } from "../PrologueEditor";

export const dynamic = 'force-dynamic';

export default function NewGamePage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const prologueType = formData.get("prologueType") as string;
    const prologueVideoUrl = formData.get("prologueVideoUrl") as string;
    const prologueSlidesJson = formData.get("prologueSlidesJson") as string;

    await db.insert(games).values({
      id: crypto.randomUUID(),
      title,
      description,
      prologueType,
      prologueVideoUrl,
      prologueSlidesJson,
      isActive: true,
      createdAt: Date.now()
    }).run();

    redirect("/admin/games");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">새로운 게임 생성</h1>
        </div>

        <form action={handleCreate} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">제목</label>
            <input name="title" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="게임 제목을 입력해주세요." />
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">설명</label>
            <textarea name="description" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none focus:border-primary focus:outline-none transition-colors" placeholder="간략한 설명을 입력해주세요." />
          </div>

          <div className="sm:col-span-2">
            <PrologueEditor />
          </div>

          <div className="sm:col-span-2 pt-4 border-t border-slate-800">
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-white text-black hover:bg-slate-200 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold rounded-lg transition-colors shadow-lg shadow-white/10">
              게임 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
