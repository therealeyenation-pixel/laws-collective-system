/**
 * Negotiation Playbooks Service
 * Provides templates and strategies for contract negotiations
 */

// Types
export type NegotiationType = 'employment' | 'vendor' | 'real_estate' | 'partnership' | 'licensing' | 'settlement' | 'acquisition';
export type TacticType = 'anchoring' | 'bundling' | 'deadline' | 'walkaway' | 'concession' | 'silence' | 'good_cop_bad_cop' | 'nibbling';
export type PhaseType = 'preparation' | 'opening' | 'exploration' | 'bargaining' | 'closing' | 'implementation';

export interface NegotiationPlaybook {
  id: string;
  name: string;
  type: NegotiationType;
  description: string;
  phases: PlaybookPhase[];
  tactics: TacticRecommendation[];
  redFlags: string[];
  walkawayPoints: string[];
  bestPractices: string[];
  templates: PlaybookTemplate[];
}

export interface PlaybookPhase {
  phase: PhaseType;
  objectives: string[];
  actions: string[];
  questions: string[];
  pitfalls: string[];
}

export interface TacticRecommendation {
  tactic: TacticType;
  description: string;
  whenToUse: string;
  example: string;
  counterTactic?: string;
}

export interface PlaybookTemplate {
  name: string;
  type: 'email' | 'letter' | 'script' | 'checklist';
  content: string;
}

export interface NegotiationScenario {
  id: string;
  title: string;
  type: NegotiationType;
  context: string;
  yourPosition: string;
  theirPosition: string;
  stakes: string;
  leverage: {
    yours: string[];
    theirs: string[];
  };
  suggestedStrategy: string;
  possibleOutcomes: Array<{
    outcome: string;
    likelihood: 'low' | 'medium' | 'high';
    acceptability: 'poor' | 'acceptable' | 'good' | 'excellent';
  }>;
}

// Standard tactics library
export const TACTICS_LIBRARY: TacticRecommendation[] = [
  {
    tactic: 'anchoring',
    description: 'Set the initial offer to establish a reference point',
    whenToUse: 'When you have strong market data to support your position',
    example: 'Based on market research, similar roles pay $120K-$140K. I believe $135K reflects my experience.',
    counterTactic: 'Acknowledge their anchor but reframe with your own data'
  },
  {
    tactic: 'bundling',
    description: 'Combine multiple items into a single package',
    whenToUse: 'When individual items might be rejected but the package has value',
    example: 'I would accept the base salary if we can include signing bonus, extra PTO, and remote work flexibility.',
    counterTactic: 'Unbundle and address each item separately'
  },
  {
    tactic: 'deadline',
    description: 'Create urgency with a time constraint',
    whenToUse: 'When you have alternatives and need a decision',
    example: 'I have another offer that expires Friday. I prefer your company but need to know by Thursday.',
    counterTactic: 'Test if the deadline is real; ask for extension'
  },
  {
    tactic: 'walkaway',
    description: 'Be prepared to leave if terms are unacceptable',
    whenToUse: 'When you have a strong BATNA (Best Alternative)',
    example: 'I appreciate the offer, but at this level I would need to decline. Thank you for your time.',
    counterTactic: 'Call the bluff or offer a small concession to keep them engaged'
  },
  {
    tactic: 'concession',
    description: 'Give something to get something in return',
    whenToUse: 'When you need to show flexibility while maintaining priorities',
    example: 'I can be flexible on the start date if we can agree on the equity package.',
    counterTactic: 'Accept graciously but don\'t feel obligated to reciprocate immediately'
  },
  {
    tactic: 'silence',
    description: 'Pause after receiving an offer to create pressure',
    whenToUse: 'When you receive an offer and want them to improve it',
    example: '[After receiving offer, pause for 5-10 seconds before responding]',
    counterTactic: 'Wait them out; don\'t fill the silence with concessions'
  },
  {
    tactic: 'good_cop_bad_cop',
    description: 'Use team dynamics to create pressure and relief',
    whenToUse: 'When negotiating as a team',
    example: 'My partner thinks we should walk away, but I believe we can find common ground.',
    counterTactic: 'Recognize the tactic and address both parties equally'
  },
  {
    tactic: 'nibbling',
    description: 'Ask for small additions after main agreement',
    whenToUse: 'When the deal is nearly closed and you want extras',
    example: 'Great, we have a deal! One small thing - can we include parking in the package?',
    counterTactic: 'Recognize nibbling and either refuse or ask for something in return'
  }
];

