import { describe, it, expect } from 'vitest';
import {
  getServiceCatalog,
  getServiceById,
  getServicesByCategory,
  calculatePricing,
  getRecommendedServices,
  checkDependencies,
  createExternalCompany,
  updateCompanyProfile,
  subscribeToServices,
  activateCompany,
  getOnboardingProgress,
  generateOnboardingChecklist,
  generateFeatureMatrix,
  getTierBenefits
} from './services/external-company-services';

describe('External Company Services', () => {
  describe('getServiceCatalog', () => {
    it('should return all available services', () => {
      const catalog = getServiceCatalog();
      expect(catalog.length).toBeGreaterThan(0);
      expect(catalog[0]).toHaveProperty('id');
      expect(catalog[0]).toHaveProperty('name');
      expect(catalog[0]).toHaveProperty('pricing');
    });
  });

  describe('getServiceById', () => {
    it('should return service by ID', () => {
      const service = getServiceById('entity-formation');
      expect(service).toBeDefined();
      expect(service?.name).toBe('Entity Formation');
    });

    it('should return undefined for unknown ID', () => {
      const service = getServiceById('unknown-service');
      expect(service).toBeUndefined();
    });
  });

  describe('getServicesByCategory', () => {
    it('should return services by category', () => {
      const payrollServices = getServicesByCategory('payroll');
      expect(payrollServices.length).toBeGreaterThan(0);
      payrollServices.forEach(s => expect(s.category).toBe('payroll'));
    });
  });

  describe('calculatePricing', () => {
    it('should calculate standalone pricing', () => {
      const result = calculatePricing(['entity-formation', 'compliance-annual'], 'standalone');
      expect(result.services).toHaveLength(2);
      expect(result.subtotal).toBe(798); // 499 + 299
      expect(result.discount).toBe(0);
      expect(result.total).toBe(798);
    });

    it('should apply connected tier discount', () => {
      const result = calculatePricing(['entity-formation', 'compliance-annual'], 'connected');
      expect(result.subtotal).toBe(648); // 399 + 249
      expect(result.discount).toBe(65); // 10% of 648
      expect(result.total).toBe(583);
    });

    it('should apply full suite tier discount', () => {
      const result = calculatePricing(['entity-formation', 'compliance-annual'], 'full_suite');
      expect(result.subtotal).toBe(498); // 299 + 199
      expect(result.discount).toBe(100); // 20% of 498
      expect(result.total).toBe(398);
    });

    it('should calculate monthly total', () => {
      const result = calculatePricing(['entity-formation'], 'standalone');
      expect(result.monthlyTotal).toBe(Math.round(499 / 12));
    });
  });

  describe('getRecommendedServices', () => {
    it('should return recommended services', () => {
      const recommended = getRecommendedServices(['entity-formation']);
      expect(recommended.length).toBeGreaterThan(0);
      expect(recommended.some(s => s.id === 'compliance-annual')).toBe(true);
    });

    it('should not recommend already selected services', () => {
      const recommended = getRecommendedServices(['entity-formation', 'compliance-annual']);
      expect(recommended.some(s => s.id === 'compliance-annual')).toBe(false);
    });
  });

  describe('checkDependencies', () => {
    it('should return valid for services without dependencies', () => {
      const result = checkDependencies(['entity-formation', 'compliance-annual']);
      expect(result.valid).toBe(true);
      expect(result.missingDependencies).toHaveLength(0);
    });

    it('should detect missing dependencies', () => {
      const result = checkDependencies(['payroll-full']);
      expect(result.valid).toBe(false);
      expect(result.missingDependencies.length).toBeGreaterThan(0);
    });

    it('should pass when dependencies are included', () => {
      const result = checkDependencies(['payroll-basic', 'payroll-full']);
      expect(result.valid).toBe(true);
    });
  });

  describe('createExternalCompany', () => {
    it('should create new company with pending status', () => {
      const company = createExternalCompany('Test Corp', 'John Doe', 'john@test.com');
      expect(company.id).toContain('EXT-');
      expect(company.name).toBe('Test Corp');
      expect(company.contactName).toBe('John Doe');
      expect(company.contactEmail).toBe('john@test.com');
      expect(company.status).toBe('pending');
      expect(company.tier).toBe('standalone');
      expect(company.subscribedServices).toHaveLength(0);
    });

    it('should accept custom tier', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com', 'full_suite');
      expect(company.tier).toBe('full_suite');
    });
  });

  describe('updateCompanyProfile', () => {
    it('should update company profile fields', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      const updated = updateCompanyProfile(company, {
        phone: '555-1234',
        address: '123 Main St',
        industry: 'Technology',
        employeeCount: 50
      });
      
      expect(updated.phone).toBe('555-1234');
      expect(updated.address).toBe('123 Main St');
      expect(updated.industry).toBe('Technology');
      expect(updated.employeeCount).toBe(50);
    });
  });

  describe('subscribeToServices', () => {
    it('should add services to company', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      const updated = subscribeToServices(company, ['entity-formation', 'compliance-annual']);
      
      expect(updated.subscribedServices).toHaveLength(2);
      expect(updated.status).toBe('in_progress');
    });

    it('should throw error for missing dependencies', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      expect(() => subscribeToServices(company, ['payroll-full'])).toThrow('Missing dependencies');
    });
  });

  describe('activateCompany', () => {
    it('should activate company with services', () => {
      let company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      company = subscribeToServices(company, ['entity-formation']);
      company = activateCompany(company);
      
      expect(company.status).toBe('active');
      expect(company.activatedAt).toBeTruthy();
    });

    it('should throw error for company without services', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      expect(() => activateCompany(company)).toThrow('at least one subscribed service');
    });
  });

  describe('getOnboardingProgress', () => {
    it('should return progress for new company', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      const progress = getOnboardingProgress(company);
      
      expect(progress.companyId).toBe(company.id);
      expect(progress.percentComplete).toBeLessThan(100);
      expect(progress.totalSteps).toBe(6);
    });

    it('should return 100% for fully activated company', () => {
      let company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      company = updateCompanyProfile(company, {
        phone: '555-1234',
        address: '123 Main St',
        industry: 'Tech'
      });
      company = subscribeToServices(company, ['entity-formation']);
      company = activateCompany(company);
      
      const progress = getOnboardingProgress(company);
      expect(progress.percentComplete).toBe(100);
    });
  });

  describe('generateOnboardingChecklist', () => {
    it('should generate checklist with 6 steps', () => {
      const company = createExternalCompany('Test Corp', 'John', 'john@test.com');
      const checklist = generateOnboardingChecklist(company);
      
      expect(checklist).toHaveLength(6);
      expect(checklist[0].title).toBe('Complete Company Profile');
      expect(checklist[5].title).toBe('Welcome & Activation');
    });
  });

  describe('generateFeatureMatrix', () => {
    it('should generate feature comparison matrix', () => {
      const matrix = generateFeatureMatrix();
      
      expect(matrix.categories).toContain('formation');
      expect(matrix.categories).toContain('payroll');
      expect(matrix.services.length).toBeGreaterThan(0);
      expect(matrix.services[0]).toHaveProperty('standalone');
      expect(matrix.services[0]).toHaveProperty('connected');
      expect(matrix.services[0]).toHaveProperty('fullSuite');
    });
  });

  describe('getTierBenefits', () => {
    it('should return standalone tier benefits', () => {
      const benefits = getTierBenefits('standalone');
      expect(benefits.name).toBe('Standalone');
      expect(benefits.discount).toBe('0%');
      expect(benefits.benefits.length).toBeGreaterThan(0);
    });

    it('should return connected tier benefits', () => {
      const benefits = getTierBenefits('connected');
      expect(benefits.name).toBe('Connected');
      expect(benefits.discount).toBe('10%');
    });

    it('should return full suite tier benefits', () => {
      const benefits = getTierBenefits('full_suite');
      expect(benefits.name).toBe('Full Suite');
      expect(benefits.discount).toBe('20%');
    });
  });
});
