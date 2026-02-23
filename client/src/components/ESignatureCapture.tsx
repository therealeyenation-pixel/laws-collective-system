import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pen, Type, Check, RotateCcw, Shield } from "lucide-react";

interface ESignatureCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSign: (signature: {
    type: "drawn" | "typed";
    data: string;
    name: string;
    timestamp: number;
  }) => void;
  signerName?: string;
  documentTitle?: string;
}

export function ESignatureCapture({
  open,
  onOpenChange,
  onSign,
  signerName = "",
  documentTitle = "Document",
}: ESignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [typedName, setTypedName] = useState(signerName);
  const [activeTab, setActiveTab] = useState<"draw" | "type">("draw");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#1a365d";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [open]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ("touches" in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) return;

      const signatureData = canvas.toDataURL("image/png");
      onSign({
        type: "drawn",
        data: signatureData,
        name: typedName || signerName,
        timestamp: Date.now(),
      });
    } else {
      if (!typedName.trim()) return;

      onSign({
        type: "typed",
        data: typedName,
        name: typedName,
        timestamp: Date.now(),
      });
    }

    onOpenChange(false);
    setHasSignature(false);
    setTypedName(signerName);
    setAgreedToTerms(false);
  };

  const canSign =
    agreedToTerms &&
    ((activeTab === "draw" && hasSignature) ||
      (activeTab === "type" && typedName.trim().length > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Electronic Signature
          </DialogTitle>
          <DialogDescription>
            Sign "{documentTitle}" electronically. Your signature will be
            recorded on the LuvLedger blockchain for verification.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "draw" | "type")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="gap-2">
              <Pen className="w-4 h-4" />
              Draw Signature
            </TabsTrigger>
            <TabsTrigger value="type" className="gap-2">
              <Type className="w-4 h-4" />
              Type Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="relative border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={450}
                height={150}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-sm">
                    Draw your signature here
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typed-signature">Type your full legal name</Label>
              <Input
                id="typed-signature"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your full name"
                className="text-lg"
              />
            </div>
            {typedName && (
              <div className="p-4 border rounded-lg bg-white">
                <p
                  className="text-2xl text-center"
                  style={{ fontFamily: "cursive" }}
                >
                  {typedName}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="agree-terms" className="text-sm text-muted-foreground">
            I agree that this electronic signature is legally binding and
            represents my intent to sign this document. I understand this
            signature will be recorded on the LuvLedger blockchain.
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSign} disabled={!canSign} className="gap-2">
            <Check className="w-4 h-4" />
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
