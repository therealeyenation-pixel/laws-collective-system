import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Eye, Music, Video, Play, Users, DollarSign, Calendar,
  Star, Award, Mic, Film, Palette, Plus, Search,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from "lucide-react";

const statusColors: Record<string, string> = {
  in_development: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  in_production: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  post_production: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  released: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const typeIcons: Record<string, React.ReactNode> = {
  film: <Film className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  music_track: <Music className="w-4 h-4" />,
  album: <Music className="w-4 h-4" />,
  podcast: <Mic className="w-4 h-4" />,
  live_performance: <Play className="w-4 h-4" />,
  theater_production: <Play className="w-4 h-4" />,
  dance_piece: <Star className="w-4 h-4" />,
  spoken_word: <Mic className="w-4 h-4" />,
  documentary: <Film className="w-4 h-4" />,
  graphic_design: <Palette className="w-4 h-4" />,
  nft: <Star className="w-4 h-4" />,
  digital_art: <Palette className="w-4 h-4" />,
};

export default function RealEyeNationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProductionDialog, setShowNewProductionDialog] = useState(false);
  const [showNewArtistDialog, setShowNewArtistDialog] = useState(false);

  // Data fetching
  const { data: stats, isLoading: statsLoading } = trpc.creativeEnterprise.getStats.useQuery();
  const { data: artists, isLoading: artistsLoading } = trpc.creativeEnterprise.getAllArtists.useQuery();
  const { data: productions, isLoading: productionsLoading } = trpc.creativeEnterprise.getAllProductions.useQuery();
  const { data: bookings, isLoading: bookingsLoading } = trpc.creativeEnterprise.getUpcomingBookings.useQuery();
  const { data: programs, isLoading: programsLoading } = trpc.creativeEnterprise.getTrainingPrograms.useQuery({ entity: "real_eye_nation" });

  // Mutations
  const createArtist = trpc.creativeEnterprise.createArtist.useMutation({
    onSuccess: () => {
      toast.success("Artist profile created");
      setShowNewArtistDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const createProduction = trpc.creativeEnterprise.createProduction.useMutation({
    onSuccess: () => {
      toast.success("Production created");
      setShowNewProductionDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  // Filtered data
  const filteredProductions = useMemo(() => {
    if (!productions) return [];
    if (!searchQuery) return productions;
    const q = searchQuery.toLowerCase();
    return productions.filter((p: any) =>
      p.title.toLowerCase().includes(q) ||
      p.productionType?.toLowerCase().includes(q)
    );
  }, [productions, searchQuery]);

  const performingArtsProductions = useMemo(() => {
    if (!productions) return [];
    return productions.filter((p: any) =>
      ["theater_production", "dance_piece", "spoken_word", "live_performance", "film", "documentary", "music_track", "album"].includes(p.productionType)
    );
  }, [productions]);

  const activeProductions = useMemo(() => {
    if (!productions) return [];
    return productions.filter((p: any) => ["in_development", "in_production", "post_production"].includes(p.status));
  }, [productions]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Eye className="w-8 h-8 text-purple-500" />
              Real-Eye-Nation
            </h1>
            <p className="text-muted-foreground mt-1">
              Performing Arts & Media Enterprise — Design Department, L.A.W.S. Collective
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showNewArtistDialog} onOpenChange={setShowNewArtistDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Users className="w-4 h-4" /> Add Artist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Artist</DialogTitle>
                  <DialogDescription>Register a new performing artist or creative professional.</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createArtist.mutate({
                    stageName: fd.get("stageName") as string,
                    legalName: fd.get("legalName") as string,
                    primaryDiscipline: fd.get("primaryDiscipline") as any,
                    primaryEntity: fd.get("primaryEntity") as any,
                    bio: fd.get("bio") as string,
                  });
                }} className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stage Name</Label>
                      <Input name="stageName" required placeholder="Performance name" />
                    </div>
                    <div>
                      <Label>Legal Name</Label>
                      <Input name="legalName" required placeholder="Full legal name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Discipline</Label>
                      <Select name="primaryDiscipline" defaultValue="acting">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acting">Acting</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="dance">Dance</SelectItem>
                          <SelectItem value="spoken_word">Spoken Word</SelectItem>
                          <SelectItem value="film">Film</SelectItem>
                          <SelectItem value="visual_art">Visual Art</SelectItem>
                          <SelectItem value="graphic_design">Graphic Design</SelectItem>
                          <SelectItem value="multi_disciplinary">Multi-Disciplinary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Entity</Label>
                      <Select name="primaryEntity" defaultValue="real_eye_nation">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real_eye_nation">Real-Eye-Nation</SelectItem>
                          <SelectItem value="laws_collective">L.A.W.S. Collective</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea name="bio" placeholder="Brief biography..." rows={3} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createArtist.isPending}>
                    {createArtist.isPending ? "Creating..." : "Add Artist"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showNewProductionDialog} onOpenChange={setShowNewProductionDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> New Production
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Production</DialogTitle>
                  <DialogDescription>Start a new performing arts or media production.</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createProduction.mutate({
                    title: fd.get("title") as string,
                    productionType: fd.get("productionType") as any,
                    owningEntity: fd.get("owningEntity") as any,
                    description: fd.get("description") as string,
                  });
                }} className="space-y-4 pt-4">
                  <div>
                    <Label>Production Title</Label>
                    <Input name="title" required placeholder="e.g., The Awakening - A Spoken Word Experience" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select name="productionType" defaultValue="theater_production">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="theater_production">Theater Production</SelectItem>
                          <SelectItem value="dance_piece">Dance Piece</SelectItem>
                          <SelectItem value="spoken_word">Spoken Word</SelectItem>
                          <SelectItem value="live_performance">Live Performance</SelectItem>
                          <SelectItem value="film">Film</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                          <SelectItem value="music_track">Music Track</SelectItem>
                          <SelectItem value="album">Album</SelectItem>
                          <SelectItem value="podcast">Podcast</SelectItem>
                          <SelectItem value="music_video">Music Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Entity</Label>
                      <Select name="owningEntity" defaultValue="real_eye_nation">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="real_eye_nation">Real-Eye-Nation</SelectItem>
                          <SelectItem value="laws_collective">L.A.W.S. Collective</SelectItem>
                          <SelectItem value="joint">Joint Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea name="description" placeholder="Describe the production..." rows={3} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createProduction.isPending}>
                    {createProduction.isPending ? "Creating..." : "Create Production"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalArtists ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Artists</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Film className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalProductions ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Productions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookings?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{programs?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Training Programs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productions">Productions</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Productions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Active Productions
                  </CardTitle>
                  <CardDescription>Currently in development or production</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeProductions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No active productions. Create one to get started.</p>
                  ) : (
                    <div className="space-y-3">
                      {activeProductions.slice(0, 5).map((prod: any) => (
                        <div key={prod.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {typeIcons[prod.productionType] || <Play className="w-4 h-4" />}
                            <div>
                              <p className="font-medium text-sm">{prod.title}</p>
                              <p className="text-xs text-muted-foreground">{prod.productionType?.replace(/_/g, " ")}</p>
                            </div>
                          </div>
                          <Badge className={statusColors[prod.status] || ""}>
                            {prod.status?.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performing Arts Spotlight */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Performing Arts
                  </CardTitle>
                  <CardDescription>Theater, Dance, Spoken Word & Live Performance</CardDescription>
                </CardHeader>
                <CardContent>
                  {performingArtsProductions.length === 0 ? (
                    <div className="text-center py-8">
                      <Play className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No performing arts productions yet.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowNewProductionDialog(true)}>
                        Create First Production
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {performingArtsProductions.slice(0, 5).map((prod: any) => (
                        <div key={prod.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {typeIcons[prod.productionType] || <Play className="w-4 h-4" />}
                            <div>
                              <p className="font-medium text-sm">{prod.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{prod.productionType?.replace(/_/g, " ")}</p>
                            </div>
                          </div>
                          <Badge className={statusColors[prod.status] || ""}>
                            {prod.status?.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!bookings || bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No upcoming events scheduled.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{booking.eventName || "Event"}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "TBD"}
                            </p>
                          </div>
                          <Badge variant="outline">{booking.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Training Programs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    Training Programs
                  </CardTitle>
                  <CardDescription>Performing arts and creative development tracks</CardDescription>
                </CardHeader>
                <CardContent>
                  {!programs || programs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No training programs configured yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {programs.slice(0, 5).map((prog: any) => (
                        <div key={prog.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{prog.programName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {prog.programType?.replace(/_/g, " ")} · {prog.durationWeeks || "?"} weeks
                            </p>
                          </div>
                          <Badge variant={prog.status === "active" ? "default" : "secondary"}>
                            {prog.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Productions Tab */}
          <TabsContent value="productions" className="space-y-4 mt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search productions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowNewProductionDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" /> New Production
              </Button>
            </div>

            {productionsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading productions...</div>
            ) : filteredProductions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Film className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No productions found. Create your first production to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Production</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductions.map((prod: any) => (
                      <TableRow key={prod.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {typeIcons[prod.productionType] || <Play className="w-4 h-4" />}
                            <div>
                              <p className="font-medium">{prod.title}</p>
                              {prod.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{prod.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{prod.productionType?.replace(/_/g, " ")}</TableCell>
                        <TableCell className="capitalize">{prod.owningEntity?.replace(/_/g, " ")}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[prod.status] || ""}>{prod.status?.replace(/_/g, " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {prod.productionBudget ? `$${Number(prod.productionBudget).toLocaleString()}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Artist Roster</h3>
              <Button onClick={() => setShowNewArtistDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Artist
              </Button>
            </div>

            {artistsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading artists...</div>
            ) : !artists || artists.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No artists registered yet. Add your first artist to build the roster.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artists.map((artist: any) => (
                  <Card key={artist.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Star className="w-6 h-6 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{artist.stageName}</h4>
                          <p className="text-sm text-muted-foreground">{artist.legalName}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="capitalize text-xs">
                              {artist.primaryDiscipline?.replace(/_/g, " ")}
                            </Badge>
                            <Badge variant="secondary" className="capitalize text-xs">
                              {artist.primaryEntity?.replace(/_/g, " ")}
                            </Badge>
                          </div>
                          {artist.bio && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{artist.bio}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Performing Arts Training Programs</h3>
                <p className="text-sm text-muted-foreground">Development tracks for artists in the Real-Eye-Nation ecosystem</p>
              </div>
            </div>

            {programsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading programs...</div>
            ) : !programs || programs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No training programs configured yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Training programs include: Acting, Dance, Music Performance, Spoken Word, Theater, Film Production, and more.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {programs.map((prog: any) => (
                  <Card key={prog.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{prog.programName}</CardTitle>
                        <Badge variant={prog.status === "active" ? "default" : "secondary"}>{prog.status}</Badge>
                      </div>
                      <CardDescription className="capitalize">{prog.programType?.replace(/_/g, " ")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {prog.description && <p className="text-sm text-muted-foreground mb-3">{prog.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {prog.durationWeeks || "?"} weeks
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {prog.hoursPerWeek || "?"} hrs/week
                        </span>
                        {prog.certificateAwarded && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" /> Certificate
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Upcoming Schedule</h3>
            {bookingsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading schedule...</div>
            ) : !bookings || bookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No upcoming events. Schedule a booking to populate the calendar.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking: any) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.eventName || "Scheduled Event"}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString("en-US", {
                                weekday: "long", year: "numeric", month: "long", day: "numeric"
                              }) : "Date TBD"}
                              {booking.venue && ` · ${booking.venue}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{booking.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
