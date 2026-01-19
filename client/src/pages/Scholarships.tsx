import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  GraduationCap,
  Users,
  DollarSign,
  Award,
  Crown,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Heart,
  Building2,
  Wallet,
} from "lucide-react";

const SCHOLARSHIP_TYPE_LABELS: Record<string, string> = {
  merit_based: "Merit-Based",
  need_based: "Need-Based",
  community_service: "Community Service",
  entrepreneurship: "Entrepreneurship",
  legacy: "Legacy",
  diversity: "Diversity",
  stem: "STEM",
  arts: "Arts",
  full_ride: "Full Ride",
};

const COVERAGE_TYPE_LABELS: Record<string, string> = {
  full_tuition: "Full Tuition",
  partial_tuition: "Partial Tuition",
  stipend: "Stipend",
  materials: "Materials Only",
  comprehensive: "Comprehensive",
};

const REVIEW_STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-amber-100 text-amber-800",
  committee_review: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  waitlisted: "bg-gray-100 text-gray-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

const FOUNDING_ROLE_LABELS: Record<string, string> = {
  primary_founder: "Primary Founder (CEO/Principal)",
  co_founder: "Co-Founder (Original Management)",
  charter_member: "Charter Member (Startup Team)",
  founding_investor: "Founding Investor",
};

