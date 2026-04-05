import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Heart,
  GraduationCap,
  FileText,
  Landmark,
  Users,
  Stethoscope,
  Home,
  Gift,
  CheckCircle,
  Loader2,
  Receipt,
} from "lucide-react";

const FUND_ICONS: Record<string, React.ReactNode> = {
  ACADEMY: <GraduationCap className="w-5 h-5" />,
  GRANTS: <FileText className="w-5 h-5" />,
  TRUST: <Landmark className="w-5 h-5" />,
  COMMUNITY: <Users className="w-5 h-5" />,
  GENERAL: <Gift className="w-5 h-5" />,
  HEALTH: <Stethoscope className="w-5 h-5" />,
  PROPERTY: <Home className="w-5 h-5" />,
};

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function Donate508() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedFund, setSelectedFund] = useState<string>("GENERAL");
  const [donorName, setDonorName] = useState<string>(user?.name || "");
  const [donorEmail, setDonorEmail] = useState<string>(user?.email || "");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<string>("monthly");
  const [notes, setNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: funds, isLoading: fundsLoading } = trpc.donations508.getFunds.useQuery();
  const { data: summary } = trpc.donations508.getDonationSummary.useQuery();

  const createCheckout = trpc.donations508.createDonationCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to secure payment...");
        window.open(data.checkoutUrl, "_blank");
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create donation");
      setIsProcessing(false);
    },
  });

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleDonate = () => {
    if (!donorEmail) {
      toast.error("Please enter your email address");
      return;
    }
    if (amount < 1) {
      toast.error("Minimum donation is $1");
      return;
    }

    setIsProcessing(true);
    createCheckout.mutate({
      amountCents: Math.round(amount * 100),
      fundCode: selectedFund,
      donorName: donorName || undefined,
      donorEmail,
      isRecurring,
      recurringFrequency: isRecurring ? (recurringFrequency as "monthly" | "quarterly" | "annually") : undefined,
      notes: notes || undefined,
    });
  };

  const selectedFundData = funds?.find((f: any) => f.fund_code === selectedFund);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container max-w-6xl py-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Heart className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Support LuvOnPurpose Academy and Outreach
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your tax-deductible donation helps us build generational wealth, provide education,
              and support our community through faith-based stewardship programs.
            </p>
            <p className="text-sm text-muted-foreground">
              Faith-Based Organization
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fund Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Where Your Gift Goes</CardTitle>
                <CardDescription>
                  Select a program to support or choose General to let us allocate where needed most
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fundsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {funds?.map((fund: any) => (
                      <button
                        key={fund.fund_code}
                        onClick={() => setSelectedFund(fund.fund_code)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedFund === fund.fund_code
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedFund === fund.fund_code ? "bg-primary/10 text-primary" : "bg-muted"
                          }`}>
                            {FUND_ICONS[fund.fund_code] || <Gift className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{fund.fund_name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {fund.description}
                            </div>
                          </div>
                          {selectedFund === fund.fund_code && (
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amount Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Donation Amount</CardTitle>
                <CardDescription>
                  Select a preset amount or enter a custom amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset && !customAmount ? "default" : "outline"}
                      onClick={() => handleAmountSelect(preset)}
                      className="h-12"
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">$</span>
                  <Input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="text-lg"
                    min="1"
                    step="0.01"
                  />
                </div>

                {/* Recurring Option */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-base font-medium">Make this a recurring donation</Label>
                    <p className="text-sm text-muted-foreground">
                      Support us regularly with automatic donations
                    </p>
                  </div>
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                </div>

                {isRecurring && (
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donor Information */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Required for your tax-deductible receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donorName">Name (optional)</Label>
                    <Input
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donorEmail">Email *</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Message (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a personal message or note..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleDonate}
              disabled={isProcessing || !donorEmail || amount < 1}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Donate ${amount.toFixed(2)}
                  {isRecurring && ` / ${recurringFrequency}`}
                </>
              )}
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Your Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Allocation</span>
                  <span className="font-medium">{selectedFundData?.fund_name || "General"}</span>
                </div>
                {isRecurring && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium capitalize">{recurringFrequency}</span>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Your donation is tax-deductible to the extent allowed by law.
                    You will receive a receipt via email.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Impact Card */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      ${((summary.allTime?.amountCents || 0) / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Raised</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">
                        ${((summary.thisYear?.amountCents || 0) / 100).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">This Year</div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-xl font-bold">{summary.allTime?.count || 0}</div>
                      <div className="text-xs text-muted-foreground">Donations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trust Badge */}
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200">
                      Secure & Tax-Deductible
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      LuvOnPurpose Academy and Outreach is a faith-based organization.
                      All donations are tax-deductible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
