import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Gamepad2,
  Trophy,
  Users,
  Star,
  Crown,
  Target,
  Brain,
  Puzzle,
  BookOpen,
  Swords,
  Sparkles,
  Medal,
  Flame,
  Clock,
  Play,
  ChevronRight,
  Loader2,
  Grid3X3,
  Heart,
  Spade,
  Search,
  Key,
  TrendingUp,
  Hash,
  Lightbulb,
  Bug,
  Ship,
  Building,
  Circle,
  CircleDot,
  ArrowUpDown,
  Rainbow,
  Music,
  Leaf,
  Book,
  Globe,
  DollarSign,
  FlaskConical,
  Award,
} from "lucide-react";
import { Link } from "wouter";

const gameIcons: Record<string, React.ReactNode> = {
  crown: <Crown className="w-6 h-6" />,
  grid: <Grid3X3 className="w-6 h-6" />,
  brain: <Brain className="w-6 h-6" />,
  puzzle: <Puzzle className="w-6 h-6" />,
  search: <Search className="w-6 h-6" />,
  key: <Key className="w-6 h-6" />,
  lock: <Key className="w-6 h-6" />,
  "trending-up": <TrendingUp className="w-6 h-6" />,
  hash: <Hash className="w-6 h-6" />,
  lightbulb: <Lightbulb className="w-6 h-6" />,
  spade: <Spade className="w-6 h-6" />,
  bug: <Bug className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  ship: <Ship className="w-6 h-6" />,
  building: <Building className="w-6 h-6" />,
  text: <BookOpen className="w-6 h-6" />,
  "grid-3x3": <Grid3X3 className="w-6 h-6" />,
  circle: <Circle className="w-6 h-6" />,
  "circle-dot": <CircleDot className="w-6 h-6" />,
  ladder: <ArrowUpDown className="w-6 h-6" />,
  rainbow: <Rainbow className="w-6 h-6" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  "dollar-sign": <DollarSign className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  book: <Book className="w-5 h-5" />,
  flask: <FlaskConical className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
};

const ageGroupLabels: Record<string, string> = {
  k_5: "House of Wonder (K-5)",
  "6_8": "House of Form (6-8)",
  "9_12": "House of Mastery (9-12)",
  adult: "Adult",
  all_ages: "All Ages",
  family: "Family",
};

const gameTypeLabels: Record<string, string> = {
  strategy: "Strategy",
  puzzle: "Puzzle",
  word: "Word Games",
  card: "Card Games",
  board: "Board Games",
  trivia: "Trivia",
  mystery: "Mystery",
  educational: "Educational",
};

