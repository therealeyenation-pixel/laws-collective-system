import { useState } from 'react';
import { Play, Star, Clock, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VODItem {
  id: number;
  title: string;
  description: string;
  genre: string;
  duration: number;
  releaseYear: number;
  posterUrl: string;
  videoUrl: string;
  rating: number;
}

export function VODSection() {
  const [vodContent, setVodContent] = useState<VODItem[]>([
    { id: 1, title: 'The Matrix', description: 'A hacker discovers the truth about reality', genre: 'Sci-Fi', duration: 136, releaseYear: 1999, posterUrl: '/demo-video.mp4', videoUrl: '/demo-video.mp4', rating: 8.7 },
    { id: 2, title: 'Inception', description: 'A skilled thief leads a team to steal secrets from dreams', genre: 'Sci-Fi', duration: 148, releaseYear: 2010, posterUrl: '/demo-video.mp4', videoUrl: '/demo-video.mp4', rating: 8.8 },
    { id: 3, title: 'The Dark Knight', description: 'Batman faces the Joker in Gotham City', genre: 'Action', duration: 152, releaseYear: 2008, posterUrl: '/demo-video.mp4', videoUrl: '/demo-video.mp4', rating: 9.0 },
    { id: 4, title: 'Interstellar', description: 'A team of astronauts travel through a wormhole', genre: 'Sci-Fi', duration: 169, releaseYear: 2014, posterUrl: '/demo-video.mp4', videoUrl: '/demo-video.mp4', rating: 8.6 },
    { id: 5, title: 'Pulp Fiction', description: 'Multiple interconnected stories in Los Angeles', genre: 'Crime', duration: 154, releaseYear: 1994, posterUrl: '/demo-video.mp4', videoUrl: '/demo-video.mp4', rating: 8.9 },
    { id: 6, title: 'Forrest Gump', description: 'A man with low IQ achieves great things', genre: 'Drama', duration: 142, releaseYear: 1994, posterUrl: '/demo-video.mp4', videoUrl: '/demo-video.mp4', rating: 8.8 },
  ]);

  const [selectedVOD, setSelectedVOD] = useState<VODItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Video on Demand</h2>
        <div className="flex gap-2">
          <select className="px-4 py-2 rounded-lg bg-secondary text-foreground border border-border">
            <option>All Genres</option>
            <option>Action</option>
            <option>Drama</option>
            <option>Sci-Fi</option>
            <option>Crime</option>
          </select>
        </div>
      </div>

      {selectedVOD && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                <video
                  src={selectedVOD.videoUrl}
                  controls
                  className="w-full h-full rounded-lg"
                  autoPlay
                />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{selectedVOD.title}</h3>
              <p className="text-muted-foreground mb-4">{selectedVOD.description}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-foreground font-semibold">{selectedVOD.rating}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{selectedVOD.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{selectedVOD.releaseYear}</span>
                </div>
              </div>
              <Button className="gap-2">
                <Play className="w-4 h-4" />
                Watch Now
              </Button>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="text-foreground font-medium">{selectedVOD.genre}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-foreground font-medium">{selectedVOD.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Release Year</p>
                  <p className="text-foreground font-medium">{selectedVOD.releaseYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-foreground font-medium">{selectedVOD.rating}/10</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setSelectedVOD(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vodContent.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setSelectedVOD(item)}
          >
            <div className="aspect-video bg-black relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4 group-hover:from-black/90 transition-colors">
                <div className="w-full">
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{item.genre}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-300">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{item.duration}m</span>
                <Calendar className="w-3 h-3" />
                <span>{item.releaseYear}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
