import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";

/**
 * House Documents Router
 * 
 * Generates and manages private House/Trust documents with auto-fill from House data.
 * All documents are private to the House and stored in the Document Vault.
 */

// Template types
const templateTypes = [
  "house_charter",
  "trust_beneficiary_agreement", 
  "operating_agreement",
  "lineage_registration",
  "board_resolution",
  "investment_addendum",
] as const;

type TemplateType = typeof templateTypes[number];

// Template metadata
const templateMetadata: Record<TemplateType, { name: string; description: string; pages: number }> = {
  house_charter: {
    name: "House Charter",
    description: "Founding document establishing the House structure, purpose, and constitutional protections including the 60/40 split.",
    pages: 8,
  },
  trust_beneficiary_agreement: {
    name: "Trust Beneficiary Agreement",
    description: "60/40 generational wealth structure document defining beneficiary rights, distributions, and firewall protections.",
    pages: 10,
  },
  operating_agreement: {
    name: "House Operating Agreement",
    description: "Governance and operations manual covering decision-making, financial operations, and member responsibilities.",
    pages: 12,
  },
  lineage_registration: {
    name: "Lineage Registration Form",
    description: "Form for registering family members and their positions within the House structure.",
    pages: 3,
  },
  board_resolution: {
    name: "Board Resolution Template",
    description: "Official template for recording and documenting board decisions and resolutions.",
    pages: 2,
  },
  investment_addendum: {
    name: "Investment Protection Addendum",
    description: "Addendum with firewall clauses for investor relationships protecting the 60% House portion.",
    pages: 4,
  },
};

