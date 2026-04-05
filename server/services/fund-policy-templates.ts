/**
 * Fund Allocation Policy & Disbursement Templates Service
 * Phase 52.4 & 53.4: Legal documentation for fund management and heir distribution
 */

export interface FundAllocationPolicy {
  policyId: string;
  houseName: string;
  effectiveDate: string;
  funds: Array<{
    name: string;
    percentage: number;
    purpose: string;
    disbursementRules: string[];
    approvalRequirements: string;
  }>;
  amendmentProcedure: string;
  reviewSchedule: string;
}

export interface DisbursementRequest {
  requestId: string;
  fundName: string;
  requestorName: string;
  amount: number;
  purpose: string;
  supportingDocuments: string[];
  approvalChain: string[];
  status: 'pending' | 'approved' | 'denied' | 'disbursed';
}

export interface HeirDesignationForm {
  formId: string;
  houseName: string;
  founderName: string;
  heirs: Array<{
    name: string;
    relationship: string;
    percentage: number;
    vestingSchedule: string;
    conditions: string[];
  }>;
  effectiveDate: string;
  witnesses: string[];
}

export interface DistributionAgreement {
  agreementId: string;
  houseName: string;
  distributionType: 'immediate' | 'accumulation' | 'milestone-based';
  frequency: 'monthly' | 'quarterly' | 'annually' | 'on-event';
  minimumAge: number;
  educationRequirement: boolean;
  participationRequirement: boolean;
  spendthriftProvisions: boolean;
}

export interface SpendthriftProvisions {
  provisionId: string;
  houseName: string;
  protectedAssets: string[];
  creditorExceptions: string[];
  trusteeDiscretion: string;
  modificationRules: string;
}

export interface VestingSchedule {
  scheduleId: string;
  heirName: string;
  milestones: Array<{
    age: number;
    percentage: number;
    additionalConditions: string[];
  }>;
  accelerationEvents: string[];
  forfeitureConditions: string[];
}

