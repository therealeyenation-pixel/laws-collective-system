import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Globe, MapPin, FileText, CheckCircle, Clock, AlertCircle,
  Building, Search, Plus, Download, ExternalLink, Calendar,
  DollarSign, User, Shield, ChevronRight, Info
} from "lucide-react";

// US State foreign qualification requirements
const US_STATES = [
  { code: "AL", name: "Alabama", filingFee: 150, annualFee: 100, processingDays: 5, requiresAgent: true },
  { code: "AK", name: "Alaska", filingFee: 350, annualFee: 100, processingDays: 10, requiresAgent: true },
  { code: "AZ", name: "Arizona", filingFee: 150, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "AR", name: "Arkansas", filingFee: 300, annualFee: 150, processingDays: 3, requiresAgent: true },
  { code: "CA", name: "California", filingFee: 70, annualFee: 800, processingDays: 5, requiresAgent: true },
  { code: "CO", name: "Colorado", filingFee: 100, annualFee: 10, processingDays: 5, requiresAgent: true },
  { code: "CT", name: "Connecticut", filingFee: 250, annualFee: 435, processingDays: 5, requiresAgent: true },
  { code: "DE", name: "Delaware", filingFee: 200, annualFee: 300, processingDays: 3, requiresAgent: true },
  { code: "FL", name: "Florida", filingFee: 125, annualFee: 138.75, processingDays: 3, requiresAgent: true },
  { code: "GA", name: "Georgia", filingFee: 225, annualFee: 50, processingDays: 7, requiresAgent: true },
  { code: "HI", name: "Hawaii", filingFee: 100, annualFee: 25, processingDays: 10, requiresAgent: true },
  { code: "ID", name: "Idaho", filingFee: 100, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "IL", name: "Illinois", filingFee: 150, annualFee: 75, processingDays: 5, requiresAgent: true },
  { code: "IN", name: "Indiana", filingFee: 100, annualFee: 31, processingDays: 5, requiresAgent: true },
  { code: "IA", name: "Iowa", filingFee: 100, annualFee: 60, processingDays: 5, requiresAgent: true },
  { code: "KS", name: "Kansas", filingFee: 165, annualFee: 55, processingDays: 5, requiresAgent: true },
  { code: "KY", name: "Kentucky", filingFee: 90, annualFee: 15, processingDays: 5, requiresAgent: true },
  { code: "LA", name: "Louisiana", filingFee: 150, annualFee: 35, processingDays: 5, requiresAgent: true },
  { code: "ME", name: "Maine", filingFee: 250, annualFee: 85, processingDays: 5, requiresAgent: true },
  { code: "MD", name: "Maryland", filingFee: 100, annualFee: 300, processingDays: 7, requiresAgent: true },
  { code: "MA", name: "Massachusetts", filingFee: 500, annualFee: 500, processingDays: 5, requiresAgent: true },
  { code: "MI", name: "Michigan", filingFee: 50, annualFee: 25, processingDays: 5, requiresAgent: true },
  { code: "MN", name: "Minnesota", filingFee: 200, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "MS", name: "Mississippi", filingFee: 250, annualFee: 25, processingDays: 5, requiresAgent: true },
  { code: "MO", name: "Missouri", filingFee: 153, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "MT", name: "Montana", filingFee: 70, annualFee: 20, processingDays: 5, requiresAgent: true },
  { code: "NE", name: "Nebraska", filingFee: 120, annualFee: 26, processingDays: 5, requiresAgent: true },
  { code: "NV", name: "Nevada", filingFee: 425, annualFee: 350, processingDays: 3, requiresAgent: true },
  { code: "NH", name: "New Hampshire", filingFee: 100, annualFee: 100, processingDays: 5, requiresAgent: true },
  { code: "NJ", name: "New Jersey", filingFee: 125, annualFee: 75, processingDays: 5, requiresAgent: true },
  { code: "NM", name: "New Mexico", filingFee: 100, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "NY", name: "New York", filingFee: 250, annualFee: 9, processingDays: 7, requiresAgent: true },
  { code: "NC", name: "North Carolina", filingFee: 250, annualFee: 200, processingDays: 5, requiresAgent: true },
  { code: "ND", name: "North Dakota", filingFee: 135, annualFee: 50, processingDays: 5, requiresAgent: true },
  { code: "OH", name: "Ohio", filingFee: 99, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "OK", name: "Oklahoma", filingFee: 300, annualFee: 25, processingDays: 5, requiresAgent: true },
  { code: "OR", name: "Oregon", filingFee: 275, annualFee: 100, processingDays: 5, requiresAgent: true },
  { code: "PA", name: "Pennsylvania", filingFee: 250, annualFee: 70, processingDays: 7, requiresAgent: true },
  { code: "RI", name: "Rhode Island", filingFee: 150, annualFee: 50, processingDays: 5, requiresAgent: true },
  { code: "SC", name: "South Carolina", filingFee: 110, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "SD", name: "South Dakota", filingFee: 150, annualFee: 50, processingDays: 5, requiresAgent: true },
  { code: "TN", name: "Tennessee", filingFee: 300, annualFee: 300, processingDays: 5, requiresAgent: true },
  { code: "TX", name: "Texas", filingFee: 750, annualFee: 0, processingDays: 5, requiresAgent: true },
  { code: "UT", name: "Utah", filingFee: 70, annualFee: 20, processingDays: 5, requiresAgent: true },
  { code: "VT", name: "Vermont", filingFee: 125, annualFee: 45, processingDays: 5, requiresAgent: true },
  { code: "VA", name: "Virginia", filingFee: 100, annualFee: 50, processingDays: 5, requiresAgent: true },
  { code: "WA", name: "Washington", filingFee: 180, annualFee: 71, processingDays: 5, requiresAgent: true },
  { code: "WV", name: "West Virginia", filingFee: 150, annualFee: 25, processingDays: 5, requiresAgent: true },
  { code: "WI", name: "Wisconsin", filingFee: 100, annualFee: 25, processingDays: 5, requiresAgent: true },
  { code: "WY", name: "Wyoming", filingFee: 100, annualFee: 60, processingDays: 5, requiresAgent: true },
  { code: "DC", name: "Washington D.C.", filingFee: 220, annualFee: 300, processingDays: 5, requiresAgent: true },
];

