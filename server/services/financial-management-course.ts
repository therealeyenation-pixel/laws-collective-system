/**
 * Financial Management Course Service
 * 6 modules covering startup costs, revenue, expenses, cash flow, break-even, and financial planning
 */

export interface FinancialLesson {
  id: string;
  title: string;
  content: string;
  duration: number; // minutes
  keyTerms: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface SpreadsheetField {
  name: string;
  label: string;
  type: "text" | "number" | "currency" | "percentage" | "date" | "select" | "calculated";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  formula?: string;
  category?: string;
}

export interface OutputSpreadsheet {
  title: string;
  description: string;
  type: "worksheet" | "projection" | "budget" | "analysis" | "plan";
  fields: SpreadsheetField[];
  calculations?: { name: string; formula: string; description: string }[];
}

export interface FinancialModule {
  id: number;
  title: string;
  description: string;
  lessons: FinancialLesson[];
  quiz: QuizQuestion[];
  outputSpreadsheet: OutputSpreadsheet;
  tokensReward: number;
  isFinal?: boolean;
}

export const FINANCIAL_MANAGEMENT_MODULES: FinancialModule[] = [
  {
    id: 1,
    title: "Startup Costs",
    description: "Calculate initial investment needs and understand one-time vs. recurring costs",
    tokensReward: 75,
    lessons: [
      {
        id: "fmc-1-1",
        title: "Understanding Startup Costs",
        duration: 15,
        keyTerms: ["One-time costs", "Recurring costs", "Capital expenditure", "Working capital"],
        content: `# Understanding Startup Costs

Every business requires initial investment before generating revenue. Understanding these costs is crucial for planning and securing funding.

## Types of Startup Costs

### One-Time Costs
- **Legal fees**: Business registration, licenses, permits
- **Equipment**: Computers, machinery, furniture
- **Initial inventory**: Stock to start selling
- **Deposits**: Rent deposits, utility deposits
- **Branding**: Logo design, website development

### Recurring Costs (First 3-6 Months)
- **Rent**: Office or retail space
- **Utilities**: Electric, water, internet
- **Insurance**: Business liability, property
- **Payroll**: Employee wages before revenue
- **Marketing**: Initial advertising campaigns

## Capital vs. Operating Expenses

**Capital Expenditure (CapEx)**: Long-term assets like equipment, vehicles, property improvements. These are depreciated over time.

**Operating Expenses (OpEx)**: Day-to-day costs like rent, utilities, supplies. These are fully deductible in the year incurred.

## Working Capital Requirements

Working capital is the money needed to cover daily operations until the business becomes self-sustaining. Calculate:
- Average monthly expenses × Number of months until profitability
- Typically plan for 6-12 months of operating expenses`
      },
      {
        id: "fmc-1-2",
        title: "Estimating Your Startup Budget",
        duration: 20,
        keyTerms: ["Budget categories", "Contingency fund", "Minimum viable budget"],
        content: `# Estimating Your Startup Budget

## Budget Categories

### Essential (Must Have)
1. **Legal & Registration**: $500 - $2,000
2. **Basic Equipment**: Varies by industry
3. **Initial Inventory**: 2-3 months supply
4. **Insurance**: $1,000 - $5,000/year
5. **Working Capital**: 3-6 months expenses

### Important (Should Have)
1. **Professional Services**: Accountant, lawyer
2. **Marketing Materials**: Business cards, website
3. **Technology**: Software, subscriptions
4. **Training**: Certifications, courses

### Nice to Have (Can Wait)
1. **Premium office space**
2. **Advanced equipment upgrades**
3. **Expanded marketing campaigns**

## The Contingency Rule

Always add 15-25% contingency to your total budget for unexpected costs. Things WILL cost more than expected.

## Minimum Viable Budget

Calculate the absolute minimum needed to:
1. Legally operate
2. Deliver your product/service
3. Survive 3 months without revenue

This is your "launch threshold" - don't start until you have at least this amount secured.`
      },
      {
        id: "fmc-1-3",
        title: "Funding Your Startup",
        duration: 15,
        keyTerms: ["Bootstrapping", "Debt financing", "Equity financing", "Grants"],
        content: `# Funding Your Startup

## Funding Sources

### Self-Funding (Bootstrapping)
- Personal savings
- Home equity
- Retirement funds (caution advised)
- **Pros**: Full control, no debt
- **Cons**: Personal financial risk

### Debt Financing
- **Bank loans**: Traditional business loans
- **SBA loans**: Government-backed, favorable terms
- **Lines of credit**: Flexible borrowing
- **Microloans**: Small amounts for startups
- **Pros**: Keep ownership, tax-deductible interest
- **Cons**: Repayment required regardless of success

### Equity Financing
- **Angel investors**: Wealthy individuals
- **Venture capital**: For high-growth potential
- **Crowdfunding**: Kickstarter, Indiegogo
- **Pros**: No repayment, gain expertise
- **Cons**: Give up ownership/control

### Grants & Alternative Funding
- Government grants (SBIR, STTR)
- Foundation grants
- Business competitions
- Community development funds
- **Pros**: Free money, no repayment
- **Cons**: Competitive, time-consuming applications

## Matching Funding to Needs

| Business Type | Best Funding Options |
|--------------|---------------------|
| Service business | Bootstrapping, microloans |
| Retail/Product | SBA loans, inventory financing |
| Tech startup | Angel investors, VC |
| Nonprofit | Grants, donations |
| Social enterprise | Impact investors, grants |`
      }
    ],
    quiz: [
      {
        question: "What is the difference between capital expenditure and operating expenses?",
        options: [
          "Capital expenses are monthly, operating expenses are yearly",
          "Capital expenses are for long-term assets, operating expenses are day-to-day costs",
          "Capital expenses are tax-deductible, operating expenses are not",
          "There is no difference"
        ],
        correct: 1,
        explanation: "Capital expenditures (CapEx) are investments in long-term assets like equipment, while operating expenses (OpEx) are day-to-day costs like rent and utilities."
      },
      {
        question: "What percentage should you add as a contingency to your startup budget?",
        options: ["5-10%", "15-25%", "50-75%", "No contingency needed"],
        correct: 1,
        explanation: "A 15-25% contingency fund helps cover unexpected costs that inevitably arise during startup."
      },
      {
        question: "What is working capital?",
        options: [
          "Money invested in equipment",
          "Profit from sales",
          "Money needed to cover daily operations until profitable",
          "Loans from banks"
        ],
        correct: 2,
        explanation: "Working capital is the money needed to cover daily operations until the business becomes self-sustaining."
      },
      {
        question: "Which funding source requires giving up ownership?",
        options: ["Bank loans", "SBA loans", "Equity financing", "Grants"],
        correct: 2,
        explanation: "Equity financing (angel investors, venture capital) requires giving up a portion of ownership in exchange for funding."
      },
      {
        question: "What is the 'minimum viable budget'?",
        options: [
          "The most you should spend on startup",
          "The absolute minimum needed to legally operate and survive 3 months",
          "The amount investors require",
          "Your first month's expenses"
        ],
        correct: 1,
        explanation: "The minimum viable budget is the absolute minimum needed to legally operate, deliver your product/service, and survive 3 months without revenue."
      }
    ],
    outputSpreadsheet: {
      title: "Startup Costs Worksheet",
      description: "Calculate your total startup investment needs",
      type: "worksheet",
      fields: [
        { name: "business_name", label: "Business Name", type: "text", required: true },
        { name: "legal_fees", label: "Legal & Registration Fees", type: "currency", category: "One-Time Costs", placeholder: "500" },
        { name: "licenses_permits", label: "Licenses & Permits", type: "currency", category: "One-Time Costs", placeholder: "300" },
        { name: "equipment", label: "Equipment & Furniture", type: "currency", category: "One-Time Costs", placeholder: "5000" },
        { name: "initial_inventory", label: "Initial Inventory", type: "currency", category: "One-Time Costs", placeholder: "2000" },
        { name: "deposits", label: "Deposits (Rent, Utilities)", type: "currency", category: "One-Time Costs", placeholder: "3000" },
        { name: "branding", label: "Branding & Website", type: "currency", category: "One-Time Costs", placeholder: "1500" },
        { name: "other_onetime", label: "Other One-Time Costs", type: "currency", category: "One-Time Costs", placeholder: "0" },
        { name: "monthly_rent", label: "Monthly Rent", type: "currency", category: "Monthly Costs", placeholder: "1500" },
        { name: "monthly_utilities", label: "Monthly Utilities", type: "currency", category: "Monthly Costs", placeholder: "200" },
        { name: "monthly_insurance", label: "Monthly Insurance", type: "currency", category: "Monthly Costs", placeholder: "300" },
        { name: "monthly_payroll", label: "Monthly Payroll", type: "currency", category: "Monthly Costs", placeholder: "0" },
        { name: "monthly_marketing", label: "Monthly Marketing", type: "currency", category: "Monthly Costs", placeholder: "500" },
        { name: "monthly_other", label: "Other Monthly Costs", type: "currency", category: "Monthly Costs", placeholder: "200" },
        { name: "months_to_profit", label: "Months Until Profitable", type: "number", placeholder: "6" },
        { name: "contingency_percent", label: "Contingency Percentage", type: "percentage", placeholder: "20" }
      ],
      calculations: [
        { name: "total_onetime", formula: "legal_fees + licenses_permits + equipment + initial_inventory + deposits + branding + other_onetime", description: "Total One-Time Costs" },
        { name: "total_monthly", formula: "monthly_rent + monthly_utilities + monthly_insurance + monthly_payroll + monthly_marketing + monthly_other", description: "Total Monthly Costs" },
        { name: "working_capital", formula: "total_monthly * months_to_profit", description: "Working Capital Needed" },
        { name: "subtotal", formula: "total_onetime + working_capital", description: "Subtotal Before Contingency" },
        { name: "contingency", formula: "subtotal * (contingency_percent / 100)", description: "Contingency Fund" },
        { name: "total_startup", formula: "subtotal + contingency", description: "Total Startup Investment Needed" }
      ]
    }
  },
  {
    id: 2,
    title: "Revenue Planning",
    description: "Project income and develop pricing strategies",
    tokensReward: 75,
    lessons: [
      {
        id: "fmc-2-1",
        title: "Understanding Revenue Streams",
        duration: 15,
        keyTerms: ["Revenue streams", "Recurring revenue", "One-time revenue", "Diversification"],
        content: `# Understanding Revenue Streams

Revenue is the lifeblood of your business. Understanding different revenue streams helps you build a sustainable business model.

## Types of Revenue Streams

### Product Sales
- Physical products
- Digital products
- Inventory-based

### Service Revenue
- Hourly/project fees
- Consulting
- Professional services

### Recurring Revenue
- Subscriptions
- Memberships
- Retainers
- Maintenance contracts

### Transaction-Based
- Commission
- Referral fees
- Platform fees

## The Power of Recurring Revenue

Recurring revenue is highly valued because:
- **Predictable**: Easier to forecast
- **Stable**: Less dependent on new sales
- **Scalable**: Grows without proportional effort
- **Valuable**: Higher business valuation

## Revenue Diversification

Don't rely on a single revenue stream:
- Multiple products/services
- Different customer segments
- Various pricing tiers
- Complementary offerings`
      },
      {
        id: "fmc-2-2",
        title: "Pricing Strategies",
        duration: 20,
        keyTerms: ["Cost-plus pricing", "Value-based pricing", "Competitive pricing", "Psychological pricing"],
        content: `# Pricing Strategies

Pricing is one of the most important decisions you'll make. It affects revenue, perception, and profitability.

## Common Pricing Strategies

### Cost-Plus Pricing
- Calculate total cost
- Add desired profit margin
- **Formula**: Price = Cost × (1 + Markup%)
- **Best for**: Manufacturing, retail

### Value-Based Pricing
- Price based on perceived value to customer
- Not tied to costs
- **Best for**: Services, unique products

### Competitive Pricing
- Match or beat competitor prices
- Market-driven approach
- **Best for**: Commoditized markets

### Premium Pricing
- Higher prices signal quality
- Targets affluent customers
- **Best for**: Luxury goods, specialized services

## Psychological Pricing Tactics

- **Charm pricing**: $9.99 instead of $10
- **Anchor pricing**: Show "original" price
- **Bundle pricing**: Multiple items at discount
- **Tiered pricing**: Good/Better/Best options

## Pricing Formula

**Minimum Price** = (Fixed Costs + Variable Costs + Desired Profit) ÷ Units Sold

**Target Price** = Minimum Price × (1 + Value Premium)`
      },
      {
        id: "fmc-2-3",
        title: "Revenue Projections",
        duration: 15,
        keyTerms: ["Sales forecast", "Conversion rate", "Average transaction", "Seasonality"],
        content: `# Revenue Projections

Accurate revenue projections are essential for planning, funding, and decision-making.

## Building Revenue Projections

### Bottom-Up Approach
1. Estimate number of potential customers
2. Apply realistic conversion rate
3. Multiply by average transaction value
4. Account for purchase frequency

**Formula**: Revenue = Customers × Conversion Rate × Avg Transaction × Frequency

### Top-Down Approach
1. Start with total market size
2. Estimate your market share
3. Apply to get revenue estimate

## Key Metrics to Track

- **Customer Acquisition Cost (CAC)**: Cost to get one customer
- **Customer Lifetime Value (CLV)**: Total revenue from one customer
- **Average Order Value (AOV)**: Average transaction amount
- **Conversion Rate**: % of leads that become customers

## Seasonality Considerations

Most businesses have seasonal patterns:
- Retail peaks in Q4
- B2B often slow in summer
- Service businesses may vary

Adjust monthly projections accordingly.

## Conservative vs. Optimistic

Create three scenarios:
- **Conservative**: 50% of target
- **Realistic**: Your best estimate
- **Optimistic**: 150% of target

Plan expenses based on conservative, celebrate if you hit optimistic.`
      }
    ],
    quiz: [
      {
        question: "Why is recurring revenue highly valued?",
        options: [
          "It's easier to collect",
          "It's predictable, stable, and scalable",
          "It requires no marketing",
          "It's tax-free"
        ],
        correct: 1,
        explanation: "Recurring revenue is valued because it's predictable (easier to forecast), stable (less dependent on new sales), and scalable (grows without proportional effort)."
      },
      {
        question: "What is value-based pricing?",
        options: [
          "Pricing based on your costs plus markup",
          "Pricing based on competitor prices",
          "Pricing based on perceived value to the customer",
          "The lowest possible price"
        ],
        correct: 2,
        explanation: "Value-based pricing sets prices based on the perceived value to the customer, not tied to costs."
      },
      {
        question: "What is Customer Lifetime Value (CLV)?",
        options: [
          "The cost to acquire one customer",
          "The total revenue expected from one customer over time",
          "The average order value",
          "The number of customers"
        ],
        correct: 1,
        explanation: "Customer Lifetime Value (CLV) is the total revenue you expect to earn from a single customer throughout your relationship."
      },
      {
        question: "Which approach to revenue projection starts with total market size?",
        options: ["Bottom-up", "Top-down", "Middle-out", "Side-to-side"],
        correct: 1,
        explanation: "The top-down approach starts with total market size and estimates your market share to project revenue."
      }
    ],
    outputSpreadsheet: {
      title: "Revenue Projection Spreadsheet",
      description: "Project your monthly and annual revenue",
      type: "projection",
      fields: [
        { name: "product_service_1", label: "Product/Service #1 Name", type: "text", required: true },
        { name: "price_1", label: "Price per Unit", type: "currency", placeholder: "100" },
        { name: "units_month_1", label: "Units Sold per Month", type: "number", placeholder: "50" },
        { name: "product_service_2", label: "Product/Service #2 Name", type: "text" },
        { name: "price_2", label: "Price per Unit", type: "currency", placeholder: "0" },
        { name: "units_month_2", label: "Units Sold per Month", type: "number", placeholder: "0" },
        { name: "product_service_3", label: "Product/Service #3 Name", type: "text" },
        { name: "price_3", label: "Price per Unit", type: "currency", placeholder: "0" },
        { name: "units_month_3", label: "Units Sold per Month", type: "number", placeholder: "0" },
        { name: "recurring_revenue", label: "Monthly Recurring Revenue", type: "currency", placeholder: "0" },
        { name: "growth_rate", label: "Monthly Growth Rate (%)", type: "percentage", placeholder: "5" },
        { name: "seasonality_q1", label: "Q1 Adjustment (%)", type: "percentage", placeholder: "100" },
        { name: "seasonality_q2", label: "Q2 Adjustment (%)", type: "percentage", placeholder: "100" },
        { name: "seasonality_q3", label: "Q3 Adjustment (%)", type: "percentage", placeholder: "100" },
        { name: "seasonality_q4", label: "Q4 Adjustment (%)", type: "percentage", placeholder: "100" }
      ],
      calculations: [
        { name: "monthly_product_1", formula: "price_1 * units_month_1", description: "Monthly Revenue - Product 1" },
        { name: "monthly_product_2", formula: "price_2 * units_month_2", description: "Monthly Revenue - Product 2" },
        { name: "monthly_product_3", formula: "price_3 * units_month_3", description: "Monthly Revenue - Product 3" },
        { name: "total_monthly", formula: "monthly_product_1 + monthly_product_2 + monthly_product_3 + recurring_revenue", description: "Total Monthly Revenue" },
        { name: "annual_revenue", formula: "total_monthly * 12", description: "Projected Annual Revenue" }
      ]
    }
  },
  {
    id: 3,
    title: "Expense Management",
    description: "Understand and control operating costs and overhead",
    tokensReward: 75,
    lessons: [
      {
        id: "fmc-3-1",
        title: "Fixed vs. Variable Costs",
        duration: 15,
        keyTerms: ["Fixed costs", "Variable costs", "Semi-variable costs", "Cost behavior"],
        content: `# Fixed vs. Variable Costs

Understanding how costs behave is essential for pricing, budgeting, and profitability analysis.

## Fixed Costs

Costs that remain constant regardless of sales volume:
- **Rent**: Same whether you sell 1 or 1000 units
- **Insurance**: Fixed premiums
- **Salaries**: Full-time employee wages
- **Loan payments**: Fixed monthly amounts
- **Subscriptions**: Software, services

## Variable Costs

Costs that change with sales volume:
- **Materials**: More sales = more materials
- **Shipping**: Per-order costs
- **Commissions**: Percentage of sales
- **Credit card fees**: Per-transaction
- **Packaging**: Per-unit costs

## Semi-Variable Costs

Costs with both fixed and variable components:
- **Utilities**: Base charge + usage
- **Phone**: Base plan + overages
- **Labor**: Base staff + overtime

## Why This Matters

Understanding cost behavior helps you:
1. Set accurate prices
2. Calculate break-even point
3. Make scaling decisions
4. Control costs effectively`
      },
      {
        id: "fmc-3-2",
        title: "Creating an Operating Budget",
        duration: 20,
        keyTerms: ["Operating budget", "Budget categories", "Budget variance", "Zero-based budgeting"],
        content: `# Creating an Operating Budget

An operating budget is your financial roadmap for running the business day-to-day.

## Budget Categories

### Personnel Costs (Often 40-60% of budget)
- Salaries and wages
- Benefits
- Payroll taxes
- Training

### Facilities Costs
- Rent/mortgage
- Utilities
- Maintenance
- Property taxes

### Operations Costs
- Supplies
- Equipment
- Technology
- Professional services

### Marketing Costs
- Advertising
- Promotions
- Events
- Content creation

### Administrative Costs
- Insurance
- Legal/accounting
- Banking fees
- Office expenses

## Budgeting Methods

### Incremental Budgeting
- Start with last year's budget
- Adjust up or down
- Quick but may perpetuate inefficiencies

### Zero-Based Budgeting
- Start from zero each period
- Justify every expense
- Time-consuming but thorough

### Activity-Based Budgeting
- Budget based on activities/outputs
- Links spending to results

## Budget Monitoring

Track actual vs. budget monthly:
- **Favorable variance**: Spent less than budgeted
- **Unfavorable variance**: Spent more than budgeted

Investigate significant variances (typically >10%).`
      },
      {
        id: "fmc-3-3",
        title: "Cost Control Strategies",
        duration: 15,
        keyTerms: ["Cost reduction", "Efficiency", "Outsourcing", "Automation"],
        content: `# Cost Control Strategies

Controlling costs is as important as generating revenue for profitability.

## Cost Reduction Strategies

### Negotiate Better Terms
- Vendor discounts for volume
- Extended payment terms
- Annual vs. monthly pricing

### Optimize Operations
- Eliminate waste
- Streamline processes
- Reduce redundancy

### Leverage Technology
- Automate repetitive tasks
- Use cloud services vs. owned infrastructure
- Digital vs. physical when possible

### Strategic Outsourcing
- Non-core functions to specialists
- Variable cost vs. fixed cost
- Access to expertise without full-time hire

## Cost Control Best Practices

1. **Review expenses monthly**: Catch issues early
2. **Require approval for large purchases**: Prevent impulse spending
3. **Compare vendors regularly**: Ensure competitive pricing
4. **Track cost per unit**: Monitor efficiency
5. **Set spending limits by category**: Create accountability

## The 80/20 Rule for Costs

Often 80% of costs come from 20% of expense categories. Focus your cost control efforts on the biggest categories first.

## Warning Signs

- Costs growing faster than revenue
- Margins shrinking over time
- Frequent budget overruns
- Unclear what money is spent on`
      }
    ],
    quiz: [
      {
        question: "Which of the following is a fixed cost?",
        options: ["Materials", "Shipping", "Rent", "Commissions"],
        correct: 2,
        explanation: "Rent is a fixed cost because it remains the same regardless of how many units you sell."
      },
      {
        question: "What is zero-based budgeting?",
        options: [
          "Starting with last year's budget and adjusting",
          "Starting from zero and justifying every expense",
          "Having zero budget for certain categories",
          "Budgeting only for essential items"
        ],
        correct: 1,
        explanation: "Zero-based budgeting starts from zero each period and requires justification for every expense, rather than building on previous budgets."
      },
      {
        question: "What is a favorable budget variance?",
        options: [
          "Spending more than budgeted",
          "Spending less than budgeted",
          "Spending exactly as budgeted",
          "Not having a budget"
        ],
        correct: 1,
        explanation: "A favorable variance means you spent less than budgeted, which is generally positive for the business."
      },
      {
        question: "According to the 80/20 rule for costs, where should you focus cost control efforts?",
        options: [
          "On the smallest expense categories",
          "On all categories equally",
          "On the biggest expense categories",
          "Only on variable costs"
        ],
        correct: 2,
        explanation: "The 80/20 rule suggests that 80% of costs come from 20% of expense categories, so focusing on the biggest categories yields the most impact."
      },
      {
        question: "What is a semi-variable cost?",
        options: [
          "A cost that is always the same",
          "A cost that changes with every sale",
          "A cost with both fixed and variable components",
          "A cost that only occurs sometimes"
        ],
        correct: 2,
        explanation: "Semi-variable costs have both fixed and variable components, like utilities with a base charge plus usage fees."
      }
    ],
    outputSpreadsheet: {
      title: "Operating Expense Budget",
      description: "Create your monthly operating expense budget",
      type: "budget",
      fields: [
        { name: "salaries", label: "Salaries & Wages", type: "currency", category: "Personnel", placeholder: "5000" },
        { name: "benefits", label: "Benefits & Taxes", type: "currency", category: "Personnel", placeholder: "1000" },
        { name: "rent", label: "Rent/Lease", type: "currency", category: "Facilities", placeholder: "1500" },
        { name: "utilities", label: "Utilities", type: "currency", category: "Facilities", placeholder: "300" },
        { name: "insurance", label: "Insurance", type: "currency", category: "Facilities", placeholder: "400" },
        { name: "supplies", label: "Office Supplies", type: "currency", category: "Operations", placeholder: "200" },
        { name: "technology", label: "Technology/Software", type: "currency", category: "Operations", placeholder: "300" },
        { name: "professional_services", label: "Professional Services", type: "currency", category: "Operations", placeholder: "500" },
        { name: "marketing", label: "Marketing & Advertising", type: "currency", category: "Marketing", placeholder: "1000" },
        { name: "travel", label: "Travel & Entertainment", type: "currency", category: "Marketing", placeholder: "200" },
        { name: "legal_accounting", label: "Legal & Accounting", type: "currency", category: "Administrative", placeholder: "300" },
        { name: "banking_fees", label: "Banking & Fees", type: "currency", category: "Administrative", placeholder: "50" },
        { name: "miscellaneous", label: "Miscellaneous", type: "currency", category: "Administrative", placeholder: "200" }
      ],
      calculations: [
        { name: "total_personnel", formula: "salaries + benefits", description: "Total Personnel Costs" },
        { name: "total_facilities", formula: "rent + utilities + insurance", description: "Total Facilities Costs" },
        { name: "total_operations", formula: "supplies + technology + professional_services", description: "Total Operations Costs" },
        { name: "total_marketing", formula: "marketing + travel", description: "Total Marketing Costs" },
        { name: "total_admin", formula: "legal_accounting + banking_fees + miscellaneous", description: "Total Administrative Costs" },
        { name: "total_monthly", formula: "total_personnel + total_facilities + total_operations + total_marketing + total_admin", description: "Total Monthly Expenses" },
        { name: "total_annual", formula: "total_monthly * 12", description: "Total Annual Expenses" }
      ]
    }
  },
  {
    id: 4,
    title: "Cash Flow Management",
    description: "Manage money coming in and going out of your business",
    tokensReward: 75,
    lessons: [
      {
        id: "fmc-4-1",
        title: "Understanding Cash Flow",
        duration: 15,
        keyTerms: ["Cash flow", "Cash inflow", "Cash outflow", "Cash flow statement"],
        content: `# Understanding Cash Flow

Cash flow is the movement of money in and out of your business. It's different from profit and is often more important for survival.

## Cash Flow vs. Profit

**Profit** = Revenue - Expenses (accounting concept)
**Cash Flow** = Cash In - Cash Out (actual money movement)

A business can be profitable but still fail due to poor cash flow. You might make a sale today but not get paid for 60 days, while bills are due now.

## Types of Cash Flow

### Operating Cash Flow
- Cash from day-to-day business operations
- Customer payments
- Supplier payments
- Operating expenses

### Investing Cash Flow
- Buying/selling assets
- Equipment purchases
- Investment activities

### Financing Cash Flow
- Loans received/repaid
- Owner investments
- Dividend payments

## The Cash Flow Cycle

1. **Purchase inventory/supplies** (cash out)
2. **Produce product/service** (time passes)
3. **Make sale** (revenue recorded)
4. **Collect payment** (cash in)

The gap between steps 1 and 4 is your cash flow challenge.`
      },
      {
        id: "fmc-4-2",
        title: "Cash Flow Forecasting",
        duration: 20,
        keyTerms: ["Cash flow forecast", "Accounts receivable", "Accounts payable", "Cash buffer"],
        content: `# Cash Flow Forecasting

A cash flow forecast predicts when money will come in and go out, helping you avoid cash crunches.

## Building a Cash Flow Forecast

### Step 1: Starting Cash Balance
- Cash in bank at start of period

### Step 2: Estimate Cash Inflows
- Expected customer payments
- Loan proceeds
- Other income
- **Timing matters**: When will you actually receive the cash?

### Step 3: Estimate Cash Outflows
- Rent and utilities (usually fixed dates)
- Payroll (bi-weekly or monthly)
- Supplier payments (based on terms)
- Loan payments (fixed schedule)
- Variable expenses (estimate)

### Step 4: Calculate Net Cash Flow
Net Cash Flow = Total Inflows - Total Outflows

### Step 5: Ending Cash Balance
Ending Balance = Starting Balance + Net Cash Flow

## Accounts Receivable Impact

If customers pay in 30-60 days:
- Sale in January
- Cash received in February/March
- Your forecast must reflect this delay

## The Cash Buffer

Maintain a cash reserve for:
- Unexpected expenses
- Slow payment periods
- Opportunities
- **Rule of thumb**: 2-3 months of operating expenses`
      },
      {
        id: "fmc-4-3",
        title: "Improving Cash Flow",
        duration: 15,
        keyTerms: ["Cash flow improvement", "Payment terms", "Invoice factoring", "Cash management"],
        content: `# Improving Cash Flow

Healthy cash flow requires active management. Here are strategies to improve it.

## Speed Up Cash Inflows

### Invoice Promptly
- Send invoices immediately upon delivery
- Use electronic invoicing
- Make payment easy (multiple options)

### Offer Early Payment Discounts
- "2/10 Net 30" = 2% discount if paid in 10 days
- Costs you 2% but improves cash flow

### Require Deposits
- 25-50% upfront for large orders
- Retainers for ongoing services

### Accept Credit Cards
- Immediate payment (minus fees)
- Customer convenience

### Shorten Payment Terms
- Net 15 instead of Net 30
- Enforce late payment penalties

## Slow Down Cash Outflows

### Negotiate Longer Terms
- Net 45 or Net 60 with suppliers
- Match outflows to inflows

### Time Major Purchases
- Buy when cash is high
- Lease vs. buy for equipment

### Use Credit Wisely
- Business credit cards for float
- Line of credit for gaps

## Emergency Cash Flow Options

- Invoice factoring (sell receivables)
- Short-term business loans
- Owner capital injection
- Negotiate payment plans with vendors`
      }
    ],
    quiz: [
      {
        question: "What is the difference between profit and cash flow?",
        options: [
          "They are the same thing",
          "Profit is accounting-based, cash flow is actual money movement",
          "Cash flow is always higher than profit",
          "Profit includes loans, cash flow doesn't"
        ],
        correct: 1,
        explanation: "Profit is an accounting concept (Revenue - Expenses), while cash flow is the actual movement of money in and out of the business."
      },
      {
        question: "What does '2/10 Net 30' mean?",
        options: [
          "Pay 2% interest if paid after 10 days",
          "2% discount if paid within 10 days, otherwise due in 30",
          "Pay $2 for every $10 owed",
          "Payment due in 2 to 10 days"
        ],
        correct: 1,
        explanation: "'2/10 Net 30' means the customer gets a 2% discount if they pay within 10 days, otherwise the full amount is due in 30 days."
      },
      {
        question: "How much cash buffer should a business typically maintain?",
        options: [
          "1 week of expenses",
          "2-3 months of operating expenses",
          "1 year of revenue",
          "No buffer needed"
        ],
        correct: 1,
        explanation: "A good rule of thumb is to maintain 2-3 months of operating expenses as a cash buffer for unexpected situations."
      },
      {
        question: "Which is NOT a way to speed up cash inflows?",
        options: [
          "Invoice promptly",
          "Offer early payment discounts",
          "Negotiate longer payment terms with suppliers",
          "Require deposits"
        ],
        correct: 2,
        explanation: "Negotiating longer payment terms with suppliers slows down cash outflows, not speeds up inflows."
      }
    ],
    outputSpreadsheet: {
      title: "Cash Flow Projection",
      description: "Project your monthly cash flow for the next 12 months",
      type: "projection",
      fields: [
        { name: "starting_cash", label: "Starting Cash Balance", type: "currency", required: true, placeholder: "10000" },
        { name: "monthly_sales", label: "Expected Monthly Sales", type: "currency", placeholder: "15000" },
        { name: "collection_rate", label: "Same-Month Collection Rate (%)", type: "percentage", placeholder: "60" },
        { name: "monthly_expenses", label: "Monthly Operating Expenses", type: "currency", placeholder: "10000" },
        { name: "loan_payments", label: "Monthly Loan Payments", type: "currency", placeholder: "500" },
        { name: "expected_ar", label: "Accounts Receivable to Collect", type: "currency", placeholder: "5000" },
        { name: "expected_ap", label: "Accounts Payable Due", type: "currency", placeholder: "3000" },
        { name: "planned_purchases", label: "Planned Major Purchases", type: "currency", placeholder: "0" },
        { name: "other_inflows", label: "Other Expected Inflows", type: "currency", placeholder: "0" },
        { name: "other_outflows", label: "Other Expected Outflows", type: "currency", placeholder: "0" }
      ],
      calculations: [
        { name: "cash_from_sales", formula: "monthly_sales * (collection_rate / 100)", description: "Cash from Current Sales" },
        { name: "total_inflows", formula: "cash_from_sales + expected_ar + other_inflows", description: "Total Cash Inflows" },
        { name: "total_outflows", formula: "monthly_expenses + loan_payments + expected_ap + planned_purchases + other_outflows", description: "Total Cash Outflows" },
        { name: "net_cash_flow", formula: "total_inflows - total_outflows", description: "Net Cash Flow" },
        { name: "ending_cash", formula: "starting_cash + net_cash_flow", description: "Ending Cash Balance" }
      ]
    }
  },
  {
    id: 5,
    title: "Break-Even & Profitability",
    description: "Understand when your business makes money",
    tokensReward: 75,
    lessons: [
      {
        id: "fmc-5-1",
        title: "Break-Even Analysis",
        duration: 15,
        keyTerms: ["Break-even point", "Contribution margin", "Fixed costs", "Variable costs"],
        content: `# Break-Even Analysis

Break-even analysis tells you how much you need to sell to cover all costs - the point where you're not losing or making money.

## The Break-Even Formula

**Break-Even Units** = Fixed Costs ÷ (Price - Variable Cost per Unit)

**Break-Even Revenue** = Fixed Costs ÷ Contribution Margin Ratio

## Understanding Contribution Margin

**Contribution Margin** = Price - Variable Cost per Unit

This is what each sale "contributes" toward covering fixed costs.

**Contribution Margin Ratio** = Contribution Margin ÷ Price

## Example Calculation

- Selling price: $50
- Variable cost per unit: $20
- Fixed costs: $30,000/month

Contribution Margin = $50 - $20 = $30
Break-Even Units = $30,000 ÷ $30 = 1,000 units

You need to sell 1,000 units per month to break even.

## Why Break-Even Matters

1. **Set sales targets**: Know minimum needed
2. **Pricing decisions**: See impact of price changes
3. **Cost control**: Understand cost impact
4. **Investment decisions**: Evaluate new opportunities`
      },
      {
        id: "fmc-5-2",
        title: "Profit Margins",
        duration: 20,
        keyTerms: ["Gross margin", "Operating margin", "Net margin", "Margin analysis"],
        content: `# Profit Margins

Profit margins measure how much of each dollar of revenue becomes profit at different stages.

## Types of Profit Margins

### Gross Profit Margin
**Formula**: (Revenue - Cost of Goods Sold) ÷ Revenue × 100

Measures profitability of your core product/service before overhead.

**Benchmarks by industry**:
- Retail: 25-50%
- Manufacturing: 25-35%
- Services: 50-80%
- Software: 70-90%

### Operating Profit Margin
**Formula**: Operating Income ÷ Revenue × 100

Measures profitability after all operating expenses.

**Healthy range**: 10-20% for most businesses

### Net Profit Margin
**Formula**: Net Income ÷ Revenue × 100

The "bottom line" - what's left after everything.

**Healthy range**: 5-15% for most businesses

## Improving Margins

### Increase Gross Margin
- Raise prices
- Reduce cost of goods
- Improve efficiency

### Increase Operating Margin
- Control overhead
- Increase productivity
- Automate processes

### Increase Net Margin
- Reduce debt/interest
- Tax optimization
- Scale operations`
      },
      {
        id: "fmc-5-3",
        title: "Profitability Strategies",
        duration: 15,
        keyTerms: ["Profit optimization", "Pricing power", "Cost efficiency", "Scale"],
        content: `# Profitability Strategies

Profitability comes from the intersection of revenue growth and cost management.

## The Profit Equation

**Profit** = (Price × Volume) - (Fixed Costs + Variable Costs)

You can improve profit by:
1. Increasing price
2. Increasing volume
3. Decreasing fixed costs
4. Decreasing variable costs

## Pricing Power

The ability to raise prices without losing customers:
- **Strong brand**: Customers pay premium
- **Unique value**: No direct substitutes
- **Switching costs**: Hard to leave
- **Quality perception**: Worth the price

## Economies of Scale

As volume increases:
- Fixed costs spread over more units
- Bulk purchasing discounts
- Operational efficiencies
- Lower cost per unit

## Product/Service Mix

Not all offerings are equally profitable:
- **Stars**: High margin, high volume
- **Cash cows**: Good margin, steady volume
- **Question marks**: Potential but unproven
- **Dogs**: Low margin, low volume

Focus resources on stars and cash cows.

## The Path to Profitability

1. **Survive**: Cover variable costs
2. **Sustain**: Cover all costs (break-even)
3. **Scale**: Generate consistent profit
4. **Thrive**: Reinvest for growth`
      }
    ],
    quiz: [
      {
        question: "What is the break-even point?",
        options: [
          "When you make maximum profit",
          "When revenue equals total costs",
          "When you can pay all employees",
          "When you have positive cash flow"
        ],
        correct: 1,
        explanation: "The break-even point is when total revenue equals total costs - you're not losing or making money."
      },
      {
        question: "What is contribution margin?",
        options: [
          "Total revenue minus total costs",
          "Price minus variable cost per unit",
          "Fixed costs divided by units sold",
          "Net profit divided by revenue"
        ],
        correct: 1,
        explanation: "Contribution margin is the price minus variable cost per unit - what each sale contributes toward covering fixed costs."
      },
      {
        question: "Which profit margin is the 'bottom line'?",
        options: ["Gross margin", "Operating margin", "Net margin", "Contribution margin"],
        correct: 2,
        explanation: "Net profit margin is the 'bottom line' - what's left after all expenses, taxes, and interest."
      },
      {
        question: "What are economies of scale?",
        options: [
          "Weighing products before shipping",
          "Cost advantages from increased volume",
          "Scaling back operations",
          "Measuring business size"
        ],
        correct: 1,
        explanation: "Economies of scale are cost advantages that come from increased volume - fixed costs spread over more units, bulk discounts, etc."
      },
      {
        question: "If fixed costs are $50,000 and contribution margin is $25 per unit, what is break-even?",
        options: ["500 units", "1,000 units", "2,000 units", "5,000 units"],
        correct: 2,
        explanation: "Break-even = Fixed Costs ÷ Contribution Margin = $50,000 ÷ $25 = 2,000 units"
      }
    ],
    outputSpreadsheet: {
      title: "Break-Even Analysis",
      description: "Calculate your break-even point and analyze profitability",
      type: "analysis",
      fields: [
        { name: "product_name", label: "Product/Service Name", type: "text", required: true },
        { name: "selling_price", label: "Selling Price per Unit", type: "currency", required: true, placeholder: "100" },
        { name: "variable_cost", label: "Variable Cost per Unit", type: "currency", required: true, placeholder: "40" },
        { name: "monthly_fixed_costs", label: "Monthly Fixed Costs", type: "currency", required: true, placeholder: "10000" },
        { name: "current_units", label: "Current Monthly Units Sold", type: "number", placeholder: "200" },
        { name: "target_profit", label: "Target Monthly Profit", type: "currency", placeholder: "5000" }
      ],
      calculations: [
        { name: "contribution_margin", formula: "selling_price - variable_cost", description: "Contribution Margin per Unit" },
        { name: "cm_ratio", formula: "(contribution_margin / selling_price) * 100", description: "Contribution Margin Ratio (%)" },
        { name: "break_even_units", formula: "monthly_fixed_costs / contribution_margin", description: "Break-Even Units" },
        { name: "break_even_revenue", formula: "break_even_units * selling_price", description: "Break-Even Revenue" },
        { name: "current_revenue", formula: "current_units * selling_price", description: "Current Monthly Revenue" },
        { name: "current_profit", formula: "(current_units * contribution_margin) - monthly_fixed_costs", description: "Current Monthly Profit" },
        { name: "units_for_target", formula: "(monthly_fixed_costs + target_profit) / contribution_margin", description: "Units Needed for Target Profit" },
        { name: "margin_of_safety", formula: "((current_units - break_even_units) / current_units) * 100", description: "Margin of Safety (%)" }
      ]
    }
  },
  {
    id: 6,
    title: "Financial Plan Assembly",
    description: "Compile your complete financial plan",
    tokensReward: 100,
    isFinal: true,
    lessons: [
      {
        id: "fmc-6-1",
        title: "Components of a Financial Plan",
        duration: 15,
        keyTerms: ["Financial plan", "Pro forma", "Financial statements", "Assumptions"],
        content: `# Components of a Financial Plan

A complete financial plan brings together all the elements you've learned into a cohesive document.

## Essential Components

### 1. Executive Financial Summary
- Key financial highlights
- Funding requirements
- Expected returns
- Timeline to profitability

### 2. Startup Costs & Funding
- Detailed startup budget
- Funding sources
- Use of funds

### 3. Revenue Projections
- Sales forecast (3-5 years)
- Pricing strategy
- Revenue assumptions

### 4. Expense Budget
- Operating expenses
- Cost of goods sold
- Fixed vs. variable breakdown

### 5. Cash Flow Projections
- Monthly cash flow (Year 1)
- Quarterly cash flow (Years 2-3)
- Annual cash flow (Years 4-5)

### 6. Profit & Loss Projections
- Pro forma income statements
- Gross margin analysis
- Net profit projections

### 7. Break-Even Analysis
- Break-even point
- Sensitivity analysis
- Margin of safety

### 8. Key Assumptions
- Growth rates
- Market conditions
- Economic factors`
      },
      {
        id: "fmc-6-2",
        title: "Financial Projections Best Practices",
        duration: 20,
        keyTerms: ["Projections", "Scenarios", "Sensitivity analysis", "Validation"],
        content: `# Financial Projections Best Practices

Creating credible financial projections requires balancing optimism with realism.

## Projection Timeframes

- **Year 1**: Monthly detail
- **Years 2-3**: Quarterly detail
- **Years 4-5**: Annual summary

## Building Credible Projections

### Start with Market Data
- Industry benchmarks
- Competitor analysis
- Market research

### Use Bottom-Up Approach
- Build from individual components
- More defensible than top-down
- Easier to validate

### Document All Assumptions
- Growth rates and why
- Pricing rationale
- Cost estimates source

### Create Multiple Scenarios

**Conservative (Worst Case)**
- 50% of expected revenue
- Higher costs
- Longer timeline

**Base Case (Most Likely)**
- Your best estimate
- Realistic assumptions

**Optimistic (Best Case)**
- 150% of expected revenue
- Lower costs
- Faster timeline

## Sensitivity Analysis

Test how changes affect outcomes:
- What if price drops 10%?
- What if costs rise 20%?
- What if sales are 30% lower?

## Red Flags to Avoid

- Hockey stick growth without justification
- No path to profitability
- Unrealistic margins
- Ignoring competition
- No contingency plans`
      },
      {
        id: "fmc-6-3",
        title: "Presenting Your Financial Plan",
        duration: 15,
        keyTerms: ["Financial presentation", "Investor pitch", "Key metrics", "Storytelling"],
        content: `# Presenting Your Financial Plan

Whether for investors, lenders, or internal planning, presenting financials effectively is crucial.

## Know Your Audience

### Investors
- Focus on: Growth potential, returns, exit strategy
- Key metrics: Revenue growth, margins, market size

### Lenders
- Focus on: Ability to repay, collateral, stability
- Key metrics: Cash flow, debt coverage, assets

### Internal Planning
- Focus on: Operational guidance, targets, accountability
- Key metrics: All detailed metrics

## Key Metrics to Highlight

### Growth Metrics
- Revenue growth rate
- Customer acquisition rate
- Market share growth

### Profitability Metrics
- Gross margin
- Operating margin
- Net margin

### Efficiency Metrics
- Customer acquisition cost
- Lifetime value
- Burn rate

### Financial Health
- Cash runway
- Debt-to-equity
- Current ratio

## Presentation Tips

1. **Lead with the story**: Why does this business exist?
2. **Show the opportunity**: Market size and potential
3. **Demonstrate traction**: What you've achieved
4. **Present the plan**: How you'll grow
5. **Address risks**: Show you've thought it through
6. **Make the ask**: What you need and why

## Common Questions to Prepare For

- How did you arrive at these projections?
- What are your key assumptions?
- What if sales are 50% lower?
- When will you be profitable?
- How will you use the funds?`
      }
    ],
    quiz: [
      {
        question: "What timeframe should Year 1 financial projections cover?",
        options: ["Annual only", "Quarterly", "Monthly", "Weekly"],
        correct: 2,
        explanation: "Year 1 projections should be monthly to provide detailed visibility into the critical first year of operations."
      },
      {
        question: "What is a sensitivity analysis?",
        options: [
          "Analyzing customer emotions",
          "Testing how changes in assumptions affect outcomes",
          "Measuring employee satisfaction",
          "Analyzing competitor pricing"
        ],
        correct: 1,
        explanation: "Sensitivity analysis tests how changes in key assumptions (like price or costs) affect financial outcomes."
      },
      {
        question: "What should the conservative scenario represent?",
        options: [
          "Your best estimate",
          "150% of expected revenue",
          "About 50% of expected revenue with higher costs",
          "The same as base case"
        ],
        correct: 2,
        explanation: "The conservative (worst case) scenario typically assumes about 50% of expected revenue, higher costs, and a longer timeline."
      },
      {
        question: "When presenting to lenders, what should you focus on?",
        options: [
          "Growth potential and exit strategy",
          "Ability to repay, cash flow, and stability",
          "Market share and customer acquisition",
          "Technology and innovation"
        ],
        correct: 1,
        explanation: "Lenders focus on your ability to repay the loan, so emphasize cash flow, debt coverage, and financial stability."
      }
    ],
    outputSpreadsheet: {
      title: "Complete Financial Plan Summary",
      description: "Compile your complete financial plan",
      type: "plan",
      fields: [
        { name: "business_name", label: "Business Name", type: "text", required: true },
        { name: "plan_date", label: "Plan Date", type: "date", required: true },
        { name: "total_startup_costs", label: "Total Startup Costs", type: "currency", required: true },
        { name: "funding_secured", label: "Funding Already Secured", type: "currency" },
        { name: "funding_needed", label: "Additional Funding Needed", type: "currency" },
        { name: "year1_revenue", label: "Year 1 Projected Revenue", type: "currency", required: true },
        { name: "year2_revenue", label: "Year 2 Projected Revenue", type: "currency" },
        { name: "year3_revenue", label: "Year 3 Projected Revenue", type: "currency" },
        { name: "year1_expenses", label: "Year 1 Projected Expenses", type: "currency", required: true },
        { name: "year2_expenses", label: "Year 2 Projected Expenses", type: "currency" },
        { name: "year3_expenses", label: "Year 3 Projected Expenses", type: "currency" },
        { name: "break_even_month", label: "Expected Break-Even Month", type: "number", placeholder: "12" },
        { name: "gross_margin_target", label: "Target Gross Margin (%)", type: "percentage", placeholder: "50" },
        { name: "net_margin_target", label: "Target Net Margin (%)", type: "percentage", placeholder: "15" },
        { name: "key_assumption_1", label: "Key Assumption #1", type: "text" },
        { name: "key_assumption_2", label: "Key Assumption #2", type: "text" },
        { name: "key_assumption_3", label: "Key Assumption #3", type: "text" },
        { name: "primary_risk", label: "Primary Financial Risk", type: "text" },
        { name: "mitigation_strategy", label: "Risk Mitigation Strategy", type: "text" }
      ],
      calculations: [
        { name: "total_funding_gap", formula: "total_startup_costs - funding_secured", description: "Total Funding Gap" },
        { name: "year1_profit", formula: "year1_revenue - year1_expenses", description: "Year 1 Projected Profit/Loss" },
        { name: "year2_profit", formula: "year2_revenue - year2_expenses", description: "Year 2 Projected Profit/Loss" },
        { name: "year3_profit", formula: "year3_revenue - year3_expenses", description: "Year 3 Projected Profit/Loss" },
        { name: "revenue_growth_y2", formula: "((year2_revenue - year1_revenue) / year1_revenue) * 100", description: "Year 2 Revenue Growth (%)" },
        { name: "revenue_growth_y3", formula: "((year3_revenue - year2_revenue) / year2_revenue) * 100", description: "Year 3 Revenue Growth (%)" }
      ]
    }
  }
];

// Service functions
export async function getFinancialManagementModules(): Promise<FinancialModule[]> {
  return FINANCIAL_MANAGEMENT_MODULES;
}

export async function getFinancialModuleById(moduleId: number): Promise<FinancialModule | undefined> {
  return FINANCIAL_MANAGEMENT_MODULES.find(m => m.id === moduleId);
}

export async function getFinancialLessonContent(moduleId: number, lessonId: string): Promise<FinancialLesson | undefined> {
  const module = FINANCIAL_MANAGEMENT_MODULES.find(m => m.id === moduleId);
  if (!module) return undefined;
  return module.lessons.find(l => l.id === lessonId);
}

export async function getFinancialModuleQuiz(moduleId: number): Promise<QuizQuestion[] | undefined> {
  const module = FINANCIAL_MANAGEMENT_MODULES.find(m => m.id === moduleId);
  return module?.quiz;
}

export async function getFinancialOutputTemplate(moduleId: number): Promise<OutputSpreadsheet | undefined> {
  const module = FINANCIAL_MANAGEMENT_MODULES.find(m => m.id === moduleId);
  return module?.outputSpreadsheet;
}

export async function calculateFinancialQuizScore(moduleId: number, answers: number[]): Promise<{
  score: number;
  passed: boolean;
  feedback: { questionIndex: number; correct: boolean; explanation: string }[];
}> {
  const module = FINANCIAL_MANAGEMENT_MODULES.find(m => m.id === moduleId);
  if (!module) {
    return { score: 0, passed: false, feedback: [] };
  }

  const quiz = module.quiz;
  let correctCount = 0;
  const feedback: { questionIndex: number; correct: boolean; explanation: string }[] = [];

  quiz.forEach((question, index) => {
    const isCorrect = answers[index] === question.correct;
    if (isCorrect) correctCount++;
    feedback.push({
      questionIndex: index,
      correct: isCorrect,
      explanation: question.explanation
    });
  });

  const score = Math.round((correctCount / quiz.length) * 100);
  const passed = score >= 70;

  return { score, passed, feedback };
}

export function getFinancialCourseOverview() {
  const totalLessons = FINANCIAL_MANAGEMENT_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalTokens = FINANCIAL_MANAGEMENT_MODULES.reduce((sum, m) => sum + m.tokensReward, 0);

  return {
    title: "Financial Management Course",
    description: "Master financial planning, budgeting, cash flow, and profitability analysis",
    totalModules: FINANCIAL_MANAGEMENT_MODULES.length,
    totalLessons,
    totalTokens,
    completionBonus: 500,
    modules: FINANCIAL_MANAGEMENT_MODULES.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      lessonsCount: m.lessons.length,
      hasQuiz: m.quiz.length > 0,
      outputSpreadsheet: m.outputSpreadsheet.title,
      tokensReward: m.tokensReward,
      isFinal: m.isFinal || false
    }))
  };
}
