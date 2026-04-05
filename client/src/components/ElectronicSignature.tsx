import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, FileSignature, Shield, Clock, AlertCircle, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

interface ElectronicSignatureProps {
  documentType: string;
  documentId: number | string;
  documentTitle: string;
  signatureStatement?: string;
  legalText?: string;
  onSigned?: (signature: any) => void;
  showVerificationBadge?: boolean;
  compact?: boolean;
  buttonText?: string;
  buttonSize?: "default" | "sm" | "lg" | "icon";
  requiresAnnualReAck?: boolean;
  customExpirationDays?: number;
}

export function ElectronicSignature({
  documentType,
  documentId,
  documentTitle,
  signatureStatement = "I have read, understand, and agree to the terms of this document.",
  legalText,
  onSigned,
  showVerificationBadge = true,
  compact = false,
  buttonText = "Sign",
  buttonSize = "default",
  requiresAnnualReAck = false,
  customExpirationDays,
}: ElectronicSignatureProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const docId = typeof documentId === "string" ? parseInt(documentId) : documentId;

  // Check if user already signed
  const { data: existingSignature, isLoading: checkingSignature, refetch } = trpc.electronicSignature.getUserSignature.useQuery(
    { documentType, documentId: docId },
    { enabled: !!user }
  );

  const signMutation = trpc.electronicSignature.sign.useMutation({
    onSuccess: (data) => {
      toast.success("Document signed successfully", {
        description: `Verification code: ${data.verificationCode.substring(0, 8)}...`,
      });
      setIsDialogOpen(false);
      setAgreed(false);
      refetch();
      onSigned?.(data);
    },
    onError: (error) => {
      toast.error("Failed to sign document", {
        description: error.message,
      });
    },
  });

  const reAckMutation = trpc.electronicSignature.reAcknowledge.useMutation({
    onSuccess: (data) => {
      toast.success("Document re-acknowledged successfully", {
        description: `New verification code: ${data.verificationCode.substring(0, 8)}...`,
      });
      setIsDialogOpen(false);
      setAgreed(false);
      refetch();
      onSigned?.(data);
    },
    onError: (error) => {
      toast.error("Failed to re-acknowledge document", {
        description: error.message,
      });
    },
  });

  const handleSign = async () => {
    if (!agreed) {
      toast.error("Please agree to the terms before signing");
      return;
    }

    signMutation.mutate({
      documentType,
      documentId: docId,
      documentTitle,
      signatureStatement: legalText || signatureStatement,
      ipAddress: "",
      userAgent: navigator.userAgent,
      requiresAnnualReAck,
      customExpirationDays,
    });
  };

  const handleReAcknowledge = async () => {
    if (!agreed || !existingSignature) {
      toast.error("Please agree to the terms before re-acknowledging");
      return;
    }

    reAckMutation.mutate({
      originalSignatureId: existingSignature.id,
      signatureStatement: legalText || signatureStatement,
      ipAddress: "",
      userAgent: navigator.userAgent,
    });
  };

  if (checkingSignature) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking signature status...</span>
      </div>
    );
  }

  // Check if signature is expired
  const isExpired = existingSignature?.expiresAt 
    ? new Date(existingSignature.expiresAt) < new Date() 
    : false;
  
  const isExpiringSoon = existingSignature?.expiresAt 
    ? differenceInDays(new Date(existingSignature.expiresAt), new Date()) <= 30 && !isExpired
    : false;

  // Already signed but expired - show re-acknowledgment option
  if (existingSignature && isExpired) {
    if (compact) {
      return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200 cursor-pointer hover:bg-amber-100">
              <AlertTriangle className="h-3 w-3" />
              Expired - Re-sign
            </Badge>
          </DialogTrigger>
          <ReAcknowledgeDialogContent
            documentTitle={documentTitle}
            signatureStatement={legalText || signatureStatement}
            agreed={agreed}
            setAgreed={setAgreed}
            onReAcknowledge={handleReAcknowledge}
            isLoading={reAckMutation.isPending}
            userName={user?.name || ""}
            originalSignedAt={existingSignature.signedAt}
            expiredAt={existingSignature.expiresAt!}
          />
        </Dialog>
      );
    }

    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-amber-800">Signature Expired</span>
                <Badge variant="outline" className="text-xs bg-white text-amber-700 border-amber-300">
                  Re-acknowledgment Required
                </Badge>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Originally signed by {existingSignature.signerName} on{" "}
                {format(new Date(existingSignature.signedAt), "MMM d, yyyy")}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Expired {formatDistanceToNow(new Date(existingSignature.expiresAt!))} ago
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-3 gap-2" variant="outline">
                    <RefreshCw className="h-4 w-4" />
                    Re-acknowledge Document
                  </Button>
                </DialogTrigger>
                <ReAcknowledgeDialogContent
                  documentTitle={documentTitle}
                  signatureStatement={legalText || signatureStatement}
                  agreed={agreed}
                  setAgreed={setAgreed}
                  onReAcknowledge={handleReAcknowledge}
                  isLoading={reAckMutation.isPending}
                  userName={user?.name || ""}
                  originalSignedAt={existingSignature.signedAt}
                  expiredAt={existingSignature.expiresAt!}
                />
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Already signed and valid - show verification badge
  if (existingSignature) {
    if (compact) {
      return (
        <Badge variant="outline" className={`gap-1 ${isExpiringSoon ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          <CheckCircle2 className="h-3 w-3" />
          Signed
          {isExpiringSoon && existingSignature.expiresAt && (
            <span className="text-xs ml-1">
              (expires {formatDistanceToNow(new Date(existingSignature.expiresAt))})
            </span>
          )}
        </Badge>
      );
    }

    return (
      <Card className={`${isExpiringSoon ? 'border-yellow-200 bg-yellow-50/50' : 'border-green-200 bg-green-50/50'}`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-full p-2 ${isExpiringSoon ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <CheckCircle2 className={`h-5 w-5 ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isExpiringSoon ? 'text-yellow-800' : 'text-green-800'}`}>Signed</span>
                {showVerificationBadge && (
                  <Badge variant="outline" className="text-xs bg-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {isExpiringSoon && (
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires Soon
                  </Badge>
                )}
              </div>
              <p className={`text-sm mt-1 ${isExpiringSoon ? 'text-yellow-700' : 'text-green-700'}`}>
                Signed by {existingSignature.signerName} on{" "}
                {format(new Date(existingSignature.signedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {existingSignature.expiresAt && (
                <p className={`text-xs mt-1 ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isExpiringSoon 
                    ? `Expires in ${formatDistanceToNow(new Date(existingSignature.expiresAt))}`
                    : `Valid until ${format(new Date(existingSignature.expiresAt), "MMM d, yyyy")}`
                  }
                </p>
              )}
              <p className={`text-xs mt-1 font-mono ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                Verification: {existingSignature.verificationCode.substring(0, 16)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not signed - show sign button
  if (compact) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size={buttonSize} className="gap-1">
            <FileSignature className="h-3 w-3" />
            {buttonText}
          </Button>
        </DialogTrigger>
        <SignatureDialogContent
          documentTitle={documentTitle}
          signatureStatement={legalText || signatureStatement}
          agreed={agreed}
          setAgreed={setAgreed}
          onSign={handleSign}
          isLoading={signMutation.isPending}
          userName={user?.name || ""}
          requiresAnnualReAck={requiresAnnualReAck}
        />
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileSignature className="h-4 w-4" />
          Electronic Signature Required
        </CardTitle>
        <CardDescription>
          Please review and sign this document to confirm your acknowledgment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <FileSignature className="h-4 w-4" />
              Click to Sign Document
            </Button>
          </DialogTrigger>
          <SignatureDialogContent
            documentTitle={documentTitle}
            signatureStatement={legalText || signatureStatement}
            agreed={agreed}
            setAgreed={setAgreed}
            onSign={handleSign}
            isLoading={signMutation.isPending}
            userName={user?.name || ""}
            requiresAnnualReAck={requiresAnnualReAck}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Signature dialog content component
function SignatureDialogContent({
  documentTitle,
  signatureStatement,
  agreed,
  setAgreed,
  onSign,
  isLoading,
  userName,
  requiresAnnualReAck = false,
}: {
  documentTitle: string;
  signatureStatement: string;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  onSign: () => void;
  isLoading: boolean;
  userName: string;
  requiresAnnualReAck?: boolean;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Sign Document
        </DialogTitle>
        <DialogDescription>
          You are about to electronically sign "{documentTitle}"
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Signature Statement */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium mb-2">Signature Statement:</p>
          <p className="text-sm text-muted-foreground italic">"{signatureStatement}"</p>
        </div>

        {/* Signer Info */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Signing as:</span>
            <span className="font-medium">{userName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          {requiresAnnualReAck && (
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600">
                Annual re-acknowledgment required
              </span>
            </div>
          )}
        </div>

        {/* Legal Notice */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            By clicking "Sign Document", you agree that your electronic signature is the legal
            equivalent of your manual signature on this document. This signature is legally binding.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label
            htmlFor="agree"
            className="text-sm leading-tight cursor-pointer"
          >
            I confirm that I have read and understand this document, and I agree to sign it
            electronically.
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setAgreed(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSign} disabled={!agreed || isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing...
            </>
          ) : (
            <>
              <FileSignature className="h-4 w-4" />
              Sign Document
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Re-acknowledgment dialog content
function ReAcknowledgeDialogContent({
  documentTitle,
  signatureStatement,
  agreed,
  setAgreed,
  onReAcknowledge,
  isLoading,
  userName,
  originalSignedAt,
  expiredAt,
}: {
  documentTitle: string;
  signatureStatement: string;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  onReAcknowledge: () => void;
  isLoading: boolean;
  userName: string;
  originalSignedAt: Date;
  expiredAt: Date;
}) {
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Re-acknowledge Document
        </DialogTitle>
        <DialogDescription>
          Your previous signature for "{documentTitle}" has expired
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Previous Signature Info */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-sm font-medium text-amber-800">Previous Signature:</p>
          <div className="text-sm text-amber-700">
            <p>Originally signed: {format(new Date(originalSignedAt), "MMMM d, yyyy")}</p>
            <p>Expired: {format(new Date(expiredAt), "MMMM d, yyyy")}</p>
          </div>
        </div>

        {/* Signature Statement */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm font-medium mb-2">Re-acknowledgment Statement:</p>
          <p className="text-sm text-muted-foreground italic">
            "I re-acknowledge and confirm my continued agreement to the terms of this document."
          </p>
        </div>

        {/* Signer Info */}
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Re-acknowledging as:</span>
            <span className="font-medium">{userName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 text-blue-500" />
            <span className="text-blue-600">
              New signature will be valid for 1 year
            </span>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            By clicking "Re-acknowledge", you confirm that you have re-read this document and 
            your electronic signature remains legally binding.
          </p>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agree-reack"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label
            htmlFor="agree-reack"
            className="text-sm leading-tight cursor-pointer"
          >
            I confirm that I have re-read and understand this document, and I agree to 
            re-acknowledge it electronically.
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setAgreed(false)} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onReAcknowledge} disabled={!agreed || isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Re-acknowledging...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Re-acknowledge
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Signature verification component
export function SignatureVerification({ verificationCode }: { verificationCode: string }) {
  const { data, isLoading, error } = trpc.electronicSignature.verify.useQuery(
    { verificationCode },
    { enabled: !!verificationCode }
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Verifying signature...</span>
      </div>
    );
  }

  if (error || !data?.valid) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Invalid Signature
      </Badge>
    );
  }

  const isExpired = data.isExpired;

  return (
    <Card className={`${isExpired ? 'border-amber-200 bg-amber-50/50' : 'border-green-200 bg-green-50/50'}`}>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          {isExpired ? (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Signature Expired</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Signature Verified</span>
            </>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Signed by:</span> {data.signature?.signerName}</p>
          <p><span className="text-muted-foreground">Document:</span> {data.signature?.documentTitle}</p>
          <p>
            <span className="text-muted-foreground">Date:</span>{" "}
            {data.signature?.signedAt && format(new Date(data.signature.signedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
          {data.signature?.expiresAt && (
            <p>
              <span className="text-muted-foreground">
                {isExpired ? "Expired:" : "Expires:"}
              </span>{" "}
              {format(new Date(data.signature.expiresAt), "MMM d, yyyy")}
            </p>
          )}
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Code: {verificationCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// My signatures list component with expiration status
export function MySignaturesList() {
  const { data: signatures, isLoading } = trpc.electronicSignature.getMySignatures.useQuery({
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!signatures?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileSignature className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No signatures yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {signatures.map((sig) => {
        const isExpired = sig.isExpired;
        const isExpiringSoon = sig.expiresAt && !isExpired && 
          differenceInDays(new Date(sig.expiresAt), new Date()) <= 30;

        return (
          <Card key={sig.id} className={`hover:shadow-sm transition-shadow ${
            isExpired ? 'border-amber-200' : isExpiringSoon ? 'border-yellow-200' : ''
          }`}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-1.5 ${
                    isExpired ? 'bg-amber-100' : isExpiringSoon ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {isExpired ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className={`h-4 w-4 ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{sig.documentTitle || sig.documentType}</p>
                    <p className="text-xs text-muted-foreground">
                      Signed {format(new Date(sig.signedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {sig.expiresAt && (
                      <p className={`text-xs ${isExpired ? 'text-amber-600' : isExpiringSoon ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                        {isExpired 
                          ? `Expired ${formatDistanceToNow(new Date(sig.expiresAt))} ago`
                          : `Expires ${formatDistanceToNow(new Date(sig.expiresAt))}`
                        }
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpired && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                      Expired
                    </Badge>
                  )}
                  {isExpiringSoon && !isExpired && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                      Expiring Soon
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {sig.documentType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Compliance Dashboard Component
export function SignatureComplianceDashboard() {
  const { data: stats, isLoading: loadingStats } = trpc.electronicSignature.getComplianceStats.useQuery();
  const { data: expiringSoon, isLoading: loadingExpiring } = trpc.electronicSignature.getExpiringSoon.useQuery({ daysAhead: 30 });
  const { data: expired, isLoading: loadingExpired } = trpc.electronicSignature.getExpiredRequiringReAck.useQuery();

  if (loadingStats || loadingExpiring || loadingExpired) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.totalSignatures || 0}</div>
            <p className="text-xs text-muted-foreground">Total Signatures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{stats?.activeCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.expiringSoonCount || 0}</div>
            <p className="text-xs text-muted-foreground">Expiring Soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats?.requiresReAckCount || 0}</div>
            <p className="text-xs text-muted-foreground">Need Re-acknowledgment</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{stats?.complianceRate || 100}%</div>
            <div className="flex-1">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${stats?.complianceRate || 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expired Signatures Requiring Re-acknowledgment */}
      {expired && expired.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Requires Re-acknowledgment ({expired.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expired.map((sig) => (
                <div key={sig.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{sig.documentTitle || sig.documentType}</p>
                    <p className="text-xs text-amber-700">
                      Expired {formatDistanceToNow(new Date(sig.expiresAt!))} ago
                    </p>
                  </div>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    Action Required
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon */}
      {expiringSoon && expiringSoon.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              Expiring Soon ({expiringSoon.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((sig) => (
                <div key={sig.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{sig.documentTitle || sig.documentType}</p>
                    <p className="text-xs text-yellow-700">
                      Expires in {sig.daysUntilExpiration} days
                    </p>
                  </div>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    {sig.daysUntilExpiration} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ElectronicSignature;
