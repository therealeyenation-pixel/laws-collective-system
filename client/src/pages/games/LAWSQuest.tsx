import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Mountain, 
  Wind, 
  Droplets, 
  Heart,
  Crown,
  Sparkles,
  Star,
  Trophy,
  Map,
  Compass,
  Scroll,
  Coins,
  Shield,
  Swords,
  BookOpen,
  Users,
  Home,
  Gem,
  Leaf,
  Brain,
  Target,
  Zap,
  TreePine,
  Waves,
  Flame,
  Eye,
  MessageCircle,
  Calculator,
  Package,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useGameCompletion } from "@/hooks/useGameCompletion";

// Character attributes aligned with L.A.W.S.
interface CharacterStats {
  land: number;    // Stability, resources, ancestral connection
  air: number;     // Knowledge, communication, wisdom
  water: number;   // Healing, balance, emotional intelligence
  self: number;    // Purpose, skills, financial literacy
}

interface Character {
  name: string;
  title: string;
  level: number;
  experience: number;
  experienceToNext: number;
  stats: CharacterStats;
  tokens: number;
  currentRealm: "land" | "air" | "water" | "self" | "hub";
  completedQuests: string[];
  achievements: string[];
  inventory: InventoryItem[];
  energy: number;
  maxEnergy: number;
}

interface InventoryItem {
  id: string;
  name: string;
  type: "scroll" | "tool" | "artifact" | "resource" | "key";
  description: string;
  quantity: number;
  icon: string;
  effect?: { stat: keyof CharacterStats; bonus: number };
}

interface Quest {
  id: string;
  name: string;
  description: string;
  realm: "land" | "air" | "water" | "self";
  difficulty: "beginner" | "intermediate" | "advanced" | "master";
  requirements: Partial<CharacterStats>;
  rewards: {
    experience: number;
    tokens: number;
    items?: InventoryItem[];
    statBoosts?: Partial<CharacterStats>;
  };
  completed: boolean;
  miniGame?: "trivia" | "memory" | "math" | "reflection" | "ancestry" | "meditation";
  energyCost: number;
}

interface NPC {
  id: string;
  name: string;
  title: string;
  realm: "land" | "air" | "water" | "self" | "hub";
  dialogue: string[];
  questGiver?: string;
  shopItems?: InventoryItem[];
}

// Mini-game types
type MiniGameType = "trivia" | "memory" | "math" | "reflection" | "ancestry" | "meditation";

interface MiniGameState {
  active: boolean;
  type: MiniGameType | null;
  quest: Quest | null;
  score: number;
  maxScore: number;
  currentQuestion: number;
  questions: any[];
  timeLeft: number;
  completed: boolean;
}

// Rank progression
const RANKS = [
  { name: "Seedling", minLevel: 1, icon: Leaf },
  { name: "Sprout", minLevel: 5, icon: Sparkles },
  { name: "Sapling", minLevel: 10, icon: Star },
  { name: "Tree", minLevel: 20, icon: Mountain },
  { name: "Grove", minLevel: 35, icon: Users },
  { name: "Forest", minLevel: 50, icon: Home },
  { name: "Sovereign", minLevel: 75, icon: Crown },
];

const getCurrentRank = (level: number) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) return RANKS[i];
  }
  return RANKS[0];
};

// NPCs for each realm
const NPCS: NPC[] = [
  {
    id: "elder-root",
    name: "Elder Root",
    title: "Keeper of Ancestral Wisdom",
    realm: "land",
    dialogue: [
      "Welcome, young one. The land remembers all who walk upon it.",
      "Your ancestors planted seeds of wisdom. It is time to harvest.",
      "To understand where you're going, you must know where you came from.",
    ],
    questGiver: "land-1",
  },
  {
    id: "sage-breeze",
    name: "Sage Breeze",
    title: "Master of Knowledge",
    realm: "air",
    dialogue: [
      "Knowledge flows like the wind - catch it, or it passes you by.",
      "Every question is a doorway. Are you brave enough to open it?",
      "The mind that seeks to learn will never be empty.",
    ],
    questGiver: "air-1",
  },
  {
    id: "healer-tide",
    name: "Healer Tide",
    title: "Guardian of Balance",
    realm: "water",
    dialogue: [
      "The waters of emotion can drown or carry you. Learn to swim.",
      "Healing begins when we acknowledge the wound.",
      "Balance is not stillness - it is the dance between forces.",
    ],
    questGiver: "water-1",
  },
  {
    id: "mentor-flame",
    name: "Mentor Flame",
    title: "Guide of Purpose",
    realm: "self",
    dialogue: [
      "Your purpose burns within you. Fan the flames.",
      "Wealth without purpose is a house without foundation.",
      "Build your legacy one brick at a time, but build it to last.",
    ],
    questGiver: "self-1",
  },
  {
    id: "guide-compass",
    name: "Guide Compass",
    title: "Navigator of Paths",
    realm: "hub",
    dialogue: [
      "All paths lead somewhere. Choose wisely.",
      "The journey of a thousand miles begins with a single step.",
      "I can show you the way, but you must walk it yourself.",
    ],
  },
];

