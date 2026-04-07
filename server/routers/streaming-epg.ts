import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

// EPG (Electronic Program Guide) data with schedules
const epgData = {
  "bbc-news": [
    { id: "prog1", title: "BBC News at 10", description: "Latest news and current affairs", startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 7200000), duration: 60 },
    { id: "prog2", title: "Newsnight", description: "In-depth analysis of the day's news", startTime: new Date(Date.now() + 7200000), endTime: new Date(Date.now() + 10800000), duration: 60 },
    { id: "prog3", title: "World Business Report", description: "Global business and finance news", startTime: new Date(Date.now() + 10800000), endTime: new Date(Date.now() + 14400000), duration: 60 },
  ],
  "cnn": [
    { id: "prog4", title: "CNN International", description: "Breaking news from around the world", startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 7200000), duration: 60 },
    { id: "prog5", title: "Anderson Cooper 360", description: "In-depth reporting and interviews", startTime: new Date(Date.now() + 7200000), endTime: new Date(Date.now() + 10800000), duration: 60 },
  ],
  "espn": [
    { id: "prog6", title: "SportsCenter", description: "Daily sports highlights and analysis", startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 7200000), duration: 60 },
    { id: "prog7", title: "NBA Tonight", description: "Basketball highlights and interviews", startTime: new Date(Date.now() + 7200000), endTime: new Date(Date.now() + 10800000), duration: 60 },
  ],
};

// Music tracks for recommendations
const musicTracks = [
  { id: "track1", title: "Blinding Lights", artist: "The Weeknd", genre: "Synthwave", duration: 200, popularity: 95 },
  { id: "track2", title: "Shape of You", artist: "Ed Sheeran", genre: "Pop", duration: 234, popularity: 92 },
  { id: "track3", title: "Levitating", artist: "Dua Lipa", genre: "Disco-Pop", duration: 203, popularity: 90 },
  { id: "track4", title: "As It Was", artist: "Harry Styles", genre: "Pop", duration: 167, popularity: 88 },
  { id: "track5", title: "Anti-Hero", artist: "Taylor Swift", genre: "Pop", duration: 228, popularity: 87 },
  { id: "track6", title: "Flowers", artist: "Miley Cyrus", genre: "Pop", duration: 203, popularity: 85 },
  { id: "track7", title: "Vampire", artist: "Olivia Rodrigo", genre: "Alternative", duration: 241, popularity: 83 },
  { id: "track8", title: "Cruel Summer", artist: "Taylor Swift", genre: "Pop", duration: 169, popularity: 82 },
];

// Radio stations for recommendations
const radioStations = [
  { id: "station1", name: "BBC Radio 1", genre: "Pop/Rock", popularity: 90 },
  { id: "station2", name: "BBC Radio 2", genre: "Adult Contemporary", popularity: 88 },
  { id: "station3", name: "NPR", genre: "News/Talk", popularity: 85 },
  { id: "station4", name: "Jazz FM", genre: "Jazz", popularity: 75 },
  { id: "station5", name: "Classical Radio", genre: "Classical", popularity: 70 },
];

export const streamingEpgRouter = router({
  // Get EPG schedule for a specific channel
  getSchedule: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      const schedule = epgData[input.channelId as keyof typeof epgData] || [];
      return {
        channelId: input.channelId,
        programs: schedule,
        totalPrograms: schedule.length,
      };
    }),

  // Search across all content (channels, tracks, stations)
  search: publicProcedure
    .input(z.object({ query: z.string(), type: z.enum(["all", "channels", "tracks", "stations"]) }))
    .query(({ input }) => {
      const query = input.query.toLowerCase();
      const results: any = { channels: [], tracks: [], stations: [] };

      if (input.type === "all" || input.type === "channels") {
        results.channels = [
          { id: "bbc-news", name: "BBC News", category: "News" },
          { id: "cnn", name: "CNN", category: "News" },
          { id: "espn", name: "ESPN", category: "Sports" },
        ].filter(c => c.name.toLowerCase().includes(query) || c.category.toLowerCase().includes(query));
      }

      if (input.type === "all" || input.type === "tracks") {
        results.tracks = musicTracks.filter(t => 
          t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query) || t.genre.toLowerCase().includes(query)
        );
      }

      if (input.type === "all" || input.type === "stations") {
        results.stations = radioStations.filter(s => 
          s.name.toLowerCase().includes(query) || s.genre.toLowerCase().includes(query)
        );
      }

      return results;
    }),

  // Get recommendations based on genre or type
  getRecommendations: publicProcedure
    .input(z.object({ type: z.enum(["tracks", "stations", "channels"]), genre: z.string().optional(), limit: z.number().default(5) }))
    .query(({ input }) => {
      if (input.type === "tracks") {
        let tracks = [...musicTracks];
        if (input.genre) {
          tracks = tracks.filter(t => t.genre.toLowerCase().includes(input.genre!.toLowerCase()));
        }
        return tracks.sort((a, b) => b.popularity - a.popularity).slice(0, input.limit);
      }

      if (input.type === "stations") {
        return radioStations.sort((a, b) => b.popularity - a.popularity).slice(0, input.limit);
      }

      return [];
    }),

  // Get trending content
  getTrending: publicProcedure
    .input(z.object({ type: z.enum(["tracks", "stations"]), limit: z.number().default(10) }))
    .query(({ input }) => {
      if (input.type === "tracks") {
        return musicTracks.sort((a, b) => b.popularity - a.popularity).slice(0, input.limit);
      }
      if (input.type === "stations") {
        return radioStations.sort((a, b) => b.popularity - a.popularity).slice(0, input.limit);
      }
      return [];
    }),

  // Get all available genres
  getGenres: publicProcedure.query(() => {
    const genres = new Set<string>();
    musicTracks.forEach(t => genres.add(t.genre));
    radioStations.forEach(s => genres.add(s.genre));
    return Array.from(genres).sort();
  }),
});
