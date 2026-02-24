// Bulk Import/Export Service - Handle bulk data operations

export type DataType = 
  | 'employees'
  | 'documents'
  | 'transactions'
  | 'entities'
  | 'grants'
  | 'tasks'
  | 'contacts'
  | 'assets';

export type ExportFormat = 'csv' | 'xlsx' | 'json';

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'date' | 'number' | 'boolean';
  required?: boolean;
  defaultValue?: string;
}

export interface ImportTemplate {
  id: string;
  name: string;
  dataType: DataType;
  description: string;
  fields: FieldMapping[];
  sampleData: Record<string, any>[];
  createdAt: number;
}

export interface ImportJob {
  id: string;
  templateId?: string;
  dataType: DataType;
  fileName: string;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  startedAt: number;
  completedAt?: number;
  createdBy: string;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
}

export interface ExportJob {
  id: string;
  dataType: DataType;
  format: ExportFormat;
  filters?: Record<string, any>;
  fields?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  fileName?: string;
  fileUrl?: string;
  startedAt: number;
  completedAt?: number;
  createdBy: string;
}

export interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  preview: Record<string, any>[];
}

// Default field mappings for each data type
const DEFAULT_TEMPLATES: Record<DataType, FieldMapping[]> = {
  employees: [
    { sourceField: 'first_name', targetField: 'firstName', required: true },
    { sourceField: 'last_name', targetField: 'lastName', required: true },
    { sourceField: 'email', targetField: 'email', required: true },
    { sourceField: 'phone', targetField: 'phone' },
    { sourceField: 'department', targetField: 'department' },
    { sourceField: 'position', targetField: 'position' },
    { sourceField: 'hire_date', targetField: 'hireDate', transform: 'date' },
    { sourceField: 'salary', targetField: 'salary', transform: 'number' },
    { sourceField: 'status', targetField: 'status', defaultValue: 'active' },
  ],
  documents: [
    { sourceField: 'title', targetField: 'title', required: true },
    { sourceField: 'description', targetField: 'description' },
    { sourceField: 'category', targetField: 'category' },
    { sourceField: 'tags', targetField: 'tags' },
    { sourceField: 'entity_id', targetField: 'entityId' },
    { sourceField: 'file_url', targetField: 'fileUrl' },
  ],
  transactions: [
    { sourceField: 'date', targetField: 'date', required: true, transform: 'date' },
    { sourceField: 'amount', targetField: 'amount', required: true, transform: 'number' },
    { sourceField: 'type', targetField: 'type', required: true },
    { sourceField: 'category', targetField: 'category' },
    { sourceField: 'description', targetField: 'description' },
    { sourceField: 'entity_id', targetField: 'entityId' },
    { sourceField: 'reference', targetField: 'reference' },
  ],
  entities: [
    { sourceField: 'name', targetField: 'name', required: true },
    { sourceField: 'type', targetField: 'type', required: true },
    { sourceField: 'description', targetField: 'description' },
    { sourceField: 'parent_id', targetField: 'parentId' },
    { sourceField: 'status', targetField: 'status', defaultValue: 'active' },
  ],
  grants: [
    { sourceField: 'name', targetField: 'name', required: true },
    { sourceField: 'funder', targetField: 'funder' },
    { sourceField: 'amount', targetField: 'amount', transform: 'number' },
    { sourceField: 'deadline', targetField: 'deadline', transform: 'date' },
    { sourceField: 'status', targetField: 'status' },
    { sourceField: 'category', targetField: 'category' },
  ],
  tasks: [
    { sourceField: 'title', targetField: 'title', required: true },
    { sourceField: 'description', targetField: 'description' },
    { sourceField: 'assignee', targetField: 'assignee' },
    { sourceField: 'due_date', targetField: 'dueDate', transform: 'date' },
    { sourceField: 'priority', targetField: 'priority', defaultValue: 'medium' },
    { sourceField: 'status', targetField: 'status', defaultValue: 'pending' },
  ],
  contacts: [
    { sourceField: 'name', targetField: 'name', required: true },
    { sourceField: 'email', targetField: 'email' },
    { sourceField: 'phone', targetField: 'phone' },
    { sourceField: 'company', targetField: 'company' },
    { sourceField: 'role', targetField: 'role' },
    { sourceField: 'type', targetField: 'type' },
  ],
  assets: [
    { sourceField: 'name', targetField: 'name', required: true },
    { sourceField: 'type', targetField: 'type' },
    { sourceField: 'value', targetField: 'value', transform: 'number' },
    { sourceField: 'purchase_date', targetField: 'purchaseDate', transform: 'date' },
    { sourceField: 'location', targetField: 'location' },
    { sourceField: 'status', targetField: 'status' },
  ],
};

const STORAGE_KEY = 'bulk_operations_state';

