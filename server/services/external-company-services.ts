/**
 * External Company Services
 * Handles onboarding external companies to use L.A.W.S. services
 */

// Service types
export type ServiceTier = 'standalone' | 'connected' | 'full_suite';
export type ServiceCategory = 'formation' | 'compliance' | 'payroll' | 'tax' | 'legal' | 'training' | 'consulting';
export type OnboardingStatus = 'pending' | 'in_progress' | 'active' | 'suspended' | 'cancelled';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  features: string[];
  pricing: {
    standalone: number;
    connected: number;
    fullSuite: number;
  };
  dependencies: string[];
  recommended: string[];
}

export interface ExternalCompany {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  address?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: string;
  status: OnboardingStatus;
  tier: ServiceTier;
  subscribedServices: string[];
  createdAt: string;
  activatedAt?: string;
}

export interface OnboardingProgress {
  companyId: string;
  steps: {
    profileComplete: boolean;
    servicesSelected: boolean;
    termsAccepted: boolean;
    paymentSetup: boolean;
    integrationConfigured: boolean;
    welcomeEmailSent: boolean;
  };
  currentStep: number;
  totalSteps: number;
  percentComplete: number;
}

// Service catalog
const SERVICE_CATALOG: Service[] = [
  {
    id: 'entity-formation',
    name: 'Entity Formation',
    category: 'formation',
    description: 'LLC, Corporation, and Trust formation services',
    features: [
      'State filing preparation',
      'Operating agreement templates',
      'EIN application assistance',
      'Registered agent service',
      'Document storage'
    ],
    pricing: { standalone: 499, connected: 399, fullSuite: 299 },
    dependencies: [],
    recommended: ['compliance-annual', 'legal-documents']
  },
  {
    id: 'compliance-annual',
    name: 'Annual Compliance',
    category: 'compliance',
    description: 'Annual report filing and compliance monitoring',
    features: [
      'Annual report preparation',
      'Filing deadline reminders',
      'State compliance monitoring',
      'Good standing certificates',
      'Compliance calendar'
    ],
    pricing: { standalone: 299, connected: 249, fullSuite: 199 },
    dependencies: [],
    recommended: ['entity-formation']
  },
  {
    id: 'payroll-basic',
    name: 'Basic Payroll',
    category: 'payroll',
    description: 'Payroll processing for small businesses',
    features: [
      'Payroll calculations',
      'Direct deposit',
      'Tax withholding',
      'Pay stub generation',
      'W-2 preparation'
    ],
    pricing: { standalone: 99, connected: 79, fullSuite: 49 },
    dependencies: [],
    recommended: ['tax-quarterly', 'compliance-annual']
  },
  {
    id: 'payroll-full',
    name: 'Full-Service Payroll',
    category: 'payroll',
    description: 'Complete payroll with HR integration',
    features: [
      'All Basic Payroll features',
      'Benefits administration',
      'PTO tracking',
      'Onboarding automation',
      '1099 contractor payments'
    ],
    pricing: { standalone: 199, connected: 149, fullSuite: 99 },
    dependencies: ['payroll-basic'],
    recommended: ['training-hr']
  },
  {
    id: 'tax-quarterly',
    name: 'Quarterly Tax Filing',
    category: 'tax',
    description: 'Quarterly estimated tax preparation and filing',
    features: [
      'Quarterly estimate calculations',
      'Payment voucher preparation',
      'Filing deadline reminders',
      'Tax projection reports',
      'Audit support'
    ],
    pricing: { standalone: 199, connected: 149, fullSuite: 99 },
    dependencies: [],
    recommended: ['tax-annual']
  },
  {
    id: 'tax-annual',
    name: 'Annual Tax Preparation',
    category: 'tax',
    description: 'Business tax return preparation',
    features: [
      'Business tax return preparation',
      'K-1 generation',
      'Deduction optimization',
      'Multi-state filing',
      'Extension filing'
    ],
    pricing: { standalone: 599, connected: 499, fullSuite: 399 },
    dependencies: [],
    recommended: ['tax-quarterly', 'compliance-annual']
  },
  {
    id: 'legal-documents',
    name: 'Legal Document Templates',
    category: 'legal',
    description: 'Business legal document generation',
    features: [
      'Contract templates',
      'NDA templates',
      'Employment agreements',
      'Service agreements',
      'Custom document requests'
    ],
    pricing: { standalone: 149, connected: 99, fullSuite: 49 },
    dependencies: [],
    recommended: ['entity-formation']
  },
  {
    id: 'training-financial',
    name: 'Financial Literacy Training',
    category: 'training',
    description: 'Business financial management courses',
    features: [
      'Bookkeeping basics',
      'Cash flow management',
      'Financial statement reading',
      'Budgeting for business',
      'Certificate upon completion'
    ],
    pricing: { standalone: 199, connected: 149, fullSuite: 99 },
    dependencies: [],
    recommended: ['training-hr']
  },
  {
    id: 'training-hr',
    name: 'HR Compliance Training',
    category: 'training',
    description: 'HR best practices and compliance',
    features: [
      'Hiring best practices',
      'Employee handbook creation',
      'Workplace safety',
      'Anti-discrimination training',
      'Certificate upon completion'
    ],
    pricing: { standalone: 199, connected: 149, fullSuite: 99 },
    dependencies: [],
    recommended: ['payroll-full']
  },
  {
    id: 'consulting-strategy',
    name: 'Business Strategy Consulting',
    category: 'consulting',
    description: 'One-on-one business consulting',
    features: [
      'Monthly strategy sessions',
      'Business plan review',
      'Growth planning',
      'Exit strategy planning',
      'Priority support'
    ],
    pricing: { standalone: 499, connected: 399, fullSuite: 299 },
    dependencies: [],
    recommended: []
  }
];

