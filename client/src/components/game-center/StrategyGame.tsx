import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Castle,
  Coins,
  Users,
  Shield,
  Sword,
  Heart,
  Star,
  Trophy,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  Building,
  Leaf,
  Droplets,
  Wind,
} from "lucide-react";

interface Resource {
  name: string;
  amount: number;
  maxAmount: number;
  icon: React.ReactNode;
  color: string;
}

interface Building {
  id: string;
  name: string;
  description: string;
  cost: { resource: string; amount: number }[];
  production: { resource: string; amount: number }[];
  level: number;
  maxLevel: number;
  icon: React.ReactNode;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  objective: string;
  reward: number;
  icon: React.ReactNode;
}

const scenarios: Scenario[] = [
  {
    id: "community-builder",
    title: "Community Builder",
    description: "Build a thriving community from scratch using L.A.W.S. principles",
    difficulty: "easy",
    objective: "Reach 100 population and positive resources",
    reward: 500,
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: "financial-fortress",
    title: "Financial Fortress",
    description: "Establish a financially sustainable organization",
    difficulty: "medium",
    objective: "Accumulate 10,000 coins while maintaining services",
    reward: 1000,
    icon: <Castle className="w-6 h-6" />,
  },
  {
    id: "legacy-builder",
    title: "Legacy Builder",
    description: "Create a multi-generational wealth structure",
    difficulty: "hard",
    objective: "Build all structures to max level",
    reward: 2500,
    icon: <Trophy className="w-6 h-6" />,
  },
];

