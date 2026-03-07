import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  DollarSign,
  Pause,
  Play,
  Trash2,
  Edit,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface RecurringDonation {
  id: string;
  subscriptionId: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annual";
  designation: string;
  status: "active" | "paused" | "cancelled";
  nextPaymentDate: string;
  startDate: string;
  totalDonated: number;
  paymentMethod: string;
}

interface DonationHistory {
  id: string;
  date: string;
  amount: number;
  frequency: string;
  designation: string;
  status: "completed" | "pending" | "failed";
  transactionId: string;
}

const DESIGNATION_LABELS: Record<string, string> = {
  general: "Where Needed Most",
  jobs: "Job Creation & Employment",
  education: "Education & Academy",
  housing: "Housing & Stability",
  business: "Business Development",
  emergency: "Emergency Support",
};

export default function DonorDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<string>("");
  const [newFrequency, setNewFrequency] = useState<string>("");

  // Mock data - replace with actual API calls
  const [recurringDonations] = useState<RecurringDonation[]>([
    {
      id: "1",
      subscriptionId: "sub_123",
      amount: 100,
      frequency: "monthly",
      designation: "education",
      status: "active",
      nextPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      startDate: "2024-01-15",
      totalDonated: 1200,
      paymentMethod: "•••• 4242",
    },
    {
      id: "2",
      subscriptionId: "sub_456",
      amount: 250,
      frequency: "quarterly",
      designation: "jobs",
      status: "active",
      nextPaymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      startDate: "2024-03-01",
      totalDonated: 1000,
      paymentMethod: "•••• 5555",
    },
  ]);

  const [donationHistory] = useState<DonationHistory[]>([
    {
      id: "1",
      date: "2024-03-07",
      amount: 100,
      frequency: "Monthly",
      designation: "Education & Academy",
      status: "completed",
      transactionId: "txn_123abc",
    },
    {
      id: "2",
      date: "2024-02-07",
      amount: 100,
      frequency: "Monthly",
      designation: "Education & Academy",
      status: "completed",
      transactionId: "txn_122abc",
    },
    {
      id: "3",
      date: "2024-03-01",
      amount: 250,
      frequency: "Quarterly",
      designation: "Job Creation & Employment",
      status: "completed",
      transactionId: "txn_121abc",
    },
  ]);

  const totalMonthlyCommitment = recurringDonations
    .filter((d) => d.status === "active")
    .reduce((sum, d) => {
      const monthlyAmount = d.frequency === "monthly" ? d.amount : d.frequency === "quarterly" ? d.amount / 3 : d.amount / 12;
      return sum + monthlyAmount;
    }, 0);

  const totalDonated = recurringDonations.reduce((sum, d) => sum + d.totalDonated, 0);

  const handlePauseDonation = (id: string) => {
    toast.success("Donation paused. You can resume it anytime.");
    // TODO: Call API to pause donation
  };

  const handleResumeDonation = (id: string) => {
    toast.success("Donation resumed!");
    // TODO: Call API to resume donation
  };

  const handleCancelDonation = (id: string) => {
    toast.error("Donation cancelled. We'll miss your support!");
    // TODO: Call API to cancel donation
  };

  const handleUpdateDonation = (id: string) => {
    if (newAmount && newFrequency) {
      toast.success("Donation updated successfully!");
      setEditingId(null);
      setNewAmount("");
      setNewFrequency("");
      // TODO: Call API to update donation
    } else {
      toast.error("Please fill in all fields");
    }
  };

  const handleDownloadReceipt = (transactionId: string) => {
    toast.success("Receipt downloaded!");
    // TODO: Implement receipt download
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your donation dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/login"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Donor Dashboard</h1>
          <p className="text-muted-foreground">Manage your recurring donations and view your impact</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Commitment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalMonthlyCommitment.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Average monthly donation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalDonated.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime contribution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {recurringDonations.filter((d) => d.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Ongoing recurring donations</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recurring" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recurring">Recurring Donations</TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
          </TabsList>

          {/* Recurring Donations Tab */}
          <TabsContent value="recurring" className="space-y-4 mt-6">
            {recurringDonations.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You don't have any recurring donations yet.</p>
                <Button onClick={() => window.location.href = "/donate"}>Start Giving Today</Button>
              </Card>
            ) : (
              recurringDonations.map((donation) => (
                <Card key={donation.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            ${donation.amount} {donation.frequency.charAt(0).toUpperCase() + donation.frequency.slice(1)}
                          </CardTitle>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              donation.status === "active"
                                ? "bg-green-100 text-green-800"
                                : donation.status === "paused"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </span>
                        </div>
                        <CardDescription>{DESIGNATION_LABELS[donation.designation] || donation.designation}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">${donation.totalDonated} total</p>
                        <p className="text-xs text-muted-foreground">Since {donation.startDate}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Donation Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Next Payment</p>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Calendar className="w-4 h-4" />
                          {new Date(donation.nextPaymentDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                        <p className="text-sm font-medium">{donation.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Started</p>
                        <p className="text-sm font-medium">{new Date(donation.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Subscription ID</p>
                        <p className="text-sm font-medium font-mono text-xs">{donation.subscriptionId}</p>
                      </div>
                    </div>

                    {/* Edit Mode */}
                    {editingId === donation.id ? (
                      <div className="space-y-3 bg-secondary/30 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`amount-${donation.id}`}>New Amount</Label>
                            <Input
                              id={`amount-${donation.id}`}
                              type="number"
                              placeholder={donation.amount.toString()}
                              value={newAmount}
                              onChange={(e) => setNewAmount(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`frequency-${donation.id}`}>Frequency</Label>
                            <Select value={newFrequency} onValueChange={setNewFrequency}>
                              <SelectTrigger id={`frequency-${donation.id}`} className="mt-1">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateDonation(donation.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save Changes
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {donation.status === "active" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePauseDonation(donation.id)}
                          className="gap-2"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </Button>
                      ) : donation.status === "paused" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResumeDonation(donation.id)}
                          className="gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </Button>
                      ) : null}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(donation.id);
                          setNewAmount(donation.amount.toString());
                          setNewFrequency(donation.frequency);
                        }}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelDonation(donation.id)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Donation History Tab */}
          <TabsContent value="history" className="space-y-4 mt-6">
            {donationHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No donation history yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {donationHistory.map((donation) => (
                  <Card key={donation.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {donation.status === "completed" ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : donation.status === "pending" ? (
                            <Clock className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">${donation.amount.toFixed(2)}</p>
                            <span className="text-xs text-muted-foreground">{donation.frequency}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{donation.designation}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(donation.date).toLocaleDateString()} • {donation.transactionId}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadReceipt(donation.transactionId)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle>Ready to Increase Your Impact?</CardTitle>
            <CardDescription>Adjust your donation amount or frequency to support more causes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/donate"} className="gap-2">
              <Heart className="w-4 h-4" />
              Make Another Donation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
