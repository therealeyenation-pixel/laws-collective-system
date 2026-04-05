import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Building2,
  Landmark,
  Sparkles,
  Download,
  Copy,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  DollarSign,
  Calendar,
  Users,
  Target,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ProposalData {
  // Basic Info
  proposalType: "commercial" | "government";
  opportunityTitle: string;
  clientName: string;
  solicitationNumber: string;
  dueDate: string;
  contractValue: string;
  
  // Company Info
  companyName: string;
  companyAddress: string;
  dunsNumber: string;
  cageCode: string;
  naicsCode: string;
  samRegistration: string;
  
  // Technical Approach
  problemStatement: string;
  proposedSolution: string;
  methodology: string;
  deliverables: string;
  timeline: string;
  
  // Management Approach
  teamStructure: string;
  keyPersonnel: string;
  qualityControl: string;
  riskMitigation: string;
  
  // Past Performance
  pastProjects: string;
  references: string;
  
  // Pricing
  laborCosts: string;
  materialCosts: string;
  indirectCosts: string;
  profitMargin: string;
  totalPrice: string;
}

const initialProposalData: ProposalData = {
  proposalType: "commercial",
  opportunityTitle: "",
  clientName: "",
  solicitationNumber: "",
  dueDate: "",
  contractValue: "",
  companyName: "",
  companyAddress: "",
  dunsNumber: "",
  cageCode: "",
  naicsCode: "",
  samRegistration: "",
  problemStatement: "",
  proposedSolution: "",
  methodology: "",
  deliverables: "",
  timeline: "",
  teamStructure: "",
  keyPersonnel: "",
  qualityControl: "",
  riskMitigation: "",
  pastProjects: "",
  references: "",
  laborCosts: "",
  materialCosts: "",
  indirectCosts: "",
  profitMargin: "",
  totalPrice: "",
};

const steps = [
  { id: 1, title: "Opportunity Info", icon: Target },
  { id: 2, title: "Company Profile", icon: Building2 },
  { id: 3, title: "Technical Approach", icon: FileText },
  { id: 4, title: "Management", icon: Users },
  { id: 5, title: "Past Performance", icon: Briefcase },
  { id: 6, title: "Pricing", icon: DollarSign },
  { id: 7, title: "Review & Generate", icon: FileCheck },
];

