import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Zap, Shield, BookOpen, DollarSign, Gavel } from "lucide-react";
import { toast } from "sonner";

interface SystemData {
  system_name: string;
  version: string;
  status: string;
  core_pillars: Array<{
    name: string;
    description: string;
    workstreams: string[];
    components: string[];
  }>;
  execution_modules: Array<{
    id: number;
    name: string;
    layer: string;
    function: string;
    status: string;
  }>;
  system_architecture: Record<
    string,
    {
      name: string;
      purpose: string;
      [key: string]: any;
    }
  >;
  activation_flow: Record<string, string>;
}

export default function Home() {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/complete_system.json")
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
    link.download = `luvonpurpose-system-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("System architecture downloaded");
  };

  const handleShare = async () => {
    const text = `LuvOnPurpose Sovereign System\n\nA comprehensive, integrated system featuring:\n- 4 Core Pillars\n- 5 Execution Modules\n- 7 System Layers\n- Multi-workstream architecture\n\nExplore the complete build.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "LuvOnPurpose System",
          text: text,
        });
        toast.success("Shared successfully");
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading LuvOnPurpose System...</p>
      </div>
    );
  }

  if (!systemData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Unable to load system data</p>
      </div>
    );
  }

  const pillarIcons: Record<string, React.ReactNode> = {
    "Sovereign System Build": <Shield className="w-6 h-6" />,
    "Legal & Probate Case": <Gavel className="w-6 h-6" />,
    "Education & Academy": <BookOpen className="w-6 h-6" />,
    "Grant & Funding": <DollarSign className="w-6 h-6" />,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative w-full h-96 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-background.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            LuvOnPurpose Sovereign System
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl">
            An integrated, multi-workstream architecture combining token activation, legal
            governance, education, and financial systems
          </p>
        </div>
      </section>

      {/* System Overview */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download size={18} />
            Download Architecture
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share2 size={18} />
            Share
          </Button>
        </div>

        {/* System Status */}
        <Card className="p-6 mb-8 bg-secondary/10 border-accent/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">System Name</p>
              <p className="text-lg font-semibold">{systemData.system_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Version</p>
              <p className="text-lg font-semibold">{systemData.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold text-accent">{systemData.status}</p>
            </div>
          </div>
        </Card>

        {/* Tabs for different views */}
        <Tabs defaultValue="pillars" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pillars">Core Pillars</TabsTrigger>
            <TabsTrigger value="modules">Execution Modules</TabsTrigger>
            <TabsTrigger value="layers">System Layers</TabsTrigger>
          </TabsList>

          {/* Core Pillars Tab */}
          <TabsContent value="pillars" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {systemData.core_pillars.map((pillar, idx) => (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-accent">
                      {pillarIcons[pillar.name] || <Zap className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{pillar.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Workstreams:</p>
                      <ul className="space-y-1">
                        {pillar.workstreams.map((ws, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            {ws}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Components:</p>
                      <ul className="space-y-1">
                        {pillar.components.map((comp, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            {comp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Execution Modules Tab */}
          <TabsContent value="modules" className="space-y-4 mt-6">
            <div className="space-y-4">
              {systemData.execution_modules.map((module) => (
                <Card key={module.id} className="p-6 border-l-4 border-l-accent">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{module.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{module.layer}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-accent/20 text-accent rounded-full">
                      {module.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{module.function}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Layers Tab */}
          <TabsContent value="layers" className="space-y-4 mt-6">
            <div className="space-y-4">
              {Object.entries(systemData.system_architecture).map(([key, layer]) => (
                <Card key={key} className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">{layer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{layer.purpose}</p>

                  {layer.key_tokens && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-foreground mb-2">Key Tokens:</p>
                      <div className="flex flex-wrap gap-2">
                        {layer.key_tokens.map((token: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs font-mono bg-secondary/30 text-foreground px-2 py-1 rounded"
                          >
                            {token}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {layer.key_features && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-foreground mb-2">Key Features:</p>
                      <ul className="space-y-1">
                        {layer.key_features.map((feature: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {layer.key_checks && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Key Checks:</p>
                      <ul className="space-y-1">
                        {layer.key_checks.map((check: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            {check}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {layer.key_components && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Components:</p>
                      <ul className="space-y-1">
                        {layer.key_components.map((comp: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            {comp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Activation Flow */}
      <section className="py-12 px-4 md:px-8 bg-secondary/10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">House Activation Flow</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(systemData.activation_flow).map(([step, description], idx) => (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white font-bold">
                    {idx + 1}
                  </div>
                  {idx < Object.keys(systemData.activation_flow).length - 1 && (
                    <div className="w-1 h-12 bg-accent/30 mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Flow Diagram */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Financial Automation Spine</h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <img
              src="/images/system-flow.png"
              alt="System Flow Diagram"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-secondary/10 border-t border-border text-center text-muted-foreground text-sm">
        <p>LuvOnPurpose Sovereign System | {systemData.version}</p>
        <p className="mt-2">
          Integrated architecture: 4 Core Pillars • 5 Execution Modules • 7 System Layers
        </p>
      </footer>
    </div>
  );
}