// Get all available services
export function getServiceCatalog(): Service[] {
  return SERVICE_CATALOG;
}

// Get service by ID
export function getServiceById(serviceId: string): Service | undefined {
  return SERVICE_CATALOG.find(s => s.id === serviceId);
}

// Get services by category
export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICE_CATALOG.filter(s => s.category === category);
}

// Calculate pricing for selected services
export function calculatePricing(
  serviceIds: string[],
  tier: ServiceTier
): {
  services: Array<{ id: string; name: string; price: number }>;
  subtotal: number;
  discount: number;
  total: number;
  monthlyTotal: number;
} {
  const services = serviceIds
    .map(id => getServiceById(id))
    .filter((s): s is Service => s !== undefined)
    .map(service => ({
      id: service.id,
      name: service.name,
      price: tier === 'standalone' 
        ? service.pricing.standalone 
        : tier === 'connected' 
          ? service.pricing.connected 
          : service.pricing.fullSuite
    }));

  const subtotal = services.reduce((sum, s) => sum + s.price, 0);
  
  // Apply tier discount
  const discountPercent = tier === 'standalone' ? 0 : tier === 'connected' ? 10 : 20;
  const discount = Math.round(subtotal * discountPercent / 100);
  const total = subtotal - discount;
  
  // Monthly breakdown (annual pricing / 12)
  const monthlyTotal = Math.round(total / 12);

  return {
    services,
    subtotal,
    discount,
    total,
    monthlyTotal
  };
}

// Get recommended services based on selections
export function getRecommendedServices(selectedIds: string[]): Service[] {
  const recommendedIds = new Set<string>();
  
  selectedIds.forEach(id => {
    const service = getServiceById(id);
    if (service) {
      service.recommended.forEach(recId => {
        if (!selectedIds.includes(recId)) {
          recommendedIds.add(recId);
        }
      });
    }
  });
  
  return Array.from(recommendedIds)
    .map(id => getServiceById(id))
    .filter((s): s is Service => s !== undefined);
}

// Check service dependencies
export function checkDependencies(serviceIds: string[]): {
  valid: boolean;
  missingDependencies: Array<{ service: string; requires: string[] }>;
} {
  const missing: Array<{ service: string; requires: string[] }> = [];
  
  serviceIds.forEach(id => {
    const service = getServiceById(id);
    if (service && service.dependencies.length > 0) {
      const missingDeps = service.dependencies.filter(dep => !serviceIds.includes(dep));
      if (missingDeps.length > 0) {
        missing.push({ service: service.name, requires: missingDeps });
      }
    }
  });
  
  return {
    valid: missing.length === 0,
    missingDependencies: missing
  };
}

// Create new external company
export function createExternalCompany(
  name: string,
  contactName: string,
  contactEmail: string,
  tier: ServiceTier = 'standalone'
): ExternalCompany {
  return {
    id: `EXT-${Date.now()}`,
    name,
    contactName,
    contactEmail,
    status: 'pending',
    tier,
    subscribedServices: [],
    createdAt: new Date().toISOString()
  };
}

// Update company profile
export function updateCompanyProfile(
  company: ExternalCompany,
  updates: Partial<Pick<ExternalCompany, 'phone' | 'address' | 'industry' | 'employeeCount' | 'annualRevenue'>>
): ExternalCompany {
  return {
    ...company,
    ...updates
  };
}

// Subscribe to services
export function subscribeToServices(
  company: ExternalCompany,
  serviceIds: string[]
): ExternalCompany {
  const depCheck = checkDependencies(serviceIds);
  if (!depCheck.valid) {
    throw new Error(`Missing dependencies: ${depCheck.missingDependencies.map(d => d.requires.join(', ')).join('; ')}`);
  }
  
  return {
    ...company,
    subscribedServices: serviceIds,
    status: company.status === 'pending' ? 'in_progress' : company.status
  };
}

