import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Building2,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Info,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import CompletionCertificate from "@/components/CompletionCertificate";
import { trpc } from "@/lib/trpc";

// Steps in the Business Plan Simulator
const STEPS = [
  { id: 1, title: "Select Entity", icon: Building2 },
  { id: 2, title: "Mission & Vision", icon: Target },
  { id: 3, title: "Products/Services", icon: FileText },
  { id: 4, title: "Market Analysis", icon: TrendingUp },
  { id: 5, title: "Team Structure", icon: Users },
  { id: 6, title: "Financial Projections", icon: DollarSign },
  { id: 7, title: "Funding Needs", icon: Sparkles },
  { id: 8, title: "Review & Complete", icon: CheckCircle2 },
];

// Entity types with descriptions
const ENTITY_TYPES = [
  { value: "llc", label: "LLC", description: "Limited Liability Company - flexible business structure" },
  { value: "corporation", label: "Corporation", description: "Formal corporate structure with shareholders" },
  { value: "trust", label: "Family Trust", description: "Asset protection and wealth transfer vehicle" },
  { value: "nonprofit_508", label: "508(c)(1)(a)", description: "Religious/apostolic organization - tax exempt" },
  { value: "nonprofit_501c3", label: "501(c)(3)", description: "Charitable nonprofit organization" },
  { value: "collective", label: "Collective", description: "Community-based cooperative organization" },
];

// Pre-populated entities from Business Simulator (would come from database)
const EXISTING_ENTITIES = [
  { id: 1, name: "Real-Eye-Nation LLC", type: "llc", status: "formed", ein: "84-4976416" },
  { id: 2, name: "Calea Freeman Family Trust", type: "trust", status: "ein_obtained", ein: "98-6109577" },
  { id: 3, name: "LuvOnPurpose LLC", type: "llc", status: "not_started" },
  { id: 4, name: "L.A.W.S. Collective", type: "collective", status: "not_started" },
  { id: 5, name: "508 Academy & Outreach", type: "nonprofit_508", status: "not_started" },
];

// Team members from Family Onboarding (would come from database)
const TEAM_MEMBERS = [
  { id: 1, name: "Shanna Russell", role: "Founder / Matriarch", department: "Executive" },
  { id: 2, name: "Craig", role: "House Member", department: "Finance, Outreach" },
  { id: 3, name: "Amber", role: "House Member", department: "Outreach, Education" },
  { id: 4, name: "Essence", role: "House Member", department: "Outreach" },
  { id: 5, name: "Amandes", role: "House Member", department: "Operations" },
  { id: 6, name: "Cornelius", role: "Education/Training Manager", department: "Education, Justice Support" },
];

