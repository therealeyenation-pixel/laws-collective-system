import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Users, 
  Building2, 
  GraduationCap, 
  Home,
  Sparkles,
  Gift,
  Calendar,
  DollarSign,
  Award,
  Star,
  Crown,
  Gem,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const donationAmounts = [25, 50, 100, 250, 500, 1000];

const frequencies = [
  { value: "one-time", label: "One-Time", icon: Gift },
  { value: "monthly", label: "Monthly", icon: Calendar },
  { value: "quarterly", label: "Quarterly", icon: Calendar },
  { value: "annual", label: "Annual", icon: Calendar },
];

const designations = [
  { value: "general", label: "Where Needed Most" },
  { value: "jobs", label: "Job Creation & Employment" },
  { value: "education", label: "Education & Academy" },
  { value: "housing", label: "Housing & Stability" },
  { value: "business", label: "Business Development" },
  { value: "emergency", label: "Emergency Support" },
];

const donorTiers = [
  { name: "Friend", minAmount: 1, icon: Heart, color: "text-green-600", description: "Every gift makes a difference" },
  { name: "Supporter", minAmount: 100, icon: Star, color: "text-blue-600", description: "Quarterly impact reports" },
  { name: "Champion", minAmount: 500, icon: Award, color: "text-purple-600", description: "Recognition + event invites" },
  { name: "Benefactor", minAmount: 1000, icon: Crown, color: "text-amber-600", description: "Advisory council access" },
  { name: "Legacy Partner", minAmount: 5000, icon: Gem, color: "text-rose-600", description: "Founding member status" },
];

