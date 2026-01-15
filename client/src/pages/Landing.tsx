import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import {
  Shield,
  BookOpen,
  Coins,
  Users,
  Leaf,
  Wind,
  Droplets,
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Send,
  Loader2,
  Menu,
  X,
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    submitContact.mutate(contactForm);
  };

  const pillars = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sovereign Trust System",
      description: "Build and manage multi-generational wealth through legally structured trusts and business entities.",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Luv Academy",
      description: "Comprehensive education platform with courses, certifications, and skill-building programs.",
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Autonomous Wealth",
      description: "AI-powered systems that work 24/7 to grow and protect your family's financial future.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Collective",
      description: "Join a network of families committed to restoration, education, and generational prosperity.",
    },
  ];

  const lawsFramework = [
    {
      icon: <Leaf className="w-6 h-6" />,
      letter: "L",
      title: "LAND",
      subtitle: "Reconnection & Stability",
      description: "Understanding roots, migrations, and family history",
      color: "bg-green-100 text-green-700 border-green-300",
    },
    {
      icon: <Wind className="w-6 h-6" />,
      letter: "A",
      title: "AIR",
      subtitle: "Education & Knowledge",
      description: "Learning, personal development, and communication",
      color: "bg-sky-100 text-sky-700 border-sky-300",
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      letter: "W",
      title: "WATER",
      subtitle: "Healing & Balance",
      description: "Emotional resilience, healing cycles, and healthy decision-making",
      color: "bg-blue-100 text-blue-700 border-blue-300",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      letter: "S",
      title: "SELF",
      subtitle: "Purpose & Skills",
      description: "Financial literacy, business readiness, and purposeful growth",
      color: "bg-rose-100 text-rose-700 border-rose-300",
    },
  ];

  const testimonials = [
    {
      name: "Community Leader",
      role: "Founding Member",
      quote: "L.A.W.S. Collective helped us structure our family's future and create a legacy that will last for generations.",
      rating: 5,
    },
    {
      name: "Community Member",
      role: "Academy Graduate",
      quote: "The education I received through the Academy transformed my understanding of wealth building.",
      rating: 5,
    },
    {
      name: "Business Owner",
      role: "Collective Member",
      quote: "The autonomous systems run my business operations while I focus on what matters most - my family.",
      rating: 5,
    },
  ];

  const services = [
    "Trust & Entity Formation",
    "Business Plan Development",
    "Grant Application Support",
    "Financial Literacy Training",
    "Community Restoration Programs",
    "AI-Powered Business Automation",
    "Document Vault & Security",
    "Multi-Generational Planning",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-stone-900">
                L.A.W.S.<span className="text-green-600"> Collective</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-stone-600 hover:text-stone-900 transition">About</a>
              <a href="#services" className="text-stone-600 hover:text-stone-900 transition">Services</a>
              <a href="#laws" className="text-stone-600 hover:text-stone-900 transition">L.A.W.S.</a>
              <a href="#contact" className="text-stone-600 hover:text-stone-900 transition">Contact</a>
              <a href={getLoginUrl()}>
                <Button className="bg-green-600 hover:bg-green-700">
                  Get Started
                </Button>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-stone-200">
              <div className="flex flex-col gap-4">
                <a href="#about" className="text-stone-600 hover:text-stone-900">About</a>
                <a href="#services" className="text-stone-600 hover:text-stone-900">Services</a>
                <a href="#laws" className="text-stone-600 hover:text-stone-900">L.A.W.S.</a>
                <a href="#contact" className="text-stone-600 hover:text-stone-900">Contact</a>
                <a href={getLoginUrl()}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Get Started
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-stone-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
              Build <span className="text-green-600">Multi-Generational</span> Wealth
              <br />Through Purpose & Community
            </h1>
            <p className="mt-6 text-lg md:text-xl text-stone-600 max-w-2xl mx-auto">
              A sovereign system designed to help families reconnect with their roots, 
              build lasting wealth, and create a legacy that spans generations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2 w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <a href="#about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About / Pillars Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              The Four Pillars of Sovereign Wealth
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              Our comprehensive system addresses every aspect of building and preserving 
              generational wealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
                <div className="text-green-600 mb-4">{pillar.icon}</div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">{pillar.title}</h3>
                <p className="text-stone-600">{pillar.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Comprehensive Services for Your Family's Future
              </h2>
              <p className="text-lg text-stone-600 mb-8">
                From trust formation to business automation, we provide everything you need 
                to build and protect your family's wealth for generations to come.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-stone-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-green-600 to-green-700 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="mb-6 text-green-100">
                  Join hundreds of families who are building their sovereign future with L.A.W.S. Collective.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Free consultation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Personalized roadmap
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Ongoing support
                  </li>
                </ul>
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="secondary" className="w-full">
                    Create Your Account
                  </Button>
                </a>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* L.A.W.S. Framework Section */}
      <section id="laws" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              The L.A.W.S. Collective Framework
            </h2>
            <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">
              A holistic approach to personal and community development, 
              helping you reconnect with what matters most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lawsFramework.map((item, index) => (
              <Card key={index} className={`p-6 border-2 ${item.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  {item.icon}
                  <span className="text-3xl font-bold">{item.letter}</span>
                </div>
                <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-sm font-medium mb-3">{item.subtitle}</p>
                <p className="text-sm opacity-80">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              What Our Community Says
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-stone-600 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-stone-900">{testimonial.name}</p>
                  <p className="text-sm text-stone-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Get in Touch
              </h2>
              <p className="text-lg text-stone-600 mb-8">
                Have questions about building your family's sovereign future? 
                We're here to help. Send us a message and we'll get back to you shortly.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">Email Us</p>
                    <p className="text-stone-600">1luvonpurpose@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-stone-700">Name *</label>
                    <Input
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Email *</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-stone-700">Phone</label>
                    <Input
                      placeholder="(555) 123-4567"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Subject</label>
                    <Input
                      placeholder="How can we help?"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Message *</label>
                  <Textarea
                    placeholder="Tell us about your goals..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 gap-2"
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <span className="text-xl font-bold">
                L.A.W.S.<span className="text-green-400"> Collective</span>
              </span>
              <p className="mt-4 text-stone-400 max-w-md">
                Building multi-generational wealth through purpose, community, and sovereign systems.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                <li><a href="#services" className="hover:text-white transition">Services</a></li>
                <li><a href="#laws" className="hover:text-white transition">L.A.W.S. Framework</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-stone-400">
                <li><a href={getLoginUrl()} className="hover:text-white transition">Login</a></li>
                <li><a href={getLoginUrl()} className="hover:text-white transition">Create Account</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 text-center text-stone-400">
            <p>&copy; {new Date().getFullYear()} L.A.W.S. Collective. All rights reserved.</p>
            <p className="mt-2 text-sm">Multi-Generational Wealth Architecture | Building Legacy Through Purpose & Community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
