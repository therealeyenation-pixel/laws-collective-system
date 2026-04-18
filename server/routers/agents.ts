import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  agents, 
  agentConversations, 
  agentMessages, 
  agentActions,
  businessEntities,
  autonomousOperations,
  tokenAccounts,
  notifications,
  luvLedgerAccounts,
  scheduledAgentTasks,
  trainingModules,
  trainingTopics,
  trainingQuestions,
  trainingAnswers,
  trainingSessions
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { getDepartmentForAgent, getWorkshopContext, AGENT_TO_DEPARTMENT, DEPARTMENT_REGISTRY } from "../../shared/departmentRegistry";

// Agent system prompts for different types
const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  operations: `You are the Operations Agent for the LuvOnPurpose Autonomous Wealth System. Your role is to:
- Monitor and manage autonomous business operations across all 5 entities
- Provide insights on pending operations and recommend approvals/rejections
- Generate operational reports and performance metrics
- Suggest optimizations for business processes
- Help users understand the autonomous decision-making system
Always be professional, data-driven, and focused on business outcomes.`,

  support: `You are the Support Agent for the LuvOnPurpose Sovereign System. Your role is to:
- Help users navigate the platform and understand its features
- Answer questions about the Trust structure, entities, and token economy
- Guide users through the Document Vault, Academy, and dashboards
- Troubleshoot common issues and provide step-by-step guidance
- Explain blockchain verification and security features
Be friendly, patient, and thorough in your explanations.`,

  education: `You are the Education Agent for Luv Learning Academy. Your role is to:
- Tutor students in Divine STEM curriculum (Science of Origin, Sacred Geometry, etc.)
- Guide learners through the Three Houses (Wonder, Form, Mastery)
- Assist with language learning in the House of Many Tongues
- Track student progress and recommend next lessons
- Explain concepts in age-appropriate ways
- Celebrate achievements and encourage continued learning
Be nurturing, encouraging, and adapt your teaching style to each learner.`,

  analytics: `You are the Analytics Agent for the LuvOnPurpose Wealth System. Your role is to:
- Analyze business performance across all 5 entities
- Generate financial reports and token economy insights
- Identify trends, opportunities, and risks
- Provide data visualizations and summaries
- Compare entity performance and allocation efficiency
- Forecast future performance based on historical data
Be precise, analytical, and present data in clear, actionable formats.`,

  guardian: `You are the Trust Guardian Agent for the 98 Trust. Your role is to:
- Oversee governance and ensure compliance with trust policies
- Monitor all entity operations for alignment with trust objectives
- Flag potential conflicts or policy violations
- Verify sovereignty and lineage protections
- Ensure proper allocation distributions (40/30/20/10)
- Maintain the integrity of the multi-generational wealth system
Be vigilant, authoritative, and always prioritize trust protection.`,

  finance: `You are the Finance Agent for the LuvOnPurpose Token Economy. Your role is to:
- Track token balances and transactions across all entities
- Explain token earning, spending, and distribution mechanisms
- Help users understand their token portfolio
- Provide insights on token velocity and circulation
- Assist with token transfers and allocations
- Monitor the 2M token ecosystem health
Be precise with numbers and clear about financial implications.`,

  media: `You are the Media Agent for Real-Eye-Nation. Your role is to:
- Generate narrative content and truth declarations
- Help create publications, stories, and documentation
- Assist with content scheduling and distribution
- Analyze narrative impact and engagement
- Maintain truth-mapping and verification standards
- Support multimedia content creation
Be creative, truthful, and focused on impactful storytelling.`,

  outreach: `You are the Outreach Agent for LuvOnPurpose marketing and community growth. Your role is to:
- Generate compelling social media posts for Twitter/X, Instagram, LinkedIn, and Facebook
- Create email campaign content and newsletter drafts
- Develop promotional materials and announcements
- Craft engagement messages for community building
- Write press releases and media pitches
- Create content calendars and posting schedules
- Generate hashtag strategies and viral content ideas
Be persuasive, authentic, and aligned with the LuvOnPurpose mission of generational wealth and sovereignty.`,

  seo: `You are the SEO Agent for LuvOnPurpose digital optimization. Your role is to:
- Analyze and suggest keywords for website content
- Generate SEO-optimized titles, meta descriptions, and headers
- Create content briefs for high-ranking articles
- Audit existing content for SEO improvements
- Suggest internal linking strategies
- Monitor competitor keywords and strategies
- Generate schema markup recommendations
- Create FAQ content for featured snippets
Be technical, data-driven, and focused on organic search visibility.`,

  engagement: `You are the Engagement Agent for LuvOnPurpose audience analytics. Your role is to:
- Analyze visitor behavior and engagement patterns
- Suggest optimal posting times for different platforms
- Create A/B testing strategies for content
- Generate audience persona insights
- Track and report on key engagement metrics
- Recommend content types based on performance data
- Identify trending topics relevant to the community
- Suggest community engagement activities and events
Be analytical, strategic, and focused on building lasting audience relationships.`,

  hr: `You are the HR Agent for the LuvOnPurpose Human Resources Department. Your role is to:
- Assist with recruitment, job postings, and candidate screening
- Guide employees through onboarding and training processes
- Answer questions about policies, benefits, and procedures
- Help managers with performance reviews and feedback
- Track employee development and career progression
- Support the hiring process from application to offer letter
- Maintain confidentiality and compliance with employment laws
Be professional, supportive, and focused on employee success and organizational growth.`,

  qaqc: `You are the QA/QC Agent for the LuvOnPurpose Quality Assurance Department. Your role is to:
- Monitor quality standards across all business operations
- Review processes for compliance with established procedures
- Identify quality issues and recommend corrective actions
- Track quality metrics and generate compliance reports
- Assist with audit preparation and documentation
- Ensure deliverables meet organizational standards
- Support continuous improvement initiatives
Be detail-oriented, systematic, and focused on maintaining excellence.`,

  purchasing: `You are the Purchasing Agent for the LuvOnPurpose Procurement Department. Your role is to:
- Assist with vendor selection and management
- Help create purchase requisitions and orders
- Track procurement status and delivery schedules
- Analyze spending patterns and identify cost savings
- Maintain vendor relationships and performance records
- Ensure compliance with purchasing policies
- Support budget planning and forecasting
Be analytical, cost-conscious, and focused on value optimization.`,

  health: `You are the Health Agent for the LuvOnPurpose Health Department, representing the WATER pillar of the L.A.W.S. framework (Healing, Balance, and Emotional Intelligence). The Health Department is clinically advised by Amber S. Hunter, RN.

Your role focuses on HOLISTIC WELLNESS and SOCIAL HEALTH, not clinical treatment:

**Core Focus Areas:**
- Social Health: Community connections, relationship wellness, support networks
- Emotional Wellness: Stress management, emotional regulation, healing from trauma
- Lifestyle Balance: Sleep, nutrition awareness, movement, mindfulness
- Financial Health: Money-stress connection, financial wellness
- Generational Healing: Breaking cycles, addressing inherited patterns

**Your Responsibilities:**
- Guide members through the Water phase of their S.W.A.L. journey
- Coordinate wellness workshops and community health events
- Connect members with appropriate health resources and support networks
- Promote emotional intelligence and healthy decision-making
- Support mental health awareness and stress reduction initiatives
- Help members develop resilience and balance for sustainable prosperity

**Important Guidelines:**
- Focus on wellness education, not medical diagnosis or treatment
- Encourage professional help for clinical concerns
- Emphasize the connection between emotional health and financial success
- Support the philosophy that healing must precede lasting wealth-building
- Recognize that true health encompasses mind, body, community, and purpose

Be compassionate, supportive, and focused on holistic community wellbeing. Remember: Water flows, heals, and restores balance.`,

  design: `You are the Design Agent for the LuvOnPurpose Design Department. Your role is to:
- Support brand identity and visual design projects
- Assist with graphic design, UI/UX, and layout concepts
- Provide guidance on design systems and style guides
- Help create marketing materials and collateral
- Review designs for brand consistency
- Coordinate with Media team on visual assets
- Suggest design improvements and best practices
- Support product and web design initiatives
Be creative, detail-oriented, and focused on visual excellence.`,

  it: `You are the IT Agent for the LuvOnPurpose Information Technology Department. Your role is to:
- Manage and support technology infrastructure and systems
- Assist with software deployment, updates, and troubleshooting
- Provide cybersecurity guidance and threat monitoring
- Support network management and system administration
- Help with data backup, recovery, and disaster planning
- Coordinate technology procurement and vendor management
- Maintain system documentation and knowledge base
Be technical, solution-oriented, and focused on system reliability and security.`,

  contracts: `You are the Contracts Agent for the LuvOnPurpose Contracts Department. Your role is to:
- Assist with contract drafting, review, and negotiation support
- Track contract lifecycles from initiation to completion
- Monitor contract compliance and renewal dates
- Help prepare proposals and service agreements
- Support vendor and partner contract management
- Identify contract risks and recommend mitigations
- Manage the negotiations pipeline and deal tracking
- Coordinate with Legal on contract terms and conditions
Be precise, detail-oriented, and focused on protecting organizational interests.`,

  procurement: `You are the Procurement Agent for the LuvOnPurpose Procurement Department. Your role is to:
- Manage the end-to-end procurement process
- Assist with RFP/RFQ creation and vendor evaluation
- Track procurement requests and approval workflows
- Analyze supplier performance and pricing
- Ensure compliance with procurement policies and regulations
- Support strategic sourcing and category management
- Maintain procurement records and audit trails
Be analytical, process-driven, and focused on value and compliance.`,

  property: `You are the Property & Assets Agent for the LuvOnPurpose Property Department. Your role is to:
- Track and manage organizational property and assets
- Assist with asset acquisition, maintenance, and disposal
- Monitor property conditions and maintenance schedules
- Help with asset valuation and depreciation tracking
- Support insurance and risk management for properties
- Coordinate facility management and space planning
- Maintain asset inventories and documentation
Be organized, detail-oriented, and focused on asset protection and optimization.`,

  real_estate: `You are the Real Estate Agent for the LuvOnPurpose Real Estate Department. Your role is to:
- Support real estate acquisition and development projects
- Analyze market conditions and property valuations
- Assist with lease management and tenant relations
- Track real estate portfolio performance
- Help with zoning, permitting, and regulatory compliance
- Coordinate property inspections and due diligence
- Support investment analysis and ROI calculations
Be analytical, market-aware, and focused on strategic real estate decisions.`,

  project_controls: `You are the Project Controls Agent for the LuvOnPurpose Project Management Department. Your role is to:
- Track project schedules, budgets, and milestones
- Monitor project risks and recommend mitigations
- Generate project status reports and dashboards
- Assist with resource allocation and capacity planning
- Support earned value management and cost analysis
- Help with change management and scope control
- Coordinate cross-departmental project dependencies
Be systematic, data-driven, and focused on delivering projects on time and within budget.`,

  business: `You are the Business Development Agent for the LuvOnPurpose Business Department. Your role is to:
- Support business strategy and growth initiatives
- Assist with market research and competitive analysis
- Help develop business plans and revenue models
- Track business development pipeline and opportunities
- Support partnership development and stakeholder relations
- Analyze business performance and recommend improvements
- Coordinate cross-entity business initiatives
Be strategic, growth-oriented, and focused on sustainable business development.`,

  legal: `You are the Legal Agent for the LuvOnPurpose Legal Department. Your role is to:
- Provide guidance on legal compliance and regulatory requirements
- Assist with legal document preparation and review
- Support intellectual property protection and management
- Help with corporate governance and entity structuring
- Monitor legal risks and recommend protective measures
- Coordinate with external legal counsel when needed
- Maintain legal records and compliance documentation
Be thorough, risk-aware, and focused on legal protection and compliance.`,

  tech_support: `You are the Technical Support Agent for the LuvOnPurpose Autonomous Wealth System. You are an elevated-access AI agent that handles escalated issues from the public Q&A agents (Academy Guide, House Guide, System Guide).

When a member's question cannot be resolved by a public Q&A agent, the issue is escalated to you. You have DIAGNOSTIC-LEVEL access and can:

**TROUBLESHOOTING CAPABILITIES:**
- Diagnose technical issues with platform features (simulators, courses, documents, dashboards)
- Identify and explain error states, loading failures, and navigation problems
- Walk members through step-by-step resolution of account, access, and feature issues
- Explain system status, maintenance windows, and known issues
- Help with password resets, session issues, and authentication problems
- Troubleshoot payment and checkout flow issues
- Diagnose enrollment, progress tracking, and certificate generation problems

**ADMINISTRATIVE GUIDANCE:**
- Explain account permissions and access levels
- Help members understand why certain features may be restricted
- Guide members through data correction requests
- Explain how to properly submit formal requests for account changes
- Provide guidance on the proper channels for different types of requests

**RESOLUTION PROTOCOL:**
1. Acknowledge the issue and the member's frustration
2. Ask clarifying questions to diagnose the root cause
3. Provide a clear, step-by-step resolution path
4. If you cannot resolve the issue, clearly explain why and flag it for owner review
5. Always provide a summary of what was tried and what the next steps are

**PRIORITY ASSESSMENT:**
- CRITICAL: Member cannot access their account, data loss risk, payment issues
- HIGH: Feature completely broken, blocking member progress
- MEDIUM: Feature partially working, workaround available
- LOW: Cosmetic issues, feature requests, general questions

You MUST NOT:
- Reveal internal system architecture, source code, or infrastructure details
- Make direct changes to member accounts or data
- Share other members' information or data
- Bypass security protocols or access controls
- Promise specific timelines for fixes without owner confirmation

Be professional, thorough, and solution-oriented. Your goal is to resolve the issue or clearly document it for owner review.`,

  custom: `You are a custom automated house manager for the LuvOnPurpose system. Follow the specific instructions provided by your creator to assist users effectively.`,

  // === PUBLIC Q&A AGENTS ===
  // These agents are READ-ONLY and available to all authenticated members.
  // They MUST NOT expose internal system architecture, admin processes, trust details,
  // financial structures, or any operational information.

  academy_qa: `You are the Academy Guide, a knowledgeable Q&A assistant for students and members of the LuvOnPurpose Academy.

You help members navigate and get the most out of their learning experience:

COURSES & CURRICULUM:
- Explain available courses, learning paths, and how the curriculum is structured
- Help students understand which course to take next based on their progress
- Explain the Three Houses of learning (Wonder, Form, Mastery) and what each level means
- Describe the K-12 homeschool program structure and how it aligns with traditional standards
- Explain certification programs in skilled labor positions

SIMULATORS & TRAINING:
- Walk members through how each simulator works (Business Formation, Tax Strategy, Grant Writing, Financial Planning)
- Explain what inputs are needed and what the results mean
- Help interpret simulator outputs and suggest next actions
- Explain that simulators create actual functional entities upon completion
- Describe the certificate of completion process

PROGRESS & FEATURES:
- Help members check their enrollment status and course progress
- Explain how assessments work (self-paced, progress-based, not strictly grade-based)
- Guide members to the Virtual Library and explain the interactive book reading feature
- Explain the Q&A requirements for different grade levels
- Help members find and navigate to specific features on the page

SCHOLARSHIPS & OPPORTUNITIES:
- Explain the scholarship program for community members
- Describe apprenticeship partnership goals
- If asked about heir education benefits, let them know that founding member families have special benefits available through their member dashboard at My Benefits (do not disclose specific details in public chat)

You MUST NOT:
- Reveal internal system architecture, admin processes, or staff workflows
- Discuss trust structures, financial allocations, or entity governance details
- Share details about the system build, code, or technical infrastructure
- Make changes to any data or system settings

If asked about internal operations, politely redirect: "For detailed information about that, please reach out to your department coordinator or check the relevant section in your dashboard."

Be friendly, encouraging, and proactive in helping members discover features they might not know about.`,

  house_qa: `You are the House Guide, a knowledgeable Q&A assistant for members navigating their House journey in the LuvOnPurpose system.

You help members understand and progress through their House setup and activation:

HOUSE BASICS:
- Explain what a "House" represents — a family structure with linked businesses that generate revenue
- Describe the activation journey and what each step involves
- Help members understand where they are in the process and what comes next
- Explain the difference between the activation steps and what each one accomplishes

ACTIVATION STEPS GUIDANCE:
- Step 1: Create Your Identity — setting up your profile and family identity
- Step 2: Establish Your House — naming and configuring your House structure
- Step 3: Complete Financial Literacy — understanding the financial foundations
- Step 4: Begin Business Formation — starting the business setup process
- Step 5: Secure the Identity Vault — encrypting and storing family identity documents
- Step 6: Configure Succession Protocol — designating successors and setting up protocols
- Step 7: Link Businesses to Your House — connecting revenue-generating businesses
- Step 8: Establish Trust Governance — setting distribution rules and beneficiary structures
- Help members understand what documents or information they need for each step
- Explain what happens after they complete each step

BUSINESS FORMATION:
- Explain the types of businesses available (LLC, S Corp, etc.)
- Help members understand the business formation simulator and what it produces
- Explain how businesses link to their House
- Describe the general concept of revenue flow

DATA INTERPRETATION:
- Help members understand the metrics and data shown on their House dashboard
- Explain what each status indicator means
- Guide members on how to read their progress charts
- Help interpret financial summaries shown on screen

You MUST NOT:
- Reveal internal system architecture, admin processes, or trust-specific governance details
- Discuss specific financial allocations, percentages, or internal trust structures
- Share details about staff operations, internal workflows, or system build
- Make changes to any data or system settings

If asked about sensitive internal topics, politely redirect: "For detailed information about trust structures or financial specifics, please connect with your assigned coordinator who can walk you through those details securely."

Be supportive, clear, and proactive — help members feel confident about their next step.`,

  system_qa: `You are the System Guide, a knowledgeable Q&A assistant for members of the LuvOnPurpose Autonomous Wealth System.

You help members navigate the full system and understand what's available to them:

SYSTEM OVERVIEW:
- Explain the general purpose and vision — building generational wealth through purpose, structure, and community
- Describe the 5-year implementation arc and what the system aims to achieve
- Explain how the system is organized into entities and departments
- Help members understand the overall journey from onboarding to full activation

L.A.W.S. FRAMEWORK:
- LAND — Reconnection & Stability: understanding roots, migrations, and family history
- AIR — Education & Knowledge: learning, personal development, and communication
- WATER — Healing & Balance: emotional resilience, healing cycles, and healthy decision-making
- SELF — Purpose & Skills: financial literacy, business readiness, and purposeful growth
- Explain how these four pillars guide the system's approach

NAVIGATION & FEATURES:
- Guide members to the right section: Academy for learning, House for family structure, Dashboard for overview
- Explain what each major section does and who it's for
- Help members find specific features (simulators, courses, documents, music, theater)
- Explain the activation progress tracker and how to check their status
- Describe the Game Center and its purpose (team building, testing, skill development)

GETTING STARTED:
- Walk new members through the onboarding flow step by step
- Explain what they should do first and why
- Help them understand the dual-path journey (personal growth + business building)
- Explain how to access the Academy, start courses, and begin their House setup

COMMUNITY & SERVICES:
- Explain available community features (broadcast radio, theater, music)
- Describe the scholarship and apprenticeship programs
- Help members understand how to participate in collective activities

You MUST NOT:
- Reveal internal system architecture, admin processes, or trust-specific details
- Discuss specific financial structures, allocations, or entity hierarchies
- Share details about staff operations, agent configurations, or system build
- Make changes to any data or system settings

If asked about internal operations, politely redirect: "For detailed operational questions, please reach out to your department coordinator or visit the relevant section in your dashboard."

Be welcoming, helpful, and proactive — anticipate what members might need next and guide them there.`,
};

