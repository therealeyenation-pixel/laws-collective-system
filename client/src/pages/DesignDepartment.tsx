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
  Palette,
  Image,
  Film,
  Box,
  Layers,
  Sparkles,
  Users,
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  FolderOpen,
  Cpu,
  Wand2,
} from "lucide-react";

export default function DesignDepartment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);

  // Queries
  const { data: stats, refetch: refetchStats } = trpc.designDepartment.getStats.useQuery();
  const { data: projects, refetch: refetchProjects } = trpc.designDepartment.getAllProjects.useQuery();
  const { data: assets, refetch: refetchAssets } = trpc.designDepartment.getAllAssets.useQuery();
  const { data: designers } = trpc.designDepartment.getDesigners.useQuery();

  // Mutations
  const createProject = trpc.designDepartment.createProject.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully");
      setShowAddProject(false);
      refetchProjects();
      refetchStats();
    },
    onError: (error) => toast.error(error.message),
  });

  const createAsset = trpc.designDepartment.createAsset.useMutation({
    onSuccess: () => {
      toast.success("Asset added successfully");
      setShowAddAsset(false);
      refetchAssets();
      refetchStats();
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "outline",
      on_hold: "destructive",
      draft: "outline",
      approved: "default",
      revision_requested: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, " ")}</Badge>;
  };

  const getProjectTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      branding: <Palette className="h-4 w-4" />,
      ui_ux: <Layers className="h-4 w-4" />,
      marketing: <Image className="h-4 w-4" />,
      motion_graphics: <Film className="h-4 w-4" />,
      "3d_modeling": <Box className="h-4 w-4" />,
      ai_generated: <Sparkles className="h-4 w-4" />,
    };
    return icons[type] || <Palette className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Design Department</h1>
            <p className="text-muted-foreground">
              L.A.W.S. Collective Digital Creation & Design Services
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddProject(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
            <Button variant="outline" onClick={() => setShowAddAsset(true)} className="gap-2">
              <FolderOpen className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalProjects || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.activeProjects || 0}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.completedProjects || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalAssets || 0}</p>
                  <p className="text-xs text-muted-foreground">Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.designers || 0}</p>
                  <p className="text-xs text-muted-foreground">Designers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">${(stats?.totalBilled || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="designers">Designers</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Project Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.projectsByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getProjectTypeIcon(type)}
                          <span className="capitalize">{type.replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    ))}
                    {Object.keys(stats?.projectsByType || {}).length === 0 && (
                      <p className="text-muted-foreground text-sm">No projects yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI-Assisted Design */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI-Assisted Design Tools
                  </CardTitle>
                  <CardDescription>
                    State-of-the-art technology integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded flex items-center gap-3">
                      <Wand2 className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Image Generation</p>
                        <p className="text-xs text-muted-foreground">AI-powered visual creation</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded flex items-center gap-3">
                      <Film className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Video Editing</p>
                        <p className="text-xs text-muted-foreground">AI-enhanced post-production</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded flex items-center gap-3">
                      <Box className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">3D Modeling</p>
                        <p className="text-xs text-muted-foreground">AI-assisted 3D creation</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded flex items-center gap-3">
                      <Cpu className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Motion Graphics</p>
                        <p className="text-xs text-muted-foreground">Automated animation tools</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Model */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Service Model
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Internal Projects</span>
                      <Badge variant="outline">No Charge</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>External Clients</span>
                      <Badge variant="default">Market Rate</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>Community Partners</span>
                      <Badge variant="secondary">Discounted</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Design services support all L.A.W.S. entities while generating external revenue
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Recent Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projects && projects.length > 0 ? (
                    <div className="space-y-2">
                      {projects.slice(0, 5).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            {getProjectTypeIcon(project.projectType)}
                            <span className="font-medium text-sm">{project.projectName}</span>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No projects yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Design Projects</CardTitle>
                <CardDescription>
                  All design and digital creation projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects && projects.length > 0 ? (
                      projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getProjectTypeIcon(project.projectType)}
                              <span className="font-medium">{project.projectName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{project.projectType.replace(/_/g, " ")}</TableCell>
                          <TableCell>{project.clientName || project.clientType}</TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell>${parseFloat(project.projectBudget || "0").toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No projects created yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Assets</CardTitle>
                <CardDescription>
                  All design assets, templates, and digital files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets && assets.length > 0 ? (
                      assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">{asset.assetName}</TableCell>
                          <TableCell className="capitalize">{asset.assetType.replace(/_/g, " ")}</TableCell>
                          <TableCell>{getStatusBadge(asset.status)}</TableCell>
                          <TableCell className="capitalize">{asset.licenseType.replace(/_/g, " ")}</TableCell>
                          <TableCell>{new Date(asset.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No assets added yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Designers Tab */}
          <TabsContent value="designers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Design Team</CardTitle>
                <CardDescription>
                  Designers from Creative Enterprise roster
                </CardDescription>
              </CardHeader>
              <CardContent>
                {designers && designers.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {designers.map((designer) => (
                      <Card key={designer.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Palette className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{designer.fullName}</p>
                              {designer.stageName && (
                                <p className="text-sm text-muted-foreground">{designer.stageName}</p>
                              )}
                              <Badge variant="secondary" className="mt-1">
                                {designer.artistType}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No designers registered yet. Add designers through Creative Enterprise.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding & Identity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Logo design</li>
                    <li>• Brand guidelines</li>
                    <li>• Visual identity systems</li>
                    <li>• Brand strategy</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    UI/UX Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Website design</li>
                    <li>• App interfaces</li>
                    <li>• User experience research</li>
                    <li>• Prototyping</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Marketing Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Social media graphics</li>
                    <li>• Print materials</li>
                    <li>• Advertising campaigns</li>
                    <li>• Presentation design</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Film className="h-5 w-5" />
                    Motion Graphics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Animated logos</li>
                    <li>• Video intros/outros</li>
                    <li>• Explainer animations</li>
                    <li>• Social media videos</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    3D Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Product visualization</li>
                    <li>• Architectural renders</li>
                    <li>• 3D modeling</li>
                    <li>• Virtual environments</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI-Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• AI image generation</li>
                    <li>• Style transfer</li>
                    <li>• Content upscaling</li>
                    <li>• Digital art creation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Project Dialog */}
        <Dialog open={showAddProject} onOpenChange={setShowAddProject}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new design project
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProject.mutate({
                  projectName: formData.get("projectName") as string,
                  projectType: formData.get("projectType") as any,
                  clientType: formData.get("clientType") as "internal" | "external",
                  clientName: formData.get("clientName") as string || undefined,
                  description: formData.get("description") as string || undefined,
                  projectBudget: parseFloat(formData.get("budget") as string) || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input id="projectName" name="projectName" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select name="projectType" defaultValue="branding">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branding">Branding</SelectItem>
                      <SelectItem value="ui_ux">UI/UX Design</SelectItem>
                      <SelectItem value="marketing">Marketing Design</SelectItem>
                      <SelectItem value="motion_graphics">Motion Graphics</SelectItem>
                      <SelectItem value="3d_modeling">3D Modeling</SelectItem>
                      <SelectItem value="illustration">Illustration</SelectItem>
                      <SelectItem value="print_design">Print Design</SelectItem>
                      <SelectItem value="packaging">Packaging</SelectItem>
                      <SelectItem value="ai_generated">AI Generated</SelectItem>
                      <SelectItem value="nft_art">NFT Art</SelectItem>
                      <SelectItem value="video_editing">Video Editing</SelectItem>
                      <SelectItem value="photo_editing">Photo Editing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientType">Client Type *</Label>
                  <Select name="clientType" defaultValue="internal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal (L.A.W.S. Entities)</SelectItem>
                      <SelectItem value="external">External Client</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" name="clientName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input id="budget" name="budget" type="number" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddProject(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createProject.isPending}>
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Asset Dialog */}
        <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Digital Asset</DialogTitle>
              <DialogDescription>
                Add a new design asset to the library
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createAsset.mutate({
                  assetName: formData.get("assetName") as string,
                  assetType: formData.get("assetType") as any,
                  fileUrl: formData.get("fileUrl") as string,
                  description: formData.get("description") as string || undefined,
                  licenseType: formData.get("licenseType") as "internal_only" | "client_exclusive" | "royalty_free" | "rights_managed" | "creative_commons" | "nft_owned",
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="assetName">Asset Name *</Label>
                <Input id="assetName" name="assetName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileUrl">File URL *</Label>
                <Input id="fileUrl" name="fileUrl" placeholder="https://..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type *</Label>
                  <Select name="assetType" defaultValue="image">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logo">Logo</SelectItem>
                      <SelectItem value="icon">Icon</SelectItem>
                      <SelectItem value="illustration">Illustration</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="animation">Animation</SelectItem>
                      <SelectItem value="3d_model">3D Model</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="font">Font</SelectItem>
                      <SelectItem value="color_palette">Color Palette</SelectItem>
                      <SelectItem value="mockup">Mockup</SelectItem>
                      <SelectItem value="source_file">Source File</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseType">License Type *</Label>
                <Select name="licenseType" defaultValue="internal_only">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_only">Internal Only</SelectItem>
                    <SelectItem value="client_exclusive">Client Exclusive</SelectItem>
                    <SelectItem value="royalty_free">Royalty Free</SelectItem>
                    <SelectItem value="rights_managed">Rights Managed</SelectItem>
                    <SelectItem value="creative_commons">Creative Commons</SelectItem>
                    <SelectItem value="nft_owned">NFT Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddAsset(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAsset.isPending}>
                  {createAsset.isPending ? "Adding..." : "Add Asset"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
