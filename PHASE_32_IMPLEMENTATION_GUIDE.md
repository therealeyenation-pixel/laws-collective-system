# Phase 32 Implementation Guide

## Quick Start

### 1. Access the System

**Frontend URL:** finmap-spwuc63a.manus.space
**Authentication:** Manus OAuth (Sign in with your account)

### 2. Core Workflows

#### Investment Education Workflow

```
1. User enrolls in course
   → investmentEducationRouter.enrollInCourse({ courseId: 1 })

2. User completes lessons
   → investmentEducationRouter.completeLessonMutation({ courseId: 1, lessonId: 1 })

3. User takes quiz
   → investmentEducationRouter.submitQuizAnswers({ 
       lessonId: 1, 
       answers: [{ questionId: 1, selectedAnswer: "A" }] 
     })

4. User views progress
   → investmentEducationRouter.getMemberCourseProgress()

5. User views achievements
   → investmentEducationRouter.getMemberAchievements()

6. User checks leaderboard
   → investmentEducationRouter.getInvestmentLeaderboard({})
```

#### Employment Opportunities Workflow

```
1. User views opportunities
   → employmentOpportunitiesRouter.getEmploymentOpportunities({ type: "w2" })

2. User views W-2 to contractor pathway
   → employmentOpportunitiesRouter.getW2ToContractorPathway()

3. User views career progress
   → employmentOpportunitiesRouter.getMemberCareerProgress()

4. User gets employment recommendations
   → employmentOpportunitiesRouter.getEmploymentRecommendations()

5. User checks contractor readiness
   → employmentOpportunitiesRouter.getContractorReadinessAssessment()

6. User tracks milestone
   → employmentOpportunitiesRouter.trackEmploymentMilestone({ 
       milestone: "First client acquired" 
     })
```

#### Compliance Workflow

```
1. Admin views compliance requirements
   → complianceRegulatoryRouter.getComplianceRequirements()

2. Admin views audit trail
   → complianceRegulatoryRouter.getComplianceAuditTrail({ limit: 100 })

3. Admin generates compliance report
   → complianceRegulatoryRouter.generateComplianceReport({ 
       reportType: "Form 13F" 
     })

4. Admin tracks violation
   → complianceRegulatoryRouter.trackComplianceViolation({ 
       violationType: "documentation",
       severity: "medium",
       description: "Missing documentation"
     })

5. Admin views member compliance profile
   → complianceRegulatoryRouter.getMemberComplianceProfile()

6. Admin checks audit readiness
   → complianceRegulatoryRouter.getAuditReadinessAssessment()
```

---

## Integration with Existing Systems

### Investment Education + Game Center

```typescript
// Investment courses appear in Game Center
// Quizzes are tracked as game achievements
// Leaderboards integrate with Game Center rankings
// Token rewards distributed via LuvLedger
```

### Employment Opportunities + LuvLedger

```typescript
// Career milestones earn tokens (100 tokens per milestone)
// W-2 to contractor progression tracked in LuvLedger
// Salary data integrated with member financial profiles
// Career achievements recorded in activity history
```

### Compliance + Audit Trail

```typescript
// All compliance actions logged in audit trail
// Member compliance profiles linked to KYC/AML status
// Regulatory reports generated from audit trail
// Violations tracked with timestamps and severity
```

---

## Frontend Integration Examples

### React Component: Investment Courses

```typescript
import { trpc } from "@/lib/trpc";

export function InvestmentCourses() {
  const { data: courses, isLoading } = trpc.investmentEducation.getInvestmentCourses.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {courses?.courses.map((course) => (
        <div key={course.id}>
          <h3>{course.name}</h3>
          <p>{course.description}</p>
          <p>Level: {course.level}</p>
          <p>Hours: {course.estimatedHours}</p>
        </div>
      ))}
    </div>
  );
}
```

### React Component: Employment Opportunities

```typescript
import { trpc } from "@/lib/trpc";

export function EmploymentOpportunities() {
  const { data: opportunities } = trpc.employmentOpportunities.getEmploymentOpportunities.useQuery({
    type: "w2",
  });
  
  return (
    <div>
      {opportunities?.opportunities.map((opp) => (
        <div key={opp.id}>
          <h3>{opp.title}</h3>
          <p>Type: {opp.type}</p>
          <p>Level: {opp.level}</p>
          <p>Salary: ${opp.salaryRange.min} - ${opp.salaryRange.max}</p>
        </div>
      ))}
    </div>
  );
}
```

### React Component: Compliance Status

```typescript
import { trpc } from "@/lib/trpc";

export function ComplianceStatus() {
  const { data: compliance } = trpc.complianceRegulatory.getComplianceRequirements.useQuery();
  
  return (
    <div>
      {compliance?.requirements.map((req) => (
        <div key={req.id}>
          <h3>{req.area}</h3>
          <p>Status: {req.status}</p>
          <p>Last Review: {new Date(req.lastReviewDate).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Database Schema Reference

### Investment Education Tables

```sql
-- Courses
CREATE TABLE investment_courses (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  level ENUM('beginner', 'intermediate', 'advanced'),
  estimatedHours INT,
  certificateType VARCHAR(255)
);

-- Lessons
CREATE TABLE investment_lessons (
  id INT PRIMARY KEY,
  courseId INT,
  title VARCHAR(255),
  description TEXT,
  estimatedMinutes INT,
  FOREIGN KEY (courseId) REFERENCES investment_courses(id)
);

-- Member Progress
CREATE TABLE member_course_progress (
  id INT PRIMARY KEY,
  userId INT,
  courseId INT,
  enrollmentDate DATETIME,
  completionDate DATETIME,
  progress INT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES investment_courses(id)
);

