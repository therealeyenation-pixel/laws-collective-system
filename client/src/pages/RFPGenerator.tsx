import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Upload,
  Sparkles,
  Download,
  Copy,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  ListChecks,
  Scale,
  Clock,
  Target,
  FileCheck,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface RFPRequirement {
  id: string;
  section: string;
  requirement: string;
  mandatory: boolean;
  addressed: boolean;
  response: string;
}

interface RFPData {
  // RFP Details
  rfpTitle: string;
  issuingAgency: string;
  rfpNumber: string;
  releaseDate: string;
  dueDate: string;
  contractType: string;
  setAside: string;
  naicsCode: string;
  estimatedValue: string;
  
  // Bid Decision
  bidDecision: "bid" | "no-bid" | "undecided";
  bidRationale: string;
  
  // Requirements
  requirements: RFPRequirement[];
  
  // Compliance Matrix
  complianceNotes: string;
  
  // Teaming
  needsTeaming: boolean;
  teamingPartners: string;
  
  // Questions
  questionsForAgency: string;
}

const initialRFPData: RFPData = {
  rfpTitle: "",
  issuingAgency: "",
  rfpNumber: "",
  releaseDate: "",
  dueDate: "",
  contractType: "",
  setAside: "",
  naicsCode: "",
  estimatedValue: "",
  bidDecision: "undecided",
  bidRationale: "",
  requirements: [],
  complianceNotes: "",
  needsTeaming: false,
  teamingPartners: "",
  questionsForAgency: "",
};

const sampleRequirements: RFPRequirement[] = [
  { id: "1", section: "Technical", requirement: "Demonstrate experience with similar projects", mandatory: true, addressed: false, response: "" },
  { id: "2", section: "Technical", requirement: "Provide detailed technical approach", mandatory: true, addressed: false, response: "" },
  { id: "3", section: "Management", requirement: "Submit organizational chart", mandatory: true, addressed: false, response: "" },
  { id: "4", section: "Management", requirement: "Identify key personnel with resumes", mandatory: true, addressed: false, response: "" },
  { id: "5", section: "Past Performance", requirement: "Provide 3 relevant past performance references", mandatory: true, addressed: false, response: "" },
  { id: "6", section: "Pricing", requirement: "Submit detailed cost breakdown", mandatory: true, addressed: false, response: "" },
  { id: "7", section: "Certifications", requirement: "Provide proof of required certifications", mandatory: false, addressed: false, response: "" },
  { id: "8", section: "Small Business", requirement: "Submit small business subcontracting plan", mandatory: false, addressed: false, response: "" },
];

const steps = [
  { id: 1, title: "RFP Analysis", icon: FileSearch },
  { id: 2, title: "Bid/No-Bid", icon: Scale },
  { id: 3, title: "Requirements", icon: ListChecks },
  { id: 4, title: "Compliance Matrix", icon: CheckCircle2 },
  { id: 5, title: "Teaming", icon: Briefcase },
  { id: 6, title: "Generate Response", icon: FileCheck },
];