export default function Scholarships() {
  const [isFounderDialogOpen, setIsFounderDialogOpen] = useState(false);
  const [isHeirDialogOpen, setIsHeirDialogOpen] = useState(false);
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const { data: stats } = trpc.scholarships.getStats.useQuery();
  const { data: foundingMembers, refetch: refetchFounders } = trpc.scholarships.getFoundingMembers.useQuery();
  const { data: heirBenefits, refetch: refetchHeirs } = trpc.scholarships.getHeirBenefits.useQuery();
  const { data: programs, refetch: refetchPrograms } = trpc.scholarships.getPrograms.useQuery();
  const { data: applications, refetch: refetchApplications } = trpc.scholarships.getApplications.useQuery();
  const { data: funds, refetch: refetchFunds } = trpc.scholarships.getFunds.useQuery();

  const registerFounder = trpc.scholarships.registerFoundingMember.useMutation({
    onSuccess: () => {
      toast.success("Founding member registered");
      setIsFounderDialogOpen(false);
      refetchFounders();
    },
    onError: (err) => toast.error(err.message),
  });

  const registerHeir = trpc.scholarships.registerHeirBenefit.useMutation({
    onSuccess: () => {
      toast.success("Heir benefit registered");
      setIsHeirDialogOpen(false);
      refetchHeirs();
    },
    onError: (err) => toast.error(err.message),
  });

  const createProgram = trpc.scholarships.createProgram.useMutation({
    onSuccess: () => {
      toast.success("Scholarship program created");
      setIsProgramDialogOpen(false);
      refetchPrograms();
    },
    onError: (err) => toast.error(err.message),
  });

  const createFund = trpc.scholarships.createFund.useMutation({
    onSuccess: () => {
      toast.success("Scholarship fund created");
      setIsFundDialogOpen(false);
      refetchFunds();
    },
    onError: (err) => toast.error(err.message),
  });

  const reviewApplication = trpc.scholarships.reviewApplication.useMutation({
    onSuccess: () => {
      toast.success("Application reviewed");
      setSelectedApplication(null);
      refetchApplications();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateProgramStatus = trpc.scholarships.updateProgramStatus.useMutation({
    onSuccess: () => {
      toast.success("Program status updated");
      refetchPrograms();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleRegisterFounder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    registerFounder.mutate({
      fullName: formData.get("fullName") as string,
      foundingRole: formData.get("foundingRole") as any,
      foundingDate: formData.get("foundingDate") as string,
      houseId: formData.get("houseId") as string || undefined,
      entityName: formData.get("entityName") as string || undefined,
      benefitGenerations: parseInt(formData.get("benefitGenerations") as string) || 3,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleRegisterHeir = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    registerHeir.mutate({
      heirFullName: formData.get("heirFullName") as string,
      foundingMemberId: parseInt(formData.get("foundingMemberId") as string),
      generationFromFounder: parseInt(formData.get("generationFromFounder") as string),
      heirHouseId: formData.get("heirHouseId") as string || undefined,
      benefitType: formData.get("benefitType") as any || "full_tuition",
      coveragePercentage: parseInt(formData.get("coveragePercentage") as string) || 100,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleCreateProgram = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createProgram.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      scholarshipType: formData.get("scholarshipType") as any,
      coverageType: formData.get("coverageType") as any,
      coverageAmount: formData.get("coverageAmount") ? parseFloat(formData.get("coverageAmount") as string) : undefined,
      totalSlots: parseInt(formData.get("totalSlots") as string) || 10,
      totalBudget: formData.get("totalBudget") ? parseFloat(formData.get("totalBudget") as string) : undefined,
      minGPA: formData.get("minGPA") ? parseFloat(formData.get("minGPA") as string) : undefined,
      requiredCommunityHours: formData.get("requiredCommunityHours") ? parseInt(formData.get("requiredCommunityHours") as string) : undefined,
      applicationStartDate: formData.get("applicationStartDate") as string || undefined,
      applicationEndDate: formData.get("applicationEndDate") as string || undefined,
    });
  };

  const handleCreateFund = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createFund.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      fundType: formData.get("fundType") as any,
      initialBalance: parseFloat(formData.get("initialBalance") as string) || 0,
      isEndowed: formData.get("isEndowed") === "true",
      endowmentMinimum: formData.get("endowmentMinimum") ? parseFloat(formData.get("endowmentMinimum") as string) : undefined,
      annualSpendingRate: formData.get("annualSpendingRate") ? parseFloat(formData.get("annualSpendingRate") as string) / 100 : undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scholarships & Education Benefits</h1>
          <p className="text-muted-foreground mt-1">
            Manage founding member heir benefits and community scholarship programs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founding Members</p>
                  <p className="text-2xl font-bold">{stats?.foundingMembers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heir Beneficiaries</p>
                  <p className="text-2xl font-bold">{stats?.heirBeneficiaries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Programs</p>
                  <p className="text-2xl font-bold">{stats?.activePrograms || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fund Balance</p>
                  <p className="text-2xl font-bold">${(stats?.totalFundBalance || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="founders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="founders">Founding Members</TabsTrigger>
            <TabsTrigger value="heirs">Heir Benefits</TabsTrigger>
            <TabsTrigger value="programs">Scholarship Programs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="funds">Funds</TabsTrigger>
          </TabsList>

          {/* Founding Members Tab */}
          <TabsContent value="founders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Founding Members</CardTitle>
                  <CardDescription>
                    Original Management team from startup - their heirs receive free Academy education
                  </CardDescription>
                </div>
                <Dialog open={isFounderDialogOpen} onOpenChange={setIsFounderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Register Founder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Founding Member</DialogTitle>
                      <DialogDescription>
                        Register an original Management team member whose heirs will receive education benefits
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRegisterFounder} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input id="fullName" name="fullName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foundingRole">Founding Role *</Label>
                        <Select name="foundingRole" defaultValue="co_founder">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary_founder">Primary Founder (CEO/Principal)</SelectItem>
                            <SelectItem value="co_founder">Co-Founder (Original Management)</SelectItem>
                            <SelectItem value="charter_member">Charter Member (Startup Team)</SelectItem>
                            <SelectItem value="founding_investor">Founding Investor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foundingDate">Founding Date *</Label>
                        <Input id="foundingDate" name="foundingDate" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="houseId">House ID</Label>
                        <Input id="houseId" name="houseId" placeholder="e.g., HOUSE-001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entityName">Primary Entity</Label>
                        <Input id="entityName" name="entityName" placeholder="e.g., L.A.W.S. Collective, LLC" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="benefitGenerations">Benefit Generations</Label>
                        <Select name="benefitGenerations" defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Generation (Children only)</SelectItem>
                            <SelectItem value="2">2 Generations (Children + Grandchildren)</SelectItem>
                            <SelectItem value="3">3 Generations (+ Great-grandchildren)</SelectItem>
                            <SelectItem value="4">4 Generations</SelectItem>
                            <SelectItem value="5">5 Generations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" placeholder="Position held, contributions, etc." />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsFounderDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={registerFounder.isPending}>
                          {registerFounder.isPending ? "Registering..." : "Register"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Founding Date</TableHead>
                      <TableHead>Benefit Generations</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foundingMembers?.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{member.fullName}</p>
                            {member.entityName && (
                              <p className="text-sm text-muted-foreground">{member.entityName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{FOUNDING_ROLE_LABELS[member.foundingRole]}</Badge>
                        </TableCell>
                        <TableCell>
                          {member.foundingDate ? new Date(member.foundingDate).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>{member.benefitGenerations} generations</TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!foundingMembers || foundingMembers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No founding members registered yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heir Benefits Tab */}
          <TabsContent value="heirs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Heir Education Benefits</CardTitle>
                  <CardDescription>
                    Free Academy education for founding member descendants
                  </CardDescription>
                </div>
                <Dialog open={isHeirDialogOpen} onOpenChange={setIsHeirDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Register Heir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Register Heir Benefit</DialogTitle>
                      <DialogDescription>
                        Register a founding member's heir for education benefits
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRegisterHeir} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="heirFullName">Heir Full Name *</Label>
                        <Input id="heirFullName" name="heirFullName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foundingMemberId">Founding Member *</Label>
                        <Select name="foundingMemberId">
                          <SelectTrigger>
                            <SelectValue placeholder="Select founding member" />
                          </SelectTrigger>
                          <SelectContent>
                            {foundingMembers?.map((member) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="generationFromFounder">Generation from Founder *</Label>
                        <Select name="generationFromFounder" defaultValue="1">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Generation (Child)</SelectItem>
                            <SelectItem value="2">2nd Generation (Grandchild)</SelectItem>
                            <SelectItem value="3">3rd Generation (Great-grandchild)</SelectItem>
                            <SelectItem value="4">4th Generation</SelectItem>
                            <SelectItem value="5">5th Generation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="heirHouseId">Heir House ID</Label>
                        <Input id="heirHouseId" name="heirHouseId" placeholder="e.g., HOUSE-001-A" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="benefitType">Benefit Type</Label>
                        <Select name="benefitType" defaultValue="full_tuition">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_tuition">Full Tuition (100%)</SelectItem>
                            <SelectItem value="partial_tuition">Partial Tuition</SelectItem>
                            <SelectItem value="materials_only">Materials Only</SelectItem>
                            <SelectItem value="priority_enrollment">Priority Enrollment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coveragePercentage">Coverage Percentage</Label>
                        <Input id="coveragePercentage" name="coveragePercentage" type="number" defaultValue="100" min="0" max="100" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsHeirDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={registerHeir.isPending}>
                          {registerHeir.isPending ? "Registering..." : "Register"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Heir Name</TableHead>
                      <TableHead>Founding Member</TableHead>
                      <TableHead>Generation</TableHead>
                      <TableHead>Benefit Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heirBenefits?.map((benefit) => {
                      const founder = foundingMembers?.find(f => f.id === benefit.foundingMemberId);
                      return (
                        <TableRow key={benefit.id}>
                          <TableCell className="font-medium">{benefit.heirFullName}</TableCell>
                          <TableCell>{founder?.fullName || "Unknown"}</TableCell>
                          <TableCell>{benefit.generationFromFounder}st Gen</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {benefit.benefitType === "full_tuition" ? "Full Tuition" : benefit.benefitType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={benefit.status === "eligible" ? "default" : "secondary"}>
                              {benefit.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!heirBenefits || heirBenefits.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No heir benefits registered yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scholarship Programs Tab */}
          <TabsContent value="programs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scholarship Programs</CardTitle>
                  <CardDescription>
                    Community scholarship programs for Academy education
                  </CardDescription>
                </div>
                <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Program
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Scholarship Program</DialogTitle>
                      <DialogDescription>
                        Define a new scholarship program for community members
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProgram} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Program Name *</Label>
                          <Input id="name" name="name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scholarshipType">Type *</Label>
                          <Select name="scholarshipType" defaultValue="merit_based">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(SCHOLARSHIP_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coverageType">Coverage Type *</Label>
                          <Select name="coverageType" defaultValue="full_tuition">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(COVERAGE_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="coverageAmount">Coverage Amount ($)</Label>
                          <Input id="coverageAmount" name="coverageAmount" type="number" step="0.01" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalSlots">Total Slots</Label>
                          <Input id="totalSlots" name="totalSlots" type="number" defaultValue="10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minGPA">Min GPA</Label>
                          <Input id="minGPA" name="minGPA" type="number" step="0.01" min="0" max="4" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="requiredCommunityHours">Community Hours</Label>
                          <Input id="requiredCommunityHours" name="requiredCommunityHours" type="number" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="applicationStartDate">Application Start</Label>
                          <Input id="applicationStartDate" name="applicationStartDate" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="applicationEndDate">Application End</Label>
                          <Input id="applicationEndDate" name="applicationEndDate" type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalBudget">Total Budget ($)</Label>
                        <Input id="totalBudget" name="totalBudget" type="number" step="0.01" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsProgramDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createProgram.isPending}>
                          {createProgram.isPending ? "Creating..." : "Create Program"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Slots</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs?.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{program.name}</p>
                            {program.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{program.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{SCHOLARSHIP_TYPE_LABELS[program.scholarshipType]}</Badge>
                        </TableCell>
                        <TableCell>
                          {program.coverageAmount 
                            ? `$${parseFloat(program.coverageAmount.toString()).toLocaleString()}`
                            : COVERAGE_TYPE_LABELS[program.coverageType]}
                        </TableCell>
                        <TableCell>{program.filledSlots}/{program.totalSlots}</TableCell>
                        <TableCell>
                          <Badge variant={program.status === "active" ? "default" : "secondary"}>
                            {program.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {program.status === "draft" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProgramStatus.mutate({ id: program.id, status: "active" })}
                            >
                              Activate
                            </Button>
                          )}
                          {program.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProgramStatus.mutate({ id: program.id, status: "closed" })}
                            >
                              Close
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!programs || programs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No scholarship programs created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Applications</CardTitle>
                <CardDescription>
                  Review and process scholarship applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications?.map((app) => {
                      const program = programs?.find(p => p.id === app.scholarshipProgramId);
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{app.applicantFullName}</p>
                              {app.applicantEmail && (
                                <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{program?.name || "Unknown"}</TableCell>
                          <TableCell>{app.totalScore || "-"}</TableCell>
                          <TableCell>
                            <Badge className={REVIEW_STATUS_COLORS[app.reviewStatus]}>
                              {app.reviewStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {app.reviewStatus === "submitted" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => reviewApplication.mutate({
                                      applicationId: app.id,
                                      decision: "approved",
                                      reviewedBy: "Admin",
                                      awardAmount: program?.coverageAmount ? parseFloat(program.coverageAmount.toString()) : undefined,
                                    })}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => reviewApplication.mutate({
                                      applicationId: app.id,
                                      decision: "denied",
                                      reviewedBy: "Admin",
                                    })}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!applications || applications.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No applications received yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funds Tab */}
          <TabsContent value="funds">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Scholarship Funds</CardTitle>
                  <CardDescription>
                    Manage scholarship fund balances and donations
                  </CardDescription>
                </div>
                <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Fund
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Scholarship Fund</DialogTitle>
                      <DialogDescription>
                        Establish a new scholarship fund
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateFund} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Fund Name *</Label>
                        <Input id="name" name="name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fundType">Fund Type *</Label>
                        <Select name="fundType" defaultValue="general">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="endowment">Endowment</SelectItem>
                            <SelectItem value="annual">Annual Giving</SelectItem>
                            <SelectItem value="memorial">Memorial</SelectItem>
                            <SelectItem value="corporate">Corporate</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="initialBalance">Initial Balance ($)</Label>
                        <Input id="initialBalance" name="initialBalance" type="number" step="0.01" defaultValue="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isEndowed">Is Endowed?</Label>
                        <Select name="isEndowed" defaultValue="false">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">No</SelectItem>
                            <SelectItem value="true">Yes (Principal preserved)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="endowmentMinimum">Endowment Minimum ($)</Label>
                          <Input id="endowmentMinimum" name="endowmentMinimum" type="number" step="0.01" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="annualSpendingRate">Annual Spending Rate (%)</Label>
                          <Input id="annualSpendingRate" name="annualSpendingRate" type="number" step="0.1" placeholder="5" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsFundDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createFund.isPending}>
                          {createFund.isPending ? "Creating..." : "Create Fund"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fund Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Principal Balance</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {funds?.map((fund) => (
                      <TableRow key={fund.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{fund.name}</p>
                            {fund.isEndowed && (
                              <Badge variant="outline" className="text-xs">Endowed</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{fund.fundType}</TableCell>
                        <TableCell>${parseFloat(fund.principalBalance?.toString() || "0").toLocaleString()}</TableCell>
                        <TableCell>${parseFloat(fund.availableBalance?.toString() || "0").toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={fund.status === "active" ? "default" : "secondary"}>
                            {fund.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!funds || funds.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No scholarship funds created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
