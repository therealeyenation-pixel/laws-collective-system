import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  Scale,
  ArrowRight,
  ChevronRight,
  Eye,
  MessageSquare,
  History,
  Settings,
  Plus,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";

// Approval workflow types
interface ApprovalRequest {
  id: string;
  type: "allocation" | "policy" | "access" | "operation" | "succession";
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  threshold: number;
  currentApprovals: number;
  requiredApprovals: number;
  approvers: Array<{
    name: string;
    role: string;
    decision: "pending" | "approved" | "rejected";
    decidedAt?: string;
    comment?: string;
  }>;
  escalationPath: string[];
  amount?: number;
  entity?: string;
}

// Decision escalation paths
const escalationPaths = {
  allocation: [
    { level: 1, role: "Department Manager", threshold: 10000 },
    { level: 2, role: "Division Director", threshold: 50000 },
    { level: 3, role: "CFO", threshold: 100000 },
    { level: 4, role: "Trust Authority", threshold: Infinity },
  ],
  policy: [
    { level: 1, role: "Policy Committee", threshold: 1 },
    { level: 2, role: "Legal Review", threshold: 1 },
    { level: 3, role: "Trust Authority", threshold: 1 },
  ],
  access: [
    { level: 1, role: "IT Security", threshold: 1 },
    { level: 2, role: "Department Head", threshold: 1 },
    { level: 3, role: "Trust Authority", threshold: 1 },
  ],
  operation: [
    { level: 1, role: "Operations Manager", threshold: 1 },
    { level: 2, role: "Division Director", threshold: 1 },
    { level: 3, role: "CEO", threshold: 1 },
    { level: 4, role: "Trust Authority", threshold: 1 },
  ],
  succession: [
    { level: 1, role: "HR Director", threshold: 1 },
    { level: 2, role: "Legal Counsel", threshold: 1 },
    { level: 3, role: "Trust Authority", threshold: 1 },
  ],
};

// Sample approval requests
const sampleRequests: ApprovalRequest[] = [
  {
    id: "REQ-001",
    type: "allocation",
    title: "Q1 Marketing Budget Increase",
    description: "Request to increase marketing budget by $25,000 for new campaign launch",
    requestedBy: "Marketing Director",
    requestedAt: "2026-01-20T10:30:00Z",
    status: "pending",
    priority: "high",
    threshold: 25000,
    currentApprovals: 1,
    requiredApprovals: 2,
    amount: 25000,
    entity: "The L.A.W.S. Collective, LLC",
    approvers: [
      { name: "Division Director", role: "Division Director", decision: "approved", decidedAt: "2026-01-21T09:00:00Z", comment: "Approved - aligns with growth strategy" },
      { name: "CFO", role: "CFO", decision: "pending" },
    ],
    escalationPath: ["Division Director", "CFO"],
  },
  {
    id: "REQ-002",
    type: "policy",
    title: "Remote Work Policy Update",
    description: "Proposal to update remote work policy to allow 4 days remote per week",
    requestedBy: "HR Director",
    requestedAt: "2026-01-18T14:00:00Z",
    status: "escalated",
    priority: "medium",
    threshold: 1,
    currentApprovals: 2,
    requiredApprovals: 3,
    approvers: [
      { name: "Policy Committee", role: "Policy Committee", decision: "approved", decidedAt: "2026-01-19T11:00:00Z" },
      { name: "Legal Review", role: "Legal Review", decision: "approved", decidedAt: "2026-01-20T16:00:00Z", comment: "No legal concerns" },
      { name: "Trust Authority", role: "Trust Authority", decision: "pending" },
    ],
    escalationPath: ["Policy Committee", "Legal Review", "Trust Authority"],
  },
  {
    id: "REQ-003",
    type: "access",
    title: "Financial System Admin Access",
    description: "Request for admin-level access to financial reporting system for new Finance Manager",
    requestedBy: "Finance Director",
    requestedAt: "2026-01-22T08:00:00Z",
    status: "pending",
    priority: "high",
    threshold: 1,
    currentApprovals: 1,
    requiredApprovals: 2,
    approvers: [
      { name: "IT Security", role: "IT Security", decision: "approved", decidedAt: "2026-01-22T10:00:00Z", comment: "Background check cleared" },
      { name: "Department Head", role: "Department Head", decision: "pending" },
    ],
    escalationPath: ["IT Security", "Department Head"],
  },
  {
    id: "REQ-004",
    type: "operation",
    title: "New Vendor Partnership",
    description: "Approval to enter partnership agreement with TechCorp for software development",
    requestedBy: "Business Development",
    requestedAt: "2026-01-15T09:00:00Z",
    status: "approved",
    priority: "critical",
    threshold: 1,
    currentApprovals: 4,
    requiredApprovals: 4,
    amount: 150000,
    entity: "LuvOnPurpose Autonomous Wealth System, LLC",
    approvers: [
      { name: "Operations Manager", role: "Operations Manager", decision: "approved", decidedAt: "2026-01-16T10:00:00Z" },
      { name: "Division Director", role: "Division Director", decision: "approved", decidedAt: "2026-01-17T14:00:00Z" },
      { name: "CEO", role: "CEO", decision: "approved", decidedAt: "2026-01-18T09:00:00Z" },
      { name: "Trust Authority", role: "Trust Authority", decision: "approved", decidedAt: "2026-01-19T11:00:00Z", comment: "Approved with quarterly review requirement" },
    ],
    escalationPath: ["Operations Manager", "Division Director", "CEO", "Trust Authority"],
  },
  {
    id: "REQ-005",
    type: "succession",
    title: "CFO Succession Plan Activation",
    description: "Initiate succession plan for retiring CFO position",
    requestedBy: "CEO",
    requestedAt: "2026-01-10T08:00:00Z",
    status: "pending",
    priority: "critical",
    threshold: 1,
    currentApprovals: 1,
    requiredApprovals: 3,
    approvers: [
      { name: "HR Director", role: "HR Director", decision: "approved", decidedAt: "2026-01-11T10:00:00Z", comment: "Succession candidates identified" },
      { name: "Legal Counsel", role: "Legal Counsel", decision: "pending" },
      { name: "Trust Authority", role: "Trust Authority", decision: "pending" },
    ],
    escalationPath: ["HR Director", "Legal Counsel", "Trust Authority"],
  },
];

