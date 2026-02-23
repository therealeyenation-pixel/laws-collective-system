// AI Document Analysis Service
// Uses LLM to analyze documents, extract key terms, and provide suggestions

export interface DocumentAnalysis {
  id: string;
  documentId: string;
  documentName: string;
  analyzedAt: Date;
  summary: string;
  keyTerms: KeyTerm[];
  complianceFlags: ComplianceFlag[];
  suggestions: Suggestion[];
  entities: ExtractedEntity[];
  sentiment: 'positive' | 'neutral' | 'negative';
  riskLevel: 'low' | 'medium' | 'high';
  category: string;
}

export interface KeyTerm {
  term: string;
  definition?: string;
  importance: 'critical' | 'important' | 'standard';
  context: string;
  page?: number;
}

export interface ComplianceFlag {
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  regulation?: string;
  page?: number;
  recommendation: string;
}

export interface Suggestion {
  type: 'improvement' | 'clarification' | 'addition' | 'removal';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  originalText?: string;
  suggestedText?: string;
}

export interface ExtractedEntity {
  type: 'person' | 'organization' | 'date' | 'amount' | 'location' | 'clause';
  value: string;
  context: string;
  confidence: number;
}

export interface AnalysisRequest {
  documentId: string;
  documentName: string;
  documentType: string;
  content: string;
  options?: {
    extractTerms?: boolean;
    checkCompliance?: boolean;
    generateSuggestions?: boolean;
    extractEntities?: boolean;
  };
}

class AIDocumentAnalysisService {
  private readonly STORAGE_KEY = 'document_analyses';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Get cached analyses
  getCachedAnalyses(): DocumentAnalysis[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((a: any) => ({
      ...a,
      analyzedAt: new Date(a.analyzedAt),
    }));
  }

  // Get analysis for specific document
  getAnalysis(documentId: string): DocumentAnalysis | null {
    const analyses = this.getCachedAnalyses();
    return analyses.find(a => a.documentId === documentId) || null;
  }

