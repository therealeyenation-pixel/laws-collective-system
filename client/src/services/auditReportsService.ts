// Audit Reports Service
// Automated compliance report generation for SOC 2, GDPR, and regulatory audits

export interface AuditReport {
  id: string;
  name: string;
  type: AuditReportType;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  period: { start: Date; end: Date };
  generatedAt?: Date;
  generatedBy: string;
  sections: AuditSection[];
  findings: AuditFinding[];
  score?: number;
  exportFormat?: 'pdf' | 'excel' | 'json';
}

export type AuditReportType = 
  | 'soc2_type1'
  | 'soc2_type2'
  | 'gdpr_compliance'
  | 'hipaa_compliance'
  | 'pci_dss'
  | 'iso27001'
  | 'internal_audit'
  | 'access_review'
  | 'data_privacy';

export interface AuditSection {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_applicable';
  controls: AuditControl[];
  evidence: AuditEvidence[];
}

export interface AuditControl {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'not_tested';
  testDate?: Date;
  notes?: string;
}

export interface AuditEvidence {
  id: string;
  type: 'document' | 'screenshot' | 'log' | 'configuration';
  name: string;
  url?: string;
  collectedAt: Date;
}

export interface AuditFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  dueDate?: Date;
  assignedTo?: string;
}

export interface ScheduledAudit {
  id: string;
  reportType: AuditReportType;
  frequency: 'monthly' | 'quarterly' | 'annually';
  nextRun: Date;
  recipients: string[];
  isActive: boolean;
}

const AUDIT_TEMPLATES: Record<AuditReportType, { name: string; sections: string[] }> = {
  soc2_type1: {
    name: 'SOC 2 Type I',
    sections: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy']
  },
  soc2_type2: {
    name: 'SOC 2 Type II',
    sections: ['Security', 'Availability', 'Processing Integrity', 'Confidentiality', 'Privacy', 'Operating Effectiveness']
  },
  gdpr_compliance: {
    name: 'GDPR Compliance',
    sections: ['Data Processing', 'Consent Management', 'Data Subject Rights', 'Data Protection', 'Breach Notification', 'International Transfers']
  },
  hipaa_compliance: {
    name: 'HIPAA Compliance',
    sections: ['Administrative Safeguards', 'Physical Safeguards', 'Technical Safeguards', 'Breach Notification']
  },
  pci_dss: {
    name: 'PCI DSS',
    sections: ['Network Security', 'Data Protection', 'Vulnerability Management', 'Access Control', 'Monitoring', 'Security Policy']
  },
  iso27001: {
    name: 'ISO 27001',
    sections: ['Information Security Policies', 'Asset Management', 'Access Control', 'Cryptography', 'Operations Security', 'Incident Management']
  },
  internal_audit: {
    name: 'Internal Audit',
    sections: ['Financial Controls', 'Operational Controls', 'Compliance', 'Risk Management']
  },
  access_review: {
    name: 'Access Review',
    sections: ['User Access', 'Privileged Access', 'Service Accounts', 'Third-Party Access']
  },
  data_privacy: {
    name: 'Data Privacy Assessment',
    sections: ['Data Inventory', 'Privacy Policies', 'Consent Records', 'Retention Compliance', 'Subject Requests']
  }
};

class AuditReportsService {
  private readonly REPORTS_KEY = 'audit_reports';
  private readonly SCHEDULES_KEY = 'audit_schedules';

