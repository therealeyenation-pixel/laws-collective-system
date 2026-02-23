import { describe, it, expect } from 'vitest';
import {
  createDocument,
  updateDocumentStatus,
  createApprovalWorkflow,
  attachWorkflow,
  recordApproval,
  addSignature,
  createSignatureRequest,
  updateSignatureRequest,
  makeOfficial,
  archiveDocument,
  getDocumentAuditTrail
} from './document-workflow';

describe('Document Workflow Service', () => {
  describe('createDocument', () => {
    it('should create document with draft status', () => {
      const doc = createDocument('Operating Agreement', 'legal', 'Content here', 'user-001');
      expect(doc.documentId).toContain('doc-');
      expect(doc.title).toBe('Operating Agreement');
      expect(doc.status).toBe('draft');
      expect(doc.version).toBe(1);
      expect(doc.history).toHaveLength(1);
    });
  });

  describe('updateDocumentStatus', () => {
    it('should update status and record history', () => {
      let doc = createDocument('Test Doc', 'test', 'Content', 'user-001');
      doc = updateDocumentStatus(doc, 'review', 'user-002', 'John Doe', 'Submitted for review');

      expect(doc.status).toBe('review');
      expect(doc.history).toHaveLength(2);
      expect(doc.history[1].action).toBe('status_changed');
      expect(doc.history[1].previousStatus).toBe('draft');
      expect(doc.history[1].newStatus).toBe('review');
    });
  });

  describe('Approval Workflow', () => {
    it('should create single approval workflow', () => {
      const workflow = createApprovalWorkflow('single', [
        { userId: 'user-001', name: 'John', role: 'Manager' }
      ]);

      expect(workflow.type).toBe('single');
      expect(workflow.requiredApprovals).toBe(1);
      expect(workflow.approvers).toHaveLength(1);
    });

    it('should create sequential approval workflow', () => {
      const workflow = createApprovalWorkflow('sequential', [
        { userId: 'user-001', name: 'John', role: 'Manager' },
        { userId: 'user-002', name: 'Jane', role: 'Director' }
      ]);

      expect(workflow.type).toBe('sequential');
      expect(workflow.requiredApprovals).toBe(2);
    });

    it('should create consensus approval workflow', () => {
      const workflow = createApprovalWorkflow('consensus', [
        { userId: 'user-001', name: 'John', role: 'Board Member' },
        { userId: 'user-002', name: 'Jane', role: 'Board Member' },
        { userId: 'user-003', name: 'Bob', role: 'Board Member' }
      ]);

      expect(workflow.type).toBe('consensus');
      expect(workflow.requiredApprovals).toBe(3);
    });

    it('should attach workflow to document', () => {
      let doc = createDocument('Policy', 'policy', 'Content', 'user-001');
      const workflow = createApprovalWorkflow('single', [
        { userId: 'user-002', name: 'Manager', role: 'Approver' }
      ]);
      doc = attachWorkflow(doc, workflow);

      expect(doc.status).toBe('review');
      expect(doc.approvalWorkflow).toBeDefined();
      expect(doc.approvalWorkflow!.status).toBe('in_progress');
    });

    it('should record approval', () => {
      let doc = createDocument('Policy', 'policy', 'Content', 'user-001');
      const workflow = createApprovalWorkflow('single', [
        { userId: 'user-002', name: 'Manager', role: 'Approver' }
      ]);
      doc = attachWorkflow(doc, workflow);
      doc = recordApproval(doc, 'approver-0', true, 'Looks good');

      expect(doc.status).toBe('approved');
      expect(doc.approvalWorkflow!.status).toBe('completed');
      expect(doc.approvalWorkflow!.completedApprovals).toBe(1);
    });

    it('should handle rejection', () => {
      let doc = createDocument('Policy', 'policy', 'Content', 'user-001');
      const workflow = createApprovalWorkflow('sequential', [
        { userId: 'user-002', name: 'Manager', role: 'Approver' }
      ]);
      doc = attachWorkflow(doc, workflow);
      doc = recordApproval(doc, 'approver-0', false, 'Needs revision');

      expect(doc.status).toBe('rejected');
      expect(doc.approvalWorkflow!.status).toBe('rejected');
    });
  });

  describe('Signatures', () => {
    it('should add typed signature', () => {
      let doc = createDocument('Contract', 'contract', 'Content', 'user-001');
      doc = addSignature(doc, 'user-001', 'John Freeman', 'typed', 'John Freeman');

      expect(doc.signatures).toHaveLength(1);
      expect(doc.signatures[0].type).toBe('typed');
      expect(doc.signatures[0].hash).toBeDefined();
      expect(doc.signatures[0].verified).toBe(true);
    });

    it('should add drawn signature', () => {
      let doc = createDocument('Contract', 'contract', 'Content', 'user-001');
      doc = addSignature(doc, 'user-001', 'John Freeman', 'drawn', 'base64-signature-data');

      expect(doc.signatures[0].type).toBe('drawn');
    });

    it('should record signature in history', () => {
      let doc = createDocument('Contract', 'contract', 'Content', 'user-001');
      doc = addSignature(doc, 'user-001', 'John Freeman', 'typed', 'John Freeman');

      expect(doc.history[doc.history.length - 1].action).toBe('signed');
    });
  });

  describe('Signature Requests', () => {
    it('should create signature request', () => {
      const request = createSignatureRequest(
        'doc-001',
        'user-001',
        [
          { email: 'john@example.com', name: 'John' },
          { email: 'jane@example.com', name: 'Jane' }
        ],
        'Please sign this document'
      );

      expect(request.requestId).toContain('sigreq-');
      expect(request.signers).toHaveLength(2);
      expect(request.status).toBe('pending');
    });

    it('should update signature request when signed', () => {
      let request = createSignatureRequest(
        'doc-001',
        'user-001',
        [{ email: 'john@example.com', name: 'John' }],
        'Please sign'
      );
      request = updateSignatureRequest(request, 'signer-0', true);

      expect(request.signers[0].status).toBe('signed');
      expect(request.status).toBe('completed');
    });

    it('should show partial status with multiple signers', () => {
      let request = createSignatureRequest(
        'doc-001',
        'user-001',
        [
          { email: 'john@example.com', name: 'John' },
          { email: 'jane@example.com', name: 'Jane' }
        ],
        'Please sign'
      );
      request = updateSignatureRequest(request, 'signer-0', true);

      expect(request.status).toBe('partial');
    });
  });

  describe('makeOfficial', () => {
    it('should make approved document official', () => {
      let doc = createDocument('Policy', 'policy', 'Content', 'user-001');
      const workflow = createApprovalWorkflow('single', [
        { userId: 'user-002', name: 'Manager', role: 'Approver' }
      ]);
      doc = attachWorkflow(doc, workflow);
      doc = recordApproval(doc, 'approver-0', true);
      doc = makeOfficial(doc, 'user-001', 'Admin');

      expect(doc.status).toBe('official');
    });

    it('should throw error if not approved', () => {
      const doc = createDocument('Policy', 'policy', 'Content', 'user-001');
      expect(() => makeOfficial(doc, 'user-001', 'Admin')).toThrow('Document must be approved');
    });
  });

  describe('archiveDocument', () => {
    it('should archive document with reason', () => {
      let doc = createDocument('Old Policy', 'policy', 'Content', 'user-001');
      doc = archiveDocument(doc, 'user-001', 'Admin', 'Superseded by new policy');

      expect(doc.status).toBe('archived');
      expect(doc.history[doc.history.length - 1].details).toContain('Superseded');
    });
  });

  describe('getDocumentAuditTrail', () => {
    it('should generate formatted audit trail', () => {
      let doc = createDocument('Contract', 'contract', 'Content', 'user-001');
      doc = addSignature(doc, 'user-001', 'John Freeman', 'typed', 'John Freeman');

      const trail = getDocumentAuditTrail(doc);
      
      expect(trail).toContain('DOCUMENT AUDIT TRAIL');
      expect(trail).toContain('Contract');
      expect(trail).toContain('DRAFT');
      expect(trail).toContain('John Freeman');
      expect(trail).toContain('HISTORY');
      expect(trail).toContain('SIGNATURES');
    });

    it('should include workflow info when present', () => {
      let doc = createDocument('Policy', 'policy', 'Content', 'user-001');
      const workflow = createApprovalWorkflow('sequential', [
        { userId: 'user-002', name: 'Manager', role: 'Approver' }
      ]);
      doc = attachWorkflow(doc, workflow);

      const trail = getDocumentAuditTrail(doc);
      
      expect(trail).toContain('APPROVAL WORKFLOW');
      expect(trail).toContain('sequential');
      expect(trail).toContain('Manager');
    });
  });
});
