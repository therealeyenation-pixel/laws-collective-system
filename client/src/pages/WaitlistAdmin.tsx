import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  Filter,
} from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "confirmed" | "unsubscribed";

export default function WaitlistAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const signupsQuery = trpc.waitlist.listAll.useQuery(undefined, {
    enabled: !!user,
  });

  const updateStatusMutation = trpc.waitlist.updateStatus.useMutation({
    onSuccess: () => {
      signupsQuery.refetch();
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const signups = signupsQuery.data ?? [];

  const filteredSignups = useMemo(() => {
    return signups.filter((s: any) => {
      const matchesSearch =
        !searchTerm ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    const headers = ["Email", "Business Name", "Source", "Status", "Joined"];
    const rows = filteredSignups.map((s: any) => [
      s.email,
      s.businessName || "",
      s.source || "",
      s.status,
      new Date(s.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Exported to CSV");
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
              <h1 className="text-2xl font-bold tracking-tight">Waitlist Management</h1>
            </div>
            <p className="text-muted-foreground text-sm ml-12">
              View and manage people who have signed up to join the collective
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => signupsQuery.refetch()} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Search & Filter */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or business name..."
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
                  : "No waitlist signups yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredSignups.map((signup: any) => (
              <Card key={signup.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-muted rounded-full flex-shrink-0">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{signup.email}</p>
                        <div className="flex items-center gap-3 mt-0.5">
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
                              via {signup.source}
                            </span>
                          )}
                        </div>
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
      </div>
    </DashboardLayout>
  );
}