  // Report Generation
  generateReport(type: AuditReportType, period: { start: Date; end: Date }, userId: string): AuditReport {
    const template = AUDIT_TEMPLATES[type];
    const report: AuditReport = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} Report - ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}`,
      type,
      status: 'generating',
      period,
      generatedBy: userId,
      sections: template.sections.map((title, index) => this.generateSection(title, index)),
      findings: []
    };

    const reports = this.getReports();
    reports.unshift(report);
    this.saveReports(reports);

    // Simulate generation
    setTimeout(() => {
      this.completeGeneration(report.id);
    }, 2000);

    return report;
  }

  private generateSection(title: string, index: number): AuditSection {
    const statuses: AuditSection['status'][] = ['compliant', 'compliant', 'compliant', 'partial', 'compliant'];
    return {
      id: `section_${index}_${Date.now()}`,
      title,
      description: `Assessment of ${title.toLowerCase()} controls and practices`,
      status: statuses[index % statuses.length],
      controls: this.generateControls(title),
      evidence: this.generateEvidence()
    };
  }

  private generateControls(sectionTitle: string): AuditControl[] {
    const controlNames = [
      'Policy Documentation',
      'Access Management',
      'Monitoring & Logging',
      'Incident Response',
      'Change Management'
    ];

    return controlNames.map((name, i) => ({
      id: `control_${i}_${Date.now()}`,
      name: `${sectionTitle} - ${name}`,
      description: `Verify ${name.toLowerCase()} procedures are in place`,
      status: ['pass', 'pass', 'pass', 'warning', 'pass'][i] as AuditControl['status'],
      testDate: new Date(),
      notes: i === 3 ? 'Minor improvement recommended' : undefined
    }));
  }

  private generateEvidence(): AuditEvidence[] {
    return [
      {
        id: `ev_${Date.now()}_1`,
        type: 'document',
        name: 'Security Policy v2.1',
        collectedAt: new Date()
      },
      {
        id: `ev_${Date.now()}_2`,
        type: 'log',
        name: 'Access Logs - Last 30 Days',
        collectedAt: new Date()
      }
    ];
  }

  private completeGeneration(reportId: string): void {
    const reports = this.getReports();
    const report = reports.find(r => r.id === reportId);
    if (report) {
      report.status = 'completed';
      report.generatedAt = new Date();
      report.score = this.calculateScore(report);
      report.findings = this.generateFindings(report);
      this.saveReports(reports);
    }
  }

  private calculateScore(report: AuditReport): number {
    const sectionScores = report.sections.map(s => {
      switch (s.status) {
        case 'compliant': return 100;
        case 'partial': return 70;
        case 'non_compliant': return 30;
        default: return 0;
      }
    });
    return Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length);
  }

  private generateFindings(report: AuditReport): AuditFinding[] {
    const findings: AuditFinding[] = [];
    report.sections.forEach(section => {
      section.controls.forEach(control => {
        if (control.status === 'fail') {
          findings.push({
            id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            severity: 'high',
            title: `${control.name} - Control Failure`,
            description: `The control "${control.name}" failed during testing.`,
            recommendation: 'Implement corrective actions immediately.',
            status: 'open'
          });
        } else if (control.status === 'warning') {
          findings.push({
            id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            severity: 'medium',
            title: `${control.name} - Improvement Needed`,
            description: control.notes || 'Minor issues identified during testing.',
            recommendation: 'Review and enhance existing procedures.',
            status: 'open'
          });
        }
      });
    });
    return findings;
  }

  // Report Management
  getReports(): AuditReport[] {
    const stored = localStorage.getItem(this.REPORTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((r: any) => ({
      ...r,
      period: { start: new Date(r.period.start), end: new Date(r.period.end) },
      generatedAt: r.generatedAt ? new Date(r.generatedAt) : undefined
    }));
  }

  getReport(id: string): AuditReport | null {
    return this.getReports().find(r => r.id === id) || null;
  }

  deleteReport(id: string): boolean {
    const reports = this.getReports().filter(r => r.id !== id);
    this.saveReports(reports);
    return true;
  }

  updateFinding(reportId: string, findingId: string, updates: Partial<AuditFinding>): boolean {
    const reports = this.getReports();
    const report = reports.find(r => r.id === reportId);
    if (!report) return false;

    const finding = report.findings.find(f => f.id === findingId);
    if (!finding) return false;

    Object.assign(finding, updates);
    this.saveReports(reports);
    return true;
  }

  // Scheduled Audits
  getScheduledAudits(): ScheduledAudit[] {
    const stored = localStorage.getItem(this.SCHEDULES_KEY);
    if (!stored) return this.getDefaultSchedules();
    return JSON.parse(stored).map((s: any) => ({
      ...s,
      nextRun: new Date(s.nextRun)
    }));
  }

  createSchedule(schedule: Omit<ScheduledAudit, 'id'>): ScheduledAudit {
    const schedules = this.getScheduledAudits();
    const newSchedule: ScheduledAudit = {
      ...schedule,
      id: `schedule_${Date.now()}`
    };
    schedules.push(newSchedule);
    this.saveSchedules(schedules);
    return newSchedule;
  }

  updateSchedule(id: string, updates: Partial<ScheduledAudit>): boolean {
    const schedules = this.getScheduledAudits();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) return false;
    schedules[index] = { ...schedules[index], ...updates };
    this.saveSchedules(schedules);
    return true;
  }

  deleteSchedule(id: string): boolean {
    const schedules = this.getScheduledAudits().filter(s => s.id !== id);
    this.saveSchedules(schedules);
    return true;
  }

  // Statistics
  getStats(): {
    totalReports: number;
    completedReports: number;
    averageScore: number;
    openFindings: number;
    criticalFindings: number;
  } {
    const reports = this.getReports();
    const completedReports = reports.filter(r => r.status === 'completed');
    const allFindings = reports.flatMap(r => r.findings);

    return {
      totalReports: reports.length,
      completedReports: completedReports.length,
      averageScore: completedReports.length > 0
        ? Math.round(completedReports.reduce((sum, r) => sum + (r.score || 0), 0) / completedReports.length)
        : 0,
      openFindings: allFindings.filter(f => f.status === 'open').length,
      criticalFindings: allFindings.filter(f => f.severity === 'critical' && f.status === 'open').length
    };
  }

  getAuditTypes(): { value: AuditReportType; label: string }[] {
    return Object.entries(AUDIT_TEMPLATES).map(([value, { name }]) => ({
      value: value as AuditReportType,
      label: name
    }));
  }

  // Private helpers
  private saveReports(reports: AuditReport[]): void {
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
  }

  private saveSchedules(schedules: ScheduledAudit[]): void {
    localStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(schedules));
  }

  private getDefaultSchedules(): ScheduledAudit[] {
    const defaults: ScheduledAudit[] = [
      {
        id: 'schedule_default_1',
        reportType: 'internal_audit',
        frequency: 'quarterly',
        nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        recipients: ['admin@company.com'],
        isActive: true
      }
    ];
    this.saveSchedules(defaults);
    return defaults;
  }
}

export const auditReportsService = new AuditReportsService();
