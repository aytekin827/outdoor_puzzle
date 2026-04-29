"use client";

import { ArrowDown, ArrowUp, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";

interface Slide {
  imageUrl: string;
  description: string;
}

interface EpilogueEditorProps {
  initialSlidesJson?: string | null;
}

export function EpilogueEditor({
  initialSlidesJson,
}: EpilogueEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (!initialSlidesJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(initialSlidesJson);
      return Array.isArray(parsed) ? parsed.map(s => typeof s === 'string' ? { imageUrl: s, description: "" } : s) : [];
    } catch {
      return [];
    }
  });
  const [uploadingSlide, setUploadingSlide] = useState(false);

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
        nextSlides.push({ imageUrl: uploadedUrl, description: "" });
      }
    }

    setSlides(nextSlides);
    setUploadingSlide(false);
    e.target.value = "";
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateSlideDescription = (index: number, description: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], description };
    setSlides(newSlides);
  };

  return (
    <div className="border-t border-slate-800 pt-6 pb-2 space-y-6">
      <input type="hidden" name="epilogueType" value="slide" />
      <input type="hidden" name="epilogueSlidesJson" value={JSON.stringify(slides)} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">에필로그(Epilogue) 설정</h2>
          <p className="text-xs text-slate-400 mt-1">게임 종료 후 노출할 마무리 콘텐츠를 설정합니다.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-200 font-bold">Ending Slides</p>
            <p className="text-xs text-slate-400 mt-1">업로드한 이미지와 설명이 종료 후 순서대로 노출됩니다.</p>
          </div>
          <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            {uploadingSlide ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {uploadingSlide ? "업로드 중..." : "Upload"}
            <input type="file" multiple accept="image/*" onChange={handleSlideUpload} className="hidden" disabled={uploadingSlide} />
          </label>
        </div>

        <div className="space-y-4 mt-4">
          {slides.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl text-sm text-slate-500">
              업로드된 에필로그 슬라이드가 없습니다.
            </div>
          ) : (
            slides.map((slide, index) => (
              <div key={`${slide.imageUrl}-${index}`} className="flex flex-col gap-3 bg-slate-950 border border-slate-800 p-4 rounded-lg group hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.imageUrl} alt={`Epilogue slide ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Image URL</span>
                    <div className="truncate font-mono text-[10px] text-slate-400">{slide.imageUrl}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">슬라이드 설명 (텍스트)</label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => updateSlideDescription(index, e.target.value)}
                    placeholder="이미지 클릭 시 나타날 설명을 입력하세요..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 min-h-[80px] transition-colors"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
