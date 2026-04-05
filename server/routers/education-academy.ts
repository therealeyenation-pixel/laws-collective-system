import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

const getDocumentStyles = () => `
  <style>
    @page { size: letter; margin: 1in; }
    * { box-sizing: border-box; }
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
    .education-header { background-color: #1565c0; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .trade-header { background-color: #ff6f00; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .curriculum-box { border: 2px solid #1565c0; padding: 15px; margin: 20px 0; background-color: #e3f2fd; }
    .laws-pillar { display: inline-block; padding: 5px 15px; margin: 5px; border-radius: 20px; font-weight: bold; }
    .pillar-land { background-color: #8d6e63; color: white; }
    .pillar-air { background-color: #90caf9; color: #1565c0; }
    .pillar-water { background-color: #4fc3f7; color: #01579b; }
    .pillar-self { background-color: #ffb74d; color: #e65100; }
  </style>
`;

function generateHomeschoolEnrollmentAgreement(data: {
  studentName: string;
  studentDOB: string;
  gradeLevel: string;
  parentName: string;
  parentAddress: string;
  academicYear: string;
  enrollmentDate: string;
  tuitionAmount: number;
  curriculumType: string;
  specialAccommodations?: string;
}): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Homeschool Enrollment Agreement - ${data.studentName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="education-header">
    <h1 style="color: white; margin: 0;">LuvOnPurpose Academy & Outreach</h1>
    <p style="color: white; margin: 10px 0 0 0;">A 508(c)(1)(A) Tax-Exempt Organization</p>
    <p style="color: white; margin: 5px 0 0 0;">Homeschool Enrollment Agreement</p>
  </div>
  
  <div class="highlight-box"><p style="text-align: center;"><strong>Academic Year ${data.academicYear}</strong></p></div>
  
  <div class="section"><p>This Homeschool Enrollment Agreement is entered into as of <strong>${data.enrollmentDate}</strong>, by and between:</p>
    <ol><li><strong>LuvOnPurpose Academy & Outreach</strong>, a 508(c)(1)(A) tax-exempt organization (the "Academy"); and</li>
    <li><strong>${data.parentName}</strong>, as parent/legal guardian (the "Parent") of <strong>${data.studentName}</strong> (the "Student").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">STUDENT INFORMATION</div>
    <table><tr><td style="width: 40%;"><strong>Student Name:</strong></td><td>${data.studentName}</td></tr>
    <tr><td><strong>Date of Birth:</strong></td><td>${data.studentDOB}</td></tr>
    <tr><td><strong>Grade Level:</strong></td><td>${data.gradeLevel}</td></tr>
    <tr><td><strong>Academic Year:</strong></td><td>${data.academicYear}</td></tr>
    <tr><td><strong>Curriculum Type:</strong></td><td>${data.curriculumType}</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 1 - EDUCATIONAL PHILOSOPHY</div>
    <div class="section"><h3>1.1 L.A.W.S. Framework</h3>
      <p>The Academy's educational approach is grounded in the L.A.W.S. framework:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span class="laws-pillar pillar-land">LAND</span>
        <span class="laws-pillar pillar-air">AIR</span>
        <span class="laws-pillar pillar-water">WATER</span>
        <span class="laws-pillar pillar-self">SELF</span>
      </div>
    </div>
  </div>
  
  <div class="article"><div class="article-title">ARTICLE 2 - FINANCIAL TERMS</div>
    <div class="section"><h3>2.1 Tuition</h3>
      <table><tr><td style="width: 50%;"><strong>Annual Tuition:</strong></td><td>$${data.tuitionAmount.toLocaleString()}</td></tr>
      <tr><td><strong>Payment Options:</strong></td><td>Annual, Semester, or Monthly</td></tr></table>
    </div>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>LuvOnPurpose Academy & Outreach</strong></p><div class="line"></div><div class="label">Academy Director</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>PARENT/GUARDIAN</strong></p><div class="line"></div><div class="label">${data.parentName}</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
  </div>
</div></body></html>`;
}

function generateTradeAcademyEnrollment(data: {
  studentName: string;
  studentDOB: string;
  studentAddress: string;
  tradeProgram: string;
  programDuration: string;
  enrollmentDate: string;
  tuitionAmount: number;
  apprenticeshipIncluded: boolean;
  certifications: string[];
}): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Trade Academy Enrollment - ${data.studentName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="trade-header">
    <h1 style="color: white; margin: 0;">LuvOnPurpose Academy & Outreach</h1>
    <p style="color: white; margin: 10px 0 0 0;">Trade Academy Program</p>
    <p style="color: white; margin: 5px 0 0 0;">Enrollment Agreement</p>
  </div>
  
  <div class="highlight-box"><p style="text-align: center;"><strong>Program: ${data.tradeProgram}</strong></p><p style="text-align: center;">Duration: ${data.programDuration}</p></div>
  
  <div class="section"><p>This Trade Academy Enrollment Agreement is entered into as of <strong>${data.enrollmentDate}</strong>, by and between:</p>
    <ol><li><strong>LuvOnPurpose Academy & Outreach</strong>, a 508(c)(1)(A) tax-exempt organization (the "Academy"); and</li>
    <li><strong>${data.studentName}</strong>, an individual residing at ${data.studentAddress} (the "Student").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">STUDENT AND PROGRAM INFORMATION</div>
    <table><tr><td style="width: 40%;"><strong>Student Name:</strong></td><td>${data.studentName}</td></tr>
    <tr><td><strong>Date of Birth:</strong></td><td>${data.studentDOB}</td></tr>
    <tr><td><strong>Trade Program:</strong></td><td>${data.tradeProgram}</td></tr>
    <tr><td><strong>Program Duration:</strong></td><td>${data.programDuration}</td></tr>
    <tr><td><strong>Apprenticeship Included:</strong></td><td>${data.apprenticeshipIncluded ? "Yes" : "No"}</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">CERTIFICATIONS</div>
    <p>Upon successful completion, the Student will be prepared to obtain:</p>
    <ul>${data.certifications.map(cert => `<li>${cert}</li>`).join('')}</ul>
  </div>
  
  <div class="article"><div class="article-title">FINANCIAL TERMS</div>
    <table><tr><td style="width: 50%;"><strong>Program Tuition:</strong></td><td>$${data.tuitionAmount.toLocaleString()}</td></tr></table>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>LuvOnPurpose Academy & Outreach</strong></p><div class="line"></div><div class="label">Program Director</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>STUDENT</strong></p><div class="line"></div><div class="label">${data.studentName}</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
  </div>
</div></body></html>`;
}

