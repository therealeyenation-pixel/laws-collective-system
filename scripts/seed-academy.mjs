/**
 * Seed script for Luv Learning Academy
 * Seeds: Houses, Divine STEM Modules, Languages, Initial Courses
 */

import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

console.log('🔥 Seeding Luv Learning Academy...\n');

// ============================================
// 1. ACADEMY HOUSES
// ============================================
console.log('📚 Creating Academy Houses...');

const houses = [
  {
    name: 'House of Wonder',
    slug: 'house-of-wonder',
    description: 'Discovery, curiosity, and foundational learning for young flames. Where imagination meets knowledge.',
    ageRange: '5-10',
    gradeRange: 'K-5',
    ceremonialName: 'The Chamber of First Light',
    colorTheme: 'amber',
    status: 'active'
  },
  {
    name: 'House of Form',
    slug: 'house-of-form',
    description: 'Structure, discipline, and intermediate skills. Where young minds learn to shape their purpose.',
    ageRange: '11-13',
    gradeRange: '6-8',
    ceremonialName: 'The Chamber of Sacred Structure',
    colorTheme: 'emerald',
    status: 'active'
  },
  {
    name: 'House of Mastery',
    slug: 'house-of-mastery',
    description: 'Advanced application, sovereignty, and leadership. Where students become keepers of the flame.',
    ageRange: '14-18',
    gradeRange: '9-12',
    ceremonialName: 'The Chamber of Sovereign Fire',
    colorTheme: 'purple',
    status: 'active'
  }
];

