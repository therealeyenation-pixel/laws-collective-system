import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Rocket,
  Building2,
  FileText,
  Shield,
  Heart,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface HeirEntry {
  name: string;
  relationship: string;
  percentage: number;
}

export default function GenesisCeremony() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isActivating, setIsActivating] = useState(false);
  const [activationComplete, setActivationComplete] = useState(false);
  const [activationResult, setActivationResult] = useState<{
    genesisRIN: string;
    genesisHash: string;
    flameLightingTimestamp: string;
    declarationUrl: string;
  } | null>(null);

  // Form state
  const [houseName, setHouseName] = useState("");
  const [trustName, setTrustName] = useState("");
  const [trustEIN, setTrustEIN] = useState("");
  const [trustType, setTrustType] = useState<"living" | "revocable" | "irrevocable" | "dynasty">("living");
  const [founderName, setFounderName] = useState("");
  const [statementOfPurpose, setStatementOfPurpose] = useState("");
  const [heirs, setHeirs] = useState<HeirEntry[]>([]);

  // New heir form
  const [newHeirName, setNewHeirName] = useState("");
  const [newHeirRelationship, setNewHeirRelationship] = useState("child");
  const [newHeirPercentage, setNewHeirPercentage] = useState(0);

  // Queries
  const ownerStatus = trpc.ownerHouseSetup.checkOwnerStatus.useQuery();
  const genesisDeclaration = trpc.ownerHouseSetup.getGenesisDeclaration.useQuery(undefined, {
    enabled: ownerStatus.data?.isOwner === true,
  });

  // Mutations
  const activateGenesis = trpc.ownerHouseSetup.activateGenesisHouse.useMutation({
    onSuccess: (data) => {
      setActivationResult({
        genesisRIN: data.genesisRIN,
        genesisHash: data.genesisHash,
        flameLightingTimestamp: data.flameLightingTimestamp,
        declarationUrl: data.declarationUrl,
      });
      setActivationComplete(true);
      setIsActivating(false);
      toast.success("Your organization has been successfully activated!");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsActivating(false);
    },
  });

  const addHeir = () => {
    if (!newHeirName || newHeirPercentage <= 0) {
      toast.error("Please enter beneficiary name and percentage");
      return;
    }
    const totalPercentage = heirs.reduce((sum, h) => sum + h.percentage, 0) + newHeirPercentage;
    if (totalPercentage > 100) {
      toast.error("Total beneficiary percentage cannot exceed 100%");
      return;
    }
    setHeirs([...heirs, { name: newHeirName, relationship: newHeirRelationship, percentage: newHeirPercentage }]);
    setNewHeirName("");
    setNewHeirPercentage(0);
  };

  const removeHeir = (index: number) => {
    setHeirs(heirs.filter((_, i) => i !== index));
  };

  const handleActivation = () => {
    if (!houseName || !trustName || !founderName || !statementOfPurpose) {
      toast.error("Please complete all required fields");
      return;
    }
    setIsActivating(true);
    activateGenesis.mutate({
      houseName,
      trustName,
      trustEIN: trustEIN || undefined,
      trustType,
      founderName,
      statementOfPurpose,
      heirs: heirs.length > 0 ? heirs : undefined,
    });
  };

  if (authLoading || ownerStatus.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ownerStatus.data?.isOwner) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Access Denied
              </CardTitle>
              <CardDescription>
                The Getting Started setup is only accessible to the system founder.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Check if organization already exists
  if (genesisDeclaration.data?.exists) {
    const house = genesisDeclaration.data.house;
    const declaration = genesisDeclaration.data.declaration;
    
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          {/* Setup Complete Banner */}
          <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
            <div className="relative p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
              <h1 className="text-3xl font-bold mb-2">Organization Successfully Established</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Your The L.A.W.S. Collective, LLC organization was founded on this day. All subsequent family branches trace their connection to this foundation.
              </p>
            </div>
          </div>

          {/* Organization Details */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  Organization Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Organization Name</p>
                    <p className="font-semibold">{house?.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Registration ID</p>
                    <p className="font-mono font-semibold text-emerald-600">{house?.genesisRIN}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Trust Name</p>
                    <p className="font-semibold">{house?.trustName}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Trust Type</p>
                    <p className="font-semibold capitalize">{house?.trustType}</p>
                  </div>
                </div>
                <Separator />
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Activation Timestamp</p>
                  <p className="font-mono text-sm">
                    {house?.flameLightingTimestamp ? new Date(house.flameLightingTimestamp).toLocaleString() : "N/A"}
                  </p>
                </div>
                {house?.genesisHash && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Verification Hash</p>
                    <p className="font-mono text-xs break-all">{house.genesisHash}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Declaration Document */}
            {declaration && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Founding Declaration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Statement of Purpose</p>
                    <p className="whitespace-pre-wrap">{house?.statementOfPurpose}</p>
                  </div>
                  {declaration.s3Url && (
                    <Button variant="outline" className="mt-4" asChild>
                      <a href={declaration.s3Url} target="_blank" rel="noopener noreferrer">
                        <FileText className="w-4 h-4 mr-2" />
                        View Full Declaration
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Just activated - show success
  if (activationComplete && activationResult) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
              <CheckCircle2 className="w-24 h-24 text-emerald-500 relative" />
            </div>
          </div>
          
          <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="pt-6">
              <h1 className="text-4xl font-bold mb-4">Your Organization Has Been Activated</h1>
              <p className="text-muted-foreground mb-8">
                Congratulations! Your The L.A.W.S. Collective, LLC organization is now established. Your founding declaration has been recorded and verified.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Registration ID</p>
                  <p className="font-mono font-bold text-emerald-600">{activationResult.genesisRIN}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Activation Timestamp</p>
                  <p className="font-mono text-sm">{new Date(activationResult.flameLightingTimestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2">Verification Hash</p>
                <p className="font-mono text-xs break-all">{activationResult.genesisHash}</p>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <a href={activationResult.declarationUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    View Founding Declaration
                  </a>
                </Button>
                <Button onClick={() => window.location.href = "/dashboard"}>
                  <Building2 className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Setup Steps
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Organization Setup</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Getting Started</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete these steps to establish your The L.A.W.S. Collective, LLC organization and begin building multi-generational wealth.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Organization Identity */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Step 1: Organization Identity
              </CardTitle>
              <CardDescription>
                Define the identity of your organization and its governing trust.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="houseName">Organization Name *</Label>
                <Input
                  id="houseName"
                  placeholder="e.g., Russell Family Collective"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This will be the official name of your family organization.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trustName">Trust Name *</Label>
                <Input
                  id="trustName"
                  placeholder="e.g., Russell Family Trust"
                  value={trustName}
                  onChange={(e) => setTrustName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trustType">Trust Type *</Label>
                  <Select value={trustType} onValueChange={(v: any) => setTrustType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="living">Living Trust</SelectItem>
                      <SelectItem value="revocable">Revocable Trust</SelectItem>
                      <SelectItem value="irrevocable">Irrevocable Trust</SelectItem>
                      <SelectItem value="dynasty">Dynasty Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trustEIN">Trust EIN (Optional)</Label>
                  <Input
                    id="trustEIN"
                    placeholder="XX-XXXXXXX"
                    value={trustEIN}
                    onChange={(e) => setTrustEIN(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!houseName || !trustName}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Founder Information */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Step 2: Founder Information
              </CardTitle>
              <CardDescription>
                Identify the founding member who will lead this organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="founderName">Founder Full Legal Name *</Label>
                <Input
                  id="founderName"
                  placeholder="Enter your full legal name"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Founder Responsibilities</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• Establish and maintain the organization's vision</li>
                      <li>• Oversee trust administration and compliance</li>
                      <li>• Guide succession planning for future generations</li>
                      <li>• Maintain majority voting authority on key decisions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!founderName}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Statement of Purpose */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Step 3: Statement of Purpose
              </CardTitle>
              <CardDescription>
                Declare the vision and purpose of your organization. This statement will be permanently recorded in your founding declaration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="purpose">Statement of Purpose *</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe your organization's mission, values, and long-term vision for building multi-generational wealth..."
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  This statement will guide your organization's decisions and be passed down to future generations.
                </p>
              </div>

              {/* Beneficiaries Section */}
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Beneficiaries (Optional)</Label>
                    <p className="text-xs text-muted-foreground">
                      Add family members who will benefit from the trust.
                    </p>
                  </div>
                </div>

                {heirs.length > 0 && (
                  <div className="space-y-2">
                    {heirs.map((heir, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{heir.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{heir.relationship}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{heir.percentage}%</Badge>
                          <Button variant="ghost" size="icon" onClick={() => removeHeir(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <Input
                    placeholder="Name"
                    value={newHeirName}
                    onChange={(e) => setNewHeirName(e.target.value)}
                    className="col-span-2"
                  />
                  <Select value={newHeirRelationship} onValueChange={setNewHeirRelationship}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="grandchild">Grandchild</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="%"
                      value={newHeirPercentage || ""}
                      onChange={(e) => setNewHeirPercentage(Number(e.target.value))}
                      className="w-20"
                    />
                    <Button variant="outline" size="icon" onClick={addHeir}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!statementOfPurpose}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Activation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Step 4: Activate Your Organization
              </CardTitle>
              <CardDescription>
                Review your setup details and activate your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Organization Name</p>
                  <p className="font-semibold">{houseName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Trust Name</p>
                    <p className="font-semibold">{trustName}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Trust Type</p>
                    <p className="font-semibold capitalize">{trustType}</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Founder</p>
                  <p className="font-semibold">{founderName}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Statement of Purpose</p>
                  <p className="text-sm mt-1">{statementOfPurpose}</p>
                </div>
                {heirs.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Beneficiaries</p>
                    <div className="space-y-1">
                      {heirs.map((heir, i) => (
                        <p key={i} className="text-sm">
                          {heir.name} ({heir.relationship}) - {heir.percentage}%
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What happens next */}
              <div className="p-4 border rounded-lg bg-primary/5">
                <p className="font-medium mb-2">What happens when you activate:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your organization will be assigned a unique Registration ID (RIN-GEN-001)</li>
                  <li>• A founding declaration document will be created and stored in your vault</li>
                  <li>• Your organization will be verified with a blockchain hash</li>
                  <li>• You can begin adding family members and managing your wealth system</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  onClick={handleActivation}
                  disabled={isActivating}
                  className="min-w-[200px]"
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Activate Organization
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
