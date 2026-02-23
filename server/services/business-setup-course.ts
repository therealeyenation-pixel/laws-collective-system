/**
 * Business Setup Course Service
 * Provides structured learning modules for business formation with document generation
 */

import { db } from "../db";

// Course structure with 6 modules
export const BUSINESS_SETUP_MODULES = [
  {
    id: 1,
    title: "Business Foundations",
    description: "Understanding business structures (LLC, Corp, Nonprofit, Trust)",
    duration: "45 min",
    tokensReward: 100,
    lessons: [
      {
        id: "bsc-1-1",
        title: "Introduction to Business Structures",
        content: `
# Introduction to Business Structures

Understanding the different types of business structures is the first step in building your enterprise. Each structure has unique characteristics that affect:

- **Liability Protection**: How much personal risk you take on
- **Taxation**: How profits are taxed
- **Management**: How decisions are made
- **Compliance**: Ongoing requirements to maintain the entity

## The Main Business Structures

### 1. Sole Proprietorship
The simplest form - you and your business are one entity. Easy to start but offers no liability protection.

### 2. Limited Liability Company (LLC)
Combines liability protection with flexible taxation. The most popular choice for small businesses.

### 3. Corporation (C-Corp & S-Corp)
Formal structure with shareholders, directors, and officers. Best for raising investment capital.

### 4. Partnership
Two or more owners sharing profits, losses, and management responsibilities.

### 5. Nonprofit Organization
Mission-driven entities that reinvest profits into their charitable purpose.

### 6. Trust
Asset protection vehicles for estate planning and generational wealth transfer.

## Key Considerations

When choosing your structure, consider:
1. Your liability exposure
2. Tax implications
3. Future growth plans
4. Number of owners
5. Compliance requirements
        `,
        duration: "15 min"
      },
      {
        id: "bsc-1-2",
        title: "LLC Deep Dive",
        content: `
# Limited Liability Company (LLC) Deep Dive

The LLC is often the best choice for new business owners. Here's why:

## Advantages of an LLC

### Liability Protection
Your personal assets (home, car, savings) are protected from business debts and lawsuits.

### Tax Flexibility
- **Default**: Pass-through taxation (profits taxed on your personal return)
- **Election**: Can choose to be taxed as S-Corp or C-Corp

### Management Flexibility
- Member-managed: All owners participate in decisions
- Manager-managed: Designated managers run operations

### Less Formality
Unlike corporations, LLCs don't require:
- Annual shareholder meetings
- Board of directors
- Corporate minutes

## Formation Requirements

1. **Choose a State**: Where to form your LLC
2. **Name Your LLC**: Must include "LLC" or "Limited Liability Company"
3. **File Articles of Organization**: State formation document
4. **Create Operating Agreement**: Internal governance rules
5. **Get EIN**: Federal tax identification number
6. **Open Business Bank Account**: Separate business finances

## Ongoing Compliance

- Annual reports (varies by state)
- Franchise taxes (some states)
- Registered agent maintenance
- Operating agreement updates
        `,
        duration: "15 min"
      },
      {
        id: "bsc-1-3",
        title: "Corporations and Other Structures",
        content: `
# Corporations and Other Business Structures

## C Corporation

The traditional corporate structure with these characteristics:

### Features
- Separate legal entity from owners
- Shareholders own stock
- Board of Directors governs
- Officers manage daily operations

### Taxation
- Corporate tax on profits (21% federal rate)
- Shareholders taxed on dividends
- "Double taxation" concern

### Best For
- Raising venture capital
- Going public (IPO)
- Large operations with many shareholders

## S Corporation

A special tax election for corporations:

### Requirements
- 100 or fewer shareholders
- Only U.S. citizens/residents as shareholders
- One class of stock
- Not certain financial institutions or insurance companies

### Benefits
- Pass-through taxation
- Potential self-employment tax savings
- Corporate credibility

## Nonprofit Organizations

### 501(c)(3)
- Tax-exempt charitable organizations
- Donations are tax-deductible
- Requires IRS application

### 508(c)(1)(A)
- Religious organizations
- Automatic tax-exempt status
- No IRS application required

## Trusts

### Revocable Living Trust
- Can be changed during your lifetime
- Avoids probate
- No asset protection during life

### Irrevocable Trust
- Cannot be changed once created
- Strong asset protection
- Estate tax benefits
        `,
        duration: "15 min"
      }
    ],
    quiz: [
      {
        question: "Which business structure provides liability protection while allowing pass-through taxation?",
        options: ["Sole Proprietorship", "Limited Liability Company (LLC)", "C Corporation", "General Partnership"],
        correct: 1,
        explanation: "LLCs provide personal liability protection while defaulting to pass-through taxation, making them ideal for small businesses."
      },
      {
        question: "What is 'double taxation' associated with?",
        options: ["LLCs", "S Corporations", "C Corporations", "Sole Proprietorships"],
        correct: 2,
        explanation: "C Corporations face double taxation - profits are taxed at the corporate level, then dividends are taxed again on shareholders' personal returns."
      },
      {
        question: "Which type of nonprofit does NOT require an IRS application for tax-exempt status?",
        options: ["501(c)(3)", "508(c)(1)(A)", "501(c)(4)", "501(c)(6)"],
        correct: 1,
        explanation: "508(c)(1)(A) religious organizations have automatic tax-exempt status without filing Form 1023."
      },
      {
        question: "What is the maximum number of shareholders allowed in an S Corporation?",
        options: ["50", "75", "100", "Unlimited"],
        correct: 2,
        explanation: "S Corporations are limited to 100 shareholders, all of whom must be U.S. citizens or residents."
      },
      {
        question: "Which document governs the internal operations of an LLC?",
        options: ["Articles of Organization", "Operating Agreement", "Bylaws", "Partnership Agreement"],
        correct: 1,
        explanation: "The Operating Agreement defines how the LLC will be managed, how profits are distributed, and member rights and responsibilities."
      }
    ],
    outputDocument: {
      title: "Entity Type Selection Worksheet",
      type: "worksheet",
      fields: [
        { name: "selectedEntityType", label: "Selected Entity Type", type: "select", options: ["LLC", "S Corporation", "C Corporation", "Partnership", "Sole Proprietorship", "Nonprofit 501(c)(3)", "Nonprofit 508(c)(1)(A)", "Trust"] },
        { name: "reasonsForSelection", label: "Top 3 Reasons for This Selection", type: "textarea" },
        { name: "liabilityNeeds", label: "Liability Protection Needs", type: "textarea" },
        { name: "taxConsiderations", label: "Tax Considerations", type: "textarea" },
        { name: "growthPlans", label: "Future Growth Plans", type: "textarea" },
        { name: "numberOfOwners", label: "Number of Owners", type: "number" },
        { name: "stateOfFormation", label: "Planned State of Formation", type: "text" },
        { name: "alternativeConsidered", label: "Alternative Structure Considered", type: "text" },
        { name: "nextSteps", label: "Immediate Next Steps", type: "textarea" }
      ]
    }
  },
  {
    id: 2,
    title: "Mission & Vision",
    description: "Crafting mission statements and value propositions",
    duration: "40 min",
    tokensReward: 100,
    lessons: [
      {
        id: "bsc-2-1",
        title: "The Power of Purpose",
        content: `
# The Power of Purpose

Every successful business starts with a clear sense of purpose. Your mission and vision statements are the foundation of your brand identity.

## Why Purpose Matters

### Internal Benefits
- Guides decision-making
- Motivates team members
- Creates company culture
- Provides direction during challenges

### External Benefits
- Attracts aligned customers
- Differentiates from competitors
- Builds brand loyalty
- Guides marketing messages

## Mission vs. Vision

### Mission Statement
**What you do NOW**
- Describes your current purpose
- Explains who you serve
- States how you serve them
- Should be actionable and measurable

### Vision Statement
**What you aspire to BECOME**
- Paints a picture of the future
- Inspires and motivates
- Sets long-term direction
- Should be ambitious yet achievable

## Examples of Great Mission Statements

**Tesla**: "To accelerate the world's transition to sustainable energy."

**Patagonia**: "Build the best product, cause no unnecessary harm, use business to inspire and implement solutions to the environmental crisis."

**LuvOnPurpose**: "To empower families with the knowledge, tools, and systems to build generational wealth and sovereignty."
        `,
        duration: "12 min"
      },
      {
        id: "bsc-2-2",
        title: "Crafting Your Mission Statement",
        content: `
# Crafting Your Mission Statement

A powerful mission statement answers three key questions:

## The Three Questions

### 1. WHO do you serve?
- Your target audience
- Your ideal customer
- The community you impact

### 2. WHAT do you do?
- Your products or services
- The problems you solve
- The value you provide

### 3. HOW do you do it?
- Your unique approach
- Your methodology
- What makes you different

## Mission Statement Formula

**"We [action] for [audience] by [method] so that [outcome]."**

### Examples Using the Formula

**Consulting Firm**: "We provide strategic guidance for small business owners by combining data-driven insights with hands-on mentorship so that they can achieve sustainable growth."

**Nonprofit**: "We educate underserved youth by providing free coding bootcamps and mentorship so that they can access careers in technology."

**E-commerce**: "We deliver premium organic products for health-conscious families by sourcing directly from sustainable farms so that they can nourish their bodies without compromise."

## Tips for Writing Your Mission

1. **Keep it concise**: 1-2 sentences maximum
2. **Use active verbs**: "We create," "We empower," "We transform"
3. **Be specific**: Avoid vague language
4. **Make it memorable**: Easy to recall and repeat
5. **Ensure authenticity**: Must reflect your true purpose
        `,
        duration: "15 min"
      },
      {
        id: "bsc-2-3",
        title: "Defining Your Value Proposition",
        content: `
# Defining Your Value Proposition

Your value proposition is the promise of value you deliver to customers. It's why someone should buy from you instead of competitors.

## The Value Proposition Canvas

### Customer Profile
1. **Jobs**: What tasks are customers trying to accomplish?
2. **Pains**: What frustrations do they experience?
3. **Gains**: What outcomes do they desire?

### Value Map
1. **Products/Services**: What you offer
2. **Pain Relievers**: How you reduce frustrations
3. **Gain Creators**: How you deliver desired outcomes

## Value Proposition Formula

**"For [target customer] who [statement of need], [product/service] is a [category] that [key benefit]. Unlike [competitors], we [unique differentiator]."**

### Example

"For busy professionals who struggle to eat healthy, MealPrep Pro is a meal delivery service that provides chef-prepared, nutritious meals delivered fresh daily. Unlike other meal services, we customize every meal to your dietary needs and taste preferences using locally-sourced ingredients."

## Testing Your Value Proposition

Ask yourself:
1. Is it clear what you're offering?
2. Does it address a real customer need?
3. Is the benefit obvious and compelling?
4. Does it differentiate you from competitors?
5. Can you deliver on this promise?

## Common Mistakes

- Being too vague or generic
- Focusing on features instead of benefits
- Not addressing customer pain points
- Trying to appeal to everyone
- Making promises you can't keep
        `,
        duration: "13 min"
      }
    ],
    quiz: [
      {
        question: "What is the primary difference between a mission statement and a vision statement?",
        options: ["Mission is longer than vision", "Mission describes current purpose, vision describes future aspirations", "Vision is for internal use only", "They are the same thing"],
        correct: 1,
        explanation: "A mission statement describes what you do now and for whom, while a vision statement paints a picture of what you aspire to become in the future."
      },
      {
        question: "Which three questions should a mission statement answer?",
        options: ["What, When, Where", "Who, What, How", "Why, How, When", "Who, Where, Why"],
        correct: 1,
        explanation: "A strong mission statement answers: WHO do you serve, WHAT do you do, and HOW do you do it."
      },
      {
        question: "What is a value proposition?",
        options: ["Your company's stock value", "The promise of value you deliver to customers", "Your pricing strategy", "Your competitive analysis"],
        correct: 1,
        explanation: "A value proposition is the promise of value you deliver to customers - it explains why someone should buy from you instead of competitors."
      },
      {
        question: "In the Value Proposition Canvas, what are 'Pains'?",
        options: ["Physical discomfort", "Customer frustrations and obstacles", "Business losses", "Employee complaints"],
        correct: 1,
        explanation: "In the Value Proposition Canvas, 'Pains' refer to the frustrations, obstacles, and negative experiences customers face when trying to accomplish their goals."
      }
    ],
    outputDocument: {
      title: "Mission Statement Document",
      type: "document",
      fields: [
        { name: "businessName", label: "Business Name", type: "text" },
        { name: "targetAudience", label: "Who We Serve (Target Audience)", type: "textarea" },
        { name: "whatWeDo", label: "What We Do (Products/Services)", type: "textarea" },
        { name: "howWeDoIt", label: "How We Do It (Unique Approach)", type: "textarea" },
        { name: "missionStatement", label: "Mission Statement", type: "textarea" },
        { name: "visionStatement", label: "Vision Statement", type: "textarea" },
        { name: "coreValues", label: "Core Values (3-5 values)", type: "textarea" },
        { name: "valueProposition", label: "Value Proposition", type: "textarea" },
        { name: "uniqueDifferentiator", label: "What Makes Us Different", type: "textarea" }
      ]
    }
  },
  {
    id: 3,
    title: "Market Research",
    description: "Identifying target market and customer profiles",
    duration: "50 min",
    tokensReward: 120,
    lessons: [
      {
        id: "bsc-3-1",
        title: "Understanding Your Market",
        content: `
# Understanding Your Market

Market research is the foundation of business success. It helps you understand who your customers are, what they need, and how to reach them.

## Why Market Research Matters

### Reduces Risk
- Validates your business idea
- Identifies potential obstacles
- Reveals market opportunities

### Guides Strategy
- Informs product development
- Shapes marketing messages
- Determines pricing

### Saves Money
- Prevents costly mistakes
- Focuses resources effectively
- Improves ROI on marketing

## Types of Market Research

### Primary Research
Data you collect yourself:
- Surveys and questionnaires
- Interviews with potential customers
- Focus groups
- Observation

### Secondary Research
Existing data from other sources:
- Industry reports
- Government statistics
- Competitor analysis
- Academic studies

## Market Size Analysis

### TAM (Total Addressable Market)
The total market demand for your product/service

### SAM (Serviceable Addressable Market)
The portion of TAM you can realistically reach

### SOM (Serviceable Obtainable Market)
The portion of SAM you can capture initially

### Example
- **TAM**: All people who buy coffee ($400B globally)
- **SAM**: Coffee drinkers in your city ($50M)
- **SOM**: Customers you can serve in year 1 ($500K)
        `,
        duration: "15 min"
      },
      {
        id: "bsc-3-2",
        title: "Creating Customer Personas",
        content: `
# Creating Customer Personas

A customer persona is a semi-fictional representation of your ideal customer based on research and data.

## Why Personas Matter

- Humanize your target audience
- Guide product development
- Inform marketing strategies
- Align team understanding

## Persona Components

### Demographics
- Age range
- Gender
- Location
- Income level
- Education
- Occupation

### Psychographics
- Values and beliefs
- Interests and hobbies
- Lifestyle choices
- Personality traits

### Behaviors
- Buying habits
- Media consumption
- Technology usage
- Brand preferences

### Goals & Challenges
- What they want to achieve
- What obstacles they face
- What keeps them up at night
- What success looks like to them

## Persona Template Example

**Name**: "Entrepreneurial Emma"
**Age**: 32
**Occupation**: Marketing Manager considering starting a business
**Income**: $75,000/year
**Location**: Atlanta, GA

**Goals**:
- Start a side business that can become full-time
- Achieve financial independence
- Build something meaningful

**Challenges**:
- Doesn't know where to start
- Worried about legal/financial mistakes
- Limited time due to full-time job
- Needs guidance and support

**How We Help**:
- Step-by-step business formation guidance
- Clear explanations of legal requirements
- Flexible learning schedule
- Community support
        `,
        duration: "18 min"
      },
      {
        id: "bsc-3-3",
        title: "Competitive Analysis",
        content: `
# Competitive Analysis

Understanding your competition is essential for positioning your business effectively.

## Types of Competitors

### Direct Competitors
Offer the same products/services to the same market
- Example: Two pizza restaurants in the same neighborhood

### Indirect Competitors
Solve the same problem differently
- Example: Pizza restaurant vs. meal delivery service

### Potential Competitors
Could enter your market in the future
- Example: Large chain considering your area

## Competitive Analysis Framework

### 1. Identify Competitors
- Google searches for your products/services
- Industry directories
- Social media
- Customer feedback

### 2. Analyze Their Offerings
- Products and services
- Pricing structure
- Quality level
- Unique features

### 3. Evaluate Their Marketing
- Messaging and positioning
- Marketing channels
- Content strategy
- Brand perception

### 4. Assess Strengths & Weaknesses
- What do they do well?
- Where do they fall short?
- What opportunities exist?
- What threats do they pose?

## SWOT Analysis

| Strengths | Weaknesses |
|-----------|------------|
| Internal advantages | Internal limitations |
| What you do well | Areas for improvement |

| Opportunities | Threats |
|---------------|---------|
| External possibilities | External challenges |
| Market gaps | Competitive pressures |

## Finding Your Competitive Advantage

1. **Cost Leadership**: Offer lower prices
2. **Differentiation**: Offer unique value
3. **Focus/Niche**: Serve a specific segment better
        `,
        duration: "17 min"
      }
    ],
    quiz: [
      {
        question: "What does TAM stand for in market analysis?",
        options: ["Target Audience Metrics", "Total Addressable Market", "Total Annual Marketing", "Target Area Market"],
        correct: 1,
        explanation: "TAM stands for Total Addressable Market - the total market demand for your product or service."
      },
      {
        question: "What is a customer persona?",
        options: ["A real customer profile", "A semi-fictional representation of your ideal customer", "Your company's personality", "A marketing slogan"],
        correct: 1,
        explanation: "A customer persona is a semi-fictional representation of your ideal customer based on research and data."
      },
      {
        question: "Which type of competitor offers the same products to the same market?",
        options: ["Indirect competitor", "Direct competitor", "Potential competitor", "Substitute competitor"],
        correct: 1,
        explanation: "Direct competitors offer the same products or services to the same target market."
      },
      {
        question: "What does the 'O' in SWOT analysis represent?",
        options: ["Operations", "Objectives", "Opportunities", "Outcomes"],
        correct: 2,
        explanation: "In SWOT analysis, O stands for Opportunities - external possibilities that could benefit your business."
      },
      {
        question: "Which is an example of primary research?",
        options: ["Reading industry reports", "Conducting customer surveys", "Analyzing government statistics", "Reviewing competitor websites"],
        correct: 1,
        explanation: "Primary research is data you collect yourself, such as surveys, interviews, and focus groups."
      }
    ],
    outputDocument: {
      title: "Customer Persona Document",
      type: "persona",
      fields: [
        { name: "personaName", label: "Persona Name", type: "text" },
        { name: "ageRange", label: "Age Range", type: "text" },
        { name: "occupation", label: "Occupation", type: "text" },
        { name: "incomeLevel", label: "Income Level", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "goals", label: "Goals (What they want to achieve)", type: "textarea" },
        { name: "challenges", label: "Challenges (What obstacles they face)", type: "textarea" },
        { name: "values", label: "Values and Beliefs", type: "textarea" },
        { name: "buyingBehavior", label: "Buying Behavior", type: "textarea" },
        { name: "mediaConsumption", label: "Where They Get Information", type: "textarea" },
        { name: "howWeHelp", label: "How Our Business Helps Them", type: "textarea" },
        { name: "marketSize", label: "Estimated Market Size (TAM/SAM/SOM)", type: "textarea" },
        { name: "topCompetitors", label: "Top 3 Competitors", type: "textarea" },
        { name: "competitiveAdvantage", label: "Our Competitive Advantage", type: "textarea" }
      ]
    }
  },
  {
    id: 4,
    title: "Products & Services",
    description: "Defining offerings and pricing strategies",
    duration: "45 min",
    tokensReward: 110,
    lessons: [
      {
        id: "bsc-4-1",
        title: "Defining Your Offerings",
        content: `
# Defining Your Offerings

Clearly defining your products and services is essential for business success. This module helps you articulate what you sell and how it delivers value.

## Product vs. Service

### Products
- Tangible items customers purchase
- Can be stored and inventoried
- Quality is consistent
- Examples: Physical goods, software, digital downloads

### Services
- Intangible activities performed for customers
- Consumed at time of delivery
- Quality can vary
- Examples: Consulting, coaching, maintenance

### Hybrid Offerings
Many businesses offer both:
- Software + Support
- Products + Installation
- Goods + Training

## Defining Your Core Offering

### Features vs. Benefits

**Features**: What your product/service HAS
- Technical specifications
- Capabilities
- Components

**Benefits**: What your product/service DOES for customers
- Problems solved
- Outcomes achieved
- Value delivered

### Example
**Feature**: "24/7 customer support"
**Benefit**: "Peace of mind knowing help is always available"

## Product/Service Tiers

### Good-Better-Best Strategy
- **Basic**: Entry-level, essential features
- **Standard**: Most popular, balanced value
- **Premium**: Full-featured, highest value

### Benefits of Tiering
- Captures different market segments
- Provides upgrade path
- Increases average order value
- Anchors pricing perception
        `,
        duration: "15 min"
      },
      {
        id: "bsc-4-2",
        title: "Pricing Strategies",
        content: `
# Pricing Strategies

Pricing is one of the most important decisions you'll make. It affects profitability, positioning, and customer perception.

## Pricing Approaches

### Cost-Plus Pricing
Calculate costs + add markup percentage
- Simple to calculate
- Ensures profit margin
- May not reflect market value

### Value-Based Pricing
Price based on perceived value to customer
- Captures more value
- Requires understanding customer
- Can command premium prices

### Competitive Pricing
Price relative to competitors
- Easy to implement
- Market-driven
- Risk of price wars

### Penetration Pricing
Start low to gain market share
- Attracts customers quickly
- Builds volume
- Hard to raise prices later

### Premium Pricing
Price high to signal quality
- Higher margins
- Attracts quality-focused customers
- Requires strong value proposition

## Calculating Your Price

### Cost Analysis
1. **Direct Costs**: Materials, labor, shipping
2. **Indirect Costs**: Rent, utilities, insurance
3. **Desired Profit**: Your target margin

### Price Formula
**Price = (Direct Costs + Indirect Costs + Desired Profit) / Units Sold**

### Example
- Direct costs: $20/unit
- Indirect costs: $5/unit
- Desired profit: $15/unit
- **Price: $40/unit**

## Psychological Pricing

- **Charm Pricing**: $9.99 instead of $10
- **Prestige Pricing**: Round numbers ($100, $500)
- **Bundle Pricing**: Package deals
- **Anchor Pricing**: Show original price crossed out
        `,
        duration: "15 min"
      },
      {
        id: "bsc-4-3",
        title: "Revenue Models",
        content: `
# Revenue Models

Your revenue model defines how your business makes money. Choosing the right model is crucial for sustainability.

## Common Revenue Models

### One-Time Purchase
Customer pays once for product/service
- Simple transaction
- Need continuous new customers
- Examples: Retail, consulting projects

### Subscription/Recurring
Customer pays regularly for ongoing access
- Predictable revenue
- Customer retention focus
- Examples: SaaS, memberships, maintenance contracts

### Freemium
Basic version free, premium features paid
- Low barrier to entry
- Conversion optimization needed
- Examples: Apps, online tools

### Transaction Fee
Take percentage of each transaction
- Scales with volume
- Requires transaction platform
- Examples: Payment processors, marketplaces

### Licensing
Charge for right to use intellectual property
- Passive income potential
- Requires valuable IP
- Examples: Patents, franchises, content

### Advertising
Revenue from displaying ads
- Free for users
- Requires large audience
- Examples: Media, social platforms

## Choosing Your Model

Consider:
1. **Customer preference**: How do they want to pay?
2. **Cash flow needs**: When do you need money?
3. **Competitive landscape**: What's standard in your industry?
4. **Scalability**: Can this model grow?
5. **Lifetime value**: How much will each customer generate?

## Multiple Revenue Streams

Diversify income sources:
- Core product sales
- Add-on services
- Training/education
- Affiliate partnerships
- Licensing
        `,
        duration: "15 min"
      }
    ],
    quiz: [
      {
        question: "What is the difference between a feature and a benefit?",
        options: ["Features are more important than benefits", "Features describe what a product has, benefits describe what it does for customers", "Benefits are technical specifications", "There is no difference"],
        correct: 1,
        explanation: "Features describe what your product/service HAS (specifications), while benefits describe what it DOES for customers (outcomes and value)."
      },
      {
        question: "What is value-based pricing?",
        options: ["Pricing based on production costs", "Pricing based on competitor prices", "Pricing based on perceived value to the customer", "Pricing based on market average"],
        correct: 2,
        explanation: "Value-based pricing sets prices based on the perceived value to the customer, rather than costs or competitor prices."
      },
      {
        question: "What is a freemium revenue model?",
        options: ["Everything is free", "Basic version free, premium features paid", "Free trial then paid", "Advertising-supported"],
        correct: 1,
        explanation: "Freemium offers a basic version for free while charging for premium features or advanced functionality."
      },
      {
        question: "What is charm pricing?",
        options: ["Pricing at round numbers", "Pricing at $9.99 instead of $10", "Bundle pricing", "Premium pricing"],
        correct: 1,
        explanation: "Charm pricing uses prices ending in 9 (like $9.99) because they psychologically appear significantly lower than round numbers."
      }
    ],
    outputDocument: {
      title: "Product/Service Catalog",
      type: "catalog",
      fields: [
        { name: "businessName", label: "Business Name", type: "text" },
        { name: "offering1Name", label: "Offering #1 Name", type: "text" },
        { name: "offering1Description", label: "Offering #1 Description", type: "textarea" },
        { name: "offering1Features", label: "Offering #1 Key Features", type: "textarea" },
        { name: "offering1Benefits", label: "Offering #1 Customer Benefits", type: "textarea" },
        { name: "offering1Price", label: "Offering #1 Price", type: "text" },
        { name: "offering2Name", label: "Offering #2 Name", type: "text" },
        { name: "offering2Description", label: "Offering #2 Description", type: "textarea" },
        { name: "offering2Price", label: "Offering #2 Price", type: "text" },
        { name: "offering3Name", label: "Offering #3 Name", type: "text" },
        { name: "offering3Description", label: "Offering #3 Description", type: "textarea" },
        { name: "offering3Price", label: "Offering #3 Price", type: "text" },
        { name: "pricingStrategy", label: "Pricing Strategy Used", type: "select", options: ["Cost-Plus", "Value-Based", "Competitive", "Penetration", "Premium"] },
        { name: "revenueModel", label: "Primary Revenue Model", type: "select", options: ["One-Time Purchase", "Subscription", "Freemium", "Transaction Fee", "Licensing", "Advertising"] },
        { name: "targetMargin", label: "Target Profit Margin (%)", type: "number" }
      ]
    }
  },
  {
    id: 5,
    title: "Legal Formation",
    description: "Articles of Organization, Operating Agreements",
    duration: "55 min",
    tokensReward: 130,
    lessons: [
      {
        id: "bsc-5-1",
        title: "Formation Documents Overview",
        content: `
# Formation Documents Overview

Every business entity requires specific legal documents for formation. Understanding these documents is essential for proper business setup.

## Key Formation Documents

### Articles of Organization (LLC)
Also called "Certificate of Formation" in some states

**Required Information**:
- LLC name
- Principal office address
- Registered agent name and address
- Member/Manager names (some states)
- Purpose of the business
- Duration (perpetual or specific)

### Articles of Incorporation (Corporation)
**Required Information**:
- Corporation name
- Number of authorized shares
- Registered agent
- Incorporator information
- Purpose statement

### Operating Agreement (LLC)
Internal governance document (not filed with state)

**Key Sections**:
- Member information and ownership percentages
- Capital contributions
- Profit/loss distribution
- Management structure
- Voting rights
- Transfer restrictions
- Dissolution procedures

### Bylaws (Corporation)
Internal governance rules

**Key Sections**:
- Shareholder meetings
- Board of Directors procedures
- Officer roles and duties
- Stock issuance rules
- Amendment procedures

## State-Specific Requirements

Requirements vary by state:
- **Delaware**: Business-friendly, Court of Chancery
- **Wyoming**: Privacy-focused, no state income tax
- **Nevada**: Strong asset protection
- **Your Home State**: Often simplest for local operations
        `,
        duration: "18 min"
      },
      {
        id: "bsc-5-2",
        title: "Operating Agreement Deep Dive",
        content: `
# Operating Agreement Deep Dive

The Operating Agreement is the most important internal document for an LLC. Even single-member LLCs should have one.

## Why You Need an Operating Agreement

### Legal Protection
- Proves LLC is separate from you personally
- Strengthens liability protection
- Required by some states

### Clarity
- Defines member rights and responsibilities
- Prevents disputes
- Establishes procedures

### Flexibility
- Customize management structure
- Define profit distribution
- Set transfer rules

## Key Provisions

### 1. Formation and Purpose
- LLC name and formation date
- Principal place of business
- Business purpose

### 2. Members and Ownership
- Member names and addresses
- Ownership percentages
- Capital contributions

### 3. Management Structure

**Member-Managed**:
- All members participate in decisions
- Good for small LLCs
- Democratic approach

**Manager-Managed**:
- Designated managers run operations
- Members are passive investors
- Good for larger LLCs

### 4. Capital and Distributions
- Initial contributions
- Additional contribution requirements
- Profit/loss allocation
- Distribution timing and amounts

### 5. Voting and Decisions
- Voting rights (usually by ownership %)
- Matters requiring unanimous consent
- Meeting procedures

### 6. Transfer and Exit
- Restrictions on selling membership
- Right of first refusal
- Buy-sell provisions
- Death or disability procedures

### 7. Dissolution
- Events triggering dissolution
- Winding up procedures
- Asset distribution order
        `,
        duration: "20 min"
      },
      {
        id: "bsc-5-3",
        title: "EIN and Business Registration",
        content: `
# EIN and Business Registration

After forming your entity, you need to complete several registration steps before operating.

## Employer Identification Number (EIN)

### What is an EIN?
- Federal tax ID number (like SSN for businesses)
- 9-digit number: XX-XXXXXXX
- Required for most businesses

### When You Need an EIN
- Hiring employees
- Opening business bank account
- Filing certain tax returns
- Applying for business licenses

### How to Get an EIN
1. Go to IRS.gov
2. Complete online application
3. Receive EIN immediately
4. FREE - no cost

### Important Notes
- One EIN per entity
- Cannot transfer EIN to new entity
- Keep EIN letter safe

## Business Licenses and Permits

### Types of Licenses

**Federal Licenses**:
- Alcohol, tobacco, firearms
- Transportation
- Agriculture

**State Licenses**:
- Professional licenses
- Sales tax permit
- State-specific requirements

**Local Licenses**:
- Business license
- Zoning permits
- Health permits
- Signage permits

### Research Requirements
1. Check state business portal
2. Contact local city/county clerk
3. Research industry-specific requirements
4. Consult with attorney if needed

## Business Bank Account

### Why Separate Accounts?
- Maintains liability protection
- Simplifies accounting
- Professional appearance
- Required for LLC protection

### What You Need to Open
- EIN confirmation letter
- Articles of Organization
- Operating Agreement
- Government-issued ID
- Initial deposit

### Account Types
- Business checking
- Business savings
- Merchant services
- Business credit card
        `,
        duration: "17 min"
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of an Operating Agreement?",
        options: ["To register with the state", "To define internal governance and member rights", "To apply for an EIN", "To open a bank account"],
        correct: 1,
        explanation: "An Operating Agreement defines the internal governance of an LLC, including member rights, profit distribution, and management structure."
      },
      {
        question: "What is an EIN?",
        options: ["Employee Insurance Number", "Employer Identification Number", "Entity Insurance Number", "Enterprise ID Number"],
        correct: 1,
        explanation: "EIN stands for Employer Identification Number - it's a federal tax ID number for businesses, similar to a Social Security Number for individuals."
      },
      {
        question: "In a member-managed LLC, who makes business decisions?",
        options: ["Only the registered agent", "All members participate", "Only designated managers", "The state government"],
        correct: 1,
        explanation: "In a member-managed LLC, all members participate in making business decisions, typically voting based on ownership percentage."
      },
      {
        question: "Which document is filed with the state to form an LLC?",
        options: ["Operating Agreement", "Articles of Organization", "Bylaws", "EIN Application"],
        correct: 1,
        explanation: "Articles of Organization (or Certificate of Formation) is the document filed with the state to officially form an LLC."
      },
      {
        question: "Why is it important to have a separate business bank account?",
        options: ["It's required by federal law", "It maintains liability protection and simplifies accounting", "Banks offer better interest rates", "It's only needed for corporations"],
        correct: 1,
        explanation: "A separate business bank account maintains the legal separation between you and your business, protecting your personal assets and simplifying accounting."
      }
    ],
    outputDocument: {
      title: "Draft Legal Documents",
      type: "legal",
      fields: [
        { name: "entityName", label: "Entity Legal Name", type: "text" },
        { name: "entityType", label: "Entity Type", type: "select", options: ["LLC", "Corporation", "Partnership", "Nonprofit"] },
        { name: "stateOfFormation", label: "State of Formation", type: "text" },
        { name: "principalAddress", label: "Principal Business Address", type: "textarea" },
        { name: "registeredAgent", label: "Registered Agent Name", type: "text" },
        { name: "registeredAgentAddress", label: "Registered Agent Address", type: "textarea" },
        { name: "businessPurpose", label: "Business Purpose Statement", type: "textarea" },
        { name: "members", label: "Members/Owners (Name, Address, Ownership %)", type: "textarea" },
        { name: "managementType", label: "Management Type", type: "select", options: ["Member-Managed", "Manager-Managed"] },
        { name: "initialCapital", label: "Initial Capital Contributions", type: "textarea" },
        { name: "profitDistribution", label: "Profit/Loss Distribution Method", type: "textarea" },
        { name: "votingRights", label: "Voting Rights Description", type: "textarea" },
        { name: "fiscalYearEnd", label: "Fiscal Year End Date", type: "text" },
        { name: "dissolutionTerms", label: "Dissolution Terms", type: "textarea" }
      ]
    }
  },
  {
    id: 6,
    title: "Business Plan Assembly",
    description: "Putting it all together",
    duration: "60 min",
    tokensReward: 150,
    isFinal: true,
    lessons: [
      {
        id: "bsc-6-1",
        title: "Business Plan Structure",
        content: `
# Business Plan Structure

A business plan is a comprehensive document that outlines your business strategy, operations, and financial projections.

## Why You Need a Business Plan

### Internal Benefits
- Clarifies your vision and strategy
- Identifies potential challenges
- Sets measurable goals
- Guides decision-making

### External Benefits
- Required for bank loans
- Attracts investors
- Demonstrates credibility
- Supports grant applications

## Standard Business Plan Sections

### 1. Executive Summary
- Business overview
- Mission statement
- Products/services summary
- Financial highlights
- Funding request (if applicable)

### 2. Company Description
- Business structure
- History and background
- Location and facilities
- Unique value proposition

### 3. Market Analysis
- Industry overview
- Target market
- Customer personas
- Competitive analysis
- Market trends

### 4. Organization & Management
- Organizational structure
- Management team
- Board of advisors
- Key personnel

### 5. Products & Services
- Detailed descriptions
- Pricing strategy
- Product lifecycle
- Intellectual property

### 6. Marketing & Sales
- Marketing strategy
- Sales process
- Customer acquisition
- Retention strategies

### 7. Financial Projections
- Revenue forecasts
- Expense budgets
- Cash flow projections
- Break-even analysis

### 8. Funding Request
- Amount needed
- Use of funds
- Future funding needs
- Exit strategy
        `,
        duration: "20 min"
      },
      {
        id: "bsc-6-2",
        title: "Writing Your Executive Summary",
        content: `
# Writing Your Executive Summary

The Executive Summary is the most important section of your business plan. It's often the only part investors read initially.

## Purpose of Executive Summary

- Provides quick overview of entire plan
- Hooks the reader's interest
- Summarizes key points
- Stands alone as a document

## Key Components

### 1. Business Concept (1-2 sentences)
What your business does and for whom

**Example**: "LuvOnPurpose Academy provides comprehensive business formation training and tools for aspiring entrepreneurs, helping them build sustainable businesses and generational wealth."

### 2. Mission Statement
Your purpose and values

### 3. Products/Services Overview
Brief description of offerings

### 4. Target Market
Who you serve and market size

### 5. Competitive Advantage
What makes you different

### 6. Management Team
Key leaders and their qualifications

### 7. Financial Summary
- Current revenue (if existing)
- Projected revenue
- Profitability timeline
- Funding needs

### 8. Funding Request (if applicable)
- Amount requested
- Use of funds
- Return expectations

## Writing Tips

1. **Write it last**: After completing all other sections
2. **Keep it concise**: 1-2 pages maximum
3. **Lead with strength**: Most compelling information first
4. **Use clear language**: Avoid jargon
5. **Include numbers**: Specific metrics and projections
6. **Create urgency**: Why now?
        `,
        duration: "20 min"
      },
      {
        id: "bsc-6-3",
        title: "Finalizing Your Business Plan",
        content: `
# Finalizing Your Business Plan

Now it's time to bring everything together into a cohesive, professional business plan.

## Assembly Checklist

### Documents to Compile
- [ ] Entity Type Selection Worksheet (Module 1)
- [ ] Mission Statement Document (Module 2)
- [ ] Customer Persona Document (Module 3)
- [ ] Product/Service Catalog (Module 4)
- [ ] Draft Legal Documents (Module 5)

### Additional Sections to Add
- [ ] Executive Summary
- [ ] Financial Projections
- [ ] Marketing Strategy
- [ ] Implementation Timeline

## Formatting Guidelines

### Professional Appearance
- Consistent fonts and formatting
- Clear headings and sections
- Page numbers
- Table of contents
- Professional cover page

### Length Guidelines
- **Startup**: 15-25 pages
- **Established Business**: 30-50 pages
- **Executive Summary**: 1-2 pages

### Visual Elements
- Charts and graphs for financials
- Organizational charts
- Product images
- Market data visualizations

## Review Process

### Self-Review
1. Read aloud for flow
2. Check for consistency
3. Verify all numbers
4. Ensure completeness

### External Review
1. Trusted advisor or mentor
2. Industry expert
3. Financial professional
4. Legal review (if needed)

## Next Steps After Completion

1. **File formation documents**
2. **Apply for EIN**
3. **Open business bank account**
4. **Obtain necessary licenses**
5. **Launch marketing efforts**
6. **Begin operations**

## Congratulations!

You've completed the Business Setup Course and created a comprehensive business plan. You now have:
- Clear understanding of business structures
- Defined mission and vision
- Customer personas and market research
- Product/service catalog with pricing
- Draft legal documents
- Complete business plan

**Your next step**: Use these documents to officially form your business and begin operations!
        `,
        duration: "20 min"
      }
    ],
    quiz: [
      {
        question: "Which section of a business plan should be written last?",
        options: ["Company Description", "Executive Summary", "Financial Projections", "Market Analysis"],
        correct: 1,
        explanation: "The Executive Summary should be written last because it summarizes all other sections of the business plan."
      },
      {
        question: "What is the recommended length for a startup business plan?",
        options: ["5-10 pages", "15-25 pages", "50-75 pages", "100+ pages"],
        correct: 1,
        explanation: "A startup business plan is typically 15-25 pages, long enough to be comprehensive but concise enough to be read."
      },
      {
        question: "Which of these is NOT typically included in an Executive Summary?",
        options: ["Business concept", "Detailed employee handbook", "Financial summary", "Competitive advantage"],
        correct: 1,
        explanation: "An Executive Summary includes high-level overviews, not detailed operational documents like employee handbooks."
      },
      {
        question: "What should you do immediately after completing your business plan?",
        options: ["Wait 6 months before taking action", "File formation documents and apply for EIN", "Hire 10 employees", "Rent the largest office available"],
        correct: 1,
        explanation: "After completing your business plan, the next steps are to file formation documents, apply for an EIN, and begin the formal business setup process."
      }
    ],
    outputDocument: {
      title: "Complete Business Plan",
      type: "business_plan",
      fields: [
        { name: "businessName", label: "Business Name", type: "text" },
        { name: "executiveSummary", label: "Executive Summary", type: "textarea" },
        { name: "businessConcept", label: "Business Concept (1-2 sentences)", type: "textarea" },
        { name: "missionStatement", label: "Mission Statement", type: "textarea" },
        { name: "visionStatement", label: "Vision Statement", type: "textarea" },
        { name: "productsServices", label: "Products/Services Overview", type: "textarea" },
        { name: "targetMarket", label: "Target Market Description", type: "textarea" },
        { name: "competitiveAdvantage", label: "Competitive Advantage", type: "textarea" },
        { name: "marketingStrategy", label: "Marketing Strategy", type: "textarea" },
        { name: "managementTeam", label: "Management Team", type: "textarea" },
        { name: "financialSummary", label: "Financial Summary", type: "textarea" },
        { name: "fundingNeeds", label: "Funding Needs (if applicable)", type: "textarea" },
        { name: "implementationTimeline", label: "Implementation Timeline", type: "textarea" },
        { name: "nextSteps", label: "Immediate Next Steps", type: "textarea" }
      ]
    }
  }
];

