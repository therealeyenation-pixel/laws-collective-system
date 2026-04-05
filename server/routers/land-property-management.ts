import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

const getDocumentStyles = () => `
  <style>
    @page { size: letter; margin: 1in; }
    * { box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; background: #fff; margin: 0; padding: 20px; }
    .document-container { max-width: 8.5in; margin: 0 auto; padding: 0.5in; }
    .document-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
    .document-header h1 { font-size: 18pt; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0; }
    .section { margin-bottom: 25px; }
    .section h2 { font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
    .section h3 { font-size: 12pt; font-weight: bold; margin-bottom: 10px; }
    p { margin: 0 0 12px 0; text-align: justify; }
    .signature-block { margin-top: 50px; page-break-inside: avoid; }
    .signature-line { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .signature-box { width: 45%; }
    .signature-box .line { border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px; }
    .signature-box .label { font-size: 10pt; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table th, table td { border: 1px solid #000; padding: 8px 12px; text-align: left; }
    table th { background-color: #f0f0f0; font-weight: bold; }
    .highlight-box { border: 2px solid #000; padding: 15px; margin: 20px 0; background-color: #f9f9f9; }
    .article { margin-bottom: 30px; }
    .article-title { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 15px; text-decoration: underline; }
    ol, ul { margin: 10px 0 10px 30px; }
    li { margin-bottom: 8px; }
    .land-header { background-color: #5d4037; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .laws-pillar { display: inline-block; padding: 5px 15px; margin: 5px; border-radius: 20px; font-weight: bold; }
    .pillar-land { background-color: #8d6e63; color: white; }
    .pillar-air { background-color: #90caf9; color: #1565c0; }
    .pillar-water { background-color: #4fc3f7; color: #01579b; }
    .pillar-self { background-color: #ffb74d; color: #e65100; }
  </style>
`;

function generateLandStewardshipAgreement(data: {
  stewardName: string;
  stewardAddress: string;
  propertyDescription: string;
  propertyAddress: string;
  acreage: number;
  agreementDate: string;
  termYears: number;
  annualContribution: number;
  permittedUses: string[];
  prohibitedUses: string[];
  stewardshipResponsibilities: string[];
}): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Land Stewardship Agreement - ${data.stewardName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="land-header"><h1 style="color: white; margin: 0;">Land Stewardship Agreement</h1><p style="color: white; margin: 10px 0 0 0;">LuvOnPurpose Academy & Outreach</p><p style="color: white; margin: 5px 0 0 0;">L.A.W.S. Land Reconnection Program</p></div>
  
  <div class="section"><p>This Land Stewardship Agreement (this "Agreement") is entered into as of <strong>${data.agreementDate}</strong>, by and between:</p>
    <ol><li><strong>LuvOnPurpose Academy & Outreach</strong>, a 508(c)(1)(A) tax-exempt organization (the "Foundation"); and</li>
    <li><strong>${data.stewardName}</strong>, an individual residing at ${data.stewardAddress} (the "Steward").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">RECITALS</div>
    <ol type="A"><li>The Foundation holds or manages certain real property for the benefit of the L.A.W.S. community and future generations.</li>
    <li>The Foundation's mission includes reconnecting members to land as part of the L.A.W.S. framework (LAND pillar).</li>
    <li>The Steward desires to participate in the Foundation's Land Stewardship Program.</li></ol>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 1 - PROPERTY DESCRIPTION</div>
    <div class="section"><h3>1.1 Property</h3>
      <table><tr><td style="width: 30%;"><strong>Property Address:</strong></td><td>${data.propertyAddress}</td></tr>
      <tr><td><strong>Acreage:</strong></td><td>${data.acreage} acres</td></tr>
      <tr><td><strong>Legal Description:</strong></td><td>${data.propertyDescription}</td></tr></table>
    </div>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 2 - L.A.W.S. FRAMEWORK INTEGRATION</div>
    <div class="section"><p>This stewardship arrangement is grounded in the L.A.W.S. framework:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span class="laws-pillar pillar-land">LAND - Reconnection</span>
        <span class="laws-pillar pillar-air">AIR - Knowledge</span>
        <span class="laws-pillar pillar-water">WATER - Balance</span>
        <span class="laws-pillar pillar-self">SELF - Purpose</span>
      </div>
    </div>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 3 - TERM AND CONTRIBUTION</div>
    <div class="section"><h3>3.1 Term</h3><p>This Agreement shall be effective for a period of <strong>${data.termYears} years</strong>, commencing on ${data.agreementDate}.</p></div>
    <div class="section"><h3>3.2 Annual Contribution</h3><p>The Steward agrees to make an annual contribution of <strong>$${data.annualContribution.toLocaleString()}</strong> to the Foundation's Land Stewardship Fund.</p></div>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 4 - PERMITTED AND PROHIBITED USES</div>
    <div class="section"><h3>4.1 Permitted Uses</h3><ul>${data.permittedUses.map(use => `<li>${use}</li>`).join('')}</ul></div>
    <div class="section"><h3>4.2 Prohibited Uses</h3><ul>${data.prohibitedUses.map(use => `<li>${use}</li>`).join('')}</ul></div>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 5 - STEWARDSHIP RESPONSIBILITIES</div>
    <div class="section"><p>The Steward agrees to:</p><ol>${data.stewardshipResponsibilities.map(resp => `<li>${resp}</li>`).join('')}</ol></div>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>LuvOnPurpose Academy & Outreach</strong></p><div class="line"></div><div class="label">By: Executive Director</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>STEWARD</strong></p><div class="line"></div><div class="label">${data.stewardName}</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
  </div>
</div></body></html>`;
}

export const landPropertyManagementRouter = router({
  generateLandStewardshipAgreement: protectedProcedure
    .input(z.object({
      stewardName: z.string(),
      stewardAddress: z.string(),
      propertyDescription: z.string(),
      propertyAddress: z.string(),
      acreage: z.number(),
      agreementDate: z.string(),
      termYears: z.number(),
      annualContribution: z.number(),
      permittedUses: z.array(z.string()),
      prohibitedUses: z.array(z.string()),
      stewardshipResponsibilities: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const html = generateLandStewardshipAgreement(input);
      return { html, documentType: "land_stewardship_agreement" };
    }),

  getDocumentTypes: protectedProcedure.query(() => {
    return [
      { id: "land_stewardship_agreement", name: "Land Stewardship Agreement", description: "Agreement for members to steward Foundation-held land", category: "stewardship" },
    ];
  }),

  getPropertyTypes: protectedProcedure.query(() => {
    return [
      { id: "agricultural", name: "Agricultural Land", description: "Farmland, orchards, gardens" },
      { id: "residential", name: "Residential Property", description: "Houses, multi-family units" },
      { id: "commercial", name: "Commercial Property", description: "Office space, retail" },
      { id: "recreational", name: "Recreational Land", description: "Parks, campgrounds, retreat centers" },
      { id: "undeveloped", name: "Undeveloped Land", description: "Raw land, forest, wetlands" },
    ];
  }),
});

export default landPropertyManagementRouter;
