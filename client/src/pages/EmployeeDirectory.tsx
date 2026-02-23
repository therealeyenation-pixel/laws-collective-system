import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  Linkedin,
  UserCircle,
  BarChart3,
  Network,
  Filter,
  X,
  Loader2
} from "lucide-react";

const POSITION_LEVELS = [
  { value: "executive", label: "Executive", color: "bg-purple-500" },
  { value: "manager", label: "Manager", color: "bg-blue-500" },
  { value: "lead", label: "Lead", color: "bg-cyan-500" },
  { value: "coordinator", label: "Coordinator", color: "bg-green-500" },
  { value: "specialist", label: "Specialist", color: "bg-amber-500" },
  { value: "intern", label: "Intern", color: "bg-gray-500" },
];

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
];

const WORK_LOCATIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on_site", label: "On-Site" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-green-500" },
  { value: "on_leave", label: "On Leave", color: "bg-amber-500" },
  { value: "terminated", label: "Terminated", color: "bg-red-500" },
  { value: "pending", label: "Pending", color: "bg-gray-500" },
];

const WORKER_TYPES = [
  { value: "employee", label: "Employee", color: "bg-blue-500" },
  { value: "contractor", label: "Contractor", color: "bg-orange-500" },
  { value: "volunteer", label: "Volunteer", color: "bg-purple-500" },
];

