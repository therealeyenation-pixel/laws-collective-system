import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

// ============================================
// SHARED STYLES FOR ALL DOCUMENTS
// ============================================

const getDocumentStyles = () => `
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20px;
    }
    
    .document-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    
    .document-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    
    .document-header h1 {
      font-size: 18pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
    }
    
    .document-header .subtitle {
      font-size: 12pt;
      font-style: italic;
      color: #444;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section h2 {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    
    .section h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    p {
      margin: 0 0 12px 0;
      text-align: justify;
    }
    
    .indent {
      margin-left: 0.5in;
    }
    
    .blank-line {
      display: inline-block;
      border-bottom: 1px solid #000;
      min-width: 200px;
      height: 1.2em;
    }
    
    .blank-line.short {
      min-width: 100px;
    }
    
    .blank-line.long {
      min-width: 300px;
    }
    
    .checkbox {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid #000;
      margin-right: 8px;
      vertical-align: middle;
    }
    
    .checkbox.checked::after {
      content: "✓";
      font-size: 12px;
      display: block;
      text-align: center;
      line-height: 14px;
    }
    
    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }
    
    .signature-line {
      border-bottom: 1px solid #000;
      margin: 30px 0 5px 0;
      width: 300px;
    }
    
    .signature-label {
      font-size: 10pt;
      color: #444;
    }
    
    .witness-block {
      display: flex;
      gap: 50px;
      margin-top: 30px;
    }
    
    .witness-item {
      flex: 1;
    }
    
    .notary-section {
      margin-top: 40px;
      padding: 20px;
      border: 1px solid #000;
      page-break-inside: avoid;
    }
    
    .notary-section h3 {
      text-align: center;
      margin-bottom: 15px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      text-align: center;
      font-size: 10pt;
      color: #666;
    }
    
    ul, ol {
      margin: 10px 0;
      padding-left: 30px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    .two-column {
      display: flex;
      gap: 40px;
    }
    
    .two-column > div {
      flex: 1;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .document-container {
        padding: 0;
      }
    }
  </style>
`;

// ============================================
// HEALTHCARE POWER OF ATTORNEY GENERATOR
// ============================================

interface HealthcarePOAData {
  principalName: string;
  principalAddress: string;
  principalCity: string;
  principalState: string;
  principalZip: string;
  principalDOB: string;
  agentName: string;
  agentAddress: string;
  agentCity: string;
  agentState: string;
  agentZip: string;
  agentPhone: string;
  agentRelationship: string;
  alternateAgentName?: string;
  alternateAgentAddress?: string;
  alternateAgentPhone?: string;
  powers: {
    consentToTreatment: boolean;
    refuseTreatment: boolean;
    accessMedicalRecords: boolean;
    hireDischargeProviders: boolean;
    admitToFacility: boolean;
    authorizeRelease: boolean;
    makeDNRDecisions: boolean;
    organDonation: boolean;
    mentalHealthTreatment: boolean;
    experimentalTreatment: boolean;
  };
  effectiveImmediately: boolean;
  effectiveUponIncapacity: boolean;
  state: string;
  county: string;
  executionDate: string;
}

