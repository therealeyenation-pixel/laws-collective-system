import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Rocket,
  User,
  Target,
  Route,
  Building2,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Users,
  Heart,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";

interface PersonalProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  
  // Background
  highestEducation: string;
  fieldOfStudy: string;
  currentOccupation: string;
  yearsExperience: string;
  skills: string[];
  certifications: string;
  
  // Goals
  primaryGoal: string;
  secondaryGoals: string[];
  timeline: string;
  
  // Interests
  departmentInterests: string[];
  availability: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
}

const SKILLS_OPTIONS = [
  "Business Development",
  "Finance/Accounting",
  "Marketing",
  "Sales",
  "Project Management",
  "Technology/IT",
  "Design/Creative",
  "Writing/Communications",
  "Legal/Compliance",
  "Education/Training",
  "Healthcare",
  "Real Estate",
  "Construction",
  "Media Production",
  "Grant Writing",
  "Community Organizing",
];

const DEPARTMENT_OPTIONS = [
  { id: "business", name: "Business Development", icon: Briefcase },
  { id: "finance", name: "Finance", icon: Building2 },
  { id: "education", name: "Education/Training", icon: GraduationCap },
  { id: "media", name: "Media Production", icon: FileText },
  { id: "design", name: "Design", icon: Target },
  { id: "outreach", name: "Community Outreach", icon: Users },
  { id: "grants", name: "Grants & Proposals", icon: FileText },
  { id: "hr", name: "Human Resources", icon: Users },
  { id: "qaqc", name: "Quality Assurance", icon: CheckCircle2 },
  { id: "purchasing", name: "Purchasing", icon: Briefcase },
];

const PRIMARY_GOALS = [
  { id: "start-business", label: "Start or grow a business", path: "/business-setup" },
  { id: "employment", label: "Find employment or career opportunities", path: "/family-onboarding" },
  { id: "education", label: "Get training and certifications", path: "/academy" },
  { id: "community", label: "Join community programs", path: "/outreach" },
  { id: "grants", label: "Apply for grants or funding", path: "/grants" },
  { id: "wealth-building", label: "Build generational wealth", path: "/trust-governance" },
];

