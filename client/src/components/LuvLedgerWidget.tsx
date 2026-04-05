import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  History,
  ChevronRight,
  DollarSign,
  PiggyBank,
  Building2,
} from "lucide-react";
import { Link } from "wouter";

export function LuvLedgerWidget() {
  const { data: summary, isLoading } = trpc.luvledger.getHouseLedgerSummary.useQuery();
  const { data: allocation } = trpc.luvledger.getAllocationSummary.useQuery();

  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalBalance = summary?.totalBalance || "0.00";
  const accounts = summary?.accounts || [];
  const recentTransactions = summary?.recentTransactions || [];

  return (
    <Card className="col-span-full lg:col-span-1 overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="w-5 h-5 text-emerald-600" />
            LuvLedger
          </CardTitle>
          <Link href="/luvledger">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Total Balance */}
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            ${parseFloat(totalBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Allocation Summary */}
        {allocation && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">House (60%)</span>
              </div>
              <p className="text-sm font-semibold">${allocation.allocations.houseMajority.amount}</p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-muted-foreground">Inheritance</span>
              </div>
              <p className="text-sm font-semibold">${allocation.allocations.inheritance.amount}</p>
            </div>
          </div>
        )}

        {/* Accounts */}
        {accounts.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Accounts ({accounts.length})
            </p>
            <div className="space-y-2">
              {accounts.slice(0, 3).map((account: any) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{account.accountName}</p>
                    <Badge variant="outline" className="text-xs">
                      {account.accountType}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">
                    ${parseFloat(account.balance || "0").toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Activity
            </p>
            <div className="space-y-2">
              {recentTransactions.slice(0, 3).map((tx: any, idx: number) => (
                <div
                  key={tx.id || idx}
                  className="flex items-center justify-between p-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {tx.transactionType === "income" || tx.transactionType === "allocation" ? (
                      <ArrowDownRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-xs font-medium">{tx.description || tx.transactionType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      tx.transactionType === "income" || tx.transactionType === "allocation"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {tx.transactionType === "income" || tx.transactionType === "allocation" ? "+" : "-"}$
                    {parseFloat(tx.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <div className="text-center py-4">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No accounts yet</p>
            <Link href="/luvledger">
              <Button variant="outline" size="sm" className="mt-2">
                Create Account
              </Button>
            </Link>
          </div>
        )}

        {/* Treasury Contribution */}
        {allocation && parseFloat(allocation.allocations.external.amount) > 0 && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium">Treasury Contribution</span>
              </div>
              <p className="text-sm font-bold text-amber-600">
                ${allocation.allocations.external.amount}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              40% collective share for community growth
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LuvLedgerWidget;
