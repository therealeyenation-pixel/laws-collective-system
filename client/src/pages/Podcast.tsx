import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Mic,
  Play,
  Pause,
  Clock,
  Calendar,
  Headphones,
  Heart,
  Share2,
  Download,
  Search,
  Plus,
  Radio,
  Users,
  TrendingUp,
  SkipBack,
  SkipForward,
  Volume2,
  Rss,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  releaseDate: string;
  listens: number;
  likes: number;
  season: number;
  episode: number;
  guests?: string[];
  topics: string[];
  status: "published" | "scheduled" | "recording";
}

interface PodcastShow {
  id: string;
  name: string;
  description: string;
  host: string;
  category: string;
  totalEpisodes: number;
  subscribers: number;
}

// Sample podcast shows
const podcastShows: PodcastShow[] = [
  {
    id: "1",
    name: "Real-Eye-Nation Radio",
    description: "Truth-telling conversations about sovereignty, wealth, and generational legacy.",
    host: "L.A.W.S. Collective",
    category: "Education",
    totalEpisodes: 24,
    subscribers: 3450,
  },
  {
    id: "2",
    name: "The Sovereign Mind",
    description: "Deep dives into financial literacy, legal structures, and autonomous wealth building.",
    host: "LuvOnPurpose Academy",
    category: "Business",
    totalEpisodes: 18,
    subscribers: 2180,
  },
];

// Sample episodes
const sampleEpisodes: Episode[] = [
  {
    id: "1",
    title: "Understanding 508(c)(1)(a) Organizations",
    description: "A comprehensive breakdown of religious nonprofit structures and their benefits for community wealth building.",
    duration: "1h 12m",
    releaseDate: "2026-01-20",
    listens: 4520,
    likes: 342,
    season: 2,
    episode: 8,
    guests: ["Legal Expert", "Tax Advisor"],
    topics: ["508(c)(1)(a)", "Nonprofit", "Tax Strategy"],
    status: "published",
  },
  {
    id: "2",
    title: "The L.A.W.S. Framework Explained",
    description: "Breaking down Land, Air, Water, and Self - the four pillars of generational wealth.",
    duration: "58m",
    releaseDate: "2026-01-13",
    listens: 3890,
    likes: 298,
    season: 2,
    episode: 7,
    topics: ["L.A.W.S.", "Wealth Building", "Framework"],
    status: "published",
  },
  {
    id: "3",
    title: "Building Your House: Family Trust Structures",
    description: "How to create and manage family trusts for multi-generational wealth transfer.",
    duration: "1h 05m",
    releaseDate: "2026-01-06",
    listens: 3210,
    likes: 256,
    season: 2,
    episode: 6,
    guests: ["Estate Planner"],
    topics: ["Trusts", "Estate Planning", "Generational Wealth"],
    status: "published",
  },
  {
    id: "4",
    title: "Cryptocurrency and Community Wealth",
    description: "Exploring how digital assets can support collective financial sovereignty.",
    duration: "52m",
    releaseDate: "2025-12-30",
    listens: 2890,
    likes: 234,
    season: 2,
    episode: 5,
    topics: ["Cryptocurrency", "Digital Assets", "Community"],
    status: "published",
  },
  {
    id: "5",
    title: "Real Estate Strategies for Collectives",
    description: "Land acquisition and property management for community organizations.",
    duration: "1h 18m",
    releaseDate: "2026-01-27",
    listens: 0,
    likes: 0,
    season: 2,
    episode: 9,
    guests: ["Real Estate Developer"],
    topics: ["Real Estate", "Land Trust", "Property"],
    status: "scheduled",
  },
  {
    id: "6",
    title: "The Power of Ministerial Authority",
    description: "Understanding religious leadership roles and their legal protections.",
    duration: "TBD",
    releaseDate: "2026-02-03",
    listens: 0,
    likes: 0,
    season: 2,
    episode: 10,
    topics: ["Ministry", "Religious Authority", "Legal"],
    status: "recording",
  },
];

