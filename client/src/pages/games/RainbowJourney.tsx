import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Users, Sparkles, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const COLORS = [
  { name: "Red", bg: "bg-red-500", border: "border-red-600", text: "text-red-500" },
  { name: "Orange", bg: "bg-orange-500", border: "border-orange-600", text: "text-orange-500" },
  { name: "Yellow", bg: "bg-yellow-500", border: "border-yellow-600", text: "text-yellow-500" },
  { name: "Green", bg: "bg-green-500", border: "border-green-600", text: "text-green-500" },
  { name: "Blue", bg: "bg-blue-500", border: "border-blue-600", text: "text-blue-500" },
  { name: "Purple", bg: "bg-purple-500", border: "border-purple-600", text: "text-purple-500" },
];

const BOARD_SIZE = 30;

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  colorIndex: number;
}

const PLAYER_TOKENS = ["🌟", "🌈", "🦋", "🌸"];

// Special spaces with bonuses or setbacks
const SPECIAL_SPACES: Record<number, { type: "bonus" | "setback"; message: string; move: number }> = {
  5: { type: "bonus", message: "You helped a friend! Move ahead 2 spaces!", move: 2 },
  8: { type: "setback", message: "Forgot to say please. Go back 1 space.", move: -1 },
  12: { type: "bonus", message: "Shared your toys! Jump ahead 3 spaces!", move: 3 },
  16: { type: "setback", message: "Didn't clean up. Go back 2 spaces.", move: -2 },
  20: { type: "bonus", message: "Said thank you! Move ahead 2 spaces!", move: 2 },
  24: { type: "setback", message: "Interrupted someone. Go back 1 space.", move: -1 },
  27: { type: "bonus", message: "Helped with chores! Almost there! +1 space!", move: 1 },
};

