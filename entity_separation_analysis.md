# Entity Separation Analysis

## Current Structure

### Navigation Menu Categories:
1. **Personal** - My Profile, My House, Getting Started, Learning Center
2. **Learning** - Business Simulator, Business Plan Simulator, Grant Simulator, Tax Simulator
3. **Management** - Business Dashboard, Financial Automation, HR, etc.
4. **Administration** - Organization Setup, Foundation, Business Formation, etc.
5. **Governance** - Executive Dashboard, Owner Setup, System Overview

### Key Pages to Separate:

#### Should be tied to **L.A.W.S. Collective, LLC** (Business/Community Focus):
- `/business-simulator` - BusinessSimulator.tsx
- `/business-plan-simulator` - BusinessPlanSimulator.tsx
- `/grant-simulator` - GrantSimulator.tsx
- `/tax-simulator` - TaxSimulator.tsx
- `/proposal-simulator` - ProposalSimulator.tsx
- `/rfp-generator` - RFPGenerator.tsx
- `/getting-started` - GettingStarted.tsx (onboarding for L.A.W.S. members)

**Focus**: Financial literacy, business readiness, practical skills, community development

#### Should be tied to **LuvOnPurpose Outreach Temple and Academy Society, Inc. (508(c)(1)(a))** (Faith-Based Education):
- `/academy` - AcademyDashboard.tsx (Luv Learning Academy - K-12)
- `/training-content` - TrainingContentManager.tsx
- `/transition-training` - TransitionTraining.tsx

**Focus**: Flame-based education, ancestral wisdom, indigenous knowledge, sovereign skill-building, theological education

### Current Issues:
1. AcademyDashboard has a "Simulators" tab that may overlap with L.A.W.S. simulators
2. Both entities appear under the same "Learning" category in navigation
3. No clear visual distinction between the two educational tracks

## Recommended Changes:

### 1. Navigation Restructure:
- Create "L.A.W.S. Training" category for business simulators
- Create "Academy" category for 508(c)(1)(a) educational content
- Add entity badges/labels to clarify which organization each belongs to

### 2. Page Updates:
- Add entity branding to each simulator header
- Update AcademyDashboard to remove business simulators from its tabs
- Add clear mission statements reflecting each entity's purpose

### 3. Visual Distinction:
- L.A.W.S. Collective: Green theme (current)
- 508 Academy: Amber/Gold theme (flame-based, spiritual)
