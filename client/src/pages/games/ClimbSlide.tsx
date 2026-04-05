import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Trophy, Users, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Pause, Play } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const BOARD_SIZE = 100;
const GRID_SIZE = 10;

// Ladders (climb up) - good choices lead to advancement
const LADDERS: Record<number, { to: number; message: string }> = {
  4: { to: 14, message: "You helped a classmate! Climb up!" },
  9: { to: 31, message: "You finished your homework early! Great job!" },
  20: { to: 38, message: "You shared your lunch! Kindness pays off!" },
  28: { to: 84, message: "You studied hard for the test! Big reward!" },
  40: { to: 59, message: "You told the truth! Honesty is rewarded!" },
  51: { to: 67, message: "You cleaned your room without being asked!" },
  63: { to: 81, message: "You saved your allowance! Smart money choice!" },
  71: { to: 91, message: "You helped with family chores! Almost there!" },
};

// Snakes/Slides (slide down) - poor choices have consequences
const SLIDES: Record<number, { to: number; message: string }> = {
  17: { to: 7, message: "You didn't do your homework. Slide down!" },
  54: { to: 34, message: "You were unkind to a friend. Consequences!" },
  62: { to: 19, message: "You spent all your money on candy. Oops!" },
  64: { to: 60, message: "You forgot to say thank you. Small slip!" },
  87: { to: 24, message: "You told a lie. Big slide down!" },
  93: { to: 73, message: "You didn't share with your sibling." },
  95: { to: 75, message: "You broke a promise. Trust matters!" },
  99: { to: 78, message: "You were impatient. So close!" },
};

interface Player {
  id: number;
  name: string;
  position: number;
  color: string;
  emoji: string;
}

const PLAYER_COLORS = [
  { bg: "bg-red-500", text: "text-red-500" },
  { bg: "bg-blue-500", text: "text-blue-500" },
  { bg: "bg-green-500", text: "text-green-500" },
  { bg: "bg-purple-500", text: "text-purple-500" },
];

