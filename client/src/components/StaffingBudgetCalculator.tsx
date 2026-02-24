import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calculator,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  Bot,
  Briefcase,
  Building2,
  FileText,
  Package,
  GraduationCap,
  Heart,
  Megaphone,
  Settings,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface Position {
  id: string;
  title: string;
  tier: string;
  department: string;
  salary: number;
  initialOffer: number;
  aiAssistant: string;
  productivityMultiplier: number;
  status: "filled" | "open";
  holder?: string;
  familyRate?: boolean;
  adjustedSalary?: number;
}

interface GrantBundle {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  grantTypes: string[];
  positionIds: string[];
  typicalAmount: string;
  focusAreas: string[];
}

const POSITIONS: Position[] = [
  // Tier 1 - Executive
  { id: "CEO-001", title: "CEO/Matriarch", tier: "Tier 1", department: "Executive", salary: 153000, initialOffer: 137700, aiAssistant: "Operations + Guardian", productivityMultiplier: 4, status: "filled", holder: "LaShanna Russell" },
  { id: "CFO-001", title: "CFO", tier: "Tier 1", department: "Finance", salary: 135000, initialOffer: 121500, aiAssistant: "Finance + Analytics", productivityMultiplier: 4, status: "open" },
  { id: "COO-001", title: "COO", tier: "Tier 1", department: "Operations", salary: 135000, initialOffer: 121500, aiAssistant: "Operations + QA/QC", productivityMultiplier: 4, status: "open" },
  
  // Tier 2 - Directors
  { id: "ED-001", title: "Executive Director", tier: "Tier 2", department: "Executive", salary: 121500, initialOffer: 109350, aiAssistant: "Operations + Support", productivityMultiplier: 3.5, status: "open" },
  { id: "LCD-001", title: "Legal/Compliance Director", tier: "Tier 2", department: "Legal", salary: 121500, initialOffer: 109350, aiAssistant: "Guardian + QA/QC", productivityMultiplier: 3.5, status: "open" },
  { id: "OD-001", title: "Operations Director", tier: "Tier 2", department: "Operations", salary: 121500, initialOffer: 109350, aiAssistant: "Operations + Analytics", productivityMultiplier: 3.5, status: "open" },
  
  // Tier 3 - Managers (Filled - Family)
  { id: "FM-001", title: "Finance Manager", tier: "Tier 3", department: "Finance", salary: 102000, initialOffer: 91800, aiAssistant: "Finance", productivityMultiplier: 3, status: "filled", holder: "Craig", familyRate: true, adjustedSalary: 86700 },
  { id: "EM-001", title: "Education Manager", tier: "Tier 3", department: "Education", salary: 102000, initialOffer: 91800, aiAssistant: "Education + Media", productivityMultiplier: 3, status: "filled", holder: "Cornelius", familyRate: true, adjustedSalary: 86700 },
  { id: "MM-001", title: "Media Manager", tier: "Tier 3", department: "Media", salary: 102000, initialOffer: 91800, aiAssistant: "Media + Design", productivityMultiplier: 3, status: "filled", holder: "Amandes", familyRate: true, adjustedSalary: 86700 },
  { id: "DM-001", title: "Design Manager", tier: "Tier 3", department: "Design", salary: 102000, initialOffer: 91800, aiAssistant: "Design + Media", productivityMultiplier: 3, status: "filled", holder: "Essence", familyRate: true, adjustedSalary: 86700 },
  { id: "HM-001", title: "Health Manager", tier: "Tier 3", department: "Health", salary: 102000, initialOffer: 91800, aiAssistant: "Health", productivityMultiplier: 3, status: "filled", holder: "Amber S. Hunter, RN", familyRate: true, adjustedSalary: 86700 },
  
  // Tier 3 - Managers (Open)
  { id: "HRM-001", title: "HR Manager", tier: "Tier 3", department: "Human Resources", salary: 108000, initialOffer: 97200, aiAssistant: "HR", productivityMultiplier: 3, status: "open" },
  { id: "GM-001", title: "Grant Manager", tier: "Tier 3", department: "Grants", salary: 103500, initialOffer: 93150, aiAssistant: "Analytics + Support", productivityMultiplier: 3, status: "open" },
  { id: "OM-001", title: "Operations Manager", tier: "Tier 3", department: "Operations", salary: 108000, initialOffer: 97200, aiAssistant: "Operations", productivityMultiplier: 3, status: "open" },
  { id: "QM-001", title: "QA/QC Manager", tier: "Tier 3", department: "Quality", salary: 108000, initialOffer: 97200, aiAssistant: "QA/QC", productivityMultiplier: 3, status: "open" },
  { id: "PM-001", title: "Procurement Manager", tier: "Tier 3", department: "Procurement", salary: 108000, initialOffer: 97200, aiAssistant: "Purchasing", productivityMultiplier: 3, status: "open" },
  { id: "PCM-001", title: "Project Controls Manager", tier: "Tier 3", department: "Project Controls", salary: 108000, initialOffer: 97200, aiAssistant: "Analytics + Operations", productivityMultiplier: 3, status: "open" },
  
  // Tier 4 - Coordinators
  { id: "EOC-001", title: "Education Ops Coordinator", tier: "Tier 4", department: "Education", salary: 79200, initialOffer: 71280, aiAssistant: "Education", productivityMultiplier: 2.5, status: "open" },
  { id: "HOC-001", title: "Health Ops Coordinator", tier: "Tier 4", department: "Health", salary: 79200, initialOffer: 71280, aiAssistant: "Health", productivityMultiplier: 2.5, status: "open" },
  { id: "DOC-001", title: "Design Ops Coordinator", tier: "Tier 4", department: "Design", salary: 79200, initialOffer: 71280, aiAssistant: "Design", productivityMultiplier: 2.5, status: "open" },
  { id: "MOC-001", title: "Media Ops Coordinator", tier: "Tier 4", department: "Media", salary: 79200, initialOffer: 71280, aiAssistant: "Media + Outreach", productivityMultiplier: 2.5, status: "open" },
  { id: "FOC-001", title: "Finance Ops Coordinator", tier: "Tier 4", department: "Finance", salary: 79200, initialOffer: 71280, aiAssistant: "Finance", productivityMultiplier: 2.5, status: "open" },
  { id: "GC-001", title: "Grant Coordinator", tier: "Tier 4", department: "Grants", salary: 79200, initialOffer: 71280, aiAssistant: "Analytics", productivityMultiplier: 2.5, status: "open" },
  { id: "HROC-001", title: "HR Ops Coordinator", tier: "Tier 4", department: "Human Resources", salary: 79200, initialOffer: 71280, aiAssistant: "HR", productivityMultiplier: 2.5, status: "open" },
  { id: "EBC-001", title: "Executive Business Coordinator", tier: "Tier 4", department: "Executive", salary: 79200, initialOffer: 71280, aiAssistant: "Support + Operations", productivityMultiplier: 2.5, status: "open" },
  
  // Tier 5 - Specialists
  { id: "PA-001", title: "Platform Administrator", tier: "Tier 5", department: "IT", salary: 70200, initialOffer: 63180, aiAssistant: "Support + Operations", productivityMultiplier: 2, status: "open" },
  { id: "GW-001", title: "Grant Writer", tier: "Tier 5", department: "Grants", salary: 64800, initialOffer: 58320, aiAssistant: "Media + Analytics", productivityMultiplier: 3, status: "open" },
  { id: "BA-001", title: "Benefits Administrator", tier: "Tier 5", department: "Human Resources", salary: 67500, initialOffer: 60750, aiAssistant: "HR + Finance", productivityMultiplier: 2, status: "open" },
  { id: "BSS1-001", title: "Business Support Specialist I", tier: "Tier 5", department: "Operations", salary: 64800, initialOffer: 58320, aiAssistant: "Support", productivityMultiplier: 2, status: "open" },
  { id: "BSS2-001", title: "Business Support Specialist II", tier: "Tier 5", department: "Operations", salary: 64800, initialOffer: 58320, aiAssistant: "Support", productivityMultiplier: 2, status: "open" },
];

