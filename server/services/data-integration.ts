/**
 * Data Integration Service
 * Fetches real TV channels and radio stations from public APIs
 */

import fetch from 'node-fetch';

/**
 * Parse M3U playlist format
 * Format: #EXTINF:-1 tvg-id="..." tvg-name="..." tvg-logo="..." group-title="...",Channel Name
 *         https://stream.url
 */
function parseM3UPlaylist(content: string) {
  const lines = content.split('\n');
  const channels = [];
  let currentChannel: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse channel info
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);

      currentChannel = {
        id: idMatch ? idMatch[1] : `channel_${channels.length}`,
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        logo: logoMatch ? logoMatch[1] : '',
        category: groupMatch ? groupMatch[1].toLowerCase().replace(/\s+/g, '_') : 'other',
        description: '',
        isLive: true,
      };
    } else if (line && !line.startsWith('#') && currentChannel) {
      // This is the stream URL
      currentChannel.streamUrl = line;
      channels.push(currentChannel);
      currentChannel = null;
    }
  }

  return channels;
}

/**
 * Fetch TV channels from IPTV-org M3U playlist
 * Returns top N channels from the playlist
 */
export async function fetchIPTVChannels(limit: number = 100) {
  try {
    console.log('[Data Integration] Fetching IPTV channels from iptv-org...');
    
    // Fetch the main M3U playlist
    const response = await fetch('https://iptv-org.github.io/iptv/index.m3u', {
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch M3U playlist: ${response.statusText}`);
    }

    const content = await response.text();
    const allChannels = parseM3UPlaylist(content);

    // Filter out channels without stream URLs and limit results
    const validChannels = allChannels
      .filter((ch) => ch.streamUrl && ch.name)
      .slice(0, limit);

    console.log(`[Data Integration] Successfully fetched ${validChannels.length} IPTV channels`);

    return validChannels.map((ch, idx) => ({
      id: idx + 1,
      name: ch.name,
      category: ch.category,
      description: `Live TV Channel - ${ch.category}`,
      logo: ch.logo || `https://via.placeholder.com/100?text=${encodeURIComponent(ch.name)}`,
      streamUrl: ch.streamUrl,
      viewers: Math.floor(Math.random() * 100000),
      isLive: true,
    }));
  } catch (error) {
    console.error('[Data Integration] Error fetching IPTV channels:', error);
    return [];
  }
}

/**
 * Fetch radio stations from Radio Browser API
 * Returns top N radio stations
 */
export async function fetchRadioStations(limit: number = 100) {
  try {
    console.log('[Data Integration] Fetching radio stations from Radio Browser API...');

    // Radio Browser API endpoint
    const url = `https://de1.api.radio-browser.info/json/stations/search?limit=${limit}&order=bitrate&reverse=true`;

    const response = await fetch(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StreamingApp/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch radio stations: ${response.statusText}`);
    }

    const stations = await response.json() as any[];

    console.log(`[Data Integration] Successfully fetched ${stations.length} radio stations`);

    return stations
      .filter((st) => st.url && st.name)
      .slice(0, limit)
      .map((st, idx) => ({
        id: idx + 1,
        name: st.name,
        category: st.tags ? st.tags.split(',')[0].toLowerCase() : 'music',
        description: `${st.country || 'International'} - ${st.language || 'Multi-language'} Radio`,
        logo: st.favicon || `https://via.placeholder.com/100?text=${encodeURIComponent(st.name)}`,
        streamUrl: st.url,
        listeners: Math.floor(Math.random() * 100000),
        isLive: true,
      }));
  } catch (error) {
    console.error('[Data Integration] Error fetching radio stations:', error);
    return [];
  }
}

/**
 * Fetch popular music tracks from a public API
 * For now, returns sample data as most music APIs require authentication
 */
export async function fetchMusicTracks(limit: number = 100) {
  try {
    console.log('[Data Integration] Generating music tracks...');

    // Sample popular tracks (in production, would integrate with Spotify, Apple Music, etc.)
    const sampleTracks = [
      {
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200,
      },
      {
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        album: '÷',
        duration: 234,
      },
      {
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 203,
      },
      {
        title: 'As It Was',
        artist: 'Harry Styles',
        album: "Harry's House",
        duration: 172,
      },
      {
        title: 'Anti-Hero',
        artist: 'Taylor Swift',
        album: 'Midnights',
        duration: 200,
      },
      {
        title: 'Heat Waves',
        artist: 'Glass Animals',
        album: 'Dreamland',
        duration: 239,
      },
      {
        title: 'Sunroof',
        artist: 'Nicky Youre',
        album: 'Single',
        duration: 180,
      },
      {
        title: 'Flowers',
        artist: 'Miley Cyrus',
        album: 'Endless Summer Vacation',
        duration: 218,
      },
    ];

    return sampleTracks.slice(0, limit).map((track, idx) => ({
      id: idx + 1,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration,
      cover: `https://via.placeholder.com/300x300?text=${encodeURIComponent(track.title)}`,
      streamUrl: `https://stream.music.com/track/${idx + 1}`,
    }));
  } catch (error) {
    console.error('[Data Integration] Error fetching music tracks:', error);
    return [];
  }
}

/**
 * Main function to populate all streaming data
 */
export async function populateStreamingData() {
  console.log('[Data Integration] Starting data population...');

  try {
    const channels = await fetchIPTVChannels(50);
    const stations = await fetchRadioStations(50);
    const tracks = await fetchMusicTracks(20);

    console.log('[Data Integration] Data population complete');
    console.log(`  - TV Channels: ${channels.length}`);
    console.log(`  - Radio Stations: ${stations.length}`);
    console.log(`  - Music Tracks: ${tracks.length}`);

    return {
      channels,
      stations,
      tracks,
    };
  } catch (error) {
    console.error('[Data Integration] Error during data population:', error);
    throw error;
  }
}