export default function GettingStarted() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [recommendedPath, setRecommendedPath] = useState<string | null>(null);

  const [profile, setProfile] = useState<PersonalProfile>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    dateOfBirth: "",
    highestEducation: "",
    fieldOfStudy: "",
    currentOccupation: "",
    yearsExperience: "",
    skills: [],
    certifications: "",
    primaryGoal: "",
    secondaryGoals: [],
    timeline: "",
    departmentInterests: [],
    availability: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  const updateProfile = (field: keyof PersonalProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleDepartment = (dept: string) => {
    setProfile((prev) => ({
      ...prev,
      departmentInterests: prev.departmentInterests.includes(dept)
        ? prev.departmentInterests.filter((d) => d !== dept)
        : [...prev.departmentInterests, dept],
    }));
  };

  const toggleSecondaryGoal = (goal: string) => {
    setProfile((prev) => ({
      ...prev,
      secondaryGoals: prev.secondaryGoals.includes(goal)
        ? prev.secondaryGoals.filter((g) => g !== goal)
        : [...prev.secondaryGoals, goal],
    }));
  };

  const handleSubmitProfile = () => {
    setIsSubmitting(true);
    // Simulate saving profile
    setTimeout(() => {
      setIsSubmitting(false);
      setProfileComplete(true);
      // Determine recommended path based on primary goal
      const selectedGoal = PRIMARY_GOALS.find((g) => g.id === profile.primaryGoal);
      setRecommendedPath(selectedGoal?.path || "/dashboard");
      toast.success("Profile created successfully!");
    }, 1500);
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // Profile Complete - Show Recommended Path
  if (profileComplete) {
    const selectedGoal = PRIMARY_GOALS.find((g) => g.id === profile.primaryGoal);
    
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
              <CheckCircle2 className="w-24 h-24 text-emerald-500 relative" />
            </div>
          </div>
          
          <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="pt-6">
              <h1 className="text-3xl font-bold mb-4">Welcome, {profile.firstName}!</h1>
              <p className="text-muted-foreground mb-8">
                Your profile has been created. Based on your goals, here's your recommended path:
              </p>
              
              <div className="p-6 bg-muted rounded-lg mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Primary Goal</p>
                    <p className="font-semibold text-lg">{selectedGoal?.label}</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={recommendedPath || "/dashboard"}>
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <p className="font-medium">Other Services Available:</p>
                <div className="grid grid-cols-2 gap-3">
                  {PRIMARY_GOALS.filter((g) => g.id !== profile.primaryGoal).map((goal) => (
                    <Button key={goal.id} variant="outline" asChild className="justify-start">
                      <Link href={goal.path}>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {goal.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Getting Started</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to LuvOnPurpose</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Let's create your profile so we can connect you with the right services and opportunities.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Step 1: Personal Information
              </CardTitle>
              <CardDescription>
                Tell us about yourself so we can create your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={profile.firstName}
                    onChange={(e) => updateProfile("firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={profile.lastName}
                    onChange={(e) => updateProfile("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 555-5555"
                    value={profile.phone}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={profile.address}
                  onChange={(e) => updateProfile("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={profile.city}
                    onChange={(e) => updateProfile("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={profile.state}
                    onChange={(e) => updateProfile("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="12345"
                    value={profile.zip}
                    onChange={(e) => updateProfile("zip", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!profile.firstName || !profile.lastName || !profile.email || !profile.phone}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Background & Skills */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Step 2: Background & Skills
              </CardTitle>
              <CardDescription>
                Help us understand your experience and capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education Level</Label>
                  <Select value={profile.highestEducation} onValueChange={(v) => updateProfile("highestEducation", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School / GED</SelectItem>
                      <SelectItem value="some-college">Some College</SelectItem>
                      <SelectItem value="associates">Associate's Degree</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="doctorate">Doctorate / Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">Field of Study</Label>
                  <Input
                    id="fieldOfStudy"
                    placeholder="e.g., Business Administration"
                    value={profile.fieldOfStudy}
                    onChange={(e) => updateProfile("fieldOfStudy", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Current Occupation</Label>
                  <Input
                    id="occupation"
                    placeholder="e.g., Project Manager"
                    value={profile.currentOccupation}
                    onChange={(e) => updateProfile("currentOccupation", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select value={profile.yearsExperience} onValueChange={(v) => updateProfile("yearsExperience", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-20">11-20 years</SelectItem>
                      <SelectItem value="20+">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills (Select all that apply)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {SKILLS_OPTIONS.map((skill) => (
                    <div
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`p-2 text-sm rounded-lg border cursor-pointer transition-colors ${
                        profile.skills.includes(skill)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications / Licenses</Label>
                <Textarea
                  id="certifications"
                  placeholder="List any professional certifications, licenses, or credentials..."
                  value={profile.certifications}
                  onChange={(e) => updateProfile("certifications", e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Goals & Needs Assessment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Step 3: Goals & Needs Assessment
              </CardTitle>
              <CardDescription>
                What are you looking to achieve? This helps us connect you with the right services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>What is your PRIMARY goal? *</Label>
                <div className="grid gap-3">
                  {PRIMARY_GOALS.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => updateProfile("primaryGoal", goal.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        profile.primaryGoal === goal.id
                          ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          profile.primaryGoal === goal.id ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {profile.primaryGoal === goal.id && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium">{goal.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Any secondary goals? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIMARY_GOALS.filter((g) => g.id !== profile.primaryGoal).map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => toggleSecondaryGoal(goal.id)}
                      className={`p-3 text-sm rounded-lg border cursor-pointer transition-colors ${
                        profile.secondaryGoals.includes(goal.id)
                          ? "bg-primary/10 border-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {goal.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">What's your timeline?</Label>
                <Select value={profile.timeline} onValueChange={(v) => updateProfile("timeline", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediately (within 1 month)</SelectItem>
                    <SelectItem value="short">Short-term (1-3 months)</SelectItem>
                    <SelectItem value="medium">Medium-term (3-6 months)</SelectItem>
                    <SelectItem value="long">Long-term (6+ months)</SelectItem>
                    <SelectItem value="exploring">Just exploring options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(4)} disabled={!profile.primaryGoal}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Department Interests & Availability */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Step 4: Interests & Availability
              </CardTitle>
              <CardDescription>
                Which areas interest you most? This helps us match you with opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Department Interests (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DEPARTMENT_OPTIONS.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <div
                        key={dept.id}
                        onClick={() => toggleDepartment(dept.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          profile.departmentInterests.includes(dept.id)
                            ? "bg-primary/10 border-primary"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${
                            profile.departmentInterests.includes(dept.id) ? "text-primary" : "text-muted-foreground"
                          }`} />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select value={profile.availability} onValueChange={(v) => updateProfile("availability", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time (40+ hours/week)</SelectItem>
                    <SelectItem value="part-time">Part-time (20-40 hours/week)</SelectItem>
                    <SelectItem value="limited">Limited (10-20 hours/week)</SelectItem>
                    <SelectItem value="volunteer">Volunteer (as needed)</SelectItem>
                    <SelectItem value="consulting">Consulting/Project-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(5)}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Emergency Contact & Review */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Step 5: Emergency Contact & Review
              </CardTitle>
              <CardDescription>
                Add an emergency contact and review your profile before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-4">Emergency Contact</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Name</Label>
                    <Input
                      id="emergencyName"
                      placeholder="Contact name"
                      value={profile.emergencyName}
                      onChange={(e) => updateProfile("emergencyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      placeholder="e.g., Spouse"
                      value={profile.emergencyRelationship}
                      onChange={(e) => updateProfile("emergencyRelationship", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={profile.emergencyPhone}
                      onChange={(e) => updateProfile("emergencyPhone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="font-medium">Profile Summary</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Primary Goal</p>
                    <p className="font-medium">
                      {PRIMARY_GOALS.find((g) => g.id === profile.primaryGoal)?.label || "Not selected"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Availability</p>
                    <p className="font-medium capitalize">{profile.availability?.replace("-", " ") || "Not specified"}</p>
                  </div>
                </div>
                {profile.skills.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSubmitProfile} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
