import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Circle, 
  Building2, 
  Scale, 
  Briefcase,
  Shield,
  DollarSign,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

type EntityType = '508c1a' | 'llc' | 'media' | 'trust';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'pre_application' | 'filing' | 'post_filing' | 'maintenance';
  completed: boolean;
}

interface TrademarkClass {
  number: number;
  name: string;
  description: string;
  examples: string[];
  priority: 'high' | 'medium' | 'low';
}

const ENTITY_INFO: Record<EntityType, { name: string; icon: React.ReactNode; description: string }> = {
  '508c1a': {
    name: '508(c)(1)(a) Religious Organization',
    icon: <Shield className="w-5 h-5" />,
    description: 'Tax-exempt religious organization with specific trademark considerations'
  },
  'llc': {
    name: 'Limited Liability Company',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Business entity for commercial trademark protection'
  },
  'media': {
    name: 'Media/Entertainment Entity',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Entertainment and media company trademark requirements'
  },
  'trust': {
    name: 'Family Trust',
    icon: <Scale className="w-5 h-5" />,
    description: 'Trust entity for family asset trademark protection'
  }
};

const TRADEMARK_CLASSES: Record<EntityType, TrademarkClass[]> = {
  '508c1a': [
    { number: 41, name: 'Education & Entertainment', description: 'Educational services, religious instruction, ceremonies', examples: ['Religious education', 'Spiritual retreats', 'Worship services'], priority: 'high' },
    { number: 35, name: 'Advertising & Business', description: 'Charitable fundraising, organization management', examples: ['Charitable fundraising', 'Community organization'], priority: 'high' },
    { number: 36, name: 'Financial Services', description: 'Charitable financial services, donations', examples: ['Donation processing', 'Charitable giving'], priority: 'medium' },
    { number: 16, name: 'Paper Goods', description: 'Religious texts, educational materials', examples: ['Prayer books', 'Educational pamphlets'], priority: 'medium' }
  ],
  'llc': [
    { number: 35, name: 'Advertising & Business', description: 'Business management, consulting, retail', examples: ['Business consulting', 'Retail services', 'Marketing'], priority: 'high' },
    { number: 36, name: 'Financial Services', description: 'Financial consulting, investment services', examples: ['Financial planning', 'Investment advice'], priority: 'high' },
    { number: 42, name: 'Scientific & Tech', description: 'Software, technology services', examples: ['Software development', 'IT consulting'], priority: 'medium' },
    { number: 37, name: 'Construction', description: 'Building, construction, repair services', examples: ['Construction services', 'Property maintenance'], priority: 'medium' }
  ],
  'media': [
    { number: 41, name: 'Education & Entertainment', description: 'Entertainment services, production', examples: ['Film production', 'Music publishing', 'Live performances'], priority: 'high' },
    { number: 9, name: 'Electronics & Software', description: 'Digital media, software, recordings', examples: ['Digital downloads', 'Streaming content', 'Apps'], priority: 'high' },
    { number: 38, name: 'Telecommunications', description: 'Broadcasting, streaming services', examples: ['Broadcasting', 'Streaming platforms'], priority: 'high' },
    { number: 16, name: 'Paper Goods', description: 'Publications, printed materials', examples: ['Magazines', 'Books', 'Merchandise'], priority: 'medium' }
  ],
  'trust': [
    { number: 36, name: 'Financial Services', description: 'Trust management, estate planning', examples: ['Trust administration', 'Estate services'], priority: 'high' },
    { number: 35, name: 'Advertising & Business', description: 'Family business management', examples: ['Family office services', 'Business management'], priority: 'medium' },
    { number: 45, name: 'Legal Services', description: 'Legal and security services', examples: ['Legal consulting', 'Estate planning'], priority: 'medium' },
    { number: 41, name: 'Education & Entertainment', description: 'Family education programs', examples: ['Family education', 'Legacy programs'], priority: 'low' }
  ]
};

