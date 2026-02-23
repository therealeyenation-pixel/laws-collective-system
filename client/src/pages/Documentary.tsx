import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Film,
  Play,
  Clock,
  Calendar,
  Eye,
  Heart,
  Share2,
  Download,
  Search,
  Filter,
  Plus,
  Video,
  FileVideo,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Documentary {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  releaseDate: string;
  views: number;
  likes: number;
  category: string;
  status: "published" | "draft" | "in-production" | "scheduled";
  featured: boolean;
}

// Sample documentary data
const sampleDocumentaries: Documentary[] = [
  {
    id: "1",
    title: "The L.A.W.S. of Generational Wealth",
    description: "Exploring the principles of Land, Air, Water, and Self in building multi-generational prosperity.",
    thumbnail: "/api/placeholder/400/225",
    duration: "1h 24m",
    releaseDate: "2025-06-15",
    views: 12450,
    likes: 892,
    category: "Financial Literacy",
    status: "published",
    featured: true,
  },
  {
    id: "2",
    title: "Sovereign Roots: Reclaiming Our Heritage",
    description: "A journey through ancestral wisdom and the path to cultural sovereignty.",
    thumbnail: "/api/placeholder/400/225",
    duration: "58m",
    releaseDate: "2025-08-22",
    views: 8320,
    likes: 654,
    category: "Heritage & Culture",
    status: "published",
    featured: false,
  },
  {
    id: "3",
    title: "The Trust Blueprint",
    description: "Understanding 508(c)(1)(a) organizations and building sovereign structures.",
    thumbnail: "/api/placeholder/400/225",
    duration: "1h 12m",
    releaseDate: "2026-01-10",
    views: 3210,
    likes: 287,
    category: "Legal & Governance",
    status: "published",
    featured: true,
  },
  {
    id: "4",
    title: "Seeds of Tomorrow",
    description: "Teaching the next generation about sustainable wealth and community building.",
    thumbnail: "/api/placeholder/400/225",
    duration: "45m",
    releaseDate: "2026-03-01",
    views: 0,
    likes: 0,
    category: "Education",
    status: "in-production",
    featured: false,
  },
  {
    id: "5",
    title: "The Collective Vision",
    description: "How communities are coming together to build autonomous wealth systems.",
    thumbnail: "/api/placeholder/400/225",
    duration: "1h 35m",
    releaseDate: "2026-04-15",
    views: 0,
    likes: 0,
    category: "Community",
    status: "scheduled",
    featured: false,
  },
];

const categories = [
  "All",
  "Financial Literacy",
  "Heritage & Culture",
  "Legal & Governance",
  "Education",
  "Community",
];

export default function Documentary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("browse");

  const filteredDocs = sampleDocumentaries.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const publishedDocs = filteredDocs.filter((d) => d.status === "published");
  const inProductionDocs = sampleDocumentaries.filter((d) => d.status === "in-production" || d.status === "scheduled");
  const featuredDocs = sampleDocumentaries.filter((d) => d.featured && d.status === "published");

  const totalViews = sampleDocumentaries.reduce((sum, d) => sum + d.views, 0);
  const totalLikes = sampleDocumentaries.reduce((sum, d) => sum + d.likes, 0);

  const handleWatch = (doc: Documentary) => {
    if (doc.status !== "published") {
      toast.info(`"${doc.title}" is not yet available. Status: ${doc.status}`);
      return;
    }
    toast.success(`Now playing: ${doc.title}`);
  };

  const handleShare = (doc: Documentary) => {
    navigator.clipboard.writeText(`${window.location.origin}/documentary/${doc.id}`);
    toast.success("Link copied to clipboard!");
  };

  const getStatusBadge = (status: Documentary["status"]) => {
    const variants: Record<Documentary["status"], { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      published: { variant: "default", label: "Published" },
      draft: { variant: "secondary", label: "Draft" },
      "in-production": { variant: "outline", label: "In Production" },
      scheduled: { variant: "secondary", label: "Scheduled" },
    };
    return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Film className="h-8 w-8 text-primary" />
              Real-Eye-Nation Documentaries
            </h1>
            <p className="text-muted-foreground mt-1">
              Truth-telling through visual storytelling
            </p>
          </div>
          <Button className="gap-2" onClick={() => toast.info("Documentary submission feature coming soon")}>
            <Plus className="h-4 w-4" />
            Submit Documentary
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileVideo className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{sampleDocumentaries.length}</p>
                  <p className="text-xs text-muted-foreground">Total Documentaries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProductionDocs.length}</p>
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Section */}
        {featuredDocs.length > 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Featured Documentaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex gap-4 p-4 bg-background rounded-lg border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleWatch(doc)}
                  >
                    <div className="relative w-32 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {doc.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="coming-soon">Coming Soon</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Documentary Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedDocs.map((doc) => (
                <Card key={doc.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handleWatch(doc)}
                    >
                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Play className="h-8 w-8 text-white" fill="white" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 right-2">{doc.category}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{doc.description}</p>
                    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {doc.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {doc.views.toLocaleString()}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleShare(doc)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {publishedDocs.length === 0 && (
              <div className="text-center py-12">
                <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No documentaries found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="coming-soon" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {inProductionDocs.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{doc.title}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expected: {new Date(doc.releaseDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {doc.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentary Management</CardTitle>
                <CardDescription>
                  Manage your documentary submissions and productions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold">Admin Access Required</h3>
                  <p className="text-muted-foreground">
                    Documentary management features are available to Real-Eye-Nation team members.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => toast.info("Contact admin for access")}>
                    Request Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