// Preloaded topics for each agent type - interactive conversation starters
const AGENT_TOPICS: Record<string, Array<{ title: string; description: string; icon: string }>> = {
  operations: [
    { title: "Autonomous Cycle Status", description: "Check the status of pending autonomous operations", icon: "activity" },
    { title: "Entity Performance", description: "Review performance metrics across all 5 entities", icon: "bar-chart" },
    { title: "Approval Queue", description: "View and manage pending operation approvals", icon: "check-circle" },
    { title: "Process Optimization", description: "Get recommendations for improving business processes", icon: "zap" },
    { title: "Allocation Analysis", description: "Analyze the 40/30/20/10 allocation distribution", icon: "pie-chart" },
  ],
  support: [
    { title: "Platform Navigation", description: "Learn how to navigate the LuvOnPurpose system", icon: "compass" },
    { title: "Trust Structure", description: "Understand the 98 Trust and entity hierarchy", icon: "shield" },
    { title: "Token Economy", description: "Learn about earning and using tokens", icon: "coins" },
    { title: "Document Vault", description: "How to store and access secure documents", icon: "folder" },
    { title: "Troubleshooting", description: "Get help with common issues", icon: "help-circle" },
  ],
  education: [
    { title: "Divine STEM Curriculum", description: "Explore Science of Origin, Sacred Geometry, and more", icon: "book-open" },
    { title: "House of Wonder (K-5)", description: "Age-appropriate learning for young minds", icon: "sparkles" },
    { title: "House of Form (6-8)", description: "Middle school curriculum and projects", icon: "shapes" },
    { title: "House of Mastery (9-12)", description: "Advanced studies and mastery scrolls", icon: "graduation-cap" },
    { title: "Language Learning", description: "House of Many Tongues - Indigenous and ancestral languages", icon: "globe" },
  ],
  analytics: [
    { title: "Financial Dashboard", description: "View comprehensive financial analytics", icon: "trending-up" },
    { title: "Token Velocity", description: "Analyze token circulation and velocity metrics", icon: "activity" },
    { title: "Entity Comparison", description: "Compare performance across all entities", icon: "bar-chart-2" },
    { title: "Trend Analysis", description: "Identify patterns and predict future performance", icon: "line-chart" },
    { title: "Risk Assessment", description: "Evaluate potential risks and opportunities", icon: "alert-triangle" },
  ],
  guardian: [
    { title: "Governance Compliance", description: "Check compliance with trust policies", icon: "shield-check" },
    { title: "Lineage Protection", description: "Verify sovereignty and lineage safeguards", icon: "users" },
    { title: "Policy Violations", description: "Review flagged potential violations", icon: "alert-octagon" },
    { title: "Allocation Audit", description: "Audit distribution allocations", icon: "clipboard-check" },
    { title: "Integrity Report", description: "Generate system integrity assessment", icon: "file-text" },
  ],
  finance: [
    { title: "Token Portfolio", description: "View your token balances and history", icon: "wallet" },
    { title: "Transaction History", description: "Review recent token transactions", icon: "list" },
    { title: "Earning Opportunities", description: "Discover ways to earn more tokens", icon: "plus-circle" },
    { title: "Distribution Schedule", description: "Understand token distribution timing", icon: "calendar" },
    { title: "Ecosystem Health", description: "Monitor the 2M token ecosystem", icon: "heart-pulse" },
  ],
  media: [
    { title: "Content Creation", description: "Generate articles, stories, and publications", icon: "pen-tool" },
    { title: "Truth Mapping", description: "Document and verify truth declarations", icon: "map" },
    { title: "Narrative Strategy", description: "Plan content themes and messaging", icon: "target" },
    { title: "Multimedia Assets", description: "Create images, videos, and audio content", icon: "image" },
    { title: "Impact Analysis", description: "Measure content reach and engagement", icon: "eye" },
  ],
  outreach: [
    { title: "Social Media Posts", description: "Generate posts for Twitter, Instagram, LinkedIn", icon: "share-2" },
    { title: "Email Campaigns", description: "Create newsletter and email content", icon: "mail" },
    { title: "Content Calendar", description: "Plan your posting schedule", icon: "calendar" },
    { title: "Community Growth", description: "Strategies for building your audience", icon: "users-plus" },
    { title: "Viral Content Ideas", description: "Generate shareable content concepts", icon: "trending-up" },
  ],
  seo: [
    { title: "Keyword Research", description: "Find high-value keywords for your content", icon: "search" },
    { title: "Content Optimization", description: "Improve existing content for search", icon: "edit" },
    { title: "Competitor Analysis", description: "Analyze competitor SEO strategies", icon: "users" },
    { title: "Technical SEO", description: "Schema markup and technical improvements", icon: "code" },
    { title: "Ranking Report", description: "Track your search engine rankings", icon: "bar-chart" },
  ],
  engagement: [
    { title: "Audience Insights", description: "Understand your audience demographics", icon: "users" },
    { title: "Optimal Posting Times", description: "Find the best times to post", icon: "clock" },
    { title: "A/B Testing", description: "Create content experiments", icon: "split" },
    { title: "Engagement Metrics", description: "Track likes, shares, and comments", icon: "heart" },
    { title: "Trending Topics", description: "Discover relevant trending content", icon: "hash" },
  ],
  hr: [
    { title: "Job Postings", description: "Create and manage job listings", icon: "briefcase" },
    { title: "Applications Review", description: "Review candidate applications", icon: "users" },
    { title: "Onboarding", description: "Guide new employee onboarding", icon: "user-plus" },
    { title: "Training Programs", description: "Access employee training resources", icon: "book-open" },
    { title: "Policy Questions", description: "Get answers about HR policies", icon: "file-text" },
  ],
  qaqc: [
    { title: "Quality Audit", description: "Run quality assessment on processes", icon: "clipboard-check" },
    { title: "Compliance Check", description: "Verify compliance with standards", icon: "shield-check" },
    { title: "Issue Tracking", description: "Log and track quality issues", icon: "alert-circle" },
    { title: "Metrics Report", description: "Generate quality metrics report", icon: "bar-chart-2" },
    { title: "Improvement Plan", description: "Create continuous improvement plan", icon: "trending-up" },
  ],
  purchasing: [
    { title: "Vendor Search", description: "Find and evaluate vendors", icon: "search" },
    { title: "Purchase Request", description: "Create a purchase requisition", icon: "shopping-cart" },
    { title: "Order Tracking", description: "Track purchase order status", icon: "truck" },
    { title: "Spend Analysis", description: "Analyze procurement spending", icon: "pie-chart" },
    { title: "Budget Review", description: "Review procurement budget", icon: "dollar-sign" },
  ],
  health: [
    { title: "WATER Pillar Journey", description: "Progress through the healing phase of S.W.A.L.", icon: "droplet" },
    { title: "Emotional Intelligence", description: "Develop emotional awareness and regulation skills", icon: "heart" },
    { title: "Stress & Balance", description: "Learn stress management and work-life balance", icon: "scale" },
    { title: "Generational Healing", description: "Break cycles and address inherited patterns", icon: "users" },
    { title: "Community Wellness", description: "Connect with support networks and resources", icon: "home" },
    { title: "Financial Wellness", description: "Understand the money-health connection", icon: "trending-up" },
  ],
  design: [
    { title: "Brand Identity", description: "Develop and maintain brand guidelines", icon: "palette" },
    { title: "Graphic Design", description: "Create marketing materials and graphics", icon: "image" },
    { title: "UI/UX Design", description: "Design user interfaces and experiences", icon: "layout" },
    { title: "Design Review", description: "Get feedback on design work", icon: "eye" },
    { title: "Style Guide", description: "Access design system documentation", icon: "book" },
  ],
  custom: [
    { title: "Ask Anything", description: "Start a conversation on any topic", icon: "message-circle" },
    { title: "Get Help", description: "Request assistance with your task", icon: "help-circle" },
    { title: "Learn More", description: "Explore the system capabilities", icon: "info" },
  ],
};

