import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  BookOpen,
  DollarSign,
  Zap,
  TrendingUp,
  Lock,
  Users,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SimulatorState {
  active: boolean;
  type: string;
  title: string;
  turn: number;
  maxTurns: number;
  score: number;
  currentQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
  } | null;
}

const simulatorQuestions: Record<string, Array<{ question: string; options: string[]; correctIndex: number }>> = {
  business: [
    { question: "What is the primary purpose of a Family Trust?", options: ["Tax evasion", "Asset protection and wealth transfer", "Hiding money", "Avoiding creditors"], correctIndex: 1 },
    { question: "Which entity type provides limited liability protection?", options: ["Sole Proprietorship", "General Partnership", "LLC", "DBA"], correctIndex: 2 },
    { question: "What does 'sovereign' mean in the context of wealth building?", options: ["Being a king", "Self-governing and independent", "Having no rules", "Avoiding taxes"], correctIndex: 1 },
    { question: "What is the L.A.W.S. framework?", options: ["Legal documents", "Land, Air, Water, Self", "Lawyers and workers", "Laws of the state"], correctIndex: 1 },
    { question: "Why is multi-generational planning important?", options: ["To spend money faster", "To build lasting legacy", "To avoid responsibility", "To hide assets"], correctIndex: 1 },
    { question: "What role does the Trust play in the entity structure?", options: ["Marketing", "Governance and oversight", "Sales", "Customer service"], correctIndex: 1 },
    { question: "How are tokens used in the LuvOnPurpose system?", options: ["Cryptocurrency trading", "Tracking value and contributions", "Gambling", "Buying products"], correctIndex: 1 },
    { question: "What is a 508(c)(1)(a) organization?", options: ["For-profit company", "Tax-exempt religious/educational nonprofit", "Government agency", "Private bank"], correctIndex: 1 },
    { question: "What percentage should be allocated to education?", options: ["0%", "10%", "30%", "100%"], correctIndex: 2 },
    { question: "What is the purpose of the LuvLedger?", options: ["Social media", "Tracking all financial activities", "Gaming", "Email"], correctIndex: 1 },
    { question: "Why is blockchain verification important?", options: ["Speed", "Immutability and trust", "Cost savings", "Marketing"], correctIndex: 1 },
    { question: "What is the ultimate goal of the autonomous system?", options: ["Quick profits", "Multi-generational wealth and legacy", "Day trading", "Speculation"], correctIndex: 1 },
  ],
  financial: [
    { question: "What is asset allocation?", options: ["Spending all money", "Distributing investments across categories", "Saving nothing", "Borrowing money"], correctIndex: 1 },
    { question: "What percentage goes to the Commercial Engine?", options: ["10%", "20%", "30%", "40%"], correctIndex: 3 },
    { question: "What is the purpose of the Education Engine?", options: ["Entertainment", "Building knowledge and skills", "Gambling", "Speculation"], correctIndex: 1 },
    { question: "How does token economy work?", options: ["Random distribution", "Value-based earning and spending", "Government control", "Bank loans"], correctIndex: 1 },
    { question: "What is compound growth?", options: ["Linear increase", "Growth on growth over time", "Decrease", "Stagnation"], correctIndex: 1 },
    { question: "Why diversify across entities?", options: ["Confusion", "Risk management", "Tax evasion", "Hiding money"], correctIndex: 1 },
    { question: "What is passive income?", options: ["Working harder", "Earnings without active work", "Borrowing", "Spending"], correctIndex: 1 },
    { question: "How often should you review allocations?", options: ["Never", "Quarterly or annually", "Every hour", "Only when losing money"], correctIndex: 1 },
    { question: "What is the Media Engine's allocation?", options: ["10%", "20%", "30%", "40%"], correctIndex: 1 },
    { question: "What is the Platform Engine's allocation?", options: ["10%", "20%", "30%", "40%"], correctIndex: 0 },
    { question: "Why track all transactions on blockchain?", options: ["Speed", "Transparency and accountability", "Cost", "Fashion"], correctIndex: 1 },
    { question: "What is the goal of autonomous operations?", options: ["Replace humans", "Efficient, consistent execution", "Chaos", "Randomness"], correctIndex: 1 },
  ],
  operations: [
    { question: "What is governance in a trust structure?", options: ["Dictatorship", "Rules and decision-making processes", "Anarchy", "Randomness"], correctIndex: 1 },
    { question: "Who has final authority in the Trust?", options: ["Government", "Trustees/Beneficiaries", "Banks", "Random people"], correctIndex: 1 },
    { question: "What is an autonomous operation?", options: ["Manual work", "Self-executing business process", "Chaos", "Guessing"], correctIndex: 1 },
    { question: "Why is audit trail important?", options: ["Decoration", "Accountability and verification", "Confusion", "Hiding"], correctIndex: 1 },
    { question: "What is conflict resolution?", options: ["Fighting", "Resolving disagreements fairly", "Ignoring problems", "Running away"], correctIndex: 1 },
    { question: "How are decisions escalated?", options: ["Randomly", "Based on thresholds and rules", "Never", "Always"], correctIndex: 1 },
    { question: "What is the role of human oversight?", options: ["None", "Review and approve key decisions", "Do everything", "Ignore everything"], correctIndex: 1 },
    { question: "What triggers a governance review?", options: ["Nothing", "High-value or sensitive decisions", "Every decision", "Random"], correctIndex: 1 },
    { question: "How are policies enforced?", options: ["Hope", "Automated rules and checks", "Luck", "Guessing"], correctIndex: 1 },
    { question: "What is sovereignty protection?", options: ["Attack", "Preserving independence and control", "Surrender", "Chaos"], correctIndex: 1 },
    { question: "Why document all decisions?", options: ["Waste time", "Legal protection and learning", "Confusion", "Hiding"], correctIndex: 1 },
    { question: "What is the benefit of automation?", options: ["Laziness", "Consistency and efficiency", "Chaos", "Randomness"], correctIndex: 1 },
  ],
};