export default function EmployeeDirectory() {
  const searchParams = useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  // Handle URL department parameter
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const deptParam = params.get("department");
    if (deptParam) {
      // Capitalize first letter for display matching
      const formattedDept = deptParam.charAt(0).toUpperCase() + deptParam.slice(1).toLowerCase();
      setSelectedDepartment(formattedDept);
    }
  }, [searchParams]);
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [selectedWorkerType, setSelectedWorkerType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("directory");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    preferredName: "",
    email: "",
    phone: "",
    entityId: "",
    department: "",
    jobTitle: "",
    positionLevel: "coordinator" as const,
    employmentType: "full_time" as const,
    workLocation: "remote" as const,
    startDate: "",
    bio: "",
    avatarUrl: "",
    linkedinUrl: "",
    status: "active" as const,
  });

  // Queries
  const { data: employees, isLoading, refetch } = trpc.employees.getAll.useQuery({
    entityId: selectedEntity !== "all" ? parseInt(selectedEntity) : undefined,
    department: selectedDepartment !== "all" ? selectedDepartment : undefined,
    status: selectedStatus !== "all" ? selectedStatus as any : undefined,
    search: searchTerm || undefined,
  });

  const { data: stats } = trpc.employees.getStats.useQuery();
  const { data: departments } = trpc.employees.getDepartments.useQuery();
  const { data: entities } = trpc.companySetup.getAllEntities.useQuery();

  // Mutations
  const createMutation = trpc.employees.create.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add employee");
    },
  });

  const updateMutation = trpc.employees.update.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowEditDialog(false);
      setSelectedEmployee(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });

  const deleteMutation = trpc.employees.delete.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowDeleteDialog(false);
      setSelectedEmployee(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete employee");
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      preferredName: "",
      email: "",
      phone: "",
      entityId: "",
      department: "",
      jobTitle: "",
      positionLevel: "coordinator",
      employmentType: "full_time",
      workLocation: "remote",
      startDate: "",
      bio: "",
      avatarUrl: "",
      linkedinUrl: "",
      status: "active",
    });
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.entityId || !formData.department || !formData.jobTitle || !formData.startDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      ...formData,
      entityId: parseInt(formData.entityId),
      startDate: new Date(formData.startDate),
    });
  };

  const handleUpdate = () => {
    if (!selectedEmployee) return;

    updateMutation.mutate({
      id: selectedEmployee.id,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      preferredName: formData.preferredName || null,
      email: formData.email || undefined,
      phone: formData.phone || null,
      entityId: formData.entityId ? parseInt(formData.entityId) : undefined,
      department: formData.department || undefined,
      jobTitle: formData.jobTitle || undefined,
      positionLevel: formData.positionLevel,
      employmentType: formData.employmentType,
      workLocation: formData.workLocation,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      bio: formData.bio || null,
      avatarUrl: formData.avatarUrl || null,
      linkedinUrl: formData.linkedinUrl || null,
      status: formData.status,
    });
  };

  const openEditDialog = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      preferredName: employee.preferredName || "",
      email: employee.email,
      phone: employee.phone || "",
      entityId: employee.entityId.toString(),
      department: employee.department,
      jobTitle: employee.jobTitle,
      positionLevel: employee.positionLevel,
      employmentType: employee.employmentType,
      workLocation: employee.workLocation,
      startDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : "",
      bio: employee.bio || "",
      avatarUrl: employee.avatarUrl || "",
      linkedinUrl: employee.linkedinUrl || "",
      status: employee.status,
    });
    setShowEditDialog(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPositionColor = (level: string) => {
    return POSITION_LEVELS.find(p => p.value === level)?.color || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-500";
  };

  // Group employees by department for org chart
  const employeesByDepartment = useMemo(() => {
    if (!employees) return {};
    return employees.reduce((acc: Record<string, any[]>, emp) => {
      if (!acc[emp.department]) acc[emp.department] = [];
      acc[emp.department].push(emp);
      return acc;
    }, {});
  }, [employees]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
            <p className="text-muted-foreground mt-1">
              Manage team members across all entities
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
                </div>
                <UserCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold">{stats?.byDepartment?.length || 0}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entities</p>
                  <p className="text-2xl font-bold">{stats?.byEntity?.length || 0}</p>
                </div>
                <Network className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="directory" className="gap-2">
              <Users className="w-4 h-4" />
              Directory
            </TabsTrigger>
            <TabsTrigger value="org-chart" className="gap-2">
              <Network className="w-4 h-4" />
              Org Chart
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                      <SelectTrigger className="w-[180px]">
                        <Building2 className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Entities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entities</SelectItem>
                        {entities?.map((entity: { id: number; name: string }) => (
                          <SelectItem key={entity.id} value={entity.id.toString()}>
                            {entity.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[180px]">
                        <Briefcase className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments?.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedWorkerType} onValueChange={setSelectedWorkerType}>
                      <SelectTrigger className="w-[150px]">
                        <UserCircle className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Worker Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {WORKER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : employees?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Employees Found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm || selectedEntity !== "all" || selectedDepartment !== "all" 
                      ? "Try adjusting your filters"
                      : "Add your first team member to get started"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees?.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={employee.avatarUrl || undefined} />
                          <AvatarFallback className="text-lg">
                            {getInitials(employee.firstName, employee.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground truncate">
                                {employee.preferredName || employee.firstName} {employee.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {employee.jobTitle}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(employee)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary" className={`${getPositionColor(employee.positionLevel)} text-white text-xs`}>
                              {POSITION_LEVELS.find(p => p.value === employee.positionLevel)?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {employee.department}
                            </Badge>
                            {employee.workerType && employee.workerType !== "employee" && (
                              <Badge className={`${WORKER_TYPES.find(t => t.value === employee.workerType)?.color || "bg-gray-500"} text-white text-xs`}>
                                {WORKER_TYPES.find(t => t.value === employee.workerType)?.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span className="truncate">{employee.entityName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${employee.email}`} className="truncate hover:text-primary">
                            {employee.email}
                          </a>
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{WORK_LOCATIONS.find(w => w.value === employee.workLocation)?.label}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Started {new Date(employee.startDate).toLocaleDateString()}</span>
                        </div>
                        {employee.linkedinUrl && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-4 h-4 text-blue-600" />
                            <a 
                              href={employee.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <Badge className={`${getStatusColor(employee.status)} text-white`}>
                          {STATUS_OPTIONS.find(s => s.value === employee.status)?.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {EMPLOYMENT_TYPES.find(t => t.value === employee.employmentType)?.label}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Org Chart Tab */}
          <TabsContent value="org-chart" className="space-y-4">
            {Object.entries(employeesByDepartment).map(([department, deptEmployees]) => (
              <Card key={department}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    {department}
                  </CardTitle>
                  <CardDescription>{deptEmployees.length} team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {deptEmployees
                      .sort((a, b) => {
                        const levelOrder = ["executive", "manager", "lead", "coordinator", "specialist", "intern"];
                        return levelOrder.indexOf(a.positionLevel) - levelOrder.indexOf(b.positionLevel);
                      })
                      .map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <Avatar>
                            <AvatarImage src={emp.avatarUrl || undefined} />
                            <AvatarFallback>{getInitials(emp.firstName, emp.lastName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {emp.preferredName || emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{emp.jobTitle}</p>
                            <Badge className={`${getPositionColor(emp.positionLevel)} text-white text-xs mt-1`}>
                              {POSITION_LEVELS.find(p => p.value === emp.positionLevel)?.label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>By Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byDepartment?.map((dept) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <span className="text-sm">{dept.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(dept.count / (stats?.active || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{dept.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>By Entity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.byEntity?.map((entity) => (
                      <div key={entity.id} className="flex items-center justify-between">
                        <span className="text-sm truncate flex-1 mr-4">{entity.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(entity.count / (stats?.active || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{entity.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Employee Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Add a new team member to the organization
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name</Label>
                <Input
                  id="preferredName"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                  placeholder="Johnny"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entityId">Entity *</Label>
                <Select value={formData.entityId} onValueChange={(v) => setFormData({ ...formData, entityId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities?.map((entity: { id: number; name: string }) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Human Resources"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="HR Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="positionLevel">Position Level *</Label>
                <Select value={formData.positionLevel} onValueChange={(v: any) => setFormData({ ...formData, positionLevel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(v: any) => setFormData({ ...formData, employmentType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select value={formData.workLocation} onValueChange={(v: any) => setFormData({ ...formData, workLocation: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief description about the employee..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-preferredName">Preferred Name</Label>
                <Input
                  id="edit-preferredName"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entityId">Entity *</Label>
                <Select value={formData.entityId} onValueChange={(v) => setFormData({ ...formData, entityId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entities?.map((entity: { id: number; name: string }) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department *</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jobTitle">Job Title *</Label>
                <Input
                  id="edit-jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-positionLevel">Position Level *</Label>
                <Select value={formData.positionLevel} onValueChange={(v: any) => setFormData({ ...formData, positionLevel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employmentType">Employment Type</Label>
                <Select value={formData.employmentType} onValueChange={(v: any) => setFormData({ ...formData, employmentType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-workLocation">Work Location</Label>
                <Select value={formData.workLocation} onValueChange={(v: any) => setFormData({ ...formData, workLocation: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="edit-linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-avatarUrl">Avatar URL</Label>
                <Input
                  id="edit-avatarUrl"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setSelectedEmployee(null); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedEmployee?.firstName} {selectedEmployee?.lastName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedEmployee(null); }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedEmployee && deleteMutation.mutate({ id: selectedEmployee.id })}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
