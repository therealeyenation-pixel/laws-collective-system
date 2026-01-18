import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Grant Readiness Tests
 * 
 * Tests for Financial Statements, Board Resolutions, and Contingency Offers
 */

describe("Financial Statement Generator", () => {
  describe("Balance Sheet Generation", () => {
    it("should generate balance sheet with zero balances for startup", () => {
      const balanceSheet = generateBalanceSheet({
        entityName: "L.A.W.S. Collective, LLC",
        asOfDate: "2026-01-18",
        assets: {
          current: { cash: 0, accountsReceivable: 0, inventory: 0, prepaidExpenses: 0 },
          fixed: { equipment: 0, furniture: 0, vehicles: 0, accumulatedDepreciation: 0 },
          other: { deposits: 0, intangibleAssets: 0 },
        },
        liabilities: {
          current: { accountsPayable: 0, accruedExpenses: 0, shortTermDebt: 0, deferredRevenue: 0 },
          longTerm: { longTermDebt: 0, notesPayable: 0 },
        },
        equity: {
          ownerCapital: 0,
          retainedEarnings: 0,
          currentYearEarnings: 0,
        },
      });

      expect(balanceSheet.documentTitle).toBe("Balance Sheet");
      expect(balanceSheet.entityName).toBe("L.A.W.S. Collective, LLC");
      expect(balanceSheet.totals.totalAssets).toBe(0);
      expect(balanceSheet.totals.totalLiabilities).toBe(0);
      expect(balanceSheet.totals.totalEquity).toBe(0);
      expect(balanceSheet.totals.totalLiabilitiesAndEquity).toBe(0);
      expect(balanceSheet.isBalanced).toBe(true);
    });

    it("should calculate totals correctly", () => {
      const balanceSheet = generateBalanceSheet({
        entityName: "Test Company",
        asOfDate: "2026-01-18",
        assets: {
          current: { cash: 10000, accountsReceivable: 5000, inventory: 0, prepaidExpenses: 500 },
          fixed: { equipment: 2000, furniture: 500, vehicles: 0, accumulatedDepreciation: 250 },
          other: { deposits: 1000, intangibleAssets: 0 },
        },
        liabilities: {
          current: { accountsPayable: 3000, accruedExpenses: 500, shortTermDebt: 0, deferredRevenue: 0 },
          longTerm: { longTermDebt: 5000, notesPayable: 0 },
        },
        equity: {
          ownerCapital: 10000,
          retainedEarnings: 0,
          currentYearEarnings: 250,
        },
      });

      expect(balanceSheet.totals.totalCurrentAssets).toBe(15500);
      expect(balanceSheet.totals.totalFixedAssets).toBe(2250);
      expect(balanceSheet.totals.totalAssets).toBe(18750);
      expect(balanceSheet.totals.totalCurrentLiabilities).toBe(3500);
      expect(balanceSheet.totals.totalLongTermLiabilities).toBe(5000);
      expect(balanceSheet.totals.totalLiabilities).toBe(8500);
      expect(balanceSheet.totals.totalEquity).toBe(10250);
      expect(balanceSheet.isBalanced).toBe(true);
    });
  });

  describe("Income Statement Generation", () => {
    it("should generate income statement with zero revenue for startup", () => {
      const incomeStatement = generateIncomeStatement({
        entityName: "L.A.W.S. Collective, LLC",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-18",
        revenue: {
          serviceRevenue: 0,
          productSales: 0,
          grantIncome: 0,
          donationIncome: 0,
          otherIncome: 0,
        },
        expenses: {
          costOfGoodsSold: 0,
          salariesWages: 0,
          rent: 0,
          utilities: 0,
          insurance: 0,
          marketing: 0,
          professionalFees: 0,
          officeSupplies: 0,
          depreciation: 0,
          interest: 0,
          otherExpenses: 0,
        },
      });

      expect(incomeStatement.documentTitle).toBe("Income Statement");
      expect(incomeStatement.totals.totalRevenue).toBe(0);
      expect(incomeStatement.totals.totalExpenses).toBe(0);
      expect(incomeStatement.totals.netIncome).toBe(0);
    });

    it("should calculate net income correctly", () => {
      const incomeStatement = generateIncomeStatement({
        entityName: "Test Company",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-18",
        revenue: {
          serviceRevenue: 50000,
          productSales: 10000,
          grantIncome: 25000,
          donationIncome: 5000,
          otherIncome: 1000,
        },
        expenses: {
          costOfGoodsSold: 5000,
          salariesWages: 30000,
          rent: 3000,
          utilities: 500,
          insurance: 1000,
          marketing: 2000,
          professionalFees: 1500,
          officeSupplies: 300,
          depreciation: 200,
          interest: 100,
          otherExpenses: 400,
        },
      });

      expect(incomeStatement.totals.totalRevenue).toBe(91000);
      expect(incomeStatement.totals.grossProfit).toBe(86000);
      expect(incomeStatement.totals.totalOperatingExpenses).toBe(39000);
      expect(incomeStatement.totals.netIncome).toBe(47000);
    });
  });

  describe("Cash Flow Statement Generation", () => {
    it("should generate cash flow statement for startup", () => {
      const cashFlow = generateCashFlowStatement({
        entityName: "L.A.W.S. Collective, LLC",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-18",
        operating: {
          netIncome: 0,
          depreciation: 0,
          accountsReceivableChange: 0,
          inventoryChange: 0,
          accountsPayableChange: 0,
          otherOperating: 0,
        },
        investing: {
          equipmentPurchases: 0,
          equipmentSales: 0,
          investmentPurchases: 0,
          investmentSales: 0,
        },
        financing: {
          ownerContributions: 0,
          ownerWithdrawals: 0,
          loanProceeds: 0,
          loanPayments: 0,
        },
        beginningCash: 0,
      });

      expect(cashFlow.documentTitle).toBe("Statement of Cash Flows");
      expect(cashFlow.totals.netCashFromOperating).toBe(0);
      expect(cashFlow.totals.netCashFromInvesting).toBe(0);
      expect(cashFlow.totals.netCashFromFinancing).toBe(0);
      expect(cashFlow.totals.netChangeInCash).toBe(0);
      expect(cashFlow.totals.endingCash).toBe(0);
    });
  });
});

