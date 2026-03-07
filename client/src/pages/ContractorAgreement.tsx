import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  FileText, 
  Send, 
  Download, 
  Eye, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  Briefcase,
  DollarSign,
  Building2,
  Calendar,
  Mail,
  Plus,
  Copy,
  Printer,
  FileSignature,
  AlertCircle
} from "lucide-react";

const ENTITIES = [
  { id: "laws-llc", name: "The L.A.W.S. Collective, LLC" },
  { id: "laws-system", name: "LuvOnPurpose Autonomous Wealth System LLC" },
  { id: "temple", name: "LuvOnPurpose Outreach Temple and Academy Society, Inc." },
  { id: "real-eye", name: "Real-Eye-Nation, LLC" },
  { id: "trust", name: "Calea Freeman Family Trust" },
];

const SERVICE_CATEGORIES = [
  { id: "consulting", name: "Business Consulting", rateRange: "$75 - $150/hr" },
  { id: "training", name: "Training & Education", rateRange: "$100 - $200/hr" },
  { id: "creative", name: "Creative Services", rateRange: "$50 - $125/hr" },
  { id: "technical", name: "Technical Services", rateRange: "$85 - $175/hr" },
  { id: "administrative", name: "Administrative Support", rateRange: "$35 - $65/hr" },
  { id: "financial", name: "Financial Services", rateRange: "$100 - $250/hr" },
  { id: "legal", name: "Legal Support", rateRange: "$150 - $350/hr" },
  { id: "marketing", name: "Marketing & Media", rateRange: "$60 - $150/hr" },
];

interface ContractorAgreement {
  id: string;
  contractorName: string;
  contractorEmail: string;
  contractorBusinessName?: string;
  contractorEIN?: string;
  entity: string;
  serviceCategory: string;
  scopeOfWork: string;
  hourlyRate?: string;
  projectRate?: string;
  paymentTerms: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "sent" | "signed" | "active" | "completed" | "terminated";
  createdAt: string;
  sentAt?: string;
  signedAt?: string;
  trainingCompleted: boolean;
  businessEntityVerified: boolean;
}

const SAMPLE_AGREEMENTS: ContractorAgreement[] = [
  {
    id: "contract-001",
    contractorName: "Marcus Johnson",
    contractorEmail: "marcus@mjconsulting.com",
    contractorBusinessName: "MJ Consulting LLC",
    contractorEIN: "XX-XXXXXXX",
    entity: "The L.A.W.S. Collective, LLC",
    serviceCategory: "consulting",
    scopeOfWork: "Business development consulting and strategic planning support for grant acquisition initiatives.",
    hourlyRate: "$125",
    paymentTerms: "Net 30",
    startDate: "2026-02-01",
    endDate: "2026-07-31",
    status: "active",
    createdAt: "2026-01-10",
    sentAt: "2026-01-12",
    signedAt: "2026-01-15",
    trainingCompleted: true,
    businessEntityVerified: true,
  },
  {
    id: "contract-002",
    contractorName: "Alicia Thompson",
    contractorEmail: "alicia@creativestudio.co",
    contractorBusinessName: "Creative Studio Co",
    entity: "Real-Eye-Nation, LLC",
    serviceCategory: "creative",
    scopeOfWork: "Brand design, marketing materials, and visual content creation for The L.A.W.S. Collective campaigns.",
    projectRate: "$5,000",
    paymentTerms: "50% upfront, 50% on completion",
    startDate: "2026-01-20",
    status: "signed",
    createdAt: "2026-01-15",
    sentAt: "2026-01-16",
    signedAt: "2026-01-18",
    trainingCompleted: true,
    businessEntityVerified: true,
  },
];