const PLAYER_EMOJIS = ["🦁", "🐯", "🐻", "🦊"];

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function ClimbSlide() {
  const [, setLocation] = useLocation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
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
        color: PLAYER_COLORS[i].bg,
        emoji: PLAYER_EMOJIS[i],
      });
    }
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setWinner(null);
    setMessage("");
    setGameStarted(true);
    setIsPaused(false);
  }, []);

  const getGridPosition = (position: number): { row: number; col: number } => {
    if (position === 0) return { row: -1, col: -1 };
    const adjustedPos = position - 1;
    const row = Math.floor(adjustedPos / GRID_SIZE);
    const col = row % 2 === 0 ? adjustedPos % GRID_SIZE : GRID_SIZE - 1 - (adjustedPos % GRID_SIZE);
    return { row: GRID_SIZE - 1 - row, col };
  };

  const movePlayer = useCallback((roll: number) => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const player = { ...newPlayers[currentPlayerIndex] };
      
      let newPosition = player.position + roll;
      
      // Can't go beyond 100
      if (newPosition > BOARD_SIZE) {
        setMessage(`Need exactly ${BOARD_SIZE - player.position} to win. Stay at ${player.position}.`);
        setTimeout(() => {
          setCurrentPlayerIndex((prev) => (prev + 1) % prevPlayers.length);
        }, 2000);
        return prevPlayers;
      }
      
      player.position = newPosition;
      
      // Check for ladder
      if (LADDERS[newPosition]) {
        const ladder = LADDERS[newPosition];
        setMessage(ladder.message);
        toast.success(ladder.message);
        player.position = ladder.to;
      }
      // Check for slide
      else if (SLIDES[newPosition]) {
        const slide = SLIDES[newPosition];
        setMessage(slide.message);
        toast.error(slide.message);
        player.position = slide.to;
      } else {
        setMessage(`${player.emoji} ${player.name} moved to ${newPosition}`);
      }
      
      newPlayers[currentPlayerIndex] = player;
      
      // Check for winner
      if (player.position === BOARD_SIZE) {
        setWinner(player);
        toast.success(`${player.name} wins!`);
      } else {
        setTimeout(() => {
          setCurrentPlayerIndex((prev) => (prev + 1) % prevPlayers.length);
        }, 2000);
      }
      
      return newPlayers;
    });
  }, [currentPlayerIndex]);

  const rollDice = useCallback(() => {
    if (isRolling || winner || isPaused) return;
    
    setIsRolling(true);
    setMessage("");
    
    // Animate dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        movePlayer(finalRoll);
        setIsRolling(false);
      }
    }, 100);
  }, [isRolling, winner, isPaused, movePlayer]);

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setWinner(null);
    setMessage("");
    setIsPaused(false);
  };

  const renderBoard = () => {
    const cells = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const actualRow = GRID_SIZE - 1 - row;
        const position = actualRow % 2 === 0
          ? actualRow * GRID_SIZE + col + 1
          : actualRow * GRID_SIZE + (GRID_SIZE - col);
        
        const playersOnCell = players.filter((p) => p.position === position);
        const isLadderStart = LADDERS[position];
        const isSlideStart = SLIDES[position];
        
        cells.push(
          <div
            key={position}
            className={`
              relative w-10 h-10 sm:w-12 sm:h-12 border border-border flex items-center justify-center
              ${isLadderStart ? "bg-green-100 dark:bg-green-900/30" : ""}
              ${isSlideStart ? "bg-red-100 dark:bg-red-900/30" : ""}
              ${position === BOARD_SIZE ? "bg-yellow-200 dark:bg-yellow-900/50" : ""}
            `}
          >
            <span className="text-xs text-muted-foreground">{position}</span>
            
            {isLadderStart && (
              <span className="absolute top-0 right-0 text-xs">🪜</span>
            )}
            {isSlideStart && (
              <span className="absolute top-0 right-0 text-xs">🛝</span>
            )}
            
            {playersOnCell.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                {playersOnCell.map((p) => (
                  <span key={p.id} className="text-lg drop-shadow-lg">
                    {p.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      }
    }
    
    return cells;
  };

  const DiceIcon = diceValue ? DiceIcons[diceValue - 1] : Dice1;

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
            <h1 className="text-3xl font-bold mb-2">🪜 Climb & Slide 🛝</h1>
            <p className="text-muted-foreground mb-6">
              Learn about choices and consequences in this classic game!
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
              <p>🎲 Roll the dice and move forward</p>
              <p>🪜 Land on a ladder to climb up (good choices!)</p>
              <p>🛝 Land on a slide to go down (learn from mistakes!)</p>
              <p>🏆 First to reach 100 wins!</p>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {PLAYER_EMOJIS.slice(0, 4).map((emoji, i) => (
                <span key={i} className="text-2xl">{emoji}</span>
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
          <h1 className="text-xl font-bold">🪜 Climb & Slide 🛝</h1>
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
              {winner.emoji} {winner.name} Wins!
            </h2>
            <p className="text-muted-foreground mb-4">
              Great job making it to 100!
            </p>
            <Button onClick={resetGame}>Play Again</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <Card className="p-4">
                <div className="grid grid-cols-10 gap-0.5">
                  {renderBoard()}
                </div>
              </Card>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Current Player */}
              <Card className="p-4 text-center">
                <h3 className="font-semibold mb-2">
                  {players[currentPlayerIndex]?.emoji} {players[currentPlayerIndex]?.name}'s Turn
                </h3>
                
                {/* Dice */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`
                      w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center
                      ${isRolling ? "animate-bounce" : ""}
                    `}
                  >
                    <DiceIcon className="w-12 h-12 text-primary" />
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={rollDice}
                  disabled={isRolling || isPaused}
                >
                  {isRolling ? "Rolling..." : "Roll Dice"}
                </Button>
                
                {message && (
                  <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                    {message}
                  </div>
                )}
              </Card>

              {/* Players */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Players</h3>
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
                        <span className="text-xl">{player.emoji}</span>
                        <span className="text-sm">{player.name}</span>
                      </div>
                      <span className="font-mono text-sm">
                        {player.position}/{BOARD_SIZE}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Legend */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Legend</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border rounded" />
                    <span>🪜 Ladder (climb up!)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border rounded" />
                    <span>🛝 Slide (go down)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900/50 border rounded" />
                    <span>🏆 Finish (100)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
