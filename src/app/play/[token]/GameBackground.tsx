"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export function GameBackground() {
  const params = useParams();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;
  
  const [themeImageUrl, setThemeImageUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");

  useEffect(() => {
    async function fetchGameTheme() {
      if (!token) {
        setDebugInfo("No token found");
        return;
      }
      
      setDebugInfo(`Fetching for token: ${token}`);
      try {
        const res = await fetch(`/api/game/by-token/${token}`);
        if (res.ok) {
          const data = await res.json();
          setDebugInfo("Data received");
          
          let imageUrl = data.game?.themeImageUrl;
          
          if (!imageUrl && data.game?.themeImageAssetKey) {
            imageUrl = `/api/assets/${encodeURIComponent(data.game.themeImageAssetKey)}`;
            setDebugInfo(`Using asset key: ${data.game.themeImageAssetKey}`);
          }
          
          if (imageUrl) {
            setThemeImageUrl(imageUrl);
            setDebugInfo(`Image URL set: ${imageUrl}`);
          } else {
            setDebugInfo("No image URL found in DB");
          }
        } else {
          setDebugInfo(`API Error: ${res.status}`);
        }
      } catch (err) {
        setDebugInfo(`Fetch failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    fetchGameTheme();
  }, [token]);

  return (
    <div 
      className="absolute inset-0 z-0 pointer-events-none bg-slate-950"
      style={{
        // Using a VERY bright and obvious fallback gradient to distinguish from "black screen"
        backgroundImage: themeImageUrl 
          ? `linear-gradient(to bottom, rgba(11, 17, 32, 0.5), rgba(11, 17, 32, 0.85)), url("${themeImageUrl}")`
          : `linear-gradient(135deg, #1e293b 0%, #334155 50%, #020617 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: themeImageUrl && !isLoaded ? 0.3 : 1,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {/* Debug text overlay - only visible if you look closely or we can tell the user to look for it */}
      {/* <div className="absolute top-20 left-4 text-[10px] text-white/20 select-none">{debugInfo}</div> */}
      
      {themeImageUrl && (
        <img 
          src={themeImageUrl} 
          alt="" 
          className="hidden" 
          onLoad={() => {
            console.log("[GameBackground] SUCCESS: Image loaded", themeImageUrl);
            setIsLoaded(true);
          }}
          onError={() => {
            console.error("[GameBackground] ERROR: Image failed to load", themeImageUrl);
            setDebugInfo(`Image Load Failed: ${themeImageUrl}`);
          }}
        />
      )}
    </div>
  );
}
