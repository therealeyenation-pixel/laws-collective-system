# HR System Audit Notes

## Current State

### HR Dashboard (/dept/hr)
- Shows 32 Open Positions
- Application Pipeline: Received, Screening, Interview, Offer, Hired stages
- This Week's Activity metrics (all showing 0)
- Tabs: Overview, Recent Applications, Open Positions, Onboarding, Documents

### Position Management (/positions)
- Shows only 1 position: Health Manager (open)
- Total Positions: 1, Filled: 0, Open: 1
- Tabs: Positions, Employees, Payroll, Documents

## Issues Found

1. **Mismatch**: HR Dashboard shows 32 open positions, but Position Management shows only 1
2. **Job Postings link**: Points to /job-postings which is 404 (should point to /positions)
3. **Data inconsistency**: Need to seed more positions to match HR dashboard display

## Required Fixes

1. Fix Job Postings navigation link to point to /positions
2. Seed positions to match the 32 shown in HR dashboard
3. Connect offer letters to positions
4. Verify application flow works end-to-end