const GRANT_BUNDLES: GrantBundle[] = [
  {
    id: "workforce-dev",
    name: "Workforce Development",
    description: "Staff for workforce training, career development, and employment programs. Ideal for DOL, EDA, and workforce board grants.",
    icon: <GraduationCap className="w-5 h-5" />,
    grantTypes: ["DOL Workforce Innovation", "EDA Economic Development", "State Workforce Boards", "WIOA Programs"],
    positionIds: ["GM-001", "GW-001", "GC-001", "EOC-001", "HRM-001", "HROC-001", "BSS1-001"],
    typicalAmount: "$250,000 - $750,000",
    focusAreas: ["Job Training", "Career Pathways", "Skills Development", "Employment Services"],
  },
  {
    id: "community-health",
    name: "Community Health & Wellness",
    description: "Staff for community health programs, wellness initiatives, and social services. Perfect for HRSA, CDC, and foundation health grants.",
    icon: <Heart className="w-5 h-5" />,
    grantTypes: ["HRSA Community Health", "CDC Prevention Programs", "Foundation Health Grants", "State Health Departments"],
    positionIds: ["HOC-001", "EOC-001", "BSS1-001", "BSS2-001", "EBC-001"],
    typicalAmount: "$150,000 - $500,000",
    focusAreas: ["Community Wellness", "Health Education", "Prevention Programs", "Social Determinants"],
  },
  {
    id: "media-outreach",
    name: "Media & Community Outreach",
    description: "Staff for communications, content creation, and community engagement. Suited for arts councils, media foundations, and outreach grants.",
    icon: <Megaphone className="w-5 h-5" />,
    grantTypes: ["NEA Arts Grants", "Media Foundations", "Community Foundations", "Corporate Sponsorships"],
    positionIds: ["MOC-001", "DOC-001", "GW-001", "BSS1-001"],
    typicalAmount: "$75,000 - $300,000",
    focusAreas: ["Content Creation", "Community Engagement", "Brand Development", "Public Relations"],
  },
  {
    id: "admin-core",
    name: "Administrative Core",
    description: "Essential administrative staff for organizational capacity building. Required foundation for any major grant program.",
    icon: <Settings className="w-5 h-5" />,
    grantTypes: ["Capacity Building Grants", "General Operating Support", "Foundation Core Support", "SBA Programs"],
    positionIds: ["HRM-001", "OM-001", "FOC-001", "HROC-001", "BA-001", "EBC-001"],
    typicalAmount: "$200,000 - $500,000",
    focusAreas: ["Organizational Capacity", "Financial Management", "HR Systems", "Operations"],
  },
  {
    id: "grant-team",
    name: "Grant Development Team",
    description: "Dedicated staff for grant acquisition, management, and compliance. Essential for organizations scaling grant revenue.",
    icon: <FileText className="w-5 h-5" />,
    grantTypes: ["Foundation Grants", "Federal Grants", "State Grants", "Corporate Grants"],
    positionIds: ["GM-001", "GW-001", "GC-001", "FOC-001"],
    typicalAmount: "$150,000 - $400,000",
    focusAreas: ["Grant Writing", "Compliance", "Reporting", "Funder Relations"],
  },
  {
    id: "education-program",
    name: "Education Program",
    description: "Staff for educational programs, curriculum development, and training delivery. Ideal for ED, foundation, and corporate education grants.",
    icon: <GraduationCap className="w-5 h-5" />,
    grantTypes: ["Department of Education", "Education Foundations", "Corporate Training Grants", "State Education"],
    positionIds: ["EOC-001", "DOC-001", "PA-001", "BSS1-001"],
    typicalAmount: "$200,000 - $600,000",
    focusAreas: ["Curriculum Development", "Training Delivery", "Student Support", "Program Evaluation"],
  },
  {
    id: "full-operations",
    name: "Full Operations Scale-Up",
    description: "Complete staffing package for major organizational expansion. For large federal grants or significant foundation investments.",
    icon: <Layers className="w-5 h-5" />,
    grantTypes: ["Major Federal Grants", "Large Foundation Awards", "Multi-Year Programs", "Scaling Initiatives"],
    positionIds: ["ED-001", "OD-001", "GM-001", "HRM-001", "OM-001", "QM-001", "GW-001", "GC-001", "EOC-001", "HOC-001", "DOC-001", "MOC-001", "FOC-001", "HROC-001", "EBC-001", "PA-001", "BA-001", "BSS1-001", "BSS2-001"],
    typicalAmount: "$1,000,000 - $3,000,000",
    focusAreas: ["Organizational Scale", "Program Expansion", "Infrastructure", "Sustainability"],
  },
  {
    id: "executive-leadership",
    name: "Executive Leadership",
    description: "Senior leadership positions for organizations ready to professionalize management. For capacity building and leadership development grants.",
    icon: <Building2 className="w-5 h-5" />,
    grantTypes: ["Leadership Development", "Capacity Building", "Executive Transition", "Strategic Growth"],
    positionIds: ["CFO-001", "COO-001", "ED-001", "LCD-001", "OD-001"],
    typicalAmount: "$500,000 - $1,500,000",
    focusAreas: ["Executive Leadership", "Strategic Management", "Governance", "Organizational Development"],
  },
];