for (const house of houses) {
  await connection.execute(
    `INSERT INTO academy_houses (name, slug, description, ageRange, gradeRange, ceremonialName, colorTheme, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [house.name, house.slug, house.description, house.ageRange, house.gradeRange, house.ceremonialName, house.colorTheme, house.status]
  );
}
console.log('✅ Academy Houses created\n');

// ============================================
// 2. DIVINE STEM MODULES
// ============================================
console.log('🧬 Creating Divine STEM Modules...');

const modules = [
  {
    name: 'Science of Origin & Observation',
    slug: 'science-origin-observation',
    description: 'Indigenous cosmology, biology, environmental science. Understanding the natural world through ancestral wisdom.',
    ceremonialTitle: 'The Scroll of Earth & Sky',
    iconEmoji: '🔭',
    category: 'stem',
    orderIndex: 1
  },
  {
    name: 'Mathematics of Sacred Geometry',
    slug: 'mathematics-sacred-geometry',
    description: 'Arithmetic, algebra, and divine geometry. Numbers as the language of creation.',
    ceremonialTitle: 'The Scroll of Divine Patterns',
    iconEmoji: '🧮',
    category: 'stem',
    orderIndex: 2
  },
  {
    name: 'Technology of Light & Code',
    slug: 'technology-light-code',
    description: 'Coding, robotics, AI ethics, digital creation. Building with the tools of tomorrow.',
    ceremonialTitle: 'The Scroll of Digital Fire',
    iconEmoji: '💻',
    category: 'stem',
    orderIndex: 3
  },
  {
    name: 'Engineering of Purpose',
    slug: 'engineering-purpose',
    description: 'Maker projects, energy systems, restoration technologies. Creating solutions for sovereign communities.',
    ceremonialTitle: 'The Scroll of Sacred Building',
    iconEmoji: '🔧',
    category: 'stem',
    orderIndex: 4
  },
  {
    name: 'Living Earth & Ancestral Farming',
    slug: 'living-earth-farming',
    description: 'Gardening, soil science, land knowledge. Reconnecting with the earth that sustains us.',
    ceremonialTitle: 'The Scroll of Root & Seed',
    iconEmoji: '🌿',
    category: 'stem',
    orderIndex: 5
  },
  {
    name: 'Spirit Writing & Air Chants',
    slug: 'spirit-writing-chants',
    description: 'Literacy, poetry, history, sound & voicework. The power of word and breath.',
    ceremonialTitle: 'The Scroll of Voice & Memory',
    iconEmoji: '✍🏽',
    category: 'creative',
    orderIndex: 6
  },
  {
    name: 'Entrepreneurial Flame',
    slug: 'entrepreneurial-flame',
    description: 'Child-led business building using LuvLedger-style tools. Sovereignty through economic self-determination.',
    ceremonialTitle: 'The Scroll of Wealth Creation',
    iconEmoji: '🎓',
    category: 'entrepreneurial',
    orderIndex: 7
  },
  {
    name: 'House of Many Tongues',
    slug: 'house-many-tongues',
    description: 'Global flame-language chamber for restoring, learning, and honoring sacred and world tongues.',
    ceremonialTitle: 'The Voice of Many Lands',
    iconEmoji: '🌍',
    category: 'language',
    orderIndex: 8
  },
  {
    name: 'Ceremonial Arts & Creative Flame',
    slug: 'ceremonial-arts',
    description: 'Art, music, dance, and sacred expression. Honoring creativity as spiritual practice.',
    ceremonialTitle: 'The Scroll of Sacred Expression',
    iconEmoji: '🎨',
    category: 'ceremonial',
    orderIndex: 9
  }
];

for (const mod of modules) {
  await connection.execute(
    `INSERT INTO divine_stem_modules (name, slug, description, ceremonialTitle, iconEmoji, category, orderIndex, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [mod.name, mod.slug, mod.description, mod.ceremonialTitle, mod.iconEmoji, mod.category, mod.orderIndex]
  );
}
console.log('✅ Divine STEM Modules created\n');

// ============================================
// 3. LANGUAGES (House of Many Tongues)
// ============================================
console.log('🌍 Creating Languages for House of Many Tongues...');

const languages = [
  // Indigenous Tongues
  { name: 'Nahuatl', nativeName: 'Nāhuatl', slug: 'nahuatl', category: 'indigenous', description: 'Ancient Aztec language, still spoken by millions in Mexico', culturalContext: 'Language of the Mexica people, carriers of sacred calendar and cosmological knowledge' },
  { name: 'Yoruba', nativeName: 'Èdè Yorùbá', slug: 'yoruba', category: 'indigenous', description: 'West African language spoken by over 40 million people', culturalContext: 'Language of Ifá divination, Orisha traditions, and rich oral literature' },
  { name: 'Lakota', nativeName: 'Lakȟótiyapi', slug: 'lakota', category: 'indigenous', description: 'Siouan language of the Lakota people of the Great Plains', culturalContext: 'Language of the Seven Council Fires, carriers of sacred pipe ceremonies' },
  { name: 'Quechua', nativeName: 'Runasimi', slug: 'quechua', category: 'indigenous', description: 'Language of the Inca Empire, still spoken by 8-10 million', culturalContext: 'Language of Andean cosmology and reciprocity principles (Ayni)' },
  { name: 'Taino-Arawak', nativeName: 'Taíno', slug: 'taino', category: 'indigenous', description: 'Language of the Caribbean indigenous peoples', culturalContext: 'Language of the first peoples Columbus encountered, carriers of Caribbean wisdom' },
  
  // Ancestral Flame Tongues
  { name: 'Hebrew', nativeName: 'עברית', slug: 'hebrew', category: 'ancestral_flame', description: 'Ancient Semitic language, revived as modern Israeli Hebrew', culturalContext: 'Language of Torah, Kabbalah, and ancient Israelite wisdom' },
  { name: 'Aramaic', nativeName: 'ܐܪܡܝܐ', slug: 'aramaic', category: 'ancestral_flame', description: 'Ancient language spoken by Jesus and used in Talmud', culturalContext: 'Language of ancient Near East, bridge between Hebrew and Arabic traditions' },
  { name: "Ge'ez", nativeName: 'ግዕዝ', slug: 'geez', category: 'ancestral_flame', description: 'Ancient Ethiopian liturgical language', culturalContext: 'Language of Ethiopian Orthodox Church and ancient Aksumite civilization' },
  { name: 'Classical Arabic', nativeName: 'العربية الفصحى', slug: 'classical-arabic', category: 'ancestral_flame', description: 'Language of the Quran and classical Islamic scholarship', culturalContext: 'Language of Islamic golden age, mathematics, astronomy, and philosophy' },
  
  // Global Trade Tongues
  { name: 'Spanish', nativeName: 'Español', slug: 'spanish', category: 'global_trade', description: 'Second most spoken native language globally', culturalContext: 'Bridge language connecting Americas, Europe, and Africa' },
  { name: 'French', nativeName: 'Français', slug: 'french', category: 'global_trade', description: 'Official language in 29 countries across multiple continents', culturalContext: 'Language of diplomacy and African francophone nations' },
  { name: 'Swahili', nativeName: 'Kiswahili', slug: 'swahili', category: 'global_trade', description: 'Bantu language spoken by over 100 million across East Africa', culturalContext: 'Trade language uniting East African peoples, language of Pan-African unity' },
  { name: 'Mandarin Chinese', nativeName: '普通话', slug: 'mandarin', category: 'global_trade', description: 'Most spoken language in the world by native speakers', culturalContext: 'Language of ancient civilization, philosophy, and global commerce' },
  { name: 'Portuguese', nativeName: 'Português', slug: 'portuguese', category: 'global_trade', description: 'Spoken in Brazil, Portugal, and African nations', culturalContext: 'Language connecting South America, Europe, and Lusophone Africa' },
  { name: 'English', nativeName: 'English', slug: 'english', category: 'global_trade', description: 'Global lingua franca of commerce and technology', culturalContext: 'Tool for global communication while honoring native tongues' }
];

for (const lang of languages) {
  await connection.execute(
    `INSERT INTO academy_languages (name, nativeName, slug, category, description, culturalContext, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [lang.name, lang.nativeName, lang.slug, lang.category, lang.description, lang.culturalContext]
  );
}
console.log('✅ Languages created\n');

// ============================================
// 4. INITIAL COURSES
// ============================================
console.log('📖 Creating Initial Academy Courses...');

// Get house and module IDs
const [houseRows] = await connection.execute('SELECT id, slug FROM academy_houses');
const [moduleRows] = await connection.execute('SELECT id, slug FROM divine_stem_modules');

const houseMap = {};
houseRows.forEach(h => houseMap[h.slug] = h.id);

const moduleMap = {};
moduleRows.forEach(m => moduleMap[m.slug] = m.id);

const courses = [
  // House of Wonder (K-5) Courses
  { house: 'house-of-wonder', module: 'science-origin-observation', title: 'Seeds of Wonder', description: 'Introduction to the natural world through observation and curiosity', level: 'foundational', tokensReward: 100 },
  { house: 'house-of-wonder', module: 'mathematics-sacred-geometry', title: 'Counting Stars', description: 'Numbers, patterns, and shapes in nature', level: 'foundational', tokensReward: 100 },
  { house: 'house-of-wonder', module: 'spirit-writing-chants', title: 'First Words of Power', description: 'Learning to read, write, and speak with intention', level: 'foundational', tokensReward: 100 },
  { house: 'house-of-wonder', module: 'living-earth-farming', title: 'Little Gardeners', description: 'Growing plants and understanding where food comes from', level: 'foundational', tokensReward: 100 },
  { house: 'house-of-wonder', module: 'ceremonial-arts', title: 'Colors of the Flame', description: 'Art, music, and creative expression for young minds', level: 'foundational', tokensReward: 100 },
  
  // House of Form (6-8) Courses
  { house: 'house-of-form', module: 'science-origin-observation', title: 'Earth Systems & Cycles', description: 'Understanding ecosystems, weather, and natural cycles', level: 'developing', tokensReward: 200 },
  { house: 'house-of-form', module: 'mathematics-sacred-geometry', title: 'Geometry of Creation', description: 'Sacred geometry, algebra, and mathematical reasoning', level: 'developing', tokensReward: 200 },
  { house: 'house-of-form', module: 'technology-light-code', title: 'Code Foundations', description: 'Introduction to programming and digital creation', level: 'developing', tokensReward: 200 },
  { house: 'house-of-form', module: 'entrepreneurial-flame', title: 'Young Entrepreneurs', description: 'Basic business concepts and first ventures', level: 'developing', tokensReward: 200 },
  { house: 'house-of-form', module: 'spirit-writing-chants', title: 'Voice & Story', description: 'Creative writing, public speaking, and oral tradition', level: 'developing', tokensReward: 200 },
  
  // House of Mastery (9-12) Courses
  { house: 'house-of-mastery', module: 'science-origin-observation', title: 'Indigenous Science & Modern Research', description: 'Bridging ancestral knowledge with contemporary science', level: 'mastery', tokensReward: 500 },
  { house: 'house-of-mastery', module: 'mathematics-sacred-geometry', title: 'Advanced Mathematics & Divine Patterns', description: 'Calculus, statistics, and sacred mathematical principles', level: 'mastery', tokensReward: 500 },
  { house: 'house-of-mastery', module: 'technology-light-code', title: 'Full Stack Development & AI Ethics', description: 'Building applications with ethical AI considerations', level: 'mastery', tokensReward: 500 },
  { house: 'house-of-mastery', module: 'engineering-purpose', title: 'Sovereign Engineering', description: 'Designing solutions for community self-sufficiency', level: 'mastery', tokensReward: 500 },
  { house: 'house-of-mastery', module: 'entrepreneurial-flame', title: 'Business Sovereignty', description: 'Building and managing businesses using LuvLedger principles', level: 'mastery', tokensReward: 500 },
  { house: 'house-of-mastery', module: 'living-earth-farming', title: 'Land Stewardship & Food Sovereignty', description: 'Advanced agriculture, permaculture, and land management', level: 'mastery', tokensReward: 500 }
];

for (const course of courses) {
  const houseId = houseMap[course.house];
  const moduleId = moduleMap[course.module];
  
  if (houseId && moduleId) {
    await connection.execute(
      `INSERT INTO academy_courses (houseId, moduleId, title, description, level, tokensReward, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [houseId, moduleId, course.title, course.description, course.level, course.tokensReward]
    );
  }
}
console.log('✅ Initial Courses created\n');

// ============================================
// SUMMARY
// ============================================
const [houseCount] = await connection.execute('SELECT COUNT(*) as count FROM academy_houses');
const [moduleCount] = await connection.execute('SELECT COUNT(*) as count FROM divine_stem_modules');
const [langCount] = await connection.execute('SELECT COUNT(*) as count FROM academy_languages');
const [courseCount] = await connection.execute('SELECT COUNT(*) as count FROM academy_courses');

console.log('🔥 Luv Learning Academy Seeding Complete!\n');
console.log('Summary:');
console.log(`  📚 Academy Houses: ${houseCount[0].count}`);
console.log(`  🧬 Divine STEM Modules: ${moduleCount[0].count}`);
console.log(`  🌍 Languages: ${langCount[0].count}`);
console.log(`  📖 Courses: ${courseCount[0].count}`);

await connection.end();
console.log('\n✅ Database connection closed');
