import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Building2, CheckCircle2, Clock, AlertCircle, Plus, FileText, Shield, Loader2, 
  ChevronRight, MapPin, Calendar, Hash, Lock, Eye, EyeOff, CircleDot, 
  FileCheck, Landmark, Users, Scale, Building, Briefcase
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Formation status levels
type FormationStatus = "not_started" | "ein_obtained" | "formed" | "active";

interface EntityData {
  id: number;
  name: string;
  entityType: "llc" | "trust" | "nonprofit" | "collective" | "corporation";
  state: string;
  formationStatus: FormationStatus;
  dateFormed?: string;
  ein?: string;
  controlNumber?: string;
  address?: string;
  naicsCode?: string;
  hasEIN: boolean;
  hasPaperwork: boolean;
  isOperating: boolean;
  notes?: string;
}

// Real entities with actual formation status
const REAL_ENTITIES: EntityData[] = [
  {
    id: 1,
    name: "Real-Eye-Nation LLC",
    entityType: "llc",
    state: "GA",
    formationStatus: "active",
    dateFormed: "2020-03-03",
    ein: "84-4976416",
    controlNumber: "20031738",
    hasEIN: true,
    hasPaperwork: true,
    isOperating: true,
    address: "113 S. Perry Street Suite 206, Lawrenceville, GA 30046",
    notes: "Georgia Domestic LLC. Control Number: 20031738. Filed 02/28/2020, Effective 03/03/2020. Registered Agent: Legalinc Corporate Services Inc. Virtual Address: 113 S. Perry Street Suite 206, Lawrenceville, GA 30046."
  },
  {
    id: 2,
    name: "Calea Freeman Family Trust",
    entityType: "trust",
    state: "Jamaica",
    formationStatus: "active",
    dateFormed: "2019-03-04",
    ein: "98-6109577",
    hasEIN: true,
    hasPaperwork: true,
    isOperating: true,
    address: "99 Great George St, Savanna la Mar, Westmoreland, Jamaica",
    notes: "98 Grantor Trust - Foreign trust with Jamaica address. EIN obtained March 2019. Mailing: 2302 Parklake Dr NE SU3 #808, Atlanta GA 30345."
  },
  {
    id: 3,
    name: "LuvOnPurpose Autonomous Wealth System LLC",
    entityType: "llc",
    state: "Delaware",
    formationStatus: "active",
    dateFormed: "2025-07-08",
    controlNumber: "10252584",
    hasEIN: false,
    hasPaperwork: true,
    isOperating: true,
    address: "262 Chapman Rd, Ste 240, Newark, DE 19702",
    notes: "Delaware LLC. File Number: 10252584. SR: 20253294275. Registered Agent: Republic Registered Agent LLC. Organizer: Lovette Dobson. Revenue assignment: Products (Platform/SaaS subscriptions)."
  },
  {
    id: 4,
    name: "The L.A.W.S. Collective, LLC",
    entityType: "llc",
    state: "Delaware",
    formationStatus: "active",
    dateFormed: "2025-07-07",
    ein: "39-3122993",
    controlNumber: "10251122",
    hasEIN: true,
    hasPaperwork: true,
    isOperating: true,
    address: "262 Chapman Rd, Ste 240, Newark, DE 19702",
    notes: "Delaware LLC. File Number: 10251122. SR: 20253283949. EIN: 39-3122993. Registered Agent: Republic Registered Agent LLC. Member: Lashanna Russell (4093 Cottingham Way, Augusta, GA 30909)."
  },
  {
    id: 5,
    name: "LuvOnPurpose Outreach Temple and Academy Society, Inc.",
    entityType: "nonprofit",
    state: "GA",
    formationStatus: "active",
    dateFormed: "2025-07-04",
    controlNumber: "25132958",
    hasEIN: false,
    hasPaperwork: true,
    isOperating: true,
    address: "4093 Cottingham Way, Augusta, GA 30909",
    naicsCode: "Religious Organizations",
    notes: "Domestic Nonprofit Corporation - Georgia. Control Number: 25132958. Status: Active/Owes Current Year AR. NAICS: Religious Organizations."
  },
];

