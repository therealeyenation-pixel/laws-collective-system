import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

// ENTITY STRUCTURE:
// CALEA Freeman Family Trust (Root)
//   └── LuvOnPurpose Autonomous Wealth System, LLC (Parent LLC)
//         └── The The The L.A.W.S. Collective, LLC (Operating Entity - 100%)
//               ├── LuvOnPurpose Academy & Outreach (508) - 30%
//               ├── Real-Eye-Nation (Media Division) - 20%
//               └── Services/Operations - 50%

const getDocumentStyles = () => `
  <style>
    @page { size: letter; margin: 1in; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; background: #fff; margin: 0; padding: 20px; }
    .document-container { max-width: 8.5in; margin: 0 auto; padding: 0.5in; }
    .section { margin-bottom: 25px; }
    .section h2 { font-size: 14pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 15px; }
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
    .checkbox { display: inline-block; width: 15px; height: 15px; border: 1px solid #000; margin-right: 8px; vertical-align: middle; }
    .internship-header { background-color: #1565c0; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .laws-header { background-color: #2e7d32; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .academy-header { background-color: #7b1fa2; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .media-header { background-color: #c62828; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .collective-header { background-color: #ff6f00; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .laws-pillar { display: inline-block; padding: 5px 15px; margin: 5px; border-radius: 20px; font-weight: bold; }
    .pillar-land { background-color: #8d6e63; color: white; }
    .pillar-air { background-color: #90caf9; color: #1565c0; }
    .pillar-water { background-color: #4fc3f7; color: #01579b; }
    .pillar-self { background-color: #ffb74d; color: #e65100; }
    .certificate-border { border: 8px double #1565c0; padding: 40px; margin: 20px 0; }
    .certificate-seal { width: 100px; height: 100px; border: 3px solid #ffd700; border-radius: 50%; display: inline-block; text-align: center; line-height: 94px; font-weight: bold; color: #ffd700; background-color: #1565c0; }
  </style>
`;

const entityNames: Record<string, { name: string; headerClass: string; description: string }> = {
  parent_llc: { name: "LuvOnPurpose Autonomous Wealth System, LLC", headerClass: "laws-header", description: "Parent holding company" },
  collective: { name: "The The The L.A.W.S. Collective, LLC", headerClass: "collective-header", description: "Operating entity for member services" },
  academy: { name: "LuvOnPurpose Academy & Outreach", headerClass: "academy-header", description: "508(c)(1)(A) educational organization" },
  real_eye_nation: { name: "Real-Eye-Nation", headerClass: "media-header", description: "Media division for content creation" },
};

