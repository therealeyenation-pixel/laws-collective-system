import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Send,
  Zap,
  AlertCircle,
  TrendingUp,
  Package,
} from "lucide-react";
import OfferPackageGenerator from "@/components/OfferPackageGenerator";

/**
 * Contingency Offers Management
 * 
 * Generate and manage contingency employment offers that activate upon funding:
 * - Letter of Intent
 * - Conditional Employment Offers
 * - Batch offer generation
 * - Funding trigger activation
 */

export default function ContingencyOffers() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);

  // Common form state
  const [entityName, setEntityName] = useState("L.A.W.S. Collective, LLC");
  const [fundingCondition, setFundingCondition] = useState("Securing grant funding from identified sources");
  const [fundingDeadline, setFundingDeadline] = useState("");

  // Letter of Intent state
  const [loiCandidateName, setLoiCandidateName] = useState("");
  const [loiPositionTitle, setLoiPositionTitle] = useState("");
  const [loiPositionType, setLoiPositionType] = useState<string>("full_time");
  const [loiDepartment, setLoiDepartment] = useState("");
  const [loiStartDateEstimate, setLoiStartDateEstimate] = useState("");
  const [loiCompensationMin, setLoiCompensationMin] = useState(0);
  const [loiCompensationMax, setLoiCompensationMax] = useState(0);
  const [loiResponsibilities, setLoiResponsibilities] = useState<string[]>([""]);
  const [loiBenefits, setLoiBenefits] = useState<string[]>(["Health Insurance", "Paid Time Off"]);
  const [loiTrainingRequirements, setLoiTrainingRequirements] = useState<string[]>([""]);
  const [loiExpirationDate, setLoiExpirationDate] = useState("");

  // Conditional Offer state
  const [offerCandidateName, setOfferCandidateName] = useState("");
  const [offerPositionTitle, setOfferPositionTitle] = useState("");
  const [offerPositionType, setOfferPositionType] = useState<string>("full_time");
  const [offerDepartment, setOfferDepartment] = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerCompensation, setOfferCompensation] = useState(0);
  const [offerPayFrequency, setOfferPayFrequency] = useState<string>("biweekly");
  const [offerResponsibilities, setOfferResponsibilities] = useState<string[]>([""]);
  const [offerResponseDeadline, setOfferResponseDeadline] = useState("");
  const [offerBenefits, setOfferBenefits] = useState({
    healthInsurance: true,
    dentalVision: true,
    retirement401k: true,
    retirementMatch: "3%",
    paidTimeOff: 15,
    sickLeave: 5,
    professionalDevelopment: 1500,
    remoteWork: true,
    equipmentProvided: true,
  });
  const [offerEquipment, setOfferEquipment] = useState<string[]>(["Laptop", "Monitor", "Keyboard & Mouse"]);

  // Batch import state
  const [batchCandidates, setBatchCandidates] = useState<any[]>([
    { name: "", email: "", positionTitle: "", positionType: "full_time", department: "", annualCompensation: 0 },
  ]);

  const dashboardQuery = trpc.contingencyOffers.getDashboard.useQuery();
  const projectedBudgetQuery = trpc.contingencyOffers.getProjectedBudget.useQuery();

  const generateLoiMutation = trpc.contingencyOffers.generateLetterOfIntent.useMutation({
    onSuccess: (data) => {
      setGeneratedDocument(data);
      toast.success("Letter of Intent generated");
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const generateOfferMutation = trpc.contingencyOffers.generateConditionalOffer.useMutation({
    onSuccess: (data) => {
      setGeneratedDocument(data);
      toast.success("Conditional offer generated");
    },
    onError: (error) => {
      toast.error(`Failed to generate: ${error.message}`);
    },
  });

  const batchCreateMutation = trpc.contingencyOffers.batchCreateOffers.useMutation({
    onSuccess: (data) => {
      toast.success(`Created ${data.totalCreated} contingency offers`);
      dashboardQuery.refetch();
      projectedBudgetQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create offers: ${error.message}`);
    },
  });

  const handleGenerateLoi = () => {
    generateLoiMutation.mutate({
      entityName,
      candidateName: loiCandidateName,
      positionTitle: loiPositionTitle,
      positionType: loiPositionType as any,
      department: loiDepartment,
      startDateEstimate: loiStartDateEstimate,
      fundingCondition,
      keyResponsibilities: loiResponsibilities.filter(r => r),
      compensationRange: { min: loiCompensationMin, max: loiCompensationMax },
      benefits: loiBenefits,
      trainingRequirements: loiTrainingRequirements.filter(t => t),
      expirationDate: loiExpirationDate,
    });
  };

  const handleGenerateOffer = () => {
    generateOfferMutation.mutate({
      entityName,
      candidateName: offerCandidateName,
      positionTitle: offerPositionTitle,
      positionType: offerPositionType as any,
      department: offerDepartment,
      startDate: offerStartDate,
      fundingCondition,
      fundingDeadline,
      annualCompensation: offerCompensation,
      payFrequency: offerPayFrequency as any,
      benefits: offerBenefits,
      equipmentPackage: offerEquipment,
      responsibilities: offerResponsibilities.filter(r => r),
      atWillStatement: true,
      responseDeadline: offerResponseDeadline,
    });
  };

  const handleBatchCreate = () => {
    const validCandidates = batchCandidates.filter(c => c.name && c.positionTitle);
    if (validCandidates.length === 0) {
      toast.error("Please add at least one candidate");
      return;
    }
    batchCreateMutation.mutate({
      entityName,
      fundingCondition,
      fundingDeadline,
      candidates: validCandidates,
    });
  };

  const addBatchCandidate = () => {
    setBatchCandidates([...batchCandidates, 
      { name: "", email: "", positionTitle: "", positionType: "full_time", department: "", annualCompensation: 0 }
    ]);
  };

  const removeBatchCandidate = (index: number) => {
    setBatchCandidates(batchCandidates.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderLetterOfIntent = (doc: any) => {
    if (!doc || doc.type !== "letter_of_intent") return null;

    return (
      <Card className="mt-6">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{doc.documentTitle}</CardTitle>
              <CardDescription>{doc.subtitle}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 max-w-3xl mx-auto text-sm">
          <div className="text-right text-muted-foreground">{doc.date}</div>
          
          <div>
            <p><strong>From:</strong> {doc.header.from}</p>
            <p><strong>To:</strong> {doc.header.to}</p>
            <p><strong>Re:</strong> {doc.header.re}</p>
          </div>

          <p className="whitespace-pre-line">{doc.opening}</p>

          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold mb-2">{doc.contingencyClause.title}</h4>
            <p className="whitespace-pre-line">{doc.contingencyClause.text}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{doc.positionDetails.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {doc.positionDetails.items.map((item: any, i: number) => (
                <div key={i}>
                  <span className="text-muted-foreground">{item.label}:</span> {item.value}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{doc.responsibilities.title}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {doc.responsibilities.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{doc.compensation.title}</h4>
            <p>{doc.compensation.text}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{doc.benefits.title}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {doc.benefits.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-2 text-xs">{doc.benefits.note}</p>
          </div>

          {doc.preEmployment && (
            <div>
              <h4 className="font-semibold mb-2">{doc.preEmployment.title}</h4>
              <p className="whitespace-pre-line">{doc.preEmployment.text}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-2">{doc.acceptance.title}</h4>
            <p className="whitespace-pre-line mb-6">{doc.acceptance.text}</p>
            
            <div className="grid grid-cols-2 gap-8 mt-8">
              {doc.acceptance.signatureLines.map((line: any, i: number) => (
                <div key={i}>
                  <div className="border-b border-foreground mb-2 h-8"></div>
                  <p className="text-muted-foreground">{line.label}</p>
                  {line.name && <p className="font-medium">{line.name}</p>}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConditionalOffer = (doc: any) => {
    if (!doc || doc.type !== "conditional_employment_offer") return null;

    return (
      <Card className="mt-6">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{doc.documentTitle}</CardTitle>
              <CardDescription>Generated: {doc.date}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6 max-w-3xl mx-auto text-sm">
          <div>
            <p><strong>To:</strong> {doc.header.to}</p>
            {doc.header.address && <p>{doc.header.address}</p>}
            <p><strong>From:</strong> {doc.header.from}</p>
          </div>

          <p className="whitespace-pre-line">{doc.opening}</p>

          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold mb-2">{doc.contingency.title}</h4>
            <p className="mb-2"><strong>Condition:</strong> {doc.contingency.condition}</p>
            <p className="mb-2"><strong>Deadline:</strong> {doc.contingency.deadline}</p>
            <p className="text-xs">{doc.contingency.text}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{doc.position.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {doc.position.details.map((item: any, i: number) => (
                <div key={i}>
                  <span className="text-muted-foreground">{item.label}:</span> {item.value}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{doc.compensation.title}</h4>
            <p className="text-lg font-bold text-green-600">{formatCurrency(doc.compensation.annual)} / year</p>
            <p className="text-muted-foreground">{doc.compensation.text}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{doc.benefits.title}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {doc.benefits.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-2 text-xs">{doc.benefits.note}</p>
          </div>

          {doc.equipment && (
            <div>
              <h4 className="font-semibold mb-2">{doc.equipment.title}</h4>
              <p className="mb-2">{doc.equipment.text}</p>
              <ul className="list-disc pl-5 space-y-1">
                {doc.equipment.items.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">{doc.responsibilities.title}</h4>
            <ul className="list-disc pl-5 space-y-1">
              {doc.responsibilities.items.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {doc.atWill && (
            <div className="text-xs text-muted-foreground border-t pt-4">
              <h4 className="font-semibold mb-1">{doc.atWill.title}</h4>
              <p>{doc.atWill.text}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-2">{doc.acceptance.title}</h4>
            <p className="mb-2">Please respond by: <strong>{doc.acceptance.deadline}</strong></p>
            <p className="mb-6">{doc.acceptance.text}</p>
            
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <div className="border-b border-foreground mb-2 h-8"></div>
                <p className="text-muted-foreground">Candidate Signature</p>
                <p className="font-medium">{doc.acceptance.signatureBlock.candidate.printedName}</p>
                <div className="border-b border-foreground mb-2 h-6 mt-4"></div>
                <p className="text-muted-foreground">Date</p>
              </div>
              <div>
                <div className="border-b border-foreground mb-2 h-8"></div>
                <p className="text-muted-foreground">Company Representative</p>
                <p className="font-medium">{doc.acceptance.signatureBlock.company.title}</p>
                <div className="border-b border-foreground mb-2 h-6 mt-4"></div>
                <p className="text-muted-foreground">Date</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contingency Offers</h1>
          <p className="text-muted-foreground">
            Create and manage employment offers that activate upon funding
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="loi" className="gap-2">
              <FileText className="w-4 h-4" />
              Letter of Intent
            </TabsTrigger>
            <TabsTrigger value="offer" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Conditional Offer
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Users className="w-4 h-4" />
              Batch Import
            </TabsTrigger>
            <TabsTrigger value="package" className="gap-2">
              <Package className="w-4 h-4" />
              Offer Package
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dashboardQuery.data?.statusCounts?.reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Offers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dashboardQuery.data?.statusCounts?.find((s: any) => s.status === 'intent_accepted')?.count || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Intent Accepted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dashboardQuery.data?.statusCounts?.find((s: any) => s.status === 'pending_funding')?.count || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending Funding</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(projectedBudgetQuery.data?.totals?.totalCompensation || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Projected Budget</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Offers</CardTitle>
              </CardHeader>
              <CardContent>
                {(dashboardQuery.data?.recentOffers?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    {dashboardQuery.data?.recentOffers?.map((offer: any) => (
                      <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{offer.candidateName}</p>
                          <p className="text-sm text-muted-foreground">{offer.positionTitle}</p>
                        </div>
                        <Badge variant={
                          offer.status === 'intent_accepted' ? 'default' :
                          offer.status === 'activated' ? 'default' :
                          offer.status === 'draft' ? 'secondary' :
                          'outline'
                        }>
                          {offer.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No contingency offers yet</p>
                    <p className="text-sm">Create your first offer using the tabs above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Letter of Intent */}
          <TabsContent value="loi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Letter of Intent</CardTitle>
                <CardDescription>
                  Express intent to hire - non-binding until funding is secured
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Name</Label>
                    <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Candidate Name</Label>
                    <Input value={loiCandidateName} onChange={(e) => setLoiCandidateName(e.target.value)} placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Position Title</Label>
                    <Input value={loiPositionTitle} onChange={(e) => setLoiPositionTitle(e.target.value)} placeholder="e.g., Program Coordinator" />
                  </div>
                  <div className="space-y-2">
                    <Label>Position Type</Label>
                    <Select value={loiPositionType} onValueChange={setLoiPositionType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={loiDepartment} onChange={(e) => setLoiDepartment(e.target.value)} placeholder="e.g., Operations" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Start Date</Label>
                    <Input type="date" value={loiStartDateEstimate} onChange={(e) => setLoiStartDateEstimate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Compensation Range (Min)</Label>
                    <Input type="number" value={loiCompensationMin} onChange={(e) => setLoiCompensationMin(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Compensation Range (Max)</Label>
                    <Input type="number" value={loiCompensationMax} onChange={(e) => setLoiCompensationMax(Number(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Funding Condition</Label>
                  <Textarea value={fundingCondition} onChange={(e) => setFundingCondition(e.target.value)} rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Letter Expiration Date</Label>
                  <Input type="date" value={loiExpirationDate} onChange={(e) => setLoiExpirationDate(e.target.value)} className="w-48" />
                </div>

                <Button onClick={handleGenerateLoi} disabled={generateLoiMutation.isPending} className="gap-2">
                  {generateLoiMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Generate Letter of Intent
                </Button>
              </CardContent>
            </Card>

            {renderLetterOfIntent(generatedDocument)}
          </TabsContent>

          {/* Conditional Offer */}
          <TabsContent value="offer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate Conditional Employment Offer</CardTitle>
                <CardDescription>
                  Formal offer with specific terms that activates upon funding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Name</Label>
                    <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Candidate Name</Label>
                    <Input value={offerCandidateName} onChange={(e) => setOfferCandidateName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Position Title</Label>
                    <Input value={offerPositionTitle} onChange={(e) => setOfferPositionTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={offerDepartment} onChange={(e) => setOfferDepartment(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Compensation</Label>
                    <Input type="number" value={offerCompensation} onChange={(e) => setOfferCompensation(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Frequency</Label>
                    <Select value={offerPayFrequency} onValueChange={setOfferPayFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                        <SelectItem value="semimonthly">Semi-Monthly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={offerStartDate} onChange={(e) => setOfferStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Response Deadline</Label>
                    <Input type="date" value={offerResponseDeadline} onChange={(e) => setOfferResponseDeadline(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Funding Condition</Label>
                    <Textarea value={fundingCondition} onChange={(e) => setFundingCondition(e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Funding Deadline</Label>
                    <Input type="date" value={fundingDeadline} onChange={(e) => setFundingDeadline(e.target.value)} />
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 border rounded-lg p-4">
                  <Label className="text-base font-semibold">Benefits Package</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={offerBenefits.healthInsurance} onCheckedChange={(v) => setOfferBenefits({...offerBenefits, healthInsurance: v})} />
                      <Label>Health Insurance</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={offerBenefits.dentalVision} onCheckedChange={(v) => setOfferBenefits({...offerBenefits, dentalVision: v})} />
                      <Label>Dental & Vision</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={offerBenefits.retirement401k} onCheckedChange={(v) => setOfferBenefits({...offerBenefits, retirement401k: v})} />
                      <Label>401(k)</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={offerBenefits.remoteWork} onCheckedChange={(v) => setOfferBenefits({...offerBenefits, remoteWork: v})} />
                      <Label>Remote Work</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={offerBenefits.equipmentProvided} onCheckedChange={(v) => setOfferBenefits({...offerBenefits, equipmentProvided: v})} />
                      <Label>Equipment Provided</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">PTO Days</Label>
                      <Input type="number" value={offerBenefits.paidTimeOff} onChange={(e) => setOfferBenefits({...offerBenefits, paidTimeOff: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sick Days</Label>
                      <Input type="number" value={offerBenefits.sickLeave} onChange={(e) => setOfferBenefits({...offerBenefits, sickLeave: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Prof. Dev. Budget</Label>
                      <Input type="number" value={offerBenefits.professionalDevelopment} onChange={(e) => setOfferBenefits({...offerBenefits, professionalDevelopment: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleGenerateOffer} disabled={generateOfferMutation.isPending} className="gap-2">
                  {generateOfferMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                  Generate Conditional Offer
                </Button>
              </CardContent>
            </Card>

            {renderConditionalOffer(generatedDocument)}
          </TabsContent>

          {/* Batch Import */}
          <TabsContent value="batch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch Create Contingency Offers</CardTitle>
                <CardDescription>
                  Add multiple candidates at once to create draft offers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Name</Label>
                    <Input value={entityName} onChange={(e) => setEntityName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Funding Condition</Label>
                    <Input value={fundingCondition} onChange={(e) => setFundingCondition(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Funding Deadline</Label>
                    <Input type="date" value={fundingDeadline} onChange={(e) => setFundingDeadline(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Candidates</Label>
                    <Button variant="outline" size="sm" onClick={addBatchCandidate} className="gap-1">
                      <Plus className="w-3 h-3" /> Add Candidate
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {batchCandidates.map((candidate, index) => (
                      <div key={index} className="grid grid-cols-6 gap-2 items-center p-3 border rounded-lg">
                        <Input
                          placeholder="Name"
                          value={candidate.name}
                          onChange={(e) => {
                            const updated = [...batchCandidates];
                            updated[index].name = e.target.value;
                            setBatchCandidates(updated);
                          }}
                        />
                        <Input
                          placeholder="Email"
                          value={candidate.email}
                          onChange={(e) => {
                            const updated = [...batchCandidates];
                            updated[index].email = e.target.value;
                            setBatchCandidates(updated);
                          }}
                        />
                        <Input
                          placeholder="Position"
                          value={candidate.positionTitle}
                          onChange={(e) => {
                            const updated = [...batchCandidates];
                            updated[index].positionTitle = e.target.value;
                            setBatchCandidates(updated);
                          }}
                        />
                        <Input
                          placeholder="Department"
                          value={candidate.department}
                          onChange={(e) => {
                            const updated = [...batchCandidates];
                            updated[index].department = e.target.value;
                            setBatchCandidates(updated);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Salary"
                          value={candidate.annualCompensation || ""}
                          onChange={(e) => {
                            const updated = [...batchCandidates];
                            updated[index].annualCompensation = Number(e.target.value);
                            setBatchCandidates(updated);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBatchCandidate(index)}
                          disabled={batchCandidates.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleBatchCreate} disabled={batchCreateMutation.isPending} className="gap-2">
                  {batchCreateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Create {batchCandidates.filter(c => c.name).length} Offers
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offer Package Generator */}
          <TabsContent value="package" className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Complete Offer Package Generator</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate comprehensive offer packages including offer letter, position description,
                      compensation schedule, NDA, and more. Requires a completed resume.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <OfferPackageGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
