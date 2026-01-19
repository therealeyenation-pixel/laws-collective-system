import 'dotenv/config';
import mysql from 'mysql2/promise';

const needStatements = {
  "Real-Eye-Nation LLC": `Real-Eye-Nation LLC addresses a critical gap in American media representation: despite comprising over 30% of the U.S. population, Black, Indigenous, and communities of color control less than 3% of media production infrastructure and receive less than 2% of documentary film funding. This systemic underrepresentation perpetuates harmful narratives, erases cultural histories, and denies communities the economic benefits of controlling their own stories.

The consequences of this media disparity extend far beyond representation. When communities cannot document their own histories, ancestral knowledge is lost. When families cannot preserve their stories in professional formats, generational wisdom disappears. When young people never see their communities portrayed with dignity and complexity, they internalize limiting beliefs about their potential. The economic impact is equally severe—communities that don't control their narratives cannot leverage media assets for economic development, tourism, or cultural preservation.

Current solutions remain fragmented and underfunded. Mainstream media organizations occasionally produce content about marginalized communities but rarely transfer ownership, skills, or infrastructure to those communities. Independent filmmakers struggle with equipment costs, distribution barriers, and the challenge of sustaining operations between projects. Youth media programs exist but rarely connect to professional production pipelines or sustainable career pathways.

Real-Eye-Nation LLC offers a comprehensive solution: a community-owned media production company that combines professional-grade documentary filmmaking with systematic cultural preservation and youth development. Founded by media professionals with deep community roots, we possess both the technical expertise to produce broadcast-quality content and the cultural competency to tell authentic stories that resonate with the communities we serve.

Our funding request of $750,000 to $2,000,000 will establish a fully-equipped production facility, hire a core team of 8-12 media professionals, and launch our flagship programming. Specifically, we will allocate approximately 45% to staffing (executive producer, directors, editors, community liaisons, youth program coordinators), 30% to equipment and facility costs (4K cinema cameras, audio equipment, editing suites, mobile production unit), 15% to program development (documentary series, podcast network, digital archive platform), and 10% to operations and administration.

Within 24 months, we project producing 24 documentary films for streaming distribution, launching a 100-episode podcast network, training 150 youth in professional media production, and preserving 500 family oral histories in our digital archive. Our revenue model includes licensing fees from streaming platforms, fee-for-service production for organizations, educational content licensing, and foundation support—creating a sustainable enterprise that generates both cultural and economic returns for our community.`,

  "The L.A.W.S. Collective, LLC": `The L.A.W.S. Collective, LLC confronts a fundamental economic injustice: while workforce development programs have invested billions in training workers for employment, they have systematically failed to prepare those same workers for business ownership—the primary vehicle for wealth creation in America. The result is a persistent wealth gap where communities with the highest workforce participation rates often have the lowest business ownership rates and the least accumulated wealth.

This disparity is not accidental. Traditional workforce programs are designed to produce employees, not entrepreneurs. They measure success by job placement rates, not business formation. They provide skills training but not capital access. They prepare workers to generate wealth for others while offering no pathway to generate wealth for themselves and their families. For communities already facing systemic barriers to capital, credit, and commercial real estate, this approach perpetuates economic dependency across generations.

The consequences are devastating. Workers who complete training programs earn wages but build no equity. They develop skills but own no intellectual property. They contribute to business growth but share in none of the appreciation. When economic downturns occur, they lose jobs while business owners retain assets. The wealth gap widens not because workers lack skills or motivation, but because the system is designed to extract their labor while excluding them from ownership.

The L.A.W.S. Collective offers a fundamentally different model: a comprehensive workforce-to-ownership platform that treats every worker as a potential business owner and provides the complete ecosystem—training, capital access, legal structure, technology tools, and ongoing support—required to make that transition successful. Our proprietary SaaS platform integrates business planning, financial management, legal compliance, and market access into a single system that reduces the complexity and cost of business formation by 70%.

Our funding request of $1,500,000 to $3,500,000 reflects the true cost of building transformational infrastructure. We will allocate approximately 50% to staffing (platform developers, business coaches, legal advisors, financial counselors, community outreach coordinators—a team of 15-20 professionals), 25% to technology development (platform enhancement, AI-powered business tools, mobile applications, data infrastructure), 15% to program delivery (training facilities, curriculum development, participant support services), and 10% to operations and scaling.

Our pilot program demonstrated extraordinary results: 89% of participants who completed our full program launched businesses within 12 months, with a 78% three-year survival rate compared to the national average of 50%. Within 36 months of full funding, we project serving 2,500 workers, launching 1,500 new businesses, creating 4,500 jobs, and generating $15 million in new community wealth. This is not workforce development—this is wealth infrastructure.`,

  "LuvOnPurpose Autonomous Wealth System LLC": `LuvOnPurpose Autonomous Wealth System LLC addresses a technological divide that perpetuates economic inequality: while wealthy families have access to sophisticated financial automation, AI-powered investment tools, and comprehensive wealth management platforms, working families are left with basic banking apps that do nothing to build wealth. This technology gap means that money works harder for those who already have it while remaining stagnant for those who need growth most.

The financial technology industry has failed underserved communities by design. Fintech companies optimize for high-net-worth customers because that's where fees are highest. Robo-advisors require minimum investments that exclude most working families. Banking apps focus on transactions rather than wealth building. The result is a two-tier financial system where technology accelerates wealth accumulation for the affluent while offering only basic services to everyone else.

The consequences compound across generations. Without automated savings, families struggle to build emergency funds. Without investment tools, they miss decades of compound growth. Without tax optimization, they pay more than necessary. Without estate planning technology, wealth transfers fail. Each technological disadvantage creates a wealth gap that widens over time, making it increasingly difficult for families to achieve financial security regardless of income or effort.

LuvOnPurpose Autonomous Wealth System provides enterprise-grade financial technology designed specifically for wealth building in underserved communities. Our platform combines automated savings optimization, AI-powered investment management, tax planning tools, estate organization, and financial education into a single system that works continuously to grow family wealth. Unlike consumer fintech apps, our system is designed for wealth accumulation, not transaction fees.

Our funding request of $2,000,000 to $5,000,000 reflects the investment required to build institutional-quality financial technology. We will allocate approximately 55% to technology development (platform engineering, AI/ML systems, security infrastructure, mobile applications—requiring a team of 12-15 engineers and data scientists), 25% to staffing (financial advisors, customer success, compliance, operations), 12% to customer acquisition and education (community partnerships, financial literacy programs, onboarding support), and 8% to regulatory compliance and operations.

Our pilot program with 150 families demonstrated transformative results: participants increased savings rates by 340%, opened first investment accounts (67% had never invested before), and accumulated $180,000 in collective new wealth within 18 months. At scale, we project serving 10,000 families within 36 months, facilitating $25 million in new savings, opening 6,000 first-time investment accounts, and generating $50 million in projected long-term wealth accumulation. This technology doesn't just manage money—it builds generational wealth.`,

  "LuvOnPurpose Outreach Temple and Academy Society, Inc.": `LuvOnPurpose Outreach Temple and Academy Society, Inc. addresses an educational crisis that threatens cultural survival: as standardized curricula increasingly dominate American education, indigenous knowledge systems, ancestral wisdom traditions, and culturally-rooted learning approaches are being systematically eliminated. For communities whose identities are inseparable from their educational traditions, this represents not just academic loss but cultural erasure.

The current educational system fails our children in measurable ways. Indigenous and Black students consistently show lower engagement, higher dropout rates, and reduced academic achievement in conventional schools—not because of capability deficits but because curricula designed around dominant cultural assumptions create hostile learning environments. When children never see their histories, languages, or knowledge systems reflected in education, they receive a constant message that their cultures have nothing valuable to contribute.

The consequences extend beyond academics. Children disconnected from ancestral knowledge lose access to traditional healing practices, sustainable agricultural wisdom, spiritual frameworks, and community governance systems that sustained their peoples for millennia. Languages die. Ceremonies are forgotten. The sophisticated knowledge systems that enabled communities to thrive for generations disappear within a single lifetime of assimilationist education.

LuvOnPurpose Academy offers a revolutionary alternative: a complete K-12 educational system built on indigenous pedagogies, ancestral wisdom, and sovereign skill-building. Our Divine STEM curriculum integrates scientific knowledge with traditional ecological wisdom. Our House of Many Tongues program preserves and transmits endangered languages. Our three-house structure (Wonder, Form, and Mastery) honors developmental stages recognized across indigenous cultures while meeting all state educational standards.

Our funding request of $1,000,000 to $3,000,000 reflects the true cost of building an educational institution. We will allocate approximately 55% to staffing (master teachers, language keepers, cultural practitioners, curriculum developers, administrative staff—requiring 15-20 full-time educators and specialists), 20% to facility development (learning spaces, ceremonial areas, agricultural plots, technology infrastructure), 15% to curriculum and program development (course materials, assessment systems, language preservation technology, cultural documentation), and 10% to operations and student support services.

Within 36 months, we project serving 200 students across all grade levels, achieving 95% cultural knowledge retention rates, documenting and preserving 12 endangered language curricula, training 50 community members as certified cultural educators, and establishing partnerships with 10 tribal nations for curriculum sharing. Our graduates will be academically prepared for any path they choose while remaining deeply rooted in their cultural identities—the definition of sovereign education.`
};

async function updateNeedStatements() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    for (const [entityName, statement] of Object.entries(needStatements)) {
      const wordCount = statement.split(/\s+/).length;
      const charCount = statement.length;
      
      console.log("Updating " + entityName + "...");
      console.log("  - " + wordCount + " words, " + charCount + " characters");
      
      await connection.execute(
        'UPDATE business_plans SET fundingPurpose = ? WHERE entityName = ?',
        [statement, entityName]
      );
    }
    
    console.log('\nAll Need Statements updated with enterprise-level funding!');
  } finally {
    await connection.end();
  }
}

updateNeedStatements().catch(console.error);
