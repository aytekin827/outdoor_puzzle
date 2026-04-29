"use client";

import {
  AlertCircle,
  ArrowLeft,
  HelpCircle,
  Image as ImageIcon,
  Key,
  Loader2,
  MapPin,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type MissionState = {
  currentMission: {
    id: string;
    orderIndex: number;
    title: string;
    checkpointInstruction: string;
    riddleQuestion: string;
    hint?: string | null;
    imageUrl?: string | null;
    imageAlt?: string | null;
    imageCaption?: string | null;
    missionType?: string | null;
    missionVideoUrl?: string | null;
    missionSlidesJson?: string | null;
    closingInstruction?: string | null;
    closingInstructionType?: string | null;
    closingInstructionVideoUrl?: string | null;
    closingInstructionSlidesJson?: string | null;
    answer?: string | null;
  } | null;
  totalMissions: number;
  isSolved?: boolean;
};

type LocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
};

type PermissionState = "idle" | "granted" | "denied" | "unsupported" | "error";

function MissionSlides({ slides }: { slides: string[] }) {
  const [index, setIndex] = useState(0);
  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative group">
      <div className="aspect-[4/3] w-full bg-black/40 flex items-center justify-center overflow-hidden">
        <img
          src={slides[index]}
          alt={`Slide ${index + 1}`}
          className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500"
        />
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "bg-primary w-6" : "bg-white/30 w-1.5"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MissionPage() {
  const { token } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMissionId = searchParams.get("missionId");

  const [loading, setLoading] = useState(true);
  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showHint, setShowHint] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [showClosing, setShowClosing] = useState(false);
  const lastMissionLoggedRef = useRef<string | null>(null);

  const fetchCurrentLocation = async (): Promise<LocationSnapshot | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermissionState("unsupported");
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionState("granted");
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyM: position.coords.accuracy,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionState("denied");
          } else {
            setPermissionState("error");
          }
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 120000,
        },
      );
    });
  };

  const sendLocationEvent = useCallback(async (
    eventType: string,
    missionId: string,
    location?: LocationSnapshot | null,
    permissionOverride?: PermissionState,
  ) => {
    try {
      await fetch("/api/game/current-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          missionId,
          permissionState: permissionOverride ?? permissionState,
          location,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }, [permissionState]);

  useEffect(() => {
    async function fetchMission() {
      try {
        const url = requestedMissionId 
          ? `/api/game/current-mission?missionId=${requestedMissionId}`
          : "/api/game/current-mission";
        const res = await fetch(url);
        const data = await res.json();

        if (data.isCompleted) {
          router.push(`/play/${token}/complete`);
          return;
        }

        if (data.isSolved && data.currentMission?.answer) {
          setAnswer(data.currentMission.answer);
        }

        setMissionState(data);
      } catch (error) {
        console.error(error);
        setMessage({ type: "error", text: "미션 정보를 불러오지 못했습니다." });
      } finally {
        setLoading(false);
      }
    }

    fetchMission();
  }, [token, router]);

  useEffect(() => {
    async function logMissionEnter() {
      const missionId = missionState?.currentMission?.id;
      if (!missionId || lastMissionLoggedRef.current === missionId) {
        return;
      }

      const location = await fetchCurrentLocation();
      await sendLocationEvent("mission_enter", missionId, location, location ? "granted" : permissionState);
      lastMissionLoggedRef.current = missionId;
    }

    void logMissionEnter();
  }, [missionState?.currentMission?.id, permissionState, sendLocationEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !missionState?.currentMission) {
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });
    setShowHint(false);

    try {
      const location = await fetchCurrentLocation();
      const res = await fetch("/api/game/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId: missionState.currentMission.id,
          answer: answer.trim(),
          permissionState,
          location,
        }),
      });
      const data = await res.json();

      if (data.isFinished) {
        router.push(`/play/${token}/complete`);
      } else if (data.isCorrect) {
        setAnswer("");
        const mission = missionState.currentMission;

        // Always redirect to closing page as requested
        setTimeout(() => {
          router.push(`/play/${token}/mission/closing?missionId=${mission.id}`);
        }, 1200);
      } else {
        setMessage({ type: "error", text: "정답이 아닙니다. 다시 시도해보세요." });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "정답 제출에 실패했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextMission = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/current-mission");
      const data = await res.json();
      setMissionState(data);
      setMessage({ type: "", text: "" });
      setShowClosing(false);
      setShowHint(false);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "다음 미션을 불러오지 못했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const handleHintToggle = async () => {
    const nextShowHint = !showHint;
    setShowHint(nextShowHint);

    if (nextShowHint && missionState?.currentMission?.id) {
      const location = await fetchCurrentLocation();
      await sendLocationEvent("hint_used", missionState.currentMission.id, location, location ? "granted" : permissionState);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const mission = missionState?.currentMission;
  if (!mission) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full bg-transparent">
      {/* Fixed Header */}
      <header className="z-50 flex items-center justify-between h-16 px-6 border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/play/${token}/missions`)}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white/90">{mission.title}</span>
          </div>
        </div>

        <div className={`glass-panel px-3 py-1.5 font-black text-[11px] tracking-tighter border-white/5 ${missionState?.isSolved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-slate-300'}`}>
          {missionState?.isSolved ? 'CLEARED' : `STAGE ${mission.orderIndex}`} <span className="text-slate-500 font-normal">/ {missionState?.totalMissions}</span>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto hide-scrollbar p-6 animate-in fade-in duration-500 pb-20">

        <div className="w-full max-w-lg md:max-w-xl mx-auto flex flex-col gap-6">
          <div className="glass-panel p-6 border-l-4 border-l-blue-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-6 -mt-6 blur-xl" />
            <h2 className="flex items-center gap-2 text-blue-400 font-bold mb-2">
              <MapPin className="w-5 h-5 flex-shrink-0" />
              체크포인트
            </h2>
            <p className="text-slate-200 text-lg font-medium leading-relaxed">{mission.checkpointInstruction}</p>
            {/* <p className="text-xs text-slate-500 mt-3">
            위치 기록:{" "}
            {permissionState === "granted"
              ? "허용됨"
              : permissionState === "denied"
                ? "거부됨"
                : permissionState === "unsupported"
                  ? "지원 안 됨"
                  : permissionState === "error"
                    ? "오류"
                    : "확인 중"}
          </p> */}
          </div>

          <div className="glass-panel p-6 border border-white/10 flex flex-col shadow-2xl">
            <h2 className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">{mission.title}</h2>
            <p className="text-white text-xl md:text-2xl font-bold leading-relaxed mb-6 whitespace-pre-wrap">{mission.riddleQuestion}</p>

            {/* Multimedia Content */}
            <div className="mb-6 rounded-2xl overflow-hidden bg-black/20">
              {mission.missionType === "video" && mission.missionVideoUrl && (
                <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                  {mission.missionVideoUrl.includes("youtube.com") || mission.missionVideoUrl.includes("youtu.be") ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube-nocookie.com/embed/${mission.missionVideoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]}?autoplay=0&rel=0&modestbranding=1`}
                      title="Mission Content Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={mission.missionVideoUrl} controls className="w-full h-full" playsInline />
                  )}
                </div>
              )}

              {mission.missionType === "slide" && mission.missionSlidesJson && (
                <MissionSlides slides={JSON.parse(mission.missionSlidesJson)} />
              )}

              {(mission.missionType === "text" || !mission.missionType) && mission.imageUrl && (
                <>
                  <img
                    src={mission.imageUrl}
                    alt={mission.imageAlt || mission.title || "Mission image"}
                    className="w-full max-h-72 md:max-h-[500px] object-cover"
                  />
                  {mission.imageCaption && (
                    <div className="px-4 py-3 text-sm text-slate-300 flex items-start gap-2">
                      <ImageIcon className="w-4 h-4 mt-0.5 text-slate-500" />
                      <span>{mission.imageCaption}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {mission.hint && (
              <div className="mt-8 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={handleHintToggle}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mx-auto"
                >
                  <HelpCircle className="w-4 h-4" />
                  {showHint ? "힌트 숨기기" : "힌트 보기"}
                </button>
                {showHint && (
                  <div className="mt-3 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/90 rounded-xl text-sm leading-relaxed animate-in fade-in">
                    <span className="font-bold text-yellow-500">Hint.</span> {mission.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Footer with Answer Form */}
      <footer className="z-50 p-4 pb-8 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
        <div className="max-w-lg md:max-w-xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={missionState.isSolved}
                placeholder={missionState.isSolved ? "정답이 공개되었습니다" : "정답을 입력하세요"}
                className={`w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900/80 border text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner text-lg font-bold backdrop-blur-sm ${missionState.isSolved ? 'border-emerald-500/50 text-emerald-400 cursor-not-allowed' : 'border-slate-700'}`}
              />
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg flex items-start gap-2 text-sm font-medium animate-in slide-in-from-top-2 ${message.type === "error"
                  ? "bg-destructive/20 text-destructive-foreground border border-destructive/50"
                  : "bg-green-500/20 text-green-400 border border-green-500/50"
                  }`}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !answer.trim() || missionState.isSolved}
              className={`w-full font-extrabold py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg flex items-center justify-center h-[56px] ${missionState.isSolved 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-primary/20'}`}
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (missionState.isSolved ? "미션 완료됨" : "정답 제출")}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
