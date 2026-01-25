import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trophy, Brain, Zap, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type Color = "red" | "blue" | "green" | "yellow";

const colors: Color[] = ["red", "blue", "green", "yellow"];

const colorStyles: Record<Color, { base: string; active: string; sound: number }> = {
  red: { base: "bg-red-500", active: "bg-red-300", sound: 262 },
  blue: { base: "bg-blue-500", active: "bg-blue-300", sound: 330 },
  green: { base: "bg-green-500", active: "bg-green-300", sound: 392 },
  yellow: { base: "bg-yellow-500", active: "bg-yellow-300", sound: 523 },
};

export default function SimonSays() {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Color[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("simon_highscore");
    if (saved) {
      setHighScore(parseInt(saved));
    }
  }, []);

  const playSound = useCallback((frequency: number) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  const flashColor = useCallback((color: Color, duration: number = 300) => {
    setActiveColor(color);
    playSound(colorStyles[color].sound);
    setTimeout(() => setActiveColor(null), duration);
  }, [playSound]);

  const showSequence = useCallback(async () => {
    setIsShowingSequence(true);
    setPlayerSequence([]);
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      flashColor(sequence[i]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setIsShowingSequence(false);
  }, [sequence, flashColor]);

  const addToSequence = useCallback(() => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
  }, [sequence]);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setGameStarted(true);
    
    // Start with first color
    const firstColor = colors[Math.floor(Math.random() * colors.length)];
    setSequence([firstColor]);
  };

  useEffect(() => {
    if (isPlaying && sequence.length > 0 && !gameOver) {
      showSequence();
    }
  }, [sequence, isPlaying, gameOver, showSequence]);

  const handleColorClick = (color: Color) => {
    if (isShowingSequence || gameOver || !isPlaying) return;
    
    flashColor(color, 200);
    
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    
    const currentIndex = newPlayerSequence.length - 1;
    
    // Check if correct
    if (color !== sequence[currentIndex]) {
      // Wrong!
      setGameOver(true);
      setIsPlaying(false);
      
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("simon_highscore", score.toString());
        toast.success(`New high score: ${score}!`);
      } else {
        toast.error(`Game Over! Score: ${score}`);
      }
      return;
    }
    
    // Check if sequence complete
    if (newPlayerSequence.length === sequence.length) {
      setScore(score + 1);
      toast.success("Correct! Next round...");
      
      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/game-center">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Center
              </Button>
            </Link>
          </div>

          <Card className="p-8 text-center bg-gray-800 border-gray-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 via-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-white">Simon Says</h1>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Watch the sequence of colors and repeat it back! Each round adds one more color.
              How long can you remember?
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <p className="text-sm font-medium text-gray-300">Memory</p>
              </div>
              <div className="text-center">
                <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-sm font-medium text-gray-300">Attention</p>
              </div>
              <div className="text-center">
                <Volume2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <p className="text-sm font-medium text-gray-300">Audio Memory</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-6">
              <Badge variant="outline" className="border-gray-600 text-gray-300">Ages 5+</Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">AIR Pillar</Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">Single Player</Badge>
            </div>

            {highScore > 0 && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">High Score</p>
                <p className="text-2xl font-bold text-yellow-400">{highScore}</p>
              </div>
            )}

            <div className="flex flex-col gap-4 items-center">
              <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-red-500 via-blue-500 to-green-500 hover:opacity-90">
                <Brain className="w-5 h-5 mr-2" />
                Start Game
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-400"
              >
                <Volume2 className={`w-4 h-4 mr-2 ${soundEnabled ? "" : "opacity-50"}`} />
                Sound: {soundEnabled ? "On" : "Off"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link href="/game-center">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-gray-600 text-gray-300">
              Round: {sequence.length}
            </Badge>
            <div className="text-lg font-bold text-white">
              Score: {score}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gray-400"
          >
            <Volume2 className={`w-4 h-4 ${soundEnabled ? "" : "opacity-50"}`} />
          </Button>
        </div>

        {/* Status */}
        <Card className="p-4 mb-6 text-center bg-gray-800 border-gray-700">
          {isShowingSequence ? (
            <p className="text-yellow-400 font-medium animate-pulse">Watch the sequence...</p>
          ) : gameOver ? (
            <p className="text-red-400 font-medium">Game Over!</p>
          ) : (
            <p className="text-green-400 font-medium">Your turn! Repeat the sequence</p>
          )}
        </Card>

        {/* Game board */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              disabled={isShowingSequence || gameOver}
              className={`
                aspect-square rounded-2xl transition-all duration-100 transform
                ${colorStyles[color].base}
                ${activeColor === color ? `${colorStyles[color].active} scale-95` : ""}
                ${!isShowingSequence && !gameOver ? "hover:opacity-80 active:scale-95 cursor-pointer" : "cursor-not-allowed"}
                shadow-lg
              `}
            />
          ))}
        </div>

        {/* Progress indicator */}
        {!gameOver && !isShowingSequence && (
          <div className="flex justify-center gap-2 mb-6">
            {sequence.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < playerSequence.length ? "bg-green-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        )}

        {/* Game over screen */}
        {gameOver && (
          <Card className="p-6 text-center bg-gray-800 border-gray-700">
            <Trophy className={`w-12 h-12 mx-auto mb-4 ${score >= highScore && score > 0 ? "text-yellow-400" : "text-gray-500"}`} />
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {score >= highScore && score > 0 ? "New High Score!" : "Game Over!"}
            </h2>
            
            <p className="text-4xl font-bold text-white mb-2">{score}</p>
            <p className="text-gray-400 mb-6">
              You remembered {score} rounds
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setGameStarted(false)}
                className="border-gray-600 text-gray-300"
              >
                Menu
              </Button>
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 via-blue-500 to-green-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </Card>
        )}

        {/* High score display */}
        {!gameOver && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              High Score: <span className="text-yellow-400 font-bold">{highScore}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