// Generate House Charter template with House data
function generateHouseCharter(houseData: any): string {
  const today = new Date().toISOString().split("T")[0];
  
  return `# HOUSE CHARTER

## Founding Document of ${houseData.name || "[HOUSE NAME]"}

---

**Established:** ${houseData.establishedDate || today}

**Charter Number:** HC-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}

**Jurisdiction:** ${houseData.jurisdiction || "[JURISDICTION]"}

---

## PREAMBLE

We, the undersigned Founding Members, do hereby establish this House Charter to create a lasting legacy for our lineage, built upon principles of sovereignty, generational wealth, and purposeful stewardship. This Charter shall serve as the foundational governing document for all House operations, assets, and governance structures.

---

## ARTICLE I: ESTABLISHMENT AND PURPOSE

### Section 1.1 - Name and Identity
The House shall be known as **${houseData.name || "[HOUSE NAME]"}** (hereinafter referred to as "the House").

### Section 1.2 - Purpose
The House is established for the following purposes:
1. To preserve and grow generational wealth for the benefit of all House members
2. To provide educational, professional, and personal development opportunities
3. To maintain family unity and cultural heritage across generations
4. To operate business enterprises that align with House values
5. To create sustainable income streams for current and future generations

### Section 1.3 - Duration
This House shall exist in perpetuity unless dissolved in accordance with Article VIII of this Charter.

---

## ARTICLE II: CONSTITUTIONAL STRUCTURE

### Section 2.1 - The 60/40 Principle
All House assets, income, and value shall be distributed according to the following immutable structure:

| Allocation | Percentage | Purpose |
|------------|------------|---------|
| **House Retained** | 60% | Protected family wealth, never accessible to outside parties |
| **Network Pool** | 40% | Available for partnerships, investments, and collaborative ventures |

### Section 2.2 - Firewall Protection
The 60% House Retained portion is CONSTITUTIONALLY PROTECTED. This protection:
- Cannot be modified, waived, or circumvented under any circumstances
- Remains in effect regardless of any external agreements
- Supersedes any conflicting provisions in other documents
- Shall be enforced by the House Principal with absolute authority

---

## ARTICLE III: GOVERNANCE STRUCTURE

### Section 3.1 - House Principal
The House Principal serves as the chief executive and guardian of the House, with the following authorities:
- Absolute veto power over all House decisions
- Authority to appoint and remove House officers
- Final approval on all financial transactions exceeding $10,000
- Custodian of the House Charter and all founding documents

**Current House Principal:** ${houseData.principalName || "[PRINCIPAL NAME]"}

### Section 3.2 - House Council
The House Council shall consist of:
- House Principal (Chair, with 3x voting weight)
- House Steward (Vice Chair, with 2x voting weight)
- House Treasurer (with 1x voting weight)
- Up to 5 elected members (with 1x voting weight each)

### Section 3.3 - Decision Making
- **Routine Matters:** Simple majority of Council
- **Significant Matters:** Two-thirds majority of Council
- **Constitutional Matters:** Unanimous Council approval plus Principal consent
- **Emergency Matters:** Principal authority with subsequent Council ratification

---

## ARTICLE IV: MEMBERSHIP

### Section 4.1 - Founding Members
The following individuals are recognized as Founding Members of this House:

| Name | Relationship | Role | Date Joined |
|------|--------------|------|-------------|
| ${houseData.principalName || "[FOUNDER 1]"} | Principal | House Principal | ${houseData.establishedDate || today} |
| [FOUNDER 2 NAME] | [RELATIONSHIP] | [ROLE] | ${houseData.establishedDate || today} |
| [FOUNDER 3 NAME] | [RELATIONSHIP] | [ROLE] | ${houseData.establishedDate || today} |

### Section 4.2 - Membership Categories
1. **Founding Members** - Original signatories of this Charter
2. **Lineage Members** - Direct descendants of Founding Members
3. **Inducted Members** - Spouses and adopted family members
4. **Associate Members** - Extended family with limited participation rights

---

## ARTICLE V: FINANCIAL MANAGEMENT

### Section 5.1 - House Treasury
The House Treasury shall be managed by the House Treasurer under the supervision of the House Principal.

### Section 5.2 - Distribution Schedule
Distributions to members shall be made according to the following schedule:
- **Quarterly:** Regular income distributions
- **Annually:** Bonus distributions based on House performance
- **Special:** Emergency or opportunity-based distributions as approved

---

## ARTICLE VI: SUCCESSION

### Section 6.1 - Principal Succession
Upon the death, incapacity, or resignation of the House Principal:
1. The designated successor shall assume the role
2. If no successor is designated, the House Council shall elect a new Principal
3. The new Principal must be a Founding Member or Lineage Member

### Section 6.2 - Designated Successor
**Primary Successor:** [PRIMARY SUCCESSOR NAME]

**Secondary Successor:** [SECONDARY SUCCESSOR NAME]

---

## ARTICLE VII: AMENDMENTS

### Section 7.1 - Amendment Process
This Charter may be amended by:
1. Proposal by any Council member
2. Two-thirds approval of the House Council
3. Final approval by the House Principal
4. 30-day waiting period before implementation

### Section 7.2 - Protected Provisions
The following provisions may NEVER be amended:
- Article II, Section 2.1 (The 60/40 Principle)
- Article II, Section 2.2 (Firewall Protection)
- Article III, Section 3.1 (Principal Veto Power)

---

## ARTICLE VIII: DISSOLUTION

### Section 8.1 - Dissolution Requirements
The House may only be dissolved by:
1. Unanimous vote of all Founding Members (or their successors)
2. Approval by the House Principal
3. Completion of all outstanding obligations
4. Distribution of remaining assets to members

---

## SIGNATURES

We, the undersigned, do hereby establish this House Charter on the date first written above.

---

**House Principal:**

___________________________________ Date: _______________
${houseData.principalName || "[PRINCIPAL NAME]"}

---

**Founding Members:**

___________________________________ Date: _______________
[FOUNDER 1 NAME]

___________________________________ Date: _______________
[FOUNDER 2 NAME]

---

**Witness:**

___________________________________ Date: _______________
Witness Name: _______________________

---

## OFFICIAL SEAL

[HOUSE SEAL]

---

*This document is the official House Charter of ${houseData.name || "[HOUSE NAME]"}. Any copies must be certified by the House Principal to be considered authentic.*

**Charter Version:** 1.0
**Last Amended:** ${today}
**Document ID:** HC-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
`;
}