export default function RainbowJourney() {
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [spinResult, setSpinResult] = useState<typeof COLORS[0] | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [message, setMessage] = useState<string>("");
  const [playerCount, setPlayerCount] = useState(2);
  const [isPaused, setIsPaused] = useState(false);

  const initGame = useCallback((numPlayers: number) => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < numPlayers; i++) {
      newPlayers.push({
        id: i,
        name: `Player ${i + 1}`,
        position: 0,
        color: PLAYER_TOKENS[i],
        colorIndex: 0,
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setSpinResult(null);
    setWinner(null);
    setMessage("");
    setGameStarted(true);
    setIsPaused(false);
  }, []);

  const movePlayer = useCallback((color: typeof COLORS[0]) => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const player = { ...newPlayers[currentPlayerIndex] };
      
      // Find next space of this color
      let newPosition = player.position;
      for (let i = player.position + 1; i <= BOARD_SIZE; i++) {
        const spaceColorIndex = (i - 1) % COLORS.length;
        if (COLORS[spaceColorIndex].name === color.name) {
          newPosition = i;
          break;
        }
      }

      if (newPosition === player.position) {
        setMessage(`No ${color.name} spaces ahead. Stay here!`);
      } else {
        player.position = newPosition;
        
        // Check for special space
        if (SPECIAL_SPACES[newPosition]) {
          const special = SPECIAL_SPACES[newPosition];
          setMessage(special.message);
          if (special.type === "bonus") {
            toast.success(special.message);
          } else {
            toast.error(special.message);
          }
          player.position = Math.max(0, Math.min(BOARD_SIZE, newPosition + special.move));
        }
      }

      newPlayers[currentPlayerIndex] = player;

      // Check for winner
      if (player.position >= BOARD_SIZE) {
        player.position = BOARD_SIZE;
        setWinner(player);
        toast.success(`${player.name} wins!`);
      } else {
        // Next player's turn
        setTimeout(() => {
          setCurrentPlayerIndex((prev) => (prev + 1) % prevPlayers.length);
        }, 1500);
      }

      return newPlayers;
    });
  }, [currentPlayerIndex]);

  const spinWheel = useCallback(() => {
    if (isSpinning || winner || isPaused) return;

    setIsSpinning(true);
    setMessage("");

    // Animate spinning
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      setSpinResult(COLORS[Math.floor(Math.random() * COLORS.length)]);
      spinCount++;
      if (spinCount >= 15) {
        clearInterval(spinInterval);
        const finalColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setSpinResult(finalColor);
        movePlayer(finalColor);
        setIsSpinning(false);
      }
    }, 100);
  }, [isSpinning, winner, isPaused, movePlayer]);

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setSpinResult(null);
    setWinner(null);
    setMessage("");
    setIsPaused(false);
  };

  // Render the rainbow path
  const renderPath = () => {
    const cells = [];
    for (let i = 0; i <= BOARD_SIZE; i++) {
      const colorIndex = i === 0 ? -1 : (i - 1) % COLORS.length;
      const color = i === 0 ? null : COLORS[colorIndex];
      const playersOnCell = players.filter((p) => p.position === i);
      const isSpecial = SPECIAL_SPACES[i];

      cells.push(
        <div
          key={i}
          className={`
            relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center
            ${i === 0 ? "bg-muted border-2 border-dashed" : color?.bg}
            ${i === BOARD_SIZE ? "ring-4 ring-yellow-400" : ""}
            ${isSpecial ? "ring-2 ring-white" : ""}
            transition-all
          `}
        >
          {i === 0 && <span className="text-xs">Start</span>}
          {i === BOARD_SIZE && <span className="text-white text-xs font-bold">🏁</span>}
          {i > 0 && i < BOARD_SIZE && (
            <span className="text-white/70 text-xs font-medium">{i}</span>
          )}
          {isSpecial && (
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300" />
          )}
          {playersOnCell.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              {playersOnCell.map((p) => (
                <span key={p.id} className="text-2xl drop-shadow-lg">
                  {p.color}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <div className="max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Center
          </Button>

          <Card className="p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">🌈 Rainbow Journey</h1>
            <p className="text-muted-foreground mb-6">
              A colorful path game teaching colors and counting!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Number of Players
                </label>
                <div className="flex justify-center gap-2">
                  {[2, 3, 4].map((num) => (
                    <Button
                      key={num}
                      variant={playerCount === num ? "default" : "outline"}
                      onClick={() => setPlayerCount(num)}
                      className="w-12"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => initGame(playerCount)}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            </div>

            <div className="mt-6 text-left text-sm text-muted-foreground space-y-2">
              <p>🎨 Spin the wheel to get a color</p>
              <p>🚶 Move to the next space of that color</p>
              <p>✨ Land on special spaces for bonuses!</p>
              <p>🏁 First to reach the end wins!</p>
            </div>

            {/* Color preview */}
            <div className="mt-4 flex justify-center gap-1">
              {COLORS.map((c) => (
                <div
                  key={c.name}
                  className={`w-6 h-6 rounded ${c.bg}`}
                  title={c.name}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/game-center")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">🌈 Rainbow Journey</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isPaused && (
          <Card className="p-4 mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500">
            <p className="text-center font-medium">Game Paused</p>
          </Card>
        )}

        {winner ? (
          <Card className="p-8 text-center mb-4">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {winner.color} {winner.name} Wins!
            </h2>
            <p className="text-muted-foreground mb-4">
              You followed the rainbow to the end!
            </p>
            <Button onClick={resetGame}>Play Again</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Game Board */}
            <Card className="p-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {renderPath()}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spinner */}
              <Card className="p-6 text-center">
                <h3 className="font-semibold mb-4">Color Spinner</h3>
                <div
                  className={`
                    w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center
                    ${spinResult ? spinResult.bg : "bg-muted"}
                    ${isSpinning ? "animate-spin" : ""}
                    transition-all
                  `}
                >
                  {spinResult && (
                    <span className="text-white font-bold text-sm">
                      {spinResult.name}
                    </span>
                  )}
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={spinWheel}
                  disabled={isSpinning || isPaused}
                >
                  {isSpinning ? "Spinning..." : "Spin!"}
                </Button>
              </Card>

              {/* Players & Info */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">
                  {players[currentPlayerIndex]?.color} {players[currentPlayerIndex]?.name}'s Turn
                </h3>
                
                {message && (
                  <div className="p-3 bg-primary/10 rounded-lg mb-3 text-sm">
                    {message}
                  </div>
                )}

                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        index === currentPlayerIndex
                          ? "bg-primary/10 border border-primary/20"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{player.color}</span>
                        <span className="text-sm">{player.name}</span>
                      </div>
                      <span className="font-mono text-sm">
                        {player.position}/{BOARD_SIZE}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
