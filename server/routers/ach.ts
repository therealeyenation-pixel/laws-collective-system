import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  achBatches, 
  achEntries, 
  workerBankAccounts, 
  payrollRuns,
  timekeepingWorkers 
} from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

/**
 * ACH File Generation Router
 * Generate NACHA-compliant ACH files for direct deposit
 */

// NACHA format constants
const RECORD_SIZE = 94;
const BLOCKING_FACTOR = 10;

// Helper to pad string to fixed length
function padRight(str: string, length: number, char = " "): string {
  return str.substring(0, length).padEnd(length, char);
}

function padLeft(str: string, length: number, char = "0"): string {
  return str.substring(0, length).padStart(length, char);
}

// Format amount as cents (no decimal)
function formatAmount(amount: string | number): string {
  const cents = Math.round(parseFloat(String(amount)) * 100);
  return padLeft(String(cents), 10);
}

// Generate File Header Record (1)
function generateFileHeader(
  immediateDestination: string,
  immediateOrigin: string,
  fileCreationDate: Date,
  fileIdModifier: string,
  immediateDestinationName: string,
  immediateOriginName: string
): string {
  const dateStr = fileCreationDate.toISOString().slice(2, 10).replace(/-/g, "").slice(0, 6);
  const timeStr = fileCreationDate.toTimeString().slice(0, 5).replace(":", "");
  
  return [
    "1",                                          // Record Type Code
    padLeft(immediateDestination, 10),            // Immediate Destination (with leading space)
    padLeft(immediateOrigin, 10),                 // Immediate Origin
    dateStr,                                      // File Creation Date (YYMMDD)
    timeStr,                                      // File Creation Time (HHMM)
    fileIdModifier,                               // File ID Modifier (A-Z, 0-9)
    "094",                                        // Record Size
    "10",                                         // Blocking Factor
    "1",                                          // Format Code
    padRight(immediateDestinationName, 23),       // Immediate Destination Name
    padRight(immediateOriginName, 23),            // Immediate Origin Name
    padRight("", 8),                              // Reference Code (optional)
  ].join("");
}

// Generate Batch Header Record (5)
function generateBatchHeader(
  serviceClassCode: string,
  companyName: string,
  companyDiscretionaryData: string,
  companyId: string,
  standardEntryClass: string,
  companyEntryDescription: string,
  companyDescriptiveDate: string,
  effectiveEntryDate: Date,
  originatorStatusCode: string,
  originatingDFI: string,
  batchNumber: number
): string {
  const effectiveDateStr = effectiveEntryDate.toISOString().slice(2, 10).replace(/-/g, "").slice(0, 6);
  
  return [
    "5",                                          // Record Type Code
    serviceClassCode,                             // Service Class Code (200=mixed, 220=credits only, 225=debits only)
    padRight(companyName, 16),                    // Company Name
    padRight(companyDiscretionaryData, 20),       // Company Discretionary Data
    padRight(companyId, 10),                      // Company Identification
    standardEntryClass,                           // Standard Entry Class Code (PPD, CCD, etc.)
    padRight(companyEntryDescription, 10),        // Company Entry Description
    padRight(companyDescriptiveDate, 6),          // Company Descriptive Date
    effectiveDateStr,                             // Effective Entry Date
    padRight("", 3),                              // Settlement Date (Julian) - left blank
    originatorStatusCode,                         // Originator Status Code
    padLeft(originatingDFI, 8),                   // Originating DFI Identification
    padLeft(String(batchNumber), 7),              // Batch Number
  ].join("");
}

// Generate Entry Detail Record (6)
function generateEntryDetail(
  transactionCode: string,
  receivingDFI: string,
  checkDigit: string,
  dfiAccountNumber: string,
  amount: string,
  individualId: string,
  individualName: string,
  discretionaryData: string,
  addendaRecordIndicator: string,
  traceNumber: string
): string {
  return [
    "6",                                          // Record Type Code
    transactionCode,                              // Transaction Code
    padLeft(receivingDFI, 8),                     // Receiving DFI Identification
    checkDigit,                                   // Check Digit
    padRight(dfiAccountNumber, 17),               // DFI Account Number
    formatAmount(amount),                         // Amount
    padRight(individualId, 15),                   // Individual Identification Number
    padRight(individualName, 22),                 // Individual Name
    padRight(discretionaryData, 2),               // Discretionary Data
    addendaRecordIndicator,                       // Addenda Record Indicator
    padLeft(traceNumber, 15),                     // Trace Number
  ].join("");
}