// Threshold-based review rules
const thresholdRules = [
  { type: "allocation", description: "Financial allocations", thresholds: [
    { amount: 10000, approvers: 1, roles: ["Department Manager"] },
    { amount: 50000, approvers: 2, roles: ["Department Manager", "Division Director"] },
    { amount: 100000, approvers: 3, roles: ["Department Manager", "Division Director", "CFO"] },
    { amount: Infinity, approvers: 4, roles: ["Department Manager", "Division Director", "CFO", "Trust Authority"] },
  ]},
  { type: "policy", description: "Policy changes", thresholds: [
    { amount: 1, approvers: 3, roles: ["Policy Committee", "Legal Review", "Trust Authority"] },
  ]},
  { type: "access", description: "System access", thresholds: [
    { amount: 1, approvers: 2, roles: ["IT Security", "Department Head"] },
    { amount: 2, approvers: 3, roles: ["IT Security", "Department Head", "Trust Authority"] },
  ]},
  { type: "operation", description: "Operational decisions", thresholds: [
    { amount: 25000, approvers: 2, roles: ["Operations Manager", "Division Director"] },
    { amount: 100000, approvers: 3, roles: ["Operations Manager", "Division Director", "CEO"] },
    { amount: Infinity, approvers: 4, roles: ["Operations Manager", "Division Director", "CEO", "Trust Authority"] },
  ]},
  { type: "succession", description: "Succession planning", thresholds: [
    { amount: 1, approvers: 3, roles: ["HR Director", "Legal Counsel", "Trust Authority"] },
  ]},
];

