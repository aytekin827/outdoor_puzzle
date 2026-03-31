"use client";

import { ArrowDown, ArrowUp, FileVideo, Image as ImageIcon, Loader2, Trash2, UploadCloud, Youtube, MessageSquare } from "lucide-react";
import { useState } from "react";

interface ClosingInstructionEditorProps {
  initialType?: string;
  initialVideoUrl?: string;
  initialSlidesJson?: string;
  initialContent?: string;
}

export function ClosingInstructionEditor({ initialType, initialVideoUrl, initialSlidesJson, initialContent }: ClosingInstructionEditorProps) {
  const [closingInstructionType, setClosingInstructionType] = useState<string>(initialType || "text");
  const [slides, setSlides] = useState<string[]>(() => {
    if (initialSlidesJson) {
      try { return JSON.parse(initialSlidesJson); } catch (_) { return []; }
    }
    return [];
  });

  const isYoutube = initialVideoUrl?.includes("youtube.com") || initialVideoUrl?.includes("youtu.be");
  const [videoSource, setVideoSource] = useState<"r2" | "youtube">(isYoutube ? "youtube" : "r2");
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl || "");

  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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
      if (url) newSlides.push(url);
    }
    setSlides(newSlides);
    setUploadingSlide(false);
    e.target.value = ""; // reset
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingVideo(true);
    const url = await uploadFile(e.target.files[0]);
    if (url) setVideoUrl(url);
    setUploadingVideo(false);
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

  return (
    <div className="border-t border-slate-800 pt-6 pb-2 space-y-6 sm:col-span-2">
      {/* Hidden inputs to pass state to server action */}
      <input type="hidden" name="closingInstructionType" value={closingInstructionType} />
      <input type="hidden" name="closingInstructionVideoUrl" value={closingInstructionType === "video" ? videoUrl : ""} />
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
            <ImageIcon className="w-3.5 h-3.5" /> 이미지/슬라이드
          </button>
          <button
            type="button"
            onClick={() => setClosingInstructionType("video")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${closingInstructionType === "video" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}
          >
            <FileVideo className="w-3.5 h-3.5" /> 비디오
          </button>
        </div>
      </div>

      {closingInstructionType === "slide" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-200 font-bold mb-1 text-sm">이미지/슬라이드 관리</p>
              <p className="text-[10px] text-slate-400">여러 장의 이미지를 업로드하고 순서를 조정할 수 있습니다.</p>
            </div>
            <div>
              <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-2">
                {uploadingSlide ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                {uploadingSlide ? "업로드 중..." : "이미지 추가"}
                <input type="file" multiple accept="image/*" onChange={handleSlideUpload} className="hidden" disabled={uploadingSlide} />
              </label>
            </div>
          </div>

          <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
            {slides.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-xs">업로드된 이미지가 없습니다.</p>
              </div>
            ) : (
              slides.map((url, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-lg group hover:border-slate-600 transition-colors">
                  <div className="w-12 h-10 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-700">
                    <img src={url} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 truncate font-mono text-[10px] text-slate-400">{url}</div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => removeSlide(i)} className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {closingInstructionType === "video" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <p className="text-slate-200 font-bold mb-1 text-sm">비디오 소스</p>
          <div className="flex gap-4">
            <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${videoSource === "youtube" ? "bg-red-500/10 border-red-500/50 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"}`}>
              <input type="radio" value="youtube" checked={videoSource === "youtube"} onChange={() => setVideoSource("youtube")} className="hidden" />
              <Youtube className={`w-5 h-5 ${videoSource === "youtube" ? "text-red-500" : ""}`} />
              <p className="font-bold text-xs">YouTube</p>
            </label>
            <label className={`flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${videoSource === "r2" ? "bg-emerald-500/10 border-emerald-500/50 text-white" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600"}`}>
              <input type="radio" value="r2" checked={videoSource === "r2"} onChange={() => setVideoSource("r2")} className="hidden" />
              <UploadCloud className={`w-5 h-5 ${videoSource === "r2" ? "text-emerald-500" : ""}`} />
              <p className="font-bold text-xs">직접 업로드</p>
            </label>
          </div>

          <div className="mt-4">
            {videoSource === "youtube" ? (
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none transition-colors w-full"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            ) : (
              <div className="flex flex-col gap-3 p-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/50 items-center justify-center min-h-[100px]">
                {videoUrl && !videoUrl.includes("youtube") ? (
                  <div className="text-center w-full">
                    <FileVideo className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-[10px] font-mono text-emerald-400 truncate px-4">{videoUrl}</p>
                    <label className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded cursor-pointer transition-colors inline-block mt-2">
                      {uploadingVideo ? "업로드 중..." : "변경"}
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                    </label>
                  </div>
                ) : (
                  <label className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-2">
                    {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {uploadingVideo ? "업로드 중..." : "비디오 선택"}
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-400">지령 텍스트 내용</label>
        <textarea
          name="closingInstruction"
          defaultValue={initialContent || ""}
          className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-24 resize-none focus:border-primary focus:outline-none transition-colors text-sm"
          placeholder="미션 완료 시 표시될 텍스트 지령을 입력하세요."
        />
      </div>
    </div>
  );
}
