import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Coins,
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Loader2,
  TrendingUp,
  Bitcoin,
  Shield,
  RefreshCw,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function CryptoWallet() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [walletType, setWalletType] = useState<string>("bitcoin");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletLabel, setWalletLabel] = useState("");
  const [sendToAddress, setSendToAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);

  // Fetch wallets
  const { data: wallets, isLoading, refetch } = trpc.cryptoWallet.getUserWallets.useQuery();
  const { data: holdings } = trpc.cryptoWallet.getTotalHoldings.useQuery();

  // Create wallet mutation
  const createWallet = trpc.cryptoWallet.createWallet.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.walletType} wallet created!`);
      setCreateOpen(false);
      setWalletAddress("");
      setWalletLabel("");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to create wallet: " + error.message);
    },
  });

  // Send crypto mutation
  const sendCrypto = trpc.cryptoWallet.sendCrypto.useMutation({
    onSuccess: () => {
      toast.success("Transaction submitted!");
      setSendOpen(false);
      setSendToAddress("");
      setSendAmount("");
      refetch();
    },
    onError: (error) => {
      toast.error("Transaction failed: " + error.message);
    },
  });

  const handleCreateWallet = () => {
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }
    createWallet.mutate({
      walletType: walletType as any,
      walletAddress: walletAddress.trim(),
      label: walletLabel.trim() || undefined,
    });
  };

  const handleSendCrypto = () => {
    if (!selectedWalletId || !sendToAddress.trim() || !sendAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    sendCrypto.mutate({
      walletId: selectedWalletId,
      toAddress: sendToAddress.trim(),
      amount: sendAmount,
    });
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const walletTypeInfo: Record<string, { icon: React.ReactNode; color: string; name: string }> = {
    bitcoin: { icon: <Bitcoin className="w-5 h-5" />, color: "text-orange-500", name: "Bitcoin (BTC)" },
    ethereum: { icon: <Coins className="w-5 h-5" />, color: "text-blue-500", name: "Ethereum (ETH)" },
    solana: { icon: <Coins className="w-5 h-5" />, color: "text-purple-500", name: "Solana (SOL)" },
    other: { icon: <Coins className="w-5 h-5" />, color: "text-gray-500", name: "Other" },
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="w-6 h-6 text-amber-500" />
              Crypto Wallet
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your cryptocurrency wallets and transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Crypto Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Wallet Type</label>
                    <Select value={walletType} onValueChange={setWalletType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                        <SelectItem value="solana">Solana (SOL)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Wallet Address</label>
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your wallet address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Label (Optional)</label>
                    <Input
                      value={walletLabel}
                      onChange={(e) => setWalletLabel(e.target.value)}
                      placeholder="e.g., Main BTC Wallet"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateWallet} disabled={createWallet.isPending}>
                    {createWallet.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Create Wallet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Holdings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                  <Bitcoin className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Wallets</p>
                  <p className="text-2xl font-bold">{wallets?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Wallets</p>
                  <p className="text-2xl font-bold">
                    {wallets?.filter((w: any) => w.status === "active").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                  <Coins className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crypto Types</p>
                  <p className="text-2xl font-bold">
                    {new Set(wallets?.map((w: any) => w.walletType)).size || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security</p>
                  <p className="text-lg font-bold text-green-600">Protected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wallets List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Wallets</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !wallets || wallets.length === 0 ? (
            <Card className="p-12 text-center">
              <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Wallets Yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first cryptocurrency wallet to start tracking your holdings.
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Wallet
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((wallet: any) => {
                const info = walletTypeInfo[wallet.walletType] || walletTypeInfo.other;
                return (
                  <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={info.color}>{info.icon}</div>
                          <div>
                            <CardTitle className="text-base">
                              {wallet.label || info.name}
                            </CardTitle>
                            <CardDescription>{info.name}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={wallet.status === "active" ? "default" : "secondary"}>
                          {wallet.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Address */}
                        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                          <code className="text-xs flex-1 truncate">{wallet.walletAddress}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(wallet.walletAddress)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Balance */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Balance</span>
                          <span className="font-mono font-semibold">
                            {wallet.balance || "0.00"} {wallet.walletType === "bitcoin" ? "BTC" : wallet.walletType === "ethereum" ? "ETH" : wallet.walletType === "solana" ? "SOL" : ""}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedWalletId(wallet.id);
                              setSendOpen(true);
                            }}
                          >
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Send
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              copyAddress(wallet.walletAddress);
                              toast.success("Receive address copied!");
                            }}
                          >
                            <ArrowDownLeft className="w-3 h-3 mr-1" />
                            Receive
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Educational Note */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <GraduationCap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Learn About Crypto & NFTs</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Visit the Academy K-12 Curriculum for comprehensive courses on Bitcoin, Blockchain Technology, 
                  and NFT Creation — from fundamentals to advanced wallet security and smart contracts.
                </p>
                <Button variant="outline" size="sm" onClick={() => window.location.href = "/academy/k12"}>
                  <BookOpen className="w-4 h-4 mr-1" />
                  Go to Crypto Courses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Dialog */}
        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Cryptocurrency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Recipient Address</label>
                <Input
                  value={sendToAddress}
                  onChange={(e) => setSendToAddress(e.target.value)}
                  placeholder="Enter recipient wallet address"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <Input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.00000001"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
              <Button onClick={handleSendCrypto} disabled={sendCrypto.isPending}>
                {sendCrypto.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