// Trivia questions for each realm
const TRIVIA_QUESTIONS = {
  land: [
    { question: "What is the foundation of generational wealth?", options: ["Quick profits", "Land ownership", "Lottery", "Debt"], answer: 1 },
    { question: "Why is knowing your ancestry important?", options: ["It's not", "Social media", "Identity & roots", "Entertainment"], answer: 2 },
    { question: "What does 'sovereignty' mean?", options: ["Being king", "Self-governance", "Having money", "Being alone"], answer: 1 },
    { question: "What is a deed?", options: ["A good action", "Legal land document", "A type of tree", "A promise"], answer: 1 },
    { question: "Why preserve family history?", options: ["Boredom", "Future generations", "Social status", "Legal requirement"], answer: 1 },
  ],
  air: [
    { question: "What is the best investment in yourself?", options: ["Clothes", "Education", "Cars", "Jewelry"], answer: 1 },
    { question: "How does knowledge create wealth?", options: ["It doesn't", "Better decisions", "Magic", "Luck"], answer: 1 },
    { question: "What is financial literacy?", options: ["Reading books", "Understanding money", "Being rich", "Having a degree"], answer: 1 },
    { question: "Why is communication important?", options: ["Talking more", "Building relationships", "Arguing", "Entertainment"], answer: 1 },
    { question: "What is compound learning?", options: ["Math class", "Knowledge building on knowledge", "Studying hard", "Multiple degrees"], answer: 1 },
  ],
  water: [
    { question: "What is emotional intelligence?", options: ["Being emotional", "Understanding emotions", "Hiding feelings", "Being logical"], answer: 1 },
    { question: "How does stress affect decisions?", options: ["Improves them", "No effect", "Impairs judgment", "Makes you smarter"], answer: 2 },
    { question: "What is the first step in healing?", options: ["Forgetting", "Acknowledgment", "Revenge", "Ignoring"], answer: 1 },
    { question: "Why is balance important?", options: ["Gymnastics", "Sustainable living", "Looking good", "Being average"], answer: 1 },
    { question: "What helps process difficult emotions?", options: ["Suppression", "Reflection", "Distraction", "Anger"], answer: 1 },
  ],
  self: [
    { question: "What is a budget?", options: ["Restriction", "Financial plan", "Punishment", "Limit"], answer: 1 },
    { question: "What is compound interest?", options: ["Bank fee", "Interest on interest", "Loan type", "Tax"], answer: 1 },
    { question: "Why set financial goals?", options: ["Stress", "Direction & motivation", "Showing off", "Required by law"], answer: 1 },
    { question: "What is an emergency fund?", options: ["Vacation money", "Savings for unexpected events", "Investment", "Retirement"], answer: 1 },
    { question: "What builds credit score?", options: ["Ignoring bills", "On-time payments", "Closing accounts", "Maxing cards"], answer: 1 },
  ],
};

// Math challenges for SELF realm
const MATH_CHALLENGES = [
  { question: "If you save $100/month for 12 months, how much do you have?", answer: 1200 },
  { question: "You have $500 and spend 20%. How much is left?", answer: 400 },
  { question: "Your income is $3000. You save 15%. How much do you save?", answer: 450 },
  { question: "You invest $1000 and earn 10% interest. What's your total?", answer: 1100 },
  { question: "Split $600 equally among 4 family members. Each gets?", answer: 150 },
];

// Reflection prompts for WATER realm
const REFLECTION_PROMPTS = [
  "What emotion have you felt most strongly this week?",
  "Describe a moment when you felt truly at peace.",
  "What is one thing you're grateful for today?",
  "How do you typically respond to stress?",
  "What brings you the most joy in life?",
];

