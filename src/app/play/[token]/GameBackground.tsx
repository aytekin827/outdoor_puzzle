"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function GameBackground() {
  const { token } = useParams();
  const [themeImageUrl, setThemeImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameTheme() {
      try {
        const res = await fetch(`/api/game/by-token/${token}`);
        if (res.ok) {
          const data = await res.json();
          if (data.game?.themeImageUrl) {
            setThemeImageUrl(data.game.themeImageUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch game theme:", err);
      }
    }

    if (token) {
      fetchGameTheme();
    }
  }, [token]);

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none bg-slate-950"
      style={{
        backgroundImage: themeImageUrl 
          ? `linear-gradient(to bottom, rgba(11, 17, 32, 0.7), rgba(11, 17, 32, 0.95)), url(${themeImageUrl})`
          : `radial-gradient(circle at 50% 0%, hsl(217, 91%, 30%) 0%, hsl(222, 47%, 11%) 50%, hsl(222, 47%, 11%) 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
