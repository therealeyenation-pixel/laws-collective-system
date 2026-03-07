import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "membership" | "framework" | "technical";
}

const faqItems: FAQItem[] = [
  {
    id: "what-is-laws",
    category: "general",
    question: "What is The L.A.W.S. Collective?",
    answer: "The L.A.W.S. Collective is a framework designed to empower families to build sustainable multi-generational wealth. L.A.W.S. stands for Land, Air, Water, and Self—four interconnected pillars that guide community members toward financial independence, education, and lasting legacy creation.",
  },
  {
    id: "who-can-join",
    category: "membership",
    question: "Who can join The L.A.W.S. Collective?",
    answer: "The L.A.W.S. Collective welcomes families and individuals committed to building generational wealth and community empowerment. Whether you're just starting your financial journey or looking to strengthen your family's economic foundation, there's a place for you in our community.",
  },
  {
    id: "how-does-it-work",
    category: "framework",
    question: "How does the L.A.W.S. framework work?",
    answer: "The framework operates through four core pillars: LAND (reconnection & stability), AIR (education & knowledge), WATER (healing & balance), and SELF (purpose & skills). Members engage with simulators, educational content, and community resources aligned with these pillars to develop practical wealth-building skills.",
  },
  {
    id: "what-is-simulator",
    category: "technical",
    question: "What is the business simulator?",
    answer: "The business simulator is an interactive tool that allows you to test business concepts, make financial decisions, and see real-time results without risking actual capital. It provides hands-on learning about business operations, financial management, and strategic decision-making.",
  },
  {
    id: "cost-membership",
    category: "membership",
    question: "Is there a cost to join The L.A.W.S. Collective?",
    answer: "Membership details and pricing are available upon inquiry. We offer various membership levels to accommodate different needs and commitment levels. Contact us for current membership information and benefits.",
  },
  {
    id: "educational-resources",
    category: "general",
    question: "What educational resources are available?",
    answer: "Members have access to comprehensive educational content including courses on financial literacy, business development, legal structures, and wealth management. The Academy component offers self-paced learning with progress assessments aligned with traditional schooling standards.",
  },
  {
    id: "generational-wealth",
    category: "framework",
    question: "How does The L.A.W.S. Collective help build generational wealth?",
    answer: "We provide a structured framework combining education, business simulators, community support, and practical tools. Members learn wealth-building principles, develop business skills, understand legal and financial structures, and build networks that support long-term family prosperity.",
  },
  {
    id: "get-started",
    category: "membership",
    question: "How do I get started?",
    answer: "Begin by joining our waitlist to receive updates about membership opportunities. You can also explore our Business Demo to understand how The L.A.W.S. Collective framework works. Contact us for personalized guidance on joining.",
  },
  {
    id: "community-support",
    category: "general",
    question: "Is there community support available?",
    answer: "Yes. The L.A.W.S. Collective is built on community principles. Members have access to group learning, peer support networks, and collaborative opportunities to strengthen their wealth-building journey together.",
  },
  {
    id: "certificate-programs",
    category: "technical",
    question: "Are there certificate programs available?",
    answer: "Yes. The Academy offers certificate programs in various areas including financial literacy, business fundamentals, and specialized skills. Certificates recognize completion of structured learning paths and can support professional development.",
  },
];

const categories = [
  { id: "general", label: "General" },
  { id: "membership", label: "Membership" },
  { id: "framework", label: "Framework" },
  { id: "technical", label: "Technical" },
];

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  const filteredItems = faqItems.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Frequently Asked Questions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Learn more about The L.A.W.S. Collective
              </p>
            </div>
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
      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "general" ? "default" : "outline"}
              onClick={() => setSelectedCategory("general")}
              size="sm"
            >
              All Topics
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={
                  selectedCategory === cat.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(cat.id)}
                size="sm"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full p-6 flex items-start justify-between text-left hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.question}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {item.category}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-accent" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedId === item.id && (
                <div className="px-6 pb-6 border-t border-border">
                  <p className="text-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Didn't find your answer?
          </h2>
          <p className="text-foreground mb-6">
            Have a question not covered here? We're here to help. Reach out to
            our team and we'll get back to you as soon as possible.
          </p>
          <Button
            onClick={() => window.location.href = "/contact-us"}
            className="gap-2"
          >
            Contact Us
          </Button>
        </Card>
      </main>
    </div>
  );
}
