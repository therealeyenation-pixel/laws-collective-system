// OCR Document Import Service
// Handles scanning, OCR processing, and data extraction from uploaded documents

export interface OCRResult {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedText: string;
  confidence: number;
  pages: OCRPage[];
  extractedData: ExtractedData;
  errors?: string[];
}

export interface OCRPage {
  pageNumber: number;
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  type: 'paragraph' | 'heading' | 'table' | 'list' | 'signature';
}

export interface ExtractedData {
  documentType?: string;
  title?: string;
  date?: string;
  parties?: string[];
  amounts?: { value: number; currency: string; context: string }[];
  addresses?: string[];
  emails?: string[];
  phones?: string[];
  signatures?: { name: string; date?: string; position?: string }[];
  tables?: { headers: string[]; rows: string[][] }[];
  customFields?: Record<string, string>;
}

export interface ImportJob {
  id: string;
  files: File[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: OCRResult[];
  startedAt: Date;
  completedAt?: Date;
}

export interface ImportTemplate {
  id: string;
  name: string;
  documentType: string;
  fields: {
    name: string;
    type: 'text' | 'date' | 'number' | 'currency' | 'email' | 'phone';
    pattern?: string;
    required: boolean;
  }[];
}

class OCRImportService {
  private readonly RESULTS_KEY = 'ocr_results';
  private readonly JOBS_KEY = 'ocr_jobs';
  private readonly TEMPLATES_KEY = 'ocr_templates';

  // Default import templates
  private defaultTemplates: ImportTemplate[] = [
    {
      id: 'invoice',
      name: 'Invoice',
      documentType: 'financial',
      fields: [
        { name: 'Invoice Number', type: 'text', required: true },
        { name: 'Date', type: 'date', required: true },
        { name: 'Vendor', type: 'text', required: true },
        { name: 'Amount', type: 'currency', required: true },
        { name: 'Due Date', type: 'date', required: false },
      ],
    },
    {
      id: 'contract',
      name: 'Contract',
      documentType: 'legal',
      fields: [
        { name: 'Contract Title', type: 'text', required: true },
        { name: 'Effective Date', type: 'date', required: true },
        { name: 'Parties', type: 'text', required: true },
        { name: 'Term', type: 'text', required: false },
        { name: 'Value', type: 'currency', required: false },
      ],
    },
    {
      id: 'receipt',
      name: 'Receipt',
      documentType: 'financial',
      fields: [
        { name: 'Merchant', type: 'text', required: true },
        { name: 'Date', type: 'date', required: true },
        { name: 'Total', type: 'currency', required: true },
        { name: 'Payment Method', type: 'text', required: false },
      ],
    },
    {
      id: 'id-document',
      name: 'ID Document',
      documentType: 'identity',
      fields: [
        { name: 'Full Name', type: 'text', required: true },
        { name: 'Date of Birth', type: 'date', required: true },
        { name: 'ID Number', type: 'text', required: true },
        { name: 'Expiration Date', type: 'date', required: false },
      ],
    },
    {
      id: 'grant-letter',
      name: 'Grant Award Letter',
      documentType: 'grant',
      fields: [
        { name: 'Grant Name', type: 'text', required: true },
        { name: 'Award Amount', type: 'currency', required: true },
        { name: 'Award Date', type: 'date', required: true },
        { name: 'Grantor', type: 'text', required: true },
        { name: 'Project Period', type: 'text', required: false },
      ],
    },
  ];

  // Get stored results
  getResults(): OCRResult[] {
    const stored = localStorage.getItem(this.RESULTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((r: any) => ({
      ...r,
      uploadedAt: new Date(r.uploadedAt),
      processedAt: r.processedAt ? new Date(r.processedAt) : undefined,
    }));
  }

  // Save result
  saveResult(result: OCRResult): void {
    const results = this.getResults().filter(r => r.id !== result.id);
    results.unshift(result);
    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results.slice(0, 100)));
  }

  // Get import templates
  getTemplates(): ImportTemplate[] {
    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    const custom = stored ? JSON.parse(stored) : [];
    return [...this.defaultTemplates, ...custom];
  }

