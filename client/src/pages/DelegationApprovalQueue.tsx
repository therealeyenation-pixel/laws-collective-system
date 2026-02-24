import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle, XCircle, Clock, AlertTriangle, Search, Filter,
  ArrowLeftRight, User, Calendar, FileText, MessageSquare, Shield
} from "lucide-react";
import { toast } from "sonner";

interface ApprovalRequest {
  id: string;
  delegationId: string;
  taskId: string;
  taskTitle: string;
  taskType: "article" | "signature" | "approval" | "review" | "analysis" | "compliance";
  fromUser: { id: string; name: string; email: string; department: string };
  toUser: { id: string; name: string; email: string; department: string };
  reason: string;
  reasonLabel: string;
  notes?: string;
  priority: "low" | "medium" | "high" | "critical";
  originalDueDate: Date;
  newDueDate?: Date;
  requestedAt: Date;
  status: "pending" | "approved" | "rejected";
}

const reasonLabels: Record<string, string> = {
  workload: "High workload / capacity constraints",
  expertise: "Task requires different expertise",
  pto: "Planned time off / vacation",
  priority: "Conflicting priorities",
  reassignment: "Role or responsibility change",
  collaboration: "Better suited for team collaboration",
  other: "Other reason",
};

function generateMockApprovalRequests(): ApprovalRequest[] {
  const users = [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com", department: "Finance" },
    { id: "2", name: "Michael Chen", email: "michael@example.com", department: "Operations" },
    { id: "3", name: "Emily Rodriguez", email: "emily@example.com", department: "Legal" },
    { id: "4", name: "David Kim", email: "david@example.com", department: "HR" },
    { id: "5", name: "Jessica Taylor", email: "jessica@example.com", department: "Finance" },
  ];

  const taskTypes: ApprovalRequest["taskType"][] = ["article", "signature", "approval", "review", "analysis", "compliance"];
  const priorities: ApprovalRequest["priority"][] = ["high", "critical"];
  const reasons = Object.keys(reasonLabels);

  const requests: ApprovalRequest[] = [];

  for (let i = 0; i < 8; i++) {
    const fromUser = users[Math.floor(Math.random() * users.length)];
    let toUser = users[Math.floor(Math.random() * users.length)];
    while (toUser.id === fromUser.id) {
      toUser = users[Math.floor(Math.random() * users.length)];
    }

    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const requestedAt = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000);

    requests.push({
      id: `req-${i + 1}`,
      delegationId: `del-${i + 1}`,
      taskId: `task-${i + 1}`,
      taskTitle: [
        "Q4 Financial Report Review",
        "Vendor Contract Signature",
        "Budget Approval Request",
        "Compliance Audit Analysis",
        "Policy Document Review",
        "Grant Application Review",
        "Employee Onboarding Approval",
        "Procurement Request",
      ][i],
      taskType: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      fromUser,
      toUser,
      reason,
      reasonLabel: reasonLabels[reason],
      notes: Math.random() > 0.5 ? "Please review and approve this delegation request." : undefined,
      priority,
      originalDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      newDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      requestedAt,
      status: "pending",
    });
  }

  return requests;
}

export default function DelegationApprovalQueue() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(() => generateMockApprovalRequests());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.fromUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.toUser.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && req.status === "pending") ||
        (activeTab === "approved" && req.status === "approved") ||
        (activeTab === "rejected" && req.status === "rejected");
      return matchesSearch && matchesTab;
    });
  }, [requests, searchTerm, activeTab]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const criticalCount = requests.filter((r) => r.status === "pending" && r.priority === "critical").length;

  const handleApprove = (request: ApprovalRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: "approved" as const } : r))
    );
    toast.success(`Delegation approved: ${request.taskTitle}`);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === selectedRequest.id ? { ...r, status: "rejected" as const } : r))
    );
    toast.info(`Delegation rejected: ${selectedRequest.taskTitle}`);
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason("");
  };

  const getPriorityBadge = (priority: ApprovalRequest["priority"]) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-amber-100 text-amber-700",
      critical: "bg-red-100 text-red-700",
    };
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: ApprovalRequest["status"]) => {
    const config: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
      approved: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-700", icon: XCircle },
    };
    const { color, icon: Icon } = config[status];
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Delegation Approval Queue
            </h1>
            <p className="text-muted-foreground">
              Review and approve high-priority delegation requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {pendingCount} pending
            </Badge>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {criticalCount} critical
              </Badge>
            )}
          </div>
        </div>

        {/* Critical Alert */}
        {criticalCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Delegations Pending</AlertTitle>
            <AlertDescription>
              {criticalCount} critical priority delegation(s) require immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Tabs */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by task, delegator, or delegate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({requests.filter((r) => r.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({requests.filter((r) => r.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({requests.filter((r) => r.status === "rejected").length})
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No delegation requests in this category</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className={`hover:shadow-md transition-shadow ${
                      request.priority === "critical" ? "border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{request.taskTitle}</h3>
                              <p className="text-sm text-muted-foreground">
                                Task ID: {request.taskId} • Type: {request.taskType}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(request.priority)}
                              {getStatusBadge(request.status)}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {request.fromUser.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-muted-foreground">From:</span>{" "}
                                <span className="font-medium">{request.fromUser.name}</span>
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({request.fromUser.department})
                                </span>
                              </div>
                            </div>
                            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {request.toUser.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-muted-foreground">To:</span>{" "}
                                <span className="font-medium">{request.toUser.name}</span>
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({request.toUser.department})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>Reason: {request.reasonLabel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Due: {new Date(request.originalDueDate).toLocaleDateString()}
                                {request.newDueDate && (
                                  <span className="text-primary ml-1">
                                    → {new Date(request.newDueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Requested: {new Date(request.requestedAt).toLocaleString()}</span>
                            </div>
                          </div>

                          {request.notes && (
                            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{request.notes}</p>
                            </div>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <div className="flex lg:flex-col gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Delegation Request</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this delegation request.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedRequest.taskTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.fromUser.name} → {selectedRequest.toUser.name}
                  </p>
                </div>
                <Textarea
                  placeholder="Enter reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject Delegation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
