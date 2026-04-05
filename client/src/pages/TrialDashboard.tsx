import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Shield,
  Building2,
  GraduationCap,
  Wallet,
  FileText,
  Users,
  Clock,
  Star,
  MessageSquare,
  ArrowRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { LiveTicker } from "@/components/LiveTicker";
import { WeatherWidget } from "@/components/WeatherWidget";

interface TrialUser {
  id: number;
  email: string;
  name: string;
  sessionId?: number;
  isTrialUser: boolean;
}

export default function TrialDashboard() {
  const [, navigate] = useLocation();
  const [trialUser, setTrialUser] = useState<TrialUser | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Load trial user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("trialUser");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setTrialUser(user);
      } catch {
        navigate("/trial");
      }
    } else {
      navigate("/trial");
    }
  }, [navigate]);

  // Get trial user details
  const { data: userDetails, isLoading } = trpc.trial.me.useQuery(
    { trialUserId: trialUser?.id },
    { enabled: !!trialUser?.id }
  );

  // Track page view
  const trackPageMutation = trpc.trial.trackPageView.useMutation();
  const trackFeatureMutation = trpc.trial.trackFeature.useMutation();

  useEffect(() => {
    if (trialUser?.id && trialUser?.sessionId) {
      trackPageMutation.mutate({
        trialUserId: trialUser.id,
        sessionId: trialUser.sessionId,
        pagePath: "/trial/dashboard",
        pageTitle: "Trial Dashboard",
      });
    }
  }, [trialUser?.id, trialUser?.sessionId]);

  const handleLogout = () => {
    if (trialUser?.id && trialUser?.sessionId) {
      // End session tracking would go here
    }
    localStorage.removeItem("trialUser");
    toast.success("Logged out successfully");
    navigate("/trial");
  };

  const handleExploreFeature = (category: string, name: string, path: string) => {
    if (trialUser?.id) {
      trackFeatureMutation.mutate({
        trialUserId: trialUser.id,
        featureCategory: category,
        featureName: name,
      });
    }
    navigate(path);
  };

  const features = [
    {
      category: "house_management",
      name: "House System",
      icon: Building2,
      title: "House System",
      description: "Create and manage multi-generational wealth structures",
      path: "/house",
      color: "bg-blue-500",
    },
    {
      category: "financial",
      name: "Donations",
      icon: Wallet,
      title: "Donations & Treasury",
      description: "Process donations and manage organizational funds",
      path: "/donate",
      color: "bg-green-500",
    },
    {
      category: "hr",
      name: "HR Dashboard",
      icon: Users,
      title: "HR & Workforce",
      description: "Employee management and onboarding",
      path: "/dept/hr",
      color: "bg-purple-500",
    },
    {
      category: "education",
      name: "Academy",
      icon: GraduationCap,
      title: "Academy & Training",
      description: "Educational simulators and certifications",
      path: "/academy",
      color: "bg-orange-500",
    },
    {
      category: "documents",
      name: "E-Signature",
      icon: FileText,
      title: "Document Management",
      description: "E-signatures and document vault",
      path: "/e-signature",
      color: "bg-red-500",
    },
    {
      category: "governance",
      name: "Board Governance",
      icon: Shield,
      title: "Governance",
      description: "Board meetings and resolutions",
      path: "/board-governance",
      color: "bg-indigo-500",
    },
  ];

  if (isLoading || !trialUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const daysRemaining = userDetails?.daysRemaining || 14;
  const progressPercent = ((14 - daysRemaining) / 14) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">L.A.W.S. Trial</span>
              <Badge variant="secondary">Trial Account</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setShowFeedback(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {userDetails?.name || trialUser.name}!
          </h1>
          <p className="text-muted-foreground">
            Explore the L.A.W.S. system and see how it can help your organization.
          </p>
        </div>

        {/* Trial Status Card */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Trial Status
              </CardTitle>
              <Badge variant={daysRemaining > 3 ? "default" : "destructive"}>
                {daysRemaining} days remaining
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-2 mb-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Trial started</span>
              <span>Trial ends</span>
            </div>
            {daysRemaining <= 3 && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm text-destructive">
                  Your trial is ending soon! Contact us to continue access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{userDetails?.totalSessions || 1}</div>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {Math.round((userDetails?.totalTimeSpentSeconds || 0) / 60)}m
              </div>
              <p className="text-sm text-muted-foreground">Time Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">6</div>
              <p className="text-sm text-muted-foreground">Features to Explore</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <p className="text-sm text-muted-foreground">Days Left</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Explore Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <Card 
                key={feature.name}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                onClick={() => handleExploreFeature(feature.category, feature.name, feature.path)}
              >
                <CardHeader>
                  <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-2`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{feature.description}</CardDescription>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Explore <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => navigate("/simulators")}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Try Simulators
              </Button>
              <Button variant="outline" onClick={() => navigate("/agents")}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with AI Agents
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(true)}>
                <Star className="mr-2 h-4 w-4" />
                Rate Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Feedback Widget */}
      {showFeedback && trialUser && (
        <FeedbackWidget
          trialUserId={trialUser.id}
          sessionId={trialUser.sessionId}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}
