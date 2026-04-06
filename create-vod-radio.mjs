import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

console.log('Creating VOD and Radio tables...\n');

// Create VOD table
await conn.query(`
  CREATE TABLE IF NOT EXISTS vod_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    duration INT,
    releaseYear INT,
    posterUrl VARCHAR(500),
    videoUrl VARCHAR(500) NOT NULL,
    rating DECIMAL(3,1),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✓ VOD table created');

// Create radio stations table
await conn.query(`
  CREATE TABLE IF NOT EXISTS radio_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    country VARCHAR(100),
    streamUrl VARCHAR(500) NOT NULL,
    logoUrl VARCHAR(500),
    description TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    listeners INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log('✓ Radio stations table created');

// Insert VOD content
const vodContent = [
  ['The Matrix', 'A hacker discovers the truth about reality', 'Sci-Fi', 136, 1999, '/demo-video.mp4', '/demo-video.mp4', 8.7],
  ['Inception', 'A skilled thief leads a team to steal secrets from dreams', 'Sci-Fi', 148, 2010, '/demo-video.mp4', '/demo-video.mp4', 8.8],
  ['The Dark Knight', 'Batman faces the Joker in Gotham City', 'Action', 152, 2008, '/demo-video.mp4', '/demo-video.mp4', 9.0],
  ['Interstellar', 'A team of astronauts travel through a wormhole', 'Sci-Fi', 169, 2014, '/demo-video.mp4', '/demo-video.mp4', 8.6],
  ['Pulp Fiction', 'Multiple interconnected stories in Los Angeles', 'Crime', 154, 1994, '/demo-video.mp4', '/demo-video.mp4', 8.9],
  ['Forrest Gump', 'A man with low IQ achieves great things', 'Drama', 142, 1994, '/demo-video.mp4', '/demo-video.mp4', 8.8],
  ['The Shawshank Redemption', 'Two imprisoned men bond over a long period', 'Drama', 142, 1994, '/demo-video.mp4', '/demo-video.mp4', 9.3],
  ['Gladiator', 'A former general becomes a slave and gladiator', 'Action', 155, 2000, '/demo-video.mp4', '/demo-video.mp4', 8.5],
  ['Avatar', 'A paraplegic marine infiltrates an alien world', 'Sci-Fi', 162, 2009, '/demo-video.mp4', '/demo-video.mp4', 7.8],
  ['The Avengers', 'Superheroes unite to save the world', 'Action', 143, 2012, '/demo-video.mp4', '/demo-video.mp4', 8.0],
];

for (const [title, desc, genre, duration, year, poster, video, rating] of vodContent) {
  await conn.query(
    `INSERT INTO vod_content (title, description, genre, duration, releaseYear, posterUrl, videoUrl, rating) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, desc, genre, duration, year, poster, video, rating]
  );
}
console.log(`✓ Inserted ${vodContent.length} VOD titles`);

// Insert radio stations
const radioStations = [
  ['BBC Radio 1', 'Pop/Dance', 'UK', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', '/demo-video.mp4', 'The UKs biggest hit music station'],
  ['BBC Radio 2', 'Adult Contemporary', 'UK', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_two', '/demo-video.mp4', 'Music for all ages'],
  ['BBC Radio 3', 'Classical', 'UK', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three', '/demo-video.mp4', 'Classical and jazz music'],
  ['BBC Radio 4', 'Talk/News', 'UK', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_four', '/demo-video.mp4', 'News and current affairs'],
  ['BBC Radio 5 Live', 'News/Sports', 'UK', 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_five_live', '/demo-video.mp4', 'News and sports coverage'],
  ['NPR News', 'News/Talk', 'USA', 'https://nprdmp.ic.llnwd.net/stream/nprdmp_live01_na', '/demo-video.mp4', 'National Public Radio'],
  ['WNYC', 'News/Talk', 'USA', 'https://stream.wnyc.org/wnyc', '/demo-video.mp4', 'New York Public Radio'],
  ['SiriusXM Hits 1', 'Pop', 'USA', 'https://siriusxm.com/hits1', '/demo-video.mp4', 'Top 40 hits'],
  ['SiriusXM Utopia', 'Pop', 'USA', 'https://siriusxm.com/utopia', '/demo-video.mp4', 'Eclectic pop music'],
  ['SiriusXM Octane', 'Rock', 'USA', 'https://siriusxm.com/octane', '/demo-video.mp4', 'Hard rock and metal'],
  ['France Inter', 'Talk/News', 'France', 'https://direct.franceinter.fr/live/franceinter-midfi-128k.mp3', '/demo-video.mp4', 'French national radio'],
  ['DLF', 'News/Talk', 'Germany', 'https://dlf.de/stream', '/demo-video.mp4', 'Deutschlandfunk'],
  ['RNE Radio 1', 'General', 'Spain', 'https://rtvelivestream.akamaized.net/rne/rne_live.m3u8', '/demo-video.mp4', 'Spanish national radio'],
  ['RAI Radio 1', 'General', 'Italy', 'https://icecast.rai.it/rai_radio1', '/demo-video.mp4', 'Italian national radio'],
  ['RNL', 'General', 'Netherlands', 'https://rnl.rnl.nl/live', '/demo-video.mp4', 'Radio Nederland'],
  ['ABC Radio', 'General', 'Australia', 'https://abc.net.au/radio', '/demo-video.mp4', 'Australian Broadcasting Corporation'],
  ['NHK Radio 1', 'General', 'Japan', 'https://nhkradio1.jp/stream', '/demo-video.mp4', 'NHK Radio 1'],
  ['CCTV Radio', 'News', 'China', 'https://cctvradio.com/stream', '/demo-video.mp4', 'China Central Television Radio'],
  ['KBS Radio 1', 'General', 'South Korea', 'https://kbs.co.kr/radio', '/demo-video.mp4', 'Korean Broadcasting System'],
  ['Globo Radio', 'General', 'Brazil', 'https://globoradio.globo.com/stream', '/demo-video.mp4', 'Rede Globo Radio'],
];

for (const [name, genre, country, stream, logo, desc] of radioStations) {
  await conn.query(
    `INSERT INTO radio_stations (name, genre, country, streamUrl, logoUrl, description) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, genre, country, stream, logo, desc]
  );
}
console.log(`✓ Inserted ${radioStations.length} radio stations`);

console.log('\n✅ VOD and Radio setup complete!');
conn.release();
process.exit(0);
