import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ModuleProgress {
  completed: boolean;
  score: number;
  tokensEarned: number;
}

interface UseSimulatorProgressOptions {
  simulatorId: string;
  moduleCount: number;
}

export function useSimulatorProgress({ simulatorId, moduleCount }: UseSimulatorProgressOptions) {
  const [moduleProgress, setModuleProgress] = useState<Record<number, ModuleProgress>>({});
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);

  // Fetch existing progress
  const { data: savedProgress, refetch: refetchProgress } = trpc.simulatorProgress.getProgress.useQuery(
    { simulatorId },
    { enabled: !!simulatorId }
  );

  // Fetch token balance
  const { data: tokenBalance, refetch: refetchTokens } = trpc.simulatorProgress.getTokenBalance.useQuery();

  // Fetch certificates
  const { data: certificates } = trpc.simulatorProgress.getCertificates.useQuery();

  // Save progress mutation
  const saveProgressMutation = trpc.simulatorProgress.saveModuleProgress.useMutation({
    onSuccess: (data) => {
      if (data.tokensAwarded > 0) {
        refetchTokens();
      }
      refetchProgress();
    },
  });

  // Issue certificate mutation
  const issueCertificateMutation = trpc.simulatorProgress.checkAndIssueCertificate.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Certificate issued! Check your certificates page.");
        setHasCertificate(true);
      }
    },
  });

  // Load saved progress into state
  useEffect(() => {
    if (savedProgress) {
      const progressMap: Record<number, ModuleProgress> = {};
      let totalTokens = 0;

      savedProgress.forEach((p) => {
        progressMap[p.moduleId] = {
          completed: p.isCompleted,
          score: p.questionsAnswered > 0 
            ? Math.round((p.correctAnswers / p.questionsAnswered) * 100) 
            : 0,
          tokensEarned: p.tokensEarned,
        };
        totalTokens += p.tokensEarned;
      });

      setModuleProgress(progressMap);
      setTotalTokensEarned(totalTokens);
      setIsLoading(false);
    } else if (savedProgress === undefined) {
      // Still loading
    } else {
      // No saved progress
      setIsLoading(false);
    }
  }, [savedProgress]);

  // Check if user already has certificate for this simulator
  useEffect(() => {
    if (certificates) {
      const cert = certificates.find((c) => c.simulatorId === simulatorId);
      setHasCertificate(!!cert);
    }
  }, [certificates, simulatorId]);

  // Save module completion
  const saveModuleCompletion = useCallback(
    async (moduleId: number, questionsAnswered: number, correctAnswers: number) => {
      const score = questionsAnswered > 0 
        ? Math.round((correctAnswers / questionsAnswered) * 100) 
        : 0;
      const isCompleted = score >= 70;

      // Update local state immediately for responsiveness
      setModuleProgress((prev) => ({
        ...prev,
        [moduleId]: {
          completed: isCompleted,
          score,
          tokensEarned: prev[moduleId]?.tokensEarned || 0,
        },
      }));

      // Save to database
      try {
        const result = await saveProgressMutation.mutateAsync({
          simulatorId,
          moduleId,
          questionsAnswered,
          correctAnswers,
          isCompleted,
        });

        if (result.tokensAwarded > 0) {
          setTotalTokensEarned((prev) => prev + result.tokensAwarded);
          setModuleProgress((prev) => ({
            ...prev,
            [moduleId]: {
              ...prev[moduleId],
              tokensEarned: (prev[moduleId]?.tokensEarned || 0) + result.tokensAwarded,
            },
          }));
        }

        return { success: true, tokensAwarded: result.tokensAwarded, score, isCompleted };
      } catch (error) {
        console.error("Failed to save progress:", error);
        toast.error("Failed to save progress. Your progress may not be saved.");
        return { success: false, tokensAwarded: 0, score, isCompleted };
      }
    },
    [simulatorId, saveProgressMutation]
  );

  // Check and issue certificate
  const checkForCertificate = useCallback(async () => {
    const completedCount = Object.values(moduleProgress).filter((m) => m.completed).length;
    
    if (completedCount >= moduleCount && !hasCertificate) {
      try {
        await issueCertificateMutation.mutateAsync({ simulatorId });
      } catch (error) {
        console.error("Failed to issue certificate:", error);
      }
    }
  }, [moduleProgress, moduleCount, hasCertificate, simulatorId, issueCertificateMutation]);

  // Get completion stats
  const completedModules = Object.values(moduleProgress).filter((m) => m.completed).length;
  const overallProgress = Math.round((completedModules / moduleCount) * 100);
  const allModulesCompleted = completedModules >= moduleCount;

  return {
    moduleProgress,
    totalTokensEarned,
    globalTokenBalance: tokenBalance?.totalTokens || 0,
    isLoading,
    hasCertificate,
    completedModules,
    overallProgress,
    allModulesCompleted,
    saveModuleCompletion,
    checkForCertificate,
    refetchProgress,
  };
}
