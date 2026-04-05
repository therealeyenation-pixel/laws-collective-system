import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Plus, 
  Save, 
  Trash2, 
  Users, 
  Lock,
  Eye,
  Edit,
  FileText,
  Check,
  X,
  Copy,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { 
  permissionMatrixService, 
  PermissionSet, 
  Permission,
  PermissionResource,
  PermissionAction,
  UserPermissions
} from "@/services/permissionMatrixService";

export default function PermissionMatrixPage() {
  const [permissionSets, setPermissionSets] = useState<PermissionSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<PermissionSet | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");

  const resources = permissionMatrixService.getResources();
  const actions = permissionMatrixService.getActions();

  useEffect(() => {
    loadPermissionSets();
  }, []);

  const loadPermissionSets = () => {
    const sets = permissionMatrixService.getPermissionSets();
    setPermissionSets(sets);
    if (sets.length > 0 && !selectedSet) {
      setSelectedSet(sets[0]);
    }
  };

  const loadUserPermissions = (userId: string) => {
    if (!userId) return;
    const perms = permissionMatrixService.getUserPermissions(userId);
    setUserPermissions(perms);
  };

  const handleCreateSet = () => {
    if (!newSetName.trim()) {
      toast.error("Please enter a name for the permission set");
      return;
    }

    const newSet = permissionMatrixService.createPermissionSet({
      name: newSetName,
      description: newSetDescription,
      permissions: []
    });

    setPermissionSets([...permissionSets, newSet]);
    setSelectedSet(newSet);
    setIsCreateDialogOpen(false);
    setNewSetName("");
    setNewSetDescription("");
    toast.success("Permission set created");
  };

  const handleDeleteSet = (setId: string) => {
    const set = permissionSets.find(s => s.id === setId);
    if (set?.isSystem) {
      toast.error("Cannot delete system permission sets");
      return;
    }

    if (permissionMatrixService.deletePermissionSet(setId)) {
      setPermissionSets(permissionSets.filter(s => s.id !== setId));
      if (selectedSet?.id === setId) {
        setSelectedSet(permissionSets[0] || null);
      }
      toast.success("Permission set deleted");
    }
  };

  const handleTogglePermission = (resource: PermissionResource, action: PermissionAction) => {
    if (!selectedSet || selectedSet.isSystem) {
      toast.error("Cannot modify system permission sets");
      return;
    }

    const existingPerm = selectedSet.permissions.find(
      p => p.resource === resource && p.action === action
    );

    let updatedPermissions: Permission[];
    if (existingPerm) {
      updatedPermissions = selectedSet.permissions.map(p =>
        p.resource === resource && p.action === action
          ? { ...p, granted: !p.granted }
          : p
      );
    } else {
      updatedPermissions = [
        ...selectedSet.permissions,
        { resource, action, granted: true }
      ];
    }

    const updated = permissionMatrixService.updatePermissionSet(selectedSet.id, {
      permissions: updatedPermissions
    });

    if (updated) {
      setSelectedSet(updated);
      setPermissionSets(permissionSets.map(s => s.id === updated.id ? updated : s));
    }
  };

  const isPermissionGranted = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!selectedSet) return false;
    const perm = selectedSet.permissions.find(
      p => p.resource === resource && p.action === action
    );
    return perm?.granted || false;
  };

  const handleAssignSetToUser = (setId: string) => {
    if (!userPermissions) return;

    const currentSets = userPermissions.permissionSetIds;
    const updatedSets = currentSets.includes(setId)
      ? currentSets.filter(id => id !== setId)
      : [...currentSets, setId];

    const updated = permissionMatrixService.updateUserPermissions(userPermissions.userId, {
      permissionSetIds: updatedSets
    });

    setUserPermissions(updated);
    toast.success(currentSets.includes(setId) ? "Permission set removed" : "Permission set assigned");
  };

  const getActionIcon = (action: PermissionAction) => {
    switch (action) {
      case 'view': return <Eye className="w-3 h-3" />;
      case 'create': return <Plus className="w-3 h-3" />;
      case 'edit': return <Edit className="w-3 h-3" />;
      case 'delete': return <Trash2 className="w-3 h-3" />;
      case 'approve': return <Check className="w-3 h-3" />;
      case 'export': return <FileText className="w-3 h-3" />;
      case 'admin': return <Shield className="w-3 h-3" />;
      default: return null;
    }
  };

  const filteredSets = permissionSets.filter(set =>
    set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Permission Matrix</h1>
            <p className="text-muted-foreground mt-1">
              Manage granular permissions and access control
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Permission Set
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Permission Set</DialogTitle>
                <DialogDescription>
                  Create a new custom permission set for your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    placeholder="e.g., Marketing Team"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    placeholder="e.g., Access for marketing department"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSet}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="sets">
          <TabsList>
            <TabsTrigger value="sets">
              <Lock className="w-4 h-4 mr-2" />
              Permission Sets
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              User Permissions
            </TabsTrigger>
          </TabsList>

          {/* Permission Sets Tab */}
          <TabsContent value="sets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sets List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Permission Sets</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {filteredSets.map((set) => (
                        <div
                          key={set.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedSet?.id === set.id
                              ? 'bg-primary/10 border border-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                          onClick={() => setSelectedSet(set)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{set.name}</span>
                            {set.isSystem && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {set.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {set.permissions.filter(p => p.granted).length} permissions
                            </Badge>
                            {!set.isSystem && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSet(set.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Permission Matrix */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedSet?.name || 'Select a Permission Set'}</CardTitle>
                      <CardDescription>{selectedSet?.description}</CardDescription>
                    </div>
                    {selectedSet?.isSystem && (
                      <Badge variant="secondary">Read Only</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedSet ? (
                    <ScrollArea className="h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[150px]">Resource</TableHead>
                            {actions.map((action) => (
                              <TableHead key={action} className="text-center w-[80px]">
                                <div className="flex flex-col items-center gap-1">
                                  {getActionIcon(action)}
                                  <span className="text-xs capitalize">{action}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {resources.map((resource) => (
                            <TableRow key={resource}>
                              <TableCell className="font-medium capitalize">
                                {resource.replace(/_/g, ' ')}
                              </TableCell>
                              {actions.map((action) => (
                                <TableCell key={action} className="text-center">
                                  <Checkbox
                                    checked={isPermissionGranted(resource, action)}
                                    onCheckedChange={() => handleTogglePermission(resource, action)}
                                    disabled={selectedSet.isSystem}
                                  />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      Select a permission set to view or edit
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Permissions Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Permission Assignment</CardTitle>
                <CardDescription>
                  Assign permission sets to specific users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>User ID</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        placeholder="Enter user ID"
                      />
                      <Button onClick={() => loadUserPermissions(selectedUserId)}>
                        Load
                      </Button>
                    </div>
                  </div>
                </div>

                {userPermissions && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">User: {userPermissions.userId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Role: {userPermissions.role}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Assigned Permission Sets</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {permissionSets.map((set) => (
                          <div
                            key={set.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              userPermissions.permissionSetIds.includes(set.id)
                                ? 'bg-primary/10 border-primary'
                                : 'bg-muted/30 hover:bg-muted/50'
                            }`}
                            onClick={() => handleAssignSetToUser(set.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={userPermissions.permissionSetIds.includes(set.id)}
                                className="pointer-events-none"
                              />
                              <span className="text-sm font-medium">{set.name}</span>
                            </div>
                            {set.isSystem && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                System
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Effective Permissions Preview */}
                    <div className="pt-4 border-t">
                      <Label className="mb-2 block">Effective Permissions Preview</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {permissionMatrixService.getPermissionMatrix(userPermissions.userId).map(({ resource, permissions }) => {
                          const grantedCount = Object.values(permissions).filter(Boolean).length;
                          if (grantedCount === 0) return null;
                          return (
                            <div key={resource} className="p-2 bg-muted/50 rounded text-sm">
                              <div className="font-medium capitalize">{resource}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(permissions).map(([action, granted]) => 
                                  granted && (
                                    <Badge key={action} variant="outline" className="text-xs">
                                      {action}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
