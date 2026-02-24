import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [demoName, setDemoName] = useState("");
  const [showDemoResults, setShowDemoResults] = useState(false);

  const handleDemoSubmit = () => {
    if (demoName.trim()) {
      setShowDemoResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              The L.A.W.S. Collective
            </h1>
            <p className="text-xl md:text-2xl text-foreground">
              <span className="text-green-600">L</span>and{" "}
              <span className="text-blue-600">A</span>ir{" "}
              <span className="text-cyan-600">W</span>ater{" "}
              <span className="text-purple-600">S</span>elf
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              A Sovereign Wealth Management & Trust Administration Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We are building a sovereign wealth management and trust administration platform designed to connect families within a closed-loop economic system for multi-generational wealth building.
            </p>
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="py-12 md:py-16 flex justify-center items-center">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <img 
            src="/qr-code.png" 
            alt="QR Code" 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto rounded-lg"
          />
        </div>
      </section>

      {/* Concept Overview Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2">CONCEPT OVERVIEW</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">See What We're Building</h2>
            <p className="text-muted-foreground mt-4">An overview of the platform vision and planned capabilities</p>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <p className="text-lg text-foreground leading-relaxed">
              The L.A.W.S. Collective is a comprehensive ecosystem designed to help families and communities build lasting wealth through education, practical tools, and community support. Our platform integrates financial literacy, legal frameworks, and wealth management strategies into an accessible system for multi-generational prosperity.
            </p>
          </Card>
        </div>
      </section>

      {/* Education Simulators Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Education Simulators</h2>
            <p className="text-muted-foreground mt-4">Learn by Doing — Not Just Reading</p>
          </div>
          <Card className="p-8">
            <p className="text-lg text-foreground mb-6">
              Interactive simulators for Business Formation, Grant Writing, Tax Preparation, Proposal Development, and Financial Planning. Practice real-world scenarios in a safe environment before making real decisions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Business Formation Simulator</h4>
                <p className="text-sm text-muted-foreground">Step-by-step guidance through entity selection and setup</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Grant Writing Workshop</h4>
                <p className="text-sm text-muted-foreground">Learn to identify and apply for funding opportunities</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Tax Preparation Guide</h4>
                <p className="text-sm text-muted-foreground">Understand tax obligations and optimization strategies</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Financial Planning Tool</h4>
                <p className="text-sm text-muted-foreground">Build comprehensive wealth management plans</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Platform Highlights</h2>
            <p className="text-muted-foreground mt-4">Discover the key features that make L.A.W.S. unique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="font-bold text-foreground mb-2">Sovereign Wealth Framework</h3>
              <p className="text-sm text-muted-foreground">Build wealth within a closed-loop economic system designed for family prosperity and generational transfer</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-foreground mb-2">Comprehensive Education</h3>
              <p className="text-sm text-muted-foreground">From financial literacy to business formation, our curriculum covers everything needed for economic independence</p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-foreground mb-2">Community Network</h3>
              <p className="text-sm text-muted-foreground">Connect with families, access shared resources, and build collective wealth through community collaboration</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Luv's Vision Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2">FOUNDER'S VISION</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Luv's Vision</h2>
          </div>
          <Card className="p-8 max-w-4xl mx-auto">
            <p className="text-lg text-foreground leading-relaxed mb-6">
              "My vision is to create a system that reconnects families with their power to build generational wealth. For too long, our communities have been disconnected from the knowledge and tools needed to create lasting economic sovereignty. The L.A.W.S. Collective is designed to change that narrative—to help families understand that they have the capacity, the right, and the responsibility to build wealth that serves their families for generations to come."
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              "This isn't just about money. It's about reconnecting with our land, our knowledge, our water, and our purpose. It's about creating systems that work for us, not against us. It's about building a legacy of sovereignty and abundance for our children and their children."
            </p>
          </Card>
        </div>
      </section>

      {/* L.A.W.S. Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2">OUR MISSION</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">L.A.W.S. Mission</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Land</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Reconnect families with their roots, understanding their lineage and the importance of land ownership and stewardship. We help families establish stable foundations for wealth building.
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Air</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Provide education and knowledge that empowers families to make informed decisions. We believe that access to quality education is the foundation for economic freedom.
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Water</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Create balance and healing in financial relationships. We help families navigate the emotional and practical aspects of wealth, ensuring sustainable and healthy economic systems.
              </p>
            </Card>
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Self</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Develop practical skills and purpose-driven work. We empower individuals to build businesses, create value, and establish themselves as economic agents in their own right.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive System Demo Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Interactive System Demo</h2>
            <p className="text-muted-foreground mt-4">Experience the Platform</p>
          </div>
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Enter your business name to see how the system works:
                </label>
                <input
                  type="text"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="Your Business Name"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <Button onClick={handleDemoSubmit} className="w-full">
                See Your System <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {showDemoResults && (
                <div className="p-6 bg-primary/5 rounded-lg space-y-4">
                  <h3 className="font-bold text-foreground">Your {demoName} System includes:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Customized business structure recommendations</li>
                    <li>✓ Tax optimization strategies</li>
                    <li>✓ Wealth building roadmap</li>
                    <li>✓ Community connection opportunities</li>
                    <li>✓ Educational resources tailored to your needs</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Planned Capabilities Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Planned Capabilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Advanced Analytics</h3>
              <p className="text-muted-foreground">Deep insights into wealth building metrics and community impact</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Mobile App</h3>
              <p className="text-muted-foreground">Full system access on iOS and Android devices</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">API Integration</h3>
              <p className="text-muted-foreground">Connect with banking and financial services</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Blockchain Features</h3>
              <p className="text-muted-foreground">Secure wealth documentation and transfer mechanisms</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Business Simulators Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Business Simulators</h2>
            <p className="text-muted-foreground mt-4">Learn by Doing — Not Just Reading</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Business Formation</h3>
              <p className="text-muted-foreground">Interactive simulator for entity selection and setup</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Grant Writing</h3>
              <p className="text-muted-foreground">Step-by-step guide to identifying and applying for grants</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Tax Preparation</h3>
              <p className="text-muted-foreground">Understand tax obligations and optimization strategies</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-3">Proposal Development</h3>
              <p className="text-muted-foreground">Create compelling proposals for funding and partnerships</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Academy & Curriculum Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Academy & Curriculum</h2>
            <p className="text-muted-foreground mt-4">Luv Learning Academy</p>
          </div>
          <Card className="p-8">
            <p className="text-lg text-foreground mb-6">
              Comprehensive educational programs designed to build financial literacy and wealth management skills across all age groups.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Foundational Courses</h4>
                <p className="text-sm text-muted-foreground">Money management, budgeting, and financial basics</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Advanced Modules</h4>
                <p className="text-sm text-muted-foreground">Investment strategies, business ownership, wealth transfer</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Mentorship Program</h4>
                <p className="text-sm text-muted-foreground">One-on-one guidance from wealth building experts</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Community Network Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Community Network</h2>
            <p className="text-muted-foreground mt-4">Connect, Collaborate, and Grow Together</p>
          </div>
          <Card className="p-8">
            <p className="text-lg text-foreground mb-6">
              A thriving community of families and entrepreneurs working together to build multi-generational wealth.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Local Chapters</h4>
                <p className="text-sm text-muted-foreground">Regional communities for in-person connection and support</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Online Forums</h4>
                <p className="text-sm text-muted-foreground">24/7 access to community expertise and peer support</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Networking Events</h4>
                <p className="text-sm text-muted-foreground">Regular meetups for collaboration and partnership building</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Resource Sharing</h4>
                <p className="text-sm text-muted-foreground">Access to vetted vendors, services, and opportunities</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Trust Management Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trust Management</h2>
            <p className="text-muted-foreground mt-4">Secure Your Family's Legacy</p>
          </div>
          <Card className="p-8">
            <p className="text-lg text-foreground mb-6">
              Professional tools for creating, managing, and transferring wealth through trusts and legal structures.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li>✓ Trust creation and documentation</li>
              <li>✓ Beneficiary management</li>
              <li>✓ Asset protection strategies</li>
              <li>✓ Succession planning</li>
              <li>✓ Legal compliance tracking</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">1</div>
              <h3 className="font-bold text-foreground mb-2">Join</h3>
              <p className="text-muted-foreground text-sm">Create your account and complete your profile</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">2</div>
              <h3 className="font-bold text-foreground mb-2">Learn</h3>
              <p className="text-muted-foreground text-sm">Access educational resources and simulators</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">3</div>
              <h3 className="font-bold text-foreground mb-2">Connect</h3>
              <p className="text-muted-foreground text-sm">Build relationships with community members</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-3">4</div>
              <h3 className="font-bold text-foreground mb-2">Build</h3>
              <p className="text-muted-foreground text-sm">Create lasting multi-generational wealth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Wealth Building Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Community Wealth Multiplier</h2>
            <p className="text-muted-foreground mt-4">Deep insights into community metrics and collective impact</p>
          </div>
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">$0</div>
                <p className="text-muted-foreground">Community Wealth Generated</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <p className="text-muted-foreground">Active Members</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <p className="text-muted-foreground">Businesses Launched</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* LuvLedger Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">LuvLedger</h2>
            <p className="text-muted-foreground mt-4">Wealth Management & Tracking</p>
          </div>
          <Card className="p-8">
            <p className="text-lg text-foreground mb-6">
              A comprehensive wealth tracking and management system designed to help you monitor, grow, and protect your assets.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Asset Tracking</h4>
                <p className="text-sm text-muted-foreground">Monitor all assets in one centralized location</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Growth Monitoring</h4>
                <p className="text-sm text-muted-foreground">Track wealth growth and investment performance</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Goal Setting</h4>
                <p className="text-sm text-muted-foreground">Define and track financial goals</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-lg">
                <h4 className="font-bold text-foreground mb-2">Reporting</h4>
                <p className="text-sm text-muted-foreground">Generate detailed wealth reports and analytics</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* L.A.W.S. Framework Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">The L.A.W.S. Framework</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-l-4 border-l-green-600">
              <h3 className="text-xl font-bold text-foreground mb-2">🌍 LAND</h3>
              <p className="text-muted-foreground">Reconnection & Stability - Understanding roots, migrations, and family history</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-blue-600">
              <h3 className="text-xl font-bold text-foreground mb-2">💨 AIR</h3>
              <p className="text-muted-foreground">Education & Knowledge - Learning, personal development, and communication</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-cyan-600">
              <h3 className="text-xl font-bold text-foreground mb-2">💧 WATER</h3>
              <p className="text-muted-foreground">Healing & Balance - Emotional resilience, healing cycles, and healthy decision-making</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-purple-600">
              <h3 className="text-xl font-bold text-foreground mb-2">🔥 SELF</h3>
              <p className="text-muted-foreground">Purpose & Skills - Financial literacy, business readiness, and purposeful growth</p>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">What's Coming</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-3">Coming Soon</div>
              <h3 className="font-bold text-foreground mb-2">Mobile App</h3>
              <p className="text-muted-foreground">Full system access on iOS and Android devices</p>
            </Card>
            <Card className="p-6">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-3">Coming Soon</div>
              <h3 className="font-bold text-foreground mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">Deep insights into wealth building metrics and community impact</p>
            </Card>
            <Card className="p-6">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-3">Coming Soon</div>
              <h3 className="font-bold text-foreground mb-2">API Integration</h3>
              <p className="text-muted-foreground">Connect with banking and financial services</p>
            </Card>
            <Card className="p-6">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-3">Coming Soon</div>
              <h3 className="font-bold text-foreground mb-2">Blockchain Features</h3>
              <p className="text-muted-foreground">Secure wealth documentation and transfer mechanisms</p>
            </Card>
            <Card className="p-6">
              <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-3">Coming Soon</div>
              <h3 className="font-bold text-foreground mb-2">LuvOnPurpose Academy</h3>
              <p className="text-muted-foreground">Comprehensive educational programs and certification courses</p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Luv Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary mb-2">MEET THE FOUNDER</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">About Luv</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/dLPgSOCzSajCscyU.png" 
                alt="La Shanna K. Russell" 
                className="w-64 h-64 md:w-80 md:h-80 rounded-lg shadow-lg object-cover"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">La Shanna K. Russell (Luv)</h3>
                <p className="text-lg text-primary font-semibold mb-4">Founder & Visionary of The L.A.W.S. Collective</p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  With extensive experience in contracting and enterprise operations, I bring both academic rigor and practical expertise to the L.A.W.S. Collective.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  My background spans 15+ years in government and commercial contracting, combined with a lifetime of research and systems architecture focused on wealth-building mechanisms and economic sovereignty.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4">Education</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Bachelor's Degree in Business Administration with minor in Management (American Public University, 2025, Cum Laude)</li>
                  <li>• Associates Degree in Microcomputers Management (Bryant & Stratton College, 1998, National Honors Society)</li>
                  <li>• Associates Degree in Administrative Assistant with Micro option (Bryant & Stratton College, 1998)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Join the Waitlist</h2>
            <p className="text-muted-foreground mt-4">Be among the first to access The L.A.W.S. Collective</p>
          </div>
          <Card className="p-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <p className="text-center text-muted-foreground mb-6">
                Sign up to receive updates about platform launch, early access opportunities, and exclusive community benefits.
              </p>
              <a href={getLoginUrl()} className="block">
                <Button className="w-full" size="lg">
                  Join Our Community <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </Card>
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