-- Achievements
CREATE TABLE member_achievements (
  id INT PRIMARY KEY,
  userId INT,
  achievementName VARCHAR(255),
  rarity ENUM('common', 'uncommon', 'rare', 'epic'),
  pointsValue INT,
  unlockedDate DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Employment Opportunities Tables

```sql
-- Opportunities
CREATE TABLE employment_opportunities (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  type ENUM('w2', 'contractor'),
  level ENUM('entry', 'mid', 'senior', 'executive'),
  description TEXT,
  salaryMin INT,
  salaryMax INT
);

-- Career Progress
CREATE TABLE member_career_progress (
  id INT PRIMARY KEY,
  userId INT,
  currentRole VARCHAR(255),
  currentLevel VARCHAR(255),
  yearsExperience INT,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Career History
CREATE TABLE member_career_history (
  id INT PRIMARY KEY,
  userId INT,
  role VARCHAR(255),
  startDate DATETIME,
  endDate DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Compliance Tables

```sql
-- Compliance Requirements
CREATE TABLE compliance_requirements (
  id INT PRIMARY KEY,
  area VARCHAR(255),
  description TEXT,
  status ENUM('compliant', 'in-progress', 'non-compliant'),
  lastReviewDate DATETIME,
  nextReviewDate DATETIME
);

-- Audit Trail
CREATE TABLE compliance_audit_trail (
  id INT PRIMARY KEY,
  action VARCHAR(255),
  actor VARCHAR(255),
  timestamp DATETIME,
  details JSON,
  status ENUM('success', 'failed')
);

-- Member Compliance Profile
CREATE TABLE member_compliance_profile (
  id INT PRIMARY KEY,
  userId INT,
  kycStatus ENUM('pending', 'verified', 'rejected'),
  amlStatus ENUM('pending', 'verified', 'flagged'),
  complianceScore INT,
  lastReviewDate DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## Configuration & Customization

### Customize Course Content

Edit `server/routers/investment-education.ts`:

```typescript
const courses = [
  {
    id: 1,
    name: "Investment Fundamentals",
    description: "Learn the basics of investing",
    level: "beginner",
    estimatedHours: 10,
    certificateType: "Investment Literacy",
    lessons: 5
  },
  // Add more courses...
];
```

### Customize Employment Opportunities

Edit `server/routers/employment-opportunities.ts`:

```typescript
const opportunities = [
  {
    id: 1,
    title: "Investment Advisor",
    type: "w2",
    level: "entry",
    description: "Help clients with investment decisions",
    requirements: ["Series 7", "Series 65"],
    salaryRange: { min: 50000, max: 100000 }
  },
  // Add more opportunities...
];
```

### Customize Compliance Requirements

Edit `server/routers/compliance-regulatory.ts`:

```typescript
const requirements = [
  {
    id: 1,
    area: "Investment Advisor Compliance",
    description: "SEC and FINRA regulations",
    status: "compliant",
    lastReviewDate: new Date(),
    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  // Add more requirements...
];
```

---

## Testing & Validation

### Run All Tests

```bash
pnpm test
```

### Run Specific Test Suite

```bash
# Investment Education tests
pnpm test -- investment-education.test.ts

# Employment Opportunities tests
pnpm test -- employment-opportunities.test.ts

# Compliance tests
pnpm test -- compliance-regulatory.test.ts

# Integration tests
pnpm test -- phase-32-integration.test.ts
```

### Test Coverage

```bash
pnpm test -- --coverage
```

### Watch Mode

```bash
pnpm test -- --watch
```

---

## Troubleshooting

### Issue: Tests Failing

**Cause:** Missing dependencies or database connection
**Solution:**
```bash
pnpm install
pnpm db:push
pnpm test
```

### Issue: Dev Server Not Starting

**Cause:** Port already in use or build errors
**Solution:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Restart dev server
pnpm dev
```

### Issue: Database Connection Error

**Cause:** Invalid DATABASE_URL or SSL issues
**Solution:**
```bash
# Check environment variables
echo $DATABASE_URL

# Verify SSL connection
# Add ?ssl=true to connection string if needed
```

### Issue: Module Not Found

**Cause:** Missing router imports in routers.ts
**Solution:**
```bash
# Check imports in server/routers.ts
grep "import.*Router" server/routers.ts

# Verify router files exist
ls server/routers/
```

---

## Performance Optimization

### Database Query Optimization

- Use indexes on frequently queried fields
- Limit result sets with pagination
- Cache leaderboard results

### Frontend Performance

- Lazy load course content
- Paginate long lists
- Use React Query caching

### API Response Optimization

- Return only needed fields
- Use database projections
- Implement response compression

---

## Security Best Practices

### Authentication

- Always use protected procedures for sensitive data
- Verify user context in all mutations
- Log all compliance-related actions

### Data Protection

- Never expose sensitive fields in public procedures
- Validate all input parameters
- Use parameterized queries (Drizzle ORM handles this)

### Compliance

- Maintain complete audit trail
- Document all regulatory decisions
- Regular security reviews

---

## Deployment Checklist

- [ ] All tests passing (208+ tests)
- [ ] Performance benchmarks met
- [ ] Security validation complete
- [ ] Documentation updated
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificate verified
- [ ] Monitoring enabled
- [ ] Backup procedures tested
- [ ] Team training completed

---

## Support Resources

- **Documentation:** PHASE_32_DOCUMENTATION.md
- **API Reference:** See documentation for full procedure reference
- **Test Examples:** See test files for usage examples
- **GitHub:** Check repository for latest updates

---

**Version:** 1.0
**Last Updated:** March 28, 2026
**Status:** FINAL - PRODUCTION READY
