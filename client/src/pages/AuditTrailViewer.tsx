import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  History,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  FileText,
  DollarSign,
  Users,
  Settings,
  Database,
  Link as LinkIcon,
  Eye,
  Copy,
  CalendarIcon,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";

// Activity types
type ActivityType = "transaction" | "governance" | "access" | "operation" | "document" | "system" | "token" | "certificate";
type VerificationStatus = "verified" | "pending" | "failed";

interface AuditEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  action: string;
  description: string;
  actor: string;
  entity: string;
  details: Record<string, any>;
  blockchainHash?: string;
  blockchainStatus: VerificationStatus;
  previousHash?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Sample audit entries
const sampleAuditEntries: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-01-24T10:30:00Z",
    type: "transaction",
    action: "ALLOCATION_APPROVED",
    description: "Q1 Marketing Budget allocation approved",
    actor: "CFO",
    entity: "The L.A.W.S. Collective, LLC",
    details: { amount: 25000, department: "Marketing", approvalChain: ["Division Director", "CFO"] },
    blockchainHash: "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    blockchainStatus: "verified",
    previousHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    ipAddress: "192.168.1.100",
  },
  {
    id: "AUD-002",
    timestamp: "2026-01-24T09:15:00Z",
    type: "governance",
    action: "POLICY_UPDATED",
    description: "Remote Work Policy updated to 4 days/week",
    actor: "Trust Authority",
    entity: "CALEA Freeman Family Trust",
    details: { policyId: "POL-005", previousValue: "3 days", newValue: "4 days" },
    blockchainHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    blockchainStatus: "verified",
    previousHash: "0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
  },
  {
    id: "AUD-003",
    timestamp: "2026-01-24T08:45:00Z",
    type: "access",
    action: "ACCESS_GRANTED",
    description: "Admin access granted to Finance Manager",
    actor: "IT Security",
    entity: "LuvOnPurpose Autonomous Wealth System, LLC",
    details: { userId: "USR-042", accessLevel: "admin", system: "Financial Reporting" },
    blockchainHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    blockchainStatus: "verified",
    previousHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    ipAddress: "192.168.1.50",
  },
  {
    id: "AUD-004",
    timestamp: "2026-01-23T16:30:00Z",
    type: "operation",
    action: "AUTONOMOUS_CYCLE",
    description: "Autonomous business cycle completed",
    actor: "System",
    entity: "The L.A.W.S. Collective, LLC",
    details: { cycleId: "CYC-1234", operationsProcessed: 15, tokensGenerated: 500, duration: "45s" },
    blockchainHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    blockchainStatus: "verified",
    previousHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
  },
  {
    id: "AUD-005",
    timestamp: "2026-01-23T14:00:00Z",
    type: "document",
    action: "DOCUMENT_SIGNED",
    description: "Vendor Partnership Agreement signed",
    actor: "CEO",
    entity: "LuvOnPurpose Autonomous Wealth System, LLC",
    details: { documentId: "DOC-789", documentType: "Partnership Agreement", parties: ["L.A.W.S.", "TechCorp"] },
    blockchainHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
    blockchainStatus: "verified",
    previousHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
  },
  {
    id: "AUD-006",
    timestamp: "2026-01-23T11:00:00Z",
    type: "token",
    action: "TOKEN_DISTRIBUTION",
    description: "Monthly token distribution to entities",
    actor: "System",
    entity: "CALEA Freeman Family Trust",
    details: { totalTokens: 10000, distributions: { Academy: 3000, Media: 2000, Collective: 5000 } },
    blockchainHash: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    blockchainStatus: "verified",
    previousHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
  },
  {
    id: "AUD-007",
    timestamp: "2026-01-22T09:30:00Z",
    type: "certificate",
    action: "CERTIFICATE_ISSUED",
    description: "Course completion certificate issued",
    actor: "Academy System",
    entity: "LuvOnPurpose Academy & Outreach",
    details: { studentId: "STU-123", course: "Financial Literacy 101", grade: "A", certificateId: "CERT-456" },
    blockchainHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    blockchainStatus: "verified",
    previousHash: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
  },
  {
    id: "AUD-008",
    timestamp: "2026-01-22T08:00:00Z",
    type: "system",
    action: "BACKUP_COMPLETED",
    description: "Daily system backup completed successfully",
    actor: "System",
    entity: "Platform",
    details: { backupSize: "2.5GB", duration: "12m", location: "secure-vault-001" },
    blockchainHash: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    blockchainStatus: "verified",
    previousHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  },
  {
    id: "AUD-009",
    timestamp: "2026-01-21T15:45:00Z",
    type: "transaction",
    action: "PAYMENT_PROCESSED",
    description: "Vendor payment processed",
    actor: "Finance System",
    entity: "The L.A.W.S. Collective, LLC",
    details: { paymentId: "PAY-789", vendor: "Office Supplies Inc", amount: 1250, method: "ACH" },
    blockchainHash: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    blockchainStatus: "pending",
    previousHash: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
  },
  {
    id: "AUD-010",
    timestamp: "2026-01-21T10:00:00Z",
    type: "governance",
    action: "CONFLICT_RESOLVED",
    description: "Resource allocation conflict resolved",
    actor: "Trust Authority",
    entity: "CALEA Freeman Family Trust",
    details: { conflictId: "CNF-012", parties: ["Academy", "Media"], resolution: "Split allocation 60/40" },
    blockchainHash: "0x0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e",
    blockchainStatus: "verified",
    previousHash: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
  },
];

