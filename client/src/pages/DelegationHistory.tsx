import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History, Search, Filter, Calendar, User, ArrowRight, CheckCircle,
  XCircle, Clock, AlertTriangle, Shield, RefreshCw, Download, FileText
} from "lucide-react";
import { toast } from "sonner";

interface HistoryEntry {
  id: string;
  delegationId: string;
  taskTitle: string;
  action: "created" | "accepted" | "declined" | "completed" | "approval_requested" | "approved" | "rejected" | "escalated" | "cancelled" | "reassigned";
  actorId: string;
  actorName: string;
  details?: {
    fromUser?: string;
    toUser?: string;
    reason?: string;
    notes?: string;
    priority?: string;
    escalationLevel?: number;
    previousAssignee?: string;
    newAssignee?: string;
  };
  createdAt: Date;
}

const actionConfig: Record<string, { label: string; color: string; icon: any }> = {
  created: { label: "Delegation Created", color: "bg-blue-100 text-blue-700", icon: FileText },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700", icon: CheckCircle },
  declined: { label: "Declined", color: "bg-red-100 text-red-700", icon: XCircle },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  approval_requested: { label: "Approval Requested", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: Shield },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  escalated: { label: "Escalated", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-700", icon: XCircle },
  reassigned: { label: "Reassigned", color: "bg-purple-100 text-purple-700", icon: ArrowRight },
};

function generateMockHistory(): HistoryEntry[] {
  const users = [
    { id: "1", name: "Sarah Johnson" },
    { id: "2", name: "Michael Chen" },
    { id: "3", name: "Emily Rodriguez" },
    { id: "4", name: "David Kim" },
    { id: "5", name: "Jessica Taylor" },
  ];

  const tasks = [
    "Q4 Financial Report Review",
    "Vendor Contract Signature",
    "Budget Approval Request",
    "Compliance Audit Analysis",
    "Policy Document Review",
    "Grant Application Review",
  ];

  const actions: HistoryEntry["action"][] = [
    "created", "accepted", "declined", "completed", "approval_requested",
    "approved", "rejected", "escalated", "cancelled", "reassigned"
  ];

  const history: HistoryEntry[] = [];
  let baseTime = Date.now();

  for (let i = 0; i < 50; i++) {
    const actor = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    
    baseTime -= Math.random() * 3600000 * 4; // Random time in last few hours

    const entry: HistoryEntry = {
      id: `hist-${i + 1}`,
      delegationId: `del-${Math.floor(Math.random() * 20) + 1}`,
      taskTitle: task,
      action,
      actorId: actor.id,
      actorName: actor.name,
      createdAt: new Date(baseTime),
    };

    // Add relevant details based on action
    if (action === "created" || action === "reassigned") {
      const fromUser = users[Math.floor(Math.random() * users.length)];
      let toUser = users[Math.floor(Math.random() * users.length)];
      while (toUser.id === fromUser.id) {
        toUser = users[Math.floor(Math.random() * users.length)];
      }
      entry.details = {
        fromUser: fromUser.name,
        toUser: toUser.name,
        reason: ["workload", "expertise", "pto", "priority"][Math.floor(Math.random() * 4)],
      };
    } else if (action === "escalated") {
      entry.details = {
        escalationLevel: Math.floor(Math.random() * 3) + 1,
        reason: "Approval pending for over 24 hours",
      };
    } else if (action === "declined") {
      entry.details = {
        reason: ["Currently at capacity", "Not within my expertise", "On leave during due date"][Math.floor(Math.random() * 3)],
      };
    }

    history.push(entry);
  }

  return history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export default function DelegationHistory() {
  const [history] = useState<HistoryEntry[]>(() => generateMockHistory());
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const matchesSearch =
        entry.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.delegationId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === "all" || entry.action === actionFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const now = new Date();
        const entryDate = new Date(entry.createdAt);
        switch (dateFilter) {
          case "today":
            matchesDate = entryDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = entryDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = entryDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [history, searchTerm, actionFilter, dateFilter]);

  const handleExport = () => {
    const csvContent = [
      ["ID", "Delegation ID", "Task", "Action", "Actor", "Date"].join(","),
      ...filteredHistory.map((entry) =>
        [
          entry.id,
          entry.delegationId,
          `"${entry.taskTitle}"`,
          entry.action,
          entry.actorName,
          entry.createdAt.toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `delegation-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("History exported to CSV");
  };

  const getActionBadge = (action: HistoryEntry["action"]) => {
    const config = actionConfig[action];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Group history by delegation for timeline view
  const groupedByDelegation = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    filteredHistory.forEach((entry) => {
      if (!groups[entry.delegationId]) {
        groups[entry.delegationId] = [];
      }
      groups[entry.delegationId].push(entry);
    });
    return groups;
  }, [filteredHistory]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="w-6 h-6" />
              Delegation History
            </h1>
            <p className="text-muted-foreground">
              Complete audit trail of all delegation events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => toast.info("Refreshing history...")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by task, user, or delegation ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="approval_requested">Approval Requested</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="reassigned">Reassigned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="grouped">Grouped by Delegation</TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No history entries found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistory.map((entry, index) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-xs">
                              {entry.actorName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          {index < filteredHistory.length - 1 && (
                            <div className="absolute top-10 left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground">{entry.actorName}</span>
                              {getActionBadge(entry.action)}
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(entry.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mb-1">
                            <span className="font-medium">{entry.taskTitle}</span>
                            <span className="text-muted-foreground ml-2">({entry.delegationId})</span>
                          </p>
                          {entry.details && (
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              {entry.details.fromUser && entry.details.toUser && (
                                <p>
                                  {entry.details.fromUser} → {entry.details.toUser}
                                </p>
                              )}
                              {entry.details.reason && (
                                <p>Reason: {entry.details.reason}</p>
                              )}
                              {entry.details.escalationLevel && (
                                <p>Escalation Level: {entry.details.escalationLevel}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grouped View */}
          <TabsContent value="grouped" className="mt-4">
            <div className="space-y-4">
              {Object.entries(groupedByDelegation).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No delegations found</p>
                  </CardContent>
                </Card>
              ) : (
                Object.entries(groupedByDelegation).map(([delegationId, entries]) => (
                  <Card key={delegationId}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{entries[0].taskTitle}</CardTitle>
                          <CardDescription>{delegationId}</CardDescription>
                        </div>
                        <Badge variant="secondary">{entries.length} events</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-3">
                              {getActionBadge(entry.action)}
                              <span className="text-muted-foreground">by {entry.actorName}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {entry.createdAt.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(actionConfig).slice(0, 5).map(([action, config]) => {
            const count = history.filter((h) => h.action === action).length;
            const Icon = config.icon;
            return (
              <Card key={action}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
