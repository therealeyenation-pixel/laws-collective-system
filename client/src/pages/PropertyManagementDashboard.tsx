import { useState } from "react";
import { DepartmentNewsWidget } from "@/components/DepartmentNewsWidget";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Building2,
  Home,
  MapPin,
  DollarSign,
  Wrench,
  Users,
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Hammer,
  ClipboardList,
  Receipt,
  Truck,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function PropertyManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);

  // Queries
  const statsQuery = trpc.propertyManagement.getPropertyStats.useQuery();
  const propertiesQuery = trpc.propertyManagement.listProperties.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    propertyType: typeFilter !== "all" ? typeFilter : undefined,
    search: searchTerm || undefined,
    limit: 100,
  });
  const projectsQuery = trpc.propertyManagement.listProjects.useQuery({
    propertyId: selectedProperty || undefined,
    limit: 100,
  });
  const maintenanceQuery = trpc.propertyManagement.listMaintenanceLogs.useQuery({
    propertyId: selectedProperty || undefined,
    limit: 50,
  });
  const tenantsQuery = trpc.propertyManagement.listTenants.useQuery({
    propertyId: selectedProperty || undefined,
    limit: 50,
  });
  const vendorsQuery = trpc.propertyManagement.listVendors.useQuery({ limit: 100 });
  
  const propertyDetailQuery = trpc.propertyManagement.getProperty.useQuery(
    { id: selectedProperty! },
    { enabled: !!selectedProperty }
  );
  // Project detail is fetched from the projects list
  const projectDetailQuery = {
    data: projectsQuery.data?.find((p: any) => p.id === selectedProject),
    refetch: projectsQuery.refetch,
  };

  // Mutations
  const createPropertyMutation = trpc.propertyManagement.createProperty.useMutation({
    onSuccess: () => {
      toast.success("Property created successfully");
      setShowAddProperty(false);
      propertiesQuery.refetch();
      statsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const createProjectMutation = trpc.propertyManagement.createProject.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully");
      setShowAddProject(false);
      projectsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const createMaintenanceMutation = trpc.propertyManagement.createMaintenanceLog.useMutation({
    onSuccess: () => {
      toast.success("Maintenance request created");
      setShowAddMaintenance(false);
      maintenanceQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const createTenantMutation = trpc.propertyManagement.createTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant added successfully");
      setShowAddTenant(false);
      tenantsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const createVendorMutation = trpc.propertyManagement.createVendor.useMutation({
    onSuccess: () => {
      toast.success("Vendor added successfully");
      setShowAddVendor(false);
      vendorsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateProjectMutation = trpc.propertyManagement.updateProject.useMutation({
    onSuccess: () => {
      toast.success("Project updated");
      projectDetailQuery.refetch();
      projectsQuery.refetch();
    },
  });

  // Task updates handled through project updates
  const updateTaskMutation = {
    mutate: (data: any) => {
      toast.info("Task updates coming soon");
    },
    isPending: false,
  };

  const stats = statsQuery.data;
  const properties = propertiesQuery.data?.properties || [];
  const projects = projectsQuery.data || [];
  const maintenanceLogs = maintenanceQuery.data || [];
  const tenants = tenantsQuery.data || [];
  const vendors = vendorsQuery.data || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      vacant: "bg-yellow-100 text-yellow-800",
      under_renovation: "bg-blue-100 text-blue-800",
      for_sale: "bg-purple-100 text-purple-800",
      for_rent: "bg-orange-100 text-orange-800",
      pending_acquisition: "bg-cyan-100 text-cyan-800",
      sold: "bg-gray-100 text-gray-800",
      archived: "bg-gray-200 text-gray-600",
      planning: "bg-slate-100 text-slate-800",
      approved: "bg-blue-100 text-blue-800",
      in_progress: "bg-amber-100 text-amber-800",
      on_hold: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      reported: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
      emergency: "bg-red-200 text-red-900",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  // Property Detail View
  if (selectedProperty && !selectedProject) {
    const property = propertyDetailQuery.data;
    
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedProperty(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>

          {property && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{property.propertyName}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    {property.streetAddress}, {property.city}, {property.state} {property.zipCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(property.status)}>{property.status?.replace(/_/g, " ")}</Badge>
                  <Badge variant="outline">{property.propertyType?.replace(/_/g, " ")}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="text-xl font-bold">{formatCurrency(property.currentValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                        <p className="text-xl font-bold">{formatCurrency(property.purchasePrice)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mortgage Balance</p>
                        <p className="text-xl font-bold">{formatCurrency(property.mortgageBalance)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Home className="w-8 h-8 text-amber-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Equity</p>
                        <p className="text-xl font-bold">{formatCurrency((property.currentValue || 0) - (property.mortgageBalance || 0))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="projects">Projects ({property.projects?.length || 0})</TabsTrigger>
                  <TabsTrigger value="tenants">Tenants ({property.tenants?.length || 0})</TabsTrigger>
                  <TabsTrigger value="maintenance">Maintenance ({property.maintenance?.length || 0})</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                  <TabsTrigger value="utilities">Utilities</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Property Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Year Built</p>
                            <p className="font-medium">{property.yearBuilt || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Square Footage</p>
                            <p className="font-medium">{property.squareFootage?.toLocaleString() || "N/A"} sq ft</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lot Size</p>
                            <p className="font-medium">{property.lotSize?.toLocaleString() || "N/A"} sq ft</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bedrooms</p>
                            <p className="font-medium">{property.bedrooms || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bathrooms</p>
                            <p className="font-medium">{property.bathrooms || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Stories</p>
                            <p className="font-medium">{property.stories || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Garage Spaces</p>
                            <p className="font-medium">{property.garageSpaces || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Occupancy</p>
                            <p className="font-medium">{property.occupancyStatus?.replace(/_/g, " ") || "N/A"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Financial Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Mortgage Payment</p>
                            <p className="font-medium">{formatCurrency(property.mortgagePayment)}/mo</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Interest Rate</p>
                            <p className="font-medium">{property.mortgageInterestRate || "N/A"}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Annual Property Tax</p>
                            <p className="font-medium">{formatCurrency(property.annualPropertyTax)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tax Assessed Value</p>
                            <p className="font-medium">{formatCurrency(property.taxAssessedValue)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Insurance Premium</p>
                            <p className="font-medium">{formatCurrency(property.insurancePremium)}/yr</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Parcel Number</p>
                            <p className="font-medium">{property.parcelNumber || "N/A"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Property Projects</h3>
                    <Button onClick={() => setShowAddProject(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Project
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {property.projects?.map((project: any) => (
                      <Card key={project.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedProject(project.id)}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{project.projectName}</h4>
                              <p className="text-sm text-muted-foreground">{project.projectType?.replace(/_/g, " ")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(project.status)}>{project.status?.replace(/_/g, " ")}</Badge>
                              <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                              {project.estimatedBudget && (
                                <span className="text-sm font-medium">{formatCurrency(project.estimatedBudget)}</span>
                              )}
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!property.projects || property.projects.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No projects for this property</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tenants" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Tenants</h3>
                    <Button onClick={() => setShowAddTenant(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tenant
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {property.tenants?.map((tenant: any) => (
                      <Card key={tenant.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">
                                {tenant.tenantType === "business" ? tenant.businessName : `${tenant.firstName} ${tenant.lastName}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">{tenant.email} • {tenant.phone}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(tenant.status)}>{tenant.status}</Badge>
                              <span className="text-sm font-medium">{formatCurrency(tenant.monthlyRent)}/mo</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!property.tenants || property.tenants.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No tenants for this property</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Maintenance Logs</h3>
                    <Button onClick={() => setShowAddMaintenance(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {property.maintenance?.map((log: any) => (
                      <Card key={log.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{log.title}</h4>
                              <p className="text-sm text-muted-foreground">{log.category} • {log.maintenanceType}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                              <Badge className={getPriorityColor(log.priority)}>{log.priority}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!property.maintenance || property.maintenance.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No maintenance records</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="financials" className="space-y-4">
                  <PropertyFinancials propertyId={selectedProperty} />
                </TabsContent>

                <TabsContent value="utilities" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Utilities</h3>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Utility
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {property.utilities?.map((utility: any) => (
                      <Card key={utility.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium capitalize">{utility.utilityType}</h4>
                              <p className="text-sm text-muted-foreground">{utility.providerName} • Acct: {utility.accountNumber}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(utility.status)}>{utility.status}</Badge>
                              <span className="text-sm font-medium">{formatCurrency(utility.averageMonthlyBill)}/mo</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!property.utilities || property.utilities.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No utilities configured</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Add Project Dialog */}
        <AddProjectDialog
          open={showAddProject}
          onClose={() => setShowAddProject(false)}
          propertyId={selectedProperty}
          onSubmit={(data: any) => createProjectMutation.mutate(data)}
          isLoading={createProjectMutation.isPending}
        />

        {/* Add Tenant Dialog */}
        <AddTenantDialog
          open={showAddTenant}
          onClose={() => setShowAddTenant(false)}
          propertyId={selectedProperty}
          onSubmit={(data: any) => createTenantMutation.mutate(data)}
          isLoading={createTenantMutation.isPending}
        />

        {/* Add Maintenance Dialog */}
        <AddMaintenanceDialog
          open={showAddMaintenance}
          onClose={() => setShowAddMaintenance(false)}
          propertyId={selectedProperty}
          onSubmit={(data: any) => createMaintenanceMutation.mutate(data)}
          isLoading={createMaintenanceMutation.isPending}
        />
      </DashboardLayout>
    );
  }

  // Project Detail View
  if (selectedProject) {
    const project = projectDetailQuery.data;
    
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Property
            </Button>
          </div>

          {project && (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{project.projectName}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4" />
                    {project.propertyName} • {project.streetAddress}, {project.city}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(project.status)}>{project.status?.replace(/_/g, " ")}</Badge>
                  <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-xl font-bold">{formatCurrency(project.approvedBudget || project.estimatedBudget)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="text-xl font-bold">{formatCurrency(project.totalExpenses)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tasks</p>
                        <p className="text-xl font-bold">{project.taskProgress?.completed}/{project.taskProgress?.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-xl font-bold">{project.percentComplete || project.taskProgress?.percentage || 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="milestones">Milestones ({project.milestones?.length || 0})</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks ({project.tasks?.length || 0})</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses ({project.expenses?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Project Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{project.projectType?.replace(/_/g, " ")}</p>
                        </div>
                        {project.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="font-medium">{project.description}</p>
                          </div>
                        )}
                        {project.scope && (
                          <div>
                            <p className="text-sm text-muted-foreground">Scope</p>
                            <p className="font-medium">{project.scope}</p>
                          </div>
                        )}
                        {project.objectives && (
                          <div>
                            <p className="text-sm text-muted-foreground">Objectives</p>
                            <p className="font-medium">{project.objectives}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Timeline & Contractor</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Planned Start</p>
                            <p className="font-medium">{project.plannedStartDate ? format(new Date(project.plannedStartDate), "MMM d, yyyy") : "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Planned End</p>
                            <p className="font-medium">{project.plannedEndDate ? format(new Date(project.plannedEndDate), "MMM d, yyyy") : "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Actual Start</p>
                            <p className="font-medium">{project.actualStartDate ? format(new Date(project.actualStartDate), "MMM d, yyyy") : "Not started"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Actual End</p>
                            <p className="font-medium">{project.actualEndDate ? format(new Date(project.actualEndDate), "MMM d, yyyy") : "In progress"}</p>
                          </div>
                        </div>
                        {project.contractorName && (
                          <div>
                            <p className="text-sm text-muted-foreground">Contractor</p>
                            <p className="font-medium">{project.contractorName}</p>
                            {project.contractorContact && <p className="text-sm text-muted-foreground">{project.contractorContact}</p>}
                          </div>
                        )}
                        {project.requiresPermit && (
                          <div>
                            <p className="text-sm text-muted-foreground">Permit</p>
                            <p className="font-medium">{project.permitNumber || "Required"} - <Badge className={getStatusColor(project.permitStatus)}>{project.permitStatus}</Badge></p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => updateProjectMutation.mutate({ id: project.id, status: "in_progress" })}>
                          Start Project
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateProjectMutation.mutate({ id: project.id, status: "on_hold" })}>
                          Put On Hold
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateProjectMutation.mutate({ id: project.id, status: "completed" })}>
                          Mark Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Project Milestones</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {project.milestones?.map((milestone: any) => (
                      <Card key={milestone.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{milestone.milestoneName}</h4>
                              {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(milestone.status || "pending")}>{milestone.status || "pending"}</Badge>
                              {milestone.targetDate && (
                                <span className="text-sm text-muted-foreground">
                                  Due: {format(new Date(milestone.targetDate), "MMM d, yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!project.milestones || project.milestones.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No milestones defined</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Project Tasks</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {project.tasks?.map((task: any) => (
                      <Card key={task.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={task.status === "completed"}
                                onChange={(e) => updateTaskMutation.mutate({
                                  id: task.id,
                                  status: e.target.checked ? "completed" : "not_started",
                                  completedDate: e.target.checked ? new Date().toISOString() : undefined,
                                })}
                                className="w-5 h-5"
                              />
                              <div>
                                <h4 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                  {task.taskName}
                                </h4>
                                {task.assignedToName && <p className="text-sm text-muted-foreground">Assigned to: {task.assignedToName}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(task.status)}>{task.status?.replace(/_/g, " ")}</Badge>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              {task.dueDate && (
                                <span className="text-sm text-muted-foreground">
                                  Due: {format(new Date(task.dueDate), "MMM d")}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!project.tasks || project.tasks.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No tasks defined</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Project Expenses</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {project.expenses?.map((expense: any) => (
                      <Card key={expense.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{expense.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                {expense.category} • {expense.vendorName || "No vendor"} • {format(new Date(expense.expenseDate), "MMM d, yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(expense.paymentStatus)}>{expense.paymentStatus}</Badge>
                              <span className="text-lg font-bold">{formatCurrency(expense.totalAmount)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!project.expenses || project.expenses.length === 0) && (
                      <p className="text-muted-foreground text-center py-8">No expenses recorded</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Main Dashboard View
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Property Management</h1>
            <p className="text-muted-foreground">Manage properties, projects, tenants, and maintenance</p>
          </div>
          <Button onClick={() => setShowAddProperty(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{stats?.totalProperties || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Equity</p>
                  <p className="text-2xl font-bold">{formatCurrency((stats?.totalValue || 0) - (stats?.totalMortgage || 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Hammer className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{projects.filter((p: any) => p.status === "in_progress").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Properties by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byStatus?.map((item: any) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(item.status)}>{item.status?.replace(/_/g, " ")}</Badge>
                        </div>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Properties by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byType?.map((item: any) => (
                      <div key={item.propertyType} className="flex items-center justify-between">
                        <span className="capitalize">{item.propertyType?.replace(/_/g, " ")}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {maintenanceLogs.slice(0, 5).map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                      <div>
                        <p className="font-medium">{log.title}</p>
                        <p className="text-sm text-muted-foreground">{log.propertyName} • {log.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                        <Badge className={getPriorityColor(log.priority)}>{log.priority}</Badge>
                      </div>
                    </div>
                  ))}
                  {maintenanceLogs.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No recent maintenance requests</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="under_renovation">Under Renovation</SelectItem>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                  <SelectItem value="for_rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single_family">Single Family</SelectItem>
                  <SelectItem value="multi_family">Multi Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property: any) => (
                <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProperty(property.id)}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{property.propertyName}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.city}, {property.state}
                          </p>
                        </div>
                        <Badge className={getStatusColor(property.status)}>{property.status?.replace(/_/g, " ")}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{property.propertyType?.replace(/_/g, " ")}</span>
                        <span className="font-semibold">{formatCurrency(property.currentValue)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {property.bedrooms && <span>{property.bedrooms} bed</span>}
                        {property.bathrooms && <span>{property.bathrooms} bath</span>}
                        {property.squareFootage && <span>{property.squareFootage.toLocaleString()} sqft</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {properties.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No properties found</h3>
                <p className="text-muted-foreground">Add your first property to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Projects</h3>
            </div>
            <div className="space-y-3">
              {projects.map((project: any) => (
                <Card key={project.id} className="cursor-pointer hover:bg-accent/50" onClick={() => {
                  setSelectedProperty(project.propertyId);
                  setSelectedProject(project.id);
                }}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{project.projectName}</h4>
                        <p className="text-sm text-muted-foreground">{project.propertyName} • {project.projectType?.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(project.status)}>{project.status?.replace(/_/g, " ")}</Badge>
                        <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                        {project.estimatedBudget && (
                          <span className="text-sm font-medium">{formatCurrency(project.estimatedBudget)}</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projects.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No projects found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Maintenance Requests</h3>
              <Button onClick={() => setShowAddMaintenance(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
            <div className="space-y-3">
              {maintenanceLogs.map((log: any) => (
                <Card key={log.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{log.title}</h4>
                        <p className="text-sm text-muted-foreground">{log.propertyName} • {log.category} • {log.maintenanceType}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                        <Badge className={getPriorityColor(log.priority)}>{log.priority}</Badge>
                        {log.estimatedCost && <span className="text-sm font-medium">{formatCurrency(log.estimatedCost)}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {maintenanceLogs.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No maintenance requests</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Tenants</h3>
            </div>
            <div className="space-y-3">
              {tenants.map((tenant: any) => (
                <Card key={tenant.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {tenant.tenantType === "business" ? tenant.businessName : `${tenant.firstName} ${tenant.lastName}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">{tenant.propertyName} • {tenant.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(tenant.status)}>{tenant.status}</Badge>
                        <span className="text-sm font-medium">{formatCurrency(tenant.monthlyRent)}/mo</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {tenants.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No tenants found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Vendors & Service Providers</h3>
              <Button onClick={() => setShowAddVendor(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor: any) => (
                <Card key={vendor.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{vendor.vendorName}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{vendor.vendorType?.replace(/_/g, " ")}</p>
                        </div>
                        <Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge>
                      </div>
                      {vendor.contactName && <p className="text-sm">{vendor.contactName}</p>}
                      {vendor.phone && <p className="text-sm text-muted-foreground">{vendor.phone}</p>}
                      {vendor.email && <p className="text-sm text-muted-foreground">{vendor.email}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {vendors.length === 0 && (
                <p className="text-muted-foreground text-center py-8 col-span-3">No vendors found</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Property Dialog */}
      <AddPropertyDialog
        open={showAddProperty}
        onClose={() => setShowAddProperty(false)}
        onSubmit={(data: any) => createPropertyMutation.mutate(data)}
        isLoading={createPropertyMutation.isPending}
      />

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        open={showAddVendor}
        onClose={() => setShowAddVendor(false)}
        onSubmit={(data: any) => createVendorMutation.mutate(data)}
        isLoading={createVendorMutation.isPending}
      />

      {/* Add Maintenance Dialog (for all properties) */}
      <AddMaintenanceDialog
        open={showAddMaintenance && !selectedProperty}
        onClose={() => setShowAddMaintenance(false)}
        propertyId={null}
        properties={properties}
        onSubmit={(data: any) => createMaintenanceMutation.mutate(data)}
        isLoading={createMaintenanceMutation.isPending}
      />
    </DashboardLayout>
  );
}

// Property Financials Component
function PropertyFinancials({ propertyId }: { propertyId: number }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const financialsQuery = trpc.propertyManagement.getFinancialSummary.useQuery({ propertyId, year });
  const recordMutation = trpc.propertyManagement.recordFinancialEntry.useMutation({
    onSuccess: () => {
      toast.success("Financials recorded");
      financialsQuery.refetch();
    },
  });

  const data = financialsQuery.data;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Financial Summary - {year}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setYear(year - 1)}>Previous Year</Button>
          <Button variant="outline" size="sm" onClick={() => setYear(year + 1)} disabled={year >= new Date().getFullYear()}>Next Year</Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">YTD Income</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(data.totalIncome)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">YTD Expenses</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">YTD NOI</p>
                <p className="text-xl font-bold">{formatCurrency(data.netIncome)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">YTD Cash Flow</p>
                <p className={`text-xl font-bold ${data.netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(data.netIncome)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Month</th>
                      <th className="text-right py-2">Income</th>
                      <th className="text-right py-2">Expenses</th>
                      <th className="text-right py-2">NOI</th>
                      <th className="text-right py-2">Cash Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((month, idx) => {
                      // Monthly data not available in current API - showing placeholder
                      return (
                        <tr key={month} className="border-b">
                          <td className="py-2">{month}</td>
                          <td className="text-right text-green-600">{formatCurrency(0)}</td>
                          <td className="text-right text-red-600">{formatCurrency(0)}</td>
                          <td className="text-right">{formatCurrency(0)}</td>
                          <td className="text-right text-muted-foreground">
                            {formatCurrency(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Add Property Dialog
function AddPropertyDialog({ open, onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    propertyName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "single_family",
    status: "active",
    yearBuilt: "",
    squareFootage: "",
    bedrooms: "",
    bathrooms: "",
    purchasePrice: "",
    currentValue: "",
  });

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
      squareFootage: formData.squareFootage ? parseInt(formData.squareFootage) : undefined,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
      currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Property Name</Label>
            <Input value={formData.propertyName} onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })} placeholder="e.g., Main Street House" />
          </div>
          <div className="col-span-2">
            <Label>Street Address</Label>
            <Input value={formData.streetAddress} onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })} placeholder="123 Main St" />
          </div>
          <div>
            <Label>City</Label>
            <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="TX" />
          </div>
          <div>
            <Label>ZIP Code</Label>
            <Input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} />
          </div>
          <div>
            <Label>Property Type</Label>
            <Select value={formData.propertyType} onValueChange={(v) => setFormData({ ...formData, propertyType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="multi_family">Multi Family</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="mixed_use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="under_renovation">Under Renovation</SelectItem>
                <SelectItem value="for_sale">For Sale</SelectItem>
                <SelectItem value="for_rent">For Rent</SelectItem>
                <SelectItem value="pending_acquisition">Pending Acquisition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Year Built</Label>
            <Input type="number" value={formData.yearBuilt} onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })} />
          </div>
          <div>
            <Label>Square Footage</Label>
            <Input type="number" value={formData.squareFootage} onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })} />
          </div>
          <div>
            <Label>Bedrooms</Label>
            <Input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} />
          </div>
          <div>
            <Label>Bathrooms</Label>
            <Input type="number" step="0.5" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} />
          </div>
          <div>
            <Label>Purchase Price</Label>
            <Input type="number" value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} />
          </div>
          <div>
            <Label>Current Value</Label>
            <Input type="number" value={formData.currentValue} onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.propertyName || !formData.streetAddress}>
            {isLoading ? "Creating..." : "Create Property"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Project Dialog
function AddProjectDialog({ open, onClose, propertyId, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "renovation",
    description: "",
    status: "planning",
    priority: "medium",
    plannedStartDate: "",
    plannedEndDate: "",
    estimatedBudget: "",
    contractorName: "",
  });

  const handleSubmit = () => {
    onSubmit({
      propertyId,
      ...formData,
      estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Project Name</Label>
            <Input value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="e.g., Kitchen Renovation" />
          </div>
          <div>
            <Label>Project Type</Label>
            <Select value={formData.projectType} onValueChange={(v) => setFormData({ ...formData, projectType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="renovation">Renovation</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="addition">Addition</SelectItem>
                <SelectItem value="landscaping">Landscaping</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Planned Start</Label>
              <Input type="date" value={formData.plannedStartDate} onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })} />
            </div>
            <div>
              <Label>Planned End</Label>
              <Input type="date" value={formData.plannedEndDate} onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Estimated Budget</Label>
            <Input type="number" value={formData.estimatedBudget} onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })} />
          </div>
          <div>
            <Label>Contractor Name</Label>
            <Input value={formData.contractorName} onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.projectName}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Tenant Dialog
function AddTenantDialog({ open, onClose, propertyId, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    tenantType: "individual",
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    monthlyRent: "",
    securityDeposit: "",
    leaseStartDate: "",
    leaseEndDate: "",
    leaseType: "annual",
  });

  const handleSubmit = () => {
    onSubmit({
      propertyId,
      ...formData,
      monthlyRent: formData.monthlyRent ? parseFloat(formData.monthlyRent) : undefined,
      securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tenant Type</Label>
            <Select value={formData.tenantType} onValueChange={(v) => setFormData({ ...formData, tenantType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.tenantType === "business" ? (
            <div>
              <Label>Business Name</Label>
              <Input value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monthly Rent</Label>
              <Input type="number" value={formData.monthlyRent} onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })} />
            </div>
            <div>
              <Label>Security Deposit</Label>
              <Input type="number" value={formData.securityDeposit} onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lease Start</Label>
              <Input type="date" value={formData.leaseStartDate} onChange={(e) => setFormData({ ...formData, leaseStartDate: e.target.value })} />
            </div>
            <div>
              <Label>Lease End</Label>
              <Input type="date" value={formData.leaseEndDate} onChange={(e) => setFormData({ ...formData, leaseEndDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Lease Type</Label>
            <Select value={formData.leaseType} onValueChange={(v) => setFormData({ ...formData, leaseType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="month_to_month">Month to Month</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="multi_year">Multi-Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Tenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Maintenance Dialog
function AddMaintenanceDialog({ open, onClose, propertyId, properties, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    propertyId: propertyId || "",
    maintenanceType: "corrective",
    category: "other",
    title: "",
    description: "",
    reportedDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    estimatedCost: "",
  });

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      propertyId: parseInt(formData.propertyId),
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Maintenance Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!propertyId && properties && (
            <div>
              <Label>Property</Label>
              <Select value={formData.propertyId ? formData.propertyId.toString() : ""} onValueChange={(v) => setFormData({ ...formData, propertyId: v })}>
                <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>
                  {(properties || []).map((p: any) => (
                    <SelectItem key={p.id} value={p.id?.toString() || ""}>{p.propertyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Leaky faucet in bathroom" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={formData.maintenanceType} onValueChange={(v) => setFormData({ ...formData, maintenanceType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="roofing">Roofing</SelectItem>
                  <SelectItem value="flooring">Flooring</SelectItem>
                  <SelectItem value="appliances">Appliances</SelectItem>
                  <SelectItem value="exterior">Exterior</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="pest_control">Pest Control</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Cost</Label>
              <Input type="number" value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.title || (!propertyId && !formData.propertyId)}>
            {isLoading ? "Creating..." : "Create Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Vendor Dialog
function AddVendorDialog({ open, onClose, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorType: "contractor",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    licenseNumber: "",
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Vendor/Company Name</Label>
            <Input value={formData.vendorName} onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })} />
          </div>
          <div>
            <Label>Vendor Type</Label>
            <Select value={formData.vendorType} onValueChange={(v) => setFormData({ ...formData, vendorType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="contractor">General Contractor</SelectItem>
                <SelectItem value="plumber">Plumber</SelectItem>
                <SelectItem value="electrician">Electrician</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="landscaper">Landscaper</SelectItem>
                <SelectItem value="cleaner">Cleaner</SelectItem>
                <SelectItem value="property_manager">Property Manager</SelectItem>
                <SelectItem value="inspector">Inspector</SelectItem>
                <SelectItem value="appraiser">Appraiser</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Contact Name</Label>
            <Input value={formData.contactName} onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
            </div>
            <div>
              <Label>ZIP</Label>
              <Input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>License Number</Label>
            <Input value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.vendorName}>
            {isLoading ? "Adding..." : "Add Vendor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
