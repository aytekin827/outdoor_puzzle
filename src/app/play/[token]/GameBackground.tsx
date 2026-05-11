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

  if (!themeImageUrl) return null;

  return (
    <div 
      className="absolute inset-0 z-[-1] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 17, 32, 0.6), rgba(11, 17, 32, 0.9)), url(${themeImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
}