export default function ProposalSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalData, setProposalData] = useState<ProposalData>(initialProposalData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null);

  const updateField = (field: keyof ProposalData, value: string) => {
    setProposalData((prev) => ({ ...prev, [field]: value }));
  };

  const progress = (currentStep / steps.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return proposalData.opportunityTitle && proposalData.clientName;
      case 2:
        return proposalData.companyName;
      case 3:
        return proposalData.problemStatement && proposalData.proposedSolution;
      case 4:
        return proposalData.teamStructure;
      case 5:
        return true; // Optional
      case 6:
        return proposalData.totalPrice;
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const proposal = generateProposalContent();
    setGeneratedProposal(proposal);
    setIsGenerating(false);
    toast.success("Proposal generated successfully!");
  };

  const generateProposalContent = () => {
    const isGov = proposalData.proposalType === "government";
    
    return `
# ${isGov ? "TECHNICAL AND COST PROPOSAL" : "BUSINESS PROPOSAL"}

## ${proposalData.opportunityTitle}

**Submitted to:** ${proposalData.clientName}
${isGov ? `**Solicitation Number:** ${proposalData.solicitationNumber}` : ""}
**Submitted by:** ${proposalData.companyName}
**Date:** ${new Date().toLocaleDateString()}

---

## EXECUTIVE SUMMARY

${proposalData.companyName} is pleased to submit this proposal in response to ${proposalData.clientName}'s requirement for ${proposalData.opportunityTitle}. Our team brings extensive experience and a proven track record of delivering high-quality solutions that meet and exceed client expectations.

---

## 1. TECHNICAL APPROACH

### 1.1 Understanding of the Problem
${proposalData.problemStatement}

### 1.2 Proposed Solution
${proposalData.proposedSolution}

### 1.3 Methodology
${proposalData.methodology || "Our methodology follows industry best practices and is tailored to meet the specific requirements of this engagement."}

### 1.4 Deliverables
${proposalData.deliverables || "Deliverables will be provided according to the schedule outlined in this proposal."}

### 1.5 Timeline
${proposalData.timeline || "Project timeline will be finalized upon contract award."}

---

## 2. MANAGEMENT APPROACH

### 2.1 Team Structure
${proposalData.teamStructure}

### 2.2 Key Personnel
${proposalData.keyPersonnel || "Key personnel will be assigned based on project requirements."}

### 2.3 Quality Control
${proposalData.qualityControl || "Our quality control processes ensure deliverables meet the highest standards."}

### 2.4 Risk Mitigation
${proposalData.riskMitigation || "We employ proactive risk identification and mitigation strategies throughout the project lifecycle."}

---

## 3. PAST PERFORMANCE

### 3.1 Relevant Experience
${proposalData.pastProjects || "Our team has successfully completed numerous similar projects."}

### 3.2 References
${proposalData.references || "References available upon request."}

---

## 4. PRICING

| Category | Amount |
|----------|--------|
| Labor Costs | ${proposalData.laborCosts || "TBD"} |
| Material Costs | ${proposalData.materialCosts || "TBD"} |
| Indirect Costs | ${proposalData.indirectCosts || "TBD"} |
| Profit/Fee | ${proposalData.profitMargin || "TBD"} |
| **Total Price** | **${proposalData.totalPrice}** |

---

## 5. COMPANY INFORMATION

**Company Name:** ${proposalData.companyName}
**Address:** ${proposalData.companyAddress || "Address on file"}
${isGov ? `
**DUNS Number:** ${proposalData.dunsNumber || "N/A"}
**CAGE Code:** ${proposalData.cageCode || "N/A"}
**NAICS Code:** ${proposalData.naicsCode || "N/A"}
**SAM Registration:** ${proposalData.samRegistration || "Active"}
` : ""}

---

*This proposal is valid for 90 days from the date of submission.*
    `.trim();
  };

  const handleCopy = () => {
    if (generatedProposal) {
      navigator.clipboard.writeText(generatedProposal);
      toast.success("Proposal copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (generatedProposal) {
      const blob = new Blob([generatedProposal], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${proposalData.opportunityTitle.toLowerCase().replace(/\s+/g, "-")}.md`;
      a.click();
      toast.success("Proposal downloaded!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Proposal Generator</h1>
            <p className="text-muted-foreground">
              Create professional proposals for commercial and government opportunities
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            AI-Powered
          </Badge>
        </div>

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isComplete = step.id < currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1 ${
                    isActive
                      ? "text-primary"
                      : isComplete
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-primary text-white"
                        : isComplete
                        ? "bg-green-100 text-green-600"
                        : "bg-muted"
                    }`}
                  >
                    {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-xs hidden md:block">{step.title}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Opportunity Information</h2>
              </div>

              <Tabs
                value={proposalData.proposalType}
                onValueChange={(v) => updateField("proposalType", v as "commercial" | "government")}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="commercial" className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Commercial
                  </TabsTrigger>
                  <TabsTrigger value="government" className="gap-2">
                    <Landmark className="w-4 h-4" />
                    Government
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opportunity/Project Title *</Label>
                  <Input
                    value={proposalData.opportunityTitle}
                    onChange={(e) => updateField("opportunityTitle", e.target.value)}
                    placeholder="e.g., IT Support Services"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client/Agency Name *</Label>
                  <Input
                    value={proposalData.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    placeholder="e.g., Department of Defense"
                  />
                </div>
                {proposalData.proposalType === "government" && (
                  <div className="space-y-2">
                    <Label>Solicitation Number</Label>
                    <Input
                      value={proposalData.solicitationNumber}
                      onChange={(e) => updateField("solicitationNumber", e.target.value)}
                      placeholder="e.g., W911NF-24-R-0001"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={proposalData.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Contract Value</Label>
                  <Input
                    value={proposalData.contractValue}
                    onChange={(e) => updateField("contractValue", e.target.value)}
                    placeholder="e.g., $500,000"
                  />
                </div>
              </div>

              {proposalData.proposalType === "government" && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">Government Proposal Requirements</p>
                      <p className="mt-1">
                        Government proposals typically require compliance with FAR/DFAR regulations,
                        specific formatting, and additional certifications. Ensure your SAM.gov
                        registration is current.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Company Profile</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input
                    value={proposalData.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input
                    value={proposalData.companyAddress}
                    onChange={(e) => updateField("companyAddress", e.target.value)}
                    placeholder="Full business address"
                  />
                </div>
                {proposalData.proposalType === "government" && (
                  <>
                    <div className="space-y-2">
                      <Label>DUNS/UEI Number</Label>
                      <Input
                        value={proposalData.dunsNumber}
                        onChange={(e) => updateField("dunsNumber", e.target.value)}
                        placeholder="Unique Entity Identifier"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CAGE Code</Label>
                      <Input
                        value={proposalData.cageCode}
                        onChange={(e) => updateField("cageCode", e.target.value)}
                        placeholder="5-character code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Primary NAICS Code</Label>
                      <Input
                        value={proposalData.naicsCode}
                        onChange={(e) => updateField("naicsCode", e.target.value)}
                        placeholder="e.g., 541512"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SAM.gov Registration Status</Label>
                      <Select
                        value={proposalData.samRegistration}
                        onValueChange={(v) => updateField("samRegistration", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="expired">Expired - Needs Renewal</SelectItem>
                          <SelectItem value="not-registered">Not Registered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Technical Approach</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Problem Statement / Understanding of Requirements *</Label>
                  <Textarea
                    value={proposalData.problemStatement}
                    onChange={(e) => updateField("problemStatement", e.target.value)}
                    placeholder="Describe your understanding of the client's needs and challenges..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proposed Solution *</Label>
                  <Textarea
                    value={proposalData.proposedSolution}
                    onChange={(e) => updateField("proposedSolution", e.target.value)}
                    placeholder="Describe your proposed solution and approach..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Methodology</Label>
                  <Textarea
                    value={proposalData.methodology}
                    onChange={(e) => updateField("methodology", e.target.value)}
                    placeholder="Describe your methodology and processes..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Key Deliverables</Label>
                    <Textarea
                      value={proposalData.deliverables}
                      onChange={(e) => updateField("deliverables", e.target.value)}
                      placeholder="List major deliverables..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeline / Schedule</Label>
                    <Textarea
                      value={proposalData.timeline}
                      onChange={(e) => updateField("timeline", e.target.value)}
                      placeholder="Outline project phases and milestones..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Management Approach</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Structure / Organization *</Label>
                  <Textarea
                    value={proposalData.teamStructure}
                    onChange={(e) => updateField("teamStructure", e.target.value)}
                    placeholder="Describe your team organization and reporting structure..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key Personnel</Label>
                  <Textarea
                    value={proposalData.keyPersonnel}
                    onChange={(e) => updateField("keyPersonnel", e.target.value)}
                    placeholder="List key team members and their qualifications..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quality Control Plan</Label>
                    <Textarea
                      value={proposalData.qualityControl}
                      onChange={(e) => updateField("qualityControl", e.target.value)}
                      placeholder="Describe quality assurance processes..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Mitigation</Label>
                    <Textarea
                      value={proposalData.riskMitigation}
                      onChange={(e) => updateField("riskMitigation", e.target.value)}
                      placeholder="Identify risks and mitigation strategies..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Past Performance</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Relevant Past Projects</Label>
                  <Textarea
                    value={proposalData.pastProjects}
                    onChange={(e) => updateField("pastProjects", e.target.value)}
                    placeholder="Describe 2-3 similar projects you've completed, including scope, outcomes, and contract values..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>References</Label>
                  <Textarea
                    value={proposalData.references}
                    onChange={(e) => updateField("references", e.target.value)}
                    placeholder="List client references with contact information..."
                    rows={4}
                  />
                </div>
              </div>

              <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">Past Performance Tips</p>
                    <p className="mt-1">
                      Include projects similar in scope, size, and complexity. For government
                      proposals, include CPARS ratings if available.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Direct Labor Costs</Label>
                  <Input
                    value={proposalData.laborCosts}
                    onChange={(e) => updateField("laborCosts", e.target.value)}
                    placeholder="$0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materials / ODCs</Label>
                  <Input
                    value={proposalData.materialCosts}
                    onChange={(e) => updateField("materialCosts", e.target.value)}
                    placeholder="$0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Indirect Costs (Overhead, G&A)</Label>
                  <Input
                    value={proposalData.indirectCosts}
                    onChange={(e) => updateField("indirectCosts", e.target.value)}
                    placeholder="$0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profit / Fee</Label>
                  <Input
                    value={proposalData.profitMargin}
                    onChange={(e) => updateField("profitMargin", e.target.value)}
                    placeholder="$0.00"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-lg">Total Proposed Price *</Label>
                  <Input
                    value={proposalData.totalPrice}
                    onChange={(e) => updateField("totalPrice", e.target.value)}
                    placeholder="$0.00"
                    className="text-xl font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Review & Generate</h2>
              </div>

              {!generatedProposal ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Opportunity</h3>
                      <p className="text-sm text-muted-foreground">{proposalData.opportunityTitle}</p>
                      <p className="text-sm text-muted-foreground">{proposalData.clientName}</p>
                      <Badge variant="secondary" className="mt-2">
                        {proposalData.proposalType === "government" ? "Government" : "Commercial"}
                      </Badge>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Company</h3>
                      <p className="text-sm text-muted-foreground">{proposalData.companyName}</p>
                      <p className="text-sm text-muted-foreground">{proposalData.companyAddress}</p>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Pricing</h3>
                      <p className="text-2xl font-bold text-primary">{proposalData.totalPrice || "Not specified"}</p>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Due Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {proposalData.dueDate ? new Date(proposalData.dueDate).toLocaleDateString() : "Not specified"}
                      </p>
                    </Card>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Proposal...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Proposal
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button onClick={handleDownload} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => setGeneratedProposal(null)}
                      variant="outline"
                    >
                      Edit & Regenerate
                    </Button>
                  </div>
                  <Card className="p-6 bg-muted/50">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                      {generatedProposal}
                    </pre>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {currentStep < steps.length && (
              <Button
                onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
