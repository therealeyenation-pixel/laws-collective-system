import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  FileText,
  Shield,
  DollarSign,
  Users,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";

interface BusinessFormData {
  // Step 1: Business Type
  entityType: string;
  businessPurpose: string;
  
  // Step 2: Basic Info
  businessName: string;
  dba: string;
  industry: string;
  description: string;
  
  // Step 3: Location & Registration
  formationState: string;
  operatingState: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  
  // Step 4: Ownership
  ownerName: string;
  ownerTitle: string;
  ownershipPercentage: string;
  additionalOwners: string;
  
  // Step 5: Financial
  startupCapital: string;
  revenueProjection: string;
  fundingSources: string;
  bankingNeeds: string;
}

const entityTypes = [
  {
    type: "LLC",
    name: "Limited Liability Company",
    description: "Flexible structure with liability protection. Best for small businesses and real estate.",
    pros: ["Pass-through taxation", "Limited liability", "Flexible management"],
    cons: ["Self-employment tax", "State fees vary"],
    bestFor: "Small businesses, real estate, consulting",
  },
  {
    type: "S-Corp",
    name: "S Corporation",
    description: "Corporation with pass-through taxation. Good for businesses with profits over $40k.",
    pros: ["Save on self-employment tax", "Credibility", "Limited liability"],
    cons: ["Strict requirements", "Salary requirements", "More paperwork"],
    bestFor: "Profitable businesses, professional services",
  },
  {
    type: "C-Corp",
    name: "C Corporation",
    description: "Standard corporation with separate taxation. Best for raising investment capital.",
    pros: ["Unlimited shareholders", "Raise capital easily", "Separate taxation"],
    cons: ["Double taxation", "Complex compliance", "Higher costs"],
    bestFor: "Startups seeking investors, large businesses",
  },
  {
    type: "508",
    name: "508(c)(1)(A) Organization",
    description: "Tax-exempt religious/charitable organization. No IRS application required.",
    pros: ["Tax-exempt status", "No 501c3 application", "Donation deductibility"],
    cons: ["Must be religious/charitable", "Public benefit requirement"],
    bestFor: "Churches, ministries, faith-based organizations",
  },
  {
    type: "Trust",
    name: "Family Trust",
    description: "Asset protection and wealth transfer vehicle. Best for estate planning.",
    pros: ["Asset protection", "Avoid probate", "Privacy", "Tax benefits"],
    cons: ["Setup complexity", "Ongoing administration"],
    bestFor: "Estate planning, asset protection, wealth transfer",
  },
];

const formationStates = [
  { code: "DE", name: "Delaware", benefit: "Business-friendly laws, privacy" },
  { code: "WY", name: "Wyoming", benefit: "No state income tax, privacy" },
  { code: "NV", name: "Nevada", benefit: "No state income tax, privacy" },
  { code: "GA", name: "Georgia", benefit: "Low fees, growing economy" },
  { code: "TX", name: "Texas", benefit: "No state income tax" },
  { code: "FL", name: "Florida", benefit: "No state income tax" },
];

