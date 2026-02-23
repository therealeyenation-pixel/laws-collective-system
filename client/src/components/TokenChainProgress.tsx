import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Circle, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Gift,
  Zap,
  Home,
  Award,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneStatus {
  id: string;
  name: string;
  status: "completed" | "active" | "locked";
  completedAt?: Date;
  requiredModules?: number;
  completedModules?: number;
}

interface MilestoneProgressProps {
  milestones?: MilestoneStatus[];
  className?: string;
}

const DEFAULT_MILESTONES: MilestoneStatus[] = [
  { id: "foundation", name: "FOUNDATION", status: "completed", requiredModules: 3, completedModules: 3 },
  { id: "growth", name: "GROWTH", status: "active", requiredModules: 3, completedModules: 1 },
  { id: "momentum", name: "MOMENTUM", status: "locked", requiredModules: 3, completedModules: 0 },
  { id: "legacy", name: "LEGACY", status: "locked", requiredModules: 7, completedModules: 0 },
  { id: "mastery", name: "MASTERY", status: "locked", requiredModules: 0, completedModules: 0 },
];

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  foundation: <Sparkles className="w-5 h-5" />,
  growth: <Gift className="w-5 h-5" />,
  momentum: <Zap className="w-5 h-5" />,
  legacy: <Home className="w-5 h-5" />,
  mastery: <Award className="w-5 h-5" />,
};

const MILESTONE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  completed: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-500",
    text: "text-green-700 dark:text-green-300",
    icon: "text-green-600 dark:text-green-400",
  },
  active: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
  },
  locked: {
    bg: "bg-gray-100 dark:bg-gray-800",
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-500 dark:text-gray-400",
    icon: "text-gray-400 dark:text-gray-500",
  },
};

export function TokenChainProgress({ milestones = DEFAULT_MILESTONES, className }: MilestoneProgressProps) {
  const completedCount = milestones.filter(t => t.status === "completed").length;
  const totalCount = milestones.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Progress Milestones
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Complete each milestone in sequence to achieve Mastery certification
        </p>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Milestone Chain */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {milestones.map((milestone, index) => {
            const colors = MILESTONE_COLORS[milestone.status];
            const isLast = index === milestones.length - 1;
            
            return (
              <div key={milestone.id} className="flex items-center">
                {/* Milestone Node */}
                <div className="flex flex-col items-center min-w-[70px]">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all",
                      colors.bg,
                      colors.border,
                      milestone.status === "active" && "ring-2 ring-amber-400 ring-offset-2"
                    )}
                  >
                    {milestone.status === "completed" ? (
                      <CheckCircle2 className={cn("w-6 h-6", colors.icon)} />
                    ) : milestone.status === "locked" ? (
                      <Lock className={cn("w-5 h-5", colors.icon)} />
                    ) : (
                      <span className={colors.icon}>{MILESTONE_ICONS[milestone.id]}</span>
                    )}
                  </div>
                  <span className={cn("text-xs font-semibold mt-2", colors.text)}>
                    {milestone.name}
                  </span>
                  {milestone.status === "active" && milestone.requiredModules && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                      {milestone.completedModules}/{milestone.requiredModules} modules
                    </span>
                  )}
                  {milestone.status === "completed" && (
                    <span className="text-[10px] text-green-600 dark:text-green-400">
                      Complete
                    </span>
                  )}
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <ChevronRight 
                    className={cn(
                      "w-4 h-4 mx-1 flex-shrink-0",
                      index < completedCount ? "text-green-500" : "text-gray-300"
                    )} 
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Status Message */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          {completedCount === totalCount ? (
            <p className="text-sm text-center text-green-700 dark:text-green-300 font-medium">
              🎉 Congratulations! You have completed all milestones and achieved Mastery certification!
            </p>
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              {milestones.find(t => t.status === "active") ? (
                <>
                  Currently working on: <span className="font-semibold text-amber-600">{milestones.find(t => t.status === "active")?.name}</span> milestone. 
                  Complete the required modules to unlock the next stage.
                </>
              ) : (
                "Start your journey by completing the FOUNDATION milestone."
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TokenChainProgress;
