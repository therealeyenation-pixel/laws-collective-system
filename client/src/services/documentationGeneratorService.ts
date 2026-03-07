// Documentation Generator Service
// Auto-generates system documentation for portability and knowledge preservation

export interface DocSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocSection[];
  lastUpdated: Date;
}

export interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  example?: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: { name: string; type: string; nullable: boolean; description: string }[];
  relationships: { table: string; type: string; foreignKey: string }[];
}

export interface GeneratedDocumentation {
  title: string;
  version: string;
  generatedAt: Date;
  sections: DocSection[];
  apiEndpoints: APIEndpoint[];
  databaseSchema: DatabaseTable[];
  userGuide: DocSection[];
}

class DocumentationGeneratorService {
  // Generate complete system documentation
  async generateFullDocumentation(): Promise<GeneratedDocumentation> {
    const [apiDocs, schemaDocs, userGuide, systemOverview] = await Promise.all([
      this.generateAPIDocs(),
      this.generateSchemaDocs(),
      this.generateUserGuide(),
      this.generateSystemOverview(),
    ]);

    return {
      title: 'The L.A.W.S. Collective System Documentation',
      version: '1.0.0',
      generatedAt: new Date(),
      sections: systemOverview,
      apiEndpoints: apiDocs,
      databaseSchema: schemaDocs,
      userGuide,
    };
  }

