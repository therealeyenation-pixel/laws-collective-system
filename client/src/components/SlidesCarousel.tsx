import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

const BACKGROUND_MUSIC_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663294252884/XwktlnCpAeGsQKKj.mp3";

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

type TransitionType = "curtain" | "fade" | "blink" | "slide";
const transitionTypes: TransitionType[] = ["curtain", "fade", "blink", "slide"];

export default function SlidesCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed] = useState(12000); // 12 seconds per slide for readability
  const [isMuted, setIsMuted] = useState(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>("fade");
  const [showContent, setShowContent] = useState(true);
  const [curtainPhase, setCurtainPhase] = useState<"idle" | "closing" | "closed" | "opening">("idle");
  const pendingSlideRef = useRef<number | null>(null);

  // Initialize background music (loops continuously)
  useEffect(() => {
    const audio = new Audio(BACKGROUND_MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Handle mute/unmute for background music
  useEffect(() => {
    const audio = bgMusicRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.log("Audio autoplay blocked:", err);
      });
    }
  }, [isMuted]);

  const doTransition = useCallback((nextIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextTransition = transitionTypes[nextIndex % transitionTypes.length];
    setTransitionType(nextTransition);

    if (nextTransition === "curtain") {
      setCurtainPhase("closing");
      pendingSlideRef.current = nextIndex;
      setTimeout(() => {
        setCurtainPhase("closed");
        setCurrentSlide(nextIndex);
        setTimeout(() => {
          setCurtainPhase("opening");
          setTimeout(() => {
            setCurtainPhase("idle");
            setIsTransitioning(false);
          }, 600);
        }, 200);
      }, 600);
    } else if (nextTransition === "blink") {
      setShowContent(false);
      setTimeout(() => {
        setCurrentSlide(nextIndex);
        setTimeout(() => {
          setShowContent(true);
          setTimeout(() => {
            setShowContent(false);
            setTimeout(() => {
              setShowContent(true);
              setIsTransitioning(false);
            }, 80);
          }, 80);
        }, 100);
      }, 150);
    } else if (nextTransition === "slide") {
      setShowContent(false);
      setTimeout(() => {
        setCurrentSlide(nextIndex);
        setTimeout(() => {
          setShowContent(true);
          setIsTransitioning(false);
        }, 50);
      }, 400);
    } else {
      // Fade transition (default)
      setShowContent(false);
      setTimeout(() => {
        setCurrentSlide(nextIndex);
        setTimeout(() => {
          setShowContent(true);
          setIsTransitioning(false);
        }, 50);
      }, 500);
    }
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    doTransition(next);
  }, [currentSlide, doTransition]);

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    doTransition(prev);
  }, [currentSlide, doTransition]);

  const goToSlide = useCallback((idx: number) => {
    if (idx === currentSlide) return;
    doTransition(idx);
  }, [currentSlide, doTransition]);

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || isTransitioning) return;
    const interval = setInterval(nextSlide, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, nextSlide, isTransitioning]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const slide = slides[currentSlide];

  const getContentClasses = () => {
    const base = "flex flex-col items-center justify-center text-center px-8 py-16 md:py-20";

    if (transitionType === "blink") {
      return `${base} transition-opacity duration-75 ${showContent ? "opacity-100" : "opacity-0"}`;
    }
    if (transitionType === "slide") {
      return `${base} transition-all duration-[400ms] ease-in-out ${showContent ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`;
    }
    // fade (default)
    return `${base} transition-opacity duration-500 ease-in-out ${showContent ? "opacity-100" : "opacity-0"}`;
  };

  const getCurtainStyle = (): React.CSSProperties => {
    if (curtainPhase === "idle") return { display: "none" };
    return {
      position: "absolute",
      inset: 0,
      zIndex: 30,
      display: "flex",
      overflow: "hidden",
    };
  };

  const getLeftCurtainStyle = (): React.CSSProperties => {
    const closed = curtainPhase === "closing" || curtainPhase === "closed";
    return {
      width: "50%",
      height: "100%",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      transform: closed ? "translateX(0)" : "translateX(-100%)",
      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "4px 0 20px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: "20px",
    };
  };

  const getRightCurtainStyle = (): React.CSSProperties => {
    const closed = curtainPhase === "closing" || curtainPhase === "closed";
    return {
      width: "50%",
      height: "100%",
      background: "linear-gradient(225deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      transform: closed ? "translateX(0)" : "translateX(100%)",
      transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "-4px 0 20px rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingLeft: "20px",
    };
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ minHeight: "400px" }}>
      {/* Curtain Overlay */}
      <div style={getCurtainStyle()}>
        <div style={getLeftCurtainStyle()}>
          <div style={{ width: "2px", height: "60%", background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.6), transparent)" }} />
        </div>
        <div style={getRightCurtainStyle()}>
          <div style={{ width: "2px", height: "60%", background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.6), transparent)" }} />
        </div>
      </div>

      {/* Main Slide */}
      <div
        className={`bg-gradient-to-br ${slide.gradient} transition-colors duration-700 ease-in-out`}
        style={{ minHeight: "400px" }}
      >
        <div className={getContentClasses()}>
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

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div
          className="h-full bg-white/50 transition-all ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transition: `width ${isPlaying ? "0.5s" : "0.3s"} ease-out`,
          }}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          disabled={isTransitioning}
          className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          disabled={isTransitioning}
          className="text-white/80 hover:text-white hover:bg-white/20 h-8 w-8"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className={`h-8 w-8 ${isMuted ? "text-white/80 hover:text-white hover:bg-white/20" : "text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20 ring-1 ring-yellow-400/40"}`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <span className="text-white/40 text-[10px] uppercase tracking-wider ml-2 hidden md:inline">
          {transitionType}
        </span>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            disabled={isTransitioning}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentSlide
                ? "bg-white w-6"
                : idx < currentSlide
                  ? "bg-white/60 w-1.5"
                  : "bg-white/30 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