// Formation checklists by entity type
const FORMATION_CHECKLISTS: Record<string, { title: string; items: { id: string; label: string; required: boolean }[] }> = {
  llc: {
    title: "LLC Formation Checklist",
    items: [
      { id: "name_search", label: "Business name availability search", required: true },
      { id: "registered_agent", label: "Designate registered agent", required: true },
      { id: "articles", label: "File Articles of Organization", required: true },
      { id: "ein", label: "Obtain Federal EIN", required: true },
      { id: "operating_agreement", label: "Draft Operating Agreement", required: true },
      { id: "bank_account", label: "Open business bank account", required: true },
      { id: "licenses", label: "Obtain necessary licenses/permits", required: false },
      { id: "dba", label: "File DBA if using trade name", required: false },
    ]
  },
  trust: {
    title: "Trust Establishment Checklist",
    items: [
      { id: "trust_type", label: "Determine trust type (revocable/irrevocable)", required: true },
      { id: "trustee", label: "Designate trustee(s)", required: true },
      { id: "beneficiaries", label: "Identify beneficiaries", required: true },
      { id: "trust_document", label: "Draft trust document/declaration", required: true },
      { id: "ein", label: "Obtain Federal EIN", required: true },
      { id: "fund_trust", label: "Fund the trust with assets", required: true },
      { id: "bank_account", label: "Open trust bank account", required: true },
      { id: "retitle_assets", label: "Retitle assets to trust", required: false },
      { id: "schedule_a", label: "Create Schedule A (asset list)", required: false },
    ]
  },
  nonprofit: {
    title: "508(c)(1)(A) Nonprofit Checklist",
    items: [
      { id: "name_search", label: "Organization name availability search", required: true },
      { id: "articles", label: "File Articles of Incorporation", required: true },
      { id: "bylaws", label: "Draft bylaws", required: true },
      { id: "board", label: "Establish board of directors", required: true },
      { id: "ein", label: "Obtain Federal EIN", required: true },
      { id: "508_declaration", label: "File 508(c)(1)(A) declaration", required: true },
      { id: "bank_account", label: "Open organization bank account", required: true },
      { id: "state_registration", label: "State charitable registration", required: false },
      { id: "record_keeping", label: "Establish record-keeping system", required: true },
    ]
  },
  collective: {
    title: "Collective Formation Checklist",
    items: [
      { id: "structure", label: "Determine legal structure (LLC, Coop, etc.)", required: true },
      { id: "membership", label: "Define membership criteria", required: true },
      { id: "governance", label: "Establish governance structure", required: true },
      { id: "operating_agreement", label: "Draft collective agreement", required: true },
      { id: "ein", label: "Obtain Federal EIN", required: true },
      { id: "bank_account", label: "Open collective bank account", required: true },
      { id: "decision_process", label: "Document decision-making process", required: true },
      { id: "profit_sharing", label: "Define profit/resource sharing", required: false },
    ]
  },
  corporation: {
    title: "Corporation Formation Checklist",
    items: [
      { id: "name_search", label: "Corporate name availability search", required: true },
      { id: "registered_agent", label: "Designate registered agent", required: true },
      { id: "articles", label: "File Articles of Incorporation", required: true },
      { id: "bylaws", label: "Draft corporate bylaws", required: true },
      { id: "ein", label: "Obtain Federal EIN", required: true },
      { id: "stock", label: "Issue stock certificates", required: true },
      { id: "board_meeting", label: "Hold initial board meeting", required: true },
      { id: "bank_account", label: "Open corporate bank account", required: true },
      { id: "s_election", label: "File S-Corp election if applicable", required: false },
    ]
  }
};

