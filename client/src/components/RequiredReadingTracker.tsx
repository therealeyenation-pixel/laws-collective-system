import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RequiredReadingTrackerProps {
  department?: string;
  userId?: number;
  showAdminView?: boolean;
}

export default function RequiredReadingTracker({
  department,
  userId,
  showAdminView = false,
}: RequiredReadingTrackerProps) {
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: requiredProcedures, isLoading, refetch } = trpc.procedures.getRequiredByDepartment.useQuery(
    { department: department || "" },
    { enabled: !!department }
  );

  const { data: complianceStats } = trpc.procedures.getComplianceStats.useQuery(
    { department: department || "" },
    { enabled: !!department && showAdminView }
  );

  const acknowledgeMutation = trpc.procedures.acknowledge.useMutation({
    onSuccess: () => {
      toast.success("Procedure acknowledged successfully");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to acknowledge: " + error.message);
    },
  });

  const handleAcknowledge = (procedureId: number, version: string) => {
    acknowledgeMutation.mutate({ procedureId, version });
  };

  const handleViewProcedure = (procedure: any) => {
    setSelectedProcedure(procedure);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="w-5 h-5 animate-spin mr-2" />
            Loading required reading...
          </div>
        </CardContent>
      </Card>
    );
  }

  const procedures = requiredProcedures || [];
  const acknowledged = procedures.filter((p: any) => p.isAcknowledged);
  const pending = procedures.filter((p: any) => !p.isAcknowledged);
  const completionRate = procedures.length > 0 
    ? Math.round((acknowledged.length / procedures.length) * 100) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Required Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>{acknowledged.length} of {procedures.length} completed</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{acknowledged.length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{procedures.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Pending Required Reading ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((procedure: any) => (
                  <TableRow key={procedure.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{procedure.title}</div>
                          {procedure.documentNumber && (
                            <div className="text-xs text-muted-foreground">
                              {procedure.documentNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{procedure.category}</Badge>
                    </TableCell>
                    <TableCell>{procedure.version || "1.0"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProcedure(procedure)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(procedure.id, procedure.version || "1.0")}
                          disabled={acknowledgeMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Completed Items */}
      {acknowledged.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Completed ({acknowledged.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Acknowledged</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acknowledged.map((procedure: any) => (
                  <TableRow key={procedure.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="font-medium">{procedure.title}</div>
                          {procedure.documentNumber && (
                            <div className="text-xs text-muted-foreground">
                              {procedure.documentNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{procedure.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {procedure.acknowledgedAt
                        ? new Date(procedure.acknowledgedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Admin Compliance Stats */}
      {showAdminView && complianceStats && (
        <Card>
          <CardHeader>
            <CardTitle>Department Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {complianceStats.compliantUsers || 0}
                </div>
                <div className="text-xs text-muted-foreground">Fully Compliant</div>
              </div>
              <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {complianceStats.partialUsers || 0}
                </div>
                <div className="text-xs text-muted-foreground">Partially Compliant</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {complianceStats.nonCompliantUsers || 0}
                </div>
                <div className="text-xs text-muted-foreground">Non-Compliant</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {complianceStats.overallRate || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Overall Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Procedure Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProcedure?.title}</DialogTitle>
            <DialogDescription>
              {selectedProcedure?.documentNumber} • Version {selectedProcedure?.version || "1.0"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProcedure?.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedProcedure.description}</p>
              </div>
            )}
            {selectedProcedure?.content && (
              <div>
                <h4 className="font-medium mb-1">Content</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted rounded-lg">
                  {selectedProcedure.content}
                </div>
              </div>
            )}
            {selectedProcedure?.fileUrl && (
              <div>
                <h4 className="font-medium mb-1">Attached Document</h4>
                <a
                  href={selectedProcedure.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Document →
                </a>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {!selectedProcedure?.isAcknowledged && (
              <Button
                onClick={() => {
                  handleAcknowledge(selectedProcedure.id, selectedProcedure.version || "1.0");
                  setIsViewDialogOpen(false);
                }}
                disabled={acknowledgeMutation.isPending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                I Have Read & Acknowledge
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {procedures.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-medium">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No required reading assigned for this department.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
