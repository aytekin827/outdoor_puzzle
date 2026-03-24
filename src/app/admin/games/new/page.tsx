import { db } from "@/db";
import { games } from "@/db/schema";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      <Link href="/admin/games" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Games
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-2xl font-bold text-white">Create New Game</h1>
          <p className="text-slate-400 text-sm mt-1">Set up a new escape room game structure.</p>
        </div>

        <form action={handleCreate} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Title</label>
            <input name="title" required className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" placeholder="Enter game title" />
          </div>
          
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Description</label>
            <textarea name="description" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none focus:border-primary focus:outline-none transition-colors" placeholder="Provide a brief description" />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Prologue Type</label>
            <select name="prologueType" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors">
              <option value="slide">Slide</option>
              <option value="video">Video</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Video URL (for Video type)</label>
            <input name="prologueVideoUrl" placeholder="https://pub-xxx.r2.dev/intro.mp4" className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors" />
          </div>
          
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-semibold text-slate-400">Slides JSON (Array of URLs)</label>
            <textarea name="prologueSlidesJson" placeholder='["/img/p1.jpg", "/img/p2.jpg"]' className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white font-mono text-xs h-24 focus:border-primary focus:outline-none transition-colors" />
          </div>
          
          <div className="sm:col-span-2 pt-4 border-t border-slate-800">
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