const FRINGE_RATE = 0.20;
const OVERHEAD_RATE = 0.15;

export default function StaffingBudgetCalculator() {
  const [selectedPositions, setSelectedPositions] = useState<Set<string>>(new Set());
  const [grantAmount, setGrantAmount] = useState<number>(500000);
  const [grantYears, setGrantYears] = useState<number>(2);
  const [selectedBundle, setSelectedBundle] = useState<string>("");

  const togglePosition = (id: string) => {
    const newSelected = new Set(selectedPositions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPositions(newSelected);
    setSelectedBundle(""); // Clear bundle when manually toggling
  };

  const selectTier = (tier: string) => {
    const tierPositions = POSITIONS.filter(p => p.tier === tier && p.status === "open");
    const newSelected = new Set(selectedPositions);
    tierPositions.forEach(p => newSelected.add(p.id));
    setSelectedPositions(newSelected);
    setSelectedBundle("");
  };

  const selectBundle = (bundleId: string) => {
    if (!bundleId) {
      setSelectedBundle("");
      return;
    }
    const bundle = GRANT_BUNDLES.find(b => b.id === bundleId);
    if (bundle) {
      const newSelected = new Set<string>();
      bundle.positionIds.forEach(id => {
        const position = POSITIONS.find(p => p.id === id);
        if (position && position.status === "open") {
          newSelected.add(id);
        }
      });
      setSelectedPositions(newSelected);
      setSelectedBundle(bundleId);
      toast.success(`${bundle.name} bundle applied`);
    }
  };

  const clearSelection = () => {
    setSelectedPositions(new Set());
    setSelectedBundle("");
  };

  const calculations = useMemo(() => {
    const selected = POSITIONS.filter(p => selectedPositions.has(p.id));
    
    const totalSalaries = selected.reduce((sum, p) => sum + p.initialOffer, 0);
    const annualSalaries = totalSalaries;
    const totalFringe = annualSalaries * FRINGE_RATE;
    const totalPersonnel = annualSalaries + totalFringe;
    const totalOverhead = totalPersonnel * OVERHEAD_RATE;
    const grandTotal = totalPersonnel + totalOverhead;
    const multiYearTotal = grandTotal * grantYears;
    
    // Calculate traditional equivalent
    const avgMultiplier = selected.length > 0 
      ? selected.reduce((sum, p) => sum + p.productivityMultiplier, 0) / selected.length 
      : 1;
    const traditionalEquivalent = selected.length * avgMultiplier;
    const traditionalCost = traditionalEquivalent * (annualSalaries / selected.length || 0) * (1 + FRINGE_RATE) * (1 + OVERHEAD_RATE);
    const costSavings = traditionalCost - grandTotal;
    const roiMultiplier = traditionalCost > 0 ? traditionalCost / grandTotal : 0;
    
    return {
      positionCount: selected.length,
      annualSalaries,
      totalFringe,
      totalPersonnel,
      totalOverhead,
      grandTotal,
      multiYearTotal,
      traditionalEquivalent: Math.round(traditionalEquivalent),
      traditionalCost,
      costSavings,
      roiMultiplier,
      avgMultiplier,
      fitsInBudget: multiYearTotal <= grantAmount,
      budgetUtilization: grantAmount > 0 ? (multiYearTotal / grantAmount) * 100 : 0,
    };
  }, [selectedPositions, grantYears, grantAmount]);

  const currentBundle = GRANT_BUNDLES.find(b => b.id === selectedBundle);

  const exportBudget = () => {
    const selected = POSITIONS.filter(p => selectedPositions.has(p.id));
    const budgetData = {
      generatedAt: new Date().toISOString(),
      bundleUsed: currentBundle ? {
        name: currentBundle.name,
        description: currentBundle.description,
        grantTypes: currentBundle.grantTypes,
        focusAreas: currentBundle.focusAreas,
      } : null,
      grantParameters: {
        totalAmount: grantAmount,
        durationYears: grantYears,
      },
      positions: selected.map(p => ({
        title: p.title,
        tier: p.tier,
        department: p.department,
        annualSalary: p.initialOffer,
        aiAssistant: p.aiAssistant,
        productivityMultiplier: p.productivityMultiplier,
      })),
      calculations: {
        annualSalaries: calculations.annualSalaries,
        fringeBenefits: calculations.totalFringe,
        totalPersonnel: calculations.totalPersonnel,
        overhead: calculations.totalOverhead,
        annualTotal: calculations.grandTotal,
        multiYearTotal: calculations.multiYearTotal,
      },
      roiAnalysis: {
        traditionalStaffEquivalent: calculations.traditionalEquivalent,
        traditionalCost: calculations.traditionalCost,
        costSavings: calculations.costSavings,
        roiMultiplier: calculations.roiMultiplier.toFixed(2),
      },
      budgetNarrative: `This staffing budget requests funding for ${selected.length} positions over ${grantYears} years${currentBundle ? ` using the ${currentBundle.name} staffing bundle` : ''}. Through AI-assisted workflows, these positions will deliver output equivalent to ${calculations.traditionalEquivalent} traditional staff members, representing a ${calculations.roiMultiplier.toFixed(1)}x return on investment. Each position leverages dedicated AI agent assistants to multiply productivity while maintaining human oversight and expertise.`,
      workforceToOwnership: "All positions are designed to support the transition from traditional employment to business ownership. Staff members who complete their tenure can transition to independent contractor status using the skills and AI tools they've mastered, building generational wealth through self-employment.",
    };
    
    const blob = new Blob([JSON.stringify(budgetData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staffing_budget_${currentBundle?.id || 'custom'}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Budget exported successfully");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Grant Bundles Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Grant Staffing Bundles
              </CardTitle>
              <CardDescription>
                Pre-configured position packages for common grant types
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {GRANT_BUNDLES.map(bundle => (
              <Card 
                key={bundle.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBundle === bundle.id ? "border-primary ring-2 ring-primary/20" : ""
                }`}
                onClick={() => selectBundle(bundle.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${selectedBundle === bundle.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {bundle.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{bundle.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bundle.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {bundle.positionIds.length} positions
                        </Badge>
                        <span className="text-xs text-muted-foreground">{bundle.typicalAmount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {currentBundle && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {currentBundle.icon}
                    {currentBundle.name} Bundle Selected
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{currentBundle.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Typical Grant Types</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentBundle.grantTypes.map((type, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Focus Areas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentBundle.focusAreas.map((area, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculator Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Staffing Budget Calculator
              </CardTitle>
              <CardDescription>
                Build grant staffing budgets with AI-assisted workflow ROI analysis
              </CardDescription>
            </div>
            <Button onClick={exportBudget} disabled={selectedPositions.size === 0} className="gap-2">
              <Download className="w-4 h-4" />
              Export Budget
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="grantAmount">Grant Amount ($)</Label>
              <Input
                id="grantAmount"
                type="number"
                value={grantAmount}
                onChange={(e) => setGrantAmount(Number(e.target.value))}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grantYears">Grant Duration (Years)</Label>
              <Input
                id="grantYears"
                type="number"
                value={grantYears}
                onChange={(e) => setGrantYears(Number(e.target.value))}
                min={1}
                max={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => selectTier("Tier 3")}>Managers</Button>
                <Button size="sm" variant="outline" onClick={() => selectTier("Tier 4")}>Coordinators</Button>
                <Button size="sm" variant="outline" onClick={() => selectTier("Tier 5")}>Specialists</Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Position Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Positions for Grant
              </CardTitle>
              <CardDescription>
                Choose positions to include in staffing budget (open positions only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Tier 3">
                <TabsList className="mb-4">
                  <TabsTrigger value="Tier 1">Executive</TabsTrigger>
                  <TabsTrigger value="Tier 2">Directors</TabsTrigger>
                  <TabsTrigger value="Tier 3">Managers</TabsTrigger>
                  <TabsTrigger value="Tier 4">Coordinators</TabsTrigger>
                  <TabsTrigger value="Tier 5">Specialists</TabsTrigger>
                </TabsList>
                
                {["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"].map(tier => (
                  <TabsContent key={tier} value={tier} className="space-y-2">
                    {POSITIONS.filter(p => p.tier === tier).map(position => (
                      <div
                        key={position.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          position.status === "filled" 
                            ? "bg-muted/50 opacity-60" 
                            : selectedPositions.has(position.id)
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedPositions.has(position.id)}
                            onCheckedChange={() => togglePosition(position.id)}
                            disabled={position.status === "filled"}
                          />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {position.title}
                              {position.status === "filled" && (
                                <Badge variant="secondary" className="text-xs">Filled</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{position.department}</span>
                              <span>•</span>
                              <Bot className="w-3 h-3" />
                              <span>{position.aiAssistant}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(position.initialOffer)}</div>
                          <div className="text-xs text-muted-foreground">
                            {position.productivityMultiplier}x productivity
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Budget Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Positions Selected</span>
                  <span className="font-medium">{calculations.positionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Annual Salaries (90%)</span>
                  <span className="font-medium">{formatCurrency(calculations.annualSalaries)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fringe Benefits (20%)</span>
                  <span className="font-medium">{formatCurrency(calculations.totalFringe)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Total Personnel</span>
                  <span className="font-medium">{formatCurrency(calculations.totalPersonnel)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overhead (15%)</span>
                  <span className="font-medium">{formatCurrency(calculations.totalOverhead)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Annual Total</span>
                  <span>{formatCurrency(calculations.grandTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{grantYears}-Year Total</span>
                  <span className={calculations.fitsInBudget ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(calculations.multiYearTotal)}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Utilization</span>
                  <span>{calculations.budgetUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      calculations.budgetUtilization > 100 ? "bg-red-500" : 
                      calculations.budgetUtilization > 90 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(calculations.budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ROI Analysis
              </CardTitle>
              <CardDescription>
                AI-assisted productivity multiplier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {calculations.roiMultiplier.toFixed(1)}x
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Return on Investment
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Productivity Multiplier</span>
                  <span className="font-medium">{calculations.avgMultiplier.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Traditional Staff Equivalent</span>
                  <span className="font-medium">{calculations.traditionalEquivalent} positions</span>
                </div>
                <div className="flex justify-between">
                  <span>Traditional Cost</span>
                  <span className="font-medium">{formatCurrency(calculations.traditionalCost)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium border-t pt-2">
                  <span>Cost Savings</span>
                  <span>{formatCurrency(calculations.costSavings)}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Each position leverages AI agent assistants to multiply output. 
                Funders receive {calculations.traditionalEquivalent} positions worth of 
                productivity for the cost of {calculations.positionCount}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
