import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  Send,
  Shield,
  Users,
  XCircle,
} from "lucide-react";

export default function SignatureComplianceAdmin() {
  const [selectedSignatures, setSelectedSignatures] = useState<number[]>([]);
  const [daysFilter, setDaysFilter] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch expiring signatures
  const { data: expiringSignatures, isLoading: loadingExpiring, refetch: refetchExpiring } = 
    trpc.electronicSignature.getAllExpiring.useQuery({
      daysAhead: parseInt(daysFilter),
      includeExpired: true,
    });

  // Fetch users with expiring signatures
  const { data: usersWithExpiring, isLoading: loadingUsers, refetch: refetchUsers } = 
    trpc.electronicSignature.getUsersWithExpiringSignatures.useQuery({
      daysAhead: parseInt(daysFilter),
    });

  // Fetch compliance stats
  const { data: complianceStats, isLoading: loadingStats } = 
    trpc.electronicSignature.getComplianceStats.useQuery();

  // Process notifications mutation
  const processNotifications = trpc.electronicSignature.processExpirationNotifications.useMutation({
    onSuccess: (result) => {
      toast.success(`Processed ${result.processed} signatures, sent ${result.notificationsSent} notifications`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred`);
      }
      refetchExpiring();
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Failed to process notifications: ${error.message}`);
    },
  });

  // Send bulk re-acknowledgment requests
  const sendBulkRequests = trpc.electronicSignature.sendBulkReAcknowledgmentRequests.useMutation({
    onSuccess: (result) => {
      toast.success(`Sent ${result.sent} re-acknowledgment requests`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} errors occurred`);
      }
      setSelectedSignatures([]);
      refetchExpiring();
    },
    onError: (error) => {
      toast.error(`Failed to send requests: ${error.message}`);
    },
  });

  const handleSelectAll = () => {
    if (!expiringSignatures) return;
    if (selectedSignatures.length === expiringSignatures.length) {
      setSelectedSignatures([]);
    } else {
      setSelectedSignatures(expiringSignatures.map(s => s.id));
    }
  };

  const handleSelectSignature = (id: number) => {
    setSelectedSignatures(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleSendBulkRequests = () => {
    if (selectedSignatures.length === 0) {
      toast.error("Please select at least one signature");
      return;
    }
    sendBulkRequests.mutate({ signatureIds: selectedSignatures });
  };

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusBadge = (daysUntilExpiration: number | null) => {
    if (daysUntilExpiration === null) return null;
    
    if (daysUntilExpiration < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntilExpiration <= 7) {
      return <Badge variant="destructive">Expires in {daysUntilExpiration}d</Badge>;
    } else if (daysUntilExpiration <= 14) {
      return <Badge className="bg-amber-500">Expires in {daysUntilExpiration}d</Badge>;
    } else {
      return <Badge variant="secondary">Expires in {daysUntilExpiration}d</Badge>;
    }
  };

  const filteredSignatures = expiringSignatures?.filter(sig => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sig.signerName.toLowerCase().includes(query) ||
      sig.documentTitle?.toLowerCase().includes(query) ||
      sig.documentType.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Signature Compliance Admin
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage signature expirations and re-acknowledgments
            </p>
          </div>
          <Button
            onClick={() => processNotifications.mutate()}
            disabled={processNotifications.isPending}
          >
            {processNotifications.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bell className="w-4 h-4 mr-2" />
            )}
            Process Notifications
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Signatures</p>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : complianceStats?.totalSignatures || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loadingStats ? "..." : complianceStats?.activeCount || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {loadingStats ? "..." : complianceStats?.expiringSoonCount || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {loadingStats ? "..." : complianceStats?.expiredCount || 0}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="signatures" className="space-y-4">
          <TabsList>
            <TabsTrigger value="signatures">Expiring Signatures</TabsTrigger>
            <TabsTrigger value="users">By User</TabsTrigger>
          </TabsList>

          {/* Expiring Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Expiring Signatures</CardTitle>
                    <CardDescription>
                      Signatures requiring attention within the selected timeframe
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="days-filter">Show:</Label>
                      <Select value={daysFilter} onValueChange={setDaysFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bulk Actions */}
                {selectedSignatures.length > 0 && (
                  <div className="flex items-center gap-4 mb-4 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedSignatures.length} selected
                    </span>
                    <Button
                      size="sm"
                      onClick={handleSendBulkRequests}
                      disabled={sendBulkRequests.isPending}
                    >
                      {sendBulkRequests.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Re-acknowledgment Requests
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSignatures([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}

                {loadingExpiring ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredSignatures && filteredSignatures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedSignatures.length === filteredSignatures.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Signer</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Signed</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSignatures.map((sig) => (
                        <TableRow key={sig.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedSignatures.includes(sig.id)}
                              onCheckedChange={() => handleSelectSignature(sig.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{sig.signerName}</p>
                              {sig.signerEmail && (
                                <p className="text-sm text-muted-foreground">{sig.signerEmail}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {sig.documentTitle || "Untitled"}
                          </TableCell>
                          <TableCell>
                            {formatDocumentType(sig.documentType)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(sig.signedAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {sig.expiresAt && format(new Date(sig.expiresAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(sig.daysUntilExpiration)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No signatures expiring within the selected timeframe</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* By User Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Users with Expiring Signatures
                </CardTitle>
                <CardDescription>
                  View compliance status grouped by user
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : usersWithExpiring && usersWithExpiring.length > 0 ? (
                  <div className="space-y-4">
                    {usersWithExpiring.map((user) => (
                      <Card key={user.userId} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{user.userName || "Unknown User"}</h4>
                              {user.email && (
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {user.expiredCount > 0 && (
                                <Badge variant="destructive">
                                  {user.expiredCount} expired
                                </Badge>
                              )}
                              {user.expiringCount > 0 && (
                                <Badge className="bg-amber-500">
                                  {user.expiringCount} expiring
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            {user.signatures.slice(0, 3).map((sig) => (
                              <div
                                key={sig.id}
                                className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                              >
                                <span>{sig.documentTitle || formatDocumentType(sig.documentType)}</span>
                                {getStatusBadge(sig.daysUntilExpiration)}
                              </div>
                            ))}
                            {user.signatures.length > 3 && (
                              <p className="text-sm text-muted-foreground text-center">
                                +{user.signatures.length - 3} more signatures
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>All users are in compliance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notification Schedule Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">30</p>
                <p className="text-sm text-muted-foreground">days before</p>
                <Badge variant="secondary" className="mt-2">Info</Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">14</p>
                <p className="text-sm text-muted-foreground">days before</p>
                <Badge variant="secondary" className="mt-2">Info</Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-muted-foreground">days before</p>
                <Badge className="bg-amber-500 mt-2">Warning</Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">day before</p>
                <Badge variant="destructive" className="mt-2">Urgent</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Notifications are automatically sent at these intervals. Click "Process Notifications" 
              to manually trigger the notification check for any signatures that haven't received 
              their scheduled reminders.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
