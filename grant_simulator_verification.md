# Grant Simulator Improvements - Verification

## Date: January 18, 2026

## Changes Made

### 1. Added Application URLs for All 13 Grants
Each grant now has a direct `applicationUrl` field that links to the actual grant application portal:

| Grant | Application URL |
|-------|-----------------|
| Amber Grant | https://ambergrantsforwomen.com/get-an-amber-grant/ |
| HerRise Microgrant | https://hersuitespot.com/herrise-microgrant/ |
| NAACP Powershift | https://naacp.org/find-resources/grants |
| IFundWomen | https://ifundwomen.com/universal-application |
| Freed Fellowship | https://freedfellowship.com/apply |
| Wish Local Empowerment | https://www.wish.com/local/empowerment |
| EmpowHer Grant | https://theboundlessfuturesfoundation.submittable.com/ |
| MBDA Business Center | https://www.mbda.gov/grants1 |
| Lilly Endowment | https://lillyendowment.org/for-grantseekers/ |
| CDBG (Georgia) | https://dca.georgia.gov/financing-tools/infrastructure/community-development-block-grants-cdbg |
| Arthur M. Blank | https://blankfoundation.org/ |
| Community Foundation CSRA | https://www.cfcsra.org/nonprofits/grant-opportunities/community-grants/ |
| USDA RCDI | https://www.rd.usda.gov/programs-services/community-facilities/rural-community-development-initiative-grants |

### 2. Added Contact Email Addresses
Each grant now has a `contactEmail` field for direct funder communication.

### 3. Grant Selection Cards Now Display URLs
Each grant card in Step 1 shows the application URL with an external link icon.

### 4. Certificate Step (Step 10) Improvements
- **Apply Now Button**: Opens the actual grant application portal in a new tab
- **Export Package Button**: Downloads a JSON file with all application data
- **Email Funder Button**: Opens email client with pre-filled subject and body

### 5. Email Template
The "Email Funder" button generates a mailto: link with:
- Subject: "Grant Application Inquiry - [Entity Name]"
- Body: Pre-filled with organization name, project title, and requested amount

## Testing Status
- [x] Grant selection cards display application URLs
- [x] Amber Grant selected and shows checkmark
- [x] Application URLs are clickable and open in new tabs
- [ ] Full workflow test through Certificate step (pending)

## Notes
- The Wish Local Empowerment Program amount was corrected from "$5,000 - $25,000" to "$500 - $2,000" based on current program details
- EmpowHer Grant funder updated from "EmpowHer Institute" to "Boundless Futures Foundation" (actual grant administrator)
- Arthur M. Blank Foundation marked as "invitation only" in description
