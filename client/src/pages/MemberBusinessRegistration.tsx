import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  MapPin,
  Heart,
} from "lucide-react";

type FormStep = "business" | "contact" | "commitment" | "review";

interface FormData {
  // Business Info
  businessName: string;
  businessType: string;
  ein: string;
  stateOfFormation: string;
  yearEstablished: string;
  industry: string;
  description: string;
  website: string;
  
  // Contact Info
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  
  // Commitment
  lawsPillar: string;
  sponsoringHouse: string;
  annualRevenue: string;
  employeeCount: string;
  communityCommitment: string;
  agreeToTerms: boolean;
  agreeToReinvestment: boolean;
}

export default function MemberBusinessRegistration() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<FormStep>("business");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    businessType: "llc",
    ein: "",
    stateOfFormation: "",
    yearEstablished: "",
    industry: "",
    description: "",
    website: "",
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZip: "",
    lawsPillar: "",
    sponsoringHouse: "",
    annualRevenue: "",
    employeeCount: "",
    communityCommitment: "",
    agreeToTerms: false,
    agreeToReinvestment: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const registerMutation = trpc.closedLoopWealth.registerMemberBusiness.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleSubmit = async () => {
    if (!formData.agreeToTerms || !formData.agreeToReinvestment) {
      toast.error("Please agree to all terms before submitting");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await registerMutation.mutateAsync({
        businessName: formData.businessName,
        businessType: formData.businessType as any,
        ein: formData.ein || undefined,
        stateOfFormation: formData.stateOfFormation,
        yearEstablished: parseInt(formData.yearEstablished) || undefined,
        industry: formData.industry,
        description: formData.description,
        website: formData.website || undefined,
        contactName: formData.contactName,
        contactTitle: formData.contactTitle,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        businessAddress: formData.businessAddress,
        businessCity: formData.businessCity,
        businessState: formData.businessState,
        businessZip: formData.businessZip,
        lawsPillar: formData.lawsPillar as any,
        sponsoringHouseId: formData.sponsoringHouse ? parseInt(formData.sponsoringHouse) : undefined,
        annualRevenue: formData.annualRevenue,
        employeeCount: parseInt(formData.employeeCount) || 1,
        communityCommitment: formData.communityCommitment,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: { id: FormStep; title: string; icon: React.ReactNode }[] = [
    { id: "business", title: "Business Info", icon: <Building2 className="w-5 h-5" /> },
    { id: "contact", title: "Contact Details", icon: <Users className="w-5 h-5" /> },
    { id: "commitment", title: "Commitment", icon: <Heart className="w-5 h-5" /> },
    { id: "review", title: "Review & Submit", icon: <FileText className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900">
        <div className="container max-w-2xl mx-auto px-4 py-16">
          <Card className="p-8 text-center">
            <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Application Submitted!
            </h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Thank you for applying to become a member of L.A.W.S. Collective. 
              Our team will review your application and contact you within 5-7 business days.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-2">What's Next?</h3>
              <ul className="text-sm text-muted-foreground text-left space-y-2">
                <li>• Application review by membership committee</li>
                <li>• Verification of business information</li>
                <li>• Sponsoring House assignment (if not selected)</li>
                <li>• Welcome call and onboarding</li>
                <li>• Access to member benefits and resources</li>
              </ul>
            </div>
            <Button onClick={() => setLocation("/")} className="gap-2">
              Return Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            508 Member Business Registration
          </h1>
          <p className="text-muted-foreground">
            Join L.A.W.S. Collective and become part of the closed-loop wealth ecosystem
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`flex flex-col items-center ${
                idx <= currentStepIndex ? "text-amber-600" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  idx < currentStepIndex
                    ? "bg-green-600 text-white"
                    : idx === currentStepIndex
                    ? "bg-amber-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                {idx < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : s.icon}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        <Card className="p-6">
          {/* Step 1: Business Info */}
          {step === "business" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                Business Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Business Name *</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    placeholder="Your Business LLC"
                  />
                </div>
                
                <div>
                  <Label>Business Type *</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(v) => updateField("businessType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="nonprofit">Nonprofit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>EIN (if applicable)</Label>
                  <Input
                    value={formData.ein}
                    onChange={(e) => updateField("ein", e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                
                <div>
                  <Label>State of Formation *</Label>
                  <Input
                    value={formData.stateOfFormation}
                    onChange={(e) => updateField("stateOfFormation", e.target.value)}
                    placeholder="e.g., California"
                  />
                </div>
                
                <div>
                  <Label>Year Established</Label>
                  <Input
                    type="number"
                    value={formData.yearEstablished}
                    onChange={(e) => updateField("yearEstablished", e.target.value)}
                    placeholder="2024"
                  />
                </div>
                
                <div>
                  <Label>Industry *</Label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Retail"
                  />
                </div>
                
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://yourbusiness.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Business Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Describe your business, products/services, and mission..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === "contact" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name *</Label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                
                <div>
                  <Label>Title/Position *</Label>
                  <Input
                    value={formData.contactTitle}
                    onChange={(e) => updateField("contactTitle", e.target.value)}
                    placeholder="e.g., Owner, CEO, Manager"
                  />
                </div>
                
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => updateField("contactPhone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Business Address *</Label>
                  <Input
                    value={formData.businessAddress}
                    onChange={(e) => updateField("businessAddress", e.target.value)}
                    placeholder="Street Address"
                  />
                </div>
                
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.businessCity}
                    onChange={(e) => updateField("businessCity", e.target.value)}
                    placeholder="City"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>State *</Label>
                    <Input
                      value={formData.businessState}
                      onChange={(e) => updateField("businessState", e.target.value)}
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <Label>ZIP *</Label>
                    <Input
                      value={formData.businessZip}
                      onChange={(e) => updateField("businessZip", e.target.value)}
                      placeholder="90210"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Commitment */}
          {step === "commitment" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-600" />
                Membership Commitment
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Primary L.A.W.S. Pillar *</Label>
                  <Select
                    value={formData.lawsPillar}
                    onValueChange={(v) => updateField("lawsPillar", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pillar alignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="land">LAND - Property & Stability</SelectItem>
                      <SelectItem value="air">AIR - Education & Knowledge</SelectItem>
                      <SelectItem value="water">WATER - Healing & Balance</SelectItem>
                      <SelectItem value="self">SELF - Purpose & Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Annual Revenue Range *</Label>
                  <Select
                    value={formData.annualRevenue}
                    onValueChange={(v) => updateField("annualRevenue", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_50k">Under $50,000</SelectItem>
                      <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                      <SelectItem value="250k_500k">$250,000 - $500,000</SelectItem>
                      <SelectItem value="500k_1m">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="over_1m">Over $1,000,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Number of Employees</Label>
                  <Input
                    type="number"
                    value={formData.employeeCount}
                    onChange={(e) => updateField("employeeCount", e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label>Sponsoring House (optional)</Label>
                  <Select
                    value={formData.sponsoringHouse}
                    onValueChange={(v) => updateField("sponsoringHouse", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or leave blank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No preference (will be assigned)</SelectItem>
                      {/* Houses would be loaded dynamically */}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <Label>Community Commitment Statement *</Label>
                  <Textarea
                    value={formData.communityCommitment}
                    onChange={(e) => updateField("communityCommitment", e.target.value)}
                    placeholder="Describe how your business will contribute to the L.A.W.S. Collective community and support generational wealth building..."
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <h3 className="font-semibold text-foreground">Membership Agreement</h3>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateField("agreeToTerms", !!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the L.A.W.S. Collective membership terms and conditions, 
                    including operating according to the shared values and principles of 
                    generational wealth building and community empowerment.
                  </Label>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="reinvestment"
                    checked={formData.agreeToReinvestment}
                    onCheckedChange={(checked) => updateField("agreeToReinvestment", !!checked)}
                  />
                  <Label htmlFor="reinvestment" className="text-sm text-muted-foreground">
                    I commit to the <strong>10% Community Reinvestment</strong> contribution 
                    from my business's net revenue, which supports the collective treasury 
                    and funds job creation, member benefits, and community programs.
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === "review" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Review Your Application
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Business Information
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Name:</strong> {formData.businessName}</p>
                    <p><strong>Type:</strong> {formData.businessType}</p>
                    <p><strong>EIN:</strong> {formData.ein || "Not provided"}</p>
                    <p><strong>State:</strong> {formData.stateOfFormation}</p>
                    <p><strong>Industry:</strong> {formData.industry}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Contact Information
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Contact:</strong> {formData.contactName}</p>
                    <p><strong>Title:</strong> {formData.contactTitle}</p>
                    <p><strong>Email:</strong> {formData.contactEmail}</p>
                    <p><strong>Phone:</strong> {formData.contactPhone}</p>
                    <p><strong>Address:</strong> {formData.businessCity}, {formData.businessState}</p>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Membership Commitment
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>L.A.W.S. Pillar:</strong> {formData.lawsPillar.toUpperCase()}</p>
                    <p><strong>Annual Revenue:</strong> {formData.annualRevenue.replace(/_/g, " ")}</p>
                    <p><strong>Employees:</strong> {formData.employeeCount || 1}</p>
                    <p><strong>Community Commitment:</strong> {formData.communityCommitment}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  By submitting this application, you confirm that all information provided 
                  is accurate and you agree to the membership terms and 10% Community 
                  Reinvestment commitment.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const idx = currentStepIndex;
                if (idx > 0) {
                  setStep(steps[idx - 1].id);
                } else {
                  setLocation("/");
                }
              }}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            
            {step !== "review" ? (
              <Button
                onClick={() => {
                  const idx = currentStepIndex;
                  if (idx < steps.length - 1) {
                    setStep(steps[idx + 1].id);
                  }
                }}
                className="gap-2 bg-amber-600 hover:bg-amber-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.agreeToTerms || !formData.agreeToReinvestment}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
