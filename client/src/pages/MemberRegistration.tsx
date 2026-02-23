/**
 * Member Registration Page
 * 
 * Public-facing multi-step registration form for 508 membership
 * with business information collection, tier selection, and status tracking
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Search,
  Clock,
  XCircle,
  AlertCircle,
  Star,
  Briefcase,
  Shield,
  Crown,
} from "lucide-react";

// Business types from the service
const BUSINESS_TYPES = [
  { id: "llc", name: "Limited Liability Company (LLC)" },
  { id: "corporation", name: "Corporation (C-Corp or S-Corp)" },
  { id: "sole_proprietor", name: "Sole Proprietorship" },
  { id: "partnership", name: "Partnership" },
  { id: "nonprofit", name: "Nonprofit Organization" },
  { id: "cooperative", name: "Cooperative" },
  { id: "trust", name: "Business Trust" },
  { id: "other", name: "Other" },
];

// Industry categories
const INDUSTRY_CATEGORIES = [
  { id: "technology", name: "Technology & Software" },
  { id: "healthcare", name: "Healthcare & Wellness" },
  { id: "retail", name: "Retail & E-commerce" },
  { id: "construction", name: "Construction & Real Estate" },
  { id: "food_service", name: "Food Service & Hospitality" },
  { id: "professional_services", name: "Professional Services" },
  { id: "manufacturing", name: "Manufacturing" },
  { id: "education", name: "Education & Training" },
  { id: "finance", name: "Finance & Insurance" },
  { id: "transportation", name: "Transportation & Logistics" },
  { id: "agriculture", name: "Agriculture & Farming" },
  { id: "arts_entertainment", name: "Arts & Entertainment" },
  { id: "nonprofit_social", name: "Nonprofit & Social Services" },
  { id: "energy", name: "Energy & Utilities" },
  { id: "other", name: "Other" },
];

// Membership tiers
const MEMBERSHIP_TIERS = [
  {
    id: "community",
    name: "Community Member",
    price: "$0/year",
    description: "Basic access for individuals exploring the collective",
    features: [
      "Access to community events",
      "Newsletter subscription",
      "Resource library access",
      "Networking opportunities",
    ],
    icon: Users,
    color: "bg-slate-100 text-slate-700",
  },
  {
    id: "professional",
    name: "Professional Member",
    price: "$250/year",
    description: "For established businesses seeking growth support",
    features: [
      "All Community benefits",
      "Business mentorship program",
      "Grant application support",
      "Marketing resources",
      "Quarterly workshops",
    ],
    icon: Briefcase,
    color: "bg-blue-100 text-blue-700",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Member",
    price: "$1,000/year",
    description: "Full partnership with comprehensive support",
    features: [
      "All Professional benefits",
      "Priority grant consideration",
      "Dedicated business advisor",
      "Co-marketing opportunities",
      "Investment introductions",
      "Board meeting participation",
    ],
    icon: Shield,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "founding",
    name: "Founding Member",
    price: "$5,000 (one-time)",
    description: "Legacy membership with permanent recognition",
    features: [
      "All Enterprise benefits",
      "Founding member recognition",
      "Governance voting rights",
      "Equity participation options",
      "Legacy naming opportunities",
      "Generational membership transfer",
    ],
    icon: Crown,
    color: "bg-amber-100 text-amber-700",
  },
];

// Employee count ranges
const EMPLOYEE_RANGES = [
  { id: "1", name: "Just me (1)" },
  { id: "2-5", name: "2-5 employees" },
  { id: "6-10", name: "6-10 employees" },
  { id: "11-25", name: "11-25 employees" },
  { id: "26-50", name: "26-50 employees" },
  { id: "51-100", name: "51-100 employees" },
  { id: "100+", name: "100+ employees" },
];

// Revenue ranges
const REVENUE_RANGES = [
  { id: "pre-revenue", name: "Pre-revenue / Startup" },
  { id: "0-50k", name: "$0 - $50,000" },
  { id: "50k-100k", name: "$50,000 - $100,000" },
  { id: "100k-250k", name: "$100,000 - $250,000" },
  { id: "250k-500k", name: "$250,000 - $500,000" },
  { id: "500k-1m", name: "$500,000 - $1,000,000" },
  { id: "1m+", name: "$1,000,000+" },
];

interface FormData {
  // Business Info
  businessName: string;
  businessType: string;
  ein: string;
  industry: string;
  yearEstablished: string;
  employeeCount: string;
  annualRevenue: string;
  description: string;
  
  // Contact Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  
  // Address
  street: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Membership
  membershipTier: string;
  sponsoringHouseId: string;
  
  // Agreement
  agreedToTerms: boolean;
  agreedToMembership: boolean;
}

const initialFormData: FormData = {
  businessName: "",
  businessType: "",
  ein: "",
  industry: "",
  yearEstablished: "",
  employeeCount: "",
  annualRevenue: "",
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  membershipTier: "professional",
  sponsoringHouseId: "",
  agreedToTerms: false,
  agreedToMembership: false,
};

export default function MemberRegistration() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"register" | "status">("register");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [statusEmail, setStatusEmail] = useState("");
  const [statusResult, setStatusResult] = useState<any>(null);
  
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  // tRPC mutations
  const submitMutation = trpc.memberRegistration.submitApplication.useMutation({
    onSuccess: (data) => {
      toast.success("Application submitted successfully!");
      setActiveTab("status");
      setStatusEmail(formData.contactEmail);
      setStatusResult({
        found: true,
        applicationId: data.applicationId,
        status: "pending",
        businessName: formData.businessName,
        membershipTier: formData.membershipTier,
        submittedAt: new Date().toISOString(),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });
  
  const checkStatusMutation = trpc.memberRegistration.checkStatus.useMutation({
    onSuccess: (data) => {
      setStatusResult(data);
      if (!data.found) {
        toast.error("No application found with that email address");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check status");
    },
  });
  
  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.businessName &&
          formData.businessType &&
          formData.industry &&
          formData.description
        );
      case 2:
        return !!(
          formData.contactName &&
          formData.contactEmail &&
          formData.contactPhone &&
          formData.street &&
          formData.city &&
          formData.state &&
          formData.zipCode
        );
      case 3:
        return !!formData.membershipTier;
      case 4:
        return formData.agreedToTerms && formData.agreedToMembership;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fill in all required fields");
    }
  };
  
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = () => {
    if (!validateStep(4)) {
      toast.error("Please agree to the terms and membership agreement");
      return;
    }
    
    submitMutation.mutate({
      businessName: formData.businessName,
      businessType: formData.businessType as any,
      ein: formData.ein || undefined,
      industry: formData.industry as any,
      yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
      employeeCount: formData.employeeCount || undefined,
      annualRevenue: formData.annualRevenue || undefined,
      description: formData.description,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      website: formData.website || undefined,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      membershipTier: formData.membershipTier as any,
      sponsoringHouseId: formData.sponsoringHouseId || undefined,
    });
  };
  
  const handleCheckStatus = () => {
    if (!statusEmail) {
      toast.error("Please enter your email address");
      return;
    }
    checkStatusMutation.mutate({ email: statusEmail });
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "under_review":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Not Approved";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-green-100">
        <div className="container max-w-6xl py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-800">
                Join L.A.W.S. Collective
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Member Business Registration
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="register" className="gap-2">
              <FileText className="w-4 h-4" />
              New Application
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-2">
              <Search className="w-4 h-4" />
              Check Status
            </TabsTrigger>
          </TabsList>

          {/* Registration Form */}
          <TabsContent value="register">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-green-700">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step Indicators */}
              <div className="flex justify-between mt-4">
                {[
                  { step: 1, label: "Business Info", icon: Building2 },
                  { step: 2, label: "Contact Details", icon: Users },
                  { step: 3, label: "Membership", icon: Star },
                  { step: 4, label: "Review & Submit", icon: CheckCircle2 },
                ].map(({ step, label, icon: Icon }) => (
                  <div
                    key={step}
                    className={`flex flex-col items-center ${
                      step <= currentStep ? "text-green-700" : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        step < currentStep
                          ? "bg-green-700 text-white"
                          : step === currentStep
                          ? "bg-green-100 text-green-700 border-2 border-green-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step < currentStep ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-700" />
                    Business Information
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={(e) => updateField("businessName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(v) => updateField("businessType", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ein">EIN (Optional)</Label>
                      <Input
                        id="ein"
                        placeholder="XX-XXXXXXX"
                        value={formData.ein}
                        onChange={(e) => updateField("ein", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(v) => updateField("industry", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRY_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        type="number"
                        placeholder="2020"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.yearEstablished}
                        onChange={(e) => updateField("yearEstablished", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Select
                        value={formData.employeeCount}
                        onValueChange={(v) => updateField("employeeCount", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYEE_RANGES.map((range) => (
                            <SelectItem key={range.id} value={range.id}>
                              {range.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annualRevenue">Annual Revenue</Label>
                      <Select
                        value={formData.annualRevenue}
                        onValueChange={(v) => updateField("annualRevenue", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          {REVENUE_RANGES.map((range) => (
                            <SelectItem key={range.id} value={range.id}>
                              {range.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your business, products/services, and goals..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-700" />
                    Contact Details
                  </CardTitle>
                  <CardDescription>
                    Primary contact and business address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        placeholder="Full name"
                        value={formData.contactName}
                        onChange={(e) => updateField("contactName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.contactEmail}
                        onChange={(e) => updateField("contactEmail", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.contactPhone}
                        onChange={(e) => updateField("contactPhone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://www.example.com"
                        value={formData.website}
                        onChange={(e) => updateField("website", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Business Address</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          placeholder="123 Main Street"
                          value={formData.street}
                          onChange={(e) => updateField("street", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => updateField("city", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            placeholder="GA"
                            maxLength={2}
                            value={formData.state}
                            onChange={(e) => updateField("state", e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            placeholder="30301"
                            value={formData.zipCode}
                            onChange={(e) => updateField("zipCode", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Membership Selection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-green-700" />
                      Select Membership Tier
                    </CardTitle>
                    <CardDescription>
                      Choose the membership level that best fits your needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {MEMBERSHIP_TIERS.map((tier) => {
                        const Icon = tier.icon;
                        const isSelected = formData.membershipTier === tier.id;
                        return (
                          <div
                            key={tier.id}
                            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                              isSelected
                                ? "border-green-700 bg-green-50"
                                : "border-gray-200 hover:border-green-300"
                            }`}
                            onClick={() => updateField("membershipTier", tier.id)}
                          >
                            {tier.popular && (
                              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-700">
                                Most Popular
                              </Badge>
                            )}
                            <div className="text-center mb-4">
                              <div
                                className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-3`}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <h3 className="font-semibold">{tier.name}</h3>
                              <p className="text-lg font-bold text-green-700 mt-1">
                                {tier.price}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground text-center mb-4">
                              {tier.description}
                            </p>
                            <ul className="space-y-2">
                              {tier.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="text-xs flex items-start gap-2"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle2 className="w-5 h-5 text-green-700" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sponsoring House (Optional)</CardTitle>
                    <CardDescription>
                      If you were referred by an existing House member, enter their House ID
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="House ID (e.g., HOUSE-001)"
                      value={formData.sponsoringHouseId}
                      onChange={(e) => updateField("sponsoringHouseId", e.target.value)}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-700" />
                      Review Your Application
                    </CardTitle>
                    <CardDescription>
                      Please review your information before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Business Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Business Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>{" "}
                          <span className="font-medium">{formData.businessName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>{" "}
                          <span className="font-medium">
                            {BUSINESS_TYPES.find((t) => t.id === formData.businessType)?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Industry:</span>{" "}
                          <span className="font-medium">
                            {INDUSTRY_CATEGORIES.find((c) => c.id === formData.industry)?.name}
                          </span>
                        </div>
                        {formData.ein && (
                          <div>
                            <span className="text-muted-foreground">EIN:</span>{" "}
                            <span className="font-medium">{formData.ein}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Contact:</span>{" "}
                          <span className="font-medium">{formData.contactName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>{" "}
                          <span className="font-medium">{formData.contactEmail}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          <span className="font-medium">{formData.contactPhone}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Address:</span>{" "}
                          <span className="font-medium">
                            {formData.street}, {formData.city}, {formData.state} {formData.zipCode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Membership Summary */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="font-semibold mb-3 text-green-800">Selected Membership</h3>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const tier = MEMBERSHIP_TIERS.find((t) => t.id === formData.membershipTier);
                          if (!tier) return null;
                          const Icon = tier.icon;
                          return (
                            <>
                              <div className={`w-10 h-10 rounded-full ${tier.color} flex items-center justify-center`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-semibold">{tier.name}</p>
                                <p className="text-sm text-green-700">{tier.price}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Agreements */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreedToTerms}
                          onCheckedChange={(checked) =>
                            updateField("agreedToTerms", checked as boolean)
                          }
                        />
                        <div>
                          <Label htmlFor="terms" className="cursor-pointer">
                            I agree to the Terms and Conditions *
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            By checking this box, you agree to abide by the L.A.W.S. Collective
                            terms of service, code of conduct, and community guidelines.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="membership"
                          checked={formData.agreedToMembership}
                          onCheckedChange={(checked) =>
                            updateField("agreedToMembership", checked as boolean)
                          }
                        />
                        <div>
                          <Label htmlFor="membership" className="cursor-pointer">
                            I agree to the Membership Agreement *
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            By checking this box, you acknowledge the membership obligations,
                            fee structure, and participation requirements for your selected tier.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="gap-2 bg-green-700 hover:bg-green-800">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="gap-2 bg-green-700 hover:bg-green-800"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Status Check */}
          <TabsContent value="status">
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-700" />
                  Check Application Status
                </CardTitle>
                <CardDescription>
                  Enter the email address you used to apply
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckStatus()}
                  />
                  <Button
                    onClick={handleCheckStatus}
                    disabled={checkStatusMutation.isPending}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    {checkStatusMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>

                {statusResult && statusResult.found && (
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{statusResult.businessName}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(statusResult.status)}
                        <Badge
                          variant={
                            statusResult.status === "approved"
                              ? "default"
                              : statusResult.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {getStatusText(statusResult.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Application ID:</span>
                        <p className="font-mono text-xs">{statusResult.applicationId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Membership Tier:</span>
                        <p className="capitalize">{statusResult.membershipTier}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <p>{new Date(statusResult.submittedAt).toLocaleDateString()}</p>
                      </div>
                      {statusResult.reviewedAt && (
                        <div>
                          <span className="text-muted-foreground">Reviewed:</span>
                          <p>{new Date(statusResult.reviewedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {statusResult.reviewNotes && (
                      <div className="bg-gray-50 rounded p-3">
                        <span className="text-sm text-muted-foreground">Review Notes:</span>
                        <p className="text-sm mt-1">{statusResult.reviewNotes}</p>
                      </div>
                    )}

                    {statusResult.status === "approved" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-green-800">
                          Welcome to L.A.W.S. Collective!
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Your membership has been approved. Check your email for next steps.
                        </p>
                      </div>
                    )}

                    {statusResult.status === "pending" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                        <p className="font-semibold text-yellow-800">
                          Application Received
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your application is in the queue. We typically review applications
                          within 3-5 business days.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
