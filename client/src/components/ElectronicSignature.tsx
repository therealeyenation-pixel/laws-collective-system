import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, FileSignature, Shield, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ElectronicSignatureProps {
  documentType: string;
  documentId: number;
  documentTitle: string;
  signatureStatement?: string;
  onSigned?: (signature: any) => void;
  showVerificationBadge?: boolean;
  compact?: boolean;
}

export function ElectronicSignature({
  documentType,
  documentId,
  documentTitle,
  signatureStatement = "I have read, understand, and agree to the terms of this document.",
  onSigned,
  showVerificationBadge = true,
  compact = false,
}: ElectronicSignatureProps) {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Check if user already signed
  const { data: existingSignature, isLoading: checkingSignature, refetch } = trpc.electronicSignature.getUserSignature.useQuery(
    { documentType, documentId },
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

  const handleSign = async () => {
    if (!agreed) {
      toast.error("Please agree to the terms before signing");
      return;
    }

    signMutation.mutate({
      documentType,
      documentId,
      documentTitle,
      signatureStatement,
      ipAddress: "", // Will be captured server-side in production
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

  // Already signed - show verification badge
  if (existingSignature) {
    if (compact) {
      return (
        <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="h-3 w-3" />
          Signed
        </Badge>
      );
    }

    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-800">Signed</span>
                {showVerificationBadge && (
                  <Badge variant="outline" className="text-xs bg-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-green-700 mt-1">
                Signed by {existingSignature.signerName} on{" "}
                {format(new Date(existingSignature.signedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
              <p className="text-xs text-green-600 mt-1 font-mono">
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
          <Button variant="outline" size="sm" className="gap-1">
            <FileSignature className="h-3 w-3" />
            Sign
          </Button>
        </DialogTrigger>
        <SignatureDialogContent
          documentTitle={documentTitle}
          signatureStatement={signatureStatement}
          agreed={agreed}
          setAgreed={setAgreed}
          onSign={handleSign}
          isLoading={signMutation.isPending}
          userName={user?.name || ""}
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
            signatureStatement={signatureStatement}
            agreed={agreed}
            setAgreed={setAgreed}
            onSign={handleSign}
            isLoading={signMutation.isPending}
            userName={user?.name || ""}
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
}: {
  documentTitle: string;
  signatureStatement: string;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  onSign: () => void;
  isLoading: boolean;
  userName: string;
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

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Signature Verified</span>
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="text-muted-foreground">Signed by:</span> {data.signature?.signerName}</p>
          <p><span className="text-muted-foreground">Document:</span> {data.signature?.documentTitle}</p>
          <p>
            <span className="text-muted-foreground">Date:</span>{" "}
            {data.signature?.signedAt && format(new Date(data.signature.signedAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Code: {verificationCode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// My signatures list component
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
      {signatures.map((sig) => (
        <Card key={sig.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{sig.documentTitle || sig.documentType}</p>
                  <p className="text-xs text-muted-foreground">
                    Signed {format(new Date(sig.signedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {sig.documentType}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ElectronicSignature;
