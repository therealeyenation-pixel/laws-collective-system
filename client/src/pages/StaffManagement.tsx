import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Users, Shield, Crown, UserCog, Search, RefreshCw } from "lucide-react";

const roleBadgeStyles: Record<string, string> = {
  owner: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  user: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200",
};

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="w-3.5 h-3.5" />,
  admin: <Shield className="w-3.5 h-3.5" />,
  staff: <UserCog className="w-3.5 h-3.5" />,
  user: <Users className="w-3.5 h-3.5" />,
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  user: "Member",
};

export default function StaffManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: users, isLoading, refetch } = trpc.adminUsers.list.useQuery();
  const updateRole = trpc.adminUsers.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to update role: ${err.message}`);
    },
  });

  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleCounts = users?.reduce(
    (acc, u) => {
      acc[u.role || "user"] = (acc[u.role || "user"] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleRoleChange = (userId: number, newRole: string, currentRole: string) => {
    if (currentRole === "owner") {
      toast.error("Cannot change the owner's role");
      return;
    }
    if (newRole === "owner") {
      toast.error("Cannot assign owner role. There can only be one owner.");
      return;
    }
    updateRole.mutate({ userId, role: newRole as "user" | "staff" | "admin" | "owner" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff & Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and access levels across the system
          </p>
        </div>

        {/* Role Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["owner", "admin", "staff", "user"] as const).map((role) => (
            <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{roleLabels[role]}s</p>
                    <p className="text-2xl font-bold mt-1">{roleCounts?.[role] || 0}</p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${roleBadgeStyles[role]}`}>
                    {roleIcons[role]}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>{users?.length || 0} total users in the system</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Filter role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">Member</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 ${roleBadgeStyles[u.role || "user"]}`}>
                            {roleIcons[u.role || "user"]}
                            {roleLabels[u.role || "user"]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.role === "owner" ? (
                            <span className="text-xs text-muted-foreground italic">Protected</span>
                          ) : (
                            <Select
                              value={u.role || "user"}
                              onValueChange={(val) => handleRoleChange(u.id, val, u.role || "user")}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Member</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Level Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Access Level Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`gap-1 ${roleBadgeStyles.owner}`}>
                    <Crown className="w-3 h-3" /> Owner
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Full system access. CALEA Trust, governance, and all admin functions.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`gap-1 ${roleBadgeStyles.admin}`}>
                    <Shield className="w-3 h-3" /> Admin
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">CALEA Trust access, entity management, compliance, and staff oversight.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`gap-1 ${roleBadgeStyles.staff}`}>
                    <UserCog className="w-3 h-3" /> Staff
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Department dashboards, team management, documents, and simulators.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`gap-1 ${roleBadgeStyles.user}`}>
                    <Users className="w-3 h-3" /> Member
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">AWS dashboard, academy, games, business tools, and personal features.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
