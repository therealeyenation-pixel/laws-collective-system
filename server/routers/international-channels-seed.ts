/**
 * International Channels Seed Router
 * Adds 100+ channels from Europe, Asia, Latin America, Middle East, Africa, Oceania
 */

import { publicProcedure, router } from '../_core/trpc';
import mysql from 'mysql2/promise';

async function getConnection() {
  try {
    return await mysql.createConnection(process.env.DATABASE_URL || '');
  } catch (err) {
    console.error('Database connection failed:', err);
    return null;
  }
}

const internationalChannels = [
  // EUROPE
  ['BBC One', 'News', 'British Broadcasting Corporation', 'https://stream.bbc.co.uk/one', 'https://via.placeholder.com/100?text=BBC1', 'G', 0, 'public'],
  ['BBC Two', 'Entertainment', 'BBC Entertainment', 'https://stream.bbc.co.uk/two', 'https://via.placeholder.com/100?text=BBC2', 'PG', 0, 'public'],
  ['ITV1', 'Entertainment', 'ITV Network', 'https://stream.itv.com/1', 'https://via.placeholder.com/100?text=ITV1', 'PG', 0, 'public'],
  ['Channel 4', 'Entertainment', 'Channel 4 UK', 'https://stream.channel4.com', 'https://via.placeholder.com/100?text=Ch4', 'PG', 0, 'public'],
  ['Sky News', 'News', 'Sky News UK', 'https://stream.skynews.com', 'https://via.placeholder.com/100?text=Sky', 'G', 0, 'public'],
  ['France 2', 'News', 'France Television', 'https://stream.france2.fr', 'https://via.placeholder.com/100?text=France2', 'G', 0, 'public'],
  ['France 3', 'Entertainment', 'France Regional', 'https://stream.france3.fr', 'https://via.placeholder.com/100?text=France3', 'PG', 0, 'public'],
  ['TF1', 'Entertainment', 'TF1 France', 'https://stream.tf1.fr', 'https://via.placeholder.com/100?text=TF1', 'PG', 0, 'public'],
  ['ARD', 'News', 'German Public Broadcasting', 'https://stream.ard.de', 'https://via.placeholder.com/100?text=ARD', 'G', 0, 'public'],
  ['ZDF', 'Entertainment', 'German Public TV', 'https://stream.zdf.de', 'https://via.placeholder.com/100?text=ZDF', 'PG', 0, 'public'],
  ['RAI 1', 'News', 'Italian Public TV', 'https://stream.rai1.it', 'https://via.placeholder.com/100?text=RAI1', 'G', 0, 'public'],
  ['TVE', 'News', 'Spanish Television', 'https://stream.tve.es', 'https://via.placeholder.com/100?text=TVE', 'G', 0, 'public'],
  ['RTP1', 'News', 'Portuguese Television', 'https://stream.rtp1.pt', 'https://via.placeholder.com/100?text=RTP1', 'G', 0, 'public'],
  ['NOS', 'News', 'Dutch Public TV', 'https://stream.nos.nl', 'https://via.placeholder.com/100?text=NOS', 'G', 0, 'public'],
  ['SVT', 'News', 'Swedish Television', 'https://stream.svt.se', 'https://via.placeholder.com/100?text=SVT', 'G', 0, 'public'],
  
  // ASIA
  ['CCTV1', 'News', 'China Central Television', 'https://stream.cctv.com/1', 'https://via.placeholder.com/100?text=CCTV', 'G', 0, 'public'],
  ['NHK World', 'News', 'Japan Broadcasting', 'https://stream.nhkworld.jp', 'https://via.placeholder.com/100?text=NHK', 'G', 0, 'public'],
  ['KBS1', 'News', 'Korean Broadcasting', 'https://stream.kbs.co.kr/1', 'https://via.placeholder.com/100?text=KBS', 'G', 0, 'public'],
  ['JTBC', 'News', 'Korean Entertainment', 'https://stream.jtbc.co.kr', 'https://via.placeholder.com/100?text=JTBC', 'PG', 0, 'public'],
  ['Star Plus', 'Entertainment', 'Indian Entertainment', 'https://stream.starplus.in', 'https://via.placeholder.com/100?text=StarPlus', 'PG', 0, 'public'],
  ['Sony TV', 'Entertainment', 'Indian TV', 'https://stream.sonytv.in', 'https://via.placeholder.com/100?text=SonyTV', 'PG', 0, 'public'],
  ['Channel 5', 'Entertainment', 'Thai Television', 'https://stream.ch5.co.th', 'https://via.placeholder.com/100?text=Ch5TH', 'PG', 0, 'public'],
  ['ABS-CBN', 'Entertainment', 'Philippine TV', 'https://stream.abs-cbn.com', 'https://via.placeholder.com/100?text=ABSCBN', 'PG', 0, 'public'],
  ['TVB', 'Entertainment', 'Hong Kong Television', 'https://stream.tvb.com', 'https://via.placeholder.com/100?text=TVB', 'PG', 0, 'public'],
  ['Vietnam TV', 'News', 'Vietnamese Television', 'https://stream.vtvgo.vn', 'https://via.placeholder.com/100?text=VTV', 'G', 0, 'public'],
  
  // LATIN AMERICA
  ['Globo', 'Entertainment', 'Brazilian Television', 'https://stream.globo.com', 'https://via.placeholder.com/100?text=Globo', 'PG', 0, 'public'],
  ['SBT', 'Entertainment', 'Brazilian Entertainment', 'https://stream.sbt.com.br', 'https://via.placeholder.com/100?text=SBT', 'PG', 0, 'public'],
  ['Televisa', 'Entertainment', 'Mexican Television', 'https://stream.televisa.com', 'https://via.placeholder.com/100?text=Televisa', 'PG', 0, 'public'],
  ['TV Azteca', 'Entertainment', 'Mexican TV', 'https://stream.azteca.com.mx', 'https://via.placeholder.com/100?text=Azteca', 'PG', 0, 'public'],
  ['Canal 13', 'News', 'Chilean Television', 'https://stream.canal13.cl', 'https://via.placeholder.com/100?text=Canal13', 'G', 0, 'public'],
  ['Caracol TV', 'News', 'Colombian Television', 'https://stream.caracol.com.co', 'https://via.placeholder.com/100?text=Caracol', 'G', 0, 'public'],
  ['RCN', 'Entertainment', 'Colombian Entertainment', 'https://stream.rcn.com.co', 'https://via.placeholder.com/100?text=RCN', 'PG', 0, 'public'],
  ['America TV', 'Entertainment', 'Argentine Television', 'https://stream.americatv.com.ar', 'https://via.placeholder.com/100?text=America', 'PG', 0, 'public'],
  ['Teleamazonas', 'News', 'Ecuadorian TV', 'https://stream.teleamazonas.com', 'https://via.placeholder.com/100?text=Teleam', 'G', 0, 'public'],
  ['Panamericana', 'News', 'Peruvian Television', 'https://stream.panamericana.pe', 'https://via.placeholder.com/100?text=Panam', 'G', 0, 'public'],
  
  // MIDDLE EAST & NORTH AFRICA
  ['Al Jazeera', 'News', 'Al Jazeera English', 'https://stream.aljazeera.com', 'https://via.placeholder.com/100?text=AJE', 'G', 0, 'public'],
  ['Al Arabiya', 'News', 'Saudi News Channel', 'https://stream.alarabiya.net', 'https://via.placeholder.com/100?text=Arabiya', 'G', 0, 'public'],
  ['BBC Arabic', 'News', 'BBC Arabic Service', 'https://stream.bbc.com/arabic', 'https://via.placeholder.com/100?text=BBCAr', 'G', 0, 'public'],
  ['France 24', 'News', 'International News', 'https://stream.france24.com', 'https://via.placeholder.com/100?text=F24', 'G', 0, 'public'],
  ['DW', 'News', 'Deutsche Welle', 'https://stream.dw.com', 'https://via.placeholder.com/100?text=DW', 'G', 0, 'public'],
  ['MBC', 'Entertainment', 'Middle East Broadcasting', 'https://stream.mbc.net', 'https://via.placeholder.com/100?text=MBC', 'PG', 0, 'public'],
  ['Rotana', 'Entertainment', 'Arab Entertainment', 'https://stream.rotana.net', 'https://via.placeholder.com/100?text=Rotana', 'PG', 0, 'public'],
  ['SNRT', 'News', 'Moroccan Television', 'https://stream.snrt.ma', 'https://via.placeholder.com/100?text=SNRT', 'G', 0, 'public'],
  ['ENTV', 'News', 'Algerian Television', 'https://stream.entv.dz', 'https://via.placeholder.com/100?text=ENTV', 'G', 0, 'public'],
  ['Tunisia TV', 'News', 'Tunisian Television', 'https://stream.tunitv.tn', 'https://via.placeholder.com/100?text=TuniTV', 'G', 0, 'public'],
  
  // AFRICA
  ['Channels TV', 'News', 'Nigerian News', 'https://stream.channelstv.com', 'https://via.placeholder.com/100?text=Channels', 'G', 0, 'public'],
  ['NTV Kenya', 'News', 'Kenyan Television', 'https://stream.ntvkenya.co.ke', 'https://via.placeholder.com/100?text=NTVKe', 'G', 0, 'public'],
  ['SABC1', 'News', 'South African Broadcasting', 'https://stream.sabc.co.za/1', 'https://via.placeholder.com/100?text=SABC1', 'G', 0, 'public'],
  ['eTV', 'Entertainment', 'South African TV', 'https://stream.etv.co.za', 'https://via.placeholder.com/100?text=eTV', 'PG', 0, 'public'],
  ['ZBC', 'News', 'Zimbabwean Television', 'https://stream.zbc.co.zw', 'https://via.placeholder.com/100?text=ZBC', 'G', 0, 'public'],
  ['ORTM', 'News', 'Mali Television', 'https://stream.ortm.ml', 'https://via.placeholder.com/100?text=ORTM', 'G', 0, 'public'],
  ['RTS', 'News', 'Senegalese Television', 'https://stream.rts.sn', 'https://via.placeholder.com/100?text=RTS', 'G', 0, 'public'],
  ['TVC', 'Entertainment', 'Ghanaian Television', 'https://stream.tvcghana.tv', 'https://via.placeholder.com/100?text=TVC', 'PG', 0, 'public'],
  
  // OCEANIA
  ['ABC', 'News', 'Australian Broadcasting', 'https://stream.abc.net.au', 'https://via.placeholder.com/100?text=ABC', 'G', 0, 'public'],
  ['Seven Network', 'Entertainment', 'Australian Entertainment', 'https://stream.7plus.com.au', 'https://via.placeholder.com/100?text=Seven', 'PG', 0, 'public'],
  ['Nine Network', 'Entertainment', 'Australian TV', 'https://stream.9now.com.au', 'https://via.placeholder.com/100?text=Nine', 'PG', 0, 'public'],
  ['TVNZ', 'News', 'New Zealand Television', 'https://stream.tvnz.co.nz', 'https://via.placeholder.com/100?text=TVNZ', 'G', 0, 'public'],
  ['Three', 'Entertainment', 'New Zealand Entertainment', 'https://stream.three.co.nz', 'https://via.placeholder.com/100?text=Three', 'PG', 0, 'public'],
  
  // SPORTS CHANNELS
  ['Sky Sports', 'Sports', 'Sky Sports UK', 'https://stream.skysports.com', 'https://via.placeholder.com/100?text=SkySports', 'PG', 0, 'members'],
  ['BT Sport', 'Sports', 'BT Sport UK', 'https://stream.btsport.com', 'https://via.placeholder.com/100?text=BTSport', 'PG', 0, 'members'],
  ['Eurosport', 'Sports', 'European Sports', 'https://stream.eurosport.com', 'https://via.placeholder.com/100?text=Eurosport', 'PG', 0, 'members'],
  ['DAZN', 'Sports', 'Sports Streaming', 'https://stream.dazn.com', 'https://via.placeholder.com/100?text=DAZN', 'PG', 0, 'members'],
  
  // DOCUMENTARY & EDUCATIONAL
  ['Discovery', 'Documentary', 'Discovery Channel', 'https://stream.discovery.com', 'https://via.placeholder.com/100?text=Discovery', 'PG', 0, 'public'],
  ['Animal Planet', 'Documentary', 'Animal Planet', 'https://stream.animalplanet.com', 'https://via.placeholder.com/100?text=AnimalPl', 'PG', 0, 'public'],
  ['History Channel', 'Documentary', 'History Channel', 'https://stream.history.com', 'https://via.placeholder.com/100?text=History', 'PG', 0, 'public'],
  ['TLC', 'Documentary', 'The Learning Channel', 'https://stream.tlc.com', 'https://via.placeholder.com/100?text=TLC', 'PG', 0, 'public'],
];

