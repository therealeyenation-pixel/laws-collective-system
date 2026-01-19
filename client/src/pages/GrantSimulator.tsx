import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  FileText,
  DollarSign,
  Building2,
  Users,
  Target,
  ClipboardCheck,
  Award,
  Download,
  Sparkles,
  AlertCircle,
  Info,
  Heart,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const availableGrants = [
  {
    id: "amber",
    name: "Amber Grant",
    funder: "WomensNet",
    amount: "$10,000 - $50,000",
    eligibility: ["women_owned"],
    description: "Monthly grants for women-owned businesses",
    applicationFee: "$15",
    deadline: "Monthly (last day of month)",
  },
  {
    id: "herrise",
    name: "HerRise Microgrant",
    funder: "Yva Jourdan Foundation",
    amount: "$1,000",
    eligibility: ["women_owned", "minority_owned"],
    description: "Monthly grants for under-resourced women entrepreneurs",
    applicationFee: "Free",
    deadline: "Monthly",
  },
  {
    id: "naacp",
    name: "NAACP Powershift Entrepreneur Grant",
    funder: "NAACP",
    amount: "$25,000",
    eligibility: ["black_owned"],
    description: "Grants for Black entrepreneurs to support business growth",
    applicationFee: "Free",
    deadline: "Rolling",
  },
  {
    id: "ifundwomen",
    name: "IFundWomen Universal Application",
    funder: "IFundWomen",
    amount: "Varies by partner",
    eligibility: ["women_owned"],
    description: "One application matches you to multiple corporate partner grants",
    applicationFee: "Free",
    deadline: "Rolling",
  },
  {
    id: "freed",
    name: "Freed Fellowship Grant",
    funder: "Freed Fellowship",
    amount: "$500 - $2,500",
    eligibility: ["women_owned", "minority_owned", "small_business"],
    description: "Monthly micro-grants for small business owners",
    applicationFee: "Free",
    deadline: "Monthly",
  },
  {
    id: "wish",
    name: "Wish Local Empowerment Program",
    funder: "Wish",
    amount: "$5,000 - $25,000",
    eligibility: ["black_owned", "small_business"],
    description: "Financial aid and resources for Black-owned small businesses",
    applicationFee: "Free",
    deadline: "Rolling",
  },
  {
    id: "empowher",
    name: "EmpowHer Grant",
    funder: "EmpowHer Institute",
    amount: "$2,500 - $10,000",
    eligibility: ["women_owned", "minority_owned"],
    description: "Grants supporting women entrepreneurs in underserved communities",
    applicationFee: "Free",
    deadline: "Quarterly",
  },
  {
    id: "mbda",
    name: "MBDA Business Center Grant",
    funder: "Minority Business Development Agency",
    amount: "$10,000 - $100,000",
    eligibility: ["minority_owned", "black_owned"],
    description: "Federal grants supporting minority business growth and competitiveness",
    applicationFee: "Free",
    deadline: "Annual cycles",
  },
  {
    id: "lilly",
    name: "Lilly Endowment Religion Grant",
    funder: "Lilly Endowment Inc.",
    amount: "$50,000 - $500,000",
    eligibility: ["faith_based", "education", "nonprofit"],
    description: "Grants for faith-based organizations and theological education programs",
    applicationFee: "Free",
    deadline: "By invitation/application",
  },
  {
    id: "cdbg",
    name: "Community Development Block Grant",
    funder: "Georgia DCA / HUD",
    amount: "$50,000 - $750,000",
    eligibility: ["community", "nonprofit", "education"],
    description: "Federal block grants for community development benefiting low-to-moderate income populations",
    applicationFee: "Free",
    deadline: "Annual (varies by state)",
  },
  {
    id: "blank",
    name: "Arthur M. Blank Family Foundation Grant",
    funder: "Arthur M. Blank Family Foundation",
    amount: "$25,000 - $250,000",
    eligibility: ["community", "nonprofit", "education"],
    description: "Atlanta-based foundation supporting sustainable and inclusive community development",
    applicationFee: "Free",
    deadline: "Rolling",
  },
  {
    id: "csra",
    name: "Community Foundation CSRA Grant",
    funder: "Community Foundation for the CSRA",
    amount: "$5,000 - $50,000",
    eligibility: ["nonprofit", "education", "community"],
    description: "Grants for nonprofits in Georgia and South Carolina for arts, education, and community programs",
    applicationFee: "Free",
    deadline: "Annual cycles",
  },
  {
    id: "rcdi",
    name: "Rural Community Development Initiative",
    funder: "USDA Rural Development",
    amount: "$50,000 - $250,000",
    eligibility: ["community", "nonprofit"],
    description: "Grants for rural community development organizations serving low-income communities",
    applicationFee: "Free",
    deadline: "Annual",
  },
];

