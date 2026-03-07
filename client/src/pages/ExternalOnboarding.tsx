import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Calculator,
  FolderLock,
  LineChart,
  GraduationCap,
  Shield,
  ClipboardCheck,
  Lightbulb,
  Cpu,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
  FolderLock: <FolderLock className="w-6 h-6" />,
  LineChart: <LineChart className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Shield: <Shield className="w-6 h-6" />,
  ClipboardCheck: <ClipboardCheck className="w-6 h-6" />,
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
};

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  green: "bg-green-100 text-green-700 border-green-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

const pillarColors: Record<string, string> = {
  land: "bg-emerald-500",
  air: "bg-sky-500",
  water: "bg-blue-500",
  self: "bg-amber-500",
};

type OnboardingStep = "welcome" | "profile" | "services" | "tier" | "review" | "complete";

export default function ExternalOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [entityType, setEntityType] = useState<string>("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  
  // Profile details
  const [legalName, setLegalName] = useState("");
  const [ein, setEin] = useState("");
  const [stateOfFormation, setStateOfFormation] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [website, setWebsite] = useState("");
  
  // Service selection
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState<"standalone" | "connected" | "full_suite">("connected");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [userCount, setUserCount] = useState(1);
  
  // Queries
  const { data: catalog } = trpc.externalOnboarding.getServiceCatalog.useQuery();
  const { data: pricing } = trpc.externalOnboarding.calculatePricing.useQuery(
    {
      serviceCodes: selectedServices,
      tier: selectedTier,
      billingCycle,
      userCount,
    },
    { enabled: selectedServices.length > 0 }
  );
  
  // Mutations
  const startOnboarding = trpc.externalOnboarding.startOnboarding.useMutation({
    onSuccess: (data) => {
      setCompanyId(data.companyId);
      setCurrentStep("profile");
      toast.success("Welcome! Let's set up your company profile.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateProfile = trpc.externalOnboarding.updateCompanyProfile.useMutation({
    onSuccess: () => {
      setCurrentStep("services");
      toast.success("Profile saved! Now select your services.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const selectServices = trpc.externalOnboarding.selectServices.useMutation({
    onSuccess: () => {
      setCurrentStep("review");
      toast.success("Services selected! Review your order.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const completeOnboarding = trpc.externalOnboarding.completeOnboarding.useMutation({
    onSuccess: () => {
      setCurrentStep("complete");
      toast.success("Welcome to The The L.A.W.S. Collective!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleStartOnboarding = () => {
    if (!companyName || !entityType || !contactName || !contactEmail) {
      toast.error("Please fill in all required fields");
      return;
    }
    startOnboarding.mutate({
      companyName,
      entityType: entityType as any,
      primaryContactName: contactName,
      primaryContactEmail: contactEmail,
      primaryContactPhone: contactPhone || undefined,
      referralCode: referralCode || undefined,
    });
  };
  
  const handleUpdateProfile = () => {
    if (!companyId) return;
    updateProfile.mutate({
      companyId,
      legalName: legalName || undefined,
      ein: ein || undefined,
      stateOfFormation: stateOfFormation || undefined,
      streetAddress: streetAddress || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      industry: industry || undefined,
      employeeCount: employeeCount as any || undefined,
      annualRevenue: annualRevenue as any || undefined,
      website: website || undefined,
    });
  };
  
  const handleSelectServices = () => {
    if (!companyId || selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }
    selectServices.mutate({
      companyId,
      serviceCodes: selectedServices,
      tier: selectedTier,
      billingCycle,
    });
  };
  
  const handleComplete = () => {
    if (!companyId) return;
    completeOnboarding.mutate({ companyId });
  };
  
  const toggleService = (serviceCode: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceCode)
        ? prev.filter((s) => s !== serviceCode)
        : [...prev, serviceCode]
    );
  };
  
  const steps = [
    { id: "welcome", label: "Welcome", number: 1 },
    { id: "profile", label: "Profile", number: 2 },
    { id: "services", label: "Services", number: 3 },
    { id: "tier", label: "Tier", number: 4 },
    { id: "review", label: "Review", number: 5 },
    { id: "complete", label: "Complete", number: 6 },
  ];
  
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-800">The The L.A.W.S. Collective</h1>
              <p className="text-sm text-muted-foreground">Business Services Onboarding</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Step {currentStepIndex + 1} of {steps.length}</p>
                <p className="text-xs text-muted-foreground">{steps[currentStepIndex]?.label}</p>
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </div>
      </header>
      
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-green-700" />
                </div>
                <CardTitle className="text-2xl">Welcome to The The L.A.W.S. Collective</CardTitle>
                <CardDescription>
                  Let's get your company set up with our management services.
                  This process takes about 10-15 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Company, LLC"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="entityType">Entity Type *</Label>
                    <Select value={entityType} onValueChange={setEntityType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="s_corp">S-Corporation</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                        <SelectItem value="trust">Trust</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Your Name *</Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="john@company.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone (Optional)</Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                    <Input
                      id="referralCode"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="LAWS2024"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleStartOnboarding}
                  className="w-full bg-green-700 hover:bg-green-800"
                  disabled={startOnboarding.isPending}
                >
                  {startOnboarding.isPending ? "Starting..." : "Get Started"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Profile Step */}
        {currentStep === "profile" && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  Tell us more about your business. All fields are optional but help us serve you better.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Name</Label>
                    <Input
                      id="legalName"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="Full legal entity name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ein">EIN</Label>
                    <Input
                      id="ein"
                      value={ein}
                      onChange={(e) => setEin(e.target.value)}
                      placeholder="XX-XXXXXXX"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stateOfFormation">State of Formation</Label>
                    <Input
                      id="stateOfFormation"
                      value={stateOfFormation}
                      onChange={(e) => setStateOfFormation(e.target.value)}
                      placeholder="Delaware"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Technology, Healthcare, etc."
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Business Address</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="123 Main St"
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Employee Count</Label>
                    <Select value={employeeCount} onValueChange={setEmployeeCount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Just me</SelectItem>
                        <SelectItem value="2_10">2-10</SelectItem>
                        <SelectItem value="11_50">11-50</SelectItem>
                        <SelectItem value="51_200">51-200</SelectItem>
                        <SelectItem value="201_500">201-500</SelectItem>
                        <SelectItem value="500_plus">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="annualRevenue">Annual Revenue</Label>
                    <Select value={annualRevenue} onValueChange={setAnnualRevenue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_100k">Under $100K</SelectItem>
                        <SelectItem value="100k_500k">$100K - $500K</SelectItem>
                        <SelectItem value="500k_1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m_5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m_10m">$5M - $10M</SelectItem>
                        <SelectItem value="10m_plus">$10M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("welcome")}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    className="flex-1 bg-green-700 hover:bg-green-800"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "Saving..." : "Continue to Services"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Services Step */}
        {currentStep === "services" && catalog && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-800">Select Your Services</h2>
              <p className="text-muted-foreground">
                Choose the services that fit your business needs. You can add more later.
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catalog.services.map((service) => (
                <Card
                  key={service.serviceCode}
                  className={`cursor-pointer transition-all ${
                    selectedServices.includes(service.serviceCode)
                      ? "ring-2 ring-green-500 border-green-500"
                      : "hover:border-green-300"
                  }`}
                  onClick={() => toggleService(service.serviceCode)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${colorMap[service.colorTheme] || "bg-gray-100"}`}>
                        {iconMap[service.iconName] || <Building2 className="w-6 h-6" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {service.lawsPillar && (
                          <div
                            className={`w-3 h-3 rounded-full ${pillarColors[service.lawsPillar]}`}
                            title={`L.A.W.S. Pillar: ${service.lawsPillar.toUpperCase()}`}
                          />
                        )}
                        <Checkbox
                          checked={selectedServices.includes(service.serviceCode)}
                          onCheckedChange={() => toggleService(service.serviceCode)}
                        />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{service.serviceName}</CardTitle>
                    <CardDescription className="text-sm">
                      {service.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1 mb-3">
                      {parseFloat(service.baseMonthlyPrice) > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-green-700">
                            ${service.baseMonthlyPrice}
                          </span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-green-700">
                          ${service.setupFee} one-time
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-4 justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("profile")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("tier")}
                className="bg-green-700 hover:bg-green-800"
                disabled={selectedServices.length === 0}
              >
                Continue to Tier Selection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Tier Selection Step */}
        {currentStep === "tier" && catalog && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-800">Choose Your Tier</h2>
              <p className="text-muted-foreground">
                Select how you want your services to work together.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Standalone */}
              <Card
                className={`cursor-pointer transition-all ${
                  selectedTier === "standalone"
                    ? "ring-2 ring-green-500 border-green-500"
                    : "hover:border-green-300"
                }`}
                onClick={() => setSelectedTier("standalone")}
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-slate-600" />
                  </div>
                  <CardTitle>Standalone</CardTitle>
                  <CardDescription>Individual services</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-green-700 mb-4">Base Price</p>
                  <ul className="space-y-2 text-sm text-left">
                    {catalog.tiers.standalone.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Connected */}
              <Card
                className={`cursor-pointer transition-all relative ${
                  selectedTier === "connected"
                    ? "ring-2 ring-green-500 border-green-500"
                    : "hover:border-green-300"
                }`}
                onClick={() => setSelectedTier("connected")}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-700">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Connected</CardTitle>
                  <CardDescription>Integrated services</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-green-700 mb-1">15% Off</p>
                  <p className="text-sm text-muted-foreground mb-4">All services</p>
                  <ul className="space-y-2 text-sm text-left">
                    {catalog.tiers.connected.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Full Suite */}
              <Card
                className={`cursor-pointer transition-all ${
                  selectedTier === "full_suite"
                    ? "ring-2 ring-green-500 border-green-500"
                    : "hover:border-green-300"
                }`}
                onClick={() => setSelectedTier("full_suite")}
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <CardTitle>Full Suite</CardTitle>
                  <CardDescription>Complete solution</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-green-700 mb-1">30% Off</p>
                  <p className="text-sm text-muted-foreground mb-4">All services</p>
                  <ul className="space-y-2 text-sm text-left">
                    {catalog.tiers.full_suite.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Billing Options */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-lg">Billing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    className={billingCycle === "monthly" ? "bg-green-700" : ""}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === "annual" ? "default" : "outline"}
                    className={billingCycle === "annual" ? "bg-green-700" : ""}
                    onClick={() => setBillingCycle("annual")}
                  >
                    Annual (10% off)
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Number of Users</Label>
                  <Input
                    type="number"
                    min={1}
                    value={userCount}
                    onChange={(e) => setUserCount(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For per-user priced services
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-4 justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("services")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSelectServices}
                className="bg-green-700 hover:bg-green-800"
                disabled={selectServices.isPending}
              >
                {selectServices.isPending ? "Saving..." : "Review Order"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Review Step */}
        {currentStep === "review" && pricing && catalog && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-green-800">Review Your Order</h2>
              <p className="text-muted-foreground">
                Confirm your selections before completing setup.
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{pricing.tierName} Tier</Badge>
                  <Badge variant="outline">{pricing.billingCycle === "annual" ? "Annual" : "Monthly"} Billing</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pricing.breakdown.map((item) => (
                  <div key={item.serviceCode} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.serviceName}</p>
                      {item.basePrice !== item.adjustedPrice && (
                        <p className="text-sm text-muted-foreground">
                          <span className="line-through">${item.basePrice}</span>
                          {" → "}
                          <span className="text-green-600">${item.adjustedPrice}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.adjustedPrice}/mo</p>
                      {item.setupFee > 0 && (
                        <p className="text-sm text-muted-foreground">
                          +${item.setupFee} setup
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Subtotal</span>
                    <span>${pricing.monthlySubtotal}</span>
                  </div>
                  {pricing.tierDiscount !== "0%" && (
                    <div className="flex justify-between text-green-600">
                      <span>Tier Discount ({pricing.tierDiscount})</span>
                      <span>-${(pricing.monthlySubtotal - pricing.monthlyTotal).toFixed(2)}</span>
                    </div>
                  )}
                  {pricing.setupFees > 0 && (
                    <div className="flex justify-between">
                      <span>Setup Fees</span>
                      <span>${pricing.setupFees}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>First Payment</span>
                    <span className="text-green-700">${pricing.firstPayment}</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-right">
                    Then ${pricing.monthlyTotal}/month
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("tier")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-green-700 hover:bg-green-800"
                disabled={completeOnboarding.isPending}
              >
                {completeOnboarding.isPending ? "Activating..." : "Complete Setup"}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Complete Step */}
        {currentStep === "complete" && (
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-green-200">
              <CardContent className="pt-8 pb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-700" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Welcome to The The L.A.W.S. Collective!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your account is now active. You'll receive an email with login instructions
                  and next steps to get started with your services.
                </p>
                <div className="space-y-3">
                  <Button className="w-full bg-green-700 hover:bg-green-800">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Onboarding Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