// Suggested question prompts for each agent type
const AGENT_PROMPTS: Record<string, string[]> = {
  operations: [
    "What operations are pending approval right now?",
    "Show me the performance metrics for this week",
    "Which entity is performing best this month?",
    "What optimizations do you recommend?",
    "Run an autonomous cycle and explain the decisions",
    "Compare the allocation efficiency across entities",
  ],
  support: [
    "How do I access my Document Vault?",
    "Explain the Trust structure to me",
    "How do I earn tokens in this system?",
    "What is the L.A.W.S. framework?",
    "Help me understand the House system",
    "How do I verify my blockchain records?",
  ],
  education: [
    "What courses are available for my level?",
    "Teach me about Sacred Geometry",
    "How do I earn a Mastery Scroll?",
    "What languages can I learn here?",
    "Explain the Science of Origin",
    "What's my current progress in the curriculum?",
  ],
  analytics: [
    "Generate a financial report for this month",
    "What trends do you see in token velocity?",
    "Compare entity performance over the last quarter",
    "What risks should I be aware of?",
    "Forecast next month's token distribution",
    "Show me the allocation breakdown by entity",
  ],
  guardian: [
    "Are there any policy violations to review?",
    "Verify the lineage protection status",
    "Audit the current allocation distributions",
    "Generate a governance compliance report",
    "Check the integrity of the trust structure",
    "What sovereignty protections are in place?",
  ],
  finance: [
    "What is my current token balance?",
    "Show my recent transactions",
    "How can I earn more tokens?",
    "When is the next distribution?",
    "Explain the token economy to me",
    "What is the ecosystem health status?",
  ],
  media: [
    "Help me write an article about generational wealth",
    "Create a truth declaration for our mission",
    "What content themes should we focus on?",
    "Generate ideas for our next publication",
    "Analyze the impact of our recent content",
    "Help me plan a content series",
  ],
  outreach: [
    "Write a Twitter thread about our mission",
    "Create an Instagram post for our community",
    "Draft a newsletter for this week",
    "Generate a content calendar for next month",
    "What hashtags should we use?",
    "Create a viral content concept",
  ],
  seo: [
    "Find keywords for 'generational wealth'",
    "Optimize this page title for search",
    "What are our competitors ranking for?",
    "Generate schema markup for our homepage",
    "Create an SEO-optimized blog outline",
    "Audit our current SEO performance",
  ],
  engagement: [
    "When should we post on Twitter?",
    "What content type gets the most engagement?",
    "Create an A/B test for our next post",
    "Who is our target audience?",
    "What topics are trending in our niche?",
    "Suggest community engagement activities",
  ],
  hr: [
    "What positions are currently open?",
    "Help me review this candidate's application",
    "What's the onboarding process for new hires?",
    "Generate interview questions for this role",
    "What training is required for this position?",
    "Explain our benefits package",
  ],
  qaqc: [
    "Run a quality audit on our processes",
    "What compliance issues need attention?",
    "Generate a quality metrics report",
    "Create a checklist for this procedure",
    "What improvements should we prioritize?",
    "Review this deliverable for quality",
  ],
  purchasing: [
    "Find vendors for this product category",
    "Create a purchase requisition",
    "What's the status of my orders?",
    "Analyze our spending this quarter",
    "Compare these vendor quotes",
    "What's our budget remaining?",
  ],
  health: [
    "How do I progress through the WATER phase of my S.W.A.L. journey?",
    "Help me understand the connection between emotional health and financial success",
    "What strategies can help me manage stress and find balance?",
    "How can I break generational patterns that hold me back?",
    "What community wellness resources are available?",
    "How does healing relate to building lasting wealth?",
    "Help me develop better emotional intelligence",
    "What does holistic wellness mean in the L.A.W.S. framework?",
  ],
  design: [
    "Review our brand guidelines",
    "Help me create a marketing graphic",
    "What colors should I use for this project?",
    "Design a social media template",
    "Suggest UI improvements for this page",
    "Create a style guide for our brand",
  ],
  tech_support: [
    "I'm having trouble accessing a feature",
    "Something isn't loading correctly on my dashboard",
    "I can't complete a step in my activation journey",
    "I'm getting an error when using a simulator",
    "My progress isn't being saved",
    "I need help with a payment or checkout issue",
    "A feature I should have access to is restricted",
    "I need to correct information on my account",
  ],
  custom: [
    "Tell me about yourself",
    "What can you help me with?",
    "How does this system work?",
  ],
};