// Initial quests for each realm
const INITIAL_QUESTS: Quest[] = [
  // LAND Realm Quests
  {
    id: "land-1",
    name: "Roots of Origin",
    description: "Discover your ancestral lineage and document your family tree. Understanding where you come from is the first step to knowing where you're going.",
    realm: "land",
    difficulty: "beginner",
    requirements: {},
    rewards: { experience: 50, tokens: 10, statBoosts: { land: 2 } },
    completed: false,
    miniGame: "ancestry",
    energyCost: 10,
  },
  {
    id: "land-2",
    name: "Sacred Ground",
    description: "Learn about land ownership, property rights, and the importance of territorial sovereignty.",
    realm: "land",
    difficulty: "intermediate",
    requirements: { land: 5 },
    rewards: { experience: 100, tokens: 25, statBoosts: { land: 3 } },
    completed: false,
    miniGame: "trivia",
    energyCost: 15,
  },
  {
    id: "land-3",
    name: "Resource Stewardship",
    description: "Master the art of managing resources sustainably for future generations.",
    realm: "land",
    difficulty: "advanced",
    requirements: { land: 15 },
    rewards: { experience: 200, tokens: 50, statBoosts: { land: 5, self: 2 } },
    completed: false,
    miniGame: "trivia",
    energyCost: 20,
  },

  // AIR Realm Quests
  {
    id: "air-1",
    name: "First Words",
    description: "Learn the fundamentals of effective communication and clear expression.",
    realm: "air",
    difficulty: "beginner",
    requirements: {},
    rewards: { experience: 50, tokens: 10, statBoosts: { air: 2 } },
    completed: false,
    miniGame: "trivia",
    energyCost: 10,
  },
  {
    id: "air-2",
    name: "Knowledge Seeker",
    description: "Complete an educational challenge to expand your understanding of the world.",
    realm: "air",
    difficulty: "intermediate",
    requirements: { air: 5 },
    rewards: { experience: 100, tokens: 25, statBoosts: { air: 3 } },
    completed: false,
    miniGame: "memory",
    energyCost: 15,
  },
  {
    id: "air-3",
    name: "Wisdom Keeper",
    description: "Teach others what you've learned and preserve knowledge for future generations.",
    realm: "air",
    difficulty: "advanced",
    requirements: { air: 15 },
    rewards: { experience: 200, tokens: 50, statBoosts: { air: 5, water: 2 } },
    completed: false,
    miniGame: "trivia",
    energyCost: 20,
  },

  // WATER Realm Quests
  {
    id: "water-1",
    name: "Inner Reflection",
    description: "Begin your journey of emotional awareness and self-understanding.",
    realm: "water",
    difficulty: "beginner",
    requirements: {},
    rewards: { experience: 50, tokens: 10, statBoosts: { water: 2 } },
    completed: false,
    miniGame: "reflection",
    energyCost: 10,
  },
  {
    id: "water-2",
    name: "Healing Currents",
    description: "Learn techniques for emotional healing and maintaining inner balance.",
    realm: "water",
    difficulty: "intermediate",
    requirements: { water: 5 },
    rewards: { experience: 100, tokens: 25, statBoosts: { water: 3 } },
    completed: false,
    miniGame: "meditation",
    energyCost: 15,
  },
  {
    id: "water-3",
    name: "Flow Master",
    description: "Achieve mastery over your emotional responses and help others find balance.",
    realm: "water",
    difficulty: "advanced",
    requirements: { water: 15 },
    rewards: { experience: 200, tokens: 50, statBoosts: { water: 5, land: 2 } },
    completed: false,
    miniGame: "reflection",
    energyCost: 20,
  },

  // SELF Realm Quests
  {
    id: "self-1",
    name: "Purpose Discovery",
    description: "Identify your core values and begin defining your life's purpose.",
    realm: "self",
    difficulty: "beginner",
    requirements: {},
    rewards: { experience: 50, tokens: 10, statBoosts: { self: 2 } },
    completed: false,
    miniGame: "trivia",
    energyCost: 10,
  },
  {
    id: "self-2",
    name: "Financial Foundation",
    description: "Learn the basics of budgeting, saving, and building financial security.",
    realm: "self",
    difficulty: "intermediate",
    requirements: { self: 5 },
    rewards: { experience: 100, tokens: 25, statBoosts: { self: 3 } },
    completed: false,
    miniGame: "math",
    energyCost: 15,
  },
  {
    id: "self-3",
    name: "Sovereign Builder",
    description: "Create a comprehensive plan for building multi-generational wealth.",
    realm: "self",
    difficulty: "advanced",
    requirements: { self: 15 },
    rewards: { experience: 200, tokens: 50, statBoosts: { self: 5, air: 2 } },
    completed: false,
    miniGame: "math",
    energyCost: 20,
  },
];

const REALM_INFO = {
  land: {
    name: "LAND",
    fullName: "Reconnection & Stability",
    icon: Mountain,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Understanding roots, migrations, and family history. Build stability through connection to your origins.",
  },
  air: {
    name: "AIR",
    fullName: "Education & Knowledge",
    icon: Wind,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    description: "Learning, personal development, and communication. Expand your mind and share wisdom.",
  },
  water: {
    name: "WATER",
    fullName: "Healing & Balance",
    icon: Droplets,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Emotional resilience, healing cycles, and healthy decision-making. Find your inner balance.",
  },
  self: {
    name: "SELF",
    fullName: "Purpose & Skills",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "Financial literacy, business readiness, and purposeful growth. Build your sovereign future.",
  },
  hub: {
    name: "HUB",
    fullName: "Central Crossroads",
    icon: Compass,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "The central hub connecting all four realms. Plan your journey and manage your progress.",
  },
};

const DEFAULT_CHARACTER: Character = {
  name: "Sovereign",
  title: "Seedling",
  level: 1,
  experience: 0,
  experienceToNext: 100,
  stats: { land: 1, air: 1, water: 1, self: 1 },
  tokens: 0,
  currentRealm: "hub",
  completedQuests: [],
  achievements: [],
  inventory: [
    { id: "scroll-1", name: "Scroll of Beginning", type: "scroll", description: "Your first scroll, marking the start of your journey.", quantity: 1, icon: "📜" },
  ],
  energy: 100,
  maxEnergy: 100,
};

