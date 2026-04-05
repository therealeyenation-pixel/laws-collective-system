import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Pen,
  Calendar,
  Users,
  Building2,
  User,
  Loader2,
  Shield,
  FileSignature,
} from "lucide-react";
import { format } from "date-fns";

interface ReadAndSignProps {
  employeeId?: number;
  showAdminControls?: boolean;
}

export function ReadAndSign({ employeeId, showAdminControls = false }: ReadAndSignProps) {
  const { user } = useAuth();
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<"checkbox" | "typed_name">("checkbox");
  const [typedName, setTypedName] = useState("");
  const [hasRead, setHasRead] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: myReadings, isLoading } = trpc.readAndSign.getMyRequiredReadings.useQuery(
    { employeeId, includeCompleted: true },
    { enabled: !!employeeId }
  );

  const acknowledgeMutation = trpc.readAndSign.acknowledge.useMutation({
    onSuccess: (data) => {
      toast.success("Document acknowledged successfully", {
        description: `Signature hash: ${data.signatureHash?.substring(0, 16)}...`,
      });
      setIsSignDialogOpen(false);
      setSelectedReading(null);
      setHasRead(false);
      setTypedName("");
      utils.readAndSign.getMyRequiredReadings.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to acknowledge: ${error.message}`);
    },
  });

  const handleOpenDocument = (reading: any) => {
    setSelectedReading(reading);
    setReadingStartTime(Date.now());
    window.open(reading.resourceLink.url, "_blank", "noopener,noreferrer");
  };

  const handleSignDocument = () => {
    if (!selectedReading || !employeeId) return;
    
    if (signatureType === "typed_name" && !typedName.trim()) {
      toast.error("Please type your full name to sign");
      return;
    }
    
    if (!hasRead) {
      toast.error("Please confirm you have read the document");
      return;
    }
    
    const timeSpent = readingStartTime 
      ? Math.floor((Date.now() - readingStartTime) / 1000)
      : undefined;
    
    acknowledgeMutation.mutate({
      requiredReadingId: selectedReading.id,
      employeeId,
      signatureType,
      signatureData: signatureType === "typed_name" ? typedName : undefined,
      confirmationText: `I, ${typedName || user?.name || "the undersigned"}, have read and understand the contents of "${selectedReading.resourceLink.title}".`,
      timeSpentSeconds: timeSpent,
    });
  };

  const pendingReadings = myReadings?.filter(r => !r.isCompleted) || [];
  const completedReadings = myReadings?.filter(r => r.isCompleted) || [];
  const overdueReadings = pendingReadings.filter(r => r.isOverdue);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      default: return "bg-gray-500 text-white";
    }
  };

  const getAssignmentIcon = (type: string) => {
    switch (type) {
      case "all_employees": return <Users className="w-4 h-4" />;
      case "entity": return <Building2 className="w-4 h-4" />;
      case "department": return <Building2 className="w-4 h-4" />;
      case "role": return <Shield className="w-4 h-4" />;
      case "individual": return <User className="w-4 h-4" />;
      default: return <FileCheck className="w-4 h-4" />;
    }
  };

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Employee ID required to view required readings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={overdueReadings.length > 0 ? "border-red-500" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-500">{overdueReadings.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-500">{pendingReadings.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">{completedReadings.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Readings */}
      {pendingReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Required Readings
            </CardTitle>
            <CardDescription>
              Documents requiring your acknowledgment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReadings.map((reading) => (
                  <div
                    key={reading.id}
                    className={`p-4 rounded-lg border ${reading.isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{reading.resourceLink.title}</span>
                          <Badge className={getPriorityColor(reading.priority)}>
                            {reading.priority}
                          </Badge>
                          {reading.isOverdue && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
                        {reading.resourceLink.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {reading.resourceLink.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {getAssignmentIcon(reading.assignmentType)}
                            {reading.assignmentType.replace(/_/g, " ")}
                          </span>
                          {reading.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {format(new Date(reading.dueDate), "MMM d, yyyy")}
                            </span>
                          )}
                          {reading.resourceLink.sourceName && (
                            <span>Source: {reading.resourceLink.sourceName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDocument(reading)}
                          className="gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Read
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedReading(reading);
                            setIsSignDialogOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Pen className="w-4 h-4" />
                          Sign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completed Readings */}
      {completedReadings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Completed Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedReadings.map((reading) => (
                <div
                  key={reading.id}
                  className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{reading.resourceLink.title}</span>
                      {reading.acknowledgment && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Signed: {format(new Date(reading.acknowledgment.acknowledgedAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && myReadings?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold text-lg mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              You have no required readings at this time.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sign Dialog */}
      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              Acknowledge Document
            </DialogTitle>
            <DialogDescription>
              {selectedReading?.resourceLink.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Confirmation Statement:</p>
              <p className="text-sm text-muted-foreground italic">
                "I have read and understand the contents of this document. I acknowledge that I am responsible for complying with its requirements."
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Signature Type</label>
              <Select
                value={signatureType}
                onValueChange={(value: "checkbox" | "typed_name") => setSignatureType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">Checkbox Acknowledgment</SelectItem>
                  <SelectItem value="typed_name">Typed Name Signature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {signatureType === "typed_name" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Type Your Full Legal Name</label>
                <Input
                  placeholder="Enter your full name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="font-serif italic"
                />
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasRead"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked as boolean)}
              />
              <label htmlFor="hasRead" className="text-sm">
                I confirm that I have read and understood this document
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSignDocument}
              disabled={!hasRead || (signatureType === "typed_name" && !typedName.trim()) || acknowledgeMutation.isPending}
            >
              {acknowledgeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Pen className="w-4 h-4 mr-2" />
                  Sign & Acknowledge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReadAndSign;
