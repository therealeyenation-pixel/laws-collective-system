import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Trophy, 
  Flame, 
  Star, 
  Edit2, 
  Save, 
  X,
  Calendar,
  Target,
  Award,
  TrendingUp,
  Clock,
  Gamepad2
} from "lucide-react";
import { toast } from "sonner";

interface PlayerProfileProps {
  userId?: number;
  isPublic?: boolean;
}

export default function PlayerProfile({ userId, isPublic = false }: PlayerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("Player");
  const [bio, setBio] = useState("");

  // Mock data for now - will be replaced with tRPC calls when router is available
  const currentProfile = {
    displayName: "Player",
    bio: "Building generational wealth through education and games!",
    avatarUrl: null,
    totalTokens: 150,
    totalWins: 12,
    gamesPlayed: 45,
    experiencePoints: 2350,
    level: 3
  };

  const streaks = {
    currentStreak: 5,
    longestStreak: 14,
    lastActivityDate: new Date().toISOString()
  };

  const activityHistory = [
    { activityType: "Completed Chess Game", createdAt: new Date().toISOString(), tokensEarned: 15 },
    { activityType: "Daily Check-in", createdAt: new Date(Date.now() - 86400000).toISOString(), tokensEarned: 5 },
    { activityType: "Won Memory Match", createdAt: new Date(Date.now() - 172800000).toISOString(), tokensEarned: 10 }
  ];

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const startEditing = () => {
    setDisplayName(currentProfile?.displayName || "");
    setBio(currentProfile?.bio || "");
    setIsEditing(true);
  };

  const levelProgress = currentProfile ? (currentProfile.experiencePoints % 1000) / 10 : 0;
  const currentLevel = currentProfile?.level || 1;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 h-24" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={currentProfile?.avatarUrl || undefined} />
              <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                {currentProfile?.displayName?.[0] || "P"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left pb-4">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="max-w-xs"
                  />
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="max-w-md"
                    rows={2}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentProfile?.displayName || "Player"}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentProfile?.bio || "No bio yet"}
                  </p>
                </>
              )}
            </div>

            {!isPublic && (
              <div className="flex gap-2 pb-4">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={startEditing}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{currentProfile?.totalTokens || 0}</p>
            <p className="text-sm text-muted-foreground">Tokens</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{streaks?.currentStreak || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{currentProfile?.totalWins || 0}</p>
            <p className="text-sm text-muted-foreground">Wins</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Gamepad2 className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{currentProfile?.gamesPlayed || 0}</p>
            <p className="text-sm text-muted-foreground">Games</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Level {currentLevel}
          </CardTitle>
          <CardDescription>
            {currentProfile?.experiencePoints || 0} XP total • {1000 - (currentProfile?.experiencePoints || 0) % 1000} XP to next level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Tabs for Streaks and Activity */}
      <Tabs defaultValue="streaks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="streaks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Streak Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-600">{streaks?.currentStreak || 0} days</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-3xl font-bold text-amber-600">{streaks?.longestStreak || 0} days</p>
                </div>
              </div>
              
              {streaks?.lastActivityDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Last active: {new Date(streaks.lastActivityDate).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityHistory && activityHistory.length > 0 ? (
                <div className="space-y-3">
                  {activityHistory.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.activityType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {activity.tokensEarned > 0 && (
                        <Badge variant="secondary">+{activity.tokensEarned} tokens</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No activity yet. Start playing to build your history!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
