/**
 * VOD (Video-on-Demand) Router
 * Handles movies, series, episodes, watchlist, and viewing history
 */

import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';

export const vodRouter = router({
  /**
   * Get all VOD movies with filtering
   */
  getMovies: publicProcedure
    .input(
      z.object({
        genre: z.string().optional(),
        contentRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17', 'X', 'UNRATED']).optional(),
        accessLevel: z.enum(['public', 'members', 'verified_18', 'verified_21', 'premium']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        sortBy: z.enum(['newest', 'rating', 'views', 'trending']).default('newest'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const movies = await db.query.vodMovies.findMany({
          limit: input.limit,
          offset: input.offset,
        });

        // Filter by genre if specified
        if (input.genre) {
          return movies.filter((m) => m.genre === input.genre);
        }

        // Sort by specified criteria
        if (input.sortBy === 'rating') {
          return movies.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0));
        } else if (input.sortBy === 'views') {
          return movies.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        }

        return movies;
      } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
      }
    }),

  /**
   * Get all VOD series with filtering
   */
  getSeries: publicProcedure
    .input(
      z.object({
        genre: z.string().optional(),
        contentRating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17', 'X', 'UNRATED']).optional(),
        status: z.enum(['ongoing', 'completed', 'cancelled']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const series = await db.query.vodSeries.findMany({
          limit: input.limit,
          offset: input.offset,
        });

        if (input.genre) {
          return series.filter((s) => s.genre === input.genre);
        }

        if (input.status) {
          return series.filter((s) => s.status === input.status);
        }

        return series;
      } catch (error) {
        console.error('Error fetching series:', error);
        return [];
      }
    }),

  /**
   * Get movie details
   */
  getMovieDetails: publicProcedure
    .input(z.object({ movieId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const movie = await db.query.vodMovies.findFirst({
          where: (movies, { eq }) => eq(movies.id, input.movieId),
        });

        if (!movie) {
          throw new Error('Movie not found');
        }

        // Get reviews
        const reviews = await db.query.vodReviews.findMany({
          where: (reviews, { eq }) => eq(reviews.movieId, input.movieId),
          limit: 10,
        });

        return {
          ...movie,
          reviews,
        };
      } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
      }
    }),

  /**
   * Get series details with episodes
   */
  getSeriesDetails: publicProcedure
    .input(z.object({ seriesId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const series = await db.query.vodSeries.findFirst({
          where: (series, { eq }) => eq(series.id, input.seriesId),
        });

        if (!series) {
          throw new Error('Series not found');
        }

        // Get episodes
        const episodes = await db.query.vodEpisodes.findMany({
          where: (eps, { eq }) => eq(eps.seriesId, input.seriesId),
          limit: 100,
        });

        // Get reviews
        const reviews = await db.query.vodReviews.findMany({
          where: (reviews, { eq }) => eq(reviews.seriesId, input.seriesId),
          limit: 10,
        });

        return {
          ...series,
          episodes,
          reviews,
        };
      } catch (error) {
        console.error('Error fetching series details:', error);
        throw error;
      }
    }),

  /**
   * Get episodes for a series
   */
  getEpisodes: publicProcedure
    .input(
      z.object({
        seriesId: z.number(),
        seasonNumber: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const episodes = await db.query.vodEpisodes.findMany({
          limit: input.limit,
          offset: input.offset,
        });

        if (input.seasonNumber) {
          return episodes.filter((e) => e.seasonNumber === input.seasonNumber);
        }

        return episodes;
      } catch (error) {
        console.error('Error fetching episodes:', error);
        return [];
      }
    }),

  /**
   * Add movie to watchlist
   */
  addToWatchlist: protectedProcedure
    .input(
      z.object({
        movieId: z.number().optional(),
        seriesId: z.number().optional(),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(vodWatchlist).values({
          userId: ctx.user.id,
          movieId: input.movieId || null,
          seriesId: input.seriesId || null,
          priority: input.priority,
        });

        return {
          success: true,
          watchlistId: result.insertId,
          message: 'Added to watchlist',
        };
      } catch (error) {
        console.error('Error adding to watchlist:', error);
        throw error;
      }
    }),

  /**
   * Get user's watchlist
   */
  getWatchlist: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const watchlist = await db.query.vodWatchlist.findMany({
          where: (w, { eq }) => eq(w.userId, ctx.user.id),
          limit: input.limit,
          offset: input.offset,
        });

        return watchlist;
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        return [];
      }
    }),

  /**
   * Start watching (track viewing history)
   */
  startWatching: protectedProcedure
    .input(
      z.object({
        movieId: z.number().optional(),
        episodeId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(vodViewingHistory).values({
          userId: ctx.user.id,
          movieId: input.movieId || null,
          episodeId: input.episodeId || null,
          startTime: new Date(),
        });

        return {
          success: true,
          historyId: result.insertId,
          message: 'Viewing started',
        };
      } catch (error) {
        console.error('Error starting viewing:', error);
        throw error;
      }
    }),

  /**
   * Update viewing progress
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        historyId: z.number(),
        progress: z.number().min(0).max(100),
        duration: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const isCompleted = input.progress >= 90; // Mark as completed if 90%+ watched

        await db
          .update(vodViewingHistory)
          .set({
            progress: input.progress,
            duration: input.duration,
            isCompleted,
          })
          .where((h) => h.id === input.historyId);

        return {
          success: true,
          message: 'Progress updated',
        };
      } catch (error) {
        console.error('Error updating progress:', error);
        throw error;
      }
    }),

  /**
   * Get viewing history
   */
  getViewingHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const history = await db.query.vodViewingHistory.findMany({
          where: (h, { eq }) => eq(h.userId, ctx.user.id),
          limit: input.limit,
          offset: input.offset,
        });

        return history;
      } catch (error) {
        console.error('Error fetching viewing history:', error);
        return [];
      }
    }),

  /**
   * Add review/rating
   */
  addReview: protectedProcedure
    .input(
      z.object({
        movieId: z.number().optional(),
        seriesId: z.number().optional(),
        rating: z.number().min(1).max(5),
        reviewText: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await db.insert(vodReviews).values({
          userId: ctx.user.id,
          movieId: input.movieId || null,
          seriesId: input.seriesId || null,
          rating: input.rating,
          reviewText: input.reviewText,
        });

        return {
          success: true,
          reviewId: result.insertId,
          message: 'Review added',
        };
      } catch (error) {
        console.error('Error adding review:', error);
        throw error;
      }
    }),

  /**
   * Search VOD content
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        type: z.enum(['movie', 'series', 'all']).default('all'),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const results = {
          movies: [] as any[],
          series: [] as any[],
        };

        if (input.type === 'movie' || input.type === 'all') {
          const movies = await db.query.vodMovies.findMany({
            limit: input.limit,
          });

          results.movies = movies.filter(
            (m) =>
              m.title.toLowerCase().includes(input.query.toLowerCase()) ||
              m.director?.toLowerCase().includes(input.query.toLowerCase())
          );
        }

        if (input.type === 'series' || input.type === 'all') {
          const series = await db.query.vodSeries.findMany({
            limit: input.limit,
          });

          results.series = series.filter(
            (s) =>
              s.title.toLowerCase().includes(input.query.toLowerCase()) ||
              s.creator?.toLowerCase().includes(input.query.toLowerCase())
          );
        }

        return results;
      } catch (error) {
        console.error('Error searching VOD:', error);
        throw error;
      }
    }),

  /**
   * Get trending movies
   */
  getTrendingMovies: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      try {
        const movies = await db.query.vodMovies.findMany({
          limit: input.limit,
        });

        return movies.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } catch (error) {
        console.error('Error fetching trending movies:', error);
        return [];
      }
    }),

  /**
   * Get featured content
   */
  getFeaturedContent: publicProcedure.query(async ({ ctx }) => {
    try {
      const topMovies = await db.query.vodMovies.findMany({
        limit: 5,
      });

      const topSeries = await db.query.vodSeries.findMany({
        limit: 5,
      });

      return {
        movies: topMovies.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0)),
        series: topSeries.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0)),
      };
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return { movies: [], series: [] };
    }
  }),
});
