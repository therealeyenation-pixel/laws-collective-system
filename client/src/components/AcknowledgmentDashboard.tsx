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
  Building2
} from "lucide-react";
import { format } from "date-fns";

interface ProcedureAck {
  procedureId: string;
  procedureTitle: string;
  department: string;
  totalEmployees: number;
  acknowledgedCount: number;
  pendingCount: number;
  overdueCount: number;
  lastUpdated: Date;
}

interface EmployeeAck {
  employeeId: string;
  employeeName: string;
  department: string;
  procedureTitle: string;
  status: "acknowledged" | "pending" | "overdue";
  acknowledgedAt?: Date;
  dueDate: Date;
  signature?: string;
}

// Sample data for demonstration
const procedureAcks: ProcedureAck[] = [
  {
    procedureId: "sop-001",
    procedureTitle: "Financial Reporting Standards",
    department: "Finance",
    totalEmployees: 5,
    acknowledgedCount: 4,
    pendingCount: 1,
    overdueCount: 0,
    lastUpdated: new Date("2026-01-15")
  },
  {
    procedureId: "sop-002",
    procedureTitle: "Grant Compliance Procedures",
    department: "Grants",
    totalEmployees: 8,
    acknowledgedCount: 6,
    pendingCount: 1,
    overdueCount: 1,
    lastUpdated: new Date("2026-01-14")
  },
  {
    procedureId: "sop-003",
    procedureTitle: "Data Security Policy",
    department: "Technology",
    totalEmployees: 12,
    acknowledgedCount: 10,
    pendingCount: 2,
    overdueCount: 0,
    lastUpdated: new Date("2026-01-16")
  },
  {
    procedureId: "sop-004",
    procedureTitle: "Employee Onboarding Process",
    department: "Human Resources",
    totalEmployees: 15,
    acknowledgedCount: 12,
    pendingCount: 2,
    overdueCount: 1,
    lastUpdated: new Date("2026-01-13")
  },
  {
    procedureId: "sop-005",
    procedureTitle: "Procurement Guidelines",
    department: "Procurement",
    totalEmployees: 6,
    acknowledgedCount: 5,
    pendingCount: 1,
    overdueCount: 0,
    lastUpdated: new Date("2026-01-17")
  }
];

const employeeAcks: EmployeeAck[] = [
  {
    employeeId: "emp-001",
    employeeName: "Jordan Williams",
    department: "Grants",
    procedureTitle: "Grant Compliance Procedures",
    status: "acknowledged",
    acknowledgedAt: new Date("2026-01-14T10:30:00"),
    dueDate: new Date("2026-01-20"),
    signature: "Jordan Williams"
  },
  {
    employeeId: "emp-002",
    employeeName: "Alex Chen",
    department: "Technology",
    procedureTitle: "Data Security Policy",
    status: "pending",
    dueDate: new Date("2026-01-25")
  },
  {
    employeeId: "emp-003",
    employeeName: "Morgan Taylor",
    department: "Finance",
    procedureTitle: "Financial Reporting Standards",
    status: "overdue",
    dueDate: new Date("2026-01-10")
  },
  {
    employeeId: "emp-004",
    employeeName: "Casey Johnson",
    department: "Human Resources",
    procedureTitle: "Employee Onboarding Process",
    status: "acknowledged",
    acknowledgedAt: new Date("2026-01-12T14:15:00"),
    dueDate: new Date("2026-01-15"),
    signature: "Casey Johnson"
  },
  {
    employeeId: "emp-005",
    employeeName: "Riley Brown",
    department: "Procurement",
    procedureTitle: "Procurement Guidelines",
    status: "pending",
    dueDate: new Date("2026-01-22")
  }
];

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

  const departments = Array.from(new Set(procedureAcks.map(p => p.department)));

  const filteredProcedures = procedureAcks.filter(p => {
    const matchesSearch = p.procedureTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || p.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const filteredEmployees = employeeAcks.filter(e => {
    const matchesSearch = 
      e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.procedureTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || e.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalAcknowledged = procedureAcks.reduce((sum, p) => sum + p.acknowledgedCount, 0);
  const totalPending = procedureAcks.reduce((sum, p) => sum + p.pendingCount, 0);
  const totalOverdue = procedureAcks.reduce((sum, p) => sum + p.overdueCount, 0);
  const totalEmployees = procedureAcks.reduce((sum, p) => sum + p.totalEmployees, 0);
  const overallComplianceRate = Math.round((totalAcknowledged / totalEmployees) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAcknowledged}</p>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOverdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallComplianceRate}%</p>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Acknowledgment Tracking
              </CardTitle>
              <CardDescription>
                Track employee acknowledgments of operating procedures and SOPs
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "procedures" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("procedures")}
              >
                <FileText className="w-4 h-4 mr-1" />
                By Procedure
              </Button>
              <Button
                variant={view === "employees" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("employees")}
              >
                <User className="w-4 h-4 mr-1" />
                By Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={view === "procedures" ? "Search procedures..." : "Search employees or procedures..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {view === "procedures" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-center">Acknowledged</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcedures.map((procedure) => {
                  const progressPercent = Math.round((procedure.acknowledgedCount / procedure.totalEmployees) * 100);
                  return (
                    <TableRow key={procedure.procedureId}>
                      <TableCell className="font-medium">{procedure.procedureTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{procedure.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progressPercent} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">{progressPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{procedure.acknowledgedCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-amber-600 font-medium">{procedure.pendingCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={procedure.overdueCount > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                          {procedure.overdueCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(procedure.lastUpdated, "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Acknowledged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={`${employee.employeeId}-${employee.procedureTitle}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {employee.employeeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.department}</Badge>
                    </TableCell>
                    <TableCell>{employee.procedureTitle}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(employee.dueDate, "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.acknowledgedAt ? (
                        <div className="text-sm">
                          <p>{format(employee.acknowledgedAt, "MMM d, yyyy")}</p>
                          <p className="text-xs text-muted-foreground italic">"{employee.signature}"</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Compliance Alert */}
      {totalOverdue > 0 && (
        <Card className="border-red-500/30 bg-red-50 dark:bg-red-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400">Compliance Alert</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {totalOverdue} employee acknowledgment{totalOverdue > 1 ? 's are' : ' is'} overdue. 
                  Please follow up with the relevant team members to ensure compliance.
                </p>
                <Button variant="outline" size="sm" className="mt-3 border-red-500/30 text-red-700 hover:bg-red-100">
                  Send Reminder Emails
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
