import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function HoldingsManagement() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);
  const [isAddingHolding, setIsAddingHolding] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    assetType: "stock",
    quantity: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  const { data: portfoliosData } = trpc.investmentMgmt.getPortfolios.useQuery({
    limit: 50,
    offset: 0,
  });

  const { data: holdingsData, isLoading, refetch } = trpc.investmentMgmt.getHoldings.useQuery(
    { portfolioId: selectedPortfolio || 0, limit: 50, offset: 0 },
    { enabled: !!selectedPortfolio }
  );

  const addHoldingMutation = trpc.investmentMgmt.addHolding.useMutation({
    onSuccess: () => {
      toast.success("Holding added successfully");
      setFormData({
        symbol: "",
        assetType: "stock",
        quantity: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      });
      setIsAddingHolding(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error adding holding: ${error.message}`);
    },
  });

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPortfolio || !formData.symbol || !formData.quantity || !formData.purchasePrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    await addHoldingMutation.mutateAsync({
      portfolioId: selectedPortfolio,
      symbol: formData.symbol.toUpperCase(),
      assetType: formData.assetType as any,
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      purchaseDate: new Date(formData.purchaseDate),
    });
  };

  const getAssetTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      stock: "bg-blue-100 text-blue-800",
      bond: "bg-green-100 text-green-800",
      etf: "bg-purple-100 text-purple-800",
      mutual_fund: "bg-indigo-100 text-indigo-800",
      cryptocurrency: "bg-orange-100 text-orange-800",
      real_estate: "bg-yellow-100 text-yellow-800",
      commodity: "bg-amber-100 text-amber-800",
      option: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold">Holdings Management</h1>
        </div>
        <Button
          onClick={() => setIsAddingHolding(!isAddingHolding)}
          disabled={!selectedPortfolio}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Holding
        </Button>
      </div>

      {/* Portfolio Selection */}
      <Card className="p-4">
        <label className="block text-sm font-medium mb-2">Select Portfolio</label>
        <Select
          value={selectedPortfolio?.toString() || ""}
          onValueChange={(value) => setSelectedPortfolio(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a portfolio..." />
          </SelectTrigger>
          <SelectContent>
            {portfoliosData?.portfolios?.map((portfolio: any) => (
              <SelectItem key={portfolio.id} value={portfolio.id.toString()}>
                {portfolio.name} (${portfolio.totalValue?.toLocaleString() || "0"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Add Holding Form */}
      {isAddingHolding && selectedPortfolio && (
        <Card className="p-6 bg-secondary/30">
          <h2 className="text-xl font-semibold mb-4">Add New Holding</h2>
          <form onSubmit={handleAddHolding} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Symbol</label>
                <Input
                  placeholder="e.g., AAPL"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value })
                  }
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Asset Type</label>
                <Select
                  value={formData.assetType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assetType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="bond">Bond</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
                    <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                    <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="commodity">Commodity</SelectItem>
                    <SelectItem value="option">Option</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Price</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date</label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={addHoldingMutation.isPending}
              >
                {addHoldingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Holding"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingHolding(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Holdings Table */}
      {selectedPortfolio && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Holdings</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : holdingsData?.holdings && holdingsData.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Purchase Price</TableHead>
                    <TableHead className="text-right">Current Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Gain/Loss</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdingsData.holdings.map((holding: any) => (
                    <TableRow key={holding.id}>
                      <TableCell className="font-semibold">{holding.symbol}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${getAssetTypeColor(holding.assetType)}`}>
                          {holding.assetType.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{holding.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${holding.purchasePrice?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${holding.currentPrice?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${holding.currentValue?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                          {holding.gainLoss >= 0 ? "+" : ""}${holding.gainLoss?.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {holding.gainLossPercent >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          )}
                          <span className={holding.gainLossPercent >= 0 ? "text-green-600" : "text-red-600"}>
                            {holding.gainLossPercent >= 0 ? "+" : ""}
                            {holding.gainLossPercent?.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No holdings in this portfolio yet.</p>
            </div>
          )}
        </Card>
      )}

      {!selectedPortfolio && (
        <Card className="p-8 text-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a portfolio to view and manage holdings.</p>
        </Card>
      )}
    </div>
  );
}
