/**
 * Theater VOD - Video-On-Demand Library
 * Free access to all educational and entertainment content for L.A.W.S. Collective members
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Clock, Star, Download, Share2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function TheaterVOD() {
  const { user } = useAuth();
  const [selectedContent, setSelectedContent] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: vodLibrary, isLoading } = trpc.iptvTheater.getVODLibrary.useQuery({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    limit: 100,
  });

  const startPlaybackMutation = trpc.iptvTheater.startPlayback.useMutation();

  const handlePlayContent = async (contentId: number) => {
    try {
      await startPlaybackMutation.mutateAsync({ contentId });
      setSelectedContent(contentId);
    } catch (error) {
      console.error('Failed to start playback:', error);
    }
  };

  const filteredContent = vodLibrary?.filter((content) =>
    content.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['all', 'educational', 'entertainment', 'news', 'sports'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading VOD library...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Content */}
      {selectedContent && filteredContent?.find((c) => c.id === selectedContent) && (
        <div className="w-full bg-gradient-to-b from-primary/20 to-background">
          <div className="container max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Video Player */}
              <div className="md:col-span-2">
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                  <Play className="w-16 h-16 text-white" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 rounded px-3 py-2">
                      <p className="text-white text-sm font-semibold">
                        {
                          filteredContent.find((c) => c.id === selectedContent)
                            ?.title
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="mt-4 flex items-center gap-2">
                  <Button className="gap-2">
                    <Play className="w-4 h-4" />
                    Continue Watching
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content Info */}
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    {filteredContent.find((c) => c.id === selectedContent)?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filteredContent.find((c) => c.id === selectedContent)?.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-semibold">
                        {Math.floor(
                          (filteredContent.find((c) => c.id === selectedContent)?.duration || 0) / 60
                        )}{' '}
                        min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Views:</span>
                      <span className="font-semibold">
                        {filteredContent.find((c) => c.id === selectedContent)?.viewCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {filteredContent.find((c) => c.id === selectedContent)?.rating || 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>

                <div className="bg-green-600/20 border border-green-600 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-600">
                    ✓ Free for All Members
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="container max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* VOD Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredContent?.map((content) => (
              <Card
                key={content.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePlayContent(content.id)}
              >
                <div className="aspect-video bg-muted relative flex items-center justify-center">
                  {content.thumbnailUrl ? (
                    <img
                      src={content.thumbnailUrl}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor((content.duration || 0) / 60)} min
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-foreground truncate">
                    {content.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {content.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded capitalize">
                      {content.category}
                    </span>
                    <span className="text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {content.rating || 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredContent?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No videos found</p>
            </div>
          )}
        </div>
      </div>

      {/* Free Streaming Badge */}
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold">✓ Free Streaming for All Members</p>
      </div>
    </div>
  );
}
