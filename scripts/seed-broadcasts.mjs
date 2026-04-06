import { db } from "../server/db.js";
import { broadcastChannels, broadcastEpisodes, liveBroadcasts } from "../drizzle/schema.js";

const seedChannels = [
  { name: "L.A.W.S. Radio", description: "Community education and empowerment", genre: "Educational", imageUrl: "/images/channels/laws-radio.jpg" },
  { name: "Financial Wisdom", description: "Money management and wealth building", genre: "Finance", imageUrl: "/images/channels/financial-wisdom.jpg" },
  { name: "Legal Matters", description: "Legal rights and compliance", genre: "Legal", imageUrl: "/images/channels/legal-matters.jpg" },
  { name: "Business Builders", description: "Entrepreneurship and business strategy", genre: "Business", imageUrl: "/images/channels/business-builders.jpg" },
  { name: "Community Voices", description: "Local stories and community news", genre: "News", imageUrl: "/images/channels/community-voices.jpg" },
  { name: "Health & Wellness", description: "Health, wellness, and lifestyle", genre: "Health", imageUrl: "/images/channels/health-wellness.jpg" },
  { name: "Tech Talk", description: "Technology and digital innovation", genre: "Technology", imageUrl: "/images/channels/tech-talk.jpg" },
  { name: "Arts & Culture", description: "Music, art, and cultural expression", genre: "Arts", imageUrl: "/images/channels/arts-culture.jpg" },
  { name: "Youth Empowerment", description: "Programs for young people", genre: "Youth", imageUrl: "/images/channels/youth-empowerment.jpg" },
  { name: "Environmental Action", description: "Sustainability and environmental justice", genre: "Environment", imageUrl: "/images/channels/environmental-action.jpg" },
];

const seedEpisodes = [
  { title: "Building Generational Wealth", description: "Learn strategies for long-term financial security", duration: 45, audioUrl: "https://example.com/audio/ep1.mp3", channelId: 1 },
  { title: "Understanding Your Rights", description: "Know your legal rights and protections", duration: 38, audioUrl: "https://example.com/audio/ep2.mp3", channelId: 3 },
  { title: "Starting Your First Business", description: "Essential steps for new entrepreneurs", duration: 52, audioUrl: "https://example.com/audio/ep3.mp3", channelId: 4 },
  { title: "Financial Planning 101", description: "Create a budget and financial plan", duration: 41, audioUrl: "https://example.com/audio/ep4.mp3", channelId: 2 },
  { title: "Community Investment", description: "How to invest in your community", duration: 35, audioUrl: "https://example.com/audio/ep5.mp3", channelId: 5 },
  { title: "Mental Health Matters", description: "Wellness strategies for daily life", duration: 43, audioUrl: "https://example.com/audio/ep6.mp3", channelId: 6 },
  { title: "Digital Transformation", description: "Technology for business growth", duration: 48, audioUrl: "https://example.com/audio/ep7.mp3", channelId: 7 },
  { title: "Cultural Heritage", description: "Celebrating our diverse cultures", duration: 50, audioUrl: "https://example.com/audio/ep8.mp3", channelId: 8 },
  { title: "Youth Leadership", description: "Developing leaders of tomorrow", duration: 40, audioUrl: "https://example.com/audio/ep9.mp3", channelId: 9 },
  { title: "Green Living", description: "Sustainable practices for everyone", duration: 37, audioUrl: "https://example.com/audio/ep10.mp3", channelId: 10 },
];

const seedLiveBroadcasts = [
  { title: "Monday Money Talk", description: "Weekly financial discussion", scheduledTime: new Date(Date.now() + 86400000), channelId: 2, isLive: false },
  { title: "Legal Q&A Session", description: "Ask legal questions live", scheduledTime: new Date(Date.now() + 172800000), channelId: 3, isLive: false },
  { title: "Business Breakfast", description: "Morning business insights", scheduledTime: new Date(Date.now() + 259200000), channelId: 4, isLive: false },
  { title: "Community Connect", description: "Live community discussion", scheduledTime: new Date(Date.now() + 345600000), channelId: 5, isLive: false },
  { title: "Wellness Wednesday", description: "Health and wellness tips", scheduledTime: new Date(Date.now() + 432000000), channelId: 6, isLive: false },
];

async function seedBroadcasts() {
  try {
    console.log("🎙️ Seeding broadcast channels...");
    for (const channel of seedChannels) {
      await db.insert(broadcastChannels).values(channel).onConflictDoNothing();
    }
    console.log("✅ Channels seeded");

    console.log("📻 Seeding broadcast episodes...");
    for (const episode of seedEpisodes) {
      await db.insert(broadcastEpisodes).values(episode).onConflictDoNothing();
    }
    console.log("✅ Episodes seeded");

    console.log("📡 Seeding live broadcasts...");
    for (const broadcast of seedLiveBroadcasts) {
      await db.insert(liveBroadcasts).values(broadcast).onConflictDoNothing();
    }
    console.log("✅ Live broadcasts seeded");

    console.log("🎉 All broadcast data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding broadcasts:", error);
    process.exit(1);
  }
}

seedBroadcasts();