const getChecklistItems = (entityType: EntityType): ChecklistItem[] => {
  const baseItems: ChecklistItem[] = [
    // Pre-Application
    { id: 'pre-1', text: 'Conduct comprehensive trademark search (USPTO TESS database)', category: 'pre_application', completed: false },
    { id: 'pre-2', text: 'Search state trademark databases', category: 'pre_application', completed: false },
    { id: 'pre-3', text: 'Search common law sources (business directories, domain names)', category: 'pre_application', completed: false },
    { id: 'pre-4', text: 'Evaluate trademark strength (generic vs. distinctive)', category: 'pre_application', completed: false },
    { id: 'pre-5', text: 'Determine appropriate trademark classes', category: 'pre_application', completed: false },
    { id: 'pre-6', text: 'Prepare specimen of use (logo, product photos)', category: 'pre_application', completed: false },
    { id: 'pre-7', text: 'Document first use date in commerce', category: 'pre_application', completed: false },
    
    // Filing
    { id: 'file-1', text: 'Create USPTO account', category: 'filing', completed: false },
    { id: 'file-2', text: 'Complete TEAS Plus or TEAS Standard application', category: 'filing', completed: false },
    { id: 'file-3', text: 'Upload specimen showing mark in use', category: 'filing', completed: false },
    { id: 'file-4', text: 'Pay filing fees ($250-$350 per class)', category: 'filing', completed: false },
    { id: 'file-5', text: 'Receive serial number confirmation', category: 'filing', completed: false },
    
    // Post-Filing
    { id: 'post-1', text: 'Monitor application status (USPTO TSDR)', category: 'post_filing', completed: false },
    { id: 'post-2', text: 'Respond to Office Actions within 6 months', category: 'post_filing', completed: false },
    { id: 'post-3', text: 'Publication in Official Gazette (30-day opposition period)', category: 'post_filing', completed: false },
    { id: 'post-4', text: 'Receive registration certificate', category: 'post_filing', completed: false },
    
    // Maintenance
    { id: 'maint-1', text: 'File Section 8 Declaration (Years 5-6)', category: 'maintenance', completed: false },
    { id: 'maint-2', text: 'File Section 9 Renewal (Every 10 years)', category: 'maintenance', completed: false },
    { id: 'maint-3', text: 'Monitor for infringement', category: 'maintenance', completed: false },
    { id: 'maint-4', text: 'Maintain records of trademark use', category: 'maintenance', completed: false }
  ];

  // Add entity-specific items
  if (entityType === '508c1a') {
    baseItems.push(
      { id: 'entity-1', text: 'Document religious/charitable purpose for trademark use', category: 'pre_application', completed: false },
      { id: 'entity-2', text: 'Prepare 501(c)(3) or 508(c)(1)(a) status documentation', category: 'filing', completed: false }
    );
  } else if (entityType === 'llc') {
    baseItems.push(
      { id: 'entity-1', text: 'Verify LLC is in good standing with state', category: 'pre_application', completed: false },
      { id: 'entity-2', text: 'Confirm trademark ownership in operating agreement', category: 'pre_application', completed: false }
    );
  } else if (entityType === 'media') {
    baseItems.push(
      { id: 'entity-1', text: 'Register copyright for creative works separately', category: 'post_filing', completed: false },
      { id: 'entity-2', text: 'Consider international trademark protection (Madrid Protocol)', category: 'post_filing', completed: false }
    );
  } else if (entityType === 'trust') {
    baseItems.push(
      { id: 'entity-1', text: 'Verify trust has authority to hold trademarks', category: 'pre_application', completed: false },
      { id: 'entity-2', text: 'Document trustee authorization for trademark filing', category: 'filing', completed: false }
    );
  }

  return baseItems;
};

