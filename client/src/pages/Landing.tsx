import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  ChevronLeft,
  ChevronRight,
  Send,
  Menu,
  X,
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [simulatorComplete, setSimulatorComplete] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupSubmitted, setSignupSubmitted] = useState(false);

  // Carousel slides
  const carouselSlides = [
    {
      title: "The L.A.W.S. Collective",
      subtitle: "Multi-Generational Wealth Building",
      description: "Land • Air • Water • Self",
      color: "bg-gradient-to-br from-green-600 to-green-800",
    },
    {
      title: "LAND - Reconnection & Stability",
      subtitle: "Understanding roots and family history",
      description: "Establish stable foundations for wealth building",
      color: "bg-gradient-to-br from-green-500 to-green-700",
    },
    {
      title: "AIR - Education & Knowledge",
      subtitle: "Learning and personal development",
      description: "Access quality education and training programs",
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      title: "WATER - Healing & Balance",
      subtitle: "Emotional resilience and healthy decisions",
      description: "Build emotional intelligence and financial wellness",
      color: "bg-gradient-to-br from-cyan-500 to-cyan-700",
    },
    {
      title: "SELF - Purpose & Skills",
      subtitle: "Financial literacy and business readiness",
      description: "Develop practical skills for wealth creation",
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
    },
  ];

  const simulatorSteps = [
    {
      title: "Welcome to Business Simulator",
      description: "Let's create your business in 3 steps",
      action: "Start",
    },
    {
      title: "What's your company name?",
      description: "Enter the name for your business",
      action: "Next",
      input: true,
    },
    {
      title: "Business Created!",
      description: `Congratulations! ${companyName} has been established.`,
      action: "View Details",
    },
  ];

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleSimulatorStep = () => {
    if (simulatorStep === 1 && !companyName.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    if (simulatorStep === 2) {
      setSimulatorComplete(true);
      return;
    }

    setSimulatorStep((prev) => prev + 1);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    toast.success("Thank you for signing up! Check your email for updates.");
    setSignupEmail("");
    setSignupSubmitted(true);
    setTimeout(() => setSignupSubmitted(false), 3000);
  };

  const currentSlide = carouselSlides[carouselIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Watermark */}
      <div className="fixed top-4 right-4 z-50 opacity-30 pointer-events-none">
        <div className="text-xs font-bold text-red-500 rotate-45 whitespace-nowrap">
          UNDER CONSTRUCTION - DEMO MODE
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-700">L.A.W.S. Collective</div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-4">
            <a href={getLoginUrl()} className="text-sm font-medium text-gray-700 hover:text-green-700">
              Sign In
            </a>
            <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 p-4 space-y-2">
            <a href={getLoginUrl()} className="block text-sm font-medium text-gray-700 hover:text-green-700">
              Sign In
            </a>
            <Button className="w-full bg-green-600 hover:bg-green-700">Get Started</Button>
          </div>
        )}
      </nav>

      {/* QR Code Section */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Scan to Explore</h2>
          <div className="inline-block bg-white p-4 rounded-lg shadow-md">
            <svg width="200" height="200" viewBox="0 0 200 200" className="w-48 h-48">
              {/* Simple QR code placeholder - in production, generate real QR code */}
              <rect width="200" height="200" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" />
              <rect x="160" y="10" width="30" height="30" fill="black" />
              <rect x="10" y="160" width="30" height="30" fill="black" />
              {/* Pattern */}
              {Array.from({ length: 15 }).map((_, i) =>
                Array.from({ length: 15 }).map((_, j) => {
                  const isPattern = (i + j) % 2 === 0;
                  return isPattern ? (
                    <rect
                      key={`${i}-${j}`}
                      x={50 + i * 10}
                      y={50 + j * 10}
                      width="8"
                      height="8"
                      fill="black"
                    />
                  ) : null;
                })
              )}
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Scan with your phone to visit this page</p>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`${currentSlide.color} rounded-2xl p-12 md:p-16 text-white relative overflow-hidden`}>
            {/* Carousel Content */}
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{currentSlide.title}</h2>
              <p className="text-xl md:text-2xl mb-2 opacity-90">{currentSlide.subtitle}</p>
              <p className="text-lg opacity-80">{currentSlide.description}</p>
            </div>

            {/* Carousel Controls */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleCarouselPrev}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={handleCarouselNext}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-2 mt-6">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`h-2 rounded-full transition ${
                    index === carouselIndex ? "bg-white w-8" : "bg-white/50 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Business Simulator Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Try Our Business Simulator</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience how easy it is to start and manage your business with our platform
            </p>
          </div>

          {!showSimulator ? (
            <div className="text-center">
              <Button
                onClick={() => setShowSimulator(true)}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Launch Demo
              </Button>
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>{simulatorSteps[simulatorStep].title}</CardTitle>
                <CardDescription>{simulatorSteps[simulatorStep].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {simulatorStep === 1 && (
                  <div>
                    <Input
                      placeholder="Enter your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                )}

                {simulatorComplete && (
                  <div className="space-y-6 bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-900 mb-2">{companyName}</h3>
                      <p className="text-green-700 mb-6">Successfully Established</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg">
                      <h4 className="font-bold mb-4">What You Get:</h4>
                      <ul className="space-y-3">
                        <li className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Automated business formation and legal entity setup</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Financial management and compliance tracking</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Grant discovery and proposal writing assistance</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Business planning and financial projections</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Educational resources and training programs</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setShowSimulator(false);
                      setSimulatorStep(0);
                      setCompanyName("");
                      setSimulatorComplete(false);
                    }}
                    variant="outline"
                  >
                    Close
                  </Button>
                  {!simulatorComplete && (
                    <Button
                      onClick={handleSimulatorStep}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {simulatorSteps[simulatorStep].action}
                    </Button>
                  )}
                  {simulatorComplete && (
                    <Button className="bg-green-600 hover:bg-green-700 flex-1">
                      Join Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* L.A.W.S. Framework Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">The L.A.W.S. Framework</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Leaf, letter: "L", title: "LAND", color: "bg-green-100 border-green-300" },
              { icon: Wind, letter: "A", title: "AIR", color: "bg-blue-100 border-blue-300" },
              { icon: Droplets, letter: "W", title: "WATER", color: "bg-cyan-100 border-cyan-300" },
              { icon: Heart, letter: "S", title: "SELF", color: "bg-purple-100 border-purple-300" },
            ].map((item) => (
              <Card key={item.letter} className={`${item.color} border-2`}>
                <CardHeader>
                  <item.icon className="w-8 h-8 mb-2" />
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    {item.letter === "L" && "Reconnection & Stability"}
                    {item.letter === "A" && "Education & Knowledge"}
                    {item.letter === "W" && "Healing & Balance"}
                    {item.letter === "S" && "Purpose & Skills"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sign Up Section */}
      <section className="py-16 bg-green-50 border-t border-green-200">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Join Our Community</h2>
          <p className="text-center text-gray-600 mb-8">
            Be the first to know about our platform launch and exclusive opportunities
          </p>

          <form onSubmit={handleSignup} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700 gap-2">
              <Send className="w-4 h-4" />
              Sign Up
            </Button>
          </form>

          {signupSubmitted && (
            <p className="text-center text-green-600 mt-4 font-medium">
              ✓ Thank you for signing up!
            </p>
          )}
        </div>
      </section>

      {/* System Shell Link */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Explore the Full System?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            View our complete platform with all features and modules
          </p>
          <Link href="/system-shell">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 gap-2">
              View Complete System <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">Coming Soon - Demo Mode</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">The L.A.W.S. Collective</h3>
              <p className="text-gray-400 text-sm">
                Building multi-generational wealth through purpose and community
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 The L.A.W.S. Collective. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
