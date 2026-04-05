/**
 * Public Seeding Router
 * Procedures to populate database with initial channels and content
 * Public access - for initial setup only
 */

import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { eq } from 'drizzle-orm';

export const publicSeedRouter = router({
  /**
   * Seed IPTV channels (public)
   */
  seedIPTVChannels: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const channels = [
      // News
      { name: 'BBC News', category: 'News', description: 'British Broadcasting Corporation News', streamUrl: 'https://stream.bbc.co.uk/news', logo: 'https://via.placeholder.com/100?text=BBC+News', contentRating: 'G', accessLevel: 'public' },
      { name: 'CNN', category: 'News', description: 'Cable News Network', streamUrl: 'https://stream.cnn.com/live', logo: 'https://via.placeholder.com/100?text=CNN', contentRating: 'G', accessLevel: 'public' },
      { name: 'Sky News', category: 'News', description: 'Sky News Channel', streamUrl: 'https://stream.sky.com/news', logo: 'https://via.placeholder.com/100?text=Sky+News', contentRating: 'G', accessLevel: 'public' },
      { name: 'Al Jazeera', category: 'News', description: 'Al Jazeera English', streamUrl: 'https://stream.aljazeera.com/live', logo: 'https://via.placeholder.com/100?text=Al+Jazeera', contentRating: 'G', accessLevel: 'public' },
      { name: 'Reuters', category: 'News', description: 'Reuters News Channel', streamUrl: 'https://stream.reuters.com/live', logo: 'https://via.placeholder.com/100?text=Reuters', contentRating: 'G', accessLevel: 'public' },

      // Sports
      { name: 'ESPN', category: 'Sports', description: 'ESPN Sports Channel', streamUrl: 'https://stream.espn.com/live', logo: 'https://via.placeholder.com/100?text=ESPN', contentRating: 'PG', accessLevel: 'public' },
      { name: 'Sky Sports', category: 'Sports', description: 'Sky Sports Main Event', streamUrl: 'https://stream.sky.com/sports', logo: 'https://via.placeholder.com/100?text=Sky+Sports', contentRating: 'PG', accessLevel: 'public' },
      { name: 'Fox Sports', category: 'Sports', description: 'Fox Sports Channel', streamUrl: 'https://stream.foxsports.com/live', logo: 'https://via.placeholder.com/100?text=Fox+Sports', contentRating: 'PG', accessLevel: 'public' },
      { name: 'NBC Sports', category: 'Sports', description: 'NBC Sports Channel', streamUrl: 'https://stream.nbcsports.com/live', logo: 'https://via.placeholder.com/100?text=NBC+Sports', contentRating: 'PG', accessLevel: 'public' },
      { name: 'DAZN', category: 'Sports', description: 'DAZN Sports Streaming', streamUrl: 'https://stream.dazn.com/live', logo: 'https://via.placeholder.com/100?text=DAZN', contentRating: 'PG', accessLevel: 'members' },

      // Entertainment
      { name: 'Netflix', category: 'Entertainment', description: 'Netflix Streaming Service', streamUrl: 'https://stream.netflix.com/live', logo: 'https://via.placeholder.com/100?text=Netflix', contentRating: 'PG-13', accessLevel: 'members' },
      { name: 'HBO', category: 'Entertainment', description: 'HBO Entertainment Channel', streamUrl: 'https://stream.hbo.com/live', logo: 'https://via.placeholder.com/100?text=HBO', contentRating: 'R', accessLevel: 'members' },
      { name: 'Disney+', category: 'Entertainment', description: 'Disney Plus Streaming', streamUrl: 'https://stream.disneyplus.com/live', logo: 'https://via.placeholder.com/100?text=Disney', contentRating: 'G', accessLevel: 'members' },
      { name: 'Amazon Prime', category: 'Entertainment', description: 'Amazon Prime Video', streamUrl: 'https://stream.primevideo.com/live', logo: 'https://via.placeholder.com/100?text=Prime', contentRating: 'PG-13', accessLevel: 'members' },
      { name: 'Hulu', category: 'Entertainment', description: 'Hulu Streaming Service', streamUrl: 'https://stream.hulu.com/live', logo: 'https://via.placeholder.com/100?text=Hulu', contentRating: 'PG-13', accessLevel: 'members' },

      // Music
      { name: 'MTV', category: 'Music', description: 'Music Television', streamUrl: 'https://stream.mtv.com/live', logo: 'https://via.placeholder.com/100?text=MTV', contentRating: 'PG-13', accessLevel: 'public' },
      { name: 'VH1', category: 'Music', description: 'VH1 Music Channel', streamUrl: 'https://stream.vh1.com/live', logo: 'https://via.placeholder.com/100?text=VH1', contentRating: 'PG-13', accessLevel: 'public' },
      { name: 'Spotify TV', category: 'Music', description: 'Spotify Music Streaming', streamUrl: 'https://stream.spotify.com/live', logo: 'https://via.placeholder.com/100?text=Spotify', contentRating: 'G', accessLevel: 'public' },
      { name: 'Apple Music', category: 'Music', description: 'Apple Music Streaming', streamUrl: 'https://stream.applemusic.com/live', logo: 'https://via.placeholder.com/100?text=Apple+Music', contentRating: 'G', accessLevel: 'public' },
      { name: 'YouTube Music', category: 'Music', description: 'YouTube Music Streaming', streamUrl: 'https://stream.youtubemusic.com/live', logo: 'https://via.placeholder.com/100?text=YouTube', contentRating: 'G', accessLevel: 'public' },

      // Documentary
      { name: 'National Geographic', category: 'Documentary', description: 'National Geographic Channel', streamUrl: 'https://stream.natgeo.com/live', logo: 'https://via.placeholder.com/100?text=NatGeo', contentRating: 'PG', accessLevel: 'public' },
      { name: 'Discovery', category: 'Documentary', description: 'Discovery Channel', streamUrl: 'https://stream.discovery.com/live', logo: 'https://via.placeholder.com/100?text=Discovery', contentRating: 'PG', accessLevel: 'public' },
      { name: 'History', category: 'Documentary', description: 'History Channel', streamUrl: 'https://stream.history.com/live', logo: 'https://via.placeholder.com/100?text=History', contentRating: 'PG-13', accessLevel: 'public' },
      { name: 'Animal Planet', category: 'Documentary', description: 'Animal Planet Channel', streamUrl: 'https://stream.animalplanet.com/live', logo: 'https://via.placeholder.com/100?text=Animal+Planet', contentRating: 'G', accessLevel: 'public' },
      { name: 'TLC', category: 'Documentary', description: 'The Learning Channel', streamUrl: 'https://stream.tlc.com/live', logo: 'https://via.placeholder.com/100?text=TLC', contentRating: 'PG', accessLevel: 'public' },

      // Kids
      { name: 'Cartoon Network', category: 'Kids', description: 'Cartoon Network', streamUrl: 'https://stream.cartoonnetwork.com/live', logo: 'https://via.placeholder.com/100?text=Cartoon', contentRating: 'G', accessLevel: 'public' },
      { name: 'Nickelodeon', category: 'Kids', description: 'Nickelodeon Channel', streamUrl: 'https://stream.nickelodeon.com/live', logo: 'https://via.placeholder.com/100?text=Nick', contentRating: 'G', accessLevel: 'public' },
      { name: 'Disney Channel', category: 'Kids', description: 'Disney Channel', streamUrl: 'https://stream.disneychannel.com/live', logo: 'https://via.placeholder.com/100?text=Disney', contentRating: 'G', accessLevel: 'public' },
      { name: 'PBS Kids', category: 'Kids', description: 'PBS Kids Programming', streamUrl: 'https://stream.pbskids.com/live', logo: 'https://via.placeholder.com/100?text=PBS+Kids', contentRating: 'G', accessLevel: 'public' },
      { name: 'Boomerang', category: 'Kids', description: 'Boomerang Cartoons', streamUrl: 'https://stream.boomerang.com/live', logo: 'https://via.placeholder.com/100?text=Boomerang', contentRating: 'G', accessLevel: 'public' },

      // International
      { name: 'France 24', category: 'International', description: 'France 24 News', streamUrl: 'https://stream.france24.com/live', logo: 'https://via.placeholder.com/100?text=France24', contentRating: 'G', accessLevel: 'public' },
      { name: 'DW', category: 'International', description: 'Deutsche Welle', streamUrl: 'https://stream.dw.com/live', logo: 'https://via.placeholder.com/100?text=DW', contentRating: 'G', accessLevel: 'public' },
      { name: 'NHK World', category: 'International', description: 'NHK World Japan', streamUrl: 'https://stream.nhkworld.com/live', logo: 'https://via.placeholder.com/100?text=NHK', contentRating: 'G', accessLevel: 'public' },
      { name: 'CCTV', category: 'International', description: 'China Central Television', streamUrl: 'https://stream.cctv.com/live', logo: 'https://via.placeholder.com/100?text=CCTV', contentRating: 'G', accessLevel: 'public' },
      { name: 'Russia Today', category: 'International', description: 'Russia Today News', streamUrl: 'https://stream.rt.com/live', logo: 'https://via.placeholder.com/100?text=RT', contentRating: 'G', accessLevel: 'public' },

      // Adult (18+)
      { name: 'Adult Channel 1', category: 'Adult', description: 'Adult Content Channel', streamUrl: 'https://stream.adult1.com/live', logo: 'https://via.placeholder.com/100?text=Adult', contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18' },
      { name: 'Adult Channel 2', category: 'Adult', description: 'Adult Content Channel', streamUrl: 'https://stream.adult2.com/live', logo: 'https://via.placeholder.com/100?text=Adult', contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18' },
      { name: 'Adult Channel 3', category: 'Adult', description: 'Adult Content Channel', streamUrl: 'https://stream.adult3.com/live', logo: 'https://via.placeholder.com/100?text=Adult', contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18' },
      { name: 'Adult Channel 4', category: 'Adult', description: 'Adult Content Channel', streamUrl: 'https://stream.adult4.com/live', logo: 'https://via.placeholder.com/100?text=Adult', contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18' },
      { name: 'Adult Channel 5', category: 'Adult', description: 'Adult Content Channel', streamUrl: 'https://stream.adult5.com/live', logo: 'https://via.placeholder.com/100?text=Adult', contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18' },
    ];

    let created = 0;
    for (const channel of channels) {
      try {
        // Use raw query since schema import is problematic
        await db.execute(`
          INSERT INTO iptv_channels (name, category, description, streamUrl, logo, contentRating, isAdultContent, accessLevel, isActive, viewerCount, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE viewerCount = VALUES(viewerCount)
        ` as any, [
          channel.name,
          channel.category,
          channel.description,
          channel.streamUrl,
          channel.logo,
          channel.contentRating,
          channel.isAdultContent || false ? 1 : 0,
          channel.accessLevel,
          1,
          Math.floor(Math.random() * 10000),
        ]);
        created++;
      } catch (err) {
        console.error(`Failed to create ${channel.name}:`, err);
      }
    }

    return { success: true, created, message: `Created ${created} IPTV channels` };
  }),

  /**
   * Seed VOD movies (public)
   */
  seedVODMovies: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const movies = [
      { title: 'The Shawshank Redemption', genre: 'Drama', director: 'Frank Darabont', duration: 142, releaseYear: 1994, imdbRating: 9.3, contentRating: 'R' },
      { title: 'The Godfather', genre: 'Drama', director: 'Francis Ford Coppola', duration: 175, releaseYear: 1972, imdbRating: 9.2, contentRating: 'R' },
      { title: 'The Dark Knight', genre: 'Action', director: 'Christopher Nolan', duration: 152, releaseYear: 2008, imdbRating: 9.0, contentRating: 'PG-13' },
      { title: 'Inception', genre: 'Sci-Fi', director: 'Christopher Nolan', duration: 148, releaseYear: 2010, imdbRating: 8.8, contentRating: 'PG-13' },
      { title: 'Forrest Gump', genre: 'Drama', director: 'Robert Zemeckis', duration: 142, releaseYear: 1994, imdbRating: 8.8, contentRating: 'PG-13' },
      { title: 'Pulp Fiction', genre: 'Thriller', director: 'Quentin Tarantino', duration: 154, releaseYear: 1994, imdbRating: 8.9, contentRating: 'R' },
      { title: 'The Matrix', genre: 'Sci-Fi', director: 'Lana Wachowski, Lilly Wachowski', duration: 136, releaseYear: 1999, imdbRating: 8.7, contentRating: 'R' },
      { title: 'Interstellar', genre: 'Sci-Fi', director: 'Christopher Nolan', duration: 169, releaseYear: 2014, imdbRating: 8.6, contentRating: 'PG-13' },
      { title: 'The Lion King', genre: 'Animation', director: 'Roger Allers, Rob Minkoff', duration: 88, releaseYear: 1994, imdbRating: 8.5, contentRating: 'G' },
      { title: 'Toy Story', genre: 'Animation', director: 'John Lasseter', duration: 81, releaseYear: 1995, imdbRating: 8.3, contentRating: 'G' },
      { title: 'Gladiator', genre: 'Action', director: 'Ridley Scott', duration: 155, releaseYear: 2000, imdbRating: 8.5, contentRating: 'R' },
      { title: 'The Avengers', genre: 'Action', director: 'Joss Whedon', duration: 143, releaseYear: 2012, imdbRating: 8.0, contentRating: 'PG-13' },
      { title: 'Titanic', genre: 'Drama', director: 'James Cameron', duration: 194, releaseYear: 1997, imdbRating: 7.8, contentRating: 'PG-13' },
      { title: 'Avatar', genre: 'Sci-Fi', director: 'James Cameron', duration: 162, releaseYear: 2009, imdbRating: 7.8, contentRating: 'PG-13' },
      { title: 'The Silence of the Lambs', genre: 'Thriller', director: 'Jonathan Demme', duration: 118, releaseYear: 1991, imdbRating: 8.6, contentRating: 'R' },
    ];

    let created = 0;
    for (const movie of movies) {
      try {
        await db.execute(`
          INSERT INTO vod_movies (title, description, genre, director, duration, releaseYear, imdbRating, contentRating, posterUrl, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE releaseYear = VALUES(releaseYear)
        ` as any, [
          movie.title,
          `${movie.title} (${movie.releaseYear}) - ${movie.genre} film directed by ${movie.director}`,
          movie.genre,
          movie.director,
          movie.duration,
          movie.releaseYear,
          movie.imdbRating,
          movie.contentRating,
          `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title)}`,
          1,
        ]);
        created++;
      } catch (err) {
        console.error(`Failed to create ${movie.title}:`, err);
      }
    }

    return { success: true, created, message: `Created ${created} VOD movies` };
  }),

  /**
   * Seed VOD series (public)
   */
  seedVODSeries: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const series = [
      { title: 'Breaking Bad', genre: 'Drama', creator: 'Vince Gilligan', totalSeasons: 5, totalEpisodes: 62, imdbRating: 9.5, contentRating: 'TV-14' },
      { title: 'Game of Thrones', genre: 'Drama', creator: 'David Benioff, D. B. Weiss', totalSeasons: 8, totalEpisodes: 73, imdbRating: 9.2, contentRating: 'TV-MA' },
      { title: 'Stranger Things', genre: 'Drama', creator: 'The Duffer Brothers', totalSeasons: 4, totalEpisodes: 42, imdbRating: 8.7, contentRating: 'TV-14' },
      { title: 'The Crown', genre: 'Drama', creator: 'Peter Morgan', totalSeasons: 5, totalEpisodes: 50, imdbRating: 8.6, contentRating: 'TV-14' },
      { title: 'The Office', genre: 'Comedy', creator: 'Greg Daniels', totalSeasons: 9, totalEpisodes: 201, imdbRating: 9.0, contentRating: 'TV-14' },
      { title: 'Friends', genre: 'Comedy', creator: 'David Crane, Marta Kauffman', totalSeasons: 10, totalEpisodes: 236, imdbRating: 8.9, contentRating: 'TV-14' },
      { title: 'The Sopranos', genre: 'Drama', creator: 'David Chase', totalSeasons: 6, totalEpisodes: 86, imdbRating: 9.2, contentRating: 'TV-MA' },
      { title: 'True Detective', genre: 'Drama', creator: 'Nic Pizzolatto', totalSeasons: 4, totalEpisodes: 24, imdbRating: 8.9, contentRating: 'TV-MA' },
      { title: 'Sherlock', genre: 'Drama', creator: 'Mark Gatiss, Steven Moffat', totalSeasons: 4, totalEpisodes: 13, imdbRating: 9.1, contentRating: 'TV-14' },
      { title: 'The Mandalorian', genre: 'Sci-Fi', creator: 'Jon Favreau', totalSeasons: 3, totalEpisodes: 24, imdbRating: 8.7, contentRating: 'TV-14' },
    ];

    let created = 0;
    for (const s of series) {
      try {
        await db.execute(`
          INSERT INTO vod_series (title, description, genre, creator, totalSeasons, totalEpisodes, imdbRating, contentRating, posterUrl, isActive, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE totalSeasons = VALUES(totalSeasons)
        ` as any, [
          s.title,
          `${s.title} - ${s.totalSeasons} seasons, ${s.totalEpisodes} episodes. Created by ${s.creator}`,
          s.genre,
          s.creator,
          s.totalSeasons,
          s.totalEpisodes,
          s.imdbRating,
          s.contentRating,
          `https://via.placeholder.com/300x450?text=${encodeURIComponent(s.title)}`,
          1,
        ]);
        created++;
      } catch (err) {
        console.error(`Failed to create ${s.title}:`, err);
      }
    }

    return { success: true, created, message: `Created ${created} VOD series` };
  }),
});
