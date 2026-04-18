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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Users,
  Plus,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Key,
  FileText,
  History,
  UserPlus,
  Edit,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";

// ============================================
// IDENTITY VAULT
// Dual-Layer Identity Protection System
// Layer 1: Display aliases (visible in UI)
// Layer 2: Encrypted legal vault (owner-only)
// ============================================

interface VaultEntry {
  id: number;
  displayAlias: string;
  displayRole: string | null;
  relationship: string;
  inheritancePercentage: string | null;
  inheritanceOrder: number | null;
  legalName: string | null;
  ssn: string | null;
  dob: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  trustBeneficiary: string | null;
  lastAccessedAt: string | null;
  accessCount: number;
  status: string;
}

export default function IdentityVault() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("display");
  
  // Vault PIN state
  const [vaultPin, setVaultPin] = useState("");
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [pinSetMode, setPinSetMode] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  
  // Decrypted vault entries
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([]);
  
  // Add family member dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    displayAlias: "",
    displayRole: "Heir" as string,
    relationship: "child" as string,
    inheritancePercentage: 0,
    inheritanceOrder: 1,
    legalName: "",
    ssn: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    notes: "",
    trustBeneficiary: "",
  });

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);

  // Queries
  const genesisStatus = trpc.genesisHouse.getGenesisStatus.useQuery(undefined, {
    retry: false,
  });
  const displayMembers = trpc.genesisHouse.getFamilyDisplay.useQuery({});
  const distributionTemplate = trpc.genesisHouse.getDistributionTemplate.useQuery(undefined, {
    retry: false,
  });
  const accessLog = trpc.genesisHouse.getVaultAccessLog.useQuery({ limit: 20 });

  // Mutations
  const setVaultPinMutation = trpc.genesisHouse.setVaultPin.useMutation({
    onSuccess: () => {
      toast.success("Vault PIN set successfully");
      setPinSetMode(false);
      setNewPin("");
      setConfirmPin("");
    },
    onError: (err) => toast.error(err.message),
  });

  const verifyPinMutation = trpc.genesisHouse.verifyVaultPin.useMutation({
    onSuccess: () => {
      setVaultUnlocked(true);
      toast.success("Vault unlocked");
      // Fetch decrypted entries
      getVaultEntriesMutation.mutate({ vaultPin });
    },
    onError: (err) => {
      toast.error(err.message);
      setVaultPin("");
    },
  });

  const getVaultEntriesMutation = trpc.genesisHouse.getVaultEntries.useMutation({
    onSuccess: (data) => {
      setVaultEntries(data.entries);
    },
    onError: (err) => toast.error(err.message),
  });

  const addFamilyMutation = trpc.genesisHouse.addFamilyMember.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setAddDialogOpen(false);
      setAddForm({
        displayAlias: "",
        displayRole: "Heir",
        relationship: "child",
        inheritancePercentage: 0,
        inheritanceOrder: 1,
        legalName: "",
        ssn: "",
        dob: "",
        address: "",
        phone: "",
        email: "",
        notes: "",
        trustBeneficiary: "",
      });
      // Refresh data
      displayMembers.refetch();
      if (vaultUnlocked) {
        getVaultEntriesMutation.mutate({ vaultPin });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const updateVaultMutation = trpc.genesisHouse.updateVaultEntry.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setEditDialogOpen(false);
      setEditingEntry(null);
      if (vaultUnlocked) {
        getVaultEntriesMutation.mutate({ vaultPin });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const activateGenesisMutation = trpc.genesisHouse.activateGenesis.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      genesisStatus.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Handlers
  const handleSetPin = () => {
    if (newPin.length < 6) {
      toast.error("PIN must be at least 6 characters");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    setVaultPinMutation.mutate({ pin: newPin });
  };

  const handleUnlockVault = () => {
    if (!vaultPin) {
      toast.error("Enter your vault PIN");
      return;
    }
    verifyPinMutation.mutate({ pin: vaultPin });
  };

  const handleAddFamily = () => {
    if (!addForm.displayAlias) {
      toast.error("Display alias is required");
      return;
    }
    if (!vaultPin) {
      toast.error("Vault must be unlocked to add family members");
      return;
    }
    addFamilyMutation.mutate({
      ...addForm,
      vaultPin,
      displayRole: addForm.displayRole as any,
      relationship: addForm.relationship as any,
    });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !vaultPin) return;
    updateVaultMutation.mutate({
      vaultEntryId: editingEntry.id,
      vaultPin,
      displayAlias: editingEntry.displayAlias,
      legalName: editingEntry.legalName || undefined,
      ssn: editingEntry.ssn || undefined,
      dob: editingEntry.dob || undefined,
      address: editingEntry.address || undefined,
      phone: editingEntry.phone || undefined,
      email: editingEntry.email || undefined,
      notes: editingEntry.notes || undefined,
      trustBeneficiary: editingEntry.trustBeneficiary || undefined,
    });
  };

  const handleActivateGenesis = () => {
    if (!vaultPin) {
      toast.error("Vault must be unlocked to activate Genesis");
      return;
    }
    activateGenesisMutation.mutate({
      vaultPin,
      confirmActivation: true,
    });
  };

  // Mask SSN for display
  const maskSSN = (ssn: string | null) => {
    if (!ssn) return "---";
    return `***-**-${ssn.slice(-4)}`;
  };

  if (authLoading || genesisStatus.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Check if Genesis House exists
  const hasGenesis = genesisStatus.data?.exists;
  const setupProgress = genesisStatus.data?.setupProgress;

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Identity Vault
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Dual-layer identity protection: display aliases + encrypted legal vault
            </p>
          </div>
          {hasGenesis && (
            <Badge variant={setupProgress?.activated ? "default" : "secondary"} className="text-xs">
              {setupProgress?.activated ? "Genesis Active" : "Setup In Progress"}
            </Badge>
          )}
        </div>

        {/* No Genesis House yet */}
        {!hasGenesis && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-5 h-5" />
                Genesis House Required
              </CardTitle>
              <CardDescription>
                The Identity Vault requires a Genesis House to be created first. Go to{" "}
                <a href="/genesis" className="text-primary underline">Organization Setup</a>{" "}
                to establish your Genesis House, then return here to configure the identity vault.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Genesis House exists - show vault interface */}
        {hasGenesis && (
          <>
            {/* Vault PIN Setup / Unlock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Vault Access
                </CardTitle>
                <CardDescription>
                  The identity vault requires a separate PIN for access. This PIN is independent of your login password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!vaultUnlocked ? (
                  <div className="space-y-4">
                    {pinSetMode ? (
                      // Set new PIN
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                          <Label>New Vault PIN (min 6 characters)</Label>
                          <Input
                            type="password"
                            placeholder="Enter new PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm PIN</Label>
                          <Input
                            type="password"
                            placeholder="Confirm PIN"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSetPin} disabled={setVaultPinMutation.isPending}>
                            {setVaultPinMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Key className="w-4 h-4 mr-2" />
                            )}
                            Set Vault PIN
                          </Button>
                          <Button variant="outline" onClick={() => setPinSetMode(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Unlock vault
                      <div className="space-y-4 max-w-md">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Input
                              type="password"
                              placeholder="Enter vault PIN"
                              value={vaultPin}
                              onChange={(e) => setVaultPin(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleUnlockVault()}
                            />
                          </div>
                          <Button onClick={handleUnlockVault} disabled={verifyPinMutation.isPending}>
                            {verifyPinMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Lock className="w-4 h-4 mr-2" />
                            )}
                            Unlock
                          </Button>
                        </div>
                        <Button variant="link" className="text-xs p-0 h-auto" onClick={() => setPinSetMode(true)}>
                          Set or reset vault PIN
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-medium">Vault unlocked</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4 text-xs"
                      onClick={() => {
                        setVaultUnlocked(false);
                        setVaultPin("");
                        setVaultEntries([]);
                      }}
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Lock Vault
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs: Display Layer / Vault Layer / Access Log */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="display" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Display Layer
                </TabsTrigger>
                <TabsTrigger value="vault" className="flex items-center gap-2" disabled={!vaultUnlocked}>
                  <Lock className="w-4 h-4" />
                  Encrypted Vault
                </TabsTrigger>
                <TabsTrigger value="log" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Access Log
                </TabsTrigger>
              </TabsList>

              {/* Display Layer Tab */}
              <TabsContent value="display" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Family Members (Display Layer)</CardTitle>
                        <CardDescription>
                          This is what the system shows publicly. Only aliases and roles are visible.
                          Legal identities are encrypted in the vault.
                        </CardDescription>
                      </div>
                      {vaultUnlocked && (
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Family Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add Family Member</DialogTitle>
                              <DialogDescription>
                                Enter display alias (visible to system) and legal identity (encrypted in vault).
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                              {/* Display Layer Fields */}
                              <div>
                                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-blue-500" />
                                  Display Layer (Visible)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Display Alias *</Label>
                                    <Input
                                      placeholder="e.g., Amber"
                                      value={addForm.displayAlias}
                                      onChange={(e) => setAddForm({ ...addForm, displayAlias: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Display Role</Label>
                                    <Select
                                      value={addForm.displayRole}
                                      onValueChange={(v) => setAddForm({ ...addForm, displayRole: v })}
                                    >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Head of House">Head of House</SelectItem>
                                        <SelectItem value="Co-Head">Co-Head</SelectItem>
                                        <SelectItem value="Heir">Heir</SelectItem>
                                        <SelectItem value="Member">Member</SelectItem>
                                        <SelectItem value="Extended Family">Extended Family</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Relationship</Label>
                                    <Select
                                      value={addForm.relationship}
                                      onValueChange={(v) => setAddForm({ ...addForm, relationship: v })}
                                    >
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="self">Self</SelectItem>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="grandchild">Grandchild</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="niece_nephew">Niece/Nephew</SelectItem>
                                        <SelectItem value="cousin">Cousin</SelectItem>
                                        <SelectItem value="adopted">Adopted</SelectItem>
                                        <SelectItem value="guardian_ward">Guardian/Ward</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Inheritance %</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={addForm.inheritancePercentage || ""}
                                      onChange={(e) => setAddForm({ ...addForm, inheritancePercentage: Number(e.target.value) })}
                                    />
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              {/* Vault Layer Fields */}
                              <div>
                                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <Lock className="w-4 h-4 text-amber-500" />
                                  Vault Layer (Encrypted)
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3">
                                  This information is encrypted with AES-256-GCM and only accessible with your vault PIN.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Legal Name</Label>
                                    <Input
                                      placeholder="Full legal name"
                                      value={addForm.legalName}
                                      onChange={(e) => setAddForm({ ...addForm, legalName: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>SSN / EIN</Label>
                                    <Input
                                      placeholder="XXX-XX-XXXX"
                                      value={addForm.ssn}
                                      onChange={(e) => setAddForm({ ...addForm, ssn: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input
                                      type="date"
                                      value={addForm.dob}
                                      onChange={(e) => setAddForm({ ...addForm, dob: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                      placeholder="(XXX) XXX-XXXX"
                                      value={addForm.phone}
                                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2 col-span-2">
                                    <Label>Email</Label>
                                    <Input
                                      type="email"
                                      placeholder="email@example.com"
                                      value={addForm.email}
                                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2 col-span-2">
                                    <Label>Address</Label>
                                    <Input
                                      placeholder="Full mailing address"
                                      value={addForm.address}
                                      onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2 col-span-2">
                                    <Label>Trust Beneficiary Details</Label>
                                    <Textarea
                                      placeholder="Beneficiary designation details..."
                                      value={addForm.trustBeneficiary}
                                      onChange={(e) => setAddForm({ ...addForm, trustBeneficiary: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2 col-span-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                      placeholder="Additional sensitive notes..."
                                      value={addForm.notes}
                                      onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddFamily} disabled={addFamilyMutation.isPending}>
                                {addFamilyMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Plus className="w-4 h-4 mr-2" />
                                )}
                                Add to Vault
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Distribution Template */}
                    {distributionTemplate.data && (
                      <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-sm font-medium mb-2">Genesis Distribution Template</p>
                        <p className="text-xs text-muted-foreground">{distributionTemplate.data.note}</p>
                      </div>
                    )}

                    {/* Display Members List */}
                    {displayMembers.data?.members && displayMembers.data.members.length > 0 ? (
                      <div className="space-y-3">
                        {displayMembers.data.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{member.displayAlias}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span className="capitalize">{member.relationship?.replace("_", " ")}</span>
                                  {member.displayRole && (
                                    <>
                                      <span>·</span>
                                      <span>{member.displayRole}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {member.inheritancePercentage && (
                                <Badge variant="secondary">
                                  {parseFloat(member.inheritancePercentage)}%
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Legal data encrypted
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No family members added yet.</p>
                        <p className="text-sm mt-1">
                          {vaultUnlocked
                            ? "Click 'Add Family Member' to begin."
                            : "Unlock the vault to add family members."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Encrypted Vault Tab */}
              <TabsContent value="vault" className="space-y-4 mt-4">
                {!vaultUnlocked ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground">Vault is locked. Enter your PIN above to access encrypted data.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-amber-500" />
                            Decrypted Legal Identities
                          </CardTitle>
                          <CardDescription>
                            AES-256-GCM encrypted. This data is only visible while the vault is unlocked.
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-600/30">
                          {vaultEntries.length} entries
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {getVaultEntriesMutation.isPending ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2 text-muted-foreground">Decrypting vault entries...</span>
                        </div>
                      ) : vaultEntries.length > 0 ? (
                        <div className="space-y-4">
                          {vaultEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-4 border rounded-lg space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="default">{entry.displayAlias}</Badge>
                                  <Badge variant="secondary" className="capitalize">
                                    {entry.relationship?.replace("_", " ")}
                                  </Badge>
                                  {entry.displayRole && (
                                    <Badge variant="outline">{entry.displayRole}</Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingEntry({ ...entry });
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">Legal Name</p>
                                  <p className="font-medium">{entry.legalName || "---"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">SSN/EIN</p>
                                  <p className="font-mono">{maskSSN(entry.ssn)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                                  <p>{entry.dob || "---"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Phone</p>
                                  <p>{entry.phone || "---"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Email</p>
                                  <p>{entry.email || "---"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Inheritance</p>
                                  <p className="font-semibold">
                                    {entry.inheritancePercentage ? `${parseFloat(entry.inheritancePercentage)}%` : "---"}
                                  </p>
                                </div>
                              </div>
                              {entry.address && (
                                <div className="text-sm">
                                  <p className="text-xs text-muted-foreground">Address</p>
                                  <p>{entry.address}</p>
                                </div>
                              )}
                              {entry.trustBeneficiary && (
                                <div className="text-sm">
                                  <p className="text-xs text-muted-foreground">Trust Beneficiary Details</p>
                                  <p>{entry.trustBeneficiary}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                <span>Accessed {entry.accessCount} times</span>
                                {entry.lastAccessedAt && (
                                  <span>Last: {new Date(entry.lastAccessedAt).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>No vault entries yet. Add family members from the Display Layer tab.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Access Log Tab */}
              <TabsContent value="log" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" />
                      Vault Access Log
                    </CardTitle>
                    <CardDescription>
                      Immutable audit trail of every vault access. This log cannot be modified or deleted.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {accessLog.data?.logs && accessLog.data.logs.length > 0 ? (
                      <div className="space-y-2">
                        {accessLog.data.logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={
                                  log.accessType === "create"
                                    ? "default"
                                    : log.accessType === "view"
                                    ? "secondary"
                                    : log.accessType === "update"
                                    ? "outline"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {log.accessType}
                              </Badge>
                              <span className="text-muted-foreground">
                                Entry #{log.vaultEntryId}
                              </span>
                              {log.fieldsAccessed && (
                                <span className="text-xs text-muted-foreground">
                                  Fields: {(log.fieldsAccessed as string[]).join(", ")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {log.authMethod?.replace("_", " ")}
                              </Badge>
                              <span>{new Date(log.accessedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No access logs yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Genesis Activation Button */}
            {hasGenesis && !setupProgress?.activated && vaultUnlocked && vaultEntries.length > 0 && (
              <Card className="border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Ready to Activate Genesis
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Family members have been added to the vault. Activate to open the system for public registration.
                      </p>
                    </div>
                    <Button
                      onClick={handleActivateGenesis}
                      disabled={activateGenesisMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {activateGenesisMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      Activate Genesis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Edit Vault Entry Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vault Entry</DialogTitle>
              <DialogDescription>
                Update encrypted legal identity for {editingEntry?.displayAlias}
              </DialogDescription>
            </DialogHeader>
            {editingEntry && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Alias</Label>
                    <Input
                      value={editingEntry.displayAlias}
                      onChange={(e) => setEditingEntry({ ...editingEntry, displayAlias: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Legal Name</Label>
                    <Input
                      value={editingEntry.legalName || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, legalName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SSN/EIN</Label>
                    <Input
                      value={editingEntry.ssn || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, ssn: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={editingEntry.dob || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, dob: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={editingEntry.phone || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editingEntry.email || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={editingEntry.address || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Trust Beneficiary Details</Label>
                    <Textarea
                      value={editingEntry.trustBeneficiary || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, trustBeneficiary: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={editingEntry.notes || ""}
                      onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEntry} disabled={updateVaultMutation.isPending}>
                {updateVaultMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
