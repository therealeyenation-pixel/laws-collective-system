import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  ArrowRight,
  Shield,
  Building2,
  Briefcase,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Heart,
  Scale,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Crown,
  Baby,
  User,
  UserCheck,
  Landmark,
  PiggyBank,
  Receipt,
  Wallet,
  BadgeDollarSign,
  LineChart,
  BarChart3,
  Coins,
  HandCoins,
  Banknote,
  CreditCard,
  Calculator,
  Target,
  Milestone,
  Flag,
  Trophy,
  Star,
  Zap,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Split,
  Merge,
  Play,
  Pause,
  RotateCcw,
  Info
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import WealthAccumulationChart from "@/components/games/WealthAccumulationChart";
import PathConvergence from "@/components/games/PathConvergence";

// Life stages for the journey
type LifeStage = "birth" | "childhood" | "teen" | "young_adult" | "adult" | "middle_age" | "pre_retirement" | "retirement";

const LIFE_STAGES: { id: LifeStage; name: string; ageRange: string; years: number }[] = [
  { id: "birth", name: "Birth", ageRange: "0", years: 0 },
  { id: "childhood", name: "Childhood", ageRange: "1-12", years: 12 },
  { id: "teen", name: "Teen Years", ageRange: "13-17", years: 5 },
  { id: "young_adult", name: "Young Adult", ageRange: "18-25", years: 8 },
  { id: "adult", name: "Adult", ageRange: "26-40", years: 15 },
  { id: "middle_age", name: "Middle Age", ageRange: "41-55", years: 15 },
  { id: "pre_retirement", name: "Pre-Retirement", ageRange: "56-65", years: 10 },
  { id: "retirement", name: "Retirement", ageRange: "65+", years: 20 },
];

// Path types
type PathType = "ward" | "trust";

// Financial event types
interface FinancialEvent {
  id: string;
  stage: LifeStage;
  name: string;
  description: string;
  wardImpact: { netWorth: number; income: number; protection: number; description: string };
  trustImpact: { netWorth: number; income: number; protection: number; description: string };
  icon: React.ElementType;
  category: "income" | "expense" | "protection" | "opportunity" | "crisis";
}