// Generate employment negotiation playbook
export function generateEmploymentPlaybook(): NegotiationPlaybook {
  return {
    id: 'PB-EMPLOYMENT-001',
    name: 'Employment Offer Negotiation',
    type: 'employment',
    description: 'Comprehensive guide for negotiating job offers including salary, benefits, and terms',
    phases: [
      {
        phase: 'preparation',
        objectives: ['Research market rates', 'Define your priorities', 'Identify your BATNA'],
        actions: [
          'Research salary ranges on Glassdoor, LinkedIn, Levels.fyi',
          'List your top 3 priorities (salary, equity, flexibility, etc.)',
          'Calculate your minimum acceptable offer',
          'Prepare 3-5 accomplishments that justify your ask'
        ],
        questions: [
          'What is the total compensation range for this role?',
          'What is the equity/bonus structure?',
          'What benefits are negotiable?'
        ],
        pitfalls: ['Accepting the first offer', 'Negotiating without research', 'Revealing your current salary']
      },
      {
        phase: 'opening',
        objectives: ['Express enthusiasm', 'Gather information', 'Delay commitment'],
        actions: [
          'Thank them for the offer',
          'Ask for the complete offer in writing',
          'Request time to review (24-72 hours)',
          'Ask clarifying questions about the package'
        ],
        questions: [
          'Can you walk me through the complete compensation package?',
          'What is the performance review cycle?',
          'Is there flexibility in the start date?'
        ],
        pitfalls: ['Accepting immediately', 'Showing disappointment', 'Making demands before understanding the full offer']
      },
      {
        phase: 'bargaining',
        objectives: ['Present your counter', 'Trade concessions', 'Maintain relationship'],
        actions: [
          'Lead with your strongest justification',
          'Present a specific counter-offer (not a range)',
          'Be prepared to trade items',
          'Keep the conversation collaborative'
        ],
        questions: [
          'Is there flexibility on base salary?',
          'Can we discuss the equity component?',
          'What would it take to reach [your target]?'
        ],
        pitfalls: ['Being adversarial', 'Negotiating multiple items simultaneously', 'Ultimatums']
      },
      {
        phase: 'closing',
        objectives: ['Confirm all terms', 'Get it in writing', 'Set expectations'],
        actions: [
          'Summarize all agreed terms verbally',
          'Request updated offer letter',
          'Confirm start date and onboarding',
          'Express genuine enthusiasm'
        ],
        questions: [
          'Can you send the updated offer letter by [date]?',
          'What should I expect for onboarding?',
          'Who will be my point of contact?'
        ],
        pitfalls: ['Verbal agreements without documentation', 'Continuing to negotiate after agreement', 'Burning bridges']
      }
    ],
    tactics: TACTICS_LIBRARY.filter(t => ['anchoring', 'bundling', 'silence', 'concession'].includes(t.tactic)),
    redFlags: [
      'Pressure to accept immediately',
      'Vague answers about compensation structure',
      'Unwillingness to put terms in writing',
      'Significant gap between posted range and offer',
      'Negative comments about previous employees'
    ],
    walkawayPoints: [
      'Offer is more than 20% below market rate',
      'Key benefits are non-negotiable and unacceptable',
      'Company culture concerns during negotiation',
      'Unreasonable demands or conditions'
    ],
    bestPractices: [
      'Always negotiate - most employers expect it',
      'Focus on total compensation, not just salary',
      'Be specific with numbers, not ranges',
      'Maintain a positive, collaborative tone',
      'Get everything in writing before accepting'
    ],
    templates: [
      {
        name: 'Counter-Offer Email',
        type: 'email',
        content: `Subject: Re: [Company] Offer - [Your Name]

Dear [Hiring Manager],

Thank you so much for the offer to join [Company] as [Position]. I'm very excited about the opportunity to contribute to [specific project/team].

After careful consideration, I'd like to discuss the compensation package. Based on my research and experience, I was hoping for a base salary of $[target]. This reflects [brief justification - market data, experience, skills].

I'm also interested in discussing [other items - equity, signing bonus, PTO].

I'm confident we can find an arrangement that works for both of us. I'm available to discuss at your convenience.

Best regards,
[Your Name]`
      },
      {
        name: 'Negotiation Preparation Checklist',
        type: 'checklist',
        content: `## Pre-Negotiation Checklist

### Research
- [ ] Market salary data from 3+ sources
- [ ] Company's typical compensation structure
- [ ] Recent funding/financial health
- [ ] Comparable offers in hand

### Self-Assessment
- [ ] Minimum acceptable salary
- [ ] Target salary
- [ ] Stretch goal salary
- [ ] Top 3 non-salary priorities
- [ ] BATNA (best alternative)

### Preparation
- [ ] 3-5 accomplishments with metrics
- [ ] Responses to common objections
- [ ] Questions to ask
- [ ] Practice pitch with friend/mentor`
      }
    ]
  };
}