export default function PublicDonate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("one-time");
  const [designation, setDesignation] = useState("general");
  const [tributeType, setTributeType] = useState<string | null>(null);
  const [tributeName, setTributeName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Get impact metrics
  const { data: impactMetrics } = trpc.lawsEmployment.getImpactDashboard.useQuery();

  const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount || 0;

  const getCurrentTier = () => {
    for (let i = donorTiers.length - 1; i >= 0; i--) {
      if (finalAmount >= donorTiers[i].minAmount) {
        return donorTiers[i];
      }
    }
    return donorTiers[0];
  };

  const currentTier = getCurrentTier();

  // Stripe donation checkout mutation
  const createCheckout = trpc.stripeDonations.createDonationCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to secure payment...");
        window.open(data.checkoutUrl, '_blank');
      } else {
        toast.error("Failed to create checkout session");
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
      setIsProcessing(false);
    },
  });

  const handleDonate = async () => {
    if (finalAmount < 1) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    if (finalAmount < 0.50) {
      toast.error("Minimum donation amount is $0.50");
      return;
    }

    setIsProcessing(true);
    
    // Map frequency to API format
    const frequencyMap: Record<string, "one_time" | "monthly" | "quarterly" | "annual"> = {
      "one-time": "one_time",
      "monthly": "monthly",
      "quarterly": "quarterly",
      "annual": "annual",
    };

    // Map tribute type to API format
    const tributeTypeMap: Record<string, "none" | "in_honor" | "in_memory"> = {
      "": "none",
      "honor": "in_honor",
      "memory": "in_memory",
    };

    createCheckout.mutate({
      amount: finalAmount,
      frequency: frequencyMap[frequency] || "one_time",
      designation: designation === "general" ? undefined : designation,
      tributeType: tributeTypeMap[tributeType || ""] || "none",
      tributeName: tributeName || undefined,
      isAnonymous: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
      {/* Header */}
      <header className="bg-green-800 text-white py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-green-300" />
          <h1 className="text-4xl font-bold mb-4">Support the The L.A.W.S. Collective</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Your donation helps build generational wealth, create jobs, and transform communities through education and opportunity.
          </p>
        </div>
      </header>

      {/* Impact Metrics */}
      <section className="py-12 bg-white dark:bg-background border-b">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Your Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Building2 className="w-10 h-10 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold">{impactMetrics?.totalJobsCreated || 0}</p>
              <p className="text-sm text-muted-foreground">Jobs Created</p>
            </Card>
            <Card className="text-center p-6">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{impactMetrics?.businessesFormed || 0}</p>
              <p className="text-sm text-muted-foreground">Businesses Formed</p>
            </Card>
            <Card className="text-center p-6">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold">{impactMetrics?.peopleTrained || 0}</p>
              <p className="text-sm text-muted-foreground">People Trained</p>
            </Card>
            <Card className="text-center p-6">
              <Home className="w-10 h-10 mx-auto mb-2 text-amber-600" />
              <p className="text-3xl font-bold">{impactMetrics?.familiesServed || 0}</p>
              <p className="text-sm text-muted-foreground">Families Served</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Donation Form */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Donation Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Frequency Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Giving Frequency</CardTitle>
                  <CardDescription>Choose how you'd like to give</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {frequencies.map((freq) => (
                      <Button
                        key={freq.value}
                        variant={frequency === freq.value ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col gap-2"
                        onClick={() => setFrequency(freq.value)}
                      >
                        <freq.icon className="w-5 h-5" />
                        <span>{freq.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Amount Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Amount</CardTitle>
                  <CardDescription>Choose a preset amount or enter your own</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {donationAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                        className="h-14 text-lg font-semibold"
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="text-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Designation */}
              <Card>
                <CardHeader>
                  <CardTitle>Designate Your Gift</CardTitle>
                  <CardDescription>Direct your donation to a specific area</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={designation} onValueChange={setDesignation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Tribute Gift */}
              <Card>
                <CardHeader>
                  <CardTitle>Make This a Tribute Gift</CardTitle>
                  <CardDescription>Honor or memorialize someone special (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={tributeType || ""} onValueChange={setTributeType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="no-tribute" />
                      <Label htmlFor="no-tribute">No tribute</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="honor" id="in-honor" />
                      <Label htmlFor="in-honor">In Honor Of</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="memory" id="in-memory" />
                      <Label htmlFor="in-memory">In Memory Of</Label>
                    </div>
                  </RadioGroup>
                  {tributeType && (
                    <Input
                      placeholder="Enter name"
                      value={tributeName}
                      onChange={(e) => setTributeName(e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button 
                size="lg" 
                className="w-full h-14 text-lg bg-green-700 hover:bg-green-800"
                onClick={handleDonate}
                disabled={isProcessing || finalAmount < 1}
              >
                {isProcessing ? "Processing..." : `Donate $${finalAmount.toFixed(2)}${frequency !== 'one-time' ? ` ${frequency}` : ''}`}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                <Shield className="w-4 h-4 inline mr-1" />
                Secure payment processing by Stripe. Your information is protected.
              </p>
            </div>

            {/* Sidebar - Donor Recognition */}
            <div className="space-y-6">
              {/* Current Tier */}
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader className="text-center pb-2">
                  <currentTier.icon className={`w-12 h-12 mx-auto ${currentTier.color}`} />
                  <CardTitle className={currentTier.color}>{currentTier.name}</CardTitle>
                  <CardDescription>{currentTier.description}</CardDescription>
                </CardHeader>
              </Card>

              {/* All Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Donor Recognition Tiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {donorTiers.map((tier) => (
                    <div 
                      key={tier.name}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        finalAmount >= tier.minAmount 
                          ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' 
                          : 'bg-muted/30'
                      }`}
                    >
                      <tier.icon className={`w-6 h-6 ${finalAmount >= tier.minAmount ? tier.color : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${finalAmount >= tier.minAmount ? tier.color : ''}`}>
                          {tier.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${tier.minAmount}+
                        </p>
                      </div>
                      {finalAmount >= tier.minAmount && (
                        <span className="text-green-600 text-sm">✓</span>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tax Info */}
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Tax-Deductible</h3>
                  <p className="text-sm text-muted-foreground">
                    The L.A.W.S. Collective operates under a 508(c)(1)(a) tax-exempt organization. 
                    Your donation is tax-deductible to the fullest extent allowed by law.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You will receive a receipt for your records.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-green-200">
            The L.A.W.S. Collective | Building Generational Wealth Through Purpose & Community
          </p>
          <p className="text-sm text-green-300 mt-2">
            508(c)(1)(a) Tax-Exempt Organization
          </p>
        </div>
      </footer>
    </div>
  );
}
