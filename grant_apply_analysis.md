# Grant Simulator Apply Link Analysis

## Current State

The Grant Simulator has an "Apply" button on the Certificate step (Step 10) that opens external URLs for some grants:

### Grants with Apply URLs (5 of 13):
1. **Amber Grant** → https://ambergrantsforwomen.com/
2. **HerRise Microgrant** → https://hersuitespot.com/herrise-microgrant/
3. **NAACP Powershift** → https://naacp.org/find-resources/grants
4. **IFundWomen** → https://ifundwomen.com/
5. **Freed Fellowship** → https://freedfellowship.com/

### Grants MISSING Apply URLs (8 of 13):
1. Wish Local Empowerment Program
2. EmpowHer Grant
3. MBDA Business Center Grant
4. Lilly Endowment Religion Grant
5. Community Development Block Grant (CDBG)
6. Arthur M. Blank Family Foundation Grant
7. Community Foundation CSRA Grant
8. Rural Community Development Initiative (RCDI)

## Issues Identified

1. **Missing URLs**: 8 grants don't have application URLs configured
2. **No Email Submission**: No way to email completed grant packages
3. **No Export Feature**: Can't export the completed application data as PDF
4. **Data Not Saved**: Simulator data isn't persisted to database for later use
5. **No Funder Contact Info**: Missing email addresses for direct submission

## Recommended Improvements

1. Add application URLs for all 13 grants
2. Add funder email addresses where available
3. Create "Export Grant Package" button to generate PDF
4. Add "Email Application" feature to send package to funder
5. Save completed applications to database for tracking
6. Add application status tracking (draft, submitted, pending, approved, denied)
