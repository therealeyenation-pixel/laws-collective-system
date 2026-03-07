/**
 * L.A.W.S. Onboarding Question Bank
 * Questions for each realm assessment
 */

import { OnboardingQuestion } from './types';

// SELF Realm Questions - Purpose, Skills, Financial Literacy
export const SELF_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'self_q1',
    realm: 'self',
    questionText: 'What is the primary purpose of creating a personal financial plan?',
    options: [
      'To impress others with your wealth',
      'To align your money with your life goals and values',
      'To avoid paying taxes',
      'To spend as much as possible'
    ],
    correctOptionIndex: 1,
    explanation: 'A personal financial plan helps you align your financial decisions with your life goals and values, creating a roadmap for achieving what matters most to you.',
    difficulty: 'easy'
  },
  {
    id: 'self_q2',
    realm: 'self',
    questionText: 'In the L.A.W.S. framework, what does "Self" represent?',
    options: [
      'Selfishness and personal gain',
      'Purpose, skills, and financial literacy',
      'Self-isolation from community',
      'Physical fitness only'
    ],
    correctOptionIndex: 1,
    explanation: 'In L.A.W.S., Self represents understanding your purpose, developing practical skills, and building financial literacy - the foundation for all other growth.',
    difficulty: 'easy'
  },
  {
    id: 'self_q3',
    realm: 'self',
    questionText: 'What is the difference between an asset and a liability?',
    options: [
      'Assets are expensive, liabilities are cheap',
      'Assets put money in your pocket, liabilities take money out',
      'There is no difference',
      'Assets are for businesses, liabilities are for individuals'
    ],
    correctOptionIndex: 1,
    explanation: 'An asset puts money in your pocket (generates income or appreciates), while a liability takes money out (costs you money over time).',
    difficulty: 'medium'
  },
  {
    id: 'self_q4',
    realm: 'self',
    questionText: 'Why is it important to identify your personal values before making financial decisions?',
    options: [
      'Values don\'t affect financial decisions',
      'To make decisions that align with what truly matters to you',
      'To copy what others value',
      'Values are only for religious people'
    ],
    correctOptionIndex: 1,
    explanation: 'Understanding your values helps you make financial decisions that align with what truly matters to you, leading to greater satisfaction and purpose.',
    difficulty: 'medium'
  },
  {
    id: 'self_q5',
    realm: 'self',
    questionText: 'What is the "pay yourself first" principle?',
    options: [
      'Spend on yourself before paying bills',
      'Save or invest a portion of income before other expenses',
      'Only pay for things you personally use',
      'Never share money with family'
    ],
    correctOptionIndex: 1,
    explanation: 'Pay yourself first means automatically saving or investing a portion of your income before paying other expenses, ensuring you build wealth consistently.',
    difficulty: 'easy'
  },
  {
    id: 'self_q6',
    realm: 'self',
    questionText: 'What is compound interest?',
    options: [
      'Interest charged on late payments',
      'Interest earned on both principal and accumulated interest',
      'A type of bank fee',
      'Interest that decreases over time'
    ],
    correctOptionIndex: 1,
    explanation: 'Compound interest is interest earned on both your original principal and the interest that has already accumulated, creating exponential growth over time.',
    difficulty: 'medium'
  },
  {
    id: 'self_q7',
    realm: 'self',
    questionText: 'What is the recommended size of an emergency fund?',
    options: [
      'One week of expenses',
      'Three to six months of living expenses',
      'One year of income',
      'Emergency funds are unnecessary'
    ],
    correctOptionIndex: 1,
    explanation: 'Financial experts recommend having 3-6 months of living expenses saved as an emergency fund to cover unexpected events without going into debt.',
    difficulty: 'easy'
  },
  {
    id: 'self_q8',
    realm: 'self',
    questionText: 'In the context of skill development, what does "T-shaped skills" mean?',
    options: [
      'Skills that start with the letter T',
      'Deep expertise in one area plus broad knowledge in many areas',
      'Skills learned in school only',
      'Technical skills only'
    ],
    correctOptionIndex: 1,
    explanation: 'T-shaped skills refer to having deep expertise in one area (the vertical bar) combined with broad knowledge across many areas (the horizontal bar).',
    difficulty: 'hard'
  }
];

