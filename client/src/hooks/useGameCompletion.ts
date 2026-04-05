import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GameCompletionParams {
  gameSlug: string;
  won: boolean;
  score?: number;
  difficulty?: "easy" | "medium" | "hard";
  duration?: number;
}

export function useGameCompletion() {
  const recordCompletion = trpc.gameCenter.recordGameCompletion.useMutation({
    onSuccess: (data) => {
      if (data.won) {
        toast.success(`🎉 Victory! You earned ${data.tokensAwarded} tokens!`, {
          description: `Score: ${data.score}`,
          duration: 5000,
        });
      } else {
        toast.info(`Game Over! You earned ${data.tokensAwarded} tokens.`, {
          description: "Keep playing to improve your score!",
          duration: 4000,
        });
      }
    },
    onError: (error) => {
      // Silently fail - don't interrupt gameplay
      console.error("Failed to record game completion:", error);
    },
  });

  const completeGame = async (params: GameCompletionParams) => {
    try {
      await recordCompletion.mutateAsync(params);
    } catch {
      // Silently fail
    }
  };

  return {
    completeGame,
    isRecording: recordCompletion.isPending,
  };
}