export function generateFundAllocationPolicy(houseName: string, founderName: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
FUND ALLOCATION POLICY
${houseName}

Effective Date: ${date}
Adopted by: ${founderName}, Founder

ARTICLE I: PURPOSE
This Fund Allocation Policy establishes the framework for allocating and managing community funds within ${houseName} to ensure sustainable growth and benefit for current and future generations.

ARTICLE II: FUND STRUCTURE

Section 2.1 - Land & Property Acquisition Fund (30%)
Purpose: Acquire real property for House members and community benefit
Disbursement Rules:
- Minimum property value: $10,000
- Must serve House member housing or business needs
- Requires title search and property inspection
- Approval: Founder or designated trustee

Section 2.2 - Education & Scholarship Fund (25%)
Purpose: Support educational advancement of House members
Disbursement Rules:
- Tuition, books, supplies, and related expenses
- Accredited institutions or approved training programs
- Maintain minimum GPA of 2.5 for continued support
- Approval: Education Committee or Founder

Section 2.3 - Emergency Assistance Fund (15%)
Purpose: Provide emergency support to House members
Disbursement Rules:
- Medical emergencies, natural disasters, job loss
- Maximum single disbursement: $5,000
- Repayment optional based on circumstances
- Approval: Founder (expedited review within 48 hours)

Section 2.4 - Business Development Fund (15%)
Purpose: Support House member entrepreneurship
Disbursement Rules:
- Business plan required
- Matching contribution encouraged
- Progress reports required quarterly
- Approval: Business Committee or Founder

Section 2.5 - Cultural Preservation Fund (10%)
Purpose: Preserve and promote House heritage and traditions
Disbursement Rules:
- Family reunions, genealogy research, historical documentation
- Cultural education programs
- Heritage site preservation
- Approval: Cultural Committee or Founder

Section 2.6 - Discretionary/Voting Fund (5%)
Purpose: Address needs not covered by other funds
Disbursement Rules:
- Requires majority vote of eligible House members
- Annual allocation review
- Unused funds roll over to following year
- Approval: House member vote

ARTICLE III: DISBURSEMENT PROCEDURES

Section 3.1 - Request Process
1. Submit written request with supporting documentation
2. Committee review within 14 days (emergency: 48 hours)
3. Approval notification and disbursement within 7 days
4. Post-disbursement reporting as required

Section 3.2 - Documentation Requirements
- Completed Disbursement Request Form
- Supporting invoices, quotes, or estimates
- Identification verification
- Previous disbursement history review

ARTICLE IV: AMENDMENTS
This policy may be amended by the Founder or designated successor with 30 days notice to all House members. Material changes require documentation in the House Vault.

ARTICLE V: REVIEW SCHEDULE
This policy shall be reviewed annually on the anniversary of its adoption.

___________________________
${founderName}, Founder
Date: ${date}

___________________________
Witness
Date: _______________
`;
}

export function generateDisbursementRequestForm(fundName: string): string {
  return `
DISBURSEMENT REQUEST FORM

Fund: ${fundName}
Request Date: _______________
Request ID: DRF-${Date.now()}

SECTION A: REQUESTOR INFORMATION
Full Name: _________________________________
House Membership ID: _______________________
Contact Phone: _____________________________
Contact Email: _____________________________

SECTION B: REQUEST DETAILS
Amount Requested: $________________________
Purpose of Request:
___________________________________________
___________________________________________
___________________________________________

Expected Use Date: _________________________
Payable To: ________________________________

SECTION C: SUPPORTING DOCUMENTATION
[ ] Invoice/Quote attached
[ ] Proof of need attached
[ ] Previous disbursement history reviewed
[ ] Other: _________________________________

SECTION D: CERTIFICATION
I certify that the information provided is true and accurate. I understand that funds must be used for the stated purpose and that misuse may result in repayment requirements and/or loss of future fund access.

___________________________
Requestor Signature
Date: _______________

SECTION E: APPROVAL (Office Use Only)
[ ] Approved  [ ] Denied  [ ] Pending Additional Information

Reviewer: _________________________________
Review Date: ______________________________
Comments:
___________________________________________
___________________________________________

Disbursement Date: _________________________
Check/Transfer Number: _____________________
`;
}

export function generateHeirDesignationForm(houseName: string, founderName: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
HEIR DESIGNATION FORM
${houseName}

Date: ${date}
Founder/Designator: ${founderName}

ARTICLE I: DECLARATION
I, ${founderName}, as Founder of ${houseName}, hereby designate the following individuals as heirs to receive distributions from the House's accumulated wealth according to the percentages and conditions specified below.

ARTICLE II: DESIGNATED HEIRS

Heir 1:
Name: _____________________________________
Relationship: ______________________________
Percentage: _______%
Vesting Schedule: [ ] Age 18  [ ] Age 21  [ ] Age 25  [ ] Custom: _____
Special Conditions:
___________________________________________

Heir 2:
Name: _____________________________________
Relationship: ______________________________
Percentage: _______%
Vesting Schedule: [ ] Age 18  [ ] Age 21  [ ] Age 25  [ ] Custom: _____
Special Conditions:
___________________________________________

Heir 3:
Name: _____________________________________
Relationship: ______________________________
Percentage: _______%
Vesting Schedule: [ ] Age 18  [ ] Age 21  [ ] Age 25  [ ] Custom: _____
Special Conditions:
___________________________________________

(Attach additional sheets as needed)

ARTICLE III: DISTRIBUTION CONDITIONS
[ ] Education completion required
[ ] House participation required
[ ] Minimum age for full distribution: _____
[ ] Spendthrift provisions apply
[ ] Accumulation option available

ARTICLE IV: CONTINGENCY PROVISIONS
If a designated heir predeceases me or fails to meet conditions:
[ ] Share passes to heir's descendants (per stirpes)
[ ] Share redistributed among remaining heirs
[ ] Share returns to House general fund
[ ] Other: _________________________________

ARTICLE V: IRREVOCABILITY
[ ] This designation is revocable until my death
[ ] This designation becomes irrevocable upon: _______________

ARTICLE VI: CERTIFICATION
I certify that I am of sound mind and under no duress. I understand that this designation affects the distribution of House wealth and have consulted appropriate advisors.

___________________________
${founderName}, Founder
Date: ${date}

WITNESSES (Two required):

Witness 1:
Name: _____________________________________
Signature: _________________________________
Date: _____________________________________

Witness 2:
Name: _____________________________________
Signature: _________________________________
Date: _____________________________________

NOTARIZATION (Optional but recommended):
State of _______________
County of ______________

Subscribed and sworn before me this _____ day of _____________, 20___.

___________________________
Notary Public
My Commission Expires: _______________
`;
}