  // Save custom template
  saveTemplate(template: ImportTemplate): void {
    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    const templates = stored ? JSON.parse(stored) : [];
    const index = templates.findIndex((t: ImportTemplate) => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  // Process file with OCR
  async processFile(file: File, templateId?: string): Promise<OCRResult> {
    const result: OCRResult = {
      id: `ocr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date(),
      status: 'processing',
      extractedText: '',
      confidence: 0,
      pages: [],
      extractedData: {},
    };

    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would:
      // 1. Upload file to server
      // 2. Call OCR API (Google Vision, AWS Textract, or similar)
      // 3. Process and structure the results

      // Simulate extracted text based on file type
      const simulatedText = this.simulateOCR(file.name, file.type);
      
      result.extractedText = simulatedText.text;
      result.confidence = simulatedText.confidence;
      result.pages = simulatedText.pages;
      result.extractedData = this.extractDataFromText(simulatedText.text, templateId);
      result.status = 'completed';
      result.processedAt = new Date();

    } catch (error) {
      result.status = 'failed';
      result.errors = [(error as Error).message];
    }

    this.saveResult(result);
    return result;
  }

  // Simulate OCR processing
  private simulateOCR(fileName: string, fileType: string): {
    text: string;
    confidence: number;
    pages: OCRPage[];
  } {
    const isInvoice = fileName.toLowerCase().includes('invoice');
    const isContract = fileName.toLowerCase().includes('contract');
    const isReceipt = fileName.toLowerCase().includes('receipt');

    let text = '';
    if (isInvoice) {
      text = `INVOICE
Invoice Number: INV-2024-001234
Date: January 15, 2024
Due Date: February 15, 2024

Bill To:
The L.A.W.S. Collective
123 Main Street
Atlanta, GA 30301

From:
ABC Services LLC
456 Business Ave
New York, NY 10001

Description                    Amount
Professional Services         $5,000.00
Consulting Fee               $2,500.00
Materials                      $750.00

Subtotal:                    $8,250.00
Tax (8%):                      $660.00
Total Due:                   $8,910.00

Payment Terms: Net 30
Please make checks payable to ABC Services LLC`;
    } else if (isContract) {
      text = `SERVICE AGREEMENT

This Agreement is entered into as of January 1, 2024 ("Effective Date")

BETWEEN:
The L.A.W.S. Collective ("Client")
AND
Professional Services Inc. ("Provider")

1. SERVICES
Provider agrees to provide consulting services as described in Exhibit A.

2. TERM
This Agreement shall commence on the Effective Date and continue for a period of twelve (12) months.

3. COMPENSATION
Client shall pay Provider $10,000 per month for services rendered.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

IN WITNESS WHEREOF, the parties have executed this Agreement.

_______________________          _______________________
Client Signature                 Provider Signature
Date: _______________           Date: _______________`;
    } else if (isReceipt) {
      text = `RECEIPT

Store: Office Supplies Plus
Date: January 20, 2024
Transaction #: 789456123

Items:
Printer Paper (5 reams)    $45.00
Ink Cartridges (2)         $89.99
Folders (box)              $12.50
Pens (24 pack)              $8.99

Subtotal:                 $156.48
Tax:                       $12.52
Total:                    $169.00

Payment: Credit Card ****1234
Thank you for your purchase!`;
    } else {
      text = `Document: ${fileName}
Processed on: ${new Date().toLocaleDateString()}

This document has been scanned and processed using OCR technology.
The extracted text content would appear here.

For best results, ensure documents are:
- Clear and legible
- Properly oriented
- High resolution (300 DPI recommended)`;
    }

    return {
      text,
      confidence: 0.92 + Math.random() * 0.07,
      pages: [{
        pageNumber: 1,
        text,
        confidence: 0.92 + Math.random() * 0.07,
        blocks: [{
          text,
          boundingBox: { x: 0, y: 0, width: 612, height: 792 },
          confidence: 0.95,
          type: 'paragraph',
        }],
      }],
    };
  }

  // Extract structured data from text
  private extractDataFromText(text: string, templateId?: string): ExtractedData {
    const data: ExtractedData = {};

    // Extract dates
    const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2}, \d{4})\b/g;
    const dates = text.match(datePattern);
    if (dates && dates.length > 0) {
      data.date = dates[0];
    }

    // Extract amounts
    const amountPattern = /\$[\d,]+\.?\d*/g;
    const amounts = text.match(amountPattern);
    if (amounts) {
      data.amounts = amounts.map(a => ({
        value: parseFloat(a.replace(/[$,]/g, '')),
        currency: 'USD',
        context: 'Extracted from document',
      }));
    }

    // Extract emails
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailPattern);
    if (emails) {
      data.emails = emails;
    }

    // Extract phone numbers
    const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phonePattern);
    if (phones) {
      data.phones = phones;
    }

    // Detect document type
    if (text.toLowerCase().includes('invoice')) {
      data.documentType = 'Invoice';
    } else if (text.toLowerCase().includes('agreement') || text.toLowerCase().includes('contract')) {
      data.documentType = 'Contract';
    } else if (text.toLowerCase().includes('receipt')) {
      data.documentType = 'Receipt';
    }

    return data;
  }

  // Bulk import files
  async bulkImport(files: File[], templateId?: string): Promise<ImportJob> {
    const job: ImportJob = {
      id: `job-${Date.now()}`,
      files,
      status: 'processing',
      progress: 0,
      results: [],
      startedAt: new Date(),
    };

    for (let i = 0; i < files.length; i++) {
      const result = await this.processFile(files[i], templateId);
      job.results.push(result);
      job.progress = ((i + 1) / files.length) * 100;
    }

    job.status = 'completed';
    job.completedAt = new Date();

    return job;
  }

  // Detect document type from content
  detectDocumentType(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('invoice') || lowerText.includes('bill to')) {
      return 'invoice';
    }
    if (lowerText.includes('agreement') || lowerText.includes('contract') || lowerText.includes('hereby')) {
      return 'contract';
    }
    if (lowerText.includes('receipt') || lowerText.includes('transaction')) {
      return 'receipt';
    }
    if (lowerText.includes('grant') || lowerText.includes('award')) {
      return 'grant-letter';
    }
    
    return 'general';
  }

  // Clear results
  clearResults(): void {
    localStorage.removeItem(this.RESULTS_KEY);
  }
}

export const ocrImportService = new OCRImportService();
export default ocrImportService;
