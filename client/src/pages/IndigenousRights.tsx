import { ArrowLeft, Globe, Shield, Users, Leaf, BookOpen, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IndigenousRights() {
  const unDripArticles = [
    {
      article: "Article 3",
      title: "Right to Self-Determination",
      description:
        "Indigenous peoples have the right to self-determination and freely determine their political status and pursue their economic, social and cultural development.",
    },
    {
      article: "Article 18",
      title: "Right to Participate in Decision-Making",
      description:
        "Indigenous peoples have the right to participate in decision-making in matters which would affect their rights through representatives chosen by themselves.",
    },
    {
      article: "Article 25",
      title: "Right to Maintain Spiritual Relationship",
      description:
        "Indigenous peoples have the right to maintain and strengthen their distinctive spiritual relationship with their traditionally owned or occupied lands.",
    },
    {
      article: "Article 26",
      title: "Right to Lands and Resources",
      description:
        "Indigenous peoples have the right to the lands, territories and resources which they have traditionally owned or occupied.",
    },
    {
      article: "Article 31",
      title: "Right to Maintain and Protect Knowledge",
      description:
        "Indigenous peoples have the right to maintain, control, protect and develop their intellectual property over their cultural heritage and traditional knowledge.",
    },
    {
      article: "Article 32",
      title: "Right to Free and Informed Consent",
      description:
        "States shall consult and cooperate in good faith with indigenous peoples to obtain their free and informed consent prior to projects affecting their lands or resources.",
    },
  ];

  const aDripPrinciples = [
    {
      title: "Land Rights",
      description:
        "Recognition and protection of indigenous peoples' collective rights to ancestral lands and natural resources.",
    },
    {
      title: "Cultural Preservation",
      description:
        "Protection of indigenous cultures, languages, spiritual practices, and traditional knowledge systems.",
    },
    {
      title: "Self-Governance",
      description:
        "Right to establish and maintain autonomous institutions and self-governance structures.",
    },
    {
      title: "Economic Justice",
      description:
        "Fair and equitable benefit-sharing from natural resources and economic development on indigenous territories.",
    },
    {
      title: "Educational Rights",
      description:
        "Access to education that respects and incorporates indigenous knowledge systems and languages.",
    },
    {
      title: "Environmental Protection",
      description:
        "Indigenous peoples' role as stewards and their right to participate in environmental decision-making.",
    },
  ];

  const globalVisionPillars = [
    {
      icon: Globe,
      title: "Global Interconnection",
      description:
        "The L.A.W.S. Collective recognizes indigenous peoples worldwide as interconnected through shared values of land stewardship, community care, and generational wealth building.",
    },
    {
      icon: Shield,
      title: "Rights Protection",
      description:
        "We align with UNDRIP and ADrip to protect and advance the rights of indigenous and marginalized communities globally.",
    },
    {
      icon: Leaf,
      title: "Sustainable Stewardship",
      description:
        "We honor indigenous knowledge systems that have sustained lands and communities for generations.",
    },
    {
      icon: Users,
      title: "Community Autonomy",
      description:
        "We support communities in exercising self-determination and building wealth on their own terms.",
    },
    {
      icon: BookOpen,
      title: "Knowledge Preservation",
      description:
        "We create systems that preserve, protect, and transmit indigenous knowledge to future generations.",
    },
    {
      icon: Heart,
      title: "Generational Wealth",
      description:
        "We build frameworks that enable indigenous families and communities to create lasting, multi-generational prosperity.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Indigenous Rights & Global Vision</h1>
              <p className="text-sm text-muted-foreground">
                The L.A.W.S. Collective's commitment to indigenous peoples worldwide
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <Card className="p-8 bg-gradient-to-r from-emerald-600/10 to-emerald-400/10 border-emerald-200">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">
                Standing with Indigenous Peoples
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl">
                The L.A.W.S. Collective is rooted in the recognition that indigenous peoples have
                stewarded lands, built thriving communities, and created systems of wealth and
                knowledge for millennia. We align our mission with international frameworks that
                protect indigenous rights and support communities in exercising self-determination.
              </p>
            </div>
          </Card>
        </section>

        {/* Global Vision Pillars */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">Our Global Vision</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {globalVisionPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <Icon className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-foreground mb-2">{pillar.title}</h4>
                      <p className="text-sm text-muted-foreground">{pillar.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* UNDRIP & ADrip Framework */}
        <section className="mb-16">
          <Tabs defaultValue="undrip" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="undrip">UN Declaration on Indigenous Rights (UNDRIP)</TabsTrigger>
              <TabsTrigger value="adrip">African Declaration on Indigenous Rights (ADrip)</TabsTrigger>
            </TabsList>

            {/* UNDRIP Tab */}
            <TabsContent value="undrip" className="space-y-6">
              <Card className="p-6 bg-blue-50/50 border-blue-200">
                <h4 className="font-bold text-foreground mb-2">About UNDRIP</h4>
                <p className="text-sm text-muted-foreground">
                  The United Nations Declaration on the Rights of Indigenous Peoples (UNDRIP),
                  adopted in 2007, is a landmark international instrument that affirms the rights
                  of indigenous peoples to self-determination, lands, resources, and cultural
                  preservation. The L.A.W.S. Collective operates in alignment with UNDRIP principles.
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unDripArticles.map((item, idx) => (
                  <Card key={idx} className="p-6">
                    <h5 className="font-bold text-foreground mb-1">{item.article}: {item.title}</h5>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ADrip Tab */}
            <TabsContent value="adrip" className="space-y-6">
              <Card className="p-6 bg-orange-50/50 border-orange-200">
                <h4 className="font-bold text-foreground mb-2">About ADrip</h4>
                <p className="text-sm text-muted-foreground">
                  The African Declaration on the Rights of Indigenous Peoples (ADrip), adopted by
                  the African Commission on Human and Peoples' Rights, specifically addresses the
                  rights and protections for indigenous peoples in Africa. It builds on UNDRIP while
                  addressing the unique contexts and challenges of African indigenous communities.
                </p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aDripPrinciples.map((principle, idx) => (
                  <Card key={idx} className="p-6">
                    <h5 className="font-bold text-foreground mb-2">{principle.title}</h5>
                    <p className="text-sm text-muted-foreground">{principle.description}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* How We Align */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8">How The L.A.W.S. Collective Aligns with These Frameworks</h3>
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-3">Land & Resource Stewardship</h4>
              <p className="text-muted-foreground">
                We recognize indigenous peoples' deep connection to land and resources. Our framework
                supports communities in maintaining control over their territories, making decisions
                about resource use, and building wealth from their own lands.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-3">Self-Determination & Autonomy</h4>
              <p className="text-muted-foreground">
                The L.A.W.S. Collective empowers communities to exercise self-determination through
                business development, financial literacy, and autonomous wealth-building systems that
                don't depend on external institutions or approval.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-3">Knowledge Preservation & Transmission</h4>
              <p className="text-muted-foreground">
                Through the LuvOnPurpose Academy and our educational systems, we create spaces to
                preserve, protect, and transmit indigenous knowledge, languages, and cultural
                practices to future generations.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-3">Generational Wealth & Community Prosperity</h4>
              <p className="text-muted-foreground">
                We build systems that enable indigenous families and communities to create lasting,
                multi-generational wealth while maintaining cultural values and community autonomy.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-3">Global Solidarity</h4>
              <p className="text-muted-foreground">
                The L.A.W.S. Collective recognizes indigenous peoples worldwide as interconnected.
                We share knowledge, support, and frameworks across borders to strengthen indigenous
                communities globally.
              </p>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-16">
          <Card className="p-12 bg-gradient-to-r from-emerald-600 to-emerald-700">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-white">
                Join The Global Movement
              </h3>
              <p className="text-emerald-100 max-w-2xl mx-auto">
                Whether you're an indigenous community, ally, educator, or entrepreneur, The L.A.W.S.
                Collective welcomes you to participate in building a global network of indigenous
                wealth, knowledge, and self-determination.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50"
                  onClick={() => (window.location.href = "/contact-us")}
                >
                  Get Involved
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-emerald-700"
                  onClick={() => (window.location.href = "/faq")}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Resources Section */}
        <section>
          <h3 className="text-2xl font-bold text-foreground mb-8">Key Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-2">United Nations Declaration on the Rights of Indigenous Peoples</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Official UN document affirming indigenous rights to self-determination, lands, and cultural preservation.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.un.org/development/desa/indigenouspeoples/declaration-on-the-rights-of-indigenous-peoples.html" target="_blank" rel="noopener noreferrer">
                  Visit UN DRIP Page
                </a>
              </Button>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-foreground mb-2">African Commission on Human and Peoples' Rights</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Official documentation of the African Declaration on the Rights of Indigenous Peoples (ADrip).
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.achpr.org/" target="_blank" rel="noopener noreferrer">
                  Visit ACHPR
                </a>
              </Button>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