export function generateDistributionAgreement(houseName: string, heirName: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
DISTRIBUTION AGREEMENT
${houseName}

Agreement Date: ${date}
Agreement ID: DA-${Date.now()}

PARTIES:
House: ${houseName} ("House")
Heir: ${heirName} ("Beneficiary")

ARTICLE I: PURPOSE
This Agreement establishes the terms and conditions under which the Beneficiary shall receive distributions from ${houseName}'s accumulated wealth.

ARTICLE II: DISTRIBUTION TYPE
[ ] Immediate Distribution - Funds distributed as earned
[ ] Accumulation - Funds held until vesting milestones
[ ] Milestone-Based - Distributions tied to specific achievements

ARTICLE III: DISTRIBUTION SCHEDULE
Frequency: [ ] Monthly  [ ] Quarterly  [ ] Annually  [ ] On Event
Start Date: _______________
Minimum Age for Distribution: _____

ARTICLE IV: CONDITIONS PRECEDENT
The following conditions must be met for distributions:

4.1 Age Requirements
[ ] Age 18: _____% of accumulated share
[ ] Age 21: _____% of accumulated share
[ ] Age 25: _____% of accumulated share

4.2 Education Requirements
[ ] High school diploma or equivalent
[ ] College degree
[ ] Vocational certification
[ ] Financial literacy course completion
[ ] Not applicable

4.3 Participation Requirements
[ ] Active House membership
[ ] Attendance at House meetings
[ ] Community service hours: _____ per year
[ ] Not applicable

ARTICLE V: SPENDTHRIFT PROVISIONS
[ ] Spendthrift provisions APPLY to this distribution
[ ] Spendthrift provisions DO NOT apply

If applicable:
- Distributions may not be assigned or pledged
- Creditors may not attach distributions before receipt
- Trustee discretion applies to all distributions

ARTICLE VI: ACCUMULATION OPTION
The Beneficiary may elect to:
[ ] Receive distributions as scheduled
[ ] Accumulate distributions in House account
[ ] Combination (specify): _________________

Accumulated funds earn: _____% annual return

ARTICLE VII: MODIFICATION
This Agreement may be modified only by written consent of both parties, except that the House may unilaterally modify terms to comply with legal requirements.

ARTICLE VIII: GOVERNING LAW
This Agreement shall be governed by the laws of the State of _____________.

SIGNATURES:

For ${houseName}:
___________________________
Authorized Representative
Date: _______________

Beneficiary:
___________________________
${heirName}
Date: _______________

Guardian (if Beneficiary is a minor):
___________________________
Guardian Name
Date: _______________
`;
}

export function generateSpendthriftProvisions(houseName: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
SPENDTHRIFT TRUST PROVISIONS
${houseName}

Effective Date: ${date}
Document ID: STP-${Date.now()}

ARTICLE I: PURPOSE AND INTENT
These Spendthrift Provisions are established to protect the interests of beneficiaries of ${houseName} by preventing the voluntary or involuntary alienation of their beneficial interests prior to actual distribution.

ARTICLE II: RESTRICTION ON ALIENATION

Section 2.1 - Voluntary Alienation Prohibited
No beneficiary shall have the power to sell, assign, transfer, encumber, or otherwise dispose of their interest in the House's accumulated wealth, whether by voluntary act or by operation of law, prior to actual distribution.

Section 2.2 - Involuntary Alienation Prohibited
No creditor or other claimant of any beneficiary shall have any right to reach, attach, or otherwise subject to legal process any interest of a beneficiary in the House's accumulated wealth prior to actual distribution.

ARTICLE III: PROTECTED ASSETS
The following assets are subject to these Spendthrift Provisions:
- All accumulated distributions in House accounts
- All vested but undistributed shares
- All contingent interests in House wealth
- All income generated by protected assets

ARTICLE IV: EXCEPTIONS TO PROTECTION
Notwithstanding the foregoing, these provisions shall NOT protect against:

Section 4.1 - Child Support
Court-ordered child support obligations

Section 4.2 - Spousal Support
Court-ordered alimony or spousal maintenance

Section 4.3 - Federal Tax Claims
Valid claims by the Internal Revenue Service

Section 4.4 - Criminal Restitution
Court-ordered restitution in criminal proceedings

Section 4.5 - Necessary Services
Claims for necessary services rendered to the beneficiary

ARTICLE V: TRUSTEE DISCRETION

Section 5.1 - Absolute Discretion
The Trustee shall have absolute discretion in determining:
- The timing of distributions
- The amount of distributions
- The form of distributions (cash, property, etc.)
- Whether to make distributions directly or to third parties

Section 5.2 - Consideration of Circumstances
In exercising discretion, the Trustee may consider:
- The beneficiary's other resources
- The beneficiary's financial management abilities
- The presence of creditor claims
- The beneficiary's health and welfare needs
- Tax consequences of distributions

ARTICLE VI: MODIFICATION

Section 6.1 - Amendment
These provisions may be amended only by:
- Written instrument signed by the Founder (during lifetime)
- Court order upon petition showing changed circumstances
- Unanimous consent of all beneficiaries (if Founder deceased)

Section 6.2 - Termination
These provisions shall terminate upon:
- Complete distribution of all House assets
- Written termination by the Founder
- Court order

ARTICLE VII: SEVERABILITY
If any provision hereof is held invalid, the remaining provisions shall continue in full force and effect.

ARTICLE VIII: GOVERNING LAW
These provisions shall be governed by the laws of the State of _____________, including its spendthrift trust statutes.

CERTIFICATION:

___________________________
Founder/Trustee
Date: ${date}

ACKNOWLEDGMENT:
I acknowledge receipt and understanding of these Spendthrift Provisions.

___________________________
Beneficiary Name
Date: _______________
`;
}