export function StrategyGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [turn, setTurn] = useState(1);
  const [score, setScore] = useState(0);

  const [resources, setResources] = useState<Resource[]>([
    { name: "Coins", amount: 1000, maxAmount: 10000, icon: <Coins className="w-4 h-4" />, color: "text-yellow-500" },
    { name: "Land", amount: 50, maxAmount: 500, icon: <Leaf className="w-4 h-4" />, color: "text-green-500" },
    { name: "Water", amount: 100, maxAmount: 1000, icon: <Droplets className="w-4 h-4" />, color: "text-blue-500" },
    { name: "Knowledge", amount: 25, maxAmount: 500, icon: <Wind className="w-4 h-4" />, color: "text-purple-500" },
    { name: "Population", amount: 10, maxAmount: 1000, icon: <Users className="w-4 h-4" />, color: "text-orange-500" },
  ]);

  const [buildings, setBuildings] = useState<Building[]>([
    {
      id: "farm",
      name: "Community Farm",
      description: "Produces food and teaches sustainable agriculture",
      cost: [{ resource: "Coins", amount: 100 }, { resource: "Land", amount: 10 }],
      production: [{ resource: "Coins", amount: 20 }, { resource: "Knowledge", amount: 5 }],
      level: 0,
      maxLevel: 5,
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      id: "school",
      name: "Academy",
      description: "Educates community members and generates knowledge",
      cost: [{ resource: "Coins", amount: 200 }, { resource: "Knowledge", amount: 20 }],
      production: [{ resource: "Knowledge", amount: 15 }, { resource: "Population", amount: 2 }],
      level: 0,
      maxLevel: 5,
      icon: <Building className="w-5 h-5" />,
    },
    {
      id: "well",
      name: "Water Well",
      description: "Provides clean water to the community",
      cost: [{ resource: "Coins", amount: 150 }, { resource: "Land", amount: 5 }],
      production: [{ resource: "Water", amount: 25 }],
      level: 0,
      maxLevel: 5,
      icon: <Droplets className="w-5 h-5" />,
    },
    {
      id: "market",
      name: "Community Market",
      description: "Facilitates trade and generates income",
      cost: [{ resource: "Coins", amount: 300 }, { resource: "Population", amount: 20 }],
      production: [{ resource: "Coins", amount: 50 }],
      level: 0,
      maxLevel: 5,
      icon: <Coins className="w-5 h-5" />,
    },
    {
      id: "housing",
      name: "Housing Complex",
      description: "Provides shelter and attracts new residents",
      cost: [{ resource: "Coins", amount: 250 }, { resource: "Land", amount: 15 }, { resource: "Water", amount: 20 }],
      production: [{ resource: "Population", amount: 10 }],
      level: 0,
      maxLevel: 5,
      icon: <Castle className="w-5 h-5" />,
    },
    {
      id: "trust",
      name: "Family Trust",
      description: "Protects assets and ensures generational wealth",
      cost: [{ resource: "Coins", amount: 500 }, { resource: "Knowledge", amount: 50 }],
      production: [{ resource: "Coins", amount: 30 }, { resource: "Land", amount: 5 }],
      level: 0,
      maxLevel: 3,
      icon: <Shield className="w-5 h-5" />,
    },
  ]);

  const canAfford = (costs: { resource: string; amount: number }[]) => {
    return costs.every((cost) => {
      const resource = resources.find((r) => r.name === cost.resource);
      return resource && resource.amount >= cost.amount * (buildings.find(b => b.cost === costs)?.level || 0 + 1);
    });
  };

  const buildStructure = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (!building || building.level >= building.maxLevel) return;

    const levelMultiplier = building.level + 1;
    const costs = building.cost.map((c) => ({ ...c, amount: c.amount * levelMultiplier }));

    if (!canAfford(costs)) {
      toast.error("Not enough resources!");
      return;
    }

    // Deduct costs
    setResources((prev) =>
      prev.map((r) => {
        const cost = costs.find((c) => c.resource === r.name);
        return cost ? { ...r, amount: r.amount - cost.amount } : r;
      })
    );

    // Upgrade building
    setBuildings((prev) =>
      prev.map((b) => (b.id === buildingId ? { ...b, level: b.level + 1 } : b))
    );

    setScore(score + 100 * levelMultiplier);
    toast.success(`${building.name} upgraded to level ${building.level + 1}!`);
  };

  const endTurn = () => {
    // Collect production from all buildings
    const newResources = [...resources];
    
    buildings.forEach((building) => {
      if (building.level > 0) {
        building.production.forEach((prod) => {
          const resourceIndex = newResources.findIndex((r) => r.name === prod.resource);
          if (resourceIndex !== -1) {
            const newAmount = Math.min(
              newResources[resourceIndex].amount + prod.amount * building.level,
              newResources[resourceIndex].maxAmount
            );
            newResources[resourceIndex] = { ...newResources[resourceIndex], amount: newAmount };
          }
        });
      }
    });

    // Consume resources for population
    const population = newResources.find((r) => r.name === "Population");
    const water = newResources.find((r) => r.name === "Water");
    if (population && water) {
      const waterConsumption = Math.floor(population.amount / 10);
      water.amount = Math.max(0, water.amount - waterConsumption);
    }

    setResources(newResources);
    setTurn(turn + 1);
    setScore(score + 10);
    toast.success("Turn completed! Resources collected.");
  };

  const startGame = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setGameStarted(true);
    setTurn(1);
    setScore(0);
    setResources([
      { name: "Coins", amount: 1000, maxAmount: 10000, icon: <Coins className="w-4 h-4" />, color: "text-yellow-500" },
      { name: "Land", amount: 50, maxAmount: 500, icon: <Leaf className="w-4 h-4" />, color: "text-green-500" },
      { name: "Water", amount: 100, maxAmount: 1000, icon: <Droplets className="w-4 h-4" />, color: "text-blue-500" },
      { name: "Knowledge", amount: 25, maxAmount: 500, icon: <Wind className="w-4 h-4" />, color: "text-purple-500" },
      { name: "Population", amount: 10, maxAmount: 1000, icon: <Users className="w-4 h-4" />, color: "text-orange-500" },
    ]);
    setBuildings((prev) => prev.map((b) => ({ ...b, level: 0 })));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (gameStarted && selectedScenario) {
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">Turn {turn}</Badge>
            <Badge className={getDifficultyColor(selectedScenario.difficulty)}>
              {selectedScenario.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-bold">{score}</span>
            </span>
            <Button variant="outline" onClick={() => setGameStarted(false)}>
              Exit
            </Button>
          </div>
        </div>

        {/* Resources Bar */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-5 gap-4">
              {resources.map((resource) => (
                <div key={resource.name} className="text-center">
                  <div className={`flex items-center justify-center gap-1 ${resource.color}`}>
                    {resource.icon}
                    <span className="font-bold">{resource.amount}</span>
                  </div>
                  <Progress value={(resource.amount / resource.maxAmount) * 100} className="h-1 mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">{resource.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Objective */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{selectedScenario.title}</p>
                <p className="text-sm text-muted-foreground">{selectedScenario.objective}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buildings Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {buildings.map((building) => {
            const levelMultiplier = building.level + 1;
            const costs = building.cost.map((c) => ({ ...c, amount: c.amount * levelMultiplier }));
            const affordable = canAfford(costs);

            return (
              <Card key={building.id} className={building.level > 0 ? "border-primary/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {building.icon}
                    </div>
                    <Badge variant="outline">
                      Lv. {building.level}/{building.maxLevel}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{building.name}</CardTitle>
                  <CardDescription className="text-xs">{building.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {building.level > 0 && (
                    <div className="mb-2 p-2 bg-green-50 rounded text-xs">
                      <p className="font-medium text-green-700">Production/turn:</p>
                      {building.production.map((p, i) => (
                        <span key={i} className="text-green-600">
                          +{p.amount * building.level} {p.resource}{i < building.production.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {building.level < building.maxLevel && (
                    <>
                      <div className="text-xs text-muted-foreground mb-2">
                        Cost: {costs.map((c, i) => (
                          <span key={i} className={resources.find(r => r.name === c.resource)!.amount >= c.amount ? "" : "text-red-500"}>
                            {c.amount} {c.resource}{i < costs.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!affordable}
                        onClick={() => buildStructure(building.id)}
                      >
                        {building.level === 0 ? "Build" : "Upgrade"}
                      </Button>
                    </>
                  )}
                  
                  {building.level >= building.maxLevel && (
                    <Badge className="w-full justify-center bg-green-100 text-green-700">
                      Max Level
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* End Turn Button */}
        <Button className="w-full gap-2" size="lg" onClick={endTurn}>
          <ChevronRight className="w-5 h-5" />
          End Turn & Collect Resources
        </Button>
      </div>
    );
  }

  // Scenario Selection
  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <Castle className="w-12 h-12 mx-auto text-primary mb-4" />
        <h2 className="text-2xl font-bold">Strategy Builder</h2>
        <p className="text-muted-foreground">Build and manage your community using L.A.W.S. principles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => startGame(scenario)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {scenario.icon}
                </div>
                <Badge className={getDifficultyColor(scenario.difficulty)}>
                  {scenario.difficulty}
                </Badge>
              </div>
              <CardTitle className="mt-3">{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{scenario.objective}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reward</span>
                  <span className="font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    {scenario.reward} XP
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StrategyGame;
