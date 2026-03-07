import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, 
  Search, 
  Building2, 
  Landmark,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  FileText,
  Link2,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { externalApiService, GrantOpportunity, StateRegistration, BankAccount, BankTransaction } from "@/services/externalApiService";
import { format } from "date-fns";

export default function ExternalApiIntegrationsPage() {
  const [grants, setGrants] = useState<GrantOpportunity[]>([]);
  const [registrations, setRegistrations] = useState<StateRegistration[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [grantsData, regsData, accountsData] = await Promise.all([
        externalApiService.searchGrants({}),
        externalApiService.checkStateRegistrations('The The L.A.W.S. Collective', ['GA', 'FL', 'TX', 'CA', 'NY']),
        externalApiService.getBankAccounts(),
      ]);
      
      setGrants(grantsData);
      setRegistrations(regsData);
      setBankAccounts(accountsData);
      setLastSync(new Date());

      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].id);
        const txns = await externalApiService.getBankTransactions(accountsData[0].id);
        setTransactions(txns);
      }
    } catch (error) {
      toast.error("Failed to load external data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchGrants = async () => {
    setIsLoading(true);
    try {
      const results = await externalApiService.searchGrants({ keywords: searchKeywords });
      setGrants(results);
      toast.success(`Found ${results.length} grant opportunities`);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = async (accountId: string) => {
    setSelectedAccount(accountId);
    setIsLoading(true);
    try {
      const txns = await externalApiService.getBankTransactions(accountId);
      setTransactions(txns);
    } catch (error) {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setIsLoading(true);
    try {
      const stats = await externalApiService.syncAllData();
      toast.success(`Synced: ${stats.grants} grants, ${stats.registrations} registrations, ${stats.accounts} accounts`);
      await loadData();
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'forecasted':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'closed':
      case 'expired':
      case 'revoked':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Globe className="w-8 h-8 text-primary" />
              External API Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect to SAM.gov, state registries, and banking APIs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastSync && (
              <span className="text-sm text-muted-foreground">
                Last sync: {format(lastSync, 'h:mm a')}
              </span>
            )}
            <Button onClick={handleSyncAll} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grants.filter(g => g.status === 'open').length}</p>
                  <p className="text-xs text-muted-foreground">Open Grants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{registrations.filter(r => r.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">Active Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Landmark className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bankAccounts.length}</p>
                  <p className="text-xs text-muted-foreground">Connected Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalBalance.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="grants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grants">SAM.gov Grants</TabsTrigger>
            <TabsTrigger value="registrations">State Registrations</TabsTrigger>
            <TabsTrigger value="banking">Banking</TabsTrigger>
            <TabsTrigger value="connections">API Connections</TabsTrigger>
          </TabsList>

          {/* Grants Tab */}
          <TabsContent value="grants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Grant Opportunities</CardTitle>
                    <CardDescription>Search SAM.gov for federal grant opportunities</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search keywords..."
                      value={searchKeywords}
                      onChange={(e) => setSearchKeywords(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleSearchGrants} disabled={isLoading}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {grants.map((grant) => (
                      <div key={grant.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{grant.title}</h4>
                            <p className="text-sm text-muted-foreground">{grant.agency}</p>
                          </div>
                          <Badge className={getStatusColor(grant.status)}>
                            {grant.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-muted-foreground">Funding</p>
                            <p className="font-medium">
                              ${grant.fundingAmount.min.toLocaleString()} - ${grant.fundingAmount.max.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deadline</p>
                            <p className="font-medium">{format(grant.deadline, 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CFDA</p>
                            <p className="font-medium">{grant.cfda || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View on SAM.gov
                          </Button>
                          <Button size="sm">
                            Track Grant
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>State Business Registrations</CardTitle>
                <CardDescription>Monitor entity registration status across states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {registrations.map((reg) => (
                    <div key={`${reg.state}-${reg.registrationNumber}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center font-bold text-lg">
                          {reg.state}
                        </div>
                        <div>
                          <h4 className="font-medium">{reg.entityName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Reg #: {reg.registrationNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">
                            {reg.annualReportDue && `Report due: ${format(reg.annualReportDue, 'MMM d, yyyy')}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Fee: ${reg.fees.amount}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reg.status)}>
                          {reg.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedAccount === account.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectAccount(account.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{account.institutionName}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.accountType} {account.accountNumber}
                            </p>
                          </div>
                          <p className="font-bold">${account.balance.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect Account
                  </Button>
                </CardContent>
              </Card>

              {/* Transactions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    {bankAccounts.find(a => a.id === selectedAccount)?.institutionName || 'Select an account'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(txn.date, 'MMM d, yyyy')}
                              {txn.pending && ' • Pending'}
                            </p>
                          </div>
                          <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.type === 'credit' ? '+' : '-'}${txn.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'SAM.gov', description: 'Federal grant opportunities', status: 'connected', icon: FileText },
                { name: 'State Registries', description: 'Business registration monitoring', status: 'connected', icon: Building2 },
                { name: 'Plaid', description: 'Bank account integration', status: 'connected', icon: Landmark },
                { name: 'Google Calendar', description: 'Calendar sync', status: 'available', icon: Calendar },
                { name: 'QuickBooks', description: 'Accounting integration', status: 'available', icon: DollarSign },
                { name: 'DocuSign', description: 'E-signature integration', status: 'available', icon: FileText },
              ].map((api) => (
                <Card key={api.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <api.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{api.name}</h4>
                          <p className="text-xs text-muted-foreground">{api.description}</p>
                        </div>
                      </div>
                      <Badge className={api.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {api.status}
                      </Badge>
                    </div>
                    <Button 
                      variant={api.status === 'connected' ? 'outline' : 'default'}
                      size="sm" 
                      className="w-full mt-4"
                    >
                      {api.status === 'connected' ? (
                        <>
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
