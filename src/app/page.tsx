"use client";

import { ArrowRight, Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedToken = token.trim();
    if (!normalizedToken) {
      return;
    }

    router.push(`/play/${encodeURIComponent(normalizedToken)}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">
      <div className="glass-panel p-10 w-full max-w-sm flex flex-col items-center border border-primary/20 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
        <h2 className="text-primary font-bold tracking-[0.2em] text-xs mb-3 uppercase">Outdoor Escape</h2>
        <h1 className="text-4xl font-black text-white leading-tight mb-4 italic tracking-tighter">
          야외
          <br />
          방탈출
        </h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="text-left">
            <label htmlFor="token" className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <Keyboard className="w-4 h-4 text-primary" />
              게임 토큰 입력
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="예: camp-2026-a01"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={!token.trim()}
            className="group relative flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <span>토큰으로 시작하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="w-12 h-1 bg-primary mt-8 rounded-full" />
      </div>

      <div className="mt-12 text-slate-600 text-[10px] tracking-widest uppercase font-bold">
        © 2026 Minjae-dev. All rights reserved.
      </div>
    </div>
  );
}