// Life events that happen at each stage
const LIFE_EVENTS: FinancialEvent[] = [
  // BIRTH
  {
    id: "birth-setup",
    stage: "birth",
    name: "Birth & Initial Setup",
    description: "How you enter the world determines your starting position.",
    wardImpact: { netWorth: 0, income: 0, protection: 0, description: "Born as ward of state. No protective structure. Social security number issued - taxable entity created." },
    trustImpact: { netWorth: 5000, income: 0, protection: 100, description: "Trust established at birth. Initial funding from family. Protected entity with asset shield." },
    icon: Baby,
    category: "protection",
  },
  
  // CHILDHOOD
  {
    id: "childhood-education",
    stage: "childhood",
    name: "Early Education",
    description: "Foundation of knowledge and financial understanding.",
    wardImpact: { netWorth: 0, income: 0, protection: 0, description: "Public school. No financial education. Learning to be an employee." },
    trustImpact: { netWorth: 2000, income: 0, protection: 100, description: "Trust funds education. Financial literacy taught early. Learning to be an owner." },
    icon: GraduationCap,
    category: "opportunity",
  },
  {
    id: "childhood-savings",
    stage: "childhood",
    name: "First Savings",
    description: "Learning to save and manage money.",
    wardImpact: { netWorth: 500, income: 0, protection: 0, description: "Birthday money in personal account. Fully exposed to creditors." },
    trustImpact: { netWorth: 5000, income: 200, protection: 100, description: "Trust receives gifts. Invested and growing. Protected from outside claims." },
    icon: PiggyBank,
    category: "income",
  },
  
  // TEEN YEARS
  {
    id: "teen-first-job",
    stage: "teen",
    name: "First Job",
    description: "Entering the workforce for the first time.",
    wardImpact: { netWorth: 2000, income: 8000, protection: 0, description: "W-2 employee at minimum wage. Taxes withheld. Building someone else's dream." },
    trustImpact: { netWorth: 3000, income: 5000, protection: 100, description: "Part-time work for family business. Learning operations. Income flows to trust." },
    icon: Briefcase,
    category: "income",
  },
  {
    id: "teen-car",
    stage: "teen",
    name: "First Vehicle",
    description: "Transportation and the costs that come with it.",
    wardImpact: { netWorth: -5000, income: 0, protection: 0, description: "Car loan in personal name. Liability exposure. Depreciating asset." },
    trustImpact: { netWorth: -3000, income: 0, protection: 100, description: "Trust purchases vehicle. Asset protected. Business expense potential." },
    icon: Receipt,
    category: "expense",
  },
  
  // YOUNG ADULT
  {
    id: "young-adult-college",
    stage: "young_adult",
    name: "Higher Education",
    description: "College, trade school, or direct workforce entry.",
    wardImpact: { netWorth: -45000, income: 0, protection: 0, description: "Student loans in personal name. Debt that cannot be discharged. 10+ years of payments." },
    trustImpact: { netWorth: -20000, income: 0, protection: 100, description: "Trust funds education or trade training. No personal debt. Strategic investment in skills." },
    icon: GraduationCap,
    category: "expense",
  },
  {
    id: "young-adult-career-start",
    stage: "young_adult",
    name: "Career Launch",
    description: "Starting your professional journey.",
    wardImpact: { netWorth: 5000, income: 45000, protection: 0, description: "W-2 employment. 25-30% effective tax rate. Trading time for money." },
    trustImpact: { netWorth: 15000, income: 35000, protection: 100, description: "Business formation. Multiple income streams. Tax advantages from day one." },
    icon: Briefcase,
    category: "income",
  },
  {
    id: "young-adult-first-investment",
    stage: "young_adult",
    name: "First Investment",
    description: "Beginning to build wealth through investing.",
    wardImpact: { netWorth: 10000, income: 500, protection: 0, description: "Personal brokerage account. Capital gains taxes. Fully exposed to lawsuits." },
    trustImpact: { netWorth: 25000, income: 2000, protection: 100, description: "Trust holds investments. Tax-advantaged growth. Protected from creditors." },
    icon: TrendingUp,
    category: "opportunity",
  },
  
  // ADULT
  {
    id: "adult-marriage",
    stage: "adult",
    name: "Marriage",
    description: "Joining lives and finances with a partner.",
    wardImpact: { netWorth: 0, income: 0, protection: -20, description: "Assets commingled. No prenup. 50% divorce risk exposes everything." },
    trustImpact: { netWorth: 0, income: 0, protection: 100, description: "Trust assets remain protected. Prenup standard. Family wealth preserved." },
    icon: Heart,
    category: "protection",
  },
  {
    id: "adult-home-purchase",
    stage: "adult",
    name: "Home Purchase",
    description: "Buying your first home.",
    wardImpact: { netWorth: 50000, income: 0, protection: -10, description: "Personal mortgage. Homestead exemption limited. Equity exposed to judgments." },
    trustImpact: { netWorth: 75000, income: 3000, protection: 100, description: "Trust or LLC holds property. Rental income potential. Full asset protection." },
    icon: Home,
    category: "opportunity",
  },
  {
    id: "adult-children",
    stage: "adult",
    name: "Having Children",
    description: "Expanding the family and planning for the next generation.",
    wardImpact: { netWorth: -50000, income: 0, protection: 0, description: "Childcare costs. College savings in personal name. No generational structure." },
    trustImpact: { netWorth: -30000, income: 0, protection: 100, description: "Trust expands to include children. Education funded. Generational wealth structure in place." },
    icon: Users,
    category: "expense",
  },
  {
    id: "adult-lawsuit",
    stage: "adult",
    name: "Lawsuit (Life Event)",
    description: "Someone sues you for an accident or business dispute.",
    wardImpact: { netWorth: -75000, income: 0, protection: -50, description: "Personal assets seized. Wages garnished. Years to recover." },
    trustImpact: { netWorth: -5000, income: 0, protection: 100, description: "Trust assets protected. Only business assets at risk. Quick recovery." },
    icon: Scale,
    category: "crisis",
  },
  {
    id: "adult-business-opportunity",
    stage: "adult",
    name: "Business Opportunity",
    description: "Chance to start or invest in a business.",
    wardImpact: { netWorth: 25000, income: 15000, protection: -30, description: "Sole proprietor. Personal liability. All eggs in one basket." },
    trustImpact: { netWorth: 100000, income: 50000, protection: 100, description: "LLC under trust. Limited liability. Multiple entities for different ventures." },
    icon: Building2,
    category: "opportunity",
  },
  
  // MIDDLE AGE
  {
    id: "middle-age-peak-earning",
    stage: "middle_age",
    name: "Peak Earning Years",
    description: "Highest income potential of your career.",
    wardImpact: { netWorth: 150000, income: 120000, protection: 0, description: "High W-2 income. 35%+ tax bracket. Golden handcuffs to employer." },
    trustImpact: { netWorth: 500000, income: 200000, protection: 100, description: "Multiple businesses mature. Passive income dominates. Tax optimization maximized." },
    icon: TrendingUp,
    category: "income",
  },
  {
    id: "middle-age-medical-crisis",
    stage: "middle_age",
    name: "Medical Crisis",
    description: "Unexpected health issue requiring significant resources.",
    wardImpact: { netWorth: -100000, income: -30000, protection: -40, description: "Medical bills. Lost income. Bankruptcy consideration." },
    trustImpact: { netWorth: -25000, income: -5000, protection: 100, description: "Trust covers medical. Business continues. Family protected." },
    icon: Heart,
    category: "crisis",
  },
  {
    id: "middle-age-divorce",
    stage: "middle_age",
    name: "Divorce (50% chance)",
    description: "Marriage dissolution and asset division.",
    wardImpact: { netWorth: -200000, income: -20000, protection: -60, description: "Assets split 50/50. Alimony payments. Starting over at 45." },
    trustImpact: { netWorth: -20000, income: -5000, protection: 100, description: "Trust assets protected by prenup. Business continues. Minimal disruption." },
    icon: Split,
    category: "crisis",
  },
  {
    id: "middle-age-inheritance",
    stage: "middle_age",
    name: "Inheritance Received",
    description: "Receiving assets from previous generation.",
    wardImpact: { netWorth: 100000, income: 0, protection: 0, description: "Inheritance taxed. Assets in personal name. Exposed immediately." },
    trustImpact: { netWorth: 150000, income: 10000, protection: 100, description: "Trust-to-trust transfer. Tax minimized. Protection maintained." },
    icon: HandCoins,
    category: "income",
  },
  
  // PRE-RETIREMENT
  {
    id: "pre-retirement-planning",
    stage: "pre_retirement",
    name: "Retirement Planning",
    description: "Preparing for the transition out of active work.",
    wardImpact: { netWorth: 50000, income: 0, protection: 0, description: "401(k) and Social Security. Dependent on market. Limited control." },
    trustImpact: { netWorth: 200000, income: 50000, protection: 100, description: "Trust generates passive income. Real estate, businesses, investments. Full control." },
    icon: Target,
    category: "opportunity",
  },
  {
    id: "pre-retirement-business-sale",
    stage: "pre_retirement",
    name: "Business Sale/Transition",
    description: "Selling or transitioning business to next generation.",
    wardImpact: { netWorth: 200000, income: -50000, protection: 0, description: "Capital gains tax on sale. Lost income stream. Starting fresh." },
    trustImpact: { netWorth: 500000, income: 30000, protection: 100, description: "Trust sells or transfers to heirs. Tax-advantaged. Income continues." },
    icon: Landmark,
    category: "opportunity",
  },
  {
    id: "pre-retirement-long-term-care",
    stage: "pre_retirement",
    name: "Long-Term Care Planning",
    description: "Preparing for potential care needs.",
    wardImpact: { netWorth: -50000, income: 0, protection: -30, description: "Must spend down assets for Medicaid. Family wealth depleted." },
    trustImpact: { netWorth: -20000, income: 0, protection: 100, description: "Irrevocable trust protects assets. Care funded. Wealth preserved." },
    icon: Shield,
    category: "protection",
  },
  
  // RETIREMENT
  {
    id: "retirement-income",
    stage: "retirement",
    name: "Retirement Income",
    description: "Living on accumulated wealth and benefits.",
    wardImpact: { netWorth: 0, income: 40000, protection: 0, description: "Social Security + 401(k) withdrawals. Fixed income. Inflation risk." },
    trustImpact: { netWorth: 100000, income: 150000, protection: 100, description: "Trust distributions. Business income. Real estate cash flow. Inflation hedged." },
    icon: Wallet,
    category: "income",
  },
  {
    id: "retirement-legacy",
    stage: "retirement",
    name: "Legacy Planning",
    description: "Preparing wealth transfer to next generation.",
    wardImpact: { netWorth: -100000, income: 0, protection: 0, description: "Estate taxes. Probate costs. Public process. 40%+ to government." },
    trustImpact: { netWorth: 0, income: 0, protection: 100, description: "Trust transfers seamlessly. No probate. Privacy maintained. Wealth intact." },
    icon: Crown,
    category: "protection",
  },
  {
    id: "retirement-generational-transfer",
    stage: "retirement",
    name: "Generational Wealth Transfer",
    description: "Passing wealth to children and grandchildren.",
    wardImpact: { netWorth: -200000, income: 0, protection: 0, description: "Estate depleted by taxes and costs. Children start near zero. Cycle repeats." },
    trustImpact: { netWorth: 500000, income: 50000, protection: 100, description: "Trust continues for generations. Children start with protection. Wealth compounds." },
    icon: Users,
    category: "opportunity",
  },
];

