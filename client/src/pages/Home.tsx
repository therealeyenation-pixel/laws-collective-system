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

export default function Home() {
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
              <h1 className="text-3xl font-bold text-foreground">
                LuvOnPurpose Sovereign System
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-Generational Wealth Architecture
              </p>
            </div>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <Button
                  variant="default"
                  onClick={() => (window.location.href = getLoginUrl())}
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
        {/* L.A.W.S. Framework - Public Section */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              L.A.W.S. Collective Framework
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
          {!isAuthenticated ? (
            <Button
              size="lg"
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2"
            >
              <Shield className="w-5 h-5" />
              Get Started
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => (window.location.href = "/dashboard")}
              className="gap-2"
            >
              <Shield className="w-5 h-5" />
              Go to Dashboard
            </Button>
          )}
        </section>
      </main>
    </div>
  );
}
