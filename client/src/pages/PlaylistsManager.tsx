/**
 * Playlists Manager - Create and manage music playlists
 * Full playlist management with add/remove tracks
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Music, ArrowLeft, Play, Pause } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Playlist {
  id: number;
  name: string;
  description: string;
  tracks: any[];
  createdAt: Date;
  updatedAt: Date;
}

export default function PlaylistsManager() {
  const { user } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch playlists
  const { data: playlists = [], refetch } = trpc.streamingUserData.getPlaylists.useQuery();

  // Create playlist mutation
  const createPlaylist = trpc.streamingUserData.createPlaylist.useMutation({
    onSuccess: () => {
      setNewPlaylistName('');
      setIsCreating(false);
      refetch();
      toast.success('Playlist created!');
    },
    onError: () => {
      toast.error('Failed to create playlist');
    },
  });

  // Delete playlist mutation
  const deletePlaylist = trpc.streamingUserData.deletePlaylist.useMutation({
    onSuccess: () => {
      setSelectedPlaylist(null);
      refetch();
      toast.success('Playlist deleted');
    },
    onError: () => {
      toast.error('Failed to delete playlist');
    },
  });

  // Remove track from playlist mutation
  const removeTrack = trpc.streamingUserData.removeTrackFromPlaylist.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Track removed from playlist');
    },
    onError: () => {
      toast.error('Failed to remove track');
    },
  });

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    createPlaylist.mutate({ name: newPlaylistName });
  };

  const handleDeletePlaylist = (playlistId: number) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist.mutate({ playlistId });
    }
  };

  const handleRemoveTrack = (playlistId: number, trackId: number) => {
    removeTrack.mutate({ playlistId, trackId });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="border-b border-border bg-card p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Playlists List */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">My Playlists</h2>

            {/* Create New Playlist */}
            {isCreating ? (
              <div className="space-y-2 mb-4">
                <Input
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreatePlaylist}
                    disabled={createPlaylist.isPending}
                  >
                    Create
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewPlaylistName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full mb-4 gap-2"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="w-4 h-4" />
                New Playlist
              </Button>
            )}

            {/* Playlists */}
            <div className="space-y-2">
              {playlists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No playlists yet
                </p>
              ) : (
                playlists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-primary/10 border-primary ring-1 ring-primary'
                        : 'hover:bg-secondary'
                    }`}
                    onClick={() => setSelectedPlaylist(playlist)}
                  >
                    <div className="flex items-start gap-2">
                      <Music className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {playlist.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {playlist.tracks.length} tracks
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Playlist Details */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedPlaylist.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedPlaylist.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created: {new Date(selectedPlaylist.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Tracks */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Tracks</h3>
                {selectedPlaylist.tracks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tracks in this playlist yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedPlaylist.tracks.map((track, index) => (
                      <Card key={track.id} className="p-4 hover:bg-secondary transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm text-muted-foreground w-6">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">
                                {track.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {track.artist}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(track.duration / 60)}:
                              {String(track.duration % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveTrack(selectedPlaylist.id, track.id)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Play Playlist */}
              {selectedPlaylist.tracks.length > 0 && (
                <Button className="w-full mt-6 gap-2">
                  <Play className="w-4 h-4" />
                  Play Playlist
                </Button>
              )}
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a playlist to view its tracks
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
