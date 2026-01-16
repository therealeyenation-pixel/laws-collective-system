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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, CheckCircle2, Clock, AlertCircle, Plus, FileText, Shield, Loader2, ChevronRight, MapPin, Calendar, Hash } from "lucide-react";

export default function BusinessFormation() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

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

  // Real entities from dashboard
  const realEntities = [
    { id: 1, name: "Real-Eye-Nation, LLC", state: "GA", status: "active", dateFormed: "2020-03-04", ein: "84-4976414", dbaStatus: "incomplete" },
    { id: 2, name: "The L.A.W.S. Collective, LLC", state: "DE", status: "active", dateFormed: "2024-01-01", ein: "pending", dbaStatus: "n/a" },
    { id: 3, name: "LuvOnPurpose Autonomous Wealth System, LLC", state: "DE", status: "active", dateFormed: "2024-01-01", ein: "pending", dbaStatus: "n/a" },
  ];
  const entities = realEntities;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "pending": return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case "dissolved": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Dissolved</Badge>;
      case "complete": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Complete</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (trackersLoading) {
    return (<DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Business Formation</h1>
            <p className="text-muted-foreground">Manage business entity formation, compliance, and documentation</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild><Button variant="outline" className="gap-2"><FileText className="w-4 h-4" />Import Existing</Button></DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Import Existing Entity</DialogTitle><DialogDescription>Import a business entity that was already formed</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Business Name</Label><Input value={importData.businessName} onChange={(e) => setImportData({ ...importData, businessName: e.target.value })} placeholder="Real-Eye-Nation, LLC" /></div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Building2 className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Entities</p><p className="text-2xl font-bold">{entities.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><CheckCircle2 className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold">{entities.filter((e: any) => e.status === "active").length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-yellow-500/10"><Clock className="w-6 h-6 text-yellow-600" /></div><div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{trackers?.length || 0}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><Shield className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Compliant</p><p className="text-2xl font-bold">{entities.filter((e: any) => e.formationStatus === "complete").length}</p></div></div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="entities">Entities</TabsTrigger><TabsTrigger value="compliance">Compliance</TabsTrigger><TabsTrigger value="documents">Documents</TabsTrigger></TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Formation Requirements</CardTitle><CardDescription>State filing information and requirements</CardDescription></CardHeader>
              <CardContent>
                {stateInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><span className="font-medium">{stateInfo.name} Requirements</span><Badge variant="outline">${stateInfo.llcFilingFee} LLC Filing Fee</Badge></div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-muted-foreground">SOS Website</p><a href={`https://${stateInfo.sosWebsite}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{stateInfo.sosWebsite}</a></div>
                      <div><p className="text-muted-foreground">Processing Time</p><p className="font-medium">{stateInfo.processingTime}</p></div>
                      <div><p className="text-muted-foreground">E-Filing Available</p><p className="font-medium">{stateInfo.eFilingAvailable ? "Yes" : "No"}</p></div>
                      <div><p className="text-muted-foreground">Annual Report Fee</p><p className="font-medium">${stateInfo.annualReportFee}</p></div>
                    </div>
                  </div>
                ) : (<p className="text-muted-foreground text-center py-8">Loading state information...</p>)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entities" className="space-y-4 mt-4">
            {entities.length > 0 ? (
              <div className="grid gap-4">
                {entities.map((entity: any) => (
                  <Card key={entity.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10"><Building2 className="w-6 h-6 text-primary" /></div>
                          <div>
                            <h3 className="font-semibold">{entity.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{entity.stateOfFormation}</span>
                              {entity.dateOfFormation && (<span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(entity.dateOfFormation).toLocaleDateString()}</span>)}
                              {entity.federalEIN && (<span className="flex items-center gap-1"><Hash className="w-3 h-3" />EIN: {entity.federalEIN}</span>)}
                            </div>
                            {entity.dbaStatus === "not_filed" && (<p className="text-xs text-amber-600 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />DBA registration not filed</p>)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">{getStatusBadge(entity.status)}<Button variant="ghost" size="sm"><ChevronRight className="w-4 h-4" /></Button></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card><CardContent className="py-12"><div className="text-center space-y-4"><Building2 className="w-12 h-12 mx-auto text-muted-foreground/50" /><div><h3 className="font-semibold">No Business Entities</h3><p className="text-sm text-muted-foreground mt-1">Create a new entity or import an existing one</p></div><div className="flex gap-2 justify-center"><Button variant="outline" onClick={() => setShowImportDialog(true)}>Import Existing</Button><Button onClick={() => setShowCreateDialog(true)}>Create New</Button></div></div></CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4 mt-4">
            <Card><CardHeader><CardTitle>Compliance Calendar</CardTitle><CardDescription>Upcoming deadlines and filing requirements</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entities.filter((e: any) => e.status === "active").map((entity: any) => (
                    <div key={entity.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3"><h4 className="font-medium">{entity.name}</h4><Badge variant="outline">{entity.stateOfFormation}</Badge></div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Annual Report Due</span><span className="font-medium">April 1, 2026</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Registered Agent Fee</span><span className="font-medium">January 1, 2027</span></div>
                      </div>
                    </div>
                  ))}
                  {entities.length === 0 && (<p className="text-center text-muted-foreground py-8">No active entities to track</p>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card><CardHeader><CardTitle>Formation Documents</CardTitle><CardDescription>Legal documents associated with your business entities</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entities.map((entity: any) => (
                    <div key={entity.id} className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">{entity.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="justify-start gap-2"><FileText className="w-4 h-4" />Articles of Organization</Button>
                        <Button variant="outline" size="sm" className="justify-start gap-2"><FileText className="w-4 h-4" />Operating Agreement</Button>
                        {entity.federalEIN && (<Button variant="outline" size="sm" className="justify-start gap-2"><FileText className="w-4 h-4" />EIN Letter</Button>)}
                      </div>
                    </div>
                  ))}
                  {entities.length === 0 && (<p className="text-center text-muted-foreground py-8">No entities to show documents for</p>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
