import { getDb } from "../db";
import { sql } from "drizzle-orm";

// ============================================
// AUTONOMOUS TAX CALCULATION ENGINE
// Self-contained tax calculations using internal tables
// Export-ready for external system integration
// ============================================

// 2024 Federal Tax Brackets
const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  married_filing_separately: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// FICA rates 2024
const FICA_RATES = {
  socialSecurity: { rate: 0.062, wageBase: 168600 },
  medicare: { rate: 0.0145, additionalRate: 0.009, additionalThreshold: 200000 },
};

// Standard deductions 2024
const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  married_filing_jointly: 29200,
  married_filing_separately: 14600,
  head_of_household: 21900,
  qualifying_widow: 29200,
};

export interface TaxCalculationInput {
  grossPay: number;
  annualizedIncome: number;
  periodsPerYear: number;
  filingStatus: string;
  stateCode: string;
  localityName?: string;
  countryCode?: string;
  ytdGrossWages?: number;
  additionalWithholding?: number;
}

export interface TaxCalculationResult {
  federalWithholding: number;
  stateWithholding: number;
  localWithholding: number;
  socialSecurityWithholding: number;
  medicareWithholding: number;
  additionalWithholding: number;
  totalWithholdings: number;
  effectiveStateTaxRate: number;
  effectiveLocalTaxRate: number;
  taxDetails: {
    stateCode: string;
    stateName: string;
    stateTaxType: string;
    localityName: string | null;
    localTaxRate: number | null;
  };
}

/**
 * Get state tax rate from internal database
 * Autonomous operation - no external API required
 */
export async function getStateTaxRate(
  stateCode: string,
  countryCode: string = "USA"
): Promise<{
  taxType: string;
  flatRate: number | null;
  stateName: string;
  hasLocalTax: boolean;
} | null> {
  const db = await getDb();
 if (!db) throw new Error("Database not available");
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT state_name, tax_type, flat_rate, has_local_tax
    FROM state_tax_rates
    WHERE country_code = ${countryCode}
      AND state_code = ${stateCode}
      AND effective_date <= CURDATE()
      AND (expiration_date IS NULL OR expiration_date > CURDATE())
    ORDER BY effective_date DESC
    LIMIT 1
  `);

  const rows = (result as unknown as any[][])[0] || [];
  if (!rows || rows.length === 0) return null;

  return {
    taxType: rows[0].tax_type,
    flatRate: rows[0].flat_rate ? Number(rows[0].flat_rate) : null,
    stateName: rows[0].state_name,
    hasLocalTax: Boolean(rows[0].has_local_tax),
  };
}

/**
 * Get local tax rate from internal database
 */
export async function getLocalTaxRate(
  stateCode: string,
  localityName: string,
  countryCode: string = "USA"
): Promise<number | null> {
  const db = await getDb();
 if (!db) throw new Error("Database not available");
  if (!db) return null;

  const result = await db.execute(sql`
    SELECT tax_rate
    FROM local_tax_rates
    WHERE country_code = ${countryCode}
      AND state_code = ${stateCode}
      AND locality_name = ${localityName}
      AND effective_date <= CURDATE()
      AND (expiration_date IS NULL OR expiration_date > CURDATE())
    ORDER BY effective_date DESC
    LIMIT 1
  `);

  const rows = (result as unknown as any[][])[0] || [];
  if (!rows || rows.length === 0) return null;

  return Number(rows[0].tax_rate);
}

/**
 * Get all localities with local taxes for a state
 */
export async function getLocalitiesForState(
  stateCode: string,
  countryCode: string = "USA"
): Promise<Array<{ name: string; type: string; rate: number }>> {
  const db = await getDb();
 if (!db) throw new Error("Database not available");
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT locality_name, locality_type, tax_rate
    FROM local_tax_rates
    WHERE country_code = ${countryCode}
      AND state_code = ${stateCode}
      AND effective_date <= CURDATE()
      AND (expiration_date IS NULL OR expiration_date > CURDATE())
    ORDER BY locality_name
  `);

  const rows = (result as unknown as any[][])[0] || [];
  return rows.map((r: any) => ({
    name: r.locality_name,
    type: r.locality_type,
    rate: Number(r.tax_rate),
  }));
}

/**
 * Calculate federal income tax withholding
 */