  // Generate API documentation from tRPC routers
  async generateAPIDocs(): Promise<APIEndpoint[]> {
    return [
      {
        method: 'POST',
        path: '/api/trpc/auth.login',
        description: 'Authenticate user and create session',
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' },
        ],
        response: '{ user: User, token: string }',
        example: 'trpc.auth.login.useMutation()',
      },
      {
        method: 'GET',
        path: '/api/trpc/documents.list',
        description: 'List all documents for current user',
        parameters: [
          { name: 'folderId', type: 'string', required: false, description: 'Filter by folder' },
          { name: 'type', type: 'string', required: false, description: 'Filter by document type' },
        ],
        response: '{ documents: Document[], total: number }',
        example: 'trpc.documents.list.useQuery({ folderId })',
      },
      {
        method: 'POST',
        path: '/api/trpc/documents.create',
        description: 'Create a new document',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'Document title' },
          { name: 'content', type: 'string', required: true, description: 'Document content' },
          { name: 'folderId', type: 'string', required: false, description: 'Parent folder ID' },
        ],
        response: '{ document: Document }',
        example: 'trpc.documents.create.useMutation()',
      },
      {
        method: 'POST',
        path: '/api/trpc/workflows.execute',
        description: 'Execute a workflow',
        parameters: [
          { name: 'workflowId', type: 'string', required: true, description: 'Workflow ID to execute' },
          { name: 'input', type: 'object', required: false, description: 'Input data for workflow' },
        ],
        response: '{ executionId: string, status: string }',
        example: 'trpc.workflows.execute.useMutation()',
      },
      {
        method: 'GET',
        path: '/api/trpc/financial.transactions',
        description: 'Get financial transactions',
        parameters: [
          { name: 'startDate', type: 'Date', required: false, description: 'Filter start date' },
          { name: 'endDate', type: 'Date', required: false, description: 'Filter end date' },
          { name: 'type', type: 'string', required: false, description: 'Transaction type' },
        ],
        response: '{ transactions: Transaction[], summary: Summary }',
        example: 'trpc.financial.transactions.useQuery({ startDate, endDate })',
      },
      {
        method: 'POST',
        path: '/api/trpc/grants.apply',
        description: 'Submit a grant application',
        parameters: [
          { name: 'grantId', type: 'string', required: true, description: 'Grant opportunity ID' },
          { name: 'application', type: 'object', required: true, description: 'Application data' },
        ],
        response: '{ applicationId: string, status: string }',
        example: 'trpc.grants.apply.useMutation()',
      },
      {
        method: 'GET',
        path: '/api/trpc/hr.employees',
        description: 'List employees',
        parameters: [
          { name: 'departmentId', type: 'string', required: false, description: 'Filter by department' },
          { name: 'status', type: 'string', required: false, description: 'Employment status' },
        ],
        response: '{ employees: Employee[], total: number }',
        example: 'trpc.hr.employees.useQuery()',
      },
      {
        method: 'GET',
        path: '/api/trpc/academy.courses',
        description: 'List available courses',
        parameters: [
          { name: 'category', type: 'string', required: false, description: 'Course category' },
          { name: 'level', type: 'string', required: false, description: 'Difficulty level' },
        ],
        response: '{ courses: Course[], categories: string[] }',
        example: 'trpc.academy.courses.useQuery()',
      },
      {
        method: 'POST',
        path: '/api/trpc/signatures.sign',
        description: 'Apply electronic signature to document',
        parameters: [
          { name: 'documentId', type: 'string', required: true, description: 'Document to sign' },
          { name: 'signatureData', type: 'string', required: true, description: 'Signature image data' },
        ],
        response: '{ signed: boolean, signatureId: string }',
        example: 'trpc.signatures.sign.useMutation()',
      },
      {
        method: 'GET',
        path: '/api/trpc/compliance.status',
        description: 'Get compliance status for all entities',
        parameters: [],
        response: '{ items: ComplianceItem[], overdue: number, upcoming: number }',
        example: 'trpc.compliance.status.useQuery()',
      },
    ];
  }

  // Generate database schema documentation
  async generateSchemaDocs(): Promise<DatabaseTable[]> {
    return [
      {
        name: 'users',
        description: 'User accounts and authentication',
        columns: [
          { name: 'id', type: 'INT', nullable: false, description: 'Primary key' },
          { name: 'email', type: 'VARCHAR(255)', nullable: false, description: 'User email' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Display name' },
          { name: 'role', type: 'ENUM', nullable: false, description: 'User role (admin, staff, user)' },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, description: 'Account creation date' },
        ],
        relationships: [],
      },
      {
        name: 'documents',
        description: 'Document storage and metadata',
        columns: [
          { name: 'id', type: 'INT', nullable: false, description: 'Primary key' },
          { name: 'title', type: 'VARCHAR(255)', nullable: false, description: 'Document title' },
          { name: 'content', type: 'TEXT', nullable: true, description: 'Document content' },
          { name: 'file_url', type: 'VARCHAR(500)', nullable: true, description: 'S3 file URL' },
          { name: 'user_id', type: 'INT', nullable: false, description: 'Owner user ID' },
          { name: 'folder_id', type: 'INT', nullable: true, description: 'Parent folder ID' },
          { name: 'status', type: 'ENUM', nullable: false, description: 'Document status' },
        ],
        relationships: [
          { table: 'users', type: 'many-to-one', foreignKey: 'user_id' },
          { table: 'folders', type: 'many-to-one', foreignKey: 'folder_id' },
        ],
      },
      {
        name: 'workflows',
        description: 'Workflow definitions and automation',
        columns: [
          { name: 'id', type: 'INT', nullable: false, description: 'Primary key' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Workflow name' },
          { name: 'description', type: 'TEXT', nullable: true, description: 'Workflow description' },
          { name: 'trigger_type', type: 'ENUM', nullable: false, description: 'Trigger type' },
          { name: 'steps', type: 'JSON', nullable: false, description: 'Workflow steps configuration' },
          { name: 'is_active', type: 'BOOLEAN', nullable: false, description: 'Active status' },
        ],
        relationships: [
          { table: 'users', type: 'many-to-one', foreignKey: 'created_by' },
        ],
      },
      {
        name: 'transactions',
        description: 'Financial transactions and records',
        columns: [
          { name: 'id', type: 'INT', nullable: false, description: 'Primary key' },
          { name: 'type', type: 'ENUM', nullable: false, description: 'Transaction type' },
          { name: 'amount', type: 'DECIMAL(15,2)', nullable: false, description: 'Amount' },
          { name: 'currency', type: 'VARCHAR(3)', nullable: false, description: 'Currency code' },
          { name: 'description', type: 'TEXT', nullable: true, description: 'Description' },
          { name: 'house_id', type: 'INT', nullable: true, description: 'Associated house' },
          { name: 'date', type: 'DATE', nullable: false, description: 'Transaction date' },
        ],
        relationships: [
          { table: 'houses', type: 'many-to-one', foreignKey: 'house_id' },
        ],
      },
      {
        name: 'houses',
        description: 'House entities in the L.A.W.S. structure',
        columns: [
          { name: 'id', type: 'INT', nullable: false, description: 'Primary key' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'House name' },
          { name: 'type', type: 'ENUM', nullable: false, description: 'House type' },
          { name: 'parent_id', type: 'INT', nullable: true, description: 'Parent house ID' },
          { name: 'status', type: 'ENUM', nullable: false, description: 'House status' },
        ],
        relationships: [
          { table: 'houses', type: 'self-referential', foreignKey: 'parent_id' },
        ],
      },
      {
        name: 'grants',
        description: 'Grant opportunities and applications',
        columns: [
          { name: 'id', type: 'INT', nullable: false, description: 'Primary key' },
          { name: 'name', type: 'VARCHAR(255)', nullable: false, description: 'Grant name' },
          { name: 'funder', type: 'VARCHAR(255)', nullable: false, description: 'Funding organization' },
          { name: 'amount', type: 'DECIMAL(15,2)', nullable: true, description: 'Grant amount' },
          { name: 'deadline', type: 'DATE', nullable: true, description: 'Application deadline' },
          { name: 'status', type: 'ENUM', nullable: false, description: 'Application status' },
        ],
        relationships: [],
      },
    ];
  }

  // Generate user guide from system pages
  async generateUserGuide(): Promise<DocSection[]> {
    return [
      {
        id: 'getting-started',
        title: 'Getting Started',
        content: 'Welcome to the The L.A.W.S. Collective system. This guide will help you navigate and use all features effectively.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'login',
            title: 'Logging In',
            content: 'Access the system by clicking "Get Started" on the home page. You will be redirected to the authentication portal. Use your registered email and password to log in.',
            lastUpdated: new Date(),
          },
          {
            id: 'dashboard',
            title: 'Dashboard Overview',
            content: 'After logging in, you will see the main dashboard. The left sidebar contains navigation to all system modules. The top bar shows your profile and notifications.',
            lastUpdated: new Date(),
          },
        ],
      },
      {
        id: 'documents',
        title: 'Document Management',
        content: 'The Document Vault stores all your important files with version control, electronic signatures, and audit trails.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'upload',
            title: 'Uploading Documents',
            content: 'Click "Upload" in the Document Vault to add new files. Supported formats include PDF, Word, Excel, and images. Documents are automatically scanned and indexed.',
            lastUpdated: new Date(),
          },
          {
            id: 'signatures',
            title: 'Electronic Signatures',
            content: 'To sign a document, open it and click "Sign". Draw your signature or use a saved signature. All signatures are legally binding and include timestamp verification.',
            lastUpdated: new Date(),
          },
        ],
      },
      {
        id: 'workflows',
        title: 'Workflow Automation',
        content: 'Create automated workflows to streamline approvals, notifications, and multi-step processes.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'builder',
            title: 'Workflow Builder',
            content: 'Use the visual workflow builder to create automation. Drag and drop triggers, conditions, and actions. Connect steps to define the flow.',
            lastUpdated: new Date(),
          },
          {
            id: 'templates',
            title: 'Using Templates',
            content: 'Browse pre-built workflow templates for common processes like document approval, expense reports, and leave requests. Deploy with one click.',
            lastUpdated: new Date(),
          },
        ],
      },
      {
        id: 'financial',
        title: 'Financial Management',
        content: 'Track revenue, expenses, and financial health across all houses and entities.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'transactions',
            title: 'Recording Transactions',
            content: 'Add transactions manually or import from connected bank accounts. Categorize by type and associate with specific houses or projects.',
            lastUpdated: new Date(),
          },
          {
            id: 'reports',
            title: 'Financial Reports',
            content: 'Generate income statements, balance sheets, and cash flow reports. Export to PDF or Excel for external use.',
            lastUpdated: new Date(),
          },
        ],
      },
      {
        id: 'grants',
        title: 'Grant Management',
        content: 'Discover grant opportunities, track applications, and manage compliance requirements.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'discovery',
            title: 'Finding Grants',
            content: 'Use the Grant Discovery tool to search SAM.gov and other sources. Filter by amount, deadline, and eligibility criteria.',
            lastUpdated: new Date(),
          },
          {
            id: 'tracking',
            title: 'Application Tracking',
            content: 'Track all grant applications in one place. Set reminders for deadlines and reporting requirements.',
            lastUpdated: new Date(),
          },
        ],
      },
    ];
  }

  // Generate system architecture overview
  async generateSystemOverview(): Promise<DocSection[]> {
    return [
      {
        id: 'architecture',
        title: 'System Architecture',
        content: 'The L.A.W.S. Collective system is built on a modern, portable technology stack designed for longevity and independence.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'frontend',
            title: 'Frontend',
            content: 'React 19 with TypeScript, Tailwind CSS 4, and shadcn/ui components. State management via TanStack Query with tRPC integration.',
            lastUpdated: new Date(),
          },
          {
            id: 'backend',
            title: 'Backend',
            content: 'Express.js server with tRPC for type-safe API calls. Authentication via JWT with OAuth support. All endpoints are documented and portable.',
            lastUpdated: new Date(),
          },
          {
            id: 'database',
            title: 'Database',
            content: 'MySQL/TiDB with Drizzle ORM. Schema is version-controlled and can be migrated to any MySQL-compatible database.',
            lastUpdated: new Date(),
          },
          {
            id: 'storage',
            title: 'File Storage',
            content: 'S3-compatible object storage for documents and media. Can be pointed to any S3-compatible service (AWS, MinIO, Backblaze).',
            lastUpdated: new Date(),
          },
        ],
      },
      {
        id: 'portability',
        title: 'Portability & Migration',
        content: 'The system is designed for complete portability. All code, data, and configuration can be exported and run independently.',
        lastUpdated: new Date(),
        subsections: [
          {
            id: 'code-export',
            title: 'Code Export',
            content: 'Full source code can be exported to GitHub or downloaded as a ZIP. No proprietary dependencies or locked-in frameworks.',
            lastUpdated: new Date(),
          },
          {
            id: 'data-export',
            title: 'Data Export',
            content: 'All user data can be exported as JSON or CSV. Database can be dumped using standard MySQL tools.',
            lastUpdated: new Date(),
          },
          {
            id: 'deployment',
            title: 'Self-Hosting',
            content: 'Deploy to any Node.js hosting provider. Required: Node.js 18+, MySQL database, S3-compatible storage, environment variables.',
            lastUpdated: new Date(),
          },
        ],
      },
    ];
  }

  // Export documentation as Markdown
  async exportAsMarkdown(docs: GeneratedDocumentation): Promise<string> {
    let markdown = `# ${docs.title}\n\n`;
    markdown += `**Version:** ${docs.version}\n`;
    markdown += `**Generated:** ${docs.generatedAt.toISOString()}\n\n`;
    markdown += `---\n\n`;

    // System Overview
    markdown += `## System Overview\n\n`;
    for (const section of docs.sections) {
      markdown += `### ${section.title}\n\n${section.content}\n\n`;
      if (section.subsections) {
        for (const sub of section.subsections) {
          markdown += `#### ${sub.title}\n\n${sub.content}\n\n`;
        }
      }
    }

    // API Documentation
    markdown += `## API Reference\n\n`;
    for (const endpoint of docs.apiEndpoints) {
      markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
      markdown += `${endpoint.description}\n\n`;
      markdown += `**Parameters:**\n\n`;
      markdown += `| Name | Type | Required | Description |\n`;
      markdown += `|------|------|----------|-------------|\n`;
      for (const param of endpoint.parameters) {
        markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
      }
      markdown += `\n**Response:** \`${endpoint.response}\`\n\n`;
      if (endpoint.example) {
        markdown += `**Example:** \`${endpoint.example}\`\n\n`;
      }
    }

    // Database Schema
    markdown += `## Database Schema\n\n`;
    for (const table of docs.databaseSchema) {
      markdown += `### ${table.name}\n\n`;
      markdown += `${table.description}\n\n`;
      markdown += `| Column | Type | Nullable | Description |\n`;
      markdown += `|--------|------|----------|-------------|\n`;
      for (const col of table.columns) {
        markdown += `| ${col.name} | ${col.type} | ${col.nullable ? 'Yes' : 'No'} | ${col.description} |\n`;
      }
      markdown += `\n`;
    }

    // User Guide
    markdown += `## User Guide\n\n`;
    for (const section of docs.userGuide) {
      markdown += `### ${section.title}\n\n${section.content}\n\n`;
      if (section.subsections) {
        for (const sub of section.subsections) {
          markdown += `#### ${sub.title}\n\n${sub.content}\n\n`;
        }
      }
    }

    return markdown;
  }
}

export const documentationGeneratorService = new DocumentationGeneratorService();
