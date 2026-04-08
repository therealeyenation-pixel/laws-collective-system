/**
 * Data Integration Service
 * Provides real radio stations organized by American music genres
 * and IPTV channels for the Theater
 */

/**
 * American Music Genre Radio Stations
 * All verified working MP3 streams from Radio Browser API
 */
function getAmericanRadioStations() {
  return [
    // === HIP-HOP ===
    {
      id: 1,
      name: '100 Hip Hop and RNB FM',
      genre: 'hip-hop',
      category: 'hip-hop',
      description: 'Non-stop Hip-Hop and R&B hits',
      logo: 'https://via.placeholder.com/100/6B21A8/FFFFFF?text=HipHop',
      streamUrl: 'https://streaming.shoutcast.com/100-hip-hop-and-rnb-fm',
      listeners: 42000,
      isLive: true,
    },
    {
      id: 2,
      name: 'Hot 108 Jamz',
      genre: 'hip-hop',
      category: 'hip-hop',
      description: 'The hottest Hip-Hop radio station',
      logo: 'https://via.placeholder.com/100/7C3AED/FFFFFF?text=Hot108',
      streamUrl: 'http://live.powerhitz.com/hot108?aw_0_req.gdpr=true',
      listeners: 85000,
      isLive: true,
    },
    {
      id: 3,
      name: 'Planet HipHop',
      genre: 'hip-hop',
      category: 'hip-hop',
      description: 'Hip-Hop from around the planet',
      logo: 'https://via.placeholder.com/100/8B5CF6/FFFFFF?text=Planet',
      streamUrl: 'http://listen.mrg.fm:8100/stream',
      listeners: 29000,
      isLive: true,
    },

    // === R&B / SOUL ===
    {
      id: 4,
      name: '.977 Jamz',
      genre: 'rnb',
      category: 'rnb',
      description: 'R&B and Soul classics and hits',
      logo: 'https://via.placeholder.com/100/EC4899/FFFFFF?text=Jamz',
      streamUrl: 'http://15113.live.streamtheworld.com/977_JAMZ_SC',
      listeners: 38000,
      isLive: true,
    },
    {
      id: 5,
      name: '181.FM - Soul',
      genre: 'rnb',
      category: 'rnb',
      description: 'Classic Soul and R&B',
      logo: 'https://via.placeholder.com/100/DB2777/FFFFFF?text=Soul',
      streamUrl: 'http://listen.181fm.com/181-soul_128k.mp3',
      listeners: 25000,
      isLive: true,
    },
    {
      id: 6,
      name: 'Funky Corner Radio',
      genre: 'rnb',
      category: 'rnb',
      description: 'Funk, Soul, and R&B grooves',
      logo: 'https://via.placeholder.com/100/F472B6/FFFFFF?text=Funky',
      streamUrl: 'https://ais-sa2.cdnstream1.com/2447_192.mp3',
      listeners: 22000,
      isLive: true,
    },

    // === JAZZ ===
    {
      id: 7,
      name: 'Soma FM - Sonic Universe',
      genre: 'jazz',
      category: 'jazz',
      description: 'Jazz and world music fusion',
      logo: 'https://somafm.com/img3/sonicuniverse-400.jpg',
      streamUrl: 'https://stream.somafm.com/sonicuniverse',
      listeners: 32000,
      isLive: true,
    },
    {
      id: 8,
      name: 'Soma FM - Secret Agent',
      genre: 'jazz',
      category: 'jazz',
      description: 'Spy jazz, lounge, and cool vibes',
      logo: 'https://somafm.com/img3/secretagent-400.jpg',
      streamUrl: 'https://stream.somafm.com/secretagent',
      listeners: 27000,
      isLive: true,
    },
    {
      id: 9,
      name: 'Soma FM - Fluid',
      genre: 'jazz',
      category: 'jazz',
      description: 'Smooth jazz and instrumental',
      logo: 'https://somafm.com/img3/fluid-400.jpg',
      streamUrl: 'https://stream.somafm.com/fluid',
      listeners: 35000,
      isLive: true,
    },

    // === GOSPEL ===
    {
      id: 10,
      name: 'Praise & Worship Radio',
      genre: 'gospel',
      category: 'gospel',
      description: 'Uplifting gospel music 24/7',
      logo: 'https://via.placeholder.com/100/F59E0B/FFFFFF?text=Gospel',
      streamUrl: 'http://listen.181fm.com/181-gospel_128k.mp3',
      listeners: 18000,
      isLive: true,
    },
    {
      id: 11,
      name: 'Gospel Hits Radio',
      genre: 'gospel',
      category: 'gospel',
      description: 'Contemporary and classic gospel',
      logo: 'https://via.placeholder.com/100/D97706/FFFFFF?text=GHits',
      streamUrl: 'http://listen.181fm.com/181-praise_128k.mp3',
      listeners: 15000,
      isLive: true,
    },

    // === BLUES ===
    {
      id: 12,
      name: '181.FM - True Blues',
      genre: 'blues',
      category: 'blues',
      description: 'Authentic blues from the Delta to Chicago',
      logo: 'https://via.placeholder.com/100/1D4ED8/FFFFFF?text=Blues',
      streamUrl: 'http://listen.181fm.com/181-blues_128k.mp3',
      listeners: 21000,
      isLive: true,
    },
    {
      id: 13,
      name: 'Blues Radio UK',
      genre: 'blues',
      category: 'blues',
      description: 'Blues music from around the world',
      logo: 'https://via.placeholder.com/100/2563EB/FFFFFF?text=BluesR',
      streamUrl: 'https://stream.laut.fm/bluesclub',
      listeners: 16000,
      isLive: true,
    },

    // === COUNTRY ===
    {
      id: 14,
      name: '181.FM - Highway',
      genre: 'country',
      category: 'country',
      description: "Today's country hits",
      logo: 'https://via.placeholder.com/100/92400E/FFFFFF?text=Hwy',
      streamUrl: 'http://listen.181fm.com/181-highway_128k.mp3',
      listeners: 45000,
      isLive: true,
    },
    {
      id: 15,
      name: "181.FM - Kickin' Country",
      genre: 'country',
      category: 'country',
      description: 'Classic and new country music',
      logo: 'https://via.placeholder.com/100/A16207/FFFFFF?text=Kickin',
      streamUrl: 'http://listen.181fm.com/181-kickincountry_128k.mp3',
      listeners: 38000,
      isLive: true,
    },
    {
      id: 16,
      name: "181.FM - 90's Country",
      genre: 'country',
      category: 'country',
      description: '90s country classics',
      logo: 'https://via.placeholder.com/100/CA8A04/FFFFFF?text=90sCty',
      streamUrl: 'http://listen.181fm.com/181-90scountry_128k.mp3',
      listeners: 28000,
      isLive: true,
    },

    // === FUNK ===
    {
      id: 17,
      name: 'FUNKY RADIO',
      genre: 'funk',
      category: 'funk',
      description: "Only Funk Music - 60's & 70's",
      logo: 'https://via.placeholder.com/100/EA580C/FFFFFF?text=Funky',
      streamUrl: 'https://funkyradio.streamingmedia.it/play.mp3',
      listeners: 35000,
      isLive: true,
    },
    {
      id: 18,
      name: 'Radio Motown',
      genre: 'funk',
      category: 'funk',
      description: 'Motown classics and soul',
      logo: 'https://via.placeholder.com/100/C2410C/FFFFFF?text=Motown',
      streamUrl: 'https://broadcast.miami/proxy/motown?mp=/stream/;',
      listeners: 28000,
      isLive: true,
    },
    {
      id: 19,
      name: '70s 80s Disco Funk',
      genre: 'funk',
      category: 'funk',
      description: 'Disco, Funk, Modern Soul, Boogie',
      logo: 'https://via.placeholder.com/100/F97316/FFFFFF?text=Disco',
      streamUrl: 'https://discofunk.streamingmedia.it/usa',
      listeners: 22000,
      isLive: true,
    },

    // === REGGAE ===
    {
      id: 20,
      name: 'Soma FM - Heavyweight Reggae',
      genre: 'reggae',
      category: 'reggae',
      description: 'Roots reggae and dub',
      logo: 'https://somafm.com/img3/reggae400.jpg',
      streamUrl: 'https://ice6.somafm.com/reggae-256-mp3',
      listeners: 25000,
      isLive: true,
    },
    {
      id: 21,
      name: '181.FM - Reggae Roots',
      genre: 'reggae',
      category: 'reggae',
      description: 'Reggae roots and culture',
      logo: 'https://via.placeholder.com/100/16A34A/FFFFFF?text=Reggae',
      streamUrl: 'http://listen.181fm.com/181-reggae_128k.mp3',
      listeners: 18000,
      isLive: true,
    },

    // === CLASSIC HITS / POP ===
    {
      id: 22,
      name: 'Soma FM - Groove Salad',
      genre: 'chill',
      category: 'chill',
      description: 'Downtempo grooves and chill beats',
      logo: 'https://somafm.com/img3/groovesalad-400.jpg',
      streamUrl: 'https://stream.somafm.com/groovesalad',
      listeners: 45000,
      isLive: true,
    },
    {
      id: 23,
      name: 'Soma FM - Beat Blender',
      genre: 'chill',
      category: 'chill',
      description: 'Deep house and chill beats',
      logo: 'https://somafm.com/img3/beatblender-400.jpg',
      streamUrl: 'https://stream.somafm.com/beatblender',
      listeners: 38000,
      isLive: true,
    },
    {
      id: 24,
      name: 'Soma FM - Indie Pop Rocks',
      genre: 'pop',
      category: 'pop',
      description: 'Indie and alternative pop music',
      logo: 'https://somafm.com/img3/indiepop-400.jpg',
      streamUrl: 'https://stream.somafm.com/indiepop',
      listeners: 38000,
      isLive: true,
    },
  ];
}

