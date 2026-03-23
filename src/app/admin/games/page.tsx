import { db } from "@/db";
import { games } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

export default async function GamesAdmin() {
  const allGames = await db.select().from(games).all();

  async function handleUpdate(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const prologueType = formData.get("prologueType") as string;
    const prologueVideoUrl = formData.get("prologueVideoUrl") as string;
    const prologueSlidesJson = formData.get("prologueSlidesJson") as string;
    
    await db.update(games).set({ 
      title, 
      description, 
      prologueType, 
      prologueVideoUrl, 
      prologueSlidesJson 
    }).where(eq(games.id, id)).run();
    revalidatePath("/admin/games");
  }

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
    revalidatePath("/admin/games");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold mb-4">Create New Game</h1>
        <form action={handleCreate} className="bg-slate-900 border border-slate-800 p-6 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm text-slate-400">Title</label>
            <input name="title" required className="bg-slate-950 border border-slate-800 p-2 rounded text-white focus:border-primary focus:outline-none" placeholder="Enter game title" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm text-slate-400">Description</label>
            <textarea name="description" className="bg-slate-950 border border-slate-800 p-2 rounded text-white focus:border-primary focus:outline-none" placeholder="Provide a brief description" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400">Prologue Type</label>
            <select name="prologueType" className="bg-slate-950 border border-slate-800 p-2 rounded text-white focus:border-primary focus:outline-none">
              <option value="slide">Slide</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-slate-400">Video URL (for Video type)</label>
            <input name="prologueVideoUrl" placeholder="/videos/intro.mp4" className="bg-slate-950 border border-slate-800 p-2 rounded text-white" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm text-slate-400">Slides JSON (Array of URLs, for Slide type)</label>
            <textarea name="prologueSlidesJson" placeholder='["/img/p1.jpg", "/img/p2.jpg"]' className="bg-slate-950 border border-slate-800 p-2 rounded text-white font-mono text-xs h-24" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full bg-emerald-500 text-black font-bold py-2 px-4 rounded hover:bg-emerald-400 transition-colors">
              ➕ Add Game
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Existing Games</h2>
        <div className="space-y-4">
          {allGames.map((game) => (
            <form key={game.id} action={handleUpdate} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
          <input type="hidden" name="id" value={game.id} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm text-slate-400">Title</label>
              <input name="title" defaultValue={game.title} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm text-slate-400">Description</label>
              <textarea name="description" defaultValue={game.description || ""} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Prologue Type</label>
              <select name="prologueType" defaultValue={game.prologueType} className="bg-slate-950 border border-slate-800 p-2 rounded text-white">
                <option value="slide">Slide</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Video URL</label>
              <input name="prologueVideoUrl" defaultValue={game.prologueVideoUrl || ""} className="bg-slate-950 border border-slate-800 p-2 rounded text-white" />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm text-slate-400">Slides JSON</label>
              <textarea name="prologueSlidesJson" defaultValue={game.prologueSlidesJson || ""} className="bg-slate-950 border border-slate-800 p-2 rounded text-white font-mono text-xs h-24" />
            </div>
          </div>

            <div className="flex items-center gap-2 mt-2">
              <button type="submit" className="bg-primary text-black font-bold py-2 px-6 rounded hover:bg-primary/90 transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        ))}
      </div>
      </div>
    </div>
  );
}
