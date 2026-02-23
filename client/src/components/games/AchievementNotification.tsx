import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { 
  Trophy,
  Star,
  Crown,
  Shield,
  Sparkles,
  Award,
  Medal,
  Gem,
  Rocket,
  Timer,
  Users,
  Building,
  Map,
  BookOpen,
  Heart,
  Briefcase,
  TrendingUp,
  Key,
  Footprints,
  GitBranch,
  Home,
  UsersRound,
  FileCheck,
  Repeat,
  CheckCircle,
  X,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  unlockedAt?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
  autoHideDuration?: number;
}

const RARITY_COLORS = {
  common: { bg: "from-gray-500/20 to-gray-600/20", border: "border-gray-400", text: "text-gray-300", glow: "" },
  uncommon: { bg: "from-green-500/20 to-emerald-600/20", border: "border-green-400", text: "text-green-300", glow: "shadow-green-500/30" },
  rare: { bg: "from-blue-500/20 to-indigo-600/20", border: "border-blue-400", text: "text-blue-300", glow: "shadow-blue-500/30" },
  epic: { bg: "from-purple-500/20 to-violet-600/20", border: "border-purple-400", text: "text-purple-300", glow: "shadow-purple-500/40" },
  legendary: { bg: "from-amber-500/20 to-orange-600/20", border: "border-amber-400", text: "text-amber-300", glow: "shadow-amber-500/50" },
};

const ICON_MAP: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-8 h-8" />,
  star: <Star className="w-8 h-8" />,
  crown: <Crown className="w-8 h-8" />,
  shield: <Shield className="w-8 h-8" />,
  sparkles: <Sparkles className="w-8 h-8" />,
  award: <Award className="w-8 h-8" />,
  medal: <Medal className="w-8 h-8" />,
  gem: <Gem className="w-8 h-8" />,
  rocket: <Rocket className="w-8 h-8" />,
  timer: <Timer className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />,
  building: <Building className="w-8 h-8" />,
  "building-2": <Building className="w-8 h-8" />,
  map: <Map className="w-8 h-8" />,
  "book-open": <BookOpen className="w-8 h-8" />,
  heart: <Heart className="w-8 h-8" />,
  briefcase: <Briefcase className="w-8 h-8" />,
  "trending-up": <TrendingUp className="w-8 h-8" />,
  key: <Key className="w-8 h-8" />,
  footprints: <Footprints className="w-8 h-8" />,
  "git-branch": <GitBranch className="w-8 h-8" />,
  home: <Home className="w-8 h-8" />,
  "users-round": <UsersRound className="w-8 h-8" />,
  "users-plus": <Users className="w-8 h-8" />,
  "file-check": <FileCheck className="w-8 h-8" />,
  repeat: <Repeat className="w-8 h-8" />,
  "check-circle": <CheckCircle className="w-8 h-8" />,
  landmark: <Building className="w-8 h-8" />,
  sunrise: <Sparkles className="w-8 h-8" />,
};

export function AchievementNotification({ 
  achievement, 
  onDismiss, 
  autoHideDuration = 5000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      onDismiss();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setIsExiting(false);

      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [achievement, autoHideDuration, handleDismiss]);

  if (!achievement || !isVisible) return null;

  const rarityStyle = RARITY_COLORS[achievement.rarity];
  const icon = ICON_MAP[achievement.icon] || <Trophy className="w-8 h-8" />;

  return (
    <div 
      className={`fixed top-4 right-4 z-[100] transition-all duration-300 ${
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      }`}
    >
      <Card 
        className={`
          relative overflow-hidden p-4 min-w-[320px] max-w-[400px]
          bg-gradient-to-r ${rarityStyle.bg}
          border-2 ${rarityStyle.border}
          shadow-lg ${rarityStyle.glow}
        `}
      >
        {/* Animated background shimmer for legendary */}
        {achievement.rarity === "legendary" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer" />
        )}

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon with glow effect */}
          <div className={`
            flex-shrink-0 p-3 rounded-full 
            bg-gradient-to-br ${rarityStyle.bg}
            ${rarityStyle.text}
            ${achievement.rarity === "legendary" ? "animate-pulse" : ""}
          `}>
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Achievement Unlocked
              </span>
              <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
            </div>

            <h3 className={`font-bold text-lg ${rarityStyle.text}`}>
              {achievement.name}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {achievement.description}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <span className={`
                text-xs font-medium px-2 py-0.5 rounded-full
                ${rarityStyle.bg} ${rarityStyle.text} ${rarityStyle.border} border
              `}>
                {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
              </span>
              <span className="text-sm font-bold text-yellow-500 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500" />
                +{achievement.points} pts
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
          <div 
            className={`h-full ${rarityStyle.border.replace("border-", "bg-")} transition-all`}
            style={{
              animation: `shrink ${autoHideDuration}ms linear forwards`,
            }}
          />
        </div>
      </Card>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Achievement notification queue manager
interface QueuedAchievement extends Achievement {
  queueId: string;
}

interface AchievementNotificationQueueProps {
  achievements: Achievement[];
  onAllDismissed: () => void;
}

export function AchievementNotificationQueue({ 
  achievements, 
  onAllDismissed 
}: AchievementNotificationQueueProps) {
  const [queue, setQueue] = useState<QueuedAchievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<QueuedAchievement | null>(null);

  useEffect(() => {
    if (achievements.length > 0) {
      const newQueue = achievements.map((a, i) => ({
        ...a,
        queueId: `${a.id}-${Date.now()}-${i}`,
      }));
      setQueue(prev => [...prev, ...newQueue]);
    }
  }, [achievements]);

  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      setCurrentAchievement(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [currentAchievement, queue]);

  const handleDismiss = () => {
    setCurrentAchievement(null);
    if (queue.length === 0) {
      onAllDismissed();
    }
  };

  return (
    <>
      <AchievementNotification
        achievement={currentAchievement}
        onDismiss={handleDismiss}
        autoHideDuration={4000}
      />
      
      {/* Queue indicator */}
      {queue.length > 0 && currentAchievement && (
        <div className="fixed top-20 right-4 z-[99] text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full border">
          +{queue.length} more achievement{queue.length > 1 ? "s" : ""}
        </div>
      )}
    </>
  );
}

export default AchievementNotification;