export function calculateFederalTax(
  annualizedIncome: number,
  filingStatus: string,
  periodsPerYear: number
): number {
  const brackets =
    FEDERAL_TAX_BRACKETS_2024[filingStatus as keyof typeof FEDERAL_TAX_BRACKETS_2024] ||
    FEDERAL_TAX_BRACKETS_2024.single;

  // Apply standard deduction
  const standardDeduction =
    STANDARD_DEDUCTIONS_2024[filingStatus as keyof typeof STANDARD_DEDUCTIONS_2024] ||
    STANDARD_DEDUCTIONS_2024.single;
  const taxableIncome = Math.max(0, annualizedIncome - standardDeduction);

  let federalTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max - bracket.min
    );
    federalTax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return federalTax / periodsPerYear;
}

/**
 * Calculate state income tax withholding using internal tables
 */
export async function calculateStateTax(
  grossPay: number,
  annualizedIncome: number,
  stateCode: string,
  filingStatus: string,
  periodsPerYear: number,
  countryCode: string = "USA"
): Promise<{ withholding: number; effectiveRate: number; taxType: string; stateName: string }> {
  const stateInfo = await getStateTaxRate(stateCode, countryCode);

  if (!stateInfo) {
    // State not found - default to 0 (could be international or unknown)
    return { withholding: 0, effectiveRate: 0, taxType: "unknown", stateName: stateCode };
  }

  if (stateInfo.taxType === "none") {
    return { withholding: 0, effectiveRate: 0, taxType: "none", stateName: stateInfo.stateName };
  }

  if (stateInfo.taxType === "flat" && stateInfo.flatRate !== null) {
    const withholding = grossPay * stateInfo.flatRate;
    return {
      withholding,
      effectiveRate: stateInfo.flatRate,
      taxType: "flat",
      stateName: stateInfo.stateName,
    };
  }

  // Progressive tax - use simplified calculation
  // In production, would load state_tax_brackets table
  // For now, use an average rate based on income level
  let effectiveRate = 0;
  if (annualizedIncome <= 25000) {
    effectiveRate = 0.02;
  } else if (annualizedIncome <= 50000) {
    effectiveRate = 0.035;
  } else if (annualizedIncome <= 100000) {
    effectiveRate = 0.045;
  } else if (annualizedIncome <= 200000) {
    effectiveRate = 0.055;
  } else {
    effectiveRate = 0.065;
  }

  const withholding = grossPay * effectiveRate;
  return {
    withholding,
    effectiveRate,
    taxType: "progressive",
    stateName: stateInfo.stateName,
  };
}

/**
 * Calculate local income tax withholding
 */
export async function calculateLocalTax(
  grossPay: number,
  stateCode: string,
  localityName: string | undefined,
  countryCode: string = "USA"
): Promise<{ withholding: number; effectiveRate: number; localityName: string | null }> {
  if (!localityName) {
    return { withholding: 0, effectiveRate: 0, localityName: null };
  }

  const localRate = await getLocalTaxRate(stateCode, localityName, countryCode);

  if (localRate === null) {
    return { withholding: 0, effectiveRate: 0, localityName };
  }

  return {
    withholding: grossPay * localRate,
    effectiveRate: localRate,
    localityName,
  };
}

/**
 * Calculate FICA taxes (Social Security and Medicare)
 */
export function calculateFICA(
  grossPay: number,
  annualizedIncome: number,
  ytdGrossWages: number = 0,
  periodsPerYear: number
): { socialSecurity: number; medicare: number } {
  // Social Security - capped at wage base
  const remainingWageBase = Math.max(0, FICA_RATES.socialSecurity.wageBase - ytdGrossWages);
  const taxableForSS = Math.min(grossPay, remainingWageBase);
  const socialSecurity = taxableForSS * FICA_RATES.socialSecurity.rate;

  // Medicare - no wage base limit, additional tax above threshold
  let medicare = grossPay * FICA_RATES.medicare.rate;
  if (annualizedIncome > FICA_RATES.medicare.additionalThreshold) {
    medicare += grossPay * FICA_RATES.medicare.additionalRate;
  }

  return { socialSecurity, medicare };
}

/**
 * Complete tax calculation - autonomous operation
 * Uses internal tax tables, no external dependencies
 */
