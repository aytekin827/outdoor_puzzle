"use client";

import { ArrowDown, ArrowUp, Image as ImageIcon, Loader2, Trash2, UploadCloud, MessageSquare } from "lucide-react";
import { useState } from "react";

interface Slide {
  imageUrl: string;
  description: string;
}

interface ClosingInstructionEditorProps {
  initialType?: string;
  initialSlidesJson?: string;
  initialContent?: string;
}

export function ClosingInstructionEditor({ initialType, initialSlidesJson, initialContent }: ClosingInstructionEditorProps) {
  const [closingInstructionType, setClosingInstructionType] = useState<string>(initialType || "text");
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (initialSlidesJson) {
      try {
        const parsed = JSON.parse(initialSlidesJson);
        if (Array.isArray(parsed)) {
          return parsed.map(s => typeof s === 'string' ? { imageUrl: s, description: "" } : s);
        }
      } catch (_) { }
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
    e.target.value = "";
  };

  const updateSlideDescription = (index: number, description: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], description };
    setSlides(newSlides);
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

  return (
    <div className="border-t border-slate-800 pt-6 pb-2 space-y-6 sm:col-span-2">
      <input type="hidden" name="closingInstructionType" value={closingInstructionType} />
      <input type="hidden" name="closingInstructionSlidesJson" value={JSON.stringify(slides)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">정답 제출 후 안내 (새로운 지령) 설정</h2>
          <p className="text-xs text-slate-400 mt-1">미션 완료 후 전용 페이지로 랜더링되어 표시됩니다.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setClosingInstructionType("text")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${closingInstructionType === "text" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> 텍스트 전용
          </button>
          <button
            type="button"
            onClick={() => setClosingInstructionType("slide")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${closingInstructionType === "slide" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> 이미지 + 텍스트 설명
          </button>
        </div>
      </div>

      {closingInstructionType === "slide" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-200 font-bold mb-1 text-sm">이미지/슬라이드 관리</p>
              <p className="text-[10px] text-slate-400">배경 이미지와 그 위에 표시될 텍스트를 설정합니다.</p>
            </div>
            <div>
              <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2">
                {uploadingSlide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                {uploadingSlide ? "업로드 중..." : "Upload"}
                <input type="file" multiple accept="image/*" onChange={handleSlideUpload} className="hidden" disabled={uploadingSlide} />
              </label>
            </div>
          </div>

          <div className="space-y-4 mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {slides.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-xs">업로드된 이미지가 없습니다.</p>
              </div>
            ) : (
              slides.map((slide, i) => (
                <div key={i} className="flex flex-col gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl group hover:border-slate-600 transition-colors shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 shadow-inner">
                      <img src={slide.imageUrl} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Slide #{i + 1}</span>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-md transition-colors">
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-md transition-colors">
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeSlide(i)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors ml-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={slide.description}
                        onChange={(e) => updateSlideDescription(i, e.target.value)}
                        placeholder="이 슬라이드에 표시될 텍스트 설명을 입력하세요..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none transition-all resize-none h-16"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">지령 텍스트 내용 (기본)</label>
        <textarea
          name="closingInstruction"
          defaultValue={initialContent || ""}
          className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none focus:border-primary focus:outline-none transition-colors text-sm shadow-inner"
          placeholder="텍스트 전용 모드이거나 슬라이드가 없을 때 표시될 텍스트 지령을 입력하세요."
        />
      </div>
    </div>
  );
}