// Foreign qualification checklist items
const CHECKLIST_ITEMS = [
  { id: "good-standing", label: "Certificate of Good Standing from home state", category: "documents", required: true },
  { id: "articles", label: "Certified copy of Articles of Organization/Incorporation", category: "documents", required: true },
  { id: "application", label: "Application for Certificate of Authority", category: "documents", required: true },
  { id: "agent", label: "Registered Agent designation in target state", category: "agent", required: true },
  { id: "agent-consent", label: "Registered Agent consent form (if required)", category: "agent", required: false },
  { id: "filing-fee", label: "Filing fee payment", category: "fees", required: true },
  { id: "name-check", label: "Name availability check in target state", category: "preparation", required: true },
  { id: "name-reservation", label: "Name reservation (if name unavailable)", category: "preparation", required: false },
  { id: "ein", label: "EIN/Tax ID documentation", category: "tax", required: false },
  { id: "state-tax", label: "State tax registration", category: "tax", required: true },
  { id: "business-license", label: "Local business license (if required)", category: "licenses", required: false },
  { id: "professional-license", label: "Professional licenses (if applicable)", category: "licenses", required: false },
];

interface ForeignRegistration {
  id: string;
  homeState: string;
  targetState: string;
  entityName: string;
  entityType: string;
  status: "pending" | "in_progress" | "completed" | "expired";
  filingDate?: string;
  approvalDate?: string;
  expirationDate?: string;
  registeredAgent?: string;
  checklist: Record<string, boolean>;
}

