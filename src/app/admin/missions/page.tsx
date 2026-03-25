import { db } from "@/db";
import { missions } from "@/db/schema";
import { Plus } from "lucide-react";
import Link from "next/link";
import { MissionsClientTable } from "./MissionsClientTable";
import { asc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function MissionsPage() {
  const allMissions = await db.select().from(missions).orderBy(asc(missions.orderIndex)).all();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Missions</h1>
          <p className="text-slate-400">Manage questions and checkpoints for your games.</p>
        </div>
        <Link href="/admin/missions/new" className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/25 border border-primary/20">
          <Plus className="w-5 h-5" /> Add New Mission
        </Link>
      </div>
      
      <MissionsClientTable data={allMissions} />
    </div>
  );
}
