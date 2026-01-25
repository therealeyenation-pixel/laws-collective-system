import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Play,
  Save,
  Home,
  Settings,
  Volume2,
  VolumeX,
  Music,
  Keyboard,
  RotateCcw,
  LogOut,
} from "lucide-react";

interface PauseOverlayProps {
  isOpen: boolean;
  onResume: () => void;
  onSave?: () => void;
  onQuit?: () => void;
  onRestart?: () => void;
  gameName: string;
  canSave?: boolean;
  showSettings?: boolean;
  children?: React.ReactNode;
}

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  autoSaveEnabled: boolean;
  showHints: boolean;
  confirmQuit: boolean;
}

export function PauseOverlay({
  isOpen,
  onResume,
  onSave,
  onQuit,
  onRestart,
  gameName,
  canSave = true,
  showSettings = true,
  children,
}: PauseOverlayProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "settings" | "controls">("menu");
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 80,
    musicVolume: 60,
    autoSaveEnabled: true,
    showHints: true,
    confirmQuit: true,
  });
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
        case "p":
        case "P":
          e.preventDefault();
          onResume();
          break;
        case "s":
        case "S":
          if (e.ctrlKey && canSave && onSave) {
            e.preventDefault();
            onSave();
          }
          break;
        case "r":
        case "R":
          if (e.ctrlKey && onRestart) {
            e.preventDefault();
            onRestart();
          }
          break;
        case "q":
        case "Q":
          if (e.ctrlKey && onQuit) {
            e.preventDefault();
            if (settings.confirmQuit) {
              setShowQuitConfirm(true);
            } else {
              onQuit();
            }
          }
          break;
      }
    },
    [isOpen, onResume, onSave, onQuit, onRestart, canSave, settings.confirmQuit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("gameSettings", JSON.stringify(updated));
  };

  if (!isOpen) return null;

  const handleQuit = () => {
    if (settings.confirmQuit && !showQuitConfirm) {
      setShowQuitConfirm(true);
    } else {
      onQuit?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onResume}
      />

      {/* Pause Menu */}
      <Card className="relative z-10 w-full max-w-md mx-4 bg-background/95 backdrop-blur-sm border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-amber-500 uppercase tracking-wider">
              Paused
            </span>
          </div>
          <CardTitle className="text-2xl">{gameName}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Press ESC or P to resume
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          {showSettings && (
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={activeTab === "menu" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("menu")}
              >
                Menu
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button
                variant={activeTab === "controls" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setActiveTab("controls")}
              >
                <Keyboard className="w-4 h-4 mr-1" />
                Controls
              </Button>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === "menu" && (
            <div className="space-y-3">
              {/* Quit Confirmation */}
              {showQuitConfirm ? (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 space-y-3">
                  <p className="text-center font-medium">
                    Are you sure you want to quit?
                  </p>
                  <p className="text-sm text-center text-muted-foreground">
                    Unsaved progress will be lost.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowQuitConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setShowQuitConfirm(false);
                        onQuit?.();
                      }}
                    >
                      Quit Game
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    className="w-full h-14 text-lg gap-3"
                    onClick={onResume}
                  >
                    <Play className="w-6 h-6" />
                    Resume Game
                  </Button>

                  {canSave && onSave && (
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-2"
                      onClick={onSave}
                    >
                      <Save className="w-5 h-5" />
                      Save Game
                      <span className="text-xs text-muted-foreground ml-auto">
                        Ctrl+S
                      </span>
                    </Button>
                  )}

                  {onRestart && (
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-2"
                      onClick={onRestart}
                    >
                      <RotateCcw className="w-5 h-5" />
                      Restart Game
                      <span className="text-xs text-muted-foreground ml-auto">
                        Ctrl+R
                      </span>
                    </Button>
                  )}

                  {onQuit && (
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-2 text-destructive hover:text-destructive"
                      onClick={handleQuit}
                    >
                      <LogOut className="w-5 h-5" />
                      Quit to Menu
                      <span className="text-xs text-muted-foreground ml-auto">
                        Ctrl+Q
                      </span>
                    </Button>
                  )}

                  {children}
                </>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Sound Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Audio
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                    <Label>Sound Effects</Label>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings({ soundEnabled: checked })
                    }
                  />
                </div>

                {settings.soundEnabled && (
                  <div className="pl-6">
                    <Slider
                      value={[settings.soundVolume]}
                      onValueChange={([value]) =>
                        updateSettings({ soundVolume: value })
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">
                      {settings.soundVolume}%
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <Label>Background Music</Label>
                  </div>
                  <Switch
                    checked={settings.musicEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings({ musicEnabled: checked })
                    }
                  />
                </div>

                {settings.musicEnabled && (
                  <div className="pl-6">
                    <Slider
                      value={[settings.musicVolume]}
                      onValueChange={([value]) =>
                        updateSettings({ musicVolume: value })
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">
                      {settings.musicVolume}%
                    </span>
                  </div>
                )}
              </div>

              {/* Game Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Gameplay
                </h4>

                <div className="flex items-center justify-between">
                  <Label>Auto-Save</Label>
                  <Switch
                    checked={settings.autoSaveEnabled}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoSaveEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show Hints</Label>
                  <Switch
                    checked={settings.showHints}
                    onCheckedChange={(checked) =>
                      updateSettings({ showHints: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Confirm Before Quit</Label>
                  <Switch
                    checked={settings.confirmQuit}
                    onCheckedChange={(checked) =>
                      updateSettings({ confirmQuit: checked })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === "controls" && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Keyboard Shortcuts
              </h4>

              <div className="space-y-2">
                {[
                  { key: "ESC / P", action: "Pause / Resume" },
                  { key: "Ctrl + S", action: "Quick Save" },
                  { key: "Ctrl + R", action: "Restart Game" },
                  { key: "Ctrl + Q", action: "Quit to Menu" },
                  { key: "Arrow Keys", action: "Navigate / Move" },
                  { key: "Enter / Space", action: "Confirm / Select" },
                  { key: "H", action: "Show Hint" },
                  { key: "U", action: "Undo Move" },
                ].map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded"
                  >
                    <span className="text-sm">{shortcut.action}</span>
                    <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing pause state
export function usePauseGame(initialPaused = false) {
  const [isPaused, setIsPaused] = useState(initialPaused);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        // Don't pause if user is typing in an input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const toggle = useCallback(() => setIsPaused((prev) => !prev), []);

  return { isPaused, pause, resume, toggle, setIsPaused };
}

export default PauseOverlay;
