import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format, formatDistanceToNow } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Shield, 
  FileText, 
  Calendar, 
  User, 
  Hash,
  Globe,
  Clock,
  QrCode,
  Copy,
  Loader2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface SignatureDetails {
  documentType: string;
  documentTitle: string | null;
  signerName: string;
  signerEmail: string | null;
  signedAt: Date;
  verificationCode: string;
  isValid: boolean;
  expiresAt?: Date | null;
  requiresReAcknowledgment?: boolean;
  isExpired?: boolean;
}

export default function SignatureVerification() {
  const [inputCode, setInputCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [signatureDetails, setSignatureDetails] = useState<SignatureDetails | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = trpc.electronicSignature.verify.useQuery(
    { verificationCode: searchCode },
    {
      enabled: searchCode.length > 0,
      retry: false,
    }
  );

  useEffect(() => {
    if (data) {
      if (data.valid && data.signature) {
        setSignatureDetails({
          documentType: data.signature.documentType,
          documentTitle: data.signature.documentTitle,
          signerName: data.signature.signerName,
          signerEmail: data.signature.signerEmail,
          signedAt: data.signature.signedAt,
          verificationCode: data.signature.verificationCode,
          isValid: data.valid,
          expiresAt: data.signature.expiresAt,
          requiresReAcknowledgment: data.signature.requiresReAcknowledgment,
          isExpired: data.isExpired,
        });
        setVerificationError(null);
        if (data.isExpired) {
          toast.warning("Signature verified but has expired");
        } else {
          toast.success("Signature verified successfully");
        }
      } else {
        setSignatureDetails(null);
        setVerificationError(data.message || "Invalid verification code");
        toast.error(data.message || "Invalid verification code");
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      setSignatureDetails(null);
      setVerificationError(error.message);
      toast.error(error.message);
    }
  }, [error]);

  const handleVerify = () => {
    if (!inputCode.trim()) {
      toast.error("Please enter a verification code");
      return;
    }
    setVerificationError(null);
    setSignatureDetails(null);
    setSearchCode(inputCode.trim());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDocumentType = (type: string) => {
    return type
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-4xl mx-auto py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Signature Verification</h1>
              <p className="text-sm text-muted-foreground">
                Verify the authenticity of electronic signatures
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto py-8 px-4">
        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Verify a Signature
            </CardTitle>
            <CardDescription>
              Enter the verification code provided with the signed document to verify its authenticity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="verificationCode" className="sr-only">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter verification code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="font-mono"
                />
              </div>
              <Button onClick={handleVerify} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verification Error */}
        {verificationError && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-destructive">Verification Failed</h3>
                  <p className="text-sm text-muted-foreground">{verificationError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature Details */}
        {signatureDetails && (
          <Card className={signatureDetails.isExpired ? "border-amber-500" : "border-green-500"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {signatureDetails.isExpired ? (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Signature Verified (Expired)
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Signature Verified
                    </>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  {signatureDetails.isExpired ? (
                    <Badge variant="default" className="bg-amber-100 text-amber-800">
                      Expired
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Valid
                    </Badge>
                  )}
                  {signatureDetails.requiresReAcknowledgment && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Annual Re-ack
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                {signatureDetails.isExpired 
                  ? "This signature was valid but has expired. The signer may need to re-acknowledge the document."
                  : "This electronic signature has been verified as authentic."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expiration Warning */}
              {signatureDetails.isExpired && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Signature Expired</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This signature expired {signatureDetails.expiresAt && formatDistanceToNow(new Date(signatureDetails.expiresAt))} ago.
                      {signatureDetails.requiresReAcknowledgment && 
                        " The signer is required to re-acknowledge this document annually."
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Document Information */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  {signatureDetails.documentTitle && (
                    <div>
                      <p className="text-sm text-muted-foreground">Document Title</p>
                      <p className="font-medium">{signatureDetails.documentTitle}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Document Type</p>
                    <p className="font-medium">{formatDocumentType(signatureDetails.documentType)}</p>
                  </div>
                </div>
              </div>

              {/* Signer Information */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Signer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Signer Name</p>
                    <p className="font-medium">{signatureDetails.signerName}</p>
                  </div>
                  {signatureDetails.signerEmail && (
                    <div>
                      <p className="text-sm text-muted-foreground">Signer Email</p>
                      <p className="font-medium">{signatureDetails.signerEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Details */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Signature Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Signed At</p>
                    <p className="font-medium">
                      {format(new Date(signatureDetails.signedAt), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {signatureDetails.expiresAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {signatureDetails.isExpired ? "Expired At" : "Expires At"}
                      </p>
                      <p className={`font-medium ${signatureDetails.isExpired ? 'text-amber-600' : ''}`}>
                        {format(new Date(signatureDetails.expiresAt), "MMMM d, yyyy")}
                        {!signatureDetails.isExpired && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({formatDistanceToNow(new Date(signatureDetails.expiresAt))} remaining)
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Codes */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Verification Information
                </h4>
                <div className="space-y-3 pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Code</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {signatureDetails.verificationCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(signatureDetails.verificationCode)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <QrCode className="w-4 h-4" />
                    <span>Scan QR code to verify on mobile</span>
                  </div>
                  <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              About Electronic Signatures
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Electronic signatures on this platform are legally binding under the Electronic Signatures 
              in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions 
              Act (UETA).
            </p>
            <p>
              Each signature includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Signer's full name and email (if provided)</li>
              <li>Timestamp of when the signature was applied</li>
              <li>IP address of the signing device</li>
              <li>SHA-256 cryptographic hash for tamper detection</li>
              <li>Unique verification code for independent verification</li>
              <li>Expiration date for signatures requiring annual re-acknowledgment</li>
            </ul>
            <p>
              <strong>Signature Expiration:</strong> Some documents require annual re-acknowledgment 
              (e.g., safety policies, compliance agreements). When a signature expires, the signer 
              must re-acknowledge the document to maintain compliance.
            </p>
            <p>
              If you have concerns about the authenticity of a signature, please contact the 
              document owner or system administrator.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>The L.A.W.S. Collective, LLC - Electronic Signature Verification System</p>
        </div>
      </footer>
    </div>
  );
}
