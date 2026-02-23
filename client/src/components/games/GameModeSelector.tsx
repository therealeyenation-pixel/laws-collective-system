import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, Wifi, Brain, Swords, Shield, Sparkles, GraduationCap, Home } from "lucide-react";

export type GameMode = "ai" | "local" | "online" | "intrasystem";
export type Difficulty = "easy" | "medium" | "hard";
export type AIPersonality = "balanced" | "aggressive" | "defensive" | "random" | "teaching";

interface GameModeSelectorProps {
  gameName: string;
  onStart: (config: GameConfig) => void;
  supportedModes?: GameMode[];
  supportsDifficulty?: boolean;
  supportsPersonality?: boolean;
  defaultDifficulty?: Difficulty;
  defaultPersonality?: AIPersonality;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  personality: AIPersonality;
  playerNames: [string, string];
}

const difficultyDescriptions: Record<Difficulty, string> = {
  easy: "Perfect for beginners. AI makes occasional mistakes.",
  medium: "Balanced challenge. AI plays strategically but not perfectly.",
  hard: "Expert level. AI uses advanced strategies to win.",
};

const personalityDescriptions: Record<AIPersonality, { name: string; desc: string; icon: React.ReactNode }> = {
  balanced: { name: "Balanced", desc: "Well-rounded play style", icon: <Brain className="w-4 h-4" /> },
  aggressive: { name: "Aggressive", desc: "Prioritizes attacking moves", icon: <Swords className="w-4 h-4" /> },
  defensive: { name: "Defensive", desc: "Focuses on blocking and safety", icon: <Shield className="w-4 h-4" /> },
  random: { name: "Unpredictable", desc: "Random moves for variety", icon: <Sparkles className="w-4 h-4" /> },
  teaching: { name: "Teaching", desc: "Explains moves and gives hints", icon: <GraduationCap className="w-4 h-4" /> },
};

export function GameModeSelector({
  gameName,
  onStart,
  supportedModes = ["ai", "local"],
  supportsDifficulty = true,
  supportsPersonality = true,
  defaultDifficulty = "medium",
  defaultPersonality = "balanced",
}: GameModeSelectorProps) {
  const [mode, setMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [personality, setPersonality] = useState<AIPersonality>(defaultPersonality);
  const [player1Name, setPlayer1Name] = useState("Player 1");
  const [player2Name, setPlayer2Name] = useState("Player 2");

  const handleStart = () => {
    onStart({
      mode,
      difficulty,
      personality,
      playerNames: [player1Name, mode === "ai" ? `AI (${personalityDescriptions[personality].name})` : player2Name],
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{gameName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Game Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {supportedModes.includes("ai") && (
              <Button
                variant={mode === "ai" ? "default" : "outline"}
                onClick={() => setMode("ai")}
                className="flex flex-col h-auto py-3 gap-1"
              >
                <Bot className="w-5 h-5" />
                <span className="text-xs">vs AI</span>
              </Button>
            )}
            {supportedModes.includes("local") && (
              <Button
                variant={mode === "local" ? "default" : "outline"}
                onClick={() => setMode("local")}
                className="flex flex-col h-auto py-3 gap-1"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">Local 2P</span>
              </Button>
            )}
            {supportedModes.includes("online") && (
              <Button
                variant={mode === "online" ? "default" : "outline"}
                onClick={() => setMode("online")}
                className="flex flex-col h-auto py-3 gap-1"
              >
                <Wifi className="w-5 h-5" />
                <span className="text-xs">Online</span>
              </Button>
            )}
            {supportedModes.includes("intrasystem") && (
              <Button
                variant={mode === "intrasystem" ? "default" : "outline"}
                onClick={() => setMode("intrasystem")}
                className="flex flex-col h-auto py-3 gap-1"
              >
                <Home className="w-5 h-5" />
                <span className="text-xs">L.A.W.S.</span>
              </Button>
            )}
          </div>
        </div>

        {/* AI Settings */}
        {mode === "ai" && (
          <>
            {/* Difficulty Selection */}
            {supportsDifficulty && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Easy</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-700">Hard</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{difficultyDescriptions[difficulty]}</p>
              </div>
            )}

            {/* AI Personality Selection */}
            {supportsPersonality && (
              <div className="space-y-3">
                <label className="text-sm font-medium">AI Personality</label>
                <Select value={personality} onValueChange={(v) => setPersonality(v as AIPersonality)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(personalityDescriptions).map(([key, { name, icon }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{personalityDescriptions[personality].desc}</p>
              </div>
            )}
          </>
        )}

        {/* Local 2P Player Names */}
        {mode === "local" && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Player Names</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Player 1"
                className="px-3 py-2 border rounded-md text-sm"
              />
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Player 2"
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {/* Online Mode */}
        {mode === "online" && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300 text-center">
              Online multiplayer coming soon! Join the waitlist to be notified.
            </p>
          </div>
        )}

        {/* Intrasystem Mode */}
        {mode === "intrasystem" && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
                L.A.W.S. Network Multiplayer
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Challenge other Houses, family members, or join system-wide tournaments!
              </p>
            </div>
            <Select defaultValue="house">
              <SelectTrigger>
                <SelectValue placeholder="Select challenge type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House vs House Challenge</SelectItem>
                <SelectItem value="family">Family Game Night</SelectItem>
                <SelectItem value="tournament">Join Tournament</SelectItem>
                <SelectItem value="random">Random L.A.W.S. Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Start Button */}
        <Button 
          onClick={handleStart} 
          className="w-full" 
          size="lg"
          disabled={mode === "online"}
        >
          {mode === "online" ? "Coming Soon" : "Start Game"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default GameModeSelector;
