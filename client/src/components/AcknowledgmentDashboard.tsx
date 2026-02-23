import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Users,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Building2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail } from "lucide-react";

interface ProcedureAck {
  procedureId: number;
  procedureTitle: string;
  department: string;
  documentNumber?: string;
  version?: string;
  totalEmployees: number;
  acknowledgedCount: number;
  pendingCount: number;
  overdueCount: number;
  lastUpdated: Date;
}

interface EmployeeAck {
  employeeId: number;
  employeeName: string;
  department: string;
  procedureId: number;
  procedureTitle: string;
  status: "acknowledged" | "pending" | "overdue";
  acknowledgedAt?: Date;
  signature?: string;
}

const getStatusBadge = (status: EmployeeAck["status"]) => {
  switch (status) {
    case "acknowledged":
      return <Badge className="bg-green-500/10 text-green-700 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Acknowledged</Badge>;
    case "pending":
      return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case "overdue":
      return <Badge className="bg-red-500/10 text-red-700 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
  }
};

export default function AcknowledgmentDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState<"procedures" | "employees">("procedures");
  const [reminderDialog, setReminderDialog] = useState<{ open: boolean; procedureId: number | null; procedureTitle: string; pendingCount: number }>({ open: false, procedureId: null, procedureTitle: "", pendingCount: 0 });

  const sendReminderMutation = trpc.procedures.sendAcknowledgmentReminder.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setReminderDialog({ open: false, procedureId: null, procedureTitle: "", pendingCount: 0 });
    },
    onError: (error) => {
      toast.error(`Failed to send reminder: ${error.message}`);
    },
  });

  const handleSendReminder = (procedureId: number, procedureTitle: string, pendingCount: number) => {
    setReminderDialog({ open: true, procedureId, procedureTitle, pendingCount });
  };

  const confirmSendReminder = () => {
    if (reminderDialog.procedureId) {
      sendReminderMutation.mutate({ procedureId: reminderDialog.procedureId });
    }
  };

  // Fetch real data from the API
  const { data, isLoading, refetch } = trpc.procedures.getAcknowledgmentDashboard.useQuery();

  const procedureAcks: ProcedureAck[] = data?.procedures?.map(p => ({
    ...p,
    documentNumber: p.documentNumber || undefined,
    lastUpdated: new Date(p.lastUpdated),
  })) || [];

  const employeeAcks: EmployeeAck[] = data?.employees?.map(e => ({
    ...e,
    status: e.status as "acknowledged" | "pending" | "overdue",
    acknowledgedAt: e.acknowledgedAt ? new Date(e.acknowledgedAt) : undefined,
    signature: e.signature || undefined,
  })) || [];

  const departments = Array.from(new Set(procedureAcks.map(p => p.department)));

  const filteredProcedures = procedureAcks.filter(p => {
    const matchesSearch = p.procedureTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || p.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const filteredEmployees = employeeAcks.filter(e => {
    const matchesSearch = e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.procedureTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || e.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate totals
  const totalAcknowledged = procedureAcks.reduce((sum, p) => sum + p.acknowledgedCount, 0);
  const totalPending = procedureAcks.reduce((sum, p) => sum + p.pendingCount, 0);
  const totalOverdue = procedureAcks.reduce((sum, p) => sum + p.overdueCount, 0);
  const overallRate = totalAcknowledged + totalPending > 0 
    ? Math.round((totalAcknowledged / (totalAcknowledged + totalPending)) * 100) 
    : 0;

  const handleExport = () => {
    const csvData = view === "procedures" 
      ? filteredProcedures.map(p => ({
          "Procedure": p.procedureTitle,
          "Department": p.department,
          "Document #": p.documentNumber || "",
          "Total Employees": p.totalEmployees,
          "Acknowledged": p.acknowledgedCount,
          "Pending": p.pendingCount,
          "Compliance Rate": `${Math.round((p.acknowledgedCount / p.totalEmployees) * 100)}%`,
        }))
      : filteredEmployees.map(e => ({
          "Employee": e.employeeName,
          "Department": e.department,
          "Procedure": e.procedureTitle,
          "Status": e.status,
          "Acknowledged At": e.acknowledgedAt ? format(e.acknowledgedAt, "PPp") : "",
          "Signature": e.signature || "",
        }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(","),
      ...csvData.map(row => headers.map(h => `"${(row as Record<string, string | number>)[h]}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acknowledgment-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Report exported successfully");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading acknowledgment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">{totalAcknowledged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{totalOverdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{overallRate}%</p>
              </div>
            </div>
            <Progress value={overallRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Acknowledgment Tracking
              </CardTitle>
              <CardDescription>Monitor procedure acknowledgments across the organization</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search procedures or employees..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {view === "employees" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="flex border rounded-lg overflow-hidden">
              <Button 
                variant={view === "procedures" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setView("procedures")}
                className="rounded-none"
              >
                <FileText className="w-4 h-4 mr-2" />
                By Procedure
              </Button>
              <Button 
                variant={view === "employees" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setView("employees")}
                className="rounded-none"
              >
                <User className="w-4 h-4 mr-2" />
                By Employee
              </Button>
            </div>
          </div>

          {/* Data Tables */}
          {view === "procedures" ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Acknowledged</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Compliance</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcedures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {procedureAcks.length === 0 
                          ? "No approved procedures found. Create and approve procedures to track acknowledgments."
                          : "No procedures match your search criteria"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProcedures.map((proc) => {
                      const rate = Math.round((proc.acknowledgedCount / proc.totalEmployees) * 100) || 0;
                      return (
                        <TableRow key={proc.procedureId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{proc.procedureTitle}</p>
                                {proc.documentNumber && (
                                  <p className="text-xs text-muted-foreground">{proc.documentNumber}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{proc.department}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{proc.totalEmployees}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-600 font-medium">{proc.acknowledgedCount}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-amber-600 font-medium">{proc.pendingCount}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2">
                              <Progress value={rate} className="w-16 h-2" />
                              <span className="text-sm font-medium">{rate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(proc.lastUpdated, "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {proc.pendingCount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendReminder(proc.procedureId, proc.procedureTitle, proc.pendingCount)}
                                className="gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                Remind
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acknowledged</TableHead>
                    <TableHead>Signature</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {employeeAcks.length === 0 
                          ? "No acknowledgment records found."
                          : "No employees match your search criteria"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp, idx) => (
                      <TableRow key={`${emp.employeeId}-${emp.procedureId}-${idx}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">{emp.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{emp.department}</Badge>
                        </TableCell>
                        <TableCell>{emp.procedureTitle}</TableCell>
                        <TableCell>{getStatusBadge(emp.status)}</TableCell>
                        <TableCell>
                          {emp.acknowledgedAt ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {format(emp.acknowledgedAt, "MMM d, yyyy h:mm a")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {emp.signature ? (
                            <span className="italic text-sm">{emp.signature}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Reminder Confirmation Dialog */}
      <AlertDialog open={reminderDialog.open} onOpenChange={(open) => setReminderDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Acknowledgment Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Send a reminder to {reminderDialog.pendingCount} employee(s) who haven't acknowledged "{reminderDialog.procedureTitle}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmSendReminder}
              disabled={sendReminderMutation.isPending}
            >
              {sendReminderMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" />Send Reminder</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
