import { useState } from "react";
import { Heart, ArrowLeft, Users, Leaf, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PurpleHeart() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const supportTiers = [
    {
      id: "seed",
      name: "Seed Supporter",
      amount: "$25",
      description: "Plant the first seed",
      benefits: [
        "Recognition as a Seed Supporter",
        "Access to community updates",
        "Digital badge",
      ],
      color: "from-purple-100 to-purple-50",
      borderColor: "border-purple-200",
      icon: Leaf,
    },
    {
      id: "builder",
      name: "Builder",
      amount: "$100",
      description: "Help build the foundation",
      benefits: [
        "All Seed benefits",
        "Exclusive monthly insights",
        "Direct access to founder updates",
        "Builder's Circle membership",
      ],
      color: "from-purple-200 to-purple-100",
      borderColor: "border-purple-300",
      icon: Zap,
    },
    {
      id: "guardian",
      name: "Guardian",
      amount: "$500",
      description: "Protect the collective",
      benefits: [
        "All Builder benefits",
        "Quarterly strategy calls",
        "Custom impact report",
        "Guardian's Circle membership",
        "Legacy recognition",
      ],
      color: "from-purple-300 to-purple-200",
      borderColor: "border-purple-400",
      icon: Shield,
    },
    {
      id: "founder",
      name: "Founding Partner",
      amount: "$2,500+",
      description: "Shape the future",
      benefits: [
        "All Guardian benefits",
        "Founding Partner status",
        "Annual in-person gathering",
        "Strategic advisory input",
        "Perpetual recognition",
        "Custom partnership terms",
      ],
      color: "from-purple-400 to-purple-300",
      borderColor: "border-purple-500",
      icon: Users,
    },
  ];

  const impactAreas = [
    {
      title: "Education & Academy",
      description:
        "Supporting free education for heirs and community scholarship programs",
      icon: "🎓",
    },
    {
      title: "Community Building",
      description: "Strengthening connections and creating generational wealth",
      icon: "🤝",
    },
    {
      title: "System Development",
      description: "Building tools and frameworks for financial autonomy",
      icon: "⚙️",
    },
    {
      title: "Outreach & Impact",
      description: "Extending The L.A.W.S. Collective mission to underserved communities",
      icon: "🌍",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-purple-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-8 h-8 text-purple-600 fill-purple-600" />
                  Purple Heart
                </h1>
                <p className="text-sm text-muted-foreground">
                  Support The L.A.W.S. Collective
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-purple-600/10 to-purple-400/10 border-purple-200">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">
                Support The L.A.W.S. Collective
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The Purple Heart represents your commitment to building generational wealth,
                community strength, and lasting impact. Every contribution helps us create systems
                that empower families and communities to thrive.
              </p>
              <p className="text-base text-foreground font-semibold">
                Your support directly funds education, community building, and system development
                that transforms lives.
              </p>
            </div>
          </Card>
        </section>

        {/* Impact Areas */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">Where Your Support Goes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactAreas.map((area, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{area.icon}</div>
                <h4 className="font-bold text-foreground mb-2">{area.title}</h4>
                <p className="text-sm text-muted-foreground">{area.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Support Tiers */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">Support Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportTiers.map((tier) => {
              const TierIcon = tier.icon;
              return (
                <Card
                  key={tier.id}
                  className={`p-6 border-2 ${tier.borderColor} bg-gradient-to-br ${tier.color} hover:shadow-lg transition-all cursor-pointer ${
                    selectedTier === tier.id ? "ring-2 ring-purple-600" : ""
                  }`}
                  onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TierIcon className="w-6 h-6 text-purple-600" />
                    <h4 className="font-bold text-foreground">{tier.name}</h4>
                  </div>

                  <div className="mb-4">
                    <p className="text-3xl font-bold text-purple-600">{tier.amount}</p>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-purple-600 mt-1">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open("/donate/public", "_blank");
                    }}
                  >
                    Support Now
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Custom Support */}
        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-purple-100/50 to-purple-50/50 border-purple-200">
            <h3 className="text-2xl font-bold text-foreground mb-4">Custom Support</h3>
            <p className="text-muted-foreground mb-6">
              Have a specific way you'd like to support The L.A.W.S. Collective? We welcome
              partnerships, in-kind donations, and creative collaborations.
            </p>
            <Button
              variant="outline"
              className="border-purple-300 hover:bg-purple-50"
              onClick={() => (window.location.href = "/contact-us")}
            >
              Discuss Custom Partnership
            </Button>
          </Card>
        </section>

        {/* FAQ Section */}
        <section>
          <h3 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-2">Is my donation tax-deductible?</h4>
              <p className="text-sm text-muted-foreground">
                Please consult with your tax advisor. We'll provide documentation for your records.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-2">Can I donate monthly?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! We offer flexible recurring donation options. Contact us to set up a monthly
                contribution.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-2">How is my donation used?</h4>
              <p className="text-sm text-muted-foreground">
                We provide detailed impact reports to all supporters showing exactly how funds are
                allocated.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-2">Can I remain anonymous?</h4>
              <p className="text-sm text-muted-foreground">
                Absolutely. We respect your privacy and can process anonymous donations upon request.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <Card className="p-12 bg-gradient-to-r from-purple-600 to-purple-700">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Join The Purple Heart?
            </h3>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Your support today shapes the future of generational wealth and community strength.
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-purple-50"
              onClick={() => window.open("/donate/public", "_blank")}
            >
              <Heart className="w-5 h-5 mr-2 fill-current" />
              Support The L.A.W.S. Collective Now
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
}
