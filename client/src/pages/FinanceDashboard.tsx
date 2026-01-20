import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Play,
  PieChart,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Landmark,
  Calculator,
} from "lucide-react";
import { Link } from "wouter";

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const departmentInfo = {
    name: "Finance Department",
    manager: "Craig Russell",
    role: "Finance Manager",
    description: "Managing financial operations, blockchain integration, and smart contract development",
  };

  const metrics = [
    { label: "Total Revenue", value: "$45.2K", icon: DollarSign, color: "text-green-500", trend: "+12%" },
    { label: "Expenses", value: "$28.1K", icon: CreditCard, color: "text-red-500", trend: "-5%" },
    { label: "Net Income", value: "$17.1K", icon: TrendingUp, color: "text-blue-500", trend: "+18%" },
    { label: "Grants Received", value: "$10K", icon: Coins, color: "text-amber-500", trend: "Pending" },
    { label: "Accounts", value: 4, icon: Landmark, color: "text-purple-500", trend: "Active" },
  ];

  const recentTransactions = [
    { description: "Grant Application Fee - Amber", amount: -15, date: "Today", category: "Grants" },
    { description: "Grant Application Fee - Freed", amount: -19, date: "Today", category: "Grants" },
    { description: "Software License - Design", amount: -299, date: "Jan 18", category: "Operations" },
    { description: "Consulting Revenue", amount: 2500, date: "Jan 15", category: "Revenue" },
    { description: "Academy Course Fee", amount: 150, date: "Jan 14", category: "Revenue" },
  ];

  const budgetCategories = [
    { category: "Operations", allocated: 15000, spent: 8500, remaining: 6500 },
    { category: "Marketing", allocated: 5000, spent: 2100, remaining: 2900 },
    { category: "Technology", allocated: 8000, spent: 4200, remaining: 3800 },
    { category: "Personnel", allocated: 20000, spent: 12000, remaining: 8000 },
  ];

  const pendingApprovals = [
    { item: "Software Purchase - Adobe Suite", amount: 599, requester: "Essence M. Hunter", status: "Pending CEO" },
    { item: "Marketing Campaign", amount: 1500, requester: "Amandes Pearsall IV", status: "Pending CEO" },
    { item: "Training Materials", amount: 350, requester: "Cornelius Christopher", status: "Auto-Approved" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{departmentInfo.name}</h1>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">Blockchain/Smart Contracts</Badge>
            </div>
            <p className="text-muted-foreground">
              Manager: <span className="font-medium text-foreground">{departmentInfo.manager}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">{departmentInfo.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/finance-simulator">
              <Button variant="outline" className="gap-2">
                <Play className="w-4 h-4" />
                Finance Simulator
              </Button>
            </Link>
            <Link href="/dept/finance/tax">
              <Button variant="outline" className="gap-2">
                <Calculator className="w-4 h-4" />
                Tax Module
              </Button>
            </Link>
            <Link href="/financial-automation">
              <Button className="gap-2">
                <DollarSign className="w-4 h-4" />
                Automation
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    {metric.trend.startsWith("+") && (
                      <span className="text-xs text-green-500 flex items-center">
                        <ArrowUpRight className="w-3 h-3" />{metric.trend}
                      </span>
                    )}
                    {metric.trend.startsWith("-") && (
                      <span className="text-xs text-red-500 flex items-center">
                        <ArrowDownRight className="w-3 h-3" />{metric.trend}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Transactions */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 4).map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-foreground text-sm">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`font-medium ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pending Approvals */}
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Pending Approvals</h3>
                <div className="space-y-3">
                  {pendingApprovals.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.item}</p>
                        <p className="text-xs text-muted-foreground">{item.requester}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">${item.amount}</p>
                        <Badge variant={item.status === "Auto-Approved" ? "default" : "secondary"} className="text-xs">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link href="/purchase-requests">
                  <Button variant="outline" className="w-full gap-2">
                    <CreditCard className="w-4 h-4" />
                    Purchase Requests
                  </Button>
                </Link>
                <Link href="/financial-statements">
                  <Button variant="outline" className="w-full gap-2">
                    <FileText className="w-4 h-4" />
                    Statements
                  </Button>
                </Link>
                <Link href="/banking">
                  <Button variant="outline" className="w-full gap-2">
                    <Landmark className="w-4 h-4" />
                    Banking
                  </Button>
                </Link>
                <Link href="/revenue-sharing">
                  <Button variant="outline" className="w-full gap-2">
                    <PieChart className="w-4 h-4" />
                    Revenue Sharing
                  </Button>
                </Link>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">All Transactions</h3>
              <div className="space-y-4">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${tx.amount > 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                      {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetCategories.map((budget) => (
                <Card key={budget.category} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{budget.category}</h3>
                    <Badge variant="outline">${budget.remaining.toLocaleString()} remaining</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Allocated</span>
                      <span className="font-medium">${budget.allocated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium text-red-500">${budget.spent.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 mt-2">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all" 
                        style={{ width: `${(budget.spent / budget.allocated) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((budget.spent / budget.allocated) * 100)}% utilized
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Department Team</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      CR
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Craig Russell</p>
                      <p className="text-sm text-muted-foreground">Finance Manager - Blockchain/Smart Contracts</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Manager</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Finance Coordinator</p>
                      <p className="text-sm text-muted-foreground">Pending Manager</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Open</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
