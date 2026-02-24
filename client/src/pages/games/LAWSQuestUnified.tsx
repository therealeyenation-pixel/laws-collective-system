import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, Wind, Droplets, Heart, Crown, Sparkles, 
  ArrowLeft, Clock, Construction, Users, Trophy
} from "lucide-react";
import { Link } from "wouter";

export default function LAWSQuestUnified() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-7 h-7 text-amber-500" />
              L.A.W.S. Quest Unified
            </h1>
            <p className="text-muted-foreground">
              The complete L.A.W.S. journey experience
            </p>
          </div>
          <Link href="/game-center">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Game Center
            </Button>
          </Link>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-dashed border-amber-500/50">
          <CardContent className="py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Construction className="w-12 h-12 text-amber-500" />
              </div>
              
              <div>
                <Badge className="bg-amber-500 mb-4">
                  <Clock className="w-3 h-3 mr-1" />
                  Coming Soon
                </Badge>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Unified Quest Experience Coming Soon
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  The unified version combines all L.A.W.S. pillars into one seamless adventure 
                  with enhanced multiplayer features and deeper progression systems.
                </p>
              </div>

              {/* Preview of unified features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium">Multiplayer</p>
                  <p className="text-xs text-muted-foreground">Journey together</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="font-medium">Achievements</p>
                  <p className="text-xs text-muted-foreground">Unlock rewards</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-medium">Enhanced Story</p>
                  <p className="text-xs text-muted-foreground">Deeper narrative</p>
                </div>
              </div>

              {/* L.A.W.S. Pillars Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <Mountain className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Land</p>
                </div>
                <div className="p-3 bg-sky-500/10 rounded-lg text-center">
                  <Wind className="w-6 h-6 mx-auto mb-1 text-sky-600" />
                  <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Air</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <Droplets className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Water</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                  <Heart className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Self</p>
                </div>
              </div>

              <Link href="/games/laws-quest">
                <Button variant="outline" className="mt-4">
                  View Standard L.A.W.S. Quest
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