// WATER Realm Questions - Healing, Emotional Intelligence, Balance
export const WATER_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'water_q1',
    realm: 'water',
    questionText: 'What is emotional intelligence?',
    options: [
      'Being overly emotional',
      'The ability to recognize, understand, and manage emotions in yourself and others',
      'Suppressing all emotions',
      'Only caring about your own feelings'
    ],
    correctOptionIndex: 1,
    explanation: 'Emotional intelligence is the ability to recognize, understand, and manage your own emotions while also being aware of and influencing the emotions of others.',
    difficulty: 'easy'
  },
  {
    id: 'water_q2',
    realm: 'water',
    questionText: 'What are "generational patterns" in the context of family wealth?',
    options: [
      'Fashion trends passed down in families',
      'Behaviors, beliefs, and habits about money passed from one generation to the next',
      'Genetic traits only',
      'Legal documents'
    ],
    correctOptionIndex: 1,
    explanation: 'Generational patterns are behaviors, beliefs, and habits about money that are passed down through families, often unconsciously affecting financial decisions.',
    difficulty: 'medium'
  },
  {
    id: 'water_q3',
    realm: 'water',
    questionText: 'Why is healing important before building wealth?',
    options: [
      'It\'s not important',
      'Unresolved emotional issues can sabotage financial progress',
      'Healing makes you weak',
      'Wealth automatically heals everything'
    ],
    correctOptionIndex: 1,
    explanation: 'Unresolved emotional issues and trauma can unconsciously sabotage financial progress through self-destructive behaviors, poor decisions, or inability to receive abundance.',
    difficulty: 'medium'
  },
  {
    id: 'water_q4',
    realm: 'water',
    questionText: 'What is the relationship between stress and financial decision-making?',
    options: [
      'Stress has no effect on decisions',
      'High stress often leads to impulsive or poor financial decisions',
      'Stress always improves decision-making',
      'Only physical stress matters'
    ],
    correctOptionIndex: 1,
    explanation: 'High stress activates the fight-or-flight response, which can lead to impulsive, short-term thinking and poor financial decisions.',
    difficulty: 'easy'
  },
  {
    id: 'water_q5',
    realm: 'water',
    questionText: 'In L.A.W.S., what does "Water" symbolize?',
    options: [
      'Drinking water',
      'Healing, emotional balance, and healthy decision-making',
      'Swimming pools',
      'Water bills'
    ],
    correctOptionIndex: 1,
    explanation: 'In the L.A.W.S. framework, Water represents healing, emotional balance, and the ability to make healthy decisions from a place of clarity rather than reactivity.',
    difficulty: 'easy'
  },
  {
    id: 'water_q6',
    realm: 'water',
    questionText: 'What is "money shame" and how does it affect wealth building?',
    options: [
      'Being ashamed of having too much money',
      'Negative emotions about money that prevent healthy financial behaviors',
      'A banking term',
      'It doesn\'t exist'
    ],
    correctOptionIndex: 1,
    explanation: 'Money shame includes feelings of guilt, embarrassment, or unworthiness around money that can prevent people from earning, saving, or investing effectively.',
    difficulty: 'medium'
  },
  {
    id: 'water_q7',
    realm: 'water',
    questionText: 'What is the importance of work-life balance in building generational wealth?',
    options: [
      'Work-life balance slows down wealth building',
      'Sustainable success requires balance to prevent burnout and maintain relationships',
      'Only work matters for wealth',
      'Balance is for lazy people'
    ],
    correctOptionIndex: 1,
    explanation: 'Sustainable wealth building requires balance to prevent burnout, maintain important relationships, and ensure the wealth you build can be enjoyed and passed on.',
    difficulty: 'medium'
  },
  {
    id: 'water_q8',
    realm: 'water',
    questionText: 'How can gratitude practice improve financial outcomes?',
    options: [
      'It has no effect',
      'Gratitude shifts focus from scarcity to abundance, improving decision-making',
      'Gratitude is only for spiritual people',
      'It makes you complacent'
    ],
    correctOptionIndex: 1,
    explanation: 'Practicing gratitude shifts your mindset from scarcity to abundance, reducing anxiety-driven decisions and opening you to opportunities you might otherwise miss.',
    difficulty: 'hard'
  }
];

