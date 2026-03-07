import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOnboardingWorkflow,
  startOnboardingWorkflow,
  completeOnboardingTask,
  skipOnboardingTask,
  runAutomatedOnboardingTasks,
  createOffboardingWorkflow,
  startOffboardingWorkflow,
  completeOffboardingTask,
  runAutomatedOffboardingTasks,
  scheduleExitInterview,
  completeExitInterview,
  provisionEquipment,
  returnEquipment,
  getEmployeeEquipment,
  provisionSoftwareLicense,
  revokeSoftwareLicense,
  getEmployeeLicenses,
  provisionAccess,
  revokeAccess,
  revokeAllAccess,
  getEmployeeAccess,
  getOnboardingWorkflow,
  getOffboardingWorkflow,
  listOnboardingWorkflows,
  listOffboardingWorkflows,
  getOnboardingStats,
  getOffboardingStats,
  createOnboardingTemplate,
  createOffboardingTemplate,
  listOnboardingTemplates,
  listOffboardingTemplates,
  getDefaultOnboardingTasks,
  getDefaultOffboardingTasks,
  clearAllData,
} from './onboarding-offboarding';

describe('Onboarding/Offboarding System', () => {
  beforeEach(() => {
    clearAllData();
  });

  describe('Onboarding Workflows', () => {
    const baseOnboardingParams = {
      employeeId: 'emp-001',
      employeeName: 'John Smith',
      employeeEmail: 'john.smith@example.com',
      positionId: 'pos-001',
      positionTitle: 'Software Engineer',
      departmentId: 'dept-001',
      departmentName: 'Engineering',
      entityId: 'entity-001',
      entityName: 'The The L.A.W.S. Collective',
      hireDate: new Date('2026-02-01'),
      startDate: new Date('2026-02-15'),
      managerId: 'mgr-001',
      managerName: 'Jane Doe',
    };

    it('should create an onboarding workflow with default tasks', () => {
      const workflow = createOnboardingWorkflow(baseOnboardingParams);
      
      expect(workflow.id).toBeDefined();
      expect(workflow.employeeName).toBe('John Smith');
      expect(workflow.positionTitle).toBe('Software Engineer');
      expect(workflow.status).toBe('pending');
      expect(workflow.tasks.length).toBeGreaterThan(0);
      expect(workflow.tasks.every(t => t.status === 'pending')).toBe(true);
    });

    it('should start an onboarding workflow', () => {
      const workflow = createOnboardingWorkflow(baseOnboardingParams);
      const started = startOnboardingWorkflow(workflow.id);
      
      expect(started.status).toBe('in_progress');
      // Tasks with no dependencies should be in_progress
      const tasksWithNoDeps = started.tasks.filter(t => t.dependencies.length === 0);
      expect(tasksWithNoDeps.every(t => t.status === 'in_progress')).toBe(true);
    });

    it('should complete an onboarding task', () => {
      const workflow = createOnboardingWorkflow(baseOnboardingParams);
      startOnboardingWorkflow(workflow.id);
      
      const firstTask = workflow.tasks[0];
      const updated = completeOnboardingTask(workflow.id, firstTask.id, 'hr-user-001', 'Verified documents');
      
      const completedTask = updated.tasks.find(t => t.id === firstTask.id);
      expect(completedTask?.status).toBe('completed');
      expect(completedTask?.completedBy).toBe('hr-user-001');
      expect(completedTask?.notes).toBe('Verified documents');
    });

    it('should skip an onboarding task', () => {
      const workflow = createOnboardingWorkflow(baseOnboardingParams);
      startOnboardingWorkflow(workflow.id);
      
      const task = workflow.tasks.find(t => t.title.includes('parking'));
      if (task) {
        const updated = skipOnboardingTask(workflow.id, task.id, 'Employee works remotely');
        const skippedTask = updated.tasks.find(t => t.id === task.id);
        expect(skippedTask?.status).toBe('skipped');
        expect(skippedTask?.notes).toBe('Employee works remotely');
      }
    });

    it('should run automated tasks', () => {
      const workflow = createOnboardingWorkflow(baseOnboardingParams);
      startOnboardingWorkflow(workflow.id);
      
      const result = runAutomatedOnboardingTasks(workflow.id);
      
      expect(result.tasksRun).toBeGreaterThan(0);
      expect(result.tasksSucceeded + result.tasksFailed).toBe(result.tasksRun);
    });

    it('should complete workflow when all tasks are done', () => {
      const workflow = createOnboardingWorkflow(baseOnboardingParams);
      startOnboardingWorkflow(workflow.id);
      
      // Complete all tasks
      workflow.tasks.forEach(task => {
        completeOnboardingTask(workflow.id, task.id, 'system');
      });
      
      const completed = getOnboardingWorkflow(workflow.id);
      expect(completed?.status).toBe('completed');
      expect(completed?.completedAt).toBeDefined();
    });

    it('should list onboarding workflows with filters', () => {
      createOnboardingWorkflow(baseOnboardingParams);
      createOnboardingWorkflow({ ...baseOnboardingParams, entityId: 'entity-002', entityName: 'Other Entity' });
      
      const all = listOnboardingWorkflows();
      expect(all.length).toBe(2);
      
      const filtered = listOnboardingWorkflows({ entityId: 'entity-001' });
      expect(filtered.length).toBe(1);
    });
  });

  describe('Offboarding Workflows', () => {
    const baseOffboardingParams = {
      employeeId: 'emp-002',
      employeeName: 'Jane Doe',
      employeeEmail: 'jane.doe@example.com',
      positionId: 'pos-002',
      positionTitle: 'Marketing Manager',
      departmentId: 'dept-002',
      departmentName: 'Marketing',
      entityId: 'entity-001',
      entityName: 'The The L.A.W.S. Collective',
      terminationDate: new Date('2026-03-01'),
      lastWorkingDay: new Date('2026-03-15'),
      terminationType: 'resignation' as const,
    };

    it('should create an offboarding workflow with default tasks', () => {
      const workflow = createOffboardingWorkflow(baseOffboardingParams);
      
      expect(workflow.id).toBeDefined();
      expect(workflow.employeeName).toBe('Jane Doe');
      expect(workflow.terminationType).toBe('resignation');
      expect(workflow.status).toBe('pending');
      expect(workflow.tasks.length).toBeGreaterThan(0);
      expect(workflow.exitInterviewScheduled).toBe(false);
      expect(workflow.exitInterviewCompleted).toBe(false);
    });

    it('should start an offboarding workflow', () => {
      const workflow = createOffboardingWorkflow(baseOffboardingParams);
      const started = startOffboardingWorkflow(workflow.id);
      
      expect(started.status).toBe('in_progress');
    });

    it('should complete an offboarding task', () => {
      const workflow = createOffboardingWorkflow(baseOffboardingParams);
      startOffboardingWorkflow(workflow.id);
      
      const firstTask = workflow.tasks[0];
      const updated = completeOffboardingTask(workflow.id, firstTask.id, 'hr-user-001');
      
      const completedTask = updated.tasks.find(t => t.id === firstTask.id);
      expect(completedTask?.status).toBe('completed');
    });

    it('should run automated offboarding tasks', () => {
      const workflow = createOffboardingWorkflow(baseOffboardingParams);
      startOffboardingWorkflow(workflow.id);
      
      const result = runAutomatedOffboardingTasks(workflow.id);
      
      expect(result.tasksRun).toBeGreaterThan(0);
    });

    it('should schedule and complete exit interview', () => {
      const workflow = createOffboardingWorkflow(baseOffboardingParams);
      startOffboardingWorkflow(workflow.id);
      
      const scheduledDate = new Date('2026-03-10');
      scheduleExitInterview(workflow.id, scheduledDate);
      
      let updated = getOffboardingWorkflow(workflow.id);
      expect(updated?.exitInterviewScheduled).toBe(true);
      
      completeExitInterview(workflow.id, 'Employee provided valuable feedback');
      
      updated = getOffboardingWorkflow(workflow.id);
      expect(updated?.exitInterviewCompleted).toBe(true);
    });

    it('should list offboarding workflows by termination type', () => {
      createOffboardingWorkflow(baseOffboardingParams);
      createOffboardingWorkflow({ ...baseOffboardingParams, terminationType: 'retirement' });
      
      const resignations = listOffboardingWorkflows({ terminationType: 'resignation' });
      expect(resignations.length).toBe(1);
      
      const retirements = listOffboardingWorkflows({ terminationType: 'retirement' });
      expect(retirements.length).toBe(1);
    });
  });

  describe('Equipment Provisioning', () => {
    it('should provision equipment to an employee', () => {
      const equipment = provisionEquipment('workflow-001', {
        assetId: 'asset-001',
        assetTag: 'EQP-2026-001',
        assetName: 'Dell Latitude 5540',
        category: 'technology',
        assignedDate: new Date(),
        condition: 'new',
      });
      
      expect(equipment.assetTag).toBe('EQP-2026-001');
      expect(equipment.condition).toBe('new');
    });

    it('should return equipment', () => {
      provisionEquipment('workflow-001', {
        assetId: 'asset-001',
        assetTag: 'EQP-2026-001',
        assetName: 'Dell Latitude 5540',
        category: 'technology',
        assignedDate: new Date(),
        condition: 'new',
      });
      
      const returned = returnEquipment('workflow-001', 'asset-001', 'good');
      
      expect(returned?.returnedDate).toBeDefined();
      expect(returned?.condition).toBe('good');
    });

    it('should get all employee equipment', () => {
      provisionEquipment('workflow-001', {
        assetId: 'asset-001',
        assetTag: 'EQP-2026-001',
        assetName: 'Dell Latitude 5540',
        category: 'technology',
        assignedDate: new Date(),
        condition: 'new',
      });
      provisionEquipment('workflow-001', {
        assetId: 'asset-002',
        assetTag: 'EQP-2026-002',
        assetName: 'Monitor',
        category: 'technology',
        assignedDate: new Date(),
        condition: 'new',
      });
      
      const equipment = getEmployeeEquipment('workflow-001');
      expect(equipment.length).toBe(2);
    });
  });

  describe('Software License Provisioning', () => {
    it('should provision software license', () => {
      const license = provisionSoftwareLicense('workflow-001', {
        licenseId: 'lic-001',
        softwareName: 'Microsoft 365',
        seatId: 'seat-001',
        assignedDate: new Date(),
      });
      
      expect(license.softwareName).toBe('Microsoft 365');
    });

    it('should revoke software license', () => {
      provisionSoftwareLicense('workflow-001', {
        licenseId: 'lic-001',
        softwareName: 'Microsoft 365',
        seatId: 'seat-001',
        assignedDate: new Date(),
      });
      
      const revoked = revokeSoftwareLicense('workflow-001', 'lic-001');
      
      expect(revoked?.revokedDate).toBeDefined();
    });

    it('should get all employee licenses', () => {
      provisionSoftwareLicense('workflow-001', {
        licenseId: 'lic-001',
        softwareName: 'Microsoft 365',
        seatId: 'seat-001',
        assignedDate: new Date(),
      });
      provisionSoftwareLicense('workflow-001', {
        licenseId: 'lic-002',
        softwareName: 'Adobe Creative Cloud',
        seatId: 'seat-002',
        assignedDate: new Date(),
      });
      
      const licenses = getEmployeeLicenses('workflow-001');
      expect(licenses.length).toBe(2);
    });
  });

  describe('Access Provisioning', () => {
    it('should provision access', () => {
      const access = provisionAccess('workflow-001', {
        accessId: 'access-001',
        accessType: 'building',
        resourceName: 'Main Office',
        accessLevel: 'full',
        grantedDate: new Date(),
      });
      
      expect(access.resourceName).toBe('Main Office');
      expect(access.accessLevel).toBe('full');
    });

    it('should revoke specific access', () => {
      provisionAccess('workflow-001', {
        accessId: 'access-001',
        accessType: 'building',
        resourceName: 'Main Office',
        accessLevel: 'full',
        grantedDate: new Date(),
      });
      
      const revoked = revokeAccess('workflow-001', 'access-001');
      
      expect(revoked?.revokedDate).toBeDefined();
    });

    it('should revoke all access', () => {
      provisionAccess('workflow-001', {
        accessId: 'access-001',
        accessType: 'building',
        resourceName: 'Main Office',
        accessLevel: 'full',
        grantedDate: new Date(),
      });
      provisionAccess('workflow-001', {
        accessId: 'access-002',
        accessType: 'system',
        resourceName: 'HR System',
        accessLevel: 'read',
        grantedDate: new Date(),
      });
      
      const allRevoked = revokeAllAccess('workflow-001');
      
      expect(allRevoked.every(a => a.revokedDate !== undefined)).toBe(true);
    });

    it('should get all employee access', () => {
      provisionAccess('workflow-001', {
        accessId: 'access-001',
        accessType: 'building',
        resourceName: 'Main Office',
        accessLevel: 'full',
        grantedDate: new Date(),
      });
      
      const access = getEmployeeAccess('workflow-001');
      expect(access.length).toBe(1);
    });
  });

  describe('Statistics', () => {
    it('should calculate onboarding stats', () => {
      const params = {
        employeeId: 'emp-001',
        employeeName: 'John Smith',
        employeeEmail: 'john@example.com',
        positionId: 'pos-001',
        positionTitle: 'Engineer',
        departmentId: 'dept-001',
        departmentName: 'Engineering',
        entityId: 'entity-001',
        entityName: 'Test Entity',
        hireDate: new Date(),
        startDate: new Date(),
      };
      
      createOnboardingWorkflow(params);
      const workflow2 = createOnboardingWorkflow({ ...params, employeeId: 'emp-002' });
      startOnboardingWorkflow(workflow2.id);
      
      const stats = getOnboardingStats();
      
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.inProgress).toBe(1);
    });

    it('should calculate offboarding stats', () => {
      const params = {
        employeeId: 'emp-001',
        employeeName: 'Jane Doe',
        employeeEmail: 'jane@example.com',
        positionId: 'pos-001',
        positionTitle: 'Manager',
        departmentId: 'dept-001',
        departmentName: 'Marketing',
        entityId: 'entity-001',
        entityName: 'Test Entity',
        terminationDate: new Date(),
        lastWorkingDay: new Date(),
        terminationType: 'resignation' as const,
      };
      
      createOffboardingWorkflow(params);
      createOffboardingWorkflow({ ...params, terminationType: 'retirement' });
      
      const stats = getOffboardingStats();
      
      expect(stats.total).toBe(2);
      expect(stats.byTerminationType['resignation']).toBe(1);
      expect(stats.byTerminationType['retirement']).toBe(1);
    });
  });

  describe('Templates', () => {
    it('should create onboarding template', () => {
      const template = createOnboardingTemplate({
        name: 'Engineering Onboarding',
        description: 'Template for engineering hires',
        positionType: 'engineering',
        tasks: [
          { category: 'it', title: 'Setup dev environment', description: 'Install IDE and tools', priority: 'high', dependencies: [], automatable: true, order: 1 },
        ],
        isDefault: false,
      });
      
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Engineering Onboarding');
    });

    it('should create offboarding template', () => {
      const template = createOffboardingTemplate({
        name: 'Standard Resignation',
        description: 'Template for voluntary resignations',
        terminationType: 'resignation',
        tasks: [
          { category: 'hr', title: 'Process final pay', description: 'Calculate final compensation', priority: 'critical', dependencies: [], automatable: false, order: 1 },
        ],
        isDefault: true,
      });
      
      expect(template.id).toBeDefined();
      expect(template.terminationType).toBe('resignation');
    });

    it('should list templates', () => {
      createOnboardingTemplate({
        name: 'Template 1',
        description: 'Test',
        positionType: 'general',
        tasks: [],
        isDefault: false,
      });
      createOnboardingTemplate({
        name: 'Template 2',
        description: 'Test',
        positionType: 'general',
        tasks: [],
        isDefault: false,
      });
      
      const templates = listOnboardingTemplates();
      expect(templates.length).toBe(2);
    });
  });

  describe('Default Tasks', () => {
    it('should return default onboarding tasks', () => {
      const tasks = getDefaultOnboardingTasks();
      
      expect(tasks.length).toBeGreaterThan(20);
      expect(tasks.some(t => t.category === 'hr')).toBe(true);
      expect(tasks.some(t => t.category === 'it')).toBe(true);
      expect(tasks.some(t => t.category === 'property')).toBe(true);
      expect(tasks.some(t => t.category === 'training')).toBe(true);
    });

    it('should return default offboarding tasks', () => {
      const tasks = getDefaultOffboardingTasks();
      
      expect(tasks.length).toBeGreaterThan(20);
      expect(tasks.some(t => t.title.includes('Disable'))).toBe(true);
      expect(tasks.some(t => t.title.includes('Collect'))).toBe(true);
      expect(tasks.some(t => t.title.includes('Revoke'))).toBe(true);
    });
  });
});
