"use client";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Send,
  Star
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const ageOptions = ["10대", "20대", "30대", "40대", "50대", "60대+"];
const groupOptions = ["교회", "학교", "단체", "친구", "가족", "커플", "other"];
const groupOptionLabels: Record<string, string> = {
  church: "교회",
  school: "학교",
  group: "단체",
  friends: "친구",
  family: "가족",
  couple: "커플",
  other: "기타",
};
const genderOptions = ["남성", "여성", "기타", "응답 안 함"];

type Stage = "summary" | "epilogue" | "survey";

type ResultMissionStat = {
  missionId: string;
  title: string;
  attempts: number;
};

type ResultPayload = {
  nickname: string;
  timeSpentMs: number;
  missionStats: ResultMissionStat[];
  game: {
    epilogueType?: string | null;
    epilogueContent?: string | null;
    epilogueSlidesJson?: string | null;
  } | null;
  survey?: {
    ageRange?: string;
    groupType?: string;
    groupTypeOther?: string;
    gender?: string;
    satisfactionScore?: number;
    difficultyScore?: number;
    comment?: string;
  } | null;
};

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-slate-300">
        {label} {value}/5
      </label>
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const score = index + 1;
          const active = score <= value;

          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`transition-transform hover:scale-110 ${active ? "text-yellow-400" : "text-slate-600 hover:text-slate-300"}`}
              aria-label={`${label} ${score}점`}
            >
              <Star className={`w-8 h-8 ${active ? "fill-current" : ""}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CompletePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [stage, setStage] = useState<Stage>("summary");
  const [slideIndex, setSlideIndex] = useState(0);
  const [showEpilogueText, setShowEpilogueText] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    ageRange: "",
    groupType: "",
    groupTypeOther: "",
    gender: "",
    satisfactionScore: 5,
    difficultyScore: 3,
    comment: "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        const response = await fetch("/api/game/result");
        const data = await response.json();
        setResult(data);

        // Determine initial stage
        const parsedSlides = data.game?.epilogueSlidesJson ? JSON.parse(data.game.epilogueSlidesJson) : [];
        const epilogueExists = Boolean(
          data.game?.epilogueType === "slide" && parsedSlides.length > 0
        );

        if (epilogueExists) {
          setStage("epilogue");
        } else {
          setStage("survey");
        }

        if (data.survey) {
          setSubmitted(true);
          setForm({
            ageRange: data.survey.ageRange || "",
            groupType: data.survey.groupType || "",
            groupTypeOther: data.survey.groupTypeOther || "",
            gender: data.survey.gender || "",
            satisfactionScore: data.survey.satisfactionScore || 5,
            difficultyScore: data.survey.difficultyScore || 3,
            comment: data.survey.comment || "",
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, []);

  const epilogueSlides: { imageUrl: string; description: string }[] = useMemo(() => {
    if (!result?.game?.epilogueSlidesJson) return [];
    try {
      const parsed = JSON.parse(result.game.epilogueSlidesJson);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((s: any) => typeof s === 'string' ? { imageUrl: s, description: "" } : s);
    } catch {
      return [];
    }
  }, [result?.game?.epilogueSlidesJson]);

  const hasEpilogue = Boolean(result?.game?.epilogueType === "slide" && epilogueSlides.length > 0);

  const isValidSurvey = useMemo(
    () => Boolean(
      form.ageRange &&
      form.groupType &&
      form.gender &&
      form.satisfactionScore >= 1 &&
      form.difficultyScore >= 1 &&
      (form.groupType !== "other" || form.groupTypeOther.trim())
    ),
    [form]
  );

  const updateField = (field: string, value: any) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNextFromEpilogue = () => {
    if (!hasEpilogue) {
      setStage("survey");
      return;
    }
    const currentSlide = epilogueSlides[slideIndex];
    if (!showEpilogueText && currentSlide.description) {
      setShowEpilogueText(true);
      return;
    }
    if (slideIndex < epilogueSlides.length - 1) {
      setSlideIndex((current) => current + 1);
      setShowEpilogueText(false);
    } else {
      setStage("survey");
    }
  };

  const handleSurveySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidSurvey) return;
    setSaving(true);
    try {
      const response = await fetch("/api/game/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Save failed");
      router.push(`/play/${token}/missions`);
    } catch (error) {
      console.error(error);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentEpilogueSlide = epilogueSlides[slideIndex];

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-transparent">
      <header className="z-50 flex items-center justify-between h-16 px-6 border-b border-white/5 backdrop-blur-md bg-black/40">
        <button onClick={() => router.push(`/play/${token}/missions`)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
          <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white" />
        </button>
        <div className="glass-panel px-3 py-1.5 font-black text-[11px] tracking-[0.2em] text-slate-300 uppercase">
          {stage === "epilogue" ? "Epilogue" : "Survey"}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar animate-in fade-in duration-500 relative">
        <div className="p-6 h-full min-h-screen">
          {stage === "epilogue" && hasEpilogue ? (
            <div className="absolute inset-0 w-full h-full" onClick={handleNextFromEpilogue}>
              <img src={currentEpilogueSlide.imageUrl} className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700" alt="Epilogue" />
              <div className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${showEpilogueText ? "opacity-100" : "opacity-0"}`} />
              {showEpilogueText && currentEpilogueSlide.description && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="w-full max-w-lg bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <p className="text-white text-lg leading-relaxed text-center whitespace-pre-wrap">{currentEpilogueSlide.description}</p>
                    {slideIndex < epilogueSlides.length - 1 && (
                      <div className="mt-8 flex justify-center">
                        <button onClick={handleNextFromEpilogue} className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-black flex items-center gap-2">
                          다음 슬라이드
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {!showEpilogueText && (
                <div className="absolute bottom-12 left-0 right-0 text-center animate-bounce">
                  <span className="bg-black/60 text-white text-[10px] px-4 py-2 rounded-full border border-white/10 font-bold uppercase tracking-wider">탭하여 계속하기</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-lg mx-auto flex flex-col gap-6 py-4 pb-20">
              <div className="glass-panel p-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">게임 종료 설문</h1>
                <p className="text-sm text-slate-400">플레이해 주셔서 감사합니다! 더 나은 게임을 위해 소중한 의견을 부탁드립니다.</p>
              </div>
              <form ref={formRef} onSubmit={handleSurveySubmit} className="glass-panel p-6 flex flex-col gap-6">
                {/* 인구통계학 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">연령대</label>
                    <select
                      value={form.ageRange}
                      onChange={(e) => updateField("ageRange", e.target.value)}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-emerald-500/50 outline-none"
                    >
                      <option value="">선택해주세요</option>
                      {ageOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">성별</label>
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-emerald-500/50 outline-none"
                    >
                      <option value="">선택해주세요</option>
                      {genderOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">그룹 유형</label>
                  <select
                    value={form.groupType}
                    onChange={(e) => updateField("groupType", e.target.value)}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-emerald-500/50 outline-none"
                  >
                    <option value="">선택해주세요</option>
                    {groupOptions.map((opt) => <option key={opt} value={opt}>{groupOptionLabels[opt] || opt}</option>)}
                  </select>
                </div>

                {form.groupType === "other" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">기타 그룹 설명</label>
                    <input
                      value={form.groupTypeOther}
                      onChange={(e) => updateField("groupTypeOther", e.target.value)}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white focus:border-emerald-500/50 outline-none"
                      placeholder="직접 입력해주세요"
                    />
                  </div>
                )}

                <div className="h-px bg-white/5 my-2" />

                {/* 만족도 및 난이도 */}
                <div className="grid grid-cols-1 gap-6">
                  <StarRating
                    label="게임 만족도"
                    value={form.satisfactionScore}
                    onChange={(val) => updateField("satisfactionScore", val)}
                  />
                  <StarRating
                    label="게임 난이도"
                    value={form.difficultyScore}
                    onChange={(val) => updateField("difficultyScore", val)}
                  />
                </div>

                {/* 한 줄 후기 */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">후기</label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => updateField("comment", e.target.value)}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white focus:border-emerald-500/50 outline-none h-32 resize-none"
                    placeholder="플레이하시면서 좋았던 점이나 개선할 점을 자유롭게 남겨주세요."
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="z-50 p-4 pb-8 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
          <button
            type="button"
            onClick={stage === "epilogue" ? handleNextFromEpilogue : () => formRef.current?.requestSubmit()}
            disabled={stage === "survey" && (!isValidSurvey || saving)}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <span>{stage === "epilogue" ? "설문으로 이동" : "설문 완료"}</span>
                {stage === "epilogue" ? <ArrowRight className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            Secret Trail
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