export default function TrademarkChecklist() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('508c1a');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(getChecklistItems('508c1a'));
  const [activeTab, setActiveTab] = useState('checklist');

  const handleEntityChange = (entity: EntityType) => {
    setSelectedEntity(entity);
    setChecklist(getChecklistItems(entity));
  };

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getProgress = (category?: ChecklistItem['category']) => {
    const items = category ? checklist.filter(i => i.category === category) : checklist;
    const completed = items.filter(i => i.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const getCategoryItems = (category: ChecklistItem['category']) => {
    return checklist.filter(i => i.category === category);
  };

  const handleDownload = () => {
    const content = `TRADEMARK APPLICATION CHECKLIST
Entity Type: ${ENTITY_INFO[selectedEntity].name}
Generated: ${new Date().toLocaleDateString()}

OVERALL PROGRESS: ${getProgress()}%

PRE-APPLICATION (${getProgress('pre_application')}%)
${getCategoryItems('pre_application').map(i => `[${i.completed ? 'X' : ' '}] ${i.text}`).join('\n')}

FILING (${getProgress('filing')}%)
${getCategoryItems('filing').map(i => `[${i.completed ? 'X' : ' '}] ${i.text}`).join('\n')}

POST-FILING (${getProgress('post_filing')}%)
${getCategoryItems('post_filing').map(i => `[${i.completed ? 'X' : ' '}] ${i.text}`).join('\n')}

MAINTENANCE (${getProgress('maintenance')}%)
${getCategoryItems('maintenance').map(i => `[${i.completed ? 'X' : ' '}] ${i.text}`).join('\n')}

RECOMMENDED TRADEMARK CLASSES:
${TRADEMARK_CLASSES[selectedEntity].map(c => `Class ${c.number}: ${c.name} (${c.priority} priority)`).join('\n')}

ESTIMATED COSTS:
- Filing Fee: $250-$350 per class
- Attorney Fees: $500-$2,000 (optional)
- Total Estimate: $750-$2,350 per class

TIMELINE:
- Application to Registration: 8-12 months (if no issues)
- Office Action Response: 6 months deadline
- Opposition Period: 30 days after publication
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trademark-checklist-${selectedEntity}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Checklist downloaded');
  };

  const renderCategorySection = (category: ChecklistItem['category'], title: string, icon: React.ReactNode) => {
    const items = getCategoryItems(category);
    const progress = getProgress(category);

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {progress}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <Checkbox 
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <label 
                  htmlFor={item.id}
                  className={`text-sm cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {item.text}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trademark Application Checklist</h1>
            <p className="text-muted-foreground">Entity-specific trademark registration guidance</p>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download Checklist
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Entity Type</CardTitle>
            <CardDescription>Choose the entity type to get customized trademark guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedEntity} onValueChange={(v) => handleEntityChange(v as EntityType)}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENTITY_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {info.icon}
                      <span>{info.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              {ENTITY_INFO[selectedEntity].description}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getProgress()}%</p>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$750-$2,350</p>
                  <p className="text-sm text-muted-foreground">Est. Cost/Class</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">8-12 mo</p>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{TRADEMARK_CLASSES[selectedEntity].length}</p>
                  <p className="text-sm text-muted-foreground">Recommended Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="classes">Trademark Classes</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              {renderCategorySection('pre_application', 'Pre-Application', <Circle className="w-5 h-5 text-blue-500" />)}
              {renderCategorySection('filing', 'Filing', <FileText className="w-5 h-5 text-orange-500" />)}
              {renderCategorySection('post_filing', 'Post-Filing', <CheckCircle2 className="w-5 h-5 text-green-500" />)}
              {renderCategorySection('maintenance', 'Maintenance', <Shield className="w-5 h-5 text-purple-500" />)}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="classes" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRADEMARK_CLASSES[selectedEntity].map(cls => (
                <Card key={cls.number}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Class {cls.number}: {cls.name}</CardTitle>
                      <Badge variant={cls.priority === 'high' ? 'default' : cls.priority === 'medium' ? 'secondary' : 'outline'}>
                        {cls.priority} priority
                      </Badge>
                    </div>
                    <CardDescription>{cls.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Examples:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {cls.examples.map((ex, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Circle className="w-2 h-2 fill-current" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Pre-Application Research (2-4 weeks)</h4>
                      <p className="text-sm text-muted-foreground">Conduct trademark searches, evaluate strength, gather specimens</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Application Filing (1-2 weeks)</h4>
                      <p className="text-sm text-muted-foreground">Complete USPTO application, pay fees, receive serial number</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Examination Period (3-6 months)</h4>
                      <p className="text-sm text-muted-foreground">USPTO examiner reviews application, may issue Office Actions</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">4</div>
                    <div>
                      <h4 className="font-semibold">Publication Period (30 days)</h4>
                      <p className="text-sm text-muted-foreground">Mark published in Official Gazette for opposition</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">5</div>
                    <div>
                      <h4 className="font-semibold">Registration (2-3 months after publication)</h4>
                      <p className="text-sm text-muted-foreground">Receive registration certificate if no opposition</p>
                    </div>
                  </div>

                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Deadlines</h4>
                          <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                            <li>• Office Action Response: 6 months from issuance</li>
                            <li>• Section 8 Declaration: Between years 5-6</li>
                            <li>• Section 9 Renewal: Every 10 years</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