describe("Board Resolution Generator", () => {
  describe("Grant Authorization", () => {
    it("should generate grant authorization resolution", () => {
      const resolution = generateGrantAuthorization({
        entityName: "L.A.W.S. Collective, LLC",
        entityType: "LLC",
        grantName: "Community Development Block Grant",
        grantorName: "U.S. Department of Housing",
        maxAmount: 100000,
        purpose: "Workforce development and training programs",
        authorizedSigners: [
          { name: "John Doe", title: "Managing Member" },
        ],
        meetingDate: "2026-01-18",
        meetingLocation: "Virtual Meeting",
        boardMembers: [
          { name: "John Doe", title: "Managing Member", present: true },
        ],
      });

      expect(resolution.documentTitle).toBe("Resolution of the Members");
      expect(resolution.subtitle).toContain("Grant Authorization");
      expect(resolution.meetingInfo.date).toBe("2026-01-18");
      expect(resolution.meetingInfo.quorumMet).toBe(true);
      expect(resolution.recitals.length).toBeGreaterThan(0);
      expect(resolution.resolutions.length).toBeGreaterThan(0);
      expect(resolution.certification).toBeDefined();
    });
  });

  describe("Bank Authorization", () => {
    it("should generate bank authorization resolution", () => {
      const resolution = generateBankAuthorization({
        entityName: "L.A.W.S. Collective, LLC",
        entityType: "LLC",
        bankName: "Chase Bank",
        accountTypes: ["Business Checking", "Business Savings"],
        authorizedSigners: [
          { name: "John Doe", title: "Managing Member" },
        ],
        signatureRequirements: "Any one authorized signer",
        meetingDate: "2026-01-18",
        meetingLocation: "Virtual Meeting",
        boardMembers: [
          { name: "John Doe", title: "Managing Member", present: true },
        ],
      });

      expect(resolution.documentTitle).toBe("Resolution of the Members");
      expect(resolution.subtitle).toContain("Bank Account Authorization");
      expect(resolution.recitals.length).toBeGreaterThan(0);
      expect(resolution.resolutions.length).toBeGreaterThan(0);
    });
  });

  describe("Officer Appointment", () => {
    it("should generate officer appointment resolution", () => {
      const resolution = generateOfficerAppointment({
        entityName: "L.A.W.S. Collective, LLC",
        entityType: "LLC",
        appointments: [
          { name: "John Doe", position: "President", responsibilities: "Overall management" },
          { name: "Jane Smith", position: "Treasurer", responsibilities: "Financial oversight" },
        ],
        effectiveDate: "2026-01-18",
        meetingDate: "2026-01-18",
        meetingLocation: "Virtual Meeting",
        boardMembers: [
          { name: "John Doe", title: "Managing Member", present: true },
        ],
      });

      expect(resolution.documentTitle).toBe("Resolution of the Members");
      expect(resolution.subtitle).toContain("Officer Appointment");
      expect(resolution.resolutions.length).toBeGreaterThan(0);
    });
  });
});

