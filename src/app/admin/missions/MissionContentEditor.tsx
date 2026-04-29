"use client";

import { ArrowDown, ArrowUp, Image as ImageIcon, Loader2, Trash2, UploadCloud, HelpCircle } from "lucide-react";
import { useState } from "react";

interface Slide {
  imageUrl: string;
  description: string;
}

interface MissionContentEditorProps {
  initialType?: string;
  initialVideoUrl?: string;
  initialSlidesJson?: string;
  initialQuestion?: string;
  initialPassage?: string;
}

export function MissionContentEditor({ 
  initialType, 
  initialVideoUrl, 
  initialSlidesJson, 
  initialQuestion,
  initialPassage 
}: MissionContentEditorProps) {
  const [missionType, setMissionType] = useState<string>(initialType || "text");
  const [slides, setSlides] = useState<Slide[]>(() => {
    if (initialSlidesJson) {
      try {
        const parsed = JSON.parse(initialSlidesJson);
        if (Array.isArray(parsed)) {
          return parsed.map(s => typeof s === 'string' ? { imageUrl: s, description: "" } : s);
        }
      } catch (_) {
        return [];
      }
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

  const updateSlideDescription = (index: number, desc: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], description: desc };
    setSlides(newSlides);
  };

  return (
    <div className="border-t border-slate-800 pt-6 pb-2 space-y-6 sm:col-span-2">
      {/* Hidden inputs to pass state to server action */}
      <input type="hidden" name="missionType" value={missionType} />
      <input type="hidden" name="missionSlidesJson" value={JSON.stringify(slides)} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-tighter">Mission 주요 미션 내용 설정</h2>
          <p className="text-xs text-slate-400 mt-1">문제(문제, 암호 등)를 제시할 때 사용할 매체를 선택하세요.</p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMissionType("text")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${missionType === "text" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
          >
            <HelpCircle className="w-3.5 h-3.5 opacity-30" /> 텍스트 전용
          </button>
          <button
            type="button"
            onClick={() => setMissionType("slide")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${missionType === "slide" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> 이미지/슬라이드
          </button>
        </div>
      </div>

      {missionType === "slide" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-end">
            <p className="text-slate-200 font-bold mb-1 text-sm">슬라이드 관리 (이미지 + 탭 시 나타날 설명)</p>
            <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2">
              {uploadingSlide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              {uploadingSlide ? "업로드 중..." : "Upload"}
              <input type="file" multiple accept="image/*" onChange={handleSlideUpload} className="hidden" disabled={uploadingSlide} />
            </label>
          </div>

          <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {slides.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-xs">업로드된 이미지가 없습니다.</p>
              </div>
            ) : (
              slides.map((slide, i) => (
                <div key={i} className="flex flex-col gap-3 bg-slate-950 border border-slate-800 p-4 rounded-xl group hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800">
                      <img src={slide.imageUrl} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-slate-500 truncate">{slide.imageUrl}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded-md transition-colors">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded-md transition-colors">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => removeSlide(i)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-md transition-colors ml-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    placeholder="이미지 탭 시 노출될 텍스트 설명 (비워두면 이미지만 표시)"
                    value={slide.description}
                    onChange={(e) => updateSlideDescription(i, e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 min-h-[60px] resize-none transition-all"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-400">지문 (Passage)</label>
          <textarea
            name="riddlePassage"
            defaultValue={initialPassage || ""}
            className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-32 resize-none focus:border-primary focus:outline-none transition-colors text-sm font-light"
            placeholder="지문을 입력하세요 (예: 옛날 옛적에...)"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-400">질문 (Question)</label>
          <textarea
            name="riddleQuestion"
            defaultValue={initialQuestion || ""}
            required
            className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none focus:border-primary focus:outline-none transition-colors text-sm font-bold"
            placeholder="질문을 입력하세요 (예: 주인공의 이름은 무엇인가요?)"
          />
        </div>
      </div>
    </div>
  );
}
