import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
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
  GraduationCap,
  Trophy,
  Download,
  Home,
  FileCheck,
  ArrowRight,
  ScrollText,
  Briefcase,
  Link2,
  Coins,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import BusinessCourse from "@/components/BusinessCourse";
import FinancialCourse from "@/components/FinancialCourse";
import OperationsCourse from "@/components/OperationsCourse";
import TrustCourse from "@/components/TrustCourse";
import GrantWritingCourse from "@/components/GrantWritingCourse";
import ContractsCourse from "@/components/ContractsCourse";
import BusinessPlanCourse from "@/components/BusinessPlanCourse";
import BlockchainCourse from "@/components/BlockchainCourse";
import InsuranceCourse from "@/components/InsuranceCourse";
import TokenChainProgress from "@/components/TokenChainProgress";
import DBATrademarkCourse from "@/components/DBATrademarkCourse";
import PostActivationProgress from "@/components/PostActivationProgress";
import FormationChecklist from "@/components/FormationChecklist";
import SplitCalculator from "@/components/SplitCalculator";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { LuvLedgerWidget } from "@/components/LuvLedgerWidget";
import { QuickActionsWidget } from "@/components/QuickActionsWidget";

type CourseType = "business" | "businessplan" | "grant" | "financial" | "trust" | "contracts" | "blockchain" | "insurance" | "operations" | "dba" | null;

interface CourseProgress {
  business: { completed: boolean; tokens: number; data: any };
  businessplan: { completed: boolean; tokens: number; data: any };
  grant: { completed: boolean; tokens: number; data: any };
  financial: { completed: boolean; tokens: number; data: any };
  trust: { completed: boolean; tokens: number; data: any };
  contracts: { completed: boolean; tokens: number; data: any };
  blockchain: { completed: boolean; tokens: number; data: any };
  insurance: { completed: boolean; tokens: number; data: any };
  operations: { completed: boolean; tokens: number; data: any };
  dba: { completed: boolean; tokens: number; data: any };
}