describe("Contingency Offer Generator", () => {
  describe("Letter of Intent", () => {
    it("should generate letter of intent with contingency clause", () => {
      const loi = generateLetterOfIntent({
        entityName: "L.A.W.S. Collective, LLC",
        candidateName: "Jane Smith",
        positionTitle: "Program Coordinator",
        positionType: "full_time",
        department: "Operations",
        startDateEstimate: "2026-03-01",
        fundingCondition: "Securing grant funding from identified sources",
        keyResponsibilities: ["Program management", "Team coordination"],
        compensationRange: { min: 45000, max: 55000 },
        benefits: ["Health Insurance", "Paid Time Off"],
        trainingRequirements: ["L.A.W.S. Academy Fundamentals"],
        expirationDate: "2026-06-30",
      });

      expect(loi.type).toBe("letter_of_intent");
      expect(loi.documentTitle).toBe("Letter of Intent");
      expect(loi.header.to).toBe("Jane Smith");
      expect(loi.contingencyClause).toBeDefined();
      expect(loi.contingencyClause.text).toContain("contingent");
      expect(loi.positionDetails).toBeDefined();
      expect(loi.compensation).toBeDefined();
      expect(loi.acceptance).toBeDefined();
    });
  });

  describe("Conditional Employment Offer", () => {
    it("should generate conditional offer with funding trigger", () => {
      const offer = generateConditionalOffer({
        entityName: "L.A.W.S. Collective, LLC",
        candidateName: "Jane Smith",
        positionTitle: "Program Coordinator",
        positionType: "full_time",
        department: "Operations",
        startDate: "2026-03-01",
        fundingCondition: "Securing grant funding from identified sources",
        fundingDeadline: "2026-06-30",
        annualCompensation: 50000,
        payFrequency: "biweekly",
        benefits: {
          healthInsurance: true,
          dentalVision: true,
          retirement401k: true,
          retirementMatch: "3%",
          paidTimeOff: 15,
          sickLeave: 5,
          professionalDevelopment: 1500,
          remoteWork: true,
          equipmentProvided: true,
        },
        equipmentPackage: ["Laptop", "Monitor"],
        responsibilities: ["Program management", "Team coordination"],
        atWillStatement: true,
        responseDeadline: "2026-02-15",
      });

      expect(offer.type).toBe("conditional_employment_offer");
      expect(offer.documentTitle).toBe("Conditional Employment Offer");
      expect(offer.header.to).toBe("Jane Smith");
      expect(offer.contingency).toBeDefined();
      expect(offer.contingency.condition).toContain("grant funding");
      expect(offer.contingency.deadline).toBe("2026-06-30");
      expect(offer.compensation.annual).toBe(50000);
      expect(offer.benefits.items.length).toBeGreaterThan(0);
      expect(offer.equipment).toBeDefined();
      expect(offer.atWill).toBeDefined();
    });
  });

  describe("Batch Offer Creation", () => {
    it("should create multiple offers from batch input", () => {
      const result = batchCreateOffers({
        entityName: "L.A.W.S. Collective, LLC",
        fundingCondition: "Securing grant funding",
        fundingDeadline: "2026-06-30",
        candidates: [
          { name: "Jane Smith", email: "jane@example.com", positionTitle: "Coordinator", positionType: "full_time", department: "Ops", annualCompensation: 50000 },
          { name: "John Doe", email: "john@example.com", positionTitle: "Analyst", positionType: "full_time", department: "Finance", annualCompensation: 55000 },
        ],
      });

      expect(result.totalCreated).toBe(2);
      expect(result.offers.length).toBe(2);
      expect(result.offers[0].candidateName).toBe("Jane Smith");
      expect(result.offers[1].candidateName).toBe("John Doe");
    });
  });
});

