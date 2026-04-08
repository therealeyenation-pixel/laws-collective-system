import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

type SimulatorType = "business" | "grants" | "proposals" | "contracts" | "real_eye_nation" | "other";

interface UseSimulatorCompletionOptions {
  simulatorType: SimulatorType;
  /** Human-readable name for toast messages */
  displayName: string;
  /** Called after successful recording */
  onSuccess?: (data: { success: boolean; message: string }) => void;
}

/**
 * Hook that records simulator/workshop completion to the activation system.
 * Call `recordCompletion(score)` when a user finishes a workshop.
 * 
 * This automatically:
 * - Records the completion in the database
 * - Updates the activation progress dashboard
 * - Shows a toast notification
 * - Prevents duplicate recordings
 */
export function useSimulatorCompletion({ simulatorType, displayName, onSuccess }: UseSimulatorCompletionOptions) {
  const hasRecorded = useRef(false);
  const utils = trpc.useUtils();

  const recordMutation = trpc.systemActivation.recordCompletion.useMutation({
    onSuccess: (data) => {
      if (data.alreadyCompleted) {
        // Already recorded, no need to notify again
        return;
      }
      toast.success(`${displayName} workshop recorded!`, {
        description: data.message,
      });
      // Invalidate activation progress so dashboard updates
      utils.systemActivation.getProgress.invalidate();
      onSuccess?.(data);
    },
    onError: (error) => {
      console.error(`[SimulatorCompletion] Failed to record ${simulatorType}:`, error);
      // Don't show error toast - this is a background operation
      // The simulator still works even if recording fails
    },
  });

  const recordCompletion = useCallback(
    (score?: number) => {
      // Prevent duplicate calls in the same session
      if (hasRecorded.current) return;
      hasRecorded.current = true;

      recordMutation.mutate({
        simulatorType,
        score: score ?? undefined,
      });
    },
    [simulatorType, recordMutation]
  );

  return {
    recordCompletion,
    isRecording: recordMutation.isPending,
    isRecorded: hasRecorded.current || recordMutation.isSuccess,
  };
}