class BulkOperationsService {
  private importJobs: ImportJob[] = [];
  private exportJobs: ExportJob[] = [];
  private templates: ImportTemplate[] = [];

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        this.importJobs = state.importJobs || [];
        this.exportJobs = state.exportJobs || [];
        this.templates = state.templates || [];
      }
    } catch (error) {
      console.error('Failed to load bulk operations state:', error);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        importJobs: this.importJobs,
        exportJobs: this.exportJobs,
        templates: this.templates,
      }));
    } catch (error) {
      console.error('Failed to save bulk operations state:', error);
    }
  }

  // Get default field mappings for a data type
  getDefaultMappings(dataType: DataType): FieldMapping[] {
    return DEFAULT_TEMPLATES[dataType] || [];
  }

  // Generate sample CSV content for a data type
  generateSampleCSV(dataType: DataType): string {
    const mappings = this.getDefaultMappings(dataType);
    const headers = mappings.map(m => m.sourceField).join(',');
    
    // Generate sample row
    const sampleRow = mappings.map(m => {
      switch (m.targetField) {
        case 'firstName': return 'John';
        case 'lastName': return 'Doe';
        case 'email': return 'john.doe@example.com';
        case 'phone': return '555-123-4567';
        case 'date':
        case 'hireDate':
        case 'dueDate':
        case 'purchaseDate':
        case 'deadline':
          return '2024-01-15';
        case 'amount':
        case 'salary':
        case 'value':
          return '50000';
        case 'status': return 'active';
        case 'priority': return 'medium';
        case 'type': return 'standard';
        default: return `Sample ${m.targetField}`;
      }
    }).join(',');

    return `${headers}\n${sampleRow}`;
  }

  // Download sample template
  downloadTemplate(dataType: DataType): void {
    const csv = this.generateSampleCSV(dataType);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataType}_import_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Parse CSV content
  parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      rows.push(row);
    }

    return { headers, rows };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  // Validate import data
  validateImport(
    dataType: DataType,
    data: Record<string, string>[],
    mappings?: FieldMapping[]
  ): ValidationResult {
    const fieldMappings = mappings || this.getDefaultMappings(dataType);
    const errors: ImportError[] = [];
    const warnings: ImportWarning[] = [];
    let validRows = 0;

    data.forEach((row, index) => {
      const rowNum = index + 2; // Account for header row
      let rowValid = true;

      fieldMappings.forEach(mapping => {
        const value = row[mapping.sourceField] || '';

        // Check required fields
        if (mapping.required && !value) {
          errors.push({
            row: rowNum,
            field: mapping.sourceField,
            value: '',
            message: `Required field "${mapping.sourceField}" is empty`,
          });
          rowValid = false;
        }

        // Validate transforms
        if (value && mapping.transform) {
          switch (mapping.transform) {
            case 'number':
              if (isNaN(Number(value))) {
                errors.push({
                  row: rowNum,
                  field: mapping.sourceField,
                  value,
                  message: `Invalid number format`,
                });
                rowValid = false;
              }
              break;
            case 'date':
              if (isNaN(Date.parse(value))) {
                errors.push({
                  row: rowNum,
                  field: mapping.sourceField,
                  value,
                  message: `Invalid date format`,
                });
                rowValid = false;
              }
              break;
            case 'boolean':
              if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) {
                warnings.push({
                  row: rowNum,
                  field: mapping.sourceField,
                  message: `Value "${value}" will be converted to boolean`,
                });
              }
              break;
          }
        }
      });

      if (rowValid) validRows++;
    });

    return {
      isValid: errors.length === 0,
      totalRows: data.length,
      validRows,
      errors,
      warnings,
      preview: data.slice(0, 5),
    };
  }

  // Transform data according to mappings
  transformData(
    data: Record<string, string>[],
    mappings: FieldMapping[]
  ): Record<string, any>[] {
    return data.map(row => {
      const transformed: Record<string, any> = {};

      mappings.forEach(mapping => {
        let value: any = row[mapping.sourceField] || mapping.defaultValue || '';

        if (value && mapping.transform) {
          switch (mapping.transform) {
            case 'uppercase':
              value = value.toUpperCase();
              break;
            case 'lowercase':
              value = value.toLowerCase();
              break;
            case 'trim':
              value = value.trim();
              break;
            case 'number':
              value = Number(value);
              break;
            case 'date':
              value = new Date(value).toISOString();
              break;
            case 'boolean':
              value = ['true', '1', 'yes'].includes(value.toLowerCase());
              break;
          }
        }

        transformed[mapping.targetField] = value;
      });

      return transformed;
    });
  }

  // Create import job
  async createImportJob(
    dataType: DataType,
    fileName: string,
    data: Record<string, string>[],
    mappings?: FieldMapping[]
  ): Promise<ImportJob> {
    const job: ImportJob = {
      id: `import_${Date.now()}`,
      dataType,
      fileName,
      status: 'pending',
      totalRows: data.length,
      processedRows: 0,
      successRows: 0,
      errorRows: 0,
      errors: [],
      warnings: [],
      startedAt: Date.now(),
      createdBy: 'current_user',
    };

    this.importJobs.unshift(job);
    this.saveState();

    // Simulate processing
    await this.processImportJob(job, data, mappings);

    return job;
  }

  private async processImportJob(
    job: ImportJob,
    data: Record<string, string>[],
    mappings?: FieldMapping[]
  ): Promise<void> {
    const fieldMappings = mappings || this.getDefaultMappings(job.dataType);
    
    job.status = 'validating';
    this.saveState();

    // Validate
    const validation = this.validateImport(job.dataType, data, fieldMappings);
    job.errors = validation.errors;
    job.warnings = validation.warnings;

    if (!validation.isValid) {
      job.status = 'failed';
      job.completedAt = Date.now();
      this.saveState();
      return;
    }

    job.status = 'processing';
    this.saveState();

    // Simulate processing rows
    const transformedData = this.transformData(data, fieldMappings);
    
    for (let i = 0; i < transformedData.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing time
      job.processedRows = i + 1;
      job.successRows = i + 1;
      this.saveState();
    }

    job.status = 'completed';
    job.completedAt = Date.now();
    this.saveState();
  }

  // Create export job
  async createExportJob(
    dataType: DataType,
    format: ExportFormat,
    filters?: Record<string, any>,
    fields?: string[]
  ): Promise<ExportJob> {
    const job: ExportJob = {
      id: `export_${Date.now()}`,
      dataType,
      format,
      filters,
      fields,
      status: 'pending',
      totalRecords: 0,
      startedAt: Date.now(),
      createdBy: 'current_user',
    };

    this.exportJobs.unshift(job);
    this.saveState();

    // Simulate export processing
    await this.processExportJob(job);

    return job;
  }

  private async processExportJob(job: ExportJob): Promise<void> {
    job.status = 'processing';
    this.saveState();

    // Simulate generating export
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate sample data
    const sampleCount = Math.floor(Math.random() * 100) + 50;
    job.totalRecords = sampleCount;
    job.fileName = `${job.dataType}_export_${Date.now()}.${job.format}`;
    job.fileUrl = `#download_${job.fileName}`;
    job.status = 'completed';
    job.completedAt = Date.now();
    this.saveState();
  }

  // Get all import jobs
  getImportJobs(): ImportJob[] {
    return this.importJobs;
  }

  // Get all export jobs
  getExportJobs(): ExportJob[] {
    return this.exportJobs;
  }

  // Get job by ID
  getImportJob(id: string): ImportJob | undefined {
    return this.importJobs.find(j => j.id === id);
  }

  getExportJob(id: string): ExportJob | undefined {
    return this.exportJobs.find(j => j.id === id);
  }

  // Cancel import job
  cancelImportJob(id: string): boolean {
    const job = this.importJobs.find(j => j.id === id);
    if (job && ['pending', 'validating', 'processing'].includes(job.status)) {
      job.status = 'cancelled';
      job.completedAt = Date.now();
      this.saveState();
      return true;
    }
    return false;
  }

  // Delete job
  deleteImportJob(id: string): void {
    this.importJobs = this.importJobs.filter(j => j.id !== id);
    this.saveState();
  }

  deleteExportJob(id: string): void {
    this.exportJobs = this.exportJobs.filter(j => j.id !== id);
    this.saveState();
  }

  // Save custom template
  saveTemplate(template: Omit<ImportTemplate, 'id' | 'createdAt'>): ImportTemplate {
    const newTemplate: ImportTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: Date.now(),
    };
    this.templates.push(newTemplate);
    this.saveState();
    return newTemplate;
  }

  // Get templates
  getTemplates(dataType?: DataType): ImportTemplate[] {
    if (dataType) {
      return this.templates.filter(t => t.dataType === dataType);
    }
    return this.templates;
  }

  // Delete template
  deleteTemplate(id: string): void {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveState();
  }

  // Get statistics
  getStatistics(): {
    totalImports: number;
    successfulImports: number;
    failedImports: number;
    totalExports: number;
    totalRecordsImported: number;
    totalRecordsExported: number;
  } {
    const successfulImports = this.importJobs.filter(j => j.status === 'completed').length;
    const failedImports = this.importJobs.filter(j => j.status === 'failed').length;
    const totalRecordsImported = this.importJobs
      .filter(j => j.status === 'completed')
      .reduce((sum, j) => sum + j.successRows, 0);
    const totalRecordsExported = this.exportJobs
      .filter(j => j.status === 'completed')
      .reduce((sum, j) => sum + j.totalRecords, 0);

    return {
      totalImports: this.importJobs.length,
      successfulImports,
      failedImports,
      totalExports: this.exportJobs.length,
      totalRecordsImported,
      totalRecordsExported,
    };
  }
}

export const bulkOperationsService = new BulkOperationsService();