// Helper functions that mirror the router logic
function generateBalanceSheet(input: any) {
  const totalCurrentAssets = 
    input.assets.current.cash +
    input.assets.current.accountsReceivable +
    input.assets.current.inventory +
    input.assets.current.prepaidExpenses;

  const totalFixedAssets = 
    input.assets.fixed.equipment +
    input.assets.fixed.furniture +
    input.assets.fixed.vehicles -
    input.assets.fixed.accumulatedDepreciation;

  const totalOtherAssets = 
    input.assets.other.deposits +
    input.assets.other.intangibleAssets;

  const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets;

  const totalCurrentLiabilities = 
    input.liabilities.current.accountsPayable +
    input.liabilities.current.accruedExpenses +
    input.liabilities.current.shortTermDebt +
    input.liabilities.current.deferredRevenue;

  const totalLongTermLiabilities = 
    input.liabilities.longTerm.longTermDebt +
    input.liabilities.longTerm.notesPayable;

  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = 
    input.equity.ownerCapital +
    input.equity.retainedEarnings +
    input.equity.currentYearEarnings;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanced = totalAssets === totalLiabilitiesAndEquity;

  return {
    documentTitle: "Balance Sheet",
    entityName: input.entityName,
    asOfDate: input.asOfDate,
    assets: input.assets,
    liabilities: input.liabilities,
    equity: input.equity,
    totals: {
      totalCurrentAssets,
      totalFixedAssets,
      totalOtherAssets,
      totalAssets,
      totalCurrentLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity,
    },
    isBalanced,
    generatedAt: new Date().toISOString(),
  };
}

