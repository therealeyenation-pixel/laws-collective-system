import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BrandGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Brand Guidelines</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Brand Name Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Official Brand Name</h2>
            <p className="text-muted-foreground">
              Our organization is officially known as:
            </p>
          </div>

          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Correct Usage:</p>
                <p className="text-2xl font-bold text-foreground">The L.A.W.S. Collective</p>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Full Legal Name (when required):</p>
                <p className="text-lg font-semibold text-foreground">The L.A.W.S. Collective, LLC</p>
              </div>
            </div>
          </Card>
        </section>

        {/* What L.A.W.S. Stands For */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">What L.A.W.S. Stands For</h2>
            <p className="text-muted-foreground">
              The acronym L.A.W.S. represents our core framework:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border-l-4 border-l-green-500">
              <h3 className="font-bold text-lg text-foreground mb-2">LAND</h3>
              <p className="text-muted-foreground">Reconnection & Stability</p>
              <p className="text-sm text-muted-foreground mt-2">
                Understanding roots, migrations, and family history
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-500">
              <h3 className="font-bold text-lg text-foreground mb-2">AIR</h3>
              <p className="text-muted-foreground">Education & Knowledge</p>
              <p className="text-sm text-muted-foreground mt-2">
                Learning, personal development, and communication
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-cyan-500">
              <h3 className="font-bold text-lg text-foreground mb-2">WATER</h3>
              <p className="text-muted-foreground">Healing & Balance</p>
              <p className="text-sm text-muted-foreground mt-2">
                Emotional resilience, healing cycles, and healthy decision-making
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-purple-500">
              <h3 className="font-bold text-lg text-foreground mb-2">SELF</h3>
              <p className="text-muted-foreground">Purpose & Skills</p>
              <p className="text-sm text-muted-foreground mt-2">
                Financial literacy, business readiness, and purposeful growth
              </p>
            </Card>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Common Branding Mistakes to Avoid</h2>
            <p className="text-muted-foreground">
              Please do not use these incorrect variations:
            </p>
          </div>

          <div className="space-y-3">
            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <p className="text-sm">
                <span className="font-semibold text-red-700 dark:text-red-400">❌ Incorrect:</span> Missing final period (e.g., "The L.A.W.S. Collective" without final period)
              </p>
            </Card>

            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <p className="text-sm">
                <span className="font-semibold text-red-700 dark:text-red-400">❌ Incorrect:</span> "The L.A.W.S. Collective" (missing final period)
              </p>
            </Card>

            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <p className="text-sm">
                <span className="font-semibold text-red-700 dark:text-red-400">❌ Incorrect:</span> Duplicate "The" prefix (e.g., repeating "The" multiple times)
              </p>
            </Card>

            <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <p className="text-sm">
                <span className="font-semibold text-red-700 dark:text-red-400">❌ Incorrect:</span> Incomplete branding (e.g., "L.A.W.S" or "Collective" alone)
              </p>
            </Card>

            <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <p className="text-sm">
                <span className="font-semibold text-green-700 dark:text-green-400">✓ Correct:</span> "The L.A.W.S. Collective"
              </p>
            </Card>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Usage Guidelines</h2>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-2">First Mention</h3>
              <p className="text-muted-foreground">
                Always use the full name "The L.A.W.S. Collective" on first mention in any document or webpage.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-2">Subsequent Mentions</h3>
              <p className="text-muted-foreground">
                After the first mention, you may refer to it as "The Collective" or "L.A.W.S." for brevity, but always maintain consistency within the document.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-2">Legal Documents</h3>
              <p className="text-muted-foreground">
                In legal, financial, or official documents, use the full legal name: "The L.A.W.S. Collective, LLC"
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-2">Social Media & Marketing</h3>
              <p className="text-muted-foreground">
                Use "The L.A.W.S. Collective" consistently across all social media platforms, marketing materials, and public communications.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-2">Hashtags</h3>
              <p className="text-muted-foreground">
                Use hashtags like #TheLAWSCollective, #LAWSCollective, or #LAWSFramework to maintain brand consistency on social platforms.
              </p>
            </Card>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The L.A.W.S. Collective empowers families and communities to build sustainable, multi-generational wealth while honoring their values and heritage. Through our framework rooted in Land, Air, Water, and Self, we provide education, resources, and community support to help families transition from traditional employment to ownership and entrepreneurship.
            </p>
          </div>
        </section>

        {/* Related Entities */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Related Entities</h2>
            <p className="text-muted-foreground mb-4">
              The L.A.W.S. Collective operates alongside complementary organizations:
            </p>
          </div>

          <div className="space-y-3">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground">LuvOnPurpose Academy and Outreach</h3>
              <p className="text-sm text-muted-foreground">
                Our educational arm providing K-12 homeschooling, business simulators, and community outreach programs.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground">Real-Eye-Nation</h3>
              <p className="text-sm text-muted-foreground">
                Our performing arts and creative services division, supporting cultural expression and community engagement.
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground">LuvOnPurpose Autonomous Wealth System (AWS)</h3>
              <p className="text-sm text-muted-foreground">
                The core platform technology supporting all our business entities and family wealth management.
              </p>
            </Card>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-6 pb-12">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Questions About Our Brand?</h2>
            <p className="text-muted-foreground mb-6">
              If you have questions about how to properly use The L.A.W.S. Collective name and branding, please reach out to us.
            </p>
            <Button onClick={() => window.location.href = "/contact-us"}>
              Contact Us
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