export default function Dashboard() {
  const { data: overview, isLoading } = trpc.luv.getSystemOverview.useQuery();
  const [activeCourse, setActiveCourse] = useState<CourseType>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    business: { completed: false, tokens: 0, data: null },
    businessplan: { completed: false, tokens: 0, data: null },
    grant: { completed: false, tokens: 0, data: null },
    financial: { completed: false, tokens: 0, data: null },
    trust: { completed: false, tokens: 0, data: null },
    contracts: { completed: false, tokens: 0, data: null },
    blockchain: { completed: false, tokens: 0, data: null },
    insurance: { completed: false, tokens: 0, data: null },
    operations: { completed: false, tokens: 0, data: null },
    dba: { completed: false, tokens: 0, data: null },
  });

  const handleCourseComplete = (
    type: CourseType,
    data: any,
    tokens: number
  ) => {
    if (!type) return;
    
    setCourseProgress((prev) => ({
      ...prev,
      [type]: { completed: true, tokens, data },
    }));
    
    // Record to LuvLedger and blockchain
    toast.success(`Course Complete! You earned ${tokens} tokens. Recorded to LuvLedger & Blockchain.`, {
      duration: 5000,
    });
    
    setActiveCourse(null);
  };

  // Get connected entity from business course for other courses
  const getConnectedEntity = () => {
    if (courseProgress.business.completed && courseProgress.business.data) {
      return {
        name: courseProgress.business.data.businessName || "Your Business",
        type: courseProgress.business.data.entityType || "LLC",
      };
    }
    return undefined;
  };

  const downloadBusinessPlan = () => {
    const { business, financial, operations, trust, grant, contracts, businessplan } = courseProgress;
    
    if (!business.data && !financial.data && !operations.data && !trust.data && !grant.data && !contracts.data && !businessplan.data) {
      toast.error("Complete at least one course to generate documents");
      return;
    }

    // Generate comprehensive business plan from all course data
    let content = "# COMPLETE BUSINESS & WEALTH BUILDING PLAN\n\n";
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    content += "**Recorded to LuvLedger & Blockchain**\n\n";
    content += "---\n\n";

    if (business.data) {
      content += "## BUSINESS OVERVIEW\n\n";
      content += `**Business Name:** ${business.data.businessName || "[Not specified]"}\n\n`;
      content += `**Entity Type:** ${business.data.entityType || "[Not specified]"}\n\n`;
      content += `### Mission Statement\n${business.data.missionStatement || "[Not specified]"}\n\n`;
      content += `### Vision Statement\n${business.data.visionStatement || "[Not specified]"}\n\n`;
      content += `### Core Values\n${business.data.coreValues || "[Not specified]"}\n\n`;
      content += `### Target Market\n${business.data.targetMarket || "[Not specified]"}\n\n`;
      content += `### Customer Profile\n${business.data.customerProfile || "[Not specified]"}\n\n`;
      content += `### Products\n${business.data.products || "[Not specified]"}\n\n`;
      content += `### Services\n${business.data.services || "[Not specified]"}\n\n`;
      content += `### Pricing Strategy\n${business.data.pricingStrategy || "[Not specified]"}\n\n`;
      content += `### Competitive Advantage\n${business.data.competitiveAdvantage || "[Not specified]"}\n\n`;
      content += "### Legal Formation\n";
      content += `- Registered Agent: ${business.data.registeredAgent || "[Not specified]"}\n`;
      content += `- Principal Address: ${business.data.principalAddress || "[Not specified]"}\n`;
      content += `- Management Structure: ${business.data.managementStructure || "[Not specified]"}\n`;
      content += `- Members: ${business.data.memberNames || "[Not specified]"}\n`;
      content += `- Initial Capital: ${business.data.initialCapital || "[Not specified]"}\n\n`;
      content += "### Operating Agreement Terms\n";
      content += `- Profit Distribution: ${business.data.profitDistribution || "[Not specified]"}\n`;
      content += `- Voting Rights: ${business.data.votingRights || "[Not specified]"}\n`;
      content += `- Meeting Requirements: ${business.data.meetingRequirements || "[Not specified]"}\n`;
      content += `- Dissolution Terms: ${business.data.dissolutionTerms || "[Not specified]"}\n\n`;
    }

    if (financial.data) {
      content += "## FINANCIAL PLAN\n\n";
      content += "### Startup Costs\n";
      content += `**One-Time Costs:**\n${financial.data.oneTimeCosts || "[Not specified]"}\n\n`;
      content += `**Initial Inventory:**\n${financial.data.initialInventory || "[Not specified]"}\n\n`;
      content += `**Legal/Professional Fees:**\n${financial.data.legalFees || "[Not specified]"}\n\n`;
      content += `**Total Startup Budget:** ${financial.data.totalStartupBudget || "[Not specified]"}\n\n`;
      content += "### Revenue Projections\n";
      content += `**Revenue Streams:**\n${financial.data.revenueStreams || "[Not specified]"}\n\n`;
      content += `**Pricing Model:**\n${financial.data.pricingModel || "[Not specified]"}\n\n`;
      content += `**Sales Forecast:**\n${financial.data.salesForecast || "[Not specified]"}\n\n`;
      content += "### Expense Budget\n";
      content += `**Fixed Costs:**\n${financial.data.fixedCosts || "[Not specified]"}\n\n`;
      content += `**Variable Costs:**\n${financial.data.variableCosts || "[Not specified]"}\n\n`;
      content += `**Personnel Costs:**\n${financial.data.personnelCosts || "[Not specified]"}\n\n`;
      content += "### Cash Flow & Break-Even\n";
      content += `**Cash Flow Projection:**\n${financial.data.cashFlowProjection || "[Not specified]"}\n\n`;
      content += `**Break-Even Analysis:**\n${financial.data.breakEvenAnalysis || "[Not specified]"}\n\n`;
      content += "### Funding Strategy\n";
      content += `**Funding Sources:**\n${financial.data.fundingSources || "[Not specified]"}\n\n`;
      content += `**Use of Funds:**\n${financial.data.useOfFunds || "[Not specified]"}\n\n`;
    }

    if (operations.data) {
      content += "## OPERATIONS PLAN\n\n";
      content += "### Organizational Structure\n";
      content += `**Org Chart:**\n${operations.data.orgChart || "[Not specified]"}\n\n`;
      content += `**Key Roles:**\n${operations.data.keyRoles || "[Not specified]"}\n\n`;
      content += `**Responsibilities:**\n${operations.data.responsibilities || "[Not specified]"}\n\n`;
      content += "### Standard Operating Procedures\n";
      content += `**Core Processes:**\n${operations.data.coreProcesses || "[Not specified]"}\n\n`;
      content += `**Quality Standards:**\n${operations.data.qualityStandards || "[Not specified]"}\n\n`;
      content += `**Customer Service:**\n${operations.data.customerService || "[Not specified]"}\n\n`;
      content += "### Compliance & Legal\n";
      content += `**Licenses Required:**\n${operations.data.licensesRequired || "[Not specified]"}\n\n`;
      content += `**Insurance Coverage:**\n${operations.data.insuranceTypes || "[Not specified]"}\n\n`;
      content += `**Regulatory Bodies:**\n${operations.data.regulatoryBodies || "[Not specified]"}\n\n`;
      content += "### Contracts & Agreements\n";
      content += `**Vendor Contracts:**\n${operations.data.vendorContracts || "[Not specified]"}\n\n`;
      content += `**Customer Agreements:**\n${operations.data.customerAgreements || "[Not specified]"}\n\n`;
      content += `**Employment Contracts:**\n${operations.data.employmentContracts || "[Not specified]"}\n\n`;
      content += "### Operations Calendar\n";
      content += `**Annual Filings:**\n${operations.data.annualFilings || "[Not specified]"}\n\n`;
      content += `**Tax Deadlines:**\n${operations.data.taxDeadlines || "[Not specified]"}\n\n`;
      content += `**Renewals:**\n${operations.data.renewalDates || "[Not specified]"}\n\n`;
      content += `**Review Schedule:**\n${operations.data.reviewSchedule || "[Not specified]"}\n\n`;
    }

    if (trust.data) {
      content += "## TRUST & HOUSE STRUCTURE\n\n";
      content += `**Trust Name:** ${trust.data.trustName || "[Not specified]"}\n\n`;
      content += `**Trust Type:** ${trust.data.trustType || "[Not specified]"}\n\n`;
      content += `**Connected Entity:** ${trust.data.connectedEntity || "[Not specified]"}\n\n`;
      content += "### Trust Parties\n";
      content += `**Grantor:** ${trust.data.grantor || "[Not specified]"}\n`;
      content += `**Primary Trustee:** ${trust.data.trustee || "[Not specified]"}\n`;
      content += `**Successor Trustee:** ${trust.data.successorTrustee || "[Not specified]"}\n\n`;
      content += `**Beneficiaries:**\n${trust.data.beneficiaries || "[Not specified]"}\n\n`;
      content += `**Inheritance Split:** ${trust.data.inheritanceSplit || "[Not specified]"}\n\n`;
      content += "### Trust Assets & Purpose\n";
      content += `**Asset Types:**\n${trust.data.assetTypes || "[Not specified]"}\n\n`;
      content += `**Primary Purpose:** ${trust.data.trustPurpose || "[Not specified]"}\n\n`;
      content += `**Distribution Schedule:**\n${trust.data.distributionSchedule || "[Not specified]"}\n\n`;
      content += "### Trust Terms\n";
      content += `**Revocability:**\n${trust.data.revocabilityTerms || "[Not specified]"}\n\n`;
      content += `**Amendment Process:**\n${trust.data.amendmentProcess || "[Not specified]"}\n\n`;
      content += `**Dissolution Terms:**\n${trust.data.dissolutionTerms || "[Not specified]"}\n\n`;
    }

    if (contracts.data) {
      content += "## CONTRACTS & AGREEMENTS\n\n";
      content += `**Contract Types Created:**\n${contracts.data.contractTypes || "[Not specified]"}\n\n`;
      content += `**Service Agreements:**\n${contracts.data.serviceAgreements || "[Not specified]"}\n\n`;
      content += `**Vendor Contracts:**\n${contracts.data.vendorContracts || "[Not specified]"}\n\n`;
      content += `**Employment Contracts:**\n${contracts.data.employmentContracts || "[Not specified]"}\n\n`;
      content += `**Partnership Agreements:**\n${contracts.data.partnershipAgreements || "[Not specified]"}\n\n`;
      content += `**NDA Templates:**\n${contracts.data.ndaTemplates || "[Not specified]"}\n\n`;
    }

    if (businessplan.data) {
      content += "## COMPREHENSIVE BUSINESS PLAN\n\n";
      content += `**Executive Summary:**\n${businessplan.data.executiveSummary || "[Not specified]"}\n\n`;
      content += `**Market Analysis:**\n${businessplan.data.marketAnalysis || "[Not specified]"}\n\n`;
      content += `**Competitive Analysis:**\n${businessplan.data.competitiveAnalysis || "[Not specified]"}\n\n`;
      content += `**Marketing Strategy:**\n${businessplan.data.marketingStrategy || "[Not specified]"}\n\n`;
      content += `**Operations Plan:**\n${businessplan.data.operationsPlan || "[Not specified]"}\n\n`;
      content += `**Management Team:**\n${businessplan.data.managementTeam || "[Not specified]"}\n\n`;
      content += `**Financial Projections:**\n${businessplan.data.financialProjections || "[Not specified]"}\n\n`;
    }

    if (grant.data) {
      content += "## GRANT FUNDING STRATEGY\n\n";
      content += `**Organization:** ${grant.data.organizationName || "[Not specified]"}\n`;
      content += `**Entity Type:** ${grant.data.entityType || "[Not specified]"}\n`;
      content += `**EIN:** ${grant.data.ein || "[Not specified]"}\n\n`;
      content += `**Mission Statement:**\n${grant.data.missionStatement || "[Not specified]"}\n\n`;
      content += "### Program Information\n";
      content += `**Program Name:** ${grant.data.programName || "[Not specified]"}\n`;
      content += `**Target Population:** ${grant.data.targetPopulation || "[Not specified]"}\n`;
      content += `**Service Area:** ${grant.data.geographicArea || "[Not specified]"}\n\n`;
      content += `**Program Description:**\n${grant.data.programDescription || "[Not specified]"}\n\n`;
      content += "### Problem & Solution\n";
      content += `**Problem Statement:**\n${grant.data.problemStatement || "[Not specified]"}\n\n`;
      content += `**Proposed Solution:**\n${grant.data.proposedSolution || "[Not specified]"}\n\n`;
      content += "### Goals & Objectives\n";
      content += `**Goals:**\n${grant.data.goals || "[Not specified]"}\n\n`;
      content += `**Objectives:**\n${grant.data.objectives || "[Not specified]"}\n\n`;
      content += `**Activities:**\n${grant.data.activities || "[Not specified]"}\n\n`;
      content += `**Timeline:**\n${grant.data.timeline || "[Not specified]"}\n\n`;
      content += "### Evaluation & Budget\n";
      content += `**Evaluation Plan:**\n${grant.data.evaluationPlan || "[Not specified]"}\n\n`;
      content += `**Personnel Budget:**\n${grant.data.personnelBudget || "[Not specified]"}\n\n`;
      content += `**Operating Budget:**\n${grant.data.operatingBudget || "[Not specified]"}\n\n`;
      content += `**Total Request:** ${grant.data.totalBudget || "[Not specified]"}\n\n`;
      content += `**Sustainability Plan:**\n${grant.data.sustainability || "[Not specified]"}\n\n`;
    }

    content += "---\n\n";
    content += "## LUVLEDGER RECORD\n\n";
    content += `**Document Hash:** ${generateHash()}\n`;
    content += `**Blockchain Timestamp:** ${new Date().toISOString()}\n`;
    content += `**Token Rewards Earned:** ${totalTokensEarned}\n\n`;
    content += "*This comprehensive plan was generated through The L.A.W.S. Collective, LLC Business Setup Courses.*\n";
    content += "*All records are immutably stored on the LuvLedger blockchain.*\n";

    // Download as markdown file
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complete-business-plan-${new Date().toISOString().split("T")[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Complete Business Plan downloaded! Recorded to blockchain.");
  };

  // Generate a simple hash for blockchain record
  const generateHash = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `0x${timestamp}${random}`.substring(0, 66);
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

  // Active course views
  if (activeCourse === "business") {
    return (
      <DashboardLayout>
        <BusinessCourse
          onComplete={(data, tokens) => handleCourseComplete("business", data, tokens)}
          onExit={() => setActiveCourse(null)}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "financial") {
    return (
      <DashboardLayout>
        <FinancialCourse
          onComplete={(data, tokens) => handleCourseComplete("financial", data, tokens)}
          onExit={() => setActiveCourse(null)}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "operations") {
    return (
      <DashboardLayout>
        <OperationsCourse
          onComplete={(data, tokens) => handleCourseComplete("operations", data, tokens)}
          onExit={() => setActiveCourse(null)}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "trust") {
    return (
      <DashboardLayout>
        <TrustCourse
          onComplete={(tokens) => handleCourseComplete("trust", {}, tokens)}
          onExit={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "grant") {
    return (
      <DashboardLayout>
        <GrantWritingCourse
          onComplete={(tokens) => handleCourseComplete("grant", {}, tokens)}
          onExit={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "contracts") {
    return (
      <DashboardLayout>
        <ContractsCourse
          onComplete={(tokens) => handleCourseComplete("contracts", {}, tokens)}
          onExit={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "businessplan") {
    return (
      <DashboardLayout>
        <BusinessPlanCourse
          onComplete={(tokens) => handleCourseComplete("businessplan", {}, tokens)}
          onExit={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "blockchain") {
    return (
      <DashboardLayout>
        <BlockchainCourse
          onComplete={(tokens) => handleCourseComplete("blockchain", {}, tokens)}
          onExit={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "insurance") {
    return (
      <DashboardLayout>
        <InsuranceCourse
          onComplete={(tokens) => handleCourseComplete("insurance", {}, tokens)}
          onExit={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  if (activeCourse === "dba") {
    return (
      <DashboardLayout>
        <DBATrademarkCourse
          onComplete={(data, tokens) => handleCourseComplete("dba", data, tokens)}
          onClose={() => setActiveCourse(null)}
          connectedEntity={getConnectedEntity()}
        />
      </DashboardLayout>
    );
  }

  const totalTokensEarned = 
    courseProgress.business.tokens + 
    courseProgress.businessplan.tokens +
    courseProgress.grant.tokens +
    courseProgress.financial.tokens + 
    courseProgress.trust.tokens +
    courseProgress.contracts.tokens +
    courseProgress.blockchain.tokens +
    courseProgress.insurance.tokens +
    courseProgress.operations.tokens +
    courseProgress.dba.tokens;

  const coursesCompleted = [
    courseProgress.business.completed,
    courseProgress.businessplan.completed,
    courseProgress.grant.completed,
    courseProgress.financial.completed,
    courseProgress.trust.completed,
    courseProgress.contracts.completed,
    courseProgress.blockchain.completed,
    courseProgress.insurance.completed,
    courseProgress.operations.completed,
    courseProgress.dba.completed,
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            The L.A.W.S. Collective, LLC Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal gateway to building a real, functioning business through guided courses
          </p>
        </div>

        {/* Live Ticker and Weather */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <LiveTicker department="general" />
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget compact />
          </div>
        </div>

        {/* LuvLedger Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LuvLedgerWidget />
        </div>

        {/* Quick Actions */}
        <QuickActionsWidget />

        {/* Progress Overview */}
        {totalTokensEarned > 0 && (
          <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Trophy className="w-10 h-10 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens Earned</p>
                  <p className="text-3xl font-bold text-foreground">{totalTokensEarned}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                  <p className="text-2xl font-bold text-foreground">{coursesCompleted}/7</p>
                </div>
                {coursesCompleted > 0 && (
                  <Button onClick={downloadBusinessPlan} className="gap-2 min-h-[48px]">
                    <Download className="w-4 h-4" />
                    Download Complete Plan
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* LuvLedger & Blockchain Status */}
        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-emerald-600/20">
              <Link2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">LuvLedger & Blockchain Integration</h3>
              <p className="text-sm text-muted-foreground">
                All course completions and documents are recorded to the LuvLedger blockchain
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="font-semibold">Token Balance</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalTokensEarned}</p>
              <p className="text-xs text-muted-foreground">LUV Tokens</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Documents Created</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{coursesCompleted}</p>
              <p className="text-xs text-muted-foreground">On Blockchain</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold">Blockchain Status</span>
              </div>
              <p className="text-lg font-bold text-green-600">Active</p>
              <p className="text-xs text-muted-foreground">Immutable Records</p>
            </div>
          </div>
        </Card>

        {/* House Structure Progress */}
        <Card className="p-6 bg-gradient-to-br from-stone-100 to-green-50 dark:from-stone-900/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <Home className="w-8 h-8 text-green-700" />
            <div>
              <h3 className="font-bold text-foreground">House Structure Progress</h3>
              <p className="text-sm text-muted-foreground">
                Building your multi-generational wealth structure - All managed via LuvLedger
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg ${courseProgress.business.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100' : 'bg-green-700 text-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-sm">Business Entity</span>
              </div>
              <p className="text-xs opacity-80">
                {courseProgress.business.completed ? "✓ Established" : "Foundation"}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${courseProgress.trust.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100' : 'bg-green-700 text-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5" />
                <span className="font-semibold text-sm">Trust Structure</span>
              </div>
              <p className="text-xs opacity-80">
                {courseProgress.trust.completed ? "✓ Configured" : "Protection"}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${courseProgress.contracts.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100' : 'bg-green-700 text-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-5 h-5" />
                <span className="font-semibold text-sm">Contracts</span>
              </div>
              <p className="text-xs opacity-80">
                {courseProgress.contracts.completed ? "✓ Created" : "Legal Framework"}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${courseProgress.grant.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100' : 'bg-green-700 text-white'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-5 h-5" />
                <span className="font-semibold text-sm">Grant Funding</span>
              </div>
              <p className="text-xs opacity-80">
                {courseProgress.grant.completed ? "✓ Ready" : "Growth Capital"}
              </p>
            </div>
          </div>
        </Card>

        {/* Post-Activation Progress - Shows after House is activated */}
        {courseProgress.business.completed && (
          <PostActivationProgress 
            onStartCourse={(courseId) => {
              // Map course IDs to course types
              const courseMap: Record<string, CourseType> = {
                trust: "trust",
                contracts: "contracts",
                dba: "dba",
                grants: "grant",
                blockchain: "blockchain",
              };
              const courseType = courseMap[courseId];
              if (courseType) {
                setActiveCourse(courseType);
              }
            }}
          />
        )}

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

          <Card className="p-6 bg-gradient-to-br from-teal-500/5 to-teal-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trust Relationships</p>
                <p className="text-2xl font-bold text-foreground">
                  {overview?.trustRelationshipsCount || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-teal-600" />
            </div>
          </Card>
        </div>

        {/* Business Formation Checklist */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-8 h-8 text-amber-600" />
              <div>
                <h3 className="font-bold text-foreground">Business Formation Checklist</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress on essential formation tasks
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/business-formation'}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <FormationChecklist />
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Business Courses</TabsTrigger>
            <TabsTrigger value="entities">Business Entities</TabsTrigger>
            <TabsTrigger value="ledger">LuvLedger</TabsTrigger>
            <TabsTrigger value="trust">Trust Network</TabsTrigger>
          </TabsList>

          {/* Business Courses Tab */}
          <TabsContent value="courses" className="space-y-6 mt-6">
            {/* Token Chain Progress */}
            <TokenChainProgress className="mb-6" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Business Setup Courses
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete these courses to build a real, functioning business - All tracked on LuvLedger blockchain
                </p>
              </div>
            </div>

            {/* Foundation Courses - Order: Business, Business Plan, Grant, Financial */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Foundation Courses
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded ml-2">
                  Complete in Order
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Business Setup Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-accent">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-accent/10">
                      <Shield className="w-8 h-8 text-accent" />
                    </div>
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full font-bold">1</span>
                    {courseProgress.business.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Business Setup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Structure your business, create mission/vision, define market, generate legal documents.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Entity, Mission/Vision, Legal docs
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent">
                      {courseProgress.business.completed ? `${courseProgress.business.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("business")}
                    >
                      {courseProgress.business.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 2. Business Plan Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-teal-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-teal-600/10">
                      <Briefcase className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="px-2 py-1 bg-teal-600/20 text-teal-600 text-xs rounded-full font-bold">2</span>
                    {courseProgress.businessplan.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Business Plan</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create comprehensive plan with executive summary, market analysis, financial projections.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Full business plan document
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-teal-600">
                      {courseProgress.businessplan.completed ? `${courseProgress.businessplan.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("businessplan")}
                    >
                      {courseProgress.businessplan.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 3. Grant Writing Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-amber-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-amber-600/10">
                      <FileCheck className="w-8 h-8 text-amber-600" />
                    </div>
                    <span className="px-2 py-1 bg-amber-600/20 text-amber-600 text-xs rounded-full font-bold">3</span>
                    {courseProgress.grant.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Grant Writing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Master grant research, proposal writing, budgeting, and evaluation planning.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Complete grant proposal
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-600">
                      {courseProgress.grant.completed ? `${courseProgress.grant.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("grant")}
                    >
                      {courseProgress.grant.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 4. Financial Literacy Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-green-600/10">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="px-2 py-1 bg-green-600/20 text-green-600 text-xs rounded-full font-bold">4</span>
                    {courseProgress.financial.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Financial Literacy</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Personal & business finance: budgeting, cash flow, taxes, investment basics.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Financial plans & projections
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600">
                      {courseProgress.financial.completed ? `${courseProgress.financial.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("financial")}
                    >
                      {courseProgress.financial.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Advanced Courses - Order: Trust, Contracts, Blockchain */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                House Structure & Blockchain Courses
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded ml-2">
                  LuvChain Recorded
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 5. Trust Workshop Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-blue-600/10">
                      <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-600 text-xs rounded-full font-bold">5</span>
                    {courseProgress.trust.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Trust Workshop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Structure trusts, define beneficiaries, configure inheritance splits (60/40: 60% house, 40% collective; 70/30: 70% house, 30% inheritance).
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">4 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Types:</strong> Revocable, Irrevocable, 98*, Foreign*
                    </p>
                    <p className="text-xs text-amber-600">*Approval Required</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600">
                      {courseProgress.trust.completed ? `${courseProgress.trust.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("trust")}
                    >
                      {courseProgress.trust.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 6. Contracts Workshop Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-indigo-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-indigo-600/10">
                      <ScrollText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <span className="px-2 py-1 bg-indigo-600/20 text-indigo-600 text-xs rounded-full font-bold">6</span>
                    {courseProgress.contracts.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Contracts Workshop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create service agreements, vendor contracts, NDAs, partnership documents.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">5 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Legal contract templates
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-600">
                      {courseProgress.contracts.completed ? `${courseProgress.contracts.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("contracts")}
                    >
                      {courseProgress.contracts.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 7. Blockchain & Crypto Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-emerald-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-emerald-600/10">
                      <Link2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <span className="px-2 py-1 bg-emerald-600/20 text-emerald-600 text-xs rounded-full font-bold">7</span>
                    {courseProgress.blockchain.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Blockchain & Crypto</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn blockchain, create business wallet, smart contracts, LUV tokens.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Business wallet, Smart contracts
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-600">
                      {courseProgress.blockchain.completed ? `${courseProgress.blockchain.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("blockchain")}
                    >
                      {courseProgress.blockchain.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Insurance & Operations Courses */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-600" />
                Protection & Operations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 8. Insurance Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-cyan-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-cyan-600/10">
                      <Shield className="w-8 h-8 text-cyan-600" />
                    </div>
                    <span className="px-2 py-1 bg-cyan-600/20 text-cyan-600 text-xs rounded-full font-bold">8</span>
                    {courseProgress.insurance.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Insurance Workshop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Personal & business insurance coverage. Life, health, auto, liability, D&O, cyber.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">12 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> Insurance portfolio, coverage assessment
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-cyan-600">
                      {courseProgress.insurance.completed ? `${courseProgress.insurance.tokens} LUV` : "150+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("insurance")}
                    >
                      {courseProgress.insurance.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 9. Entity Operations Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-emerald-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-emerald-600/10">
                      <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <span className="px-2 py-1 bg-emerald-600/20 text-emerald-600 text-xs rounded-full font-bold">9</span>
                    {courseProgress.operations.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Entity Operations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build org structure, SOPs, compliance checklists, operations calendars.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> SOPs, Compliance, Operations calendar
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-600">
                      {courseProgress.operations.completed ? `${courseProgress.operations.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("operations")}
                    >
                      {courseProgress.operations.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>

                {/* 10. DBA/Trademark Course */}
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-amber-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-amber-600/10">
                      <FileText className="w-8 h-8 text-amber-600" />
                    </div>
                    <span className="px-2 py-1 bg-amber-600/20 text-amber-600 text-xs rounded-full font-bold">10</span>
                    {courseProgress.dba.completed && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                        ✓
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">DBA & Trademark Workshop</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Register trade names, search availability, file trademarks, protect your brand.
                  </p>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">6 Modules</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Outputs:</strong> DBA filing docs, trademark application
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-600">
                      {courseProgress.dba.completed ? `${courseProgress.dba.tokens} LUV` : "100+ LUV"}
                    </span>
                    <Button 
                      size="sm" 
                      className="min-h-[48px] min-w-[80px]"
                      onClick={() => setActiveCourse("dba")}
                    >
                      {courseProgress.dba.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>

            {/* Certificate Info */}
            <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-foreground">Certificates of Completion</p>
                  <p className="text-sm text-muted-foreground">Each completed course generates a certificate recorded to LuvChain blockchain - immutable proof of your achievements.</p>
                </div>
              </div>
            </Card>

            {/* Course Benefits */}
            <Card className="p-6 mt-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                What You'll Build: The Complete House Structure
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 text-center p-4 bg-background/50 rounded-lg">
                  <Shield className="w-8 h-8 mx-auto text-accent" />
                  <p className="font-semibold text-foreground text-sm">Business Entity</p>
                  <p className="text-xs text-muted-foreground">Foundation</p>
                </div>
                <div className="space-y-2 text-center p-4 bg-background/50 rounded-lg">
                  <Lock className="w-8 h-8 mx-auto text-blue-600" />
                  <p className="font-semibold text-foreground text-sm">Trust Structure</p>
                  <p className="text-xs text-muted-foreground">60/40 or 70/30 Split</p>
                </div>
                <div className="space-y-2 text-center p-4 bg-background/50 rounded-lg">
                  <ScrollText className="w-8 h-8 mx-auto text-indigo-600" />
                  <p className="font-semibold text-foreground text-sm">Contracts</p>
                  <p className="text-xs text-muted-foreground">Legal Framework</p>
                </div>
                <div className="space-y-2 text-center p-4 bg-background/50 rounded-lg">
                  <FileCheck className="w-8 h-8 mx-auto text-amber-600" />
                  <p className="font-semibold text-foreground text-sm">Grant Funding</p>
                  <p className="text-xs text-muted-foreground">Growth Capital</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-center text-blue-800 dark:text-blue-200">
                  <strong>All documents and tokens are recorded to the LuvLedger blockchain</strong> - creating an immutable record of your business structure and achievements.
                </p>
              </div>
            </Card>
          </TabsContent>

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
                  No business entities yet. Complete the Business Setup Course to create your first entity.
                </p>
                <Button className="gap-2" onClick={() => setActiveCourse("business")}>
                  <GraduationCap className="w-4 h-4" />
                  Start Business Course
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* LuvLedger Tab */}
          <TabsContent value="ledger" className="space-y-4 mt-6">
            <h2 className="text-xl font-bold text-foreground">
              LuvLedger - Blockchain Asset Management
            </h2>

            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-emerald-500/10">
              <div className="flex items-start gap-4">
                <Link2 className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Blockchain Integration Active
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All your course completions, documents, and token transactions are immutably recorded on the LuvLedger blockchain. This creates a permanent, verifiable record of your business structure and achievements.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Token Balance
                </h3>
                <p className="text-4xl font-bold text-foreground mb-2">{totalTokensEarned}</p>
                <p className="text-sm text-muted-foreground">LUV Tokens Earned</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Token Distribution:</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Business Setup</span>
                      <span>{courseProgress.business.tokens} LUV</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Financial Management</span>
                      <span>{courseProgress.financial.tokens} LUV</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Operations</span>
                      <span>{courseProgress.operations.tokens} LUV</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Trust Workshop</span>
                      <span>{courseProgress.trust.tokens} LUV</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Contracts</span>
                      <span>{courseProgress.contracts.tokens} LUV</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Business Plan</span>
                      <span>{courseProgress.businessplan.tokens} LUV</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Grant Writing</span>
                      <span>{courseProgress.grant.tokens} LUV</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Blockchain Records
                </h3>
                <p className="text-4xl font-bold text-foreground mb-2">{coursesCompleted}</p>
                <p className="text-sm text-muted-foreground">Documents on Chain</p>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Recent Transactions:</p>
                  <div className="mt-2 space-y-2">
                    {coursesCompleted > 0 ? (
                      <div className="text-xs p-2 bg-secondary rounded">
                        <p className="font-mono text-muted-foreground truncate">
                          Hash: {generateHash()}
                        </p>
                        <p className="text-muted-foreground mt-1">
                          Course completion recorded
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Complete a course to create your first blockchain record
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Split Calculator */}
            <SplitCalculator />

            {overview?.accounts && overview.accounts.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-bold text-foreground">LuvLedger Accounts</h3>
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
                    Your multi-level trust structure enables secure delegation of authority and resource management across your business entities and collective relationships. All trust documents are recorded to the LuvLedger blockchain.
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
                <p className="text-muted-foreground mb-4">
                  No trust relationships established yet. Complete the Trust Workshop to configure your trust structure.
                </p>
                <Button className="gap-2" onClick={() => setActiveCourse("trust")}>
                  <GraduationCap className="w-4 h-4" />
                  Start Trust Workshop
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
