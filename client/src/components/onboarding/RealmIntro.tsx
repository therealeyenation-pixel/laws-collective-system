/**
 * Realm Introduction Component
 * Displays educational content before each realm assessment
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OnboardingRealm, REALM_INFO } from '@/lib/onboarding/types';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealmIntroProps {
  realm: OnboardingRealm;
  onContinue: () => void;
  onBack?: () => void;
}

// Extended content for each realm
const REALM_CONTENT: Record<OnboardingRealm, {
  overview: string;
  keyPrinciples: { title: string; description: string }[];
  quote: { text: string; author: string };
  prepTips: string[];
}> = {
  self: {
    overview: `The Self realm is where your journey begins. Before you can build wealth for others, you must first understand yourself — your purpose, your values, and your relationship with money. This realm focuses on developing the internal foundation that all external success is built upon.`,
    keyPrinciples: [
      {
        title: 'Purpose Before Profit',
        description: 'Understanding why you want to build wealth gives direction to how you build it. Purpose-driven wealth is sustainable wealth.'
      },
      {
        title: 'Financial Literacy as Self-Care',
        description: 'Learning to manage money is an act of self-respect. It protects your future self and those you love.'
      },
      {
        title: 'Skills as Assets',
        description: 'Your abilities are your most portable wealth. Invest in developing skills that create value for others.'
      },
      {
        title: 'Values-Based Decisions',
        description: 'When your financial decisions align with your values, you experience less conflict and more fulfillment.'
      }
    ],
    quote: {
      text: "Know thyself. The unexamined life is not worth living.",
      author: "Socrates"
    },
    prepTips: [
      'Reflect on what truly matters to you beyond money',
      'Consider your current relationship with finances',
      'Think about skills you have and skills you want to develop',
      'Remember: there are no wrong answers, only learning opportunities'
    ]
  },
  water: {
    overview: `The Water realm addresses what many wealth-building programs ignore: the emotional and psychological dimensions of money. Just as water flows around obstacles, you must learn to navigate emotional blocks that can sabotage your financial progress. Healing isn't weakness — it's the foundation of sustainable prosperity.`,
    keyPrinciples: [
      {
        title: 'Emotional Intelligence',
        description: 'Understanding and managing emotions — yours and others\' — is crucial for making sound financial decisions.'
      },
      {
        title: 'Generational Healing',
        description: 'Many money patterns are inherited. Recognizing and healing these patterns breaks cycles of financial struggle.'
      },
      {
        title: 'Balance as Strategy',
        description: 'Burnout destroys wealth. Sustainable success requires intentional balance between work, rest, and relationships.'
      },
      {
        title: 'Abundance Mindset',
        description: 'Scarcity thinking leads to hoarding and fear. Abundance thinking opens doors to opportunity and generosity.'
      }
    ],
    quote: {
      text: "Healing is not about moving on or getting over it, it's about learning to live with it.",
      author: "Unknown"
    },
    prepTips: [
      'Be honest about emotional patterns around money',
      'Consider how your family talked about (or avoided) money',
      'Reflect on times stress affected your financial decisions',
      'Approach this assessment with self-compassion'
    ]
  },
  air: {
    overview: `The Air realm represents the breath of knowledge that gives life to your aspirations. Education isn't just formal schooling — it's the continuous pursuit of understanding that allows you to adapt, grow, and seize opportunities. In a changing world, those who keep learning keep earning.`,
    keyPrinciples: [
      {
        title: 'Lifelong Learning',
        description: 'The world changes constantly. Those who commit to continuous learning remain relevant and valuable.'
      },
      {
        title: 'Knowledge Sharing',
        description: 'Teaching others deepens your own understanding and builds community. Knowledge grows when shared.'
      },
      {
        title: 'Critical Thinking',
        description: 'Not all information is equal. Learning to evaluate sources and think critically protects you from scams and bad advice.'
      },
      {
        title: 'Communication as Currency',
        description: 'The ability to clearly express ideas opens doors, builds relationships, and creates opportunities.'
      }
    ],
    quote: {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela"
    },
    prepTips: [
      'Think about how you prefer to learn new things',
      'Consider what knowledge gaps might be holding you back',
      'Reflect on the value of teaching and mentoring others',
      'Remember that wisdom comes from applying knowledge'
    ]
  },
  land: {
    overview: `The Land realm grounds your journey in stability and legacy. Just as land provides a foundation for building, this realm focuses on creating lasting structures — both physical and institutional — that will support you and future generations. Understanding your roots helps you grow stronger branches.`,
    keyPrinciples: [
      {
        title: 'Roots and Legacy',
        description: 'Understanding where you come from informs where you\'re going. Family history contains lessons for building the future.'
      },
      {
        title: 'Ownership Mindset',
        description: 'Building equity through ownership — of property, businesses, or assets — creates lasting wealth that can be passed down.'
      },
      {
        title: 'Community Connection',
        description: 'Strong communities provide support, opportunities, and resilience. Individual wealth is strengthened by collective prosperity.'
      },
      {
        title: 'Structural Protection',
        description: 'Trusts, legal structures, and proper planning protect what you build from being lost or diminished.'
      }
    ],
    quote: {
      text: "A society grows great when old men plant trees in whose shade they shall never sit.",
      author: "Greek Proverb"
    },
    prepTips: [
      'Think about what stability means to you',
      'Consider your family\'s history with property and assets',
      'Reflect on the role of community in your life',
      'Remember that generational wealth is about more than money'
    ]
  }
};

export function RealmIntro({ realm, onContinue, onBack }: RealmIntroProps) {
  const realmInfo = REALM_INFO[realm];
  const content = REALM_CONTENT[realm];

  // Color classes based on realm
  const colorClasses: Record<OnboardingRealm, { bg: string; border: string; text: string }> = {
    self: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300'
    },
    water: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300'
    },
    air: {
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      border: 'border-cyan-200 dark:border-cyan-800',
      text: 'text-cyan-700 dark:text-cyan-300'
    },
    land: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300'
    }
  };

  const colors = colorClasses[realm];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className={cn("p-8", colors.bg, colors.border)}>
        <div className="text-center">
          <span className="text-5xl mb-4 block">{realmInfo.icon}</span>
          <h1 className="text-3xl font-bold mb-2">{realmInfo.fullName}</h1>
          <p className="text-lg text-muted-foreground">{realmInfo.description}</p>
        </div>
      </Card>

      {/* Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Understanding the {realmInfo.name} Realm</h2>
        <p className="text-muted-foreground leading-relaxed">{content.overview}</p>
      </Card>

      {/* Key Principles */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Principles</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {content.keyPrinciples.map((principle, index) => (
            <div key={index} className="p-4 rounded-lg bg-secondary/30">
              <h3 className="font-semibold mb-2">{principle.title}</h3>
              <p className="text-sm text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Quote */}
      <Card className={cn("p-6", colors.bg, colors.border)}>
        <blockquote className="text-center">
          <p className="text-lg italic mb-2">"{content.quote.text}"</p>
          <footer className={cn("text-sm", colors.text)}>— {content.quote.author}</footer>
        </blockquote>
      </Card>

      {/* Preparation Tips */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Before You Begin the Assessment</h2>
        <ul className="space-y-3">
          {content.prepTips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className={cn("w-5 h-5 mt-0.5 flex-shrink-0", colors.text)} />
              <span className="text-muted-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Focus Areas */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Focus Areas</h2>
        <div className="flex flex-wrap gap-2">
          {realmInfo.focus.map((area, index) => (
            <span 
              key={index}
              className={cn(
                "px-3 py-1 rounded-full text-sm",
                colors.bg, colors.border, colors.text,
                "border"
              )}
            >
              {area}
            </span>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} size="lg" className="gap-2">
          Begin Assessment
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
