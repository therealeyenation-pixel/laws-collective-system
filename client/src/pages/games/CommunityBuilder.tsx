import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  Building2,
  Map,
  Wind,
  Droplets,
  Heart,
  DollarSign,
  Briefcase,
  GraduationCap,
  Home,
  TreePine,
  Factory,
  Store,
  Church,
  Hospital,
  School,
  Warehouse,
  Vote,
  MessageSquare,
  Trophy,
  Star,
  Crown,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  Shield,
  TrendingUp,
  Coins,
  Hammer,
  Wrench,
  BookOpen,
  Stethoscope,
  Scale,
  Gavel,
  Megaphone,
  UserPlus,
  Settings,
  BarChart3,
  Calendar,
  AlertTriangle,
  Info
} from "lucide-react";
import { Link } from "wouter";

// Game phases
type GamePhase = "lobby" | "startup" | "design" | "build" | "manage";

// Player roles aligned with L.A.W.S.
type PlayerRole = "builder" | "educator" | "healer" | "manager" | "developer";

// Building types
interface BuildingType {
  id: string;
  name: string;
  category: "land" | "air" | "water" | "self";
  icon: any;
  cost: number;
  upkeep: number;
  capacity: number;
  jobs: number;
  description: string;
  requirements?: string[];
}

// Community resources
interface CommunityResources {
  funds: number;
  land: number;
  labor: number;
  materials: number;
  knowledge: number;
  wellness: number;
}

// Player state
interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  contribution: number;
  questAchievements: string[];
  votes: number;
  isHost: boolean;
}

// Building instance
interface Building {
  id: string;
  typeId: string;
  name: string;
  level: number;
  workers: number;
  efficiency: number;
  position: { x: number; y: number };
}

// Community event
interface CommunityEvent {
  id: string;
  name: string;
  description: string;
  type: "opportunity" | "challenge" | "decision";
  options: { id: string; text: string; effect: Partial<CommunityResources> }[];
  votingRequired: boolean;
}

// Quarterly Priority - constrained choice system
interface QuarterlyPriority {
  id: string;
  name: string;
  description: string;
  category: "land" | "air" | "water" | "self";
  cost: number;
  benefits: { type: string; value: number }[];
  tradeoff: string;
  votes: number;
}

// Service Contract - bidding system
interface ServiceContract {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: number; // turns
  requiredSkills: PlayerRole[];
  status: "open" | "awarded" | "completed";
  bids: { playerId: string; amount: number; proposal: string }[];
  winnerId?: string;
}

// Build Limitation
interface BuildLimitation {
  type: "zoning" | "funding" | "permit" | "labor" | "sequence";
  description: string;
  blockedBuildings: string[];
  requirement: string;
}

// Game state
interface GameState {
  phase: GamePhase;
  turn: number;
  players: Player[];
  resources: CommunityResources;
  buildings: Building[];
  currentEvent: CommunityEvent | null;
  votes: Record<string, string>;
  communityName: string;
  communityMission: string;
  population: number;
  happiness: number;
  sustainability: number;
  quarterlyPriorities: QuarterlyPriority[];
  selectedPriorities: string[];
  maxPrioritiesPerTurn: number;
  serviceContracts: ServiceContract[];
  buildLimitations: BuildLimitation[];
}

