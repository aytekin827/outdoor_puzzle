"use client";

import {
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  Clock,
  Loader2,
  Send,
  Star,
  Target,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  completionPhoto?: {
    assetUrl?: string;
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
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [stage, setStage] = useState<Stage>("summary");
  const [slideIndex, setSlideIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [form, setForm] = useState({
    ageRange: "",
    groupType: "",
    groupTypeOther: "",
    gender: "",
    satisfactionScore: 5,
    difficultyScore: 3,
    comment: "",
  });

  useEffect(() => {
    async function loadResult() {
      try {
        const response = await fetch("/api/game/result");
        const data = await response.json();
        setResult(data);

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

        if (data.completionPhoto?.assetUrl) {
          setPhotoUploaded(true);
          setPhotoUrl(data.completionPhoto.assetUrl);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, []);

  const epilogueSlides = useMemo(() => {
    if (!result?.game?.epilogueSlidesJson) {
      return [];
    }

    try {
      const parsed = JSON.parse(result.game.epilogueSlidesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [result?.game?.epilogueSlidesJson]);

  const hasEpilogue = Boolean(
    result?.game?.epilogueType &&
    ((result.game.epilogueType === "text" && result.game.epilogueContent) ||
      (result.game.epilogueType === "slide" && epilogueSlides.length > 0)),
  );

  const isValidSurvey = useMemo(
    () =>
      Boolean(
        form.ageRange &&
        form.groupType &&
        form.gender &&
        form.satisfactionScore >= 1 &&
        form.difficultyScore >= 1 &&
        (form.groupType !== "other" || form.groupTypeOther.trim()),
      ),
    [form],
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const timeSpentMs = result?.timeSpentMs || 0;
  const minutes = Math.floor(timeSpentMs / 60000);
  const seconds = Math.floor((timeSpentMs % 60000) / 1000);
  const totalAttempts =
    result?.missionStats?.reduce((total, mission) => total + mission.attempts, 0) || 0;

  const updateField = (field: string, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleNextFromSummary = () => {
    if (hasEpilogue) {
      setStage("epilogue");
      return;
    }
    setStage("survey");
  };

  const handleNextFromEpilogue = () => {
    if (result?.game?.epilogueType === "slide" && slideIndex < epilogueSlides.length - 1) {
      setSlideIndex((current) => current + 1);
      return;
    }
    setStage("survey");
  };

  const handleSurveySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidSurvey) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/game/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Survey save failed");
      }

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("설문 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    setUploading(true);

    try {
      const response = await fetch("/api/game/result", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPhotoUploaded(true);
      setPhotoUrl(data.photo.assetUrl);
    } catch (error) {
      console.error(error);
      alert("인증샷 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center p-6 relative animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay pointer-events-none" />

      {stage === "summary" ? (
        <div className="glass-panel p-8 flex flex-col items-center w-full max-w-md md:max-w-xl mx-auto relative overflow-hidden z-10 border border-yellow-500/20 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-yellow-500/30">
            <Award className="w-12 h-12 text-yellow-500" />
          </div>

          <h2 className="text-primary font-bold tracking-widest text-sm mb-2 uppercase">MISSION COMPLETED</h2>
          <h1 className="text-3xl font-extrabold text-white mb-2 text-center leading-tight">게임 완료</h1>
          <p className="text-slate-300 text-center mb-8">
            <span className="font-bold text-white">{result?.nickname}</span> 님의 플레이 기록이 저장되었습니다.
          </p>

          <div className="w-full grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/30 p-4 rounded-xl flex flex-col items-center border border-white/5">
              <Clock className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-xs text-slate-400 mb-1">총 소요 시간</span>
              <span className="text-xl font-bold text-white">
                {minutes}분 {seconds}초
              </span>
            </div>
            <div className="bg-black/30 p-4 rounded-xl flex flex-col items-center border border-white/5">
              <Target className="w-6 h-6 text-rose-400 mb-2" />
              <span className="text-xs text-slate-400 mb-1">총 시도 횟수</span>
              <span className="text-xl font-bold text-white">{totalAttempts}회</span>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 ml-1">미션별 시도 기록</h3>
            <div className="space-y-2">
              {result?.missionStats?.map((mission, index) => (
                <div
                  key={mission.missionId || index}
                  className="flex items-center justify-between text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800"
                >
                  <span className="text-slate-200 truncate pr-2 flex-1">
                    <span className="text-slate-500 mr-2">{index + 1}.</span>
                    {mission.title}
                  </span>
                  <span className="font-medium text-slate-400 flex-shrink-0">{mission.attempts}회 시도</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextFromSummary}
            className="mt-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            다음으로 이동
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : null}

      {stage === "epilogue" && hasEpilogue ? (
        <>
          {result?.game?.epilogueType === "slide" ? (
            <div
              className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
              onClick={handleNextFromEpilogue}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={slideIndex}
                src={epilogueSlides[slideIndex]}
                alt={`Epilogue slide ${slideIndex + 1}`}
                className="w-full min-h-[70dvh] object-cover animate-in fade-in duration-500"
              />
              <div className="absolute inset-x-0 bottom-8 text-center pointer-events-none">
                <span className="bg-black/60 text-white/90 text-sm px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-md">
                  화면을 눌러 계속하기
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 w-full max-w-md md:max-w-xl mx-auto">
              <h1 className="text-3xl font-extrabold text-white mb-4">Epilogue</h1>
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{result?.game?.epilogueContent}</p>
              <button
                type="button"
                onClick={handleNextFromEpilogue}
                className="mt-8 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                설문으로 이동
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : null}

      {stage === "survey" ? (
        <div className="w-full max-w-md md:max-w-xl mx-auto flex flex-col gap-6 py-4">
          {submitted ? (
            <div className="glass-panel p-10 flex flex-col items-center text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">설문 제출 완료</h1>
              <p className="text-slate-300 mb-8 leading-relaxed">
                설문에 참여해주셔서 감사합니다.<br />
                제공해주신 의견은 더 나은 게임 환경을 만드는 데<br />
                소중한 자료로 활용하겠습니다.
              </p>

              <button
                type="button"
                onClick={() => router.push(`/`)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all border border-slate-700"
              >
                처음 화면으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              <div className="glass-panel p-6">
                <h1 className="text-2xl font-bold text-white mb-2">게임 종료 설문</h1>
                <p className="text-sm text-slate-400">마지막으로 간단한 만족도 조사를 부탁드립니다.</p>
              </div>

              <div className="glass-panel p-6 flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">인증샷 업로드</h2>
                  <p className="text-sm text-slate-400 mt-1">오늘의 추억을 사진으로 남겨주세요 (선택).</p>
                </div>

                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Completion photo" className="w-full rounded-xl border border-white/10 object-cover max-h-72" />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-700 min-h-40 flex items-center justify-center text-slate-500 text-sm">
                    아직 업로드된 인증샷이 없습니다.
                  </div>
                )}

                <label className="w-full bg-white/10 text-white hover:bg-white/20 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  {uploading ? "업로드 중..." : photoUploaded ? "다른 사진으로 변경" : "인증샷 업로드"}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
                </label>

                {photoUploaded ? (
                  <div className="text-sm text-emerald-300 flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                    인증샷 전송 완료
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleSurveySubmit} className="glass-panel p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">연령대</label>
                  <select
                    value={form.ageRange}
                    onChange={(event) => updateField("ageRange", event.target.value)}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white"
                  >
                    <option value="">선택해주세요</option>
                    {ageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">그룹 유형</label>
                  <select
                    value={form.groupType}
                    onChange={(event) => updateField("groupType", event.target.value)}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white"
                  >
                    <option value="">선택해주세요</option>
                    {groupOptions.map((option) => (
                      <option key={option} value={option}>
                        {groupOptionLabels[option] || option}
                      </option>
                    ))}
                  </select>
                </div>

                {form.groupType === "other" ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-300">기타 그룹 설명</label>
                    <input
                      value={form.groupTypeOther}
                      onChange={(event) => updateField("groupTypeOther", event.target.value)}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white"
                      placeholder="직접 입력해주세요"
                    />
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">성별</label>
                  <select
                    value={form.gender}
                    onChange={(event) => updateField("gender", event.target.value)}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white"
                  >
                    <option value="">선택해주세요</option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <StarRating
                  label="만족도"
                  value={form.satisfactionScore}
                  onChange={(nextValue) => updateField("satisfactionScore", nextValue)}
                />

                <StarRating
                  label="난이도"
                  value={form.difficultyScore}
                  onChange={(nextValue) => updateField("difficultyScore", nextValue)}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-300">후기</label>
                  <textarea
                    value={form.comment}
                    onChange={(event) => updateField("comment", event.target.value)}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-white h-28 resize-none"
                    placeholder="느낀 점이나 개선 의견을 남겨주세요"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!isValidSurvey || saving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        설문 완료 및 게임 종료
                      </>
                    )}
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => router.push(`/`)}
                className="text-sm text-slate-500 hover:text-white transition-colors py-4 text-center"
              >
                처음 화면으로 돌아가기
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
