import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground">
              The L.A.W.S. Collective
            </h1>
            <p className="text-2xl md:text-3xl text-foreground font-semibold">
              <span className="text-green-600">L</span>and{" "}
              <span className="text-blue-600">A</span>ir{" "}
              <span className="text-cyan-600">W</span>ater{" "}
              <span className="text-purple-600">S</span>elf
            </p>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A sovereign wealth management and trust administration platform designed to connect families within a closed-loop economic system for multi-generational wealth building.
            </p>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-16 md:py-20 flex justify-center items-center bg-white">
        <div className="text-center">
          <img 
            src="/qr-code.png" 
            alt="QR Code to L.A.W.S. Collective" 
            className="w-56 h-56 md:w-72 md:h-72 mx-auto"
          />
          <p className="text-sm text-muted-foreground mt-4">Scan to learn more</p>
        </div>
      </section>

      {/* L.A.W.S. Mission Section */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Our Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-l-4 border-l-green-600">
              <h3 className="text-2xl font-bold text-foreground mb-4">🌍 LAND</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Reconnection & Stability. Understanding roots, migrations, and family history to establish stable foundations for wealth building.
              </p>
            </Card>
            <Card className="p-8 border-l-4 border-l-blue-600">
              <h3 className="text-2xl font-bold text-foreground mb-4">💨 AIR</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Education & Knowledge. Providing access to quality education that empowers families to make informed decisions.
              </p>
            </Card>
            <Card className="p-8 border-l-4 border-l-cyan-600">
              <h3 className="text-2xl font-bold text-foreground mb-4">💧 WATER</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Healing & Balance. Creating balance in financial relationships and ensuring sustainable, healthy economic systems.
              </p>
            </Card>
            <Card className="p-8 border-l-4 border-l-purple-600">
              <h3 className="text-2xl font-bold text-foreground mb-4">🔥 SELF</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Purpose & Skills. Developing practical skills and empowering individuals to build businesses and establish economic agency.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Education</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive educational programs and interactive simulators for financial literacy, business formation, and wealth management.
              </p>
            </Card>
            <Card className="p-8">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Community</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with families and entrepreneurs building multi-generational wealth together through local chapters and online forums.
              </p>
            </Card>
            <Card className="p-8">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Trust & Legal</h3>
              <p className="text-muted-foreground leading-relaxed">
                Professional tools for creating, managing, and transferring wealth through trusts and legal structures.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Luv Section */}
      <section className="py-20 md:py-28">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Meet the Founder</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/dLPgSOCzSajCscyU.png" 
                alt="La Shanna K. Russell" 
                className="w-72 h-72 md:w-80 md:h-80 rounded-lg shadow-lg object-cover"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-2">La Shanna K. Russell</h3>
                <p className="text-xl text-primary font-semibold mb-6">Founder & Visionary</p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  With 15+ years of experience in government and commercial contracting, La Shanna brings both academic rigor and practical expertise to The L.A.W.S. Collective.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Her vision is to reconnect families with their power to build generational wealth and create systems that work for communities, not against them.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4 text-lg">Education</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Bachelor's Degree in Business Administration (American Public University, 2025, Cum Laude)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">✓</span>
                    <span>Associates Degree in Microcomputers Management (Bryant & Stratton College, 1998)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Join the Waitlist</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Be among the first to access The L.A.W.S. Collective and receive updates about platform launch and exclusive community benefits.
            </p>
          </div>
          <div className="flex justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="text-lg px-8 py-6">
                Join Our Community <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              © 2026 The L.A.W.S. Collective. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Building Multi-Generational Wealth Through Community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