// Game state interface
interface GameState {
  path: PathType | null;
  currentStage: number;
  currentEventIndex: number;
  wardStats: {
    netWorth: number;
    totalIncome: number;
    totalTaxesPaid: number;
    protectionLevel: number;
    crisisCount: number;
  };
  trustStats: {
    netWorth: number;
    totalIncome: number;
    totalTaxesPaid: number;
    protectionLevel: number;
    crisisCount: number;
  };
  eventsCompleted: string[];
  isPlaying: boolean;
  showComparison: boolean;
  gameComplete: boolean;
  convergenceReached: boolean;
}

const DEFAULT_GAME_STATE: GameState = {
  path: null,
  currentStage: 0,
  currentEventIndex: 0,
  wardStats: {
    netWorth: 0,
    totalIncome: 0,
    totalTaxesPaid: 0,
    protectionLevel: 0,
    crisisCount: 0,
  },
  trustStats: {
    netWorth: 5000,
    totalIncome: 0,
    totalTaxesPaid: 0,
    protectionLevel: 100,
    crisisCount: 0,
  },
  eventsCompleted: [],
  isPlaying: false,
  showComparison: true,
  gameComplete: false,
  convergenceReached: false,
};

// Format currency
const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000000) {
    return `${amount < 0 ? '-' : ''}$${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${amount < 0 ? '-' : ''}$${(absAmount / 1000).toFixed(0)}K`;
  }
  return `${amount < 0 ? '-' : ''}$${absAmount.toFixed(0)}`;
};

