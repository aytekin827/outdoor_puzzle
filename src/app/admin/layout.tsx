"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, Database, ListTodo, QrCode, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navs = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Games", path: "/admin/games", icon: Database },
    { name: "Missions", path: "/admin/missions", icon: ListTodo },
    { name: "Tokens", path: "/admin/tokens", icon: QrCode },
    { name: "Players", path: "/admin/players", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-50 gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-sm mr-4">
            <LayoutDashboard className="w-5 h-5" />
            <span>MISSION CONTROL</span>
          </div>
          <div className="flex gap-4">
            {navs.map(n => {
              const active = pathname === n.path || (n.path !== "/admin" && pathname.startsWith(n.path));
              return (
                <Link key={n.path} href={n.path} className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${active ? "text-white pb-1 border-b-2 border-primary" : "text-slate-400 hover:text-slate-200"}`}>
                  <n.icon className="w-4 h-4" />
                  {n.name}
                </Link>
              );
            })}
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
