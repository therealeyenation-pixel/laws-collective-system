import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileSignature,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  PenTool,
  Type,
  Upload,
} from "lucide-react";

export default function ESignature() {
  const [signatureType, setSignatureType] = useState<"typed" | "drawn">("typed");
  const [typedSignature, setTypedSignature] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const pendingSignatures = trpc.eSignature.getMyPendingSignatures.useQuery();
  const allRequests = trpc.eSignature.getAllRequests.useQuery();
  const signMutation = trpc.eSignature.sign.useMutation({
    onSuccess: () => {
      toast.success("Document signed successfully");
      pendingSignatures.refetch();
      allRequests.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const saveSignatureOnFile = trpc.eSignature.saveSignatureOnFile.useMutation({
    onSuccess: () => toast.success("Signature saved on file"),
    onError: (err) => toast.error(err.message),
  });

  const handleSign = (signatureId: number) => {
    let signatureData = "";
    
    if (signatureType === "typed") {
      if (!typedSignature.trim()) {
        toast.error("Please type your signature");
        return;
      }
      signatureData = typedSignature;
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL();
    }

    signMutation.mutate({
      signatureId,
      signatureType,
      signatureData,
    });
  };

  const handleSaveSignatureOnFile = () => {
    let signatureData = "";
    
    if (signatureType === "typed") {
      if (!typedSignature.trim()) {
        toast.error("Please type your signature");
        return;
      }
      signatureData = typedSignature;
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL();
    }

    saveSignatureOnFile.mutate({
      signatureType,
      signatureData,
    });
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><PenTool className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">E-Signature Center</h1>
          <p className="text-muted-foreground">Sign documents electronically and manage signature requests</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <FileSignature className="w-4 h-4 mr-2" />
              Pending Signatures ({pendingSignatures.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="all">
              <Send className="w-4 h-4 mr-2" />
              All Requests
            </TabsTrigger>
            <TabsTrigger value="settings">
              <PenTool className="w-4 h-4 mr-2" />
              My Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingSignatures.isLoading ? (
              <Card><CardContent className="p-6">Loading...</CardContent></Card>
            ) : pendingSignatures.data?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No pending signatures</p>
                </CardContent>
              </Card>
            ) : (
              pendingSignatures.data?.map((sig: any) => (
                <Card key={sig.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{sig.documentTitle}</CardTitle>
                        <CardDescription>{sig.documentType}</CardDescription>
                      </div>
                      {getStatusBadge(sig.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Expires: {sig.expiresAt ? new Date(sig.expiresAt).toLocaleDateString() : "No expiration"}
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex gap-4">
                        <Button
                          variant={signatureType === "typed" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSignatureType("typed")}
                        >
                          <Type className="w-4 h-4 mr-2" />
                          Type Signature
                        </Button>
                        <Button
                          variant={signatureType === "drawn" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSignatureType("drawn")}
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          Draw Signature
                        </Button>
                      </div>

                      {signatureType === "typed" ? (
                        <div className="space-y-2">
                          <Label>Type your full legal name</Label>
                          <Input
                            value={typedSignature}
                            onChange={(e) => setTypedSignature(e.target.value)}
                            placeholder="La Shanna K. Russell"
                            className="font-serif text-xl italic"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Draw your signature</Label>
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={150}
                            className="border rounded bg-white cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                          />
                          <Button variant="outline" size="sm" onClick={clearCanvas}>
                            Clear
                          </Button>
                        </div>
                      )}

                      <Button
                        onClick={() => handleSign(sig.id)}
                        disabled={signMutation.isPending}
                      >
                        <FileSignature className="w-4 h-4 mr-2" />
                        Sign Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allRequests.isLoading ? (
              <Card><CardContent className="p-6">Loading...</CardContent></Card>
            ) : (
              <div className="space-y-4">
                {allRequests.data?.map((req: any) => (
                  <Card key={req.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{req.documentTitle}</CardTitle>
                          <CardDescription>{req.documentType}</CardDescription>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Signatures: {req.signedCount || 0} / {req.totalSigners || 0}</span>
                        <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Save Signature on File</CardTitle>
                <CardDescription>
                  Save your signature for faster signing in the future
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={signatureType === "typed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSignatureType("typed")}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Type Signature
                  </Button>
                  <Button
                    variant={signatureType === "drawn" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSignatureType("drawn")}
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    Draw Signature
                  </Button>
                </div>

                {signatureType === "typed" ? (
                  <div className="space-y-2">
                    <Label>Type your full legal name</Label>
                    <Input
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="La Shanna K. Russell"
                      className="font-serif text-xl italic"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Draw your signature</Label>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="border rounded bg-white cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <Button variant="outline" size="sm" onClick={clearCanvas}>
                      Clear
                    </Button>
                  </div>
                )}

                <Button
                  onClick={handleSaveSignatureOnFile}
                  disabled={saveSignatureOnFile.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Save Signature on File
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