// Building definitions
const BUILDING_TYPES: BuildingType[] = [
  // LAND - Property and Stability
  { id: "housing", name: "Community Housing", category: "land", icon: Home, cost: 50000, upkeep: 2000, capacity: 20, jobs: 2, description: "Affordable housing for community members" },
  { id: "farm", name: "Community Farm", category: "land", icon: TreePine, cost: 30000, upkeep: 1500, capacity: 0, jobs: 8, description: "Sustainable food production" },
  { id: "warehouse", name: "Storage Facility", category: "land", icon: Warehouse, cost: 25000, upkeep: 1000, capacity: 0, jobs: 3, description: "Store materials and goods" },
  { id: "community_center", name: "Community Center", category: "land", icon: Church, cost: 75000, upkeep: 3000, capacity: 100, jobs: 5, description: "Gathering space for events and meetings" },
  
  // AIR - Education and Knowledge
  { id: "school", name: "Academy Campus", category: "air", icon: School, cost: 100000, upkeep: 5000, capacity: 50, jobs: 15, description: "K-12 education facility" },
  { id: "library", name: "Knowledge Center", category: "air", icon: BookOpen, cost: 40000, upkeep: 1500, capacity: 30, jobs: 4, description: "Library and learning resources" },
  { id: "trade_school", name: "Trade Academy", category: "air", icon: Wrench, cost: 80000, upkeep: 4000, capacity: 25, jobs: 10, description: "Vocational training center" },
  { id: "media_center", name: "Real-Eye-Nation Studio", category: "air", icon: Megaphone, cost: 60000, upkeep: 3000, capacity: 0, jobs: 8, description: "Media production and truth documentation" },
  
  // WATER - Healing and Balance
  { id: "clinic", name: "Wellness Clinic", category: "water", icon: Hospital, cost: 120000, upkeep: 6000, capacity: 0, jobs: 20, description: "Healthcare services" },
  { id: "counseling", name: "Healing Center", category: "water", icon: Heart, cost: 45000, upkeep: 2000, capacity: 0, jobs: 6, description: "Mental health and counseling" },
  { id: "recreation", name: "Recreation Center", category: "water", icon: Droplets, cost: 55000, upkeep: 2500, capacity: 40, jobs: 5, description: "Sports and wellness activities" },
  { id: "elder_care", name: "Elder Care Facility", category: "water", icon: Stethoscope, cost: 90000, upkeep: 4500, capacity: 15, jobs: 12, description: "Care for community elders" },
  
  // SELF - Business and Purpose
  { id: "business_hub", name: "Business Incubator", category: "self", icon: Building2, cost: 85000, upkeep: 3500, capacity: 0, jobs: 5, description: "Support for new businesses" },
  { id: "marketplace", name: "Community Market", category: "self", icon: Store, cost: 35000, upkeep: 1500, capacity: 0, jobs: 10, description: "Local commerce center" },
  { id: "workshop", name: "Maker Space", category: "self", icon: Hammer, cost: 50000, upkeep: 2000, capacity: 0, jobs: 8, description: "Tools and equipment for creation" },
  { id: "legal_center", name: "Legal Services", category: "self", icon: Gavel, cost: 70000, upkeep: 3000, capacity: 0, jobs: 6, description: "Legal support and advocacy" },
];

// Role definitions
const ROLE_INFO: Record<PlayerRole, { name: string; icon: any; description: string; bonus: string }> = {
  builder: { name: "Builder", icon: Hammer, description: "Specializes in construction and infrastructure", bonus: "+20% construction speed" },
  educator: { name: "Educator", icon: GraduationCap, description: "Focuses on education and knowledge sharing", bonus: "+20% education effectiveness" },
  healer: { name: "Healer", icon: Heart, description: "Supports wellness and community health", bonus: "+20% wellness services" },
  manager: { name: "Manager", icon: Briefcase, description: "Oversees operations and resources", bonus: "+20% resource efficiency" },
  developer: { name: "Developer", icon: TrendingUp, description: "Drives business and economic growth", bonus: "+20% business income" },
};

// Sample events
const SAMPLE_EVENTS: CommunityEvent[] = [
  {
    id: "grant_opportunity",
    name: "Foundation Grant Available",
    description: "A foundation is offering a $100,000 grant for community development. How should we apply?",
    type: "opportunity",
    options: [
      { id: "education", text: "Apply for education programs", effect: { funds: 100000, knowledge: 20 } },
      { id: "housing", text: "Apply for housing development", effect: { funds: 100000, land: 10 } },
      { id: "wellness", text: "Apply for wellness services", effect: { funds: 100000, wellness: 20 } },
    ],
    votingRequired: true,
  },
  {
    id: "economic_downturn",
    name: "Economic Challenge",
    description: "Regional economic downturn is affecting local businesses. How do we respond?",
    type: "challenge",
    options: [
      { id: "support", text: "Provide emergency business support (-$20,000)", effect: { funds: -20000, labor: 5 } },
      { id: "training", text: "Offer retraining programs (-$15,000)", effect: { funds: -15000, knowledge: 10 } },
      { id: "diversify", text: "Diversify community economy (-$25,000)", effect: { funds: -25000, materials: 10 } },
    ],
    votingRequired: true,
  },
  {
    id: "new_members",
    name: "Membership Growth",
    description: "Several families want to join the community. How many should we accept?",
    type: "decision",
    options: [
      { id: "few", text: "Accept 2 families (careful growth)", effect: { labor: 4, funds: -5000 } },
      { id: "moderate", text: "Accept 5 families (balanced growth)", effect: { labor: 10, funds: -12000 } },
      { id: "many", text: "Accept 10 families (rapid growth)", effect: { labor: 20, funds: -25000 } },
    ],
    votingRequired: true,
  },
];

