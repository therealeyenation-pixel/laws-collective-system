# Family Business Position System - Legal Structure

## Overview

This document outlines the legal structure for the LuvOnPurpose Family Business & Trust System, where:

1. **The House (Trust)** is the governing entity that owns or controls business entities
2. **Business Entities** are the revenue-generating arms (LLCs, Corporations, 508s)
3. **Family/Friends** hold legal positions in these businesses AND can form their own entities
4. **The Academy** trains individuals before they can form their own businesses

---

## Legal Structure Hierarchy

```
CALEA Freeman Family Trust (Genesis House)
├── LuvOnPurpose Autonomous Wealth System LLC
│   ├── Position: Manager (Family Member A)
│   ├── Position: Operations Director (Family Member B)
│   └── Training Simulator: Business Operations
│
├── The L.A.W.S. Collective LLC
│   ├── Position: Managing Member (Family Member C)
│   ├── Position: Community Coordinator (Friend A)
│   └── Training Simulator: Community Building
│
├── Real-Eye-Nation (Media Entity)
│   ├── Position: Creative Director (Family Member D)
│   ├── Position: Content Manager (Friend B)
│   └── Training Simulator: Media & Narrative
│
├── 508-LuvOnPurpose Academy and Outreach
│   ├── Position: Academy Director (Family Member E)
│   ├── Position: Instructor (Multiple)
│   └── Training Simulators: All Educational Content
│
└── [Future Family-Owned Entities]
    └── Formed after completing Business Workshop
```

---

## Position Types & Legal Classifications

### 1. Managing Member (LLC)
- **Legal Status**: Owner with management authority
- **Tax Treatment**: K-1 (pass-through income)
- **Documents Required**:
  - Operating Agreement (amendment to add member)
  - K-1 Schedule at year end
  - Membership Interest Certificate
- **Compensation**: Guaranteed Payments + Profit Distribution

### 2. Manager (LLC - Non-Member)
- **Legal Status**: Employee or Contractor with management duties
- **Tax Treatment**: W-2 (employee) or 1099-NEC (contractor)
- **Documents Required**:
  - Employment Agreement OR Independent Contractor Agreement
  - W-4 (employee) or W-9 (contractor)
  - I-9 Employment Eligibility (employees only)
  - Job Description with duties
- **Compensation**: Salary (W-2) or Fee (1099)

### 3. Officer (Corporation)
- **Legal Status**: Corporate officer (President, Secretary, Treasurer, etc.)
- **Tax Treatment**: W-2 (must be employee if compensated)
- **Documents Required**:
  - Board Resolution appointing officer
  - Employment Agreement
  - W-4, I-9
  - Officer's Certificate
- **Compensation**: Salary + potential bonuses

### 4. Trustee (Trust)
- **Legal Status**: Fiduciary with legal duties to beneficiaries
- **Tax Treatment**: 1099-MISC for trustee fees
- **Documents Required**:
  - Trust Amendment (adding trustee)
  - Trustee Acceptance Letter
  - W-9
- **Compensation**: Trustee Fees (must be reasonable)

### 5. Instructor/Educator (508 Nonprofit)
- **Legal Status**: Employee or Volunteer
- **Tax Treatment**: W-2 (employee) or Volunteer (no compensation)
- **Documents Required**:
  - Employment Agreement (if paid)
  - Volunteer Agreement (if unpaid)
  - W-4, I-9 (if employee)
  - Background Check Authorization (working with minors)
- **Compensation**: Salary or stipend

### 6. Director/Board Member (Nonprofit)
- **Legal Status**: Fiduciary board member
- **Tax Treatment**: Usually unpaid; if paid, 1099-MISC
- **Documents Required**:
  - Board Resolution electing director
  - Director Agreement
  - Conflict of Interest Policy acknowledgment
- **Compensation**: Usually none (volunteer); some pay stipends

---

## Dual-Track System

### Track A: Position in Existing Business
Family/friends can hold positions in YOUR existing businesses immediately:

1. **Onboarding Process**:
   - Complete relevant Academy course for the position
   - Sign employment/contractor documents
   - Receive position-specific training via simulator
   - Begin duties

2. **Compensation Flow**:
   ```
   Business Revenue
   → 70% to Trust (Platform Services Fee)
   → 30% remains in Business
      → Salaries/Wages paid from Business funds
      → Payroll taxes withheld (W-2) or reported (1099)
   ```