export function generateVestingScheduleDocument(houseName: string, heirName: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
VESTING SCHEDULE DOCUMENTATION
${houseName}

Document Date: ${date}
Document ID: VS-${Date.now()}
Beneficiary: ${heirName}

ARTICLE I: VESTING OVERVIEW
This document establishes the vesting schedule for ${heirName}'s beneficial interest in ${houseName}'s accumulated wealth.

ARTICLE II: VESTING MILESTONES

Milestone 1: Age 18
- Percentage Vested: 25%
- Additional Conditions:
  [ ] High school diploma or equivalent
  [ ] Financial literacy course completion
  [ ] House membership in good standing
- Verification Required: Birth certificate, diploma (if applicable)

Milestone 2: Age 21
- Percentage Vested: 25% (Cumulative: 50%)
- Additional Conditions:
  [ ] Continued House membership
  [ ] No outstanding obligations to House
  [ ] Completion of House orientation
- Verification Required: Membership records review

Milestone 3: Age 25
- Percentage Vested: 25% (Cumulative: 75%)
- Additional Conditions:
  [ ] Demonstrated financial responsibility
  [ ] Active participation in House activities
  [ ] Completion of wealth management course
- Verification Required: Activity records, course certificate

Milestone 4: Age 30 (or earlier upon conditions)
- Percentage Vested: 25% (Cumulative: 100%)
- Additional Conditions:
  [ ] Full compliance with all prior conditions
  [ ] No pending disputes with House
- Verification Required: Final compliance review

ARTICLE III: ACCELERATION EVENTS
Vesting may be accelerated upon:
- Marriage (accelerate to next milestone)
- Birth of child (accelerate to next milestone)
- Purchase of primary residence (accelerate 10%)
- Completion of advanced degree (accelerate 10%)
- Start of qualifying business (accelerate 15%)
- Military service completion (accelerate to next milestone)
- Other: _________________________________

ARTICLE IV: FORFEITURE CONDITIONS
Vesting may be forfeited or delayed upon:
- Criminal conviction (felony)
- Substance abuse (documented, untreated)
- Abandonment of House membership
- Fraudulent claims against House
- Violation of House code of conduct
- Other: _________________________________

ARTICLE V: PARTIAL VESTING
If conditions are partially met:
- Trustee discretion applies
- Partial acceleration may be granted
- Conditions may be modified for hardship

ARTICLE VI: UNVESTED INTEREST DISPOSITION
Upon beneficiary's death before full vesting:
[ ] Unvested portion passes to beneficiary's descendants
[ ] Unvested portion returns to House general fund
[ ] Unvested portion redistributed to other heirs
[ ] Other: _________________________________

ARTICLE VII: VERIFICATION PROCESS
1. Beneficiary submits verification documents
2. House Administrator reviews within 30 days
3. Trustee approves vesting advancement
4. Distribution processed within 14 days of approval
5. Records updated in House Vault

ARTICLE VIII: ACKNOWLEDGMENT

Beneficiary Acknowledgment:
I, ${heirName}, acknowledge that I have received, read, and understand this Vesting Schedule. I agree to comply with all conditions and understand that failure to meet conditions may result in delayed or forfeited vesting.

___________________________
${heirName}
Date: _______________

Guardian Acknowledgment (if applicable):
___________________________
Guardian Name
Date: _______________

House Representative:
___________________________
Authorized Representative
Date: ${date}
`;
}

// Export all template generators
export const fundPolicyTemplates = {
  generateFundAllocationPolicy,
  generateDisbursementRequestForm,
  generateHeirDesignationForm,
  generateDistributionAgreement,
  generateSpendthriftProvisions,
  generateVestingScheduleDocument
};
