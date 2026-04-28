"use client";

import { FileText, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";

interface EpilogueEditorProps {
  initialType?: string | null;
  initialContent?: string | null;
  initialSlidesJson?: string | null;
}

export function EpilogueEditor({
  initialType,
  initialContent,
  initialSlidesJson,
}: EpilogueEditorProps) {
  const [epilogueType, setEpilogueType] = useState(initialType || "text");
  const [epilogueContent, setEpilogueContent] = useState(initialContent || "");
  const [slides, setSlides] = useState<string[]>(() => {
    if (!initialSlidesJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(initialSlidesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [uploadingSlide, setUploadingSlide] = useState(false);

  const slideCountLabel = useMemo(() => {
    if (slides.length === 0) {
      return "No slides";
    }
    if (slides.length === 1) {
      return "1 slide";
    }
    return `${slides.length} slides`;
  }, [slides.length]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.url || null;
    } catch {
      alert("Upload failed");
      return null;
    }
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setUploadingSlide(true);
    const nextSlides = [...slides];

    for (const file of Array.from(e.target.files)) {
      const uploadedUrl = await uploadFile(file);
      if (uploadedUrl) {
        nextSlides.push(uploadedUrl);
      }
    }

    setSlides(nextSlides);
    setUploadingSlide(false);
    e.target.value = "";
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="border-t border-slate-800 pt-6 pb-2 space-y-6">
      <input type="hidden" name="epilogueType" value={epilogueType} />
      <input type="hidden" name="epilogueContent" value={epilogueType === "text" ? epilogueContent : ""} />
      <input type="hidden" name="epilogueSlidesJson" value={epilogueType === "slide" ? JSON.stringify(slides) : "[]"} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">에필로그(Epilogue) 설정</h2>
          <p className="text-xs text-slate-400 mt-1">게임 종료 후 노출할 마무리 콘텐츠를 설정합니다.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setEpilogueType("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${epilogueType === "text" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"
              }`}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            type="button"
            onClick={() => setEpilogueType("slide")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${epilogueType === "slide" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"
              }`}
          >
            <ImageIcon className="w-4 h-4" />
            Slides
          </button>
        </div>
      </div>

      {epilogueType === "text" ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
          <label className="text-sm font-semibold text-slate-300">Ending Text</label>
          <textarea
            value={epilogueContent}
            onChange={(e) => setEpilogueContent(e.target.value)}
            className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-white h-40 resize-none w-full focus:border-primary focus:outline-none transition-colors"
            placeholder="게임 종료 후 보여줄 마무리 문구나 안내를 입력하세요."
          />
          <p className="text-xs text-slate-500">MVP에서는 텍스트형 epilogue를 기본으로 사용합니다.</p>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-slate-200 font-bold">Ending Slides</p>
              <p className="text-xs text-slate-400 mt-1">업로드한 이미지가 종료 후 순서대로 노출됩니다.</p>
            </div>
            <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              {uploadingSlide ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploadingSlide ? "Uploading..." : "Add Slides"}
              <input type="file" multiple accept="image/*" onChange={handleSlideUpload} className="hidden" disabled={uploadingSlide} />
            </label>
          </div>

          <div className="text-xs text-slate-500">{slideCountLabel}</div>

          <div className="space-y-3">
            {slides.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl text-sm text-slate-500">
                업로드된 epilogue 슬라이드가 없습니다.
              </div>
            ) : (
              slides.map((slideUrl, index) => (
                <div key={`${slideUrl}-${index}`} className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="w-16 h-12 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slideUrl} alt={`Epilogue slide ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 truncate font-mono text-xs text-slate-400">{slideUrl}</div>
                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
