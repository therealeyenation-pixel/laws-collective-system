import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

const ACTION_TYPES = [
  { value: "regulatory_change", label: "Regulatory Change" },
  { value: "grant_announcement", label: "Grant Announcement" },
  { value: "tax_update", label: "Tax Update" },
  { value: "licensing_requirement", label: "Licensing Requirement" },
  { value: "labor_law", label: "Labor Law" },
  { value: "nonprofit_compliance", label: "Nonprofit Compliance" },
  { value: "filing_deadline", label: "Filing Deadline" },
  { value: "policy_change", label: "Policy Change" },
  { value: "enforcement_action", label: "Enforcement Action" },
  { value: "guidance_update", label: "Guidance Update" },
];

const IMPACT_LEVELS = [
  { value: "critical", label: "Critical", color: "bg-red-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "low", label: "Low", color: "bg-blue-500" },
  { value: "informational", label: "Informational", color: "bg-gray-500" },
];

const SWOT_CATEGORIES = [
  { value: "strength", label: "Strength", color: "bg-green-500" },
  { value: "weakness", label: "Weakness", color: "bg-red-500" },
  { value: "opportunity", label: "Opportunity", color: "bg-blue-500" },
  { value: "threat", label: "Threat", color: "bg-orange-500" },
];

export default function GovernmentActionsAdmin() {
  const [activeTab, setActiveTab] = useState("actions");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");
  
  const [showAgencyDialog, setShowAgencyDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  
  const [agencyForm, setAgencyForm] = useState({
    code: "",
    name: "",
    fullName: "",
    level: "federal" as const,
    website: "",
    contactEmail: "",
    contactPhone: "",
  });
  
  const [actionForm, setActionForm] = useState({
    title: "",
    description: "",
    agencyId: 0,
    sourceUrl: "",
    referenceNumber: "",
    actionType: "regulatory_change" as const,
    announcedDate: "",
    effectiveDate: "",
    deadline: "",
    impactLevel: "medium" as const,
    affectedDepartments: [] as string[],
    swotCategory: "" as string,
    swotNotes: "",
    showInTicker: true,
    tickerPriority: "normal" as const,
  });

  const { data: agencies, refetch: refetchAgencies } = trpc.governmentActions.listAgencies.useQuery({});
  const { data: actions, refetch: refetchActions } = trpc.governmentActions.list.useQuery({
    actionType: filterType !== "all" ? filterType as any : undefined,
    impactLevel: filterImpact !== "all" ? filterImpact as any : undefined,
  });
  const { data: stats } = trpc.governmentActions.getStats.useQuery();

  const createAgency = trpc.governmentActions.createAgency.useMutation({
    onSuccess: () => {
      toast.success("Agency created successfully");
      setShowAgencyDialog(false);
      resetAgencyForm();
      refetchAgencies();
    },
    onError: (error) => toast.error(error.message),
  });

  const createAction = trpc.governmentActions.create.useMutation({
    onSuccess: () => {
      toast.success("Government action created successfully");
      setShowActionDialog(false);
      resetActionForm();
      refetchActions();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateAction = trpc.governmentActions.update.useMutation({
    onSuccess: () => {
      toast.success("Government action updated successfully");
      setShowActionDialog(false);
      setEditingAction(null);
      resetActionForm();
      refetchActions();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteAction = trpc.governmentActions.delete.useMutation({
    onSuccess: () => {
      toast.success("Government action archived");
      refetchActions();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetAgencyForm = () => {
    setAgencyForm({
      code: "",
      name: "",
      fullName: "",
      level: "federal",
      website: "",
      contactEmail: "",
      contactPhone: "",
    });
  };

  const resetActionForm = () => {
    setActionForm({
      title: "",
      description: "",
      agencyId: 0,
      sourceUrl: "",
      referenceNumber: "",
      actionType: "regulatory_change",
      announcedDate: "",
      effectiveDate: "",
      deadline: "",
      impactLevel: "medium",
      affectedDepartments: [],
      swotCategory: "",
      swotNotes: "",
      showInTicker: true,
      tickerPriority: "normal",
    });
    setEditingAction(null);
  };

  const handleCreateAgency = () => {
    createAgency.mutate(agencyForm);
  };

  const handleCreateAction = () => {
    const data: any = {
      title: actionForm.title,
      description: actionForm.description || undefined,
      agencyId: actionForm.agencyId,
      sourceUrl: actionForm.sourceUrl || undefined,
      referenceNumber: actionForm.referenceNumber || undefined,
      actionType: actionForm.actionType,
      impactLevel: actionForm.impactLevel,
      affectedDepartments: actionForm.affectedDepartments.length > 0 ? actionForm.affectedDepartments : undefined,
      showInTicker: actionForm.showInTicker,
      tickerPriority: actionForm.tickerPriority,
    };

    if (actionForm.announcedDate) data.announcedDate = new Date(actionForm.announcedDate);
    if (actionForm.effectiveDate) data.effectiveDate = new Date(actionForm.effectiveDate);
    if (actionForm.deadline) data.deadline = new Date(actionForm.deadline);
    if (actionForm.swotCategory) {
      data.swotCategory = actionForm.swotCategory;
      data.swotNotes = actionForm.swotNotes || undefined;
    }

    if (editingAction) {
      updateAction.mutate({ id: editingAction.id, ...data });
    } else {
      createAction.mutate(data);
    }
  };

  const handleEditAction = (action: any) => {
    setEditingAction(action);
    setActionForm({
      title: action.title,
      description: action.description || "",
      agencyId: action.agencyId,
      sourceUrl: action.sourceUrl || "",
      referenceNumber: action.referenceNumber || "",
      actionType: action.actionType,
      announcedDate: action.announcedDate ? format(new Date(action.announcedDate), "yyyy-MM-dd") : "",
      effectiveDate: action.effectiveDate ? format(new Date(action.effectiveDate), "yyyy-MM-dd") : "",
      deadline: action.deadline ? format(new Date(action.deadline), "yyyy-MM-dd") : "",
      impactLevel: action.impactLevel,
      affectedDepartments: action.affectedDepartments || [],
      swotCategory: action.swotCategory || "",
      swotNotes: action.swotNotes || "",
      showInTicker: action.showInTicker,
      tickerPriority: action.tickerPriority,
    });
    setShowActionDialog(true);
  };

  const handleDeleteAction = (id: number) => {
    if (confirm("Are you sure you want to archive this government action?")) {
      deleteAction.mutate({ id });
    }
  };

  const getImpactBadge = (level: string) => {
    const impact = IMPACT_LEVELS.find(i => i.value === level);
    return <Badge className={`${impact?.color || "bg-gray-500"} text-white`}>{impact?.label || level}</Badge>;
  };

  const getSwotBadge = (category: string | null) => {
    if (!category) return null;
    const swot = SWOT_CATEGORIES.find(s => s.value === category);
    return <Badge variant="outline">{swot?.label || category}</Badge>;
  };

  const filteredActions = actions?.filter(action => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return action.title.toLowerCase().includes(query) || action.description?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Government Actions Admin</h1>
            <p className="text-muted-foreground">Manage government agencies, regulatory actions, and compliance deadlines</p>
          </div>
          <Button variant="outline" onClick={() => { refetchAgencies(); refetchActions(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalActive || 0}</p>
                <p className="text-xs text-muted-foreground">Active Actions</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.upcomingDeadlines || 0}</p>
                <p className="text-xs text-muted-foreground">Upcoming Deadlines</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pendingCompliance || 0}</p>
                <p className="text-xs text-muted-foreground">Pending Compliance</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.criticalActions || 0}</p>
                <p className="text-xs text-muted-foreground">Critical Actions</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="actions">Government Actions</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search actions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Action Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {ACTION_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterImpact} onValueChange={setFilterImpact}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Impact Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {IMPACT_LEVELS.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetActionForm(); setShowActionDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Action</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingAction ? "Edit" : "Add"} Government Action</DialogTitle>
                      <DialogDescription>Track regulatory changes, grant announcements, and compliance deadlines</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Title *</Label>
                        <Input value={actionForm.title} onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })} placeholder="e.g., IRS Form 990 Filing Deadline" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea value={actionForm.description} onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })} placeholder="Detailed description..." rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Agency *</Label>
                          <Select value={actionForm.agencyId.toString()} onValueChange={(v) => setActionForm({ ...actionForm, agencyId: parseInt(v) })}>
                            <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                            <SelectContent>
                              {agencies?.map(agency => <SelectItem key={agency.id} value={agency.id.toString()}>{agency.code} - {agency.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Action Type *</Label>
                          <Select value={actionForm.actionType} onValueChange={(v: any) => setActionForm({ ...actionForm, actionType: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ACTION_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Impact Level</Label>
                          <Select value={actionForm.impactLevel} onValueChange={(v: any) => setActionForm({ ...actionForm, impactLevel: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {IMPACT_LEVELS.map(level => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Reference Number</Label>
                          <Input value={actionForm.referenceNumber} onChange={(e) => setActionForm({ ...actionForm, referenceNumber: e.target.value })} placeholder="e.g., Notice 2026-01" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label>Announced Date</Label>
                          <Input type="date" value={actionForm.announcedDate} onChange={(e) => setActionForm({ ...actionForm, announcedDate: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Effective Date</Label>
                          <Input type="date" value={actionForm.effectiveDate} onChange={(e) => setActionForm({ ...actionForm, effectiveDate: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Deadline</Label>
                          <Input type="date" value={actionForm.deadline} onChange={(e) => setActionForm({ ...actionForm, deadline: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Source URL</Label>
                        <Input value={actionForm.sourceUrl} onChange={(e) => setActionForm({ ...actionForm, sourceUrl: e.target.value })} placeholder="https://www.irs.gov/..." />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>SWOT Category</Label>
                          <Select value={actionForm.swotCategory} onValueChange={(v) => setActionForm({ ...actionForm, swotCategory: v })}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {SWOT_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Ticker Priority</Label>
                          <Select value={actionForm.tickerPriority} onValueChange={(v: any) => setActionForm({ ...actionForm, tickerPriority: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateAction} disabled={!actionForm.title || !actionForm.agencyId}>{editingAction ? "Update" : "Create"} Action</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>SWOT</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions?.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{action.title}</p>
                          {action.referenceNumber && <p className="text-xs text-muted-foreground">{action.referenceNumber}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{agencies?.find(a => a.id === action.agencyId)?.code || "Unknown"}</Badge></TableCell>
                      <TableCell><span className="text-sm">{ACTION_TYPES.find(t => t.value === action.actionType)?.label || action.actionType}</span></TableCell>
                      <TableCell>{getImpactBadge(action.impactLevel)}</TableCell>
                      <TableCell>
                        {action.deadline ? (
                          <span className={`text-sm ${new Date(action.deadline) < new Date() ? "text-red-500" : ""}`}>
                            {format(new Date(action.deadline), "MMM d, yyyy")}
                          </span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{getSwotBadge(action.swotCategory)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {action.sourceUrl && <Button variant="ghost" size="icon" onClick={() => window.open(action.sourceUrl!, "_blank")}><ExternalLink className="w-4 h-4" /></Button>}
                          <Button variant="ghost" size="icon" onClick={() => handleEditAction(action)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteAction(action.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!filteredActions || filteredActions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No government actions found. Click "Add Action" to create one.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="agencies" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Government Agencies</h3>
                <Dialog open={showAgencyDialog} onOpenChange={setShowAgencyDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetAgencyForm(); setShowAgencyDialog(true); }}><Plus className="w-4 h-4 mr-2" />Add Agency</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Government Agency</DialogTitle>
                      <DialogDescription>Add a new government agency to track regulatory actions from</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Code *</Label>
                          <Input value={agencyForm.code} onChange={(e) => setAgencyForm({ ...agencyForm, code: e.target.value.toUpperCase() })} placeholder="e.g., IRS" maxLength={20} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Level</Label>
                          <Select value={agencyForm.level} onValueChange={(v: any) => setAgencyForm({ ...agencyForm, level: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="federal">Federal</SelectItem>
                              <SelectItem value="state">State</SelectItem>
                              <SelectItem value="local">Local</SelectItem>
                              <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Name *</Label>
                        <Input value={agencyForm.name} onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })} placeholder="e.g., Internal Revenue Service" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Full Name</Label>
                        <Input value={agencyForm.fullName} onChange={(e) => setAgencyForm({ ...agencyForm, fullName: e.target.value })} placeholder="e.g., Department of the Treasury - Internal Revenue Service" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Website</Label>
                        <Input value={agencyForm.website} onChange={(e) => setAgencyForm({ ...agencyForm, website: e.target.value })} placeholder="https://www.irs.gov" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAgencyDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateAgency} disabled={!agencyForm.code || !agencyForm.name}>Create Agency</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agencies?.map((agency) => (
                <Card key={agency.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{agency.code}</p>
                        <p className="text-sm text-muted-foreground">{agency.name}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{agency.level}</Badge>
                  </div>
                  {agency.website && (
                    <div className="mt-3">
                      <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />Visit Website
                      </a>
                    </div>
                  )}
                </Card>
              ))}
              {(!agencies || agencies.length === 0) && (
                <Card className="p-8 col-span-full text-center text-muted-foreground">No agencies found. Click "Add Agency" to create one.</Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
