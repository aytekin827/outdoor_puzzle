"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  Key,
  Loader2,
  MapPin,
} from "lucide-react";

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
  } | null;
  totalMissions: number;
};

type LocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
};

type PermissionState = "idle" | "granted" | "denied" | "unsupported" | "error";

export default function MissionPage() {
  const { token } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showHint, setShowHint] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
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
        const res = await fetch("/api/game/current-mission");
        const data = await res.json();

        if (data.isCompleted) {
          router.push(`/play/${token}/complete`);
          return;
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
        setMessage({ type: "success", text: "정답입니다. 다음 미션으로 이동합니다." });
        setAnswer("");
        lastMissionLoggedRef.current = null;
        setTimeout(() => {
          setLoading(true);
          fetch("/api/game/current-mission")
            .then((response) => response.json())
            .then((newData) => {
              setMissionState(newData);
              setMessage({ type: "", text: "" });
              setLoading(false);
            });
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
    <div className="flex-1 flex flex-col relative overflow-y-auto w-full p-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mt-2 mb-6">
        <div className="glass-panel px-4 py-2 font-bold text-slate-200">
          STAGE {mission.orderIndex} <span className="text-slate-500 font-normal">/ {missionState?.totalMissions}</span>
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-6 -mt-6 blur-xl" />
          <h2 className="flex items-center gap-2 text-blue-400 font-bold mb-2">
            <MapPin className="w-5 h-5 flex-shrink-0" />
            체크포인트
          </h2>
          <p className="text-slate-200 text-lg font-medium leading-relaxed">{mission.checkpointInstruction}</p>
          <p className="text-xs text-slate-500 mt-3">
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
          </p>
        </div>

        <div className="glass-panel p-6 border border-white/10 flex flex-col shadow-2xl">
          <h2 className="text-sm font-bold text-primary mb-1 uppercase tracking-widest">{mission.title}</h2>
          <p className="text-white text-xl font-bold leading-relaxed mb-6">{mission.riddleQuestion}</p>

          {mission.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mission.imageUrl}
                alt={mission.imageAlt || mission.title || "Mission image"}
                className="w-full max-h-72 object-cover"
              />
              {mission.imageCaption && (
                <div className="px-4 py-3 text-sm text-slate-300 border-t border-white/10 flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 mt-0.5 text-slate-500" />
                  <span>{mission.imageCaption}</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="정답을 입력하세요"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner text-lg font-bold"
              />
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg flex items-start gap-2 text-sm font-medium animate-in slide-in-from-top-2 ${
                  message.type === "error"
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
              disabled={submitting || !answer.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold py-4 px-6 rounded-xl transition-all disabled:opacity-50 mt-2 shadow-lg hover:shadow-primary/20 flex items-center justify-center h-[56px]"
            >
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "정답 제출"}
            </button>
          </form>

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
    </div>
  );
}