// AIR Realm Questions - Education, Knowledge, Communication
export const AIR_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'air_q1',
    realm: 'air',
    questionText: 'What is the concept of "lifelong learning"?',
    options: [
      'Only learning in school',
      'Continuously acquiring new knowledge and skills throughout life',
      'Learning stops after college',
      'Only learning from books'
    ],
    correctOptionIndex: 1,
    explanation: 'Lifelong learning is the ongoing, voluntary pursuit of knowledge and skills throughout life, essential for adapting to change and growing wealth.',
    difficulty: 'easy'
  },
  {
    id: 'air_q2',
    realm: 'air',
    questionText: 'In L.A.W.S., what does "Air" represent?',
    options: [
      'Breathing exercises',
      'Education, knowledge, and communication',
      'Air conditioning',
      'Airplane travel'
    ],
    correctOptionIndex: 1,
    explanation: 'In the L.A.W.S. framework, Air represents education, knowledge acquisition, and effective communication - the breath that gives life to ideas and growth.',
    difficulty: 'easy'
  },
  {
    id: 'air_q3',
    realm: 'air',
    questionText: 'Why is financial education important for generational wealth?',
    options: [
      'It\'s not important',
      'Each generation must understand how to grow and protect wealth',
      'Only the first generation needs education',
      'Wealth manages itself'
    ],
    correctOptionIndex: 1,
    explanation: 'Financial education ensures each generation understands how to grow, protect, and responsibly manage wealth, preventing the common "shirtsleeves to shirtsleeves" pattern.',
    difficulty: 'medium'
  },
  {
    id: 'air_q4',
    realm: 'air',
    questionText: 'What is the value of teaching others what you learn?',
    options: [
      'It wastes your time',
      'Teaching deepens your own understanding and builds community',
      'Keep knowledge to yourself for advantage',
      'Only teachers should teach'
    ],
    correctOptionIndex: 1,
    explanation: 'Teaching others deepens your own understanding, creates accountability, and builds community - all essential for sustainable wealth building.',
    difficulty: 'medium'
  },
  {
    id: 'air_q5',
    realm: 'air',
    questionText: 'What is "critical thinking" and why is it important for financial decisions?',
    options: [
      'Being critical of everything',
      'Objectively analyzing information before making decisions',
      'Thinking negatively',
      'Only trusting experts'
    ],
    correctOptionIndex: 1,
    explanation: 'Critical thinking is the ability to objectively analyze information, question assumptions, and make reasoned decisions - essential for avoiding scams and making sound investments.',
    difficulty: 'medium'
  },
  {
    id: 'air_q6',
    realm: 'air',
    questionText: 'How does effective communication contribute to wealth building?',
    options: [
      'Communication doesn\'t affect wealth',
      'Clear communication builds relationships, opportunities, and trust',
      'Only written communication matters',
      'Talking less is always better'
    ],
    correctOptionIndex: 1,
    explanation: 'Effective communication builds relationships, creates opportunities, establishes trust, and enables successful negotiations - all crucial for wealth building.',
    difficulty: 'easy'
  },
  {
    id: 'air_q7',
    realm: 'air',
    questionText: 'What is the difference between information and wisdom?',
    options: [
      'They are the same thing',
      'Information is data; wisdom is knowing how to apply it effectively',
      'Wisdom is outdated information',
      'Information is more valuable than wisdom'
    ],
    correctOptionIndex: 1,
    explanation: 'Information is raw data and facts, while wisdom is the ability to apply knowledge effectively based on experience and understanding of context.',
    difficulty: 'hard'
  },
  {
    id: 'air_q8',
    realm: 'air',
    questionText: 'Why is it important to learn from multiple sources and perspectives?',
    options: [
      'One source is enough',
      'Multiple perspectives provide a more complete understanding and reduce bias',
      'It creates confusion',
      'Only experts have valid perspectives'
    ],
    correctOptionIndex: 1,
    explanation: 'Learning from multiple sources and perspectives provides a more complete understanding, reduces personal bias, and helps identify opportunities others might miss.',
    difficulty: 'medium'
  }
];