// Generate vendor negotiation playbook
export function generateVendorPlaybook(): NegotiationPlaybook {
  return {
    id: 'PB-VENDOR-001',
    name: 'Vendor Contract Negotiation',
    type: 'vendor',
    description: 'Guide for negotiating vendor agreements, pricing, and service terms',
    phases: [
      {
        phase: 'preparation',
        objectives: ['Define requirements', 'Research alternatives', 'Set budget'],
        actions: [
          'Document all requirements and nice-to-haves',
          'Get quotes from 3+ vendors',
          'Research vendor reputation and reviews',
          'Define success metrics and SLAs needed'
        ],
        questions: [
          'What is your pricing structure?',
          'What are your standard contract terms?',
          'Can you provide customer references?'
        ],
        pitfalls: ['Single-source negotiation', 'Unclear requirements', 'Focusing only on price']
      },
      {
        phase: 'bargaining',
        objectives: ['Negotiate price', 'Define SLAs', 'Protect interests'],
        actions: [
          'Request volume discounts',
          'Negotiate payment terms',
          'Define clear SLAs with penalties',
          'Include termination clauses'
        ],
        questions: [
          'What discounts are available for annual commitment?',
          'Can we include performance guarantees?',
          'What is your termination policy?'
        ],
        pitfalls: ['Long-term lock-in without exit clause', 'Auto-renewal traps', 'Hidden fees']
      }
    ],
    tactics: TACTICS_LIBRARY.filter(t => ['anchoring', 'deadline', 'walkaway', 'bundling'].includes(t.tactic)),
    redFlags: [
      'Reluctance to provide references',
      'Vague SLA commitments',
      'Aggressive auto-renewal terms',
      'Hidden fees in fine print',
      'Resistance to contract modifications'
    ],
    walkawayPoints: [
      'Price exceeds budget by more than 15%',
      'Unacceptable SLA terms',
      'No termination flexibility',
      'Poor customer references'
    ],
    bestPractices: [
      'Always get multiple quotes',
      'Negotiate before signing, not after',
      'Read the entire contract',
      'Include performance metrics',
      'Plan for exit from day one'
    ],
    templates: [
      {
        name: 'RFP Template',
        type: 'letter',
        content: `REQUEST FOR PROPOSAL

Project: [Project Name]
Due Date: [Date]

1. COMPANY OVERVIEW
[Brief description of your organization]

2. PROJECT REQUIREMENTS
[Detailed requirements]

3. EVALUATION CRITERIA
- Price (40%)
- Technical capability (30%)
- Experience/References (20%)
- Support/SLA (10%)

4. SUBMISSION REQUIREMENTS
Please include:
- Detailed pricing breakdown
- Implementation timeline
- 3 customer references
- Sample contract terms

5. QUESTIONS
Submit questions by [date] to [email]`
      }
    ]
  };
}

