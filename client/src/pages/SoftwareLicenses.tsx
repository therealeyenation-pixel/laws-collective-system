import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Key,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Music,
  Palette,
  Video,
  Box,
  Brain,
  Briefcase,
  ClipboardList,
  Code,
  MessageCircle,
  Calculator,
  Loader2,
  Building,
  FileText,
  Sparkles,
  RefreshCw,
  UserPlus,
  Trash2,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  music: <Music className="w-5 h-5" />,
  palette: <Palette className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  cube: <Box className="w-5 h-5" />,
  brain: <Brain className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
  clipboard: <ClipboardList className="w-5 h-5" />,
  code: <Code className="w-5 h-5" />,
  "message-circle": <MessageCircle className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  pending_renewal: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle className="w-4 h-4" />,
  expired: <XCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />,
  pending_renewal: <AlertTriangle className="w-4 h-4" />,
};

export default function SoftwareLicenses() {
  const [isAddLicenseOpen, setIsAddLicenseOpen] = useState(false);
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<number | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const utils = trpc.useUtils();

  const { data: stats, isLoading: statsLoading } = trpc.softwareLicenses.getStats.useQuery();
  const { data: categories } = trpc.softwareLicenses.getCategories.useQuery();
  const { data: licenses, isLoading: licensesLoading } = trpc.softwareLicenses.getLicenses.useQuery();
  const { data: contracts } = trpc.softwareLicenses.getContracts.useQuery();
  const { data: assignments } = trpc.softwareLicenses.getAssignments.useQuery();

  const seedCategoriesMutation = trpc.softwareLicenses.seedCategories.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.softwareLicenses.getCategories.invalidate();
      utils.softwareLicenses.getStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const createLicenseMutation = trpc.softwareLicenses.createLicense.useMutation({
    onSuccess: () => {
      toast.success("License added successfully");
      setIsAddLicenseOpen(false);
      utils.softwareLicenses.getLicenses.invalidate();
      utils.softwareLicenses.getStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const createContractMutation = trpc.softwareLicenses.createContract.useMutation({
    onSuccess: () => {
      toast.success("Contract added successfully");
      setIsAddContractOpen(false);
      utils.softwareLicenses.getContracts.invalidate();
      utils.softwareLicenses.getStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const createAssignmentMutation = trpc.softwareLicenses.createAssignment.useMutation({
    onSuccess: () => {
      toast.success("License assigned successfully");
      setIsAssignOpen(false);
      setSelectedLicense(null);
      utils.softwareLicenses.getAssignments.invalidate();
      utils.softwareLicenses.getLicenses.invalidate();
      utils.softwareLicenses.getStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeAssignmentMutation = trpc.softwareLicenses.revokeAssignment.useMutation({
    onSuccess: () => {
      toast.success("Assignment revoked");
      utils.softwareLicenses.getAssignments.invalidate();
      utils.softwareLicenses.getLicenses.invalidate();
      utils.softwareLicenses.getStats.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleAddLicense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLicenseMutation.mutate({
      name: formData.get("name") as string,
      vendor: formData.get("vendor") as string,
      categoryId: formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : undefined,
      licenseType: formData.get("licenseType") as any,
      totalSeats: parseInt(formData.get("totalSeats") as string) || 1,
      costPerSeat: formData.get("costPerSeat") ? parseFloat(formData.get("costPerSeat") as string) : undefined,
      totalCost: formData.get("totalCost") ? parseFloat(formData.get("totalCost") as string) : undefined,
      billingCycle: formData.get("billingCycle") as any,
      renewalDate: formData.get("renewalDate") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleAddContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createContractMutation.mutate({
      vendorName: formData.get("vendorName") as string,
      contractType: formData.get("contractType") as any,
      contractNumber: formData.get("contractNumber") as string || undefined,
      startDate: formData.get("startDate") as string || undefined,
      endDate: formData.get("endDate") as string || undefined,
      annualValue: formData.get("annualValue") ? parseFloat(formData.get("annualValue") as string) : undefined,
      supportLevel: formData.get("supportLevel") as any,
      contactName: formData.get("contactName") as string || undefined,
      contactEmail: formData.get("contactEmail") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleAssignLicense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLicense) return;
    const formData = new FormData(e.currentTarget);
    createAssignmentMutation.mutate({
      licenseId: selectedLicense,
      assignedTo: formData.get("assignedTo") as string,
      assignedType: formData.get("assignedType") as any,
      notes: formData.get("notes") as string || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              Software License Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage software licenses, subscriptions, and vendor contracts
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => seedCategoriesMutation.mutate()}
              disabled={seedCategoriesMutation.isPending}
            >
              {seedCategoriesMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Seed Categories
            </Button>
            <Dialog open={isAddLicenseOpen} onOpenChange={setIsAddLicenseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add License
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Software License</DialogTitle>
                  <DialogDescription>
                    Add a new software license to track
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddLicense} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Software Name *</Label>
                      <Input id="name" name="name" required placeholder="e.g., Adobe Creative Cloud" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor *</Label>
                      <Input id="vendor" name="vendor" required placeholder="e.g., Adobe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryId">Category</Label>
                      <Select name="categoryId">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseType">License Type</Label>
                      <Select name="licenseType" defaultValue="subscription">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="perpetual">Perpetual</SelectItem>
                          <SelectItem value="floating">Floating</SelectItem>
                          <SelectItem value="site">Site License</SelectItem>
                          <SelectItem value="open_source">Open Source</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalSeats">Total Seats</Label>
                      <Input id="totalSeats" name="totalSeats" type="number" defaultValue="1" min="1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPerSeat">Cost Per Seat ($)</Label>
                      <Input id="costPerSeat" name="costPerSeat" type="number" step="0.01" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalCost">Total Cost ($)</Label>
                      <Input id="totalCost" name="totalCost" type="number" step="0.01" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingCycle">Billing Cycle</Label>
                      <Select name="billingCycle" defaultValue="annual">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                          <SelectItem value="one_time">One-Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renewalDate">Renewal Date</Label>
                      <Input id="renewalDate" name="renewalDate" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" placeholder="Additional notes..." />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddLicenseOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLicenseMutation.isPending}>
                      {createLicenseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Add License
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalLicenses}</p>
                    <p className="text-sm text-muted-foreground">Total Licenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeLicenses}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.usedSeats}/{stats.totalSeats}</p>
                    <p className="text-sm text-muted-foreground">Seats Used</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${stats.monthlyTotal.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${stats.annualTotal.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Annual Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                    <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeContracts}</p>
                    <p className="text-sm text-muted-foreground">Contracts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="licenses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>

          {/* Licenses Tab */}
          <TabsContent value="licenses" className="space-y-4 mt-6">
            {licensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : licenses && licenses.length > 0 ? (
              <div className="grid gap-4">
                {licenses.map((license) => {
                  const category = categories?.find(c => c.id === license.categoryId);
                  const seatUsage = license.totalSeats > 0 ? (license.usedSeats / license.totalSeats) * 100 : 0;
                  return (
                    <Card key={license.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              {category?.icon ? categoryIcons[category.icon] || <Package className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{license.name}</h3>
                              <p className="text-sm text-muted-foreground">{license.vendor}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={statusColors[license.status || "active"]}>
                                  {statusIcons[license.status || "active"]}
                                  <span className="ml-1 capitalize">{license.status}</span>
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {license.licenseType?.replace("_", " ")}
                                </Badge>
                                {category && (
                                  <Badge variant="secondary">{category.name}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              ${parseFloat(license.totalCost?.toString() || "0").toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {license.billingCycle === "one_time" ? "One-Time" : `/${license.billingCycle?.slice(0, -2) || "year"}`}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Seats</p>
                            <div className="flex items-center gap-2">
                              <Progress value={seatUsage} className="h-2 flex-1" />
                              <span className="text-sm font-medium">{license.usedSeats}/{license.totalSeats}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Renewal Date</p>
                            <p className="font-medium">
                              {license.renewalDate ? new Date(license.renewalDate).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLicense(license.id);
                                setIsAssignOpen(true);
                              }}
                              disabled={license.usedSeats >= license.totalSeats}
                            >
                              <UserPlus className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Key className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Licenses Found</h3>
                  <p className="text-muted-foreground">Add your first software license to get started.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-6">
            {categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryLicenses = licenses?.filter(l => l.categoryId === category.id) || [];
                  return (
                    <Card key={category.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {categoryIcons[category.icon || ""] || <Package className="w-5 h-5" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <CardDescription>{category.department}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Licenses</span>
                          <Badge variant="secondary">{categoryLicenses.length}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Categories Found</h3>
                  <p className="text-muted-foreground mb-4">Click "Seed Categories" to add default categories.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4 mt-6">
            {assignments && assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment) => {
                  const license = licenses?.find(l => l.id === assignment.licenseId);
                  return (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium">{assignment.assignedTo}</p>
                              <p className="text-sm text-muted-foreground">
                                {license?.name} • {assignment.assignedType}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={statusColors[assignment.status || "active"]}>
                              {assignment.status}
                            </Badge>
                            {assignment.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => revokeAssignmentMutation.mutate({ id: assignment.id })}
                                disabled={revokeAssignmentMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Assignments</h3>
                  <p className="text-muted-foreground">Assign licenses to users or departments from the Licenses tab.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4 mt-6">
            <div className="flex justify-end">
              <Dialog open={isAddContractOpen} onOpenChange={setIsAddContractOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Vendor Contract</DialogTitle>
                    <DialogDescription>
                      Add a new vendor contract for support or enterprise licensing
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddContract} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendorName">Vendor Name *</Label>
                        <Input id="vendorName" name="vendorName" required placeholder="e.g., Microsoft" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractType">Contract Type</Label>
                        <Select name="contractType" defaultValue="enterprise">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                            <SelectItem value="volume">Volume</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contractNumber">Contract Number</Label>
                        <Input id="contractNumber" name="contractNumber" placeholder="Contract #" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="annualValue">Annual Value ($)</Label>
                        <Input id="annualValue" name="annualValue" type="number" step="0.01" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" name="startDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" name="endDate" type="date" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="supportLevel">Support Level</Label>
                        <Select name="supportLevel" defaultValue="standard">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input id="contactName" name="contactName" placeholder="Account rep name" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" name="contactEmail" type="email" placeholder="rep@vendor.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" name="notes" placeholder="Additional notes..." />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddContractOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createContractMutation.isPending}>
                        {createContractMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Add Contract
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {contracts && contracts.length > 0 ? (
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <Card key={contract.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                            <Building className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{contract.vendorName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {contract.contractNumber || "No contract number"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={statusColors[contract.status || "active"]}>
                                {contract.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {contract.contractType}
                              </Badge>
                              <Badge variant="secondary" className="capitalize">
                                {contract.supportLevel} Support
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${parseFloat(contract.annualValue?.toString() || "0").toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">/year</p>
                        </div>
                      </div>
                      {(contract.contactName || contract.contactEmail) && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium">{contract.contactName}</p>
                          {contract.contactEmail && (
                            <p className="text-sm text-muted-foreground">{contract.contactEmail}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Contracts Found</h3>
                  <p className="text-muted-foreground">Add vendor contracts to track support and enterprise agreements.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign License</DialogTitle>
              <DialogDescription>
                Assign this license to a user, department, or role
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignLicense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To *</Label>
                <Input id="assignedTo" name="assignedTo" required placeholder="User name, department, or role" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedType">Assignment Type</Label>
                <Select name="assignedType" defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignNotes">Notes</Label>
                <Textarea id="assignNotes" name="notes" placeholder="Assignment notes..." />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAssignmentMutation.isPending}>
                  {createAssignmentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Assign License
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
