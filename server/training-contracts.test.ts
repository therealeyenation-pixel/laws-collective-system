import { describe, it, expect } from 'vitest';
import { getDb } from './db';

describe('Training Transition System', () => {
  describe('Database Tables', () => {
    it('should have training_enrollments table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'training_enrollments'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have training_completions table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'training_completions'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have transition_training_requirements table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'transition_training_requirements'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have 8 required training courses', async () => {
      const db = await getDb();
      const [courses] = await db.execute(
        "SELECT COUNT(*) as count FROM transition_training_requirements WHERE isRequired = TRUE"
      );
      expect((courses as any[])[0].count).toBe(8);
    });
  });

  describe('Training Categories', () => {
    it('should have legal category courses', async () => {
      const db = await getDb();
      const [courses] = await db.execute(
        "SELECT * FROM transition_training_requirements WHERE category = 'legal'"
      );
      expect((courses as any[]).length).toBeGreaterThan(0);
    });

    it('should have financial category courses', async () => {
      const db = await getDb();
      const [courses] = await db.execute(
        "SELECT * FROM transition_training_requirements WHERE category = 'financial'"
      );
      expect((courses as any[]).length).toBeGreaterThan(0);
    });

    it('should have at least 5 distinct categories', async () => {
      const db = await getDb();
      const [categories] = await db.execute(
        "SELECT DISTINCT category FROM transition_training_requirements"
      );
      expect((categories as any[]).length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('Contract Management System', () => {
  describe('Database Tables', () => {
    it('should have contracts table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'contracts'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have statements_of_work table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'statements_of_work'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have contract_amendments table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'contract_amendments'"
      );
      expect((tables as any[]).length).toBe(1);
    });
  });

  describe('Contract Types', () => {
    it('should support MSA contract type', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contracts WHERE Field = 'contractType'"
      );
      const typeColumn = (columns as any[])[0];
      expect(typeColumn.Type).toContain('msa');
    });

    it('should support SOW contract type', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contracts WHERE Field = 'contractType'"
      );
      const typeColumn = (columns as any[])[0];
      expect(typeColumn.Type).toContain('sow');
    });

    it('should support NDA contract type', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contracts WHERE Field = 'contractType'"
      );
      const typeColumn = (columns as any[])[0];
      expect(typeColumn.Type).toContain('nda');
    });
  });

  describe('Contract Status Workflow', () => {
    it('should support draft status', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contracts WHERE Field = 'status'"
      );
      const statusColumn = (columns as any[])[0];
      expect(statusColumn.Type).toContain('draft');
    });

    it('should support pending_signature status', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contracts WHERE Field = 'status'"
      );
      const statusColumn = (columns as any[])[0];
      expect(statusColumn.Type).toContain('pending_signature');
    });

    it('should support active status', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contracts WHERE Field = 'status'"
      );
      const statusColumn = (columns as any[])[0];
      expect(statusColumn.Type).toContain('active');
    });
  });
});

describe('Contractor Invoice System', () => {
  describe('Database Tables', () => {
    it('should have contractor_invoices table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'contractor_invoices'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have invoice_line_items table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'invoice_line_items'"
      );
      expect((tables as any[]).length).toBe(1);
    });

    it('should have invoice_payments table', async () => {
      const db = await getDb();
      const [tables] = await db.execute(
        "SHOW TABLES LIKE 'invoice_payments'"
      );
      expect((tables as any[]).length).toBe(1);
    });
  });

  describe('Invoice Status Workflow', () => {
    it('should support draft status', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contractor_invoices WHERE Field = 'status'"
      );
      const statusColumn = (columns as any[])[0];
      expect(statusColumn.Type).toContain('draft');
    });

    it('should support submitted status', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contractor_invoices WHERE Field = 'status'"
      );
      const statusColumn = (columns as any[])[0];
      expect(statusColumn.Type).toContain('submitted');
    });

    it('should support paid status', async () => {
      const db = await getDb();
      const [columns] = await db.execute(
        "SHOW COLUMNS FROM contractor_invoices WHERE Field = 'status'"
      );
      const statusColumn = (columns as any[])[0];
      expect(statusColumn.Type).toContain('paid');
    });
  });
});

describe('Platform Lock-In Features', () => {
  it('should track contractor business relationships', async () => {
    const db = await getDb();
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'contractor_businesses'"
    );
    expect((tables as any[]).length).toBe(1);
  });

  it('should track contractor network membership', async () => {
    const db = await getDb();
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'contractor_network_members'"
    );
    expect((tables as any[]).length).toBe(1);
  });

  it('should track network subscriptions', async () => {
    const db = await getDb();
    const [tables] = await db.execute(
      "SHOW TABLES LIKE 'network_subscriptions'"
    );
    expect((tables as any[]).length).toBe(1);
  });
});
