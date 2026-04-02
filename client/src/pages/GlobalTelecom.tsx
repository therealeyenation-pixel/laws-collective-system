import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, 
  Phone, 
  Video, 
  MessageSquare, 
  AlertTriangle, 
  Satellite, 
  Map, 
  Code, 
  Globe,
  Wifi,
  MapPin,
  Zap
} from "lucide-react";

export default function GlobalTelecom() {
  const [activeTab, setActiveTab] = useState("radio");
  const [emergencyActive, setEmergencyActive] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Global Telecommunications</h1>
          <p className="text-muted-foreground">Autonomous resilience infrastructure with offline-first capability</p>
        </div>

        {/* Emergency SOS Banner */}
        {emergencyActive && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                <div>
                  <h3 className="font-bold text-red-500">SOS ACTIVE</h3>
                  <p className="text-sm text-red-400">Emergency services notified. Help is on the way.</p>
                </div>
              </div>
              <Button onClick={() => setEmergencyActive(false)} variant="outline">Clear</Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold text-foreground">Two-Way Radio</h3>
                <p className="text-xs text-muted-foreground">Active calls: 3</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-foreground">Video Conf</h3>
                <p className="text-xs text-muted-foreground">1 active session</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Satellite className="w-6 h-6 text-purple-500" />
              <div>
                <h3 className="font-semibold text-foreground">Satellite</h3>
                <p className="text-xs text-muted-foreground">3 connected</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Wifi className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-foreground">Offline Sync</h3>
                <p className="text-xs text-muted-foreground">5 pending</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="radio" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">Radio</span>
            </TabsTrigger>
            <TabsTrigger value="twoWay" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">2-Way</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="messaging" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">SOS</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="morse" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Morse</span>
            </TabsTrigger>
            <TabsTrigger value="translate" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Translate</span>
            </TabsTrigger>
          </TabsList>

          {/* Radio Broadcasting */}
          <TabsContent value="radio" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Global Radio Broadcast</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Active Channels</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Global News Network</p>
                      <p className="text-sm text-muted-foreground">88.5 FM • 5,000 listeners</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Educational Radio</p>
                      <p className="text-sm text-muted-foreground">91.2 FM • 3,200 listeners</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Emergency Broadcast</p>
                      <p className="text-sm text-muted-foreground">162.55 MHz • 1,000 listeners</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Schedule Show</h3>
                  <form className="space-y-3">
                    <input type="text" placeholder="Show name" className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <input type="datetime-local" className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <Button className="w-full">Schedule Broadcast</Button>
                  </form>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Two-Way Radio */}
          <TabsContent value="twoWay" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Two-Way Radio Communication</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Initiate Call</h3>
                  <form className="space-y-3">
                    <input type="text" placeholder="Recipient ID" className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <select className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground">
                      <option>2.4 GHz</option>
                      <option>5.8 GHz</option>
                      <option>10 GHz</option>
                      <option>HF Band</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-foreground">Encrypt call</span>
                    </label>
                    <Button className="w-full">Start Call</Button>
                  </form>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Active Calls</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
                      <p className="font-medium text-foreground">Alice • 2.4 GHz</p>
                      <p className="text-sm text-muted-foreground">Duration: 5m 32s</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
                      <p className="font-medium text-foreground">Bob • 5.8 GHz</p>
                      <p className="text-sm text-muted-foreground">Duration: 2m 15s</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Video Conferencing */}
          <TabsContent value="video" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Video Conferencing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Create Conference</h3>
                  <form className="space-y-3">
                    <input type="text" placeholder="Conference title" className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <input type="number" placeholder="Max participants" className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <input type="datetime-local" className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <Button className="w-full">Create Conference</Button>
                  </form>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Participants</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Alice</p>
                      <p className="text-xs text-muted-foreground">Video: ON • Audio: ON</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Bob</p>
                      <p className="text-xs text-muted-foreground">Video: ON • Audio: OFF</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Messaging */}
          <TabsContent value="messaging" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Messaging & Chat</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-foreground mb-3">Contacts</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">Alice</div>
                    <div className="p-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">Bob</div>
                    <div className="p-2 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80">Charlie</div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-foreground mb-3">Messages</h3>
                  <div className="bg-secondary rounded-lg p-4 h-64 overflow-y-auto mb-3 space-y-2">
                    <div className="text-sm text-muted-foreground">Alice: Hello!</div>
                    <div className="text-sm text-muted-foreground">You: Hi there!</div>
                    <div className="text-sm text-muted-foreground">Alice: How are you?</div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Type message..." className="flex-1 px-3 py-2 bg-secondary rounded-lg text-foreground" />
                    <Button>Send</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Emergency/SOS */}
          <TabsContent value="emergency" className="space-y-4">
            <Card className="p-6 border-red-500">
              <h2 className="text-2xl font-bold text-foreground mb-4">Emergency Response System</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Report Emergency</h3>
                  <form className="space-y-3">
                    <select className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground">
                      <option>Medical</option>
                      <option>Security</option>
                      <option>Natural Disaster</option>
                      <option>Technical</option>
                    </select>
                    <textarea placeholder="Describe emergency..." className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground h-24"></textarea>
                    <select className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option selected>Critical</option>
                    </select>
                    <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setEmergencyActive(true)}>
                      SEND SOS ALERT
                    </Button>
                  </form>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Emergency Support</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                      <p className="font-medium text-foreground">Status: IN PROGRESS</p>
                      <p className="text-sm text-muted-foreground">Responders: 5</p>
                      <p className="text-sm text-muted-foreground">ETA: 8 minutes</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Live Support Chat</p>
                      <p className="text-sm text-muted-foreground">Connected to emergency operator</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Global Mapping */}
          <TabsContent value="mapping" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Global Mapping & Tracking</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Your Location</h3>
                  <div className="bg-secondary rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span>40.7128°N, 74.0060°W</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span>Altitude: 10m • Speed: 0 km/h</span>
                    </div>
                    <label className="flex items-center gap-2 mt-3">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-foreground">Share location publicly</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Nearby Users</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Alice • 2.3 km away</p>
                      <p className="text-xs text-muted-foreground">40.7200°N, 74.0100°W</p>
                    </div>
                    <div className="p-3 bg-secondary rounded-lg">
                      <p className="font-medium text-foreground">Bob • 5.1 km away</p>
                      <p className="text-xs text-muted-foreground">40.7050°N, 74.0200°W</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Morse Code */}
          <TabsContent value="morse" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Morse Code Encoder/Decoder</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Text to Morse</h3>
                  <textarea placeholder="Enter text..." className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground h-24 mb-3"></textarea>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="font-mono text-sm">... --- ...</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Morse to Text</h3>
                  <textarea placeholder="Enter Morse code..." className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground h-24 mb-3"></textarea>
                  <div className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">SOS</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Language Translation */}
          <TabsContent value="translate" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">Language Translation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Source</h3>
                  <select className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground mb-3">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                  <textarea placeholder="Enter text to translate..." className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground h-24"></textarea>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Translation</h3>
                  <select className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground mb-3">
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                  <div className="w-full px-3 py-2 bg-secondary rounded-lg text-foreground h-24 overflow-y-auto">
                    <p className="text-muted-foreground">Translation appears here...</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* LAWS Principles Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Self (Individual)</h3>
            <p className="text-sm text-green-500">✓ Autonomy Enabled</p>
            <p className="text-sm text-green-500">✓ Agency Active</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">System (Organization)</h3>
            <p className="text-sm text-green-500">✓ Operational</p>
            <p className="text-sm text-green-500">✓ Rules Enforced</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-2">Society (Community)</h3>
            <p className="text-sm text-green-500">✓ Collaboration Active</p>
            <p className="text-sm text-green-500">✓ Benefit Distributed</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