export async function calculateAllTaxes(
  input: TaxCalculationInput
): Promise<TaxCalculationResult> {
  const {
    grossPay,
    annualizedIncome,
    periodsPerYear,
    filingStatus,
    stateCode,
    localityName,
    countryCode = "USA",
    ytdGrossWages = 0,
    additionalWithholding = 0,
  } = input;

  // Federal tax
  const federalWithholding = calculateFederalTax(
    annualizedIncome,
    filingStatus,
    periodsPerYear
  );

  // State tax
  const stateResult = await calculateStateTax(
    grossPay,
    annualizedIncome,
    stateCode,
    filingStatus,
    periodsPerYear,
    countryCode
  );

  // Local tax
  const localResult = await calculateLocalTax(
    grossPay,
    stateCode,
    localityName,
    countryCode
  );

  // FICA
  const fica = calculateFICA(grossPay, annualizedIncome, ytdGrossWages, periodsPerYear);

  const totalWithholdings =
    federalWithholding +
    stateResult.withholding +
    localResult.withholding +
    fica.socialSecurity +
    fica.medicare +
    additionalWithholding;

  return {
    federalWithholding,
    stateWithholding: stateResult.withholding,
    localWithholding: localResult.withholding,
    socialSecurityWithholding: fica.socialSecurity,
    medicareWithholding: fica.medicare,
    additionalWithholding,
    totalWithholdings,
    effectiveStateTaxRate: stateResult.effectiveRate,
    effectiveLocalTaxRate: localResult.effectiveRate,
    taxDetails: {
      stateCode,
      stateName: stateResult.stateName,
      stateTaxType: stateResult.taxType,
      localityName: localResult.localityName,
      localTaxRate: localResult.effectiveRate || null,
    },
  };
}

/**
 * Get all states with tax information
 * For UI dropdowns and configuration
 */
export async function getAllStates(
  countryCode: string = "USA"
): Promise<Array<{
  stateCode: string;
  stateName: string;
  taxType: string;
  flatRate: number | null;
  hasLocalTax: boolean;
}>> {
  const db = await getDb();
 if (!db) throw new Error("Database not available");
  if (!db) return [];

  const result = await db.execute(sql`
    SELECT state_code, state_name, tax_type, flat_rate, has_local_tax
    FROM state_tax_rates
    WHERE country_code = ${countryCode}
      AND effective_date <= CURDATE()
      AND (expiration_date IS NULL OR expiration_date > CURDATE())
    ORDER BY state_name
  `);

  const rows = (result as unknown as any[][])[0] || [];
  return rows.map((r: any) => ({
    stateCode: r.state_code,
    stateName: r.state_name,
    taxType: r.tax_type,
    flatRate: r.flat_rate ? Number(r.flat_rate) : null,
    hasLocalTax: Boolean(r.has_local_tax),
  }));
}

/**
 * Export tax calculation data in external system format
 * For integration with QuickBooks, ADP, etc.
 */
export function formatForExternalSystem(
  result: TaxCalculationResult,
  format: "quickbooks" | "adp" | "gusto" | "deltek"
): Record<string, any> {
  switch (format) {
    case "quickbooks":
      return {
        federal_income_tax: result.federalWithholding.toFixed(2),
        state_income_tax: result.stateWithholding.toFixed(2),
        local_income_tax: result.localWithholding.toFixed(2),
        social_security_employee: result.socialSecurityWithholding.toFixed(2),
        medicare_employee: result.medicareWithholding.toFixed(2),
        additional_withholding: result.additionalWithholding.toFixed(2),
      };
    case "adp":
      return {
        FIT: result.federalWithholding.toFixed(2),
        SIT: result.stateWithholding.toFixed(2),
        LIT: result.localWithholding.toFixed(2),
        OASDI_EE: result.socialSecurityWithholding.toFixed(2),
        MED_EE: result.medicareWithholding.toFixed(2),
        ADD_WH: result.additionalWithholding.toFixed(2),
      };
    case "gusto":
      return {
        federal_tax: result.federalWithholding,
        state_tax: result.stateWithholding,
        local_tax: result.localWithholding,
        social_security: result.socialSecurityWithholding,
        medicare: result.medicareWithholding,
        additional: result.additionalWithholding,
      };
    case "deltek":
      return {
        FEDERAL_WH: result.federalWithholding.toFixed(2),
        STATE_WH: result.stateWithholding.toFixed(2),
        LOCAL_WH: result.localWithholding.toFixed(2),
        FICA_SS: result.socialSecurityWithholding.toFixed(2),
        FICA_MED: result.medicareWithholding.toFixed(2),
        ADDL_WH: result.additionalWithholding.toFixed(2),
        STATE_CODE: result.taxDetails.stateCode,
        LOCAL_CODE: result.taxDetails.localityName || "",
      };
    default:
      return result as any;
  }
}
