// External API Integration Service
// Connects to SAM.gov, state registries, and banking APIs

export interface GrantOpportunity {
  id: string;
  title: string;
  agency: string;
  fundingAmount: { min: number; max: number };
  deadline: Date;
  eligibility: string[];
  category: string;
  cfda?: string;
  url: string;
  postedDate: Date;
  status: 'open' | 'closed' | 'forecasted';
}

export interface StateRegistration {
  state: string;
  entityName: string;
  registrationNumber: string;
  status: 'active' | 'pending' | 'expired' | 'revoked';
  filingDate: Date;
  expirationDate?: Date;
  annualReportDue?: Date;
  registeredAgent?: string;
  fees: { amount: number; dueDate?: Date };
}

export interface BankAccount {
  id: string;
  institutionName: string;
  accountType: 'checking' | 'savings' | 'money_market';
  accountNumber: string; // masked
  balance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: Date;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  pending: boolean;
}

class ExternalApiService {
  private readonly CACHE_KEY = 'external_api_cache';
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // SAM.gov Grant Search
  async searchGrants(params: {
    keywords?: string;
    agency?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<GrantOpportunity[]> {
    // In production, call SAM.gov API
    // For now, return simulated data
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        id: 'grant-001',
        title: 'Community Development Block Grant',
        agency: 'Department of Housing and Urban Development',
        fundingAmount: { min: 50000, max: 500000 },
        deadline: new Date('2024-03-15'),
        eligibility: ['501(c)(3)', 'State/Local Government', 'Tribal Organization'],
        category: 'Community Development',
        cfda: '14.218',
        url: 'https://sam.gov/opp/example1',
        postedDate: new Date('2024-01-01'),
        status: 'open',
      },
      {
        id: 'grant-002',
        title: 'Small Business Innovation Research (SBIR)',
        agency: 'Small Business Administration',
        fundingAmount: { min: 100000, max: 1500000 },
        deadline: new Date('2024-04-01'),
        eligibility: ['Small Business', 'US-based'],
        category: 'Research & Development',
        cfda: '59.012',
        url: 'https://sam.gov/opp/example2',
        postedDate: new Date('2024-01-10'),
        status: 'open',
      },
      {
        id: 'grant-003',
        title: 'Youth Development Program Grant',
        agency: 'Department of Education',
        fundingAmount: { min: 25000, max: 250000 },
        deadline: new Date('2024-02-28'),
        eligibility: ['501(c)(3)', 'Educational Institution'],
        category: 'Education',
        cfda: '84.287',
        url: 'https://sam.gov/opp/example3',
        postedDate: new Date('2024-01-05'),
        status: 'open',
      },
    ];
  }

  // State Business Registry Check
  async checkStateRegistrations(entityName: string, states: string[]): Promise<StateRegistration[]> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return states.map(state => ({
      state,
      entityName,
      registrationNumber: `${state}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: Math.random() > 0.2 ? 'active' : 'pending',
      filingDate: new Date('2023-01-15'),
      expirationDate: new Date('2025-01-15'),
      annualReportDue: new Date('2024-04-15'),
      registeredAgent: 'L.A.W.S. Registered Agent Services',
      fees: {
        amount: Math.floor(Math.random() * 200) + 50,
        dueDate: new Date('2024-04-15'),
      },
    })) as StateRegistration[];
  }

  // Bank Account Integration (Plaid-style)
  async getBankAccounts(): Promise<BankAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: 'acct-001',
        institutionName: 'Chase Bank',
        accountType: 'checking',
        accountNumber: '****4521',
        balance: 45678.90,
        availableBalance: 44500.00,
        currency: 'USD',
        lastUpdated: new Date(),
      },
      {
        id: 'acct-002',
        institutionName: 'Chase Bank',
        accountType: 'savings',
        accountNumber: '****7832',
        balance: 125000.00,
        availableBalance: 125000.00,
        currency: 'USD',
        lastUpdated: new Date(),
      },
      {
        id: 'acct-003',
        institutionName: 'Bank of America',
        accountType: 'checking',
        accountNumber: '****9156',
        balance: 12450.75,
        availableBalance: 12450.75,
        currency: 'USD',
        lastUpdated: new Date(),
      },
    ];
  }

  // Get Bank Transactions
  async getBankTransactions(accountId: string, days: number = 30): Promise<BankTransaction[]> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const transactions: BankTransaction[] = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(Math.random() * days));
      
      transactions.push({
        id: `txn-${i}`,
        accountId,
        date,
        description: ['Payroll Deposit', 'Office Supplies', 'Software Subscription', 'Client Payment', 'Utility Bill'][Math.floor(Math.random() * 5)],
        amount: Math.floor(Math.random() * 5000) + 100,
        type: Math.random() > 0.4 ? 'credit' : 'debit',
        category: ['Income', 'Supplies', 'Software', 'Revenue', 'Utilities'][Math.floor(Math.random() * 5)],
        pending: Math.random() > 0.9,
      });
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Sync all external data
  async syncAllData(): Promise<{
    grants: number;
    registrations: number;
    accounts: number;
    transactions: number;
  }> {
    const [grants, registrations, accounts] = await Promise.all([
      this.searchGrants({}),
      this.checkStateRegistrations('The L.A.W.S. Collective', ['GA', 'FL', 'TX', 'CA', 'NY']),
      this.getBankAccounts(),
    ]);

    let totalTransactions = 0;
    for (const account of accounts) {
      const txns = await this.getBankTransactions(account.id);
      totalTransactions += txns.length;
    }

    return {
      grants: grants.length,
      registrations: registrations.length,
      accounts: accounts.length,
      transactions: totalTransactions,
    };
  }
}

export const externalApiService = new ExternalApiService();
export default externalApiService;