export default function ContractorAgreement() {
  const [activeTab, setActiveTab] = useState("agreements");
  const [agreements, setAgreements] = useState<ContractorAgreement[]>(SAMPLE_AGREEMENTS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<ContractorAgreement | null>(null);
  
  const [newAgreement, setNewAgreement] = useState({
    contractorName: "",
    contractorEmail: "",
    contractorBusinessName: "",
    contractorEIN: "",
    entity: "",
    serviceCategory: "",
    scopeOfWork: "",
    rateType: "hourly" as "hourly" | "project",
    rate: "",
    paymentTerms: "Net 30",
    startDate: "",
    endDate: "",
    trainingCompleted: false,
    businessEntityVerified: false,
  });

  const handleCreateAgreement = () => {
    if (!newAgreement.contractorName || !newAgreement.contractorEmail || !newAgreement.entity || !newAgreement.serviceCategory) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!newAgreement.trainingCompleted) {
      toast.error("Contractor must complete training before agreement can be created");
      return;
    }

    if (!newAgreement.businessEntityVerified) {
      toast.error("Contractor's business entity must be verified before agreement can be created");
      return;
    }
    
    const agreement: ContractorAgreement = {
      id: `contract-${Date.now()}`,
      contractorName: newAgreement.contractorName,
      contractorEmail: newAgreement.contractorEmail,
      contractorBusinessName: newAgreement.contractorBusinessName || undefined,
      contractorEIN: newAgreement.contractorEIN || undefined,
      entity: newAgreement.entity,
      serviceCategory: newAgreement.serviceCategory,
      scopeOfWork: newAgreement.scopeOfWork,
      hourlyRate: newAgreement.rateType === "hourly" ? newAgreement.rate : undefined,
      projectRate: newAgreement.rateType === "project" ? newAgreement.rate : undefined,
      paymentTerms: newAgreement.paymentTerms,
      startDate: newAgreement.startDate,
      endDate: newAgreement.endDate || undefined,
      status: "draft",
      createdAt: new Date().toISOString().split('T')[0],
      trainingCompleted: newAgreement.trainingCompleted,
      businessEntityVerified: newAgreement.businessEntityVerified,
    };
    
    setAgreements([agreement, ...agreements]);
    setShowCreateDialog(false);
    setNewAgreement({
      contractorName: "",
      contractorEmail: "",
      contractorBusinessName: "",
      contractorEIN: "",
      entity: "",
      serviceCategory: "",
      scopeOfWork: "",
      rateType: "hourly",
      rate: "",
      paymentTerms: "Net 30",
      startDate: "",
      endDate: "",
      trainingCompleted: false,
      businessEntityVerified: false,
    });
    toast.success("Contractor agreement created as draft");
  };

  const handleSendAgreement = (agreement: ContractorAgreement) => {
    setAgreements(agreements.map(a => 
      a.id === agreement.id 
        ? { ...a, status: "sent" as const, sentAt: new Date().toISOString().split('T')[0] }
        : a
    ));
    toast.success(`Agreement sent to ${agreement.contractorName}`);
  };

  const handlePreviewAgreement = (agreement: ContractorAgreement) => {
    setSelectedAgreement(agreement);
    setShowPreviewDialog(true);
  };

  const getStatusBadge = (status: ContractorAgreement["status"]) => {
    switch (status) {
      case "draft": return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Draft</Badge>;
      case "sent": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Sent</Badge>;
      case "signed": return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Signed</Badge>;
      case "active": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "completed": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Completed</Badge>;
      case "terminated": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Terminated</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contractor Agreements</h1>
            <p className="text-muted-foreground mt-1">
              Manage independent contractor agreements and 1099 relationships
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Agreement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Contracts</p>
                  <p className="text-2xl font-bold">{agreements.filter(a => a.status === "active").length}</p>
                </div>
                <FileSignature className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Signature</p>
                  <p className="text-2xl font-bold">{agreements.filter(a => a.status === "sent").length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Draft Agreements</p>
                  <p className="text-2xl font-bold">{agreements.filter(a => a.status === "draft").length}</p>
                </div>
                <Edit2 className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Agreements</p>
                  <p className="text-2xl font-bold">{agreements.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="agreements" className="gap-2">
              <FileText className="w-4 h-4" />
              Agreements
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Copy className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agreements" className="space-y-4">
            {agreements.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No contractor agreements yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {agreements.map((agreement) => (
                  <Card key={agreement.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{agreement.contractorName}</h3>
                              {getStatusBadge(agreement.status)}
                            </div>
                            {agreement.contractorBusinessName && (
                              <p className="text-sm text-muted-foreground">{agreement.contractorBusinessName}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              {SERVICE_CATEGORIES.find(c => c.id === agreement.serviceCategory)?.name} • {agreement.entity}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="w-4 h-4" />
                                {agreement.hourlyRate || agreement.projectRate}
                                {agreement.hourlyRate ? "/hr" : " (project)"}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {agreement.startDate}
                                {agreement.endDate && ` - ${agreement.endDate}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handlePreviewAgreement(agreement)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          {agreement.status === "draft" && (
                            <Button size="sm" onClick={() => handleSendAgreement(agreement)}>
                              <Send className="w-4 h-4 mr-1" />
                              Send
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agreement Templates</CardTitle>
                <CardDescription>Pre-configured templates for common contractor relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SERVICE_CATEGORIES.map((category) => (
                    <Card key={category.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold">{category.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">Typical rate: {category.rateRange}</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => {
                          setNewAgreement(prev => ({ ...prev, serviceCategory: category.id }));
                          setShowCreateDialog(true);
                        }}>
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Agreement Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Contractor Agreement</DialogTitle>
              <DialogDescription>
                Create a new independent contractor agreement. Training and business entity verification are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Prerequisites Alert */}
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800">Prerequisites Required</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Before creating an agreement, the contractor must complete the Contractor Training Module 
                        and have their business entity verified.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Checkboxes */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="training" 
                    checked={newAgreement.trainingCompleted}
                    onCheckedChange={(checked) => setNewAgreement(prev => ({ ...prev, trainingCompleted: checked as boolean }))}
                  />
                  <Label htmlFor="training" className="text-sm font-medium">
                    Contractor Training Module Completed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="entity" 
                    checked={newAgreement.businessEntityVerified}
                    onCheckedChange={(checked) => setNewAgreement(prev => ({ ...prev, businessEntityVerified: checked as boolean }))}
                  />
                  <Label htmlFor="entity" className="text-sm font-medium">
                    Business Entity Verified (LLC/Corp/Sole Prop)
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Contractor Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Contractor Name *</Label>
                  <Input
                    id="contractorName"
                    value={newAgreement.contractorName}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, contractorName: e.target.value }))}
                    placeholder="Full legal name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractorEmail">Email *</Label>
                  <Input
                    id="contractorEmail"
                    type="email"
                    value={newAgreement.contractorEmail}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, contractorEmail: e.target.value }))}
                    placeholder="contractor@business.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={newAgreement.contractorBusinessName}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, contractorBusinessName: e.target.value }))}
                    placeholder="Business LLC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN (if applicable)</Label>
                  <Input
                    id="ein"
                    value={newAgreement.contractorEIN}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, contractorEIN: e.target.value }))}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
              </div>

              <Separator />

              {/* Contract Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity">Contracting Entity *</Label>
                  <Select value={newAgreement.entity} onValueChange={(value) => setNewAgreement(prev => ({ ...prev, entity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITIES.map((entity) => (
                        <SelectItem key={entity.id} value={entity.name}>{entity.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category *</Label>
                  <Select value={newAgreement.serviceCategory} onValueChange={(value) => setNewAgreement(prev => ({ ...prev, serviceCategory: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scopeOfWork">Scope of Work *</Label>
                <Textarea
                  id="scopeOfWork"
                  value={newAgreement.scopeOfWork}
                  onChange={(e) => setNewAgreement(prev => ({ ...prev, scopeOfWork: e.target.value }))}
                  placeholder="Describe the services to be provided..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rate Type</Label>
                  <Select value={newAgreement.rateType} onValueChange={(value: "hourly" | "project") => setNewAgreement(prev => ({ ...prev, rateType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="project">Project Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">{newAgreement.rateType === "hourly" ? "Hourly Rate" : "Project Rate"}</Label>
                  <Input
                    id="rate"
                    value={newAgreement.rate}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder={newAgreement.rateType === "hourly" ? "$100" : "$5,000"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select value={newAgreement.paymentTerms} onValueChange={(value) => setNewAgreement(prev => ({ ...prev, paymentTerms: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Upon Completion">Upon Completion</SelectItem>
                      <SelectItem value="50% upfront, 50% on completion">50/50 Split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newAgreement.startDate}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newAgreement.endDate}
                    onChange={(e) => setNewAgreement(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAgreement}>Create Agreement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Agreement Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contractor Agreement Preview</DialogTitle>
            </DialogHeader>
            {selectedAgreement && (
              <div className="space-y-4">
                <div className="bg-white p-8 border rounded-lg shadow-sm">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">INDEPENDENT CONTRACTOR AGREEMENT</h2>
                    <p className="text-muted-foreground mt-2">Agreement #{selectedAgreement.id}</p>
                  </div>
                  
                  <p className="mb-6">
                    This Independent Contractor Agreement ("Agreement") is entered into as of{" "}
                    <strong>{selectedAgreement.startDate}</strong> by and between:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">CLIENT</h4>
                      <p className="font-medium">{selectedAgreement.entity}</p>
                      <p className="text-sm text-muted-foreground">A Texas Limited Liability Company</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">CONTRACTOR</h4>
                      <p className="font-medium">{selectedAgreement.contractorBusinessName || selectedAgreement.contractorName}</p>
                      {selectedAgreement.contractorBusinessName && (
                        <p className="text-sm text-muted-foreground">{selectedAgreement.contractorName}, Principal</p>
                      )}
                      <p className="text-sm text-muted-foreground">{selectedAgreement.contractorEmail}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">1. SERVICES</h3>
                      <p>
                        Contractor agrees to provide the following services ("Services") to Client:
                      </p>
                      <div className="p-4 bg-muted rounded-lg mt-2">
                        <p className="font-medium">
                          {SERVICE_CATEGORIES.find(c => c.id === selectedAgreement.serviceCategory)?.name}
                        </p>
                        <p className="text-sm mt-2">{selectedAgreement.scopeOfWork}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">2. COMPENSATION</h3>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr>
                            <td className="py-2 text-muted-foreground">Rate:</td>
                            <td className="py-2 font-medium">
                              {selectedAgreement.hourlyRate 
                                ? `${selectedAgreement.hourlyRate} per hour`
                                : `${selectedAgreement.projectRate} (project total)`
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-muted-foreground">Payment Terms:</td>
                            <td className="py-2">{selectedAgreement.paymentTerms}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-muted-foreground">Contract Period:</td>
                            <td className="py-2">
                              {selectedAgreement.startDate}
                              {selectedAgreement.endDate ? ` to ${selectedAgreement.endDate}` : " (ongoing)"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">3. INDEPENDENT CONTRACTOR STATUS</h3>
                      <p className="text-sm">
                        Contractor is an independent contractor and not an employee of Client. Contractor shall be 
                        solely responsible for all taxes, including self-employment taxes, and shall not be entitled 
                        to any employee benefits. Contractor acknowledges completion of the required Contractor 
                        Training Module covering tax responsibilities and independent contractor status.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">4. CONFIDENTIALITY</h3>
                      <p className="text-sm">
                        Contractor agrees to maintain the confidentiality of all proprietary information disclosed 
                        by Client during the course of this engagement.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">5. WORK PRODUCT</h3>
                      <p className="text-sm">
                        All work product created by Contractor in the performance of Services shall be the sole 
                        property of Client, unless otherwise agreed in writing.
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <div className="mt-8">
                    <p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
                    
                    <div className="grid grid-cols-2 gap-8 mt-8">
                      <div>
                        <p className="font-semibold mb-4">CLIENT:</p>
                        <p className="font-medium">LaShanna Russell</p>
                        <p className="text-sm text-muted-foreground">Founder & Managing Member</p>
                        <p className="text-sm text-muted-foreground">{selectedAgreement.entity}</p>
                        <div className="border-b border-gray-400 mt-8 mb-1 h-8"></div>
                        <p className="text-sm text-muted-foreground">Signature / Date</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-4">CONTRACTOR:</p>
                        <p className="font-medium">{selectedAgreement.contractorName}</p>
                        {selectedAgreement.contractorBusinessName && (
                          <p className="text-sm text-muted-foreground">{selectedAgreement.contractorBusinessName}</p>
                        )}
                        <div className="border-b border-gray-400 mt-8 mb-1 h-8"></div>
                        <p className="text-sm text-muted-foreground">Signature / Date</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => toast.success("Copied to clipboard")}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Printing...")}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Downloaded as PDF")}>
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                  {selectedAgreement.status === "draft" && (
                    <Button onClick={() => {
                      handleSendAgreement(selectedAgreement);
                      setShowPreviewDialog(false);
                    }}>
                      <Send className="w-4 h-4 mr-1" />
                      Send Agreement
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