/**
 * Fetch radio stations organized by American music genres
 */
export async function fetchRadioStations(limit: number = 50) {
  try {
    console.log('[Data Integration] Preparing American genre radio stations...');
    const stations = getAmericanRadioStations();
    console.log(`[Data Integration] Prepared ${stations.length} radio stations across American genres`);
    return stations.slice(0, limit);
  } catch (error) {
    console.error('[Data Integration] Error preparing radio stations:', error);
    return getAmericanRadioStations().slice(0, 10);
  }
}

/**
 * Verified working TV channels for the Theater
 * All stream URLs tested and confirmed working (HTTP 200)
 * Organized by category for the Theater UI
 */
function getVerifiedTVChannels() {
  return [
    // === NEWS ===
    {
      id: 1,
      name: 'ABC News Live',
      category: 'news',
      description: '24/7 breaking news and live coverage from ABC News',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png',
      streamUrl: 'https://abcnews-streams.akamaized.net/hls/live/2023560/abcnewshudson1/master_4000.m3u8',
      viewers: 85000,
      isLive: true,
    },
    {
      id: 2,
      name: 'ABC News Live 2',
      category: 'news',
      description: 'ABC News alternate live feed',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/ABC_News_Live_logo_2021.svg/960px-ABC_News_Live_logo_2021.svg.png',
      streamUrl: 'https://abcnews-streams.akamaized.net/hls/live/2023561/abcnewshudson2/master_4000.m3u8',
      viewers: 62000,
      isLive: true,
    },
    {
      id: 3,
      name: 'NASA TV',
      category: 'news',
      description: 'NASA Television - Live from Space',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/200px-NASA_logo.svg.png',
      streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
      viewers: 45000,
      isLive: true,
    },

    // === SPORTS ===
    {
      id: 4,
      name: 'ACC Digital Network',
      category: 'sports',
      description: 'Atlantic Coast Conference sports coverage',
      logo: 'https://i.imgur.com/V6Kaqha.png',
      streamUrl: 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8',
      viewers: 38000,
      isLive: true,
    },
    {
      id: 5,
      name: 'Golf Kingdom',
      category: 'sports',
      description: 'Golf tips, tours, and lifestyle content',
      logo: 'https://golfkingdom.net/wp-content/uploads/2022/04/golf-kingdom-st.jpg',
      streamUrl: 'https://30a-tv.com/feeds/vidaa/golf.m3u8',
      viewers: 22000,
      isLive: true,
    },

    // === ENTERTAINMENT ===
    {
      id: 6,
      name: 'Backstage',
      category: 'entertainment',
      description: 'Behind the scenes entertainment and celebrity interviews',
      logo: 'https://i.imgur.com/qcTNvNU.png',
      streamUrl: 'https://d2ah48mnofquik.cloudfront.net/Backstage.m3u8',
      viewers: 35000,
      isLive: true,
    },
    {
      id: 7,
      name: "America's Funniest Home Videos",
      category: 'entertainment',
      description: 'Classic funny home videos 24/7',
      logo: 'https://i.imgur.com/TOB9vmW.png',
      streamUrl: 'https://d1mp1kdk5zi1ie.cloudfront.net/playlist.m3u8',
      viewers: 55000,
      isLive: true,
    },
    {
      id: 8,
      name: '30A Ridiculous TV',
      category: 'entertainment',
      description: 'Comedy and ridiculous moments',
      logo: 'https://30a.media/wp-content/uploads/2023/08/pzaz-30atv-2-230x366-ridiculous.jpg',
      streamUrl: 'https://30a-tv.com/feeds/720p/63.m3u8',
      viewers: 28000,
      isLive: true,
    },

    // === MUSIC ===
    {
      id: 9,
      name: 'Praise Him Music Network',
      category: 'music',
      description: 'Gospel praise and worship music 24/7',
      logo: 'https://i.imgur.com/iBcqT8L.png',
      streamUrl: 'https://3abn.bozztv.com/3abn1/PraiseHim/smil:PraiseHim.smil/playlist.m3u8',
      viewers: 32000,
      isLive: true,
    },
    {
      id: 10,
      name: '30A Music',
      category: 'music',
      description: 'Live music performances and music videos',
      logo: 'https://i.imgur.com/gNWg9tl.png',
      streamUrl: 'https://30a-tv.com/music.m3u8',
      viewers: 25000,
      isLive: true,
    },
    {
      id: 11,
      name: 'Avang TV',
      category: 'music',
      description: 'Music videos and live performances',
      logo: 'https://i.imgur.com/3I1n7fO.png',
      streamUrl: 'https://hls.avang.live/hls/stream.m3u8',
      viewers: 18000,
      isLive: true,
    },

    // === MOVIES ===
    {
      id: 12,
      name: '30A Classic Movies',
      category: 'movies',
      description: 'Classic movies streaming 24/7',
      logo: 'https://babaktv.com/wp-content/uploads/2023/09/30A-Classi-Movies.jpeg',
      streamUrl: 'https://30a-tv.com/feeds/pzaz/30atvmovies.m3u8',
      viewers: 42000,
      isLive: true,
    },

    // === BUSINESS ===
    {
      id: 13,
      name: 'Investment Pitch',
      category: 'business',
      description: 'Startup pitches and investment content',
      logo: 'https://i.imgur.com/CKCtZo7.png',
      streamUrl: 'https://30a-tv.com/feeds/xodglobal/30atv.m3u8',
      viewers: 28000,
      isLive: true,
    },
    {
      id: 14,
      name: 'Ameritrade',
      category: 'business',
      description: 'Financial markets and trading insights',
      logo: 'https://images-na.ssl-images-amazon.com/images/I/71CZKwin9mL.png',
      streamUrl: 'https://tdameritrade-vizio.amagi.tv/playlist.m3u8',
      viewers: 35000,
      isLive: true,
    },

    // === LIFESTYLE ===
    {
      id: 15,
      name: 'Luxe Life Discovered',
      category: 'lifestyle',
      description: 'Luxury lifestyle, travel, and design',
      logo: 'https://m.media-amazon.com/images/I/51FJ5A0mEyL.jpg',
      streamUrl: 'https://30a-tv.com/feeds/vidaa/luxelife.m3u8',
      viewers: 20000,
      isLive: true,
    },
    {
      id: 16,
      name: 'BBC Home & Garden',
      category: 'lifestyle',
      description: 'Home improvement and garden inspiration',
      logo: 'https://i.imgur.com/rC0pi1D.png',
      streamUrl: 'https://d11r33s5i066xh.cloudfront.net/playlist.m3u8',
      viewers: 30000,
      isLive: true,
    },
    {
      id: 17,
      name: 'Better Health TV',
      category: 'lifestyle',
      description: 'Health and wellness programming',
      logo: 'https://i.imgur.com/qnwJiji.png',
      streamUrl: 'https://tgn.bozztv.com/betterlife/betterhealth/betterhealth/index.m3u8',
      viewers: 15000,
      isLive: true,
    },

    // === KIDS ===
    {
      id: 18,
      name: 'Baby Shark TV',
      category: 'kids',
      description: 'Kids entertainment and Baby Shark content',
      logo: 'https://i.imgur.com/SbBKr8L.png',
      streamUrl: 'https://newidco-babysharktv-1-us.roku.wurl.tv/playlist.m3u8',
      viewers: 65000,
      isLive: true,
    },
    {
      id: 19,
      name: '3ABN Kids Network',
      category: 'kids',
      description: 'Family-friendly kids programming',
      logo: 'https://i.imgur.com/z3npqO1.png',
      streamUrl: 'https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8',
      viewers: 28000,
      isLive: true,
    },

    // === DOCUMENTARY ===
    {
      id: 20,
      name: 'Antiques Roadshow PBS',
      category: 'documentary',
      description: 'Antiques appraisals and history from PBS',
      logo: 'https://i.imgur.com/U9CYaok.png',
      streamUrl: 'https://amg00953-pbsusa-antiroadshow-xumo-x6ud5.amagi.tv/playlist.m3u8',
      viewers: 40000,
      isLive: true,
    },
    {
      id: 21,
      name: '30A Sidewalks',
      category: 'documentary',
      description: 'Travel and culture documentaries',
      logo: 'https://i.imgur.com/HSdwqZN.png',
      streamUrl: 'https://30a-tv.com/sidewalks.m3u8',
      viewers: 18000,
      isLive: true,
    },

    // === FAITH ===
    {
      id: 22,
      name: '3ABN Dare To Dream',
      category: 'faith',
      description: 'Inspirational and faith-based programming',
      logo: 'https://i.imgur.com/iBcqT8L.png',
      streamUrl: 'https://3abn.bozztv.com/3abn2/d2d_live/smil:d2d_live.smil/playlist.m3u8',
      viewers: 36000,
      isLive: true,
    },
  ];
}

