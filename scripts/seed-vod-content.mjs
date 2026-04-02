#!/usr/bin/env node

/**
 * VOD Content Seeding Script
 * Populates the VOD library with movies and series
 * This is for internal testing - not public yet
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test_db',
});

// VOD Movies Database
const vodMovies = [
  // Action & Adventure
  { title: 'The Dark Knight', genre: 'Action', director: 'Christopher Nolan', releaseYear: 2008, duration: 152, contentRating: 'PG-13', imdbRating: 9.0, cast: 'Christian Bale, Heath Ledger, Aaron Eckhart' },
  { title: 'Inception', genre: 'Action', director: 'Christopher Nolan', releaseYear: 2010, duration: 148, contentRating: 'PG-13', imdbRating: 8.8, cast: 'Leonardo DiCaprio, Marion Cotillard, Ellen Page' },
  { title: 'Mad Max: Fury Road', genre: 'Action', director: 'George Miller', releaseYear: 2015, duration: 120, contentRating: 'R', imdbRating: 8.1, cast: 'Tom Hardy, Charlize Theron' },
  { title: 'John Wick', genre: 'Action', director: 'Chad Stahelski', releaseYear: 2014, duration: 101, contentRating: 'R', imdbRating: 7.4, cast: 'Keanu Reeves, Michael Nyqvist' },
  { title: 'The Matrix', genre: 'Action', director: 'Wachowskis', releaseYear: 1999, duration: 136, contentRating: 'R', imdbRating: 8.7, cast: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss' },

  // Drama
  { title: 'The Shawshank Redemption', genre: 'Drama', director: 'Frank Darabont', releaseYear: 1994, duration: 142, contentRating: 'R', imdbRating: 9.3, cast: 'Tim Robbins, Morgan Freeman' },
  { title: 'Forrest Gump', genre: 'Drama', director: 'Robert Zemeckis', releaseYear: 1994, duration: 142, contentRating: 'PG-13', imdbRating: 8.8, cast: 'Tom Hanks, Gary Sinise' },
  { title: 'The Godfather', genre: 'Drama', director: 'Francis Ford Coppola', releaseYear: 1972, duration: 175, contentRating: 'R', imdbRating: 9.2, cast: 'Marlon Brando, Al Pacino, James Caan' },
  { title: 'Pulp Fiction', genre: 'Drama', director: 'Quentin Tarantino', releaseYear: 1994, duration: 154, contentRating: 'R', imdbRating: 8.9, cast: 'John Travolta, Samuel L. Jackson, Uma Thurman' },
  { title: 'The Silence of the Lambs', genre: 'Drama', director: 'Jonathan Demme', releaseYear: 1991, duration: 118, contentRating: 'R', imdbRating: 8.6, cast: 'Jodie Foster, Anthony Hopkins' },

  // Comedy
  { title: 'The Grand Budapest Hotel', genre: 'Comedy', director: 'Wes Anderson', releaseYear: 2014, duration: 99, contentRating: 'R', imdbRating: 8.1, cast: 'Ralph Fiennes, Tony Revolori' },
  { title: 'Superbad', genre: 'Comedy', director: 'Greg Mottola', releaseYear: 2007, duration: 113, contentRating: 'R', imdbRating: 7.6, cast: 'Jonah Hill, Michael Cera, Christopher Mintz-Plasse' },
  { title: 'The Hangover', genre: 'Comedy', director: 'Todd Phillips', releaseYear: 2009, duration: 100, contentRating: 'R', imdbRating: 7.7, cast: 'Bradley Cooper, Ed Helms, Zach Galifianakis' },
  { title: 'Bridesmaids', genre: 'Comedy', director: 'Paul Feig', releaseYear: 2011, duration: 125, contentRating: 'R', imdbRating: 7.8, cast: 'Kristen Wiig, Maya Rudolph, Rose Byrne' },
  { title: 'Knives Out', genre: 'Comedy', director: 'Rian Johnson', releaseYear: 2019, duration: 130, contentRating: 'PG-13', imdbRating: 8.4, cast: 'Daniel Craig, Ana de Armas, Chris Evans' },

  // Thriller & Mystery
  { title: 'Se7en', genre: 'Thriller', director: 'David Fincher', releaseYear: 1995, duration: 127, contentRating: 'R', imdbRating: 8.6, cast: 'Brad Pitt, Morgan Freeman' },
  { title: 'The Sixth Sense', genre: 'Thriller', director: 'M. Night Shyamalan', releaseYear: 1999, duration: 107, contentRating: 'PG-13', imdbRating: 8.2, cast: 'Bruce Willis, Haley Joel Osment' },
  { title: 'Parasite', genre: 'Thriller', director: 'Bong Joon-ho', releaseYear: 2019, duration: 132, contentRating: 'R', imdbRating: 8.6, cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong' },
  { title: 'Zodiac', genre: 'Thriller', director: 'David Fincher', releaseYear: 2007, duration: 158, contentRating: 'R', imdbRating: 7.3, cast: 'Jake Gyllenhaal, Mark Ruffalo, Robert Downey Jr.' },
  { title: 'Memento', genre: 'Thriller', director: 'Christopher Nolan', releaseYear: 2000, duration: 113, contentRating: 'R', imdbRating: 8.4, cast: 'Guy Pearce, Carrie-Anne Moss, Joe Pantoliana' },

  // Science Fiction
  { title: 'Interstellar', genre: 'Sci-Fi', director: 'Christopher Nolan', releaseYear: 2014, duration: 169, contentRating: 'PG-13', imdbRating: 8.6, cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain' },
  { title: 'Blade Runner 2049', genre: 'Sci-Fi', director: 'Denis Villeneuve', releaseYear: 2017, duration: 164, contentRating: 'R', imdbRating: 8.0, cast: 'Ryan Gosling, Harrison Ford, Ana de Armas' },
  { title: 'Arrival', genre: 'Sci-Fi', director: 'Denis Villeneuve', releaseYear: 2016, duration: 116, contentRating: 'PG-13', imdbRating: 7.9, cast: 'Amy Adams, Jeremy Renner' },
  { title: 'The Fifth Element', genre: 'Sci-Fi', director: 'Luc Besson', releaseYear: 1997, duration: 126, contentRating: 'PG-13', imdbRating: 7.5, cast: 'Bruce Willis, Milla Jovovich, Gary Oldman' },
  { title: 'Dune', genre: 'Sci-Fi', director: 'Denis Villeneuve', releaseYear: 2021, duration: 156, contentRating: 'PG-13', imdbRating: 8.0, cast: 'Timothée Chalamet, Oscar Isaac, Zendaya' },

  // Horror
  { title: 'The Shining', genre: 'Horror', director: 'Stanley Kubrick', releaseYear: 1980, duration: 146, contentRating: 'R', imdbRating: 8.4, cast: 'Jack Nicholson, Shelley Duvall' },
  { title: 'Hereditary', genre: 'Horror', director: 'Ari Aster', releaseYear: 2018, duration: 127, contentRating: 'R', imdbRating: 7.3, cast: 'Toni Collette, Gabriel Byrne, Milly Shapiro' },
  { title: 'The Exorcist', genre: 'Horror', director: 'William Friedkin', releaseYear: 1973, duration: 132, contentRating: 'R', imdbRating: 8.0, cast: 'Ellen Burstyn, Max von Sydow, Linda Blair' },
  { title: 'Get Out', genre: 'Horror', director: 'Jordan Peele', releaseYear: 2017, duration: 104, contentRating: 'R', imdbRating: 7.7, cast: 'Daniel Kaluuya, Allison Williams' },
  { title: 'A Quiet Place', genre: 'Horror', director: 'John Krasinski', releaseYear: 2018, duration: 90, contentRating: 'PG-13', imdbRating: 7.5, cast: 'Emily Blunt, John Krasinski' },

  // Animation
  { title: 'Spirited Away', genre: 'Animation', director: 'Hayao Miyazaki', releaseYear: 2001, duration: 125, contentRating: 'PG', imdbRating: 8.6, cast: 'Daveigh Chase, Suzanne Pleshette' },
  { title: 'Coco', genre: 'Animation', director: 'Lee Unkrich, Adrian Molina', releaseYear: 2017, duration: 105, contentRating: 'PG', imdbRating: 8.4, cast: 'Anthony Gonzalez, Gael García Bernal' },
  { title: 'Toy Story', genre: 'Animation', director: 'John Lasseter', releaseYear: 1995, duration: 81, contentRating: 'G', imdbRating: 8.3, cast: 'Tom Hanks, Tim Allen' },
  { title: 'The Lion King', genre: 'Animation', director: 'Roger Allers, Rob Minkoff', releaseYear: 1994, duration: 88, contentRating: 'G', imdbRating: 8.5, cast: 'James Earl Jones, Jeremy Irons' },
  { title: 'Frozen', genre: 'Animation', director: 'Chris Buck, Jennifer Lee', releaseYear: 2013, duration: 102, contentRating: 'PG', imdbRating: 7.4, cast: 'Kristen Bell, Idina Menzel' },

  // Family
  { title: 'E.T. the Extra-Terrestrial', genre: 'Family', director: 'Steven Spielberg', releaseYear: 1982, duration: 115, contentRating: 'PG', imdbRating: 7.9, cast: 'Henry Thomas, Drew Barrymore' },
  { title: 'Back to the Future', genre: 'Family', director: 'Robert Zemeckis', releaseYear: 1985, duration: 116, contentRating: 'PG', imdbRating: 8.5, cast: 'Michael J. Fox, Christopher Lloyd' },
  { title: 'Jurassic Park', genre: 'Family', director: 'Steven Spielberg', releaseYear: 1993, duration: 127, contentRating: 'PG-13', imdbRating: 8.2, cast: 'Sam Neill, Laura Dern, Jeff Goldblum' },
  { title: 'The Wizard of Oz', genre: 'Family', director: 'Victor Fleming', releaseYear: 1939, duration: 102, contentRating: 'G', imdbRating: 8.1, cast: 'Judy Garland, Ray Bolger' },
  { title: 'Willy Wonka & the Chocolate Factory', genre: 'Family', director: 'Mel Stuart', releaseYear: 1971, duration: 100, contentRating: 'G', imdbRating: 7.8, cast: 'Gene Wilder, Jack Albertson' },

  // Adult Content (18+)
  { title: 'Nymphomaniac', genre: 'Adult', director: 'Lars von Trier', releaseYear: 2013, duration: 117, contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18', imdbRating: 6.4, cast: 'Charlotte Gainsbourg, Stellan Skarsgård' },
  { title: 'Blue is the Warmest Color', genre: 'Adult', director: 'Abdellatif Kechiche', releaseYear: 2013, duration: 179, contentRating: 'X', isAdultContent: true, accessLevel: 'verified_18', imdbRating: 7.7, cast: 'Adèle Exarchopoulos, Léa Seydoux' },
];

// VOD Series Database
const vodSeries = [
  { title: 'Breaking Bad', genre: 'Drama', creator: 'Vince Gilligan', releaseYear: 2008, totalSeasons: 5, totalEpisodes: 62, contentRating: 'R', imdbRating: 9.5, cast: 'Bryan Cranston, Aaron Paul, Anna Gunn' },
  { title: 'Game of Thrones', genre: 'Fantasy', creator: 'David Benioff, D.B. Weiss', releaseYear: 2011, totalSeasons: 8, totalEpisodes: 73, contentRating: 'R', imdbRating: 9.2, cast: 'Emilia Clarke, Peter Dinklage, Lena Headey' },
  { title: 'The Office', genre: 'Comedy', creator: 'Greg Daniels', releaseYear: 2005, totalSeasons: 9, totalEpisodes: 201, contentRating: 'TV-14', imdbRating: 9.0, cast: 'Steve Carell, Rainn Wilson, Jenna Fischer' },
  { title: 'Stranger Things', genre: 'Sci-Fi', creator: 'Duffer Brothers', releaseYear: 2016, totalSeasons: 4, totalEpisodes: 42, contentRating: 'TV-14', imdbRating: 8.7, cast: 'Winona Ryder, David Harbour, Millie Bobby Brown' },
  { title: 'The Crown', genre: 'Drama', creator: 'Peter Morgan', releaseYear: 2016, totalSeasons: 5, totalEpisodes: 50, contentRating: 'TV-14', imdbRating: 8.6, cast: 'Claire Foy, Olivia Colman, Imelda Staunton' },
  { title: 'The Mandalorian', genre: 'Sci-Fi', creator: 'Jon Favreau', releaseYear: 2019, totalSeasons: 3, totalEpisodes: 24, contentRating: 'TV-14', imdbRating: 8.7, cast: 'Pedro Pascal, Gina Carano' },
  { title: 'Sherlock', genre: 'Mystery', creator: 'Mark Gatiss, Steven Moffat', releaseYear: 2010, totalSeasons: 4, totalEpisodes: 13, contentRating: 'TV-14', imdbRating: 9.1, cast: 'Benedict Cumberbatch, Martin Freeman' },
  { title: 'The Sopranos', genre: 'Drama', creator: 'David Chase', releaseYear: 1999, totalSeasons: 6, totalEpisodes: 86, contentRating: 'R', imdbRating: 9.2, cast: 'James Gandolfini, Lorraine Bracco' },
  { title: 'Westworld', genre: 'Sci-Fi', creator: 'Jonathan Nolan, Lisa Joy', releaseYear: 2016, totalSeasons: 4, totalEpisodes: 36, contentRating: 'R', imdbRating: 8.5, cast: 'Evan Rachel Wood, Anthony Hopkins, Ed Harris' },
  { title: 'The Witcher', genre: 'Fantasy', creator: 'Lauren Schmidt Hissrich', releaseYear: 2019, totalSeasons: 3, totalEpisodes: 24, contentRating: 'TV-MA', imdbRating: 8.2, cast: 'Henry Cavill, Anya Chalotra, Freya Allan' },
];

async function seedVODContent() {
  try {
    console.log('🚀 Starting VOD content seeding...\n');

    // Seed Movies
    console.log('🎬 Seeding VOD Movies...');
    let movieCount = 0;
    for (const movie of vodMovies) {
      const query = `
        INSERT INTO vod_movies (
          title, description, genre, director, releaseYear, duration,
          contentRating, isAdultContent, accessLevel, imdbRating,
          cast, isPublished, isAvailable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        movie.title,
        `${movie.title} (${movie.releaseYear}) - ${movie.genre} film directed by ${movie.director}`,
        movie.genre,
        movie.director,
        movie.releaseYear,
        movie.duration,
        movie.contentRating,
        movie.isAdultContent ? 1 : 0,
        movie.accessLevel || 'public',
        movie.imdbRating,
        movie.cast,
        1, // isPublished
        1, // isAvailable
      ];

      try {
        await connection.execute(query, values);
        movieCount++;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          console.error(`  ❌ Failed to insert ${movie.title}:`, err.message);
        }
      }
    }
    console.log(`  ✅ Seeded ${movieCount} VOD movies\n`);

    // Seed Series
    console.log('📺 Seeding VOD Series...');
    let seriesCount = 0;
    for (const series of vodSeries) {
      const query = `
        INSERT INTO vod_series (
          title, description, genre, creator, releaseYear, totalSeasons,
          totalEpisodes, contentRating, isAdultContent, accessLevel,
          imdbRating, cast, isPublished, isAvailable, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        series.title,
        `${series.title} - ${series.totalSeasons} seasons, ${series.totalEpisodes} episodes. Created by ${series.creator}`,
        series.genre,
        series.creator,
        series.releaseYear,
        series.totalSeasons,
        series.totalEpisodes,
        series.contentRating,
        series.isAdultContent ? 1 : 0,
        series.accessLevel || 'public',
        series.imdbRating,
        series.cast,
        1, // isPublished
        1, // isAvailable
        'ongoing',
      ];

      try {
        await connection.execute(query, values);
        seriesCount++;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          console.error(`  ❌ Failed to insert ${series.title}:`, err.message);
        }
      }
    }
    console.log(`  ✅ Seeded ${seriesCount} VOD series\n`);

    console.log('✨ VOD content seeding complete!');
    console.log(`📊 Summary:`);
    console.log(`   - VOD Movies: ${movieCount}`);
    console.log(`   - VOD Series: ${seriesCount}`);
    console.log(`   - Total: ${movieCount + seriesCount}`);
    console.log(`\n🎥 Content Breakdown:`);
    console.log(`   - Action/Adventure: 5 movies`);
    console.log(`   - Drama: 5 movies`);
    console.log(`   - Comedy: 5 movies`);
    console.log(`   - Thriller/Mystery: 5 movies`);
    console.log(`   - Sci-Fi: 5 movies`);
    console.log(`   - Horror: 5 movies`);
    console.log(`   - Animation: 5 movies`);
    console.log(`   - Family: 5 movies`);
    console.log(`   - Adult (18+): 2 movies`);
    console.log(`   - Premium Series: 10 series`);
    console.log(`\n🔐 Access Levels:`);
    console.log(`   - Public: 40 movies, 10 series`);
    console.log(`   - Adult (18+): 2 movies`);
    console.log(`\n⭐ Average IMDB Rating: 8.2`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await connection.end();
  }
}

seedVODContent();
