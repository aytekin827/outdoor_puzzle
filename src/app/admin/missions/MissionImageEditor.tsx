"use client";

import { Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

interface MissionImageEditorProps {
  initialImageUrl?: string | null;
  initialImageAssetKey?: string | null;
  initialImageAlt?: string | null;
  initialImageCaption?: string | null;
}

function extractAssetKey(url: string) {
  const assetPrefix = "/api/assets/";
  if (!url.startsWith(assetPrefix)) {
    return "";
  }
  return decodeURIComponent(url.slice(assetPrefix.length));
}

export function MissionImageEditor({
  initialImageUrl,
  initialImageAssetKey,
  initialImageAlt,
  initialImageCaption,
}: MissionImageEditorProps) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");
  const [imageAssetKey, setImageAssetKey] = useState(initialImageAssetKey || extractAssetKey(initialImageUrl || ""));
  const [imageAlt, setImageAlt] = useState(initialImageAlt || "");
  const [imageCaption, setImageCaption] = useState(initialImageCaption || "");
  const [uploading, setUploading] = useState(false);

  const hasImage = useMemo(() => imageUrl.trim().length > 0, [imageUrl]);

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
      setImageUrl(uploadedUrl);
      setImageAssetKey(extractAssetKey(uploadedUrl));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setImageAssetKey("");
    setImageAlt("");
    setImageCaption("");
  };

  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    setImageAssetKey(extractAssetKey(value));
  };

  return (
    <div className="sm:col-span-2 border-t border-slate-800 pt-6 space-y-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imageAssetKey" value={imageAssetKey} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">미션 카드 이미지</h2>
          <p className="text-xs text-slate-400 mt-1">미션 리스트 카드 및 문제 화면에 노출할 이미지를 설정합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Image"}
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
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[240px] flex items-center justify-center overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={imageAlt || "Mission image preview"} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <div className="text-center text-slate-500 text-sm">
              <div className="flex justify-center mb-3">
                <ImageIcon className="w-8 h-8" />
              </div>
              업로드된 미션 이미지가 없습니다.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors"
              placeholder="/api/assets/..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Alt Text</label>
            <input
              name="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-primary focus:outline-none transition-colors"
              placeholder="플레이어에게 보일 이미지 설명"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-400">Caption</label>
            <textarea
              name="imageCaption"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none focus:border-primary focus:outline-none transition-colors"
              placeholder="문제 화면에 함께 표시할 보조 문구"
            />
          </div>

          {imageAssetKey && (
            <div className="text-xs text-slate-500 break-all">Asset Key: {imageAssetKey}</div>
          )}
        </div>
      </div>
    </div>
  );
}