export default function Podcast() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("episodes");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredEpisodes = sampleEpisodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const publishedEpisodes = filteredEpisodes.filter((e) => e.status === "published");
  const upcomingEpisodes = sampleEpisodes.filter((e) => e.status === "scheduled" || e.status === "recording");

  const totalListens = sampleEpisodes.reduce((sum, e) => sum + e.listens, 0);
  const totalSubscribers = podcastShows.reduce((sum, s) => sum + s.subscribers, 0);

  const handlePlay = (episodeId: string) => {
    if (currentlyPlaying === episodeId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(episodeId);
      setIsPlaying(true);
      const episode = sampleEpisodes.find((e) => e.id === episodeId);
      if (episode) {
        toast.success(`Now playing: ${episode.title}`);
      }
    }
  };

  const handleShare = (episode: Episode) => {
    navigator.clipboard.writeText(`${window.location.origin}/podcast/episode/${episode.id}`);
    toast.success("Episode link copied!");
  };

  const handleSubscribe = (platform: string) => {
    toast.success(`Opening ${platform}...`);
  };

  const getStatusBadge = (status: Episode["status"]) => {
    const variants: Record<Episode["status"], { variant: "default" | "secondary" | "outline"; label: string }> = {
      published: { variant: "default", label: "Published" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      recording: { variant: "outline", label: "Recording" },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  const currentEpisode = currentlyPlaying ? sampleEpisodes.find((e) => e.id === currentlyPlaying) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mic className="h-8 w-8 text-primary" />
              Real-Eye-Nation Podcasts
            </h1>
            <p className="text-muted-foreground mt-1">
              Truth through conversation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => handleSubscribe("RSS")}>
              <Rss className="h-4 w-4" />
              RSS Feed
            </Button>
            <Button className="gap-2" onClick={() => toast.info("Episode submission feature coming soon")}>
              <Plus className="h-4 w-4" />
              Submit Episode
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Radio className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{podcastShows.length}</p>
                  <p className="text-xs text-muted-foreground">Active Shows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Mic className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sampleEpisodes.length}</p>
                  <p className="text-xs text-muted-foreground">Total Episodes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Headphones className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalListens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Listens</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribe Platforms */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">Listen on:</span>
              {["Apple Podcasts", "Spotify", "Google Podcasts", "YouTube"].map((platform) => (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleSubscribe(platform)}
                >
                  <ExternalLink className="h-3 w-3" />
                  {platform}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="shows">Shows</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search episodes by title, description, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Episode List */}
            <div className="space-y-3">
              {publishedEpisodes.map((episode) => (
                <Card key={episode.id} className={`transition-all ${currentlyPlaying === episode.id ? "ring-2 ring-primary" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Button
                        variant={currentlyPlaying === episode.id && isPlaying ? "default" : "outline"}
                        size="icon"
                        className="h-12 w-12 rounded-full flex-shrink-0"
                        onClick={() => handlePlay(episode.id)}
                      >
                        {currentlyPlaying === episode.id && isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{episode.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              S{episode.season} E{episode.episode}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleShare(episode)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toast.info("Download feature coming soon")}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{episode.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {episode.duration}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(episode.releaseDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Headphones className="h-3 w-3" />
                            {episode.listens.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Heart className="h-3 w-3" />
                            {episode.likes}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {episode.topics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        {episode.guests && episode.guests.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Guests:</span> {episode.guests.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {publishedEpisodes.length === 0 && (
              <div className="text-center py-12">
                <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No episodes found</h3>
                <p className="text-muted-foreground">Try adjusting your search</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shows" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {podcastShows.map((show) => (
                <Card key={show.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mic className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{show.name}</CardTitle>
                        <CardDescription className="mt-1">{show.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Host: {show.host}</p>
                        <p className="text-muted-foreground">Category: {show.category}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">{show.totalEpisodes} episodes</p>
                        <p className="text-muted-foreground">{show.subscribers.toLocaleString()} subscribers</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      View All Episodes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="space-y-3">
              {upcomingEpisodes.map((episode) => (
                <Card key={episode.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mic className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{episode.title}</h3>
                          {getStatusBadge(episode.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{episode.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>S{episode.season} E{episode.episode}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(episode.releaseDate).toLocaleDateString()}
                          </span>
                          {episode.duration !== "TBD" && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {episode.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Mini Player */}
        {currentEpisode && (
          <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-full flex-shrink-0"
                  onClick={() => handlePlay(currentEpisode.id)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{currentEpisode.title}</p>
                  <p className="text-xs text-muted-foreground">S{currentEpisode.season} E{currentEpisode.episode}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>12:34</span>
                  <span>{currentEpisode.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
