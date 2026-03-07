import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Briefcase,
  DollarSign,
  Calendar,
  Building2,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileCheck,
  Shield,
  Coins,
  Clock,
} from "lucide-react";

/**
 * Offer Package Generator
 * 
 * Creates complete employment offer packages including:
 * - Offer Letter (with 90% initial salary per policy)
 * - Position Description
 * - Compensation Schedule
 * - NDA
 * - Token Agreement (if applicable)
 * - Background Check Authorization
 * 
 * Requires a completed resume before generating offers
 */

interface OfferPackageGeneratorProps {
  familyMemberId?: string;
  candidateName?: string;
  positionTitle?: string;
  entityId?: string;
  entityName?: string;
  onPackageCreated?: (packageId: number) => void;
}

const entities = [
  { id: "laws", name: "The The L.A.W.S. Collective, LLC" },
  { id: "98trust", name: "98 Trust" },
  { id: "temple", name: "Temple of Alkebulan" },
  { id: "realeye", name: "Real-Eye Technologies, LLC" },
  { id: "divine", name: "Divine STEM Academy" },
  { id: "freeman", name: "Freeman Holdings" },
];

const departments = [
  "Executive",
  "Finance",
  "Operations",
  "Technology",
  "Education",
  "Media",
  "Health & Wellness",
  "Community Outreach",
  "Legal & Compliance",
  "Human Resources",
];

