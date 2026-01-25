import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Share2, Shield, Award, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function MyCredential() {
  const { user, loading: authLoading } = useAuth();
  
  // For now, show a placeholder until the credential system is fully wired
  const hasCredential = false; // Will be replaced with actual credential check
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container max-w-2xl py-12">
          <Card>
            <CardHeader className="text-center">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to view your L.A.W.S. Collective Member Credential
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasCredential) {
    return (
      <DashboardLayout>
        <div className="container max-w-2xl py-12">
          <Card>
            <CardHeader className="text-center">
              <Award className="w-16 h-16 mx-auto text-amber-500 mb-4" />
              <CardTitle>Earn Your Member Credential</CardTitle>
              <CardDescription className="text-base mt-2">
                Complete one of the following paths to earn your L.A.W.S. Collective Member Credential:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">🎮</span> L.A.W.S. Quest
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete the S.W.A.L. journey in the game and achieve Sovereignty status
                    </p>
                    <Button variant="outline" className="mt-3" onClick={() => window.location.href = "/game-center"}>
                      Play Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">📚</span> L.A.W.S. Academy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete the Academy certification program
                    </p>
                    <Button variant="outline" className="mt-3" onClick={() => window.location.href = "/training"}>
                      Start Learning
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">🚀</span> Direct Onboarding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Complete the simulated S.W.A.L. onboarding journey
                    </p>
                    <Button variant="outline" className="mt-3" onClick={() => window.location.href = "/join"}>
                      Begin Journey
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Credential display (placeholder for when credential exists)
  const credentialId = "LAWS-XXXX-XXXX-XXXX";
  const verificationCode = "ABC123";
  const qrData = "https://laws-collective.com/verify?id=" + credentialId + "&code=" + verificationCode;

  const handleDownload = () => {
    toast.success("Credential download coming soon");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "L.A.W.S. Collective Member Credential",
        text: "Verify my L.A.W.S. Collective membership: " + credentialId,
        url: qrData,
      });
    } else {
      navigator.clipboard.writeText(qrData);
      toast.success("Verification link copied to clipboard");
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-2xl py-12">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">L.A.W.S. Collective</h1>
                <p className="text-primary-foreground/80">Member Credential</p>
              </div>
              <Shield className="w-12 h-12" />
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user.name?.charAt(0) || "M"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name || "Member"}</h2>
                <Badge variant="secondary" className="mt-1">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Member
                </Badge>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Member ID</p>
              <p className="text-xl font-mono font-bold tracking-wider">{credentialId}</p>
            </div>

            <div className="flex justify-center p-6 bg-white rounded-lg">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Access Level</p>
              <div className="flex gap-2">
                <Badge>Wealth System</Badge>
                <Badge variant="outline">Contractor Network</Badge>
                <Badge variant="outline">Community</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
