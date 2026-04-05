import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GraduationCap,
  Play,
  CheckCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Rocket,
  Shield,
  Zap,
  Settings,
  ChevronRight,
  Trophy,
  Star,
  Target,
} from "lucide-react";
import { onboardingTourService, Tour } from "@/services/onboardingTourService";
import { OnboardingTour, useOnboarding } from "@/components/OnboardingTour";

const categoryIcons: Record<string, React.ReactNode> = {
  'getting-started': <Rocket className="w-5 h-5" />,
  'features': <Zap className="w-5 h-5" />,
  'admin': <Shield className="w-5 h-5" />,
  'advanced': <Target className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  'getting-started': 'bg-blue-100 text-blue-800',
  'features': 'bg-green-100 text-green-800',
  'admin': 'bg-purple-100 text-purple-800',
  'advanced': 'bg-orange-100 text-orange-800',
};

export default function OnboardingCenter() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [stats, setStats] = useState(onboardingTourService.getStatistics());
  const [preferences, setPreferences] = useState(onboardingTourService.getPreferences());
  const [activeTourState, setActiveTourState] = useState(onboardingTourService.getCurrentState());
  const { showTour, startTour, completeTour, skipTour, resetTour } = useOnboarding();

  useEffect(() => {
    setTours(onboardingTourService.getAllTours());
    
    const unsubscribe = onboardingTourService.subscribe((state) => {
      setActiveTourState(state);
      setStats(onboardingTourService.getStatistics());
    });
    
    return unsubscribe;
  }, []);

  const handleStartTour = (tourId: string) => {
    const success = onboardingTourService.startTour(tourId);
    if (success) {
      toast.success("Tour started! Follow the highlighted elements.");
    }
  };

  const handleResetTour = (tourId: string) => {
    onboardingTourService.resetTour(tourId);
    setStats(onboardingTourService.getStatistics());
    toast.success("Tour progress reset");
  };

  const handleResetAllTours = () => {
    onboardingTourService.resetAllTours();
    setStats(onboardingTourService.getStatistics());
    toast.success("All tour progress has been reset");
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    onboardingTourService.updatePreferences(newPrefs);
    toast.success("Preferences updated");
  };

  const recommendedTours = onboardingTourService.getRecommendedTours();

  const categoryLabels: Record<string, string> = {
    'getting-started': 'Getting Started',
    'features': 'Features',
    'admin': 'Administration',
    'advanced': 'Advanced',
  };

  // Group tours by category
  const toursByCategory = tours.reduce((acc, tour) => {
    if (!acc[tour.category]) acc[tour.category] = [];
    acc[tour.category].push(tour);
    return acc;
  }, {} as Record<string, Tour[]>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Onboarding Center
            </h1>
            <p className="text-muted-foreground">
              Interactive tours and guides to help you master the system
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetTour}>
              <Play className="w-4 h-4 mr-2" />
              Quick Tour
            </Button>
            <Button variant="outline" onClick={handleResetAllTours}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Your Progress</h2>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">{stats.completedTours} / {stats.totalTours} Tours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{stats.totalTimeMinutes} min invested</span>
                </div>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {stats.completionRate.toFixed(0)}% complete
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedTours}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.inProgressTours}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Recommended Tours */}
        {recommendedTours.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedTours.slice(0, 3).map(tour => {
                const progress = onboardingTourService.getTourProgress(tour.id);
                return (
                  <Card key={tour.id} className="p-4 border-primary/20 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${categoryColors[tour.category]}`}>
                        {categoryIcons[tour.category]}
                      </div>
                      <Badge variant="outline">{tour.estimatedMinutes} min</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{tour.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {tour.description}
                    </p>
                    {progress && (
                      <div className="mb-3">
                        <Progress 
                          value={(progress.currentStep / tour.steps.length) * 100} 
                          className="h-1" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Step {progress.currentStep + 1} of {tour.steps.length}
                        </p>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartTour(tour.id)}
                    >
                      {progress ? 'Continue' : 'Start Tour'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Tours */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Tours</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="admin">Administration</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-4">
            {Object.entries(toursByCategory).map(([category, categoryTours]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {categoryIcons[category]}
                  {categoryLabels[category]}
                </h3>
                <div className="space-y-2">
                  {categoryTours.map(tour => (
                    <TourCard 
                      key={tour.id} 
                      tour={tour} 
                      onStart={handleStartTour}
                      onReset={handleResetTour}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {Object.keys(categoryLabels).map(category => (
            <TabsContent key={category} value={category} className="space-y-2 mt-4">
              {toursByCategory[category]?.map(tour => (
                <TourCard 
                  key={tour.id} 
                  tour={tour} 
                  onStart={handleStartTour}
                  onReset={handleResetTour}
                />
              ))}
            </TabsContent>
          ))}

          <TabsContent value="settings" className="mt-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Tour Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-on-login">Show tour on login</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically show the welcome tour for new sessions
                    </p>
                  </div>
                  <Switch
                    id="show-on-login"
                    checked={preferences.showTourOnLogin}
                    onCheckedChange={(checked) => handlePreferenceChange('showTourOnLogin', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-start">Auto-start new tours</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start tours when new features are added
                    </p>
                  </div>
                  <Switch
                    id="auto-start"
                    checked={preferences.autoStartNewTours}
                    onCheckedChange={(checked) => handlePreferenceChange('autoStartNewTours', checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Active Tour Overlay */}
        {showTour && (
          <OnboardingTour onComplete={completeTour} onSkip={skipTour} />
        )}
      </div>
    </DashboardLayout>
  );
}

// Tour Card Component
interface TourCardProps {
  tour: Tour;
  onStart: (tourId: string) => void;
  onReset: (tourId: string) => void;
}

function TourCard({ tour, onStart, onReset }: TourCardProps) {
  const isCompleted = onboardingTourService.isTourCompleted(tour.id);
  const progress = onboardingTourService.getTourProgress(tour.id);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : categoryColors[tour.category]}`}>
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              categoryIcons[tour.category]
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{tour.name}</span>
              {tour.requiredRole && (
                <Badge variant="outline" className="text-xs">
                  {tour.requiredRole}+
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{tour.steps.length} steps</span>
              <span>•</span>
              <span>{tour.estimatedMinutes} min</span>
              {progress && !isCompleted && (
                <>
                  <span>•</span>
                  <span className="text-amber-600">
                    Step {progress.currentStep + 1}/{tour.steps.length}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isCompleted && (
            <Button variant="ghost" size="sm" onClick={() => onReset(tour.id)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant={isCompleted ? 'outline' : 'default'}
            onClick={() => onStart(tour.id)}
          >
            {isCompleted ? 'Replay' : progress ? 'Continue' : 'Start'}
          </Button>
        </div>
      </div>
      {progress && !isCompleted && (
        <Progress
          value={(progress.currentStep / tour.steps.length) * 100}
          className="h-1 mt-3"
        />
      )}
    </Card>
  );
}
