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
import { 
  Users, Briefcase, DollarSign, FileText, Plus, Loader2, Clock, UserPlus, 
  Calendar, Mail, Phone, Edit, GraduationCap, Building2, ArrowRight, 
  CheckCircle2, Shield, BookOpen, ChevronRight
} from "lucide-react";
import { Link } from "wouter";

export default function PositionManagement() {
  const [activeTab, setActiveTab] = useState("positions");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showPayrollDialog, setShowPayrollDialog] = useState(false);
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false);
  const [showHireCoordinatorDialog, setShowHireCoordinatorDialog] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [editEmployeeData, setEditEmployeeData] = useState({ positionHolderId: 0, name: "", email: "", phone: "", address: "" });

  const { data: positions, isLoading, refetch: refetchPositions } = trpc.positionManagement.getPositionsByEntity.useQuery({ businessEntityId: 1 });
  const { data: dashboard } = trpc.positionManagement.getDashboard.useQuery();
  const { data: payrollData2, refetch: refetchPayroll } = trpc.positionManagement.getAllPayrollRecords.useQuery({ businessEntityId: 1 });
  const { data: coordinatorPositions, isLoading: loadingCoordinators, refetch: refetchCoordinators } = trpc.positionManagement.getCoordinatorPositions.useQuery();

  const positionTypes = [
    { type: "w2_employee", name: "W-2 Employee" },
    { type: "w2_officer", name: "W-2 Officer" },
    { type: "1099_contractor", name: "1099 Contractor" },
    { type: "k1_member", name: "K-1 Member" },
    { type: "volunteer", name: "Volunteer" },
    { type: "board_member", name: "Board Member" },
  ];

  const createPositionMutation = trpc.positionManagement.createPosition.useMutation({
    onSuccess: () => { toast.success("Position created"); refetchPositions(); refetchCoordinators(); setShowCreateDialog(false); },
    onError: (error: any) => toast.error(error.message),
  });

  const assignEmployeeMutation = trpc.positionManagement.assignEmployee.useMutation({
    onSuccess: () => { toast.success("Employee assigned"); refetchPositions(); setShowAssignDialog(false); },
    onError: (error: any) => toast.error(error.message),
  });

  const recordPayrollMutation = trpc.positionManagement.recordPayroll.useMutation({
    onSuccess: () => { toast.success("Payroll recorded"); refetchPayroll(); setShowPayrollDialog(false); },
    onError: (error: any) => toast.error(error.message),
  });

  const updateEmployeeMutation = trpc.positionManagement.updateEmployee.useMutation({
    onSuccess: () => { toast.success("Employee updated"); refetchPositions(); setShowEditEmployeeDialog(false); },
    onError: (error: any) => toast.error(error.message),
  });

  const hireCoordinatorMutation = trpc.positionManagement.hireCoordinator.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowHireCoordinatorDialog(false);
      refetchPositions();
      refetchCoordinators();
      setHireData({ positionId: 0, fullName: "", email: "", phone: "", departmentId: "", startDate: new Date().toISOString().split("T")[0] });
    },
    onError: (error: any) => toast.error(error.message),
  });

  const [positionData, setPositionData] = useState({ businessEntityId: 1, title: "", classificationType: "w2_employee" as const, compensationType: "salary" as const, salaryAmount: 0, description: "" });
  const [assignData, setAssignData] = useState({ positionId: 0, fullName: "", email: "", relationshipType: "employee" as const, startDate: new Date().toISOString().split("T")[0] });
  const [payrollData, setPayrollData] = useState({ positionHolderId: 0, payPeriodStart: "", payPeriodEnd: "", payDate: new Date().toISOString().split("T")[0], regularHours: 0, overtimeHours: 0, bonusPay: 0, commissionPay: 0 });
  const [hireData, setHireData] = useState({ positionId: 0, fullName: "", email: "", phone: "", departmentId: "", startDate: new Date().toISOString().split("T")[0] });

  const handleCreatePosition = () => { createPositionMutation.mutate(positionData); };
  const handleAssignEmployee = () => { assignEmployeeMutation.mutate(assignData); };
  const handleRecordPayroll = () => { recordPayrollMutation.mutate(payrollData); };
  const handleUpdateEmployee = () => { updateEmployeeMutation.mutate(editEmployeeData); };
  const handleHireCoordinator = () => {
    if (!hireData.fullName || !hireData.email || !hireData.departmentId) {
      toast.error("Please fill in all required fields");
      return;
    }
    hireCoordinatorMutation.mutate(hireData);
  };

  const openAssignDialog = (position: any) => { setSelectedPosition(position); setAssignData({ ...assignData, positionId: Number(position.id) }); setShowAssignDialog(true); };
  const openPayrollDialog = (position: any) => { setSelectedPosition(position); setPayrollData({ ...payrollData, positionHolderId: Number(position.assignedEmployee?.id || 0) }); setShowPayrollDialog(true); };
  const openEditEmployeeDialog = (position: any) => { setSelectedPosition(position); setEditEmployeeData({ positionHolderId: Number(position.assignedEmployee?.id || 0), name: position.assignedEmployee?.name || "", email: position.assignedEmployee?.email || "", phone: position.assignedEmployee?.phone || "", address: position.assignedEmployee?.address || "" }); setShowEditEmployeeDialog(true); };
  const openHireCoordinatorDialog = (position: any) => {
    setSelectedPosition(position);
    setHireData({
      positionId: Number(position.id),
      fullName: "",
      email: "",
      phone: "",
      departmentId: position.departmentMatch?.departmentId || "",
      startDate: new Date().toISOString().split("T")[0],
    });
    setShowHireCoordinatorDialog(true);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "w2_employee": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">W-2 Employee</Badge>;
      case "1099_contractor": return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">1099 Contractor</Badge>;
      case "officer": case "w2_officer": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Officer</Badge>;
      case "board_member": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Board Member</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (<DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>);
  }

  const filledPositions = positions?.filter((p: any) => p.status === "filled") || [];
  const openPositions = positions?.filter((p: any) => p.status === "open") || [];
  const payrollRecords = payrollData2?.records || [];
  const totalPayroll = payrollRecords.reduce((sum: number, r: any) => sum + parseFloat(r.grossPay || "0"), 0);
  const coordinatorCount = coordinatorPositions?.filter((p: any) => p.isCoordinator) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Position Management</h1>
            <p className="text-muted-foreground">Manage positions, employees, coordinators, and payroll</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" />Create Position</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Position</DialogTitle><DialogDescription>Define a new position for your business</DialogDescription></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2"><Label>Position Title</Label><Input value={positionData.title} onChange={(e) => setPositionData({ ...positionData, title: e.target.value })} placeholder="e.g., Operations Coordinator" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Position Type</Label>
                    <Select value={positionData.classificationType} onValueChange={(v: any) => setPositionData({ ...positionData, classificationType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {positionTypes.map((type) => (<SelectItem key={type.type} value={type.type}>{type.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Compensation Type</Label>
                    <Select value={positionData.compensationType} onValueChange={(v: any) => setPositionData({ ...positionData, compensationType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="stipend">Stipend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Salary Amount</Label><Input type="number" value={positionData.salaryAmount} onChange={(e) => setPositionData({ ...positionData, salaryAmount: parseFloat(e.target.value) || 0 })} placeholder="0.00" /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={positionData.description} onChange={(e) => setPositionData({ ...positionData, description: e.target.value })} placeholder="Position responsibilities and requirements" rows={3} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreatePosition} disabled={createPositionMutation.isPending}>{createPositionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Position</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-primary/10"><Briefcase className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">Total Positions</p><p className="text-2xl font-bold">{positions?.length || 0}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-green-500/10"><Users className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Filled</p><p className="text-2xl font-bold">{filledPositions.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-amber-500/10"><Clock className="w-6 h-6 text-amber-600" /></div><div><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold">{openPositions.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-indigo-500/10"><GraduationCap className="w-6 h-6 text-indigo-600" /></div><div><p className="text-sm text-muted-foreground">Coordinator Openings</p><p className="text-2xl font-bold">{coordinatorCount.length}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-lg bg-blue-500/10"><DollarSign className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">YTD Payroll</p><p className="text-2xl font-bold">${totalPayroll.toLocaleString()}</p></div></div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="coordinators">
              Coordinators
              {coordinatorCount.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{coordinatorCount.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-4 mt-4">
            {positions && positions.length > 0 ? (
              <div className="grid gap-4">
                {positions.map((position: any) => (
                  <Card key={position.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10"><Briefcase className="w-6 h-6 text-primary" /></div>
                          <div>
                            <h3 className="font-semibold">{position.title}</h3>
                            <p className="text-sm text-muted-foreground">{position.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              {getTypeBadge(position.classificationType || position.positionType)}
                              <span className="text-sm">${(position.salaryAmount || position.compensationAmount || 0).toLocaleString()} / {position.compensationType}</span>
                              {position.department && (
                                <Badge variant="outline" className="gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {position.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={position.status === "filled" ? "default" : "outline"}>{position.status}</Badge>
                          {position.status === "open" && (<Button size="sm" onClick={() => openAssignDialog(position)}><UserPlus className="w-4 h-4 mr-1" />Assign</Button>)}
                          {position.status === "filled" && (<Button size="sm" variant="outline" onClick={() => openPayrollDialog(position)}><DollarSign className="w-4 h-4 mr-1" />Payroll</Button>)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card><CardContent className="py-12"><div className="text-center space-y-4"><Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50" /><div><h3 className="font-semibold">No Positions</h3><p className="text-sm text-muted-foreground mt-1">Create positions for your business entities</p></div><Button onClick={() => setShowCreateDialog(true)}>Create First Position</Button></div></CardContent></Card>
            )}
          </TabsContent>

          {/* Coordinators Tab - NEW */}
          <TabsContent value="coordinators" className="space-y-4 mt-4">
            {/* Coordinator Role Explanation */}
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Coordinator Hiring Pipeline</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Coordinators are the primary external hire positions. Each Coordinator is hired into a specific department 
                      and assigned the department's training path. After completing training and certification, Coordinators 
                      progress toward Manager roles when the initial Managers transition to contractors.
                    </p>
                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>Hired as W-2 Employee</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span>Department Training</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span>Certification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span>Manager Track</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loadingCoordinators ? (
              <Card><CardContent className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></CardContent></Card>
            ) : coordinatorPositions && coordinatorPositions.length > 0 ? (
              <div className="grid gap-4">
                {coordinatorPositions.map((position: any) => (
                  <Card key={position.id} className={position.isCoordinator ? "border-indigo-200 dark:border-indigo-800" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${position.isCoordinator ? "bg-indigo-500/10" : "bg-primary/10"}`}>
                            {position.isCoordinator ? (
                              <GraduationCap className="w-6 h-6 text-indigo-600" />
                            ) : (
                              <Briefcase className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{position.title}</h3>
                              {position.isCoordinator && (
                                <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-xs">
                                  Coordinator
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                            
                            {/* Department Match Info */}
                            {position.departmentMatch ? (
                              <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-sm">{position.departmentMatch.departmentName} Department</span>
                                  <span className="text-xs text-muted-foreground">({position.departmentMatch.entity})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Shield className="w-3 h-3" />
                                  <span>Reports to: {position.departmentMatch.manager.name} ({position.departmentMatch.manager.title})</span>
                                </div>
                                {position.departmentMatch.trainingPath.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Required Training:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {position.departmentMatch.trainingPath.map((training: any, idx: number) => (
                                        <Link key={idx} href={training.route}>
                                          <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-primary/10">
                                            <BookOpen className="w-3 h-3" />
                                            {training.label}
                                            <ChevronRight className="w-3 h-3" />
                                          </Badge>
                                        </Link>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                  No department match found in registry. Set the department field to link to training path.
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-2">
                              {getTypeBadge(position.classificationType)}
                              <span className="text-sm">${(position.salaryAmount || 0).toLocaleString()} / {position.compensationType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">Open</Badge>
                          <Button 
                            size="sm" 
                            onClick={() => openHireCoordinatorDialog(position)}
                            className="gap-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            Hire Coordinator
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <div>
                      <h3 className="font-semibold">No Open Coordinator Positions</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create coordinator positions or check the <Link href="/careers" className="text-primary underline">Careers page</Link> for the full position listing
                      </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>Create Coordinator Position</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4 mt-4">
            {filledPositions.length > 0 ? (
              <div className="grid gap-4">
                {filledPositions.map((position: any) => (
                  <Card key={position.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-green-500/10"><Users className="w-6 h-6 text-green-600" /></div>
                          <div>
                            <h3 className="font-semibold">{position.assignedEmployee?.name || "Employee"}</h3>
                            <p className="text-sm text-muted-foreground">{position.title}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Started: {position.assignedEmployee?.startDate ? new Date(position.assignedEmployee.startDate).toLocaleDateString() : "N/A"}</span>
                              {position.assignedEmployee?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{position.assignedEmployee.email}</span>}
                              {position.assignedEmployee?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{position.assignedEmployee.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(position.classificationType || position.positionType)}
                          <Button variant="outline" size="sm" onClick={() => openEditEmployeeDialog(position)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card><CardContent className="py-12"><div className="text-center space-y-4"><Users className="w-12 h-12 mx-auto text-muted-foreground/50" /><div><h3 className="font-semibold">No Employees</h3><p className="text-sm text-muted-foreground mt-1">Assign employees to open positions</p></div></div></CardContent></Card>
            )}
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4 mt-4">
            <Card><CardHeader><CardTitle>Payroll Records</CardTitle><CardDescription>Recent payroll transactions</CardDescription></CardHeader>
              <CardContent>
                {payrollRecords && payrollRecords.length > 0 ? (
                  <div className="space-y-3">
                    {payrollRecords.map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <h4 className="font-medium">{record.employeeName}</h4>
                          <p className="text-sm text-muted-foreground">{new Date(record.payPeriodStart).toLocaleDateString()} - {new Date(record.payPeriodEnd).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${record.netPay?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Gross: ${record.grossPay?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (<p className="text-center text-muted-foreground py-8">No payroll records yet</p>)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card><CardHeader><CardTitle>Employment Documents</CardTitle><CardDescription>Tax forms and employment agreements</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2"><FileText className="w-6 h-6" /><span className="text-sm">W-4 Forms</span></Button>
                  <Button variant="outline" className="h-24 flex-col gap-2"><FileText className="w-6 h-6" /><span className="text-sm">I-9 Forms</span></Button>
                  <Button variant="outline" className="h-24 flex-col gap-2"><FileText className="w-6 h-6" /><span className="text-sm">W-2 Forms</span></Button>
                  <Button variant="outline" className="h-24 flex-col gap-2"><FileText className="w-6 h-6" /><span className="text-sm">1099 Forms</span></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assign Employee Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Assign Employee</DialogTitle><DialogDescription>Assign an employee to {selectedPosition?.title}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={assignData.fullName} onChange={(e) => setAssignData({ ...assignData, fullName: e.target.value })} placeholder="Full name" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={assignData.email} onChange={(e) => setAssignData({ ...assignData, email: e.target.value })} placeholder="employee@email.com" /></div>
              <div className="space-y-2"><Label>Relationship Type</Label>
                <Select value={assignData.relationshipType} onValueChange={(v: any) => setAssignData({ ...assignData, relationshipType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="family_blood">Family (Blood)</SelectItem>
                    <SelectItem value="family_marriage">Family (Marriage)</SelectItem>
                    <SelectItem value="family_adopted">Family (Adopted)</SelectItem>
                    <SelectItem value="close_friend">Close Friend</SelectItem>
                    <SelectItem value="business_partner">Business Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={assignData.startDate} onChange={(e) => setAssignData({ ...assignData, startDate: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
              <Button onClick={handleAssignEmployee} disabled={assignEmployeeMutation.isPending}>{assignEmployeeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Assign Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payroll Dialog */}
        <Dialog open={showPayrollDialog} onOpenChange={setShowPayrollDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payroll</DialogTitle><DialogDescription>Record payroll for {selectedPosition?.fullName || selectedPosition?.title}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Pay Period Start</Label><Input type="date" value={payrollData.payPeriodStart} onChange={(e) => setPayrollData({ ...payrollData, payPeriodStart: e.target.value })} /></div>
                <div className="space-y-2"><Label>Pay Period End</Label><Input type="date" value={payrollData.payPeriodEnd} onChange={(e) => setPayrollData({ ...payrollData, payPeriodEnd: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Pay Date</Label><Input type="date" value={payrollData.payDate} onChange={(e) => setPayrollData({ ...payrollData, payDate: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Regular Hours</Label><Input type="number" value={payrollData.regularHours} onChange={(e) => setPayrollData({ ...payrollData, regularHours: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Overtime Hours</Label><Input type="number" value={payrollData.overtimeHours} onChange={(e) => setPayrollData({ ...payrollData, overtimeHours: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bonus Pay</Label><Input type="number" value={payrollData.bonusPay} onChange={(e) => setPayrollData({ ...payrollData, bonusPay: parseFloat(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Commission Pay</Label><Input type="number" value={payrollData.commissionPay} onChange={(e) => setPayrollData({ ...payrollData, commissionPay: parseFloat(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayrollDialog(false)}>Cancel</Button>
              <Button onClick={handleRecordPayroll} disabled={recordPayrollMutation.isPending}>{recordPayrollMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Record Payroll</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={showEditEmployeeDialog} onOpenChange={setShowEditEmployeeDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Employee Details</DialogTitle><DialogDescription>Update contact information for {editEmployeeData.name}</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={editEmployeeData.name} onChange={(e) => setEditEmployeeData({ ...editEmployeeData, name: e.target.value })} placeholder="Full name" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={editEmployeeData.email} onChange={(e) => setEditEmployeeData({ ...editEmployeeData, email: e.target.value })} placeholder="employee@email.com" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input type="tel" value={editEmployeeData.phone} onChange={(e) => setEditEmployeeData({ ...editEmployeeData, phone: e.target.value })} placeholder="(555) 123-4567" /></div>
              <div className="space-y-2"><Label>Address</Label><Textarea value={editEmployeeData.address} onChange={(e) => setEditEmployeeData({ ...editEmployeeData, address: e.target.value })} placeholder="Street address, city, state, zip" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditEmployeeDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateEmployee} disabled={updateEmployeeMutation.isPending}>{updateEmployeeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hire Coordinator Dialog - NEW */}
        <Dialog open={showHireCoordinatorDialog} onOpenChange={setShowHireCoordinatorDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Hire Coordinator
              </DialogTitle>
              <DialogDescription>
                Hire a coordinator for {selectedPosition?.title}
                {selectedPosition?.departmentMatch && (
                  <span> in the <strong>{selectedPosition.departmentMatch.departmentName}</strong> department</span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Department Match Info */}
              {selectedPosition?.departmentMatch && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-sm">{selectedPosition.departmentMatch.departmentName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reports to: {selectedPosition.departmentMatch.manager.name} ({selectedPosition.departmentMatch.manager.title})
                  </p>
                  {selectedPosition.departmentMatch.trainingPath.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Training Path:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPosition.departmentMatch.trainingPath.map((t: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs gap-1">
                            <BookOpen className="w-3 h-3" />
                            {t.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input 
                  value={hireData.fullName} 
                  onChange={(e) => setHireData({ ...hireData, fullName: e.target.value })} 
                  placeholder="Full name" 
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  value={hireData.email} 
                  onChange={(e) => setHireData({ ...hireData, email: e.target.value })} 
                  placeholder="coordinator@email.com" 
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  type="tel" 
                  value={hireData.phone} 
                  onChange={(e) => setHireData({ ...hireData, phone: e.target.value })} 
                  placeholder="(555) 123-4567" 
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input 
                  type="date" 
                  value={hireData.startDate} 
                  onChange={(e) => setHireData({ ...hireData, startDate: e.target.value })} 
                />
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">After Hiring</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Position will be marked as filled
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Coordinator assigned to department training path
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Onboarding checklist auto-generated
                  </li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHireCoordinatorDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleHireCoordinator} 
                disabled={hireCoordinatorMutation.isPending}
                className="gap-2"
              >
                {hireCoordinatorMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <UserPlus className="w-4 h-4" />
                Hire Coordinator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
