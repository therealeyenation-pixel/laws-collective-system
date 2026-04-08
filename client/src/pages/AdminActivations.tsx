import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  DEPARTMENT_REGISTRY,
  getDepartmentsWithSimulators,
  getRegistryStats,
} from "@shared/departmentRegistry";
import {
  Shield,
  Users,
  Award,
  Building2,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Rocket,
  FileText,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export default function AdminActivations() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Fetch all builds (admin view)
  const allBuildsQuery = trpc.systemActivation.getAllBuilds.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch department stats
  const deptStatsQuery = trpc.departmentDashboard.getAllDepartmentStats.useQuery(
    undefined,
    { enabled: !!user }
  );

  const registryStats = getRegistryStats();
  const departmentsWithSims = getDepartmentsWithSimulators();

  // Compute summary stats from builds data
  const builds = allBuildsQuery.data ?? [];
  const summaryStats = useMemo(() => {
    const total = builds.length;
    const activated = builds.filter(
      (b: any) => b.cloneStatus === "active" || b.cloneStatus === "linked"
    ).length;
    const pending = builds.filter(
      (b: any) => b.cloneStatus === "pending" || b.cloneStatus === "provisioning"
    ).length;
    const failed = builds.filter((b: any) => b.cloneStatus === "failed").length;
    return { total, activated, pending, failed };
  }, [builds]);

  // Filter builds
  const filteredBuilds = useMemo(() => {
    let result = [...builds];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b: any) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.businessType?.toLowerCase().includes(q) ||
          b.userId?.toString().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((b: any) => b.cloneStatus === statusFilter);
    }
    return result;
  }, [builds, searchQuery, statusFilter]);

  // Department stats from query
  const deptStats = deptStatsQuery.data ?? [];

  const isLoading = allBuildsQuery.isLoading;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                System Activations
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor all member activations, certificates, and cloned builds
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              allBuildsQuery.refetch();
              deptStatsQuery.refetch();
              toast.success("Data refreshed");
            }}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summaryStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Builds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summaryStats.activated}</p>
                  <p className="text-xs text-muted-foreground">Activated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summaryStats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summaryStats.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registry Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Department Registry Overview
            </CardTitle>
            <CardDescription>
              {registryStats.totalDepartments} departments |{" "}
              {registryStats.filledManagers} managers assigned |{" "}
              {registryStats.totalSimulators} simulators |{" "}
              {registryStats.totalCertificateTypes} certificate types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {departmentsWithSims.map((dept) => {
                const stats = deptStats.find(
                  (s: any) => s.departmentId === dept.id
                );
                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-lg border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <p className="font-medium text-sm">{dept.name}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {dept.simulators.length} sim
                        {dept.simulators.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manager: {dept.manager.name}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Completions:{" "}
                        <span className="font-medium text-foreground">
                          {stats?.completions ?? 0}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Certificates:{" "}
                        <span className="font-medium text-foreground">
                          {stats?.certificates ?? 0}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Builds Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Cloned Builds
                </CardTitle>
                <CardDescription>
                  All member builds cloned from the master system
                </CardDescription>
              </div>
            </div>
            {/* Filters */}
            <div className="flex gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by business name, type, or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="linked">Linked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="provisioning">Provisioning</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBuilds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Rocket className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  {builds.length === 0
                    ? "No builds have been activated yet"
                    : "No builds match your filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBuilds.map((build: any, idx: number) => (
                  <div
                    key={build.id || idx}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {build.businessName || "Unnamed Build"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Type: {build.businessType || "N/A"}
                          </span>
                          <span>•</span>
                          <span>User: {build.userId}</span>
                          {build.createdAt && (
                            <>
                              <span>•</span>
                              <span>
                                {new Date(build.createdAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        build.cloneStatus === "active" ||
                        build.cloneStatus === "linked"
                          ? "default"
                          : build.cloneStatus === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        build.cloneStatus === "active" ||
                        build.cloneStatus === "linked"
                          ? "bg-green-600"
                          : ""
                      }
                    >
                      {build.cloneStatus === "active" && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                      {build.cloneStatus === "linked" && (
                        <Shield className="w-3 h-3 mr-1" />
                      )}
                      {build.cloneStatus === "pending" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {build.cloneStatus === "failed" && (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {build.cloneStatus || "unknown"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Certificate Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificate Issuance by Department
            </CardTitle>
            <CardDescription>
              Certificates issued through the education-first activation system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DEPARTMENT_REGISTRY.filter(
                (d) => d.certificateTypes.length > 0
              ).map((dept) => {
                const stats = deptStats.find(
                  (s: any) => s.departmentId === dept.id
                );
                const certCount = stats?.certificates ?? 0;
                return (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="text-sm font-medium">
                          {dept.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({dept.manager.name})
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {certCount}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {dept.certificateTypes.map((ct) => (
                        <Badge
                          key={ct}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {ct.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
