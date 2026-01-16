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
  Flame,
  Crown,
  Scroll,
  Shield,
  Heart,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  FileText,
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
      toast.success("The Genesis Flame has been lit!");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsActivating(false);
    },
  });

  const addHeir = () => {
    if (!newHeirName || newHeirPercentage <= 0) {
      toast.error("Please enter heir name and percentage");
      return;
    }
    const totalPercentage = heirs.reduce((sum, h) => sum + h.percentage, 0) + newHeirPercentage;
    if (totalPercentage > 100) {
      toast.error("Total heir percentage cannot exceed 100%");
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
                The Genesis Ceremony is only accessible to the system founder.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Check if Genesis already exists
  if (genesisDeclaration.data?.exists) {
    const house = genesisDeclaration.data.house;
    const declaration = genesisDeclaration.data.declaration;
    
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          {/* Genesis Complete Banner */}
          <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
            <div className="relative p-8 text-center">
              <Flame className="w-16 h-16 mx-auto mb-4 text-amber-500 animate-pulse" />
              <h1 className="text-3xl font-bold mb-2">The Genesis Flame Burns Eternal</h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The LuvOnPurpose Sovereign System was founded on this day. All subsequent Houses trace their lineage to this moment.
              </p>
            </div>
          </div>

          {/* Genesis Details */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Genesis House Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">House Name</p>
                    <p className="font-semibold">{house?.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Genesis RIN</p>
                    <p className="font-mono font-semibold text-amber-600">{house?.genesisRIN}</p>
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
                  <p className="text-sm text-muted-foreground mb-2">Flame Lighting Timestamp</p>
                  <p className="font-semibold">
                    {house?.flameLightingTimestamp 
                      ? new Date(house.flameLightingTimestamp).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })
                      : 'Unknown'}
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Genesis Hash</p>
                  <p className="font-mono text-xs break-all">{house?.genesisHash}</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Statement of Purpose</p>
                  <p className="text-sm whitespace-pre-wrap">{house?.statementOfPurpose}</p>
                </div>
              </CardContent>
            </Card>

            {/* Genesis Declaration Document */}
            {declaration && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-amber-500" />
                    Genesis Declaration
                  </CardTitle>
                  <CardDescription>
                    The founding document of the LuvOnPurpose Sovereign System
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-amber-500" />
                      <div>
                        <p className="font-semibold">{declaration.documentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded: {new Date(declaration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <a href={declaration.s3Url || "#"} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Document
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Activation Complete Screen
  if (activationComplete && activationResult) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
            <div className="relative p-12 text-center">
              <div className="relative inline-block mb-6">
                <Flame className="w-24 h-24 text-amber-500 animate-pulse" />
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4">The Genesis Flame Has Been Lit</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                The LuvOnPurpose Sovereign System is now active. Your House stands as the foundation upon which all future Houses will be built.
              </p>

              <div className="grid gap-4 max-w-lg mx-auto mb-8">
                <div className="p-4 bg-background/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Genesis RIN</p>
                  <p className="font-mono font-bold text-xl text-amber-500">{activationResult.genesisRIN}</p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Flame Lighting Timestamp</p>
                  <p className="font-semibold">
                    {new Date(activationResult.flameLightingTimestamp).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Genesis Hash</p>
                  <p className="font-mono text-xs break-all">{activationResult.genesisHash}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <a href={activationResult.declarationUrl} target="_blank" rel="noopener noreferrer">
                    <Scroll className="w-4 h-4 mr-2" />
                    View Genesis Declaration
                  </a>
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/house"}>
                  <Crown className="w-4 h-4 mr-2" />
                  Go to House Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Ceremony Steps
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
            <Flame className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Genesis Ceremony</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Establish the founding House of the LuvOnPurpose Sovereign System. This ceremonial activation creates the root from which all future Houses will grow.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="font-medium">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: House Identity */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Step 1: House Identity
              </CardTitle>
              <CardDescription>
                Define the identity of your Genesis House and its governing trust.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="houseName">House Name *</Label>
                  <Input
                    id="houseName"
                    placeholder="e.g., Freeman Family House"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founderName">Founder Name *</Label>
                  <Input
                    id="founderName"
                    placeholder="Your full legal name"
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trustName">Trust Name *</Label>
                  <Input
                    id="trustName"
                    placeholder="e.g., CALEA Freeman Family Trust"
                    value={trustName}
                    onChange={(e) => setTrustName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trustType">Trust Type</Label>
                  <Select value={trustType} onValueChange={(v) => setTrustType(v as typeof trustType)}>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="trustEIN">Trust EIN (if available)</Label>
                <Input
                  id="trustEIN"
                  placeholder="XX-XXXXXXX"
                  value={trustEIN}
                  onChange={(e) => setTrustEIN(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!houseName || !trustName || !founderName}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Statement of Purpose */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-500" />
                Step 2: Statement of Purpose
              </CardTitle>
              <CardDescription>
                Declare the vision and purpose of your House. This statement will be permanently recorded in the Genesis Declaration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Guidance:</strong> Your Statement of Purpose should articulate why you are establishing this system, what values guide your House, and what legacy you intend to build for future generations.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statementOfPurpose">Statement of Purpose *</Label>
                <Textarea
                  id="statementOfPurpose"
                  placeholder="I establish this House for the purpose of..."
                  value={statementOfPurpose}
                  onChange={(e) => setStatementOfPurpose(e.target.value)}
                  rows={8}
                  className="font-serif"
                />
                <p className="text-xs text-muted-foreground">
                  {statementOfPurpose.length} / 5000 characters
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={statementOfPurpose.length < 10}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Bloodline Designation */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Step 3: Bloodline Designation (Optional)
              </CardTitle>
              <CardDescription>
                Designate initial heirs for your House. You can add more heirs later through the House Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing heirs */}
              {heirs.length > 0 && (
                <div className="space-y-2">
                  <Label>Designated Heirs</Label>
                  <div className="space-y-2">
                    {heirs.map((heir, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <div>
                            <p className="font-medium">{heir.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{heir.relationship}</p>
                          </div>
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
                  <p className="text-sm text-muted-foreground">
                    Total allocated: {heirs.reduce((sum, h) => sum + h.percentage, 0)}%
                  </p>
                </div>
              )}

              {/* Add heir form */}
              <div className="p-4 border rounded-lg space-y-4">
                <Label>Add Heir</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newHeirName" className="text-xs">Name</Label>
                    <Input
                      id="newHeirName"
                      placeholder="Full name"
                      value={newHeirName}
                      onChange={(e) => setNewHeirName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newHeirRelationship" className="text-xs">Relationship</Label>
                    <Select value={newHeirRelationship} onValueChange={setNewHeirRelationship}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="grandchild">Grandchild</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="niece_nephew">Niece/Nephew</SelectItem>
                        <SelectItem value="adopted">Adopted</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newHeirPercentage" className="text-xs">Percentage</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newHeirPercentage"
                        type="number"
                        min={0}
                        max={100}
                        value={newHeirPercentage}
                        onChange={(e) => setNewHeirPercentage(Number(e.target.value))}
                      />
                      <Button onClick={addHeir}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Flame Lighting */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Step 4: Light the Genesis Flame
              </CardTitle>
              <CardDescription>
                Review your ceremony details and light the flame to activate the Genesis House.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Review Summary */}
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">House Identity</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">House Name:</span>{" "}
                      <span className="font-medium">{houseName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Founder:</span>{" "}
                      <span className="font-medium">{founderName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trust:</span>{" "}
                      <span className="font-medium">{trustName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Trust Type:</span>{" "}
                      <span className="font-medium capitalize">{trustType}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Statement of Purpose</h4>
                  <p className="text-sm whitespace-pre-wrap">{statementOfPurpose}</p>
                </div>

                {heirs.length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Designated Heirs ({heirs.length})</h4>
                    <ul className="text-sm space-y-1">
                      {heirs.map((heir, i) => (
                        <li key={i}>
                          {heir.name} ({heir.relationship}) - {heir.percentage}%
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Separator />

              {/* What will be created */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">
                  Upon lighting the flame, the following will be created:
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Genesis House with RIN-GEN-001
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Full token chain activated (MIRROR → CROWN)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Genesis Declaration document (stored in vault)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Document Vault with 10 default folders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    6 Community Funds initialized
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    All founder scrolls sealed
                  </li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={handleActivation}
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Lighting the Flame...
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5 mr-2" />
                      Light the Genesis Flame
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