export default function BusinessFormation() {
  const { user } = useAuth();
  const isOwner = user?.role === "admin";
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityData | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const { data: trackers, isLoading: trackersLoading, refetch: refetchTrackers } = trpc.businessFormation.getTrackers.useQuery();
  const { data: dashboard } = trpc.businessFormation.getDashboard.useQuery();
  const { data: stateInfo } = trpc.businessFormation.getStateInfo.useQuery({ stateCode: "GA" });
  const { data: allStates } = trpc.businessFormation.getAllStates.useQuery();

  const createEntityMutation = trpc.businessFormation.startFormation.useMutation({
    onSuccess: () => { toast.success("Business formation started"); refetchTrackers(); setShowCreateDialog(false); },
    onError: (error: any) => toast.error(error.message),
  });

  const [formData, setFormData] = useState({ businessName: "", entityType: "llc" as "llc" | "corporation" | "trust" | "collective", stateCode: "GA" });
  const [importData, setImportData] = useState({ businessName: "", entityType: "llc" as "llc" | "corporation" | "trust" | "collective", stateCode: "GA", dateOfFormation: "", federalEIN: "", registeredAgentName: "", principalAddress: "" });

  const handleCreateEntity = () => { createEntityMutation.mutate(formData); };
  const handleImportEntity = () => { toast.success("Entity imported - feature coming soon"); setShowImportDialog(false); };

  const getFormationStatusBadge = (status: FormationStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />Active & Operating</Badge>;
      case "formed":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Building2 className="w-3 h-3 mr-1" />Formed - Not Operating</Badge>;
      case "ein_obtained":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Hash className="w-3 h-3 mr-1" />EIN Obtained</Badge>;
      case "not_started":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20"><CircleDot className="w-3 h-3 mr-1" />Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case "llc": return <Building2 className="w-5 h-5" />;
      case "trust": return <Shield className="w-5 h-5" />;
      case "nonprofit": return <Landmark className="w-5 h-5" />;
      case "collective": return <Users className="w-5 h-5" />;
      case "corporation": return <Building className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const getFormationProgress = (entity: EntityData): number => {
    switch (entity.formationStatus) {
      case "active": return 100;
      case "formed": return 75;
      case "ein_obtained": return 50;
      case "not_started": return entity.hasPaperwork ? 25 : 0;
      default: return 0;
    }
  };

  const maskEIN = (ein: string): string => {
    if (!ein) return "";
    return ein.replace(/(\d{2})-?(\d{7})/, "XX-XXXXX$2".slice(-2));
  };

  // Count entities by status
  const statusCounts = {
    total: REAL_ENTITIES.length,
    active: REAL_ENTITIES.filter(e => e.formationStatus === "active").length,
    formed: REAL_ENTITIES.filter(e => e.formationStatus === "formed").length,
    einObtained: REAL_ENTITIES.filter(e => e.formationStatus === "ein_obtained").length,
    notStarted: REAL_ENTITIES.filter(e => e.formationStatus === "not_started").length,
    withPaperwork: REAL_ENTITIES.filter(e => e.hasPaperwork).length,
  };

  if (trackersLoading) {
    return (<DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Entity Management</h1>
            <p className="text-muted-foreground">Track formation status and manage business entities</p>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="gap-2"
              >
                {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSensitiveData ? "Hide" : "Show"} Sensitive Data
              </Button>
            )}
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><FileText className="w-4 h-4" />Import Existing</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Import Existing Entity</DialogTitle><DialogDescription>Import a business entity that was already formed</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Business Name</Label><Input value={importData.businessName} onChange={(e) => setImportData({ ...importData, businessName: e.target.value })} placeholder="Entity name" /></div>
                    <div className="space-y-2"><Label>Entity Type</Label>
                      <Select value={importData.entityType} onValueChange={(v: any) => setImportData({ ...importData, entityType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="collective">Collective</SelectItem>
                          <SelectItem value="trust">Trust</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>State of Formation</Label>
                      <Select value={importData.stateCode} onValueChange={(v) => setImportData({ ...importData, stateCode: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {allStates?.map((state: any) => (<SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>)) || (<><SelectItem value="GA">Georgia</SelectItem><SelectItem value="DE">Delaware</SelectItem><SelectItem value="WY">Wyoming</SelectItem></>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Formation Date</Label><Input type="date" value={importData.dateOfFormation} onChange={(e) => setImportData({ ...importData, dateOfFormation: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Federal EIN</Label><Input value={importData.federalEIN} onChange={(e) => setImportData({ ...importData, federalEIN: e.target.value })} placeholder="XX-XXXXXXX" /></div>
                    <div className="space-y-2"><Label>Registered Agent</Label><Input value={importData.registeredAgentName} onChange={(e) => setImportData({ ...importData, registeredAgentName: e.target.value })} placeholder="Agent name" /></div>
                  </div>
                  <div className="space-y-2"><Label>Principal Address</Label><Textarea value={importData.principalAddress} onChange={(e) => setImportData({ ...importData, principalAddress: e.target.value })} placeholder="Full business address" rows={2} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                  <Button onClick={handleImportEntity}>Import Entity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />New Entity</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Start Business Formation</DialogTitle><DialogDescription>Begin the formation process for a new business entity</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><Label>Business Name</Label><Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="Enter business name" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Entity Type</Label>
                      <Select value={formData.entityType} onValueChange={(v: any) => setFormData({ ...formData, entityType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="collective">Collective</SelectItem>
                          <SelectItem value="trust">Trust</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>State of Formation</Label>
                      <Select value={formData.stateCode} onValueChange={(v) => setFormData({ ...formData, stateCode: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {allStates?.map((state: any) => (<SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>)) || (<><SelectItem value="GA">Georgia</SelectItem><SelectItem value="DE">Delaware</SelectItem><SelectItem value="WY">Wyoming</SelectItem></>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateEntity} disabled={createEntityMutation.isPending}>{createEntityMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Start Formation</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Entities</p>
                  <p className="text-xl font-bold">{statusCounts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="text-xl font-bold">{statusCounts.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Formed</p>
                  <p className="text-xl font-bold">{statusCounts.formed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Hash className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">EIN Only</p>
                  <p className="text-xl font-bold">{statusCounts.einObtained}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500/10">
                  <FileCheck className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Has Paperwork</p>
                  <p className="text-xl font-bold">{statusCounts.withPaperwork}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Formation Status Notice</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  None of these entities are currently operating. This system is being built as infrastructure 
                  for when you're ready to activate these businesses. Use the checklists below to track 
                  remaining formation steps for each entity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="checklists">Formation Checklists</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {REAL_ENTITIES.map((entity) => (
                <Card key={entity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          entity.formationStatus === "active" ? "bg-green-500/10 text-green-600" :
                          entity.formationStatus === "formed" ? "bg-blue-500/10 text-blue-600" :
                          entity.formationStatus === "ein_obtained" ? "bg-amber-500/10 text-amber-600" :
                          "bg-gray-500/10 text-gray-600"
                        }`}>
                          {getEntityTypeIcon(entity.entityType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{entity.name}</h3>
                            {getFormationStatusBadge(entity.formationStatus)}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 capitalize">
                              {getEntityTypeIcon(entity.entityType)}
                              <span className="ml-1">{entity.entityType}</span>
                            </span>
                            {entity.state !== "TBD" && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {entity.state === "JM" ? "Jamaica" : entity.state}
                              </span>
                            )}
                            {entity.dateFormed && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(entity.dateFormed).toLocaleDateString()}
                              </span>
                            )}
                            {entity.hasEIN && isOwner && (
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                EIN: {showSensitiveData ? entity.ein : "••-•••••••"}
                              </span>
                            )}
                            {entity.hasEIN && !isOwner && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Lock className="w-3 h-3" />
                                EIN on file
                              </span>
                            )}
                          </div>
                          {entity.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">{entity.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{getFormationProgress(entity)}%</span>
                          </div>
                          <Progress value={getFormationProgress(entity)} className="h-2" />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedEntity(entity);
                            setActiveTab("checklists");
                          }}
                        >
                          View Checklist <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {REAL_ENTITIES.map((entity) => (
                <Card key={entity.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          entity.formationStatus === "active" ? "bg-green-500/10 text-green-600" :
                          entity.formationStatus === "formed" ? "bg-blue-500/10 text-blue-600" :
                          entity.formationStatus === "ein_obtained" ? "bg-amber-500/10 text-amber-600" :
                          "bg-gray-500/10 text-gray-600"
                        }`}>
                          {getEntityTypeIcon(entity.entityType)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{entity.name}</CardTitle>
                          <CardDescription className="capitalize">{entity.entityType}</CardDescription>
                        </div>
                      </div>
                      {getFormationStatusBadge(entity.formationStatus)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">State</p>
                          <p className="font-medium">{entity.state === "JM" ? "Jamaica" : entity.state === "TBD" ? "To Be Determined" : entity.state}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Operating</p>
                          <p className="font-medium">{entity.isOperating ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Has EIN</p>
                          <p className="font-medium">{entity.hasEIN ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Has Paperwork</p>
                          <p className="font-medium">{entity.hasPaperwork ? "Yes" : "No"}</p>
                        </div>
                      </div>
                      {entity.dateFormed && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Date Formed</p>
                          <p className="font-medium">{new Date(entity.dateFormed).toLocaleDateString()}</p>
                        </div>
                      )}
                      {entity.hasEIN && isOwner && showSensitiveData && (
                        <div className="text-sm p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Lock className="w-3 h-3" /> EIN (Owner Only)
                          </p>
                          <p className="font-mono font-medium">{entity.ein}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="checklists" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {Object.entries(FORMATION_CHECKLISTS).map(([type, checklist]) => {
                const entitiesOfType = REAL_ENTITIES.filter(e => e.entityType === type);
                if (entitiesOfType.length === 0) return null;
                
                return (
                  <Card key={type}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {getEntityTypeIcon(type)}
                        <div>
                          <CardTitle>{checklist.title}</CardTitle>
                          <CardDescription>
                            Applies to: {entitiesOfType.map(e => e.name).join(", ")}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {checklist.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                          >
                            <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex items-center justify-center">
                              {/* Checkbox placeholder - would be interactive in full implementation */}
                            </div>
                            <span className="flex-1">{item.label}</span>
                            {item.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Formation Documents</CardTitle>
                <CardDescription>Legal documents associated with your business entities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {REAL_ENTITIES.filter(e => e.hasEIN || e.hasPaperwork).map((entity) => (
                    <div key={entity.id} className="p-4 rounded-lg border">
                      <div className="flex items-center gap-3 mb-3">
                        {getEntityTypeIcon(entity.entityType)}
                        <h4 className="font-medium">{entity.name}</h4>
                        {getFormationStatusBadge(entity.formationStatus)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {entity.hasEIN && (
                          <Button variant="outline" size="sm" className="justify-start gap-2">
                            <FileText className="w-4 h-4" />
                            EIN Letter
                            {isOwner && <Lock className="w-3 h-3 ml-auto" />}
                          </Button>
                        )}
                        {entity.formationStatus === "formed" && (
                          <>
                            <Button variant="outline" size="sm" className="justify-start gap-2">
                              <FileText className="w-4 h-4" />
                              Articles of Organization
                            </Button>
                            <Button variant="outline" size="sm" className="justify-start gap-2">
                              <FileText className="w-4 h-4" />
                              Operating Agreement
                            </Button>
                          </>
                        )}
                        {entity.hasPaperwork && entity.formationStatus === "not_started" && (
                          <Button variant="outline" size="sm" className="justify-start gap-2">
                            <FileText className="w-4 h-4" />
                            Formation Paperwork
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
