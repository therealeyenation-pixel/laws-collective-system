import React, { useState } from 'react';
import { ChevronDown, X, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Channel {
  id: number;
  name: string;
  category: string;
  streamUrl?: string;
  logo?: string;
  rating?: string;
}

interface ChannelGuideMenuProps {
  channels: Channel[];
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (channel: Channel) => void;
  selectedCategory?: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Channels', icon: '📺' },
  { id: 'news', name: 'News', icon: '📰' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'movies', name: 'Movies', icon: '🎥' },
  { id: 'international', name: 'International', icon: '🌍' },
  { id: 'kids', name: 'Kids', icon: '👶' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'documentary', name: 'Documentary', icon: '📚' },
  { id: 'adult', name: 'Adult', icon: '🔞' },
];

export function ChannelGuideMenu({
  channels,
  isOpen,
  onClose,
  onSelectChannel,
  selectedCategory = 'all',
}: ChannelGuideMenuProps) {
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredChannels = channels.filter((channel) => {
    const matchesCategory =
      activeCategory === 'all' ||
      channel.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = channel.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (channelId: number) => {
    setFavorites((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="relative ml-auto w-full max-w-md bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-xl font-bold text-foreground">Channel Guide</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="border-b border-border overflow-x-auto">
          <div className="flex gap-2 p-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChannels.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <p className="text-muted-foreground">No channels found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search or category
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center gap-3 p-3 hover:bg-secondary/50 cursor-pointer transition-colors group"
                  onClick={() => onSelectChannel(channel)}
                >
                  {/* Channel Logo */}
                  <div className="h-12 w-12 flex-shrink-0 rounded bg-secondary flex items-center justify-center">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="h-full w-full object-contain rounded"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {channel.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {channel.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {channel.category || 'General'}
                    </p>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(channel.id);
                    }}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        favorites.includes(channel.id)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>

                  {/* Rating Badge */}
                  {channel.rating && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                      {channel.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 bg-secondary/30">
          <p className="text-xs text-muted-foreground text-center">
            {filteredChannels.length} channels • {favorites.length} favorites
          </p>
        </div>
      </div>
    </div>
  );
}
