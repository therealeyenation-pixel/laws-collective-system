import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  GraduationCap,
  Users,
  Leaf,
  BookOpen,
  Home,
  ArrowLeft,
  Check,
  Gift,
  Sparkles,
  Building2,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

export default function Support() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const presetAmounts = [25, 50, 100, 250, 500, 1000];

  const impactAreas = [
    {
      icon: GraduationCap,
      title: "Education & Academy",
      description: "Fund scholarships, curriculum development, and educational resources for community members",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Community Outreach",
      description: "Support events, workshops, and programs that strengthen family and community bonds",
      color: "text-green-600"
    },
    {
      icon: Leaf,
      title: "L.A.W.S. Framework",
      description: "Help individuals reconnect with Land, Air, Water, and Self through healing programs",
      color: "text-emerald-600"
    },
    {
      icon: BookOpen,
      title: "Resource Development",
      description: "Create guides, tools, and materials for financial literacy and business development",
      color: "text-purple-600"
    }
  ];

  const handleDonate = () => {
    const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    if (amount < 1) {
      toast.error("Please select or enter a donation amount");
      return;
    }
    if (!donorEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    // In production, this would integrate with a payment processor
    toast.success(`Thank you for your ${isRecurring ? 'monthly ' : ''}donation of $${amount}! We'll be in touch soon.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 text-primary font-bold text-xl cursor-pointer">
              <Sparkles className="w-6 h-6" />
              The L.A.W.S. Collective, LLC
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/">
              <span className="text-sm font-medium hover:text-primary cursor-pointer">Home</span>
            </Link>
            <Link href="/academy">
              <span className="text-sm font-medium hover:text-primary cursor-pointer">Academy</span>
            </Link>
            <Link href="/services">
              <span className="text-sm font-medium hover:text-primary cursor-pointer">Services</span>
            </Link>
            <Link href="/careers">
              <span className="text-sm font-medium hover:text-primary cursor-pointer">Careers</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        {/* Back Link */}
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Heart className="w-3 h-3 mr-1" />
            Support Our Mission
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Support the Collective
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your contribution helps us build multi-generational wealth through education, 
            community development, and purposeful enterprise.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Make a Donation
                </CardTitle>
                <CardDescription>
                  All donations are received by LuvOnPurpose Outreach Temple and Academy Society, Inc., 
                  a 508(c)(1)(a) tax-exempt religious and educational organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donation Type Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={!isRecurring ? "default" : "outline"}
                    onClick={() => setIsRecurring(false)}
                    className="flex-1"
                  >
                    One-Time Gift
                  </Button>
                  <Button
                    variant={isRecurring ? "default" : "outline"}
                    onClick={() => setIsRecurring(true)}
                    className="flex-1"
                  >
                    Monthly Support
                  </Button>
                </div>

                {/* Preset Amounts */}
                <div>
                  <Label className="mb-3 block">Select Amount</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {presetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                        className="h-14 text-lg"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <Label htmlFor="customAmount">Or Enter Custom Amount</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="customAmount"
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Donor Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donorName">Your Name (Optional)</Label>
                    <Input
                      id="donorName"
                      placeholder="Enter your name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="donorEmail">Email Address *</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Share why you're supporting our mission..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={handleDonate}
                >
                  <Heart className="w-5 h-5" />
                  {isRecurring ? "Start Monthly Support" : "Complete Donation"}
                  {(selectedAmount || customAmount) && (
                    <span className="ml-1">
                      - ${selectedAmount || customAmount}{isRecurring ? "/month" : ""}
                    </span>
                  )}
                </Button>

                {/* Tax Info */}
                <p className="text-xs text-muted-foreground text-center">
                  Donations to LuvOnPurpose Outreach Temple and Academy Society, Inc. (508(c)(1)(a)) 
                  may be tax-deductible. Please consult your tax advisor. You will receive a receipt via email.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Impact Areas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Impact</CardTitle>
                <CardDescription>
                  See how your donation makes a difference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {impactAreas.map((area, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className={`${area.color} mt-0.5`}>
                      <area.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{area.title}</h4>
                      <p className="text-xs text-muted-foreground">{area.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Receiving Organization */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Receiving Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium">
                  LuvOnPurpose Outreach Temple and Academy Society, Inc.
                </p>
                <Badge variant="outline" className="bg-background">
                  508(c)(1)(a) Tax-Exempt Organization
                </Badge>
                <div className="space-y-2 text-muted-foreground pt-2">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    1luvonpurpose@gmail.com
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Other Ways to Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Volunteer your time and skills</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Share our mission with others</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Partner with us on programs</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm">Attend our community events</span>
                </div>
                <Link href="/careers">
                  <Button variant="outline" className="w-full mt-4">
                    Join Our Team
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">The L.A.W.S. Collective, LLC</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building Multi-Generational Wealth Through Purpose & Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
