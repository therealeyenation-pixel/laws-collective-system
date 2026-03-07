import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  CheckCircle2, 
  Share2, 
  Download,
  Calendar,
  Mail,
  Home,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function DonateThankYou() {
  const [location] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Extract session_id from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) {
      setSessionId(sid);
    }
  }, [location]);

  // Fetch donation session details
  const { data: donationDetails, isLoading, error } = trpc.stripeDonations.getDonationSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "I just donated to the The The L.A.W.S. Collective!",
        text: "Join me in supporting community wealth building and generational prosperity.",
        url: window.location.origin + "/donate/public",
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + "/donate/public");
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownloadReceipt = () => {
    // In production, this would generate a PDF receipt
    toast.info("Receipt will be emailed to you shortly");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-muted-foreground">Loading your donation details...</p>
        </div>
      </div>
    );
  }

  if (error || !donationDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <CardTitle>Unable to Load Details</CardTitle>
            <CardDescription>
              We couldn't retrieve your donation details, but don't worry - your donation was processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You should receive a confirmation email shortly with your receipt.
            </p>
            <Link href="/">
              <Button className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRecurring = donationDetails.donationType !== "one_time";
  const frequencyLabel = {
    one_time: "one-time",
    monthly: "monthly",
    quarterly: "quarterly",
    annual: "annual",
  }[donationDetails.donationType] || "one-time";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
      {/* Success Header */}
      <header className="bg-green-700 text-white py-12">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Thank You for Your Generosity!</h1>
          <p className="text-xl text-green-100">
            Your {frequencyLabel} gift of ${donationDetails.amount?.toFixed(2)} has been received.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Donation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-600" />
                Donation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-lg">${donationDetails.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Frequency</span>
                <span className="capitalize">{frequencyLabel}</span>
              </div>
              {donationDetails.designation && donationDetails.designation !== "where_needed" && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Designation</span>
                  <span className="capitalize">{donationDetails.designation.replace(/_/g, " ")}</span>
                </div>
              )}
              {donationDetails.tributeType && donationDetails.tributeType !== "none" && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tribute</span>
                  <span>
                    {donationDetails.tributeType === "in_honor" ? "In Honor of" : "In Memory of"}{" "}
                    {donationDetails.tributeName}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {donationDetails.status === "paid" ? "Completed" : "Processing"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Here's what you can expect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-sm text-muted-foreground">
                    A receipt will be sent to {donationDetails.customerEmail || "your email"} shortly.
                  </p>
                </div>
              </div>
              
              {isRecurring && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Recurring Donation</p>
                    <p className="text-sm text-muted-foreground">
                      Your {frequencyLabel} donation will be processed automatically. You can manage your subscription anytime.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-medium">Impact Updates</p>
                  <p className="text-sm text-muted-foreground">
                    We'll keep you informed about how your donation is making a difference in our community.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Your Support
          </Button>
          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Link href="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>

        {/* Tax Information */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Tax-Deductible Donation</h3>
            <p className="text-sm text-muted-foreground">
              The The The L.A.W.S. Collective operates under a 508(c)(1)(a) tax-exempt organization. 
              Your donation of ${donationDetails.amount?.toFixed(2)} is tax-deductible to the fullest extent allowed by law.
              Please retain your email receipt for your tax records.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 mt-12">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <p className="text-green-200">
            Thank you for being part of the The The L.A.W.S. Collective family!
          </p>
          <p className="text-sm text-green-300 mt-2">
            Building Generational Wealth Through Purpose & Community
          </p>
        </div>
      </footer>
    </div>
  );
}