// Generate real estate negotiation playbook
export function generateRealEstatePlaybook(): NegotiationPlaybook {
  return {
    id: 'PB-REALESTATE-001',
    name: 'Real Estate Purchase Negotiation',
    type: 'real_estate',
    description: 'Guide for negotiating property purchases including price, terms, and contingencies',
    phases: [
      {
        phase: 'preparation',
        objectives: ['Research market', 'Get pre-approved', 'Define criteria'],
        actions: [
          'Get mortgage pre-approval',
          'Research comparable sales',
          'Define must-haves vs nice-to-haves',
          'Understand seller motivation'
        ],
        questions: [
          'How long has the property been on market?',
          'Why is the seller moving?',
          'Have there been other offers?'
        ],
        pitfalls: ['Emotional attachment', 'Waiving inspections', 'Overpaying in hot market']
      },
      {
        phase: 'bargaining',
        objectives: ['Negotiate price', 'Include contingencies', 'Set timeline'],
        actions: [
          'Submit offer based on comps',
          'Include inspection contingency',
          'Negotiate closing costs',
          'Request repairs or credits'
        ],
        questions: [
          'Will the seller contribute to closing costs?',
          'What is included in the sale?',
          'Is the seller flexible on closing date?'
        ],
        pitfalls: ['Bidding wars', 'Waiving contingencies', 'Ignoring red flags']
      }
    ],
    tactics: TACTICS_LIBRARY.filter(t => ['anchoring', 'deadline', 'walkaway', 'nibbling'].includes(t.tactic)),
    redFlags: [
      'Seller unwilling to allow inspection',
      'Property priced significantly below market',
      'Pressure to waive contingencies',
      'Undisclosed issues',
      'Title problems'
    ],
    walkawayPoints: [
      'Major structural issues discovered',
      'Seller unwilling to negotiate on repairs',
      'Appraisal significantly below offer',
      'Title issues that cannot be resolved'
    ],
    bestPractices: [
      'Always get an inspection',
      'Research comparable sales thoroughly',
      'Understand total cost of ownership',
      'Don\'t fall in love before closing',
      'Have a real estate attorney review contracts'
    ],
    templates: []
  };
}

// Get playbook by type
export function getPlaybook(type: NegotiationType): NegotiationPlaybook {
  switch (type) {
    case 'employment':
      return generateEmploymentPlaybook();
    case 'vendor':
      return generateVendorPlaybook();
    case 'real_estate':
      return generateRealEstatePlaybook();
    default:
      return generateEmploymentPlaybook(); // Default
  }
}

// Get all available playbook types
export function getAvailablePlaybooks(): Array<{ type: NegotiationType; name: string; description: string }> {
  return [
    { type: 'employment', name: 'Employment Offer', description: 'Negotiate job offers, salary, and benefits' },
    { type: 'vendor', name: 'Vendor Contract', description: 'Negotiate vendor agreements and pricing' },
    { type: 'real_estate', name: 'Real Estate', description: 'Negotiate property purchases' },
    { type: 'partnership', name: 'Partnership Agreement', description: 'Negotiate business partnerships' },
    { type: 'licensing', name: 'Licensing Deal', description: 'Negotiate IP and licensing terms' },
    { type: 'settlement', name: 'Settlement', description: 'Negotiate dispute settlements' },
    { type: 'acquisition', name: 'Acquisition', description: 'Negotiate business acquisitions' }
  ];
}

