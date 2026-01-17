import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  Zap,
  Palette,
  ArrowRight,
  CheckCircle,
  Leaf,
  Wind,
  Droplets,
  Heart,
  ChevronRight,
  Quote,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const entities = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Education & Outreach",
      entity: "Temple & Academy",
      description: "Learn the foundations of wealth building through our comprehensive educational programs and community workshops.",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community & Support",
      entity: "The L.A.W.S. Collective",
      description: "Connect with like-minded individuals committed to building generational wealth and supporting each other's growth.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-600",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Business & Automation",
      entity: "LuvOnPurpose Autonomous Wealth System",
      description: "Build and scale your ventures with our automated systems, business tools, and wealth-building infrastructure.",
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-600",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Media & Creative",
      entity: "Real-Eye-Nation",
      description: "Tell your story, build your brand, and monetize your creativity through our media production services.",
      color: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-600",
    },
  ];

  const lawsFramework = [
    { letter: "L", word: "Land", meaning: "Reconnection & Stability", icon: <Leaf className="w-5 h-5" />, description: "Understanding your roots, migrations, and family history" },
    { letter: "A", word: "Air", meaning: "Education & Knowledge", icon: <Wind className="w-5 h-5" />, description: "Learning, personal development, and communication" },
    { letter: "W", word: "Water", meaning: "Healing & Balance", icon: <Droplets className="w-5 h-5" />, description: "Emotional resilience and healthy decision-making" },
    { letter: "S", word: "Self", meaning: "Purpose & Skills", icon: <Heart className="w-5 h-5" />, description: "Financial literacy, business readiness, and purposeful growth" },
  ];

  const steps = [
    { number: "01", title: "Complete Your Profile", description: "Tell us about yourself, your background, and your goals" },
    { number: "02", title: "Assess Your Needs", description: "We'll help identify the right programs and resources for you" },
    { number: "03", title: "Get Matched", description: "Connect with the entities and programs that fit your journey" },
    { number: "04", title: "Build Together", description: "Grow with community support and expert guidance" },
  ];

  const whoWeServe = [
    "Families seeking financial literacy and wealth building strategies",
    "Entrepreneurs needing business structure, support, and automation",
    "Community members looking for education and personal development",
    "Creatives wanting to monetize their talents and build their brand",
    "Individuals ready to break generational cycles and build legacy",
  ];

  const testimonials = [
    {
      quote: "This program changed how I think about building wealth for my family. It's not just about money—it's about legacy.",
      name: "Community Member",
      role: "Business Owner",
      initials: "CM",
    },
    {
      quote: "The L.A.W.S. framework helped me reconnect with my purpose and build a business that aligns with my values.",
      name: "Program Graduate",
      role: "Entrepreneur",
      initials: "PG",
    },
    {
      quote: "Finally, a system that understands multi-generational wealth building from a community-centered perspective.",
      name: "Academy Student",
      role: "Financial Literacy Graduate",
      initials: "AS",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Building Multi-Generational Wealth Through{" "}
              <span className="text-primary">Purpose & Community</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              A family enterprise helping individuals and families create lasting prosperity 
              through education, business development, and community support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/getting-started">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/careers">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who We Serve
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our programs are designed for individuals and families ready to transform their financial future
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {whoWeServe.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach - 4 Entities */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Approach
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four specialized entities working together to support your journey to prosperity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entities.map((entity, idx) => (
              <Card key={idx} className={`p-6 bg-gradient-to-br ${entity.color} border-0 hover:shadow-lg transition-shadow`}>
                <div className={`${entity.iconColor} mb-4`}>
                  {entity.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {entity.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {entity.entity}
                </p>
                <p className="text-foreground/80">
                  {entity.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* L.A.W.S. Framework */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The L.A.W.S. Framework
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our holistic approach to personal and financial development
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lawsFramework.map((item, idx) => (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-emerald-600">{item.letter}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {item.word}
                </h3>
                <p className="text-sm text-primary mb-2">
                  {item.meaning}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your journey to multi-generational wealth starts with four simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-2">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
                {idx < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-8 -right-3 w-6 h-6 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from members who are building their legacy with us
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 relative">
                <Quote className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            *Testimonials represent the experiences of our community members. Individual results may vary.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of families and individuals building lasting prosperity together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/getting-started">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/system-overview">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More About Our System
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">LuvOnPurpose</h3>
              <p className="text-sm text-muted-foreground">
                Building multi-generational wealth through purpose, education, and community.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/getting-started" className="text-muted-foreground hover:text-foreground">Get Started</Link></li>
                <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/system-overview" className="text-muted-foreground hover:text-foreground">System Overview</Link></li>
                {isAuthenticated && (
                  <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ready to begin your journey to financial freedom?
              </p>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="sm">Go to Dashboard</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">Sign In</Button>
                </a>
              )}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} LuvOnPurpose Family Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