  // Cache analysis
  cacheAnalysis(analysis: DocumentAnalysis): void {
    const analyses = this.getCachedAnalyses().filter(
      a => a.documentId !== analysis.documentId
    );
    analyses.unshift(analysis);
    // Keep only last 50 analyses
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analyses.slice(0, 50)));
  }

  // Analyze document (calls backend LLM)
  async analyzeDocument(request: AnalysisRequest): Promise<DocumentAnalysis> {
    // Check cache first
    const cached = this.getAnalysis(request.documentId);
    if (cached && (Date.now() - cached.analyzedAt.getTime()) < this.CACHE_DURATION) {
      return cached;
    }

    // Build analysis prompt based on document type
    const analysisPrompt = this.buildAnalysisPrompt(request);

    // In production, this would call the tRPC procedure that uses invokeLLM
    // For now, simulate analysis
    const analysis = await this.simulateAnalysis(request);
    
    this.cacheAnalysis(analysis);
    return analysis;
  }

  // Build analysis prompt based on document type
  private buildAnalysisPrompt(request: AnalysisRequest): string {
    const basePrompt = `Analyze the following ${request.documentType} document and provide:
1. A brief summary (2-3 sentences)
2. Key terms and their definitions
3. Any compliance concerns or red flags
4. Suggestions for improvement
5. Extracted entities (names, dates, amounts, organizations)

Document: "${request.documentName}"
Content:
${request.content.substring(0, 10000)}`;

    // Add document-type specific instructions
    switch (request.documentType.toLowerCase()) {
      case 'contract':
        return basePrompt + `\n\nFocus on: parties involved, obligations, terms, termination clauses, liability limitations, and payment terms.`;
      case 'grant':
        return basePrompt + `\n\nFocus on: eligibility requirements, funding amounts, deadlines, reporting requirements, and compliance obligations.`;
      case 'legal':
        return basePrompt + `\n\nFocus on: legal implications, jurisdiction, dispute resolution, and regulatory compliance.`;
      case 'financial':
        return basePrompt + `\n\nFocus on: financial figures, payment schedules, interest rates, and financial obligations.`;
      default:
        return basePrompt;
    }
  }

  // Simulate analysis (replace with actual LLM call in production)
  private async simulateAnalysis(request: AnalysisRequest): Promise<DocumentAnalysis> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const analysis: DocumentAnalysis = {
      id: `analysis-${Date.now()}`,
      documentId: request.documentId,
      documentName: request.documentName,
      analyzedAt: new Date(),
      summary: `This ${request.documentType} document outlines key terms and conditions. The document appears to be well-structured with clear definitions and obligations for all parties involved.`,
      keyTerms: [
        {
          term: 'Effective Date',
          definition: 'The date when the agreement becomes legally binding',
          importance: 'critical',
          context: 'Found in the preamble section',
        },
        {
          term: 'Term',
          definition: 'The duration of the agreement',
          importance: 'important',
          context: 'Defines the active period of the document',
        },
        {
          term: 'Confidentiality',
          definition: 'Obligations to protect sensitive information',
          importance: 'important',
          context: 'Standard clause for information protection',
        },
      ],
      complianceFlags: [
        {
          type: 'info',
          title: 'Review Recommended',
          description: 'Document should be reviewed by legal counsel before execution',
          recommendation: 'Schedule legal review within 5 business days',
        },
      ],
      suggestions: [
        {
          type: 'improvement',
          title: 'Add Dispute Resolution Clause',
          description: 'Consider adding a detailed dispute resolution mechanism',
          priority: 'medium',
        },
        {
          type: 'clarification',
          title: 'Define Key Terms',
          description: 'Some terms could benefit from clearer definitions',
          priority: 'low',
        },
      ],
      entities: [
        {
          type: 'organization',
          value: 'L.A.W.S. Collective',
          context: 'Primary party in the document',
          confidence: 0.95,
        },
        {
          type: 'date',
          value: new Date().toISOString().split('T')[0],
          context: 'Document date',
          confidence: 0.9,
        },
      ],
      sentiment: 'neutral',
      riskLevel: 'low',
      category: request.documentType,
    };

    return analysis;
  }

  // Extract key terms from text
  async extractKeyTerms(text: string): Promise<KeyTerm[]> {
    // In production, call LLM
    return [
      {
        term: 'Agreement',
        importance: 'critical',
        context: 'The binding contract between parties',
      },
      {
        term: 'Obligations',
        importance: 'important',
        context: 'Duties and responsibilities of each party',
      },
    ];
  }

  // Check compliance issues
  async checkCompliance(
    documentType: string,
    content: string
  ): Promise<ComplianceFlag[]> {
    // In production, call LLM with compliance rules
    const flags: ComplianceFlag[] = [];

    // Basic checks
    if (!content.toLowerCase().includes('signature')) {
      flags.push({
        type: 'warning',
        title: 'Missing Signature Block',
        description: 'Document does not appear to have a signature section',
        recommendation: 'Add signature blocks for all parties',
      });
    }

    if (!content.toLowerCase().includes('date')) {
      flags.push({
        type: 'warning',
        title: 'Missing Date',
        description: 'Document date is not clearly specified',
        recommendation: 'Add effective date and execution date fields',
      });
    }

    return flags;
  }

  // Generate improvement suggestions
  async generateSuggestions(
    documentType: string,
    content: string
  ): Promise<Suggestion[]> {
    // In production, call LLM
    return [
      {
        type: 'improvement',
        title: 'Add Table of Contents',
        description: 'For documents over 5 pages, a table of contents improves navigation',
        priority: 'low',
      },
    ];
  }

  // Summarize document
  async summarizeDocument(content: string, maxLength: number = 500): Promise<string> {
    // In production, call LLM
    const words = content.split(' ').slice(0, 100).join(' ');
    return `Document summary: ${words}...`;
  }

  // Compare two documents
  async compareDocuments(
    doc1: { name: string; content: string },
    doc2: { name: string; content: string }
  ): Promise<{
    similarities: string[];
    differences: string[];
    recommendations: string[];
  }> {
    // In production, call LLM
    return {
      similarities: ['Both documents contain standard legal language', 'Similar structure and formatting'],
      differences: ['Different effective dates', 'Varying payment terms'],
      recommendations: ['Reconcile payment terms between documents', 'Ensure consistent definitions'],
    };
  }

  // Clear analysis cache
  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const aiDocumentAnalysisService = new AIDocumentAnalysisService();
export default aiDocumentAnalysisService;
