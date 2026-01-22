import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Building2,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  Award,
  Briefcase,
  Target,
  Zap,
  Shield,
  Heart,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
} from "lucide-react";

// Game scenarios with branching decisions
interface Decision {
  id: string;
  text: string;
  effects: {
    cash: number;
    reputation: number;
    employees: number;
    assets: number;
  };
  outcome: string;
  risk: "low" | "medium" | "high";
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  category: "finance" | "hr" | "marketing" | "operations" | "crisis";
  decisions: Decision[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Startup Funding Decision",
    description: "A venture capital firm offers to invest $500,000 in your business for 25% equity. What do you do?",
    category: "finance",
    decisions: [
      {
        id: "1a",
        text: "Accept the full investment",
        effects: { cash: 500000, reputation: 10, employees: 0, assets: 0 },
        outcome: "You gained significant capital but gave up 25% ownership. The VC brings valuable connections.",
        risk: "medium",
      },
      {
        id: "1b",
        text: "Negotiate for 15% equity instead",
        effects: { cash: 300000, reputation: 15, employees: 0, assets: 0 },
        outcome: "After tough negotiations, you secured $300K for only 15% equity. Investors respect your business acumen.",
        risk: "low",
      },
      {
        id: "1c",
        text: "Decline and bootstrap",
        effects: { cash: 0, reputation: 20, employees: 0, assets: 0 },
        outcome: "You maintain full ownership. Industry peers admire your independence, but growth will be slower.",
        risk: "high",
      },
    ],
  },
  {
    id: 2,
    title: "Key Employee Departure",
    description: "Your top salesperson announces they're leaving for a competitor. They want a 40% raise to stay.",
    category: "hr",
    decisions: [
      {
        id: "2a",
        text: "Match their demands",
        effects: { cash: -50000, reputation: 5, employees: 1, assets: 0 },
        outcome: "You kept your star performer, but other employees may expect similar treatment.",
        risk: "medium",
      },
      {
        id: "2b",
        text: "Offer 20% raise with equity",
        effects: { cash: -25000, reputation: 10, employees: 1, assets: 0 },
        outcome: "The creative offer worked! They feel invested in the company's success.",
        risk: "low",
      },
      {
        id: "2c",
        text: "Let them go and promote internally",
        effects: { cash: 0, reputation: -5, employees: -1, assets: 0 },
        outcome: "Short-term sales dip, but you discovered hidden talent in your team.",
        risk: "high",
      },
    ],
  },
  {
    id: 3,
    title: "Marketing Campaign Choice",
    description: "You have budget for one major marketing initiative. Which approach do you take?",
    category: "marketing",
    decisions: [
      {
        id: "3a",
        text: "Viral social media campaign",
        effects: { cash: -30000, reputation: 25, employees: 0, assets: 0 },
        outcome: "The campaign went viral! Brand awareness skyrocketed and leads are pouring in.",
        risk: "high",
      },
      {
        id: "3b",
        text: "Traditional advertising",
        effects: { cash: -50000, reputation: 10, employees: 0, assets: 0 },
        outcome: "Steady, predictable results. Your target demographic responded well.",
        risk: "low",
      },
      {
        id: "3c",
        text: "Community sponsorships",
        effects: { cash: -20000, reputation: 15, employees: 0, assets: 5 },
        outcome: "Local community loves you! Strong word-of-mouth and loyal customer base forming.",
        risk: "low",
      },
    ],
  },
  {
    id: 4,
    title: "Equipment Upgrade",
    description: "Your main production equipment is aging. Repair costs are increasing. What's your strategy?",
    category: "operations",
    decisions: [
      {
        id: "4a",
        text: "Buy new state-of-the-art equipment",
        effects: { cash: -200000, reputation: 10, employees: 0, assets: 50 },
        outcome: "Production efficiency increased 40%! The investment will pay off over time.",
        risk: "medium",
      },
      {
        id: "4b",
        text: "Lease modern equipment",
        effects: { cash: -50000, reputation: 5, employees: 0, assets: 20 },
        outcome: "Lower upfront cost with flexibility to upgrade later. Smart cash management.",
        risk: "low",
      },
      {
        id: "4c",
        text: "Continue with repairs",
        effects: { cash: -10000, reputation: -5, employees: 0, assets: -10 },
        outcome: "Saved money short-term, but reliability issues are affecting customer satisfaction.",
        risk: "high",
      },
    ],
  },
  {
    id: 5,
    title: "Data Breach Crisis",
    description: "Your IT team discovered a security breach. Customer data may have been exposed. How do you respond?",
    category: "crisis",
    decisions: [
      {
        id: "5a",
        text: "Immediate public disclosure",
        effects: { cash: -100000, reputation: 20, employees: 0, assets: 0 },
        outcome: "Transparency was appreciated. Customers trust you more despite the incident.",
        risk: "medium",
      },
      {
        id: "5b",
        text: "Investigate first, then disclose",
        effects: { cash: -75000, reputation: 5, employees: 0, assets: 0 },
        outcome: "You gathered facts before speaking. Some criticized the delay, but response was measured.",
        risk: "medium",
      },
      {
        id: "5c",
        text: "Minimize and handle quietly",
        effects: { cash: -25000, reputation: -30, employees: -2, assets: 0 },
        outcome: "Word got out anyway. The cover-up attempt damaged trust severely.",
        risk: "high",
      },
    ],
  },
  {
    id: 6,
    title: "Partnership Opportunity",
    description: "A larger company wants to partner on a joint venture. They'll provide resources, you provide expertise.",
    category: "finance",
    decisions: [
      {
        id: "6a",
        text: "Accept 50/50 partnership",
        effects: { cash: 100000, reputation: 15, employees: 3, assets: 20 },
        outcome: "Equal partnership brings resources and credibility. Collaboration is smooth.",
        risk: "medium",
      },
      {
        id: "6b",
        text: "Negotiate for 60/40 in your favor",
        effects: { cash: 50000, reputation: 20, employees: 2, assets: 15 },
        outcome: "Your negotiation skills impressed them. You maintain more control.",
        risk: "low",
      },
      {
        id: "6c",
        text: "Decline to stay independent",
        effects: { cash: 0, reputation: 10, employees: 0, assets: 0 },
        outcome: "You preserved independence but missed potential growth acceleration.",
        risk: "medium",
      },
    ],
  },
  {
    id: 7,
    title: "Expansion Decision",
    description: "Business is booming! You can expand to a new location or invest in your current one.",
    category: "operations",
    decisions: [
      {
        id: "7a",
        text: "Open second location",
        effects: { cash: -150000, reputation: 15, employees: 5, assets: 40 },
        outcome: "New location is thriving! Your brand is now recognized in two markets.",
        risk: "high",
      },
      {
        id: "7b",
        text: "Expand current facility",
        effects: { cash: -80000, reputation: 10, employees: 3, assets: 25 },
        outcome: "Increased capacity at lower risk. Existing customers appreciate improved service.",
        risk: "low",
      },
      {
        id: "7c",
        text: "Invest in e-commerce instead",
        effects: { cash: -40000, reputation: 20, employees: 2, assets: 15 },
        outcome: "Online sales exploded! You're now reaching customers nationwide.",
        risk: "medium",
      },
    ],
  },
  {
    id: 8,
    title: "Talent Acquisition",
    description: "A highly skilled professional is available but demands top-tier compensation. Your budget is tight.",
    category: "hr",
    decisions: [
      {
        id: "8a",
        text: "Hire at full asking price",
        effects: { cash: -80000, reputation: 10, employees: 2, assets: 0 },
        outcome: "Their expertise immediately elevated your team's capabilities.",
        risk: "medium",
      },
      {
        id: "8b",
        text: "Offer lower salary with performance bonuses",
        effects: { cash: -50000, reputation: 15, employees: 2, assets: 0 },
        outcome: "They accepted! Motivated by bonuses, they're exceeding all targets.",
        risk: "low",
      },
      {
        id: "8c",
        text: "Pass and train existing staff",
        effects: { cash: -20000, reputation: 5, employees: 0, assets: 0 },
        outcome: "Slower progress but team morale improved from investment in their growth.",
        risk: "low",
      },
    ],
  },
  {
    id: 9,
    title: "Pricing Strategy",
    description: "Competitors are undercutting your prices. Sales are declining. What's your response?",
    category: "marketing",
    decisions: [
      {
        id: "9a",
        text: "Match competitor prices",
        effects: { cash: -30000, reputation: -5, employees: 0, assets: 0 },
        outcome: "You stopped the bleeding but margins are razor thin now.",
        risk: "high",
      },
      {
        id: "9b",
        text: "Emphasize premium quality",
        effects: { cash: -15000, reputation: 20, employees: 0, assets: 0 },
        outcome: "Repositioning worked! Customers willing to pay more for quality.",
        risk: "medium",
      },
      {
        id: "9c",
        text: "Add value-added services",
        effects: { cash: -25000, reputation: 25, employees: 1, assets: 0 },
        outcome: "Bundled services differentiated you. Customers love the complete solution.",
        risk: "low",
      },
    ],
  },
  {
    id: 10,
    title: "Economic Downturn",
    description: "A recession is hitting. Revenue is down 30%. You need to make tough decisions.",
    category: "crisis",
    decisions: [
      {
        id: "10a",
        text: "Lay off 20% of staff",
        effects: { cash: 50000, reputation: -15, employees: -4, assets: 0 },
        outcome: "Painful but necessary. Company survived but morale is low.",
        risk: "medium",
      },
      {
        id: "10b",
        text: "Reduce hours across the board",
        effects: { cash: 30000, reputation: 10, employees: 0, assets: 0 },
        outcome: "Everyone sacrificed together. Team unity strengthened through adversity.",
        risk: "low",
      },
      {
        id: "10c",
        text: "Pivot to recession-proof services",
        effects: { cash: -40000, reputation: 15, employees: 0, assets: 10 },
        outcome: "Risky pivot paid off! New services are actually growing during downturn.",
        risk: "high",
      },
    ],
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  finance: <DollarSign className="w-5 h-5" />,
  hr: <Users className="w-5 h-5" />,
  marketing: <Target className="w-5 h-5" />,
  operations: <Building2 className="w-5 h-5" />,
  crisis: <AlertTriangle className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  finance: "bg-green-100 text-green-800 border-green-200",
  hr: "bg-blue-100 text-blue-800 border-blue-200",
  marketing: "bg-purple-100 text-purple-800 border-purple-200",
  operations: "bg-orange-100 text-orange-800 border-orange-200",
  crisis: "bg-red-100 text-red-800 border-red-200",
};

const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

type GameState = "menu" | "playing" | "result";

interface GameStats {
  cash: number;
  reputation: number;
  employees: number;
  assets: number;
}

export default function BusinessTycoonGame() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [turn, setTurn] = useState(1);
  const [stats, setStats] = useState<GameStats>({
    cash: 100000,
    reputation: 50,
    employees: 5,
    assets: 20,
  });
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [history, setHistory] = useState<{ scenario: Scenario; decision: Decision }[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const maxTurns = 10;

  // Shuffle scenarios for each game
  const gameScenarios = useMemo(() => {
    return [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, maxTurns);
  }, [gameState]);

  const currentScenario = gameScenarios[currentScenarioIndex];

  // Leaderboard queries
  const { data: topScores, refetch: refetchLeaderboard } = trpc.leaderboard.getTopScores.useQuery(
    { gameType: "business-tycoon", limit: 10 },
    { enabled: showLeaderboard || gameState === "result" }
  );

  const submitScoreMutation = trpc.leaderboard.submitScore.useMutation({
    onSuccess: () => {
      refetchLeaderboard();
      toast.success("Score submitted to leaderboard!");
    },
    onError: () => {
      // Silently fail - user might not be logged in
    },
  });

  const calculateFinalScore = () => {
    return Math.floor(
      stats.cash / 1000 +
      stats.reputation * 100 +
      stats.employees * 500 +
      stats.assets * 200
    );
  };

  const startGame = () => {
    setGameState("playing");
    setTurn(1);
    setStats({ cash: 100000, reputation: 50, employees: 5, assets: 20 });
    setCurrentScenarioIndex(0);
    setSelectedDecision(null);
    setShowOutcome(false);
    setHistory([]);
  };

  const handleDecision = (decision: Decision) => {
    setSelectedDecision(decision);
    setShowOutcome(true);

    // Apply effects
    setStats((prev) => ({
      cash: Math.max(0, prev.cash + decision.effects.cash),
      reputation: Math.max(0, Math.min(100, prev.reputation + decision.effects.reputation)),
      employees: Math.max(0, prev.employees + decision.effects.employees),
      assets: Math.max(0, prev.assets + decision.effects.assets),
    }));

    // Record history
    setHistory((prev) => [...prev, { scenario: currentScenario, decision }]);
  };

  const nextTurn = () => {
    if (turn >= maxTurns || stats.cash <= 0) {
      // Game over
      setGameState("result");
      const finalScore = calculateFinalScore();
      submitScoreMutation.mutate({
        gameType: "business-tycoon",
        score: finalScore,
        difficulty: "mixed",
        correctAnswers: history.filter((h) => h.decision.risk !== "high").length,
        totalQuestions: maxTurns,
        maxStreak: 0,
        tokensEarned: Math.floor(finalScore / 100),
      });
      return;
    }

    setTurn((prev) => prev + 1);
    setCurrentScenarioIndex((prev) => prev + 1);
    setSelectedDecision(null);
    setShowOutcome(false);
  };

  const renderMenu = () => (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Business Tycoon Simulator</h1>
        <p className="text-lg text-muted-foreground">
          Build your empire through strategic decisions. Navigate challenges, seize opportunities, and grow your business!
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How to Play</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">10 Turns</p>
              <p className="text-muted-foreground">Make strategic decisions each turn</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">Manage Resources</p>
              <p className="text-muted-foreground">Balance cash, reputation, staff & assets</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">Strategic Choices</p>
              <p className="text-muted-foreground">Each decision has consequences</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Maximize Score</p>
              <p className="text-muted-foreground">Grow your business empire</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Starting Resources</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-700">$100K</p>
            <p className="text-xs text-muted-foreground">Cash</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-700">50</p>
            <p className="text-xs text-muted-foreground">Reputation</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-700">5</p>
            <p className="text-xs text-muted-foreground">Employees</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Building2 className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-700">20</p>
            <p className="text-xs text-muted-foreground">Assets</p>
          </div>
        </div>
      </Card>

      <div className="text-center space-y-4">
        <Button
          size="lg"
          className="h-16 px-12 text-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          onClick={startGame}
        >
          <Play className="w-6 h-6 mr-2" />
          Start Your Empire
        </Button>

        <div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="gap-2"
          >
            <Trophy className="w-5 h-5 text-yellow-500" />
            {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
          </Button>
        </div>
      </div>

      {showLeaderboard && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Top Business Tycoons</h2>
          </div>
          {topScores && topScores.length > 0 ? (
            <div className="space-y-2">
              {topScores.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0
                      ? "bg-yellow-50 border border-yellow-200"
                      : index === 1
                      ? "bg-gray-50 border border-gray-200"
                      : index === 2
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                      {index === 0 ? (
                        <Crown className="w-6 h-6 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-gray-400" />
                      ) : index === 2 ? (
                        <Award className="w-6 h-6 text-orange-400" />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </span>
                    <div>
                      <p className="font-medium">{entry.playerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.tokensEarned} tokens earned
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">{entry.score.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No tycoons yet. Be the first to build an empire!
            </p>
          )}
        </Card>
      )}
    </div>
  );

  const renderPlaying = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-muted-foreground">Cash</span>
          </div>
          <p className={`text-2xl font-bold ${stats.cash < 20000 ? "text-red-600" : "text-green-600"}`}>
            ${stats.cash.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-muted-foreground">Reputation</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.reputation}/100</p>
          <Progress value={stats.reputation} className="h-2 mt-2" />
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-muted-foreground">Employees</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.employees}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-muted-foreground">Assets</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.assets}</p>
        </Card>
      </div>

      {/* Turn Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Turn {turn} of {maxTurns}
        </Badge>
        <Progress value={(turn / maxTurns) * 100} className="w-1/2 h-3" />
        <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600">
          Score: {calculateFinalScore().toLocaleString()}
        </Badge>
      </div>

      {/* Scenario Card */}
      <Card className="overflow-hidden">
        <div className={`p-4 ${categoryColors[currentScenario.category]} border-b`}>
          <div className="flex items-center gap-2">
            {categoryIcons[currentScenario.category]}
            <span className="font-semibold capitalize">{currentScenario.category}</span>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">{currentScenario.title}</CardTitle>
          <CardDescription className="text-lg">{currentScenario.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showOutcome ? (
            <div className="space-y-3">
              <p className="font-medium text-muted-foreground">Choose your approach:</p>
              {currentScenario.decisions.map((decision) => (
                <Button
                  key={decision.id}
                  variant="outline"
                  className="w-full h-auto p-4 justify-start text-left"
                  onClick={() => handleDecision(decision)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-1">
                      <p className="font-medium">{decision.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={riskColors[decision.risk]} variant="secondary">
                          {decision.risk} risk
                        </Badge>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {decision.effects.cash !== 0 && (
                            <span className={decision.effects.cash > 0 ? "text-green-600" : "text-red-600"}>
                              {decision.effects.cash > 0 ? "+" : ""}${Math.abs(decision.effects.cash / 1000)}K
                            </span>
                          )}
                          {decision.effects.reputation !== 0 && (
                            <span className={decision.effects.reputation > 0 ? "text-blue-600" : "text-red-600"}>
                              {decision.effects.reputation > 0 ? "+" : ""}{decision.effects.reputation} rep
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Your Decision: {selectedDecision?.text}</p>
                    <p className="text-muted-foreground">{selectedDecision?.outcome}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {selectedDecision && (
                  <>
                    <div className={`p-2 rounded ${selectedDecision.effects.cash >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                      <p className={`font-bold ${selectedDecision.effects.cash >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {selectedDecision.effects.cash >= 0 ? "+" : ""}${(selectedDecision.effects.cash / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-muted-foreground">Cash</p>
                    </div>
                    <div className={`p-2 rounded ${selectedDecision.effects.reputation >= 0 ? "bg-blue-50" : "bg-red-50"}`}>
                      <p className={`font-bold ${selectedDecision.effects.reputation >= 0 ? "text-blue-600" : "text-red-600"}`}>
                        {selectedDecision.effects.reputation >= 0 ? "+" : ""}{selectedDecision.effects.reputation}
                      </p>
                      <p className="text-xs text-muted-foreground">Reputation</p>
                    </div>
                    <div className={`p-2 rounded ${selectedDecision.effects.employees >= 0 ? "bg-purple-50" : "bg-red-50"}`}>
                      <p className={`font-bold ${selectedDecision.effects.employees >= 0 ? "text-purple-600" : "text-red-600"}`}>
                        {selectedDecision.effects.employees >= 0 ? "+" : ""}{selectedDecision.effects.employees}
                      </p>
                      <p className="text-xs text-muted-foreground">Employees</p>
                    </div>
                    <div className={`p-2 rounded ${selectedDecision.effects.assets >= 0 ? "bg-orange-50" : "bg-red-50"}`}>
                      <p className={`font-bold ${selectedDecision.effects.assets >= 0 ? "text-orange-600" : "text-red-600"}`}>
                        {selectedDecision.effects.assets >= 0 ? "+" : ""}{selectedDecision.effects.assets}
                      </p>
                      <p className="text-xs text-muted-foreground">Assets</p>
                    </div>
                  </>
                )}
              </div>

              <Button className="w-full" size="lg" onClick={nextTurn}>
                {turn >= maxTurns ? "See Final Results" : "Next Challenge"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderResult = () => {
    const finalScore = calculateFinalScore();
    const grade =
      finalScore >= 500000 ? "S" :
      finalScore >= 300000 ? "A" :
      finalScore >= 200000 ? "B" :
      finalScore >= 100000 ? "C" :
      finalScore >= 50000 ? "D" : "F";

    const gradeColors: Record<string, string> = {
      S: "text-yellow-500",
      A: "text-green-500",
      B: "text-blue-500",
      C: "text-purple-500",
      D: "text-orange-500",
      F: "text-red-500",
    };

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Empire Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Your business journey has concluded. Here's how you performed:
          </p>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Final Score</p>
            <p className="text-6xl font-bold text-blue-600">{finalScore.toLocaleString()}</p>
            <p className={`text-4xl font-bold mt-2 ${gradeColors[grade]}`}>Grade: {grade}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">${stats.cash.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Final Cash</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{stats.reputation}</p>
              <p className="text-sm text-muted-foreground">Reputation</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">{stats.employees}</p>
              <p className="text-sm text-muted-foreground">Employees</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Building2 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">{stats.assets}</p>
              <p className="text-sm text-muted-foreground">Assets</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Decision History</h3>
            {history.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="secondary">{index + 1}</Badge>
                <div className="flex-1">
                  <p className="font-medium">{item.scenario.title}</p>
                  <p className="text-sm text-muted-foreground">{item.decision.text}</p>
                </div>
                <Badge className={riskColors[item.decision.risk]}>{item.decision.risk}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={startGame} className="gap-2">
            <RotateCcw className="w-5 h-5" />
            Play Again
          </Button>
          <Button size="lg" variant="outline" onClick={() => setGameState("menu")} className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {gameState === "menu" && renderMenu()}
        {gameState === "playing" && renderPlaying()}
        {gameState === "result" && renderResult()}
      </div>
    </DashboardLayout>
  );
}