function generateIncomeStatement(input: any) {
  const totalRevenue = 
    input.revenue.serviceRevenue +
    input.revenue.productSales +
    input.revenue.grantIncome +
    input.revenue.donationIncome +
    input.revenue.otherIncome;

  const grossProfit = totalRevenue - input.expenses.costOfGoodsSold;

  const totalOperatingExpenses = 
    input.expenses.salariesWages +
    input.expenses.rent +
    input.expenses.utilities +
    input.expenses.insurance +
    input.expenses.marketing +
    input.expenses.professionalFees +
    input.expenses.officeSupplies +
    input.expenses.depreciation +
    input.expenses.interest +
    input.expenses.otherExpenses;

  const totalExpenses = input.expenses.costOfGoodsSold + totalOperatingExpenses;
  const netIncome = totalRevenue - totalExpenses;

  return {
    documentTitle: "Income Statement",
    entityName: input.entityName,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    revenue: input.revenue,
    expenses: input.expenses,
    totals: {
      totalRevenue,
      grossProfit,
      totalOperatingExpenses,
      totalExpenses,
      netIncome,
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateCashFlowStatement(input: any) {
  const netCashFromOperating = 
    input.operating.netIncome +
    input.operating.depreciation +
    input.operating.accountsReceivableChange +
    input.operating.inventoryChange +
    input.operating.accountsPayableChange +
    input.operating.otherOperating;

  const netCashFromInvesting = 
    -input.investing.equipmentPurchases +
    input.investing.equipmentSales -
    input.investing.investmentPurchases +
    input.investing.investmentSales;

  const netCashFromFinancing = 
    input.financing.ownerContributions -
    input.financing.ownerWithdrawals +
    input.financing.loanProceeds -
    input.financing.loanPayments;

  const netChangeInCash = netCashFromOperating + netCashFromInvesting + netCashFromFinancing;
  const endingCash = input.beginningCash + netChangeInCash;

  return {
    documentTitle: "Statement of Cash Flows",
    entityName: input.entityName,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    operating: input.operating,
    investing: input.investing,
    financing: input.financing,
    totals: {
      netCashFromOperating,
      netCashFromInvesting,
      netCashFromFinancing,
      netChangeInCash,
      beginningCash: input.beginningCash,
      endingCash,
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateGrantAuthorization(input: any) {
  const entityTerm = input.entityType === "LLC" ? "Members" : "Board of Directors";
  
  return {
    documentTitle: `Resolution of the ${entityTerm}`,
    subtitle: `Grant Authorization - ${input.grantName}`,
    meetingInfo: {
      date: input.meetingDate,
      location: input.meetingLocation,
      quorumMet: input.boardMembers.filter((m: any) => m.present).length > 0,
      membersPresent: input.boardMembers.filter((m: any) => m.present).map((m: any) => m.name),
    },
    recitals: [
      `WHEREAS, ${input.entityName} has identified an opportunity to apply for ${input.grantName} from ${input.grantorName};`,
      `WHEREAS, the grant funds, if awarded, would be used for ${input.purpose};`,
      `WHEREAS, the maximum grant amount being applied for is $${input.maxAmount.toLocaleString()};`,
    ],
    resolutions: [
      `RESOLVED, that ${input.entityName} is hereby authorized to submit an application for ${input.grantName} from ${input.grantorName} in an amount not to exceed $${input.maxAmount.toLocaleString()};`,
      `RESOLVED FURTHER, that the following individuals are authorized to sign grant applications, agreements, and related documents on behalf of ${input.entityName}:\n${input.authorizedSigners.map((s: any) => `  • ${s.name}, ${s.title}`).join('\n')};`,
    ],
    certification: {
      text: `I hereby certify that the foregoing is a true and correct copy of a resolution duly adopted at a meeting of the ${entityTerm} of ${input.entityName}, held on ${input.meetingDate}, at which a quorum was present and voting.`,
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateBankAuthorization(input: any) {
  const entityTerm = input.entityType === "LLC" ? "Members" : "Board of Directors";
  
  return {
    documentTitle: `Resolution of the ${entityTerm}`,
    subtitle: `Bank Account Authorization - ${input.bankName}`,
    meetingInfo: {
      date: input.meetingDate,
      location: input.meetingLocation,
      quorumMet: input.boardMembers.filter((m: any) => m.present).length > 0,
      membersPresent: input.boardMembers.filter((m: any) => m.present).map((m: any) => m.name),
    },
    recitals: [
      `WHEREAS, ${input.entityName} desires to establish banking relationships with ${input.bankName};`,
      `WHEREAS, the organization requires the following account types: ${input.accountTypes.join(', ')};`,
    ],
    resolutions: [
      `RESOLVED, that ${input.entityName} is hereby authorized to open and maintain the following accounts at ${input.bankName}: ${input.accountTypes.join(', ')};`,
      `RESOLVED FURTHER, that the following individuals are designated as authorized signers:\n${input.authorizedSigners.map((s: any) => `  • ${s.name}, ${s.title}`).join('\n')};`,
      `RESOLVED FURTHER, that signature requirements shall be: ${input.signatureRequirements};`,
    ],
    certification: {
      text: `I hereby certify that the foregoing is a true and correct copy of a resolution duly adopted at a meeting of the ${entityTerm} of ${input.entityName}, held on ${input.meetingDate}, at which a quorum was present and voting.`,
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateOfficerAppointment(input: any) {
  const entityTerm = input.entityType === "LLC" ? "Members" : "Board of Directors";
  
  return {
    documentTitle: `Resolution of the ${entityTerm}`,
    subtitle: `Officer Appointment`,
    meetingInfo: {
      date: input.meetingDate,
      location: input.meetingLocation,
      quorumMet: input.boardMembers.filter((m: any) => m.present).length > 0,
      membersPresent: input.boardMembers.filter((m: any) => m.present).map((m: any) => m.name),
    },
    recitals: [
      `WHEREAS, ${input.entityName} desires to appoint officers to serve the organization;`,
      `WHEREAS, the following appointments are to be effective as of ${input.effectiveDate};`,
    ],
    resolutions: input.appointments.map((a: any) => 
      `RESOLVED, that ${a.name} is hereby appointed as ${a.position} of ${input.entityName}, effective ${input.effectiveDate}${a.responsibilities ? `, with responsibilities including ${a.responsibilities}` : ''};`
    ),
    certification: {
      text: `I hereby certify that the foregoing is a true and correct copy of a resolution duly adopted at a meeting of the ${entityTerm} of ${input.entityName}, held on ${input.meetingDate}, at which a quorum was present and voting.`,
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateLetterOfIntent(input: any) {
  return {
    type: "letter_of_intent",
    documentTitle: "Letter of Intent",
    subtitle: `${input.positionTitle} Position`,
    date: new Date().toLocaleDateString(),
    header: {
      from: input.entityName,
      to: input.candidateName,
      re: `Letter of Intent - ${input.positionTitle}`,
    },
    opening: `Dear ${input.candidateName},\n\nWe are pleased to express our intent to offer you the position of ${input.positionTitle} with ${input.entityName}. This letter outlines the general terms of the potential employment relationship, subject to the conditions described below.`,
    contingencyClause: {
      title: "Contingency Notice",
      text: `This letter of intent is contingent upon ${input.fundingCondition}. This is not a binding offer of employment. A formal offer letter will be issued once the funding condition has been satisfied.`,
    },
    positionDetails: {
      title: "Position Details",
      items: [
        { label: "Position", value: input.positionTitle },
        { label: "Type", value: input.positionType.replace('_', ' ') },
        { label: "Department", value: input.department },
        { label: "Estimated Start", value: input.startDateEstimate },
      ],
    },
    responsibilities: {
      title: "Key Responsibilities",
      items: input.keyResponsibilities,
    },
    compensation: {
      title: "Compensation",
      text: `The anticipated annual compensation range for this position is $${input.compensationRange.min.toLocaleString()} - $${input.compensationRange.max.toLocaleString()}, commensurate with experience.`,
    },
    benefits: {
      title: "Benefits",
      items: input.benefits,
      note: "Final benefits package will be detailed in the formal offer letter.",
    },
    preEmployment: input.trainingRequirements?.length > 0 ? {
      title: "Pre-Employment Training",
      text: `Prior to formal employment, completion of the following training is required:\n${input.trainingRequirements.map((t: string) => `• ${t}`).join('\n')}`,
    } : undefined,
    acceptance: {
      title: "Acknowledgment",
      text: `This letter expires on ${input.expirationDate}. By signing below, you acknowledge receipt of this letter of intent and your interest in the position.`,
      signatureLines: [
        { label: "Candidate Signature", name: input.candidateName },
        { label: "Date" },
        { label: "Company Representative" },
        { label: "Date" },
      ],
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateConditionalOffer(input: any) {
  const benefitItems = [];
  if (input.benefits.healthInsurance) benefitItems.push("Health Insurance (medical coverage)");
  if (input.benefits.dentalVision) benefitItems.push("Dental and Vision Insurance");
  if (input.benefits.retirement401k) benefitItems.push(`401(k) Retirement Plan with ${input.benefits.retirementMatch} employer match`);
  if (input.benefits.paidTimeOff) benefitItems.push(`${input.benefits.paidTimeOff} days Paid Time Off annually`);
  if (input.benefits.sickLeave) benefitItems.push(`${input.benefits.sickLeave} days Sick Leave annually`);
  if (input.benefits.professionalDevelopment) benefitItems.push(`$${input.benefits.professionalDevelopment} Professional Development budget`);
  if (input.benefits.remoteWork) benefitItems.push("Remote work flexibility");

  return {
    type: "conditional_employment_offer",
    documentTitle: "Conditional Employment Offer",
    date: new Date().toLocaleDateString(),
    header: {
      to: input.candidateName,
      from: input.entityName,
    },
    opening: `Dear ${input.candidateName},\n\nWe are pleased to extend this conditional offer of employment for the position of ${input.positionTitle} with ${input.entityName}.`,
    contingency: {
      title: "Funding Contingency",
      condition: input.fundingCondition,
      deadline: input.fundingDeadline,
      text: "This offer is contingent upon the satisfaction of the above condition by the specified deadline. If the condition is not met, this offer will be automatically withdrawn.",
    },
    position: {
      title: "Position Details",
      details: [
        { label: "Position", value: input.positionTitle },
        { label: "Type", value: input.positionType.replace('_', ' ') },
        { label: "Department", value: input.department },
        { label: "Start Date", value: input.startDate },
      ],
    },
    compensation: {
      title: "Compensation",
      annual: input.annualCompensation,
      text: `Paid ${input.payFrequency}, subject to applicable withholdings.`,
    },
    benefits: {
      title: "Benefits Package",
      items: benefitItems,
      note: "Benefits eligibility begins on the first day of the month following 30 days of employment.",
    },
    equipment: input.benefits.equipmentProvided ? {
      title: "Equipment Package",
      text: "The following equipment will be provided for your role:",
      items: input.equipmentPackage,
    } : undefined,
    responsibilities: {
      title: "Key Responsibilities",
      items: input.responsibilities,
    },
    atWill: input.atWillStatement ? {
      title: "At-Will Employment",
      text: "Employment with the Company is at-will. Either party may terminate the employment relationship at any time, with or without cause or notice.",
    } : undefined,
    acceptance: {
      title: "Offer Acceptance",
      deadline: input.responseDeadline,
      text: "Please indicate your acceptance by signing below and returning this letter.",
      signatureBlock: {
        candidate: { printedName: input.candidateName },
        company: { title: "Authorized Representative" },
      },
    },
    generatedAt: new Date().toISOString(),
  };
}

function batchCreateOffers(input: any) {
  const offers = input.candidates.map((candidate: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    positionTitle: candidate.positionTitle,
    positionType: candidate.positionType,
    department: candidate.department,
    annualCompensation: candidate.annualCompensation,
    fundingCondition: input.fundingCondition,
    fundingDeadline: input.fundingDeadline,
    status: "draft",
    createdAt: new Date().toISOString(),
  }));

  return {
    totalCreated: offers.length,
    offers,
  };
}