// Activate company
export function activateCompany(company: ExternalCompany): ExternalCompany {
  if (company.subscribedServices.length === 0) {
    throw new Error('Company must have at least one subscribed service');
  }
  
  return {
    ...company,
    status: 'active',
    activatedAt: new Date().toISOString()
  };
}

// Get onboarding progress
export function getOnboardingProgress(company: ExternalCompany): OnboardingProgress {
  const steps = {
    profileComplete: !!(company.phone && company.address && company.industry),
    servicesSelected: company.subscribedServices.length > 0,
    termsAccepted: company.status !== 'pending',
    paymentSetup: company.status === 'active' || company.status === 'in_progress',
    integrationConfigured: company.status === 'active',
    welcomeEmailSent: company.status === 'active'
  };
  
  const completedSteps = Object.values(steps).filter(Boolean).length;
  const totalSteps = Object.keys(steps).length;
  
  return {
    companyId: company.id,
    steps,
    currentStep: completedSteps + 1,
    totalSteps,
    percentComplete: Math.round((completedSteps / totalSteps) * 100)
  };
}

// Generate onboarding checklist
export function generateOnboardingChecklist(company: ExternalCompany): Array<{
  step: number;
  title: string;
  description: string;
  completed: boolean;
  action?: string;
}> {
  const progress = getOnboardingProgress(company);
  
  return [
    {
      step: 1,
      title: 'Complete Company Profile',
      description: 'Provide your company details including address, industry, and employee count',
      completed: progress.steps.profileComplete,
      action: '/onboarding/profile'
    },
    {
      step: 2,
      title: 'Select Services',
      description: 'Choose the services that best fit your business needs',
      completed: progress.steps.servicesSelected,
      action: '/onboarding/services'
    },
    {
      step: 3,
      title: 'Accept Terms of Service',
      description: 'Review and accept our terms of service and privacy policy',
      completed: progress.steps.termsAccepted,
      action: '/onboarding/terms'
    },
    {
      step: 4,
      title: 'Set Up Payment',
      description: 'Configure your payment method for service subscriptions',
      completed: progress.steps.paymentSetup,
      action: '/onboarding/payment'
    },
    {
      step: 5,
      title: 'Configure Integrations',
      description: 'Set up integrations with your existing systems',
      completed: progress.steps.integrationConfigured,
      action: '/onboarding/integrations'
    },
    {
      step: 6,
      title: 'Welcome & Activation',
      description: 'Receive your welcome email and access your dashboard',
      completed: progress.steps.welcomeEmailSent
    }
  ];
}

// Generate feature comparison matrix
export function generateFeatureMatrix(): {
  categories: ServiceCategory[];
  services: Array<{
    id: string;
    name: string;
    category: ServiceCategory;
    standalone: { price: number; included: boolean };
    connected: { price: number; included: boolean };
    fullSuite: { price: number; included: boolean };
  }>;
} {
  const categories: ServiceCategory[] = ['formation', 'compliance', 'payroll', 'tax', 'legal', 'training', 'consulting'];
  
  const services = SERVICE_CATALOG.map(service => ({
    id: service.id,
    name: service.name,
    category: service.category,
    standalone: { price: service.pricing.standalone, included: true },
    connected: { price: service.pricing.connected, included: true },
    fullSuite: { price: service.pricing.fullSuite, included: true }
  }));
  
  return { categories, services };
}

// Get tier benefits
export function getTierBenefits(tier: ServiceTier): {
  tier: ServiceTier;
  name: string;
  description: string;
  benefits: string[];
  discount: string;
} {
  const tiers = {
    standalone: {
      tier: 'standalone' as ServiceTier,
      name: 'Standalone',
      description: 'Individual services with no commitment',
      benefits: [
        'Pay only for what you need',
        'No long-term commitment',
        'Standard support',
        'Self-service portal access'
      ],
      discount: '0%'
    },
    connected: {
      tier: 'connected' as ServiceTier,
      name: 'Connected',
      description: 'Integrated services with better pricing',
      benefits: [
        '10% discount on all services',
        'Integrated service dashboard',
        'Priority support',
        'Quarterly business review',
        'Data sharing between services'
      ],
      discount: '10%'
    },
    full_suite: {
      tier: 'full_suite' as ServiceTier,
      name: 'Full Suite',
      description: 'Complete business management solution',
      benefits: [
        '20% discount on all services',
        'Dedicated account manager',
        'Premium support (24/7)',
        'Monthly strategy sessions',
        'Custom integrations',
        'Early access to new features'
      ],
      discount: '20%'
    }
  };
  
  return tiers[tier];
}
