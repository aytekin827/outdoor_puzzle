"use client";

import { Database, LayoutDashboard, ListTodo, LogOut, Moon, QrCode, Sun, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("admin-theme", newTheme);
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navs = [
    { name: "대시보드", path: "/admin", icon: LayoutDashboard },
    { name: "게임", path: "/admin/games", icon: Database },
    { name: "미션", path: "/admin/missions", icon: ListTodo },
    { name: "토큰", path: "/admin/tokens", icon: QrCode },
    { name: "플레이어", path: "/admin/players", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200 transition-colors duration-300" data-admin-theme={theme}>
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 h-screen transition-colors duration-300">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-widest text-lg text-primary">ADMIN</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
            title="Toggle Light/Dark Mode"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navs.map(n => {
            const active = pathname === n.path || (n.path !== "/admin" && pathname.startsWith(n.path));
            return (
              <Link
                key={n.path}
                href={n.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
              >
                <n.icon className={`w-5 h-5 ${active ? "text-primary" : "text-slate-400"}`} />
                {n.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 transition-colors duration-300">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950 transition-colors duration-300">
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