// LAND Realm Questions - Stability, Roots, Property
export const LAND_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'land_q1',
    realm: 'land',
    questionText: 'In L.A.W.S., what does "Land" represent?',
    options: [
      'Only real estate',
      'Reconnection with roots, stability, and building lasting foundations',
      'Farming',
      'Geography'
    ],
    correctOptionIndex: 1,
    explanation: 'In the L.A.W.S. framework, Land represents reconnection with your roots, building stability, and creating lasting foundations for yourself and future generations.',
    difficulty: 'easy'
  },
  {
    id: 'land_q2',
    realm: 'land',
    questionText: 'Why is understanding your family history important for wealth building?',
    options: [
      'It\'s not important',
      'It reveals patterns, resources, and lessons that can inform your strategy',
      'Only for genealogy hobbyists',
      'The past doesn\'t affect the future'
    ],
    correctOptionIndex: 1,
    explanation: 'Understanding family history reveals patterns (both helpful and harmful), potential resources, and lessons learned that can inform your wealth-building strategy.',
    difficulty: 'medium'
  },
  {
    id: 'land_q3',
    realm: 'land',
    questionText: 'What is the concept of "generational wealth"?',
    options: [
      'Wealth that only lasts one generation',
      'Assets and resources passed down through multiple generations',
      'Wealth for elderly people only',
      'A type of investment account'
    ],
    correctOptionIndex: 1,
    explanation: 'Generational wealth refers to assets, resources, knowledge, and opportunities that are passed down through multiple generations, creating lasting family prosperity.',
    difficulty: 'easy'
  },
  {
    id: 'land_q4',
    realm: 'land',
    questionText: 'What role does community play in building stable foundations?',
    options: [
      'Community is irrelevant to personal wealth',
      'Strong community connections provide support, opportunities, and resilience',
      'Community only takes from you',
      'Wealth is purely individual'
    ],
    correctOptionIndex: 1,
    explanation: 'Strong community connections provide mutual support, shared opportunities, collective resources, and resilience during difficult times - all strengthening your foundation.',
    difficulty: 'medium'
  },
  {
    id: 'land_q5',
    realm: 'land',
    questionText: 'What is the difference between owning and renting in terms of wealth building?',
    options: [
      'There is no difference',
      'Ownership builds equity over time; renting provides flexibility but no equity',
      'Renting is always better',
      'Owning is always better'
    ],
    correctOptionIndex: 1,
    explanation: 'Ownership builds equity over time as you pay down the mortgage and the property potentially appreciates, while renting provides flexibility but doesn\'t build equity.',
    difficulty: 'easy'
  },
  {
    id: 'land_q6',
    realm: 'land',
    questionText: 'What is a "trust" in the context of estate planning?',
    options: [
      'Just trusting someone with your money',
      'A legal arrangement that holds assets for beneficiaries according to specific terms',
      'A type of bank account',
      'An informal promise'
    ],
    correctOptionIndex: 1,
    explanation: 'A trust is a legal arrangement where assets are held by a trustee for the benefit of beneficiaries according to specific terms, providing control, protection, and tax benefits.',
    difficulty: 'medium'
  },
  {
    id: 'land_q7',
    realm: 'land',
    questionText: 'Why is it important to have multiple streams of income?',
    options: [
      'One income source is enough',
      'Multiple streams provide stability and accelerate wealth building',
      'It\'s too complicated',
      'Only businesses need multiple income streams'
    ],
    correctOptionIndex: 1,
    explanation: 'Multiple income streams provide financial stability (if one fails, others continue), accelerate wealth building, and reduce dependence on any single source.',
    difficulty: 'medium'
  },
  {
    id: 'land_q8',
    realm: 'land',
    questionText: 'What is the "House" concept in the The The L.A.W.S. Collective?',
    options: [
      'A physical building',
      'A personal or family trust structure for managing and protecting assets',
      'A type of mortgage',
      'A real estate investment'
    ],
    correctOptionIndex: 1,
    explanation: 'In the The The L.A.W.S. Collective, a House is a personal or family trust structure that helps you manage, protect, and grow assets across generations.',
    difficulty: 'easy'
  }
];

// Get all questions for a realm
export function getQuestionsForRealm(realm: 'self' | 'water' | 'air' | 'land'): OnboardingQuestion[] {
  switch (realm) {
    case 'self': return SELF_QUESTIONS;
    case 'water': return WATER_QUESTIONS;
    case 'air': return AIR_QUESTIONS;
    case 'land': return LAND_QUESTIONS;
  }
}

// Get a random subset of questions for an assessment
export function getAssessmentQuestions(realm: 'self' | 'water' | 'air' | 'land', count: number = 5): OnboardingQuestion[] {
  const allQuestions = getQuestionsForRealm(realm);
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allQuestions.length));
}

// All questions combined
export const ALL_QUESTIONS: OnboardingQuestion[] = [
  ...SELF_QUESTIONS,
  ...WATER_QUESTIONS,
  ...AIR_QUESTIONS,
  ...LAND_QUESTIONS
];
