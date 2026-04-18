/**
 * PlaylistDetail - Create, view, and manage a playlist
 * Supports adding channels and radio stations from the content library
 */

import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ListMusic,
  Plus,
  Trash2,
  Play,
  Tv,
  Radio,
  Search,
  GripVertical,
  Save,
  Edit2,
  Shuffle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useLocation, useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function PlaylistDetail() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/playlists/:id");
  const playlistId = params?.id;
  const isNew = !playlistId || playlistId === "new";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(isNew);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState("");
  const [addTab, setAddTab] = useState<"channel" | "station">("channel");

  const { playChannel } = useMediaPlayer();
  const utils = trpc.useUtils();

  // Fetch playlist if editing existing
  const { data: playlist, isLoading: playlistLoading } = trpc.playlists.getPlaylist.useQuery(
    { id: Number(playlistId) },
    {
      enabled: !isNew && !!playlistId,
      onSuccess: (data: any) => {
        if (data) {
          setName(data.name);
          setDescription(data.description || "");
        }
      },
    }
  );

  // Fetch all content for the "Add" dialog
  const { data: channels = [] } = trpc.streamingContent.getChannels.useQuery({ limit: 100 });
  const { data: stations = [] } = trpc.streamingContent.getStations.useQuery({ limit: 100 });

  // Mutations
  const createMutation = trpc.playlists.createPlaylist.useMutation({
    onSuccess: (data: any) => {
      toast.success("Playlist created");
      setLocation(`/playlists/${data.id}`);
      setIsEditing(false);
    },
    onError: () => toast.error("Failed to create playlist"),
  });

  const updateMutation = trpc.playlists.updatePlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist updated");
      setIsEditing(false);
      utils.playlists.getPlaylist.invalidate({ id: Number(playlistId) });
    },
    onError: () => toast.error("Failed to update playlist"),
  });

  const deleteMutation = trpc.playlists.deletePlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      setLocation("/my-library");
    },
    onError: () => toast.error("Failed to delete playlist"),
  });

  const addItemMutation = trpc.playlists.addItem.useMutation({
    onSuccess: () => {
      toast.success("Added to playlist");
      utils.playlists.getPlaylist.invalidate({ id: Number(playlistId) });
      utils.playlists.getMyPlaylists.invalidate();
    },
    onError: () => toast.error("Failed to add item"),
  });

  const removeItemMutation = trpc.playlists.removeItem.useMutation({
    onSuccess: () => {
      toast.success("Removed from playlist");
      utils.playlists.getPlaylist.invalidate({ id: Number(playlistId) });
      utils.playlists.getMyPlaylists.invalidate();
    },
    onError: () => toast.error("Failed to remove item"),
  });

  // Build content lookup maps
  const channelMap = useMemo(() => {
    const map = new Map<number, any>();
    channels.forEach((c: any) => map.set(c.id, { ...c, _type: "channel" }));
    return map;
  }, [channels]);

  const stationMap = useMemo(() => {
    const map = new Map<number, any>();
    stations.forEach((s: any) => map.set(s.id, { ...s, _type: "station" }));
    return map;
  }, [stations]);

  // Resolve playlist items to content
  const resolvedItems = useMemo(() => {
    if (!playlist?.items) return [];
    return playlist.items
      .map((item: any) => {
        const content =
          item.contentType === "channel"
            ? channelMap.get(item.contentId)
            : stationMap.get(item.contentId);
        if (!content) return null;
        return { ...content, _itemId: item.id, _position: item.position };
      })
      .filter(Boolean);
  }, [playlist?.items, channelMap, stationMap]);

  // Filter content for the add dialog
  const filteredAddContent = useMemo(() => {
    const items = addTab === "channel" ? channels : stations;
    if (!addSearchQuery) return items;
    const q = addSearchQuery.toLowerCase();
    return items.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }, [addTab, addSearchQuery, channels, stations]);

  // Check if content is already in playlist
  const isInPlaylist = (contentId: number, contentType: string) => {
    if (!playlist?.items) return false;
    return playlist.items.some(
      (item: any) => item.contentId === contentId && item.contentType === contentType
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Playlist name is required");
      return;
    }
    if (isNew) {
      createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
    } else {
      updateMutation.mutate({
        id: Number(playlistId),
        name: name.trim(),
        description: description.trim() || undefined,
      });
    }
  };

  const handleAddItem = (contentId: number, contentType: "channel" | "station") => {
    if (!playlistId || isNew) return;
    addItemMutation.mutate({
      playlistId: Number(playlistId),
      contentId,
      contentType,
    });
  };

  const handleRemoveItem = (itemId: number) => {
    if (!playlistId) return;
    removeItemMutation.mutate({
      playlistId: Number(playlistId),
      itemId,
    });
  };

  const handlePlayItem = (item: any) => {
    if (item._type === "channel") {
      playChannel(item);
      toast.success(`Now playing: ${item.name}`);
    } else {
      setLocation("/broadcast-channels");
      toast.info(`Opening radio — select ${item.name}`);
    }
  };

  const handlePlayAll = async (shuffle: boolean) => {
    if (!playlistId || isNew) return;
    try {
      const items = await trpc.playlists.playAll.query({
        playlistId: Number(playlistId),
        shuffle,
      });
      if (items.length === 0) {
        toast.error("No items in playlist");
        return;
      }
      toast.success(`${shuffle ? "Shuffling" : "Playing"} ${items.length} item${items.length !== 1 ? "s" : ""}`);
      // Start with first item
      const firstItem = items[0];
      if (firstItem.contentType === "channel") {
        const content = channelMap.get(firstItem.contentId);
        if (content) playChannel(content);
      } else {
        setLocation("/broadcast-channels");
      }
    } catch (error) {
      toast.error("Failed to start playlist");
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Sign in to manage playlists</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/my-library")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              My Library
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Input
                placeholder="Playlist name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold"
                autoFocus
              />
              <Input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {isNew ? "Create Playlist" : "Save Changes"}
                </Button>
                {!isNew && (
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <ListMusic className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{playlist?.name || "Loading..."}</h1>
                  {playlist?.description && (
                    <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {resolvedItems.length} item{resolvedItems.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {resolvedItems.length > 0 && (
                  <Button size="sm" className="gap-2" onClick={() => handlePlayAll(false)}>
                    <Play className="w-4 h-4" />
                    Play All
                  </Button>
                )}
                {resolvedItems.length > 0 && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePlayAll(true)}>
                    <Shuffle className="w-4 h-4" />
                    Shuffle
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Delete this playlist?")) {
                      deleteMutation.mutate({ id: Number(playlistId) });
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {isNew ? (
          <div className="text-center py-12 text-muted-foreground">
            <ListMusic className="w-12 h-12 mx-auto mb-4" />
            <p>Create your playlist first, then add channels and stations to it.</p>
          </div>
        ) : playlistLoading ? (
          <div className="text-center py-12">
            <ListMusic className="w-8 h-8 animate-pulse text-muted-foreground mx-auto" />
            <p className="text-muted-foreground mt-2">Loading playlist...</p>
          </div>
        ) : (
          <>
            {/* Add button */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Playlist Items</h2>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add to Playlist</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={addSearchQuery}
                      onChange={(e) => setAddSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <Tabs value={addTab} onValueChange={(v) => setAddTab(v as any)}>
                    <TabsList className="mb-3">
                      <TabsTrigger value="channel" className="gap-1">
                        <Tv className="w-3 h-3" />
                        TV Channels
                      </TabsTrigger>
                      <TabsTrigger value="station" className="gap-1">
                        <Radio className="w-3 h-3" />
                        Radio Stations
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="channel" className="overflow-y-auto max-h-[50vh]">
                      <div className="space-y-2">
                        {filteredAddContent.map((item: any) => {
                          const alreadyAdded = isInPlaylist(item.id, "channel");
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-accent/10"
                            >
                              <img
                                src={item.logo}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover bg-muted"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                              </div>
                              <Button
                                size="sm"
                                variant={alreadyAdded ? "outline" : "default"}
                                disabled={alreadyAdded}
                                onClick={() => handleAddItem(item.id, "channel")}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                    <TabsContent value="station" className="overflow-y-auto max-h-[50vh]">
                      <div className="space-y-2">
                        {filteredAddContent.map((item: any) => {
                          const alreadyAdded = isInPlaylist(item.id, "station");
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-accent/10"
                            >
                              <img
                                src={item.logo}
                                alt={item.name}
                                className="w-10 h-10 rounded-full object-cover bg-muted"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.genre}</p>
                              </div>
                              <Button
                                size="sm"
                                variant={alreadyAdded ? "outline" : "default"}
                                disabled={alreadyAdded}
                                onClick={() => handleAddItem(item.id, "station")}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>

            {/* Items list */}
            {resolvedItems.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <ListMusic className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No items in this playlist yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {resolvedItems.map((item: any, idx: number) => (
                  <Card key={item._itemId} className="p-3 flex items-center gap-3 hover:bg-accent/5">
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <img
                      src={item.logo}
                      alt={item.name}
                      className={`w-12 h-12 rounded object-cover bg-muted flex-shrink-0 ${
                        item._type === "station" ? "rounded-full" : ""
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item._type === "channel" ? item.category : item.genre}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePlayItem(item)}
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Play
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveItem(item._itemId)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
