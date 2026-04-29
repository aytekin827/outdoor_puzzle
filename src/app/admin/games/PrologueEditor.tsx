"use client";

import { ArrowDown, ArrowUp, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";

interface Slide {
  imageUrl: string;
  description: string;
}

interface PrologueEditorProps {
  initialSlidesJson?: string;
}

export function PrologueEditor({ initialSlidesJson }: PrologueEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (initialSlidesJson) {
      try {
        const parsed = JSON.parse(initialSlidesJson);
        return Array.isArray(parsed) ? parsed.map(s => typeof s === 'string' ? { imageUrl: s, description: "" } : s) : [];
      } catch (_) { return []; }
    }
    return [];
  });

  const [uploadingSlide, setUploadingSlide] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      return data.url || null;
    } catch {
      alert("Upload failed");
      return null;
    }
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingSlide(true);

    const newSlides = [...slides];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const url = await uploadFile(file);
      if (url) newSlides.push({ imageUrl: url, description: "" });
    }
    setSlides(newSlides);
    setUploadingSlide(false);
    e.target.value = ""; // reset
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + direction];
    newSlides[index + direction] = temp;
    setSlides(newSlides);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlideDescription = (index: number, description: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], description };
    setSlides(newSlides);
  };

  return (
    <div className="border-t border-slate-800 pt-6 pb-2 space-y-6">
      {/* Hidden inputs to pass state to server action */}
      <input type="hidden" name="prologueType" value="slide" />
      <input type="hidden" name="prologueSlidesJson" value={JSON.stringify(slides)} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">프롤로그(Prologue) 설정</h2>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-200 font-bold mb-1">슬라이드 관리</p>
            <p className="text-xs text-slate-400">여러 장의 이미지를 업로드하고 각 슬라이드에 대한 설명을 입력할 수 있습니다.</p>
          </div>
          <div>
            <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              {uploadingSlide ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploadingSlide ? "업로드 중..." : "이미지 추가"}
              <input type="file" multiple accept="image/*" onChange={handleSlideUpload} className="hidden" disabled={uploadingSlide} />
            </label>
          </div>
        </div>

        <div className="space-y-4 mt-4 pr-2">
          {slides.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-slate-500 text-sm">업로드된 슬라이드가 없습니다.</p>
            </div>
          ) : (
            slides.map((slide, i) => (
              <div key={i} className="flex flex-col gap-3 bg-slate-950 border border-slate-800 p-4 rounded-lg group hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.imageUrl} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-slate-500">IMAGE URL</span>
                    <div className="truncate font-mono text-[10px] text-slate-400">{slide.imageUrl}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-slate-800 mx-1"></div>
                    <button type="button" onClick={() => removeSlide(i)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">슬라이드 설명 (텍스트)</label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => updateSlideDescription(i, e.target.value)}
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
