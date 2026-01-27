import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users, Scale, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Search, Filter, RefreshCw, ArrowRight, Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import {
  TeamMemberWorkload,
  WorkloadSummary,
  calculateWorkloadSummary,
  getWorkloadColor,
  needsRebalancing,
  getRebalancingSuggestions,
  generateMockWorkloadData,
} from "@/services/workloadBalancingService";

export default function TeamWorkload() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [teamMembers] = useState<TeamMemberWorkload[]>(() => generateMockWorkloadData(10));

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
      const matchesStatus = statusFilter === "all" || member.capacity.status === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [teamMembers, searchTerm, departmentFilter, statusFilter]);

  const summary = useMemo(() => calculateWorkloadSummary(teamMembers), [teamMembers]);
  const showRebalancingAlert = needsRebalancing(summary);
  const rebalancingSuggestions = useMemo(() => getRebalancingSuggestions(teamMembers), [teamMembers]);

  const departments = [...new Set(teamMembers.map((m) => m.department))];

  const getStatusBadge = (status: TeamMemberWorkload['capacity']['status']) => {
    const colorClass = getWorkloadColor(status);
    return (
      <Badge variant="outline" className={colorClass}>
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
            <h1 className="text-2xl font-bold text-foreground">Team Workload</h1>
            <p className="text-muted-foreground">
              Monitor team capacity and balance task distribution
            </p>
          </div>
          <Button variant="outline" onClick={() => toast.info("Refreshing workload data...")}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Rebalancing Alert */}
        {showRebalancingAlert && (
          <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Workload Imbalance Detected</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                {summary.overloadedMembers} team member(s) are overloaded while {summary.availableMembers} have available capacity.
              </p>
              {rebalancingSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggested Rebalancing:
                  </p>
                  {rebalancingSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm bg-white/50 p-2 rounded">
                      <span>{suggestion.from}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>{suggestion.to}</span>
                      <Badge variant="secondary">{suggestion.tasksToMove} task(s)</Badge>
                    </div>
                  ))}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{summary.totalTeamMembers}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Utilization</p>
                  <p className="text-2xl font-bold">{summary.averageUtilization}%</p>
                </div>
                <Scale className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold">{summary.totalPendingTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{summary.totalOverdueTasks}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>Team capacity breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {summary.workloadDistribution.available}
                </p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {summary.workloadDistribution.balanced}
                </p>
                <p className="text-sm text-muted-foreground">Balanced</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">
                  {summary.workloadDistribution.busy}
                </p>
                <p className="text-sm text-muted-foreground">Busy</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {summary.workloadDistribution.overloaded}
                </p>
                <p className="text-sm text-muted-foreground">Overloaded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="overloaded">Overloaded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      {getStatusBadge(member.capacity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.role} • {member.department}
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-medium">{member.capacity.currentUtilization}%</span>
                        </div>
                        <Progress
                          value={member.capacity.currentUtilization}
                          className={`h-2 ${
                            member.capacity.status === 'overloaded'
                              ? '[&>div]:bg-red-500'
                              : member.capacity.status === 'busy'
                              ? '[&>div]:bg-amber-500'
                              : member.capacity.status === 'balanced'
                              ? '[&>div]:bg-blue-500'
                              : '[&>div]:bg-green-500'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold">{member.workload.pendingTasks}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold text-red-600">{member.workload.overdueTasks}</p>
                          <p className="text-xs text-muted-foreground">Overdue</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-lg font-bold text-green-600">{member.workload.completedThisWeek}</p>
                          <p className="text-xs text-muted-foreground">Done</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No team members found matching your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
