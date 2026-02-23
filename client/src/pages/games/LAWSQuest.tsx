import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, Wind, Droplets, Heart, Crown, Sparkles, 
  ArrowLeft, Clock, Construction
} from "lucide-react";
import { Link } from "wouter";

export default function LAWSQuest() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-7 h-7 text-amber-500" />
              L.A.W.S. Quest
            </h1>
            <p className="text-muted-foreground">
              An epic journey through Land, Air, Water, and Self
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
                  L.A.W.S. Quest is Under Development
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  We're crafting an immersive RPG experience that guides you through the four pillars 
                  of the L.A.W.S. framework: Land, Air, Water, and Self. Stay tuned for an epic 
                  journey of growth and discovery.
                </p>
              </div>

              {/* Preview of the four pillars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <Mountain className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium text-green-700 dark:text-green-400">Land</p>
                  <p className="text-xs text-muted-foreground">Stability & Roots</p>
                </div>
                <div className="p-4 bg-sky-500/10 rounded-lg text-center">
                  <Wind className="w-8 h-8 mx-auto mb-2 text-sky-600" />
                  <p className="font-medium text-sky-700 dark:text-sky-400">Air</p>
                  <p className="text-xs text-muted-foreground">Knowledge & Growth</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-blue-700 dark:text-blue-400">Water</p>
                  <p className="text-xs text-muted-foreground">Healing & Balance</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium text-purple-700 dark:text-purple-400">Self</p>
                  <p className="text-xs text-muted-foreground">Purpose & Skills</p>
                </div>
              </div>

              {/* Features preview */}
              <div className="mt-8 p-6 bg-secondary/30 rounded-lg max-w-lg mx-auto">
                <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Planned Features
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Character creation with L.A.W.S. attributes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Quest-based learning through all four pillars
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Token economy and rewards system
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Multiplayer challenges and leaderboards
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Integration with real-world skill building
                  </li>
                </ul>
              </div>

              <Link href="/game-center">
                <Button className="mt-4">
                  Explore Other Games
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