const entities = [
  { id: "realeyenation", name: "Real-Eye-Nation LLC", type: "LLC", eligibility: ["women_owned", "minority_owned", "black_owned", "small_business"] },
  { id: "trust", name: "Calea Freeman Family Trust", type: "Trust", eligibility: ["family_trust"] },
  { id: "luvonpurpose", name: "LuvOnPurpose Autonomous Wealth System LLC", type: "LLC", eligibility: ["women_owned", "minority_owned", "black_owned", "small_business"] },
  { id: "laws", name: "The L.A.W.S. Collective, LLC", type: "LLC", eligibility: ["women_owned", "minority_owned", "black_owned", "community", "small_business"] },
  { id: "508academy", name: "LuvOnPurpose Outreach Temple and Academy Society, Inc.", type: "508(c)(1)(a)", eligibility: ["faith_based", "nonprofit", "education", "community"] },
];

const steps = [
  { id: 1, title: "Grant Selection", icon: Target, description: "Choose a grant to apply for" },
  { id: 2, title: "Entity Selection", icon: Building2, description: "Select which entity will apply" },
  { id: 3, title: "Eligibility Check", icon: ClipboardCheck, description: "Verify you meet requirements" },
  { id: 4, title: "Document Checklist", icon: FileText, description: "Gather required documents" },
  { id: 5, title: "Organization Info", icon: Users, description: "Write your organization description" },
  { id: 6, title: "Need Statement", icon: Heart, description: "Explain why you need funding" },
  { id: 7, title: "Project Description", icon: Sparkles, description: "Describe your project goals" },
  { id: 8, title: "Budget", icon: DollarSign, description: "Create your grant budget" },
  { id: 9, title: "Review & Submit", icon: CheckCircle2, description: "Final review and submission" },
  { id: 10, title: "Certificate", icon: Award, description: "Training completion certificate" },
];

interface ApplicationData {
  selectedGrant: string;
  selectedEntity: string;
  eligibilityChecks: Record<string, boolean>;
  documentChecks: Record<string, boolean>;
  orgDescription: string;
  missionStatement: string;
  yearFounded: string;
  teamSize: string;
  needStatement: string;
  problemDescription: string;
  targetPopulation: string;
  projectTitle: string;
  projectGoals: string;
  projectActivities: string;
  projectTimeline: string;
  expectedOutcomes: string;
  budgetItems: Array<{ category: string; description: string; amount: string }>;
}

