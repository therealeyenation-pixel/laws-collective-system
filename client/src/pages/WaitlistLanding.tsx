import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Shield,
  BookOpen,
  DollarSign,
  Gavel,
  Leaf,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Heart,
  Sparkles,
} from "lucide-react";

const INTEREST_OPTIONS = [
  { id: "membership", label: "Collective Membership", icon: Shield, desc: "Join the L.A.W.S. Collective community" },
  { id: "academy", label: "Academy & Education", icon: BookOpen, desc: "K-12 curriculum, financial literacy, coding/AI" },
  { id: "grant_writing", label: "Grant Writing Services", icon: DollarSign, desc: "Professional grant applications" },
  { id: "business_services", label: "Business Services", icon: Gavel, desc: "Formation, contracts, compliance" },
  { id: "creative_services", label: "Creative & NFT Services", icon: Sparkles, desc: "Design, media, NFT generation" },
  { id: "smart_contracts", label: "Smart Contract & Blockchain", icon: Zap, desc: "Blockchain development & training" },
];

export default function WaitlistLanding() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Get URL params for referral tracking
  const [referralCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ref") || undefined;
  });
  const [source] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("src") || "waitlist_page";
  });

  const { data: countData } = trpc.waitlist.getCount.useQuery();
  const signupMutation = trpc.waitlist.signup.useMutation();

  const waitlistCount = countData?.count || 0;

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const result = await signupMutation.mutateAsync({
      email,
      fullName: fullName || undefined,
      businessName: businessName || undefined,
      interestCategories: selectedInterests.length > 0 ? selectedInterests : undefined,
      source,
      referralCode,
    });

    if (result.success) {
      setSubmitted(true);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full p-10 bg-[#1a1a2e]/80 border-amber-500/30 text-center">
          <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">You're In.</h2>
          <p className="text-gray-300 mb-6">
            Welcome to the L.A.W.S. Collective waitlist. You'll be among the first to know
            when we activate. Your interest helps us build something real — for you, for your
            family, for generations to come.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <p className="text-amber-300 text-sm">
              <strong>What happens next?</strong> We'll notify you when the Collective opens
              for membership. Priority access goes to waitlist members.
            </p>
          </div>
          <p className="text-gray-500 text-xs">
            L.A.W.S. Collective, LLC — Land. Air. Water. Self.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a1a2e] to-[#0a0a1a]">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
            <Leaf className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Pre-Launch — Join the Waitlist</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Build Sovereign.{" "}
            <span className="text-amber-400">Build Together.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            The L.A.W.S. Collective is a multi-generational system designed to help families
            build real wealth, gain real education, and create real legacy — powered by AI,
            grounded in purpose.
          </p>

          {/* Social Proof */}
          {waitlistCount > 0 && (
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="flex -space-x-2">
                {[...Array(Math.min(waitlistCount, 4))].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-[#1a1a2e] flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-white" />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                <span className="text-amber-400 font-semibold">{waitlistCount}</span>{" "}
                {waitlistCount === 1 ? "person has" : "people have"} joined the waitlist
              </p>
            </div>
          )}
        </div>
      </section>

      {/* What's Coming Section */}
      <section className="pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What the Collective Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              {
                icon: Shield,
                title: "Sovereign System",
                desc: "Token-based activation, House governance, multi-generational wealth architecture",
              },
              {
                icon: BookOpen,
                title: "Academy & Education",
                desc: "K-12 homeschool curriculum, business simulators, coding/AI, smart contract training",
              },
              {
                icon: DollarSign,
                title: "Professional Services",
                desc: "Grant writing, business formation, market research, NFT generation, creative design",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-6 bg-[#1a1a2e]/60 border-gray-700/50 hover:border-amber-500/30 transition-colors"
              >
                <item.icon className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-[#1a1a2e]/80 border-amber-500/20">
            <div className="text-center mb-8">
              <Heart className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
              <p className="text-gray-400 text-sm">
                Be among the first families to join when we activate. No commitment — just interest.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Email Address *</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#0a0a1a] border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-[#0a0a1a] border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Business Name</label>
                  <Input
                    type="text"
                    placeholder="Optional"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="bg-[#0a0a1a] border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Interest Categories */}
              <div>
                <label className="text-sm text-gray-300 mb-3 block">
                  What interests you most? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {INTEREST_OPTIONS.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => toggleInterest(option.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedInterests.includes(option.id)
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-[#0a0a1a]/50 border-gray-700/50 hover:border-gray-600"
                      }`}
                    >
                      <Checkbox
                        checked={selectedInterests.includes(option.id)}
                        className="mt-0.5 border-gray-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg"
              >
                {signupMutation.isPending ? (
                  "Joining..."
                ) : (
                  <>
                    Join the Waitlist <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-gray-500 text-xs">
                No spam. No commitment. We'll only contact you when the Collective activates.
              </p>
            </form>
          </Card>
        </div>
      </section>

      {/* L.A.W.S. Framework */}
      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">L.A.W.S. Framework</h2>
          <p className="text-gray-400 mb-8">The four pillars of sovereign living</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { letter: "L", word: "Land", desc: "Reconnection & Stability" },
              { letter: "A", word: "Air", desc: "Education & Knowledge" },
              { letter: "W", word: "Water", desc: "Healing & Balance" },
              { letter: "S", word: "Self", desc: "Purpose & Skills" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-amber-400">{item.letter}</span>
                </div>
                <p className="text-white font-semibold">{item.word}</p>
                <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-8 px-4 text-center">
        <p className="text-gray-600 text-xs">
          L.A.W.S. Collective, LLC | LuvOnPurpose Outreach Temple and Academy Society, Inc. (508(c)(1)(A))
        </p>
        <p className="text-gray-700 text-xs mt-1">
          Multi-Generational Architecture | 5-Year Implementation Arc + 100+ Year Legacy Vision
        </p>
      </footer>
    </div>
  );
}
