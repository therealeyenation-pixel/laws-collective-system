import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Merge,
  Split,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  Milestone,
  Shield,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Crown,
  Sparkles,
  AlertTriangle,
  Info,
  Calculator,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Home,
  Heart,
  Scale,
  PiggyBank
} from "lucide-react";
import { Link } from "wouter";

interface PathConvergenceProps {
  currentPath: "ward" | "trust";
  currentAge: number;
  wardNetWorth: number;
  trustNetWorth: number;
  onStartBusinessJourney?: () => void;
}

// Convergence milestones - steps both paths must complete
const CONVERGENCE_STEPS = [
  {
    id: "awareness",
    name: "Financial Awareness",
    description: "Understanding the need for asset protection and business structure",
    wardAge: 35,
    trustAge: 12,
    icon: GraduationCap,
  },
  {
    id: "education",
    name: "Business Education",
    description: "Learning about LLCs, trusts, and entity structures",
    wardAge: 38,
    trustAge: 14,
    icon: BookOpen,
  },
  {
    id: "first-entity",
    name: "First Entity Formation",
    description: "Creating the first LLC or business structure",
    wardAge: 40,
    trustAge: 18,
    icon: Building2,
  },
  {
    id: "trust-creation",
    name: "Trust Establishment",
    description: "Setting up protective trust structure",
    wardAge: 42,
    trustAge: 0, // Already has at birth
    icon: Shield,
  },
  {
    id: "asset-protection",
    name: "Asset Protection Layer",
    description: "Moving assets into protected structures",
    wardAge: 45,
    trustAge: 0, // Already protected
    icon: Scale,
  },
  {
    id: "passive-income",
    name: "Passive Income Streams",
    description: "Developing income that doesn't require active work",
    wardAge: 50,
    trustAge: 25,
    icon: DollarSign,
  },
  {
    id: "generational-planning",
    name: "Generational Planning",
    description: "Setting up structures for wealth transfer",
    wardAge: 55,
    trustAge: 30,
    icon: Users,
  },
  {
    id: "sovereignty",
    name: "Financial Sovereignty",
    description: "Achieving independence from employment income",
    wardAge: 60,
    trustAge: 35,
    icon: Crown,
  },
];

// Catch-up calculator
const calculateCatchUp = (currentAge: number, wardNetWorth: number, trustNetWorth: number) => {
  const gap = trustNetWorth - wardNetWorth;
  const yearsToRetirement = Math.max(0, 65 - currentAge);
  
  if (yearsToRetirement === 0) return { monthlyRequired: 0, yearlyRequired: 0, feasible: false };
  
  // Calculate required monthly savings to close gap (assuming 8% return)
  const monthlyRate = 0.08 / 12;
  const months = yearsToRetirement * 12;
  
  // PMT formula: PMT = FV * r / ((1+r)^n - 1)
  const monthlyRequired = gap * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  const yearlyRequired = monthlyRequired * 12;
  
  // Feasibility check (less than 50% of typical income)
  const feasible = yearlyRequired < 60000; // Assuming $120k income, 50% savings rate max
  
  return {
    monthlyRequired: Math.round(monthlyRequired),
    yearlyRequired: Math.round(yearlyRequired),
    feasible,
    yearsToClose: yearsToRetirement,
    gap,
  };
};

// Action steps based on current situation
const getActionSteps = (currentPath: "ward" | "trust", currentAge: number) => {
  if (currentPath === "trust") {
    return [
      { step: "Continue trust-based wealth building", priority: "maintain" },
      { step: "Expand business holdings through LLC structure", priority: "grow" },
      { step: "Develop additional passive income streams", priority: "grow" },
      { step: "Plan generational transfer strategies", priority: "plan" },
    ];
  }
  
  // Ward path - depends on age
  if (currentAge < 30) {
    return [
      { step: "Establish emergency fund (3-6 months expenses)", priority: "immediate" },
      { step: "Begin financial education on entity structures", priority: "immediate" },
      { step: "Start side business to learn entrepreneurship", priority: "short-term" },
      { step: "Research LLC formation in your state", priority: "short-term" },
    ];
  } else if (currentAge < 45) {
    return [
      { step: "Form first LLC immediately", priority: "immediate" },
      { step: "Consult with asset protection attorney", priority: "immediate" },
      { step: "Begin trust planning process", priority: "short-term" },
      { step: "Move existing assets into protected structures", priority: "short-term" },
      { step: "Develop business income to reduce W-2 dependency", priority: "medium-term" },
    ];
  } else if (currentAge < 60) {
    return [
      { step: "Accelerate business formation", priority: "immediate" },
      { step: "Establish irrevocable trust for asset protection", priority: "immediate" },
      { step: "Maximize retirement contributions", priority: "immediate" },
      { step: "Create multiple income streams urgently", priority: "short-term" },
      { step: "Begin generational planning now", priority: "short-term" },
    ];
  } else {
    return [
      { step: "Focus on asset protection for existing wealth", priority: "immediate" },
      { step: "Establish trust to avoid probate", priority: "immediate" },
      { step: "Plan efficient wealth transfer to heirs", priority: "immediate" },
      { step: "Consider life insurance for estate liquidity", priority: "short-term" },
    ];
  }
};