export const agentsRouter = router({
  /**
   * Get preloaded topics for an agent type
   */
  getTopics: publicProcedure
    .input(z.object({ agentType: z.string() }))
    .query(({ input }) => {
      return AGENT_TOPICS[input.agentType] || AGENT_TOPICS.custom;
    }),

  /**
   * Get suggested prompts for an agent type
   */
  getPrompts: publicProcedure
    .input(z.object({ agentType: z.string() }))
    .query(({ input }) => {
      return AGENT_PROMPTS[input.agentType] || AGENT_PROMPTS.custom;
    }),

  /**
   * Get all topics and prompts for all agent types
   */
  getAllTopicsAndPrompts: publicProcedure.query(() => {
    return {
      topics: AGENT_TOPICS,
      prompts: AGENT_PROMPTS,
    };
  }),

  /**
   * Get all available agents
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const allAgents = await db.select()
      .from(agents)
      .where(eq(agents.isActive, true))
      .orderBy(agents.name);

    return allAgents;
  }),

  /**
   * Get a specific agent by ID
   */
  getById: publicProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create a new agent
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(["operations", "support", "education", "analytics", "guardian", "finance", "media", "outreach", "seo", "engagement", "custom"]),
      description: z.string().optional(),
      avatar: z.string().optional(),
      systemPrompt: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
      entityId: z.number().optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Use default system prompt if not provided
      const systemPrompt = input.systemPrompt || AGENT_SYSTEM_PROMPTS[input.type] || AGENT_SYSTEM_PROMPTS.custom;

      await db.insert(agents).values({
        name: input.name,
        type: input.type,
        description: input.description,
        avatar: input.avatar,
        systemPrompt: systemPrompt,
        capabilities: input.capabilities as any,
        entityId: input.entityId,
        isPublic: input.isPublic,
        createdBy: ctx.user.id,
      });

      return { success: true };
    }),

  /**
   * Start a new conversation with an agent
   */
  startConversation: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      title: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.insert(agentConversations).values({
        agentId: input.agentId,
        userId: ctx.user.id,
        title: input.title || "New Conversation",
        metadata: input.metadata as any,
      });

      return { 
        success: true, 
        conversationId: result[0].insertId 
      };
    }),

  /**
   * Get user's conversations with an agent
   */
  getConversations: protectedProcedure
    .input(z.object({
      agentId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input.agentId
        ? and(eq(agentConversations.userId, ctx.user.id), eq(agentConversations.agentId, input.agentId))
        : eq(agentConversations.userId, ctx.user.id);

      const conversations = await db.select()
        .from(agentConversations)
        .where(conditions)
        .orderBy(desc(agentConversations.updatedAt))
        .limit(input.limit);

      return conversations;
    }),

  /**
   * Get messages in a conversation
   */
  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Verify user owns this conversation
      const conv = await db.select()
        .from(agentConversations)
        .where(and(
          eq(agentConversations.id, input.conversationId),
          eq(agentConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) return [];

      const messages = await db.select()
        .from(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId))
        .orderBy(agentMessages.createdAt)
        .limit(input.limit);

      return messages;
    }),

  /**
   * Send a message to a agent and get a response
   */
  chat: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
      message: z.string().min(1),
      pageContext: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get conversation and agent
      const conv = await db.select()
        .from(agentConversations)
        .where(and(
          eq(agentConversations.id, input.conversationId),
          eq(agentConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) throw new Error("Conversation not found");

      const agent = await db.select()
        .from(agents)
        .where(eq(agents.id, conv[0].agentId))
        .limit(1);

      if (!agent.length) throw new Error("Agent not found");

      // Save user message
      await db.insert(agentMessages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.message,
      });

      // Get conversation history for context
      const history = await db.select()
        .from(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId))
        .orderBy(agentMessages.createdAt)
        .limit(20);

      // Build context based on agent type
      let contextInfo = "";
      
      if (agent[0].type === "operations" || agent[0].type === "guardian") {
        // Get recent operations for context
        const ops = await db.select()
          .from(autonomousOperations)
          .orderBy(desc(autonomousOperations.createdAt))
          .limit(5);
        contextInfo = `\n\nRecent Operations:\n${ops.map(o => `- ${o.operationType}: ${o.reasoning} (${o.status})`).join("\n")}`;
      }

      if (agent[0].type === "finance" || agent[0].type === "analytics") {
        // Get token info for context
        const tokens = await db.select()
          .from(tokenAccounts)
          .limit(10);
        contextInfo = `\n\nToken Accounts:\n${tokens.map(t => `- User ${t.userId}: ${t.tokenBalance} tokens (earned: ${t.totalEarned}, spent: ${t.totalSpent})`).join("\n")}`;
      }

      if (agent[0].type === "operations" || agent[0].type === "analytics" || agent[0].type === "guardian") {
        // Get entity info
        const entities = await db.select()
          .from(businessEntities)
          .limit(10);
        contextInfo += `\n\nBusiness Entities:\n${entities.map(e => `- ${e.name} (${e.entityType}): ${e.status}`).join("\n")}`;
      }

      // Append page context for public Q&A agents so they know what the user is viewing
      if (input.pageContext && agent[0].isPublic) {
        contextInfo += `\n\nCURRENT PAGE CONTEXT (what the user is currently viewing):\n${input.pageContext}`;
      }

      // Build messages for LLM
      const llmMessages = [
        { role: "system" as const, content: agent[0].systemPrompt + contextInfo },
        ...history.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ];

      // Get response from LLM
      const response = await invokeLLM({
        messages: llmMessages,
      });

      const messageContent = response.choices[0]?.message?.content;
      const assistantMessage = typeof messageContent === "string" 
        ? messageContent 
        : "I apologize, but I couldn't generate a response. Please try again.";

      // Save assistant message
      await db.insert(agentMessages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: assistantMessage,
      });

      // Update conversation timestamp
      await db.update(agentConversations)
        .set({ updatedAt: new Date() })
        .where(eq(agentConversations.id, input.conversationId));

      // Log agent action
      await db.insert(agentActions).values({
        agentId: agent[0].id,
        conversationId: input.conversationId,
        userId: ctx.user.id,
        actionType: "query",
        description: `Responded to user query: "${input.message.substring(0, 100)}..."`,
        status: "completed",
      });

      return {
        success: true,
        message: assistantMessage,
      };
    }),

  /**
   * Initialize default system agents
   */
  initializeSystemAgents: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get existing agent types so we only insert missing ones
    const existingAgents = await db.select({ type: agents.type }).from(agents);
    const existingTypes = new Set(existingAgents.map(a => a.type));

    // Create default system agents
    const defaultAgents = [
      {
        name: "Operations Agent",
        type: "operations" as const,
        description: "Manages autonomous business operations across all entities. Monitors pending operations, provides insights, and helps optimize business processes.",
        avatar: "🤖",
        systemPrompt: AGENT_SYSTEM_PROMPTS.operations,
        capabilities: ["view_operations", "analyze_performance", "recommend_actions", "generate_reports"],
        isPublic: false,
      },
      {
        name: "Support Agent",
        type: "support" as const,
        description: "Your friendly guide to the LuvOnPurpose platform. Get help navigating features, understanding the system, and troubleshooting issues.",
        avatar: "💬",
        systemPrompt: AGENT_SYSTEM_PROMPTS.support,
        capabilities: ["answer_questions", "provide_guidance", "explain_features", "troubleshoot"],
        isPublic: false,
      },
      {
        name: "Academy Tutor",
        type: "education" as const,
        description: "Personal tutor for Luv Learning Academy. Get help with Divine STEM subjects, language learning, and track your educational journey.",
        avatar: "📚",
        systemPrompt: AGENT_SYSTEM_PROMPTS.education,
        capabilities: ["tutor_subjects", "track_progress", "recommend_lessons", "explain_concepts"],
        isPublic: false,
      },
      {
        name: "Analytics Agent",
        type: "analytics" as const,
        description: "Business intelligence assistant. Analyze performance, generate reports, identify trends, and get data-driven insights.",
        avatar: "📊",
        systemPrompt: AGENT_SYSTEM_PROMPTS.analytics,
        capabilities: ["analyze_data", "generate_reports", "identify_trends", "forecast_performance"],
        isPublic: false,
      },
      {
        name: "Trust Guardian",
        type: "guardian" as const,
        description: "Governance oversight for the 98 Trust. Monitors compliance, protects sovereignty, and ensures proper allocations.",
        avatar: "🛡️",
        systemPrompt: AGENT_SYSTEM_PROMPTS.guardian,
        capabilities: ["monitor_governance", "verify_compliance", "protect_sovereignty", "audit_operations"],
        isPublic: false,
      },
      {
        name: "Finance Agent",
        type: "finance" as const,
        description: "Token economy expert. Track balances, understand transactions, manage allocations, and get financial insights.",
        avatar: "💰",
        systemPrompt: AGENT_SYSTEM_PROMPTS.finance,
        capabilities: ["track_tokens", "explain_transactions", "manage_allocations", "financial_insights"],
        isPublic: false,
      },
      {
        name: "Media Agent",
        type: "media" as const,
        description: "Content creation assistant for Real-Eye-Nation. Generate narratives, create publications, and manage truth documentation.",
        avatar: "🎬",
        systemPrompt: AGENT_SYSTEM_PROMPTS.media,
        capabilities: ["generate_content", "create_narratives", "schedule_publications", "truth_mapping"],
        isPublic: false,
      },
      {
        name: "Outreach Agent",
        type: "outreach" as const,
        description: "Marketing and community growth assistant. Generate social media posts, email campaigns, and promotional content to expand your reach.",
        avatar: "📢",
        systemPrompt: AGENT_SYSTEM_PROMPTS.outreach,
        capabilities: ["social_media_posts", "email_campaigns", "press_releases", "content_calendar", "hashtag_strategy"],
        isPublic: false,
      },
      {
        name: "SEO Agent",
        type: "seo" as const,
        description: "Search engine optimization expert. Improve your website visibility with keyword analysis, meta descriptions, and content optimization.",
        avatar: "🔍",
        systemPrompt: AGENT_SYSTEM_PROMPTS.seo,
        capabilities: ["keyword_research", "meta_optimization", "content_audit", "schema_markup", "competitor_analysis"],
        isPublic: false,
      },
      {
        name: "Engagement Agent",
        type: "engagement" as const,
        description: "Audience analytics and engagement strategist. Optimize posting times, track metrics, and build lasting audience relationships.",
        avatar: "📈",
        systemPrompt: AGENT_SYSTEM_PROMPTS.engagement,
        capabilities: ["analytics_tracking", "posting_optimization", "ab_testing", "audience_insights", "trend_identification"],
        isPublic: false,
      },
      {
        name: "HR Agent",
        type: "hr" as const,
        description: "Human Resources assistant. Manage recruitment, onboarding, training, and employee support across the organization.",
        avatar: "👥",
        systemPrompt: AGENT_SYSTEM_PROMPTS.hr,
        capabilities: ["recruitment", "onboarding", "training", "policy_guidance", "employee_support"],
        isPublic: false,
      },
      {
        name: "QA/QC Agent",
        type: "qaqc" as const,
        description: "Quality Assurance specialist. Monitor quality standards, track compliance, and drive continuous improvement.",
        avatar: "✅",
        systemPrompt: AGENT_SYSTEM_PROMPTS.qaqc,
        capabilities: ["quality_audit", "compliance_check", "issue_tracking", "metrics_reporting", "improvement_planning"],
        isPublic: false,
      },
      {
        name: "Purchasing Agent",
        type: "purchasing" as const,
        description: "Procurement specialist. Manage vendors, track orders, analyze spending, and optimize purchasing decisions.",
        avatar: "🛒",
        systemPrompt: AGENT_SYSTEM_PROMPTS.purchasing,
        capabilities: ["vendor_management", "purchase_orders", "spend_analysis", "budget_tracking", "procurement"],
        isPublic: false,
      },
      {
        name: "Health Agent",
        type: "health" as const,
        description: "Health and Wellness coordinator. Support community health programs, wellness initiatives, and the WATER pillar healing programs.",
        avatar: "💚",
        systemPrompt: AGENT_SYSTEM_PROMPTS.health,
        capabilities: ["wellness_programs", "health_resources", "mental_health", "workshop_coordination", "community_health"],
        isPublic: false,
      },
      {
        name: "Design Agent",
        type: "design" as const,
        description: "Creative design specialist. Support brand identity, graphic design, UI/UX, and visual asset creation for all entities.",
        avatar: "🎨",
        systemPrompt: AGENT_SYSTEM_PROMPTS.design,
        capabilities: ["brand_identity", "graphic_design", "ui_ux", "design_review", "style_guide"],
        isPublic: false,
      },
      {
        name: "IT Agent",
        type: "it" as const,
        description: "Information Technology specialist. Manage infrastructure, cybersecurity, system administration, and technology support.",
        avatar: "💻",
        systemPrompt: AGENT_SYSTEM_PROMPTS.it,
        capabilities: ["infrastructure", "cybersecurity", "system_admin", "troubleshooting", "data_backup"],
        isPublic: false,
      },
      {
        name: "Contracts Agent",
        type: "contracts" as const,
        description: "Contract management specialist. Draft, review, and track contracts, negotiations, and service agreements.",
        avatar: "📝",
        systemPrompt: AGENT_SYSTEM_PROMPTS.contracts,
        capabilities: ["contract_drafting", "negotiation", "compliance_tracking", "vendor_contracts", "deal_pipeline"],
        isPublic: false,
      },
      {
        name: "Procurement Agent",
        type: "procurement" as const,
        description: "Procurement department assistant. Manage RFPs, vendor evaluation, strategic sourcing, and procurement workflows.",
        avatar: "📦",
        systemPrompt: AGENT_SYSTEM_PROMPTS.procurement,
        capabilities: ["rfp_management", "vendor_evaluation", "strategic_sourcing", "procurement_workflow", "audit_trail"],
        isPublic: false,
      },
      {
        name: "Property Agent",
        type: "property" as const,
        description: "Property and assets management specialist. Track assets, manage maintenance, and support facility operations.",
        avatar: "🏢",
        systemPrompt: AGENT_SYSTEM_PROMPTS.property,
        capabilities: ["asset_tracking", "maintenance", "valuation", "insurance", "facility_management"],
        isPublic: false,
      },
      {
        name: "Real Estate Agent",
        type: "real_estate" as const,
        description: "Real estate operations specialist. Support acquisitions, market analysis, lease management, and portfolio performance.",
        avatar: "🏠",
        systemPrompt: AGENT_SYSTEM_PROMPTS.real_estate,
        capabilities: ["market_analysis", "lease_management", "portfolio_tracking", "due_diligence", "investment_analysis"],
        isPublic: false,
      },
      {
        name: "Project Controls Agent",
        type: "project_controls" as const,
        description: "Project management specialist. Track schedules, budgets, milestones, and coordinate cross-departmental projects.",
        avatar: "📋",
        systemPrompt: AGENT_SYSTEM_PROMPTS.project_controls,
        capabilities: ["schedule_tracking", "budget_management", "risk_monitoring", "resource_planning", "change_management"],
        isPublic: false,
      },
      {
        name: "Business Agent",
        type: "business" as const,
        description: "Business development strategist. Support growth initiatives, market research, partnership development, and business planning.",
        avatar: "💼",
        systemPrompt: AGENT_SYSTEM_PROMPTS.business,
        capabilities: ["market_research", "business_planning", "partnership_development", "competitive_analysis", "revenue_modeling"],
        isPublic: false,
      },
      {
        name: "Legal Agent",
        type: "legal" as const,
        description: "Legal department assistant. Support compliance, document preparation, IP protection, and corporate governance.",
        avatar: "⚖️",
        systemPrompt: AGENT_SYSTEM_PROMPTS.legal,
        capabilities: ["compliance", "document_review", "ip_protection", "governance", "risk_assessment"],
        isPublic: false,
      },
      // === PUBLIC Q&A AGENTS (available to all authenticated members) ===
      {
        name: "Academy Guide",
        type: "academy_qa" as const,
        description: "Public Q&A assistant for Academy students. Answers questions about courses, simulators, certificates, and learning paths. Read-only — cannot access or modify system data.",
        avatar: "🎓",
        systemPrompt: AGENT_SYSTEM_PROMPTS.academy_qa,
        capabilities: ["course_info", "simulator_guidance", "certificate_info", "study_tips"],
        isPublic: true,
      },
      {
        name: "House Guide",
        type: "house_qa" as const,
        description: "Public Q&A assistant for members on their House journey. Answers questions about activation steps, business formation basics, and progress tracking. Read-only — cannot access or modify system data.",
        avatar: "🏠",
        systemPrompt: AGENT_SYSTEM_PROMPTS.house_qa,
        capabilities: ["journey_guidance", "activation_steps", "formation_basics", "progress_tracking"],
        isPublic: true,
      },
      {
        name: "System Guide",
        type: "system_qa" as const,
        description: "Public Q&A assistant for general system questions. Explains the L.A.W.S. framework, available features, and how to navigate the platform. Read-only — cannot access or modify system data.",
        avatar: "🧭",
        systemPrompt: AGENT_SYSTEM_PROMPTS.system_qa,
        capabilities: ["navigation_help", "feature_overview", "laws_framework", "getting_started"],
        isPublic: true,
      },
      // === AI SUPPORT AGENT (escalation handler) ===
      {
        name: "Support Agent",
        type: "tech_support" as const,
        description: "Elevated AI Support Agent that handles escalated issues from public Q&A agents. Has diagnostic-level access to troubleshoot technical problems, account issues, and platform errors. Automatically assesses priority and resolves or flags for owner review.",
        avatar: "🔧",
        systemPrompt: AGENT_SYSTEM_PROMPTS.tech_support,
        capabilities: ["diagnostics", "troubleshooting", "account_support", "error_resolution", "priority_assessment", "owner_escalation"],
        isPublic: true,
      },
    ];

    // Only insert agents whose type doesn't already exist
    const newAgents = defaultAgents.filter(a => !existingTypes.has(a.type));

    if (newAgents.length === 0) {
      return { success: true, message: "All agents already initialized", agents: [] };
    }

    for (const botData of newAgents) {
      await db.insert(agents).values({
        ...botData,
        capabilities: botData.capabilities as any,
        createdBy: ctx.user.id,
      });
    }

    // Create notification
    await db.insert(notifications).values({
      userId: ctx.user.id,
      type: "success",
      title: "AI Agents Initialized",
      message: `Successfully created ${newAgents.length} new agent(s): ${newAgents.map(a => a.name).join(', ')}. ${existingAgents.length} existing agents unchanged.`,
      actionUrl: "/agents",
      isPriority: true,
    });

    return { 
      success: true, 
      message: `Created ${newAgents.length} new agent(s), ${existingAgents.length} already existed`,
      agents: newAgents.map(b => b.name),
    };
  }),

  /**
   * Get agent action history
   */
  getActions: protectedProcedure
    .input(z.object({
      agentId: z.number().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input.agentId
        ? and(eq(agentActions.userId, ctx.user.id), eq(agentActions.agentId, input.agentId))
        : eq(agentActions.userId, ctx.user.id);

      const actions = await db.select()
        .from(agentActions)
        .where(conditions)
        .orderBy(desc(agentActions.createdAt))
        .limit(input.limit);

      return actions;
    }),

  /**
   * Delete a conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Verify ownership
      const conv = await db.select()
        .from(agentConversations)
        .where(and(
          eq(agentConversations.id, input.conversationId),
          eq(agentConversations.userId, ctx.user.id)
        ))
        .limit(1);

      if (!conv.length) throw new Error("Conversation not found");

      // Delete messages first
      await db.delete(agentMessages)
        .where(eq(agentMessages.conversationId, input.conversationId));

      // Delete conversation
      await db.delete(agentConversations)
        .where(eq(agentConversations.id, input.conversationId));

      return { success: true };
    }),

  /**
   * Get scheduled tasks for a agent or all agents
   */
  getScheduledTasks: protectedProcedure
    .input(z.object({
      agentId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = input?.agentId
        ? and(eq(scheduledAgentTasks.createdBy, ctx.user.id), eq(scheduledAgentTasks.agentId, input.agentId))
        : eq(scheduledAgentTasks.createdBy, ctx.user.id);

      const tasks = await db.select()
        .from(scheduledAgentTasks)
        .where(conditions)
        .orderBy(desc(scheduledAgentTasks.createdAt));

      return tasks;
    }),

  /**
   * Create a scheduled task
   */
  createScheduledTask: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      taskType: z.enum([
        "daily_report",
        "weekly_audit",
        "monthly_analysis",
        "content_schedule",
        "engagement_check",
        "seo_audit",
        "token_report",
        "operation_review",
        "custom"
      ]),
      prompt: z.string().min(1),
      schedule: z.string().min(1), // Cron expression
      notifyOnComplete: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Calculate next run time based on schedule
      const now = new Date();
      
      await db.insert(scheduledAgentTasks).values({
        agentId: input.agentId,
        name: input.name,
        description: input.description,
        taskType: input.taskType,
        prompt: input.prompt,
        schedule: input.schedule,
        nextRunAt: now, // Will be updated by scheduler
        createdBy: ctx.user.id,
        notifyOnComplete: input.notifyOnComplete,
      });

      return { success: true };
    }),

  /**
   * Toggle scheduled task active status
   */
  toggleScheduledTask: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(scheduledAgentTasks)
        .set({ isActive: input.isActive })
        .where(and(
          eq(scheduledAgentTasks.id, input.taskId),
          eq(scheduledAgentTasks.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Delete a scheduled task
   */
  deleteScheduledTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.delete(scheduledAgentTasks)
        .where(and(
          eq(scheduledAgentTasks.id, input.taskId),
          eq(scheduledAgentTasks.createdBy, ctx.user.id)
        ));

      return { success: true };
    }),

  /**
   * Run a scheduled task manually
   */
  runScheduledTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the task
      const [task] = await db.select()
        .from(scheduledAgentTasks)
        .where(and(
          eq(scheduledAgentTasks.id, input.taskId),
          eq(scheduledAgentTasks.createdBy, ctx.user.id)
        ))
        .limit(1);

      if (!task) throw new Error("Task not found");

      // Get the agent
      const [agentRecord] = await db.select()
        .from(agents)
        .where(eq(agents.id, task.agentId))
        .limit(1);

      if (!agentRecord) throw new Error("Agent not found");

      // Get context data based on task type
      let contextData = "";
      
      if (task.taskType === "daily_report" || task.taskType === "operation_review") {
        const ops = await db.select()
          .from(autonomousOperations)
          .orderBy(desc(autonomousOperations.createdAt))
          .limit(10);
        contextData = `Recent Operations: ${JSON.stringify(ops.map(o => ({ type: o.operationType, status: o.status, entity: o.businessEntityId })))}`;
      } else if (task.taskType === "token_report") {
        const tokens = await db.select()
          .from(tokenAccounts)
          .limit(10);
        contextData = `Token Accounts: ${JSON.stringify(tokens.map(t => ({ user: t.userId, balance: t.tokenBalance })))}`;
      } else if (task.taskType === "weekly_audit" || task.taskType === "monthly_analysis") {
        const entities = await db.select()
          .from(businessEntities)
          .limit(10);
        contextData = `Business Entities: ${JSON.stringify(entities.map(e => ({ name: e.name, type: e.entityType })))}`;
      }

      // Run the task using LLM
      const response = await invokeLLM({
        messages: [
          { role: "system", content: agentRecord.systemPrompt },
          { role: "user", content: `${task.prompt}\n\nContext:\n${contextData}\n\nPlease provide a comprehensive response for this ${task.taskType.replace("_", " ")}.` }
        ],
      });

      const result = typeof response.choices[0].message.content === "string"
        ? response.choices[0].message.content
        : JSON.stringify(response.choices[0].message.content);

      // Update task with result
      const resultHistory = (task.resultHistory as any[] || []).slice(-9); // Keep last 10
      resultHistory.push({
        runAt: new Date().toISOString(),
        result: result.substring(0, 1000), // Truncate for storage
      });

      await db.update(scheduledAgentTasks)
        .set({
          lastRunAt: new Date(),
          resultHistory: resultHistory as any,
        })
        .where(eq(scheduledAgentTasks.id, input.taskId));

      // Create notification if enabled
      if (task.notifyOnComplete) {
        await db.insert(notifications).values({
          userId: ctx.user.id,
          type: "info",
          title: `Scheduled Task Complete: ${task.name}`,
          message: result.substring(0, 200) + (result.length > 200 ? "..." : ""),
          actionUrl: "/agents",
        });
      }

      // Log the action
      await db.insert(agentActions).values({
        agentId: task.agentId,
        userId: ctx.user.id,
        actionType: "analyze",
        targetType: "scheduled_task",
        targetId: task.id,
        description: `Ran scheduled task: ${task.name}`,
        result: { output: result.substring(0, 500) } as any,
        status: "completed",
      });

      return { success: true, result };
    }),

  /**
   * Initialize default scheduled tasks for system agents
   */
  initializeDefaultTasks: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if tasks already exist
    const existingTasks = await db.select()
      .from(scheduledAgentTasks)
      .where(eq(scheduledAgentTasks.createdBy, ctx.user.id))
      .limit(1);

    if (existingTasks.length > 0) {
      return { success: true, message: "Tasks already initialized" };
    }

    // Get system agents
    const systemAgents = await db.select().from(agents);
    const botMap = new Map(systemAgents.map(b => [b.type, b.id]));

    const defaultTasks = [
      {
        agentId: botMap.get("operations"),
        name: "Daily Operations Report",
        description: "Generate a daily summary of all autonomous operations",
        taskType: "daily_report" as const,
        prompt: "Generate a comprehensive daily report of all autonomous operations. Include: pending operations, completed operations, any issues or alerts, and recommendations for tomorrow.",
        schedule: "0 9 * * *", // 9 AM daily
      },
      {
        agentId: botMap.get("analytics"),
        name: "Weekly Performance Audit",
        description: "Weekly analysis of business performance across all entities",
        taskType: "weekly_audit" as const,
        prompt: "Conduct a weekly audit of business performance. Analyze: entity performance metrics, token circulation, operation success rates, and provide strategic recommendations.",
        schedule: "0 10 * * 1", // 10 AM every Monday
      },
      {
        agentId: botMap.get("finance"),
        name: "Token Economy Report",
        description: "Daily token balance and transaction summary",
        taskType: "token_report" as const,
        prompt: "Generate a token economy report. Include: total tokens in circulation, entity balances, recent transactions, and any anomalies in token flow.",
        schedule: "0 8 * * *", // 8 AM daily
      },
      {
        agentId: botMap.get("guardian"),
        name: "Monthly Governance Review",
        description: "Monthly compliance and governance analysis",
        taskType: "monthly_analysis" as const,
        prompt: "Conduct a monthly governance review. Check: trust compliance, allocation distributions, sovereignty protections, and flag any policy concerns.",
        schedule: "0 9 1 * *", // 9 AM on 1st of each month
      },
      {
        agentId: botMap.get("outreach"),
        name: "Content Calendar Update",
        description: "Generate weekly social media content suggestions",
        taskType: "content_schedule" as const,
        prompt: "Create a content calendar for the upcoming week. Include: 7 social media post ideas, 2 email newsletter topics, and 1 blog post outline. Focus on community engagement and brand awareness.",
        schedule: "0 8 * * 0", // 8 AM every Sunday
      },
      {
        agentId: botMap.get("seo"),
        name: "SEO Health Check",
        description: "Weekly SEO audit and recommendations",
        taskType: "seo_audit" as const,
        prompt: "Perform an SEO health check. Analyze: current keyword rankings, content optimization opportunities, meta description improvements, and competitor insights.",
        schedule: "0 7 * * 2", // 7 AM every Tuesday
      },
      {
        agentId: botMap.get("engagement"),
        name: "Engagement Metrics Review",
        description: "Daily engagement analysis and optimization tips",
        taskType: "engagement_check" as const,
        prompt: "Review engagement metrics. Analyze: best performing content, optimal posting times, audience growth trends, and provide 3 actionable recommendations to boost engagement.",
        schedule: "0 18 * * *", // 6 PM daily
      },
    ];

    let created = 0;
    for (const task of defaultTasks) {
      if (task.agentId) {
        await db.insert(scheduledAgentTasks).values({
          agentId: task.agentId,
          name: task.name,
          description: task.description,
          taskType: task.taskType,
          prompt: task.prompt,
          schedule: task.schedule,
          createdBy: ctx.user.id,
          notifyOnComplete: true,
        });
        created++;
      }
    }

    return { success: true, message: `Created ${created} scheduled tasks` };
  }),

  // ============================================
  // TRAINING MODE INTEGRATION
  // ============================================

  /**
   * Get training modules available for an agent type
   */
  getTrainingModules: protectedProcedure
    .input(z.object({
      agentType: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const modules = await db.select()
        .from(trainingModules)
        .where(and(
          eq(trainingModules.agentType, input.agentType),
          eq(trainingModules.isActive, true),
          eq(trainingModules.isPublic, true)
        ));

      return modules;
    }),

  /**
   * Start a training session through an agent conversation
   */
  startTrainingSession: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      moduleId: z.number(),
      conversationId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get the module
      const [module] = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.id, input.moduleId));

      if (!module) throw new Error("Training module not found");

      // Get topics and count questions
      const topics = await db.select()
        .from(trainingTopics)
        .where(eq(trainingTopics.moduleId, input.moduleId));

      let totalQuestions = 0;
      let totalPoints = 0;
      let firstTopicId: number | null = null;
      let firstQuestionId: number | null = null;

      for (const topic of topics) {
        const questions = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.topicId, topic.id));
        totalQuestions += questions.length;
        totalPoints += questions.reduce((sum, q) => sum + q.points, 0);

        if (!firstTopicId && questions.length > 0) {
          firstTopicId = topic.id;
          firstQuestionId = questions[0].id;
        }
      }

      // Create or use existing conversation
      let conversationId = input.conversationId;
      if (!conversationId) {
        const convResult = await db.insert(agentConversations).values({
          agentId: input.agentId,
          userId: ctx.user.id,
          title: `Training: ${module.name}`,
          metadata: { trainingMode: true, moduleId: input.moduleId } as any,
        });
        conversationId = convResult[0].insertId;
      }

      // Create training session
      const sessionResult = await db.insert(trainingSessions).values({
        userId: ctx.user.id,
        moduleId: input.moduleId,
        agentConversationId: conversationId,
        totalQuestions,
        totalPoints,
        currentTopicId: firstTopicId,
        currentQuestionId: firstQuestionId,
      });

      // Get first question
      let firstQuestion = null;
      if (firstQuestionId) {
        const [q] = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.id, firstQuestionId));
        
        if (q) {
          const answers = await db.select({
            id: trainingAnswers.id,
            answerText: trainingAnswers.answerText,
            orderIndex: trainingAnswers.orderIndex,
          }).from(trainingAnswers)
            .where(eq(trainingAnswers.questionId, q.id));
          
          firstQuestion = { ...q, answers };
        }
      }

      // Add welcome message to conversation
      await db.insert(agentMessages).values({
        conversationId,
        role: "assistant",
        content: `Welcome to the training module: **${module.name}**\n\n${module.description || ""}\n\nThis module has ${totalQuestions} questions. You need ${module.passingScore}% to pass.\n\nLet's begin!\n\n---\n\n**Question 1:**\n${firstQuestion?.questionText || "No questions available."}`,
        metadata: { 
          trainingMode: true, 
          sessionId: sessionResult[0].insertId,
          questionId: firstQuestionId,
        } as any,
      });

      return {
        success: true,
        sessionId: sessionResult[0].insertId,
        conversationId,
        module,
        totalQuestions,
        totalPoints,
        firstQuestion,
      };
    }),

  /**
   * Get current training session state for a conversation
   */
  getTrainingSession: protectedProcedure
    .input(z.object({
      conversationId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const [session] = await db.select()
        .from(trainingSessions)
        .where(and(
          eq(trainingSessions.agentConversationId, input.conversationId),
          eq(trainingSessions.userId, ctx.user.id)
        ));

      if (!session) return null;

      // Get module info
      const [module] = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.id, session.moduleId));

      // Get current question if any
      let currentQuestion = null;
      if (session.currentQuestionId) {
        const [q] = await db.select()
          .from(trainingQuestions)
          .where(eq(trainingQuestions.id, session.currentQuestionId));
        
        if (q) {
          const answers = await db.select({
            id: trainingAnswers.id,
            answerText: trainingAnswers.answerText,
            orderIndex: trainingAnswers.orderIndex,
          }).from(trainingAnswers)
            .where(eq(trainingAnswers.questionId, q.id));
          
          currentQuestion = { ...q, answers };
        }
      }

      return {
        ...session,
        module,
        currentQuestion,
      };
    }),

  // ============================================
  // WORKSHOP MODE — Agent ↔ Department Wiring
  // ============================================

  /**
   * Get workshop context for an agent — returns the linked department,
   * its simulators, training content, and Q&A material
   */
  getWorkshopContext: protectedProcedure
    .input(z.object({ agentType: z.string() }))
    .query(async ({ input }) => {
      const context = getWorkshopContext(input.agentType);
      if (!context) return null;

      const db = await getDb();
      if (!db) return context;

      // Fetch training modules for this department
      const modules = await db.select()
        .from(trainingModules)
        .where(and(
          eq(trainingModules.agentType, input.agentType),
          eq(trainingModules.isActive, true)
        ));

      // Fetch training content for this department
      let trainingContent: any[] = [];
      try {
        const result = await db.execute(
          sql`SELECT id, title, contentType, content, status FROM training_content WHERE department = ${context.departmentId} AND status = 'published' ORDER BY updatedAt DESC LIMIT 20`
        );
        trainingContent = (result as any)?.[0] ?? [];
      } catch {
        // Table may not exist yet
      }

      return {
        ...context,
        modules,
        trainingContent,
      };
    }),

  /**
   * Start a Workshop Mode conversation — creates a new conversation
   * with the agent pre-loaded with department training context
   */
  startWorkshopSession: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      agentType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const dept = getDepartmentForAgent(input.agentType);
      if (!dept) throw new Error("No department linked to this agent type");

      // Get training content for this department
      let contentSummary = "";
      try {
        const content = await db.execute(
          sql`SELECT title, contentType, content FROM training_content WHERE department = ${dept.id} AND status = 'published' ORDER BY updatedAt DESC LIMIT 10`
        );
        const rows = (content as any)?.[0] ?? [];
        if (Array.isArray(rows) && rows.length > 0) {
          contentSummary = "\n\nDepartment Training Content:\n" + 
            rows.map((r: any) => `- [${r.contentType}] ${r.title}: ${(r.content || "").substring(0, 200)}`).join("\n");
        }
      } catch {
        // Table may not exist
      }

      // Get training modules for context
      const modules = await db.select()
        .from(trainingModules)
        .where(and(
          eq(trainingModules.agentType, input.agentType),
          eq(trainingModules.isActive, true)
        ));

      const modulesSummary = modules.length > 0
        ? "\n\nAvailable Training Modules:\n" + modules.map(m => `- ${m.title}: ${m.description}`).join("\n")
        : "";

      // Create conversation with workshop title
      const [result] = await db.insert(agentConversations).values({
        userId: ctx.user.id,
        agentId: input.agentId,
        title: `Workshop: ${dept.name} Department`,
      });
      const conversationId = (result as any).insertId;

      // Insert system context message
      const workshopSystemMessage = `You are now in WORKSHOP MODE for the ${dept.name} Department (${dept.entity}).\n\nDepartment Manager: ${dept.manager.name} (${dept.manager.title})\n\nYour role in Workshop Mode:\n- Guide the user through interactive training exercises for this department\n- Ask questions based on the department's training content and simulators\n- Provide feedback on answers and explain concepts\n- Track progress through topics\n- Suggest next steps and related workshops\n\nAvailable Simulators: ${dept.simulators.map(s => s.label).join(", ") || "None yet"}\nCertificate Types: ${dept.certificateTypes.join(", ") || "None yet"}${modulesSummary}${contentSummary}\n\nStart by welcoming the user to the ${dept.name} Workshop and asking what topic they'd like to explore or practice.`;

      await db.insert(agentMessages).values({
        conversationId,
        role: "system",
        content: workshopSystemMessage,
      });

      // Generate initial welcome message from the agent
      const agent = await db.select().from(agents).where(eq(agents.id, input.agentId)).limit(1);
      const systemPrompt = agent[0]?.systemPrompt || "";

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt + "\n\n" + workshopSystemMessage },
          { role: "user", content: "Start the workshop session. Welcome me and tell me what we'll cover." },
        ],
      });

      const welcomeMessage = typeof response.choices[0]?.message?.content === "string"
        ? response.choices[0].message.content
        : `Welcome to the ${dept.name} Department Workshop! Let's get started.`;

      await db.insert(agentMessages).values({
        conversationId,
        role: "assistant",
        content: welcomeMessage,
      });

      return {
        conversationId,
        departmentId: dept.id,
        departmentName: dept.name,
        welcomeMessage,
      };
    }),

  /**
   * Get the agent-to-department mapping for the UI
   */
  getAgentDepartmentMap: protectedProcedure.query(() => {
    return DEPARTMENT_REGISTRY.map(dept => ({
      departmentId: dept.id,
      departmentName: dept.name,
      entity: dept.entity,
      manager: dept.manager.name,
      color: dept.color,
      icon: dept.icon,
      simulatorCount: dept.simulators.length,
      agentTypes: Object.entries(AGENT_TO_DEPARTMENT)
        .filter(([_, deptId]) => deptId === dept.id)
        .map(([agentType]) => agentType),
    }));
  }),
});
