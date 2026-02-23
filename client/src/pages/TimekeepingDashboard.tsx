import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ElectronicSignature } from "@/components/ElectronicSignature";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building2,
  Briefcase,
  Timer,
  ClipboardList,
  TrendingUp,
  Download,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";

export default function TimekeepingDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [showNewChargeCodeDialog, setShowNewChargeCodeDialog] = useState(false);
  const [showNewFundingSourceDialog, setShowNewFundingSourceDialog] = useState(false);
  const [showNewWorkerDialog, setShowNewWorkerDialog] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({ start: "", end: "" });
  const [timesheetFilter, setTimesheetFilter] = useState("all");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Form states
  const [newEntry, setNewEntry] = useState({
    workerId: "",
    chargeCodeId: "",
    entryDate: new Date().toISOString().split("T")[0],
    hoursWorked: "",
    description: "",
    isBillable: true,
  });
  
  const [newChargeCode, setNewChargeCode] = useState({
    code: "",
    name: "",
    description: "",
    fundingSourceId: "",
    budgetedHours: "",
    hourlyRate: "",
    isBillable: true,
  });
  
  const [newFundingSource, setNewFundingSource] = useState({
    name: "",
    code: "",
    type: "grant" as const,
    funderName: "",
    totalBudget: "",
    laborBudget: "",
    startDate: "",
    endDate: "",
  });
  
  const [newWorker, setNewWorker] = useState({
    firstName: "",
    lastName: "",
    email: "",
    workerType: "employee" as const,
    hourlyRate: "",
    standardHoursPerWeek: "40",
  });

  // Queries
  const { data: fundingSources = [], refetch: refetchFunding } = trpc.timekeeping.getFundingSources.useQuery();
  const { data: chargeCodes = [], refetch: refetchCodes } = trpc.timekeeping.getChargeCodes.useQuery({});
  const { data: workers = [], refetch: refetchWorkers } = trpc.timekeeping.getWorkers.useQuery({});
  const { data: timeEntries = [], refetch: refetchEntries } = trpc.timekeeping.getTimeEntries.useQuery({
    startDate: selectedDateRange.start || undefined,
    endDate: selectedDateRange.end || undefined,
  });
  const { data: timesheets = [], refetch: refetchTimesheets } = trpc.timekeeping.getTimesheets.useQuery({});

  // Mutations
  const createFundingSource = trpc.timekeeping.createFundingSource.useMutation({
    onSuccess: () => {
      toast.success("Funding source created");
      setShowNewFundingSourceDialog(false);
      refetchFunding();
      setNewFundingSource({ name: "", code: "", type: "grant", funderName: "", totalBudget: "", laborBudget: "", startDate: "", endDate: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const createChargeCode = trpc.timekeeping.createChargeCode.useMutation({
    onSuccess: () => {
      toast.success("Charge code created");
      setShowNewChargeCodeDialog(false);
      refetchCodes();
      setNewChargeCode({ code: "", name: "", description: "", fundingSourceId: "", budgetedHours: "", hourlyRate: "", isBillable: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const createWorker = trpc.timekeeping.createWorker.useMutation({
    onSuccess: () => {
      toast.success("Worker added");
      setShowNewWorkerDialog(false);
      refetchWorkers();
      setNewWorker({ firstName: "", lastName: "", email: "", workerType: "employee", hourlyRate: "", standardHoursPerWeek: "40" });
    },
    onError: (err) => toast.error(err.message),
  });

  const createTimeEntry = trpc.timekeeping.createTimeEntry.useMutation({
    onSuccess: () => {
      toast.success("Time entry recorded");
      setShowNewEntryDialog(false);
      refetchEntries();
      setNewEntry({ workerId: "", chargeCodeId: "", entryDate: new Date().toISOString().split("T")[0], hoursWorked: "", description: "", isBillable: true });
    },
    onError: (err) => toast.error(err.message),
  });

  // Sync workers from HR mutation
  const syncFromHR = trpc.timekeeping.syncAllFromHR.useMutation({
    onSuccess: (data) => {
      toast.success(`Synced ${data.created} new workers, updated ${data.updated} existing workers from HR`);
      refetchWorkers();
    },
    onError: (err) => toast.error(err.message),
  });

  const approveTimesheet = trpc.timekeeping.approveTimesheet.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.action === "approved" ? "Timesheet approved" : "Timesheet rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedTimesheetId(null);
      refetchTimesheets();
    },
    onError: (err) => toast.error(err.message),
  });

  // Calculate summary stats
  const totalHoursThisPeriod = timeEntries.reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
  const billableHours = timeEntries.filter(e => e.isBillable).reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
  const pendingApprovals = timesheets.filter(t => t.status === "submitted" || t.status === "pending_approval").length;
  const activeWorkers = workers.filter(w => w.status === "active").length;

  const handleCreateFundingSource = () => {
    if (!newFundingSource.name || !newFundingSource.code || !newFundingSource.type) {
      toast.error("Please fill in required fields");
      return;
    }
    createFundingSource.mutate(newFundingSource);
  };

  const handleCreateChargeCode = () => {
    if (!newChargeCode.code || !newChargeCode.name) {
      toast.error("Please fill in required fields");
      return;
    }
    createChargeCode.mutate({
      ...newChargeCode,
      fundingSourceId: newChargeCode.fundingSourceId ? parseInt(newChargeCode.fundingSourceId) : undefined,
    });
  };

  const handleCreateWorker = () => {
    if (!newWorker.firstName || !newWorker.lastName) {
      toast.error("Please fill in required fields");
      return;
    }
    createWorker.mutate(newWorker);
  };

  const handleApproveTimesheet = (timesheetId: number, action: "approved" | "rejected", comments?: string) => {
    approveTimesheet.mutate({
      timesheetId,
      action,
      comments,
    });
  };

  const handleCreateTimeEntry = () => {
    if (!newEntry.workerId || !newEntry.chargeCodeId || !newEntry.hoursWorked) {
      toast.error("Please fill in required fields");
      return;
    }
    createTimeEntry.mutate({
      workerId: parseInt(newEntry.workerId),
      chargeCodeId: parseInt(newEntry.chargeCodeId),
      entryDate: newEntry.entryDate,
      hoursWorked: newEntry.hoursWorked,
      description: newEntry.description,
      isBillable: newEntry.isBillable,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      draft: { variant: "outline", icon: <AlertCircle className="w-3 h-3" /> },
      submitted: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      pending_approval: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      approved: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
      processed: { variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
    };
    const config = variants[status] || variants.draft;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Timekeeping Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track hours by charge code for grant compliance and project cost allocation</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => syncFromHR.mutate()}
              disabled={syncFromHR.isPending}
            >
              {syncFromHR.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync from HR
            </Button>
            <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Log Time
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Time Entry</DialogTitle>
                  <DialogDescription>Record hours worked against a charge code</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Worker *</Label>
                    <Select value={newEntry.workerId} onValueChange={(v) => setNewEntry({ ...newEntry, workerId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((w) => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {w.firstName} {w.lastName} ({w.workerType})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Charge Code *</Label>
                    <Select value={newEntry.chargeCodeId} onValueChange={(v) => setNewEntry({ ...newEntry, chargeCodeId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge code" />
                      </SelectTrigger>
                      <SelectContent>
                        {chargeCodes.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.code} - {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={newEntry.entryDate}
                        onChange={(e) => setNewEntry({ ...newEntry, entryDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours *</Label>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        max="24"
                        placeholder="8.00"
                        value={newEntry.hoursWorked}
                        onChange={(e) => setNewEntry({ ...newEntry, hoursWorked: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="What did you work on?"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>Cancel</Button>
                  <Button onClick={handleCreateTimeEntry} disabled={createTimeEntry.isPending}>
                    {createTimeEntry.isPending ? "Saving..." : "Log Time"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Timer className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHoursThisPeriod.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billableHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">{totalHoursThisPeriod > 0 ? ((billableHours / totalHoursThisPeriod) * 100).toFixed(0) : 0}% of total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Timesheets awaiting review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeWorkers}</div>
              <p className="text-xs text-muted-foreground">Employees & contractors</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="entries">Time Entries</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="chargecodes">Charge Codes</TabsTrigger>
            <TabsTrigger value="funding">Funding Sources</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Time Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Time Entries</CardTitle>
                  <CardDescription>Latest logged hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timeEntries.slice(0, 5).map((entry) => {
                      const worker = workers.find(w => w.id === entry.workerId);
                      const code = chargeCodes.find(c => c.id === entry.chargeCodeId);
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div>
                            <p className="font-medium">{worker?.firstName} {worker?.lastName}</p>
                            <p className="text-sm text-muted-foreground">{code?.code} - {code?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{entry.hoursWorked} hrs</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.entryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {timeEntries.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No time entries yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hours by Charge Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hours by Charge Code</CardTitle>
                  <CardDescription>Distribution of logged hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chargeCodes.slice(0, 5).map((code) => {
                      const codeHours = timeEntries
                        .filter(e => e.chargeCodeId === code.id)
                        .reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
                      const percentage = totalHoursThisPeriod > 0 ? (codeHours / totalHoursThisPeriod) * 100 : 0;
                      return (
                        <div key={code.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{code.code} - {code.name}</span>
                            <span className="font-medium">{codeHours.toFixed(1)} hrs</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {chargeCodes.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No charge codes defined</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Time Entries Tab */}
          <TabsContent value="entries" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Time Entries</CardTitle>
                  <CardDescription>All logged hours by workers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start date"
                    value={selectedDateRange.start}
                    onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
                    className="w-40"
                  />
                  <Input
                    type="date"
                    placeholder="End date"
                    value={selectedDateRange.end}
                    onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
                    className="w-40"
                  />
                  <Button variant="outline" size="icon" onClick={() => refetchEntries()}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Worker</TableHead>
                      <TableHead>Charge Code</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => {
                      const worker = workers.find(w => w.id === entry.workerId);
                      const code = chargeCodes.find(c => c.id === entry.chargeCodeId);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                          <TableCell>{worker?.firstName} {worker?.lastName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{code?.code}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{entry.hoursWorked}</TableCell>
                          <TableCell>
                            {entry.isBillable ? (
                              <Badge variant="default">Yes</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {timeEntries.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No time entries found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timesheets Tab */}
          <TabsContent value="timesheets" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Timesheets</CardTitle>
                  <CardDescription>Weekly/bi-weekly timesheet submissions and approvals</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={timesheetFilter} onValueChange={setTimesheetFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Timesheets</SelectItem>
                      <SelectItem value="submitted">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Regular Hours</TableHead>
                      <TableHead>Overtime</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timesheets
                      .filter(ts => timesheetFilter === "all" || ts.status === timesheetFilter)
                      .map((ts) => {
                      const worker = workers.find(w => w.id === ts.workerId);
                      return (
                        <TableRow key={ts.id}>
                          <TableCell>{worker?.firstName} {worker?.lastName}</TableCell>
                          <TableCell>
                            {new Date(ts.periodStart).toLocaleDateString()} - {new Date(ts.periodEnd).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{ts.totalRegularHours}</TableCell>
                          <TableCell>{ts.totalOvertimeHours}</TableCell>
                          <TableCell>{ts.totalBillableHours}</TableCell>
                          <TableCell>{getStatusBadge(ts.status)}</TableCell>
                          <TableCell>
                            {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            {ts.status === "submitted" && (
                              <div className="flex gap-1 items-center">
                                <ElectronicSignature
                                  documentType="timesheet_approval"
                                  documentId={ts.id.toString()}
                                  documentTitle={`Timesheet for ${(ts as any).workerName || 'Worker'} - Week of ${ts.periodStart ? new Date(ts.periodStart).toLocaleDateString() : 'N/A'}`}
                                  onSigned={() => handleApproveTimesheet(ts.id, "approved")}
                                  buttonText="Sign & Approve"
                                  buttonSize="sm"
                                  legalText={`I certify that I have reviewed this timesheet for ${ts.totalRegularHours || 0} regular hours and ${ts.totalOvertimeHours || 0} overtime hours, and approve it for payroll processing.`}
                                />
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="gap-1"
                                  onClick={() => {
                                    setSelectedTimesheetId(ts.id);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {ts.status === "approved" && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                Approved
                              </Badge>
                            )}
                            {ts.status === "rejected" && (
                              <Badge variant="outline" className="gap-1 text-destructive">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </Badge>
                            )}
                            {ts.status === "draft" && (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {timesheets.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No timesheets found</p>
                )}
              </CardContent>
            </Card>

            {/* Rejection Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Timesheet</DialogTitle>
                  <DialogDescription>Provide a reason for rejecting this timesheet</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Rejection Reason *</Label>
                    <Textarea
                      placeholder="Please provide details on why this timesheet is being rejected..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleApproveTimesheet(selectedTimesheetId!, "rejected", rejectionReason)}
                    disabled={!rejectionReason.trim()}
                  >
                    Reject Timesheet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Charge Codes Tab */}
          <TabsContent value="chargecodes" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Charge Codes</CardTitle>
                  <CardDescription>Codes for tracking time by project and funding source</CardDescription>
                </div>
                <Dialog open={showNewChargeCodeDialog} onOpenChange={setShowNewChargeCodeDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Charge Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Charge Code</DialogTitle>
                      <DialogDescription>Define a new charge code for time tracking</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input
                            placeholder="e.g., GRANT-001"
                            value={newChargeCode.code}
                            onChange={(e) => setNewChargeCode({ ...newChargeCode, code: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            placeholder="e.g., DOL Grant - Admin"
                            value={newChargeCode.name}
                            onChange={(e) => setNewChargeCode({ ...newChargeCode, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Funding Source</Label>
                        <Select value={newChargeCode.fundingSourceId} onValueChange={(v) => setNewChargeCode({ ...newChargeCode, fundingSourceId: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select funding source" />
                          </SelectTrigger>
                          <SelectContent>
                            {fundingSources.map((fs) => (
                              <SelectItem key={fs.id} value={fs.id.toString()}>
                                {fs.code} - {fs.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Budgeted Hours</Label>
                          <Input
                            type="number"
                            placeholder="e.g., 500"
                            value={newChargeCode.budgetedHours}
                            onChange={(e) => setNewChargeCode({ ...newChargeCode, budgetedHours: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hourly Rate ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 75.00"
                            value={newChargeCode.hourlyRate}
                            onChange={(e) => setNewChargeCode({ ...newChargeCode, hourlyRate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Description of this charge code"
                          value={newChargeCode.description}
                          onChange={(e) => setNewChargeCode({ ...newChargeCode, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewChargeCodeDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateChargeCode} disabled={createChargeCode.isPending}>
                        {createChargeCode.isPending ? "Creating..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Funding Source</TableHead>
                      <TableHead>Budgeted Hours</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chargeCodes.map((code) => {
                      const funding = fundingSources.find(f => f.id === code.fundingSourceId);
                      return (
                        <TableRow key={code.id}>
                          <TableCell className="font-mono font-medium">{code.code}</TableCell>
                          <TableCell>{code.name}</TableCell>
                          <TableCell>{funding?.name || "-"}</TableCell>
                          <TableCell>{code.budgetedHours || "-"}</TableCell>
                          <TableCell>{code.hourlyRate ? `$${code.hourlyRate}` : "-"}</TableCell>
                          <TableCell>
                            {code.isBillable ? (
                              <Badge variant="default">Yes</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {code.isActive ? (
                              <Badge variant="default">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {chargeCodes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No charge codes defined. Create one to start tracking time.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funding Sources Tab */}
          <TabsContent value="funding" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Funding Sources</CardTitle>
                  <CardDescription>Grants, contracts, and other funding for labor tracking</CardDescription>
                </div>
                <Dialog open={showNewFundingSourceDialog} onOpenChange={setShowNewFundingSourceDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Funding Source
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Funding Source</DialogTitle>
                      <DialogDescription>Add a new grant, contract, or funding source</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input
                            placeholder="e.g., DOL-2026-001"
                            value={newFundingSource.code}
                            onChange={(e) => setNewFundingSource({ ...newFundingSource, code: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type *</Label>
                          <Select value={newFundingSource.type} onValueChange={(v: any) => setNewFundingSource({ ...newFundingSource, type: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="grant">Grant</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internal">Internal</SelectItem>
                              <SelectItem value="donation">Donation</SelectItem>
                              <SelectItem value="revenue">Revenue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          placeholder="e.g., DOL Workforce Development Grant"
                          value={newFundingSource.name}
                          onChange={(e) => setNewFundingSource({ ...newFundingSource, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Funder Name</Label>
                        <Input
                          placeholder="e.g., Department of Labor"
                          value={newFundingSource.funderName}
                          onChange={(e) => setNewFundingSource({ ...newFundingSource, funderName: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Total Budget ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 500000.00"
                            value={newFundingSource.totalBudget}
                            onChange={(e) => setNewFundingSource({ ...newFundingSource, totalBudget: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Labor Budget ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 300000.00"
                            value={newFundingSource.laborBudget}
                            onChange={(e) => setNewFundingSource({ ...newFundingSource, laborBudget: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={newFundingSource.startDate}
                            onChange={(e) => setNewFundingSource({ ...newFundingSource, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={newFundingSource.endDate}
                            onChange={(e) => setNewFundingSource({ ...newFundingSource, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewFundingSourceDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateFundingSource} disabled={createFundingSource.isPending}>
                        {createFundingSource.isPending ? "Creating..." : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Funder</TableHead>
                      <TableHead>Total Budget</TableHead>
                      <TableHead>Labor Budget</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fundingSources.map((fs) => (
                      <TableRow key={fs.id}>
                        <TableCell className="font-mono font-medium">{fs.code}</TableCell>
                        <TableCell>{fs.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{fs.type}</Badge>
                        </TableCell>
                        <TableCell>{fs.funderName || "-"}</TableCell>
                        <TableCell>{fs.totalBudget ? `$${parseFloat(fs.totalBudget).toLocaleString()}` : "-"}</TableCell>
                        <TableCell>{fs.laborBudget ? `$${parseFloat(fs.laborBudget).toLocaleString()}` : "-"}</TableCell>
                        <TableCell>
                          {fs.startDate && fs.endDate ? (
                            `${new Date(fs.startDate).toLocaleDateString()} - ${new Date(fs.endDate).toLocaleDateString()}`
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {fs.status === "active" ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">{fs.status}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {fundingSources.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No funding sources defined. Add one to start tracking labor costs.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Workers</CardTitle>
                  <CardDescription>Employees, contractors, and volunteers for time tracking</CardDescription>
                </div>
                <Dialog open={showNewWorkerDialog} onOpenChange={setShowNewWorkerDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Worker
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Worker</DialogTitle>
                      <DialogDescription>Add an employee, contractor, or volunteer for time tracking</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name *</Label>
                          <Input
                            placeholder="First name"
                            value={newWorker.firstName}
                            onChange={(e) => setNewWorker({ ...newWorker, firstName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name *</Label>
                          <Input
                            placeholder="Last name"
                            value={newWorker.lastName}
                            onChange={(e) => setNewWorker({ ...newWorker, lastName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          value={newWorker.email}
                          onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Worker Type *</Label>
                        <Select value={newWorker.workerType} onValueChange={(v: any) => setNewWorker({ ...newWorker, workerType: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee (W-2)</SelectItem>
                            <SelectItem value="contractor">Contractor (1099)</SelectItem>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Hourly Rate ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 25.00"
                            value={newWorker.hourlyRate}
                            onChange={(e) => setNewWorker({ ...newWorker, hourlyRate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Standard Hours/Week</Label>
                          <Input
                            type="number"
                            placeholder="40"
                            value={newWorker.standardHoursPerWeek}
                            onChange={(e) => setNewWorker({ ...newWorker, standardHoursPerWeek: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewWorkerDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateWorker} disabled={createWorker.isPending}>
                        {createWorker.isPending ? "Adding..." : "Add Worker"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                      <TableHead>Std Hours/Week</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell className="font-medium">{worker.firstName} {worker.lastName}</TableCell>
                        <TableCell>{worker.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={worker.workerType === "employee" ? "default" : worker.workerType === "contractor" ? "secondary" : "outline"}>
                            {worker.workerType === "employee" ? "W-2" : worker.workerType === "contractor" ? "1099" : "Volunteer"}
                          </Badge>
                        </TableCell>
                        <TableCell>{worker.hourlyRate ? `$${worker.hourlyRate}` : "-"}</TableCell>
                        <TableCell>{worker.standardHoursPerWeek}</TableCell>
                        <TableCell>
                          {worker.status === "active" ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">{worker.status}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {workers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No workers added. Add employees and contractors to start tracking time.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Hours by Charge Code Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Hours by Charge Code</CardTitle>
                  <CardDescription>Total hours logged per charge code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chargeCodes.map((code) => {
                      const codeHours = timeEntries
                        .filter(e => e.chargeCodeId === code.id)
                        .reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
                      const budgeted = parseFloat(code.budgetedHours || "0");
                      const percentage = budgeted > 0 ? Math.min((codeHours / budgeted) * 100, 100) : 0;
                      return (
                        <div key={code.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{code.code} - {code.name}</span>
                            <span>{codeHours.toFixed(1)} / {budgeted || "∞"} hrs</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${percentage > 90 ? 'bg-destructive' : percentage > 75 ? 'bg-yellow-500' : 'bg-primary'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          {budgeted > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(0)}% of budget used • {(budgeted - codeHours).toFixed(1)} hrs remaining
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {chargeCodes.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No charge codes defined</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hours by Funding Source Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Hours by Funding Source</CardTitle>
                  <CardDescription>Labor hours allocated per funding source</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fundingSources.map((fs) => {
                      const fsChargeCodes = chargeCodes.filter(c => c.fundingSourceId === fs.id);
                      const fsHours = timeEntries
                        .filter(e => fsChargeCodes.some(c => c.id === e.chargeCodeId))
                        .reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
                      const laborBudget = parseFloat(fs.laborBudget || "0");
                      const hourlyRate = 50; // Average hourly rate assumption
                      const laborCost = fsHours * hourlyRate;
                      const budgetUsed = laborBudget > 0 ? (laborCost / laborBudget) * 100 : 0;
                      return (
                        <div key={fs.id} className="p-3 bg-secondary/30 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{fs.code}</p>
                              <p className="text-sm text-muted-foreground">{fs.name}</p>
                            </div>
                            <Badge variant={fs.status === "active" ? "default" : "secondary"}>
                              {fs.type}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Hours Logged</p>
                              <p className="font-bold">{fsHours.toFixed(1)} hrs</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Est. Labor Cost</p>
                              <p className="font-bold">${laborCost.toLocaleString()}</p>
                            </div>
                          </div>
                          {laborBudget > 0 && (
                            <div className="space-y-1">
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${budgetUsed > 90 ? 'bg-destructive' : budgetUsed > 75 ? 'bg-yellow-500' : 'bg-primary'}`}
                                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                ${laborCost.toLocaleString()} / ${laborBudget.toLocaleString()} labor budget ({budgetUsed.toFixed(0)}%)
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {fundingSources.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No funding sources defined</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Hours by Worker Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Hours by Worker</CardTitle>
                  <CardDescription>Total hours per employee/contractor</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Regular</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead>Billable</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workers.map((worker) => {
                        const workerEntries = timeEntries.filter(e => e.workerId === worker.id);
                        const regular = workerEntries.reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
                        const overtime = workerEntries.reduce((sum, e) => sum + parseFloat(e.overtimeHours || "0"), 0);
                        const billable = workerEntries.filter(e => e.isBillable).reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0);
                        return (
                          <TableRow key={worker.id}>
                            <TableCell className="font-medium">{worker.firstName} {worker.lastName}</TableCell>
                            <TableCell>
                              <Badge variant={worker.workerType === "employee" ? "default" : "secondary"}>
                                {worker.workerType === "employee" ? "W-2" : "1099"}
                              </Badge>
                            </TableCell>
                            <TableCell>{regular.toFixed(1)}</TableCell>
                            <TableCell>{overtime.toFixed(1)}</TableCell>
                            <TableCell>{billable.toFixed(1)}</TableCell>
                            <TableCell className="font-bold">{(regular + overtime).toFixed(1)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {workers.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No workers added</p>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Summary Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Period Summary</CardTitle>
                  <CardDescription>Overview of hours for selected date range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary">{totalHoursThisPeriod.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">{billableHours.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Billable Hours</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-3xl font-bold">{(totalHoursThisPeriod - billableHours).toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Non-Billable</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-3xl font-bold">
                        {totalHoursThisPeriod > 0 ? ((billableHours / totalHoursThisPeriod) * 100).toFixed(0) : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Billable Rate</p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Top Charge Codes</h4>
                    <div className="space-y-2">
                      {chargeCodes
                        .map(code => ({
                          ...code,
                          hours: timeEntries
                            .filter(e => e.chargeCodeId === code.id)
                            .reduce((sum, e) => sum + parseFloat(e.hoursWorked || "0"), 0)
                        }))
                        .sort((a, b) => b.hours - a.hours)
                        .slice(0, 5)
                        .map((code, idx) => (
                          <div key={code.id} className="flex justify-between text-sm">
                            <span>{idx + 1}. {code.code}</span>
                            <span className="font-medium">{code.hours.toFixed(1)} hrs</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
