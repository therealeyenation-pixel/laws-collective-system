import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Home,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Upload,
  Shield,
  Crown,
  Loader2,
} from "lucide-react";

export default function OwnerHouseSetup() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("house");

  // House activation form state
  const [houseName, setHouseName] = useState("");
  const [trustName, setTrustName] = useState("");
  const [trustEIN, setTrustEIN] = useState("");
  const [trustType, setTrustType] = useState<"living" | "revocable" | "irrevocable" | "dynasty">("living");
  const [description, setDescription] = useState("");

  // Business import form state
  const [businessName, setBusinessName] = useState("");
  const [entityType, setEntityType] = useState<"trust" | "llc" | "corporation" | "collective">("llc");
  const [businessEIN, setBusinessEIN] = useState("");
  const [stateOfFormation, setStateOfFormation] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [ownershipPercentage, setOwnershipPercentage] = useState(100);
  const [incomeContributionRate, setIncomeContributionRate] = useState(100);

  // Heir form state
  const [heirName, setHeirName] = useState("");
  const [heirRelationship, setHeirRelationship] = useState<"child" | "grandchild" | "great_grandchild" | "spouse" | "sibling" | "niece_nephew" | "adopted" | "other">("child");
  const [heirEmail, setHeirEmail] = useState("");
  const [heirPhone, setHeirPhone] = useState("");
  const [inheritancePercentage, setInheritancePercentage] = useState(0);
  const [distributionType, setDistributionType] = useState<"immediate" | "accumulate">("accumulate");

  // Queries
  const ownerStatus = trpc.ownerHouseSetup.checkOwnerStatus.useQuery();
  const ownerHouse = trpc.ownerHouseSetup.getOwnerHouse.useQuery(undefined, {
    enabled: ownerStatus.data?.isOwner === true,
  });

  // Mutations
  const activateHouse = trpc.ownerHouseSetup.activateOwnerHouse.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      ownerHouse.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const importBusiness = trpc.ownerHouseSetup.importExistingBusiness.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      ownerHouse.refetch();
      // Reset form
      setBusinessName("");
      setBusinessEIN("");
      setStateOfFormation("");
      setBusinessDescription("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addHeir = trpc.ownerHouseSetup.addHeir.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      ownerHouse.refetch();
      // Reset form
      setHeirName("");
      setHeirEmail("");
      setHeirPhone("");
      setInheritancePercentage(0);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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
                This page is only accessible to the system owner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const hasHouse = ownerHouse.data?.hasHouse;
  const house = ownerHouse.data?.house;
  const linkedBusinesses = ownerHouse.data?.linkedBusinesses || [];
  const heirs = ownerHouse.data?.heirs || [];
  const communityFunds = ownerHouse.data?.communityFunds || [];

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold">Owner House Setup</h1>
          </div>
          <p className="text-muted-foreground">
            Set up your root House with existing businesses and documents. This bypasses the normal Business Workshop requirement.
          </p>
        </div>

        {/* Status Banner */}
        {hasHouse ? (
          <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardContent className="flex items-center gap-4 py-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  House Activated: {house?.name}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-500">
                  Trust: {house?.trustName} | Status: {house?.status} | Generation: {house?.generation}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="flex items-center gap-4 py-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <div>
                <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                  House Not Yet Activated
                </h3>
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Complete the House Activation form below to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="house" className="gap-2">
              <Home className="w-4 h-4" />
              House
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-2" disabled={!hasHouse}>
              <Building2 className="w-4 h-4" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="heirs" className="gap-2" disabled={!hasHouse}>
              <Users className="w-4 h-4" />
              Heirs
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2" disabled={!hasHouse}>
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* House Activation Tab */}
          <TabsContent value="house">
            {!hasHouse ? (
              <Card>
                <CardHeader>
                  <CardTitle>Activate Your Root House</CardTitle>
                  <CardDescription>
                    As the system owner, you can activate your House directly with your existing trust information.
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
                      <Label htmlFor="trustName">Trust Name *</Label>
                      <Input
                        id="trustName"
                        placeholder="e.g., CALEA Freeman Family Trust"
                        value={trustName}
                        onChange={(e) => setTrustName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="trustEIN">Trust EIN (if available)</Label>
                      <Input
                        id="trustEIN"
                        placeholder="XX-XXXXXXX"
                        value={trustEIN}
                        onChange={(e) => setTrustEIN(e.target.value)}
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
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your House's purpose and vision..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What gets created:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Root House with full token chain activated (MIRROR → CROWN)</li>
                      <li>• Document Vault with 10 default folders</li>
                      <li>• 6 Community Funds (Land, Education, Emergency, Business Dev, Cultural, Discretionary)</li>
                      <li>• LuvLedger Treasury Account</li>
                      <li>• All required scrolls sealed</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() =>
                      activateHouse.mutate({
                        houseName,
                        trustName,
                        trustEIN: trustEIN || undefined,
                        trustType,
                        description: description || undefined,
                      })
                    }
                    disabled={!houseName || !trustName || activateHouse.isPending}
                  >
                    {activateHouse.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Activate House
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {/* House Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>House Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">House Name</p>
                        <p className="font-semibold">{house?.name}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Trust Name</p>
                        <p className="font-semibold">{house?.trustName || "Not Set"}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Trust Type</p>
                        <p className="font-semibold capitalize">{house?.trustType || "Not Set"}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="default" className="capitalize">{house?.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Splits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Configuration</CardTitle>
                    <CardDescription>
                      Current distribution splits for your House
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Inter-House Split (70/30)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Platform Services Fee</span>
                            <span className="font-medium">{house?.interHouseSplit}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Network Distribution</span>
                            <span className="font-medium">{house?.interHouseDistribution}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Intra-House Split (60/40)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Operations (Reserve)</span>
                            <span className="font-medium">{house?.intraHouseOperations}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Inheritance (Community)</span>
                            <span className="font-medium">{house?.intraHouseInheritance}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Community Funds */}
                <Card>
                  <CardHeader>
                    <CardTitle>Community Funds</CardTitle>
                    <CardDescription>
                      Allocation of the 40% community share
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {communityFunds.map((fund) => (
                        <div key={fund.id} className="p-4 border rounded-lg">
                          <p className="font-semibold text-sm">{fund.fundName}</p>
                          <p className="text-2xl font-bold text-primary">{fund.allocationPercentage}%</p>
                          <p className="text-xs text-muted-foreground">{fund.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Businesses Tab */}
          <TabsContent value="businesses">
            <div className="grid gap-6">
              {/* Linked Businesses */}
              <Card>
                <CardHeader>
                  <CardTitle>Linked Businesses</CardTitle>
                  <CardDescription>
                    Businesses currently linked to your House
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {linkedBusinesses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No businesses linked yet. Import your existing businesses below.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {linkedBusinesses.map((item) => (
                        <div key={item.business.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{item.business.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.business.entityType} | Ownership: {item.link.ownershipPercentage}%
                            </p>
                          </div>
                          <Badge variant="outline">
                            {item.link.incomeContributionRate}% contribution
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Import Business Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Import Existing Business
                  </CardTitle>
                  <CardDescription>
                    Add your existing businesses to your House
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="e.g., Freeman Holdings LLC"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entityType">Entity Type</Label>
                      <Select value={entityType} onValueChange={(v) => setEntityType(v as typeof entityType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trust">Trust</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="collective">Collective</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessEIN">EIN (if available)</Label>
                      <Input
                        id="businessEIN"
                        placeholder="XX-XXXXXXX"
                        value={businessEIN}
                        onChange={(e) => setBusinessEIN(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stateOfFormation">State of Formation</Label>
                      <Input
                        id="stateOfFormation"
                        placeholder="e.g., Delaware"
                        value={stateOfFormation}
                        onChange={(e) => setStateOfFormation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownershipPercentage">Ownership Percentage</Label>
                      <Input
                        id="ownershipPercentage"
                        type="number"
                        min={0}
                        max={100}
                        value={ownershipPercentage}
                        onChange={(e) => setOwnershipPercentage(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="incomeContributionRate">Income Contribution Rate (%)</Label>
                      <Input
                        id="incomeContributionRate"
                        type="number"
                        min={0}
                        max={100}
                        value={incomeContributionRate}
                        onChange={(e) => setIncomeContributionRate(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of business income that flows to your House
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessDescription">Description (optional)</Label>
                    <Textarea
                      id="businessDescription"
                      placeholder="Describe the business..."
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={() =>
                      importBusiness.mutate({
                        businessName,
                        entityType,
                        ein: businessEIN || undefined,
                        stateOfFormation: stateOfFormation || undefined,
                        description: businessDescription || undefined,
                        ownershipPercentage,
                        incomeContributionRate,
                      })
                    }
                    disabled={!businessName || importBusiness.isPending}
                  >
                    {importBusiness.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Import Business
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Heirs Tab */}
          <TabsContent value="heirs">
            <div className="grid gap-6">
              {/* Current Heirs */}
              <Card>
                <CardHeader>
                  <CardTitle>Designated Heirs</CardTitle>
                  <CardDescription>
                    Heirs who will receive distributions from your House
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {heirs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No heirs designated yet. Add your heirs below.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {heirs.map((heir) => (
                        <div key={heir.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold">{heir.fullName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {heir.relationship} | {heir.distributionMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{heir.distributionPercentage}%</p>
                            <Badge variant={heir.status === "active" ? "default" : "secondary"}>
                              {heir.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Heir Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Heir
                  </CardTitle>
                  <CardDescription>
                    Designate a new heir for your House
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heirName">Full Name *</Label>
                      <Input
                        id="heirName"
                        placeholder="e.g., John Freeman Jr."
                        value={heirName}
                        onChange={(e) => setHeirName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heirRelationship">Relationship</Label>
                      <Select value={heirRelationship} onValueChange={(v) => setHeirRelationship(v as typeof heirRelationship)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="grandchild">Grandchild</SelectItem>
                          <SelectItem value="great_grandchild">Great Grandchild</SelectItem>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="niece_nephew">Niece/Nephew</SelectItem>
                          <SelectItem value="adopted">Adopted</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heirEmail">Email (optional)</Label>
                      <Input
                        id="heirEmail"
                        type="email"
                        placeholder="heir@example.com"
                        value={heirEmail}
                        onChange={(e) => setHeirEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heirPhone">Phone (optional)</Label>
                      <Input
                        id="heirPhone"
                        placeholder="(555) 123-4567"
                        value={heirPhone}
                        onChange={(e) => setHeirPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inheritancePercentage">Inheritance Percentage *</Label>
                      <Input
                        id="inheritancePercentage"
                        type="number"
                        min={0}
                        max={100}
                        value={inheritancePercentage}
                        onChange={(e) => setInheritancePercentage(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distributionType">Distribution Type</Label>
                      <Select value={distributionType} onValueChange={(v) => setDistributionType(v as typeof distributionType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (distribute as earned)</SelectItem>
                          <SelectItem value="accumulate">Accumulate (hold until release)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      addHeir.mutate({
                        fullName: heirName,
                        relationship: heirRelationship,
                        email: heirEmail || undefined,
                        phone: heirPhone || undefined,
                        inheritancePercentage,
                        distributionType,
                      })
                    }
                    disabled={!heirName || inheritancePercentage <= 0 || addHeir.isPending}
                  >
                    {addHeir.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Heir
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Document Upload
                </CardTitle>
                <CardDescription>
                  Upload your existing trust documents, business filings, and other important documents to your House Vault.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Your Document Vault has been created with 10 default folders.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = "/vault"}>
                    Go to Document Vault
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
