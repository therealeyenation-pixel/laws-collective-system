import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

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
    .article { margin-bottom: 30px; }
    .article-title { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 15px; text-decoration: underline; }
    ol, ul { margin: 10px 0 10px 30px; }
    li { margin-bottom: 8px; }
    .checkbox { display: inline-block; width: 15px; height: 15px; border: 1px solid #000; margin-right: 8px; vertical-align: middle; }
    .transition-header { background-color: #2e7d32; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
    .pathway-box { border: 2px solid #2e7d32; padding: 15px; margin: 20px 0; background-color: #e8f5e9; }
    .progression-arrow { text-align: center; font-size: 24pt; color: #2e7d32; margin: 10px 0; }
    .laws-pillar { display: inline-block; padding: 5px 15px; margin: 5px; border-radius: 20px; font-weight: bold; }
    .pillar-land { background-color: #8d6e63; color: white; }
    .pillar-air { background-color: #90caf9; color: #1565c0; }
    .pillar-water { background-color: #4fc3f7; color: #01579b; }
    .pillar-self { background-color: #ffb74d; color: #e65100; }
  </style>
`;

const entityNames: Record<string, { name: string; description: string }> = {
  parent_llc: { name: "LuvOnPurpose Autonomous Wealth System, LLC", description: "Parent holding company" },
  collective: { name: "The L.A.W.S. Collective, LLC", description: "Operating entity for member services" },
  academy: { name: "LuvOnPurpose Academy & Outreach", description: "508(c)(1)(A) educational organization" },
  real_eye_nation: { name: "Real-Eye-Nation", description: "Media division" },
};

function generateInternToEmployeeTransition(data: {
  individualName: string;
  individualAddress: string;
  hostEntity: "parent_llc" | "collective" | "academy" | "real_eye_nation";
  internshipCompletionDate: string;
  transitionDate: string;
  newPosition: string;
  department: string;
  employmentType: "full_time_w2" | "part_time_w2";
  salary: number;
  payFrequency: "weekly" | "biweekly" | "monthly";
  supervisorName: string;
  supervisorTitle: string;
  probationPeriod: number;
  benefits: string[];
}): string {
  const entity = entityNames[data.hostEntity];
  const employmentTypeLabel = data.employmentType === "full_time_w2" ? "Full-Time W-2 Employee" : "Part-Time W-2 Employee";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Internship to Employment Transition - ${data.individualName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="transition-header">
    <h1 style="color: white; margin: 0;">Internship to Employment Transition</h1>
    <p style="color: white; margin: 10px 0 0 0;">${entity.name}</p>
  </div>
  
  <div class="pathway-box">
    <p style="text-align: center; margin: 0;"><strong>Career Pathway Progression</strong></p>
    <div style="text-align: center; margin: 15px 0;">
      <span style="background: #1565c0; color: white; padding: 10px 20px; border-radius: 5px;">Intern</span>
      <span class="progression-arrow">→</span>
      <span style="background: #2e7d32; color: white; padding: 10px 20px; border-radius: 5px;">${employmentTypeLabel}</span>
    </div>
  </div>
  
  <div class="section"><p>This Internship to Employment Transition Agreement is entered into as of <strong>${data.transitionDate}</strong>, by and between:</p>
    <ol><li><strong>${entity.name}</strong> (the "Employer"); and</li>
    <li><strong>${data.individualName}</strong>, an individual residing at ${data.individualAddress} (the "Employee").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">EMPLOYMENT DETAILS</div>
    <table><tr><td style="width: 35%;"><strong>Position:</strong></td><td>${data.newPosition}</td></tr>
    <tr><td><strong>Department:</strong></td><td>${data.department}</td></tr>
    <tr><td><strong>Employment Type:</strong></td><td>${employmentTypeLabel}</td></tr>
    <tr><td><strong>Start Date:</strong></td><td>${data.transitionDate}</td></tr>
    <tr><td><strong>Supervisor:</strong></td><td>${data.supervisorName}, ${data.supervisorTitle}</td></tr>
    <tr><td><strong>Probationary Period:</strong></td><td>${data.probationPeriod} days</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">COMPENSATION</div>
    <table><tr><td style="width: 50%;"><strong>Annual Salary:</strong></td><td>$${data.salary.toLocaleString()}</td></tr>
    <tr><td><strong>Pay Frequency:</strong></td><td>${data.payFrequency.charAt(0).toUpperCase() + data.payFrequency.slice(1)}</td></tr></table>
    <p><strong>Benefits:</strong></p>
    <ul>${data.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
  </div>
  
  <div class="article"><div class="article-title">CAREER PATHWAY</div>
    <div class="pathway-box">
      <ol><li><strong>Intern:</strong> Educational experience and skill development (COMPLETED)</li>
      <li><strong>W-2 Employee:</strong> Stable employment with benefits (CURRENT)</li>
      <li><strong>Independent Contractor:</strong> Specialized services with flexibility (FUTURE)</li>
      <li><strong>Business Owner:</strong> L.A.W.S. Collective member with own enterprise (FUTURE)</li></ol>
    </div>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>${entity.name}</strong></p><div class="line"></div><div class="label">Authorized Representative</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>EMPLOYEE</strong></p><div class="line"></div><div class="label">${data.individualName}</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
  </div>
</div></body></html>`;
}

function generateInternToContractorTransition(data: {
  individualName: string;
  individualAddress: string;
  businessName?: string;
  hostEntity: "parent_llc" | "collective" | "academy" | "real_eye_nation";
  internshipCompletionDate: string;
  transitionDate: string;
  serviceDescription: string;
  contractDuration: string;
  hourlyRate?: number;
  projectRate?: number;
  paymentTerms: string;
  deliverables: string[];
}): string {
  const entity = entityNames[data.hostEntity];
  const contractorName = data.businessName || data.individualName;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Internship to Contractor Transition - ${data.individualName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="transition-header">
    <h1 style="color: white; margin: 0;">Internship to Contractor Transition</h1>
    <p style="color: white; margin: 10px 0 0 0;">${entity.name}</p>
  </div>
  
  <div class="pathway-box">
    <p style="text-align: center; margin: 0;"><strong>Career Pathway Progression</strong></p>
    <div style="text-align: center; margin: 15px 0;">
      <span style="background: #1565c0; color: white; padding: 10px 20px; border-radius: 5px;">Intern</span>
      <span class="progression-arrow">→</span>
      <span style="background: #ff6f00; color: white; padding: 10px 20px; border-radius: 5px;">Independent Contractor</span>
    </div>
  </div>
  
  <div class="section"><p>This Internship to Contractor Transition Agreement is entered into as of <strong>${data.transitionDate}</strong>, by and between:</p>
    <ol><li><strong>${entity.name}</strong> (the "Client"); and</li>
    <li><strong>${contractorName}</strong>${data.businessName ? `, represented by ${data.individualName}` : ''} (the "Contractor").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">ENGAGEMENT DETAILS</div>
    <table><tr><td style="width: 35%;"><strong>Contractor:</strong></td><td>${contractorName}</td></tr>
    <tr><td><strong>Services:</strong></td><td>${data.serviceDescription}</td></tr>
    <tr><td><strong>Contract Duration:</strong></td><td>${data.contractDuration}</td></tr>
    <tr><td><strong>Start Date:</strong></td><td>${data.transitionDate}</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">COMPENSATION</div>
    <table>
      ${data.hourlyRate ? `<tr><td style="width: 50%;"><strong>Hourly Rate:</strong></td><td>$${data.hourlyRate.toLocaleString()}/hour</td></tr>` : ''}
      ${data.projectRate ? `<tr><td style="width: 50%;"><strong>Project Rate:</strong></td><td>$${data.projectRate.toLocaleString()}</td></tr>` : ''}
      <tr><td><strong>Payment Terms:</strong></td><td>${data.paymentTerms}</td></tr>
    </table>
  </div>
  
  <div class="article"><div class="article-title">DELIVERABLES</div>
    <ol>${data.deliverables.map(d => `<li>${d}</li>`).join('')}</ol>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>${entity.name}</strong></p><div class="line"></div><div class="label">Authorized Representative</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>CONTRACTOR</strong></p><div class="line"></div><div class="label">${data.individualName}</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
  </div>
</div></body></html>`;
}

function generateInternToMemberTransition(data: {
  individualName: string;
  individualAddress: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
  internshipCompletionDate: string;
  transitionDate: string;
  membershipTier: "founding" | "standard" | "associate";
  initialContribution: number;
  monthlyDues: number;
  profitInterestPercentage: number;
}): string {
  const tierLabels: Record<string, string> = { founding: "Founding Member", standard: "Standard Member", associate: "Associate Member" };

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Internship to Collective Member Transition - ${data.individualName}</title>${getDocumentStyles()}</head>
<body><div class="document-container">
  <div class="transition-header">
    <h1 style="color: white; margin: 0;">Internship to Collective Member Transition</h1>
    <p style="color: white; margin: 10px 0 0 0;">The L.A.W.S. Collective, LLC</p>
  </div>
  
  <div class="pathway-box">
    <p style="text-align: center; margin: 0;"><strong>Career Pathway Completion</strong></p>
    <div style="text-align: center; margin: 15px 0;">
      <span style="background: #1565c0; color: white; padding: 10px 20px; border-radius: 5px;">Intern</span>
      <span class="progression-arrow">→</span>
      <span style="background: #7b1fa2; color: white; padding: 10px 20px; border-radius: 5px;">Business Owner / Collective Member</span>
    </div>
  </div>
  
  <div class="section"><p>This Internship to Collective Member Transition Agreement is entered into as of <strong>${data.transitionDate}</strong>, by and between:</p>
    <ol><li><strong>The L.A.W.S. Collective, LLC</strong> (the "Collective"); and</li>
    <li><strong>${data.individualName}</strong>, owner of <strong>${data.businessName}</strong> (the "New Member").</li></ol>
  </div>
  
  <div class="article"><div class="article-title">MEMBER BUSINESS INFORMATION</div>
    <table><tr><td style="width: 35%;"><strong>Business Name:</strong></td><td>${data.businessName}</td></tr>
    <tr><td><strong>Business Type:</strong></td><td>${data.businessType}</td></tr>
    <tr><td><strong>Description:</strong></td><td>${data.businessDescription}</td></tr>
    <tr><td><strong>Owner:</strong></td><td>${data.individualName}</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">MEMBERSHIP DETAILS</div>
    <table><tr><td style="width: 50%;"><strong>Membership Tier:</strong></td><td>${tierLabels[data.membershipTier]}</td></tr>
    <tr><td><strong>Effective Date:</strong></td><td>${data.transitionDate}</td></tr>
    <tr><td><strong>Initial Contribution:</strong></td><td>$${data.initialContribution.toLocaleString()}</td></tr>
    <tr><td><strong>Monthly Dues:</strong></td><td>$${data.monthlyDues.toLocaleString()}</td></tr>
    <tr><td><strong>Profit Interest:</strong></td><td>${data.profitInterestPercentage}%</td></tr></table>
  </div>
  
  <div class="article"><div class="article-title">CAREER PATHWAY COMPLETION</div>
    <div class="pathway-box">
      <ol><li><strong>Intern:</strong> Educational experience and skill development ✓</li>
      <li><strong>W-2 Employee:</strong> Stable employment with benefits ✓</li>
      <li><strong>Independent Contractor:</strong> Specialized services with flexibility ✓</li>
      <li><strong>Business Owner:</strong> L.A.W.S. Collective member with own enterprise ✓ <strong>(ACHIEVED)</strong></li></ol>
    </div>
  </div>
  
  <div class="signature-block"><p>IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
    <div class="signature-line" style="margin-top: 40px;">
      <div class="signature-box"><p><strong>The L.A.W.S. Collective, LLC</strong></p><div class="line"></div><div class="label">Authorized Representative</div><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
      <div class="signature-box"><p><strong>NEW MEMBER</strong></p><div class="line"></div><div class="label">${data.individualName}</div><p style="font-size: 10pt;">Owner, ${data.businessName}</p><div class="line" style="margin-top: 20px;"></div><div class="label">Date</div></div>
    </div>
  </div>
</div></body></html>`;
}

export const internshipTransitionRouter = router({
  generateInternToEmployee: protectedProcedure
    .input(z.object({
      individualName: z.string(),
      individualAddress: z.string(),
      hostEntity: z.enum(["parent_llc", "collective", "academy", "real_eye_nation"]),
      internshipCompletionDate: z.string(),
      transitionDate: z.string(),
      newPosition: z.string(),
      department: z.string(),
      employmentType: z.enum(["full_time_w2", "part_time_w2"]),
      salary: z.number(),
      payFrequency: z.enum(["weekly", "biweekly", "monthly"]),
      supervisorName: z.string(),
      supervisorTitle: z.string(),
      probationPeriod: z.number().default(90),
      benefits: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const html = generateInternToEmployeeTransition(input);
      return { html, documentType: "intern_to_employee_transition" };
    }),

  generateInternToContractor: protectedProcedure
    .input(z.object({
      individualName: z.string(),
      individualAddress: z.string(),
      businessName: z.string().optional(),
      hostEntity: z.enum(["parent_llc", "collective", "academy", "real_eye_nation"]),
      internshipCompletionDate: z.string(),
      transitionDate: z.string(),
      serviceDescription: z.string(),
      contractDuration: z.string(),
      hourlyRate: z.number().optional(),
      projectRate: z.number().optional(),
      paymentTerms: z.string(),
      deliverables: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const html = generateInternToContractorTransition(input);
      return { html, documentType: "intern_to_contractor_transition" };
    }),

  generateInternToMember: protectedProcedure
    .input(z.object({
      individualName: z.string(),
      individualAddress: z.string(),
      businessName: z.string(),
      businessType: z.string(),
      businessDescription: z.string(),
      internshipCompletionDate: z.string(),
      transitionDate: z.string(),
      membershipTier: z.enum(["founding", "standard", "associate"]),
      initialContribution: z.number(),
      monthlyDues: z.number(),
      profitInterestPercentage: z.number(),
    }))
    .mutation(async ({ input }) => {
      const html = generateInternToMemberTransition(input);
      return { html, documentType: "intern_to_member_transition" };
    }),

  getTransitionTypes: protectedProcedure.query(() => {
    return [
      { id: "intern_to_employee", name: "Intern to W-2 Employee", description: "Transition from internship to full or part-time employment", pathway_stage: 2 },
      { id: "intern_to_contractor", name: "Intern to Independent Contractor", description: "Transition from internship to 1099 contractor status", pathway_stage: 3 },
      { id: "intern_to_member", name: "Intern to Collective Member", description: "Transition from internship to business owner and Collective member", pathway_stage: 4 },
    ];
  }),

  getCareerPathway: protectedProcedure.query(() => {
    return [
      { stage: 1, name: "Intern", description: "Educational experience and skill development", status: "entry" },
      { stage: 2, name: "W-2 Employee", description: "Stable employment with benefits", status: "growth" },
      { stage: 3, name: "Independent Contractor", description: "Specialized services with flexibility", status: "advancement" },
      { stage: 4, name: "Business Owner", description: "L.A.W.S. Collective member with own enterprise", status: "achievement" },
    ];
  }),

  getStandardBenefits: protectedProcedure.query(() => {
    return [
      "Health insurance (medical, dental, vision)",
      "Paid time off (PTO)",
      "Paid holidays",
      "401(k) retirement plan with employer match",
      "Life insurance",
      "Short-term and long-term disability",
      "Professional development allowance",
      "L.A.W.S. Academy training access",
      "Employee assistance program (EAP)",
    ];
  }),
});

export default internshipTransitionRouter;