export default function ForeignQualification() {
  const [activeTab, setActiveTab] = useState("checklist");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHomeState, setSelectedHomeState] = useState("");
  const [selectedTargetState, setSelectedTargetState] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [registrations, setRegistrations] = useState<ForeignRegistration[]>([
    {
      id: "1",
      homeState: "DE",
      targetState: "GA",
      entityName: "LuvOnPurpose Holdings LLC",
      entityType: "LLC",
      status: "in_progress",
      filingDate: "2024-01-15",
      registeredAgent: "Georgia Registered Agent Services",
      checklist: {
        "good-standing": true,
        "articles": true,
        "application": false,
        "agent": true,
        "filing-fee": false,
        "name-check": true,
        "state-tax": false,
      },
    },
  ]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const filteredStates = US_STATES.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedState = US_STATES.find(s => s.code === selectedTargetState);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "expired":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateProgress = (reg: ForeignRegistration) => {
    const total = CHECKLIST_ITEMS.filter(i => i.required).length;
    const completed = CHECKLIST_ITEMS.filter(i => i.required && reg.checklist[i.id]).length;
    return Math.round((completed / total) * 100);
  };

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleAddRegistration = () => {
    if (!selectedHomeState || !selectedTargetState) {
      toast.error("Please select both home and target states");
      return;
    }

    const newReg: ForeignRegistration = {
      id: Date.now().toString(),
      homeState: selectedHomeState,
      targetState: selectedTargetState,
      entityName: "New Entity",
      entityType: "LLC",
      status: "pending",
      checklist: {},
    };

    setRegistrations([...registrations, newReg]);
    setShowAddDialog(false);
    toast.success("Foreign qualification added");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-7 h-7 text-blue-500" />
              Foreign Qualification
            </h1>
            <p className="text-muted-foreground">
              Register your business to operate in other states
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Registration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Foreign Qualification</DialogTitle>
                <DialogDescription>
                  Register your entity to do business in another state
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Home State (Where entity was formed)</Label>
                  <Select value={selectedHomeState} onValueChange={setSelectedHomeState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target State (Where you want to operate)</Label>
                  <Select value={selectedTargetState} onValueChange={setSelectedTargetState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.filter(s => s.code !== selectedHomeState).map(state => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedState && (
                  <div className="p-4 bg-secondary/30 rounded-lg space-y-2">
                    <p className="font-medium">Estimated Costs for {selectedState.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Filing Fee:</span>
                      <span>${selectedState.filingFee}</span>
                      <span className="text-muted-foreground">Annual Fee:</span>
                      <span>${selectedState.annualFee}</span>
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span>{selectedState.processingDays} days</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRegistration}>
                  Add Registration
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="tracker">My Registrations</TabsTrigger>
            <TabsTrigger value="requirements">State Requirements</TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Foreign Qualification Checklist</CardTitle>
                <CardDescription>
                  Complete these steps to register your entity in another state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["preparation", "documents", "agent", "fees", "tax", "licenses"].map(category => (
                    <div key={category}>
                      <h3 className="font-semibold capitalize mb-3 flex items-center gap-2">
                        {category === "preparation" && <Search className="w-4 h-4" />}
                        {category === "documents" && <FileText className="w-4 h-4" />}
                        {category === "agent" && <User className="w-4 h-4" />}
                        {category === "fees" && <DollarSign className="w-4 h-4" />}
                        {category === "tax" && <Building className="w-4 h-4" />}
                        {category === "licenses" && <Shield className="w-4 h-4" />}
                        {category}
                      </h3>
                      <div className="space-y-2 ml-6">
                        {CHECKLIST_ITEMS.filter(item => item.category === category).map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                            <Checkbox
                              id={item.id}
                              checked={checklist[item.id] || false}
                              onCheckedChange={(checked) => handleChecklistChange(item.id, !!checked)}
                            />
                            <label htmlFor={item.id} className="text-sm flex items-center gap-2">
                              {item.label}
                              {item.required && (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracker Tab */}
          <TabsContent value="tracker" className="space-y-4">
            {registrations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No foreign qualifications yet</p>
                  <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Registration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {registrations.map(reg => (
                  <Card key={reg.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{reg.entityName}</h3>
                            {getStatusBadge(reg.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {reg.homeState} → {reg.targetState}
                            </span>
                            <span>{reg.entityType}</span>
                            {reg.registeredAgent && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {reg.registeredAgent}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{calculateProgress(reg)}%</span>
                        </div>
                        <Progress value={calculateProgress(reg)} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>State-by-State Requirements</CardTitle>
                    <CardDescription>
                      Filing fees, annual fees, and processing times
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search states..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Filing Fee</TableHead>
                      <TableHead className="text-right">Annual Fee</TableHead>
                      <TableHead className="text-right">Processing</TableHead>
                      <TableHead>Registered Agent</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStates.map(state => (
                      <TableRow key={state.code}>
                        <TableCell className="font-medium">
                          {state.name} ({state.code})
                        </TableCell>
                        <TableCell className="text-right">${state.filingFee}</TableCell>
                        <TableCell className="text-right">
                          {state.annualFee > 0 ? `$${state.annualFee}` : "None"}
                        </TableCell>
                        <TableCell className="text-right">{state.processingDays} days</TableCell>
                        <TableCell>
                          {state.requiresAgent ? (
                            <Badge variant="outline">Required</Badge>
                          ) : (
                            <span className="text-muted-foreground">Optional</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    When is Foreign Qualification Required?
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Having a physical office or employees in the state</li>
                    <li>Regularly conducting business transactions in the state</li>
                    <li>Owning or leasing real property in the state</li>
                    <li>Having a bank account in the state</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                    Consequences of Not Registering
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Inability to sue in state courts</li>
                    <li>Fines and penalties</li>
                    <li>Personal liability for owners/officers</li>
                    <li>Back taxes and fees</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
