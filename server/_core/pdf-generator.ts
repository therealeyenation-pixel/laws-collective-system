/**
 * PDF Generation Engine
 * Produces government-compliant, print-ready PDF documents
 */

import { storagePut } from "../storage";

// Government form specifications
export const FORM_SPECS = {
  // IRS specifications
  IRS: {
    pageSize: { width: 8.5, height: 11 }, // Letter size in inches
    margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 },
    fonts: {
      primary: "Courier",
      secondary: "Arial",
      size: { default: 10, small: 8, large: 12, title: 14 }
    },
    colors: {
      text: "#000000",
      lines: "#000000",
      background: "#FFFFFF"
    }
  },
  // State forms (general)
  STATE: {
    pageSize: { width: 8.5, height: 11 },
    margins: { top: 1, bottom: 1, left: 1, right: 1 },
    fonts: {
      primary: "Times New Roman",
      secondary: "Arial",
      size: { default: 11, small: 9, large: 12, title: 16 }
    },
    colors: {
      text: "#000000",
      lines: "#000000",
      background: "#FFFFFF"
    }
  },
  // Legal documents
  LEGAL: {
    pageSize: { width: 8.5, height: 11 },
    margins: { top: 1, bottom: 1, left: 1.5, right: 1 },
    fonts: {
      primary: "Times New Roman",
      secondary: "Arial",
      size: { default: 12, small: 10, large: 14, title: 18 }
    },
    colors: {
      text: "#000000",
      lines: "#000000",
      background: "#FFFFFF"
    },
    lineSpacing: 2.0 // Double-spaced for legal
  }
};

// Field types and their formatting
export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "checkbox" | "radio" | "ssn" | "ein" | "phone" | "email" | "currency" | "signature" | "address";
  value?: string | number | boolean;
  x: number; // Position from left (inches)
  y: number; // Position from top (inches)
  width: number;
  height?: number;
  fontSize?: number;
  required?: boolean;
  maxLength?: number;
  format?: string; // For dates, numbers, etc.
}

// Document structure
export interface DocumentDefinition {
  templateCode: string;
  title: string;
  formNumber?: string;
  ombNumber?: string;
  revision?: string;
  jurisdiction?: string;
  spec: keyof typeof FORM_SPECS;
  pages: PageDefinition[];
  signatures?: SignatureBlock[];
  notarization?: boolean;
}

export interface PageDefinition {
  pageNumber: number;
  header?: HeaderDefinition;
  sections: SectionDefinition[];
  footer?: FooterDefinition;
}

export interface HeaderDefinition {
  title?: string;
  formNumber?: string;
  ombNumber?: string;
  jurisdiction?: string;
  logo?: string;
}

export interface SectionDefinition {
  title?: string;
  fields: FormField[];
  instructions?: string;
  table?: TableDefinition;
}

export interface TableDefinition {
  columns: { header: string; width: number; align?: "left" | "center" | "right" }[];
  rows: (string | number)[][];
}

export interface FooterDefinition {
  pageNumber?: boolean;
  formNumber?: string;
  revision?: string;
  disclaimer?: string;
}

export interface SignatureBlock {
  party: string;
  title?: string;
  x: number;
  y: number;
  width: number;
  includeDate?: boolean;
  includePrintName?: boolean;
  includeTitle?: boolean;
}