// Generate Trust Beneficiary Agreement
function generateTrustBeneficiaryAgreement(houseData: any): string {
  const today = new Date().toISOString().split("T")[0];
  
  return `# TRUST BENEFICIARY AGREEMENT

## 60/40 Generational Wealth Structure

---

**Agreement Number:** TBA-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}

**Effective Date:** ${today}

**Trust Name:** ${houseData.name || "[HOUSE NAME]"} Family Trust

**Associated House:** ${houseData.name || "[HOUSE NAME]"}

---

## PARTIES TO THIS AGREEMENT

**GRANTOR/SETTLOR:**
Name: ${houseData.principalName || "[GRANTOR NAME]"}
Relationship to House: House Principal

**TRUSTEE:**
Name: [TRUSTEE NAME]
Capacity: [TRUSTEE CAPACITY]

**PRIMARY BENEFICIARY:**
Name: [BENEFICIARY NAME]
Relationship to Grantor: [RELATIONSHIP]

---

## ARTICLE I: TRUST ESTABLISHMENT

### Section 1.1 - Creation of Trust
The Grantor hereby creates an irrevocable trust (the "Trust") for the benefit of the Beneficiary and their descendants.

### Section 1.2 - Trust Property
The following property is hereby transferred to the Trust:

| Asset Description | Estimated Value | Category |
|-------------------|-----------------|----------|
| [ASSET 1] | $[VALUE] | [CATEGORY] |
| [ASSET 2] | $[VALUE] | [CATEGORY] |
| [ASSET 3] | $[VALUE] | [CATEGORY] |

---

## ARTICLE II: THE 60/40 STRUCTURE

### Section 2.1 - Constitutional Allocation
All Trust assets, income, and appreciation shall be allocated as follows:

| Allocation | Percentage | Purpose |
|------------|------------|---------|
| **House Retained** | 60% | Protected Family Wealth |
| **Network Pool** | 40% | Partnership Capital |

### Section 2.2 - House Retained Portion (60%)
The House Retained portion shall be used exclusively for:
1. Direct benefit of Beneficiary and their descendants
2. Educational expenses for family members
3. Healthcare and emergency needs
4. Housing and basic living expenses
5. Generational wealth preservation

### Section 2.3 - Network Pool Portion (40%)
The Network Pool portion may be used for:
1. Business investments and partnerships
2. Revenue-sharing arrangements
3. Strategic alliances with approved partners
4. Community and philanthropic initiatives
5. Growth capital for House enterprises

### Section 2.4 - Firewall Protection
The 60% House Retained portion is ABSOLUTELY PROTECTED:
- No investor, partner, or creditor may access this portion
- No contract or agreement may encumber this portion
- This protection survives bankruptcy, divorce, or legal judgment
- Only the House Principal may authorize distributions from this portion

---

## ARTICLE III: BENEFICIARY RIGHTS

### Section 3.1 - Income Distributions
The Beneficiary shall receive distributions according to the following schedule:

| Distribution Type | Frequency | Source | Approval Required |
|-------------------|-----------|--------|-------------------|
| Living Expenses | Monthly | House Retained | Trustee |
| Education Funding | As Needed | House Retained | Trustee |
| Emergency Funds | As Needed | House Retained | Trustee + Principal |
| Profit Sharing | Quarterly | Network Pool | House Council |
| Special Distributions | Annual | Either | Principal |

---

## ARTICLE IV: SPENDTHRIFT PROVISIONS

### Section 4.1 - Protection from Creditors
No beneficiary's interest in the Trust may be:
- Assigned, alienated, or transferred
- Subject to attachment, garnishment, or execution
- Reached by any creditor of the beneficiary
- Included in the beneficiary's bankruptcy estate

---

## ARTICLE V: AMENDMENT AND TERMINATION

### Section 5.1 - Protected Provisions
The following provisions may NEVER be amended:
- Article II (The 60/40 Structure)
- Article IV (Spendthrift Provisions)

---

## SIGNATURES

**GRANTOR:**

___________________________________ Date: _______________
${houseData.principalName || "[GRANTOR NAME]"}

**TRUSTEE:**

___________________________________ Date: _______________
[TRUSTEE NAME]

**PRIMARY BENEFICIARY (Acknowledgment):**

___________________________________ Date: _______________
[BENEFICIARY NAME]

**HOUSE PRINCIPAL (Approval):**

___________________________________ Date: _______________
${houseData.principalName || "[PRINCIPAL NAME]"}

---

## NOTARIZATION

State of _______________
County of _______________

On this _____ day of _______________, 20____, before me personally appeared the above-named individuals.

___________________________________ 
Notary Public

[NOTARY SEAL]

---

**Document ID:** TBA-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
**Version:** 1.0
**Classification:** CONFIDENTIAL - HOUSE USE ONLY
`;
}

