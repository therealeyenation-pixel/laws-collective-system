import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Share2, Search } from "lucide-react";
import { toast } from "sonner";

interface Scroll {
  number: number;
  name: string;
  category: string;
  purpose: string;
  file: string;
}

export default function Home() {
  const [scrolls, setScrolls] = useState<Scroll[]>([]);
  const [filteredScrolls, setFilteredScrolls] = useState<Scroll[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch scrolls data
  useEffect(() => {
    fetch("/scrolls_data.json")
      .then((res) => res.json())
      .then((data) => {
        setScrolls(data);
        setFilteredScrolls(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading scrolls:", err);
        toast.error("Failed to load scrolls data");
        setLoading(false);
      });
  }, []);

  // Filter scrolls based on search and category
  useEffect(() => {
    let filtered = scrolls;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.number.toString().includes(searchTerm)
      );
    }

    setFilteredScrolls(filtered);
  }, [searchTerm, selectedCategory, scrolls]);

  // Get unique categories
  const uniqueCategories = Array.from(new Set(scrolls.map((s) => s.category)));
  const categories = ["all", ...uniqueCategories];

  // Handle download
  const handleDownload = () => {
    const dataStr = JSON.stringify(filteredScrolls, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `luvonpurpose-scrolls-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Scrolls data downloaded successfully");
  };

  // Handle share
  const handleShare = async () => {
    const text = `LuvOnPurpose Scrolls Explorer\n\nTotal Scrolls: ${filteredScrolls.length}\nCategories: ${categories.filter((c) => c !== "all").join(", ")}\n\nExplore the complete LuvOnPurpose system architecture.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "LuvOnPurpose Scrolls Explorer",
          text: text,
        });
        toast.success("Shared successfully");
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
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
            LuvOnPurpose Scrolls Explorer
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-2xl">
            Discover the complete architecture of the LuvOnPurpose Sovereign System
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search scrolls by name, number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download size={18} />
              Download Data
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
        </div>

        {/* Results Summary */}
        <div className="mb-8 p-4 bg-secondary/20 rounded-lg border border-secondary/30">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredScrolls.length}</span> of{" "}
            <span className="font-semibold text-foreground">{scrolls.length}</span> scrolls
          </p>
        </div>

        {/* Scrolls Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading scrolls...</p>
          </div>
        ) : filteredScrolls.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No scrolls found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScrolls.map((scroll) => (
              <Card
                key={scroll.number}
                className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-accent"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Scroll {scroll.number}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {scroll.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 text-accent font-bold">
                    {scroll.number}
                  </div>
                </div>

                <h4 className="font-semibold text-foreground mb-3">
                  {scroll.name}
                </h4>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {scroll.purpose}
                </p>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    File: <span className="font-mono">{scroll.file}</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* System Overview Section */}
      <section className="py-12 px-4 md:px-8 bg-secondary/10 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">System Architecture</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* House & Activation */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-accent">
                House & Activation (Scrolls 41–53)
              </h3>
              <p className="text-muted-foreground mb-4">
                Governs the activation, registration, and management of Houses within the LuvOnPurpose
                Sovereign System. Includes protocols for vault initialization, stewardship oaths, and
                system integrity.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Starter, Mirrored, and Adapted House activation</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Bundle registration and vault initialization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>House expansion and upgrade protocols</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Emergency custodian override safeguards</span>
                </li>
              </ul>
            </Card>

            {/* Financial & Ledger */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-accent">
                Financial & Ledger (Scrolls 54–61)
              </h3>
              <p className="text-muted-foreground mb-4">
                Establishes the complete financial automation engine within LuvLedger. Governs fund
                allocation, reporting, commercial entity synchronization, and system economic health.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>LuvLedger integration and allocation engines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Tax and reporting synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Commercial entity expansion logic</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>System stability and economic health monitoring</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Flow Diagram Section */}
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
          <p className="text-center text-muted-foreground mt-4 text-sm">
            The eight scrolls form the financial automation spine: Integration → Allocation → Reporting
            → Entity Sync → Expansion → Ratio Enforcement → Stability → Core Engine
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 bg-secondary/10 border-t border-border text-center text-muted-foreground text-sm">
        <p>
          LuvOnPurpose Master Developer Archive v1.0 | Last Updated: November 17, 2024
        </p>
        <p className="mt-2">
          Contains 21 comprehensive scrolls covering House activation and financial automation
        </p>
      </footer>
    </div>
  );
}
