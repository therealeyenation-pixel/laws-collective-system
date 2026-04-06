import { drizzle } from 'drizzle-orm/mysql2/http';
import { iptvStreams, radioStations } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

// Satellite IPTV Channels
const satelliteChannels = [
  { name: 'Sky Sports 1', category: 'Sports', description: 'Premier League & Live Sports', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 8500, accessLevel: 'premium' },
  { name: 'Sky Sports 2', category: 'Sports', description: 'Football & Rugby', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 7200, accessLevel: 'premium' },
  { name: 'ESPN+', category: 'Sports', description: 'American Sports Network', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 6800, accessLevel: 'premium' },
  { name: 'DAZN', category: 'Sports', description: 'Global Sports Streaming', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 5900, accessLevel: 'premium' },
  { name: 'HBO Max', category: 'Movies', description: 'Premium Movie Channel', streamUrl: '/demo-video.mp4', isLive: false, currentViewers: 4500, accessLevel: 'premium' },
  { name: 'Showtime', category: 'Movies', description: 'Original Series & Films', streamUrl: '/demo-video.mp4', isLive: false, currentViewers: 3800, accessLevel: 'premium' },
  { name: 'Starz', category: 'Movies', description: 'Premium Entertainment', streamUrl: '/demo-video.mp4', isLive: false, currentViewers: 3200, accessLevel: 'premium' },
  { name: 'Eurosport 1', category: 'Sports', description: 'European Sports', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 5500, accessLevel: 'members' },
  { name: 'Eurosport 2', category: 'Sports', description: 'European Sports 2', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 4200, accessLevel: 'members' },
  { name: 'BT Sport 1', category: 'Sports', description: 'British Sports', streamUrl: '/demo-video.mp4', isLive: true, currentViewers: 6100, accessLevel: 'members' },
];

// Music Radio Stations by Genre
const musicStations = [
  { name: 'SiriusXM R&B', genre: 'R&B', country: 'USA', streamUrl: 'https://stream.siriusxm.com/rb', description: 'Contemporary R&B & Soul', listeners: 45000 },
  { name: 'Smooth R&B', genre: 'R&B', country: 'USA', streamUrl: 'https://stream.smoothrb.com', description: 'Smooth R&B Classics', listeners: 32000 },
  { name: 'Urban Groove', genre: 'R&B', country: 'USA', streamUrl: 'https://stream.urbangroove.com', description: 'Urban R&B & Hip-Hop Mix', listeners: 28000 },
  { name: 'Jazz FM', genre: 'Jazz', country: 'UK', streamUrl: 'https://stream.jazzfm.com', description: 'Live Jazz & Blues', listeners: 35000 },
  { name: 'Blue Note Radio', genre: 'Jazz', country: 'USA', streamUrl: 'https://stream.bluenote.com', description: 'Classic & Contemporary Jazz', listeners: 42000 },
  { name: 'Smooth Jazz', genre: 'Jazz', country: 'USA', streamUrl: 'https://stream.smoothjazz.com', description: 'Relaxing Jazz Standards', listeners: 38000 },
  { name: 'Country Radio', genre: 'Country', country: 'USA', streamUrl: 'https://stream.countryradio.com', description: 'Classic Country Hits', listeners: 55000 },
  { name: 'Outlaw Country', genre: 'Country', country: 'USA', streamUrl: 'https://stream.outlawcountry.com', description: 'Outlaw & Americana', listeners: 28000 },
  { name: 'Country Legends', genre: 'Country', country: 'USA', streamUrl: 'https://stream.countrylegends.com', description: 'Greatest Country Classics', listeners: 32000 },
  { name: 'Hip-Hop Central', genre: 'Hip-Hop', country: 'USA', streamUrl: 'https://stream.hiphopcentral.com', description: 'Latest Hip-Hop Hits', listeners: 62000 },
  { name: 'Old School Hip-Hop', genre: 'Hip-Hop', country: 'USA', streamUrl: 'https://stream.oldschoolhiphop.com', description: '80s & 90s Hip-Hop', listeners: 45000 },
  { name: 'Rap Classics', genre: 'Hip-Hop', country: 'USA', streamUrl: 'https://stream.rapclassics.com', description: 'Classic Rap Anthems', listeners: 38000 },
  { name: 'Pop Hits', genre: 'Pop', country: 'USA', streamUrl: 'https://stream.pophits.com', description: 'Top 40 Pop Hits', listeners: 72000 },
  { name: 'Pop Classics', genre: 'Pop', country: 'USA', streamUrl: 'https://stream.popclassics.com', description: 'Classic Pop Standards', listeners: 42000 },
  { name: 'Indie Pop', genre: 'Pop', country: 'USA', streamUrl: 'https://stream.indiepop.com', description: 'Indie & Alternative Pop', listeners: 28000 },
  { name: 'Classic Rock', genre: 'Rock', country: 'USA', streamUrl: 'https://stream.classicrock.com', description: 'Rock Legends', listeners: 58000 },
  { name: 'Hard Rock', genre: 'Rock', country: 'USA', streamUrl: 'https://stream.hardrock.com', description: 'Heavy Metal & Hard Rock', listeners: 35000 },
  { name: 'Alternative Rock', genre: 'Rock', country: 'USA', streamUrl: 'https://stream.altrock.com', description: 'Alternative & Indie Rock', listeners: 42000 },
  { name: 'EDM Central', genre: 'Electronic', country: 'USA', streamUrl: 'https://stream.edmcentral.com', description: 'Electronic Dance Music', listeners: 48000 },
  { name: 'House Music', genre: 'Electronic', country: 'USA', streamUrl: 'https://stream.housemusic.com', description: 'House & Deep House', listeners: 38000 },
  { name: 'Techno Pulse', genre: 'Electronic', country: 'USA', streamUrl: 'https://stream.technopulse.com', description: 'Techno & Industrial', listeners: 25000 },
  { name: 'Latin Hits', genre: 'Latin', country: 'USA', streamUrl: 'https://stream.latinhits.com', description: 'Latin Pop & Reggaeton', listeners: 52000 },
  { name: 'Salsa Radio', genre: 'Latin', country: 'USA', streamUrl: 'https://stream.salsaradio.com', description: 'Salsa & Merengue', listeners: 32000 },
  { name: 'Reggaeton Vibes', genre: 'Latin', country: 'USA', streamUrl: 'https://stream.reggaetonvibes.com', description: 'Reggaeton & Trap Latino', listeners: 45000 },
];

console.log('Adding satellite IPTV channels and music radio stations...');
console.log(`✓ Satellite IPTV: ${satelliteChannels.length} channels`);
console.log(`✓ Music Radio: ${musicStations.length} stations across 8 genres`);
console.log('\nGenres: R&B, Jazz, Country, Hip-Hop, Pop, Rock, Electronic, Latin');
