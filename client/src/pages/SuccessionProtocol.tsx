import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Shield, Lock, Users, Plus, AlertCircle, CheckCircle2, Loader2, Key, Clock, UserPlus, ShieldAlert, ShieldCheck, Trash2, AlertTriangle, Timer, Eye, XCircle, CheckCircle } from "lucide-react";

const ACCESS_LEVEL_LABELS: Record<string, string> = { full: "Full Access", identity_only: "Identity Only", legal_only: "Legal Only", distribution_only: "Distribution Only" };
const REASON_LABELS: Record<string, string> = { owner_incapacitated: "Owner Incapacitated", owner_deceased: "Owner Deceased", legal_requirement: "Legal Requirement", succession_transfer: "Succession Transfer", emergency_medical: "Emergency Medical" };
const STATUS_COLORS: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", auto_approved: "bg-blue-100 text-blue-800", cancelled: "bg-gray-100 text-gray-600", denied: "bg-red-100 text-red-800", expired: "bg-gray-100 text-gray-500", used: "bg-purple-100 text-purple-800", active: "bg-green-100 text-green-800", revoked: "bg-red-100 text-red-800" };

export default function SuccessionProtocol() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("vault-template");
  const [initPin, setInitPin] = useState("");
  const [addSuccessorOpen, setAddSuccessorOpen] = useState(false);
  const [successorPin, setSuccessorPin] = useState("");
  const [successorForm, setSuccessorForm] = useState({ successorName: "", successorEmail: "", successorPhone: "", accessLevel: "full" as string, priority: 1, relationship: "" });
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [respondingRequest, setRespondingRequest] = useState<any>(null);
  const [respondPin, setRespondPin] = useState("");
  const [respondNote, setRespondNote] = useState("");
  const [revokePin, setRevokePin] = useState("");
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokingSuccessorId, setRevokingSuccessorId] = useState<number | null>(null);

  const genesisStatus = trpc.genesisHouse.getGenesisStatus.useQuery(undefined, { retry: false });
  const houseId = useMemo(() => genesisStatus.data?.genesisHouse?.id ?? null, [genesisStatus.data]);

  const vaultConfig = trpc.vaultSuccession.getVaultConfig.useQuery({ houseId: houseId! }, { enabled: !!houseId, retry: false });
  const successors = trpc.vaultSuccession.getSuccessors.useQuery({ houseId: houseId! }, { enabled: !!houseId, retry: false });
  const emergencyRequests = trpc.vaultSuccession.getEmergencyRequests.useQuery({ houseId: houseId! }, { enabled: !!houseId, retry: false });

  const initVaultMutation = trpc.vaultSuccession.initializeHouseVault.useMutation({ onSuccess: (d) => { toast.success(d.message); setInitPin(""); vaultConfig.refetch(); }, onError: (e) => toast.error(e.message) });
  const addSuccessorMutation = trpc.vaultSuccession.designateSuccessor.useMutation({ onSuccess: (d) => { toast.success(d.message); setAddSuccessorOpen(false); setSuccessorPin(""); setSuccessorForm({ successorName: "", successorEmail: "", successorPhone: "", accessLevel: "full", priority: 1, relationship: "" }); successors.refetch(); }, onError: (e) => toast.error(e.message) });
  const revokeSuccessorMutation = trpc.vaultSuccession.revokeSuccessor.useMutation({ onSuccess: () => { toast.success("Successor revoked"); setRevokeDialogOpen(false); setRevokePin(""); setRevokingSuccessorId(null); successors.refetch(); }, onError: (e) => toast.error(e.message) });
  const respondMutation = trpc.vaultSuccession.respondToEmergencyAccess.useMutation({ onSuccess: (d) => { toast.success(d.message); setRespondDialogOpen(false); setRespondPin(""); setRespondNote(""); setRespondingRequest(null); emergencyRequests.refetch(); }, onError: (e) => toast.error(e.message) });

  if (authLoading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div></DashboardLayout>;
  if (!user) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Card className="max-w-md w-full"><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Authentication Required</CardTitle><CardDescription>Sign in to access the Succession Protocol.</CardDescription></CardHeader></Card></div></DashboardLayout>;

  const pendingRequests = emergencyRequests.data?.requests?.filter((r: any) => r.status === "pending") || [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30"><ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" /></div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Succession Protocol</h1>
            <p className="text-sm text-muted-foreground mt-1">Emergency vault access, designated successors, and vault template flow-down for CALEA Trust member Houses.</p>
          </div>
          {pendingRequests.length > 0 && <Badge variant="destructive" className="animate-pulse">{pendingRequests.length} Pending</Badge>}
        </div>
        <Separator />

        {!houseId && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"><CardContent className="pt-6"><div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-yellow-600" /><p className="text-sm text-yellow-800 dark:text-yellow-200">No House found. Activate your Genesis House first via the Identity Vault page.</p></div></CardContent></Card>
        )}

        {houseId && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vault-template" className="gap-1.5"><Shield className="w-4 h-4" /><span className="hidden sm:inline">Vault Template</span><span className="sm:hidden">Template</span></TabsTrigger>
              <TabsTrigger value="successors" className="gap-1.5"><Users className="w-4 h-4" /><span className="hidden sm:inline">Successors</span><span className="sm:hidden">Heirs</span></TabsTrigger>
              <TabsTrigger value="emergency" className="gap-1.5 relative"><AlertTriangle className="w-4 h-4" /><span className="hidden sm:inline">Emergency</span><span className="sm:hidden">SOS</span>{pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{pendingRequests.length}</span>}</TabsTrigger>
            </TabsList>

            {/* VAULT TEMPLATE TAB */}
            <TabsContent value="vault-template" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" />House Vault Configuration</CardTitle><CardDescription>Dual-layer identity protection flows from Genesis House to all member Houses.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  {vaultConfig.isLoading ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading vault config...</div>
                  : vaultConfig.data?.initialized ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-5 h-5" /><span className="font-medium">Vault Initialized</span></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Inherited From</p><p className="font-medium text-sm">{vaultConfig.data.config?.inheritedFromHouseId ? "Genesis House" : "Default Template"}</p></div>
                        <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Encryption Version</p><p className="font-medium text-sm">AES-256-GCM v{vaultConfig.data.config?.encryptionVersion || 1}</p></div>
                        <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Emergency Delay</p><p className="font-medium text-sm">{vaultConfig.data.config?.emergencyDelayHours || 72} hours</p></div>
                        <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Access Window</p><p className="font-medium text-sm">{vaultConfig.data.config?.emergencyAccessWindow || 24} hours</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {vaultConfig.data.config?.vaultEnabled && <Badge variant="outline" className="gap-1"><ShieldCheck className="w-3 h-3" /> Vault Enabled</Badge>}
                        {vaultConfig.data.config?.requirePinForAccess && <Badge variant="outline" className="gap-1"><Key className="w-3 h-3" /> PIN Required</Badge>}
                        {vaultConfig.data.config?.emergencyAccessEnabled && <Badge variant="outline" className="gap-1"><Timer className="w-3 h-3" /> Emergency Protocol Active</Badge>}
                        {vaultConfig.data.config?.logAllAccess && <Badge variant="outline" className="gap-1"><Eye className="w-3 h-3" /> Full Audit Logging</Badge>}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-yellow-600"><AlertCircle className="w-5 h-5" /><span className="text-sm">Vault not initialized. Set a PIN to activate.</span></div>
                      <div className="max-w-sm space-y-3">
                        <div><Label htmlFor="init-pin">Vault PIN (6-20 chars)</Label><Input id="init-pin" type="password" value={initPin} onChange={(e) => setInitPin(e.target.value)} placeholder="Enter vault PIN" minLength={6} maxLength={20} /></div>
                        <Button onClick={() => initVaultMutation.mutate({ houseId: houseId!, pin: initPin })} disabled={initPin.length < 6 || initVaultMutation.isPending} className="gap-2">
                          {initVaultMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}Initialize Vault
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Template Flow-Down Architecture</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-green-700 dark:text-green-300">1</span></div><div><p className="font-medium text-foreground">Genesis House (Root)</p><p>Sets the master vault template: AES-256-GCM encryption, 72-hour emergency delay, dual-layer identity protection.</p></div></div>
                    <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-blue-700 dark:text-blue-300">2</span></div><div><p className="font-medium text-foreground">Member Houses (Inherit)</p><p>Each member House inherits the Genesis template on initialization. Emergency delay, access window, and encryption settings flow down automatically.</p></div></div>
                    <div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-purple-700 dark:text-purple-300">3</span></div><div><p className="font-medium text-foreground">CALEA Trust Umbrella</p><p>All Houses operate under the CALEA Trust structure, ensuring probate avoidance and multi-generational wealth transfer through encrypted identity vaults.</p></div></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SUCCESSORS TAB */}
            <TabsContent value="successors" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />Designated Successors</CardTitle><CardDescription>Authorize individuals for emergency vault access.</CardDescription></div>
                    <Button size="sm" onClick={() => setAddSuccessorOpen(true)} className="gap-1.5"><UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Add Successor</span><span className="sm:hidden">Add</span></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {successors.isLoading ? <div className="flex items-center gap-2 text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin" />Loading successors...</div>
                  : !successors.data?.successors?.length ? (
                    <div className="text-center py-8 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">No Successors Designated</p><p className="text-sm mt-1">Add at least one successor to enable the emergency succession protocol.</p></div>
                  ) : (
                    <div className="space-y-3">
                      {successors.data.successors.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-blue-700 dark:text-blue-300">#{s.priority}</span></div>
                            <div className="min-w-0"><p className="font-medium text-sm truncate">{s.successorName}</p><div className="flex items-center gap-2 flex-wrap"><Badge variant="secondary" className="text-[10px]">{ACCESS_LEVEL_LABELS[s.accessLevel] || s.accessLevel}</Badge>{s.relationship && <span className="text-xs text-muted-foreground">{s.relationship}</span>}</div></div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 flex-shrink-0" onClick={() => { setRevokingSuccessorId(s.id); setRevokeDialogOpen(true); }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Dialog open={addSuccessorOpen} onOpenChange={setAddSuccessorOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" />Designate Successor</DialogTitle><DialogDescription>Authorize a person for emergency vault access. Requires your vault PIN.</DialogDescription></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Successor Name *</Label><Input value={successorForm.successorName} onChange={(e) => setSuccessorForm({ ...successorForm, successorName: e.target.value })} placeholder="Full legal name" /></div>
                    <div><Label>Email</Label><Input type="email" value={successorForm.successorEmail} onChange={(e) => setSuccessorForm({ ...successorForm, successorEmail: e.target.value })} placeholder="email@example.com" /></div>
                    <div><Label>Phone</Label><Input value={successorForm.successorPhone} onChange={(e) => setSuccessorForm({ ...successorForm, successorPhone: e.target.value })} placeholder="+1 (555) 000-0000" /></div>
                    <div><Label>Relationship</Label><Input value={successorForm.relationship} onChange={(e) => setSuccessorForm({ ...successorForm, relationship: e.target.value })} placeholder="e.g., Daughter, Attorney, Trustee" /></div>
                    <div><Label>Access Level</Label><Select value={successorForm.accessLevel} onValueChange={(v) => setSuccessorForm({ ...successorForm, accessLevel: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="full">Full Access — All vault fields</SelectItem><SelectItem value="identity_only">Identity Only — Names & DOBs</SelectItem><SelectItem value="legal_only">Legal Only — SSN, Address, Trust</SelectItem><SelectItem value="distribution_only">Distribution Only — Inheritance %</SelectItem></SelectContent></Select></div>
                    <div><Label>Priority (1 = Primary)</Label><Input type="number" min={1} max={10} value={successorForm.priority} onChange={(e) => setSuccessorForm({ ...successorForm, priority: parseInt(e.target.value) || 1 })} /></div>
                    <Separator />
                    <div><Label>Vault PIN *</Label><Input type="password" value={successorPin} onChange={(e) => setSuccessorPin(e.target.value)} placeholder="Enter your vault PIN" /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddSuccessorOpen(false)}>Cancel</Button>
                    <Button onClick={() => addSuccessorMutation.mutate({ houseId: houseId!, vaultPin: successorPin, ...successorForm })} disabled={!successorForm.successorName || successorPin.length < 6 || addSuccessorMutation.isPending} className="gap-1.5">{addSuccessorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Designate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="w-5 h-5" />Revoke Successor</DialogTitle><DialogDescription>This will remove their emergency access authorization. Enter your vault PIN to confirm.</DialogDescription></DialogHeader>
                  <div><Label>Vault PIN</Label><Input type="password" value={revokePin} onChange={(e) => setRevokePin(e.target.value)} placeholder="Enter vault PIN" /></div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setRevokeDialogOpen(false); setRevokePin(""); }}>Cancel</Button>
                    <Button variant="destructive" onClick={() => revokingSuccessorId && revokeSuccessorMutation.mutate({ successorId: revokingSuccessorId, vaultPin: revokePin })} disabled={revokePin.length < 6 || revokeSuccessorMutation.isPending}>{revokeSuccessorMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Revoke"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* EMERGENCY TAB */}
            <TabsContent value="emergency" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" />Emergency Access Requests</CardTitle><CardDescription>72-hour time-locked vault access requests from designated successors.</CardDescription></CardHeader>
                <CardContent>
                  {emergencyRequests.isLoading ? <div className="flex items-center gap-2 text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin" />Loading requests...</div>
                  : !emergencyRequests.data?.requests?.length ? (
                    <div className="text-center py-8 text-muted-foreground"><ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">No Emergency Requests</p><p className="text-sm mt-1">All clear. No emergency access has been requested.</p></div>
                  ) : (
                    <div className="space-y-4">
                      {emergencyRequests.data.requests.map((req: any) => {
                        const isPending = req.status === "pending";
                        const unlockDate = new Date(req.unlockAt);
                        const hoursRemaining = Math.max(0, Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60)));
                        return (
                          <div key={req.id} className={`p-4 rounded-lg border ${isPending ? "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/10" : "bg-card"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap"><p className="font-medium text-sm">{req.requestedByName}</p><Badge className={`text-[10px] ${STATUS_COLORS[req.status] || ""}`}>{req.status.replace("_", " ").toUpperCase()}</Badge></div>
                                <p className="text-xs text-muted-foreground mt-1">{REASON_LABELS[req.reason] || req.reason}</p>
                                {req.reasonDetails && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{req.reasonDetails}</p>}
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Requested: {new Date(req.requestedAt).toLocaleDateString()}</span>
                                  {isPending && <span className="flex items-center gap-1 text-yellow-600 font-medium"><Timer className="w-3 h-3" />{hoursRemaining}h remaining</span>}
                                </div>
                              </div>
                              {isPending && (
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50 gap-1" onClick={() => { setRespondingRequest({ ...req, action: "approve" }); setRespondDialogOpen(true); }}><CheckCircle className="w-3 h-3" /><span className="hidden sm:inline">Approve</span></Button>
                                  <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 gap-1" onClick={() => { setRespondingRequest({ ...req, action: "deny" }); setRespondDialogOpen(true); }}><XCircle className="w-3 h-3" /><span className="hidden sm:inline">Deny</span></Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Emergency Protocol Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><Clock className="w-6 h-6 mx-auto mb-1 text-yellow-600" /><p className="font-bold text-lg">72h</p><p className="text-xs text-muted-foreground">Time-Lock Delay</p></div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><Timer className="w-6 h-6 mx-auto mb-1 text-blue-600" /><p className="font-bold text-lg">24h</p><p className="text-xs text-muted-foreground">Access Window</p></div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center"><Lock className="w-6 h-6 mx-auto mb-1 text-green-600" /><p className="font-bold text-lg">4</p><p className="text-xs text-muted-foreground">Access Levels</p></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">When a designated successor requests emergency vault access, a 72-hour time-lock begins. During this period, the House owner can approve or deny the request. If no response is given, access auto-approves after 72 hours. Once approved, the successor has a 24-hour window to access the vault with their authorized field scope.</p>
                </CardContent>
              </Card>

              <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader><DialogTitle className="flex items-center gap-2">{respondingRequest?.action === "approve" ? <><CheckCircle className="w-5 h-5 text-green-600" />Approve Request</> : <><XCircle className="w-5 h-5 text-red-600" />Deny Request</>}</DialogTitle><DialogDescription>{respondingRequest?.action === "approve" ? "Grant immediate vault access to this successor." : "Deny this emergency access request."}</DialogDescription></DialogHeader>
                  <div className="space-y-3">
                    <div><Label>Note (optional)</Label><Textarea value={respondNote} onChange={(e) => setRespondNote(e.target.value)} placeholder="Add a note..." rows={2} /></div>
                    <div><Label>Vault PIN *</Label><Input type="password" value={respondPin} onChange={(e) => setRespondPin(e.target.value)} placeholder="Enter vault PIN" /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setRespondDialogOpen(false); setRespondPin(""); setRespondNote(""); }}>Cancel</Button>
                    <Button variant={respondingRequest?.action === "approve" ? "default" : "destructive"} onClick={() => respondingRequest && respondMutation.mutate({ requestId: respondingRequest.id, vaultPin: respondPin, action: respondingRequest.action, note: respondNote || undefined })} disabled={respondPin.length < 6 || respondMutation.isPending}>{respondMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : respondingRequest?.action === "approve" ? "Approve" : "Deny"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