const BookOpen = GraduationCap; // Alias for consistency

export default function PathConvergence({
  currentPath,
  currentAge,
  wardNetWorth,
  trustNetWorth,
  onStartBusinessJourney,
}: PathConvergenceProps) {
  const [selectedTab, setSelectedTab] = useState("timeline");
  
  const catchUp = calculateCatchUp(currentAge, wardNetWorth, trustNetWorth);
  const actionSteps = getActionSteps(currentPath, currentAge);
  
  // Calculate progress through convergence steps
  const completedSteps = CONVERGENCE_STEPS.filter(step => {
    const targetAge = currentPath === "ward" ? step.wardAge : step.trustAge;
    return currentAge >= targetAge;
  }).length;
  
  const progressPercent = (completedSteps / CONVERGENCE_STEPS.length) * 100;
  
  return (
    <div className="space-y-6">
      {/* Convergence Header */}
      <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Merge className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Path Convergence Point</h2>
              <p className="text-muted-foreground">
                Both paths lead to the same destination - financial sovereignty through business and trust structures
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Your Path</p>
              <p className="text-lg font-bold flex items-center justify-center gap-2">
                {currentPath === "ward" ? (
                  <>
                    <User className="w-4 h-4 text-red-600" />
                    <span className="text-red-600">Birth-Ward</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Birth-Trust</span>
                  </>
                )}
              </p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Current Age</p>
              <p className="text-lg font-bold">{currentAge}</p>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Journey Progress</p>
              <p className="text-lg font-bold">{Math.round(progressPercent)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="catchup">Catch-Up Plan</TabsTrigger>
          <TabsTrigger value="actions">Action Steps</TabsTrigger>
          <TabsTrigger value="message">Key Message</TabsTrigger>
        </TabsList>
        
        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Milestone className="w-5 h-5" />
                Convergence Timeline
              </CardTitle>
              <CardDescription>
                When each milestone is typically reached on each path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {CONVERGENCE_STEPS.map((step, idx) => {
                  const wardCompleted = currentPath === "ward" && currentAge >= step.wardAge;
                  const trustCompleted = currentPath === "trust" && currentAge >= step.trustAge;
                  const isCompleted = currentPath === "ward" ? wardCompleted : trustCompleted;
                  const targetAge = currentPath === "ward" ? step.wardAge : step.trustAge;
                  
                  return (
                    <div 
                      key={step.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'border-border'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-secondary'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <step.icon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{step.name}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-red-600">
                              Ward: Age {step.wardAge}
                            </Badge>
                            <Badge variant="outline" className="text-green-600">
                              Trust: {step.trustAge === 0 ? "Birth" : `Age ${step.trustAge}`}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {!isCompleted && targetAge > 0 && (
                          <p className="text-xs text-amber-600 mt-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {targetAge - currentAge} years until you reach this milestone
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Age Gap Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone Age Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CONVERGENCE_STEPS.map((step) => {
                  const ageGap = step.wardAge - step.trustAge;
                  return (
                    <div key={step.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{step.name}</span>
                        <span className="text-amber-600">{ageGap} year head start</span>
                      </div>
                      <div className="flex gap-1 h-6">
                        <div 
                          className="bg-green-500 rounded-l flex items-center justify-center text-xs text-white"
                          style={{ width: `${(step.trustAge / 65) * 100}%` }}
                        >
                          {step.trustAge > 0 && step.trustAge}
                        </div>
                        <div 
                          className="bg-amber-500 flex items-center justify-center text-xs text-white"
                          style={{ width: `${(ageGap / 65) * 100}%` }}
                        >
                          +{ageGap}
                        </div>
                        <div 
                          className="bg-red-500 rounded-r flex items-center justify-center text-xs text-white"
                          style={{ width: `${((65 - step.wardAge) / 65) * 100}%` }}
                        >
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Trust achieves</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span>Head start gap</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Ward catches up</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Catch-Up Plan Tab */}
        <TabsContent value="catchup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Catch-Up Calculator
              </CardTitle>
              <CardDescription>
                What it takes to close the wealth gap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ward Net Worth</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${wardNetWorth.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Trust Net Worth</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${trustNetWorth.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Wealth Gap</p>
                <p className="text-3xl font-bold text-amber-600">
                  ${catchUp.gap.toLocaleString()}
                </p>
              </div>
              
              {currentPath === "ward" && (
                <div className="space-y-4">
                  <h4 className="font-semibold">To Close the Gap by Age 65:</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Savings Required</p>
                      <p className="text-2xl font-bold">
                        ${catchUp.monthlyRequired.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Years Remaining</p>
                      <p className="text-2xl font-bold">{catchUp.yearsToClose}</p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    catchUp.feasible 
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200' 
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200'
                  } border`}>
                    <div className="flex items-start gap-3">
                      {catchUp.feasible ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {catchUp.feasible ? "Achievable with discipline" : "Challenging but possible"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {catchUp.feasible 
                            ? "This savings rate is achievable with focused effort and business income development."
                            : "This requires aggressive income growth and may need business ownership to achieve."}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h5 className="font-semibold mb-2">Better Strategy: Business Income</h5>
                    <p className="text-sm text-muted-foreground">
                      Rather than trying to save your way to wealth, focus on building business income. 
                      A business generating $50,000/year in profit, valued at 3x earnings, adds $150,000 
                      to your net worth while also providing ongoing income.
                    </p>
                  </div>
                </div>
              )}
              
              {currentPath === "trust" && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">You're on the optimal path</p>
                      <p className="text-sm text-muted-foreground">
                        Continue building within your trust structure. Focus on expanding business 
                        holdings and developing additional passive income streams.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Action Steps Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Action Steps
              </CardTitle>
              <CardDescription>
                Prioritized actions based on your current situation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actionSteps.map((action, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      action.priority === "immediate" ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                      action.priority === "short-term" ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20' :
                      action.priority === "medium-term" ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' :
                      'border-green-200 bg-green-50 dark:bg-green-950/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      action.priority === "immediate" ? 'bg-red-500 text-white' :
                      action.priority === "short-term" ? 'bg-amber-500 text-white' :
                      action.priority === "medium-term" ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{action.step}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {action.priority === "immediate" ? "Do Now" :
                         action.priority === "short-term" ? "This Quarter" :
                         action.priority === "medium-term" ? "This Year" :
                         action.priority === "grow" ? "Ongoing Growth" :
                         action.priority === "plan" ? "Strategic Planning" :
                         "Maintain"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {currentPath === "ward" && (
                <Button className="w-full mt-6" onClick={onStartBusinessJourney}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Start Your Business Formation Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Key Message Tab */}
        <TabsContent value="message" className="space-y-4">
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                
                <h2 className="text-3xl font-bold text-foreground">
                  It's Never Too Late
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  While starting with a trust provides significant advantages, the path to 
                  financial sovereignty is always open. Every journey begins with a single step.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Age 25-35</h4>
                    <p className="text-sm text-muted-foreground">
                      Optimal time to start. Maximum compound growth potential. 
                      30+ years to build generational wealth.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Age 35-50</h4>
                    <p className="text-sm text-muted-foreground">
                      Peak earning years. Accelerated wealth building possible. 
                      15-30 years to establish strong foundation.
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Age 50+</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on protection and transfer. Ensure next generation 
                      starts with trust advantage.
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg mt-8">
                  <h3 className="font-bold text-xl mb-3">The L.A.W.S. Promise</h3>
                  <p className="text-muted-foreground">
                    Regardless of where you start, the L.A.W.S. system provides the education, 
                    tools, and community support to help you build protective structures, 
                    develop business income, and create generational wealth. Your children 
                    and grandchildren can start their journey with the Birth-Trust advantage.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Button size="lg" asChild>
                    <Link href="/business-formation">
                      <Building2 className="w-5 h-5 mr-2" />
                      Start Business Formation
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/protection-layer">
                      <Shield className="w-5 h-5 mr-2" />
                      Build Protection Layer
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
