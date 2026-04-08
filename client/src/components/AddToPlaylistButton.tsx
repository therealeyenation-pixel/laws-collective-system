/**
 * AddToPlaylistButton - Quick-add content to a playlist
 * Used in Theater and Radio pages for inline playlist management
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListMusic, Plus, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

interface AddToPlaylistButtonProps {
  contentId: number;
  contentType: "channel" | "station";
  size?: "sm" | "default" | "icon";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function AddToPlaylistButton({
  contentId,
  contentType,
  size = "icon",
  variant = "ghost",
  className = "",
}: AddToPlaylistButtonProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  const { data: playlists = [] } = trpc.playlists.getMyPlaylists.useQuery(undefined, {
    enabled: !!user && open,
  });

  const utils = trpc.useUtils();

  const addItemMutation = trpc.playlists.addItem.useMutation({
    onSuccess: (_data: any, variables: any) => {
      const playlist = playlists.find((p: any) => p.id === variables.playlistId);
      toast.success(`Added to ${playlist?.name || "playlist"}`);
      utils.playlists.getMyPlaylists.invalidate();
      utils.playlists.getPlaylist.invalidate({ id: variables.playlistId });
    },
    onError: () => toast.error("Failed to add to playlist"),
  });

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => e.stopPropagation()}
          title="Add to playlist"
        >
          <ListMusic className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {playlists.length > 0 ? (
          <>
            {playlists.map((playlist: any) => (
              <DropdownMenuItem
                key={playlist.id}
                onClick={() => {
                  addItemMutation.mutate({
                    playlistId: playlist.id,
                    contentId,
                    contentType,
                  });
                  setOpen(false);
                }}
                className="gap-2"
              >
                <ListMusic className="w-4 h-4 text-muted-foreground" />
                {playlist.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {playlist.itemCount} items
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No playlists yet
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => {
            setLocation("/playlists/new");
            setOpen(false);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Playlist
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
