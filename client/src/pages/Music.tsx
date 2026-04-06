import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Music as MusicIcon,
  Plus,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Trash2,
  Headphones,
} from "lucide-react";
import { toast } from "sonner";

export default function Music() {
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playlistName, setPlaylistName] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");

  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtist, setTrackArtist] = useState("");
  const [trackDuration, setTrackDuration] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [trackType, setTrackType] = useState<"music" | "podcast" | "audiobook">("music");

  const { data: playlists, refetch: refetchPlaylists } = trpc.media.getPlaylists.useQuery();
  const { data: currentTracks } = trpc.media.getTracks.useQuery(
    { playlistId: selectedPlaylist || 0 },
    { enabled: !!selectedPlaylist }
  );
  const { data: recentlyPlayed } = trpc.media.getRecentlyPlayed.useQuery();

  const { mutate: createPlaylist, isPending: isCreatingPlaylist } = trpc.media.createPlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist created");
      setShowPlaylistForm(false);
      setPlaylistName("");
      setPlaylistDescription("");
      refetchPlaylists();
    },
    onError: (error) => {
      toast.error(`Failed to create playlist: ${error.message}`);
    },
  });

  const { mutate: addTrack, isPending: isAddingTrack } = trpc.media.addTrack.useMutation({
    onSuccess: () => {
      toast.success("Track added to playlist");
      setShowTrackForm(false);
      setTrackTitle("");
      setTrackArtist("");
      setTrackDuration("");
      setTrackUrl("");
      refetchPlaylists();
    },
    onError: (error) => {
      toast.error(`Failed to add track: ${error.message}`);
    },
  });

  const { mutate: removeTrack } = trpc.media.removeTrack.useMutation({
    onSuccess: () => {
      toast.success("Track removed");
      refetchPlaylists();
    },
    onError: (error) => {
      toast.error(`Failed to remove track: ${error.message}`);
    },
  });

  const { mutate: deletePlaylist } = trpc.media.deletePlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      setSelectedPlaylist(null);
      refetchPlaylists();
    },
    onError: (error) => {
      toast.error(`Failed to delete playlist: ${error.message}`);
    },
  });

  const handleCreatePlaylist = () => {
    if (!playlistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }
    createPlaylist({
      name: playlistName,
      description: playlistDescription,
      isPublic: false,
    });
  };

  const handleAddTrack = () => {
    if (!selectedPlaylist || !trackTitle.trim() || !trackArtist.trim() || !trackUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    addTrack({
      playlistId: selectedPlaylist,
      title: trackTitle,
      artist: trackArtist,
      duration: parseInt(trackDuration) || 0,
      url: trackUrl,
      type: trackType,
    });
  };

  const handlePlayTrack = (track: any) => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MusicIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Music & Podcasts</h1>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setShowPlaylistForm(true)}
            >
              <Plus className="w-5 h-5" />
              New Playlist
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Create Playlist Form */}
        {showPlaylistForm && (
          <Card className="mb-8 p-6 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Create Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Playlist Name
                </label>
                <Input
                  placeholder="e.g., Workout Mix"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Playlist description..."
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg min-h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleCreatePlaylist}
                  disabled={isCreatingPlaylist}
                >
                  {isCreatingPlaylist ? "Creating..." : "Create Playlist"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPlaylistForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Playlists Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Playlists</h2>
          {playlists && playlists.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedPlaylist === playlist.id
                      ? "ring-2 ring-primary"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedPlaylist(playlist.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground text-lg">{playlist.name}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist({ playlistId: playlist.id });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{playlist.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MusicIcon className="w-4 h-4" />
                    {playlist.trackCount} tracks
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Headphones className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No playlists yet</p>
            </Card>
          )}
        </div>

        {/* Add Track Form */}
        {showTrackForm && selectedPlaylist && (
          <Card className="mb-8 p-6 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Add Track to Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Track Title
                </label>
                <Input
                  placeholder="Song or episode title"
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Artist/Creator
                </label>
                <Input
                  placeholder="Artist or podcast name"
                  value={trackArtist}
                  onChange={(e) => setTrackArtist(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={trackDuration}
                    onChange={(e) => setTrackDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    value={trackType}
                    onChange={(e) => setTrackType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  >
                    <option value="music">Music</option>
                    <option value="podcast">Podcast</option>
                    <option value="audiobook">Audiobook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Audio URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  value={trackUrl}
                  onChange={(e) => setTrackUrl(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleAddTrack}
                  disabled={isAddingTrack}
                >
                  {isAddingTrack ? "Adding..." : "Add Track"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowTrackForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Current Playlist Tracks */}
        {selectedPlaylist && currentTracks && currentTracks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Tracks</h2>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setShowTrackForm(true)}
              >
                <Plus className="w-4 h-4" />
                Add Track
              </Button>
            </div>
            <div className="space-y-2">
              {currentTracks.map((track, index) => (
                <Card
                  key={track.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Play className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatTime(track.duration)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack({
                            trackId: track.id,
                            playlistId: selectedPlaylist,
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recently Played */}
        {recentlyPlayed && recentlyPlayed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Recently Played</h2>
            <div className="space-y-2">
              {recentlyPlayed.slice(0, 5).map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="text-sm text-muted-foreground">
                    Played {new Date(item.playedAt).toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Audio Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 backdrop-blur-sm">
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              size="sm"
              onClick={handleTogglePlay}
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                setCurrentTrackIndex(
                  Math.min(
                    (currentTracks?.length || 1) - 1,
                    currentTrackIndex + 1
                  )
                )
              }
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 h-1 bg-border rounded-full" />
              <span className="text-xs text-muted-foreground">3:45</span>
            </div>

            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
