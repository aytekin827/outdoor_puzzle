"use client";

import { Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

interface GameThemeEditorProps {
  initialThemeImageUrl?: string | null;
  initialThemeImageAssetKey?: string | null;
}

function extractAssetKey(url: string) {
  const assetPrefix = "/api/assets/";
  if (!url.startsWith(assetPrefix)) {
    return "";
  }
  return decodeURIComponent(url.slice(assetPrefix.length));
}

export function GameThemeEditor({
  initialThemeImageUrl,
  initialThemeImageAssetKey,
}: GameThemeEditorProps) {
  const [themeImageUrl, setThemeImageUrl] = useState(initialThemeImageUrl || "");
  const [themeImageAssetKey, setThemeImageAssetKey] = useState(initialThemeImageAssetKey || extractAssetKey(initialThemeImageUrl || ""));
  const [uploading, setUploading] = useState(false);

  const hasImage = useMemo(() => themeImageUrl.trim().length > 0, [themeImageUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    setUploading(true);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.url || "";
      setThemeImageUrl(uploadedUrl);
      setThemeImageAssetKey(extractAssetKey(uploadedUrl));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const clearImage = () => {
    setThemeImageUrl("");
    setThemeImageAssetKey("");
  };

  const handleImageUrlChange = (value: string) => {
    setThemeImageUrl(value);
    setThemeImageAssetKey(extractAssetKey(value));
  };

  return (
    <div className="border-t border-slate-800 pt-6 space-y-5">
      <input type="hidden" name="themeImageUrl" value={themeImageUrl} />
      <input type="hidden" name="themeImageAssetKey" value={themeImageAssetKey} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">게임 배경 테마 이미지</h2>
          <p className="text-xs text-slate-400 mt-1">게임 플레이 화면의 배경으로 사용할 이미지를 설정합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
          {hasImage && (
            <button
              type="button"
              onClick={clearImage}
              className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[200px] flex items-center justify-center overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={themeImageUrl} alt="Theme background preview" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-center text-slate-500 text-sm">
              <div className="flex justify-center mb-3">
                <ImageIcon className="w-8 h-8" />
              </div>
              업로드된 테마 이미지가 없습니다. (기본 배경 사용)
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Theme Image URL</label>
            <input
              value={themeImageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors"
              placeholder="/api/assets/..."
            />
          </div>

          {themeImageAssetKey && (
            <div className="text-xs text-slate-500 break-all">Asset Key: {themeImageAssetKey}</div>
          )}
        </div>
      </div>
    </div>
  );
}
