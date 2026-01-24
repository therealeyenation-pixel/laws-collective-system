import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Leaf
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
}

interface InventoryItem {
  id: string;
  name: string;
  type: "scroll" | "tool" | "artifact" | "resource";
  description: string;
  quantity: number;
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
    { id: "scroll-1", name: "Scroll of Beginning", type: "scroll", description: "Your first scroll, marking the start of your journey.", quantity: 1 },
  ],
};

export default function LAWSQuest() {
  const [character, setCharacter] = useState<Character>(() => {
    const saved = localStorage.getItem("laws-quest-character");
    return saved ? JSON.parse(saved) : DEFAULT_CHARACTER;
  });
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("laws-quest-quests");
    return saved ? JSON.parse(saved) : INITIAL_QUESTS;
  });
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showCharacterCreate, setShowCharacterCreate] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const { completeGame } = useGameCompletion();

  // Save game state
  useEffect(() => {
    localStorage.setItem("laws-quest-character", JSON.stringify(character));
    localStorage.setItem("laws-quest-quests", JSON.stringify(quests));
  }, [character, quests]);

  // Check if quest requirements are met
  const canStartQuest = (quest: Quest): boolean => {
    if (quest.completed) return false;
    const reqs = quest.requirements;
    return (
      (!reqs.land || character.stats.land >= reqs.land) &&
      (!reqs.air || character.stats.air >= reqs.air) &&
      (!reqs.water || character.stats.water >= reqs.water) &&
      (!reqs.self || character.stats.self >= reqs.self)
    );
  };

  // Complete a quest
  const completeQuest = (quest: Quest) => {
    if (!canStartQuest(quest)) return;

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

    setSelectedQuest(null);
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

  const rank = getCurrentRank(character.level);
  const RankIcon = rank.icon;

  const realmQuests = (realm: string) => quests.filter(q => q.realm === realm);

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
          <Badge variant="outline" className="text-green-600 border-green-600">
            Exclusive to L.A.W.S. Collective
          </Badge>
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
                <input
                  type="text"
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full mt-1 px-3 py-2 border rounded-md"
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
                        <div className="space-y-3">
                          {questsInRealm.map((quest) => {
                            const canStart = canStartQuest(quest);
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
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Swords className="w-5 h-5" />
                      {selectedQuest.name}
                    </CardTitle>
                    <CardDescription>{selectedQuest.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setSelectedQuest(null)}>
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={() => completeQuest(selectedQuest)}>
                        Complete Quest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
                <BookOpen className="w-5 h-5 text-purple-500 mb-1" />
                <p className="font-medium">Mini-Games</p>
                <p className="text-xs text-muted-foreground">Realm-specific challenges</p>
              </div>
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
                <Map className="w-5 h-5 text-purple-500 mb-1" />
                <p className="font-medium">AR/VR</p>
                <p className="text-xs text-muted-foreground">Immersive experience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