export default function RFPGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [rfpData, setRFPData] = useState<RFPData>({
    ...initialRFPData,
    requirements: sampleRequirements,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState<string | null>(null);

  const updateField = (field: keyof RFPData, value: any) => {
    setRFPData((prev) => ({ ...prev, [field]: value }));
  };

  const updateRequirement = (id: string, field: keyof RFPRequirement, value: any) => {
    setRFPData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req) =>
        req.id === id ? { ...req, [field]: value } : req
      ),
    }));
  };

  const addRequirement = () => {
    const newReq: RFPRequirement = {
      id: Date.now().toString(),
      section: "Technical",
      requirement: "",
      mandatory: false,
      addressed: false,
      response: "",
    };
    setRFPData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, newReq],
    }));
  };

  const progress = (currentStep / steps.length) * 100;

  const mandatoryCount = rfpData.requirements.filter((r) => r.mandatory).length;
  const addressedMandatory = rfpData.requirements.filter((r) => r.mandatory && r.addressed).length;
  const complianceScore = mandatoryCount > 0 ? Math.round((addressedMandatory / mandatoryCount) * 100) : 0;

  const daysUntilDue = rfpData.dueDate
    ? Math.ceil((new Date(rfpData.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const response = generateRFPResponse();
    setGeneratedResponse(response);
    setIsGenerating(false);
    toast.success("RFP response generated successfully!");
  };

  const generateRFPResponse = () => {
    return `
# RFP RESPONSE

## ${rfpData.rfpTitle}

**RFP Number:** ${rfpData.rfpNumber}
**Issuing Agency:** ${rfpData.issuingAgency}
**Submission Date:** ${new Date().toLocaleDateString()}

---

## COMPLIANCE MATRIX

| Section | Requirement | Mandatory | Status | Response Location |
|---------|-------------|-----------|--------|-------------------|
${rfpData.requirements
  .map(
    (req, idx) =>
      `| ${req.section} | ${req.requirement} | ${req.mandatory ? "Yes" : "No"} | ${
        req.addressed ? "✓ Addressed" : "○ Pending"
      } | Section ${idx + 1} |`
  )
  .join("\n")}

---

## TECHNICAL VOLUME

${rfpData.requirements
  .filter((r) => r.section === "Technical")
  .map(
    (req, idx) => `
### ${idx + 1}. ${req.requirement}

${req.response || "[Response to be completed]"}
`
  )
  .join("\n")}

---

## MANAGEMENT VOLUME

${rfpData.requirements
  .filter((r) => r.section === "Management")
  .map(
    (req, idx) => `
### ${idx + 1}. ${req.requirement}

${req.response || "[Response to be completed]"}
`
  )
  .join("\n")}

---

## PAST PERFORMANCE VOLUME

${rfpData.requirements
  .filter((r) => r.section === "Past Performance")
  .map(
    (req, idx) => `
### ${idx + 1}. ${req.requirement}

${req.response || "[Response to be completed]"}
`
  )
  .join("\n")}

---

## PRICING VOLUME

${rfpData.requirements
  .filter((r) => r.section === "Pricing")
  .map(
    (req, idx) => `
### ${idx + 1}. ${req.requirement}

${req.response || "[Response to be completed]"}
`
  )
  .join("\n")}

---

## CERTIFICATIONS & REPRESENTATIONS

${rfpData.requirements
  .filter((r) => r.section === "Certifications" || r.section === "Small Business")
  .map(
    (req, idx) => `
### ${idx + 1}. ${req.requirement}

${req.response || "[Response to be completed]"}
`
  )
  .join("\n")}

${
  rfpData.needsTeaming
    ? `
---

## TEAMING ARRANGEMENT

**Teaming Partners:**
${rfpData.teamingPartners || "[Partners to be identified]"}
`
    : ""
}

---

## COMPLIANCE SUMMARY

- **Total Requirements:** ${rfpData.requirements.length}
- **Mandatory Requirements:** ${mandatoryCount}
- **Addressed:** ${addressedMandatory}
- **Compliance Score:** ${complianceScore}%

---

*This response was prepared using The The L.A.W.S. Collective RFP Response Generator*
    `.trim();
  };

  const handleCopy = () => {
    if (generatedResponse) {
      navigator.clipboard.writeText(generatedResponse);
      toast.success("Response copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (generatedResponse) {
      const blob = new Blob([generatedResponse], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rfp-response-${rfpData.rfpNumber || "draft"}.md`;
      a.click();
      toast.success("Response downloaded!");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">RFP Response Generator</h1>
            <p className="text-muted-foreground">
              Analyze RFPs and generate compliant responses
            </p>
          </div>
          <div className="flex items-center gap-2">
            {daysUntilDue !== null && (
              <Badge
                variant={daysUntilDue < 7 ? "destructive" : daysUntilDue < 14 ? "secondary" : "outline"}
                className="gap-1"
              >
                <Clock className="w-3 h-3" />
                {daysUntilDue > 0 ? `${daysUntilDue} days left` : "Past due"}
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </Badge>
          </div>
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
                <FileSearch className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">RFP Analysis</h2>
              </div>

              <Card className="p-4 border-dashed border-2 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload RFP document for AI analysis (coming soon)
                </p>
                <Button variant="outline" size="sm" disabled>
                  Upload RFP
                </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RFP Title *</Label>
                  <Input
                    value={rfpData.rfpTitle}
                    onChange={(e) => updateField("rfpTitle", e.target.value)}
                    placeholder="e.g., IT Infrastructure Modernization"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Agency *</Label>
                  <Input
                    value={rfpData.issuingAgency}
                    onChange={(e) => updateField("issuingAgency", e.target.value)}
                    placeholder="e.g., Department of Defense"
                  />
                </div>
                <div className="space-y-2">
                  <Label>RFP/Solicitation Number</Label>
                  <Input
                    value={rfpData.rfpNumber}
                    onChange={(e) => updateField("rfpNumber", e.target.value)}
                    placeholder="e.g., W911NF-24-R-0001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Release Date</Label>
                  <Input
                    type="date"
                    value={rfpData.releaseDate}
                    onChange={(e) => updateField("releaseDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={rfpData.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select
                    value={rfpData.contractType}
                    onValueChange={(v) => updateField("contractType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="firm-fixed">Firm Fixed Price (FFP)</SelectItem>
                      <SelectItem value="cost-plus">Cost Plus Fixed Fee (CPFF)</SelectItem>
                      <SelectItem value="time-materials">Time & Materials (T&M)</SelectItem>
                      <SelectItem value="idiq">IDIQ</SelectItem>
                      <SelectItem value="bpa">BPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Set-Aside</Label>
                  <Select
                    value={rfpData.setAside}
                    onValueChange={(v) => updateField("setAside", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select set-aside" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-open">Full & Open Competition</SelectItem>
                      <SelectItem value="small-business">Small Business Set-Aside</SelectItem>
                      <SelectItem value="8a">8(a) Set-Aside</SelectItem>
                      <SelectItem value="hubzone">HUBZone Set-Aside</SelectItem>
                      <SelectItem value="sdvosb">SDVOSB Set-Aside</SelectItem>
                      <SelectItem value="wosb">WOSB Set-Aside</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>NAICS Code</Label>
                  <Input
                    value={rfpData.naicsCode}
                    onChange={(e) => updateField("naicsCode", e.target.value)}
                    placeholder="e.g., 541512"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Value</Label>
                  <Input
                    value={rfpData.estimatedValue}
                    onChange={(e) => updateField("estimatedValue", e.target.value)}
                    placeholder="e.g., $5,000,000"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Bid/No-Bid Decision</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: "bid", label: "Bid", color: "bg-green-100 border-green-500 text-green-700" },
                  { value: "no-bid", label: "No-Bid", color: "bg-red-100 border-red-500 text-red-700" },
                  { value: "undecided", label: "Undecided", color: "bg-amber-100 border-amber-500 text-amber-700" },
                ].map((option) => (
                  <Card
                    key={option.value}
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      rfpData.bidDecision === option.value
                        ? option.color
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => updateField("bidDecision", option.value)}
                  >
                    <div className="text-center">
                      <p className="font-semibold">{option.label}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Decision Rationale</Label>
                <Textarea
                  value={rfpData.bidRationale}
                  onChange={(e) => updateField("bidRationale", e.target.value)}
                  placeholder="Document your reasoning for the bid/no-bid decision..."
                  rows={4}
                />
              </div>

              <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                <h3 className="font-medium text-foreground mb-2">Bid/No-Bid Considerations</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Do we have relevant past performance?</li>
                  <li>• Do we meet all mandatory requirements?</li>
                  <li>• Is the timeline achievable?</li>
                  <li>• Do we have the resources/capacity?</li>
                  <li>• Is the opportunity profitable?</li>
                  <li>• Do we have competitive advantage?</li>
                </ul>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Requirements Tracking</h2>
                </div>
                <Button variant="outline" size="sm" onClick={addRequirement}>
                  Add Requirement
                </Button>
              </div>

              <div className="space-y-4">
                {rfpData.requirements.map((req) => (
                  <Card key={req.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={req.addressed}
                        onCheckedChange={(checked) =>
                          updateRequirement(req.id, "addressed", checked)
                        }
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={req.mandatory ? "destructive" : "secondary"}>
                            {req.section}
                          </Badge>
                          {req.mandatory && (
                            <Badge variant="outline" className="text-red-600">
                              Mandatory
                            </Badge>
                          )}
                        </div>
                        <Input
                          value={req.requirement}
                          onChange={(e) =>
                            updateRequirement(req.id, "requirement", e.target.value)
                          }
                          placeholder="Requirement description"
                          className="font-medium"
                        />
                        <Textarea
                          value={req.response}
                          onChange={(e) =>
                            updateRequirement(req.id, "response", e.target.value)
                          }
                          placeholder="Your response to this requirement..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Compliance Matrix</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{complianceScore}%</p>
                  <p className="text-sm text-muted-foreground">Compliance Score</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">
                    {addressedMandatory}/{mandatoryCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Mandatory Addressed</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{rfpData.requirements.length}</p>
                  <p className="text-sm text-muted-foreground">Total Requirements</p>
                </Card>
              </div>

              {complianceScore < 100 && (
                <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        Incomplete Compliance
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {mandatoryCount - addressedMandatory} mandatory requirements still need to be
                        addressed before submission.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Compliance Notes</Label>
                <Textarea
                  value={rfpData.complianceNotes}
                  onChange={(e) => updateField("complianceNotes", e.target.value)}
                  placeholder="Document any compliance concerns, exceptions, or clarifications needed..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Questions for Contracting Officer</Label>
                <Textarea
                  value={rfpData.questionsForAgency}
                  onChange={(e) => updateField("questionsForAgency", e.target.value)}
                  placeholder="List questions to submit during the Q&A period..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Teaming Arrangements</h2>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  checked={rfpData.needsTeaming}
                  onCheckedChange={(checked) => updateField("needsTeaming", checked)}
                />
                <Label>This opportunity requires teaming partners</Label>
              </div>

              {rfpData.needsTeaming && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Teaming Partners</Label>
                    <Textarea
                      value={rfpData.teamingPartners}
                      onChange={(e) => updateField("teamingPartners", e.target.value)}
                      placeholder="List potential or confirmed teaming partners, their roles, and capabilities..."
                      rows={4}
                    />
                  </div>

                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
                    <h3 className="font-medium text-foreground mb-2">Teaming Considerations</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Prime vs. Subcontractor roles</li>
                      <li>• Work share percentages</li>
                      <li>• Teaming Agreement requirements</li>
                      <li>• Joint venture vs. mentor-protégé</li>
                      <li>• Small business participation goals</li>
                    </ul>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Generate Response</h2>
              </div>

              {!generatedResponse ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">RFP Summary</h3>
                      <p className="text-sm text-muted-foreground">{rfpData.rfpTitle}</p>
                      <p className="text-sm text-muted-foreground">{rfpData.issuingAgency}</p>
                      <p className="text-sm text-muted-foreground">RFP# {rfpData.rfpNumber}</p>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Compliance Status</h3>
                      <p className="text-2xl font-bold text-primary">{complianceScore}%</p>
                      <p className="text-sm text-muted-foreground">
                        {addressedMandatory}/{mandatoryCount} mandatory requirements addressed
                      </p>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Bid Decision</h3>
                      <Badge
                        variant={
                          rfpData.bidDecision === "bid"
                            ? "default"
                            : rfpData.bidDecision === "no-bid"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {rfpData.bidDecision.toUpperCase()}
                      </Badge>
                    </Card>
                    <Card className="p-4">
                      <h3 className="font-medium text-foreground mb-2">Due Date</h3>
                      <p className="text-sm text-muted-foreground">
                        {rfpData.dueDate
                          ? new Date(rfpData.dueDate).toLocaleDateString()
                          : "Not specified"}
                      </p>
                      {daysUntilDue !== null && daysUntilDue > 0 && (
                        <p className="text-sm text-primary">{daysUntilDue} days remaining</p>
                      )}
                    </Card>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || rfpData.bidDecision === "no-bid"}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Response...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate RFP Response
                      </>
                    )}
                  </Button>

                  {rfpData.bidDecision === "no-bid" && (
                    <p className="text-sm text-muted-foreground text-center">
                      Response generation disabled for No-Bid decisions
                    </p>
                  )}
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
                    <Button onClick={() => setGeneratedResponse(null)} variant="outline">
                      Edit & Regenerate
                    </Button>
                  </div>
                  <Card className="p-6 bg-muted/50 max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                      {generatedResponse}
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