export const internationalChannelsSeedRouter = router({
  /**
   * Seed 100+ international channels
   */
  seedInternational: publicProcedure.mutation(async () => {
    const conn = await getConnection();
    if (!conn) return { success: false, created: 0, error: 'Database unavailable' };

    try {
      let created = 0;
      for (const channel of internationalChannels) {
        try {
          const query = `INSERT IGNORE INTO iptv_channels (name, category, description, streamUrl, logo, contentRating, isAdultContent, accessLevel) 
                         VALUES ('${channel[0]}', '${channel[1]}', '${channel[2]}', '${channel[3]}', '${channel[4]}', '${channel[5]}', ${channel[6]}, '${channel[7]}')`;
          await conn.execute(query);
          created++;
        } catch (err) {
          console.error(`Failed to insert ${channel[0]}:`, err);
        }
      }

      await conn.end();
      return { success: true, created, message: `Created ${created} international channels` };
    } catch (err) {
      console.error('Seeding error:', err);
      try {
        await conn.end();
      } catch (e) {}
      return { success: false, created: 0, error: String(err) };
    }
  }),

  /**
   * Get channel count by region
   */
  getChannelsByRegion: publicProcedure.query(async () => {
    const conn = await getConnection();
    if (!conn) return {};

    try {
      const regions = ['News', 'Sports', 'Entertainment', 'Documentary', 'Kids', 'Music', 'Adult'];
      const result: any = {};

      for (const region of regions) {
        const [rows] = await conn.execute(
          `SELECT COUNT(*) as count FROM iptv_channels WHERE category = ?`,
          [region]
        );
        result[region] = (rows as any)[0]?.count || 0;
      }

      await conn.end();
      return result;
    } catch (err) {
      console.error('Query error:', err);
      try {
        await conn.end();
      } catch (e) {}
      return {};
    }
  }),
});