export default function BusinessPlanSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Form state - this would be saved to database
  const [formData, setFormData] = useState({
    // Step 1: Entity Selection
    selectedEntityId: "",
    entityType: "",
    entityName: "",
    yearFounded: new Date().getFullYear().toString(),
    
    // Step 2: Mission & Vision
    missionStatement: "",
    visionStatement: "",
    organizationDescription: "",
    
    // Step 3: Products/Services
    productsServices: "",
    uniqueValueProposition: "",
    
    // Step 4: Market Analysis
    targetMarket: "",
    marketSize: "",
    competitiveAdvantage: "",
    
    // Step 5: Team
    teamSize: "",
    teamDescription: "",
    selectedTeamMembers: [] as number[],
    
    // Step 6: Financial Projections
    startupCosts: "",
    monthlyOperatingCosts: "",
    projectedRevenueYear1: "",
    projectedRevenueYear2: "",
    projectedRevenueYear3: "",
    breakEvenTimeline: "",
    
    // Step 7: Funding
    fundingNeeded: "",
    fundingPurpose: "",
    
    // For nonprofits
    socialImpact: "",
    communityBenefit: "",
  });

  const progress = (currentStep / STEPS.length) * 100;

  const handleEntitySelect = (entityId: string) => {
    const entity = EXISTING_ENTITIES.find(e => e.id.toString() === entityId);
    if (entity) {
      setFormData(prev => ({
        ...prev,
        selectedEntityId: entityId,
        entityType: entity.type,
        entityName: entity.name,
      }));
    }
  };

  const handleInputChange = (field: string, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamMemberToggle = (memberId: number) => {
    setFormData(prev => {
      const current = prev.selectedTeamMembers;
      if (current.includes(memberId)) {
        return { ...prev, selectedTeamMembers: current.filter(id => id !== memberId) };
      } else {
        return { ...prev, selectedTeamMembers: [...current, memberId] };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveMutation = trpc.businessPlan.save.useMutation({
    onSuccess: (data) => {
      toast.success(data.updated ? "Business Plan updated!" : "Business Plan saved!");
      setShowCertificate(true);
    },
    onError: (error) => {
      toast.error("Failed to save business plan: " + error.message);
    },
  });

  const handleComplete = () => {
    // Get selected team members' names
    const keyPersonnel = formData.selectedTeamMembers.map(id => {
      const member = TEAM_MEMBERS.find(m => m.id === id);
      return member ? { name: member.name, role: member.role, bio: "" } : null;
    }).filter(Boolean) as { name: string; role: string; bio: string }[];

    // Save to database
    saveMutation.mutate({
      entityName: formData.entityName,
      entityType: formData.entityType as "llc" | "corporation" | "trust" | "nonprofit_508" | "nonprofit_501c3" | "collective" | "sole_proprietorship",
      yearFounded: parseInt(formData.yearFounded) || new Date().getFullYear(),
      missionStatement: formData.missionStatement,
      visionStatement: formData.visionStatement,
      organizationDescription: formData.organizationDescription,
      productsServices: formData.productsServices,
      uniqueValueProposition: formData.uniqueValueProposition,
      targetMarket: formData.targetMarket,
      marketSize: formData.marketSize,
      competitiveAdvantage: formData.competitiveAdvantage,
      teamSize: parseInt(formData.teamSize) || formData.selectedTeamMembers.length,
      teamDescription: formData.teamDescription,
      keyPersonnel,
      startupCosts: formData.startupCosts,
      monthlyOperatingCosts: formData.monthlyOperatingCosts,
      projectedRevenueYear1: formData.projectedRevenueYear1,
      projectedRevenueYear2: formData.projectedRevenueYear2,
      projectedRevenueYear3: formData.projectedRevenueYear3,
      breakEvenTimeline: formData.breakEvenTimeline,
      fundingNeeded: formData.fundingNeeded,
      fundingPurpose: formData.fundingPurpose,
      socialImpact: formData.socialImpact || undefined,
      communityBenefit: formData.communityBenefit || undefined,
    });
  };

  const isNonprofit = formData.entityType === "nonprofit_508" || formData.entityType === "nonprofit_501c3";

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Select Your Entity</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Choose an existing entity from your Business Simulator or create a new one.
                    The business plan will be linked to this entity.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Existing Entity</Label>
              <div className="grid gap-3">
                {EXISTING_ENTITIES.map((entity) => (
                  <Card
                    key={entity.id}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.selectedEntityId === entity.id.toString()
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => handleEntitySelect(entity.id.toString())}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{entity.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {entity.type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          entity.status === "formed" ? "default" :
                          entity.status === "ein_obtained" ? "secondary" : "outline"
                        }>
                          {entity.status === "formed" ? "Formed" :
                           entity.status === "ein_obtained" ? "EIN Obtained" : "Not Started"}
                        </Badge>
                        {formData.selectedEntityId === entity.id.toString() && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Or Create New Entity</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label>Entity Type</Label>
                  <Select
                    value={formData.entityType}
                    onValueChange={(value) => {
                      handleInputChange("entityType", value);
                      handleInputChange("selectedEntityId", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Entity Name</Label>
                  <Input
                    value={formData.entityName}
                    onChange={(e) => handleInputChange("entityName", e.target.value)}
                    placeholder="Enter entity name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Mission & Vision</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your mission statement explains WHY your organization exists.
                    Your vision statement describes WHERE you want to be in the future.
                    These will auto-populate in grant applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Mission Statement</Label>
                <Textarea
                  value={formData.missionStatement}
                  onChange={(e) => handleInputChange("missionStatement", e.target.value)}
                  placeholder="What is your organization's purpose? Why does it exist?"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.missionStatement.length} characters</p>
              </div>

              <div>
                <Label>Vision Statement</Label>
                <Textarea
                  value={formData.visionStatement}
                  onChange={(e) => handleInputChange("visionStatement", e.target.value)}
                  placeholder="What does success look like? Where do you want to be in 5-10 years?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Organization Description (2-3 paragraphs)</Label>
                <Textarea
                  value={formData.organizationDescription}
                  onChange={(e) => handleInputChange("organizationDescription", e.target.value)}
                  placeholder="Describe your organization, what you do, and your history..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.organizationDescription.length} characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Year Founded</Label>
                  <Input
                    type="number"
                    value={formData.yearFounded}
                    onChange={(e) => handleInputChange("yearFounded", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Products & Services</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Clearly describe what you offer. For nonprofits, describe your programs.
                    What makes you different from others doing similar work?
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{isNonprofit ? "Programs & Services" : "Products & Services"}</Label>
                <Textarea
                  value={formData.productsServices}
                  onChange={(e) => handleInputChange("productsServices", e.target.value)}
                  placeholder={isNonprofit 
                    ? "Describe the programs and services you provide to the community..."
                    : "Describe the products or services your business offers..."
                  }
                  rows={5}
                />
              </div>

              <div>
                <Label>Unique Value Proposition</Label>
                <Textarea
                  value={formData.uniqueValueProposition}
                  onChange={(e) => handleInputChange("uniqueValueProposition", e.target.value)}
                  placeholder="What makes your organization unique? Why should people choose you?"
                  rows={3}
                />
              </div>

              {isNonprofit && (
                <>
                  <div>
                    <Label>Social Impact</Label>
                    <Textarea
                      value={formData.socialImpact}
                      onChange={(e) => handleInputChange("socialImpact", e.target.value)}
                      placeholder="What social change do you aim to create?"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Community Benefit</Label>
                    <Textarea
                      value={formData.communityBenefit}
                      onChange={(e) => handleInputChange("communityBenefit", e.target.value)}
                      placeholder="How does your work benefit the community?"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Market Analysis</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Understanding your market is crucial for success. Who are you serving?
                    How big is the opportunity? What's your competitive advantage?
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{isNonprofit ? "Target Population" : "Target Market"}</Label>
                <Textarea
                  value={formData.targetMarket}
                  onChange={(e) => handleInputChange("targetMarket", e.target.value)}
                  placeholder={isNonprofit
                    ? "Who do you serve? Describe the demographics and needs of your target population..."
                    : "Who are your ideal customers? Describe their demographics, needs, and behaviors..."
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>{isNonprofit ? "Need/Problem Size" : "Market Size"}</Label>
                <Input
                  value={formData.marketSize}
                  onChange={(e) => handleInputChange("marketSize", e.target.value)}
                  placeholder={isNonprofit
                    ? "e.g., 50,000 families in our county lack access to financial education"
                    : "e.g., $10B industry, 500,000 potential customers in our region"
                  }
                />
              </div>

              <div>
                <Label>Competitive Advantage</Label>
                <Textarea
                  value={formData.competitiveAdvantage}
                  onChange={(e) => handleInputChange("competitiveAdvantage", e.target.value)}
                  placeholder="What sets you apart from others doing similar work? Why will you succeed?"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Team Structure</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your team is pulled from Family Onboarding. Select who will be involved
                    with this entity. This information auto-populates in grant applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Select Team Members</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose from your House members who will be involved with this entity
                </p>
                <div className="grid gap-2">
                  {TEAM_MEMBERS.map((member) => (
                    <Card
                      key={member.id}
                      className={`p-3 cursor-pointer transition-all ${
                        formData.selectedTeamMembers.includes(member.id)
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => handleTeamMemberToggle(member.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                        </div>
                        {formData.selectedTeamMembers.includes(member.id) && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Team Size</Label>
                  <Select
                    value={formData.teamSize}
                    onValueChange={(value) => handleInputChange("teamSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Just me (1)</SelectItem>
                      <SelectItem value="2-5">2-5 people</SelectItem>
                      <SelectItem value="6-10">6-10 people</SelectItem>
                      <SelectItem value="11-25">11-25 people</SelectItem>
                      <SelectItem value="26-50">26-50 people</SelectItem>
                      <SelectItem value="50+">50+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Team Description</Label>
                <Textarea
                  value={formData.teamDescription}
                  onChange={(e) => handleInputChange("teamDescription", e.target.value)}
                  placeholder="Describe your team's qualifications and relevant experience..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Financial Projections</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Be realistic with your numbers. Funders want to see you've thought through
                    the financial sustainability of your organization.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Startup Costs</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.startupCosts}
                      onChange={(e) => handleInputChange("startupCosts", e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div>
                  <Label>Monthly Operating Costs</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.monthlyOperatingCosts}
                      onChange={(e) => handleInputChange("monthlyOperatingCosts", e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Year 1 {isNonprofit ? "Budget" : "Revenue"}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.projectedRevenueYear1}
                      onChange={(e) => handleInputChange("projectedRevenueYear1", e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div>
                  <Label>Year 2 {isNonprofit ? "Budget" : "Revenue"}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.projectedRevenueYear2}
                      onChange={(e) => handleInputChange("projectedRevenueYear2", e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div>
                  <Label>Year 3 {isNonprofit ? "Budget" : "Revenue"}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.projectedRevenueYear3}
                      onChange={(e) => handleInputChange("projectedRevenueYear3", e.target.value)}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Break-Even Timeline</Label>
                <Select
                  value={formData.breakEvenTimeline}
                  onValueChange={(value) => handleInputChange("breakEvenTimeline", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When do you expect to break even?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-6">0-6 months</SelectItem>
                    <SelectItem value="6-12">6-12 months</SelectItem>
                    <SelectItem value="12-18">12-18 months</SelectItem>
                    <SelectItem value="18-24">18-24 months</SelectItem>
                    <SelectItem value="24+">24+ months</SelectItem>
                    <SelectItem value="na">N/A (nonprofit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Training: Funding Needs</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Be specific about how much funding you need and exactly how you'll use it.
                    This information flows directly into your grant applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Total Funding Needed</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={formData.fundingNeeded}
                    onChange={(e) => handleInputChange("fundingNeeded", e.target.value)}
                    placeholder="0"
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <Label>How Will Funding Be Used?</Label>
                <Textarea
                  value={formData.fundingPurpose}
                  onChange={(e) => handleInputChange("fundingPurpose", e.target.value)}
                  placeholder="Be specific: equipment, salaries, marketing, inventory, programs, etc."
                  rows={5}
                />
              </div>

              <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> Break down your funding needs by category. For example:
                  <br />• Equipment: $5,000
                  <br />• Marketing: $3,000
                  <br />• Operating expenses (6 months): $12,000
                  <br />• Staff/contractors: $10,000
                </p>
              </Card>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Review Your Business Plan</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Review your business plan below. This information will auto-populate
                    in the Grant Simulator and other modules.
                  </p>
                </div>
              </div>
            </div>

            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{formData.entityName || "Unnamed Entity"}</h3>
                <Badge>{ENTITY_TYPES.find(t => t.value === formData.entityType)?.label || formData.entityType}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mission Statement</p>
                  <p className="text-sm mt-1">{formData.missionStatement || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vision Statement</p>
                  <p className="text-sm mt-1">{formData.visionStatement || "Not provided"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Organization Description</p>
                <p className="text-sm mt-1">{formData.organizationDescription || "Not provided"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                  <p className="text-sm mt-1">{formData.teamSize || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Funding Needed</p>
                  <p className="text-sm mt-1">${formData.fundingNeeded || "0"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year Founded</p>
                  <p className="text-sm mt-1">{formData.yearFounded}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Selected Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTeamMembers.map(id => {
                    const member = TEAM_MEMBERS.find(m => m.id === id);
                    return member ? (
                      <Badge key={id} variant="secondary">{member.name}</Badge>
                    ) : null;
                  })}
                  {formData.selectedTeamMembers.length === 0 && (
                    <span className="text-sm text-muted-foreground">No team members selected</span>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-bold text-green-800 dark:text-green-200">Ready to Complete!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Click "Complete Business Plan" to save and receive your certificate.
                    Earn 150 LUV tokens!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (showCertificate) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <CompletionCertificate
            recipientName="Shanna Russell"
            entityName={formData.entityName || "Business Plan"}
            entityType={(formData.entityType as "llc" | "trust" | "nonprofit" | "collective") || "llc"}
            completionDate={new Date().toLocaleDateString()}
            certificateNumber={`BP-${Date.now().toString(36).toUpperCase()}`}
            managerName="Business Development"
            managerTitle="Simulator Manager"
            trainingManagerName="Cornelius"
            trainingManagerTitle="Education/Training Manager"
            tokensEarned={150}
          />
          
          <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <h3 className="font-bold text-lg mb-3">What's Next?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your business plan data will now auto-populate in the Grant Simulator.
              You're ready to apply for funding!
            </p>
            <div className="flex gap-3">
              <Button onClick={() => window.location.href = "/grant-simulator"}>
                Start Grant Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/grants"}>
                View Grant Opportunities
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Business Plan Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Create a business plan that auto-populates in grant applications
          </p>
        </div>

        {/* Progress */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{currentStep} of {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    isActive ? "text-green-600" : isComplete ? "text-green-500" : "text-muted-foreground"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? "bg-green-100 dark:bg-green-900" : 
                    isComplete ? "bg-green-50 dark:bg-green-950" : "bg-muted"
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Current Step Content */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            {(() => {
              const Icon = STEPS[currentStep - 1].icon;
              return <Icon className="w-5 h-5 text-green-600" />;
            })()}
            Step {currentStep}: {STEPS[currentStep - 1].title}
          </h2>
          
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="bg-green-700 hover:bg-green-800">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-green-700 hover:bg-green-800">
              Complete Business Plan
              <Award className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
