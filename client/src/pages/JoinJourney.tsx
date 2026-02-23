/**
 * Join Journey Page
 * The Direct Onboarding path for joining L.A.W.S. Collective
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { cn } from '@/lib/utils';
import { 
  OnboardingStep, 
  OnboardingRealm, 
  REALM_INFO, 
  STEP_ORDER, 
  calculateProgress,
  getNextStep,
  PASSING_SCORE
} from '@/lib/onboarding/types';
import { RealmIntro } from '@/components/onboarding/RealmIntro';
import { RealmAssessment } from '@/components/onboarding/RealmAssessment';
import { 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  Home,
  FileCheck,
  Award,
  LogIn
} from 'lucide-react';

// Journey state stored in localStorage for persistence
const JOURNEY_STORAGE_KEY = 'laws_onboarding_journey';

interface JourneyState {
  currentStep: OnboardingStep;
  realmsCompleted: {
    self: boolean;
    water: boolean;
    air: boolean;
    land: boolean;
  };
  scores: {
    self: number | null;
    water: number | null;
    air: number | null;
    land: number | null;
  };
  houseSetup: {
    houseName: string;
    houseType: 'individual' | 'family' | 'legacy';
    primaryBeneficiaryName?: string;
    primaryBeneficiaryRelation?: string;
  } | null;
  valuesAgreed: boolean;
  startedAt: string;
  lastActivityAt: string;
}

const initialState: JourneyState = {
  currentStep: 'welcome',
  realmsCompleted: { self: false, water: false, air: false, land: false },
  scores: { self: null, water: null, air: null, land: null },
  houseSetup: null,
  valuesAgreed: false,
  startedAt: new Date().toISOString(),
  lastActivityAt: new Date().toISOString()
};

export default function JoinJourney() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [journeyState, setJourneyState] = useState<JourneyState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load journey state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setJourneyState(parsed);
      } catch (e) {
        console.error('Failed to parse journey state:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save journey state to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify({
        ...journeyState,
        lastActivityAt: new Date().toISOString()
      }));
    }
  }, [journeyState, isLoading]);

  const updateStep = (step: OnboardingStep) => {
    setJourneyState(prev => ({ ...prev, currentStep: step }));
  };

  const completeRealm = (realm: OnboardingRealm, score: number) => {
    setJourneyState(prev => ({
      ...prev,
      realmsCompleted: { ...prev.realmsCompleted, [realm]: true },
      scores: { ...prev.scores, [realm]: score }
    }));
  };

  const progress = calculateProgress(journeyState.currentStep);

  // Render based on current step
  const renderStep = () => {
    switch (journeyState.currentStep) {
      case 'welcome':
        return <WelcomeStep onContinue={() => updateStep('self_intro')} />;
      
      case 'self_intro':
        return (
          <RealmIntro 
            realm="self" 
            onContinue={() => updateStep('self_assessment')}
            onBack={() => updateStep('welcome')}
          />
        );
      
      case 'self_assessment':
        return (
          <RealmAssessment
            realm="self"
            onComplete={(passed, score) => {
              if (passed) {
                completeRealm('self', score);
                updateStep('water_intro');
              }
            }}
            onBack={() => updateStep('self_intro')}
          />
        );
      
      case 'water_intro':
        return (
          <RealmIntro 
            realm="water" 
            onContinue={() => updateStep('water_assessment')}
            onBack={() => updateStep('self_assessment')}
          />
        );
      
      case 'water_assessment':
        return (
          <RealmAssessment
            realm="water"
            onComplete={(passed, score) => {
              if (passed) {
                completeRealm('water', score);
                updateStep('air_intro');
              }
            }}
            onBack={() => updateStep('water_intro')}
          />
        );
      
      case 'air_intro':
        return (
          <RealmIntro 
            realm="air" 
            onContinue={() => updateStep('air_assessment')}
            onBack={() => updateStep('water_assessment')}
          />
        );
      
      case 'air_assessment':
        return (
          <RealmAssessment
            realm="air"
            onComplete={(passed, score) => {
              if (passed) {
                completeRealm('air', score);
                updateStep('land_intro');
              }
            }}
            onBack={() => updateStep('air_intro')}
          />
        );
      
      case 'land_intro':
        return (
          <RealmIntro 
            realm="land" 
            onContinue={() => updateStep('land_assessment')}
            onBack={() => updateStep('air_assessment')}
          />
        );
      
      case 'land_assessment':
        return (
          <RealmAssessment
            realm="land"
            onComplete={(passed, score) => {
              if (passed) {
                completeRealm('land', score);
                updateStep('house_setup');
              }
            }}
            onBack={() => updateStep('land_intro')}
          />
        );
      
      case 'house_setup':
        return (
          <HouseSetupStep
            onComplete={(houseData) => {
              setJourneyState(prev => ({ ...prev, houseSetup: houseData }));
              updateStep('values_agreement');
            }}
            onBack={() => updateStep('land_assessment')}
          />
        );
      
      case 'values_agreement':
        return (
          <ValuesAgreementStep
            onAgree={() => {
              setJourneyState(prev => ({ ...prev, valuesAgreed: true }));
              updateStep('credential_issuance');
            }}
            onBack={() => updateStep('house_setup')}
          />
        );
      
      case 'credential_issuance':
        return (
          <CredentialIssuanceStep
            journeyState={journeyState}
            user={user}
            onComplete={() => {
              updateStep('complete');
              // Clear journey state after completion
              localStorage.removeItem(JOURNEY_STORAGE_KEY);
            }}
          />
        );
      
      case 'complete':
        return <CompletionStep onViewCredential={() => navigate('/my-credential')} />;
      
      default:
        return <WelcomeStep onContinue={() => updateStep('self_intro')} />;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">Join L.A.W.S. Collective</h1>
            <span className="text-sm text-muted-foreground">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Realm Progress Indicators */}
          <div className="flex justify-between mt-3">
            {(['self', 'water', 'air', 'land'] as OnboardingRealm[]).map((realm) => {
              const info = REALM_INFO[realm];
              const completed = journeyState.realmsCompleted[realm];
              const score = journeyState.scores[realm];
              
              return (
                <div key={realm} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    completed 
                      ? "bg-green-100 dark:bg-green-900/30" 
                      : "bg-secondary"
                  )}>
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <span>{info.icon}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">{info.name}</span>
                  {score !== null && (
                    <span className="text-xs text-green-600">{score}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-8">
        {renderStep()}
      </main>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-4">Welcome to the L.A.W.S. Journey</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          You're about to embark on a transformative experience that will prepare you 
          for membership in the L.A.W.S. Collective — a community dedicated to building 
          multi-generational wealth through purpose, healing, knowledge, and stability.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What to Expect</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { icon: '🌟', title: 'Self Discovery', desc: 'Explore your purpose, skills, and financial foundations' },
            { icon: '💧', title: 'Emotional Intelligence', desc: 'Develop healing awareness and balanced decision-making' },
            { icon: '🌬️', title: 'Knowledge Building', desc: 'Embrace continuous learning and effective communication' },
            { icon: '🌍', title: 'Stable Foundations', desc: 'Understand roots, community, and generational planning' }
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-lg bg-secondary/30">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Journey Includes</h2>
        <ul className="space-y-3">
          {[
            { icon: <Circle className="w-5 h-5" />, text: 'Four realm assessments (5 questions each)' },
            { icon: <Home className="w-5 h-5" />, text: 'House setup to establish your personal trust structure' },
            { icon: <FileCheck className="w-5 h-5" />, text: 'Community values agreement' },
            { icon: <Award className="w-5 h-5" />, text: 'Member Credential upon completion' }
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="text-primary">{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <p className="text-sm text-center">
          <strong>Note:</strong> You'll need to score at least {PASSING_SCORE}% on each assessment to proceed. 
          Don't worry — you can retry as many times as needed, and each attempt helps you learn!
        </p>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onContinue} size="lg" className="gap-2">
          Begin Your Journey
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// House Setup Step Component
function HouseSetupStep({ 
  onComplete, 
  onBack 
}: { 
  onComplete: (data: JourneyState['houseSetup']) => void;
  onBack: () => void;
}) {
  const [houseName, setHouseName] = useState('');
  const [houseType, setHouseType] = useState<'individual' | 'family' | 'legacy'>('individual');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelation, setBeneficiaryRelation] = useState('');

  const handleSubmit = () => {
    if (!houseName.trim()) return;
    onComplete({
      houseName: houseName.trim(),
      houseType,
      primaryBeneficiaryName: beneficiaryName.trim() || undefined,
      primaryBeneficiaryRelation: beneficiaryRelation.trim() || undefined
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <Home className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h1 className="text-3xl font-bold mb-2">Establish Your House</h1>
        <p className="text-muted-foreground">
          Your House is your personal trust structure within the L.A.W.S. Collective.
        </p>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          {/* House Name */}
          <div>
            <label className="block text-sm font-medium mb-2">House Name *</label>
            <input
              type="text"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              placeholder="e.g., The Johnson House, House of Purpose"
              className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be the official name of your trust structure
            </p>
          </div>

          {/* House Type */}
          <div>
            <label className="block text-sm font-medium mb-2">House Type</label>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { value: 'individual', label: 'Individual', desc: 'For personal wealth building' },
                { value: 'family', label: 'Family', desc: 'For immediate family members' },
                { value: 'legacy', label: 'Legacy', desc: 'For multi-generational planning' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHouseType(option.value as typeof houseType)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all",
                    houseType === option.value 
                      ? "border-primary bg-primary/10" 
                      : "hover:border-primary/50"
                  )}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Beneficiary (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Primary Beneficiary (Optional)
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Beneficiary name"
                className="p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={beneficiaryRelation}
                onChange={(e) => setBeneficiaryRelation(e.target.value)}
                placeholder="Relationship (e.g., Spouse, Child)"
                className="p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You can add more beneficiaries later in the Wealth System
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={handleSubmit} disabled={!houseName.trim()} className="gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Values Agreement Step Component
function ValuesAgreementStep({ 
  onAgree, 
  onBack 
}: { 
  onAgree: () => void;
  onBack: () => void;
}) {
  const [agreed, setAgreed] = useState(false);

  const values = [
    {
      title: 'Purpose Over Profit',
      description: 'We prioritize meaningful impact and sustainable growth over short-term gains.'
    },
    {
      title: 'Community Wealth',
      description: 'We believe individual prosperity is strengthened by collective success.'
    },
    {
      title: 'Generational Thinking',
      description: 'We make decisions considering their impact on future generations.'
    },
    {
      title: 'Continuous Learning',
      description: 'We commit to lifelong education and sharing knowledge with others.'
    },
    {
      title: 'Healing and Growth',
      description: 'We acknowledge that emotional health is essential to financial health.'
    },
    {
      title: 'Integrity and Trust',
      description: 'We conduct ourselves with honesty and build trust through our actions.'
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <FileCheck className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Community Values Agreement</h1>
        <p className="text-muted-foreground">
          The L.A.W.S. Collective is built on shared values. Please review and agree to uphold these principles.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Our Core Values</h2>
        <div className="space-y-4">
          {values.map((value, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary/30">
              <h3 className="font-semibold mb-1">{value.title}</h3>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-primary"
          />
          <span className="text-sm">
            I have read and agree to uphold the L.A.W.S. Collective community values. 
            I understand that membership in the Collective comes with both privileges and 
            responsibilities, and I commit to contributing positively to our community.
          </span>
        </label>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onAgree} disabled={!agreed} className="gap-2">
          I Agree
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Credential Issuance Step Component
function CredentialIssuanceStep({ 
  journeyState,
  user,
  onComplete 
}: { 
  journeyState: JourneyState;
  user: any;
  onComplete: () => void;
}) {
  const [isIssuing, setIsIssuing] = useState(false);
  const [issued, setIssued] = useState(false);

  const handleIssue = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = getLoginUrl();
      return;
    }

    setIsIssuing(true);
    // Simulate credential issuance (in production, this would call the backend)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIssued(true);
    setIsIssuing(false);
  };

  if (!user) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Almost There!</h1>
          <p className="text-muted-foreground mb-6">
            You've completed all the assessments! To receive your Member Credential, 
            please sign in or create an account.
          </p>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="gap-2">
            Sign In to Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">
          {issued ? 'Credential Issued!' : 'Issue Your Credential'}
        </h1>
        <p className="text-muted-foreground">
          {issued 
            ? 'Welcome to the L.A.W.S. Collective! Your Member Credential is ready.'
            : 'You\'ve completed all requirements. Click below to receive your Member Credential.'
          }
        </p>
      </Card>

      {/* Journey Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Journey Summary</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(['self', 'water', 'air', 'land'] as OnboardingRealm[]).map((realm) => {
            const info = REALM_INFO[realm];
            const score = journeyState.scores[realm];
            return (
              <div key={realm} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <div className="font-medium">{info.name} Realm</div>
                  <div className="text-sm text-green-600">Score: {score}%</div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
              </div>
            );
          })}
        </div>
      </Card>

      {journeyState.houseSetup && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your House</h2>
          <div className="p-4 rounded-lg bg-secondary/30">
            <div className="font-semibold text-lg">{journeyState.houseSetup.houseName}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {journeyState.houseSetup.houseType} House
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        {issued ? (
          <Button onClick={onComplete} size="lg" className="gap-2">
            View My Credential
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleIssue} 
            size="lg" 
            disabled={isIssuing}
            className="gap-2"
          >
            {isIssuing ? 'Issuing Credential...' : 'Issue My Credential'}
            {!isIssuing && <Award className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}

// Completion Step Component
function CompletionStep({ onViewCredential }: { onViewCredential: () => void }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to the Collective!</h1>
        <p className="text-lg text-muted-foreground">
          You are now a credentialed member of the L.A.W.S. Collective.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
        <div className="space-y-3 text-left">
          {[
            'Access the Wealth System to manage your House',
            'Explore contractor opportunities within the ecosystem',
            'Connect with other community members',
            'Continue learning through the L.A.W.S. Academy'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={onViewCredential} size="lg" className="gap-2">
        View My Credential
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