export default function BusinessSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessFormData>({
    entityType: "",
    businessPurpose: "",
    businessName: "",
    dba: "",
    industry: "",
    description: "",
    formationState: "",
    operatingState: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    ownerName: "",
    ownerTitle: "",
    ownershipPercentage: "100",
    additionalOwners: "",
    startupCapital: "",
    revenueProjection: "",
    fundingSources: "",
    bankingNeeds: "",
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof BusinessFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    { number: 1, title: "Entity Type", icon: <Building2 className="w-4 h-4" /> },
    { number: 2, title: "Basic Info", icon: <FileText className="w-4 h-4" /> },
    { number: 3, title: "Location", icon: <Shield className="w-4 h-4" /> },
    { number: 4, title: "Ownership", icon: <Users className="w-4 h-4" /> },
    { number: 5, title: "Financial", icon: <DollarSign className="w-4 h-4" /> },
    { number: 6, title: "Review", icon: <Check className="w-4 h-4" /> },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.entityType !== "";
      case 2:
        return formData.businessName !== "" && formData.industry !== "";
      case 3:
        return formData.formationState !== "";
      case 4:
        return formData.ownerName !== "";
      case 5:
        return true;
      default:
        return true;
    }
  };

  const getEstimatedCosts = () => {
    const costs = {
      formation: 0,
      registeredAgent: 150,
      ein: 0,
      operatingAgreement: 0,
      annualReport: 0,
    };

    switch (formData.formationState) {
      case "DE":
        costs.formation = 90;
        costs.annualReport = 300;
        break;
      case "WY":
        costs.formation = 100;
        costs.annualReport = 52;
        break;
      case "NV":
        costs.formation = 425;
        costs.annualReport = 150;
        break;
      case "GA":
        costs.formation = 100;
        costs.annualReport = 50;
        break;
      default:
        costs.formation = 150;
        costs.annualReport = 100;
    }

    if (formData.entityType === "Trust") {
      costs.formation = 500;
      costs.operatingAgreement = 1500;
    }

    return costs;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose Your Entity Type
              </h2>
              <p className="text-muted-foreground">
                Select the business structure that best fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entityTypes.map((entity) => (
                <Card
                  key={entity.type}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    formData.entityType === entity.type
                      ? "border-primary border-2 bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => updateFormData("entityType", entity.type)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={formData.entityType === entity.type ? "default" : "secondary"}>
                      {entity.type}
                    </Badge>
                    {formData.entityType === entity.type && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{entity.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{entity.description}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-green-600">Pros:</p>
                      <ul className="text-xs text-muted-foreground">
                        {entity.pros.map((pro, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-600" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Best for:</p>
                      <p className="text-xs text-muted-foreground">{entity.bestFor}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6">
              <Label>What is the primary purpose of this business?</Label>
              <Textarea
                placeholder="Describe what this business will do..."
                value={formData.businessPurpose}
                onChange={(e) => updateFormData("businessPurpose", e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Business Information
              </h2>
              <p className="text-muted-foreground">
                Enter the basic details about your business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Legal Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Acme Solutions LLC"
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will be your official registered name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dba">DBA / Trade Name (Optional)</Label>
                <Input
                  id="dba"
                  placeholder="e.g., Acme Co"
                  value={formData.dba}
                  onChange={(e) => updateFormData("dba", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  "Doing Business As" name if different from legal name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateFormData("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulting">Consulting & Professional Services</SelectItem>
                    <SelectItem value="technology">Technology & Software</SelectItem>
                    <SelectItem value="media">Media & Entertainment</SelectItem>
                    <SelectItem value="education">Education & Training</SelectItem>
                    <SelectItem value="healthcare">Healthcare & Wellness</SelectItem>
                    <SelectItem value="realestate">Real Estate</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="nonprofit">Nonprofit & Charitable</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your products, services, and target market..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Location & Registration
              </h2>
              <p className="text-muted-foreground">
                Choose where to form and operate your business
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Formation State *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Where your business will be legally registered
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formationStates.map((state) => (
                    <Card
                      key={state.code}
                      className={`p-4 cursor-pointer transition-all ${
                        formData.formationState === state.code
                          ? "border-primary border-2 bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => updateFormData("formationState", state.code)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-foreground">{state.name}</span>
                        {formData.formationState === state.code && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{state.benefit}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    placeholder="Street address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Operating State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="ZIP"
                    value={formData.zip}
                    onChange={(e) => updateFormData("zip", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Ownership Structure
              </h2>
              <p className="text-muted-foreground">
                Define who owns and manages the business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Primary Owner Name *</Label>
                <Input
                  id="ownerName"
                  placeholder="Full legal name"
                  value={formData.ownerName}
                  onChange={(e) => updateFormData("ownerName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerTitle">Title/Role</Label>
                <Select
                  value={formData.ownerTitle}
                  onValueChange={(value) => updateFormData("ownerTitle", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member (LLC)</SelectItem>
                    <SelectItem value="manager">Managing Member (LLC)</SelectItem>
                    <SelectItem value="president">President</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="trustee">Trustee</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownershipPercentage">Ownership Percentage</Label>
                <Input
                  id="ownershipPercentage"
                  type="number"
                  placeholder="100"
                  value={formData.ownershipPercentage}
                  onChange={(e) => updateFormData("ownershipPercentage", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="additionalOwners">Additional Owners (Optional)</Label>
                <Textarea
                  id="additionalOwners"
                  placeholder="List any additional owners with their names and ownership percentages..."
                  value={formData.additionalOwners}
                  onChange={(e) => updateFormData("additionalOwners", e.target.value)}
                />
              </div>
            </div>

            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Family Employment Opportunity
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Family members can be employed by LuvOnPurpose Autonomous Wealth System LLC 
                    to provide services, or contracted through 508 Academy & Outreach for training delivery.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Financial Planning
              </h2>
              <p className="text-muted-foreground">
                Outline your financial needs and projections
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startupCapital">Estimated Startup Capital</Label>
                <Select
                  value={formData.startupCapital}
                  onValueChange={(value) => updateFormData("startupCapital", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under5k">Under $5,000</SelectItem>
                    <SelectItem value="5k-25k">$5,000 - $25,000</SelectItem>
                    <SelectItem value="25k-100k">$25,000 - $100,000</SelectItem>
                    <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                    <SelectItem value="over500k">Over $500,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenueProjection">Year 1 Revenue Projection</Label>
                <Select
                  value={formData.revenueProjection}
                  onValueChange={(value) => updateFormData("revenueProjection", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under25k">Under $25,000</SelectItem>
                    <SelectItem value="25k-100k">$25,000 - $100,000</SelectItem>
                    <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                    <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                    <SelectItem value="over1m">Over $1,000,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingSources">Funding Sources</Label>
                <Select
                  value={formData.fundingSources}
                  onValueChange={(value) => updateFormData("fundingSources", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal Savings</SelectItem>
                    <SelectItem value="family">Family Investment</SelectItem>
                    <SelectItem value="grants">Grants</SelectItem>
                    <SelectItem value="loans">Business Loans</SelectItem>
                    <SelectItem value="investors">Outside Investors</SelectItem>
                    <SelectItem value="mixed">Multiple Sources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankingNeeds">Banking Needs</Label>
                <Select
                  value={formData.bankingNeeds}
                  onValueChange={(value) => updateFormData("bankingNeeds", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select needs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Business Checking</SelectItem>
                    <SelectItem value="merchant">Merchant Services (Accept Cards)</SelectItem>
                    <SelectItem value="credit">Business Credit Line</SelectItem>
                    <SelectItem value="full">Full Banking Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cost Estimate */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-bold text-foreground mb-4">Estimated Formation Costs</h3>
              <div className="space-y-2">
                {Object.entries(getEstimatedCosts()).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-medium text-foreground">
                      {value === 0 ? "Free" : `$${value}`}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Estimated</span>
                    <span className="text-primary">
                      ${Object.values(getEstimatedCosts()).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Review & Generate Documents
              </h2>
              <p className="text-muted-foreground">
                Review your information and generate formation documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Cards */}
              <Card className="p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Entity Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{formData.entityType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{formData.businessName || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State:</span>
                    <span className="font-medium">{formData.formationState || "Not set"}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ownership
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{formData.ownerName || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{formData.ownerTitle || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ownership:</span>
                    <span className="font-medium">{formData.ownershipPercentage}%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Financial
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Startup Capital:</span>
                    <span className="font-medium">{formData.startupCapital || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year 1 Revenue:</span>
                    <span className="font-medium">{formData.revenueProjection || "Not set"}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documents to Generate
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    Articles of Organization
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    Operating Agreement
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    EIN Application (SS-4)
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" />
                    Initial Resolutions
                  </li>
                </ul>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="gap-2">
                <Download className="w-4 h-4" />
                Generate Documents
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Save & Continue Later
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer">L.A.W.S. Collective</span>
            </Link>
            <Badge variant="outline">Business Setup Wizard</Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center ${
                  step.number <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    step.number < currentStep
                      ? "bg-primary text-white"
                      : step.number === currentStep
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-muted"
                  }`}
                >
                  {step.number < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-xs hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 md:p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
              disabled={currentStep === totalSteps || !canProceed()}
              className="gap-2"
            >
              {currentStep === totalSteps ? "Complete" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