// Format helpers
export function formatSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, "");
  if (digits.length !== 9) return ssn;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function formatEIN(ein: string): string {
  const digits = ein.replace(/\D/g, "");
  if (digits.length !== 9) return ein;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function formatCurrency(amount: number | string, currency: string = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

export function formatDate(date: Date | string, format: string = "MM/DD/YYYY"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  
  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "Month DD, YYYY":
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    default:
      return `${month}/${day}/${year}`;
  }
}

export function formatFieldValue(field: FormField): string {
  if (field.value === undefined || field.value === null) return "";
  
  switch (field.type) {
    case "ssn":
      return formatSSN(String(field.value));
    case "ein":
      return formatEIN(String(field.value));
    case "phone":
      return formatPhone(String(field.value));
    case "currency":
      return formatCurrency(field.value as number);
    case "date":
      return formatDate(field.value as string, field.format);
    case "checkbox":
      return field.value ? "☑" : "☐";
    default:
      return String(field.value);
  }
}

// Generate HTML for PDF conversion
export function generatePDFHTML(doc: DocumentDefinition, data: Record<string, any>): string {
  const spec = FORM_SPECS[doc.spec];
  
  const css = `
    @page {
      size: ${spec.pageSize.width}in ${spec.pageSize.height}in;
      margin: ${spec.margins.top}in ${spec.margins.right}in ${spec.margins.bottom}in ${spec.margins.left}in;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: "${spec.fonts.primary}", serif;
      font-size: ${spec.fonts.size.default}pt;
      line-height: ${(spec as any).lineSpacing || 1.4};
      color: ${spec.colors.text};
      background: ${spec.colors.background};
    }
    
    .page {
      width: ${spec.pageSize.width - spec.margins.left - spec.margins.right}in;
      min-height: ${spec.pageSize.height - spec.margins.top - spec.margins.bottom}in;
      position: relative;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid ${spec.colors.lines};
      padding-bottom: 12pt;
      margin-bottom: 18pt;
    }
    
    .header-left {
      text-align: left;
    }
    
    .header-center {
      text-align: center;
      flex: 1;
    }
    
    .header-right {
      text-align: right;
    }
    
    .document-title {
      font-size: ${spec.fonts.size.title}pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4pt;
    }
    
    .form-number {
      font-size: ${spec.fonts.size.small}pt;
    }
    
    .omb-number {
      font-size: ${spec.fonts.size.small}pt;
      color: #666;
    }
    
    .jurisdiction {
      font-size: ${spec.fonts.size.large}pt;
      font-weight: bold;
    }
    
    .section {
      margin-bottom: 18pt;
    }
    
    .section-title {
      font-size: ${spec.fonts.size.large}pt;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid ${spec.colors.lines};
      padding-bottom: 4pt;
      margin-bottom: 12pt;
    }
    
    .field-row {
      display: flex;
      margin-bottom: 8pt;
      align-items: flex-end;
    }
    
    .field-label {
      font-weight: bold;
      min-width: 180pt;
      padding-right: 8pt;
    }
    
    .field-value {
      flex: 1;
      border-bottom: 1px solid ${spec.colors.lines};
      min-height: 16pt;
      padding: 2pt 4pt;
      font-family: "${spec.fonts.primary}", monospace;
    }
    
    .field-inline {
      display: inline-flex;
      align-items: flex-end;
      margin-right: 24pt;
    }
    
    .checkbox-field {
      display: flex;
      align-items: center;
      margin-bottom: 6pt;
    }
    
    .checkbox {
      width: 12pt;
      height: 12pt;
      border: 1px solid ${spec.colors.lines};
      margin-right: 8pt;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10pt;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
    }
    
    .table th,
    .table td {
      border: 1px solid ${spec.colors.lines};
      padding: 6pt 8pt;
      text-align: left;
    }
    
    .table th {
      background-color: #f5f5f5;
      font-weight: bold;
      font-size: ${spec.fonts.size.small}pt;
    }
    
    .table td.currency {
      text-align: right;
      font-family: "${spec.fonts.primary}", monospace;
    }
    
    .signature-section {
      margin-top: 36pt;
      page-break-inside: avoid;
    }
    
    .signature-block {
      margin-bottom: 24pt;
    }
    
    .signature-party {
      font-weight: bold;
      margin-bottom: 8pt;
    }
    
    .signature-line {
      display: flex;
      align-items: flex-end;
      margin-bottom: 4pt;
    }
    
    .signature-line .line {
      flex: 1;
      max-width: 300pt;
      border-bottom: 1px solid ${spec.colors.lines};
      height: 24pt;
      margin-right: 24pt;
    }
    
    .signature-line .label {
      font-size: ${spec.fonts.size.small}pt;
      color: #666;
    }
    
    .notarization {
      margin-top: 36pt;
      padding: 12pt;
      border: 1px solid ${spec.colors.lines};
      page-break-inside: avoid;
    }
    
    .notarization-title {
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 12pt;
    }
    
    .notary-seal {
      width: 100pt;
      height: 100pt;
      border: 2px dashed #999;
      margin: 12pt 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${spec.fonts.size.small}pt;
      color: #999;
    }
    
    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      font-size: ${spec.fonts.size.small}pt;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 8pt;
    }
    
    .instructions {
      font-size: ${spec.fonts.size.small}pt;
      color: #333;
      background: #f9f9f9;
      padding: 8pt;
      margin: 8pt 0;
      border-left: 3pt solid #ccc;
    }
    
    .required::after {
      content: " *";
      color: red;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${doc.title}</title>
      <style>${css}</style>
    </head>
    <body>
  `;
  
  // Generate each page
  for (const page of doc.pages) {
    html += `<div class="page">`;
    
    // Header
    if (page.header) {
      html += `
        <div class="header">
          <div class="header-left">
            ${page.header.jurisdiction ? `<div class="jurisdiction">${page.header.jurisdiction}</div>` : ""}
          </div>
          <div class="header-center">
            ${page.header.title ? `<div class="document-title">${page.header.title}</div>` : ""}
            ${page.header.formNumber ? `<div class="form-number">Form ${page.header.formNumber}</div>` : ""}
            ${page.header.ombNumber ? `<div class="omb-number">OMB No. ${page.header.ombNumber}</div>` : ""}
          </div>
          <div class="header-right">
            <div class="date">${formatDate(new Date())}</div>
          </div>
        </div>
      `;
    }
    
    // Sections
    for (const section of page.sections) {
      html += `<div class="section">`;
      
      if (section.title) {
        html += `<div class="section-title">${section.title}</div>`;
      }
      
      if (section.instructions) {
        html += `<div class="instructions">${section.instructions}</div>`;
      }
      
      // Fields
      for (const field of section.fields) {
        const value = data[field.name] !== undefined ? data[field.name] : field.value;
        const fieldWithValue = { ...field, value };
        const formattedValue = formatFieldValue(fieldWithValue);
        
        if (field.type === "checkbox") {
          html += `
            <div class="checkbox-field">
              <div class="checkbox">${value ? "✓" : ""}</div>
              <span>${field.label}</span>
            </div>
          `;
        } else {
          html += `
            <div class="field-row">
              <div class="field-label${field.required ? " required" : ""}">${field.label}:</div>
              <div class="field-value">${formattedValue}</div>
            </div>
          `;
        }
      }
      
      // Table
      if (section.table) {
        html += `
          <table class="table">
            <thead>
              <tr>
                ${section.table.columns.map(col => 
                  `<th style="width: ${col.width}pt; text-align: ${col.align || "left"}">${col.header}</th>`
                ).join("")}
              </tr>
            </thead>
            <tbody>
              ${section.table.rows.map(row => `
                <tr>
                  ${row.map((cell, i) => {
                    const col = section.table!.columns[i];
                    const isNumber = typeof cell === "number";
                    return `<td class="${isNumber ? "currency" : ""}" style="text-align: ${col.align || "left"}">${
                      isNumber ? formatCurrency(cell) : cell
                    }</td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
      }
      
      html += `</div>`;
    }
    
    // Footer
    if (page.footer) {
      html += `
        <div class="footer">
          <div>${page.footer.formNumber ? `Form ${page.footer.formNumber}` : ""} ${page.footer.revision ? `(Rev. ${page.footer.revision})` : ""}</div>
          <div>${page.footer.pageNumber ? `Page ${page.pageNumber}` : ""}</div>
          <div>${page.footer.disclaimer || ""}</div>
        </div>
      `;
    }
    
    html += `</div>`;
  }
  
  // Signatures
  if (doc.signatures && doc.signatures.length > 0) {
    html += `
      <div class="signature-section">
        <div class="section-title">Signatures</div>
        <p style="margin-bottom: 18pt;">IN WITNESS WHEREOF, the undersigned have executed this document as of the date first written above.</p>
    `;
    
    for (const sig of doc.signatures) {
      html += `
        <div class="signature-block">
          <div class="signature-party">${sig.party}${sig.title ? ` - ${sig.title}` : ""}</div>
          <div class="signature-line">
            <div class="line"></div>
            <div class="label">Signature</div>
          </div>
          ${sig.includePrintName ? `
            <div class="signature-line">
              <div class="line"></div>
              <div class="label">Print Name</div>
            </div>
          ` : ""}
          ${sig.includeTitle ? `
            <div class="signature-line">
              <div class="line"></div>
              <div class="label">Title</div>
            </div>
          ` : ""}
          ${sig.includeDate ? `
            <div class="signature-line">
              <div class="line"></div>
              <div class="label">Date</div>
            </div>
          ` : ""}
        </div>
      `;
    }
    
    html += `</div>`;
  }
  
  // Notarization
  if (doc.notarization) {
    html += `
      <div class="notarization">
        <div class="notarization-title">Notarization</div>
        <p>State of ____________________</p>
        <p>County of ____________________</p>
        <p style="margin: 12pt 0;">
          On this ______ day of __________________, 20____, before me personally appeared 
          __________________________________________, known to me (or proved to me on the basis 
          of satisfactory evidence) to be the person(s) whose name(s) is/are subscribed to the 
          within instrument and acknowledged to me that he/she/they executed the same in 
          his/her/their authorized capacity(ies), and that by his/her/their signature(s) on the 
          instrument the person(s), or the entity upon behalf of which the person(s) acted, 
          executed the instrument.
        </p>
        <p>WITNESS my hand and official seal.</p>
        <div class="signature-line" style="margin-top: 24pt;">
          <div class="line"></div>
          <div class="label">Notary Public Signature</div>
        </div>
        <div class="notary-seal">[NOTARY SEAL]</div>
        <p>My Commission Expires: ____________________</p>
      </div>
    `;
  }
  
  html += `
      <div style="text-align: center; margin-top: 24pt; font-size: 8pt; color: #999;">
        Generated by LuvOnPurpose Autonomous Wealth System
      </div>
    </body>
    </html>
  `;
  
  return html;
}

// Pre-defined document templates
export const DOCUMENT_TEMPLATES: Record<string, DocumentDefinition> = {
  // IRS Form SS-4
  IRS_SS4: {
    templateCode: "IRS_SS4",
    title: "Application for Employer Identification Number",
    formNumber: "SS-4",
    ombNumber: "1545-0003",
    spec: "IRS",
    pages: [{
      pageNumber: 1,
      header: {
        title: "Application for Employer Identification Number",
        formNumber: "SS-4",
        ombNumber: "1545-0003"
      },
      sections: [
        {
          title: "Identification",
          fields: [
            { name: "legalName", label: "Legal name of entity", type: "text", x: 0, y: 0, width: 400, required: true },
            { name: "tradeName", label: "Trade name (if different)", type: "text", x: 0, y: 0, width: 400 },
            { name: "streetAddress", label: "Mailing address", type: "address", x: 0, y: 0, width: 400, required: true },
            { name: "city", label: "City", type: "text", x: 0, y: 0, width: 200, required: true },
            { name: "state", label: "State", type: "text", x: 0, y: 0, width: 50, required: true },
            { name: "zip", label: "ZIP code", type: "text", x: 0, y: 0, width: 100, required: true },
          ]
        },
        {
          title: "Responsible Party",
          fields: [
            { name: "responsiblePartyName", label: "Name", type: "text", x: 0, y: 0, width: 400, required: true },
            { name: "responsiblePartySSN", label: "SSN or ITIN", type: "ssn", x: 0, y: 0, width: 150, required: true },
          ]
        },
        {
          title: "Entity Type",
          fields: [
            { name: "entityType_soleProprietor", label: "Sole proprietor", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "entityType_partnership", label: "Partnership", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "entityType_corporation", label: "Corporation", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "entityType_llc", label: "LLC", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "entityType_nonprofit", label: "Nonprofit organization", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "entityType_trust", label: "Trust", type: "checkbox", x: 0, y: 0, width: 20 },
          ]
        },
        {
          title: "Reason for Applying",
          fields: [
            { name: "reason_startedBusiness", label: "Started new business", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "reason_hiredEmployees", label: "Hired employees", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "reason_bankingPurposes", label: "Banking purposes", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "reason_changedOrganization", label: "Changed type of organization", type: "checkbox", x: 0, y: 0, width: 20 },
          ]
        }
      ],
      footer: {
        formNumber: "SS-4",
        revision: "January 2024",
        pageNumber: true
      }
    }],
    signatures: [{
      party: "Applicant",
      x: 0,
      y: 0,
      width: 300,
      includeDate: true,
      includePrintName: true,
      includeTitle: true
    }]
  },
  
  // LLC Operating Agreement
  CONTRACT_OPERATING: {
    templateCode: "CONTRACT_OPERATING",
    title: "Limited Liability Company Operating Agreement",
    spec: "LEGAL",
    pages: [{
      pageNumber: 1,
      header: {
        title: "Limited Liability Company Operating Agreement"
      },
      sections: [
        {
          title: "Article I - Formation",
          instructions: "This Operating Agreement is entered into as of the date last signed below.",
          fields: [
            { name: "llcName", label: "Name of LLC", type: "text", x: 0, y: 0, width: 400, required: true },
            { name: "formationState", label: "State of Formation", type: "text", x: 0, y: 0, width: 200, required: true },
            { name: "formationDate", label: "Date of Formation", type: "date", x: 0, y: 0, width: 150, required: true },
            { name: "principalAddress", label: "Principal Place of Business", type: "address", x: 0, y: 0, width: 400, required: true },
          ]
        },
        {
          title: "Article II - Purpose",
          fields: [
            { name: "businessPurpose", label: "Business Purpose", type: "text", x: 0, y: 0, width: 400, required: true },
          ]
        },
        {
          title: "Article III - Members",
          fields: [
            { name: "member1Name", label: "Member 1 Name", type: "text", x: 0, y: 0, width: 300, required: true },
            { name: "member1Ownership", label: "Ownership %", type: "number", x: 0, y: 0, width: 100, required: true },
            { name: "member1Contribution", label: "Capital Contribution", type: "currency", x: 0, y: 0, width: 150, required: true },
            { name: "member2Name", label: "Member 2 Name", type: "text", x: 0, y: 0, width: 300 },
            { name: "member2Ownership", label: "Ownership %", type: "number", x: 0, y: 0, width: 100 },
            { name: "member2Contribution", label: "Capital Contribution", type: "currency", x: 0, y: 0, width: 150 },
          ]
        },
        {
          title: "Article IV - Management",
          fields: [
            { name: "managementType_memberManaged", label: "Member-Managed", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "managementType_managerManaged", label: "Manager-Managed", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "managerName", label: "Manager Name (if applicable)", type: "text", x: 0, y: 0, width: 300 },
          ]
        }
      ],
      footer: {
        pageNumber: true
      }
    }],
    signatures: [
      { party: "Member 1", x: 0, y: 0, width: 300, includeDate: true, includePrintName: true },
      { party: "Member 2", x: 0, y: 0, width: 300, includeDate: true, includePrintName: true }
    ],
    notarization: true
  },
  
  // Promissory Note
  FUNDING_PROMISSORY: {
    templateCode: "FUNDING_PROMISSORY",
    title: "Promissory Note",
    spec: "LEGAL",
    pages: [{
      pageNumber: 1,
      header: {
        title: "Promissory Note"
      },
      sections: [
        {
          title: "Principal Terms",
          fields: [
            { name: "principal", label: "Principal Amount", type: "currency", x: 0, y: 0, width: 200, required: true },
            { name: "interestRate", label: "Annual Interest Rate (%)", type: "number", x: 0, y: 0, width: 100, required: true },
            { name: "loanDate", label: "Date of Note", type: "date", x: 0, y: 0, width: 150, required: true },
            { name: "maturityDate", label: "Maturity Date", type: "date", x: 0, y: 0, width: 150, required: true },
          ]
        },
        {
          title: "Borrower Information",
          fields: [
            { name: "borrowerName", label: "Borrower Name", type: "text", x: 0, y: 0, width: 400, required: true },
            { name: "borrowerAddress", label: "Borrower Address", type: "address", x: 0, y: 0, width: 400, required: true },
          ]
        },
        {
          title: "Lender Information",
          fields: [
            { name: "lenderName", label: "Lender Name", type: "text", x: 0, y: 0, width: 400, required: true },
            { name: "lenderAddress", label: "Lender Address", type: "address", x: 0, y: 0, width: 400, required: true },
          ]
        },
        {
          title: "Payment Terms",
          fields: [
            { name: "paymentFrequency_monthly", label: "Monthly Payments", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "paymentFrequency_quarterly", label: "Quarterly Payments", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "paymentFrequency_lumpSum", label: "Lump Sum at Maturity", type: "checkbox", x: 0, y: 0, width: 20 },
            { name: "paymentAmount", label: "Payment Amount", type: "currency", x: 0, y: 0, width: 200 },
          ]
        }
      ],
      footer: {
        pageNumber: true
      }
    }],
    signatures: [
      { party: "Borrower", x: 0, y: 0, width: 300, includeDate: true, includePrintName: true },
      { party: "Lender", x: 0, y: 0, width: 300, includeDate: true, includePrintName: true }
    ],
    notarization: true
  }
};

// Export function to generate PDF from template
export async function generatePDF(
  templateCode: string,
  data: Record<string, any>,
  options?: {
    jurisdiction?: string;
    language?: string;
  }
): Promise<{ html: string; templateName: string }> {
  const template = DOCUMENT_TEMPLATES[templateCode];
  
  if (!template) {
    throw new Error(`Template not found: ${templateCode}`);
  }
  
  // Apply jurisdiction if provided
  if (options?.jurisdiction && template.pages[0]?.header) {
    template.pages[0].header.jurisdiction = options.jurisdiction;
  }
  
  const html = generatePDFHTML(template, data);
  
  return {
    html,
    templateName: template.title
  };
}
