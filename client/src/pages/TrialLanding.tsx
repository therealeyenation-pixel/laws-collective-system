import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Users,
  Building2,
  GraduationCap,
  Wallet,
  FileText,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function TrialLanding() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("signup");
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    email: "",
    name: "",
    organization: "",
    role: "",
    wantsUpdates: false,
  });
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const signupMutation = trpc.trial.signup.useMutation({
    onSuccess: (data) => {
      toast.success("Trial account created!", {
        description: `Your password is: ${data.credentials.password}. Please save it!`,
        duration: 10000,
      });
      // Store trial user info in localStorage
      localStorage.setItem("trialUser", JSON.stringify({
        id: data.userId,
        email: data.credentials.email,
      }));
      // Auto-login
      setLoginData({ email: data.credentials.email, password: data.credentials.password });
      setActiveTab("login");
    },
    onError: (error) => {
      toast.error("Signup failed", { description: error.message });
    },
  });

  const loginMutation = trpc.trial.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome, ${data.user.name}!`);
      // Store session info
      localStorage.setItem("trialUser", JSON.stringify({
        ...data.user,
        sessionId: data.sessionId,
      }));
      // Navigate to trial dashboard
      navigate("/trial/dashboard");
    },
    onError: (error) => {
      toast.error("Login failed", { description: error.message });
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate(signupData);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const features = [
    {
      icon: Building2,
      title: "House System",
      description: "Create and manage multi-generational wealth structures",
    },
    {
      icon: Wallet,
      title: "Financial Management",
      description: "Track donations, grants, and treasury operations",
    },
    {
      icon: Users,
      title: "HR & Workforce",
      description: "Employee management, payroll, and onboarding",
    },
    {
      icon: GraduationCap,
      title: "Academy & Training",
      description: "Educational simulators and certification programs",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "E-signatures, contracts, and secure document vault",
    },
    {
      icon: Shield,
      title: "Governance",
      description: "Board meetings, resolutions, and compliance tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">L.A.W.S. Collective</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setActiveTab("login")}>
                Sign In
              </Button>
              <Button onClick={() => setActiveTab("signup")}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Build Generational Wealth with the{" "}
                <span className="text-primary">L.A.W.S. System</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A comprehensive platform for managing multi-generational wealth structures,
                community organizations, and 508(c)(1)(a) entities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => setActiveTab("signup")}>
                  Start 14-Day Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Auth Card */}
            <Card className="shadow-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent>
                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name *</Label>
                        <Input
                          id="signup-name"
                          placeholder="John Doe"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email *</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@example.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-org">Organization</Label>
                        <Input
                          id="signup-org"
                          placeholder="Your organization (optional)"
                          value={signupData.organization}
                          onChange={(e) => setSignupData({ ...signupData, organization: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-role">Your Role</Label>
                        <Input
                          id="signup-role"
                          placeholder="e.g., Executive Director (optional)"
                          value={signupData.role}
                          onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="updates"
                          checked={signupData.wantsUpdates}
                          onCheckedChange={(checked) => 
                            setSignupData({ ...signupData, wantsUpdates: checked as boolean })
                          }
                        />
                        <Label htmlFor="updates" className="text-sm text-muted-foreground">
                          Send me product updates and news
                        </Label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={signupMutation.isPending}
                      >
                        {signupMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Start Free Trial"
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        14-day free trial. No credit card required.
                      </p>
                    </form>
                  </TabsContent>

                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="john@example.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform for building and managing generational wealth structures
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trial Benefits */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What's Included in Your Trial</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              "Full access to all features for 14 days",
              "Sample data to explore the system",
              "Educational simulators and training modules",
              "Document templates and e-signature tools",
              "Financial management dashboards",
              "Direct support from our team",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">L.A.W.S. Collective</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Building generational wealth through community and purpose.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
