import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Save, Play, Trash2, Clock, Gamepad2, 
  HardDrive, RefreshCw, Edit2, Check, X,
  Pause, History, Download, Upload
} from "lucide-react";
import { toast } from "sonner";

interface GameSave {
  id: number;
  gameId: number;
  gameName: string;
  gameSlug: string;
  gameIcon?: string;
  saveName: string;
  saveType: "manual" | "auto" | "checkpoint";
  score: number;
  progress: number;
  playTime: number;
  difficulty: string;
  savedAt: string;
}

// Mock data for demonstration
const mockSaves: GameSave[] = [
  {
    id: 1,
    gameId: 1,
    gameName: "Chess",
    gameSlug: "chess",
    gameIcon: "♟️",
    saveName: "Auto Save",
    saveType: "auto",
    score: 1250,
    progress: 65,
    playTime: 1800,
    difficulty: "medium",
    savedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    gameId: 1,
    gameName: "Chess",
    gameSlug: "chess",
    gameIcon: "♟️",
    saveName: "Before Boss Move",
    saveType: "manual",
    score: 1100,
    progress: 50,
    playTime: 1200,
    difficulty: "medium",
    savedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    gameId: 2,
    gameName: "Property Empire",
    gameSlug: "property-empire",
    gameIcon: "🏠",
    saveName: "Checkpoint - 75%",
    saveType: "checkpoint",
    score: 45000,
    progress: 75,
    playTime: 5400,
    difficulty: "hard",
    savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    gameId: 3,
    gameName: "Trivia Challenge",
    gameSlug: "trivia",
    gameIcon: "🧠",
    saveName: "Auto Save",
    saveType: "auto",
    score: 320,
    progress: 40,
    playTime: 600,
    difficulty: "easy",
    savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockStats = {
  totalSaves: 4,
  manualSaves: 1,
  autoSaves: 2,
  checkpointSaves: 1,
  totalPlayTime: 9000,
  highestProgress: 75,
  gamesWithSaves: 3,
};

export function GameSaveManager() {
  const [saves, setSaves] = useState<GameSave[]>(mockSaves);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}m ago`;
    }
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    }
    return date.toLocaleDateString();
  };

  const getSaveTypeColor = (type: string) => {
    switch (type) {
      case "auto": return "bg-blue-500/20 text-blue-700";
      case "manual": return "bg-green-500/20 text-green-700";
      case "checkpoint": return "bg-purple-500/20 text-purple-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const handleLoad = (save: GameSave) => {
    toast.success(`Loading ${save.saveName} for ${save.gameName}...`);
  };

  const handleDelete = (saveId: number) => {
    setSaves(saves.filter(s => s.id !== saveId));
    toast.success("Save deleted");
  };

  const handleRename = (saveId: number) => {
    setSaves(saves.map(s => 
      s.id === saveId ? { ...s, saveName: editName } : s
    ));
    setEditingId(null);
    setEditName("");
    toast.success("Save renamed");
  };

  const startEditing = (save: GameSave) => {
    setEditingId(save.id);
    setEditName(save.saveName);
  };

  const filteredSaves = selectedGame 
    ? saves.filter(s => s.gameSlug === selectedGame)
    : saves;

  const uniqueGames = Array.from(new Set(saves.map(s => s.gameSlug)))
    .map(slug => saves.find(s => s.gameSlug === slug)!)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <HardDrive className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStats.totalSaves}</p>
              <p className="text-xs text-muted-foreground">Total Saves</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Gamepad2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStats.gamesWithSaves}</p>
              <p className="text-xs text-muted-foreground">Games</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatPlayTime(mockStats.totalPlayTime)}</p>
              <p className="text-xs text-muted-foreground">Play Time</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <RefreshCw className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockStats.autoSaves}</p>
              <p className="text-xs text-muted-foreground">Auto Saves</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter by Game */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={selectedGame === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedGame(null)}
        >
          All Games
        </Button>
        {uniqueGames.map((game) => (
          <Button
            key={game.gameSlug}
            variant={selectedGame === game.gameSlug ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedGame(game.gameSlug)}
            className="gap-2"
          >
            <span>{game.gameIcon}</span>
            {game.gameName}
          </Button>
        ))}
      </div>

      {/* Save List */}
      <div className="space-y-3">
        {filteredSaves.length === 0 ? (
          <Card className="p-8 text-center">
            <Save className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Games</h3>
            <p className="text-muted-foreground">Your game saves will appear here. Games auto-save every 5 minutes.</p>
          </Card>
        ) : (
          filteredSaves.map((save) => (
            <Card key={save.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{save.gameIcon || "🎮"}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {editingId === save.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 w-48"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(save.id)}>
                              <Check className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold">{save.saveName}</h3>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEditing(save)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{save.gameName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={getSaveTypeColor(save.saveType)}>
                          {save.saveType === "auto" && <RefreshCw className="w-3 h-3 mr-1" />}
                          {save.saveType === "manual" && <Save className="w-3 h-3 mr-1" />}
                          {save.saveType === "checkpoint" && <Pause className="w-3 h-3 mr-1" />}
                          {save.saveType}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(save.savedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleLoad(save)} className="gap-2">
                      <Play className="w-4 h-4" /> Load
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Save?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{save.saveName}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(save.id)} className="bg-red-500 hover:bg-red-600">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {/* Progress and Stats */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{save.progress}%</span>
                  </div>
                  <Progress value={save.progress} className="h-2 mb-3" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Score: {save.score.toLocaleString()}</span>
                    <span>Play Time: {formatPlayTime(save.playTime)}</span>
                    <span className="capitalize">Difficulty: {save.difficulty}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <History className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Auto-Save Feature</h4>
              <p className="text-sm text-muted-foreground">
                Games automatically save your progress every 5 minutes. Auto-saves are kept for 30 days.
                Manual saves never expire. You can have up to 3 manual saves per game.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