function generateInternshipAgreement(data: {
  internName: string;
  internAddress: string;
  internPhone: string;
  internEmail: string;
  internDOB: string;
  hostEntity: "parent_llc" | "collective" | "academy" | "real_eye_nation";
  department: string;
  internshipTrack: string;
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  stipendAmount: number;
  stipendFrequency: "weekly" | "biweekly" | "monthly";
  mentorName: string;
  mentorTitle: string;
  learningObjectives: string[];
  isMinor: boolean;
  parentGuardianName?: string;
}): string {
  const entity = entityNames[data.hostEntity];

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Internship Agreement - ${data.internName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="${entity.headerClass}">
    <h1 style="color: white; margin: 0;">${entity.name}</h1>
    <p style="color: white; margin: 10px 0 0 0;">${entity.description}</p>
    <p style="color: white; margin: 5px 0 0 0;">Internship Agreement</p>
  </div>
  
  <div class="section"><p>This Internship Agreement is entered into as of <strong>${data.startDate}</strong>, by and between:</p>
    <ol><li><strong>${entity.name}</strong> (the "Host Organization"); and</li>
    <li><strong>${data.internName}</strong>, an individual residing at ${data.internAddress} (the "Intern").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">INTERN INFORMATION</div>
    <table><tr><td style="width: 35%;"><strong>Full Name:</strong></td><td>${data.internName}</td></tr>
    <tr><td><strong>Address:</strong></td><td>${data.internAddress}</td></tr>
    <tr><td><strong>Phone:</strong></td><td>${data.internPhone}</td></tr>
    <tr><td><strong>Email:</strong></td><td>${data.internEmail}</td></tr>
    <tr><td><strong>Date of Birth:</strong></td><td>${data.internDOB}</td></tr>
    ${data.isMinor ? `<tr><td><strong>Parent/Guardian:</strong></td><td>${data.parentGuardianName}</td></tr>` : ''}</table>
  </div>
  
  <div class="article"><div class="article-title">INTERNSHIP DETAILS</div>
    <table><tr><td style="width: 35%;"><strong>Host Entity:</strong></td><td>${entity.name}</td></tr>
    <tr><td><strong>Department:</strong></td><td>${data.department}</td></tr>
    <tr><td><strong>Internship Track:</strong></td><td>${data.internshipTrack}</td></tr>
    <tr><td><strong>Start Date:</strong></td><td>${data.startDate}</td></tr>
    <tr><td><strong>End Date:</strong></td><td>${data.endDate}</td></tr>
    <tr><td><strong>Hours per Week:</strong></td><td>${data.hoursPerWeek}</td></tr>
    <tr><td><strong>Mentor:</strong></td><td>${data.mentorName}, ${data.mentorTitle}</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 1 - PURPOSE AND SCOPE</div>
    <div class="section"><p>This internship is designed to provide the Intern with practical experience and professional development opportunities aligned with the L.A.W.S. framework.</p>
      <div style="text-align: center; margin: 20px 0;">
        <span class="laws-pillar pillar-land">LAND</span>
        <span class="laws-pillar pillar-air">AIR</span>
        <span class="laws-pillar pillar-water">WATER</span>
        <span class="laws-pillar pillar-self">SELF</span>
      </div>
    </div>
    <div class="section"><h3>Learning Objectives</h3>
      <ol>${data.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}</ol>
    </div>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 2 - COMPENSATION</div>
    <table><tr><td style="width: 50%;"><strong>Stipend Amount:</strong></td><td>$${data.stipendAmount.toLocaleString()} ${data.stipendFrequency}</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 3 - CAREER PATHWAY</div>
    <div class="section"><p>This internship represents the first stage in the L.A.W.S. career pathway:</p>
      <ol><li><strong>Intern:</strong> Educational experience and skill development (CURRENT)</li>
      <li><strong>W-2 Employee:</strong> Stable employment with benefits</li>
      <li><strong>Independent Contractor:</strong> Specialized services with flexibility</li>
      <li><strong>Business Owner:</strong> The The L.A.W.S. Collective member with own enterprise</li></ol>
    </div>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>${entity.name}</strong></p><div class="line"></div><div class="label">Authorized Representative</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>INTERN</strong></p><div class="line"></div><div class="label">${data.internName}</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
    ${data.isMinor ? `<div style="margin-top: 40px;"><p><strong>PARENT/GUARDIAN CONSENT</strong></p>
      <p>I, ${data.parentGuardianName}, as the parent/legal guardian of ${data.internName}, consent to this internship arrangement.</p>
      <div class="signature-box" style="margin-top: 20px;"><div class="line"></div><div class="label">Parent/Guardian Signature</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>` : ''}
  </div>
</div></body></html>`;
}

function generateInternshipCertificate(data: {
  internName: string;
  hostEntity: "parent_llc" | "collective" | "academy" | "real_eye_nation";
  internshipTrack: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  completionDate: string;
  certificateNumber: string;
  signatoryName: string;
  signatoryTitle: string;
}): string {
  const entity = entityNames[data.hostEntity];

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Certificate of Completion - ${data.internName}</title>${getDocumentStyles()}
  <style>body { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); } .certificate-container { background: white; padding: 60px; text-align: center; }</style>
</head>
<body><div class="document-container">
  <div class="certificate-border">
    <div class="certificate-container">
      <h1 style="font-size: 36pt; color: #1565c0; margin-bottom: 10px;">Certificate of Completion</h1>
      <p style="font-size: 14pt; color: #666; margin-bottom: 30px;">Internship Program</p>
      
      <p style="font-size: 14pt;">This is to certify that</p>
      <h2 style="font-size: 28pt; color: #333; border-bottom: 2px solid #1565c0; display: inline-block; padding: 10px 40px; margin: 20px 0;">${data.internName}</h2>
      
      <p style="font-size: 14pt;">has successfully completed the</p>
      <h3 style="font-size: 20pt; color: #1565c0; margin: 15px 0;">${data.internshipTrack}</h3>
      <p style="font-size: 14pt;">Internship Program at</p>
      <h3 style="font-size: 18pt; color: #333; margin: 15px 0;">${entity.name}</h3>
      
      <div style="margin: 30px 0;">
        <table style="border: none; margin: 0 auto; width: auto;">
          <tr style="border: none;"><td style="border: none; text-align: right; padding-right: 20px;"><strong>Duration:</strong></td><td style="border: none; text-align: left;">${data.startDate} - ${data.endDate}</td></tr>
          <tr style="border: none;"><td style="border: none; text-align: right; padding-right: 20px;"><strong>Total Hours:</strong></td><td style="border: none; text-align: left;">${data.totalHours} hours</td></tr>
          <tr style="border: none;"><td style="border: none; text-align: right; padding-right: 20px;"><strong>Certificate No:</strong></td><td style="border: none; text-align: left;">${data.certificateNumber}</td></tr>
        </table>
      </div>
      
      <div style="margin: 40px 0;"><div class="certificate-seal">L.A.W.S.</div></div>
      
      <p style="font-size: 12pt; color: #666;">Awarded on ${data.completionDate}</p>
      
      <div style="margin-top: 50px;">
        <div style="display: inline-block; text-align: center; width: 300px;">
          <div style="border-bottom: 1px solid #000; margin-bottom: 5px; height: 40px;"></div>
          <p style="margin: 0;">${data.signatoryName}</p>
          <p style="margin: 0; font-size: 10pt; color: #666;">${data.signatoryTitle}</p>
        </div>
      </div>
    </div>
  </div>
</div></body></html>`;
}

export const internshipProgramsRouter = router({
  generateInternshipAgreement: protectedProcedure
    .input(z.object({
      internName: z.string(),
      internAddress: z.string(),
      internPhone: z.string(),
      internEmail: z.string(),
      internDOB: z.string(),
      hostEntity: z.enum(["parent_llc", "collective", "academy", "real_eye_nation"]),
      department: z.string(),
      internshipTrack: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      hoursPerWeek: z.number(),
      stipendAmount: z.number(),
      stipendFrequency: z.enum(["weekly", "biweekly", "monthly"]),
      mentorName: z.string(),
      mentorTitle: z.string(),
      learningObjectives: z.array(z.string()),
      isMinor: z.boolean().default(false),
      parentGuardianName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const html = generateInternshipAgreement(input);
      return { html, documentType: "internship_agreement" };
    }),

  generateCompletionCertificate: protectedProcedure
    .input(z.object({
      internName: z.string(),
      hostEntity: z.enum(["parent_llc", "collective", "academy", "real_eye_nation"]),
      internshipTrack: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      totalHours: z.number(),
      completionDate: z.string(),
      certificateNumber: z.string(),
      signatoryName: z.string(),
      signatoryTitle: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateInternshipCertificate(input);
      return { html, documentType: "internship_certificate" };
    }),

  getInternshipTracks: protectedProcedure.query(() => {
    return {
      parent_llc: {
        entity: "LuvOnPurpose Autonomous Wealth System, LLC",
        tracks: [
          { id: "executive_operations", name: "Executive Operations", duration: "6 months", description: "Strategic planning, governance, executive support" },
          { id: "finance_accounting", name: "Finance & Accounting", duration: "6 months", description: "Financial management, reporting, compliance" },
          { id: "legal_compliance", name: "Legal & Compliance", duration: "6 months", description: "Contract management, regulatory compliance, risk" },
          { id: "business_development", name: "Business Development", duration: "6 months", description: "Partnership development, market analysis, growth" },
        ],
      },
      collective: {
        entity: "The The The L.A.W.S. Collective, LLC",
        tracks: [
          { id: "member_services", name: "Member Services", duration: "3-6 months", description: "Member relations, onboarding, support" },
          { id: "community_operations", name: "Community Operations", duration: "3-6 months", description: "Event coordination, community programs" },
          { id: "communications", name: "Communications", duration: "3-6 months", description: "Internal/external communications, marketing" },
          { id: "workforce_development", name: "Workforce Development", duration: "6 months", description: "Employment programs, contractor management" },
        ],
      },
      academy: {
        entity: "LuvOnPurpose Academy & Outreach",
        tracks: [
          { id: "curriculum_development", name: "Curriculum Development", duration: "6 months", description: "Course design, content creation" },
          { id: "instruction_support", name: "Instruction & Student Support", duration: "3-6 months", description: "Teaching assistance, tutoring" },
          { id: "program_administration", name: "Program Administration", duration: "6 months", description: "Program coordination, enrollment" },
          { id: "nonprofit_management", name: "Nonprofit Management", duration: "6 months", description: "Grant writing, donor relations" },
        ],
      },
      real_eye_nation: {
        entity: "Real-Eye-Nation",
        tracks: [
          { id: "content_creation", name: "Content Creation", duration: "3-6 months", description: "Video production, writing, multimedia" },
          { id: "media_production", name: "Media Production", duration: "6 months", description: "Audio/video editing, podcasts" },
          { id: "research_documentation", name: "Research & Documentation", duration: "6 months", description: "Historical research, fact-checking" },
          { id: "digital_marketing", name: "Digital Marketing", duration: "3-6 months", description: "Social media, digital campaigns" },
        ],
      },
    };
  }),

  getDocumentTypes: protectedProcedure.query(() => {
    return [
      { id: "internship_agreement", name: "Internship Agreement", description: "Formal agreement between intern and host entity", category: "agreement" },
      { id: "internship_certificate", name: "Completion Certificate", description: "Certificate awarded upon successful completion", category: "certificate" },
    ];
  }),

  getStandardCompetencies: protectedProcedure.query(() => {
    return [
      { id: "professionalism", name: "Professionalism", description: "Demonstrates professional conduct and work ethic" },
      { id: "communication", name: "Communication", description: "Effectively communicates verbally and in writing" },
      { id: "teamwork", name: "Teamwork", description: "Collaborates effectively with team members" },
      { id: "problem_solving", name: "Problem Solving", description: "Identifies issues and develops solutions" },
      { id: "initiative", name: "Initiative", description: "Takes proactive action and shows self-motivation" },
      { id: "adaptability", name: "Adaptability", description: "Adjusts to changing priorities and environments" },
      { id: "technical_skills", name: "Technical Skills", description: "Demonstrates required technical competencies" },
      { id: "time_management", name: "Time Management", description: "Manages time effectively and meets deadlines" },
      { id: "learning_agility", name: "Learning Agility", description: "Quickly acquires new knowledge and skills" },
      { id: "laws_alignment", name: "L.A.W.S. Alignment", description: "Demonstrates understanding and alignment with L.A.W.S. principles" },
    ];
  }),
});

export default internshipProgramsRouter;
