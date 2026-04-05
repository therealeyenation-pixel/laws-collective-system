import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  LayoutDashboard, Plus, Settings, Trash2, Move, Maximize2, Minimize2,
  Eye, EyeOff, Copy, Download, Upload, RefreshCw, GripVertical,
  BarChart3, Activity, Bell, DollarSign, CheckSquare, Calendar,
  FileText, Users, Gift, GraduationCap, Building2, PieChart,
  TrendingUp, BarChart2, Clock, Cloud, StickyNote, Coins, Wrench,
  MoreVertical, Save, X
} from "lucide-react";
import {
  dashboardWidgetsService,
  Widget,
  WidgetInstance,
  DashboardLayout as LayoutType,
  WIDGET_CATALOG,
  WIDGET_CATEGORIES,
  WidgetCategory,
} from "@/services/dashboardWidgetsService";

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  Bell: <Bell className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  CheckSquare: <CheckSquare className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  PieChart: <PieChart className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  BarChart2: <BarChart2 className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  Cloud: <Cloud className="w-5 h-5" />,
  StickyNote: <StickyNote className="w-5 h-5" />,
  Coins: <Coins className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
};

export default function CustomDashboard() {
  const [layout, setLayout] = useState<LayoutType | null>(null);
  const [layouts, setLayouts] = useState<LayoutType[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | 'all'>('all');
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLayout(dashboardWidgetsService.getCurrentLayout());
    setLayouts(dashboardWidgetsService.getLayouts());
  };

  const handleAddWidget = (widgetId: string) => {
    const instance = dashboardWidgetsService.addWidget(widgetId);
    if (instance) {
      toast.success("Widget added to dashboard");
      loadData();
    }
  };

  const handleRemoveWidget = (instanceId: string) => {
    if (dashboardWidgetsService.removeWidget(instanceId)) {
      toast.success("Widget removed");
      loadData();
    }
  };

  const handleToggleVisibility = (instanceId: string) => {
    dashboardWidgetsService.toggleWidgetVisibility(instanceId);
    loadData();
  };

  const handleResizeWidget = (instanceId: string, delta: { width: number; height: number }) => {
    const instance = layout?.widgets.find(w => w.id === instanceId);
    if (instance) {
      dashboardWidgetsService.updateWidgetSize(instanceId, {
        width: instance.size.width + delta.width,
        height: instance.size.height + delta.height,
      });
      loadData();
    }
  };

  const handleCreateLayout = () => {
    if (newLayoutName.trim()) {
      dashboardWidgetsService.createLayout(newLayoutName);
      toast.success("Layout created");
      setNewLayoutName('');
      setShowLayoutDialog(false);
      loadData();
    }
  };

  const handleSwitchLayout = (layoutId: string) => {
    dashboardWidgetsService.setCurrentLayout(layoutId);
    loadData();
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (dashboardWidgetsService.deleteLayout(layoutId)) {
      toast.success("Layout deleted");
      loadData();
    } else {
      toast.error("Cannot delete default layout");
    }
  };

  const handleDuplicateLayout = (layoutId: string) => {
    const source = layouts.find(l => l.id === layoutId);
    if (source) {
      dashboardWidgetsService.duplicateLayout(layoutId, `${source.name} (Copy)`);
      toast.success("Layout duplicated");
      loadData();
    }
  };

  const handleExportLayout = () => {
    if (layout) {
      const json = dashboardWidgetsService.exportLayout(layout.id);
      if (json) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-layout-${layout.name}.json`;
        a.click();
        toast.success("Layout exported");
      }
    }
  };

  const getWidgetContent = (instance: WidgetInstance) => {
    const widget = WIDGET_CATALOG.find(w => w.id === instance.widgetId);
    if (!widget) return null;

    // Render placeholder content based on widget type
    switch (widget.type) {
      case 'quick_stats':
        return (
          <div className="grid grid-cols-3 gap-2 h-full">
            {['Tasks', 'Docs', 'Trans'].map((label, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold">{Math.floor(Math.random() * 50) + 10}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        );
      case 'clock':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-3xl font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm truncate">Notification {i}</span>
              </div>
            ))}
          </div>
        );
      case 'task_list':
        return (
          <div className="space-y-2">
            {['Review budget', 'Submit report', 'Team meeting', 'Update docs'].map((task, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{task}</span>
              </div>
            ))}
          </div>
        );
      case 'activity_feed':
        return (
          <div className="space-y-2">
            {['User logged in', 'Document uploaded', 'Task completed', 'Payment received'].map((act, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{act}</span>
              </div>
            ))}
          </div>
        );
      case 'financial_summary':
        return (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Income</span>
              <span className="text-green-600 font-medium">$45,230</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span className="text-red-600 font-medium">$12,450</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Balance</span>
              <span className="font-bold">$32,780</span>
            </div>
          </div>
        );
      case 'token_balance':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">1,250</p>
              <p className="text-xs text-muted-foreground">Total Tokens</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              {iconMap[widget.icon] || <LayoutDashboard className="w-8 h-8 mx-auto mb-2" />}
              <p className="text-sm">{widget.title}</p>
            </div>
          </div>
        );
    }
  };

  const filteredWidgets = selectedCategory === 'all' 
    ? WIDGET_CATALOG 
    : WIDGET_CATALOG.filter(w => w.category === selectedCategory);

  if (!layout) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Custom Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Personalize your dashboard with drag-and-drop widgets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  {layout.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {layouts.map(l => (
                  <DropdownMenuItem
                    key={l.id}
                    onClick={() => handleSwitchLayout(l.id)}
                    className={l.id === layout.id ? 'bg-muted' : ''}
                  >
                    {l.name}
                    {l.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-1">
              <Label htmlFor="edit-mode" className="text-sm">Edit Mode</Label>
              <Switch
                id="edit-mode"
                checked={editMode}
                onCheckedChange={setEditMode}
              />
            </div>

            {editMode && (
              <>
                <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Widget
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Widget</DialogTitle>
                      <DialogDescription>
                        Choose a widget to add to your dashboard
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        {Object.entries(WIDGET_CATEGORIES).map(([key, cat]) => (
                          <TabsTrigger key={key} value={key}>{cat.name}</TabsTrigger>
                        ))}
                      </TabsList>
                      <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-2 gap-3 pr-4">
                          {filteredWidgets.map(widget => (
                            <Card
                              key={widget.id}
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => {
                                handleAddWidget(widget.id);
                                setShowAddWidget(false);
                              }}
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-muted rounded-lg">
                                    {iconMap[widget.icon] || <LayoutDashboard className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{widget.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {widget.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {widget.defaultSize.width}x{widget.defaultSize.height}
                                      </Badge>
                                      {widget.configurable && (
                                        <Badge variant="secondary" className="text-xs">
                                          Configurable
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowLayoutDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateLayout(layout.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Layout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportLayout}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Layout
                    </DropdownMenuItem>
                    {!layout.isDefault && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteLayout(layout.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Layout
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>

        {/* Widget Grid */}
        <div 
          className="grid gap-4"
          style={{ 
            gridTemplateColumns: `repeat(${layout.gridColumns}, 1fr)`,
            minHeight: '600px',
          }}
        >
          {layout.widgets.filter(w => w.isVisible).map(instance => {
            const widget = WIDGET_CATALOG.find(w => w.id === instance.widgetId);
            if (!widget) return null;

            return (
              <Card
                key={instance.id}
                className={`relative transition-all ${editMode ? 'ring-2 ring-dashed ring-muted-foreground/30' : ''}`}
                style={{
                  gridColumn: `span ${instance.size.width}`,
                  gridRow: `span ${instance.size.height}`,
                }}
              >
                {editMode && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleResizeWidget(instance.id, { width: -1, height: 0 })}
                      disabled={instance.size.width <= widget.minSize.width}
                    >
                      <Minimize2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleResizeWidget(instance.id, { width: 1, height: 0 })}
                      disabled={instance.size.width >= widget.maxSize.width}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleToggleVisibility(instance.id)}
                    >
                      <EyeOff className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-red-600"
                      onClick={() => handleRemoveWidget(instance.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    )}
                    <div className="p-1.5 bg-muted rounded">
                      {iconMap[widget.icon] || <LayoutDashboard className="w-4 h-4" />}
                    </div>
                    <CardTitle className="text-sm">{widget.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {getWidgetContent(instance)}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hidden Widgets */}
        {editMode && layout.widgets.some(w => !w.isVisible) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hidden Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {layout.widgets.filter(w => !w.isVisible).map(instance => {
                  const widget = WIDGET_CATALOG.find(w => w.id === instance.widgetId);
                  if (!widget) return null;
                  return (
                    <Badge
                      key={instance.id}
                      variant="secondary"
                      className="cursor-pointer gap-2"
                      onClick={() => handleToggleVisibility(instance.id)}
                    >
                      <Eye className="w-3 h-3" />
                      {widget.title}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Layout Dialog */}
        <Dialog open={showLayoutDialog} onOpenChange={setShowLayoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Layout</DialogTitle>
              <DialogDescription>
                Create a new dashboard layout to organize your widgets
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Layout Name</Label>
              <Input
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="My Custom Dashboard"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLayoutDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLayout}>Create Layout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
