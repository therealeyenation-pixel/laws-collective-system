import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileSignature, Search, Download, Filter, CheckCircle2, Clock, AlertCircle, Eye, Shield, User, FileText, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SignatureRecord {
  id: number; userId: number; userName: string; userEmail: string;
  articleId: string; articleTitle: string; articleType: string; department: string;
  readAt: string | null; signedAt: string | null; signatureHash: string | null;
  ipAddress: string | null; userAgent: string | null;
}

const mockSignatures: SignatureRecord[] = [
  { id: 1, userId: 1, userName: "John Smith", userEmail: "john.smith@laws.com", articleId: "policy-001", articleTitle: "Employee Handbook 2026 Update", articleType: "policy", department: "HR", readAt: "2026-01-25T10:30:00Z", signedAt: "2026-01-25T10:32:15Z", signatureHash: "a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  { id: 2, userId: 2, userName: "Sarah Johnson", userEmail: "sarah.johnson@laws.com", articleId: "compliance-002", articleTitle: "Data Privacy Compliance Notice", articleType: "compliance", department: "Legal", readAt: "2026-01-24T14:15:00Z", signedAt: "2026-01-24T14:18:30Z", signatureHash: "b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3", ipAddress: "192.168.1.101", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
  { id: 3, userId: 3, userName: "Michael Brown", userEmail: "michael.brown@laws.com", articleId: "training-003", articleTitle: "Safety Training Certification", articleType: "training", department: "Operations", readAt: "2026-01-23T09:00:00Z", signedAt: null, signatureHash: null, ipAddress: null, userAgent: null },
  { id: 4, userId: 4, userName: "Emily Davis", userEmail: "emily.davis@laws.com", articleId: "announcement-004", articleTitle: "Q1 2026 Company Goals", articleType: "announcement", department: "Executive", readAt: "2026-01-22T16:45:00Z", signedAt: "2026-01-22T16:48:00Z", signatureHash: "c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4", ipAddress: "192.168.1.102", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)" },
  { id: 5, userId: 1, userName: "John Smith", userEmail: "john.smith@laws.com", articleId: "procedure-005", articleTitle: "New Expense Reporting Procedure", articleType: "procedure", department: "Finance", readAt: "2026-01-21T11:20:00Z", signedAt: "2026-01-21T11:25:00Z", signatureHash: "d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
];

const departments = ["All Departments", "HR", "Legal", "Finance", "Operations", "IT", "Executive", "Marketing", "Education"];
const articleTypes = ["All Types", "policy", "compliance", "training", "announcement", "procedure", "news"];

export default function SignatureAuditReport() {
  const { loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SignatureRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const filteredSignatures = mockSignatures.filter((sig) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!sig.userName.toLowerCase().includes(query) && !sig.userEmail.toLowerCase().includes(query) && !sig.articleTitle.toLowerCase().includes(query) && !sig.articleId.toLowerCase().includes(query)) return false;
    }
    if (selectedDepartment !== "All Departments" && sig.department !== selectedDepartment) return false;
    if (selectedType !== "All Types" && sig.articleType !== selectedType) return false;
    if (selectedStatus === "signed" && !sig.signedAt) return false;
    if (selectedStatus === "pending" && sig.signedAt) return false;
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      const recordDate = new Date(sig.readAt || sig.signedAt || "");
      if (recordDate < fromDate) return false;
    }
    return true;
  });

  const signedCount = mockSignatures.filter((s) => s.signedAt).length;
  const pendingCount = mockSignatures.filter((s) => !s.signedAt).length;

  const handleViewDetails = (record: SignatureRecord) => { setSelectedRecord(record); setShowDetailDialog(true); };

  const handleExportCSV = () => {
    const headers = ["ID", "User Name", "Email", "Article ID", "Article Title", "Type", "Department", "Read At", "Signed At", "Signature Hash", "IP Address"];
    const rows = filteredSignatures.map((sig) => [sig.id, sig.userName, sig.userEmail, sig.articleId, sig.articleTitle, sig.articleType, sig.department, sig.readAt || "", sig.signedAt || "", sig.signatureHash || "", sig.ipAddress || ""]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signature-audit-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Audit report exported to CSV");
  };

  const formatDate = (dateStr: string | null) => dateStr ? new Date(dateStr).toLocaleString() : "-";

  const getStatusBadge = (record: SignatureRecord) => record.signedAt
    ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />Signed</Badge>
    : <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      policy: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      compliance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      training: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      announcement: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      procedure: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      news: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return <Badge className={colors[type] || colors.news}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
  };

  if (authLoading) {
    return <DashboardLayout><div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><FileSignature className="w-8 h-8 text-primary" />Signature Audit Report</h1>
            <p className="text-muted-foreground mt-1">Track and verify all electronic signatures for compliance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info("Refreshing data...")}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
            <Button onClick={handleExportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Records</p><p className="text-2xl font-bold">{mockSignatures.length}</p></div><FileText className="w-8 h-8 text-muted-foreground" /></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Signed</p><p className="text-2xl font-bold text-green-600">{signedCount}</p></div><CheckCircle2 className="w-8 h-8 text-green-500" /></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-600">{pendingCount}</p></div><Clock className="w-8 h-8 text-amber-500" /></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Compliance Rate</p><p className="text-2xl font-bold text-blue-600">{Math.round((signedCount / mockSignatures.length) * 100)}%</p></div><Shield className="w-8 h-8 text-blue-500" /></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Filter className="w-5 h-5" />Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="search" placeholder="Search by name, email, or document..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              </div>
              <div><Label>Department</Label><Select value={selectedDepartment} onValueChange={setSelectedDepartment}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{departments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent></Select></div>
              <div><Label>Type</Label><Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{articleTypes.map((type) => (<SelectItem key={type} value={type}>{type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>))}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={selectedStatus} onValueChange={setSelectedStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="signed">Signed</SelectItem><SelectItem value="pending">Pending</SelectItem></SelectContent></Select></div>
              <div><Label>Date From</Label><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Signature Records ({filteredSignatures.length})</CardTitle><CardDescription>Click on a row to view detailed signature information</CardDescription></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead><TableHead>Document</TableHead><TableHead>Type</TableHead><TableHead>Department</TableHead><TableHead>Read At</TableHead><TableHead>Signed At</TableHead><TableHead>Status</TableHead><TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignatures.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No signature records found matching your criteria</TableCell></TableRow>
                  ) : (
                    filteredSignatures.map((record) => (
                      <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(record)}>
                        <TableCell><div><p className="font-medium">{record.userName}</p><p className="text-xs text-muted-foreground">{record.userEmail}</p></div></TableCell>
                        <TableCell><div><p className="font-medium text-sm">{record.articleTitle}</p><p className="text-xs text-muted-foreground">{record.articleId}</p></div></TableCell>
                        <TableCell>{getTypeBadge(record.articleType)}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell className="text-sm">{formatDate(record.readAt)}</TableCell>
                        <TableCell className="text-sm">{formatDate(record.signedAt)}</TableCell>
                        <TableCell>{getStatusBadge(record)}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(record); }}><Eye className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><FileSignature className="w-5 h-5 text-primary" />Signature Details</DialogTitle>
              <DialogDescription>Complete audit trail for this signature record</DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3"><User className="w-5 h-5 text-muted-foreground" /><span className="font-semibold">User Information</span></div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Name</p><p className="font-medium">{selectedRecord.userName}</p></div>
                    <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedRecord.userEmail}</p></div>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3"><FileText className="w-5 h-5 text-muted-foreground" /><span className="font-semibold">Document Information</span></div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Title</p><p className="font-medium">{selectedRecord.articleTitle}</p></div>
                    <div><p className="text-muted-foreground">Article ID</p><p className="font-medium font-mono text-xs">{selectedRecord.articleId}</p></div>
                    <div><p className="text-muted-foreground">Type</p><p>{getTypeBadge(selectedRecord.articleType)}</p></div>
                    <div><p className="text-muted-foreground">Department</p><p className="font-medium">{selectedRecord.department}</p></div>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3"><Shield className="w-5 h-5 text-muted-foreground" /><span className="font-semibold">Signature Verification</span></div>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-muted-foreground">Read At</p><p className="font-medium">{formatDate(selectedRecord.readAt)}</p></div>
                      <div><p className="text-muted-foreground">Signed At</p><p className="font-medium">{formatDate(selectedRecord.signedAt)}</p></div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Signature Hash (SHA-256)</p>
                      {selectedRecord.signatureHash ? (
                        <div className="flex items-center gap-2"><code className="text-xs bg-background p-2 rounded border font-mono break-all">{selectedRecord.signatureHash}</code><CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /></div>
                      ) : (
                        <p className="text-amber-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Not yet signed</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-muted-foreground">IP Address</p><p className="font-medium font-mono">{selectedRecord.ipAddress || "-"}</p></div>
                      <div><p className="text-muted-foreground">User Agent</p><p className="font-medium text-xs truncate" title={selectedRecord.userAgent || ""}>{selectedRecord.userAgent || "-"}</p></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg"><span className="font-semibold">Verification Status</span>{getStatusBadge(selectedRecord)}</div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