const initialData: ApplicationData = {
  selectedGrant: "",
  selectedEntity: "",
  eligibilityChecks: {},
  documentChecks: {},
  orgDescription: "",
  missionStatement: "",
  yearFounded: "",
  teamSize: "",
  needStatement: "",
  problemDescription: "",
  targetPopulation: "",
  projectTitle: "",
  projectGoals: "",
  projectActivities: "",
  projectTimeline: "",
  expectedOutcomes: "",
  budgetItems: [
    { category: "Salaries & Wages", description: "", amount: "" },
    { category: "Fringe Benefits", description: "", amount: "" },
    { category: "Contractors", description: "", amount: "" },
    { category: "Business Formation", description: "", amount: "" },
    { category: "Legal & Professional", description: "", amount: "" },
    { category: "Licenses & Permits", description: "", amount: "" },
    { category: "Insurance", description: "", amount: "" },
    { category: "Equipment", description: "", amount: "" },
    { category: "Software & Technology", description: "", amount: "" },
    { category: "Supplies", description: "", amount: "" },
    { category: "Travel", description: "", amount: "" },
    { category: "Marketing", description: "", amount: "" },
    { category: "Training", description: "", amount: "" },
    { category: "Operating Costs", description: "", amount: "" },
    { category: "Other", description: "", amount: "" },
  ],
};

