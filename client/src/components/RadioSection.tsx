import { useState } from 'react';
import { Play, Pause, Volume2, Radio, Users, Globe, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RadioStation {
  id: number;
  name: string;
  genre: string;
  country: string;
  streamUrl: string;
  description: string;
  listeners: number;
}

export function RadioSection() {
  const [radioStations] = useState<RadioStation[]>([
    // R&B
    { id: 1, name: 'SiriusXM R&B', genre: 'R&B', country: 'USA', streamUrl: 'https://stream.siriusxm.com/rb', description: 'Contemporary R&B & Soul', listeners: 45000 },
    { id: 2, name: 'Smooth R&B', genre: 'R&B', country: 'USA', streamUrl: 'https://stream.smoothrb.com', description: 'Smooth R&B Classics', listeners: 32000 },
    { id: 3, name: 'Urban Groove', genre: 'R&B', country: 'USA', streamUrl: 'https://stream.urbangroove.com', description: 'Urban R&B & Hip-Hop Mix', listeners: 28000 },
    
    // Jazz
    { id: 4, name: 'Jazz FM', genre: 'Jazz', country: 'UK', streamUrl: 'https://stream.jazzfm.com', description: 'Live Jazz & Blues', listeners: 35000 },
    { id: 5, name: 'Blue Note Radio', genre: 'Jazz', country: 'USA', streamUrl: 'https://stream.bluenote.com', description: 'Classic & Contemporary Jazz', listeners: 42000 },
    { id: 6, name: 'Smooth Jazz', genre: 'Jazz', country: 'USA', streamUrl: 'https://stream.smoothjazz.com', description: 'Relaxing Jazz Standards', listeners: 38000 },
    
    // Country
    { id: 7, name: 'Country Radio', genre: 'Country', country: 'USA', streamUrl: 'https://stream.countryradio.com', description: 'Classic Country Hits', listeners: 55000 },
    { id: 8, name: 'Outlaw Country', genre: 'Country', country: 'USA', streamUrl: 'https://stream.outlawcountry.com', description: 'Outlaw & Americana', listeners: 28000 },
    { id: 9, name: 'Country Legends', genre: 'Country', country: 'USA', streamUrl: 'https://stream.countrylegends.com', description: 'Greatest Country Classics', listeners: 32000 },
    
    // Hip-Hop
    { id: 10, name: 'Hip-Hop Central', genre: 'Hip-Hop', country: 'USA', streamUrl: 'https://stream.hiphopcentral.com', description: 'Latest Hip-Hop Hits', listeners: 62000 },
    { id: 11, name: 'Old School Hip-Hop', genre: 'Hip-Hop', country: 'USA', streamUrl: 'https://stream.oldschoolhiphop.com', description: '80s & 90s Hip-Hop', listeners: 45000 },
    { id: 12, name: 'Rap Classics', genre: 'Hip-Hop', country: 'USA', streamUrl: 'https://stream.rapclassics.com', description: 'Classic Rap Anthems', listeners: 38000 },
    
    // Pop
    { id: 13, name: 'Pop Hits', genre: 'Pop', country: 'USA', streamUrl: 'https://stream.pophits.com', description: 'Top 40 Pop Hits', listeners: 72000 },
    { id: 14, name: 'Pop Classics', genre: 'Pop', country: 'USA', streamUrl: 'https://stream.popclassics.com', description: 'Classic Pop Standards', listeners: 42000 },
    { id: 15, name: 'Indie Pop', genre: 'Pop', country: 'USA', streamUrl: 'https://stream.indiepop.com', description: 'Indie & Alternative Pop', listeners: 28000 },
    
    // Rock
    { id: 16, name: 'Classic Rock', genre: 'Rock', country: 'USA', streamUrl: 'https://stream.classicrock.com', description: 'Rock Legends', listeners: 58000 },
    { id: 17, name: 'Hard Rock', genre: 'Rock', country: 'USA', streamUrl: 'https://stream.hardrock.com', description: 'Heavy Metal & Hard Rock', listeners: 35000 },
    { id: 18, name: 'Alternative Rock', genre: 'Rock', country: 'USA', streamUrl: 'https://stream.altrock.com', description: 'Alternative & Indie Rock', listeners: 42000 },
    
    // Electronic/Dance
    { id: 19, name: 'EDM Central', genre: 'Electronic', country: 'USA', streamUrl: 'https://stream.edmcentral.com', description: 'Electronic Dance Music', listeners: 48000 },
    { id: 20, name: 'House Music', genre: 'Electronic', country: 'USA', streamUrl: 'https://stream.housemusic.com', description: 'House & Deep House', listeners: 38000 },
    { id: 21, name: 'Techno Pulse', genre: 'Electronic', country: 'USA', streamUrl: 'https://stream.technopulse.com', description: 'Techno & Industrial', listeners: 25000 },
    
    // Latin
    { id: 22, name: 'Latin Hits', genre: 'Latin', country: 'USA', streamUrl: 'https://stream.latinhits.com', description: 'Latin Pop & Reggaeton', listeners: 52000 },
    { id: 23, name: 'Salsa Radio', genre: 'Latin', country: 'USA', streamUrl: 'https://stream.salsaradio.com', description: 'Salsa & Merengue', listeners: 32000 },
    { id: 24, name: 'Reggaeton Vibes', genre: 'Latin', country: 'USA', streamUrl: 'https://stream.reggaetonvibes.com', description: 'Reggaeton & Trap Latino', listeners: 45000 },
  ]);

  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  const genres = ['All', ...Array.from(new Set(radioStations.map(s => s.genre)))];
  const filteredStations = selectedGenre === 'All' 
    ? radioStations 
    : radioStations.filter(s => s.genre === selectedGenre);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Radio className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Satellite Radio</h1>
          </div>
          <p className="text-muted-foreground">24/7 Music Streaming by Genre</p>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-foreground mb-4">Filter by Genre</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedGenre === genre
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Station List */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedStation?.id === station.id
                      ? 'bg-primary/10 border-primary'
                      : ''
                  }`}
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{station.name}</h3>
                      <p className="text-sm text-muted-foreground">{station.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {station.genre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {station.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {station.listeners.toLocaleString()} listeners
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStation(station);
                        setIsPlaying(!isPlaying);
                      }}
                    >
                      {isPlaying && selectedStation?.id === station.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Now Playing */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Now Playing</h2>
              {selectedStation ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-6 text-center">
                    <Radio className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h3 className="font-bold text-foreground text-lg">{selectedStation.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{selectedStation.genre}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{selectedStation.description}</p>
                    
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Listeners</p>
                      <p className="text-2xl font-bold text-foreground">
                        {(selectedStation.listeners / 1000).toFixed(1)}K
                      </p>
                    </div>

                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-full"
                      size="lg"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-2 pt-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Select a station to play</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
