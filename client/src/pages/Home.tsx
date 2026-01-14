import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Share2,
  Zap,
  Shield,
  BookOpen,
  DollarSign,
  Gavel,
  Cpu,
  Microscope,
  Leaf,
  Wind,
  Droplets,
  Heart,
  Map,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

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
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/master_system.json")
      .then((res) => res.json())
      .then((data) => {
        setSystemData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading system data:", err);
        toast.error("Failed to load system data");
        setLoading(false);
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

  const pillarIcons: Record<string, React.ReactNode> = {
    "Sovereign System Build": <Shield className="w-6 h-6" />,
    "Legal & Probate Case": <Gavel className="w-6 h-6" />,
    "Education & Academy": <BookOpen className="w-6 h-6" />,
    "Grant & Funding": <DollarSign className="w-6 h-6" />,
    "L.A.W.S. Collective": <Leaf className="w-6 h-6" />,
  };

  const lawsIcons: Record<string, React.ReactNode> = {
    "LAND - Reconnection & Stability": <Map className="w-5 h-5" />,
    "AIR - Education & Knowledge": <Wind className="w-5 h-5" />,
    "WATER - Healing & Balance": <Droplets className="w-5 h-5" />,
    "SELF - Purpose & Skills": <Heart className="w-5 h-5" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Zap className="w-12 h-12 animate-pulse mx-auto text-accent" />
          <p className="text-foreground">Loading LuvOnPurpose System...</p>
        </div>
      </div>
    );
  }

  if (!systemData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-foreground">Unable to load system data</p>
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
                {systemData.system_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {systemData.tagline}
              </p>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-12">
        {/* Executive Summary */}
        <section className="mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Executive Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Vision</h3>
                <p className="text-muted-foreground">
                  {systemData.executive_summary.vision}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Timeline</h3>
                <p className="text-muted-foreground">
                  {systemData.executive_summary.timeline}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="pillars" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="pillars">Core Pillars</TabsTrigger>
            <TabsTrigger value="roadmap">Implementation</TabsTrigger>
            <TabsTrigger value="laws">L.A.W.S. Framework</TabsTrigger>
            <TabsTrigger value="scope">System Scope</TabsTrigger>
          </TabsList>

          {/* Core Pillars Tab */}
          <TabsContent value="pillars" className="space-y-4 mt-6">
            <div className="space-y-4">
              {systemData.core_pillars.map((pillar, idx) => (
                <Card
                  key={idx}
                  className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-accent"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-accent mt-1">
                      {pillarIcons[pillar.name] || (
                        <Shield className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {pillar.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pillar.description}
                      </p>

                      {pillar.pillars && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">
                            Framework Pillars:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {pillar.pillars.map((p, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                {lawsIcons[p] && (
                                  <span className="text-accent">
                                    {lawsIcons[p]}
                                  </span>
                                )}
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {pillar.focus && (
                        <div className="mt-3 p-3 bg-secondary/30 rounded">
                          <p className="text-xs font-semibold text-foreground">
                            Focus:
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {pillar.focus}
                          </p>
                        </div>
                      )}

                      {pillar.components && pillar.components.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Components:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {pillar.components.map((comp, i) => (
                              <span
                                key={i}
                                className="text-xs bg-accent/10 text-accent px-2 py-1 rounded"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Implementation Roadmap Tab */}
          <TabsContent value="roadmap" className="space-y-4 mt-6">
            <div className="space-y-3">
              {Object.entries(systemData.implementation_roadmap).map(
                ([key, value]) => (
                  <Card key={key} className="p-4 border-l-4 border-l-primary">
                    <div className="flex items-start gap-4">
                      <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {value}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              )}
            </div>
          </TabsContent>

          {/* L.A.W.S. Framework Tab */}
          <TabsContent value="laws" className="space-y-4 mt-6">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <h3 className="text-lg font-bold text-foreground mb-4">
                L.A.W.S. Collective Framework
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                A community-focused framework helping people reconnect with
                land, strengthen identity, restore balance, and build practical
                skills for generational wealth.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "LAND - Reconnection & Stability",
                    desc: "Understanding roots, migrations, and family history",
                  },
                  {
                    title: "AIR - Education & Knowledge",
                    desc: "Learning, personal development, and communication",
                  },
                  {
                    title: "WATER - Healing & Balance",
                    desc: "Emotional resilience, healing cycles, and healthy decision-making",
                  },
                  {
                    title: "SELF - Purpose & Skills",
                    desc: "Financial literacy, business readiness, and purposeful growth",
                  },
                ].map((item, i) => (
                  <Card key={i} className="p-4 bg-background/50">
                    <div className="flex items-start gap-3">
                      <div className="text-green-600 dark:text-green-400">
                        {lawsIcons[item.title]}
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
          </TabsContent>

          {/* System Scope Tab */}
          <TabsContent value="scope" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(systemData.total_scope).map(([key, value]) => (
                <Card
                  key={key}
                  className="p-6 bg-gradient-to-br from-primary/5 to-accent/5"
                >
                  <p className="text-sm text-muted-foreground capitalize mb-2">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : value}
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Concepts Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            System Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Token Sequence",
                items: ["MIRROR", "GIFT", "SPARK", "HOUSE", "CROWN"],
              },
              {
                title: "Activation Flow",
                items: [
                  "Token Validation",
                  "Scrolls Sealed",
                  "LuvLedger Init",
                  "House Activation",
                  "Crown Issuance",
                  "Archival",
                ],
              },
              {
                title: "System Layers",
                items: [
                  "Token & Activation",
                  "Financial & Payment",
                  "Validation & Verification",
                  "Resilience & Recovery",
                  "Legal & Governance",
                  "Education & Development",
                  "Funding & Grants",
                  "Community & Collective",
                ],
              },
            ].map((section, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="font-bold text-foreground mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

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
