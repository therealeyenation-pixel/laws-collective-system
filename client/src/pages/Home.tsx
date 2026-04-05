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
                Empower people today, secure resources tomorrow, preserve legacy for generations
              </p>
            </div>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="gap-2"
                >
                  Login
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="gap-2"
                  >
                    Dashboard
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Welcome, {user?.name || "User"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-12">
        {/* Public Landing Section */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Welcome to LuvOnPurpose
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Our Vision</h3>
                <p className="text-muted-foreground">
                  Build a sovereign, multi-generational system that starts with people and grows into legacy. A 5-year implementation arc leading to 100+ year vision.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Our Mission</h3>
                <p className="text-muted-foreground">
                  Establish indigenous sovereignty rights, create closed-loop economic systems, and enable autonomous businesses that generate wealth without human labor.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* L.A.W.S. Framework - Public Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
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
              <Card key={i} className="p-4 bg-background/50 border-l-4 border-l-accent">
                <div className="flex items-start gap-3">
                  <div className="text-accent">{item.icon}</div>
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
        </section>

        {/* Authenticated Content */}
        {isAuthenticated ? (
          <section className="mb-12">
            <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                System Access
              </h2>
              <p className="text-muted-foreground mb-6">
                You have access to the complete LuvOnPurpose system architecture, including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Sovereign System Build",
                  "Legal & Probate Case Framework",
                  "Educational Academy",
                  "Grant & Funding Packages",
                  "Interactive Simulators",
                  "LuvLedger Asset Management",
                  "Blockchain Integration",
                  "Multi-Level Trust Architecture",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </section>
        ) : (
          <section className="mb-12">
            <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Access the Full System
              </h2>
              <p className="text-muted-foreground mb-6">
                Login to access the complete LuvOnPurpose system architecture, including interactive simulators, business setup tools, and the LuvLedger asset management system.
              </p>
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="gap-2"
              >
                Login to Continue
              </Button>
            </Card>
          </section>
        )}

        {/* Footer Info */}
        <section className="mt-12 p-6 bg-secondary/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            LuvOnPurpose Sovereign System | Multi-Generational Architecture |
            5-Year Implementation Arc + 100+ Year Legacy Vision
          </p>
        </section>
      </main>
    </div>
  );
}
