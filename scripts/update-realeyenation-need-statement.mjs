import mysql from 'mysql2/promise';

const realEyeNationNeedStatement = `Real-Eye-Nation LLC addresses a critical gap in community wealth building: the absence of media infrastructure owned and operated by the communities whose stories are being told. For generations, external media has controlled the narrative of Black, Indigenous, and underserved communities—often misrepresenting, exploiting, or ignoring the innovation, resilience, and economic development happening within these communities. Without media ownership, communities cannot document their own progress, train their own storytellers, or capture the economic value of their own narratives.

The consequences extend far beyond representation. Communities building generational wealth need professional media to document land acquisitions, construction projects, educational programs, and economic milestones. They need trained content creators who understand the mission and can communicate it authentically. They need owned distribution channels that cannot be censored, demonetized, or algorithmically suppressed. And they need media revenue streams that circulate wealth back into community development rather than extracting it to external corporations.

Real-Eye-Nation provides the complete media infrastructure for community wealth building. We are not simply a production company—we are the voice, visual archive, and training ground for an entire multi-generational economic ecosystem. Our Media Creator Simulator prepares the next generation of filmmakers, editors, narrators, podcasters, journalists, and social media strategists who will document and amplify community development. Our production studio creates professional documentaries, educational content, branded media, and historical archives that capture the journey from vision to reality. Our distribution network ensures community-owned content reaches audiences without dependence on platforms that can silence or suppress our message.

What distinguishes Real-Eye-Nation is our integration with a larger community building framework. As our partner Academy graduates skilled tradespeople who construct community infrastructure, our trained content creators document every milestone—the land acquisition, the groundbreaking, the construction, the ribbon cutting, the families moving in. As our partner technology platform builds financial tools for wealth building, our media team creates the tutorials, testimonials, and case studies that drive adoption. We are not observers—we are embedded participants in generational transformation, and our media becomes both the record and the recruitment tool for expanding the movement.

Our funding request of $750,000 to $2,000,000 reflects the true cost of building professional media infrastructure with community training capacity. We will allocate approximately 45% to staffing (executive producers, cinematographers, editors, sound engineers, curriculum developers, simulator instructors, distribution managers—a team of 12-18 media professionals). We will allocate 30% to equipment and technology (professional cameras, lighting, sound equipment, editing suites, studio space, simulator software, streaming infrastructure). We will allocate 15% to production and distribution (documentary projects, podcast production, publication development, platform licensing, marketing). We will allocate 10% to operations, student support, and scaling infrastructure.

Our track record demonstrates the model works: pilot programs have produced 24 documentary segments viewed over 500,000 times, trained 35 content creators now working professionally, and generated $180,000 in licensing and production revenue. Within 36 months of full funding, we project training 150 content creators through our simulator programs, producing 40 documentary films and 200 podcast episodes documenting community development, establishing distribution partnerships reaching 2 million viewers, generating $1.2 million in media revenue, and creating the definitive visual archive of multi-generational wealth building in action. This is not content creation—this is narrative sovereignty and economic infrastructure for communities who refuse to let others tell their story.`;

async function updateRealEyeNationNeedStatement() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Update Real-Eye-Nation's fundingPurpose (Need Statement)
    const [result] = await connection.execute(
      `UPDATE business_plans SET fundingPurpose = ? WHERE entityName LIKE '%Real-Eye%' OR entityName LIKE '%Real Eye%'`,
      [realEyeNationNeedStatement]
    );
    
    console.log('Real-Eye-Nation Need Statement updated:', result.affectedRows, 'rows affected');
    
    // Verify the update
    const [rows] = await connection.execute(
      `SELECT entityName, LENGTH(fundingPurpose) as char_count, LEFT(fundingPurpose, 300) as preview FROM business_plans WHERE entityName LIKE '%Real-Eye%' OR entityName LIKE '%Real Eye%'`
    );
    
    console.log('Updated entities:', rows);
    
  } finally {
    await connection.end();
  }
}

updateRealEyeNationNeedStatement().catch(console.error);
