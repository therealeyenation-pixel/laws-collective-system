import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Bell,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ExpiringDocument {
  id: number;
  title: string;
  fileName: string;
  category: string;
  categoryLabel: string;
  entityId: string;
  entityName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  createdAt: string;
  fileUrl: string;
  isExpired: boolean;
  isWarning: boolean;
  warningDays: number;
}

interface DocumentExpirationAlertProps {
  entityId?: string; // Optional filter by entity
  showSummary?: boolean; // Show summary card
  compact?: boolean; // Compact mode for sidebar
  maxItems?: number; // Max items to show
  onViewAll?: () => void; // Callback when "View All" is clicked
}

export function DocumentExpirationAlert({
  entityId,
  showSummary = true,
  compact = false,
  maxItems = 5,
  onViewAll,
}: DocumentExpirationAlertProps) {
  const [selectedDoc, setSelectedDoc] = useState<ExpiringDocument | null>(null);
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const { data: expiringData, isLoading, refetch } = trpc.grantDocuments.getExpiringDocuments.useQuery({
    entityId,
    daysAhead: 60, // Check 60 days ahead
  });

  const updateExpiration = trpc.grantDocuments.updateExpiration.useMutation({
    onSuccess: () => {
      toast.success("Expiration date updated successfully");
      setIsUpdateDialogOpen(false);
      setSelectedDoc(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update expiration: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking document expirations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { expiring = [], expired = [], summary } = expiringData || {};
  const totalAlerts = expiring.length + expired.length;

  if (totalAlerts === 0 && !showSummary) {
    return null;
  }

  const handleUpdateExpiration = () => {
    if (!selectedDoc || !newExpirationDate) return;
    updateExpiration.mutate({
      documentId: selectedDoc.id,
      expiresAt: new Date(newExpirationDate).toISOString(),
    });
  };

  const openUpdateDialog = (doc: ExpiringDocument) => {
    setSelectedDoc(doc);
    // Default to 1 year from now
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    setNewExpirationDate(defaultDate.toISOString().split("T")[0]);
    setIsUpdateDialogOpen(true);
  };

  const formatDaysRemaining = (days: number) => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return "Expires today";
    } else if (days === 1) {
      return "Expires tomorrow";
    } else {
      return `${days} days remaining`;
    }
  };

  const getStatusBadge = (doc: ExpiringDocument) => {
    if (doc.isExpired) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Expired</Badge>;
    } else if (doc.isWarning) {
      return <Badge variant="default" className="gap-1 bg-amber-500"><AlertTriangle className="w-3 h-3" />Expiring Soon</Badge>;
    } else {
      return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Upcoming</Badge>;
    }
  };

  // Compact mode for sidebar/widget
  if (compact) {
    if (totalAlerts === 0) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>All documents up to date</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {expired.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              {expired.length} expired document{expired.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        {expiring.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {expiring.length} expiring soon
            </span>
          </div>
        )}
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="w-full gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Full display mode
  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {showSummary && (
        <Card className={totalAlerts > 0 ? "border-amber-200 dark:border-amber-800" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className={`w-5 h-5 ${totalAlerts > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
                <CardTitle className="text-lg">Document Expiration Alerts</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-1">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
            <CardDescription>
              Track document validity and renewal deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expired.length}</p>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary?.urgentCount || 0}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{expiring.length}</p>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Documents */}
      {expired.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <CardTitle className="text-base text-red-700 dark:text-red-300">
                Expired Documents ({expired.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {expired.slice(0, maxItems).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{doc.entityName}</span>
                      <span>•</span>
                      <span>{doc.categoryLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {formatDaysRemaining(doc.daysUntilExpiration)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUpdateDialog(doc)}
                    className="gap-1"
                  >
                    <Calendar className="w-3 h-3" />
                    Renew
                  </Button>
                </div>
              </div>
            ))}
            {expired.length > maxItems && (
              <Button variant="ghost" size="sm" onClick={onViewAll} className="w-full">
                View all {expired.length} expired documents
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon Documents */}
      {expiring.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-base text-amber-700 dark:text-amber-300">
                Expiring Soon ({expiring.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {expiring.slice(0, maxItems).map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  doc.isWarning
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900"
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className={`w-5 h-5 flex-shrink-0 ${doc.isWarning ? "text-amber-500" : "text-muted-foreground"}`} />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{doc.entityName}</span>
                      <span>•</span>
                      <span>{doc.categoryLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(doc)}
                  <span className={`text-xs font-medium ${doc.isWarning ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                    {formatDaysRemaining(doc.daysUntilExpiration)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {expiring.length > maxItems && (
              <Button variant="ghost" size="sm" onClick={onViewAll} className="w-full">
                View all {expiring.length} expiring documents
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Alerts State */}
      {totalAlerts === 0 && showSummary && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
              <h3 className="font-semibold">All Documents Up to Date</h3>
              <p className="text-sm text-muted-foreground">
                No documents are expired or expiring within the next 60 days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Expiration Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Document Expiration</DialogTitle>
            <DialogDescription>
              Set a new expiration date for this document after renewal.
            </DialogDescription>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedDoc.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDoc.entityName} • {selectedDoc.categoryLabel}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Current: {new Date(selectedDoc.expirationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newExpiration">New Expiration Date</Label>
                <Input
                  id="newExpiration"
                  type="date"
                  value={newExpirationDate}
                  onChange={(e) => setNewExpirationDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateExpiration}
              disabled={updateExpiration.isPending || !newExpirationDate}
            >
              {updateExpiration.isPending ? "Updating..." : "Update Expiration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentExpirationAlert;
