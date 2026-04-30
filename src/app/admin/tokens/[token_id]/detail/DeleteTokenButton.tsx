"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";

interface DeleteTokenButtonProps {
  tokenId: string;
  onDelete: () => Promise<void>;
}

export function DeleteTokenButton({ tokenId, onDelete }: DeleteTokenButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    const confirmed = window.confirm(
      "정말로 이 토큰을 삭제하시겠습니까?\n\n이 토큰과 연결된 모든 플레이어 기록, 세션 데이터, 설문 답변, 로그 데이터가 영구적으로 삭제되며 복구할 수 없습니다."
    );

    if (confirmed) {
      startTransition(async () => {
        try {
          await onDelete();
        } catch (err) {
          // Check if it's a redirect error (which is actually a success in this context)
          // Next.js throws an error when redirecting from a Server Action
          if (err instanceof Error && (err.message.includes('NEXT_REDIRECT') || err.constructor.name === 'RedirectError')) {
            return;
          }
          console.error(err);
          alert("삭제 중 오류가 발생했습니다.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Trash2 className={`w-4 h-4 ${isPending ? 'animate-pulse' : ''}`} />
      {isPending ? "삭제 중..." : "토큰 및 모든 기록 삭제"}
    </button>
  );
}
