import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  FileText,
  PenTool,
  ThumbsUp,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  DelegationRecord,
  DELEGATION_REASONS,
  getAvailableUsers,
} from "@/services/taskDelegationService";

// Mock current user
const currentUser = { id: "1", name: "Sarah Johnson" };

// Mock delegations data
const mockDelegations: DelegationRecord[] = [
  {
    id: "del-1",
    taskId: "t1",
    taskType: "article",
    taskTitle: "Review Q4 Financial Report",
    fromUser: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    toUser: { id: "2", name: "Michael Chen", email: "michael.chen@example.com" },
    notes: "Please review sections 3-5 focusing on compliance aspects.",
    reason: "expertise",
    originalDueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    newDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    delegatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: "accepted",
    acceptedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: "del-2",
    taskId: "t2",
    taskType: "signature",
    taskTitle: "Sign Employment Agreement",
    fromUser: { id: "3", name: "Emily Rodriguez", email: "emily.rodriguez@example.com" },
    toUser: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    notes: "Need backup signature authority while I'm on PTO.",
    reason: "pto",
    originalDueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    newDueDate: null,
    delegatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "del-3",
    taskId: "t3",
    taskType: "approval",
    taskTitle: "Approve Budget Amendment",
    fromUser: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    toUser: { id: "4", name: "David Kim", email: "david.kim@example.com" },
    notes: "Please review and approve the Q1 budget amendment request.",
    reason: "workload",
    originalDueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    newDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    delegatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "del-4",
    taskId: "t4",
    taskType: "article",
    taskTitle: "Complete Compliance Training",
    fromUser: { id: "5", name: "Jessica Williams", email: "jessica.williams@example.com" },
    toUser: { id: "1", name: "Sarah Johnson", email: "sarah.johnson@example.com" },
    notes: "Can you complete this training module for me?",
    reason: "priority",
    originalDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    newDueDate: null,
    delegatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: "declined",
    declinedAt: new Date(Date.now() - 30 * 60 * 1000),
    declineReason: "Training must be completed by the assigned individual for compliance purposes.",
  },
];

