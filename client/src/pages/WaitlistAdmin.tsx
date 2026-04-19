import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Search,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  UserPlus,
  BarChart3,
  TrendingUp,
  Share2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Shield,
  Wrench,
  Heart,
  User,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "confirmed" | "unsubscribed";

const INTEREST_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  membership: { label: "Collective Membership", icon: <Shield className="w-4 h-4" />, color: "text-amber-600" },
  academy: { label: "Academy & Education", icon: <GraduationCap className="w-4 h-4" />, color: "text-blue-600" },
  services: { label: "Professional Services", icon: <Briefcase className="w-4 h-4" />, color: "text-emerald-600" },
  business_tools: { label: "Business & Financial Tools", icon: <Wrench className="w-4 h-4" />, color: "text-purple-600" },
  smart_contracts: { label: "Smart Contracts & Blockchain", icon: <BookOpen className="w-4 h-4" />, color: "text-cyan-600" },
  community: { label: "Community & Networking", icon: <Heart className="w-4 h-4" />, color: "text-rose-600" },
};

const SOURCE_LABELS: Record<string, string> = {
  landing_page: "Landing Page",
  qr_code: "QR Code Flyer",
  referral: "Referral",
  social_media: "Social Media",
  direct: "Direct",
};

export default function WaitlistAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const signupsQuery = trpc.waitlist.listAll.useQuery(undefined, {
    enabled: !!user,
  });

  const analyticsQuery = trpc.waitlist.getAnalytics.useQuery(undefined, {
    enabled: !!user,
  });

  const updateStatusMutation = trpc.waitlist.updateStatus.useMutation({
    onSuccess: () => {
      signupsQuery.refetch();
      analyticsQuery.refetch();
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const signups = signupsQuery.data ?? [];
  const analytics = analyticsQuery.data;

  const filteredSignups = useMemo(() => {
    return signups.filter((s: any) => {
      const matchesSearch =
        !searchTerm ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.fullName && s.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.businessName && s.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [signups, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = signups.length;
    const pending = signups.filter((s: any) => s.status === "pending").length;
    const confirmed = signups.filter((s: any) => s.status === "confirmed").length;
    const unsubscribed = signups.filter((s: any) => s.status === "unsubscribed").length;
    return { total, pending, confirmed, unsubscribed };
  }, [signups]);

  const handleExportCSV = () => {
    if (filteredSignups.length === 0) {
      toast.error("No signups to export");
      return;
    }
    const headers = ["Name", "Email", "Business Name", "Interests", "Source", "Referral Code", "Status", "Joined"];
    const rows = filteredSignups.map((s: any) => [
      s.fullName || "",
      s.email,
      s.businessName || "",
      (s.interestCategories || []).join("; "),
      s.source || "",
      s.referralCode || "",
      s.status,
      new Date(s.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Exported to CSV");
  };

  const handleCopyWaitlistLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/waitlist`);
    toast.success("Waitlist link copied to clipboard");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Confirmed</Badge>;
      case "unsubscribed":
        return <Badge variant="secondary" className="text-muted-foreground">Unsubscribed</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Waitlist Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              Track pre-launch interest and manage waitlist signups
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyWaitlistLink} className="gap-2">
              <Share2 className="w-3.5 h-3.5" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signupsQuery.refetch();
                analyticsQuery.refetch();
              }}
              className="gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer" onClick={() => setStatusFilter("all")}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Signups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setStatusFilter("pending")}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setStatusFilter("confirmed")}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-2xl font-bold">{analytics?.referralCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Via Referral</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setStatusFilter("unsubscribed")}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{stats.unsubscribed}</p>
                  <p className="text-xs text-muted-foreground">Unsubscribed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Analytics / Signups */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="signups" className="gap-2">
              <Users className="w-4 h-4" />
              All Signups
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Interest Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Interest Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && Object.keys(analytics.interestCounts).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.interestCounts)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([key, count]) => {
                          const info = INTEREST_LABELS[key] || { label: key, icon: <BookOpen className="w-4 h-4" />, color: "text-muted-foreground" };
                          const percentage = analytics.totalSignups > 0 ? Math.round(((count as number) / analytics.totalSignups) * 100) : 0;
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <div className={`flex-shrink-0 ${info.color}`}>{info.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium truncate">{info.label}</span>
                                  <span className="text-sm text-muted-foreground ml-2">{count as number} ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-amber-500 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">No interest data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Source Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-cyan-600" />
                    Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics && Object.keys(analytics.sourceCounts).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(analytics.sourceCounts)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([key, count]) => {
                          const label = SOURCE_LABELS[key] || key;
                          const percentage = analytics.totalSignups > 0 ? Math.round(((count as number) / analytics.totalSignups) * 100) : 0;
                          return (
                            <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                              <span className="text-sm font-medium">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{count as number}</span>
                                <Badge variant="secondary" className="text-xs">{percentage}%</Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">No source data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Daily Signups Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Signups — Last 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && Object.keys(analytics.dailySignups).length > 0 ? (
                  <div className="flex items-end gap-1 h-32">
                    {Object.entries(analytics.dailySignups).map(([date, count]) => {
                      const maxCount = Math.max(...Object.values(analytics.dailySignups).map(v => v as number), 1);
                      const height = maxCount > 0 ? Math.max(((count as number) / maxCount) * 100, 2) : 2;
                      const isToday = date === new Date().toISOString().slice(0, 10);
                      return (
                        <div
                          key={date}
                          className="flex-1 group relative"
                          title={`${date}: ${count} signup${(count as number) !== 1 ? "s" : ""}`}
                        >
                          <div
                            className={`w-full rounded-t transition-all ${
                              (count as number) > 0
                                ? isToday
                                  ? "bg-amber-500"
                                  : "bg-amber-500/60"
                                : "bg-muted"
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No signup data yet</p>
                )}
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">30 days ago</span>
                  <span className="text-xs text-muted-foreground">Today</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={handleCopyWaitlistLink}
                  >
                    <Share2 className="w-5 h-5 text-amber-600" />
                    <span className="text-sm">Copy Waitlist Link</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => window.open("/laws-collective-waitlist-flyer.png", "_blank")}
                  >
                    <QrCode className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm">View QR Flyer</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={handleExportCSV}
                  >
                    <Download className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Export All Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signups Tab */}
          <TabsContent value="signups" className="mt-6 space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "pending", "confirmed", "unsubscribed"] as StatusFilter[]).map((f) => (
                  <Button
                    key={f}
                    variant={statusFilter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>

            {/* Signups List */}
            {signupsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSignups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "No signups match your filters"
                      : "No waitlist signups yet. Share your waitlist link to start collecting interest!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{filteredSignups.length} result{filteredSignups.length !== 1 ? "s" : ""}</p>
                {filteredSignups.map((signup: any) => (
                  <Card key={signup.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 bg-muted rounded-full flex-shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {signup.fullName || signup.email}
                              </p>
                              {signup.referralCode && (
                                <Badge variant="secondary" className="text-xs flex-shrink-0">Referred</Badge>
                              )}
                            </div>
                            {signup.fullName && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {signup.email}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {signup.businessName && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {signup.businessName}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(signup.createdAt).toLocaleDateString()}
                              </span>
                              {signup.source && (
                                <span className="text-xs text-muted-foreground">
                                  via {SOURCE_LABELS[signup.source] || signup.source}
                                </span>
                              )}
                            </div>
                            {/* Interest tags */}
                            {signup.interestCategories && signup.interestCategories.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {signup.interestCategories.map((cat: string) => {
                                  const info = INTEREST_LABELS[cat];
                                  return (
                                    <Badge key={cat} variant="secondary" className="text-xs">
                                      {info?.label || cat}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {statusBadge(signup.status)}
                          {signup.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: signup.id,
                                  status: "confirmed",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              className="gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