export default function GovernanceWorkflows() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(sampleRequests);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: "allocation" as const,
    title: "",
    description: "",
    amount: 0,
    entity: "",
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "escalated": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "allocation": return <DollarSign className="w-4 h-4" />;
      case "policy": return <FileText className="w-4 h-4" />;
      case "access": return <Shield className="w-4 h-4" />;
      case "operation": return <Settings className="w-4 h-4" />;
      case "succession": return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    if (filterType !== "all" && req.type !== filterType) return false;
    if (searchQuery && !req.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const newApprovals = req.currentApprovals + 1;
        const newStatus = newApprovals >= req.requiredApprovals ? "approved" : "pending";
        return { ...req, currentApprovals: newApprovals, status: newStatus };
      }
      return req;
    }));
    toast.success("Request approved");
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status: "rejected" };
      }
      return req;
    }));
    toast.error("Request rejected");
  };

  const handleEscalate = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status: "escalated" };
      }
      return req;
    }));
    toast.info("Request escalated to next level");
  };

  const handleCreateRequest = () => {
    const id = `REQ-${String(requests.length + 1).padStart(3, "0")}`;
    const rule = thresholdRules.find(r => r.type === newRequest.type);
    const threshold = rule?.thresholds.find(t => newRequest.amount <= t.amount) || rule?.thresholds[0];
    
    const newReq: ApprovalRequest = {
      id,
      type: newRequest.type,
      title: newRequest.title,
      description: newRequest.description,
      requestedBy: "Current User",
      requestedAt: new Date().toISOString(),
      status: "pending",
      priority: newRequest.amount > 100000 ? "critical" : newRequest.amount > 50000 ? "high" : "medium",
      threshold: newRequest.amount,
      currentApprovals: 0,
      requiredApprovals: threshold?.approvers || 1,
      amount: newRequest.amount,
      entity: newRequest.entity,
      approvers: threshold?.roles.map(role => ({ name: role, role, decision: "pending" as const })) || [],
      escalationPath: threshold?.roles || [],
    };
    
    setRequests(prev => [newReq, ...prev]);
    setIsNewRequestOpen(false);
    setNewRequest({ type: "allocation", title: "", description: "", amount: 0, entity: "" });
    toast.success("Approval request created");
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const escalatedCount = requests.filter(r => r.status === "escalated").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/trust-admin">
                <Button variant="ghost" size="sm">← Trust Admin</Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Scale className="w-6 h-6 text-primary" />
                  Governance Workflows
                </h1>
                <p className="text-sm text-muted-foreground">Trust approval workflows and decision escalation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {pendingCount} Pending
              </Badge>
              <Badge variant="outline" className="gap-1 text-purple-600">
                <AlertTriangle className="w-3 h-3" />
                {escalatedCount} Escalated
              </Badge>
              <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Approval Request</DialogTitle>
                    <DialogDescription>Submit a new request for governance approval</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Request Type</Label>
                      <Select value={newRequest.type} onValueChange={(v: any) => setNewRequest(prev => ({ ...prev, type: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="allocation">Financial Allocation</SelectItem>
                          <SelectItem value="policy">Policy Change</SelectItem>
                          <SelectItem value="access">System Access</SelectItem>
                          <SelectItem value="operation">Operational Decision</SelectItem>
                          <SelectItem value="succession">Succession Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                        value={newRequest.title} 
                        onChange={e => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief title for the request"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={newRequest.description} 
                        onChange={e => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of the request"
                      />
                    </div>
                    {(newRequest.type === "allocation" || newRequest.type === "operation") && (
                      <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <Input 
                          type="number"
                          value={newRequest.amount} 
                          onChange={e => setNewRequest(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Entity</Label>
                      <Select value={newRequest.entity} onValueChange={v => setNewRequest(prev => ({ ...prev, entity: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CALEA Freeman Family Trust">CALEA Freeman Family Trust</SelectItem>
                          <SelectItem value="LuvOnPurpose Autonomous Wealth System, LLC">LuvOnPurpose Autonomous Wealth System, LLC</SelectItem>
                          <SelectItem value="The L.A.W.S. Collective, LLC">The L.A.W.S. Collective, LLC</SelectItem>
                          <SelectItem value="LuvOnPurpose Academy & Outreach">LuvOnPurpose Academy & Outreach</SelectItem>
                          <SelectItem value="Real-Eye-Nation">Real-Eye-Nation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewRequestOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateRequest} disabled={!newRequest.title}>Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Approval Requests</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Paths</TabsTrigger>
            <TabsTrigger value="thresholds">Threshold Rules</TabsTrigger>
            <TabsTrigger value="history">Decision History</TabsTrigger>
          </TabsList>

          {/* Approval Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search requests..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="allocation">Allocation</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="access">Access</SelectItem>
                      <SelectItem value="operation">Operation</SelectItem>
                      <SelectItem value="succession">Succession</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Request List */}
            <div className="grid gap-4">
              {filteredRequests.map(request => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {getTypeIcon(request.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{request.title}</h3>
                            <p className="text-sm text-muted-foreground">{request.id} • {request.requestedBy}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                          <Badge variant="outline">{request.type}</Badge>
                          {request.amount && (
                            <Badge variant="outline" className="gap-1">
                              <DollarSign className="w-3 h-3" />
                              {request.amount.toLocaleString()}
                            </Badge>
                          )}
                          {request.entity && (
                            <Badge variant="outline" className="text-xs">{request.entity}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-2">
                          {request.currentApprovals}/{request.requiredApprovals} approvals
                        </div>
                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(request.currentApprovals / request.requiredApprovals) * 100}%` }}
                          />
                        </div>
                        {request.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEscalate(request.id)}>
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Escalate
                            </Button>
                            <Button size="sm" onClick={() => handleApprove(request.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Approval Chain */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm font-medium text-foreground mb-2">Approval Chain</p>
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {request.approvers.map((approver, idx) => (
                          <div key={idx} className="flex items-center">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                              approver.decision === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                              approver.decision === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                              "bg-secondary text-muted-foreground"
                            }`}>
                              {approver.decision === "approved" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                              {approver.decision === "rejected" && <XCircle className="w-3 h-3 inline mr-1" />}
                              {approver.decision === "pending" && <Clock className="w-3 h-3 inline mr-1" />}
                              {approver.role}
                            </div>
                            {idx < request.approvers.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Escalation Paths Tab */}
          <TabsContent value="escalation" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(escalationPaths).map(([type, levels]) => (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {getTypeIcon(type)}
                      {type} Decisions
                    </CardTitle>
                    <CardDescription>Escalation path for {type} approvals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {levels.map((level, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {level.level}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{level.role}</p>
                            {level.threshold !== Infinity && level.threshold !== 1 && (
                              <p className="text-xs text-muted-foreground">Up to ${level.threshold.toLocaleString()}</p>
                            )}
                          </div>
                          {idx < levels.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Threshold Rules Tab */}
          <TabsContent value="thresholds" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Threshold-Based Review Rules</CardTitle>
                <CardDescription>Automatic routing based on request value and type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {thresholdRules.map((rule, idx) => (
                    <div key={idx} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-3">
                        {getTypeIcon(rule.type)}
                        <h3 className="font-semibold text-foreground capitalize">{rule.type}</h3>
                        <span className="text-sm text-muted-foreground">- {rule.description}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-3 font-medium">Threshold</th>
                              <th className="text-left py-2 px-3 font-medium">Required Approvers</th>
                              <th className="text-left py-2 px-3 font-medium">Approval Chain</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rule.thresholds.map((threshold, tidx) => (
                              <tr key={tidx} className="border-b border-border/50 last:border-0">
                                <td className="py-2 px-3">
                                  {threshold.amount === Infinity ? "Above previous" : 
                                   threshold.amount === 1 ? "Any" : 
                                   `Up to $${threshold.amount.toLocaleString()}`}
                                </td>
                                <td className="py-2 px-3">{threshold.approvers}</td>
                                <td className="py-2 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {threshold.roles.map((role, ridx) => (
                                      <Badge key={ridx} variant="outline" className="text-xs">{role}</Badge>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decision History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Decision History
                </CardTitle>
                <CardDescription>Complete audit trail of governance decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.filter(r => r.status === "approved" || r.status === "rejected").map(request => (
                    <div key={request.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
                      <div className={`p-2 rounded-full ${request.status === "approved" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {request.status === "approved" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{request.title}</h4>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Requested by: {request.requestedBy}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Completed: {new Date(request.approvers[request.approvers.length - 1]?.decidedAt || request.requestedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {request.approvers.some(a => a.comment) && (
                          <div className="mt-2 p-2 rounded bg-background">
                            <p className="text-xs text-muted-foreground">
                              <MessageSquare className="w-3 h-3 inline mr-1" />
                              {request.approvers.find(a => a.comment)?.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
