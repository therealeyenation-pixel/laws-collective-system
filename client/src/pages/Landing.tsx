import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const [businessName, setBusinessName] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">The L.A.W.S. Collective</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/demo"}>
              Sign In
            </Button>
            <Button onClick={() => window.location.href = "/demo"}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Multi-Generational Wealth Building
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive system for building sustainable wealth through purpose and community.
            </p>
          </section>

          {/* L.A.W.S. Framework */}
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground text-center">The L.A.W.S. Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">🌱 LAND</h4>
                <p className="text-muted-foreground">Reconnection & Stability - Understanding roots and building a strong foundation.</p>
              </Card>
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">📚 AIR</h4>
                <p className="text-muted-foreground">Education & Knowledge - Learning and personal development for continuous growth.</p>
              </Card>
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">💧 WATER</h4>
                <p className="text-muted-foreground">Healing & Balance - Emotional resilience and healthy decision-making.</p>
              </Card>
              <Card className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">⭐ SELF</h4>
                <p className="text-muted-foreground">Purpose & Skills - Financial literacy and business readiness.</p>
              </Card>
            </div>
          </section>

          {/* Business Name Input */}
          <section className="bg-card rounded-lg p-8 space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Get Started</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
              />
              <Button 
                className="w-full"
                onClick={() => {
                  if (businessName.trim()) {
                    window.location.href = "/dashboard";
                  }
                }}
              >
                Enter the Collective
              </Button>
            </div>
          </section>

          {/* CTA Links */}
          <section className="flex flex-col gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.href = "/indigenous-rights"}>
              Learn About Indigenous Rights
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/purple-heart"}>
              Support Us
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/contact-us"}>
              Contact Us
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
