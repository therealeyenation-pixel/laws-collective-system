import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const donationAmounts = [10, 25, 50, 100, 250, 500];

  const handleDonate = async (amount: number) => {
    try {
      // Create a Stripe Checkout Session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          description: "Support the The The L.A.W.S. Collective",
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">The The L.A.W.S. Collective</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-12">
        <section className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <Heart className="w-12 h-12 text-red-500 fill-red-500" />
            </div>
            <h2 className="text-4xl font-bold text-foreground">Support the Collective</h2>
            <p className="text-lg text-muted-foreground">
              Your contribution helps us build sustainable wealth systems for communities and families
            </p>
          </div>

          {/* Donation Amount Selection */}
          <div className="bg-secondary/30 border border-border rounded-lg p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Choose a donation amount:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                    className={`py-3 px-4 rounded-md border-2 font-semibold transition-all ${
                      selectedAmount === amount
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:border-primary"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Or enter a custom amount:
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground">$</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Donation Info */}
            <div className="bg-background/50 rounded p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Your contribution is secure:</strong> We use Stripe for safe, encrypted payment processing.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Tax deductible:</strong> Your donation may be tax-deductible. Please consult with a tax professional.
              </p>
            </div>

            {/* Donate Button */}
            <Button
              size="lg"
              onClick={() => {
                if (finalAmount && finalAmount > 0) {
                  handleDonate(finalAmount);
                }
              }}
              disabled={!finalAmount || finalAmount <= 0}
              className="w-full"
            >
              <Heart className="w-4 h-4 mr-2" />
              Donate ${finalAmount || "0"}
            </Button>
          </div>

          {/* Impact Section */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-lg p-8 space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Your Impact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Support community wealth-building programs</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Enable access to financial literacy education</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Help families build sustainable generational wealth</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Strengthen community connections and networks</span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center space-y-2 py-8 border-t border-border">
            <p className="text-muted-foreground">
              Have questions about your donation?
            </p>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Contact Us
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
