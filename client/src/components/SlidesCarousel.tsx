import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

const slides = [
  {
    title: "The L.A.W.S. Collective",
    subtitle: "Building Multi-Generational Wealth Together",
    content: "A sovereign system designed to help families and communities build lasting prosperity through Land, Air, Water, and Self.",
    gradient: "from-emerald-900 via-teal-900 to-cyan-900",
  },
  {
    title: "What You Actually Get",
    subtitle: "Real Tools. Real Ownership. Real Wealth.",
    content: "Business formation, legal entity setup, financial dashboards, grant writing tools, tax preparation, education simulators, and a complete wealth management system \u2014 all under your sovereign control.",
    gradient: "from-blue-900 via-indigo-900 to-slate-900",
  },
  {
    title: "Education Simulators",
    subtitle: "Learn by Doing \u2014 Not Just Reading",
    content: "Interactive simulators for Business Formation, Grant Writing, Tax Preparation, Proposal Development, and Financial Planning. Practice real-world scenarios in a safe environment before making real decisions.",
    gradient: "from-purple-900 via-violet-900 to-indigo-900",
  },
  {
    title: "Grant & Proposal Workshop",
    subtitle: "From Application to Funding",
    content: "Step-by-step grant writing simulator, proposal templates, budget builders, and compliance checklists. Access a curated database of grants for nonprofits, small businesses, elderly programs, and community development.",
    gradient: "from-amber-900 via-orange-900 to-red-900",
  },
  {
    title: "Tax Preparation & Compliance",
    subtitle: "Entity-Specific Tax Strategy",
    content: "Tax simulators for LLCs, S Corps, nonprofits, and Trusts. Understand deductions, filing requirements, and compliance obligations before tax season arrives.",
    gradient: "from-teal-900 via-emerald-900 to-green-900",
  },
  {
    title: "Employee to Contractor Transition",
    subtitle: "A Clear Path to Independence",
    content: "Managers transition to Board Members. Coordinators become independent contractors. The system maps every step \u2014 benefits, legal structure, and role changes \u2014 so no one is left behind.",
    gradient: "from-cyan-900 via-blue-900 to-indigo-900",
  },
  {
    title: "Land Reclamation Initiative",
    subtitle: "Reconnecting Families to the Land",
    content: "Research ancestral land records, identify reclamation opportunities, and build a pathway back to land ownership. The L in L.A.W.S. stands for Land \u2014 it\u2019s foundational to generational wealth.",
    gradient: "from-green-900 via-emerald-900 to-teal-900",
  },
  {
    title: "Your House \u2014 Your Sovereign Instance",
    subtitle: "Private. Secure. Yours.",
    content: "Each family gets their own \u2018House\u2019 \u2014 a private system instance with its own businesses, dashboards, documents, and LuvLedger. Your data never mixes with anyone else\u2019s.",
    gradient: "from-indigo-900 via-purple-900 to-violet-900",
  },
  {
    title: "LuvLedger: Your Wealth Hub",
    subtitle: "Track Everything That Matters",
    content: "Business income, investments, real estate, crypto wallets, legal documents, and multi-generational history \u2014 all in one secure, blockchain-verified hub.",
    gradient: "from-violet-900 via-fuchsia-900 to-pink-900",
  },
  {
    title: "14 Business Dashboards",
    subtitle: "4 Standard + 10 Specialized",
    content: "Financial Overview, Team Management, Operations, and LuvLedger Assets come standard. Add specialized dashboards for your industry \u2014 real estate, healthcare, education, retail, and more.",
    gradient: "from-amber-900 via-yellow-900 to-orange-900",
  },
  {
    title: "Luv Learning Academy",
    subtitle: "Free Education for Heirs \u2022 Scholarships for Community",
    content: "K-12 Divine STEM curriculum across three Houses of learning. House of Many Tongues for language mastery. Mastery Scrolls as blockchain-verified certificates. Education is the foundation.",
    gradient: "from-blue-900 via-sky-900 to-cyan-900",
  },
  {
    title: "The L.A.W.S. Framework",
    subtitle: "Four Pillars of Wealth",
    content: "Land (Reconnection & Stability) \u2022 Air (Education & Knowledge) \u2022 Water (Healing & Balance) \u2022 Self (Purpose & Skills) \u2014 Every tool in the system maps back to these four pillars.",
    gradient: "from-green-900 via-teal-900 to-emerald-900",
  },
  {
    title: "Community Wealth Multiplier",
    subtitle: "Your Success Multiplies Across the Network",
    content: "1 Family \u2192 $100K wealth. 10 Families \u2192 $1M collective. 100 Families \u2192 $10M community impact. This isn\u2019t theory \u2014 it\u2019s the math of collective economics.",
    gradient: "from-rose-900 via-pink-900 to-fuchsia-900",
  },
  {
    title: "Built for Global Impact",
    subtitle: "International Considerations & Cross-Border Wealth",
    content: "International business entity structures. Cross-border asset management. Indigenous land rights on a global scale. International trade and commerce. Multi-currency support. Aligned with UN Sustainable Development Goals. Diaspora wealth building across borders.",
    gradient: "from-slate-900 via-blue-950 to-indigo-950",
  },
  {
    title: "Try the Demo Below",
    subtitle: "Set Up a Business. Watch the System Activate.",
    content: "Pick an entity type, name your business, and see the full system come alive \u2014 from formation to House creation to LuvLedger to dashboards to community. Under 2 minutes.",
    gradient: "from-indigo-900 via-purple-900 to-violet-900",
  },
  {
    title: "Join The L.A.W.S. Collective",
    subtitle: "March 4th, 2026 \u2014 Launch Event",
    content: "Be part of the movement. Build your House. Connect your businesses. Grow your community\u2019s wealth. The future is sovereign.",
    gradient: "from-emerald-900 via-teal-900 to-cyan-900",
  },
];

const audioUrls = [
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/GmSepDUuLqOeFuzZ.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/ZxeaupvKTSXmAcIc.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/XpQJAWBtKjwxWTHl.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/gRCMwawGRAqPzEAv.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/tCNraFOvOsACkxqL.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/YMewOqekvMZsUCnZ.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/RtQhUxBaNSErlvpD.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/lmIkiDdcKnqeQMmD.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/IrYHyGTTMXIXcmgu.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/XugXgHpoBOLdgiLC.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/vxQigvxBiEapOaPy.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/YNBCidhJlMwaHksl.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/ZXlEPsUpCxRMRitu.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/qZCRmNLdbHtjFQvX.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/HZzuCltkhzGUhabW.wav",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/UkJfOEMZulWrxMhv.wav",
];

export default function SlidesCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(6000);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, nextSlide]);

  // Play audio narration when slide changes
  useEffect(() => {
    if (isMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    const url = audioUrls[currentSlide];
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audio.volume = 0.85;
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.log("Audio autoplay blocked:", err);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [currentSlide, isMuted]);

  const toggleMute = () => {
    if (!isMuted && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsMuted(!isMuted);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div
        className={`bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-in-out`}
        style={{ minHeight: "400px" }}
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

      {/* Controls */}
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
        <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-white/10 text-white/80 text-xs rounded px-2 py-1 border border-white/20">
          <option value={3000}>3s</option>
          <option value={6000}>6s</option>
          <option value={10000}>10s</option>
          <option value={15000}>15s</option>
          <option value={20000}>20s</option>
        </select>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentSlide ? "bg-white w-4" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
