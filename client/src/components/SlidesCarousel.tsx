import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    title: "Welcome to The L.A.W.S. Collective",
    subtitle: "Building Multi-Generational Wealth Together",
    content: "A sovereign system designed to help families and communities build lasting prosperity through Land, Air, Water, and Self.",
    gradient: "from-emerald-900 via-teal-900 to-cyan-900",
  },
  {
    title: "The Foundation: What is a House?",
    subtitle: "Your Family's Isolated System Instance",
    content: "Each family gets their own 'House' — a private, secure instance of the entire system. Your data, your business, your legacy — completely sovereign.",
    gradient: "from-blue-900 via-indigo-900 to-purple-900",
  },
  {
    title: "LuvLedger: The Central Nervous System",
    subtitle: "Track Everything That Matters",
    content: "Business income, investments, real estate, crypto, legal documents, and multi-generational history — all in one secure hub.",
    gradient: "from-purple-900 via-violet-900 to-fuchsia-900",
  },
  {
    title: "Businesses Connected to Your House",
    subtitle: "Multiple Entities, One Dashboard",
    content: "LLCs, S Corps, Nonprofits, Trusts — connect all your entities to your House and manage them from a single command center.",
    gradient: "from-amber-900 via-orange-900 to-red-900",
  },
  {
    title: "Business-Level Dashboards",
    subtitle: "4 Standard + 10 Specialized Dashboards",
    content: "Financial Overview, Team Management, Operations, and LuvLedger Assets come standard. Add specialized dashboards based on your business type.",
    gradient: "from-teal-900 via-emerald-900 to-green-900",
  },
  {
    title: "Data Flow: Business to House to Community",
    subtitle: "The Wealth Multiplication Engine",
    content: "Your business data flows into your House, aggregates in LuvLedger, and contributes to the collective community wealth metrics.",
    gradient: "from-cyan-900 via-blue-900 to-indigo-900",
  },
  {
    title: "The L.A.W.S. Framework",
    subtitle: "Four Pillars of Wealth",
    content: "Land (Reconnection & Stability) \u2022 Air (Education & Knowledge) \u2022 Water (Healing & Balance) \u2022 Self (Purpose & Skills)",
    gradient: "from-green-900 via-emerald-900 to-teal-900",
  },
  {
    title: "Community Wealth Building",
    subtitle: "The Multiplier Effect",
    content: "1 Family \u2192 $100K wealth. 10 Families \u2192 $1M collective. 100 Families \u2192 $10M community impact. Together, we build exponentially.",
    gradient: "from-rose-900 via-pink-900 to-fuchsia-900",
  },
  {
    title: "Your Journey Starts Here",
    subtitle: "From Simulation to Sovereignty",
    content: "Try the demo below. See how a business is formed, connected to a House, and tracked through LuvLedger. Then join us.",
    gradient: "from-indigo-900 via-purple-900 to-violet-900",
  },
  {
    title: "Join The L.A.W.S. Collective",
    subtitle: "March 4th, 2026 \u2014 Launch Event",
    content: "Be part of the movement. Build your House. Connect your businesses. Grow your community's wealth. The future is sovereign.",
    gradient: "from-emerald-900 via-teal-900 to-cyan-900",
  },
];

export default function SlidesCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(6000);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div
        className={`bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-in-out`}
        style={{ minHeight: "360px" }}
      >
        <div className="flex flex-col items-center justify-center text-center px-8 py-16 md:py-20">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-4">
            {currentSlide + 1} / {slides.length}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
            {slide.title}
          </h2>
          <p className="text-xl md:text-2xl text-white/80 font-medium mb-6 max-w-3xl">
            {slide.subtitle}
          </p>
          <p className="text-base md:text-lg text-white/70 max-w-2xl leading-relaxed">
            {slide.content}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
        <Button variant="ghost" size="icon" onClick={prevSlide} className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={nextSlide} className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-white/10 text-white/80 text-xs rounded px-2 py-1 border border-white/20">
          <option value={3000}>3s</option>
          <option value={6000}>6s</option>
          <option value={10000}>10s</option>
          <option value={15000}>15s</option>
        </select>
      </div>

      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? "bg-white w-6" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
