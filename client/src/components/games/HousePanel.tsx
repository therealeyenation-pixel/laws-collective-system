/**
 * L.A.W.S. Quest - House Building Panel
 * Manage your family legacy and House progression
 * 
 * Product of The The The L.A.W.S. Collective, LLC
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Home, 
  Crown, 
  Coins, 
  TreePine, 
  BookOpen, 
  Heart,
  Shield,
  Star,
  Trophy,
  Scroll,
  Users,
  Map,
  Sparkles,
  Plus,
  Lock,
  Check,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import {
  House,
  HouseLevel,
  LandHolding,
  Tradition,
  HouseMilestone,
  HOUSE_LEVELS,
  LAND_HOLDING_TYPES,
  TRADITION_TEMPLATES,
  MILESTONE_DEFINITIONS,
  createNewHouse,
  getHouseLevel,
  getNextHouseLevel,
  calculateHouseIncome,
  canPurchaseLandHolding,
  purchaseLandHolding,
  establishTradition,
  practiceTradition,
  checkMilestones,
  awardMilestone,
  calculateHouseStats,
} from "@/lib/laws-quest/house-system";

interface HousePanelProps {
  house: House | null;
  playerTokens: number;
  playerLevel: number;
  onCreateHouse: (house: House) => void;
  onUpdateHouse: (house: House) => void;
  onSpendTokens: (amount: number) => boolean;
}

export default function HousePanel({
  house,
  playerTokens,
  playerLevel,
  onCreateHouse,
  onUpdateHouse,
  onSpendTokens,
}: HousePanelProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [houseName, setHouseName] = useState("");
  const [houseMotto, setHouseMotto] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");

  // Create new house
  const handleCreateHouse = () => {
    if (!houseName.trim()) {
      toast.error("Please enter a House name");
      return;
    }
    if (!houseMotto.trim()) {
      toast.error("Please enter a House motto");
      return;
    }

    const newHouse = createNewHouse(
      houseName.trim(),
      houseMotto.trim(),
      "player-1",
      "Founder"
    );
    onCreateHouse(newHouse);
    setShowCreateDialog(false);
    setHouseName("");
    setHouseMotto("");
    toast.success(`House ${houseName} has been founded!`);
  };

  // Purchase land holding
  const handlePurchaseLand = (holdingTypeId: string) => {
    if (!house) return;
    
    const holdingType = LAND_HOLDING_TYPES.find(t => t.id === holdingTypeId);
    if (!holdingType) return;

    const check = canPurchaseLandHolding(house, holdingType);
    if (!check.canPurchase) {
      toast.error(check.reason);
      return;
    }

    const updatedHouse = purchaseLandHolding(house, holdingTypeId);
    onUpdateHouse(updatedHouse);
    toast.success(`Acquired ${holdingType.name}!`);
  };

  // Establish tradition
  const handleEstablishTradition = (templateId: string) => {
    if (!house) return;

    const template = TRADITION_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    if (house.level < template.requiredHouseLevel) {
      toast.error(`Requires House Level ${template.requiredHouseLevel}`);
      return;
    }

    const updatedHouse = establishTradition(house, templateId);
    onUpdateHouse(updatedHouse);
    toast.success(`Established tradition: ${template.name}`);
  };

  // Practice tradition
  const handlePracticeTradition = (traditionId: string) => {
    if (!house) return;

    const updatedHouse = practiceTradition(house, traditionId);
    onUpdateHouse(updatedHouse);
    toast.success("Tradition practiced! Strength increased.");
  };

  // Deposit tokens to treasury
  const handleDepositTokens = (amount: number) => {
    if (!house) return;
    if (playerTokens < amount) {
      toast.error("Insufficient tokens");
      return;
    }

    if (onSpendTokens(amount)) {
      const updatedHouse = {
        ...house,
        treasury: house.treasury + amount,
        experience: house.experience + Math.floor(amount / 10),
      };
      onUpdateHouse(updatedHouse);
      toast.success(`Deposited ${amount} tokens to House treasury`);
    }
  };

  // No house yet - show creation prompt
  if (!house) {
    return (
      <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <Home className="w-10 h-10 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Found Your House</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a House to begin building your family legacy.
              Houses unlock at Level 5.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={playerLevel < 5}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {playerLevel < 5 ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Unlocks at Level 5
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Found House
              </>
            )}
          </Button>

          {/* Create House Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Found Your House
                </DialogTitle>
                <DialogDescription>
                  A House represents your family legacy. Choose wisely.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">House Name</label>
                  <Input
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    placeholder="House of..."
                    maxLength={30}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">House Motto</label>
                  <Input
                    value={houseMotto}
                    onChange={(e) => setHouseMotto(e.target.value)}
                    placeholder="Our legacy endures..."
                    maxLength={50}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateHouse}>
                  Found House
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // House exists - show full panel
  const houseLevel = getHouseLevel(house.experience);
  const nextLevel = getNextHouseLevel(house.level);
  const houseStats = calculateHouseStats(house);
  const dailyIncome = calculateHouseIncome(house);
  const newMilestones = checkMilestones(house);

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-2xl">
              {house.crest.symbol}
            </div>
            <div>
              <CardTitle className="text-lg">{house.name}</CardTitle>
              <CardDescription className="italic">"{house.motto}"</CardDescription>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800">
            <Crown className="w-3 h-3 mr-1" />
            {houseLevel.name}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Level Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Level {house.level}</span>
            {nextLevel && (
              <span className="text-muted-foreground">
                {house.experience} / {nextLevel.requiredExperience} XP
              </span>
            )}
          </div>
          <Progress 
            value={nextLevel ? (house.experience / nextLevel.requiredExperience) * 100 : 100} 
            className="h-2" 
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center p-2 bg-amber-50 rounded">
            <Coins className="w-4 h-4 mx-auto text-amber-600" />
            <p className="text-xs text-muted-foreground">Treasury</p>
            <p className="font-bold text-sm">{house.treasury}</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <TreePine className="w-4 h-4 mx-auto text-green-600" />
            <p className="text-xs text-muted-foreground">Daily</p>
            <p className="font-bold text-sm">+{dailyIncome}</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <Map className="w-4 h-4 mx-auto text-blue-600" />
            <p className="text-xs text-muted-foreground">Land</p>
            <p className="font-bold text-sm">{house.landHoldings.length}</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <Scroll className="w-4 h-4 mx-auto text-purple-600" />
            <p className="text-xs text-muted-foreground">Traditions</p>
            <p className="font-bold text-sm">{house.traditions.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="land">Land</TabsTrigger>
            <TabsTrigger value="traditions">Traditions</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* House Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">Prosperity</span>
                </div>
                <p className="text-xl font-bold">{houseStats.prosperity}</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  <span className="text-sm font-medium">Wisdom</span>
                </div>
                <p className="text-xl font-bold">{houseStats.wisdom}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Harmony</span>
                </div>
                <p className="text-xl font-bold">{houseStats.harmony}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Legacy</span>
                </div>
                <p className="text-xl font-bold">{houseStats.legacy}</p>
              </div>
            </div>

            {/* Deposit Tokens */}
            <div className="p-3 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Contribute to Treasury</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDepositTokens(10)}
                  disabled={playerTokens < 10}
                >
                  +10
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDepositTokens(50)}
                  disabled={playerTokens < 50}
                >
                  +50
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDepositTokens(100)}
                  disabled={playerTokens < 100}
                >
                  +100
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your tokens: {playerTokens}
              </p>
            </div>

            {/* Next Level Unlocks */}
            {nextLevel && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Level {nextLevel.level} Unlocks
                </h4>
                <div className="flex flex-wrap gap-1">
                  {nextLevel.unlocks.map((unlock, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {unlock}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Land Tab */}
          <TabsContent value="land" className="mt-4 space-y-3">
            {/* Current Holdings */}
            {house.landHoldings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Your Holdings</h4>
                {house.landHoldings.map((holding) => (
                  <div key={holding.id} className="p-2 bg-green-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{holding.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Level {holding.level} • +{holding.income - holding.maintenanceCost}/day
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Available Holdings */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Available</h4>
              {LAND_HOLDING_TYPES.map((type) => {
                const canBuy = canPurchaseLandHolding(house, type);
                const owned = house.landHoldings.some(h => h.type === type.id);
                
                return (
                  <div 
                    key={type.id} 
                    className={`p-3 rounded border ${
                      owned ? "bg-green-50 border-green-200" : 
                      canBuy.canPurchase ? "bg-white hover:bg-gray-50" : 
                      "bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm flex items-center gap-2">
                          {type.name}
                          {owned && <Check className="w-4 h-4 text-green-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Coins className="w-3 h-3 mr-1" />
                            {type.baseCost}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-green-600">
                            +{type.baseIncome}/day
                          </Badge>
                        </div>
                      </div>
                      {!owned && (
                        <Button
                          size="sm"
                          onClick={() => handlePurchaseLand(type.id)}
                          disabled={!canBuy.canPurchase}
                        >
                          {house.level < type.requiredHouseLevel ? (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Lvl {type.requiredHouseLevel}
                            </>
                          ) : (
                            "Buy"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Traditions Tab */}
          <TabsContent value="traditions" className="mt-4 space-y-3">
            {/* Current Traditions */}
            {house.traditions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Established Traditions</h4>
                {house.traditions.map((tradition) => (
                  <div key={tradition.id} className="p-3 bg-purple-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{tradition.name}</p>
                        <p className="text-xs text-muted-foreground">{tradition.description}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Strength</span>
                            <span>{tradition.strength}%</span>
                          </div>
                          <Progress value={tradition.strength} className="h-1" />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePracticeTradition(tradition.id)}
                      >
                        Practice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Traditions */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Available Traditions</h4>
              {TRADITION_TEMPLATES.filter(t => 
                !house.traditions.some(ht => ht.name === t.name)
              ).map((template) => {
                const canEstablish = house.level >= template.requiredHouseLevel;
                
                return (
                  <div 
                    key={template.id} 
                    className={`p-3 rounded border ${
                      canEstablish ? "bg-white hover:bg-gray-50" : "bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {template.realm.toUpperCase()} • {template.type}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEstablishTradition(template.id)}
                        disabled={!canEstablish}
                      >
                        {canEstablish ? "Establish" : `Lvl ${template.requiredHouseLevel}`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="mt-4 space-y-3">
            {/* Achieved */}
            {house.milestones.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Achieved</h4>
                {house.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-2 bg-amber-50 rounded flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-sm">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">In Progress</h4>
              {MILESTONE_DEFINITIONS.filter(m => 
                !house.milestones.some(hm => hm.id === m.id)
              ).slice(0, 5).map((milestone) => (
                <div key={milestone.id} className="p-2 bg-gray-50 rounded flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  <div>
                    <p className="font-medium text-sm">{milestone.name}</p>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* New Milestones Available */}
            {newMilestones.length > 0 && (
              <div className="p-3 bg-amber-100 rounded-lg border border-amber-300">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  New Milestones Available!
                </h4>
                {newMilestones.map((m) => (
                  <Button
                    key={m.id}
                    size="sm"
                    className="w-full mb-1"
                    onClick={() => {
                      const updated = awardMilestone(house, m.id);
                      onUpdateHouse(updated);
                      toast.success(`Milestone achieved: ${m.name}!`);
                    }}
                  >
                    Claim: {m.name}
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