// Calculate age from stage
const getAgeFromStage = (stageIndex: number): number => {
  let age = 0;
  for (let i = 0; i <= stageIndex && i < LIFE_STAGES.length; i++) {
    if (i > 0) {
      age += LIFE_STAGES[i].years;
    }
  }
  return age;
};

export default function DualPathJourney() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem("dual-path-journey-v1");
    return saved ? JSON.parse(saved) : DEFAULT_GAME_STATE;
  });
  
  const [showIntro, setShowIntro] = useState(!gameState.path);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<FinancialEvent | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [, setLocation] = useLocation();

  // Save game state
  useEffect(() => {
    localStorage.setItem("dual-path-journey-v1", JSON.stringify(gameState));
  }, [gameState]);

  // Auto-play timer
  useEffect(() => {
    if (autoPlay && gameState.isPlaying && !gameState.gameComplete) {
      const timer = setTimeout(() => {
        advanceGame();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, gameState.isPlaying, gameState.currentEventIndex, gameState.gameComplete]);

  // Get events for current stage
  const currentStageEvents = useMemo(() => {
    const stage = LIFE_STAGES[gameState.currentStage];
    return LIFE_EVENTS.filter(e => e.stage === stage?.id);
  }, [gameState.currentStage]);

  // Calculate cumulative stats with compound growth
  const calculateStats = (path: PathType) => {
    const stats = path === "ward" ? { ...gameState.wardStats } : { ...gameState.trustStats };
    
    // Apply compound growth based on protection level and stage
    const growthRate = path === "trust" ? 0.08 : 0.04; // 8% vs 4% annual growth
    const yearsElapsed = getAgeFromStage(gameState.currentStage);
    
    if (yearsElapsed > 0 && stats.netWorth > 0) {
      const compoundedGrowth = stats.netWorth * Math.pow(1 + growthRate, yearsElapsed / 10);
      return { ...stats, projectedNetWorth: compoundedGrowth };
    }
    
    return { ...stats, projectedNetWorth: stats.netWorth };
  };

  // Start the game with chosen path
  const startGame = (path: PathType) => {
    setGameState({
      ...DEFAULT_GAME_STATE,
      path,
      isPlaying: true,
    });
    setShowIntro(false);
    toast.success(`Starting your ${path === "trust" ? "Birth-Trust" : "Birth-Ward"} journey!`);
  };

  // Advance to next event
  const advanceGame = () => {
    if (gameState.gameComplete) return;

    const stageEvents = LIFE_EVENTS.filter(e => e.stage === LIFE_STAGES[gameState.currentStage]?.id);
    
    if (gameState.currentEventIndex < stageEvents.length) {
      const event = stageEvents[gameState.currentEventIndex];
      setCurrentEvent(event);
      setShowEventDetail(true);
      
      // Apply event impacts
      setGameState(prev => {
        const newWardStats = {
          ...prev.wardStats,
          netWorth: prev.wardStats.netWorth + event.wardImpact.netWorth,
          totalIncome: prev.wardStats.totalIncome + Math.max(0, event.wardImpact.income),
          protectionLevel: Math.max(0, Math.min(100, prev.wardStats.protectionLevel + event.wardImpact.protection)),
          crisisCount: prev.wardStats.crisisCount + (event.category === "crisis" ? 1 : 0),
        };
        
        const newTrustStats = {
          ...prev.trustStats,
          netWorth: prev.trustStats.netWorth + event.trustImpact.netWorth,
          totalIncome: prev.trustStats.totalIncome + Math.max(0, event.trustImpact.income),
          protectionLevel: Math.max(0, Math.min(100, prev.trustStats.protectionLevel + event.trustImpact.protection)),
          crisisCount: prev.trustStats.crisisCount + (event.category === "crisis" ? 1 : 0),
        };
        
        return {
          ...prev,
          wardStats: newWardStats,
          trustStats: newTrustStats,
          eventsCompleted: [...prev.eventsCompleted, event.id],
          currentEventIndex: prev.currentEventIndex + 1,
        };
      });
    } else {
      // Move to next stage
      if (gameState.currentStage < LIFE_STAGES.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentStage: prev.currentStage + 1,
          currentEventIndex: 0,
        }));
        toast.info(`Entering ${LIFE_STAGES[gameState.currentStage + 1].name}`);
      } else {
        // Game complete
        setGameState(prev => ({
          ...prev,
          gameComplete: true,
          isPlaying: false,
        }));
        toast.success("Journey complete! Review your life paths.");
      }
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState(DEFAULT_GAME_STATE);
    setShowIntro(true);
    setAutoPlay(false);
    toast.info("Game reset. Choose your path.");
  };

  // Convergence check - when ward path discovers need for trust/business
  const checkConvergence = () => {
    if (gameState.currentStage >= 4 && !gameState.convergenceReached) { // Adult stage
      setGameState(prev => ({ ...prev, convergenceReached: true }));
      return true;
    }
    return false;
  };

  const wardStats = calculateStats("ward");
  const trustStats = calculateStats("trust");
  const wealthGap = trustStats.netWorth - wardStats.netWorth;
  const currentAge = getAgeFromStage(gameState.currentStage);

  // Handle business journey navigation
  const handleStartBusinessJourney = () => {
    setLocation("/business-formation");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">L.A.W.S. Quest: Dual Path Journey</h1>
              <p className="text-muted-foreground">
                Experience two life paths side by side - Birth-Ward vs Birth-Trust
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gameState.path && (
              <>
                <Button variant="outline" size="sm" onClick={() => setAutoPlay(!autoPlay)}>
                  {autoPlay ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {autoPlay ? "Pause" : "Auto-Play"}
                </Button>
                <Button variant="outline" size="sm" onClick={resetGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  variant={showAnalytics ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  {showAnalytics ? "Hide" : "Show"} Analytics
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Intro Dialog - Path Selection */}
        <Dialog open={showIntro} onOpenChange={setShowIntro}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Split className="w-6 h-6" />
                Choose Your Starting Path
              </DialogTitle>
              <DialogDescription>
                Your answer to this question determines your journey through life.
                Both paths will be shown - you'll play one and watch the other unfold.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  "Do you have a trust established at birth?"
                </h3>
                <p className="text-muted-foreground">
                  This single question shapes your entire financial journey.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Ward Path */}
                <Card 
                  className="cursor-pointer hover:border-red-500 transition-all"
                  onClick={() => startGame("ward")}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-red-600" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">No - Birth-Ward of State</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Born without protective structure. Navigate life as a taxable entity with personal liability.
                    </p>
                    <div className="space-y-2 text-xs text-left">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>No asset protection</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>Higher tax burden</span>
                      </div>
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>W-2 employment track</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Play This Path
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Trust Path */}
                <Card 
                  className="cursor-pointer hover:border-green-500 transition-all"
                  onClick={() => startGame("trust")}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Yes - Birth-Trust System</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Born into protective trust structure. Assets shielded from day one.
                    </p>
                    <div className="space-y-2 text-xs text-left">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Full asset protection</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tax optimization</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Business owner track</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Play This Path
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <DialogFooter>
              <p className="text-xs text-muted-foreground text-center w-full">
                Both paths eventually lead to business and trust creation - but at very different stages and wealth levels.
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Event Detail Dialog */}
        <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
          <DialogContent className="max-w-3xl">
            {currentEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <currentEvent.icon className="w-5 h-5" />
                    {currentEvent.name}
                    <Badge variant={
                      currentEvent.category === "crisis" ? "destructive" :
                      currentEvent.category === "opportunity" ? "default" :
                      currentEvent.category === "income" ? "secondary" :
                      "outline"
                    }>
                      {currentEvent.category}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>{currentEvent.description}</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4 py-4">
                  {/* Ward Impact */}
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                        <User className="w-4 h-4" />
                        Birth-Ward Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{currentEvent.wardImpact.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Net Worth Impact:</span>
                          <span className={currentEvent.wardImpact.netWorth >= 0 ? "text-green-600" : "text-red-600"}>
                            {currentEvent.wardImpact.netWorth >= 0 ? "+" : ""}{formatCurrency(currentEvent.wardImpact.netWorth)}
                          </span>
                        </div>
                        {currentEvent.wardImpact.income !== 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Annual Income:</span>
                            <span className={currentEvent.wardImpact.income >= 0 ? "text-green-600" : "text-red-600"}>
                              {currentEvent.wardImpact.income >= 0 ? "+" : ""}{formatCurrency(currentEvent.wardImpact.income)}
                            </span>
                          </div>
                        )}
                        {currentEvent.wardImpact.protection !== 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Protection:</span>
                            <span className={currentEvent.wardImpact.protection >= 0 ? "text-green-600" : "text-red-600"}>
                              {currentEvent.wardImpact.protection >= 0 ? "+" : ""}{currentEvent.wardImpact.protection}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Trust Impact */}
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                        <Shield className="w-4 h-4" />
                        Birth-Trust Path
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{currentEvent.trustImpact.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Net Worth Impact:</span>
                          <span className={currentEvent.trustImpact.netWorth >= 0 ? "text-green-600" : "text-red-600"}>
                            {currentEvent.trustImpact.netWorth >= 0 ? "+" : ""}{formatCurrency(currentEvent.trustImpact.netWorth)}
                          </span>
                        </div>
                        {currentEvent.trustImpact.income !== 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Annual Income:</span>
                            <span className={currentEvent.trustImpact.income >= 0 ? "text-green-600" : "text-red-600"}>
                              {currentEvent.trustImpact.income >= 0 ? "+" : ""}{formatCurrency(currentEvent.trustImpact.income)}
                            </span>
                          </div>
                        )}
                        {currentEvent.trustImpact.protection !== 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Protection:</span>
                            <span className={currentEvent.trustImpact.protection >= 0 ? "text-green-600" : "text-red-600"}>
                              {currentEvent.trustImpact.protection >= 0 ? "+" : ""}{currentEvent.trustImpact.protection}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setShowEventDetail(false)}>
                    Continue Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Main Game Area */}
        {gameState.path && (
          <>
            {/* Progress Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Life Journey Progress</span>
                  <span className="text-sm text-muted-foreground">Age {currentAge}</span>
                </div>
                <div className="relative">
                  <Progress value={(gameState.currentStage / (LIFE_STAGES.length - 1)) * 100} className="h-3" />
                  <div className="flex justify-between mt-2">
                    {LIFE_STAGES.map((stage, idx) => (
                      <div 
                        key={stage.id}
                        className={`text-xs ${idx <= gameState.currentStage ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                      >
                        {stage.name}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-6">
              {/* Ward Path Stats */}
              <Card className={`border-2 ${gameState.path === "ward" ? "border-red-500 ring-2 ring-red-200" : "border-red-200"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    Birth-Ward Path
                    {gameState.path === "ward" && <Badge>Your Path</Badge>}
                  </CardTitle>
                  <CardDescription>No protective structure at birth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(wardStats.netWorth)}</p>
                      <p className="text-xs text-muted-foreground">Net Worth</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(wardStats.totalIncome)}</p>
                      <p className="text-xs text-muted-foreground">Lifetime Income</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Asset Protection</span>
                      <span>{wardStats.protectionLevel}%</span>
                    </div>
                    <Progress value={wardStats.protectionLevel} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Crises Faced:</span>
                    <Badge variant="destructive">{wardStats.crisisCount}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Path Stats */}
              <Card className={`border-2 ${gameState.path === "trust" ? "border-green-500 ring-2 ring-green-200" : "border-green-200"}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Birth-Trust Path
                    {gameState.path === "trust" && <Badge>Your Path</Badge>}
                  </CardTitle>
                  <CardDescription>Trust established at birth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(trustStats.netWorth)}</p>
                      <p className="text-xs text-muted-foreground">Net Worth</p>
                    </div>
                    <div className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(trustStats.totalIncome)}</p>
                      <p className="text-xs text-muted-foreground">Lifetime Income</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Asset Protection</span>
                      <span>{trustStats.protectionLevel}%</span>
                    </div>
                    <Progress value={trustStats.protectionLevel} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Crises Weathered:</span>
                    <Badge variant="secondary">{trustStats.crisisCount}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Wealth Gap Indicator */}
            <Card className="bg-gradient-to-r from-red-50 via-amber-50 to-green-50 dark:from-red-950/20 dark:via-amber-950/20 dark:to-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-sm text-muted-foreground">Ward Net Worth</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(wardStats.netWorth)}</p>
                  </div>
                  <div className="text-center px-8">
                    <p className="text-sm text-muted-foreground">Wealth Gap</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(wealthGap)}</p>
                    <p className="text-xs text-muted-foreground">
                      Trust path is {wealthGap > 0 ? "ahead" : "behind"}
                    </p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm text-muted-foreground">Trust Net Worth</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(trustStats.netWorth)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Stage Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Milestone className="w-5 h-5" />
                  {LIFE_STAGES[gameState.currentStage]?.name} Events
                  <Badge variant="outline">{LIFE_STAGES[gameState.currentStage]?.ageRange} years old</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentStageEvents.map((event, idx) => {
                    const isCompleted = gameState.eventsCompleted.includes(event.id);
                    const isCurrent = idx === gameState.currentEventIndex;
                    
                    return (
                      <div 
                        key={event.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCompleted ? 'bg-secondary/30 border-secondary' :
                          isCurrent ? 'bg-primary/10 border-primary' :
                          'border-border'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          isCompleted ? 'bg-green-100 dark:bg-green-900/30' :
                          isCurrent ? 'bg-primary/20' :
                          'bg-secondary'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <event.icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{event.name}</p>
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        </div>
                        <Badge variant={
                          event.category === "crisis" ? "destructive" :
                          event.category === "opportunity" ? "default" :
                          "secondary"
                        }>
                          {event.category}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                
                {!gameState.gameComplete && (
                  <Button 
                    className="w-full mt-4" 
                    onClick={advanceGame}
                    disabled={autoPlay}
                  >
                    {gameState.currentEventIndex < currentStageEvents.length ? (
                      <>
                        Experience Next Event
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Advance to {LIFE_STAGES[gameState.currentStage + 1]?.name || "Completion"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Convergence Point - When Ward discovers need for trust */}
            {gameState.convergenceReached && gameState.path === "ward" && (
              <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Merge className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Convergence Point Reached</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        After experiencing life events without protection, you've discovered the need for 
                        business formation and trust structures. It's never too late to start - but notice 
                        how much further ahead the Birth-Trust path is at this same age.
                      </p>
                      <div className="flex gap-4">
                        <div className="text-center p-3 bg-background rounded-lg">
                          <p className="text-lg font-bold text-red-600">{formatCurrency(wardStats.netWorth)}</p>
                          <p className="text-xs text-muted-foreground">Your Position</p>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(trustStats.netWorth)}</p>
                          <p className="text-xs text-muted-foreground">Trust Path Position</p>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg">
                          <p className="text-lg font-bold text-amber-600">{formatCurrency(wealthGap)}</p>
                          <p className="text-xs text-muted-foreground">Gap to Close</p>
                        </div>
                      </div>
                      <Button className="mt-4" variant="outline">
                        <Link href="/business-formation">
                          Start Your Business Journey Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Section */}
            {showAnalytics && (
              <div className="space-y-6">
                <WealthAccumulationChart
                  wardStats={{
                    netWorth: gameState.wardStats.netWorth,
                    totalIncome: gameState.wardStats.totalIncome,
                    protectionLevel: gameState.wardStats.protectionLevel,
                  }}
                  trustStats={{
                    netWorth: gameState.trustStats.netWorth,
                    totalIncome: gameState.trustStats.totalIncome,
                    protectionLevel: gameState.trustStats.protectionLevel,
                  }}
                  currentAge={currentAge}
                  eventsCompleted={gameState.eventsCompleted}
                />
                
                <PathConvergence
                  currentPath={gameState.path!}
                  currentAge={currentAge}
                  wardNetWorth={gameState.wardStats.netWorth}
                  trustNetWorth={gameState.trustStats.netWorth}
                  onStartBusinessJourney={handleStartBusinessJourney}
                />
              </div>
            )}

            {/* Game Complete Summary */}
            {gameState.gameComplete && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    Journey Complete - Life Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Ward Summary */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-red-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Birth-Ward Final Results
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Final Net Worth:</span>
                          <span className="font-bold">{formatCurrency(wardStats.netWorth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lifetime Income:</span>
                          <span>{formatCurrency(wardStats.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protection Level:</span>
                          <span>{wardStats.protectionLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crises Faced:</span>
                          <span>{wardStats.crisisCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trust Summary */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-green-600 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Birth-Trust Final Results
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Final Net Worth:</span>
                          <span className="font-bold">{formatCurrency(trustStats.netWorth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lifetime Income:</span>
                          <span>{formatCurrency(trustStats.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Protection Level:</span>
                          <span>{trustStats.protectionLevel}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crises Weathered:</span>
                          <span>{trustStats.crisisCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 rounded-lg text-center">
                    <p className="text-lg font-bold mb-2">
                      Lifetime Wealth Difference: {formatCurrency(wealthGap)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The Birth-Trust path accumulated {((trustStats.netWorth / Math.max(1, wardStats.netWorth)) * 100 - 100).toFixed(0)}% more wealth
                      over a lifetime, with {trustStats.protectionLevel - wardStats.protectionLevel}% better asset protection.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Key Lesson
                    </h4>
                    <p className="text-sm">
                      Both paths eventually lead to business and trust creation - but starting with protection 
                      from birth creates a compounding advantage that's difficult to overcome. However, 
                      <strong> it's never too late to start</strong>. The L.A.W.S. system helps you build 
                      protective structures at any stage of life.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button onClick={resetGame} variant="outline" className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link href="/protection-layer">
                        Start Building Your Protection
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