// Service functions
export async function getBusinessSetupModules() {
  return BUSINESS_SETUP_MODULES;
}

export async function getModuleById(moduleId: number) {
  return BUSINESS_SETUP_MODULES.find(m => m.id === moduleId);
}

export async function getLessonContent(moduleId: number, lessonId: string) {
  const module = BUSINESS_SETUP_MODULES.find(m => m.id === moduleId);
  if (!module) return null;
  return module.lessons.find(l => l.id === lessonId);
}

export async function getModuleQuiz(moduleId: number) {
  const module = BUSINESS_SETUP_MODULES.find(m => m.id === moduleId);
  if (!module) return null;
  return module.quiz;
}

export async function getOutputDocumentTemplate(moduleId: number) {
  const module = BUSINESS_SETUP_MODULES.find(m => m.id === moduleId);
  if (!module) return null;
  return module.outputDocument;
}

export async function calculateQuizScore(moduleId: number, answers: number[]): Promise<{ score: number; passed: boolean; feedback: string[] }> {
  const module = BUSINESS_SETUP_MODULES.find(m => m.id === moduleId);
  if (!module || !module.quiz) {
    return { score: 0, passed: false, feedback: ["Module not found"] };
  }
  
  let correct = 0;
  const feedback: string[] = [];
  
  module.quiz.forEach((q, idx) => {
    if (answers[idx] === q.correct) {
      correct++;
      feedback.push(`✓ Question ${idx + 1}: Correct!`);
    } else {
      feedback.push(`✗ Question ${idx + 1}: ${q.explanation}`);
    }
  });
  
  const score = Math.round((correct / module.quiz.length) * 100);
  const passed = score >= 70;
  
  return { score, passed, feedback };
}

export function getCourseOverview() {
  return {
    title: "Business Setup Course",
    description: "A comprehensive 6-module course covering business formation from entity selection to complete business plan creation.",
    totalModules: BUSINESS_SETUP_MODULES.length,
    totalLessons: BUSINESS_SETUP_MODULES.reduce((acc, m) => acc + m.lessons.length, 0),
    totalDuration: BUSINESS_SETUP_MODULES.reduce((acc, m) => {
      const mins = parseInt(m.duration);
      return acc + (isNaN(mins) ? 0 : mins);
    }, 0) + " min",
    totalTokens: BUSINESS_SETUP_MODULES.reduce((acc, m) => acc + m.tokensReward, 0),
    modules: BUSINESS_SETUP_MODULES.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      duration: m.duration,
      tokensReward: m.tokensReward,
      lessonsCount: m.lessons.length,
      hasQuiz: !!m.quiz,
      outputDocument: m.outputDocument?.title,
      isFinal: m.isFinal || false
    }))
  };
}
