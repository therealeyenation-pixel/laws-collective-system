/**
 * RecentlyPlayedBar - Horizontal scrolling bar of recently played channels/stations
 * Shows last 10 items with quick-resume functionality
 */

import { Button } from '@/components/ui/button';
import { Clock, Play } from 'lucide-react';

interface RecentItem {
  contentId: number;
  contentType: string;
  lastPlayedAt: Date | string;
  totalPlayCount: number;
}

interface ContentItem {
  id: number;
  name: string;
  logo: string;
  category: string;
  description?: string;
}

interface RecentlyPlayedBarProps {
  recentItems: RecentItem[];
  contentItems: ContentItem[];
  onPlay: (item: ContentItem) => void;
  currentlyPlayingId?: number | null;
  isLoading?: boolean;
  label?: string;
}

export default function RecentlyPlayedBar({
  recentItems,
  contentItems,
  onPlay,
  currentlyPlayingId,
  isLoading,
  label = 'Recently Played',
}: RecentlyPlayedBarProps) {
  if (isLoading || recentItems.length === 0) return null;

  // Map recent items to content items
  const contentMap = new Map(contentItems.map((c) => [c.id, c]));
  const recentWithContent = recentItems
    .map((r) => ({
      ...r,
      content: contentMap.get(r.contentId),
    }))
    .filter((r) => r.content);

  if (recentWithContent.length === 0) return null;

  return (
    <div className="bg-card/50 border-b border-border py-3 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {recentWithContent.map((item) => {
            const content = item.content!;
            const isPlaying = currentlyPlayingId === content.id;
            return (
              <button
                key={content.id}
                onClick={() => onPlay(content)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent/50 ${
                  isPlaying ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted/30'
                }`}
              >
                <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0 relative">
                  <img
                    src={content.logo}
                    alt={content.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/32x32/333/FFF?text=${encodeURIComponent(content.name.substring(0, 2))}`;
                    }}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-white rounded-full animate-bounce"
                            style={{ height: '8px', animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-medium text-foreground truncate max-w-[100px]">
                    {content.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {content.category.replace(/_/g, ' ')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
