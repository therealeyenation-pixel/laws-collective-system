# Website Restructure Plan

## Current State
- Landing.tsx: slideshow intro → business name input → results slideshow → waitlist signup
- Login.tsx: email/password login → redirects to /dashboard
- SignUp.tsx: placeholder form, not functional
- GettingStarted.tsx: detailed personal profile + business assessment (protected, requires login)
- LuvOnboarding.tsx: house setup wizard with avatar (protected)
- ExternalOnboarding.tsx: business onboarding at /onboarding/business (public)
- BusinessSimulator.tsx: business simulator (protected)
- BusinessFormation.tsx: business formation wizard (admin only)
- BusinessSetupWizard.tsx: business setup (admin only)
- HouseDashboard.tsx: the "shell" - full dashboard with DashboardLayout (protected)
- ShellDemo.tsx: demo version at /demo
- DemoGate.tsx: passcode-protected demo
- Careers.tsx: public careers page

## Target Architecture — 3 Doors Into 1 Building

### Door 1: Public Landing (/)
- Professional page explaining L.A.W.S. Collective
- L.A.W.S. framework (LAND, AIR, WATER, SELF)
- Meet Luv section
- Support/Donate CTA → /purple-heart
- "Join the Collective" CTA → /signup (creates account, starts journey)
- Careers link → /careers
- Contact → /contact-us

### Door 2: Member Journey (post-signup)
After account creation:
1. /getting-started — Personal profile + business assessment
2. /business-simulator — Business concept validation
3. /business-plan-simulator — Detailed business planning
4. /onboarding — Business setup (LuvOnboarding: house name, type, avatar)
5. /house — House Dashboard (the shell, customized to business type)

Standard features all Houses get:
- Financial management
- Document vault
- Compliance tracking
- Team/HR management
- Training access

### Door 3: Owner Backdoor
- /system-map — Full system access (already built)
- /dashboard — Admin dashboard
- All admin routes accessible

### Separate Track: Employment
- /careers — Public job listings
- /hr-applications — Internal HR pipeline
- Connected but separate from member journey

## Implementation
1. Rebuild Landing.tsx as a proper professional landing page
2. Make /signup functional → creates account → redirects to /getting-started
3. Wire the member journey: getting-started → simulators → onboarding → house
4. Ensure /system-map is the owner backdoor hub
5. Keep /careers as separate public track
