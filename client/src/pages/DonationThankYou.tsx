import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, CheckCircle, Mail, Download, ArrowLeft } from "lucide-react";

export default function DonationThankYou() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("session_id");
    if (id) {
      setSessionId(id);
    }
  }, []);

  const { data: session, isLoading } = trpc.stripeDonations.getDonationSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Heart className="w-16 h-16 mx-auto text-green-600 animate-bounce" />
          <p className="mt-4 text-lg text-muted-foreground">Processing your donation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
      <div className="container max-w-2xl mx-auto px-4 py-16">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <CheckCircle className="w-24 h-24 text-green-600 relative" />
          </div>
        </div>

        {/* Thank You Message */}
        <Card className="p-8 text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Thank You for Your Generosity!
          </h1>
          
          {session && (
            <div className="mb-6">
              <p className="text-4xl font-bold text-green-600 mb-2">
                ${session.amount?.toFixed(2)}
              </p>
              <p className="text-muted-foreground">
                {session.donationType === "one_time" 
                  ? "One-time donation" 
                  : `${session.donationType.charAt(0).toUpperCase() + session.donationType.slice(1)} recurring donation`}
              </p>
              {session.designation && session.designation !== "where_needed" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Designated for: {session.designation.replace(/_/g, " ")}
                </p>
              )}
              {session.tributeType && session.tributeType !== "none" && session.tributeName && (
                <p className="text-sm text-green-600 mt-2">
                  {session.tributeType === "in_honor" ? "In Honor of" : "In Memory of"}: {session.tributeName}
                </p>
              )}
            </div>
          )}

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your contribution directly supports The L.A.W.S. Collective's mission of building 
            generational wealth and empowering communities through Land, Air, Water, and Self.
          </p>

          {/* Impact Preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <p className="text-2xl font-bold text-green-600">47+</p>
              <p className="text-xs text-muted-foreground">Jobs Created</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">23+</p>
              <p className="text-xs text-muted-foreground">Businesses Formed</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">156+</p>
              <p className="text-xs text-muted-foreground">People Trained</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">89+</p>
              <p className="text-xs text-muted-foreground">Families Served</p>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Tax Receipt Information
            </h3>
            <p className="text-sm text-muted-foreground">
              A tax receipt has been sent to <strong>{session?.customerEmail || "your email"}</strong>. 
              The L.A.W.S. Collective is a 508(c)(1)(a) tax-exempt organization. Your donation is 
              tax-deductible to the extent allowed by law. No goods or services were provided 
              in exchange for this contribution.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              EIN: [Organization EIN] | Please retain this receipt for your tax records.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setLocation("/donate/public")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Make Another Donation
            </Button>
            <Button
              variant="default"
              onClick={() => setLocation("/")}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Heart className="w-4 h-4" />
              Return Home
            </Button>
          </div>
        </Card>

        {/* Social Share */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-3">
            Spread the word and inspire others to give
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const text = "I just donated to The L.A.W.S. Collective to support community wealth building! Join me in making a difference.";
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
              }}
            >
              Share on X
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const text = "I just donated to The L.A.W.S. Collective to support community wealth building!";
                window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`, "_blank");
              }}
            >
              Share on Facebook
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-xs text-muted-foreground">
            Questions about your donation? Contact us at{" "}
            <a href="mailto:donations@lawscollective.org" className="text-green-600 hover:underline">
              donations@lawscollective.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