export default function LAWSQuest() {
  const [character, setCharacter] = useState<Character>(() => {
    const saved = localStorage.getItem("laws-quest-character-v2");
    return saved ? JSON.parse(saved) : DEFAULT_CHARACTER;
  });
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("laws-quest-quests-v2");
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCharacterCreate, setShowCharacterCreate] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
  const [npcDialogueIndex, setNpcDialogueIndex] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const { completeGame } = useGameCompletion();

  // Mini-game state
  const [miniGame, setMiniGame] = useState<MiniGameState>({
    active: false,
    type: null,
    quest: null,
    score: 0,
    maxScore: 5,
    currentQuestion: 0,
    questions: [],
    timeLeft: 60,
    completed: false,
  });
  const [userAnswer, setUserAnswer] = useState("");
  const [memoryCards, setMemoryCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [meditationProgress, setMeditationProgress] = useState(0);
  const [meditationActive, setMeditationActive] = useState(false);

  // Save game state
  useEffect(() => {
    localStorage.setItem("laws-quest-character-v2", JSON.stringify(character));
    localStorage.setItem("laws-quest-quests-v2", JSON.stringify(quests));
  }, [character, quests]);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setCharacter(prev => ({
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + 1)
      }));
    }, 60000); // Regenerate 1 energy per minute
    return () => clearInterval(interval);
  }, []);

  // Mini-game timer
  useEffect(() => {
    if (miniGame.active && miniGame.timeLeft > 0 && !miniGame.completed) {
      const timer = setTimeout(() => {
        setMiniGame(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (miniGame.timeLeft === 0 && miniGame.active) {
      endMiniGame(false);
    }
  }, [miniGame.active, miniGame.timeLeft, miniGame.completed]);

  // Meditation timer
  useEffect(() => {
    if (meditationActive && meditationProgress < 100) {
      const timer = setTimeout(() => {
        setMeditationProgress(prev => Math.min(100, prev + 2));
      }, 300);
      return () => clearTimeout(timer);
    } else if (meditationProgress >= 100 && meditationActive) {
      setMeditationActive(false);
      setMiniGame(prev => ({ ...prev, score: prev.maxScore, completed: true }));
      toast.success("Meditation complete! Inner peace achieved.");
    }
  }, [meditationActive, meditationProgress]);

  // Check if quest requirements are met
  const canStartQuest = (quest: Quest): boolean => {
    if (quest.completed) return false;
    if (character.energy < quest.energyCost) return false;
    const reqs = quest.requirements;
    return (
      (!reqs.land || character.stats.land >= reqs.land) &&
      (!reqs.air || character.stats.air >= reqs.air) &&
      (!reqs.water || character.stats.water >= reqs.water) &&
      (!reqs.self || character.stats.self >= reqs.self)
    );
  };

  // Start mini-game for quest
  const startMiniGame = (quest: Quest) => {
    if (!canStartQuest(quest)) return;

    // Deduct energy
    setCharacter(prev => ({ ...prev, energy: prev.energy - quest.energyCost }));

    const type = quest.miniGame || "trivia";
    let questions: any[] = [];
    let maxScore = 5;

    switch (type) {
      case "trivia":
        questions = [...TRIVIA_QUESTIONS[quest.realm]].sort(() => Math.random() - 0.5).slice(0, 5);
        break;
      case "math":
        questions = [...MATH_CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 5);
        break;
      case "reflection":
        questions = [...REFLECTION_PROMPTS].sort(() => Math.random() - 0.5).slice(0, 3);
        maxScore = 3;
        break;
      case "memory":
        initializeMemoryGame();
        maxScore = 6;
        break;
      case "meditation":
        maxScore = 1;
        setMeditationProgress(0);
        break;
      case "ancestry":
        questions = [
          { prompt: "Enter your family's country of origin:" },
          { prompt: "Name one ancestor you know about:" },
          { prompt: "What tradition has been passed down in your family?" },
        ];
        maxScore = 3;
        break;
    }

    setMiniGame({
      active: true,
      type,
      quest,
      score: 0,
      maxScore,
      currentQuestion: 0,
      questions,
      timeLeft: type === "meditation" ? 30 : 60,
      completed: false,
    });
    setSelectedQuest(null);
    setUserAnswer("");
  };

  // Initialize memory game
  const initializeMemoryGame = () => {
    const emojis = ["🌟", "🎯", "🔮", "💎", "🌙", "⚡"];
    const cards = [...emojis, ...emojis]
      .map((emoji, idx) => ({ id: idx, emoji, flipped: false, matched: false }))
      .sort(() => Math.random() - 0.5);
    setMemoryCards(cards);
    setFlippedCards([]);
  };

  // Handle memory card click
  const handleMemoryCardClick = (idx: number) => {
    if (flippedCards.length >= 2 || memoryCards[idx].flipped || memoryCards[idx].matched) return;

    const newCards = [...memoryCards];
    newCards[idx].flipped = true;
    setMemoryCards(newCards);
    setFlippedCards([...flippedCards, idx]);

    if (flippedCards.length === 1) {
      const firstIdx = flippedCards[0];
      if (newCards[firstIdx].emoji === newCards[idx].emoji) {
        // Match!
        setTimeout(() => {
          const matched = memoryCards.map((c, i) =>
            i === firstIdx || i === idx ? { ...c, matched: true } : c
          );
          setMemoryCards(matched);
          setFlippedCards([]);
          setMiniGame(prev => ({ ...prev, score: prev.score + 1 }));

          // Check if all matched
          if (matched.filter(c => c.matched).length === matched.length) {
            setMiniGame(prev => ({ ...prev, completed: true }));
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const reset = memoryCards.map((c, i) =>
            i === firstIdx || i === idx ? { ...c, flipped: false } : c
          );
          setMemoryCards(reset);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Handle trivia answer
  const handleTriviaAnswer = (answerIdx: number) => {
    const question = miniGame.questions[miniGame.currentQuestion];
    const correct = answerIdx === question.answer;

    if (correct) {
      setMiniGame(prev => ({ ...prev, score: prev.score + 1 }));
      toast.success("Correct!");
    } else {
      toast.error("Incorrect!");
    }

    if (miniGame.currentQuestion + 1 >= miniGame.questions.length) {
      setMiniGame(prev => ({ ...prev, completed: true }));
    } else {
      setMiniGame(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  // Handle math answer
  const handleMathAnswer = () => {
    const question = miniGame.questions[miniGame.currentQuestion];
    const correct = parseInt(userAnswer) === question.answer;

    if (correct) {
      setMiniGame(prev => ({ ...prev, score: prev.score + 1 }));
      toast.success("Correct!");
    } else {
      toast.error(`Incorrect! The answer was ${question.answer}`);
    }

    setUserAnswer("");

    if (miniGame.currentQuestion + 1 >= miniGame.questions.length) {
      setMiniGame(prev => ({ ...prev, completed: true }));
    } else {
      setMiniGame(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  // Handle reflection/ancestry submit
  const handleReflectionSubmit = () => {
    if (userAnswer.trim().length < 3) {
      toast.error("Please provide a more detailed response");
      return;
    }

    setMiniGame(prev => ({ ...prev, score: prev.score + 1 }));
    toast.success("Response recorded!");
    setUserAnswer("");

    if (miniGame.currentQuestion + 1 >= miniGame.questions.length) {
      setMiniGame(prev => ({ ...prev, completed: true }));
    } else {
      setMiniGame(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    }
  };

  // End mini-game
  const endMiniGame = (success: boolean) => {
    if (!miniGame.quest) return;

    const passThreshold = Math.ceil(miniGame.maxScore * 0.6);
    const passed = miniGame.score >= passThreshold;

    if (passed) {
      completeQuest(miniGame.quest);
    } else {
      toast.error("Quest failed. Try again when you're ready!");
      // Refund some energy
      setCharacter(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + Math.floor(miniGame.quest!.energyCost / 2)) }));
    }

    setMiniGame({
      active: false,
      type: null,
      quest: null,
      score: 0,
      maxScore: 5,
      currentQuestion: 0,
      questions: [],
      timeLeft: 60,
      completed: false,
    });
  };

  // Complete a quest
  const completeQuest = (quest: Quest) => {
    // Apply rewards
    const newExp = character.experience + quest.rewards.experience;
    let newLevel = character.level;
    let expToNext = character.experienceToNext;

    // Level up check
    while (newExp >= expToNext) {
      newLevel++;
      expToNext = Math.floor(expToNext * 1.5);
      toast.success(`Level Up! You are now level ${newLevel}!`);
    }

    const newStats = { ...character.stats };
    if (quest.rewards.statBoosts) {
      if (quest.rewards.statBoosts.land) newStats.land += quest.rewards.statBoosts.land;
      if (quest.rewards.statBoosts.air) newStats.air += quest.rewards.statBoosts.air;
      if (quest.rewards.statBoosts.water) newStats.water += quest.rewards.statBoosts.water;
      if (quest.rewards.statBoosts.self) newStats.self += quest.rewards.statBoosts.self;
    }

    const rank = getCurrentRank(newLevel);

    setCharacter({
      ...character,
      level: newLevel,
      experience: newExp,
      experienceToNext: expToNext,
      title: rank.name,
      stats: newStats,
      tokens: character.tokens + quest.rewards.tokens,
      completedQuests: [...character.completedQuests, quest.id],
    });

    setQuests(quests.map(q => q.id === quest.id ? { ...q, completed: true } : q));

    toast.success(`Quest Complete: ${quest.name}! +${quest.rewards.experience} XP, +${quest.rewards.tokens} Tokens`);

    // Award tokens through game completion system
    completeGame({ gameSlug: "laws-quest", won: true, score: quest.rewards.experience });
  };

  // Create new character
  const createCharacter = () => {
    if (!newCharacterName.trim()) {
      toast.error("Please enter a character name");
      return;
    }
    setCharacter({
      ...DEFAULT_CHARACTER,
      name: newCharacterName.trim(),
    });
    setQuests(INITIAL_QUESTS);
    setShowCharacterCreate(false);
    setNewCharacterName("");
    toast.success(`Welcome, ${newCharacterName}! Your journey begins.`);
  };

  // Reset game
  const resetGame = () => {
    setShowCharacterCreate(true);
  };

  // Talk to NPC
  const talkToNPC = (npc: NPC) => {
    setActiveNPC(npc);
    setNpcDialogueIndex(0);
  };

  const advanceDialogue = () => {
    if (activeNPC && npcDialogueIndex < activeNPC.dialogue.length - 1) {
      setNpcDialogueIndex(prev => prev + 1);
    } else {
      setActiveNPC(null);
      setNpcDialogueIndex(0);
    }
  };

  const rank = getCurrentRank(character.level);
  const RankIcon = rank.icon;

  const realmQuests = (realm: string) => quests.filter(q => q.realm === realm);
  const realmNPCs = (realm: string) => NPCS.filter(n => n.realm === realm);

  // Render mini-game content
  const renderMiniGame = () => {
    if (!miniGame.active) return null;

    return (
      <Dialog open={miniGame.active} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{miniGame.quest?.name}</span>
              <Badge variant="outline">{miniGame.timeLeft}s</Badge>
            </DialogTitle>
            <DialogDescription>
              Score: {miniGame.score}/{miniGame.maxScore}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Trivia Game */}
            {miniGame.type === "trivia" && !miniGame.completed && (
              <div className="space-y-4">
                <p className="font-medium">{miniGame.questions[miniGame.currentQuestion]?.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {miniGame.questions[miniGame.currentQuestion]?.options.map((opt: string, idx: number) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="h-auto py-3 text-left"
                      onClick={() => handleTriviaAnswer(idx)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Math Game */}
            {miniGame.type === "math" && !miniGame.completed && (
              <div className="space-y-4">
                <p className="font-medium">{miniGame.questions[miniGame.currentQuestion]?.question}</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    onKeyDown={(e) => e.key === "Enter" && handleMathAnswer()}
                  />
                  <Button onClick={handleMathAnswer}>Submit</Button>
                </div>
              </div>
            )}

            {/* Memory Game */}
            {miniGame.type === "memory" && !miniGame.completed && (
              <div className="grid grid-cols-4 gap-2">
                {memoryCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleMemoryCardClick(idx)}
                    className={`w-14 h-14 text-2xl rounded-lg transition-all ${
                      card.flipped || card.matched
                        ? "bg-primary/10"
                        : "bg-secondary hover:bg-secondary/80"
                    } ${card.matched ? "opacity-50" : ""}`}
                  >
                    {card.flipped || card.matched ? card.emoji : "❓"}
                  </button>
                ))}
              </div>
            )}

            {/* Reflection Game */}
            {(miniGame.type === "reflection" || miniGame.type === "ancestry") && !miniGame.completed && (
              <div className="space-y-4">
                <p className="font-medium">
                  {miniGame.type === "reflection"
                    ? miniGame.questions[miniGame.currentQuestion]
                    : miniGame.questions[miniGame.currentQuestion]?.prompt}
                </p>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                />
                <Button onClick={handleReflectionSubmit} className="w-full">
                  Submit Response
                </Button>
              </div>
            )}

            {/* Meditation Game */}
            {miniGame.type === "meditation" && !miniGame.completed && (
              <div className="space-y-4 text-center">
                <div className="text-6xl mb-4">🧘</div>
                <p className="text-muted-foreground">
                  {meditationActive
                    ? "Breathe deeply... Focus on the present moment..."
                    : "Click to begin your meditation journey"}
                </p>
                <Progress value={meditationProgress} className="h-3" />
                {!meditationActive && (
                  <Button onClick={() => setMeditationActive(true)} className="w-full">
                    Begin Meditation
                  </Button>
                )}
              </div>
            )}

            {/* Completed State */}
            {miniGame.completed && (
              <div className="text-center space-y-4">
                <div className="text-6xl">
                  {miniGame.score >= Math.ceil(miniGame.maxScore * 0.6) ? "🎉" : "😔"}
                </div>
                <p className="text-lg font-medium">
                  {miniGame.score >= Math.ceil(miniGame.maxScore * 0.6)
                    ? "Quest Complete!"
                    : "Quest Failed"}
                </p>
                <p className="text-muted-foreground">
                  Final Score: {miniGame.score}/{miniGame.maxScore}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {miniGame.completed && (
              <Button onClick={() => endMiniGame(miniGame.score >= Math.ceil(miniGame.maxScore * 0.6))}>
                {miniGame.score >= Math.ceil(miniGame.maxScore * 0.6) ? "Claim Rewards" : "Return"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-500" />
                L.A.W.S. Quest
              </h1>
              <p className="text-sm text-muted-foreground">The Sovereign Journey</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInventory(true)}>
              <Package className="w-4 h-4 mr-1" />
              Inventory
            </Button>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Exclusive to L.A.W.S. Collective
            </Badge>
          </div>
        </div>

        {/* Character Creation Modal */}
        {showCharacterCreate && (
          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Create Your Character
              </CardTitle>
              <CardDescription>Begin your journey to sovereignty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Character Name</label>
                <Input
                  type="text"
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={20}
                />
              </div>
              <Button onClick={createCharacter} className="w-full">
                Begin Journey
              </Button>
            </CardContent>
          </Card>
        )}

        {!showCharacterCreate && (
          <>
            {/* Character Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Character Card */}
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <Badge className="bg-amber-100 text-amber-800">
                      <RankIcon className="w-3 h-3 mr-1" />
                      {character.title}
                    </Badge>
                  </div>
                  <CardDescription>Level {character.level}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Experience</span>
                      <span>{character.experience} / {character.experienceToNext}</span>
                    </div>
                    <Progress value={(character.experience / character.experienceToNext) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        Energy
                      </span>
                      <span>{character.energy} / {character.maxEnergy}</span>
                    </div>
                    <Progress value={(character.energy / character.maxEnergy) * 100} className="h-2 bg-yellow-100" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      Tokens
                    </span>
                    <span className="font-bold">{character.tokens}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={resetGame}>
                    New Character
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">L.A.W.S. Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(["land", "air", "water", "self"] as const).map((stat) => {
                      const info = REALM_INFO[stat];
                      const Icon = info.icon;
                      return (
                        <div key={stat} className={`p-3 rounded-lg ${info.bgColor} ${info.borderColor} border`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${info.color}`} />
                            <span className={`text-sm font-medium ${info.color}`}>{info.name}</span>
                          </div>
                          <div className="text-2xl font-bold">{character.stats[stat]}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Realm Navigation */}
            <Tabs defaultValue="hub" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="hub" className="gap-1">
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline">Hub</span>
                </TabsTrigger>
                <TabsTrigger value="land" className="gap-1">
                  <Mountain className="w-4 h-4" />
                  <span className="hidden sm:inline">Land</span>
                </TabsTrigger>
                <TabsTrigger value="air" className="gap-1">
                  <Wind className="w-4 h-4" />
                  <span className="hidden sm:inline">Air</span>
                </TabsTrigger>
                <TabsTrigger value="water" className="gap-1">
                  <Droplets className="w-4 h-4" />
                  <span className="hidden sm:inline">Water</span>
                </TabsTrigger>
                <TabsTrigger value="self" className="gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Self</span>
                </TabsTrigger>
              </TabsList>

              {/* Hub Tab */}
              <TabsContent value="hub" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-emerald-600" />
                      Central Hub - The Crossroads
                    </CardTitle>
                    <CardDescription>
                      Welcome to the heart of your journey. From here, you can travel to any of the four realms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {(["land", "air", "water", "self"] as const).map((realm) => {
                        const info = REALM_INFO[realm];
                        const Icon = info.icon;
                        const questsInRealm = realmQuests(realm);
                        const completedInRealm = questsInRealm.filter(q => q.completed).length;
                        return (
                          <Card key={realm} className={`${info.bgColor} ${info.borderColor} border cursor-pointer hover:shadow-md transition-shadow`}>
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className={`w-6 h-6 ${info.color}`} />
                                <div>
                                  <h3 className={`font-bold ${info.color}`}>{info.name}</h3>
                                  <p className="text-xs text-muted-foreground">{info.fullName}</p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {completedInRealm}/{questsInRealm.length} Quests
                                </Badge>
                                <Badge className={info.bgColor + " " + info.color}>
                                  Lvl {character.stats[realm]}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* NPCs in Hub */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Characters
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {realmNPCs("hub").map(npc => (
                          <Button
                            key={npc.id}
                            variant="outline"
                            size="sm"
                            onClick={() => talkToNPC(npc)}
                            className="gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {npc.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Journey Progress
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quests Completed</span>
                          <p className="font-bold">{character.completedQuests.length} / {quests.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Level</span>
                          <p className="font-bold">{character.stats.land + character.stats.air + character.stats.water + character.stats.self}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tokens Earned</span>
                          <p className="font-bold">{character.tokens}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Rank</span>
                          <p className="font-bold">{RANKS.find(r => r.minLevel > character.level)?.name || "Max"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Realm Tabs */}
              {(["land", "air", "water", "self"] as const).map((realm) => {
                const info = REALM_INFO[realm];
                const Icon = info.icon;
                const questsInRealm = realmQuests(realm);
                const npcsInRealm = realmNPCs(realm);
                return (
                  <TabsContent key={realm} value={realm} className="mt-4">
                    <Card className={`${info.borderColor} border-2`}>
                      <CardHeader className={info.bgColor}>
                        <CardTitle className={`flex items-center gap-2 ${info.color}`}>
                          <Icon className="w-6 h-6" />
                          {info.name} Realm - {info.fullName}
                        </CardTitle>
                        <CardDescription>{info.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {/* NPCs */}
                        {npcsInRealm.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-sm">Realm Guides</h4>
                            <div className="flex gap-2 flex-wrap">
                              {npcsInRealm.map(npc => (
                                <Button
                                  key={npc.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => talkToNPC(npc)}
                                  className={`gap-1 ${info.borderColor}`}
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  {npc.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quests */}
                        <div className="space-y-3">
                          {questsInRealm.map((quest) => {
                            const canStart = canStartQuest(quest);
                            const hasEnergy = character.energy >= quest.energyCost;
                            const difficultyColors = {
                              beginner: "bg-green-100 text-green-800",
                              intermediate: "bg-yellow-100 text-yellow-800",
                              advanced: "bg-orange-100 text-orange-800",
                              master: "bg-red-100 text-red-800",
                            };
                            return (
                              <Card 
                                key={quest.id} 
                                className={`cursor-pointer transition-all ${quest.completed ? "opacity-60" : canStart ? "hover:shadow-md" : "opacity-50"}`}
                                onClick={() => !quest.completed && canStart && setSelectedQuest(quest)}
                              >
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Scroll className={`w-4 h-4 ${quest.completed ? "text-green-500" : info.color}`} />
                                        <h4 className="font-semibold">{quest.name}</h4>
                                        {quest.completed && <Badge className="bg-green-100 text-green-800">Complete</Badge>}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={difficultyColors[quest.difficulty]}>{quest.difficulty}</Badge>
                                        <Badge variant="outline">+{quest.rewards.experience} XP</Badge>
                                        <Badge variant="outline" className="text-amber-600">+{quest.rewards.tokens} Tokens</Badge>
                                        <Badge variant="outline" className={hasEnergy ? "text-yellow-600" : "text-red-600"}>
                                          <Zap className="w-3 h-3 mr-1" />
                                          {quest.energyCost} Energy
                                        </Badge>
                                      </div>
                                    </div>
                                    {!quest.completed && canStart && (
                                      <Button size="sm" className={info.bgColor + " " + info.color + " border " + info.borderColor}>
                                        Start
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>

            {/* Quest Dialog */}
            {selectedQuest && (
              <Dialog open={!!selectedQuest} onOpenChange={() => setSelectedQuest(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Swords className="w-5 h-5" />
                      {selectedQuest.name}
                    </DialogTitle>
                    <DialogDescription>{selectedQuest.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <h4 className="font-semibold mb-2">Rewards</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">+{selectedQuest.rewards.experience} XP</Badge>
                        <Badge variant="outline" className="text-amber-600">+{selectedQuest.rewards.tokens} Tokens</Badge>
                        {selectedQuest.rewards.statBoosts && Object.entries(selectedQuest.rewards.statBoosts).map(([stat, value]) => (
                          <Badge key={stat} variant="outline" className="text-green-600">+{value} {stat.toUpperCase()}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">Energy Cost: {selectedQuest.energyCost}</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Current Energy: {character.energy}/{character.maxEnergy}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedQuest(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => startMiniGame(selectedQuest)}>
                      Begin Quest
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* NPC Dialogue */}
            {activeNPC && (
              <Dialog open={!!activeNPC} onOpenChange={() => setActiveNPC(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{activeNPC.name}</DialogTitle>
                    <DialogDescription>{activeNPC.title}</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-lg italic">"{activeNPC.dialogue[npcDialogueIndex]}"</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={advanceDialogue}>
                      {npcDialogueIndex < activeNPC.dialogue.length - 1 ? (
                        <>Continue <ChevronRight className="w-4 h-4 ml-1" /></>
                      ) : (
                        "Farewell"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Inventory Dialog */}
            <Dialog open={showInventory} onOpenChange={setShowInventory}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Inventory
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {character.inventory.map((item, idx) => (
                    <Card key={idx} className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {character.inventory.length === 0 && (
                    <p className="col-span-2 text-center text-muted-foreground py-4">
                      Your inventory is empty
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Mini-game Dialog */}
            {renderMiniGame()}
          </>
        )}

        {/* Coming Soon Features */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-500" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-500 mb-1" />
                <p className="font-medium">Multiplayer</p>
                <p className="text-xs text-muted-foreground">Co-op quests</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Shield className="w-5 h-5 text-purple-500 mb-1" />
                <p className="font-medium">House Building</p>
                <p className="text-xs text-muted-foreground">Family legacy system</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Coins className="w-5 h-5 text-purple-500 mb-1" />
                <p className="font-medium">Token Shop</p>
                <p className="text-xs text-muted-foreground">Spend earned tokens</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Map className="w-5 h-5 text-purple-500 mb-1" />
                <p className="font-medium">World Map</p>
                <p className="text-xs text-muted-foreground">Explore new regions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