function generateHealthcarePOA(data: HealthcarePOAData): string {
  const powersGranted = Object.entries(data.powers)
    .filter(([_, granted]) => granted)
    .map(([power]) => {
      const labels: Record<string, string> = {
        consentToTreatment: "Consent to or refuse any medical treatment, surgery, or diagnostic procedure",
        refuseTreatment: "Refuse or withdraw consent to life-sustaining treatment",
        accessMedicalRecords: "Access, obtain, and review all medical records and information",
        hireDischargeProviders: "Hire and discharge healthcare providers and facilities",
        admitToFacility: "Admit or discharge from any hospital, nursing home, or care facility",
        authorizeRelease: "Authorize release of medical information to third parties",
        makeDNRDecisions: "Make decisions regarding Do Not Resuscitate (DNR) orders",
        organDonation: "Make decisions regarding organ and tissue donation",
        mentalHealthTreatment: "Consent to mental health treatment and psychiatric care",
        experimentalTreatment: "Consent to experimental treatments and clinical trials",
      };
      return labels[power] || power;
    });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Healthcare Power of Attorney - ${data.principalName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>Healthcare Power of Attorney</h1>
      <p class="subtitle">Durable Power of Attorney for Healthcare Decisions</p>
      <p>State of ${data.state}</p>
    </div>

    <div class="section">
      <h2>Article I: Designation of Healthcare Agent</h2>
      
      <p>I, <strong>${data.principalName}</strong>, residing at ${data.principalAddress}, ${data.principalCity}, ${data.principalState} ${data.principalZip}, born on ${data.principalDOB} (hereinafter "Principal"), being of sound mind, do hereby designate and appoint the following individual as my Healthcare Agent to make healthcare decisions on my behalf:</p>
      
      <div class="indent">
        <p><strong>Primary Healthcare Agent:</strong></p>
        <p>Name: <strong>${data.agentName}</strong></p>
        <p>Address: ${data.agentAddress}, ${data.agentCity}, ${data.agentState} ${data.agentZip}</p>
        <p>Telephone: ${data.agentPhone}</p>
        <p>Relationship: ${data.agentRelationship}</p>
      </div>
      
      ${data.alternateAgentName ? `
      <div class="indent" style="margin-top: 20px;">
        <p><strong>Alternate Healthcare Agent:</strong></p>
        <p>Name: <strong>${data.alternateAgentName}</strong></p>
        ${data.alternateAgentAddress ? `<p>Address: ${data.alternateAgentAddress}</p>` : ''}
        ${data.alternateAgentPhone ? `<p>Telephone: ${data.alternateAgentPhone}</p>` : ''}
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>Article II: Powers Granted</h2>
      
      <p>I grant my Healthcare Agent full power and authority to make the following healthcare decisions on my behalf:</p>
      
      <ul>
        ${powersGranted.map(power => `<li>${power}</li>`).join('\n        ')}
      </ul>
    </div>

    <div class="section">
      <h2>Article III: Effective Date</h2>
      
      <p>This Healthcare Power of Attorney shall become effective:</p>
      
      <p>
        <span class="checkbox ${data.effectiveImmediately ? 'checked' : ''}"></span>
        <strong>Immediately</strong> upon execution of this document.
      </p>
      
      <p>
        <span class="checkbox ${data.effectiveUponIncapacity ? 'checked' : ''}"></span>
        <strong>Upon Incapacity</strong> - when a licensed physician determines that I am unable to make or communicate healthcare decisions.
      </p>
    </div>

    <div class="section">
      <h2>Article IV: Durability</h2>
      
      <p>This Power of Attorney shall not be affected by my subsequent disability or incapacity. This Power of Attorney shall remain in full force and effect until revoked by me in writing or by my death.</p>
    </div>

    <div class="section">
      <h2>Article V: Agent's Authority</h2>
      
      <p>My Healthcare Agent shall have the authority to:</p>
      <ul>
        <li>Make decisions consistent with my known wishes and values</li>
        <li>Act in my best interest when my wishes are unknown</li>
        <li>Access all medical records necessary to make informed decisions</li>
        <li>Communicate with healthcare providers on my behalf</li>
        <li>Execute any documents necessary to implement healthcare decisions</li>
      </ul>
    </div>

    <div class="section">
      <h2>Article VI: Revocation</h2>
      
      <p>I may revoke this Healthcare Power of Attorney at any time by:</p>
      <ul>
        <li>Executing a written revocation</li>
        <li>Executing a new Healthcare Power of Attorney</li>
        <li>Verbally notifying my Healthcare Agent and healthcare providers</li>
        <li>Any other method recognized by the laws of ${data.state}</li>
      </ul>
    </div>

    <div class="signature-section">
      <h2>Execution</h2>
      
      <p>I have executed this Healthcare Power of Attorney on this <span class="blank-line short"></span> day of <span class="blank-line short"></span>, 20<span class="blank-line short"></span>, in ${data.county} County, ${data.state}.</p>
      
      <div class="signature-line"></div>
      <p><strong>${data.principalName}</strong>, Principal</p>
      <p>Date: ${data.executionDate}</p>
    </div>

    <div class="witness-block">
      <div class="witness-item">
        <h3>Witness 1</h3>
        <div class="signature-line"></div>
        <p class="signature-label">Signature</p>
        <p>Printed Name: <span class="blank-line"></span></p>
        <p>Address: <span class="blank-line long"></span></p>
        <p>Date: <span class="blank-line short"></span></p>
      </div>
      
      <div class="witness-item">
        <h3>Witness 2</h3>
        <div class="signature-line"></div>
        <p class="signature-label">Signature</p>
        <p>Printed Name: <span class="blank-line"></span></p>
        <p>Address: <span class="blank-line long"></span></p>
        <p>Date: <span class="blank-line short"></span></p>
      </div>
    </div>

    <div class="notary-section">
      <h3>Notary Acknowledgment</h3>
      
      <p>State of ${data.state}</p>
      <p>County of ${data.county}</p>
      
      <p>On this <span class="blank-line short"></span> day of <span class="blank-line short"></span>, 20<span class="blank-line short"></span>, before me, the undersigned Notary Public, personally appeared <strong>${data.principalName}</strong>, known to me (or proved to me on the basis of satisfactory evidence) to be the person whose name is subscribed to the within instrument and acknowledged to me that they executed the same in their authorized capacity, and that by their signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.</p>
      
      <p>WITNESS my hand and official seal.</p>
      
      <div class="two-column" style="margin-top: 30px;">
        <div>
          <div class="signature-line"></div>
          <p class="signature-label">Notary Public Signature</p>
          <p>My Commission Expires: <span class="blank-line"></span></p>
        </div>
        <div style="text-align: center;">
          <p style="border: 1px solid #000; padding: 30px; display: inline-block;">[NOTARY SEAL]</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Healthcare Power of Attorney | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: HCPOA-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// LIVING WILL GENERATOR
// ============================================

interface LivingWillData {
  principalName: string;
  principalAddress: string;
  principalCity: string;
  principalState: string;
  principalZip: string;
  principalDOB: string;
  state: string;
  county: string;
  executionDate: string;
  lifeSustainingTreatment: {
    terminalCondition: "withhold" | "provide" | "agentDecides";
    permanentUnconscious: "withhold" | "provide" | "agentDecides";
    advancedDementia: "withhold" | "provide" | "agentDecides";
  };
  artificialNutrition: {
    terminalCondition: "withhold" | "provide" | "agentDecides";
    permanentUnconscious: "withhold" | "provide" | "agentDecides";
    advancedDementia: "withhold" | "provide" | "agentDecides";
  };
  artificialHydration: {
    terminalCondition: "withhold" | "provide" | "agentDecides";
    permanentUnconscious: "withhold" | "provide" | "agentDecides";
    advancedDementia: "withhold" | "provide" | "agentDecides";
  };
  painManagement: "maximum" | "moderate" | "minimal";
  organDonation: "yes" | "no" | "limited";
  organDonationLimitations?: string;
  anatomicalGift: boolean;
  researchDonation: boolean;
  burialPreferences: "burial" | "cremation" | "other";
  burialInstructions?: string;
  additionalInstructions?: string;
}

function generateLivingWill(data: LivingWillData): string {
  const getDecisionText = (decision: "withhold" | "provide" | "agentDecides") => {
    switch (decision) {
      case "withhold": return "WITHHOLD treatment";
      case "provide": return "PROVIDE treatment";
      case "agentDecides": return "Let my Healthcare Agent decide";
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Living Will - ${data.principalName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>Living Will</h1>
      <p class="subtitle">Advance Healthcare Directive</p>
      <p>State of ${data.state}</p>
    </div>

    <div class="section">
      <h2>Declaration</h2>
      
      <p>I, <strong>${data.principalName}</strong>, residing at ${data.principalAddress}, ${data.principalCity}, ${data.principalState} ${data.principalZip}, born on ${data.principalDOB}, being of sound mind, willfully and voluntarily make this declaration to be followed if I become incapacitated and unable to participate in decisions regarding my medical care.</p>
    </div>

    <div class="section">
      <h2>Article I: Life-Sustaining Treatment</h2>
      
      <p>If I have a <strong>terminal condition</strong> (an incurable condition that will result in death within a relatively short time):</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.terminalCondition === 'withhold' ? 'checked' : ''}"></span> Withhold life-sustaining treatment</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.terminalCondition === 'provide' ? 'checked' : ''}"></span> Provide life-sustaining treatment</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.terminalCondition === 'agentDecides' ? 'checked' : ''}"></span> Let my Healthcare Agent decide</p>
      
      <p style="margin-top: 20px;">If I am in a <strong>permanent unconscious state</strong> (permanent coma or persistent vegetative state):</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.permanentUnconscious === 'withhold' ? 'checked' : ''}"></span> Withhold life-sustaining treatment</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.permanentUnconscious === 'provide' ? 'checked' : ''}"></span> Provide life-sustaining treatment</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.permanentUnconscious === 'agentDecides' ? 'checked' : ''}"></span> Let my Healthcare Agent decide</p>
      
      <p style="margin-top: 20px;">If I have <strong>advanced dementia</strong> (severe cognitive impairment with no reasonable expectation of recovery):</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.advancedDementia === 'withhold' ? 'checked' : ''}"></span> Withhold life-sustaining treatment</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.advancedDementia === 'provide' ? 'checked' : ''}"></span> Provide life-sustaining treatment</p>
      <p class="indent"><span class="checkbox ${data.lifeSustainingTreatment.advancedDementia === 'agentDecides' ? 'checked' : ''}"></span> Let my Healthcare Agent decide</p>
    </div>

    <div class="section">
      <h2>Article II: Artificial Nutrition and Hydration</h2>
      
      <p>Regarding artificial nutrition (tube feeding) and hydration (IV fluids), my wishes are:</p>
      
      <p><strong>Artificial Nutrition:</strong></p>
      <p class="indent">Terminal Condition: ${getDecisionText(data.artificialNutrition.terminalCondition)}</p>
      <p class="indent">Permanent Unconscious State: ${getDecisionText(data.artificialNutrition.permanentUnconscious)}</p>
      <p class="indent">Advanced Dementia: ${getDecisionText(data.artificialNutrition.advancedDementia)}</p>
      
      <p style="margin-top: 15px;"><strong>Artificial Hydration:</strong></p>
      <p class="indent">Terminal Condition: ${getDecisionText(data.artificialHydration.terminalCondition)}</p>
      <p class="indent">Permanent Unconscious State: ${getDecisionText(data.artificialHydration.permanentUnconscious)}</p>
      <p class="indent">Advanced Dementia: ${getDecisionText(data.artificialHydration.advancedDementia)}</p>
    </div>

    <div class="section">
      <h2>Article III: Pain Management</h2>
      
      <p>I direct that I receive:</p>
      <p class="indent"><span class="checkbox ${data.painManagement === 'maximum' ? 'checked' : ''}"></span> <strong>Maximum pain relief</strong> - even if it may hasten my death or impair my consciousness</p>
      <p class="indent"><span class="checkbox ${data.painManagement === 'moderate' ? 'checked' : ''}"></span> <strong>Moderate pain relief</strong> - balancing comfort with alertness</p>
      <p class="indent"><span class="checkbox ${data.painManagement === 'minimal' ? 'checked' : ''}"></span> <strong>Minimal pain relief</strong> - to maintain maximum alertness</p>
    </div>

    <div class="section">
      <h2>Article IV: Organ and Tissue Donation</h2>
      
      <p>Upon my death, I wish to:</p>
      <p class="indent"><span class="checkbox ${data.organDonation === 'yes' ? 'checked' : ''}"></span> Donate any organs and tissues that may be useful</p>
      <p class="indent"><span class="checkbox ${data.organDonation === 'limited' ? 'checked' : ''}"></span> Donate only the following: ${data.organDonationLimitations || '_______________'}</p>
      <p class="indent"><span class="checkbox ${data.organDonation === 'no' ? 'checked' : ''}"></span> Do NOT donate any organs or tissues</p>
      
      <p style="margin-top: 15px;"><span class="checkbox ${data.anatomicalGift ? 'checked' : ''}"></span> I consent to anatomical gift for medical education</p>
      <p><span class="checkbox ${data.researchDonation ? 'checked' : ''}"></span> I consent to donation for medical research</p>
    </div>

    <div class="section">
      <h2>Article V: Final Arrangements</h2>
      
      <p>My preference for final disposition is:</p>
      <p class="indent"><span class="checkbox ${data.burialPreferences === 'burial' ? 'checked' : ''}"></span> Traditional burial</p>
      <p class="indent"><span class="checkbox ${data.burialPreferences === 'cremation' ? 'checked' : ''}"></span> Cremation</p>
      <p class="indent"><span class="checkbox ${data.burialPreferences === 'other' ? 'checked' : ''}"></span> Other: ${data.burialInstructions || '_______________'}</p>
    </div>

    ${data.additionalInstructions ? `
    <div class="section">
      <h2>Article VI: Additional Instructions</h2>
      <p>${data.additionalInstructions}</p>
    </div>
    ` : ''}

    <div class="section">
      <h2>Article VII: Legal Provisions</h2>
      
      <p>I understand the full import of this declaration and I am emotionally and mentally competent to make this declaration. I understand that this declaration shall be given effect in all circumstances, whether or not I am able to communicate my wishes.</p>
      
      <p>This Living Will supersedes any prior Living Will or Advance Directive I may have executed.</p>
    </div>

    <div class="signature-section">
      <h2>Execution</h2>
      
      <p>Executed this <span class="blank-line short"></span> day of <span class="blank-line short"></span>, 20<span class="blank-line short"></span>, in ${data.county} County, ${data.state}.</p>
      
      <div class="signature-line"></div>
      <p><strong>${data.principalName}</strong>, Declarant</p>
      <p>Date: ${data.executionDate}</p>
    </div>

    <div class="witness-block">
      <div class="witness-item">
        <h3>Witness 1</h3>
        <p>I declare that the person who signed this document, or asked another to sign on their behalf, did so in my presence, and that I believe them to be of sound mind.</p>
        <div class="signature-line"></div>
        <p class="signature-label">Signature</p>
        <p>Printed Name: <span class="blank-line"></span></p>
        <p>Address: <span class="blank-line long"></span></p>
      </div>
      
      <div class="witness-item">
        <h3>Witness 2</h3>
        <p>I declare that the person who signed this document, or asked another to sign on their behalf, did so in my presence, and that I believe them to be of sound mind.</p>
        <div class="signature-line"></div>
        <p class="signature-label">Signature</p>
        <p>Printed Name: <span class="blank-line"></span></p>
        <p>Address: <span class="blank-line long"></span></p>
      </div>
    </div>

    <div class="notary-section">
      <h3>Notary Acknowledgment</h3>
      
      <p>State of ${data.state}, County of ${data.county}</p>
      
      <p>On this <span class="blank-line short"></span> day of <span class="blank-line short"></span>, 20<span class="blank-line short"></span>, before me personally appeared <strong>${data.principalName}</strong>, to me known to be the Declarant described in and who executed the foregoing instrument, and acknowledged that they executed the same as their free act and deed.</p>
      
      <div class="two-column" style="margin-top: 30px;">
        <div>
          <div class="signature-line"></div>
          <p class="signature-label">Notary Public</p>
          <p>My Commission Expires: <span class="blank-line"></span></p>
        </div>
        <div style="text-align: center;">
          <p style="border: 1px solid #000; padding: 30px; display: inline-block;">[NOTARY SEAL]</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Living Will / Advance Healthcare Directive | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: LW-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// HIPAA AUTHORIZATION GENERATOR
// ============================================

interface HIPAAAuthData {
  patientName: string;
  patientDOB: string;
  patientAddress: string;
  patientCity: string;
  patientState: string;
  patientZip: string;
  patientPhone: string;
  authorizedPersons: Array<{
    name: string;
    relationship: string;
    phone?: string;
  }>;
  informationToRelease: {
    allRecords: boolean;
    medicalHistory: boolean;
    mentalHealth: boolean;
    substanceAbuse: boolean;
    hivAids: boolean;
    geneticInfo: boolean;
    billingRecords: boolean;
    labResults: boolean;
    imagingResults: boolean;
  };
  purposeOfRelease: string;
  expirationDate?: string;
  state: string;
  executionDate: string;
}

function generateHIPAAAuth(data: HIPAAAuthData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HIPAA Authorization - ${data.patientName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>HIPAA Authorization</h1>
      <p class="subtitle">Authorization for Release of Protected Health Information</p>
      <p>Pursuant to 45 CFR § 164.508</p>
    </div>

    <div class="section">
      <h2>Patient Information</h2>
      
      <p><strong>Patient Name:</strong> ${data.patientName}</p>
      <p><strong>Date of Birth:</strong> ${data.patientDOB}</p>
      <p><strong>Address:</strong> ${data.patientAddress}, ${data.patientCity}, ${data.patientState} ${data.patientZip}</p>
      <p><strong>Phone:</strong> ${data.patientPhone}</p>
    </div>

    <div class="section">
      <h2>Authorized Recipients</h2>
      
      <p>I authorize the release of my protected health information to the following person(s):</p>
      
      ${data.authorizedPersons.map((person, idx) => `
      <div class="indent" style="margin-bottom: 15px;">
        <p><strong>${idx + 1}. ${person.name}</strong></p>
        <p>Relationship: ${person.relationship}</p>
        ${person.phone ? `<p>Phone: ${person.phone}</p>` : ''}
      </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>Information to be Released</h2>
      
      <p>I authorize the release of the following health information:</p>
      
      <p><span class="checkbox ${data.informationToRelease.allRecords ? 'checked' : ''}"></span> All medical records</p>
      <p><span class="checkbox ${data.informationToRelease.medicalHistory ? 'checked' : ''}"></span> Medical history and physical examination</p>
      <p><span class="checkbox ${data.informationToRelease.labResults ? 'checked' : ''}"></span> Laboratory and test results</p>
      <p><span class="checkbox ${data.informationToRelease.imagingResults ? 'checked' : ''}"></span> X-rays, MRI, CT scans, and imaging results</p>
      <p><span class="checkbox ${data.informationToRelease.billingRecords ? 'checked' : ''}"></span> Billing and insurance records</p>
      
      <p style="margin-top: 15px;"><strong>Sensitive Information (requires specific authorization):</strong></p>
      <p><span class="checkbox ${data.informationToRelease.mentalHealth ? 'checked' : ''}"></span> Mental health records</p>
      <p><span class="checkbox ${data.informationToRelease.substanceAbuse ? 'checked' : ''}"></span> Substance abuse treatment records</p>
      <p><span class="checkbox ${data.informationToRelease.hivAids ? 'checked' : ''}"></span> HIV/AIDS-related information</p>
      <p><span class="checkbox ${data.informationToRelease.geneticInfo ? 'checked' : ''}"></span> Genetic testing information</p>
    </div>

    <div class="section">
      <h2>Purpose of Release</h2>
      <p>${data.purposeOfRelease || 'Coordination of healthcare and personal records management'}</p>
    </div>

    <div class="section">
      <h2>Expiration</h2>
      <p>This authorization shall expire on: ${data.expirationDate || 'One (1) year from the date of signature, or upon written revocation'}</p>
    </div>

    <div class="section">
      <h2>Patient Rights</h2>
      
      <p>I understand that:</p>
      <ul>
        <li>I have the right to revoke this authorization at any time by providing written notice</li>
        <li>Revocation will not affect actions taken before receipt of the revocation</li>
        <li>I may refuse to sign this authorization and it will not affect my treatment</li>
        <li>Information disclosed may be subject to re-disclosure and may no longer be protected</li>
        <li>I am entitled to receive a copy of this authorization</li>
      </ul>
    </div>

    <div class="signature-section">
      <h2>Authorization</h2>
      
      <p>I have read and understand this authorization. I authorize the use and/or disclosure of my protected health information as described above.</p>
      
      <div class="signature-line"></div>
      <p><strong>${data.patientName}</strong>, Patient (or Legal Representative)</p>
      <p>Date: ${data.executionDate}</p>
      
      <p style="margin-top: 20px;">If signed by legal representative:</p>
      <p>Representative Name: <span class="blank-line"></span></p>
      <p>Relationship to Patient: <span class="blank-line"></span></p>
      <p>Authority to Act: <span class="blank-line long"></span></p>
    </div>

    <div class="footer">
      <p>HIPAA Authorization for Release of PHI | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: HIPAA-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// FINANCIAL POWER OF ATTORNEY GENERATOR
// ============================================

interface FinancialPOAData {
  principalName: string;
  principalAddress: string;
  principalCity: string;
  principalState: string;
  principalZip: string;
  principalDOB: string;
  agentName: string;
  agentAddress: string;
  agentCity: string;
  agentState: string;
  agentZip: string;
  agentPhone: string;
  agentRelationship: string;
  alternateAgentName?: string;
  alternateAgentAddress?: string;
  alternateAgentPhone?: string;
  powers: {
    banking: boolean;
    realEstate: boolean;
    investments: boolean;
    retirement: boolean;
    taxes: boolean;
    insurance: boolean;
    business: boolean;
    government: boolean;
    litigation: boolean;
    personalProperty: boolean;
    gifting: boolean;
    trusts: boolean;
  };
  effectiveImmediately: boolean;
  effectiveUponIncapacity: boolean;
  giftingLimitations?: string;
  compensationAllowed: boolean;
  compensationAmount?: string;
  state: string;
  county: string;
  executionDate: string;
}

function generateFinancialPOA(data: FinancialPOAData): string {
  const powerLabels: Record<string, string> = {
    banking: "Banking and financial institution transactions",
    realEstate: "Real property transactions (buy, sell, lease, mortgage)",
    investments: "Stocks, bonds, securities, and investment accounts",
    retirement: "Retirement accounts (IRA, 401k, pension)",
    taxes: "Tax matters and filings with IRS and state agencies",
    insurance: "Insurance policies and claims",
    business: "Business operations and interests",
    government: "Government benefits (Social Security, Medicare, VA)",
    litigation: "Legal claims and litigation",
    personalProperty: "Personal property transactions",
    gifting: "Making gifts on my behalf",
    trusts: "Trust transactions and administration",
  };

  const grantedPowers = Object.entries(data.powers)
    .filter(([_, granted]) => granted)
    .map(([power]) => powerLabels[power] || power);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Durable Financial Power of Attorney - ${data.principalName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>Durable Financial Power of Attorney</h1>
      <p class="subtitle">General Power of Attorney for Financial Matters</p>
      <p>State of ${data.state}</p>
    </div>

    <div class="section">
      <h2>Article I: Appointment of Agent</h2>
      
      <p>I, <strong>${data.principalName}</strong>, residing at ${data.principalAddress}, ${data.principalCity}, ${data.principalState} ${data.principalZip}, born on ${data.principalDOB} (hereinafter "Principal"), being of sound mind, do hereby appoint:</p>
      
      <div class="indent">
        <p><strong>Primary Agent:</strong></p>
        <p>Name: <strong>${data.agentName}</strong></p>
        <p>Address: ${data.agentAddress}, ${data.agentCity}, ${data.agentState} ${data.agentZip}</p>
        <p>Telephone: ${data.agentPhone}</p>
        <p>Relationship: ${data.agentRelationship}</p>
      </div>
      
      ${data.alternateAgentName ? `
      <div class="indent" style="margin-top: 20px;">
        <p><strong>Successor Agent:</strong></p>
        <p>Name: <strong>${data.alternateAgentName}</strong></p>
        ${data.alternateAgentAddress ? `<p>Address: ${data.alternateAgentAddress}</p>` : ''}
        ${data.alternateAgentPhone ? `<p>Telephone: ${data.alternateAgentPhone}</p>` : ''}
      </div>
      ` : ''}
      
      <p style="margin-top: 15px;">as my true and lawful Attorney-in-Fact ("Agent") to act in my name, place, and stead in any and all financial matters.</p>
    </div>

    <div class="section">
      <h2>Article II: Powers Granted</h2>
      
      <p>I grant my Agent full power and authority to act on my behalf in the following matters:</p>
      
      <ol>
        ${grantedPowers.map(power => `<li>${power}</li>`).join('\n        ')}
      </ol>
      
      ${data.powers.gifting && data.giftingLimitations ? `
      <p style="margin-top: 15px;"><strong>Gifting Limitations:</strong> ${data.giftingLimitations}</p>
      ` : ''}
    </div>

    <div class="section">
      <h2>Article III: Effective Date and Durability</h2>
      
      <p>This Power of Attorney shall:</p>
      
      <p><span class="checkbox ${data.effectiveImmediately ? 'checked' : ''}"></span> Become effective immediately upon execution</p>
      <p><span class="checkbox ${data.effectiveUponIncapacity ? 'checked' : ''}"></span> Become effective only upon my incapacity as certified by a licensed physician</p>
      
      <p style="margin-top: 15px;"><strong>DURABILITY CLAUSE:</strong> This Power of Attorney shall not be affected by my subsequent disability or incapacity. This is a Durable Power of Attorney under the laws of ${data.state}.</p>
    </div>

    <div class="section">
      <h2>Article IV: Agent's Duties</h2>
      
      <p>My Agent shall:</p>
      <ul>
        <li>Act in my best interest at all times</li>
        <li>Maintain accurate records of all transactions</li>
        <li>Keep my assets separate from their own</li>
        <li>Avoid conflicts of interest</li>
        <li>Provide an accounting upon request</li>
      </ul>
    </div>

    <div class="section">
      <h2>Article V: Compensation</h2>
      
      <p><span class="checkbox ${data.compensationAllowed ? 'checked' : ''}"></span> My Agent shall be entitled to reasonable compensation for services rendered.</p>
      <p><span class="checkbox ${!data.compensationAllowed ? 'checked' : ''}"></span> My Agent shall serve without compensation.</p>
      
      ${data.compensationAllowed && data.compensationAmount ? `
      <p>Compensation shall be: ${data.compensationAmount}</p>
      ` : ''}
      
      <p>My Agent shall be reimbursed for all reasonable expenses incurred in performing duties under this Power of Attorney.</p>
    </div>

    <div class="section">
      <h2>Article VI: Third Party Reliance</h2>
      
      <p>Any third party who receives a copy of this document may rely upon it. Third parties may rely on my Agent's authority until they receive written notice of revocation, termination, or my death.</p>
    </div>

    <div class="section">
      <h2>Article VII: Revocation</h2>
      
      <p>I reserve the right to revoke this Power of Attorney at any time by providing written notice to my Agent. This Power of Attorney shall terminate upon my death.</p>
    </div>

    <div class="signature-section">
      <h2>Execution</h2>
      
      <p>IN WITNESS WHEREOF, I have executed this Durable Financial Power of Attorney on this <span class="blank-line short"></span> day of <span class="blank-line short"></span>, 20<span class="blank-line short"></span>, in ${data.county} County, ${data.state}.</p>
      
      <div class="signature-line"></div>
      <p><strong>${data.principalName}</strong>, Principal</p>
      <p>Date: ${data.executionDate}</p>
    </div>

    <div class="section" style="margin-top: 30px;">
      <h3>Agent's Acceptance</h3>
      
      <p>I, <strong>${data.agentName}</strong>, accept the appointment as Agent under this Power of Attorney. I agree to act in accordance with the Principal's instructions and in the Principal's best interest.</p>
      
      <div class="signature-line"></div>
      <p><strong>${data.agentName}</strong>, Agent</p>
      <p>Date: <span class="blank-line short"></span></p>
    </div>

    <div class="witness-block">
      <div class="witness-item">
        <h3>Witness 1</h3>
        <div class="signature-line"></div>
        <p class="signature-label">Signature</p>
        <p>Printed Name: <span class="blank-line"></span></p>
        <p>Address: <span class="blank-line long"></span></p>
      </div>
      
      <div class="witness-item">
        <h3>Witness 2</h3>
        <div class="signature-line"></div>
        <p class="signature-label">Signature</p>
        <p>Printed Name: <span class="blank-line"></span></p>
        <p>Address: <span class="blank-line long"></span></p>
      </div>
    </div>

    <div class="notary-section">
      <h3>Notary Acknowledgment</h3>
      
      <p>State of ${data.state}, County of ${data.county}</p>
      
      <p>On this <span class="blank-line short"></span> day of <span class="blank-line short"></span>, 20<span class="blank-line short"></span>, before me, the undersigned Notary Public, personally appeared <strong>${data.principalName}</strong>, known to me (or proved to me on the basis of satisfactory evidence) to be the person whose name is subscribed to the within instrument and acknowledged to me that they executed the same in their authorized capacity.</p>
      
      <div class="two-column" style="margin-top: 30px;">
        <div>
          <div class="signature-line"></div>
          <p class="signature-label">Notary Public</p>
          <p>My Commission Expires: <span class="blank-line"></span></p>
        </div>
        <div style="text-align: center;">
          <p style="border: 1px solid #000; padding: 30px; display: inline-block;">[NOTARY SEAL]</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Durable Financial Power of Attorney | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: FPOA-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// PRIVATE ARBITRATION AGREEMENT GENERATOR
// ============================================

interface ArbitrationAgreementData {
  party1Name: string;
  party1Address: string;
  party1Type: "individual" | "business";
  party2Name: string;
  party2Address: string;
  party2Type: "individual" | "business";
  agreementScope: string;
  arbitrationRules: "laws_collective" | "aaa" | "jams" | "custom";
  customRules?: string;
  arbitrationLocation: string;
  numberOfArbitrators: 1 | 3;
  arbitratorSelectionMethod: "mutual" | "panel" | "appointing_authority";
  governingLaw: string;
  languageOfArbitration: string;
  costAllocation: "equal" | "loser_pays" | "custom";
  customCostAllocation?: string;
  confidentiality: boolean;
  appealRights: boolean;
  executionDate: string;
}

function generateArbitrationAgreement(data: ArbitrationAgreementData): string {
  const rulesText = {
    laws_collective: "L.A.W.S. Collective Private Arbitration Rules",
    aaa: "American Arbitration Association (AAA) Commercial Arbitration Rules",
    jams: "JAMS Comprehensive Arbitration Rules",
    custom: data.customRules || "Custom rules as specified herein",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Private Arbitration Agreement</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>Private Arbitration Agreement</h1>
      <p class="subtitle">Binding Agreement for Private Dispute Resolution</p>
    </div>

    <div class="section">
      <h2>Parties</h2>
      
      <p>This Private Arbitration Agreement ("Agreement") is entered into as of ${data.executionDate} by and between:</p>
      
      <div class="indent">
        <p><strong>Party 1:</strong> ${data.party1Name}</p>
        <p>Address: ${data.party1Address}</p>
        <p>Type: ${data.party1Type === 'individual' ? 'Individual' : 'Business Entity'}</p>
      </div>
      
      <p style="text-align: center; margin: 15px 0;">AND</p>
      
      <div class="indent">
        <p><strong>Party 2:</strong> ${data.party2Name}</p>
        <p>Address: ${data.party2Address}</p>
        <p>Type: ${data.party2Type === 'individual' ? 'Individual' : 'Business Entity'}</p>
      </div>
      
      <p style="margin-top: 15px;">(collectively, the "Parties")</p>
    </div>

    <div class="section">
      <h2>Article I: Agreement to Arbitrate</h2>
      
      <p>The Parties agree that any dispute, controversy, or claim arising out of or relating to the following matters shall be resolved exclusively through binding private arbitration:</p>
      
      <div class="indent">
        <p>${data.agreementScope}</p>
      </div>
      
      <p>The Parties waive their right to resolve such disputes through litigation in any court, except as provided herein.</p>
    </div>

    <div class="section">
      <h2>Article II: Arbitration Rules and Procedures</h2>
      
      <p>The arbitration shall be conducted in accordance with the <strong>${rulesText[data.arbitrationRules]}</strong>, as modified by this Agreement.</p>
      
      <p><strong>Location:</strong> ${data.arbitrationLocation}</p>
      <p><strong>Language:</strong> ${data.languageOfArbitration}</p>
      <p><strong>Number of Arbitrators:</strong> ${data.numberOfArbitrators}</p>
    </div>

    <div class="section">
      <h2>Article III: Selection of Arbitrator(s)</h2>
      
      <p>The arbitrator(s) shall be selected as follows:</p>
      
      ${data.arbitratorSelectionMethod === 'mutual' ? `
      <p>The Parties shall mutually agree upon a qualified arbitrator within thirty (30) days of the demand for arbitration. If the Parties cannot agree, each Party shall select one arbitrator, and those two arbitrators shall select a third neutral arbitrator.</p>
      ` : data.arbitratorSelectionMethod === 'panel' ? `
      <p>Each Party shall select one arbitrator from a pre-approved panel, and those two arbitrators shall select a third neutral arbitrator to serve as the presiding arbitrator.</p>
      ` : `
      <p>The arbitrator(s) shall be appointed by a mutually agreed-upon appointing authority. If the Parties cannot agree on an appointing authority, the arbitrator(s) shall be appointed by the applicable arbitration institution.</p>
      `}
    </div>

    <div class="section">
      <h2>Article IV: Governing Law</h2>
      
      <p>This Agreement and any arbitration conducted hereunder shall be governed by the laws of <strong>${data.governingLaw}</strong>, without regard to its conflict of laws principles.</p>
    </div>

    <div class="section">
      <h2>Article V: Costs and Fees</h2>
      
      ${data.costAllocation === 'equal' ? `
      <p>The costs of arbitration, including arbitrator fees and administrative expenses, shall be shared equally by the Parties. Each Party shall bear its own attorneys' fees and costs.</p>
      ` : data.costAllocation === 'loser_pays' ? `
      <p>The prevailing Party shall be entitled to recover its reasonable attorneys' fees and costs, as well as the costs of arbitration, from the non-prevailing Party.</p>
      ` : `
      <p>${data.customCostAllocation || 'Costs shall be allocated as determined by the arbitrator(s).'}</p>
      `}
    </div>

    ${data.confidentiality ? `
    <div class="section">
      <h2>Article VI: Confidentiality</h2>
      
      <p>All aspects of the arbitration, including the existence of the dispute, the proceedings, evidence presented, and the award, shall be kept strictly confidential by the Parties, their representatives, and the arbitrator(s), except as required by law or to enforce the award.</p>
    </div>
    ` : ''}

    <div class="section">
      <h2>Article VII: Award</h2>
      
      <p>The arbitrator(s) shall render a written award within sixty (60) days of the close of the hearing. The award shall be final and binding upon the Parties.</p>
      
      ${data.appealRights ? `
      <p>Either Party may appeal the award to an appellate arbitration panel within thirty (30) days of the award, under the applicable appellate arbitration rules.</p>
      ` : `
      <p>The Parties waive any right to appeal the award except on grounds provided by applicable law.</p>
      `}
      
      <p>Judgment on the award may be entered in any court of competent jurisdiction.</p>
    </div>

    <div class="section">
      <h2>Article VIII: General Provisions</h2>
      
      <p><strong>Severability.</strong> If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
      
      <p><strong>Entire Agreement.</strong> This Agreement constitutes the entire agreement between the Parties regarding arbitration and supersedes all prior agreements on this subject.</p>
      
      <p><strong>Amendment.</strong> This Agreement may only be amended by a written instrument signed by both Parties.</p>
      
      <p><strong>Counterparts.</strong> This Agreement may be executed in counterparts, each of which shall be deemed an original.</p>
    </div>

    <div class="signature-section">
      <h2>Execution</h2>
      
      <p>IN WITNESS WHEREOF, the Parties have executed this Private Arbitration Agreement as of the date first written above.</p>
      
      <div class="witness-block">
        <div class="witness-item">
          <h3>Party 1</h3>
          <div class="signature-line"></div>
          <p class="signature-label">Signature</p>
          <p><strong>${data.party1Name}</strong></p>
          <p>Date: <span class="blank-line short"></span></p>
        </div>
        
        <div class="witness-item">
          <h3>Party 2</h3>
          <div class="signature-line"></div>
          <p class="signature-label">Signature</p>
          <p><strong>${data.party2Name}</strong></p>
          <p>Date: <span class="blank-line short"></span></p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Private Arbitration Agreement | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: ARB-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// PRIVACY TRUST GENERATOR
// ============================================

function generatePrivacyTrust(data: any): string {
  const purposeLabels: Record<string, string> = {
    asset_protection: "Asset Protection and Creditor Shield",
    privacy: "Privacy and Anonymity in Asset Ownership",
    estate_planning: "Estate Planning and Wealth Transfer",
    business_holding: "Business and Investment Holdings",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Trust Agreement - ${data.trustName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>${data.trustName}</h1>
      <p class="subtitle">${data.revocable ? "Revocable" : "Irrevocable"} Privacy Trust Agreement</p>
      <p>Governed by the Laws of ${data.governingLaw}</p>
    </div>

    <div class="section">
      <h2>Article I: Declaration of Trust</h2>
      <p>This Trust Agreement (the "Agreement") is made and entered into on <strong>${data.executionDate}</strong> by and between:</p>
      
      <div class="indent">
        <p><strong>SETTLOR:</strong></p>
        <p>${data.settlorName}</p>
        <p>${data.settlorAddress}, ${data.settlorCity}, ${data.settlorState} ${data.settlorZip}</p>
      </div>
      
      <div class="indent">
        <p><strong>TRUSTEE:</strong></p>
        <p>${data.trusteeName}</p>
        <p>${data.trusteeAddress}, ${data.trusteeCity}, ${data.trusteeState} ${data.trusteeZip}</p>
      </div>
      
      <p>The Settlor hereby transfers, assigns, and conveys to the Trustee the property described in Schedule A attached hereto, to be held, administered, and distributed according to the terms of this Agreement.</p>
    </div>

    <div class="section">
      <h2>Article II: Purpose of Trust</h2>
      <p>The primary purpose of this Trust is: <strong>${purposeLabels[data.trustPurpose]}</strong></p>
      <p>The Trust is established to provide privacy in the ownership and management of assets, protect assets from potential creditors, and facilitate the efficient transfer of wealth to designated beneficiaries.</p>
    </div>

    <div class="section">
      <h2>Article III: Beneficiaries</h2>
      <p>The following individuals are designated as beneficiaries of this Trust:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Relationship</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${data.beneficiaries.map((b: any) => `
          <tr>
            <td>${b.name}</td>
            <td>${b.relationship}</td>
            <td>${b.percentage}%</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Article IV: Trust Property</h2>
      <p>The initial trust property consists of:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Estimated Value</th>
          </tr>
        </thead>
        <tbody>
          ${data.initialAssets.map((a: any) => `
          <tr>
            <td>${a.description}</td>
            <td>${a.estimatedValue}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Article V: Trustee Powers</h2>
      <p>The Trustee shall have all powers necessary to carry out the purposes of this Trust, including but not limited to:</p>
      <ul>
        <li>To buy, sell, lease, or exchange any trust property</li>
        <li>To invest and reinvest trust funds in any property</li>
        <li>To borrow money and encumber trust property</li>
        <li>To employ agents, attorneys, and accountants</li>
        <li>To make distributions to beneficiaries</li>
        <li>To maintain privacy in all trust transactions</li>
      </ul>
    </div>

    ${data.successorTrusteeName ? `
    <div class="section">
      <h2>Article VI: Successor Trustee</h2>
      <p>If the Trustee is unable or unwilling to serve, the following individual shall serve as Successor Trustee:</p>
      <div class="indent">
        <p><strong>${data.successorTrusteeName}</strong></p>
        <p>${data.successorTrusteeAddress || ''}</p>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h2>Article VII: ${data.revocable ? 'Revocation and Amendment' : 'Irrevocability'}</h2>
      ${data.revocable ? `
      <p>The Settlor reserves the right to revoke, amend, or modify this Trust at any time during the Settlor's lifetime by written instrument delivered to the Trustee.</p>
      ` : `
      <p>This Trust is irrevocable. The Settlor has no power to revoke, amend, or modify this Trust or any of its terms.</p>
      `}
    </div>

    <div class="section">
      <h2>Article VIII: Governing Law</h2>
      <p>This Trust shall be governed by and construed in accordance with the laws of the State of <strong>${data.governingLaw}</strong>.</p>
    </div>

    <div class="signature-section">
      <h2>Execution</h2>
      <p>IN WITNESS WHEREOF, the parties have executed this Trust Agreement on the date first written above.</p>
      
      <div class="witness-grid">
        <div class="witness-item">
          <h3>Settlor</h3>
          <div class="signature-line"></div>
          <p class="signature-label">Signature</p>
          <p><strong>${data.settlorName}</strong></p>
          <p>Date: <span class="blank-line short"></span></p>
        </div>
        
        <div class="witness-item">
          <h3>Trustee</h3>
          <div class="signature-line"></div>
          <p class="signature-label">Signature</p>
          <p><strong>${data.trusteeName}</strong></p>
          <p>Date: <span class="blank-line short"></span></p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Privacy Trust Agreement | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: TRUST-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// LLC OPERATING AGREEMENT GENERATOR
// ============================================

function generateOperatingAgreement(data: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Operating Agreement - ${data.llcName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>Operating Agreement</h1>
      <p class="subtitle">${data.llcName}</p>
      <p>A ${data.stateOfFormation} Limited Liability Company</p>
    </div>

    <div class="section">
      <h2>Article I: Formation</h2>
      <p>This Operating Agreement (the "Agreement") of <strong>${data.llcName}</strong> (the "Company"), a limited liability company organized under the laws of the State of <strong>${data.stateOfFormation}</strong>, is entered into and effective as of <strong>${data.executionDate}</strong>.</p>
      
      <p><strong>Formation Date:</strong> ${data.formationDate}</p>
      <p><strong>Principal Place of Business:</strong> ${data.principalAddress}, ${data.principalCity}, ${data.principalState} ${data.principalZip}</p>
    </div>

    <div class="section">
      <h2>Article II: Purpose</h2>
      <p>The Company is formed for the following purpose: <strong>${data.businessPurpose}</strong></p>
      <p>The Company may engage in any lawful business activity permitted under the laws of ${data.stateOfFormation}.</p>
    </div>

    <div class="section">
      <h2>Article III: Members</h2>
      <p>The Members of the Company, their ownership interests, and capital contributions are as follows:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Type</th>
            <th>Ownership %</th>
            <th>Capital Contribution</th>
          </tr>
        </thead>
        <tbody>
          ${data.members.map((m: any) => `
          <tr>
            <td>${m.name}</td>
            <td>${m.memberType === 'individual' ? 'Individual' : 'Entity'}</td>
            <td>${m.ownershipPercentage}%</td>
            <td>${m.capitalContribution}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Article IV: Management</h2>
      <p>The Company shall be <strong>${data.managementType === 'member_managed' ? 'Member-Managed' : 'Manager-Managed'}</strong>.</p>
      
      ${data.managementType === 'manager_managed' && data.managers ? `
      <p>The following individuals are designated as Managers:</p>
      <ul>
        ${data.managers.map((m: any) => `<li>${m.name} - ${m.title}</li>`).join('')}
      </ul>
      ` : `
      <p>All Members shall have the authority to manage the business and affairs of the Company.</p>
      `}
    </div>

    <div class="section">
      <h2>Article V: Distributions</h2>
      <p><strong>Profit Distribution:</strong> ${data.profitDistribution === 'pro_rata' ? 'Profits and losses shall be allocated to Members in proportion to their ownership percentages.' : data.customDistribution}</p>
      <p><strong>Fiscal Year End:</strong> ${data.fiscalYearEnd}</p>
    </div>

    <div class="section">
      <h2>Article VI: Voting</h2>
      <p>Decisions requiring Member approval shall require a vote of <strong>${data.votingThreshold}%</strong> of the ownership interests.</p>
      <p>Major decisions including but not limited to the sale of substantially all assets, merger, or dissolution shall require unanimous consent.</p>
    </div>

    <div class="section">
      <h2>Article VII: Transfer of Interests</h2>
      ${data.transferRestrictions ? `
      <p>Transfer of membership interests is restricted. No Member may transfer, sell, assign, or encumber their interest without the prior written consent of all other Members.</p>
      ` : `
      <p>Members may freely transfer their interests subject to compliance with applicable securities laws.</p>
      `}
      ${data.rightOfFirstRefusal ? `
      <p><strong>Right of First Refusal:</strong> Before any Member may sell or transfer their interest to a third party, they must first offer the interest to the other Members at the same price and terms.</p>
      ` : ''}
    </div>

    <div class="section">
      <h2>Article VIII: Dissolution</h2>
      <p>The Company shall be dissolved upon the occurrence of any of the following events:</p>
      <ul>
        ${data.dissolutionEvents.map((e: string) => `<li>${e}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h2>Article IX: Governing Law</h2>
      <p>This Agreement shall be governed by the laws of the State of <strong>${data.stateOfFormation}</strong>.</p>
    </div>

    <div class="signature-section">
      <h2>Member Signatures</h2>
      <p>IN WITNESS WHEREOF, the undersigned Members have executed this Operating Agreement as of the date first written above.</p>
      
      <div class="witness-grid">
        ${data.members.map((m: any) => `
        <div class="witness-item">
          <div class="signature-line"></div>
          <p class="signature-label">Signature</p>
          <p><strong>${m.name}</strong></p>
          <p>Ownership: ${m.ownershipPercentage}%</p>
          <p>Date: <span class="blank-line short"></span></p>
        </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p>LLC Operating Agreement | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: OA-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// DBA REGISTRATION GENERATOR
// ============================================

function generateDBARegistration(data: any): string {
  const ownerTypeLabels: Record<string, string> = {
    individual: "Individual/Sole Proprietor",
    llc: "Limited Liability Company",
    corporation: "Corporation",
    partnership: "Partnership",
    trust: "Trust",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DBA Registration - ${data.dbaName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>Fictitious Business Name Statement</h1>
      <p class="subtitle">DBA (Doing Business As) Registration</p>
      <p>${data.countyOfRegistration} County, ${data.stateOfRegistration}</p>
    </div>

    <div class="section">
      <h2>Section 1: Fictitious Business Name</h2>
      <p>The following person(s) is/are doing business as:</p>
      <div class="highlight-box">
        <h3>${data.dbaName}</h3>
      </div>
      <p><strong>Business Address:</strong> ${data.businessAddress}, ${data.businessCity}, ${data.businessState} ${data.businessZip}</p>
    </div>

    <div class="section">
      <h2>Section 2: Registrant Information</h2>
      <p><strong>Owner Name:</strong> ${data.ownerName}</p>
      <p><strong>Owner Type:</strong> ${ownerTypeLabels[data.ownerType]}</p>
      <p><strong>Owner Address:</strong> ${data.ownerAddress}, ${data.ownerCity}, ${data.ownerState} ${data.ownerZip}</p>
    </div>

    <div class="section">
      <h2>Section 3: Business Information</h2>
      <p><strong>Type of Business:</strong> ${data.businessType}</p>
      <p><strong>Business Description:</strong> ${data.businessDescription}</p>
      <p><strong>Registration Date:</strong> ${data.registrationDate}</p>
    </div>

    <div class="section">
      <h2>Section 4: Declaration</h2>
      <p>I declare that all information in this statement is true and correct. A registrant who declares as true any material matter pursuant to this section that the registrant knows to be false is guilty of a misdemeanor.</p>
    </div>

    <div class="signature-section">
      <h2>Registrant Signature</h2>
      <div class="witness-item">
        <div class="signature-line"></div>
        <p class="signature-label">Signature of Registrant</p>
        <p><strong>${data.ownerName}</strong></p>
        <p>Date: <span class="blank-line short"></span></p>
      </div>
    </div>

    <div class="section">
      <h2>For Official Use Only</h2>
      <p>Filed with the County Clerk of ${data.countyOfRegistration} County</p>
      <p>File Number: <span class="blank-line"></span></p>
      <p>Filing Date: <span class="blank-line short"></span></p>
      <p>Expiration Date: <span class="blank-line short"></span></p>
    </div>

    <div class="footer">
      <p>Fictitious Business Name Statement | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: DBA-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// REVOCABLE LIVING TRUST GENERATOR
// ============================================

function generateRevocableLivingTrust(data: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revocable Living Trust - ${data.trustName}</title>
  ${getDocumentStyles()}
</head>
<body>
  <div class="document-container">
    <div class="document-header">
      <h1>${data.trustName}</h1>
      <p class="subtitle">Revocable Living Trust Agreement</p>
      <p>Governed by the Laws of ${data.governingLaw}</p>
    </div>

    <div class="section">
      <h2>Article I: Declaration of Trust</h2>
      <p>I, <strong>${data.grantorName}</strong>, residing at ${data.grantorAddress}, ${data.grantorCity}, ${data.grantorState} ${data.grantorZip}, (hereinafter "Grantor" and "Trustee"), declare that I hold the property described in Schedule A attached hereto, IN TRUST, for the uses and purposes and upon the terms and conditions set forth in this Agreement.</p>
      <p><strong>Effective Date:</strong> ${data.executionDate}</p>
    </div>

    <div class="section">
      <h2>Article II: Revocability</h2>
      <p>This Trust is revocable. The Grantor reserves the right to revoke, amend, or modify this Trust at any time during the Grantor's lifetime by written instrument delivered to the Trustee. Upon the death of the Grantor, this Trust shall become irrevocable.</p>
    </div>

    <div class="section">
      <h2>Article III: Trustee Designation</h2>
      <p><strong>Initial Trustee:</strong> ${data.trusteeName}</p>
      <p>Address: ${data.trusteeAddress}</p>
      
      <h3>Successor Trustees</h3>
      <p>If the initial Trustee is unable or unwilling to serve, the following shall serve as Successor Trustee in the order named:</p>
      <ol>
        <li><strong>${data.successorTrustee1Name}</strong> - ${data.successorTrustee1Address}</li>
        ${data.successorTrustee2Name ? `<li><strong>${data.successorTrustee2Name}</strong> - ${data.successorTrustee2Address}</li>` : ''}
      </ol>
    </div>

    <div class="section">
      <h2>Article IV: Beneficiaries</h2>
      <h3>Primary Beneficiaries</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Relationship</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          ${data.beneficiaries.filter((b: any) => !b.contingent).map((b: any) => `
          <tr>
            <td>${b.name}</td>
            <td>${b.relationship}</td>
            <td>${b.percentage}%</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${data.beneficiaries.some((b: any) => b.contingent) ? `
      <h3>Contingent Beneficiaries</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Relationship</th>
            <th>Share</th>
          </tr>
        </thead>
        <tbody>
          ${data.beneficiaries.filter((b: any) => b.contingent).map((b: any) => `
          <tr>
            <td>${b.name}</td>
            <td>${b.relationship}</td>
            <td>${b.percentage}%</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
    </div>

    ${data.specificBequests && data.specificBequests.length > 0 ? `
    <div class="section">
      <h2>Article V: Specific Bequests</h2>
      <p>The following specific items shall be distributed as indicated:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Beneficiary</th>
          </tr>
        </thead>
        <tbody>
          ${data.specificBequests.map((b: any) => `
          <tr>
            <td>${b.item}</td>
            <td>${b.beneficiary}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="section">
      <h2>Article VI: Residuary Distribution</h2>
      <p>${data.residuaryDistribution}</p>
    </div>

    ${data.incapacityProvisions ? `
    <div class="section">
      <h2>Article VII: Incapacity Provisions</h2>
      <p>If the Grantor becomes incapacitated, the Successor Trustee shall manage the Trust assets for the benefit of the Grantor. The Trustee shall use Trust income and principal as necessary for the Grantor's health, education, maintenance, and support.</p>
    </div>
    ` : ''}

    ${data.spendthriftProvisions ? `
    <div class="section">
      <h2>Article VIII: Spendthrift Provisions</h2>
      <p>No beneficiary shall have the right to anticipate, sell, assign, mortgage, pledge, or otherwise dispose of or encumber all or any part of such beneficiary's interest in the Trust. No interest of any beneficiary shall be subject to claims of creditors or others.</p>
    </div>
    ` : ''}

    ${data.noContestClause ? `
    <div class="section">
      <h2>Article IX: No-Contest Clause</h2>
      <p>If any beneficiary contests this Trust or any of its provisions, that beneficiary shall forfeit their entire interest in the Trust, and such interest shall be distributed as if that beneficiary had predeceased the Grantor.</p>
    </div>
    ` : ''}

    <div class="section">
      <h2>Article X: Trustee Compensation</h2>
      ${data.trusteeCompensation === 'none' ? `
      <p>The Trustee shall serve without compensation.</p>
      ` : data.trusteeCompensation === 'reasonable' ? `
      <p>The Trustee shall be entitled to reasonable compensation for services rendered.</p>
      ` : `
      <p>The Trustee shall be entitled to compensation as follows: ${data.compensationDetails}</p>
      `}
    </div>

    <div class="section">
      <h2>Article XI: Governing Law</h2>
      <p>This Trust shall be governed by and construed in accordance with the laws of the State of <strong>${data.governingLaw}</strong>.</p>
    </div>

    <div class="signature-section">
      <h2>Execution</h2>
      <p>IN WITNESS WHEREOF, I have executed this Revocable Living Trust Agreement on <strong>${data.executionDate}</strong>.</p>
      
      <div class="witness-grid">
        <div class="witness-item">
          <h3>Grantor/Trustee</h3>
          <div class="signature-line"></div>
          <p class="signature-label">Signature</p>
          <p><strong>${data.grantorName}</strong></p>
          <p>Date: <span class="blank-line short"></span></p>
        </div>
      </div>
      
      <h3>Witnesses</h3>
      <div class="witness-grid">
        <div class="witness-item">
          <div class="signature-line"></div>
          <p class="signature-label">Witness 1 Signature</p>
          <p>Name: <span class="blank-line"></span></p>
          <p>Address: <span class="blank-line long"></span></p>
        </div>
        
        <div class="witness-item">
          <div class="signature-line"></div>
          <p class="signature-label">Witness 2 Signature</p>
          <p>Name: <span class="blank-line"></span></p>
          <p>Address: <span class="blank-line long"></span></p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Revocable Living Trust | Generated by L.A.W.S. Collective Protection Layer</p>
      <p>Document ID: RLT-${Date.now()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============================================
// ROUTER DEFINITION
// ============================================

export const protectionLayerRouter = router({
  // Generate Healthcare Power of Attorney
  generateHealthcarePOA: protectedProcedure
    .input(z.object({
      principalName: z.string(),
      principalAddress: z.string(),
      principalCity: z.string(),
      principalState: z.string(),
      principalZip: z.string(),
      principalDOB: z.string(),
      agentName: z.string(),
      agentAddress: z.string(),
      agentCity: z.string(),
      agentState: z.string(),
      agentZip: z.string(),
      agentPhone: z.string(),
      agentRelationship: z.string(),
      alternateAgentName: z.string().optional(),
      alternateAgentAddress: z.string().optional(),
      alternateAgentPhone: z.string().optional(),
      powers: z.object({
        consentToTreatment: z.boolean(),
        refuseTreatment: z.boolean(),
        accessMedicalRecords: z.boolean(),
        hireDischargeProviders: z.boolean(),
        admitToFacility: z.boolean(),
        authorizeRelease: z.boolean(),
        makeDNRDecisions: z.boolean(),
        organDonation: z.boolean(),
        mentalHealthTreatment: z.boolean(),
        experimentalTreatment: z.boolean(),
      }),
      effectiveImmediately: z.boolean(),
      effectiveUponIncapacity: z.boolean(),
      state: z.string(),
      county: z.string(),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateHealthcarePOA(input);
      const fileName = `healthcare-poa-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "healthcare_poa",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Living Will
  generateLivingWill: protectedProcedure
    .input(z.object({
      principalName: z.string(),
      principalAddress: z.string(),
      principalCity: z.string(),
      principalState: z.string(),
      principalZip: z.string(),
      principalDOB: z.string(),
      state: z.string(),
      county: z.string(),
      executionDate: z.string(),
      lifeSustainingTreatment: z.object({
        terminalCondition: z.enum(["withhold", "provide", "agentDecides"]),
        permanentUnconscious: z.enum(["withhold", "provide", "agentDecides"]),
        advancedDementia: z.enum(["withhold", "provide", "agentDecides"]),
      }),
      artificialNutrition: z.object({
        terminalCondition: z.enum(["withhold", "provide", "agentDecides"]),
        permanentUnconscious: z.enum(["withhold", "provide", "agentDecides"]),
        advancedDementia: z.enum(["withhold", "provide", "agentDecides"]),
      }),
      artificialHydration: z.object({
        terminalCondition: z.enum(["withhold", "provide", "agentDecides"]),
        permanentUnconscious: z.enum(["withhold", "provide", "agentDecides"]),
        advancedDementia: z.enum(["withhold", "provide", "agentDecides"]),
      }),
      painManagement: z.enum(["maximum", "moderate", "minimal"]),
      organDonation: z.enum(["yes", "no", "limited"]),
      organDonationLimitations: z.string().optional(),
      anatomicalGift: z.boolean(),
      researchDonation: z.boolean(),
      burialPreferences: z.enum(["burial", "cremation", "other"]),
      burialInstructions: z.string().optional(),
      additionalInstructions: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const html = generateLivingWill(input);
      const fileName = `living-will-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "living_will",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate HIPAA Authorization
  generateHIPAAAuth: protectedProcedure
    .input(z.object({
      patientName: z.string(),
      patientDOB: z.string(),
      patientAddress: z.string(),
      patientCity: z.string(),
      patientState: z.string(),
      patientZip: z.string(),
      patientPhone: z.string(),
      authorizedPersons: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string().optional(),
      })),
      informationToRelease: z.object({
        allRecords: z.boolean(),
        medicalHistory: z.boolean(),
        mentalHealth: z.boolean(),
        substanceAbuse: z.boolean(),
        hivAids: z.boolean(),
        geneticInfo: z.boolean(),
        billingRecords: z.boolean(),
        labResults: z.boolean(),
        imagingResults: z.boolean(),
      }),
      purposeOfRelease: z.string(),
      expirationDate: z.string().optional(),
      state: z.string(),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateHIPAAAuth(input);
      const fileName = `hipaa-auth-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "hipaa_authorization",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Financial Power of Attorney
  generateFinancialPOA: protectedProcedure
    .input(z.object({
      principalName: z.string(),
      principalAddress: z.string(),
      principalCity: z.string(),
      principalState: z.string(),
      principalZip: z.string(),
      principalDOB: z.string(),
      agentName: z.string(),
      agentAddress: z.string(),
      agentCity: z.string(),
      agentState: z.string(),
      agentZip: z.string(),
      agentPhone: z.string(),
      agentRelationship: z.string(),
      alternateAgentName: z.string().optional(),
      alternateAgentAddress: z.string().optional(),
      alternateAgentPhone: z.string().optional(),
      powers: z.object({
        banking: z.boolean(),
        realEstate: z.boolean(),
        investments: z.boolean(),
        retirement: z.boolean(),
        taxes: z.boolean(),
        insurance: z.boolean(),
        business: z.boolean(),
        government: z.boolean(),
        litigation: z.boolean(),
        personalProperty: z.boolean(),
        gifting: z.boolean(),
        trusts: z.boolean(),
      }),
      effectiveImmediately: z.boolean(),
      effectiveUponIncapacity: z.boolean(),
      giftingLimitations: z.string().optional(),
      compensationAllowed: z.boolean(),
      compensationAmount: z.string().optional(),
      state: z.string(),
      county: z.string(),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateFinancialPOA(input);
      const fileName = `financial-poa-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "financial_poa",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Private Arbitration Agreement
  generateArbitrationAgreement: protectedProcedure
    .input(z.object({
      party1Name: z.string(),
      party1Address: z.string(),
      party1Type: z.enum(["individual", "business"]),
      party2Name: z.string(),
      party2Address: z.string(),
      party2Type: z.enum(["individual", "business"]),
      agreementScope: z.string(),
      arbitrationRules: z.enum(["laws_collective", "aaa", "jams", "custom"]),
      customRules: z.string().optional(),
      arbitrationLocation: z.string(),
      numberOfArbitrators: z.union([z.literal(1), z.literal(3)]),
      arbitratorSelectionMethod: z.enum(["mutual", "panel", "appointing_authority"]),
      governingLaw: z.string(),
      languageOfArbitration: z.string(),
      costAllocation: z.enum(["equal", "loser_pays", "custom"]),
      customCostAllocation: z.string().optional(),
      confidentiality: z.boolean(),
      appealRights: z.boolean(),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateArbitrationAgreement(input);
      const fileName = `arbitration-agreement-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "arbitration_agreement",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Privacy Trust
  generatePrivacyTrust: protectedProcedure
    .input(z.object({
      trustName: z.string(),
      settlorName: z.string(),
      settlorAddress: z.string(),
      settlorCity: z.string(),
      settlorState: z.string(),
      settlorZip: z.string(),
      trusteeName: z.string(),
      trusteeAddress: z.string(),
      trusteeCity: z.string(),
      trusteeState: z.string(),
      trusteeZip: z.string(),
      successorTrusteeName: z.string().optional(),
      successorTrusteeAddress: z.string().optional(),
      beneficiaries: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        percentage: z.number(),
      })),
      initialAssets: z.array(z.object({
        description: z.string(),
        estimatedValue: z.string(),
      })),
      trustPurpose: z.enum(["asset_protection", "privacy", "estate_planning", "business_holding"]),
      revocable: z.boolean(),
      governingLaw: z.string(),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generatePrivacyTrust(input);
      const fileName = `privacy-trust-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "privacy_trust",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate LLC Operating Agreement
  generateOperatingAgreement: protectedProcedure
    .input(z.object({
      llcName: z.string(),
      stateOfFormation: z.string(),
      formationDate: z.string(),
      principalAddress: z.string(),
      principalCity: z.string(),
      principalState: z.string(),
      principalZip: z.string(),
      members: z.array(z.object({
        name: z.string(),
        address: z.string(),
        ownershipPercentage: z.number(),
        capitalContribution: z.string(),
        memberType: z.enum(["individual", "entity"]),
      })),
      managementType: z.enum(["member_managed", "manager_managed"]),
      managers: z.array(z.object({
        name: z.string(),
        title: z.string(),
      })).optional(),
      businessPurpose: z.string(),
      fiscalYearEnd: z.string(),
      profitDistribution: z.enum(["pro_rata", "custom"]),
      customDistribution: z.string().optional(),
      votingThreshold: z.number(),
      transferRestrictions: z.boolean(),
      rightOfFirstRefusal: z.boolean(),
      dissolutionEvents: z.array(z.string()),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateOperatingAgreement(input);
      const fileName = `operating-agreement-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "operating_agreement",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate DBA Registration Form
  generateDBARegistration: protectedProcedure
    .input(z.object({
      dbaName: z.string(),
      ownerName: z.string(),
      ownerType: z.enum(["individual", "llc", "corporation", "partnership", "trust"]),
      ownerAddress: z.string(),
      ownerCity: z.string(),
      ownerState: z.string(),
      ownerZip: z.string(),
      businessAddress: z.string(),
      businessCity: z.string(),
      businessState: z.string(),
      businessZip: z.string(),
      businessType: z.string(),
      businessDescription: z.string(),
      countyOfRegistration: z.string(),
      stateOfRegistration: z.string(),
      registrationDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateDBARegistration(input);
      const fileName = `dba-registration-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "dba_registration",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Generate Revocable Living Trust
  generateRevocableLivingTrust: protectedProcedure
    .input(z.object({
      trustName: z.string(),
      grantorName: z.string(),
      grantorAddress: z.string(),
      grantorCity: z.string(),
      grantorState: z.string(),
      grantorZip: z.string(),
      grantorSSN: z.string().optional(),
      grantorDateOfBirth: z.string().optional(),
      trusteeName: z.string(),
      trusteeAddress: z.string(),
      successorTrustee1Name: z.string(),
      successorTrustee1Address: z.string(),
      successorTrustee2Name: z.string().optional(),
      successorTrustee2Address: z.string().optional(),
      beneficiaries: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        percentage: z.number(),
        contingent: z.boolean(),
      })),
      specificBequests: z.array(z.object({
        item: z.string(),
        beneficiary: z.string(),
      })).optional(),
      residuaryDistribution: z.string(),
      trusteeCompensation: z.enum(["none", "reasonable", "percentage"]),
      compensationDetails: z.string().optional(),
      incapacityProvisions: z.boolean(),
      spendthriftProvisions: z.boolean(),
      noContestClause: z.boolean(),
      governingLaw: z.string(),
      executionDate: z.string(),
    }))
    .mutation(async ({ input }) => {
      const html = generateRevocableLivingTrust(input);
      const fileName = `revocable-living-trust-${Date.now()}.html`;
      const { url } = await storagePut(fileName, html, "text/html");
      
      return {
        html,
        url,
        documentType: "revocable_living_trust",
        generatedAt: new Date().toISOString(),
      };
    }),

  // Get available document types
  getDocumentTypes: protectedProcedure.query(() => {
    return [
      {
        category: "healthcare",
        title: "Healthcare & Estate",
        lawsPillar: "Self",
        documents: [
          { code: "healthcare_poa", name: "Healthcare Power of Attorney", description: "Designates an agent to make healthcare decisions", ready: true },
          { code: "living_will", name: "Living Will / Advance Directive", description: "Specifies end-of-life treatment wishes", ready: true },
          { code: "hipaa_authorization", name: "HIPAA Authorization", description: "Authorizes release of medical information", ready: true },
          { code: "financial_poa", name: "Durable Financial Power of Attorney", description: "Grants authority over financial matters", ready: true },
        ],
      },
      {
        category: "dispute_resolution",
        title: "Dispute Resolution",
        lawsPillar: "Water",
        documents: [
          { code: "arbitration_agreement", name: "Private Arbitration Agreement", description: "Agreement to resolve disputes through private arbitration", ready: true },
          { code: "mediation_agreement", name: "Mediation Agreement", description: "Agreement to attempt mediation before arbitration", ready: false },
          { code: "settlement_agreement", name: "Settlement Agreement", description: "Mutual release and settlement of disputes", ready: false },
        ],
      },
      {
        category: "privacy",
        title: "Privacy & Asset Protection",
        lawsPillar: "Land",
        documents: [
          { code: "privacy_trust", name: "Privacy Trust", description: "Trust to hold assets anonymously", ready: true },
          { code: "revocable_living_trust", name: "Revocable Living Trust", description: "Flexible trust for estate planning", ready: true },
          { code: "nominee_agreement", name: "Nominee Agreement", description: "Agreement for nominee to appear on public records", ready: false },
          { code: "registered_agent", name: "Registered Agent Agreement", description: "Agreement for registered agent services", ready: false },
        ],
      },
      {
        category: "business",
        title: "Business Formation",
        lawsPillar: "Air",
        documents: [
          { code: "operating_agreement", name: "LLC Operating Agreement", description: "Governs LLC operations and member rights", ready: true },
          { code: "dba_registration", name: "DBA Registration", description: "Fictitious business name registration", ready: true },
          { code: "partnership_agreement", name: "Partnership Agreement", description: "Agreement between business partners", ready: false },
          { code: "bylaws", name: "Corporate Bylaws", description: "Rules governing corporate operations", ready: false },
        ],
      },
    ];
  }),

  // Generate a bundle of related documents
  generateBundle: protectedProcedure
    .input(z.object({
      bundleType: z.enum(["business_starter", "family_protection", "healthcare_complete", "asset_protection"]),
      // Common fields used across multiple documents
      principalName: z.string(),
      principalAddress: z.string(),
      principalCity: z.string(),
      principalState: z.string(),
      principalZip: z.string(),
      principalDOB: z.string().optional(),
      // Agent/Trustee info
      agentName: z.string().optional(),
      agentAddress: z.string().optional(),
      agentCity: z.string().optional(),
      agentState: z.string().optional(),
      agentZip: z.string().optional(),
      agentPhone: z.string().optional(),
      agentRelationship: z.string().optional(),
      // Business info
      businessName: z.string().optional(),
      businessPurpose: z.string().optional(),
      // Additional members/beneficiaries
      members: z.array(z.object({
        name: z.string(),
        ownershipPercentage: z.number(),
        capitalContribution: z.string().optional(),
      })).optional(),
      beneficiaries: z.array(z.object({
        name: z.string(),
        relationship: z.string(),
        percentage: z.number(),
      })).optional(),
      executionDate: z.string(),
      state: z.string(),
      county: z.string(),
    }))
    .mutation(async ({ input }) => {
      const documents: Array<{ name: string; html: string; url: string; documentType: string }> = [];
      
      const bundleConfigs: Record<string, string[]> = {
        business_starter: ["operating_agreement", "dba_registration"],
        family_protection: ["healthcare_poa", "living_will", "financial_poa"],
        healthcare_complete: ["healthcare_poa", "living_will", "hipaa_authorization"],
        asset_protection: ["privacy_trust", "revocable_living_trust"],
      };
      
      const documentsToGenerate = bundleConfigs[input.bundleType] || [];
      
      for (const docType of documentsToGenerate) {
        let html = "";
        let name = "";
        
        switch (docType) {
          case "operating_agreement":
            if (input.businessName && input.members) {
              html = generateOperatingAgreement({
                llcName: input.businessName,
                stateOfFormation: input.state,
                formationDate: input.executionDate,
                principalAddress: input.principalAddress,
                principalCity: input.principalCity,
                principalState: input.principalState,
                principalZip: input.principalZip,
                businessPurpose: input.businessPurpose || "General business operations",
                members: input.members.map(m => ({
                  ...m,
                  memberType: "individual" as const,
                  capitalContribution: m.capitalContribution || "$0",
                })),
                managementType: "member_managed",
                profitDistribution: "pro_rata",
                fiscalYearEnd: "December 31",
                votingThreshold: 51,
                transferRestrictions: true,
                rightOfFirstRefusal: true,
                dissolutionEvents: [
                  "Unanimous consent of all members",
                  "Entry of a decree of judicial dissolution",
                  "Administrative dissolution by the state",
                ],
                executionDate: input.executionDate,
              });
              name = "LLC Operating Agreement";
            }
            break;
            
          case "dba_registration":
            if (input.businessName) {
              html = generateDBARegistration({
                dbaName: input.businessName,
                businessAddress: input.principalAddress,
                businessCity: input.principalCity,
                businessState: input.principalState,
                businessZip: input.principalZip,
                ownerName: input.principalName,
                ownerType: "individual",
                ownerAddress: input.principalAddress,
                ownerCity: input.principalCity,
                ownerState: input.principalState,
                ownerZip: input.principalZip,
                businessType: input.businessPurpose || "General business",
                businessDescription: input.businessPurpose || "General business operations",
                registrationDate: input.executionDate,
                stateOfRegistration: input.state,
                countyOfRegistration: input.county,
              });
              name = "DBA Registration";
            }
            break;
            
          case "healthcare_poa":
            if (input.agentName) {
              html = generateHealthcarePOA({
                principalName: input.principalName,
                principalAddress: input.principalAddress,
                principalCity: input.principalCity,
                principalState: input.principalState,
                principalZip: input.principalZip,
                principalDOB: input.principalDOB || "",
                agentName: input.agentName,
                agentAddress: input.agentAddress || "",
                agentCity: input.agentCity || "",
                agentState: input.agentState || "",
                agentZip: input.agentZip || "",
                agentPhone: input.agentPhone || "",
                agentRelationship: input.agentRelationship || "",
                powers: {
                  consentToTreatment: true,
                  refuseTreatment: true,
                  accessMedicalRecords: true,
                  hireDischargeProviders: true,
                  admitToFacility: true,
                  authorizeRelease: true,
                  makeDNRDecisions: false,
                  organDonation: false,
                  mentalHealthTreatment: true,
                  experimentalTreatment: false,
                },
                effectiveImmediately: false,
                effectiveUponIncapacity: true,
                state: input.state,
                county: input.county,
                executionDate: input.executionDate,
              });
              name = "Healthcare Power of Attorney";
            }
            break;
            
          case "living_will":
            html = generateLivingWill({
              principalName: input.principalName,
              principalAddress: input.principalAddress,
              principalCity: input.principalCity,
              principalState: input.principalState,
              principalZip: input.principalZip,
              principalDOB: input.principalDOB || "",
              state: input.state,
              county: input.county,
              executionDate: input.executionDate,
              lifeSustainingTreatment: {
                terminalCondition: "withhold",
                permanentUnconscious: "withhold",
                advancedDementia: "agentDecides",
              },
              artificialNutrition: {
                terminalCondition: "withhold",
                permanentUnconscious: "withhold",
                advancedDementia: "agentDecides",
              },
              artificialHydration: {
                terminalCondition: "withhold",
                permanentUnconscious: "withhold",
                advancedDementia: "agentDecides",
              },
              painManagement: "comfort_focused",
              organDonation: "no_donation",
              religiousBeliefs: "",
              additionalInstructions: "",
            });
            name = "Living Will";
            break;
            
          case "financial_poa":
            if (input.agentName) {
              html = generateFinancialPOA({
                principalName: input.principalName,
                principalAddress: input.principalAddress,
                principalCity: input.principalCity,
                principalState: input.principalState,
                principalZip: input.principalZip,
                principalDOB: input.principalDOB || "",
                agentName: input.agentName,
                agentAddress: input.agentAddress || "",
                agentCity: input.agentCity || "",
                agentState: input.agentState || "",
                agentZip: input.agentZip || "",
                agentPhone: input.agentPhone || "",
                agentRelationship: input.agentRelationship || "",
                powers: {
                  banking: true,
                  realEstate: true,
                  investments: true,
                  taxes: true,
                  insurance: true,
                  retirement: true,
                  business: true,
                  legal: true,
                  government: true,
                  gifts: false,
                },
                effectiveImmediately: false,
                effectiveUponIncapacity: true,
                state: input.state,
                county: input.county,
                executionDate: input.executionDate,
              });
              name = "Financial Power of Attorney";
            }
            break;
            
          case "hipaa_authorization":
            if (input.agentName) {
              html = generateHIPAAAuth({
                patientName: input.principalName,
                patientAddress: input.principalAddress,
                patientCity: input.principalCity,
                patientState: input.principalState,
                patientZip: input.principalZip,
                patientDOB: input.principalDOB || "",
                authorizedPersons: [{
                  name: input.agentName,
                  relationship: input.agentRelationship || "Agent",
                  phone: input.agentPhone || "",
                }],
                informationTypes: {
                  medicalRecords: true,
                  mentalHealth: true,
                  substanceAbuse: false,
                  hivAids: false,
                  geneticTesting: false,
                  billing: true,
                },
                purposeOfDisclosure: "healthcare_coordination",
                expirationDate: "",
                executionDate: input.executionDate,
              });
              name = "HIPAA Authorization";
            }
            break;
            
          case "privacy_trust":
            if (input.beneficiaries) {
              html = generatePrivacyTrust({
                trustName: `${input.principalName} Privacy Trust`,
                settlorName: input.principalName,
                settlorAddress: input.principalAddress,
                settlorCity: input.principalCity,
                settlorState: input.principalState,
                settlorZip: input.principalZip,
                trusteeName: input.agentName || input.principalName,
                trusteeAddress: input.agentAddress || input.principalAddress,
                trusteeCity: input.agentCity || input.principalCity,
                trusteeState: input.agentState || input.principalState,
                trusteeZip: input.agentZip || input.principalZip,
                trustPurpose: "asset_protection",
                revocable: true,
                beneficiaries: input.beneficiaries,
                initialAssets: [{ description: "Initial contribution", estimatedValue: "$100" }],
                governingLaw: input.state,
                executionDate: input.executionDate,
              });
              name = "Privacy Trust";
            }
            break;
            
          case "revocable_living_trust":
            if (input.beneficiaries) {
              html = generateRevocableLivingTrust({
                trustName: `${input.principalName} Living Trust`,
                grantorName: input.principalName,
                grantorAddress: input.principalAddress,
                grantorCity: input.principalCity,
                grantorState: input.principalState,
                grantorZip: input.principalZip,
                trusteeName: input.principalName,
                trusteeAddress: `${input.principalAddress}, ${input.principalCity}, ${input.principalState} ${input.principalZip}`,
                successorTrustee1Name: input.agentName || "",
                successorTrustee1Address: input.agentAddress ? `${input.agentAddress}, ${input.agentCity}, ${input.agentState} ${input.agentZip}` : "",
                beneficiaries: input.beneficiaries.map(b => ({ ...b, contingent: false })),
                residuaryDistribution: "All remaining trust assets shall be distributed equally among the primary beneficiaries.",
                incapacityProvisions: true,
                spendthriftProvisions: true,
                noContestClause: true,
                trusteeCompensation: "none",
                governingLaw: input.state,
                executionDate: input.executionDate,
              });
              name = "Revocable Living Trust";
            }
            break;
        }
        
        if (html) {
          const fileName = `${docType}-${Date.now()}.html`;
          const { url } = await storagePut(fileName, html, "text/html");
          documents.push({ name, html, url, documentType: docType });
        }
      }
      
      return {
        bundleType: input.bundleType,
        documents,
        generatedAt: new Date().toISOString(),
        totalDocuments: documents.length,
      };
    }),

  // Get available bundles
  getBundles: protectedProcedure
    .query(async () => {
      return [
        {
          id: "business_starter",
          name: "Business Starter Bundle",
          description: "Essential documents for starting a new business",
          lawsPillar: "Air",
          documents: ["LLC Operating Agreement", "DBA Registration"],
          icon: "building",
        },
        {
          id: "family_protection",
          name: "Family Protection Bundle",
          description: "Complete healthcare and financial protection for your family",
          lawsPillar: "Self",
          documents: ["Healthcare POA", "Living Will", "Financial POA"],
          icon: "users",
        },
        {
          id: "healthcare_complete",
          name: "Healthcare Complete Bundle",
          description: "All healthcare-related legal documents",
          lawsPillar: "Self",
          documents: ["Healthcare POA", "Living Will", "HIPAA Authorization"],
          icon: "heart",
        },
        {
          id: "asset_protection",
          name: "Asset Protection Bundle",
          description: "Trust structures for privacy and asset protection",
          lawsPillar: "Land",
          documents: ["Privacy Trust", "Revocable Living Trust"],
          icon: "shield",
        },
      ];
    }),
});
