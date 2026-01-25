import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Award,
  Download,
  Share2,
  Eye,
  Calendar,
  CheckCircle2,
  Shield,
  FileText,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  id: number;
  courseName: string;
  courseId: string;
  issuedAt: string;
  certificateHash: string;
  blockNumber?: number;
  status: "issued" | "pending" | "verified";
}

export function CertificateSystem() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  
  // Mock data - in production this would come from tRPC
  const certificates: Certificate[] = [
    {
      id: 1,
      courseName: "Business Formation Workshop",
      courseId: "business-workshop",
      issuedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      certificateHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
      blockNumber: 12345,
      status: "verified",
    },
    {
      id: 2,
      courseName: "Financial Literacy Mastery",
      courseId: "financial-literacy",
      issuedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      certificateHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      blockNumber: 12400,
      status: "verified",
    },
    {
      id: 3,
      courseName: "Trust & Estate Planning",
      courseId: "trust-planning",
      issuedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      certificateHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
      status: "issued",
    },
  ];

  const handleDownload = (cert: Certificate) => {
    // Generate certificate PDF
    toast.success(`Downloading certificate for ${cert.courseName}`);
    // In production, this would trigger a PDF generation
  };

  const handleShare = (cert: Certificate) => {
    const shareUrl = `${window.location.origin}/verify/${cert.certificateHash}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Certificate verification link copied to clipboard");
  };

  const handleVerify = (cert: Certificate) => {
    toast.success(`Certificate verified on LuvChain block #${cert.blockNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            My Certificates
          </h2>
          <p className="text-muted-foreground">
            Blockchain-verified credentials from completed courses
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Shield className="w-3 h-3" />
          {certificates.length} Earned
        </Badge>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => (
          <Card
            key={cert.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCert(cert)}
          >
            {/* Certificate Preview */}
            <div className="relative h-40 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-900/20 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <pattern id={`pattern-${cert.id}`} patternUnits="userSpaceOnUse" width="20" height="20">
                    <circle cx="10" cy="10" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="100" height="100" fill={`url(#pattern-${cert.id})`} />
                </svg>
              </div>
              <div className="text-center z-10">
                <Award className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  Certificate of Completion
                </p>
              </div>
              {cert.status === "verified" && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                {cert.courseName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="w-3 h-3" />
                {new Date(cert.issuedAt).toLocaleDateString()}
              </div>

              {/* Hash Preview */}
              <div className="p-2 bg-secondary/30 rounded text-xs font-mono truncate mb-3">
                {cert.certificateHash.slice(0, 20)}...
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(cert);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(cert);
                  }}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {certificates.length === 0 && (
        <Card className="p-8 text-center">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete courses to earn blockchain-verified certificates
          </p>
          <Button>Browse Courses</Button>
        </Card>
      )}

      {/* Certificate Detail Dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Certificate Details
                </DialogTitle>
              </DialogHeader>

              {/* Certificate Preview */}
              <div className="relative p-8 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-lg border-4 border-amber-200 dark:border-amber-800">
                <div className="absolute top-4 right-4">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">
                    L.A.W.S. Collective
                  </p>
                  <h2 className="text-2xl font-bold mb-1">Certificate of Completion</h2>
                  <p className="text-muted-foreground mb-4">This certifies that</p>
                  <p className="text-xl font-semibold mb-4">[Your Name]</p>
                  <p className="text-muted-foreground mb-2">has successfully completed</p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-4">
                    {selectedCert.courseName}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedCert.issuedAt).toLocaleDateString()}
                    </span>
                    {selectedCert.blockNumber && (
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Block #{selectedCert.blockNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Blockchain Verification */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Blockchain Verification
                </h4>
                <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Certificate Hash:</span>
                    <code className="font-mono text-xs">{selectedCert.certificateHash}</code>
                  </div>
                  {selectedCert.blockNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Block Number:</span>
                      <span>{selectedCert.blockNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={selectedCert.status === "verified" ? "default" : "secondary"}>
                      {selectedCert.status === "verified" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified on LuvChain
                        </>
                      ) : (
                        "Pending Verification"
                      )}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleDownload(selectedCert)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => handleShare(selectedCert)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {selectedCert.status === "verified" && (
                  <Button variant="outline" onClick={() => handleVerify(selectedCert)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Chain
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CertificateSystem;
