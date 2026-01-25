import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Users, Clock, Calendar, Award, 
  ChevronRight, Swords, Eye, Crown, Target,
  Timer, Zap, Medal, Star
} from "lucide-react";
import { toast } from "sonner";

interface Tournament {
  id: number;
  name: string;
  gameName: string;
  gameIcon?: string;
  tournamentType: string;
  ageGroup: string;
  maxParticipants: number;
  currentParticipants: number;
  entryFee: number;
  prizePool: number;
  status: "registration" | "in_progress" | "completed" | "cancelled";
  registrationDeadline?: string;
  startDate?: string;
}

interface Match {
  id: number;
  roundNumber: number;
  matchNumber: number;
  bracketPosition: string;
  player1Name?: string;
  player2Name?: string;
  player1Score: number;
  player2Score: number;
  status: string;
  spectatorCount: number;
}

// Mock data for demonstration
const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: "Weekly Chess Championship",
    gameName: "Chess",
    gameIcon: "♟️",
    tournamentType: "single_elimination",
    ageGroup: "all_ages",
    maxParticipants: 16,
    currentParticipants: 12,
    entryFee: 10,
    prizePool: 100,
    status: "registration",
    registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "Family Trivia Night",
    gameName: "Trivia",
    gameIcon: "🧠",
    tournamentType: "round_robin",
    ageGroup: "family",
    maxParticipants: 8,
    currentParticipants: 8,
    entryFee: 0,
    prizePool: 50,
    status: "in_progress",
    startDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Junior Checkers League",
    gameName: "Checkers",
    gameIcon: "⚫",
    tournamentType: "swiss",
    ageGroup: "k_5",
    maxParticipants: 12,
    currentParticipants: 10,
    entryFee: 0,
    prizePool: 25,
    status: "registration",
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockLiveMatches: Match[] = [
  {
    id: 1,
    roundNumber: 2,
    matchNumber: 1,
    bracketPosition: "R2M1",
    player1Name: "ChessMaster99",
    player2Name: "StrategyKing",
    player1Score: 1,
    player2Score: 0,
    status: "in_progress",
    spectatorCount: 15,
  },
  {
    id: 2,
    roundNumber: 1,
    matchNumber: 3,
    bracketPosition: "R1M3",
    player1Name: "TriviaWiz",
    player2Name: "QuizChamp",
    player1Score: 45,
    player2Score: 42,
    status: "in_progress",
    spectatorCount: 8,
  },
];

