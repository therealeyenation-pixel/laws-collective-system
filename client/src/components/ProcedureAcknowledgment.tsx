import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle,
  FileText,
  PenTool,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Trash2,
} from "lucide-react";

interface ProcedureAcknowledgmentProps {
  procedure: {
    id: number;
    title: string;
    description?: string;
    version: string;
    category: string;
    department?: string;
    content?: string;
    documentNumber?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (data: {
    procedureId: number;
    version: string;
    signature?: string;
    notes?: string;
  }) => void;
  isPending?: boolean;
  existingAcknowledgment?: {
    acknowledgedAt: Date;
    version: string;
    signature?: string;
    notes?: string;
  } | null;
}

export default function ProcedureAcknowledgment({
  procedure,
  isOpen,
  onClose,
  onAcknowledge,
  isPending = false,
  existingAcknowledgment,
}: ProcedureAcknowledgmentProps) {
  const [hasRead, setHasRead] = useState(false);
  const [hasUnderstood, setHasUnderstood] = useState(false);
  const [signature, setSignature] = useState("");
  const [notes, setNotes] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signatureMode, setSignatureMode] = useState<"type" | "draw">("type");

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasRead(false);
      setHasUnderstood(false);
      setSignature("");
      setNotes("");
      clearCanvas();
    }
  }, [isOpen]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getSignatureData = (): string => {
    if (signatureMode === "type") {
      return signature;
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        return canvas.toDataURL("image/png");
      }
      return "";
    }
  };

  const handleSubmit = () => {
    if (!hasRead || !hasUnderstood) {
      toast.error("Please confirm you have read and understood the procedure");
      return;
    }

    const signatureData = getSignatureData();
    if (!signatureData) {
      toast.error("Please provide your signature");
      return;
    }

    onAcknowledge({
      procedureId: procedure.id,
      version: procedure.version,
      signature: signatureData,
      notes: notes || undefined,
    });
  };

  const isAlreadyAcknowledged = existingAcknowledgment && 
    existingAcknowledgment.version === procedure.version;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Acknowledge Procedure
          </DialogTitle>
          <DialogDescription>
            {procedure.documentNumber && (
              <Badge variant="outline" className="mr-2">
                {procedure.documentNumber}
              </Badge>
            )}
            {procedure.title} - Version {procedure.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Already Acknowledged Notice */}
          {isAlreadyAcknowledged && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Already Acknowledged
                  </p>
                  <p className="text-sm text-green-600">
                    You acknowledged this version on{" "}
                    {new Date(existingAcknowledgment.acknowledgedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Procedure Summary */}
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Procedure Summary</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {procedure.description || "No description provided"}
            </p>
            {procedure.department && (
              <Badge variant="secondary">{procedure.department}</Badge>
            )}
          </Card>

          {/* Procedure Content Preview */}
          {procedure.content && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Procedure Content</h4>
              <div className="max-h-48 overflow-y-auto bg-muted/50 p-3 rounded text-sm">
                <pre className="whitespace-pre-wrap font-sans">
                  {procedure.content}
                </pre>
              </div>
            </Card>
          )}

          {/* Acknowledgment Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasRead"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked === true)}
                disabled={isAlreadyAcknowledged ?? false}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="hasRead"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read this procedure in its entirety
                </label>
                <p className="text-xs text-muted-foreground">
                  Confirm that you have reviewed all sections of this document
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="hasUnderstood"
                checked={hasUnderstood}
                onCheckedChange={(checked) => setHasUnderstood(checked === true)}
                disabled={isAlreadyAcknowledged ?? false}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="hasUnderstood"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand and will comply with this procedure
                </label>
                <p className="text-xs text-muted-foreground">
                  Confirm that you understand your responsibilities and will follow this procedure
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          {!isAlreadyAcknowledged && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Digital Signature</Label>
                <div className="flex gap-2">
                  <Button
                    variant={signatureMode === "type" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSignatureMode("type")}
                  >
                    <User className="w-4 h-4 mr-1" />
                    Type
                  </Button>
                  <Button
                    variant={signatureMode === "draw" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSignatureMode("draw")}
                  >
                    <PenTool className="w-4 h-4 mr-1" />
                    Draw
                  </Button>
                </div>
              </div>

              {signatureMode === "type" ? (
                <div className="space-y-2">
                  <Input
                    placeholder="Type your full name as signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="font-signature text-xl italic"
                    style={{ fontFamily: "'Brush Script MT', cursive" }}
                  />
                  <p className="text-xs text-muted-foreground">
                    By typing your name, you agree this constitutes your electronic signature
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="border rounded-lg p-2 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      className="w-full cursor-crosshair border border-dashed border-gray-300 rounded"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Draw your signature using your mouse or touchpad
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Add any questions, concerns, or comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isAlreadyAcknowledged ?? false}
            />
          </div>

          {/* Timestamp Info */}
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Warning */}
          {!isAlreadyAcknowledged && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Your acknowledgment will be recorded with a timestamp and stored for compliance purposes.
                This record may be used for audits and regulatory requirements.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {isAlreadyAcknowledged ? "Close" : "Cancel"}
            </Button>
            {!isAlreadyAcknowledged && (
              <Button
                onClick={handleSubmit}
                disabled={isPending || !hasRead || !hasUnderstood}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isPending ? "Submitting..." : "Acknowledge & Sign"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