// Create practice scenario
export function createPracticeScenario(type: NegotiationType): NegotiationScenario {
  const scenarios: Record<NegotiationType, NegotiationScenario> = {
    employment: {
      id: 'SCENARIO-EMP-001',
      title: 'Senior Developer Offer Negotiation',
      type: 'employment',
      context: 'You have received an offer for a Senior Developer position at a growing tech company.',
      yourPosition: 'You have 8 years of experience and another offer at $145K',
      theirPosition: 'They offered $125K base with standard benefits',
      stakes: '$20K+ annual salary difference, career growth opportunity',
      leverage: {
        yours: ['Strong technical skills', 'Competing offer', 'In-demand specialty'],
        theirs: ['Interesting projects', 'Good culture', 'Growth potential']
      },
      suggestedStrategy: 'Use anchoring with market data, mention competing offer, focus on total compensation',
      possibleOutcomes: [
        { outcome: 'Accept $125K', likelihood: 'low', acceptability: 'poor' },
        { outcome: 'Negotiate to $135K', likelihood: 'high', acceptability: 'acceptable' },
        { outcome: 'Negotiate to $140K + signing bonus', likelihood: 'medium', acceptability: 'good' },
        { outcome: 'Negotiate to $145K matching other offer', likelihood: 'low', acceptability: 'excellent' }
      ]
    },
    vendor: {
      id: 'SCENARIO-VENDOR-001',
      title: 'SaaS Vendor Contract Renewal',
      type: 'vendor',
      context: 'Your company\'s CRM contract is up for renewal. The vendor wants a 15% price increase.',
      yourPosition: 'Current contract is $50K/year, you have evaluated alternatives',
      theirPosition: 'Vendor wants $57.5K/year (15% increase)',
      stakes: '$7.5K annual increase, migration costs if switching',
      leverage: {
        yours: ['Viable alternatives exist', 'Long-term customer', 'Volume growth potential'],
        theirs: ['Migration is costly', 'Team is trained on their system', 'Good relationship']
      },
      suggestedStrategy: 'Request quotes from competitors, negotiate multi-year deal for discount',
      possibleOutcomes: [
        { outcome: 'Accept 15% increase', likelihood: 'low', acceptability: 'poor' },
        { outcome: 'Negotiate to 5% increase', likelihood: 'high', acceptability: 'acceptable' },
        { outcome: 'Lock in current rate for 2 years', likelihood: 'medium', acceptability: 'good' },
        { outcome: 'Get 5% discount for 3-year commitment', likelihood: 'low', acceptability: 'excellent' }
      ]
    },
    real_estate: {
      id: 'SCENARIO-RE-001',
      title: 'Home Purchase Negotiation',
      type: 'real_estate',
      context: 'You found a home listed at $450K that has been on market for 60 days.',
      yourPosition: 'Pre-approved for $475K, found some issues in preliminary research',
      theirPosition: 'Sellers are relocating and need to sell within 90 days',
      stakes: 'Potential savings of $20-40K, dream home opportunity',
      leverage: {
        yours: ['Cash ready', 'Flexible on closing', 'Property on market 60 days'],
        theirs: ['Desirable location', 'Good school district', 'Recent updates']
      },
      suggestedStrategy: 'Offer below asking citing days on market, request seller concessions for repairs',
      possibleOutcomes: [
        { outcome: 'Pay full asking $450K', likelihood: 'low', acceptability: 'acceptable' },
        { outcome: 'Negotiate to $435K', likelihood: 'high', acceptability: 'good' },
        { outcome: 'Get $425K + seller pays closing costs', likelihood: 'medium', acceptability: 'good' },
        { outcome: 'Get $420K + repairs', likelihood: 'low', acceptability: 'excellent' }
      ]
    },
    partnership: {
      id: 'SCENARIO-PART-001',
      title: 'Business Partnership Terms',
      type: 'partnership',
      context: 'Negotiating equity split and responsibilities for a new venture.',
      yourPosition: 'Bringing technical expertise and initial funding',
      theirPosition: 'Partner brings industry connections and sales experience',
      stakes: 'Long-term equity ownership and control',
      leverage: {
        yours: ['Capital contribution', 'Technical skills', 'Product vision'],
        theirs: ['Industry network', 'Sales track record', 'Market knowledge']
      },
      suggestedStrategy: 'Define clear roles and vesting schedule, include buyout provisions',
      possibleOutcomes: [
        { outcome: '50/50 split', likelihood: 'medium', acceptability: 'acceptable' },
        { outcome: '60/40 with vesting', likelihood: 'high', acceptability: 'good' },
        { outcome: '55/45 with performance adjustments', likelihood: 'medium', acceptability: 'good' },
        { outcome: 'Structured deal with clear milestones', likelihood: 'low', acceptability: 'excellent' }
      ]
    },
    licensing: {
      id: 'SCENARIO-LIC-001',
      title: 'Software Licensing Deal',
      type: 'licensing',
      context: 'Negotiating license terms for your proprietary software.',
      yourPosition: 'You own valuable IP that the licensee needs',
      theirPosition: 'Licensee wants exclusive rights at low cost',
      stakes: 'Revenue stream and IP control',
      leverage: {
        yours: ['Unique technology', 'Other interested parties', 'Proven market fit'],
        theirs: ['Large distribution network', 'Marketing resources', 'Industry presence']
      },
      suggestedStrategy: 'Offer non-exclusive license, include minimum guarantees',
      possibleOutcomes: [
        { outcome: 'Exclusive license, low royalty', likelihood: 'low', acceptability: 'poor' },
        { outcome: 'Non-exclusive, standard royalty', likelihood: 'high', acceptability: 'acceptable' },
        { outcome: 'Exclusive with minimums and term limit', likelihood: 'medium', acceptability: 'good' },
        { outcome: 'Non-exclusive with high minimums', likelihood: 'low', acceptability: 'excellent' }
      ]
    },
    settlement: {
      id: 'SCENARIO-SET-001',
      title: 'Contract Dispute Settlement',
      type: 'settlement',
      context: 'Negotiating settlement for a contract dispute.',
      yourPosition: 'Strong case but litigation is expensive',
      theirPosition: 'Wants to avoid court but disputes liability',
      stakes: 'Potential recovery vs litigation costs',
      leverage: {
        yours: ['Strong documentation', 'Clear breach', 'Willingness to litigate'],
        theirs: ['Litigation costs', 'Reputation concerns', 'Time pressure']
      },
      suggestedStrategy: 'Present strong case, offer structured settlement',
      possibleOutcomes: [
        { outcome: 'Walk away', likelihood: 'low', acceptability: 'poor' },
        { outcome: 'Settle for 50%', likelihood: 'medium', acceptability: 'acceptable' },
        { outcome: 'Settle for 75%', likelihood: 'high', acceptability: 'good' },
        { outcome: 'Full recovery', likelihood: 'low', acceptability: 'excellent' }
      ]
    },
    acquisition: {
      id: 'SCENARIO-ACQ-001',
      title: 'Small Business Acquisition',
      type: 'acquisition',
      context: 'Negotiating purchase of a small business.',
      yourPosition: 'Interested buyer with financing ready',
      theirPosition: 'Owner wants premium for business they built',
      stakes: 'Purchase price and transition terms',
      leverage: {
        yours: ['Multiple targets available', 'Cash ready', 'Industry experience'],
        theirs: ['Profitable business', 'Loyal customers', 'Trained staff']
      },
      suggestedStrategy: 'Use earnings multiple, include earnout provisions',
      possibleOutcomes: [
        { outcome: 'Pay asking price', likelihood: 'low', acceptability: 'poor' },
        { outcome: 'Negotiate 15% discount', likelihood: 'high', acceptability: 'acceptable' },
        { outcome: '20% discount + earnout', likelihood: 'medium', acceptability: 'good' },
        { outcome: '25% discount + seller financing', likelihood: 'low', acceptability: 'excellent' }
      ]
    }
  };

  return scenarios[type] || scenarios.employment;
}

// Get tactic by name
export function getTactic(tacticType: TacticType): TacticRecommendation | undefined {
  return TACTICS_LIBRARY.find(t => t.tactic === tacticType);
}

// Get all tactics
export function getAllTactics(): TacticRecommendation[] {
  return TACTICS_LIBRARY;
}