// Generate Operating Agreement
function generateOperatingAgreement(houseData: any): string {
  const today = new Date().toISOString().split("T")[0];
  
  return `# HOUSE OPERATING AGREEMENT

## Governance and Operations Manual

---

**House Name:** ${houseData.name || "[HOUSE NAME]"}

**Agreement Date:** ${today}

**Document Number:** OA-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}

---

## ARTICLE I: PURPOSE AND SCOPE

### Section 1.1 - Purpose
This Operating Agreement establishes the governance framework, operational procedures, and member responsibilities for ${houseData.name || "[HOUSE NAME]"} (the "House").

### Section 1.2 - Relationship to House Charter
This Agreement operates under and is subject to the House Charter. In case of conflict, the House Charter shall prevail.

---

## ARTICLE II: GOVERNANCE STRUCTURE

### Section 2.1 - House Principal
**Current Principal:** ${houseData.principalName || "[PRINCIPAL NAME]"}

**Powers and Duties:**
- Ultimate authority over all House matters
- Veto power on any decision
- Appointment and removal of officers
- Guardian of House Charter and traditions

**Term:** Lifetime or until voluntary resignation

### Section 2.2 - House Steward
**Current Steward:** [STEWARD NAME]

**Powers and Duties:**
- Day-to-day operations management
- Member coordination and communication
- Acting Principal in Principal's absence

**Term:** 3 years, renewable

### Section 2.3 - House Treasurer
**Current Treasurer:** [TREASURER NAME]

**Powers and Duties:**
- Financial record keeping
- Budget preparation and monitoring
- Distribution processing

**Term:** 3 years, renewable

---

## ARTICLE III: DECISION-MAKING PROCEDURES

### Section 3.1 - Decision Categories

| Category | Examples | Approval Required |
|----------|----------|-------------------|
| **Routine** | Minor expenses, scheduling | Steward alone |
| **Operational** | Events, programs, budgets | Steward + Treasurer |
| **Significant** | Major purchases, new members | Council majority |
| **Strategic** | Investments, partnerships | Council 2/3 + Principal |
| **Constitutional** | Charter amendments | Unanimous + Principal |

### Section 3.2 - Voting Weights

| Position | Voting Weight | Notes |
|----------|---------------|-------|
| House Principal | 3x | Plus veto power |
| House Steward | 2x | |
| House Treasurer | 1x | |
| Council Members | 1x each | |

---

## ARTICLE IV: FINANCIAL OPERATIONS

### Section 4.1 - Spending Authority

| Amount | Approval Required |
|--------|-------------------|
| Under $500 | Steward or Treasurer |
| $500 - $5,000 | Steward AND Treasurer |
| $5,000 - $25,000 | Council majority |
| Over $25,000 | Council + Principal |

### Section 4.2 - Distribution Schedule

| Distribution Type | Frequency | Eligibility |
|-------------------|-----------|-------------|
| Living Allowance | Monthly | All members |
| Education Stipend | Semester | Students |
| Profit Share | Quarterly | Contributing members |
| Annual Bonus | Yearly | All members |

---

## ARTICLE V: MEMBER RIGHTS AND RESPONSIBILITIES

### Section 5.1 - Member Rights
All members in good standing have the right to:
- Attend all general meetings
- Voice opinions on any matter
- Access House facilities and resources
- Receive financial distributions
- Review non-confidential records

### Section 5.2 - Member Responsibilities
All members are expected to:
- Uphold House values and reputation
- Treat other members with respect
- Maintain confidentiality of House matters
- Participate in House activities

---

## ARTICLE VI: AMENDMENTS

### Section 6.1 - Amendment Process
1. Proposal submitted in writing
2. Council review (30 days)
3. Member notification (14 days before vote)
4. Council vote (2/3 majority required)
5. Principal approval

---

## SIGNATURES

**HOUSE PRINCIPAL:**

___________________________________ Date: _______________
${houseData.principalName || "[PRINCIPAL NAME]"}

**HOUSE STEWARD:**

___________________________________ Date: _______________
[STEWARD NAME]

**HOUSE TREASURER:**

___________________________________ Date: _______________
[TREASURER NAME]

---

**Document ID:** OA-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
**Version:** 1.0
**Effective Date:** ${today}
`;
}

// Generate template based on type
function generateTemplate(templateType: TemplateType, houseData: any): string {
  switch (templateType) {
    case "house_charter":
      return generateHouseCharter(houseData);
    case "trust_beneficiary_agreement":
      return generateTrustBeneficiaryAgreement(houseData);
    case "operating_agreement":
      return generateOperatingAgreement(houseData);
    case "lineage_registration":
      return generateLineageRegistration(houseData);
    case "board_resolution":
      return generateBoardResolution(houseData);
    case "investment_addendum":
      return generateInvestmentAddendum(houseData);
    default:
      throw new Error(`Unknown template type: ${templateType}`);
  }
}

