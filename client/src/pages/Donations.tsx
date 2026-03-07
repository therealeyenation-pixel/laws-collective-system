import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Heart,
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Calendar,
  FileText,
  Shield,
  CheckCircle,
  Info,
} from "lucide-react";

export default function Donations() {
  const [donationType, setDonationType] = useState<"one_time" | "recurring">("one_time");
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "quarterly" | "annually">("monthly");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [designation, setDesignation] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");

  const { data: taxInfo } = trpc.donations.getTaxExemptInfo.useQuery();
  const { data: campaigns } = trpc.donations.getActiveCampaigns.useQuery();
  const submitDonation = trpc.donations.submitDonation.useMutation();

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount("");
  };

  const getFinalAmount = () => {
    if (customAmount) return parseFloat(customAmount);
    return typeof amount === "number" ? amount : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();
    
    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }
    if (!donorEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const result = await submitDonation.mutateAsync({
        donorName: isAnonymous ? undefined : donorName,
        donorEmail,
        donorPhone: donorPhone || undefined,
        donorAddress: donorAddress || undefined,
        amount: finalAmount,
        donationType: donationType === "recurring" ? "recurring" : "one_time",
        isAnonymous,
        designation: designation || undefined,
        frequency: donationType === "recurring" ? frequency : undefined,
      });

      setReceiptNumber(result.taxReceiptNumber);
      setShowConfirmation(true);
      toast.success("Thank you for your generous donation!");
      
      // Reset form
      setAmount("");
      setCustomAmount("");
      setDonorName("");
      setDonorEmail("");
      setDonorPhone("");
      setDonorAddress("");
      setDesignation("");
      setIsAnonymous(false);
    } catch (error) {
      toast.error("Failed to process donation. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-green-800 text-white py-16">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-green-300" />
          <h1 className="text-4xl font-bold mb-4">Support The L.A.W.S. Collective</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Your contribution helps build multi-generational wealth through education, 
            business development, and community support.
          </p>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  Make a Donation
                </CardTitle>
                <CardDescription>
                  Choose your donation type and amount
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Donation Type */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Donation Type</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={donationType === "one_time" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setDonationType("one_time")}
                      >
                        One-Time Gift
                      </Button>
                      <Button
                        type="button"
                        variant={donationType === "recurring" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setDonationType("recurring")}
                      >
                        Monthly Giving
                      </Button>
                    </div>
                  </div>

                  {/* Recurring Frequency */}
                  {donationType === "recurring" && (
                    <div>
                      <Label>Frequency</Label>
                      <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Amount Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Select Amount</Label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {presetAmounts.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant={amount === preset ? "default" : "outline"}
                          onClick={() => handleAmountSelect(preset)}
                          className="h-12"
                        >
                          ${preset}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {/* Designation */}
                  <div>
                    <Label>Designation (Optional)</Label>
                    <Select value={designation} onValueChange={setDesignation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Where would you like your gift to go?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Fund</SelectItem>
                        <SelectItem value="education">Education & Academy</SelectItem>
                        <SelectItem value="workforce">Workforce Development</SelectItem>
                        <SelectItem value="community">Community Programs</SelectItem>
                        <SelectItem value="emergency">Emergency Assistance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Donor Information */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold block">Your Information</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                      />
                      <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                        Make this donation anonymous
                      </label>
                    </div>

                    {!isAnonymous && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone (Optional)</Label>
                          <Input
                            id="phone"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            placeholder="Your phone number"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for tax receipt delivery
                      </p>
                    </div>

                    {!isAnonymous && (
                      <div>
                        <Label htmlFor="address">Mailing Address (Optional)</Label>
                        <Textarea
                          id="address"
                          value={donorAddress}
                          onChange={(e) => setDonorAddress(e.target.value)}
                          placeholder="For tax receipt mailing"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-green-700 hover:bg-green-800"
                    disabled={submitDonation.isPending}
                  >
                    {submitDonation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Donate ${getFinalAmount() || "0"}
                        {donationType === "recurring" && ` / ${frequency}`}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By donating, you agree to our terms and acknowledge our privacy policy.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tax Exempt Info */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Shield className="w-5 h-5" />
                  Tax-Exempt Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  {taxInfo?.organizationType || "508(c)(1)(a) Faith-Based Organization"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {taxInfo?.description || "LuvOnPurpose operates as a 508(c)(1)(a) faith-based organization, automatically exempt from federal income tax."}
                </p>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Tax Deductibility</h4>
                  <p className="text-xs text-muted-foreground">
                    {taxInfo?.taxDeductibility || "Contributions may be tax-deductible to the extent allowed by law. Please consult your tax advisor."}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2">Receipt Policy</h4>
                  <p className="text-xs text-muted-foreground">
                    {taxInfo?.receiptPolicy || "All donors receive an acknowledgment letter for tax purposes."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Impact Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Families Supported</p>
                    <p className="text-sm text-muted-foreground">Building generational wealth</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Businesses Created</p>
                    <p className="text-sm text-muted-foreground">Through workforce development</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Training Hours</p>
                    <p className="text-sm text-muted-foreground">Education & development</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Campaigns */}
            {campaigns && campaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    Active Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{campaign.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {campaign.progress_percent}%
                        </span>
                      </div>
                      <Progress value={campaign.progress_percent || 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${Number(campaign.raised_amount).toLocaleString()} raised</span>
                        <span>Goal: ${Number(campaign.goal_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                About Your Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mission">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mission">Our Mission</TabsTrigger>
                  <TabsTrigger value="use">How Funds Are Used</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                <TabsContent value="mission" className="mt-4">
                  <p className="text-muted-foreground">
                    The L.A.W.S. Collective (Land, Air, Water, Self) is dedicated to building 
                    multi-generational wealth through education, business development, and 
                    community support. We help individuals and families create lasting prosperity 
                    by providing the tools, training, and resources needed to achieve financial 
                    independence and ownership.
                  </p>
                </TabsContent>
                <TabsContent value="use" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Education & Training</p>
                        <p className="text-sm text-muted-foreground">
                          Academy courses, certifications, and skill development
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Business Development</p>
                        <p className="text-sm text-muted-foreground">
                          Supporting entrepreneurs through the transition pipeline
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Community Programs</p>
                        <p className="text-sm text-muted-foreground">
                          L.A.W.S. framework implementation and support
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Emergency Assistance</p>
                        <p className="text-sm text-muted-foreground">
                          Supporting families in times of need
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="faq" className="mt-4 space-y-4">
                  <div>
                    <p className="font-medium">Is my donation tax-deductible?</p>
                    <p className="text-sm text-muted-foreground">
                      Contributions may be tax-deductible. Please consult your tax advisor for specific guidance.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Will I receive a receipt?</p>
                    <p className="text-sm text-muted-foreground">
                      Yes, all donors receive an acknowledgment letter via email that can 
                      be used for tax purposes.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Can I cancel my recurring donation?</p>
                    <p className="text-sm text-muted-foreground">
                      Yes, you can cancel or modify your recurring donation at any time 
                      by contacting us.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              Thank You for Your Donation!
            </DialogTitle>
            <DialogDescription>
              Your generous contribution helps build multi-generational wealth in our community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Tax Receipt Number</p>
              <p className="font-mono font-semibold">{receiptNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              A confirmation email with your tax receipt has been sent to your email address. 
              Please save this for your records.
            </p>
          </div>
          <Button onClick={() => setShowConfirmation(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
