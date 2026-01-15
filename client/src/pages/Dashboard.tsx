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
  GraduationCap,
  Trophy,
  Download,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import BusinessCourse from "@/components/BusinessCourse";
import FinancialCourse from "@/components/FinancialCourse";
import OperationsCourse from "@/components/OperationsCourse";

type CourseType = "business" | "financial" | "operations" | null;

interface CourseProgress {
  business: { completed: boolean; tokens: number; data: any };
  financial: { completed: boolean; tokens: number; data: any };
  operations: { completed: boolean; tokens: number; data: any };
}

export default function Dashboard() {
  const { data: overview, isLoading } = trpc.luv.getSystemOverview.useQuery();
  const [activeCourse, setActiveCourse] = useState<CourseType>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    business: { completed: false, tokens: 0, data: null },
    financial: { completed: false, tokens: 0, data: null },
    operations: { completed: false, tokens: 0, data: null },
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
    
    toast.success(`Course Complete! You earned ${tokens} tokens. Your documents are ready.`, {
      duration: 5000,
    });
    
    setActiveCourse(null);
  };

  const downloadBusinessPlan = () => {
    const { business, financial, operations } = courseProgress;
    
    if (!business.data && !financial.data && !operations.data) {
      toast.error("Complete at least one course to generate documents");
      return;
    }

    // Generate comprehensive business plan from all course data
    let content = "# BUSINESS PLAN\n\n";
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
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
      content += "---\n\n## FINANCIAL PLAN\n\n";
      content += "### Startup Costs\n";
      content += `- Equipment & Technology: $${financial.data.equipmentCosts || "0"}\n`;
      content += `- Initial Inventory: $${financial.data.inventoryCosts || "0"}\n`;
      content += `- Legal & Professional: $${financial.data.legalFees || "0"}\n`;
      content += `- Licenses & Permits: $${financial.data.licensingFees || "0"}\n`;
      content += `- Initial Marketing: $${financial.data.marketingBudget || "0"}\n`;
      content += `- Operating Reserve: $${financial.data.operatingReserve || "0"}\n\n`;
      content += "### Revenue Projections\n";
      content += `- Monthly Product Revenue: $${financial.data.productRevenue || "0"}\n`;
      content += `- Monthly Service Revenue: $${financial.data.serviceRevenue || "0"}\n`;
      content += `- Year 1 Total: $${financial.data.yearOneRevenue || "0"}\n`;
      content += `- Year 2 Total: $${financial.data.yearTwoRevenue || "0"}\n`;
      content += `- Year 3 Total: $${financial.data.yearThreeRevenue || "0"}\n\n`;
      content += "### Monthly Operating Expenses\n";
      content += `- Rent/Mortgage: $${financial.data.rent || "0"}\n`;
      content += `- Utilities: $${financial.data.utilities || "0"}\n`;
      content += `- Salaries & Wages: $${financial.data.salaries || "0"}\n`;
      content += `- Insurance: $${financial.data.insurance || "0"}\n`;
      content += `- Marketing: $${financial.data.marketing || "0"}\n`;
      content += `- Supplies: $${financial.data.supplies || "0"}\n\n`;
      content += "### Cash Flow\n";
      content += `- Opening Balance: $${financial.data.openingBalance || "0"}\n`;
      content += `- Monthly Inflow: $${financial.data.monthlyInflow || "0"}\n`;
      content += `- Monthly Outflow: $${financial.data.monthlyOutflow || "0"}\n\n`;
      content += "### Break-Even Analysis\n";
      content += `- Fixed Costs: $${financial.data.fixedCosts || "0"}/month\n`;
      content += `- Price per Unit: $${financial.data.pricePerUnit || "0"}\n`;
      content += `- Variable Cost per Unit: $${financial.data.variableCostPerUnit || "0"}\n\n`;
      content += "### Funding Plan\n";
      content += `- Owner Investment: $${financial.data.ownerInvestment || "0"}\n`;
      content += `- Loans: $${financial.data.loans || "0"}\n`;
      content += `- Grants: $${financial.data.grants || "0"}\n`;
      content += `- Investors: $${financial.data.investors || "0"}\n\n`;
    }

    if (operations.data) {
      content += "---\n\n## OPERATIONS MANUAL\n\n";
      content += "### Organizational Structure\n";
      content += `**Structure Type:** ${operations.data.orgStructure || "[Not specified]"}\n\n`;
      content += `**Key Roles:**\n${operations.data.roles || "[Not specified]"}\n\n`;
      content += `**Responsibilities:**\n${operations.data.responsibilities || "[Not specified]"}\n\n`;
      content += `**Reporting Lines:**\n${operations.data.reportingLines || "[Not specified]"}\n\n`;
      content += "### Standard Operating Procedures\n";
      content += `**Core Procedures:**\n${operations.data.coreProcedures || "[Not specified]"}\n\n`;
      content += `**Quality Standards:**\n${operations.data.qualityStandards || "[Not specified]"}\n\n`;
      content += `**Customer Service:**\n${operations.data.customerService || "[Not specified]"}\n\n`;
      content += "### Compliance Requirements\n";
      content += `**Required Licenses:**\n${operations.data.requiredLicenses || "[Not specified]"}\n\n`;
      content += `**Required Permits:**\n${operations.data.permits || "[Not specified]"}\n\n`;
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

    content += "---\n\n";
    content += "*This business plan was generated through the L.A.W.S. Collective Business Setup Course.*\n";
    content += `*Total tokens earned: ${courseProgress.business.tokens + courseProgress.financial.tokens + courseProgress.operations.tokens}*\n`;

    // Download as markdown file
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `business-plan-${new Date().toISOString().split("T")[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success("Business Plan downloaded!");
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

  // Active course view
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

  const totalTokensEarned = 
    courseProgress.business.tokens + 
    courseProgress.financial.tokens + 
    courseProgress.operations.tokens;

  const coursesCompleted = [
    courseProgress.business.completed,
    courseProgress.financial.completed,
    courseProgress.operations.completed,
  ].filter(Boolean).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            L.A.W.S. Collective Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal gateway to building a real, functioning business through guided courses
          </p>
        </div>

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
                  <p className="text-2xl font-bold text-foreground">{coursesCompleted}/3</p>
                </div>
                {coursesCompleted > 0 && (
                  <Button onClick={downloadBusinessPlan} className="gap-2 min-h-[48px]">
                    <Download className="w-4 h-4" />
                    Download Business Plan
                  </Button>
                )}
              </div>
            </div>
          </Card>
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
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">Business Courses</TabsTrigger>
            <TabsTrigger value="entities">Business Entities</TabsTrigger>
            <TabsTrigger value="ledger">LuvLedger</TabsTrigger>
            <TabsTrigger value="trust">Trust Network</TabsTrigger>
          </TabsList>

          {/* Business Courses Tab */}
          <TabsContent value="courses" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Business Setup Courses
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete these courses to build a real, functioning business with all necessary documents
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Business Setup Course */}
              <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-accent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Shield className="w-8 h-8 text-accent" />
                  </div>
                  {courseProgress.business.completed && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Business Setup Course</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn to structure your business, create mission/vision statements, define your market, and generate legal formation documents.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground">6 Modules • Lessons + Quizzes + Worksheets</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Outputs:</strong> Entity selection, Mission/Vision, Customer profile, Products/Services, Legal documents, Operating Agreement
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-accent">
                    {courseProgress.business.completed ? `${courseProgress.business.tokens} tokens earned` : "Earn 100+ tokens"}
                  </span>
                  <Button 
                    size="sm" 
                    className="min-h-[48px] min-w-[100px]"
                    onClick={() => setActiveCourse("business")}
                  >
                    {courseProgress.business.completed ? "Review" : "Start"}
                  </Button>
                </div>
              </Card>

              {/* Financial Management Course */}
              <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-green-600/10">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  {courseProgress.financial.completed && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Financial Management Course</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Master startup costs, revenue projections, expense management, cash flow, break-even analysis, and funding strategies.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground">6 Modules • Lessons + Quizzes + Worksheets</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Outputs:</strong> Startup costs, Revenue projections, Expense budget, Cash flow, Break-even analysis, Funding plan
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-600">
                    {courseProgress.financial.completed ? `${courseProgress.financial.tokens} tokens earned` : "Earn 100+ tokens"}
                  </span>
                  <Button 
                    size="sm" 
                    className="min-h-[48px] min-w-[100px]"
                    onClick={() => setActiveCourse("financial")}
                  >
                    {courseProgress.financial.completed ? "Review" : "Start"}
                  </Button>
                </div>
              </Card>

              {/* Entity Operations Course */}
              <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-purple-600/10">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  {courseProgress.operations.completed && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">Entity Operations Course</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build organizational structure, SOPs, compliance checklists, contracts, and operations calendars for your business.
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground">6 Modules • Lessons + Quizzes + Worksheets</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Outputs:</strong> Org structure, SOPs, Compliance checklist, Contract templates, Operations calendar
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-600">
                    {courseProgress.operations.completed ? `${courseProgress.operations.tokens} tokens earned` : "Earn 100+ tokens"}
                  </span>
                  <Button 
                    size="sm" 
                    className="min-h-[48px] min-w-[100px]"
                    onClick={() => setActiveCourse("operations")}
                  >
                    {courseProgress.operations.completed ? "Review" : "Start"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Course Benefits */}
            <Card className="p-6 mt-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                What You'll Get
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Complete Business Plan</p>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive document covering your business structure, market, offerings, and strategy.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Financial Projections</p>
                  <p className="text-sm text-muted-foreground">
                    Startup costs, revenue forecasts, expense budgets, and break-even analysis.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">Operations Manual</p>
                  <p className="text-sm text-muted-foreground">
                    SOPs, compliance checklists, contract templates, and annual calendar.
                  </p>
                </div>
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