function generateLineageRegistration(houseData: any): string {
  const today = new Date().toISOString().split("T")[0];
  return `# LINEAGE REGISTRATION FORM

## ${houseData.name || "[HOUSE NAME]"} Family Registry

---

**Form Number:** LR-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
**Date:** ${today}

---

## MEMBER INFORMATION

**Full Legal Name:** _______________________________________

**Date of Birth:** _______________________________________

**Place of Birth:** _______________________________________

**Current Address:** _______________________________________

---

## LINEAGE CONNECTION

**Relationship to House Principal:** _______________________________________

**Sponsoring Member:** _______________________________________

**Lineage Line:** _______________________________________

---

## MEMBERSHIP CATEGORY

[ ] Founding Member
[ ] Lineage Member (direct descendant)
[ ] Inducted Member (spouse/adopted)
[ ] Associate Member (extended family)

---

## HOUSE POSITION (if applicable)

[ ] House Principal
[ ] House Steward
[ ] House Treasurer
[ ] Council Member
[ ] General Member

---

## DECLARATIONS

I hereby declare that:
1. All information provided is true and accurate
2. I understand and accept the House Charter
3. I commit to upholding House values and traditions
4. I acknowledge the 60/40 constitutional structure

---

## SIGNATURES

**Applicant:**

___________________________________ Date: _______________

**Sponsoring Member:**

___________________________________ Date: _______________

**House Principal (Approval):**

___________________________________ Date: _______________
${houseData.principalName || "[PRINCIPAL NAME]"}

---

**Document ID:** LR-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
`;
}

function generateBoardResolution(houseData: any): string {
  const today = new Date().toISOString().split("T")[0];
  return `# BOARD RESOLUTION

## ${houseData.name || "[HOUSE NAME]"} House Council

---

**Resolution Number:** BR-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
**Date:** ${today}

---

## RESOLUTION TITLE

_______________________________________

---

## BACKGROUND

WHEREAS, _______________________________________

WHEREAS, _______________________________________

---

## RESOLUTION

NOW, THEREFORE, BE IT RESOLVED that:

1. _______________________________________

2. _______________________________________

3. _______________________________________

---

## VOTING RECORD

| Member | Position | Vote |
|--------|----------|------|
| ${houseData.principalName || "[PRINCIPAL]"} | House Principal | [ ] For [ ] Against [ ] Abstain |
| [STEWARD] | House Steward | [ ] For [ ] Against [ ] Abstain |
| [TREASURER] | House Treasurer | [ ] For [ ] Against [ ] Abstain |

**Total For:** _____ **Total Against:** _____ **Abstentions:** _____

**Resolution:** [ ] PASSED [ ] FAILED

---

## CERTIFICATION

I certify that this resolution was duly adopted at a meeting of the House Council held on ${today}.

**House Principal:**

___________________________________ Date: _______________
${houseData.principalName || "[PRINCIPAL NAME]"}

---

**Document ID:** BR-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
`;
}

