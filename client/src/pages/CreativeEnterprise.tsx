import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Music,
  Film,
  Mic,
  Users,
  DollarSign,
  Calendar,
  Award,
  BookOpen,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Briefcase,
} from "lucide-react";

export default function CreativeEnterprise() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddArtist, setShowAddArtist] = useState(false);
  const [showAddProduction, setShowAddProduction] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.creativeEnterprise.getStats.useQuery();
  const { data: artists, refetch: refetchArtists } = trpc.creativeEnterprise.getAllArtists.useQuery();
  const { data: productions, refetch: refetchProductions } = trpc.creativeEnterprise.getAllProductions.useQuery();
  const { data: bookings, refetch: refetchBookings } = trpc.creativeEnterprise.getUpcomingBookings.useQuery();
  const { data: trainingPrograms } = trpc.creativeEnterprise.getTrainingPrograms.useQuery({ entity: "all" });

  // Mutations
  const createArtist = trpc.creativeEnterprise.createArtist.useMutation({
    onSuccess: () => {
      toast.success("Artist added successfully");
      setShowAddArtist(false);
      refetchArtists();
      refetchStats();
    },
    onError: (error) => toast.error(error.message),
  });

  const createProduction = trpc.creativeEnterprise.createProduction.useMutation({
    onSuccess: () => {
      toast.success("Production created successfully");
      setShowAddProduction(false);
      refetchProductions();
      refetchStats();
    },
    onError: (error) => toast.error(error.message),
  });

  const createBooking = trpc.creativeEnterprise.createBooking.useMutation({
    onSuccess: () => {
      toast.success("Booking created successfully");
      setShowAddBooking(false);
      refetchBookings();
      refetchStats();
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trainee: "secondary",
      applicant: "outline",
      inactive: "destructive",
      senior: "default",
      master: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getProductionStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      released: "default",
      completed: "default",
      in_production: "secondary",
      in_development: "outline",
      post_production: "secondary",
      archived: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, " ")}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Creative Enterprise</h1>
            <p className="text-muted-foreground">
              Real-Eye-Nation Performance Arts & Content Production
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddArtist(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Artist
            </Button>
            <Button variant="outline" onClick={() => setShowAddProduction(true)} className="gap-2">
              <Film className="h-4 w-4" />
              New Production
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalArtists || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Artists</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.activeArtists || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Artists</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalProductions || 0}</p>
                  <p className="text-xs text-muted-foreground">Productions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.releasedProductions || 0}</p>
                  <p className="text-xs text-muted-foreground">Released</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.upcomingBookings || 0}</p>
                  <p className="text-xs text-muted-foreground">Upcoming Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="productions">Productions</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Artist Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Artist Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.artistsByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">{type}</span>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                    {Object.keys(stats?.artistsByType || {}).length === 0 && (
                      <p className="text-muted-foreground text-sm">No artists registered yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Anti-Starving Artist Framework */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Business-First Framework
                  </CardTitle>
                  <CardDescription>
                    Required training before performance specialization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Business Fundamentals</span>
                      <Badge>Required</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Financial Literacy</span>
                      <Badge>Required</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>IP & Licensing</span>
                      <Badge>Required</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Artists must complete all business training before advancing to active status
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Share Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Default Artist Share</span>
                      <Badge variant="default">70%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Company Share</span>
                      <Badge variant="secondary">30%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>IP Ownership</span>
                      <Badge variant="outline">Artist Majority</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Artists own their work. Company provides distribution, marketing, and infrastructure.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <div className="space-y-2">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium text-sm">{booking.eventName}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.startDateTime).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">{booking.bookingType.replace(/_/g, " ")}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No upcoming bookings</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Artists Roster</CardTitle>
                <CardDescription>
                  All registered artists across performance and production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Stage Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Business Ready</TableHead>
                      <TableHead>Revenue Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artists && artists.length > 0 ? (
                      artists.map((artist) => (
                        <TableRow key={artist.id}>
                          <TableCell className="font-medium">{artist.fullName}</TableCell>
                          <TableCell>{artist.stageName || "-"}</TableCell>
                          <TableCell className="capitalize">{artist.artistType}</TableCell>
                          <TableCell>{getStatusBadge(artist.status)}</TableCell>
                          <TableCell className="capitalize">{artist.experienceLevel}</TableCell>
                          <TableCell>
                            {artist.businessFundamentalsCompleted &&
                            artist.financialLiteracyCompleted &&
                            artist.ipLicensingTrainingCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </TableCell>
                          <TableCell>{artist.revenueSharePercentage}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No artists registered yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Productions Tab */}
          <TabsContent value="productions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Productions & Content</CardTitle>
                <CardDescription>
                  All creative productions and IP assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Ownership</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productions && productions.length > 0 ? (
                      productions.map((production) => (
                        <TableRow key={production.id}>
                          <TableCell className="font-medium">{production.title}</TableCell>
                          <TableCell className="capitalize">{production.productionType.replace(/_/g, " ")}</TableCell>
                          <TableCell className="capitalize">{production.owningEntity.replace(/_/g, " ")}</TableCell>
                          <TableCell>{getProductionStatusBadge(production.status)}</TableCell>
                          <TableCell className="capitalize">{production.ipOwnership.replace(/_/g, " ")}</TableCell>
                          <TableCell>${parseFloat(production.totalRevenue || "0").toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No productions created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddBooking(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Bookings & Events</CardTitle>
                <CardDescription>
                  Performance bookings, sessions, and appearances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings && bookings.length > 0 ? (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.eventName}</TableCell>
                          <TableCell className="capitalize">{booking.bookingType.replace(/_/g, " ")}</TableCell>
                          <TableCell>
                            {new Date(booking.startDateTime).toLocaleDateString()}{" "}
                            {new Date(booking.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>{booking.venue || booking.locationType}</TableCell>
                          <TableCell>{booking.clientName || booking.clientType}</TableCell>
                          <TableCell>${parseFloat(booking.bookingFee || "0").toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No bookings scheduled
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Business Fundamentals (Required)
                  </CardTitle>
                  <CardDescription>
                    Must complete before performance specialization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Business Fundamentals</p>
                      <p className="text-sm text-muted-foreground">Core business operations and planning</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Financial Literacy</p>
                      <p className="text-sm text-muted-foreground">Budgeting, taxes, and wealth building</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">IP & Licensing</p>
                      <p className="text-sm text-muted-foreground">Copyright, licensing, and royalties</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Self-Marketing</p>
                      <p className="text-sm text-muted-foreground">Personal branding and promotion</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Contract Negotiation</p>
                      <p className="text-sm text-muted-foreground">Understanding and negotiating deals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Performance Tracks
                  </CardTitle>
                  <CardDescription>
                    Specialization after business fundamentals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Acting & Voice Acting</p>
                      <p className="text-sm text-muted-foreground">Film, theater, voiceover</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Music Performance & Production</p>
                      <p className="text-sm text-muted-foreground">Instruments, vocals, recording</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Dance</p>
                      <p className="text-sm text-muted-foreground">Multiple styles and choreography</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Spoken Word & Poetry</p>
                      <p className="text-sm text-muted-foreground">Performance poetry and storytelling</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <p className="font-medium">Film Production</p>
                      <p className="text-sm text-muted-foreground">Directing, cinematography, editing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Artist Dialog */}
        <Dialog open={showAddArtist} onOpenChange={setShowAddArtist}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Artist</DialogTitle>
              <DialogDescription>
                Register a new artist in the Creative Enterprise
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createArtist.mutate({
                  fullName: formData.get("fullName") as string,
                  stageName: formData.get("stageName") as string || undefined,
                  email: formData.get("email") as string || undefined,
                  phone: formData.get("phone") as string || undefined,
                  artistType: formData.get("artistType") as "performer" | "producer" | "designer" | "animator" | "hybrid",
                  primaryEntity: formData.get("primaryEntity") as "real_eye_nation" | "laws_collective" | "both",
                  bio: formData.get("bio") as string || undefined,
                  contractType: formData.get("contractType") as "employee" | "contractor" | "freelance" | "intern",
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stageName">Stage Name</Label>
                  <Input id="stageName" name="stageName" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="artistType">Artist Type *</Label>
                  <Select name="artistType" defaultValue="performer">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performer">Performer</SelectItem>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="animator">Animator</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryEntity">Primary Entity *</Label>
                  <Select name="primaryEntity" defaultValue="real_eye_nation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_eye_nation">Real-Eye-Nation</SelectItem>
                      <SelectItem value="laws_collective">L.A.W.S. Collective</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Contract Type *</Label>
                <Select name="contractType" defaultValue="contractor">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddArtist(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createArtist.isPending}>
                  {createArtist.isPending ? "Adding..." : "Add Artist"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Production Dialog */}
        <Dialog open={showAddProduction} onOpenChange={setShowAddProduction}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Production</DialogTitle>
              <DialogDescription>
                Start a new creative production or content project
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProduction.mutate({
                  title: formData.get("title") as string,
                  productionType: formData.get("productionType") as any,
                  owningEntity: formData.get("owningEntity") as "real_eye_nation" | "laws_collective" | "joint",
                  description: formData.get("description") as string || undefined,
                  genre: formData.get("genre") as string || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productionType">Production Type *</Label>
                  <Select name="productionType" defaultValue="video">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="music_track">Music Track</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                      <SelectItem value="live_performance">Live Performance</SelectItem>
                      <SelectItem value="theater_production">Theater Production</SelectItem>
                      <SelectItem value="dance_piece">Dance Piece</SelectItem>
                      <SelectItem value="spoken_word">Spoken Word</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                      <SelectItem value="music_video">Music Video</SelectItem>
                      <SelectItem value="educational_content">Educational Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owningEntity">Owning Entity *</Label>
                  <Select name="owningEntity" defaultValue="real_eye_nation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_eye_nation">Real-Eye-Nation</SelectItem>
                      <SelectItem value="laws_collective">L.A.W.S. Collective</SelectItem>
                      <SelectItem value="joint">Joint Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" name="genre" placeholder="e.g., Drama, Hip-Hop, Contemporary Dance" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddProduction(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProduction.isPending}>
                  {createProduction.isPending ? "Creating..." : "Create Production"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Booking Dialog */}
        <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogDescription>
                Schedule a performance, session, or appearance
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const artistId = artists?.[0]?.id;
                if (!artistId) {
                  toast.error("Please add an artist first");
                  return;
                }
                createBooking.mutate({
                  eventName: formData.get("eventName") as string,
                  bookingType: formData.get("bookingType") as any,
                  primaryArtistId: artistId,
                  startDateTime: formData.get("startDateTime") as string,
                  endDateTime: formData.get("endDateTime") as string,
                  locationType: formData.get("locationType") as "in_person" | "virtual" | "hybrid",
                  venue: formData.get("venue") as string || undefined,
                  clientName: formData.get("clientName") as string || undefined,
                  bookingFee: parseFloat(formData.get("bookingFee") as string) || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input id="eventName" name="eventName" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingType">Booking Type *</Label>
                  <Select name="bookingType" defaultValue="live_performance">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live_performance">Live Performance</SelectItem>
                      <SelectItem value="recording_session">Recording Session</SelectItem>
                      <SelectItem value="photo_shoot">Photo Shoot</SelectItem>
                      <SelectItem value="video_shoot">Video Shoot</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="teaching">Teaching</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="event_appearance">Event Appearance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationType">Location Type *</Label>
                  <Select name="locationType" defaultValue="in_person">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDateTime">Start Date/Time *</Label>
                  <Input id="startDateTime" name="startDateTime" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDateTime">End Date/Time *</Label>
                  <Input id="endDateTime" name="endDateTime" type="datetime-local" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input id="venue" name="venue" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input id="clientName" name="clientName" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingFee">Booking Fee ($)</Label>
                <Input id="bookingFee" name="bookingFee" type="number" step="0.01" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddBooking(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBooking.isPending}>
                  {createBooking.isPending ? "Creating..." : "Create Booking"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