// Generate Batch Control Record (8)
function generateBatchControl(
  serviceClassCode: string,
  entryAddendaCount: number,
  entryHash: number,
  totalDebitAmount: number,
  totalCreditAmount: number,
  companyId: string,
  originatingDFI: string,
  batchNumber: number
): string {
  return [
    "8",                                          // Record Type Code
    serviceClassCode,                             // Service Class Code
    padLeft(String(entryAddendaCount), 6),        // Entry/Addenda Count
    padLeft(String(entryHash % 10000000000), 10), // Entry Hash
    padLeft(String(Math.round(totalDebitAmount * 100)), 12),  // Total Debit Entry Dollar Amount
    padLeft(String(Math.round(totalCreditAmount * 100)), 12), // Total Credit Entry Dollar Amount
    padRight(companyId, 10),                      // Company Identification
    padRight("", 19),                             // Message Authentication Code (blank)
    padRight("", 6),                              // Reserved
    padLeft(originatingDFI, 8),                   // Originating DFI Identification
    padLeft(String(batchNumber), 7),              // Batch Number
  ].join("");
}

// Generate File Control Record (9)
function generateFileControl(
  batchCount: number,
  blockCount: number,
  entryAddendaCount: number,
  entryHash: number,
  totalDebitAmount: number,
  totalCreditAmount: number
): string {
  return [
    "9",                                          // Record Type Code
    padLeft(String(batchCount), 6),               // Batch Count
    padLeft(String(blockCount), 6),               // Block Count
    padLeft(String(entryAddendaCount), 8),        // Entry/Addenda Count
    padLeft(String(entryHash % 10000000000), 10), // Entry Hash
    padLeft(String(Math.round(totalDebitAmount * 100)), 12),  // Total Debit Entry Dollar Amount
    padLeft(String(Math.round(totalCreditAmount * 100)), 12), // Total Credit Entry Dollar Amount
    padRight("", 39),                             // Reserved
  ].join("");
}

// Calculate check digit for routing number
function calculateCheckDigit(routingNumber: string): string {
  return routingNumber.charAt(8);
}