function generateInvestmentAddendum(houseData: any): string {
  const today = new Date().toISOString().split("T")[0];
  return `# INVESTMENT PROTECTION ADDENDUM

## Firewall Clause for External Investments

---

**Addendum Number:** IPA-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
**Date:** ${today}
**Associated House:** ${houseData.name || "[HOUSE NAME]"}

---

## CONSTITUTIONAL PROTECTION NOTICE

This addendum is attached to and forms part of the investment agreement between ${houseData.name || "[HOUSE NAME]"} and the Investor named below.

---

## INVESTOR INFORMATION

**Investor Name:** _______________________________________

**Investment Amount:** $_______________________________________

**Investment Tier:** [ ] Strategic Partner [ ] Limited Partner [ ] Equity Investor

---

## FIREWALL PROVISIONS

### Section 1: 60% House Retained Protection

The Investor acknowledges and agrees that:

1. **SIXTY PERCENT (60%)** of all House assets, income, and value is CONSTITUTIONALLY PROTECTED and designated as "House Retained"

2. The Investor shall have **NO ACCESS** to the House Retained portion under any circumstances, including but not limited to:
   - Default on investment terms
   - Bankruptcy or insolvency
   - Legal judgment or court order
   - Dissolution of investment agreement

3. This protection is **IMMUTABLE** and cannot be waived, modified, or circumvented by any agreement, contract, or understanding

### Section 2: Network Pool Limitation

The Investor's participation is LIMITED to the Network Pool (40%) as follows:

| Maximum Allocation | Percentage of Network Pool | Percentage of Total |
|--------------------|---------------------------|---------------------|
| Strategic Partner | Up to 15% | Up to 6% |
| Limited Partner | Up to 25% | Up to 10% |
| Equity Investor | Up to 25% | Up to 10% |

### Section 3: Founding Chair Veto

The House Principal (Founding Chair) retains **ABSOLUTE VETO POWER** over:
- All investment decisions
- Distribution of investment returns
- Modification of investment terms
- Early termination of investment

### Section 4: Buyback Provisions

The House reserves the right to repurchase the Investor's stake at:
- Original investment amount plus accrued returns
- Fair market value as determined by independent valuation
- Terms specified in the primary investment agreement

### Section 5: Sunset Clause

This investment agreement shall automatically terminate after the term specified in the primary agreement, with no automatic renewal.

---

## ACKNOWLEDGMENT

By signing below, the Investor acknowledges:

1. Full understanding of the 60/40 constitutional structure
2. Acceptance of the firewall provisions
3. Recognition of the House Principal's veto authority
4. Agreement to the buyback and sunset provisions

---

## SIGNATURES

**INVESTOR:**

___________________________________ Date: _______________
[INVESTOR NAME]

**HOUSE PRINCIPAL:**

___________________________________ Date: _______________
${houseData.principalName || "[PRINCIPAL NAME]"}

**WITNESS:**

___________________________________ Date: _______________
[WITNESS NAME]

---

**Document ID:** IPA-${houseData.id || "XXXX"}-${Date.now().toString(36).toUpperCase()}
**Classification:** CONFIDENTIAL - INVESTMENT DOCUMENTATION
`;
}

export const houseDocumentsRouter = router({
  // Get available templates for a House
  getTemplates: protectedProcedure
    .input(z.object({ houseId: z.number().optional() }))
    .query(async ({ input }) => {
      return Object.entries(templateMetadata).map(([type, meta]) => ({
        type,
        ...meta,
      }));
    }),

  // Generate a document from template with House data
  generateDocument: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      templateType: z.enum(templateTypes),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get House data
      const houseResult = await db.execute(
        `SELECT h.*, u.name as principalName 
         FROM houses h 
         LEFT JOIN users u ON h.principal_id = u.id 
         WHERE h.id = ?`,
        [input.houseId]
      );
      
      const house = (houseResult.rows as any[])[0];
      if (!house) {
        throw new Error("House not found");
      }

      // Generate the document
      const content = generateTemplate(input.templateType, {
        id: house.id,
        name: house.name,
        principalName: house.principalName || house.principal_name,
        establishedDate: house.established_date || house.created_at,
        jurisdiction: house.jurisdiction,
      });

      const meta = templateMetadata[input.templateType];

      return {
        templateType: input.templateType,
        name: meta.name,
        content,
        houseId: input.houseId,
        houseName: house.name,
        generatedAt: new Date().toISOString(),
      };
    }),

  // Save generated document to Document Vault
  saveToVault: protectedProcedure
    .input(z.object({
      houseId: z.number(),
      templateType: z.enum(templateTypes),
      title: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const meta = templateMetadata[input.templateType];
      const docId = `${input.templateType.toUpperCase()}-${input.houseId}-${Date.now().toString(36).toUpperCase()}`;

      // Insert into document vault
      await db.execute(
        `INSERT INTO documents (
          title, description, document_type, content, status, access_level, 
          version, house_id, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          input.title || meta.name,
          meta.description,
          "legal_document",
          input.content,
          "draft",
          "owner_only",
          1,
          input.houseId,
          ctx.user.id,
        ]
      );

      return {
        success: true,
        documentId: docId,
        message: `${meta.name} saved to Document Vault`,
      };
    }),

  // Get House documents from vault
  getHouseDocuments: protectedProcedure
    .input(z.object({ houseId: z.number() }))
    .query(async ({ input }) => {
      const result = await db.execute(
        `SELECT * FROM documents WHERE house_id = ? ORDER BY created_at DESC`,
        [input.houseId]
      );
      return result.rows;
    }),
});
