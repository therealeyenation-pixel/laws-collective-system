/**
 * Admin Seeding Router
 * Procedures to populate database with initial channels and content
 * Protected - admin only
 */

import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { iptvChannels, broadcastRadioChannels, vodMovies, vodSeries } from '../../drizzle/schema';

export const adminSeedRouter = router({
  /**
   * Seed IPTV channels
   */
  seedIPTVChannels: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Admin access required');
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
        const database = await db.getDb();
        if (!database) throw new Error('Database not available');
        await database.insert(iptvChannels).values({
          name: channel.name,
          category: channel.category,
          description: channel.description,
          streamUrl: channel.streamUrl,
          logo: channel.logo,
          contentRating: channel.contentRating as any,
          isAdultContent: channel.isAdultContent || false,
          accessLevel: channel.accessLevel as any,
          isActive: true,
          viewerCount: Math.floor(Math.random() * 10000),
        });
        created++;
      } catch (err) {
        console.error(`Failed to create ${channel.name}:`, err);
      }
    }

    return { success: true, created, message: `Created ${created} IPTV channels` };
  }),

  /**
   * Seed VOD movies
   */
  seedVODMovies: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const movies = [
      { title: 'The Dark Knight', genre: 'Action', director: 'Christopher Nolan', releaseYear: 2008, duration: 152, contentRating: 'PG-13', imdbRating: 9.0, cast: 'Christian Bale, Heath Ledger' },
      { title: 'Inception', genre: 'Action', director: 'Christopher Nolan', releaseYear: 2010, duration: 148, contentRating: 'PG-13', imdbRating: 8.8, cast: 'Leonardo DiCaprio, Marion Cotillard' },
      { title: 'The Shawshank Redemption', genre: 'Drama', director: 'Frank Darabont', releaseYear: 1994, duration: 142, contentRating: 'R', imdbRating: 9.3, cast: 'Tim Robbins, Morgan Freeman' },
      { title: 'Forrest Gump', genre: 'Drama', director: 'Robert Zemeckis', releaseYear: 1994, duration: 142, contentRating: 'PG-13', imdbRating: 8.8, cast: 'Tom Hanks, Gary Sinise' },
      { title: 'The Godfather', genre: 'Drama', director: 'Francis Ford Coppola', releaseYear: 1972, duration: 175, contentRating: 'R', imdbRating: 9.2, cast: 'Marlon Brando, Al Pacino' },
      { title: 'Pulp Fiction', genre: 'Drama', director: 'Quentin Tarantino', releaseYear: 1994, duration: 154, contentRating: 'R', imdbRating: 8.9, cast: 'John Travolta, Samuel L. Jackson' },
      { title: 'The Grand Budapest Hotel', genre: 'Comedy', director: 'Wes Anderson', releaseYear: 2014, duration: 99, contentRating: 'R', imdbRating: 8.1, cast: 'Ralph Fiennes, Tony Revolori' },
      { title: 'Superbad', genre: 'Comedy', director: 'Greg Mottola', releaseYear: 2007, duration: 113, contentRating: 'R', imdbRating: 7.6, cast: 'Jonah Hill, Michael Cera' },
      { title: 'Se7en', genre: 'Thriller', director: 'David Fincher', releaseYear: 1995, duration: 127, contentRating: 'R', imdbRating: 8.6, cast: 'Brad Pitt, Morgan Freeman' },
      { title: 'The Sixth Sense', genre: 'Thriller', director: 'M. Night Shyamalan', releaseYear: 1999, duration: 107, contentRating: 'PG-13', imdbRating: 8.2, cast: 'Bruce Willis, Haley Joel Osment' },
      { title: 'Interstellar', genre: 'Sci-Fi', director: 'Christopher Nolan', releaseYear: 2014, duration: 169, contentRating: 'PG-13', imdbRating: 8.6, cast: 'Matthew McConaughey, Anne Hathaway' },
      { title: 'Blade Runner 2049', genre: 'Sci-Fi', director: 'Denis Villeneuve', releaseYear: 2017, duration: 164, contentRating: 'R', imdbRating: 8.0, cast: 'Ryan Gosling, Harrison Ford' },
      { title: 'The Shining', genre: 'Horror', director: 'Stanley Kubrick', releaseYear: 1980, duration: 146, contentRating: 'R', imdbRating: 8.4, cast: 'Jack Nicholson, Shelley Duvall' },
      { title: 'Hereditary', genre: 'Horror', director: 'Ari Aster', releaseYear: 2018, duration: 127, contentRating: 'R', imdbRating: 7.3, cast: 'Toni Collette, Gabriel Byrne' },
      { title: 'Spirited Away', genre: 'Animation', director: 'Hayao Miyazaki', releaseYear: 2001, duration: 125, contentRating: 'PG', imdbRating: 8.6, cast: 'Daveigh Chase, Suzanne Pleshette' },
    ];

    let created = 0;
    for (const movie of movies) {
      try {
        const database = await db.getDb();
        if (!database) throw new Error('Database not available');
        await database.insert(vodMovies).values({
          title: movie.title,
          description: `${movie.title} (${movie.releaseYear}) - ${movie.genre} film directed by ${movie.director}`,
          genre: movie.genre,
          director: movie.director,
          releaseYear: movie.releaseYear,
          duration: movie.duration,
          contentRating: movie.contentRating as any,
          isAdultContent: false,
          accessLevel: 'public',
          imdbRating: movie.imdbRating as any,
          cast: movie.cast,
          videoUrl: `https://stream.example.com/movies/${movie.title.replace(/\s+/g, '-').toLowerCase()}.mp4`,
          isPublished: true,
          isAvailable: true,
        });
        created++;
      } catch (err) {
        console.error(`Failed to create ${movie.title}:`, err);
      }
    }

    return { success: true, created, message: `Created ${created} VOD movies` };
  }),

  /**
   * Seed VOD series
   */
  seedVODSeries: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const series = [
      { title: 'Breaking Bad', genre: 'Drama', creator: 'Vince Gilligan', releaseYear: 2008, totalSeasons: 5, totalEpisodes: 62, contentRating: 'R', imdbRating: 9.5, cast: 'Bryan Cranston, Aaron Paul' },
      { title: 'Game of Thrones', genre: 'Fantasy', creator: 'David Benioff, D.B. Weiss', releaseYear: 2011, totalSeasons: 8, totalEpisodes: 73, contentRating: 'R', imdbRating: 9.2, cast: 'Emilia Clarke, Peter Dinklage' },
      { title: 'The Office', genre: 'Comedy', creator: 'Greg Daniels', releaseYear: 2005, totalSeasons: 9, totalEpisodes: 201, contentRating: 'TV-14', imdbRating: 9.0, cast: 'Steve Carell, Rainn Wilson' },
      { title: 'Stranger Things', genre: 'Sci-Fi', creator: 'Duffer Brothers', releaseYear: 2016, totalSeasons: 4, totalEpisodes: 42, contentRating: 'TV-14', imdbRating: 8.7, cast: 'Winona Ryder, David Harbour' },
      { title: 'The Crown', genre: 'Drama', creator: 'Peter Morgan', releaseYear: 2016, totalSeasons: 5, totalEpisodes: 50, contentRating: 'TV-14', imdbRating: 8.6, cast: 'Claire Foy, Olivia Colman' },
      { title: 'The Mandalorian', genre: 'Sci-Fi', creator: 'Jon Favreau', releaseYear: 2019, totalSeasons: 3, totalEpisodes: 24, contentRating: 'TV-14', imdbRating: 8.7, cast: 'Pedro Pascal, Gina Carano' },
      { title: 'Sherlock', genre: 'Mystery', creator: 'Mark Gatiss, Steven Moffat', releaseYear: 2010, totalSeasons: 4, totalEpisodes: 13, contentRating: 'TV-14', imdbRating: 9.1, cast: 'Benedict Cumberbatch, Martin Freeman' },
      { title: 'The Sopranos', genre: 'Drama', creator: 'David Chase', releaseYear: 1999, totalSeasons: 6, totalEpisodes: 86, contentRating: 'R', imdbRating: 9.2, cast: 'James Gandolfini, Lorraine Bracco' },
      { title: 'Westworld', genre: 'Sci-Fi', creator: 'Jonathan Nolan, Lisa Joy', releaseYear: 2016, totalSeasons: 4, totalEpisodes: 36, contentRating: 'R', imdbRating: 8.5, cast: 'Evan Rachel Wood, Anthony Hopkins' },
      { title: 'The Witcher', genre: 'Fantasy', creator: 'Lauren Schmidt Hissrich', releaseYear: 2019, totalSeasons: 3, totalEpisodes: 24, contentRating: 'TV-MA', imdbRating: 8.2, cast: 'Henry Cavill, Anya Chalotra' },
    ];

    let created = 0;
    for (const s of series) {
      try {
        const database = await db.getDb();
        if (!database) throw new Error('Database not available');
        await database.insert(vodSeries).values({
          title: s.title,
          description: `${s.title} - ${s.totalSeasons} seasons, ${s.totalEpisodes} episodes. Created by ${s.creator}`,
          genre: s.genre,
          creator: s.creator,
          releaseYear: s.releaseYear,
          totalSeasons: s.totalSeasons,
          totalEpisodes: s.totalEpisodes,
          contentRating: s.contentRating as any,
          isAdultContent: false,
          accessLevel: 'public',
          imdbRating: s.imdbRating as any,
          cast: s.cast,
          isPublished: true,
          isAvailable: true,
          status: 'ongoing',
        });
        created++;
      } catch (err) {
        console.error(`Failed to create ${s.title}:`, err);
      }
    }

    return { success: true, created, message: `Created ${created} VOD series` };
  }),
});