export default function Dashboard() {
  const { data: overview, isLoading } = trpc.luv.getSystemOverview.useQuery();
  const [simulator, setSimulator] = useState<SimulatorState>({
    active: false,
    type: "",
    title: "",
    turn: 0,
    maxTurns: 12,
    score: 0,
    currentQuestion: null,
  });

  const startSimulator = (type: string, title: string) => {
    const questions = simulatorQuestions[type];
    if (!questions || questions.length === 0) {
      toast.error("Simulator not available");
      return;
    }
    setSimulator({
      active: true,
      type,
      title,
      turn: 1,
      maxTurns: questions.length,
      score: 0,
      currentQuestion: questions[0],
    });
    toast.success(`Starting ${title}`);
  };

  const answerQuestion = (selectedIndex: number) => {
    if (!simulator.currentQuestion) return;
    
    const isCorrect = selectedIndex === simulator.currentQuestion.correctIndex;
    const newScore = isCorrect ? simulator.score + 10 : simulator.score;
    
    if (isCorrect) {
      toast.success("Correct! +10 tokens");
    } else {
      toast.error("Incorrect. The right answer was: " + simulator.currentQuestion.options[simulator.currentQuestion.correctIndex]);
    }

    const questions = simulatorQuestions[simulator.type];
    const nextTurn = simulator.turn + 1;

    if (nextTurn > simulator.maxTurns) {
      // Simulator complete
      setSimulator(prev => ({ ...prev, active: false, score: newScore }));
      toast.success(`Simulator Complete! You earned ${newScore} tokens!`, {
        duration: 5000,
      });
    } else {
      setSimulator(prev => ({
        ...prev,
        turn: nextTurn,
        score: newScore,
        currentQuestion: questions[nextTurn - 1],
      }));
    }
  };

  const exitSimulator = () => {
    setSimulator({
      active: false,
      type: "",
      title: "",
      turn: 0,
      maxTurns: 12,
      score: 0,
      currentQuestion: null,
    });
    toast.info("Simulator exited");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Zap className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  // Simulator active view
  if (simulator.active && simulator.currentQuestion) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Simulator Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={exitSimulator}
              className="gap-2 min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              Exit
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Turn {simulator.turn} of {simulator.maxTurns}</p>
              <p className="font-bold text-accent">{simulator.score} tokens</p>
            </div>
          </div>

          {/* Simulator Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">{simulator.title}</h1>
            <div className="w-full bg-secondary rounded-full h-2 mt-4">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${(simulator.turn / simulator.maxTurns) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {simulator.currentQuestion.question}
            </h2>
            <div className="space-y-3">
              {simulator.currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left min-h-[56px] p-4"
                  onClick={() => answerQuestion(index)}
                >
                  <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Score Display */}
          <Card className="p-4 bg-accent/10">
            <div className="flex items-center justify-center gap-4">
              <Trophy className="w-6 h-6 text-accent" />
              <span className="text-lg font-bold">Current Score: {simulator.score} tokens</span>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            LuvOnPurpose Sovereign System
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal gateway to autonomous wealth generation and multi-generational legacy building
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Business Entities</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.entitiesCount || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certificates</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.certificatesCount || 0}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LuvLedger Accounts</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.accountsCount || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trust Relationships</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.trustRelationshipsCount || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="entities" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="entities">Business Entities</TabsTrigger>
            <TabsTrigger value="simulators">Simulators</TabsTrigger>
            <TabsTrigger value="ledger">LuvLedger</TabsTrigger>
            <TabsTrigger value="trust">Trust Network</TabsTrigger>
          </TabsList>

          {/* Business Entities Tab */}
          <TabsContent value="entities" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Your Business Entities
              </h2>
              <Button className="gap-2">
                <Zap className="w-4 h-4" />
                Create Entity
              </Button>
            </div>

            {overview?.entities && overview.entities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.entities.map((entity) => (
                  <Card key={entity.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground">{entity.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {entity.entityType}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entity.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {entity.status}
                      </span>
                    </div>
                    {entity.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {entity.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No business entities yet. Create your first entity to get started.
                </p>
                <Button className="gap-2">
                  <Zap className="w-4 h-4" />
                  Create Your First Entity
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Simulators Tab */}
          <TabsContent value="simulators" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Interactive Simulators
              </h2>
              <Button className="gap-2">
                <Zap className="w-4 h-4" />
                Start Simulator
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Business Setup Simulator",
                  description: "Learn how to structure and activate your business entities",
                  icon: <Shield className="w-8 h-8" />,
                  turns: 12,
                },
                {
                  title: "Financial Management Simulator",
                  description: "Master the LuvLedger system and asset allocation",
                  icon: <DollarSign className="w-8 h-8" />,
                  turns: 12,
                },
                {
                  title: "Entity Operations Simulator",
                  description: "Understand multi-level trust and operational workflows",
                  icon: <Users className="w-8 h-8" />,
                  turns: 12,
                },
              ].map((sim, i) => (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="text-accent mb-4">{sim.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{sim.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {sim.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {sim.turns} turns
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[44px] min-w-[80px]"
                      onClick={() => startSimulator(
                        i === 0 ? "business" : i === 1 ? "financial" : "operations",
                        sim.title
                      )}
                    >
                      Start
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {overview?.certificatesCount && overview.certificatesCount > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-foreground mb-4">Your Certificates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.certificates?.map((cert) => (
                    <Card key={cert.id} className="p-4 border-l-4 border-l-accent">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {cert.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Issued {new Date(cert.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* LuvLedger Tab */}
          <TabsContent value="ledger" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">
              LuvLedger - Automated Asset Management
            </h2>

            {overview?.accounts && overview.accounts.length > 0 ? (
              <div className="space-y-4">
                {overview.accounts.map((account) => (
                  <Card key={account.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground">
                          {account.accountName}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.accountType} Account
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {account.balance}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.allocationPercentage}% allocation
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Transactions
                      </Button>
                      <Button variant="outline" size="sm">
                        Manage Allocation
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No LuvLedger accounts yet. Create a business entity to initialize your accounts.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Trust Network Tab */}
          <TabsContent value="trust" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">
              Multi-Level Trust Network
            </h2>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Trust Hierarchy
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your multi-level trust structure enables secure delegation of authority and resource management across your business entities and collective relationships.
                  </p>
                </div>
              </div>
            </Card>

            {overview?.trusts && overview.trusts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview.trusts.map((trust) => (
                  <Card key={trust.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-foreground">
                        Trust Level {trust.trustLevel}
                      </h3>
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Relationship ID: {trust.id}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No trust relationships established yet.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
