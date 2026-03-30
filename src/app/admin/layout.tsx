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
  Menu,
  Moon,
  QrCode,
  Sun,
  X,
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
    label: "운영",
    items: [
      { name: "게임", path: "/admin/games", icon: Database },
      { name: "미션", path: "/admin/missions", icon: ListTodo },
      { name: "토큰", path: "/admin/tokens", icon: QrCode },
    ],
  },
  {
    label: "결과",
    items: [
      { name: "플레이 세션", path: "/admin/results/play-sessions", icon: Gamepad2 },
      { name: "설문", path: "/admin/results/surveys", icon: ClipboardList },
      { name: "인증샷", path: "/admin/results/photos", icon: Camera },
    ],
  },
  {
    label: "분석",
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
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("admin-theme", nextTheme);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const sidebarContent = (
    <>
      <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <span className="font-bold tracking-widest text-lg text-primary">ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
            title="테마 변경"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMenuOpen(false)}
            className="lg:hidden p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700 hover:border-slate-500"
            title="메뉴 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="px-4 text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));

                return (
                  <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                      active ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          로그아웃
        </button>
      </div>
    </>
  );

  return (
    <div
      className="flex min-h-screen bg-slate-950 font-sans text-slate-200 transition-colors duration-300"
      data-admin-theme={theme}
    >
      <aside className="hidden lg:flex w-72 bg-slate-900 border-r border-slate-800 flex-col sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {menuOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="메뉴 닫기"
          />
          <aside className="relative z-10 w-[86vw] max-w-sm bg-slate-900 border-r border-slate-800 flex flex-col h-full">
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0 text-right">
            <p className="text-xs tracking-[0.2em] text-slate-500 uppercase">Admin</p>
            <p className="text-sm font-semibold text-white truncate">운영 관리자</p>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