export function TournamentLobby() {
  const [activeTab, setActiveTab] = useState("open");
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const openTournaments = mockTournaments.filter(t => t.status === "registration");
  const liveTournaments = mockTournaments.filter(t => t.status === "in_progress");
  const completedTournaments = mockTournaments.filter(t => t.status === "completed");

  const handleRegister = (tournament: Tournament) => {
    toast.success(`Registered for ${tournament.name}!`);
  };

  const handleSpectate = (match: Match) => {
    toast.info(`Joining as spectator for ${match.player1Name} vs ${match.player2Name}`);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTimeUntil = (dateStr?: string) => {
    if (!dateStr) return "";
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff < 0) return "Started";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    const labels: Record<string, string> = {
      k_5: "K-5",
      "6_8": "6-8",
      "9_12": "9-12",
      adult: "Adult",
      all_ages: "All Ages",
      family: "Family",
    };
    return labels[ageGroup] || ageGroup;
  };

  const getTournamentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      single_elimination: "Single Elimination",
      double_elimination: "Double Elimination",
      round_robin: "Round Robin",
      swiss: "Swiss System",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openTournaments.length}</p>
              <p className="text-xs text-muted-foreground">Open Tournaments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Swords className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{liveTournaments.length}</p>
              <p className="text-xs text-muted-foreground">Live Now</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockLiveMatches.reduce((sum, m) => sum + m.spectatorCount, 0)}</p>
              <p className="text-xs text-muted-foreground">Spectators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockTournaments.reduce((sum, t) => sum + t.prizePool, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Prizes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="open" className="gap-2">
            <Target className="w-4 h-4" />
            Open
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Zap className="w-4 h-4" />
            Live
          </TabsTrigger>
          <TabsTrigger value="spectate" className="gap-2">
            <Eye className="w-4 h-4" />
            Spectate
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Medal className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Open Tournaments */}
        <TabsContent value="open" className="space-y-4 mt-4">
          {openTournaments.length === 0 ? (
            <Card className="p-8 text-center">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Open Tournaments</h3>
              <p className="text-muted-foreground">Check back later for new tournaments!</p>
            </Card>
          ) : (
            openTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{tournament.gameIcon || "🎮"}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{tournament.name}</h3>
                        <p className="text-sm text-muted-foreground">{tournament.gameName}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">{getTournamentTypeLabel(tournament.tournamentType)}</Badge>
                          <Badge variant="secondary">{getAgeGroupLabel(tournament.ageGroup)}</Badge>
                          {tournament.entryFee > 0 && (
                            <Badge className="bg-amber-500/20 text-amber-700">{tournament.entryFee} tokens</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        {getTimeUntil(tournament.registrationDeadline)}
                      </div>
                      <Button onClick={() => handleRegister(tournament)} className="gap-2">
                        Register <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tournament.currentParticipants}/{tournament.maxParticipants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          {tournament.prizePool} tokens
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(tournament.startDate)}
                        </span>
                      </div>
                      <Progress 
                        value={(tournament.currentParticipants / tournament.maxParticipants) * 100} 
                        className="w-24 h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Live Tournaments */}
        <TabsContent value="live" className="space-y-4 mt-4">
          {liveTournaments.length === 0 ? (
            <Card className="p-8 text-center">
              <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Live Tournaments</h3>
              <p className="text-muted-foreground">No tournaments are currently in progress.</p>
            </Card>
          ) : (
            liveTournaments.map((tournament) => (
              <Card key={tournament.id} className="border-green-500/30 bg-green-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="text-3xl">{tournament.gameIcon || "🎮"}</div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tournament.name}</h3>
                        <p className="text-sm text-muted-foreground">{tournament.gameName} • {getTournamentTypeLabel(tournament.tournamentType)}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">LIVE</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {tournament.currentParticipants} players
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        {tournament.prizePool} tokens
                      </span>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedTournament(tournament)} className="gap-2">
                      <Eye className="w-4 h-4" /> View Bracket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Spectate Matches */}
        <TabsContent value="spectate" className="space-y-4 mt-4">
          <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold">Spectator Mode</h3>
                <p className="text-sm text-muted-foreground">Watch live matches and learn from other players!</p>
              </div>
            </div>
          </Card>

          {mockLiveMatches.length === 0 ? (
            <Card className="p-8 text-center">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Live Matches</h3>
              <p className="text-muted-foreground">Check back when tournaments are in progress.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {mockLiveMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-semibold">{match.player1Name}</p>
                          <p className="text-2xl font-bold text-primary">{match.player1Score}</p>
                        </div>
                        <div className="text-muted-foreground font-bold">VS</div>
                        <div className="text-center">
                          <p className="font-semibold">{match.player2Name}</p>
                          <p className="text-2xl font-bold text-primary">{match.player2Score}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Eye className="w-4 h-4" />
                          {match.spectatorCount} watching
                        </div>
                        <Button onClick={() => handleSpectate(match)} className="gap-2">
                          <Eye className="w-4 h-4" /> Watch
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-muted-foreground">
                      <span>Round {match.roundNumber} • Match {match.matchNumber}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                        In Progress
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tournament History */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="p-8 text-center">
            <Medal className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Tournament History</h3>
            <p className="text-muted-foreground mb-4">Track your tournament performances and achievements.</p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Crown className="w-6 h-6 mx-auto text-amber-500 mb-1" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Trophy className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Participated</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Star className="w-6 h-6 mx-auto text-purple-500 mb-1" />
                <p className="text-xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Tokens Won</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