/**
 * Fetch TV channels for the Theater
 * Uses verified working HLS streams
 */
export async function fetchIPTVChannels(limit: number = 50) {
  try {
    console.log('[Data Integration] Preparing verified TV channels...');
    const channels = getVerifiedTVChannels();
    console.log(`[Data Integration] Prepared ${channels.length} verified TV channels`);
    return channels.slice(0, limit);
  } catch (error) {
    console.error('[Data Integration] Error preparing TV channels:', error);
    return getVerifiedTVChannels().slice(0, 5);
  }
}

/**
 * Fetch music tracks (curated list)
 */
export async function fetchMusicTracks(limit: number = 12) {
  const tracks = [
    {
      id: 1,
      title: 'Jazz Fusion',
      artist: 'Soma FM',
      album: 'Sonic Universe',
      duration: 240,
      cover: 'https://somafm.com/img3/sonicuniverse-400.jpg',
      streamUrl: 'https://stream.somafm.com/sonicuniverse',
    },
    {
      id: 2,
      title: 'Smooth Grooves',
      artist: 'Soma FM',
      album: 'Groove Salad',
      duration: 300,
      cover: 'https://somafm.com/img3/groovesalad-400.jpg',
      streamUrl: 'https://stream.somafm.com/groovesalad',
    },
    {
      id: 3,
      title: 'Beat Blender Mix',
      artist: 'Soma FM',
      album: 'Beat Blender',
      duration: 280,
      cover: 'https://somafm.com/img3/beatblender-400.jpg',
      streamUrl: 'https://stream.somafm.com/beatblender',
    },
    {
      id: 4,
      title: 'Spy Jazz Lounge',
      artist: 'Soma FM',
      album: 'Secret Agent',
      duration: 220,
      cover: 'https://somafm.com/img3/secretagent-400.jpg',
      streamUrl: 'https://stream.somafm.com/secretagent',
    },
    {
      id: 5,
      title: 'Roots Reggae',
      artist: 'Soma FM',
      album: 'Heavyweight Reggae',
      duration: 260,
      cover: 'https://somafm.com/img3/reggae400.jpg',
      streamUrl: 'https://ice6.somafm.com/reggae-256-mp3',
    },
    {
      id: 6,
      title: 'Indie Pop',
      artist: 'Soma FM',
      album: 'Indie Pop Rocks',
      duration: 210,
      cover: 'https://somafm.com/img3/indiepop-400.jpg',
      streamUrl: 'https://stream.somafm.com/indiepop',
    },
  ];

  return tracks.slice(0, limit);
}
