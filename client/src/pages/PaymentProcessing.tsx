import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Receipt,
  Users,
  Calendar,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  Settings,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

interface PaymentProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  features: string[];
  active: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  customerEmail: string;
  customerName: string;
  productName: string;
  createdAt: Date;
  receiptUrl?: string;
}

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: Date;
  amount: number;
  interval: string;
}

export default function PaymentProcessingPage() {
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    successRate: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load products
    setProducts([
      {
        id: 'prod_basic',
        name: 'Basic Membership',
        description: 'Access to core features and community',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: ['Community Access', 'Basic Training', 'Document Storage (5GB)', 'Email Support'],
        active: true,
      },
      {
        id: 'prod_standard',
        name: 'Standard Membership',
        description: 'Full access with advanced features',
        price: 79,
        currency: 'usd',
        interval: 'month',
        features: ['Everything in Basic', 'Advanced Training', 'Document Storage (25GB)', 'Priority Support', 'Workflow Automation'],
        active: true,
      },
      {
        id: 'prod_premium',
        name: 'Premium Membership',
        description: 'Complete access with dedicated support',
        price: 199,
        currency: 'usd',
        interval: 'month',
        features: ['Everything in Standard', 'Unlimited Storage', '1-on-1 Mentoring', 'API Access', 'Custom Integrations', 'Dedicated Account Manager'],
        active: true,
      },
      {
        id: 'prod_course',
        name: 'Grant Writing Masterclass',
        description: 'Comprehensive grant writing course',
        price: 497,
        currency: 'usd',
        interval: 'one_time',
        features: ['12 Video Modules', 'Workbook & Templates', 'Certificate', 'Lifetime Access'],
        active: true,
      },
    ]);

    // Load transactions
    setTransactions([
      {
        id: 'txn_001',
        amount: 79,
        currency: 'usd',
        status: 'succeeded',
        customerEmail: 'john@example.com',
        customerName: 'John Smith',
        productName: 'Standard Membership',
        createdAt: new Date('2024-01-25'),
        receiptUrl: '#',
      },
      {
        id: 'txn_002',
        amount: 497,
        currency: 'usd',
        status: 'succeeded',
        customerEmail: 'sarah@example.com',
        customerName: 'Sarah Johnson',
        productName: 'Grant Writing Masterclass',
        createdAt: new Date('2024-01-24'),
        receiptUrl: '#',
      },
      {
        id: 'txn_003',
        amount: 199,
        currency: 'usd',
        status: 'pending',
        customerEmail: 'mike@example.com',
        customerName: 'Mike Davis',
        productName: 'Premium Membership',
        createdAt: new Date('2024-01-24'),
      },
      {
        id: 'txn_004',
        amount: 29,
        currency: 'usd',
        status: 'failed',
        customerEmail: 'lisa@example.com',
        customerName: 'Lisa Brown',
        productName: 'Basic Membership',
        createdAt: new Date('2024-01-23'),
      },
    ]);

    // Load subscriptions
    setSubscriptions([
      {
        id: 'sub_001',
        customerId: 'cus_001',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        productName: 'Standard Membership',
        status: 'active',
        currentPeriodEnd: new Date('2024-02-25'),
        amount: 79,
        interval: 'month',
      },
      {
        id: 'sub_002',
        customerId: 'cus_002',
        customerName: 'Emily Wilson',
        customerEmail: 'emily@example.com',
        productName: 'Premium Membership',
        status: 'active',
        currentPeriodEnd: new Date('2024-02-20'),
        amount: 199,
        interval: 'month',
      },
      {
        id: 'sub_003',
        customerId: 'cus_003',
        customerName: 'David Lee',
        customerEmail: 'david@example.com',
        productName: 'Basic Membership',
        status: 'past_due',
        currentPeriodEnd: new Date('2024-01-20'),
        amount: 29,
        interval: 'month',
      },
    ]);

    // Calculate stats
    setStats({
      totalRevenue: 125750,
      monthlyRevenue: 12450,
      activeSubscriptions: 156,
      successRate: 94.5,
    });
  };

  const handleCreateCheckout = async (product: PaymentProduct) => {
    setIsLoading(true);
    try {
      // In production, call tRPC to create Stripe checkout session
      toast.info("Redirecting to checkout...");
      // window.open(checkoutUrl, '_blank');
    } catch (error) {
      toast.error("Failed to create checkout session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async (transactionId: string) => {
    toast.success("Refund initiated");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'trialing':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'past_due':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
      case 'trialing':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'past_due':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'refunded':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              Payment Processing
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage products, subscriptions, and payment transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                  <p className="text-xs text-muted-foreground">Active Subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.id} className={!product.active ? 'opacity-60' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={product.interval === 'one_time' ? 'secondary' : 'default'}>
                        {product.interval === 'one_time' ? 'One-time' : `/${product.interval}`}
                      </Badge>
                      {!product.active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${product.price}</span>
                      {product.interval !== 'one_time' && (
                        <span className="text-muted-foreground">/{product.interval}</span>
                      )}
                    </div>
                    <ul className="space-y-2 mb-4">
                      {product.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      onClick={() => handleCreateCheckout(product)}
                      disabled={!product.active || isLoading}
                    >
                      {product.interval === 'one_time' ? 'Purchase' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      View and manage payment transactions
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(txn.status)}
                          <div>
                            <h4 className="font-medium">{txn.customerName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {txn.productName} • {txn.customerEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">${txn.amount}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(txn.createdAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(txn.status)}>
                            {txn.status}
                          </Badge>
                          {txn.receiptUrl && txn.status === 'succeeded' && (
                            <Button variant="ghost" size="sm">
                              <Receipt className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>
                  Manage recurring subscriptions and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(sub.status)}
                          <div>
                            <h4 className="font-medium">{sub.customerName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {sub.productName} • ${sub.amount}/{sub.interval}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">
                              {sub.status === 'past_due' ? 'Payment overdue' : `Renews ${format(sub.currentPeriodEnd, 'MMM d')}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{sub.customerEmail}</p>
                          </div>
                          <Badge className={getStatusColor(sub.status)}>
                            {sub.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Stripe Test Mode Notice */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">Test Mode Active</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Use card number 4242 4242 4242 4242 for testing. Claim your Stripe sandbox to go live.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