export const achRouter = router({
  /**
   * List ACH batches
   */
  listBatches: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "generated", "submitted", "accepted", "rejected", "processed"]).optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      let query = db.select().from(achBatches);
      
      if (input.status) {
        query = query.where(eq(achBatches.status, input.status)) as typeof query;
      }

      const batches = await query
        .orderBy(desc(achBatches.createdAt))
        .limit(input.limit);

      return batches;
    }),

  /**
   * Get batch details with entries
   */
  getBatch: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [batch] = await db.select()
        .from(achBatches)
        .where(eq(achBatches.id, input.id));

      if (!batch) return null;

      const entries = await db.select({
        entry: achEntries,
        worker: {
          firstName: timekeepingWorkers.firstName,
          lastName: timekeepingWorkers.lastName,
        }
      })
      .from(achEntries)
      .leftJoin(timekeepingWorkers, eq(achEntries.workerId, timekeepingWorkers.id))
      .where(eq(achEntries.batchId, input.id));

      return {
        ...batch,
        entries: entries.map(({ entry, worker }) => ({
          ...entry,
          accountNumberMasked: `****${entry.accountNumber.slice(-4)}`,
          workerName: worker ? `${worker.firstName} ${worker.lastName}` : entry.individualName,
        })),
      };
    }),

  /**
   * Create ACH batch from payroll runs
   */
  createBatch: protectedProcedure
    .input(z.object({
      payrollRunIds: z.array(z.number()),
      effectiveDate: z.date(),
      companyName: z.string().max(16).default("LAWS COLLECTIVE"),
      companyId: z.string().max(10), // EIN or assigned ID
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get payroll runs
      const runs = await db.select()
        .from(payrollRuns)
        .where(inArray(payrollRuns.id, input.payrollRunIds));

      if (runs.length === 0) {
        throw new Error("No payroll runs found");
      }

      // Generate batch number
      const batchNumber = `ACH-${Date.now()}`;

      // Create batch
      const [batchResult] = await db.insert(achBatches).values({
        batchNumber,
        companyName: input.companyName,
        companyId: input.companyId,
        effectiveDate: input.effectiveDate,
        status: "draft",
      });

      const batchId = batchResult.insertId;
      let totalCredits = 0;
      let entryCount = 0;

      // Create entries for each payroll run
      for (const run of runs) {
        // Get worker's bank account
        const [bankAccount] = await db.select()
          .from(workerBankAccounts)
          .where(and(
            eq(workerBankAccounts.workerId, run.workerId),
            eq(workerBankAccounts.isActive, true),
            eq(workerBankAccounts.isPrimary, true)
          ));

        if (!bankAccount) {
          console.warn(`No bank account for worker ${run.workerId}`);
          continue;
        }

        // Get worker info
        const [worker] = await db.select()
          .from(timekeepingWorkers)
          .where(eq(timekeepingWorkers.id, run.workerId));

        const netPay = parseFloat(run.netPay || "0");
        if (netPay <= 0) continue;

        // Transaction code: 22 = checking credit, 32 = savings credit
        const transactionCode = bankAccount.accountType === "checking" ? "22" : "32";

        await db.insert(achEntries).values({
          batchId,
          payrollRunId: run.id,
          workerId: run.workerId,
          bankAccountId: bankAccount.id,
          transactionCode,
          routingNumber: bankAccount.routingNumber,
          accountNumber: bankAccount.accountNumber,
          amount: run.netPay || "0",
          individualId: String(run.workerId).padStart(15, "0"),
          individualName: worker ? `${worker.lastName} ${worker.firstName}`.substring(0, 22) : "EMPLOYEE",
          status: "pending",
        });

        totalCredits += netPay;
        entryCount++;
      }

      // Update batch totals
      await db.update(achBatches)
        .set({
          totalCredits: String(totalCredits),
          entryCount,
        })
        .where(eq(achBatches.id, batchId));

      return {
        success: true,
        batchId,
        batchNumber,
        entryCount,
        totalCredits,
      };
    }),

  /**
   * Generate NACHA file for a batch
   */
  generateFile: protectedProcedure
    .input(z.object({
      batchId: z.number(),
      immediateDestination: z.string().length(9), // Bank routing number
      immediateDestinationName: z.string().max(23),
      originatingDFI: z.string().length(8), // First 8 digits of your bank routing
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Get batch
      const [batch] = await db.select()
        .from(achBatches)
        .where(eq(achBatches.id, input.batchId));

      if (!batch) throw new Error("Batch not found");

      // Get entries
      const entries = await db.select()
        .from(achEntries)
        .where(eq(achEntries.batchId, input.batchId));

      if (entries.length === 0) {
        throw new Error("No entries in batch");
      }

      const now = new Date();
      const fileIdModifier = "A";
      const lines: string[] = [];

      // File Header
      lines.push(generateFileHeader(
        " " + input.immediateDestination,
        batch.companyId.padStart(10, " "),
        now,
        fileIdModifier,
        input.immediateDestinationName,
        batch.companyName
      ));

      // Batch Header
      lines.push(generateBatchHeader(
        "220", // Credits only
        batch.companyName,
        "",
        batch.companyId,
        "PPD", // Prearranged Payment and Deposit
        "PAYROLL",
        now.toISOString().slice(5, 10).replace("-", ""),
        batch.effectiveDate,
        "1",
        input.originatingDFI,
        1
      ));

      // Entry Details
      let entryHash = 0;
      let totalCredits = 0;
      let traceNum = 1;

      for (const entry of entries) {
        const routingFirst8 = entry.routingNumber.substring(0, 8);
        entryHash += parseInt(routingFirst8);
        totalCredits += parseFloat(entry.amount);

        lines.push(generateEntryDetail(
          entry.transactionCode,
          routingFirst8,
          calculateCheckDigit(entry.routingNumber),
          entry.accountNumber,
          entry.amount,
          entry.individualId,
          entry.individualName,
          "",
          "0",
          input.originatingDFI + String(traceNum).padStart(7, "0")
        ));

        // Update entry status
        await db.update(achEntries)
          .set({ status: "included" })
          .where(eq(achEntries.id, entry.id));

        traceNum++;
      }

      // Batch Control
      lines.push(generateBatchControl(
        "220",
        entries.length,
        entryHash,
        0, // No debits
        totalCredits,
        batch.companyId,
        input.originatingDFI,
        1
      ));

      // File Control
      const totalRecords = lines.length + 1; // +1 for file control
      const blockCount = Math.ceil(totalRecords / BLOCKING_FACTOR);

      lines.push(generateFileControl(
        1, // One batch
        blockCount,
        entries.length,
        entryHash,
        0,
        totalCredits
      ));

      // Pad to block boundary with 9s
      const paddingNeeded = (blockCount * BLOCKING_FACTOR) - lines.length;
      for (let i = 0; i < paddingNeeded; i++) {
        lines.push("9".repeat(RECORD_SIZE));
      }

      const fileContent = lines.join("\r\n");
      const fileName = `ACH_${batch.batchNumber}_${now.toISOString().slice(0, 10)}.txt`;

      // Update batch
      await db.update(achBatches)
        .set({
          status: "generated",
          fileName,
          fileCreatedAt: now,
        })
        .where(eq(achBatches.id, input.batchId));

      return {
        success: true,
        fileName,
        fileContent,
        recordCount: lines.length,
        totalCredits,
        entryCount: entries.length,
      };
    }),

  /**
   * Update batch status
   */
  updateStatus: protectedProcedure
    .input(z.object({
      batchId: z.number(),
      status: z.enum(["submitted", "accepted", "rejected", "processed"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(achBatches)
        .set({ status: input.status })
        .where(eq(achBatches.id, input.batchId));

      // If processed, update entries
      if (input.status === "processed") {
        await db.update(achEntries)
          .set({ status: "settled" })
          .where(eq(achEntries.batchId, input.batchId));
      }

      return { success: true };
    }),

  /**
   * Record ACH return
   */
  recordReturn: protectedProcedure
    .input(z.object({
      entryId: z.number(),
      returnCode: z.string().length(3),
      returnReason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.update(achEntries)
        .set({
          status: "returned",
          returnCode: input.returnCode,
          returnReason: input.returnReason,
        })
        .where(eq(achEntries.id, input.entryId));

      return { success: true };
    }),
});
