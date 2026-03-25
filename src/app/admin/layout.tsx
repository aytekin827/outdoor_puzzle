"use client";

import {
  BarChart3,
  Camera,
  ClipboardList,
  Database,
  Flag,
  Gamepad2,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MapPinned,
  Moon,
  QrCode,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "대시보드",
    items: [{ name: "대시보드", path: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "게임운영",
    items: [
      { name: "게임", path: "/admin/games", icon: Database },
      { name: "미션", path: "/admin/missions", icon: ListTodo },
      { name: "토큰", path: "/admin/tokens", icon: QrCode },
    ],
  },
  {
    label: "게임결과",
    items: [
      { name: "플레이 세션", path: "/admin/results/play-sessions", icon: Gamepad2 },
      { name: "설문", path: "/admin/results/surveys", icon: ClipboardList },
      { name: "인증샷", path: "/admin/results/photos", icon: Camera },
    ],
  },
  {
    label: "데이터분석",
    items: [
      { name: "게임 분석", path: "/admin/analytics/games", icon: BarChart3 },
      { name: "미션 분석", path: "/admin/analytics/missions", icon: Flag },
      { name: "설문 분석", path: "/admin/analytics/surveys", icon: ClipboardList },
      { name: "이동/행동 분석", path: "/admin/analytics/movement", icon: MapPinned },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "dark";
    }
    return localStorage.getItem("admin-theme") || "dark";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin-theme", nextTheme);
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div
      className="flex min-h-screen bg-slate-950 font-sans text-slate-200 transition-colors duration-300"
      data-admin-theme={theme}
    >
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col sticky top-0 h-screen transition-colors duration-300">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-widest text-lg text-primary">ADMIN</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
            title="테마 변경"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="px-4 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${active
                        ? "bg-primary/10 text-primary"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                      <item.icon className={`w-5 h-5 ${active ? "text-primary" : "text-slate-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 transition-colors duration-300">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950 transition-colors duration-300">
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
