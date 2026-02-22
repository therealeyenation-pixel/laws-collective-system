import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            {/* Photo Placeholder */}
            <div className="flex justify-center md:justify-start">
              <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border-2 border-primary/30">
                <div className="text-center">
                  <div className="text-6xl mb-2">📸</div>
                  <p className="text-sm text-muted-foreground">Photo Placeholder</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your professional photo here</p>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="md:col-span-2">
              <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">About the Founder</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">La Shanna K. Russell</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Founder & Visionary of The L.A.W.S. Collective
              </p>
              <p className="text-base text-foreground/80 leading-relaxed mb-6">
                La Shanna K. Russell is the architect of a comprehensive multi-generational wealth-building ecosystem designed to transform how families and communities approach financial sovereignty. With a deep commitment to education, community empowerment, and purposeful enterprise, she has created an integrated system that goes far beyond traditional financial literacy.
              </p>
              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">The Vision</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">A Closed-Loop Wealth Ecosystem</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Creating a comprehensive approach to building multi-generational wealth through community, education, and purposeful enterprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">The L.A.W.S. Framework</h3>
              <p className="text-muted-foreground mb-6">
                Built on four interconnected pillars of human flourishing that form the philosophical foundation of all programs and community structures.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">🌍 Land</h4>
                  <p className="text-sm text-muted-foreground">Stability, roots, and ancestral connection through property ownership and generational assets</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">💨 Air</h4>
                  <p className="text-sm text-muted-foreground">Knowledge, communication, and wisdom through education and mentorship</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">💧 Water</h4>
                  <p className="text-sm text-muted-foreground">Healing, balance, and emotional intelligence for resilience and healthy decision-making</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">✨ Self</h4>
                  <p className="text-sm text-muted-foreground">Purpose, skills, and financial sovereignty through personal development</p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Key Achievements</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground/80">Architected multi-entity legal structure for wealth management and community building</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground/80">Designed comprehensive S.W.A.L. progression model for building financial sovereignty</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground/80">Created LuvLedger system for personal wealth management and asset tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground/80">Established Luv Learning Academy with K-12 Divine STEM curriculum</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-foreground/80">Built business simulators and grant-writing tools for practical financial education</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Core Values</h2>
            <p className="text-muted-foreground">Guiding principles that shape every aspect of The L.A.W.S. Collective</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Sovereignty",
                description: "Financial independence and self-determination for every individual and family"
              },
              {
                title: "Community",
                description: "Collective prosperity alongside individual success and shared growth"
              },
              {
                title: "Education",
                description: "Practical, hands-on learning through simulators and real-world application"
              },
              {
                title: "Legacy",
                description: "Building wealth designed to last for generations and create lasting impact"
              }
            ].map((value, idx) => (
              <Card key={idx} className="p-6 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Organizations Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Organizations</h2>
            <p className="text-muted-foreground">A multi-entity structure serving different purposes while maintaining unified vision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">LuvOnPurpose Autonomous Wealth System, LLC</h3>
              <p className="text-sm text-primary/70 mb-4">Parent Holding Company</p>
              <p className="text-foreground/80">
                Owns and protects the platform intellectual property, technology infrastructure, and core assets. Manages the LuvLedger system and platform application.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">The L.A.W.S. Collective, LLC</h3>
              <p className="text-sm text-primary/70 mb-4">Operating Entity</p>
              <p className="text-foreground/80">
                Public-facing operating company for employment, services, consulting, and community engagement. Manages L.A.W.S. Quest, L.A.W.S. Academy, and Wealth System divisions.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">LuvOnPurpose Outreach Temple and Academy Society</h3>
              <p className="text-sm text-primary/70 mb-4">508(c)(1)(a) Nonprofit</p>
              <p className="text-foreground/80">
                Educational and religious nonprofit handling community outreach, education programs, and spiritual development initiatives.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-2">Real-Eye-Nation</h3>
              <p className="text-sm text-primary/70 mb-4">Media Division</p>
              <p className="text-foreground/80">
                Media and communications division supporting content creation, storytelling, and community visibility.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* QR Code & Business Card Section */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Connect & Share</h2>
            <p className="text-muted-foreground">Quick ways to connect and share The L.A.W.S. Collective vision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <Card className="p-8 bg-background">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/gmyQMAqpOLXMPLbi.png" alt="QR Code" className="w-64 h-64 object-contain" />
              </Card>
              <p className="text-sm text-muted-foreground mt-4">Scan to visit The L.A.W.S. Collective</p>
            </div>

            {/* Business Card */}
            <div className="flex flex-col items-center">
              <Card className="p-8 bg-background">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/kjCZvCZBAMiNvndz.png" alt="Business Card" className="w-80 h-48 object-contain" />
              </Card>
              <p className="text-sm text-muted-foreground mt-4">Professional business card design</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Get in Touch</h2>
            <p className="text-muted-foreground">Connect with La Shanna K. Russell and The L.A.W.S. Collective</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-foreground/80">870-413-9074</p>
            </Card>

            <Card className="p-8 text-center">
              <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-foreground/80">luvonpurpose@protonmail.com</p>
            </Card>

            <Card className="p-8 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Location</h3>
              <p className="text-foreground/80">Augusta, GA</p>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg">
              Contact La Shanna
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
