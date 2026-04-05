# Dashboard Audit Findings - Single Source of Truth Analysis

## Summary

After auditing all 27 dashboards, I've identified areas where data is currently hardcoded or duplicated that should be centralized for consistency.

## Current State

### Existing Centralized Tables (Already in Schema)
The system already has robust document management infrastructure:

1. **secureDocuments** - Core document storage with access control
2. **documentFolders** - Folder organization
3. **documentAccess** - Granular permissions
4. **documentVersions** - Version history
5. **documentTemplates** - Legal form templates
6. **vaultDocuments** - House-specific document storage
7. **operationalProcedures** - SOPs, manuals, policies, guides, training materials

### Hardcoded Data Found in Dashboards

| Dashboard | Hardcoded Data | Should Pull From |
|-----------|---------------|------------------|
| ITDashboard | IT Security Policy, Disaster Recovery Plan, Network Diagram, etc. | operationalProcedures |
| LegalDashboard | Corporate Bylaws, NDA Template, Privacy Policy, etc. | operationalProcedures |
| PlatformAdminDashboard | Platform Architecture, API Docs, Backup Procedures | operationalProcedures |

### Links to Procedures Pages
Several dashboards link to `/procedures` which should pull from centralized data:
- BusinessDashboard
- OperationsDashboard

### Training References
Training materials are referenced in multiple places:
- AcademyDashboard - Business Training Simulators
- HRDashboard - Training Programs link
- FinanceDashboard - Training Materials approval
- ProcurementDashboard - Training Materials purchase
- PurchasingDashboard - Training Materials order

## Recommended Architecture

### 1. Centralized Content Tables (Already Exist)

**operationalProcedures** table already supports:
- SOPs (Standard Operating Procedures)
- Manuals
- Policies
- Guides
- Training Materials
- Checklists
- Templates
- Forms

With fields for:
- Department assignment
- Entity assignment
- Position assignment
- Version control
- Approval workflow
- Content storage (markdown or file URL)

### 2. Required Actions

#### A. Replace Hardcoded Documents
Replace the hardcoded `const documents = [...]` arrays in:
- ITDashboard.tsx
- LegalDashboard.tsx  
- PlatformAdminDashboard.tsx

With tRPC queries to fetch from `operationalProcedures` filtered by department.

#### B. Create Procedures Router
Build a router to:
- List procedures by department
- List procedures by category (SOP, policy, manual, etc.)
- Get required reading for a position
- Track acknowledgment of required reading

#### C. Create Procedures Management UI
Admin interface to:
- Create/edit procedures
- Assign to departments
- Set as required reading
- Track who has acknowledged

#### D. Update Dashboard Components
Create reusable components:
- `<DepartmentProcedures department="IT" />`
- `<RequiredReading positionId="..." />`
- `<PolicyList category="compliance" />`

## Implementation Priority

1. **High Priority** - Create procedures router and connect to existing operationalProcedures table
2. **Medium Priority** - Replace hardcoded documents in ITDashboard, LegalDashboard, PlatformAdminDashboard
3. **Lower Priority** - Add required reading tracking and acknowledgment system

## Benefits of Centralization

1. **Single Source of Truth** - Update once, reflects everywhere
2. **Version Control** - Track changes to procedures over time
3. **Access Control** - Control who can view/edit procedures
4. **Compliance** - Track who has read required materials
5. **Audit Trail** - Know when procedures were updated and by whom
