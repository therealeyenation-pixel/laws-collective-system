import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Play, Pause, ArrowUp, ArrowDown, ArrowLeftIcon, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function Snake() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("RIGHT");
    directionRef.current = "RIGHT";
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  }, [generateFood]);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        // Increase speed every 50 points
        if ((score + 10) % 50 === 0) {
          setSpeed((prev) => Math.max(prev - 10, 50));
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, generateFood, highScore, score]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [isPlaying, gameOver, moveSnake, speed]);

  // Handle game over
  useEffect(() => {
    if (gameOver) {
      toast.error(`Game Over! Score: ${score}`);
    }
  }, [gameOver, score]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying && !gameOver && (e.key === " " || e.key === "Enter")) {
        setIsPlaying(true);
        return;
      }

      const currentDir = directionRef.current;
      let newDirection: Direction | null = null;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentDir !== "DOWN") newDirection = "UP";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (currentDir !== "UP") newDirection = "DOWN";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentDir !== "RIGHT") newDirection = "LEFT";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (currentDir !== "LEFT") newDirection = "RIGHT";
          break;
        case " ":
          if (!gameOver) setIsPlaying((prev) => !prev);
          break;
      }

      if (newDirection) {
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver]);

  const handleDirectionButton = (newDirection: Direction) => {
    const currentDir = directionRef.current;
    
    if (
      (newDirection === "UP" && currentDir !== "DOWN") ||
      (newDirection === "DOWN" && currentDir !== "UP") ||
      (newDirection === "LEFT" && currentDir !== "RIGHT") ||
      (newDirection === "RIGHT" && currentDir !== "LEFT")
    ) {
      directionRef.current = newDirection;
      setDirection(newDirection);
    }
  };

  const togglePlay = () => {
    if (gameOver) {
      resetGame();
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/game-center">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Snake</h1>
              <p className="text-sm text-muted-foreground">Classic arcade game</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            Best: {highScore}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{snake.length}</p>
              <p className="text-xs text-muted-foreground">Length</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{highScore}</p>
              <p className="text-xs text-muted-foreground">High Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {gameOver ? (
                "Game Over!"
              ) : isPlaying ? (
                "Playing..."
              ) : (
                "Ready to Play"
              )}
            </CardTitle>
            <CardDescription>
              {gameOver
                ? "Click Play to try again"
                : isPlaying
                ? "Use arrow keys or buttons to move"
                : "Press Space or click Play to start"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {/* Game Grid */}
              <div
                className="border-2 border-foreground/30 rounded bg-secondary/30 relative"
                style={{
                  width: GRID_SIZE * CELL_SIZE,
                  height: GRID_SIZE * CELL_SIZE,
                }}
              >
                {/* Snake */}
                {snake.map((segment, idx) => (
                  <div
                    key={idx}
                    className={`absolute rounded-sm transition-all duration-75 ${
                      idx === 0 ? "bg-green-600" : "bg-green-500"
                    }`}
                    style={{
                      width: CELL_SIZE - 2,
                      height: CELL_SIZE - 2,
                      left: segment.x * CELL_SIZE + 1,
                      top: segment.y * CELL_SIZE + 1,
                    }}
                  />
                ))}
                
                {/* Food */}
                <div
                  className="absolute rounded-full bg-red-500 animate-pulse"
                  style={{
                    width: CELL_SIZE - 4,
                    height: CELL_SIZE - 4,
                    left: food.x * CELL_SIZE + 2,
                    top: food.y * CELL_SIZE + 2,
                  }}
                />

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">Game Over!</p>
                      <p className="text-muted-foreground">Score: {score}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Controls */}
              <div className="grid grid-cols-3 gap-2 md:hidden">
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDirectionButton("UP")}
                  disabled={!isPlaying}
                >
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDirectionButton("LEFT")}
                  disabled={!isPlaying}
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDirectionButton("DOWN")}
                  disabled={!isPlaying}
                >
                  <ArrowDown className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDirectionButton("RIGHT")}
                  disabled={!isPlaying}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button onClick={togglePlay} className="gap-2">
                  {gameOver ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Play
                    </>
                  )}
                </Button>
                <Button onClick={resetGame} variant="outline" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use arrow keys (or WASD) to control the snake</p>
            <p>• Eat the red food to grow and score points</p>
            <p>• Don't hit the walls or yourself!</p>
            <p>• The snake speeds up as you score more points</p>
            <p>• Press Space to pause/resume the game</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