export default function GrantSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ApplicationData>(initialData);
  const [autoPopulated, setAutoPopulated] = useState(false);

  const selectedGrant = availableGrants.find(g => g.id === data.selectedGrant);
  const selectedEntity = entities.find(e => e.id === data.selectedEntity);
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Fetch business plan data when entity is selected
  const { data: businessPlanData, isLoading: isLoadingPlan } = trpc.businessPlan.getSummaryForGrant.useQuery(
    { entityName: selectedEntity?.name || "" },
    { enabled: !!selectedEntity?.name && !autoPopulated }
  );

  // Auto-populate when business plan data is loaded
  useEffect(() => {
    if (businessPlanData && !autoPopulated) {
      // Helper to format goals array into readable text
      const formatGoals = (goals: unknown): string => {
        if (!goals) return "";
        if (Array.isArray(goals)) {
          return goals.map((g, i) => `${i + 1}. ${typeof g === 'string' ? g : (g as {goal?: string}).goal || JSON.stringify(g)}`).join("\n");
        }
        return typeof goals === 'string' ? goals : "";
      };
      
      // Helper to format milestones into timeline
      const formatTimeline = (milestones: unknown): string => {
        if (!milestones) return "";
        if (Array.isArray(milestones)) {
          return milestones.map((m) => {
            if (typeof m === 'string') return m;
            const ms = m as {milestone?: string; targetDate?: string; description?: string};
            return `${ms.milestone || ms.description || ''} - ${ms.targetDate || 'TBD'}`;
          }).join("\n");
        }
        return typeof milestones === 'string' ? milestones : "";
      };
      
      // Generate project title from entity name and mission
      const generateProjectTitle = (): string => {
        const entityName = businessPlanData.entityName || "";
        // Extract key words from mission for title
        const missionWords = (businessPlanData.missionStatement || "").split(" ").slice(0, 5).join(" ");
        return `${entityName} Growth Initiative` || missionWords;
      };
      
      // Generate activities from products/services
      const generateActivities = (): string => {
        const products = businessPlanData.productsServices || "";
        if (!products) return "";
        // Convert products/services description into activities
        return `Key Activities:\n- Expand and enhance ${products.substring(0, 100)}...\n- Strengthen market presence in ${businessPlanData.targetMarket || 'target markets'}\n- Build operational capacity and team capabilities`;
      };
      
      setData(prev => ({
        ...prev,
        orgDescription: businessPlanData.organizationDescription || prev.orgDescription,
        missionStatement: businessPlanData.missionStatement || prev.missionStatement,
        yearFounded: businessPlanData.yearFounded?.toString() || prev.yearFounded,
        teamSize: getTeamSizeCategory(businessPlanData.teamSize),
        needStatement: businessPlanData.fundingPurpose || prev.needStatement,
        problemDescription: businessPlanData.socialImpact || prev.problemDescription,
        targetPopulation: businessPlanData.communityBenefit || prev.targetPopulation,
        // Project Description fields
        projectTitle: generateProjectTitle() || prev.projectTitle,
        projectGoals: formatGoals(businessPlanData.shortTermGoals) || formatGoals(businessPlanData.longTermGoals) || prev.projectGoals,
        projectActivities: generateActivities() || prev.projectActivities,
        projectTimeline: formatTimeline(businessPlanData.milestones) || prev.projectTimeline,
        expectedOutcomes: businessPlanData.uniqueValueProposition || prev.expectedOutcomes,
      }));
      setAutoPopulated(true);
      toast.success("Auto-populated from your Business Plan!");
    }
  }, [businessPlanData, autoPopulated]);

  // Reset auto-populate flag when entity changes
  useEffect(() => {
    setAutoPopulated(false);
  }, [data.selectedEntity]);

  // Helper to convert team size number to category
  function getTeamSizeCategory(size: number | null | undefined): string {
    if (!size) return "";
    if (size === 1) return "solo";
    if (size <= 5) return "2-5";
    if (size <= 10) return "6-10";
    return "11-50";
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!data.selectedGrant;
      case 2: return !!data.selectedEntity;
      case 3: return Object.values(data.eligibilityChecks).filter(Boolean).length >= 3;
      case 4: return Object.values(data.documentChecks).filter(Boolean).length >= 4;
      case 5: return data.orgDescription.length > 50 && data.missionStatement.length > 20;
      case 6: return data.needStatement.length > 100 && data.problemDescription.length > 50;
      case 7: return data.projectTitle && data.projectGoals.length > 50;
      case 8: return data.budgetItems.some(item => item.amount && parseInt(item.amount) > 0);
      default: return true;
    }
  };

  const handleNext = () => currentStep < steps.length && setCurrentStep(currentStep + 1);
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const updateData = (field: keyof ApplicationData, value: any) => setData(prev => ({ ...prev, [field]: value }));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Grant Selection</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Choose a grant that matches your business type and funding needs.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {availableGrants.map((grant) => (
                <Card
                  key={grant.id}
                  className={`cursor-pointer transition-all ${data.selectedGrant === grant.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"}`}
                  onClick={() => updateData("selectedGrant", grant.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{grant.name}</h3>
                      {data.selectedGrant === grant.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{grant.funder}</p>
                    <p className="text-sm mt-2">{grant.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Badge variant="secondary">{grant.amount}</Badge>
                      <Badge variant="outline">Fee: {grant.applicationFee}</Badge>
                      <Badge variant="outline">{grant.deadline}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Entity Selection</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Select which business entity will apply for this grant.
                  </p>
                </div>
              </div>
            </div>
            {selectedGrant && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Selected: {selectedGrant.name}</p>
                <p className="text-sm text-muted-foreground">Eligible: {selectedGrant.eligibility.join(", ").replace(/_/g, " ")}</p>
              </div>
            )}
            <div className="grid gap-4">
              {entities.map((entity) => {
                const isEligible = selectedGrant?.eligibility.some(e => entity.eligibility.includes(e));
                return (
                  <Card
                    key={entity.id}
                    className={`cursor-pointer transition-all ${data.selectedEntity === entity.id ? "ring-2 ring-primary" : isEligible ? "hover:border-primary/50" : "opacity-50"}`}
                    onClick={() => isEligible && updateData("selectedEntity", entity.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{entity.name}</h3>
                          {data.selectedEntity === entity.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{entity.type}</p>
                      </div>
                      <Badge className={isEligible ? "bg-green-100 text-green-800" : ""}>{isEligible ? "Eligible" : "Not Eligible"}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Eligibility Verification</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Verify you meet all requirements before applying.</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Checklist</CardTitle>
                <CardDescription>Confirm requirements for {selectedGrant?.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "ownership", label: "Business is 51%+ owned by qualifying demographic" },
                  { id: "location", label: "Business is located in the United States" },
                  { id: "legal", label: "Business is legally registered" },
                  { id: "revenue", label: "Annual revenue under $1 million (if required)" },
                  { id: "employees", label: "Fewer than 50 employees (if required)" },
                  { id: "purpose", label: "Funds will be used for business purposes" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={data.eligibilityChecks[item.id] || false}
                      onCheckedChange={(checked) => updateData("eligibilityChecks", { ...data.eligibilityChecks, [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Important:</strong> False eligibility claims can result in disqualification.
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Document Preparation</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Gather all required documents before starting.</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>Check off documents you have ready</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "ein", label: "EIN Letter (IRS confirmation)" },
                  { id: "formation", label: "Articles of Organization/Incorporation" },
                  { id: "businessplan", label: "Business Plan or Executive Summary" },
                  { id: "financials", label: "Financial Statements" },
                  { id: "bankstatement", label: "Business Bank Statement" },
                  { id: "photo", label: "Professional Photo of Founder(s)" },
                  { id: "website", label: "Website or Social Media" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={data.documentChecks[item.id] || false}
                      onCheckedChange={(checked) => updateData("documentChecks", { ...data.documentChecks, [item.id]: checked })}
                    />
                    <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Organization Information</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Write a compelling description of your organization.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Description (2-3 paragraphs)</Label>
                <Textarea
                  placeholder="Describe your organization, what you do, and your history..."
                  value={data.orgDescription}
                  onChange={(e) => updateData("orgDescription", e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">{data.orgDescription.length} characters</p>
              </div>
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  placeholder="What is your organization's mission?"
                  value={data.missionStatement}
                  onChange={(e) => updateData("missionStatement", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year Founded</Label>
                  <Input placeholder="2024" value={data.yearFounded} onChange={(e) => updateData("yearFounded", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <Select value={data.teamSize} onValueChange={(v) => updateData("teamSize", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Founder</SelectItem>
                      <SelectItem value="2-5">2-5 people</SelectItem>
                      <SelectItem value="6-10">6-10 people</SelectItem>
                      <SelectItem value="11-50">11-50 people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Need Statement</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Explain why your organization needs this funding.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Problem Description</Label>
                <Textarea
                  placeholder="What problem does your organization address?"
                  value={data.problemDescription}
                  onChange={(e) => updateData("problemDescription", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Population</Label>
                <Textarea
                  placeholder="Who does your organization serve?"
                  value={data.targetPopulation}
                  onChange={(e) => updateData("targetPopulation", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Need Statement</Label>
                <Textarea
                  placeholder="Explain specifically how this grant will help..."
                  value={data.needStatement}
                  onChange={(e) => updateData("needStatement", e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">{data.needStatement.length} characters (aim for 200-500)</p>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Project Description</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Describe what you'll do with the grant funding.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Project Title</Label>
                <Input placeholder="Give your project a clear name" value={data.projectTitle} onChange={(e) => updateData("projectTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Project Goals</Label>
                <Textarea placeholder="What do you want to achieve? List 2-3 specific goals." value={data.projectGoals} onChange={(e) => updateData("projectGoals", e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Key Activities</Label>
                <Textarea placeholder="What activities will you do to achieve your goals?" value={data.projectActivities} onChange={(e) => updateData("projectActivities", e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Textarea placeholder="When will you complete each activity?" value={data.projectTimeline} onChange={(e) => updateData("projectTimeline", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Expected Outcomes</Label>
                <Textarea placeholder="What results do you expect? How will you measure success?" value={data.expectedOutcomes} onChange={(e) => updateData("expectedOutcomes", e.target.value)} rows={4} />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Training: Budget Creation</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Create a realistic budget showing how you'll use the funds. Most grants allow personnel costs (salaries, benefits), business formation costs (LLC fees, legal setup), and operational infrastructure when framed as essential to program delivery.</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Grant Budget</CardTitle>
                <CardDescription>Requesting: {selectedGrant?.amount}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.budgetItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-3"><Label className="text-xs">{item.category}</Label></div>
                    <div className="col-span-6">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...data.budgetItems];
                          newItems[index].description = e.target.value;
                          updateData("budgetItems", newItems);
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          className="pl-7"
                          placeholder="0"
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const newItems = [...data.budgetItems];
                            newItems[index].amount = e.target.value;
                            updateData("budgetItems", newItems);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold">Total Budget</span>
                  <span className="text-xl font-bold">${data.budgetItems.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Final Review</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">Review your application before completing training.</p>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader><CardTitle>Application Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Grant</p><p className="font-medium">{selectedGrant?.name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Entity</p><p className="font-medium">{selectedEntity?.name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Amount</p><p className="font-medium">${data.budgetItems.reduce((sum, item) => sum + (parseInt(item.amount) || 0), 0).toLocaleString()}</p></div>
                  <div><p className="text-sm text-muted-foreground">Project</p><p className="font-medium">{data.projectTitle || "Not specified"}</p></div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Completion Checklist</p>
                  <div className="space-y-2">
                    {[
                      { label: "Grant Selected", complete: !!data.selectedGrant },
                      { label: "Entity Selected", complete: !!data.selectedEntity },
                      { label: "Eligibility Verified", complete: Object.values(data.eligibilityChecks).filter(Boolean).length >= 3 },
                      { label: "Documents Ready", complete: Object.values(data.documentChecks).filter(Boolean).length >= 4 },
                      { label: "Organization Info", complete: data.orgDescription.length > 50 },
                      { label: "Need Statement", complete: data.needStatement.length > 100 },
                      { label: "Project Description", complete: !!data.projectTitle },
                      { label: "Budget Created", complete: data.budgetItems.some(item => parseInt(item.amount) > 0) },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.complete ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                        <span className={item.complete ? "" : "text-muted-foreground"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <Award className="w-16 h-16 mx-auto text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Certificate of Completion</h2>
                    <p className="text-muted-foreground">Grant Application Training</p>
                  </div>
                  <div className="py-6 border-y">
                    <p className="text-lg">This certifies that</p>
                    <p className="text-2xl font-bold mt-2">LaShanna Russell</p>
                    <p className="text-lg mt-4">has successfully completed the</p>
                    <p className="text-xl font-semibold text-primary mt-2">Grant Application Simulator Training</p>
                    <p className="text-muted-foreground mt-2">for {selectedGrant?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="text-center">
                      <div className="border-t border-foreground pt-2 mx-8">
                        <p className="font-semibold">Cornelius</p>
                        <p className="text-sm text-muted-foreground">Education Manager</p>
                        <p className="text-xs text-muted-foreground">Content Approved</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-foreground pt-2 mx-8">
                        <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">Date of Completion</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1"><Sparkles className="w-3 h-3" />+50 LUV Tokens Earned</Badge>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Download Certificate</Button>
              <Button className="gap-2" onClick={() => {
                const urls: Record<string, string> = {
                  amber: "https://ambergrantsforwomen.com/",
                  herrise: "https://hersuitespot.com/herrise-microgrant/",
                  naacp: "https://naacp.org/find-resources/grants",
                  ifundwomen: "https://ifundwomen.com/",
                  freed: "https://freedfellowship.com/",
                };
                if (selectedGrant) window.open(urls[selectedGrant.id], "_blank");
              }}>
                Apply to {selectedGrant?.name}<ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Grant Application Simulator</h1>
          <p className="text-muted-foreground mt-1">Learn how to write winning grant applications step by step</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex overflow-x-auto gap-1 pb-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap ${
                      currentStep === step.id ? "bg-primary text-primary-foreground" : currentStep > step.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <step.icon className="w-3 h-3" />{step.title}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {(() => { const Icon = steps[currentStep - 1].icon; return <Icon className="w-6 h-6 text-primary" />; })()}
              <div>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>{steps[currentStep - 1].description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="gap-2">
            <ArrowLeft className="w-4 h-4" />Previous
          </Button>
          {currentStep < steps.length && (
            <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
              {currentStep === 9 ? "Complete Training" : "Continue"}<ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