export default function OfferPackageGenerator({
  familyMemberId,
  candidateName = "",
  positionTitle = "",
  entityId = "",
  entityName = "",
  onPackageCreated,
}: OfferPackageGeneratorProps) {
  const [step, setStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: candidateName,
    positionTitle: positionTitle,
    department: "",
    entityId: entityId,
    entityName: entityName,
    reportsTo: "",
    employmentType: "contingent" as "full_time" | "part_time" | "contractor" | "contingent",
    baseSalary: 0,
    salaryFrequency: "annually" as "hourly" | "weekly" | "biweekly" | "monthly" | "annually",
    tokenAllocation: 0,
    revenueSharePercent: 0,
    benefits: {
      healthInsurance: true,
      dentalVision: true,
      retirement401k: true,
      paidTimeOff: 15,
      tokenEconomy: true,
      revenueSharing: false,
    },
    proposedStartDate: "",
    contingencyConditions: "This offer is contingent upon securing grant funding from identified sources.",
  });

  // Document generation options
  const [documents, setDocuments] = useState({
    offerLetter: true,
    positionDescription: true,
    compensationSchedule: true,
    nda: true,
    nonCompete: false,
    backgroundCheckAuth: true,
    tokenAgreement: true,
    policyAcknowledgment: true,
  });

  // Check for existing resume
  const resumeQuery = trpc.offerPackages.getResume.useQuery(
    { familyMemberId: familyMemberId || "" },
    { enabled: !!familyMemberId }
  );

  const createPackageMutation = trpc.offerPackages.createOfferPackage.useMutation({
    onSuccess: (data) => {
      toast.success("Offer package created successfully");
      onPackageCreated?.(data.id);
      setStep(4); // Move to success step
    },
    onError: (error) => {
      toast.error(`Failed to create package: ${error.message}`);
    },
  });

  const hasResume = !!resumeQuery.data;
  const resumeComplete = resumeQuery.data?.status === "complete" || resumeQuery.data?.status === "approved";

  // Calculate 90% initial salary per policy
  const calculateInitialSalary = (fullSalary: number) => {
    return Math.round(fullSalary * 0.9);
  };

  const handleCreatePackage = () => {
    if (!resumeQuery.data?.id) {
      toast.error("A completed resume is required before creating an offer package");
      return;
    }

    createPackageMutation.mutate({
      resumeId: resumeQuery.data.id,
      familyMemberId: familyMemberId || "",
      fullName: formData.fullName,
      positionTitle: formData.positionTitle,
      department: formData.department,
      entityId: formData.entityId,
      entityName: formData.entityName || entities.find(e => e.id === formData.entityId)?.name || "",
      reportsTo: formData.reportsTo,
      employmentType: formData.employmentType,
      baseSalary: calculateInitialSalary(formData.baseSalary),
      salaryFrequency: formData.salaryFrequency,
      tokenAllocation: formData.tokenAllocation,
      revenueSharePercent: formData.revenueSharePercent,
      benefits: formData.benefits,
      proposedStartDate: formData.proposedStartDate,
      contingencyConditions: formData.contingencyConditions,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Step 1: Resume Verification
  const renderResumeCheck = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Step 1: Resume Verification
        </CardTitle>
        <CardDescription>
          A completed resume is required before generating an offer package
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasResume ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">Resume Found</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {resumeQuery.data?.fullName} - {resumeQuery.data?.title}
                </p>
              </div>
              <Badge className="ml-auto" variant={resumeComplete ? "default" : "secondary"}>
                {resumeQuery.data?.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Qualification Type:</span>
                <Badge className="ml-2" variant="outline">
                  {resumeQuery.data?.qualificationType}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Competency Evidence:</span>
                <span className="ml-2 font-medium">
                  {(resumeQuery.data?.competencyEvidence as any[])?.length || 0} items
                </span>
              </div>
            </div>

            {!resumeComplete && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Resume is in draft status. Consider completing it before generating an offer.
                </p>
              </div>
            )}

            <Button onClick={() => setStep(2)} className="w-full">
              Continue to Position Details
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
            <div>
              <p className="font-medium">No Resume Found</p>
              <p className="text-sm text-muted-foreground">
                Please create a resume for this candidate before generating an offer package.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/resume-builder"}>
              Go to Resume Builder
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Step 2: Position & Compensation Details
  const renderPositionDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Step 2: Position & Compensation
        </CardTitle>
        <CardDescription>
          Define the position details and compensation structure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Candidate Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label>Position Title</Label>
            <Input
              value={formData.positionTitle}
              onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
              placeholder="e.g., Financial Manager"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select
              value={formData.entityId}
              onValueChange={(v) => setFormData({ 
                ...formData, 
                entityId: v,
                entityName: entities.find(e => e.id === v)?.name || ""
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department}
              onValueChange={(v) => setFormData({ ...formData, department: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Reports To</Label>
            <Input
              value={formData.reportsTo}
              onChange={(e) => setFormData({ ...formData, reportsTo: e.target.value })}
              placeholder="Supervisor name/title"
            />
          </div>
          <div className="space-y-2">
            <Label>Employment Type</Label>
            <Select
              value={formData.employmentType}
              onValueChange={(v: any) => setFormData({ ...formData, employmentType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contingent">Contingent (Funding-Based)</SelectItem>
                <SelectItem value="full_time">Full-Time</SelectItem>
                <SelectItem value="part_time">Part-Time</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Compensation */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Compensation Structure
          </h4>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Policy Note:</strong> Initial offers are set at 90% of the full salary range. 
              The remaining 10% is reserved for merit/salary increase in Year 2.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Salary Range (Annual)</Label>
              <Input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                placeholder="e.g., 65000"
              />
              {formData.baseSalary > 0 && (
                <p className="text-sm text-muted-foreground">
                  Initial Offer (90%): <strong>{formatCurrency(calculateInitialSalary(formData.baseSalary))}</strong>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Pay Frequency</Label>
              <Select
                value={formData.salaryFrequency}
                onValueChange={(v: any) => setFormData({ ...formData, salaryFrequency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Token Allocation (Annual)</Label>
              <Input
                type="number"
                value={formData.tokenAllocation}
                onChange={(e) => setFormData({ ...formData, tokenAllocation: Number(e.target.value) })}
                placeholder="e.g., 1000"
              />
            </div>
            <div className="space-y-2">
              <Label>Revenue Share %</Label>
              <Input
                type="number"
                value={formData.revenueSharePercent}
                onChange={(e) => setFormData({ ...formData, revenueSharePercent: Number(e.target.value) })}
                placeholder="e.g., 2"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Benefits */}
        <div>
          <h4 className="font-semibold mb-4">Benefits Package</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Health Insurance</Label>
              <Switch
                checked={formData.benefits.healthInsurance}
                onCheckedChange={(v) => setFormData({
                  ...formData,
                  benefits: { ...formData.benefits, healthInsurance: v }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Dental & Vision</Label>
              <Switch
                checked={formData.benefits.dentalVision}
                onCheckedChange={(v) => setFormData({
                  ...formData,
                  benefits: { ...formData.benefits, dentalVision: v }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>401(k) Retirement</Label>
              <Switch
                checked={formData.benefits.retirement401k}
                onCheckedChange={(v) => setFormData({
                  ...formData,
                  benefits: { ...formData.benefits, retirement401k: v }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Token Economy</Label>
              <Switch
                checked={formData.benefits.tokenEconomy}
                onCheckedChange={(v) => setFormData({
                  ...formData,
                  benefits: { ...formData.benefits, tokenEconomy: v }
                })}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Paid Time Off (Days/Year)</Label>
            <Input
              type="number"
              value={formData.benefits.paidTimeOff}
              onChange={(e) => setFormData({
                ...formData,
                benefits: { ...formData.benefits, paidTimeOff: Number(e.target.value) }
              })}
            />
          </div>
        </div>

        <Separator />

        {/* Dates & Conditions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Proposed Start Date</Label>
            <Input
              type="date"
              value={formData.proposedStartDate}
              onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
            />
          </div>
        </div>

        {formData.employmentType === "contingent" && (
          <div className="space-y-2">
            <Label>Contingency Conditions</Label>
            <Textarea
              value={formData.contingencyConditions}
              onChange={(e) => setFormData({ ...formData, contingencyConditions: e.target.value })}
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-3 justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button onClick={() => setStep(3)}>
            Continue to Document Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 3: Document Selection
  const renderDocumentSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Step 3: Document Selection
        </CardTitle>
        <CardDescription>
          Select which documents to include in the offer package
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <Label>Offer Letter</Label>
            </div>
            <Switch
              checked={documents.offerLetter}
              onCheckedChange={(v) => setDocuments({ ...documents, offerLetter: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <Label>Position Description</Label>
            </div>
            <Switch
              checked={documents.positionDescription}
              onCheckedChange={(v) => setDocuments({ ...documents, positionDescription: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Label>Compensation Schedule</Label>
            </div>
            <Switch
              checked={documents.compensationSchedule}
              onCheckedChange={(v) => setDocuments({ ...documents, compensationSchedule: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <Label>NDA</Label>
            </div>
            <Switch
              checked={documents.nda}
              onCheckedChange={(v) => setDocuments({ ...documents, nda: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <Label>Non-Compete Agreement</Label>
            </div>
            <Switch
              checked={documents.nonCompete}
              onCheckedChange={(v) => setDocuments({ ...documents, nonCompete: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <Label>Background Check Auth</Label>
            </div>
            <Switch
              checked={documents.backgroundCheckAuth}
              onCheckedChange={(v) => setDocuments({ ...documents, backgroundCheckAuth: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <Label>Token Agreement</Label>
            </div>
            <Switch
              checked={documents.tokenAgreement}
              onCheckedChange={(v) => setDocuments({ ...documents, tokenAgreement: v })}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              <Label>Policy Acknowledgment</Label>
            </div>
            <Switch
              checked={documents.policyAcknowledgment}
              onCheckedChange={(v) => setDocuments({ ...documents, policyAcknowledgment: v })}
            />
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Package Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidate:</span>
              <span className="font-medium">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position:</span>
              <span className="font-medium">{formData.positionTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entity:</span>
              <span className="font-medium">{formData.entityName || entities.find(e => e.id === formData.entityId)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initial Salary:</span>
              <span className="font-medium">{formatCurrency(calculateInitialSalary(formData.baseSalary))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Documents:</span>
              <span className="font-medium">{Object.values(documents).filter(Boolean).length} selected</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button 
            onClick={handleCreatePackage}
            disabled={createPackageMutation.isPending}
            className="gap-2"
          >
            {createPackageMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Package...
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                Create Offer Package
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: Success
  const renderSuccess = () => (
    <Card className="border-green-200 dark:border-green-800">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Offer Package Created</h3>
            <p className="text-muted-foreground">
              The offer package for {formData.fullName} has been created successfully.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep(1)}>
              Create Another
            </Button>
            <Button onClick={() => window.location.href = "/contingency-offers"}>
              View All Packages
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > s ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && renderResumeCheck()}
      {step === 2 && renderPositionDetails()}
      {step === 3 && renderDocumentSelection()}
      {step === 4 && renderSuccess()}
    </div>
  );
}
