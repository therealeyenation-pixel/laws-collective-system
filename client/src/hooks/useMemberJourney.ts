import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export type MemberStatus = "onboarding" | "academy_active" | "formation_in_progress" | "house_activated";

// Categories that are always accessible regardless of member status
const ALWAYS_ACTIVE_CATEGORIES = [
  "Autonomous Wealth System",
  "L.A.W.S. Academy",
  "My Account",
  "Communication",
  "Theater & IPTV",
  "Broadcast Radio",
  "My Library",
  "Streaming Hub",
  "Emergency & Response",
  "Mobile & Devices",
];

// Categories that require House activation
const REQUIRES_HOUSE_ACTIVATION = [
  "CALEA Freeman Family Trust",
  "Real-Eye-Nation",
  "The L.A.W.S. Collective",
  "Documents",
  "AI & Automation",
  "Analytics & Insights",
  "Compliance & Export",
  "Grants & Funding",
  "Platform Admin",
];

export function useMemberJourney() {
  const { data, isLoading } = trpc.memberJourney.getStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const journeyState = useMemo(() => {
    if (!data) {
      return {
        memberStatus: "onboarding" as MemberStatus,
        formationStep: 0,
        totalSteps: 7,
        progressPercent: 0,
        houseActivated: false,
        houseActivatedAt: null,
        isAdmin: false,
        formationSteps: [],
      };
    }
    return data;
  }, [data]);

  const isCategoryLocked = (categoryLabel: string): boolean => {
    // Admins/staff/owners always have full access
    if (journeyState.isAdmin) return false;
    
    // House activated = everything unlocked
    if (journeyState.houseActivated) return false;

    // Always-active categories are never locked
    if (ALWAYS_ACTIVE_CATEGORIES.includes(categoryLabel)) return false;

    // Everything else requires House activation
    return REQUIRES_HOUSE_ACTIVATION.includes(categoryLabel);
  };

  const getStatusLabel = (): string => {
    switch (journeyState.memberStatus) {
      case "onboarding": return "Getting Started";
      case "academy_active": return "Academy Active";
      case "formation_in_progress": return "Formation In Progress";
      case "house_activated": return "House Activated";
      default: return "Getting Started";
    }
  };

  const getStatusColor = (): string => {
    switch (journeyState.memberStatus) {
      case "onboarding": return "text-amber-500";
      case "academy_active": return "text-blue-500";
      case "formation_in_progress": return "text-orange-500";
      case "house_activated": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  return {
    ...journeyState,
    isLoading,
    isCategoryLocked,
    getStatusLabel,
    getStatusColor,
  };
}