// Mock pending tasks that can be delegated
const mockPendingTasks = [
  { id: "pt1", title: "Review Grant Application", type: "article", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
  { id: "pt2", title: "Sign Vendor Contract", type: "signature", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  { id: "pt3", title: "Approve Time Off Request", type: "approval", dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) },
  { id: "pt4", title: "Read Policy Update", type: "article", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
];

const taskTypeIcons = {
  article: FileText,
  signature: PenTool,
  approval: ThumbsUp,
  deadline: Calendar,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  declined: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

export default function TaskDelegation() {
  const [delegations, setDelegations] = useState(mockDelegations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<typeof mockPendingTasks[0] | null>(null);
  const [delegateForm, setDelegateForm] = useState({
    toUserId: "",
    reason: "",
    notes: "",
    newDueDate: "",
  });

  const availableUsers = getAvailableUsers().filter((u) => u.id !== currentUser.id);

  // Filter delegations
  const filteredDelegations = delegations.filter((d) => {
    const matchesSearch =
      d.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fromUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.toUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const delegationsToMe = filteredDelegations.filter((d) => d.toUser.id === currentUser.id);
  const delegationsByMe = filteredDelegations.filter((d) => d.fromUser.id === currentUser.id);
  const pendingDelegations = delegationsToMe.filter((d) => d.status === "pending");

  const handleAcceptDelegation = (id: string) => {
    setDelegations((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "accepted" as const, acceptedAt: new Date() } : d
      )
    );
    toast.success("Delegation accepted");
  };

  const handleDeclineDelegation = (id: string, reason: string) => {
    setDelegations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "declined" as const, declinedAt: new Date(), declineReason: reason }
          : d
      )
    );
    toast.info("Delegation declined");
  };

  const handleDelegateTask = () => {
    if (!selectedTask || !delegateForm.toUserId || !delegateForm.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const toUser = availableUsers.find((u) => u.id === delegateForm.toUserId);
    if (!toUser) return;

    const newDelegation: DelegationRecord = {
      id: `del-${Date.now()}`,
      taskId: selectedTask.id,
      taskType: selectedTask.type as "article" | "signature" | "approval" | "deadline",
      taskTitle: selectedTask.title,
      fromUser: { id: currentUser.id, name: currentUser.name, email: "sarah.johnson@example.com" },
      toUser: { id: toUser.id, name: toUser.name, email: toUser.email },
      notes: delegateForm.notes,
      reason: delegateForm.reason,
      originalDueDate: selectedTask.dueDate,
      newDueDate: delegateForm.newDueDate ? new Date(delegateForm.newDueDate) : null,
      delegatedAt: new Date(),
      status: "pending",
    };

    setDelegations((prev) => [newDelegation, ...prev]);
    setShowDelegateDialog(false);
    setSelectedTask(null);
    setDelegateForm({ toUserId: "", reason: "", notes: "", newDueDate: "" });
    toast.success(`Task delegated to ${toUser.name}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const DelegationCard = ({ delegation, showActions = false }: { delegation: DelegationRecord; showActions?: boolean }) => {
    const TaskIcon = taskTypeIcons[delegation.taskType] || FileText;
    const isToMe = delegation.toUser.id === currentUser.id;
    const [declineReason, setDeclineReason] = useState("");
    const [showDeclineDialog, setShowDeclineDialog] = useState(false);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded">
                <TaskIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">{delegation.taskTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {delegation.taskType.charAt(0).toUpperCase() + delegation.taskType.slice(1)}
                </p>
              </div>
            </div>
            <Badge className={statusColors[delegation.status]}>
              {delegation.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {delegation.fromUser.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span>{delegation.fromUser.name}</span>
            <ArrowRight className="w-4 h-4" />
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                {delegation.toUser.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <span>{delegation.toUser.name}</span>
          </div>

          {delegation.notes && (
            <div className="bg-muted/50 rounded p-2 mb-3">
              <p className="text-sm flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {delegation.notes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Original: {formatDate(delegation.originalDueDate)}
            </span>
            {delegation.newDueDate && (
              <span className="flex items-center gap-1 text-blue-600">
                <Calendar className="w-3 h-3" />
                New: {formatDate(delegation.newDueDate)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(delegation.delegatedAt)}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">Reason:</span>{" "}
            {DELEGATION_REASONS.find((r) => r.value === delegation.reason)?.label || delegation.reason}
          </div>

          {delegation.status === "declined" && delegation.declineReason && (
            <div className="bg-red-50 dark:bg-red-950/30 rounded p-2 mb-3">
              <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {delegation.declineReason}
              </p>
            </div>
          )}

          {showActions && delegation.status === "pending" && isToMe && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                size="sm"
                onClick={() => handleAcceptDelegation(delegation.id)}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <XCircle className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Decline Delegation</DialogTitle>
                    <DialogDescription>
                      Please provide a reason for declining this delegation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Reason for declining..."
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleDeclineDelegation(delegation.id, declineReason);
                        setShowDeclineDialog(false);
                      }}
                    >
                      Decline
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-primary" />
              Task Delegation
            </h1>
            <p className="text-muted-foreground">
              Reassign tasks to colleagues with notes and deadline adjustments
            </p>
          </div>
          <Dialog open={showDelegateDialog} onOpenChange={setShowDelegateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Delegate a Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delegate Task</DialogTitle>
                <DialogDescription>
                  Select a task and assign it to a colleague
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Task</Label>
                  <Select
                    value={selectedTask?.id || ""}
                    onValueChange={(value) => {
                      const task = mockPendingTasks.find((t) => t.id === value);
                      setSelectedTask(task || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a task to delegate" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPendingTasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delegate To</Label>
                  <Select
                    value={delegateForm.toUserId}
                    onValueChange={(value) =>
                      setDelegateForm((prev) => ({ ...prev, toUserId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a colleague" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Select
                    value={delegateForm.reason}
                    onValueChange={(value) =>
                      setDelegateForm((prev) => ({ ...prev, reason: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {DELEGATION_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>New Due Date (Optional)</Label>
                  <Input
                    type="date"
                    value={delegateForm.newDueDate}
                    onChange={(e) =>
                      setDelegateForm((prev) => ({ ...prev, newDueDate: e.target.value }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add any notes or instructions for the delegate..."
                    value={delegateForm.notes}
                    onChange={(e) =>
                      setDelegateForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDelegateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDelegateTask}>
                  <Send className="w-4 h-4 mr-2" />
                  Delegate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingDelegations.length}</div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{delegationsToMe.length}</div>
              <p className="text-xs text-muted-foreground">Delegated to Me</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{delegationsByMe.length}</div>
              <p className="text-xs text-muted-foreground">Delegated by Me</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {delegations.filter((d) => d.status === "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search delegations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending Review
              {pendingDelegations.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded-full">
                  {pendingDelegations.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="to-me">Delegated to Me</TabsTrigger>
            <TabsTrigger value="by-me">Delegated by Me</TabsTrigger>
            <TabsTrigger value="all">All Delegations</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingDelegations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">No pending delegations to review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDelegations.map((delegation) => (
                  <DelegationCard key={delegation.id} delegation={delegation} showActions />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="to-me" className="space-y-4 mt-4">
            {delegationsToMe.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No tasks delegated to you</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {delegationsToMe.map((delegation) => (
                  <DelegationCard
                    key={delegation.id}
                    delegation={delegation}
                    showActions={delegation.status === "pending"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="by-me" className="space-y-4 mt-4">
            {delegationsByMe.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't delegated any tasks</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowDelegateDialog(true)}
                  >
                    Delegate a Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {delegationsByMe.map((delegation) => (
                  <DelegationCard key={delegation.id} delegation={delegation} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            {filteredDelegations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No delegations found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDelegations.map((delegation) => (
                  <DelegationCard
                    key={delegation.id}
                    delegation={delegation}
                    showActions={delegation.status === "pending" && delegation.toUser.id === currentUser.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
