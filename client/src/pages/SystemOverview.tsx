import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Share2,
  Zap,
  Shield,
  BookOpen,
  DollarSign,
  Gavel,
  Leaf,
  Wind,
  Droplets,
  Heart,
  Map,
  Calendar,
  Building2,
  Coins,
  Activity,
  ArrowRight,
  Flame,
  GraduationCap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useState, useEffect } from "react";

interface SystemData {
  system_name: string;
  tagline: string;
  executive_summary: Record<string, string>;
  core_pillars: Array<{
    name: string;
    description: string;
    workstreams?: string[];
    components?: string[];
    pillars?: string[];
    focus?: string;
  }>;
  implementation_roadmap: Record<string, string>;
  total_scope: Record<string, any>;
}

export default function SystemOverview() {
  const { user, isAuthenticated } = useAuth();
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/master_system.json")
      .then((res) => res.json())
      .then((data) => {
        setSystemData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading system data:", err);
        toast.error("Failed to load system data");
        setIsLoading(false);
      });
  }, []);

  const handleDownload = () => {
    if (!systemData) return;
    const dataStr = JSON.stringify(systemData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "luv-on-purpose-system.json";
    link.click();
    toast.success("System data downloaded");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "LuvOnPurpose Sovereign System",
        text: "Explore the complete LuvOnPurpose multi-generational system architecture",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 animate-pulse mx-auto text-accent" />
          <p className="text-foreground">Loading LuvOnPurpose System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Welcome to
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                <span className="text-primary">L</span>uvOnPurpose{" "}
                <span className="text-primary">A</span>utonomous{" "}
                <span className="text-primary">W</span>ealth{" "}
                <span className="text-primary">S</span>ystem
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary text-lg">LAWS</span>
                <span>•</span>
                <span>Multi-Generational Wealth Architecture</span>
                <span>•</span>
                <span className="text-xs">A L.A.W.S. Collective Enterprise</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <Button
                  variant="default"
                  onClick={() => (window.location.href = getLoginUrl("/dashboard"))}
                >
                  Sign In
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-12">
        {/* Promotional Video Section */}
        <section className="mb-12">
          <Card className="p-0 overflow-hidden bg-gradient-to-br from-green-900 to-emerald-900 border-green-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Build Multi-Generational Wealth Through Purpose & Community
                </h2>
                <p className="text-green-100 mb-6 text-lg">
                  Join thousands of families creating lasting legacies through our sovereign wealth system. The L.A.W.S. Collective, LLC provides the framework, tools, and community to transform your family's financial future.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    className="bg-white text-green-900 hover:bg-green-50"
                    onClick={() => (window.location.href = getLoginUrl("/dashboard"))}
                  >
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative aspect-video lg:aspect-auto">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  poster="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/jegwzoGgrKBkchAD.png"
                >
                  <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/YCWgiNkqKtgJUzna.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/50 to-transparent lg:hidden" />
              </div>
            </div>
          </Card>
        </section>

        {/* L.A.W.S. Framework - Public Section */}
        <section id="learn-more" className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              The L.A.W.S. Collective, LLC Framework
            </h2>
            <p className="text-muted-foreground mb-6">
              A community-focused framework helping people reconnect with land, strengthen identity, restore balance, and build practical skills for generational wealth.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "LAND - Reconnection & Stability",
                  desc: "Understanding roots, migrations, and family history",
                  icon: <Map className="w-5 h-5" />,
                },
                {
                  title: "AIR - Education & Knowledge",
                  desc: "Learning, personal development, and communication",
                  icon: <Wind className="w-5 h-5" />,
                },
                {
                  title: "WATER - Healing & Balance",
                  desc: "Emotional resilience, healing cycles, and healthy decision-making",
                  icon: <Droplets className="w-5 h-5" />,
                },
                {
                  title: "SELF - Purpose & Skills",
                  desc: "Financial literacy, business readiness, and purposeful growth",
                  icon: <Heart className="w-5 h-5" />,
                },
              ].map((item, i) => (
                <Card key={i} className="p-4 bg-background/50">
                  <div className="flex items-start gap-3">
                    <div className="text-green-600 dark:text-green-400">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Ready to Build Your Sovereign Future?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join the LuvOnPurpose system to access our comprehensive academy, business simulators, and autonomous wealth generation tools.
            </p>
          </div>
          
          {/* Welcome Message - shows when authenticated */}
          {isAuthenticated && user && (
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Welcome back, {user.name || 'User'}!
              </p>
            </div>
          )}
          
          {/* Navigation Cards - ALWAYS visible */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
              onClick={() => (window.location.href = "/system-overview")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                  <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground">System Overview</h3>
                  <p className="text-sm text-muted-foreground">View entities, architecture & operations</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </div>
            </Card>
            
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground">Main Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Business entities, simulators & LuvLedger</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </div>
            </Card>
            
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20"
              onClick={() => (window.location.href = "/academy")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground">Luv Learning Academy</h3>
                  <p className="text-sm text-muted-foreground">K-12 sovereign education & Divine STEM</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </div>
            </Card>
            
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-indigo-50 dark:from-emerald-950/20 dark:to-indigo-950/20"
              onClick={() => (window.location.href = "/vault")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-foreground">Document Vault</h3>
                  <p className="text-sm text-muted-foreground">Secure business plans & grants</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </div>
            </Card>
          </div>
          
          {/* Quick Action Buttons - ALWAYS visible */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              onClick={() => (window.location.href = "/system-overview")}
              className="gap-2 bg-amber-600 hover:bg-amber-700"
            >
              <Shield className="w-5 h-5" />
              System Overview
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
              className="gap-2"
            >
              <Activity className="w-5 h-5" />
              Open Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/academy")}
              className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Flame className="w-5 h-5" />
              Luv Academy
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/vault")}
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <FileText className="w-5 h-5" />
              Document Vault
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                onClick={() => (window.location.href = getLoginUrl("/dashboard"))}
                className="gap-2"
              >
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
