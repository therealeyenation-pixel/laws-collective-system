import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Radio, 
  Film, 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock,
  Users,
  FileText,
  Shield,
  Siren,
  Heart,
  Zap
} from "lucide-react";
import TheaterLiveEnhanced from "./TheaterLiveEnhanced";
import { VODSection } from "@/components/VODSection";
import { RadioSection } from "@/components/RadioSection";

export default function CommunicationCenter() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Communication & Emergency Center</h1>
          <p className="text-blue-100">Unified hub for entertainment, communication, and emergency response</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white dark:bg-slate-800 p-2 rounded-lg shadow">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Live Channels</span>
            </TabsTrigger>
            <TabsTrigger value="vod" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Video On Demand</span>
            </TabsTrigger>
            <TabsTrigger value="radio" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Satellite Radio</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency</span>
            </TabsTrigger>
          </TabsList>

          {/* Live Channels Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Play className="w-6 h-6 text-blue-600" />
                Live IPTV Channels
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Watch live television from 76 international channels across multiple categories
              </p>
              <TheaterLiveEnhanced />
            </div>
          </TabsContent>

          {/* Video on Demand Tab */}
          <TabsContent value="vod" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Film className="w-6 h-6 text-purple-600" />
                Video On Demand Library
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Browse and watch movies from our extensive VOD library
              </p>
              <VODSection />
            </div>
          </TabsContent>

          {/* Satellite Radio Tab */}
          <TabsContent value="radio" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Radio className="w-6 h-6 text-green-600" />
                Satellite Radio Stations
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Listen to 24 music stations across 8 genres including R&B, Jazz, Country, Hip-Hop, Pop, Rock, Electronic, and Latin
              </p>
              <RadioSection />
            </div>
          </TabsContent>

          {/* Emergency Response Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Contacts */}
              <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <Phone className="w-5 h-5" />
                    Emergency Contacts
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-400">
                    Quick access to critical emergency numbers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded">
                      <span className="font-semibold">Emergency Services</span>
                      <span className="text-red-600 font-bold text-lg">911</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded">
                      <span className="font-semibold">Poison Control</span>
                      <span className="text-red-600 font-bold">1-800-222-1222</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded">
                      <span className="font-semibold">Crisis Hotline</span>
                      <span className="text-red-600 font-bold">988</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded">
                      <span className="font-semibold">Disaster Assistance</span>
                      <span className="text-red-600 font-bold">1-800-621-3362</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Alerts */}
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <Siren className="w-5 h-5" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription className="text-orange-600 dark:text-orange-400">
                    Current emergency notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded border-l-4 border-orange-500">
                      <p className="font-semibold text-sm">No Active Alerts</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        All systems operational. Last updated: just now
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Resources */}
              <Card className="md:col-span-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Shield className="w-5 h-5" />
                    Emergency Resources & Preparedness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto flex-col items-start p-4 justify-start">
                      <Heart className="w-5 h-5 mb-2 text-red-600" />
                      <span className="font-semibold">First Aid Guide</span>
                      <span className="text-xs text-gray-600">Learn emergency procedures</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col items-start p-4 justify-start">
                      <MapPin className="w-5 h-5 mb-2 text-blue-600" />
                      <span className="font-semibold">Shelter Locations</span>
                      <span className="text-xs text-gray-600">Find nearest safe location</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col items-start p-4 justify-start">
                      <FileText className="w-5 h-5 mb-2 text-green-600" />
                      <span className="font-semibold">Preparedness Plan</span>
                      <span className="text-xs text-gray-600">Create emergency plan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Community Response */}
              <Card className="md:col-span-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Users className="w-5 h-5" />
                    Community Emergency Response Team (CERT)
                  </CardTitle>
                  <CardDescription className="text-green-600 dark:text-green-400">
                    Local community resources and coordination
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded">
                      <p className="font-semibold text-sm">Volunteer Opportunities</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Join local CERT training and become a community responder
                      </p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded">
                      <p className="font-semibold text-sm">Neighborhood Watch</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Connect with your neighborhood safety network
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
