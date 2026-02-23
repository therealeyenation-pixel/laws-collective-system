import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileSignature, Search, Download, Filter, CheckCircle2, Clock, AlertCircle, Eye, Shield, User, FileText, Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface SignatureRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  articleId: string;
  articleTitle: string;
  articleType: string;
  department: string;
  readAt: string | null;
  signedAt: string | null;
  signatureHash: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function SignatureAuditReport() {
  const { loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "signed" | "pending">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRecord, setSelectedRecord] = useState<SignatureRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Fetch signatures with filters
  const { data: signaturesData, isLoading: signaturesLoading, refetch } = trpc.signatureAudit.getSignatures.useQuery({
    page,
    pageSize,
    search: searchQuery || undefined,
    department: selectedDepartment !== "All Departments" ? selectedDepartment : undefined,
    articleType: selectedType !== "All Types" ? selectedType : undefined,
    status: selectedStatus,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = trpc.signatureAudit.getMetrics.useQuery();

  // Fetch filter options
  const { data: departments = ["All Departments"] } = trpc.signatureAudit.getDepartments.useQuery();
  const { data: articleTypes = ["All Types"] } = trpc.signatureAudit.getArticleTypes.useQuery();

  const handleViewDetails = (record: SignatureRecord) => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  const handleRefresh = () => {
    refetch();
    utils.signatureAudit.getMetrics.invalidate();
    toast.success("Data refreshed");
  };

  const handleExportCSV = () => {
    if (!signaturesData?.records.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["ID", "User Name", "Email", "Article ID", "Article Title", "Type", "Department", "Read At", "Signed At", "Signature Hash", "IP Address"];
    const rows = signaturesData.records.map((sig) => [
      sig.id,
      sig.userName,
      sig.userEmail,
      sig.articleId,
      sig.articleTitle,
      sig.articleType,
      sig.department,
      sig.readAt || "",
      sig.signedAt || "",
      sig.signatureHash || "",
      sig.ipAddress || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signature-audit-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Audit report exported to CSV");
  };

  const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toLocaleString() : "-";

  const getStatusBadge = (record: SignatureRecord) =>
    record.signedAt ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Signed
      </Badge>
    ) : (
      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      policy: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      compliance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      training: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      announcement: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      procedure: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      news: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      document: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    };
    return <Badge className={colors[type] || colors.document}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileSignature className="w-8 h-8 text-primary" />
              Signature Audit Report
            </h1>
            <p className="text-muted-foreground mt-1">Track and verify all electronic signatures for compliance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={signaturesLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${signaturesLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={handleExportCSV} disabled={!signaturesData?.records.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">
                    {metricsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : metrics?.total || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Signed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metricsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : metrics?.signed || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {metricsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : metrics?.pending || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliance Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metricsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${metrics?.complianceRate || 0}%`}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or document..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={(v) => { setSelectedDepartment(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {articleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v as "all" | "signed" | "pending"); setPage(1); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Signature Records ({signaturesData?.total || 0})
            </CardTitle>
            <CardDescription>Click on a row to view detailed signature information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Read At</TableHead>
                    <TableHead>Signed At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signaturesLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : !signaturesData?.records.length ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No signature records found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    signaturesData.records.map((record) => (
                      <TableRow
                        key={record.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(record)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{record.userName}</p>
                            <p className="text-xs text-muted-foreground">{record.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{record.articleTitle}</p>
                            <p className="text-xs text-muted-foreground">{record.articleId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(record.articleType)}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell className="text-sm">{formatDate(record.readAt)}</TableCell>
                        <TableCell className="text-sm">{formatDate(record.signedAt)}</TableCell>
                        <TableCell>{getStatusBadge(record)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(record);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {signaturesData && signaturesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, signaturesData.total)} of {signaturesData.total} records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {signaturesData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(signaturesData.totalPages, p + 1))}
                    disabled={page === signaturesData.totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-primary" />
                Signature Details
              </DialogTitle>
              <DialogDescription>Complete audit trail for this signature record</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">User Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedRecord.userName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedRecord.userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Document Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Title</p>
                      <p className="font-medium">{selectedRecord.articleTitle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Article ID</p>
                      <p className="font-medium font-mono text-xs">{selectedRecord.articleId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p>{getTypeBadge(selectedRecord.articleType)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Department</p>
                      <p className="font-medium">{selectedRecord.department}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">Signature Verification</span>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">Read At</p>
                        <p className="font-medium">{formatDate(selectedRecord.readAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Signed At</p>
                        <p className="font-medium">{formatDate(selectedRecord.signedAt)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Signature Hash (SHA-256)</p>
                      {selectedRecord.signatureHash ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-background p-2 rounded border font-mono break-all">
                            {selectedRecord.signatureHash}
                          </code>
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                      ) : (
                        <p className="text-amber-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Not yet signed
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground">IP Address</p>
                        <p className="font-medium font-mono">{selectedRecord.ipAddress || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">User Agent</p>
                        <p className="font-medium text-xs truncate" title={selectedRecord.userAgent || ""}>
                          {selectedRecord.userAgent || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-semibold">Verification Status</span>
                  {getStatusBadge(selectedRecord)}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
