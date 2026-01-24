import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart3,
  Users,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Filter,
  Building2,
  Home,
  Gamepad2,
} from "lucide-react";
import { toast } from "sonner";

export default function GamingComplianceReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("weekly");

  const { data: departmentStats } = trpc.employeeGaming.getDepartmentCompliance.useQuery({
    period: selectedPeriod as any,
  });

  const { data: individualLeaderboard } = trpc.employeeGaming.getLeaderboard.useQuery({
    type: "individual",
    period: selectedPeriod as any,
    limit: 20,
  });

  const { data: houseLeaderboard } = trpc.employeeGaming.getLeaderboard.useQuery({
    type: "house",
    period: selectedPeriod as any,
    limit: 10,
  });

  const { data: departmentLeaderboard } = trpc.employeeGaming.getLeaderboard.useQuery({
    type: "department",
    period: selectedPeriod as any,
    limit: 10,
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const getComplianceColor = (percent: number) => {
    if (percent >= 100) return "text-green-500";
    if (percent >= 75) return "text-yellow-500";
    if (percent >= 50) return "text-orange-500";
    return "text-red-500";
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case "exceeded": return <Badge className="bg-green-500">Exceeded</Badge>;
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress": return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "not_started": return <Badge variant="destructive">Not Started</Badge>;
      case "excused": return <Badge variant="secondary">Excused</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportCSVMutation = trpc.employeeGaming.exportComplianceCSV.useQuery({}, {
    enabled: false,
  });

  const handleExportCSV = async () => {
    try {
      const result = await exportCSVMutation.refetch();
      if (result.data) {
        const blob = new Blob([result.data.content], { type: result.data.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("CSV report downloaded!");
      }
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleExportPDF = async () => {
    toast.info("PDF export coming soon - use CSV for now");
  };

  // Calculate overall stats
  const overallStats = departmentStats ? {
    totalEmployees: departmentStats.reduce((sum, d) => sum + d.totalEmployees, 0),
    compliant: departmentStats.reduce((sum, d) => sum + d.compliantCount, 0),
    inProgress: departmentStats.reduce((sum, d) => sum + d.inProgressCount, 0),
    notStarted: departmentStats.reduce((sum, d) => sum + d.notStartedCount, 0),
    avgCompletionRate: departmentStats.length > 0 
      ? Math.round(departmentStats.reduce((sum, d) => sum + d.avgCompletionPercent, 0) / departmentStats.length)
      : 0,
  } : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gaming Compliance Reports</h1>
            <p className="text-muted-foreground">
              Monitor employee gaming requirement compliance and team performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="quarterly">This Quarter</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {overallStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.totalEmployees}</p>
                    <p className="text-xs text-muted-foreground">Total Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.compliant}</p>
                    <p className="text-xs text-muted-foreground">Compliant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.notStarted}</p>
                    <p className="text-xs text-muted-foreground">Not Started</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{overallStats.avgCompletionRate}%</p>
                    <p className="text-xs text-muted-foreground">Avg Completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Department Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual Rankings</TabsTrigger>
            <TabsTrigger value="house">House Rankings</TabsTrigger>
            <TabsTrigger value="department">Department Rankings</TabsTrigger>
          </TabsList>

          {/* Department Overview */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Department Compliance
                </CardTitle>
                <CardDescription>
                  Gaming requirement completion by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {departmentStats && departmentStats.length > 0 ? (
                  <div className="space-y-4">
                    {departmentStats.map((dept) => (
                      <div key={dept.departmentId} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{dept.departmentName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {dept.totalEmployees} employees
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getComplianceColor(dept.avgCompletionPercent)}`}>
                              {dept.avgCompletionPercent}%
                            </p>
                            <p className="text-xs text-muted-foreground">avg completion</p>
                          </div>
                        </div>
                        <Progress value={dept.avgCompletionPercent} className="h-2 mb-3" />
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                            {dept.compliantCount} compliant
                          </span>
                          <span className="flex items-center gap-1 text-yellow-500">
                            <AlertCircle className="w-4 h-4" />
                            {dept.inProgressCount} in progress
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-4 h-4" />
                            {dept.notStartedCount} not started
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No department data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Rankings */}
          <TabsContent value="individual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Individual Leaderboard
                </CardTitle>
                <CardDescription>
                  Top performers by gaming activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {individualLeaderboard && individualLeaderboard.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">Games</TableHead>
                        <TableHead className="text-center">Wins</TableHead>
                        <TableHead className="text-center">Time Played</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {individualLeaderboard.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              entry.rank === 1 ? "bg-yellow-500 text-yellow-950" :
                              entry.rank === 2 ? "bg-gray-300 text-gray-800" :
                              entry.rank === 3 ? "bg-amber-600 text-amber-950" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {entry.rank}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">Player #{entry.userId}</TableCell>
                          <TableCell className="text-center">{entry.totalGamesPlayed}</TableCell>
                          <TableCell className="text-center">{entry.totalWins}</TableCell>
                          <TableCell className="text-center">{formatDuration(entry.totalMinutesPlayed)}</TableCell>
                          <TableCell className="text-right font-bold">{entry.totalScore}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No leaderboard data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* House Rankings */}
          <TabsContent value="house" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  House Leaderboard
                </CardTitle>
                <CardDescription>
                  House vs House competition standings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {houseLeaderboard && houseLeaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {houseLeaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          entry.rank <= 3 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1 ? "bg-yellow-500 text-yellow-950" :
                            entry.rank === 2 ? "bg-gray-300 text-gray-800" :
                            entry.rank === 3 ? "bg-amber-600 text-amber-950" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-semibold">House #{entry.houseId}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.totalGamesPlayed} games • {entry.totalWins} wins
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{entry.totalScore}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(entry.totalMinutesPlayed)} played
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No house competition data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Rankings */}
          <TabsContent value="department" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Department Leaderboard
                </CardTitle>
                <CardDescription>
                  Department vs Department competition standings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {departmentLeaderboard && departmentLeaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {departmentLeaderboard.map((entry) => (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          entry.rank <= 3 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1 ? "bg-yellow-500 text-yellow-950" :
                            entry.rank === 2 ? "bg-gray-300 text-gray-800" :
                            entry.rank === 3 ? "bg-amber-600 text-amber-950" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {entry.rank}
                          </div>
                          <div>
                            <p className="font-semibold">Department #{entry.departmentId}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.totalGamesPlayed} games • {entry.totalWins} wins
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{entry.totalScore}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(entry.totalMinutesPlayed)} played
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No department competition data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
