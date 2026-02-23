import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Share2,
  Plus,
  Sparkles,
  Calendar,
  Send,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter className="w-5 h-5 text-sky-500" />,
  facebook: <Facebook className="w-5 h-5 text-blue-600" />,
  instagram: <Instagram className="w-5 h-5 text-green-500" />,
  linkedin: <Linkedin className="w-5 h-5 text-blue-700" />,
  tiktok: <span className="text-lg">🎵</span>,
};

const platformColors: Record<string, string> = {
  twitter: "bg-sky-50 border-sky-200",
  facebook: "bg-blue-50 border-blue-200",
  instagram: "bg-green-50 border-green-200",
  linkedin: "bg-blue-50 border-blue-200",
  tiktok: "bg-gray-50 border-gray-200",
};

export default function SocialMedia() {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showGenerateContent, setShowGenerateContent] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Form states
  const [newPlatform, setNewPlatform] = useState<string>("");
  const [newAccountName, setNewAccountName] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postPlatform, setPostPlatform] = useState<string>("");
  const [generateTopic, setGenerateTopic] = useState("");
  const [generatePlatform, setGeneratePlatform] = useState<string>("twitter");
  const [generateTone, setGenerateTone] = useState<string>("professional");
  const [calendarPlatforms, setCalendarPlatforms] = useState<string[]>(["twitter", "instagram"]);

  const utils = trpc.useUtils();

  // Queries
  const { data: integrations, isLoading: loadingIntegrations } = trpc.socialMedia.getIntegrations.useQuery();
  const { data: posts, isLoading: loadingPosts } = trpc.socialMedia.getPosts.useQuery({});

  // Mutations
  const addIntegration = trpc.socialMedia.addIntegration.useMutation({
    onSuccess: () => {
      toast.success("Account connected!");
      setShowAddAccount(false);
      setNewPlatform("");
      setNewAccountName("");
      utils.socialMedia.getIntegrations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeIntegration = trpc.socialMedia.removeIntegration.useMutation({
    onSuccess: () => {
      toast.success("Account disconnected");
      utils.socialMedia.getIntegrations.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const createPost = trpc.socialMedia.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setShowCreatePost(false);
      setPostContent("");
      utils.socialMedia.getPosts.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const publishPost = trpc.socialMedia.publishPost.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.socialMedia.getPosts.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePost = trpc.socialMedia.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.socialMedia.getPosts.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const generateContent = trpc.socialMedia.generateContent.useMutation({
    onSuccess: (data) => {
      setPostContent(data.content);
      setShowGenerateContent(false);
      setShowCreatePost(true);
      toast.success(`Generated ${data.characterCount}/${data.limit} characters`);
    },
    onError: (err) => toast.error(err.message),
  });

  const generateCalendar = trpc.socialMedia.generateContentCalendar.useMutation({
    onSuccess: (data) => {
      toast.success("Content calendar generated!");
      console.log("Calendar:", data);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAddAccount = () => {
    if (!newPlatform || !newAccountName) {
      toast.error("Please fill in all fields");
      return;
    }
    addIntegration.mutate({
      platform: newPlatform as any,
      accountName: newAccountName,
    });
  };

  const handleCreatePost = () => {
    if (!postContent || !postPlatform) {
      toast.error("Please fill in all fields");
      return;
    }
    const integration = integrations?.find(i => i.platform === postPlatform);
    if (!integration) {
      toast.error("Please connect an account for this platform first");
      return;
    }
    createPost.mutate({
      integrationId: integration.id,
      content: postContent,
      status: "draft",
    });
  };

  const handleGenerateContent = () => {
    if (!generateTopic) {
      toast.error("Please enter a topic");
      return;
    }
    generateContent.mutate({
      platform: generatePlatform as any,
      topic: generateTopic,
      tone: generateTone as any,
      includeHashtags: true,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              Social Media Hub
            </h1>
            <p className="text-muted-foreground">
              Manage your social media presence with AI-powered content
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showGenerateContent} onOpenChange={setShowGenerateContent}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Generate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Content with AI</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={generatePlatform} onValueChange={setGeneratePlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Topic</label>
                    <Input
                      placeholder="e.g., Wealth building tips for families"
                      value={generateTopic}
                      onChange={(e) => setGenerateTopic(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tone</label>
                    <Select value={generateTone} onValueChange={setGenerateTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleGenerateContent} 
                    className="w-full gap-2"
                    disabled={generateContent.isPending}
                  >
                    {generateContent.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate Content
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={postPlatform} onValueChange={setPostPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrations?.map((integration) => (
                          <SelectItem key={integration.id} value={integration.platform}>
                            <span className="flex items-center gap-2">
                              {platformIcons[integration.platform]}
                              {integration.accountName}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {postContent.length} characters
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreatePost} 
                    className="w-full"
                    disabled={createPost.isPending}
                  >
                    {createPost.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Save as Draft
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Connected Accounts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Connected Accounts</h2>
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Connect Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Social Media Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={newPlatform} onValueChange={setNewPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Name</label>
                    <Input
                      placeholder="@yourusername"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Full API integration requires platform API keys. Contact admin to enable real posting.
                  </p>
                  <Button 
                    onClick={handleAddAccount} 
                    className="w-full"
                    disabled={addIntegration.isPending}
                  >
                    {addIntegration.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Connect Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loadingIntegrations ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : integrations && integrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card
                  key={integration.id}
                  className={`p-4 border ${platformColors[integration.platform]}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {platformIcons[integration.platform]}
                      <div>
                        <p className="font-medium">{integration.accountName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {integration.platform}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIntegration.mutate({ integrationId: integration.id })}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  {integration.lastPostAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last post: {new Date(integration.lastPostAt).toLocaleDateString()}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No accounts connected yet</p>
              <p className="text-sm">Connect your social media accounts to start posting</p>
            </div>
          )}
        </Card>

        {/* Posts */}
        <Tabs defaultValue="drafts">
          <TabsList>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="mt-4">
            <div className="space-y-4">
              {posts?.filter(p => p.status === "draft").map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{post.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => publishPost.mutate({ postId: post.id })}
                        disabled={publishPost.isPending}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost.mutate({ postId: post.id })}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {posts?.filter(p => p.status === "draft").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No draft posts</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="mt-4">
            <div className="space-y-4">
              {posts?.filter(p => p.status === "scheduled").map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{post.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Scheduled: {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString() : "Not set"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => publishPost.mutate({ postId: post.id })}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Publish Now
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost.mutate({ postId: post.id })}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {posts?.filter(p => p.status === "scheduled").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No scheduled posts</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="published" className="mt-4">
            <div className="space-y-4">
              {posts?.filter(p => p.status === "published").map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Published</span>
                      </div>
                      <p className="text-sm">{post.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Published: {post.publishedAt ? new Date(post.publishedAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {posts?.filter(p => p.status === "published").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No published posts yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