export const educationAcademyRouter = router({
  generateHomeschoolEnrollment: protectedProcedure
    .input(z.object({
      studentName: z.string(),
      studentDOB: z.string(),
      gradeLevel: z.string(),
      parentName: z.string(),
      parentAddress: z.string(),
      academicYear: z.string(),
      enrollmentDate: z.string(),
      tuitionAmount: z.number(),
      curriculumType: z.string(),
      specialAccommodations: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const html = generateHomeschoolEnrollmentAgreement(input);
      return { html, documentType: "homeschool_enrollment" };
    }),

  generateTradeAcademyEnrollment: protectedProcedure
    .input(z.object({
      studentName: z.string(),
      studentDOB: z.string(),
      studentAddress: z.string(),
      tradeProgram: z.string(),
      programDuration: z.string(),
      enrollmentDate: z.string(),
      tuitionAmount: z.number(),
      apprenticeshipIncluded: z.boolean().default(true),
      certifications: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const html = generateTradeAcademyEnrollment(input);
      return { html, documentType: "trade_academy_enrollment" };
    }),

  getDocumentTypes: protectedProcedure.query(() => {
    return [
      { id: "homeschool_enrollment", name: "Homeschool Enrollment Agreement", description: "Enrollment agreement for K-12 homeschool program", category: "enrollment" },
      { id: "trade_academy_enrollment", name: "Trade Academy Enrollment", description: "Enrollment agreement for trade and vocational programs", category: "enrollment" },
    ];
  }),

  getTradePrograms: protectedProcedure.query(() => {
    return [
      { id: "carpentry", name: "Carpentry & Woodworking", duration: "12 months", tuition: 8500, certifications: ["NCCER Carpentry Level 1", "OSHA 10-Hour Construction"] },
      { id: "electrical", name: "Electrical Technology", duration: "18 months", tuition: 12000, certifications: ["NCCER Electrical Level 1-2", "OSHA 10-Hour Construction"] },
      { id: "plumbing", name: "Plumbing Technology", duration: "12 months", tuition: 9500, certifications: ["NCCER Plumbing Level 1", "OSHA 10-Hour Construction"] },
      { id: "hvac", name: "HVAC Technology", duration: "12 months", tuition: 10000, certifications: ["EPA 608 Certification", "NCCER HVAC Level 1"] },
      { id: "welding", name: "Welding Technology", duration: "9 months", tuition: 8000, certifications: ["AWS D1.1 Certification", "OSHA 10-Hour Construction"] },
      { id: "automotive", name: "Automotive Technology", duration: "12 months", tuition: 11000, certifications: ["ASE Certification Prep", "OSHA 10-Hour General Industry"] },
      { id: "agriculture", name: "Sustainable Agriculture", duration: "9 months", tuition: 6500, certifications: ["Organic Certification Prep", "Permaculture Design Certificate"] },
      { id: "culinary", name: "Culinary Arts", duration: "12 months", tuition: 9000, certifications: ["ServSafe Food Handler", "ServSafe Manager"] },
    ];
  }),

  getCurriculumTypes: protectedProcedure.query(() => {
    return [
      { id: "classical", name: "Classical Education", description: "Trivium-based approach" },
      { id: "charlotte_mason", name: "Charlotte Mason", description: "Living books, nature study" },
      { id: "montessori", name: "Montessori-Inspired", description: "Self-directed learning" },
      { id: "project_based", name: "Project-Based Learning", description: "Real-world projects" },
      { id: "traditional", name: "Traditional/Textbook", description: "Structured curriculum" },
      { id: "eclectic", name: "Eclectic/Custom", description: "Mix of approaches" },
    ];
  }),

  getGradeLevels: protectedProcedure.query(() => {
    return [
      { id: "prek", name: "Pre-K", ageRange: "3-4" },
      { id: "k", name: "Kindergarten", ageRange: "5-6" },
      { id: "1", name: "1st Grade", ageRange: "6-7" },
      { id: "2", name: "2nd Grade", ageRange: "7-8" },
      { id: "3", name: "3rd Grade", ageRange: "8-9" },
      { id: "4", name: "4th Grade", ageRange: "9-10" },
      { id: "5", name: "5th Grade", ageRange: "10-11" },
      { id: "6", name: "6th Grade", ageRange: "11-12" },
      { id: "7", name: "7th Grade", ageRange: "12-13" },
      { id: "8", name: "8th Grade", ageRange: "13-14" },
      { id: "9", name: "9th Grade (Freshman)", ageRange: "14-15" },
      { id: "10", name: "10th Grade (Sophomore)", ageRange: "15-16" },
      { id: "11", name: "11th Grade (Junior)", ageRange: "16-17" },
      { id: "12", name: "12th Grade (Senior)", ageRange: "17-18" },
    ];
  }),
});

export default educationAcademyRouter;