3. **Tracking Requirements**:
   - Time tracking (for hourly positions)
   - Performance reviews
   - Payroll records
   - Tax document generation (W-2, 1099, K-1)

### Track B: Form Own Business Entity
Family/friends can form their own business after completing requirements:

1. **Formation Process**:
   - Complete Business Workshop in Academy
   - Pass business formation simulator
   - Generate formation documents
   - File with state
   - Link to parent House

2. **Entity Options**:
   - **Mirrored House**: Bloodline family member creates their own trust + businesses
   - **Adapted House**: Non-blood trusted person creates linked entity
   - **Subsidiary LLC**: Business owned by parent trust

3. **Revenue Flow**:
   ```
   New Entity Revenue
   → 70% to Genesis House Trust (Platform Services Fee)
   → 30% remains in New Entity
      → 60% Operations (Reserve)
      → 40% Community Share
   ```

---

## Document Generation Requirements

### Employment Documents (W-2 Employees)
| Document | Purpose | When Generated |
|----------|---------|----------------|
| Offer Letter | Formal job offer | Before start |
| Employment Agreement | Terms of employment | At hiring |
| W-4 | Tax withholding elections | At hiring |
| I-9 | Employment eligibility | Within 3 days of start |
| Job Description | Duties and responsibilities | At hiring |
| Direct Deposit Form | Payment method | At hiring |
| Employee Handbook Acknowledgment | Policy acceptance | At hiring |

### Contractor Documents (1099)
| Document | Purpose | When Generated |
|----------|---------|----------------|
| Independent Contractor Agreement | Terms of engagement | Before work begins |
| W-9 | Tax ID collection | Before first payment |
| Scope of Work | Specific deliverables | Per project |
| Invoice Template | Payment requests | As needed |

### Member/Owner Documents (K-1)
| Document | Purpose | When Generated |
|----------|---------|----------------|
| Operating Agreement Amendment | Add new member | At admission |
| Membership Interest Certificate | Proof of ownership | At admission |
| Capital Account Statement | Track contributions | Annually |
| K-1 Schedule | Tax reporting | Annually |

### Annual Tax Documents
| Document | Recipient | Deadline |
|----------|-----------|----------|
| W-2 | Employees | January 31 |
| 1099-NEC | Contractors ($600+) | January 31 |
| K-1 | Members/Partners | March 15 |
| 1099-MISC | Trustee fees, other | January 31 |

---

## Compliance Tracking

### Payroll Compliance
- Federal tax deposits (941)
- State tax deposits
- Unemployment insurance (FUTA/SUTA)
- Workers' compensation
- Minimum wage compliance
- Overtime tracking (non-exempt employees)

### Entity Compliance
- Annual report filings
- Registered agent maintenance
- Business license renewals
- Tax return filings
- Meeting minutes (corporations)

### Trust Compliance
- Annual trust accounting
- Beneficiary notifications
- Trustee duty documentation
- Distribution records

---

## Implementation in System

### Database Tables Needed
1. `business_positions` - Track all positions across entities
2. `position_holders` - Link people to positions
3. `employment_documents` - Store generated documents
4. `payroll_records` - Track compensation
5. `tax_documents` - W-2, 1099, K-1 generation
6. `compliance_tasks` - Track filing deadlines

### Router Functions Needed
1. `createPosition` - Define new position in entity
2. `assignPosition` - Assign person to position
3. `generateEmploymentDocs` - Create hiring paperwork
4. `recordPayroll` - Track compensation
5. `generateTaxDocs` - Create year-end tax forms
6. `trackCompliance` - Monitor deadlines

### UI Components Needed
1. Position Management Dashboard
2. Employee/Contractor Onboarding Flow
3. Document Generation Interface
4. Payroll Tracking View
5. Tax Document Center
6. Compliance Calendar

---

## Legal Disclaimers

1. **Not Legal Advice**: This system generates documents based on templates. Users should consult with attorneys for their specific situation.

2. **State Variations**: Employment and entity laws vary by state. Documents may need state-specific modifications.

3. **Tax Professional Required**: While the system tracks and generates tax documents, a CPA should review before filing.

4. **Reasonable Compensation**: IRS scrutinizes family business compensation. All salaries must be justified by actual work performed.

5. **Arm's Length Transactions**: All transactions between related entities must be at fair market value.