export default function GameCenter() {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [selectedGameType, setSelectedGameType] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = trpc.gameCenter.getStats.useQuery();
  const { data: games, isLoading: gamesLoading } = trpc.gameCenter.getGames.useQuery(
    selectedAgeGroup !== "all" ? { ageGroup: selectedAgeGroup } : undefined
  );
  const { data: tournaments } = trpc.gameCenter.getTournaments.useQuery({ status: "registration" });
  const { data: triviaCategories } = trpc.gameCenter.getTriviaCategories.useQuery();

  const seedGamesMutation = trpc.gameCenter.seedGames.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const seedTriviaMutation = trpc.gameCenter.seedTriviaCategories.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredGames = games?.filter((game) => {
    if (selectedGameType !== "all" && game.gameType !== selectedGameType) return false;
    return true;
  });

  // List of fully implemented and testable games
  const implementedGames = new Set([
    "tic-tac-toe",
    "memory-match",
    "connect-four",
    "sudoku",
    "word-search",
    "hangman",
    "snake",
    "checkers",
    "2048",
    "chess",
    "battleship",
    "solitaire",
    "laws-quest",
    "laws-quest-unified",
    "dual-path-journey",
    "sovereignty-journey",
    "business-tycoon",
    "stock-sim",
    "property-empire",
    "startup-sim",
    "rainbow-journey",
    "logic-puzzles",
    "spider-solitaire",
    "word-forge",
    "crossword-master",
    "climb-slide",
    "escape-rooms",
    "detective-academy",
    "rubiks-cube",
    "spades",
    "yahtzee",
    "scrabble",
    "dominoes",
    "mancala",
    "mahjong-solitaire",
    "backgammon",
    "tangram",
    "word-ladder",
    "trivia-challenge",
    "simon-says",
    "community-builder",
  ]);

  const isGameImplemented = (slug: string) => implementedGames.has(slug);

  const handlePlayGame = (gameSlug: string) => {
    // Route to implemented games
    const gameRoutes: Record<string, string> = {
      "stock-sim": "/games/financial-literacy",
      "property-empire": "/games/financial-literacy",
      "business-tycoon": "/games/business-tycoon",
      "startup-sim": "/games/business-tycoon",
      "tic-tac-toe": "/games/tic-tac-toe",
      "memory-match": "/games/memory-match",
      "connect-four": "/games/connect-four",
      "sudoku": "/games/sudoku",
      "word-search": "/games/word-search",
      "hangman": "/games/hangman",
      "snake": "/games/snake",
      "checkers": "/games/checkers",
      "2048": "/games/2048",
      "chess": "/games/chess",
      "battleship": "/games/battleship",
      "solitaire": "/games/solitaire",
      "laws-quest": "/games/laws-quest",
      "laws-quest-unified": "/games/laws-quest-unified",
      "dual-path-journey": "/games/dual-path-journey",
      "sovereignty-journey": "/games/sovereignty-journey",
      "rainbow-journey": "/games/rainbow-journey",
      "logic-puzzles": "/games/logic-puzzles",
      "spider-solitaire": "/games/spider-solitaire",
      "word-forge": "/games/word-forge",
      "crossword-master": "/games/crossword-master",
      "climb-slide": "/games/climb-slide",
      "escape-rooms": "/games/escape-room",
      "detective-academy": "/games/detective-academy",
      "rubiks-cube": "/games/rubiks-cube",
      "spades": "/games/spades",
      "yahtzee": "/games/yahtzee",
      "scrabble": "/games/scrabble",
      "dominoes": "/games/dominoes",
      "mancala": "/games/mancala",
      "mahjong-solitaire": "/games/mahjong-solitaire",
      "backgammon": "/games/backgammon",
      "tangram": "/games/tangram",
      "word-ladder": "/games/word-ladder",
      "trivia-challenge": "/games/trivia-challenge",
      "simon-says": "/games/simon-says",
      "community-builder": "/games/community-builder",
    };
    
    if (gameRoutes[gameSlug]) {
      window.location.href = gameRoutes[gameSlug];
      return;
    }
    toast.info(`Game "${gameSlug}" coming soon! Full gameplay implementation in progress.`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-primary" />
              Game Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Strategic thinking games for all ages - earn tokens while you learn!
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/gaming-dashboard">
              <Button variant="outline" className="gap-2">
                <Target className="w-4 h-4 text-green-500" />
                My Progress
              </Button>
            </Link>
            <Link href="/team-sessions">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Team Sessions
              </Button>
            </Link>
            <Link href="/achievements">
              <Button variant="outline" className="gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                Achievements
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => seedGamesMutation.mutate()}
              disabled={seedGamesMutation.isPending}
            >
              {seedGamesMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Seed Games
            </Button>
            <Button
              variant="outline"
              onClick={() => seedTriviaMutation.mutate()}
              disabled={seedTriviaMutation.isPending}
            >
              {seedTriviaMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              Seed Trivia
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalGames}</p>
                    <p className="text-sm text-muted-foreground">Total Games</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeTournaments}</p>
                    <p className="text-sm text-muted-foreground">Active Tournaments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Brain className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.triviaCategories}</p>
                    <p className="text-sm text-muted-foreground">Trivia Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.triviaQuestions}</p>
                    <p className="text-sm text-muted-foreground">Trivia Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="games">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="tournaments">
              <Trophy className="w-4 h-4 mr-2" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger value="trivia">
              <Brain className="w-4 h-4 mr-2" />
              Knowledge Quest
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Medal className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="k_5">House of Wonder (K-5)</SelectItem>
                  <SelectItem value="6_8">House of Form (6-8)</SelectItem>
                  <SelectItem value="9_12">House of Mastery (9-12)</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedGameType} onValueChange={setSelectedGameType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Game Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="puzzle">Puzzle</SelectItem>
                  <SelectItem value="word">Word Games</SelectItem>
                  <SelectItem value="card">Card Games</SelectItem>
                  <SelectItem value="board">Board Games</SelectItem>
                  <SelectItem value="trivia">Trivia</SelectItem>
                  <SelectItem value="mystery">Mystery</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Games Grid */}
            {gamesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredGames && filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((game) => (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {gameIcons[game.icon || "puzzle"] || <Puzzle className="w-6 h-6" />}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{game.name}</CardTitle>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {isGameImplemented(game.slug) ? (
                                <Badge className="text-xs bg-green-500 hover:bg-green-600">
                                  ✓ Ready to Play
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  Coming Soon
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {gameTypeLabels[game.gameType]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>
                            {game.minPlayers === game.maxPlayers
                              ? `${game.minPlayers} player`
                              : `${game.minPlayers}-${game.maxPlayers} players`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{game.estimatedDuration}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium">+{game.tokenRewardBase} tokens</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handlePlayGame(game.slug)}
                          variant={isGameImplemented(game.slug) ? "default" : "outline"}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Play
                        </Button>
                      </div>

                      {game.skillsTargeted ? (
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const skills: string[] = Array.isArray(game.skillsTargeted)
                              ? game.skillsTargeted as string[]
                              : typeof game.skillsTargeted === "string"
                              ? JSON.parse(game.skillsTargeted)
                              : [];
                            return skills.slice(0, 3).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill.replace(/-/g, " ")}
                              </Badge>
                            ));
                          })()}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Games Found</h3>
                <p className="text-muted-foreground mt-2">
                  Click "Seed Games" to populate the game library.
                </p>
              </Card>
            )}

            {/* Age Group Sections */}
            {!gamesLoading && games && games.length > 0 && selectedAgeGroup === "all" && (
              <div className="space-y-8 mt-8">
                {["k_5", "6_8", "9_12"].map((ageGroup) => {
                  const ageGames = games.filter((g) => g.ageGroup === ageGroup);
                  if (ageGames.length === 0) return null;
                  
                  return (
                    <div key={ageGroup}>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        {ageGroup === "k_5" && <Rainbow className="w-5 h-5 text-pink-500" />}
                        {ageGroup === "6_8" && <Puzzle className="w-5 h-5 text-blue-500" />}
                        {ageGroup === "9_12" && <Crown className="w-5 h-5 text-amber-500" />}
                        {ageGroupLabels[ageGroup]}
                        <Badge variant="secondary">{ageGames.length} games</Badge>
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ageGames.slice(0, 4).map((game) => (
                          <Card
                            key={game.id}
                            className="p-4 cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handlePlayGame(game.slug)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {gameIcons[game.icon || "puzzle"] || <Puzzle className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{game.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  +{game.tokenRewardBase} tokens
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Tournaments</h2>
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </div>

            {tournaments && tournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{tournament.name}</CardTitle>
                          <CardDescription>{tournament.description}</CardDescription>
                        </div>
                        <Badge
                          variant={tournament.status === "registration" ? "default" : "secondary"}
                        >
                          {tournament.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Participants</span>
                        <span>
                          {tournament.currentParticipants}/{tournament.maxParticipants}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((tournament.currentParticipants || 0) /
                            (tournament.maxParticipants || 1)) *
                          100
                        }
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium">
                            Prize: {tournament.prizePool} tokens
                          </span>
                        </div>
                        <Button size="sm">Join Tournament</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Active Tournaments</h3>
                <p className="text-muted-foreground mt-2">
                  Create a tournament to start competing!
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Trivia Tab */}
          <TabsContent value="trivia" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Knowledge Quest</h2>
                <p className="text-muted-foreground">
                  Test your knowledge with L.A.W.S.-themed trivia categories
                </p>
              </div>
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Quick Play
              </Button>
            </div>

            {triviaCategories && triviaCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triviaCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ borderLeftColor: category.color || "#888", borderLeftWidth: 4 }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {categoryIcons[category.icon || "book"] || (
                            <BookOpen className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Trivia Categories</h3>
                <p className="text-muted-foreground mt-2">
                  Click "Seed Trivia" to populate the categories.
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Players</h2>
              <Select defaultValue="wins">
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wins">Most Wins</SelectItem>
                  <SelectItem value="rating">Highest Rating</SelectItem>
                  <SelectItem value="tokens">Most Tokens</SelectItem>
                  <SelectItem value="streak">Best Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Medal className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Leaderboard Coming Soon</h3>
                  <p className="text-muted-foreground mt-2">
                    Start playing games to appear on the leaderboard!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Family Play Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Family Game Night</CardTitle>
                <CardDescription>
                  Play together across generations - grandparents vs grandchildren!
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Cross-Generational Matches</p>
                  <p className="text-sm text-muted-foreground">Challenge family members</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Family Tournaments</p>
                  <p className="text-sm text-muted-foreground">Compete as a family</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Shared Leaderboards</p>
                  <p className="text-sm text-muted-foreground">Track family progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