// Initial game state
const INITIAL_STATE: GameState = {
  phase: "lobby",
  turn: 0,
  players: [],
  resources: {
    funds: 250000,
    land: 100,
    labor: 50,
    materials: 100,
    knowledge: 50,
    wellness: 50,
  },
  buildings: [],
  currentEvent: null,
  votes: {},
  communityName: "",
  communityMission: "",
  population: 0,
  happiness: 75,
  sustainability: 60,
  quarterlyPriorities: [],
  selectedPriorities: [],
  maxPrioritiesPerTurn: 2,
  serviceContracts: [],
  buildLimitations: [
    { type: "zoning", description: "Industrial buildings cannot be adjacent to schools", blockedBuildings: ["factory"], requirement: "No school within 2 spaces" },
    { type: "funding", description: "Must have 20% down payment before construction", blockedBuildings: [], requirement: "20% of building cost in reserves" },
    { type: "sequence", description: "Must have housing before population can grow", blockedBuildings: ["school", "clinic"], requirement: "At least 1 housing unit built" },
    { type: "labor", description: "Specialized buildings need qualified workers", blockedBuildings: ["clinic", "legal_center"], requirement: "Educator or Healer role in community" },
  ],
};

export default function CommunityBuilder() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem("community-builder-v1");
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  
  const [playerName, setPlayerName] = useState("");
  const [selectedRole, setSelectedRole] = useState<PlayerRole>("builder");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ player: string; message: string; time: string }[]>([]);

  // Save game state
  useEffect(() => {
    localStorage.setItem("community-builder-v1", JSON.stringify(gameState));
  }, [gameState]);

  // Join game
  const joinGame = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: playerName,
      role: selectedRole,
      contribution: 0,
      questAchievements: [],
      votes: 1,
      isHost: gameState.players.length === 0,
    };
    
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
    }));
    
    toast.success(`Welcome to the community, ${playerName}!`);
  };

  // Generate quarterly priorities (constrained choices)
  const generateQuarterlyPriorities = (): QuarterlyPriority[] => {
    const allPriorities: QuarterlyPriority[] = [
      { id: "expand-academy", name: "Expand Academy", description: "Add classrooms and hire teachers", category: "air", cost: 80000, benefits: [{ type: "education", value: 10 }, { type: "jobs", value: 5 }], tradeoff: "Delays wellness expansion", votes: 0 },
      { id: "wellness-services", name: "Add Wellness Services", description: "Open community clinic", category: "water", cost: 60000, benefits: [{ type: "wellness", value: 15 }, { type: "jobs", value: 8 }], tradeoff: "Reduces business funding", votes: 0 },
      { id: "business-incubator", name: "Business Incubator", description: "Support new member businesses", category: "self", cost: 70000, benefits: [{ type: "income", value: 5000 }, { type: "jobs", value: 5 }], tradeoff: "Less community housing", votes: 0 },
      { id: "housing-development", name: "Housing Development", description: "Build affordable housing units", category: "land", cost: 90000, benefits: [{ type: "population", value: 25 }, { type: "stability", value: 10 }], tradeoff: "Slower economic growth", votes: 0 },
      { id: "trade-school", name: "Trade School Program", description: "Vocational training for members", category: "air", cost: 55000, benefits: [{ type: "skills", value: 20 }, { type: "jobs", value: 3 }], tradeoff: "Competes with academy resources", votes: 0 },
      { id: "legal-services", name: "Legal Services Center", description: "Provide legal support to members", category: "self", cost: 45000, benefits: [{ type: "protection", value: 15 }, { type: "jobs", value: 4 }], tradeoff: "Diverts from direct services", votes: 0 },
      { id: "community-farm", name: "Community Farm", description: "Sustainable food production", category: "land", cost: 40000, benefits: [{ type: "food", value: 30 }, { type: "jobs", value: 6 }], tradeoff: "Land not available for housing", votes: 0 },
      { id: "media-center", name: "Media Production Center", description: "Real-Eye-Nation studio expansion", category: "air", cost: 65000, benefits: [{ type: "outreach", value: 25 }, { type: "jobs", value: 4 }], tradeoff: "Less immediate community impact", votes: 0 },
    ];
    // Randomly select 4-5 priorities for this quarter
    const shuffled = allPriorities.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4 + Math.floor(Math.random() * 2));
  };

  // Start game (host only)
  const startGame = () => {
    if (gameState.players.length < 1) {
      toast.error("Need at least 1 player to start");
      return;
    }
    if (!gameState.communityName.trim()) {
      toast.error("Please name your community");
      return;
    }
    
    const initialPriorities = generateQuarterlyPriorities();
    const initialContracts: ServiceContract[] = [
      { id: "contract-1", title: "Website Development", description: "Build community website and member portal", budget: 15000, deadline: 3, requiredSkills: ["developer"], status: "open", bids: [] },
      { id: "contract-2", title: "Curriculum Development", description: "Create K-8 homeschool curriculum", budget: 25000, deadline: 4, requiredSkills: ["educator"], status: "open", bids: [] },
      { id: "contract-3", title: "Wellness Program Design", description: "Design community wellness initiatives", budget: 12000, deadline: 2, requiredSkills: ["healer"], status: "open", bids: [] },
    ];
    
    setGameState(prev => ({
      ...prev,
      phase: "startup",
      turn: 1,
      quarterlyPriorities: initialPriorities,
      selectedPriorities: [],
      serviceContracts: initialContracts,
    }));
    
    toast.success("Community building has begun! Review quarterly priorities.");
  };

  // Advance phase
  const advancePhase = () => {
    const phases: GamePhase[] = ["lobby", "startup", "design", "build", "manage"];
    const currentIndex = phases.indexOf(gameState.phase);
    
    if (currentIndex < phases.length - 1) {
      setGameState(prev => ({
        ...prev,
        phase: phases[currentIndex + 1],
        turn: prev.turn + 1,
      }));
      toast.success(`Advanced to ${phases[currentIndex + 1]} phase`);
    }
  };

  // Build structure
  const buildStructure = (buildingTypeId: string) => {
    const buildingType = BUILDING_TYPES.find(b => b.id === buildingTypeId);
    if (!buildingType) return;
    
    if (gameState.resources.funds < buildingType.cost) {
      toast.error("Insufficient funds");
      return;
    }
    
    const newBuilding: Building = {
      id: `building-${Date.now()}`,
      typeId: buildingTypeId,
      name: buildingType.name,
      level: 1,
      workers: 0,
      efficiency: 100,
      position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
    };
    
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        funds: prev.resources.funds - buildingType.cost,
      },
      buildings: [...prev.buildings, newBuilding],
    }));
    
    toast.success(`Built ${buildingType.name}!`);
  };

  // Cast vote
  const castVote = (optionId: string) => {
    if (!gameState.currentEvent) return;
    
    // In single player, just apply the effect directly
    const option = gameState.currentEvent.options.find(o => o.id === optionId);
    if (option) {
      setGameState(prev => ({
        ...prev,
        resources: {
          funds: prev.resources.funds + (option.effect.funds || 0),
          land: prev.resources.land + (option.effect.land || 0),
          labor: prev.resources.labor + (option.effect.labor || 0),
          materials: prev.resources.materials + (option.effect.materials || 0),
          knowledge: prev.resources.knowledge + (option.effect.knowledge || 0),
          wellness: prev.resources.wellness + (option.effect.wellness || 0),
        },
        currentEvent: null,
      }));
      toast.success("Decision made!");
    }
  };

  // Trigger random event
  const triggerEvent = () => {
    const event = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
    setGameState(prev => ({
      ...prev,
      currentEvent: event,
    }));
  };

  // Vote for priority
  const voteForPriority = (priorityId: string) => {
    if (gameState.selectedPriorities.includes(priorityId)) {
      toast.error("Already selected this priority");
      return;
    }
    if (gameState.selectedPriorities.length >= gameState.maxPrioritiesPerTurn) {
      toast.error(`Can only select ${gameState.maxPrioritiesPerTurn} priorities per quarter`);
      return;
    }
    
    const priority = gameState.quarterlyPriorities.find(p => p.id === priorityId);
    if (priority && gameState.resources.funds < priority.cost) {
      toast.error("Insufficient funds for this priority");
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      selectedPriorities: [...prev.selectedPriorities, priorityId],
      quarterlyPriorities: prev.quarterlyPriorities.map(p => 
        p.id === priorityId ? { ...p, votes: p.votes + 1 } : p
      ),
    }));
    toast.success(`Voted for: ${priority?.name}`);
  };

  // Submit bid for contract
  const submitBid = (contractId: string, amount: number, proposal: string) => {
    const currentPlayer = gameState.players[0]; // In single player, first player
    if (!currentPlayer) return;
    
    setGameState(prev => ({
      ...prev,
      serviceContracts: prev.serviceContracts.map(c => 
        c.id === contractId 
          ? { ...c, bids: [...c.bids, { playerId: currentPlayer.id, amount, proposal }] }
          : c
      ),
    }));
    toast.success("Bid submitted!");
  };

  // Award contract (in multiplayer, this would be voted on)
  const awardContract = (contractId: string, winnerId: string) => {
    setGameState(prev => ({
      ...prev,
      serviceContracts: prev.serviceContracts.map(c => 
        c.id === contractId 
          ? { ...c, status: "awarded", winnerId }
          : c
      ),
    }));
    toast.success("Contract awarded!");
  };

  // Execute selected priorities at end of quarter
  const executeQuarterlyPriorities = () => {
    let totalCost = 0;
    const selectedPriorityObjects = gameState.quarterlyPriorities.filter(
      p => gameState.selectedPriorities.includes(p.id)
    );
    
    selectedPriorityObjects.forEach(p => {
      totalCost += p.cost;
    });
    
    if (totalCost > gameState.resources.funds) {
      toast.error("Insufficient funds to execute all priorities");
      return;
    }
    
    // Apply benefits and deduct costs
    setGameState(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        funds: prev.resources.funds - totalCost,
      },
      quarterlyPriorities: generateQuarterlyPriorities(),
      selectedPriorities: [],
      turn: prev.turn + 1,
    }));
    
    toast.success(`Executed ${selectedPriorityObjects.length} priorities! New quarter begins.`);
  };

  // Check build limitations
  const canBuild = (buildingTypeId: string): { allowed: boolean; reason?: string } => {
    const hasHousing = gameState.buildings.some(b => b.typeId === "housing");
    const hasEducator = gameState.players.some(p => p.role === "educator");
    const hasHealer = gameState.players.some(p => p.role === "healer");
    
    for (const limitation of gameState.buildLimitations) {
      if (limitation.blockedBuildings.includes(buildingTypeId)) {
        if (limitation.type === "sequence" && !hasHousing) {
          return { allowed: false, reason: limitation.description };
        }
        if (limitation.type === "labor") {
          if (buildingTypeId === "clinic" && !hasHealer) {
            return { allowed: false, reason: "Need a Healer role in community" };
          }
          if (buildingTypeId === "legal_center" && !hasEducator) {
            return { allowed: false, reason: "Need an Educator role in community" };
          }
        }
      }
    }
    return { allowed: true };
  };

  // Reset game
  const resetGame = () => {
    setGameState(INITIAL_STATE);
    setPlayerName("");
    setChatHistory([]);
    toast.success("Game reset");
  };

  // Calculate community stats
  const totalJobs = gameState.buildings.reduce((acc, b) => {
    const type = BUILDING_TYPES.find(t => t.id === b.typeId);
    return acc + (type?.jobs || 0);
  }, 0);
  
  const totalCapacity = gameState.buildings.reduce((acc, b) => {
    const type = BUILDING_TYPES.find(t => t.id === b.typeId);
    return acc + (type?.capacity || 0);
  }, 0);
  
  const monthlyUpkeep = gameState.buildings.reduce((acc, b) => {
    const type = BUILDING_TYPES.find(t => t.id === b.typeId);
    return acc + (type?.upkeep || 0);
  }, 0);

  // Get buildings by category
  const getBuildingsByCategory = (category: "land" | "air" | "water" | "self") => {
    return gameState.buildings.filter(b => {
      const type = BUILDING_TYPES.find(t => t.id === b.typeId);
      return type?.category === category;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Community Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Build a thriving community together using L.A.W.S. principles
            </p>
          </div>
          <div className="flex items-center gap-2">
            {gameState.phase !== "lobby" && (
              <>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Turn {gameState.turn}
                </Badge>
                <Badge className="text-lg px-4 py-2 capitalize">
                  {gameState.phase} Phase
                </Badge>
              </>
            )}
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Lobby Phase */}
        {gameState.phase === "lobby" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Join Game */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Join Community
                </CardTitle>
                <CardDescription>
                  Enter your name and choose your role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Your Name</Label>
                  <Input 
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label>Your Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as PlayerRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_INFO).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <info.icon className="w-4 h-4" />
                            {info.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRole && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {ROLE_INFO[selectedRole].description}. {ROLE_INFO[selectedRole].bonus}
                    </p>
                  )}
                </div>
                <Button onClick={joinGame} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Game
                </Button>
              </CardContent>
            </Card>

            {/* Community Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Community Setup
                </CardTitle>
                <CardDescription>
                  Define your community's identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Community Name</Label>
                  <Input 
                    value={gameState.communityName}
                    onChange={(e) => setGameState(prev => ({ ...prev, communityName: e.target.value }))}
                    placeholder="Name your community"
                  />
                </div>
                <div>
                  <Label>Mission Statement</Label>
                  <Textarea 
                    value={gameState.communityMission}
                    onChange={(e) => setGameState(prev => ({ ...prev, communityMission: e.target.value }))}
                    placeholder="What is your community's purpose?"
                    rows={3}
                  />
                </div>
                
                {/* Players List */}
                <div>
                  <Label>Players ({gameState.players.length})</Label>
                  <div className="space-y-2 mt-2">
                    {gameState.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const RoleIcon = ROLE_INFO[player.role].icon;
                            return RoleIcon ? <RoleIcon className="w-4 h-4" /> : null;
                          })()}
                          <span>{player.name}</span>
                          {player.isHost && <Badge variant="outline" className="text-xs">Host</Badge>}
                        </div>
                        <Badge>{ROLE_INFO[player.role].name}</Badge>
                      </div>
                    ))}
                    {gameState.players.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No players yet. Join to get started!
                      </p>
                    )}
                  </div>
                </div>
                
                {gameState.players.length > 0 && gameState.players[0]?.isHost && (
                  <Button onClick={startGame} className="w-full" disabled={!gameState.communityName.trim()}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Building Community
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* L.A.W.S. Principles */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>L.A.W.S. Building Principles</CardTitle>
                <CardDescription>
                  Your community will be built on these four pillars
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-center">
                    <Map className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                    <h4 className="font-bold">LAND</h4>
                    <p className="text-xs text-muted-foreground">Property, Housing, Stability</p>
                  </div>
                  <div className="p-4 bg-sky-50 dark:bg-sky-950/20 rounded-lg text-center">
                    <Wind className="w-8 h-8 mx-auto text-sky-600 mb-2" />
                    <h4 className="font-bold">AIR</h4>
                    <p className="text-xs text-muted-foreground">Education, Knowledge, Truth</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                    <Droplets className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <h4 className="font-bold">WATER</h4>
                    <p className="text-xs text-muted-foreground">Healing, Wellness, Balance</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                    <Heart className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <h4 className="font-bold">SELF</h4>
                    <p className="text-xs text-muted-foreground">Business, Purpose, Growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Game Phases */}
        {gameState.phase !== "lobby" && (
          <>
            {/* Resource Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold">{formatCurrency(gameState.resources.funds)}</p>
                    <p className="text-xs text-muted-foreground">Funds</p>
                  </div>
                  <div className="text-center">
                    <Map className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                    <p className="text-lg font-bold">{gameState.resources.land}</p>
                    <p className="text-xs text-muted-foreground">Land (acres)</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold">{gameState.resources.labor}</p>
                    <p className="text-xs text-muted-foreground">Labor Pool</p>
                  </div>
                  <div className="text-center">
                    <Warehouse className="w-6 h-6 mx-auto text-gray-600 mb-1" />
                    <p className="text-lg font-bold">{gameState.resources.materials}</p>
                    <p className="text-xs text-muted-foreground">Materials</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold">{gameState.resources.knowledge}</p>
                    <p className="text-xs text-muted-foreground">Knowledge</p>
                  </div>
                  <div className="text-center">
                    <Heart className="w-6 h-6 mx-auto text-red-600 mb-1" />
                    <p className="text-lg font-bold">{gameState.resources.wellness}</p>
                    <p className="text-xs text-muted-foreground">Wellness</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Event */}
            {gameState.currentEvent && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    {gameState.currentEvent.name}
                  </CardTitle>
                  <CardDescription>{gameState.currentEvent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {gameState.currentEvent.options.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="h-auto py-4 flex-col"
                        onClick={() => castVote(option.id)}
                      >
                        <span>{option.text}</span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {Object.entries(option.effect)
                            .filter(([_, v]) => v !== 0)
                            .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
                            .join(', ')}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quarterly Priorities - Constrained Choices */}
            {gameState.quarterlyPriorities.length > 0 && (
              <Card className="border-2 border-amber-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-500" />
                      Quarterly Priorities
                    </div>
                    <Badge variant="outline">
                      {gameState.selectedPriorities.length} / {gameState.maxPrioritiesPerTurn} selected
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Choose {gameState.maxPrioritiesPerTurn} priorities for this quarter. Available funds: {formatCurrency(gameState.resources.funds)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {gameState.quarterlyPriorities.map((priority) => {
                      const isSelected = gameState.selectedPriorities.includes(priority.id);
                      const canAfford = gameState.resources.funds >= priority.cost;
                      const categoryColors = {
                        land: "amber",
                        air: "sky",
                        water: "blue",
                        self: "green",
                      };
                      
                      return (
                        <div
                          key={priority.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : canAfford 
                                ? 'border-border hover:border-primary/50 cursor-pointer' 
                                : 'border-border opacity-50'
                          }`}
                          onClick={() => !isSelected && canAfford && voteForPriority(priority.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{priority.name}</h4>
                              <Badge variant="outline" className="text-xs mt-1">
                                {priority.category.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="font-bold text-lg">{formatCurrency(priority.cost)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{priority.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {priority.benefits.map((b, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                +{b.value} {b.type}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Trade-off: {priority.tradeoff}
                          </p>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1 text-primary">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {gameState.selectedPriorities.length === gameState.maxPrioritiesPerTurn && (
                    <Button onClick={executeQuarterlyPriorities} className="w-full">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Execute Selected Priorities & Advance Quarter
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service Contracts */}
            {gameState.serviceContracts.filter(c => c.status === "open").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Open Service Contracts
                  </CardTitle>
                  <CardDescription>
                    Bid on contracts to earn funds and contribute to the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gameState.serviceContracts.filter(c => c.status === "open").map((contract) => (
                      <div key={contract.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{contract.title}</h4>
                            <p className="text-sm text-muted-foreground">{contract.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(contract.budget)}</p>
                            <p className="text-xs text-muted-foreground">{contract.deadline} turns</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">Required:</span>
                          {contract.requiredSkills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {ROLE_INFO[skill].name}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {contract.bids.length} bid(s) received
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => submitBid(contract.id, contract.budget * 0.9, "I can complete this project")}
                          >
                            Submit Bid
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Game Tabs */}
            <Tabs defaultValue="build" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="build">Build</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="economy">Economy</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>

              {/* Build Tab */}
              <TabsContent value="build" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Building Categories */}
                  {(["land", "air", "water", "self"] as const).map((category) => {
                    const categoryInfo = {
                      land: { name: "LAND", icon: Map, color: "amber" },
                      air: { name: "AIR", icon: Wind, color: "sky" },
                      water: { name: "WATER", icon: Droplets, color: "blue" },
                      self: { name: "SELF", icon: Heart, color: "green" },
                    }[category];
                    
                    const categoryBuildings = BUILDING_TYPES.filter(b => b.category === category);
                    const builtCount = getBuildingsByCategory(category).length;
                    
                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <categoryInfo.icon className={`w-5 h-5 text-${categoryInfo.color}-600`} />
                              {categoryInfo.name}
                            </div>
                            <Badge variant="outline">{builtCount} built</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {categoryBuildings.map((building) => {
                              const isBuilt = gameState.buildings.some(b => b.typeId === building.id);
                              const canAfford = gameState.resources.funds >= building.cost;
                              
                              return (
                                <div 
                                  key={building.id}
                                  className={`flex items-center justify-between p-2 rounded border ${
                                    isBuilt ? 'bg-green-50 dark:bg-green-950/20 border-green-200' : 'border-border'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <building.icon className="w-4 h-4" />
                                    <div>
                                      <p className="text-sm font-medium">{building.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(building.cost)} | {building.jobs} jobs
                                      </p>
                                    </div>
                                  </div>
                                  {isBuilt ? (
                                    <Badge variant="secondary">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Built
                                    </Badge>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      disabled={!canAfford}
                                      onClick={() => buildStructure(building.id)}
                                    >
                                      Build
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Community Tab */}
              <TabsContent value="community" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{gameState.communityName || "Unnamed Community"}</CardTitle>
                      <CardDescription>{gameState.communityMission || "No mission set"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Population Capacity</span>
                          <span className="font-bold">{totalCapacity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Jobs</span>
                          <span className="font-bold">{totalJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Upkeep</span>
                          <span className="font-bold">{formatCurrency(monthlyUpkeep)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Community Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Happiness</span>
                          <span>{gameState.happiness}%</span>
                        </div>
                        <Progress value={gameState.happiness} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sustainability</span>
                          <span>{gameState.sustainability}%</span>
                        </div>
                        <Progress value={gameState.sustainability} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Players</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {gameState.players.map((player) => (
                          <div key={player.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                            <div className="flex items-center gap-2">
                              {(() => { const RoleIcon = ROLE_INFO[player.role].icon; return <RoleIcon className="w-4 h-4" />; })()}
                              <span>{player.name}</span>
                            </div>
                            <Badge variant="outline">{ROLE_INFO[player.role].name}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Economy Tab */}
              <TabsContent value="economy" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Financial Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                          <span>Available Funds</span>
                          <span className="font-bold text-green-600">{formatCurrency(gameState.resources.funds)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                          <span>Monthly Expenses</span>
                          <span className="font-bold text-red-600">-{formatCurrency(monthlyUpkeep)}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-secondary/30 rounded">
                          <span>Buildings</span>
                          <span className="font-bold">{gameState.buildings.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Employment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Total Jobs Created</span>
                          <span className="font-bold">{totalJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Labor Pool</span>
                          <span className="font-bold">{gameState.resources.labor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Employment Rate</span>
                          <span className="font-bold">
                            {gameState.resources.labor > 0 
                              ? Math.min(100, Math.round((totalJobs / gameState.resources.labor) * 100))
                              : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Community Events
                    </CardTitle>
                    <CardDescription>
                      Random events will challenge and reward your community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={triggerEvent} disabled={!!gameState.currentEvent}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Trigger Random Event
                    </Button>
                    
                    {!gameState.currentEvent && (
                      <p className="text-sm text-muted-foreground mt-4">
                        No active event. Click above to trigger one.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Phase Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Phase: {gameState.phase}</p>
                    <p className="text-sm text-muted-foreground">
                      {gameState.phase === "startup" && "Pool resources and establish initial employment"}
                      {gameState.phase === "design" && "Plan your community layout and services"}
                      {gameState.phase === "build" && "Construct infrastructure and establish entities"}
                      {gameState.phase === "manage" && "Run operations, handle events, grow generationally"}
                    </p>
                  </div>
                  {gameState.phase !== "manage" && (
                    <Button onClick={advancePhase}>
                      Advance to Next Phase
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Quest Connection Info */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Quest Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the L.A.W.S. Quest single-player journey to unlock bonus starting resources 
                  in Community Builder. Your individual achievements contribute to collective success.
                </p>
                <Button variant="link" className="px-0 mt-2" asChild>
                  <Link href="/games/laws-quest">
                    Play L.A.W.S. Quest
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
