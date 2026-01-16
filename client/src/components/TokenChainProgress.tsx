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
  Crown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenStatus {
  id: string;
  name: string;
  status: "completed" | "active" | "locked";
  completedAt?: Date;
  requiredScrolls?: number;
  sealedScrolls?: number;
}

interface TokenChainProgressProps {
  tokens?: TokenStatus[];
  className?: string;
}

const DEFAULT_TOKENS: TokenStatus[] = [
  { id: "mirror", name: "MIRROR", status: "completed", requiredScrolls: 3, sealedScrolls: 3 },
  { id: "gift", name: "GIFT", status: "active", requiredScrolls: 3, sealedScrolls: 1 },
  { id: "spark", name: "SPARK", status: "locked", requiredScrolls: 3, sealedScrolls: 0 },
  { id: "house", name: "HOUSE", status: "locked", requiredScrolls: 7, sealedScrolls: 0 },
  { id: "crown", name: "CROWN", status: "locked", requiredScrolls: 0, sealedScrolls: 0 },
];

const TOKEN_ICONS: Record<string, React.ReactNode> = {
  mirror: <Sparkles className="w-5 h-5" />,
  gift: <Gift className="w-5 h-5" />,
  spark: <Zap className="w-5 h-5" />,
  house: <Home className="w-5 h-5" />,
  crown: <Crown className="w-5 h-5" />,
};

const TOKEN_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
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

export function TokenChainProgress({ tokens = DEFAULT_TOKENS, className }: TokenChainProgressProps) {
  const completedCount = tokens.filter(t => t.status === "completed").length;
  const totalCount = tokens.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Token Chain Progress
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            {completedCount}/{totalCount} Tokens
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Complete each token in sequence to unlock the Crown of Completion
        </p>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Chain Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Token Chain */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {tokens.map((token, index) => {
            const colors = TOKEN_COLORS[token.status];
            const isLast = index === tokens.length - 1;
            
            return (
              <div key={token.id} className="flex items-center">
                {/* Token Node */}
                <div className="flex flex-col items-center min-w-[70px]">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all",
                      colors.bg,
                      colors.border,
                      token.status === "active" && "ring-2 ring-amber-400 ring-offset-2"
                    )}
                  >
                    {token.status === "completed" ? (
                      <CheckCircle2 className={cn("w-6 h-6", colors.icon)} />
                    ) : token.status === "locked" ? (
                      <Lock className={cn("w-5 h-5", colors.icon)} />
                    ) : (
                      <span className={colors.icon}>{TOKEN_ICONS[token.id]}</span>
                    )}
                  </div>
                  <span className={cn("text-xs font-semibold mt-2", colors.text)}>
                    {token.name}
                  </span>
                  {token.status === "active" && token.requiredScrolls && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                      {token.sealedScrolls}/{token.requiredScrolls} scrolls
                    </span>
                  )}
                  {token.status === "completed" && (
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
              🎉 Congratulations! You have completed the Token Chain and earned your Crown!
            </p>
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              {tokens.find(t => t.status === "active") ? (
                <>
                  Currently working on: <span className="font-semibold text-amber-600">{tokens.find(t => t.status === "active")?.name}</span> token. 
                  Complete the required scrolls to unlock the next token.
                </>
              ) : (
                "Start your journey by activating the MIRROR token."
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TokenChainProgress;