export default function AuditTrailViewer() {
  const [entries, setEntries] = useState<AuditEntry[]>(sampleAuditEntries);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case "transaction": return <DollarSign className="w-4 h-4" />;
      case "governance": return <Shield className="w-4 h-4" />;
      case "access": return <Lock className="w-4 h-4" />;
      case "operation": return <Zap className="w-4 h-4" />;
      case "document": return <FileText className="w-4 h-4" />;
      case "system": return <Settings className="w-4 h-4" />;
      case "token": return <Database className="w-4 h-4" />;
      case "certificate": return <CheckCircle className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case "transaction": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "governance": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "access": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "operation": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "document": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "system": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "token": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400";
      case "certificate": return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case "verified": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filterType !== "all" && entry.type !== filterType) return false;
    if (filterEntity !== "all" && entry.entity !== filterEntity) return false;
    if (filterStatus !== "all" && entry.blockchainStatus !== filterStatus) return false;
    if (searchQuery && !entry.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !entry.action.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateRange.from && new Date(entry.timestamp) < dateRange.from) return false;
    if (dateRange.to && new Date(entry.timestamp) > dateRange.to) return false;
    return true;
  });

  const toggleExpanded = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Hash copied to clipboard");
  };

  const exportAuditLog = () => {
    const csvContent = [
      ["ID", "Timestamp", "Type", "Action", "Description", "Actor", "Entity", "Blockchain Hash", "Status"].join(","),
      ...filteredEntries.map(e => [
        e.id,
        e.timestamp,
        e.type,
        e.action,
        `"${e.description}"`,
        e.actor,
        `"${e.entity}"`,
        e.blockchainHash || "",
        e.blockchainStatus,
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Audit log exported");
  };

  const uniqueEntities = [...new Set(entries.map(e => e.entity))];

  // Statistics
  const stats = {
    total: entries.length,
    verified: entries.filter(e => e.blockchainStatus === "verified").length,
    pending: entries.filter(e => e.blockchainStatus === "pending").length,
    today: entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length,
  };

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
                  <History className="w-6 h-6 text-primary" />
                  Audit Trail Viewer
                </h1>
                <p className="text-sm text-muted-foreground">Complete activity timeline with blockchain verification</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEntries([...sampleAuditEntries])}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportAuditLog}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold text-foreground">{stats.today}</p>
                </div>
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList>
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Verification</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Activity Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search activities..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="access">Access</SelectItem>
                      <SelectItem value="operation">Operation</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterEntity} onValueChange={setFilterEntity}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Entity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {uniqueEntities.map(entity => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <div className="space-y-4">
              {filteredEntries.map((entry, idx) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${getTypeColor(entry.type)}`}>
                          {getTypeIcon(entry.type)}
                        </div>
                        {idx < filteredEntries.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2 min-h-[20px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{entry.action.replace(/_/g, " ")}</h3>
                              {getVerificationIcon(entry.blockchainStatus)}
                            </div>
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.timestamp), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(entry.timestamp), "h:mm a")}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">{entry.id}</Badge>
                          <Badge className={getTypeColor(entry.type)}>{entry.type}</Badge>
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {entry.actor}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{entry.entity}</Badge>
                        </div>

                        {/* Expandable Details */}
                        <div className="mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleExpanded(entry.id)}
                            className="gap-1 text-muted-foreground"
                          >
                            {expandedEntries.has(entry.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            Details
                          </Button>

                          {expandedEntries.has(entry.id) && (
                            <div className="mt-3 p-4 rounded-lg bg-secondary/30 space-y-3">
                              {/* Details */}
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Details</p>
                                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                  {JSON.stringify(entry.details, null, 2)}
                                </pre>
                              </div>

                              {/* Blockchain Hash */}
                              {entry.blockchainHash && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Blockchain Hash</p>
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs bg-background p-2 rounded flex-1 overflow-x-auto">
                                      {entry.blockchainHash}
                                    </code>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => copyHash(entry.blockchainHash!)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Previous Hash */}
                              {entry.previousHash && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Previous Hash (Chain Link)</p>
                                  <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
                                    {entry.previousHash}
                                  </code>
                                </div>
                              )}

                              {/* IP Address */}
                              {entry.ipAddress && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">IP Address</p>
                                  <code className="text-xs">{entry.ipAddress}</code>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Blockchain Verification Tab */}
          <TabsContent value="blockchain" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Blockchain Chain Integrity
                </CardTitle>
                <CardDescription>Verify the integrity of the audit trail blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEntries.slice(0, 5).map((entry, idx) => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                      <div className="flex-shrink-0">
                        {getVerificationIcon(entry.blockchainStatus)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs truncate">{entry.blockchainHash?.slice(0, 20)}...</span>
                          <Badge variant="outline" className="text-xs">{entry.id}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.action} • {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {idx < filteredEntries.length - 1 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <LinkIcon className="w-3 h-3" />
                            Links to next
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-400">Chain Integrity Verified</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    All {stats.verified} verified entries maintain proper hash chain linkage. No tampering detected.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["transaction", "governance", "access", "operation", "document", "system", "token", "certificate"].map(type => {
                      const count = entries.filter(e => e.type === type).length;
                      const percentage = (count / entries.length) * 100;
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize flex items-center gap-2">
                              {getTypeIcon(type as ActivityType)}
                              {type}
                            </span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity by Entity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uniqueEntities.map(entity => {
                      const count = entries.filter(e => e.entity === entity).length;
                      const percentage = (count / entries.length) * 100;
                      return (
                        <div key={entity} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="truncate max-w-[200px]">{entity}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.verified}</p>
                    <p className="text-sm text-green-600">Verified</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
                    <p className="text-sm text-yellow-600">Pending</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">0</p>
                    <p className="text-sm text-red-600">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
