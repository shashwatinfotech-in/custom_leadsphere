import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Upload, Shield, Loader2 } from "lucide-react";
import AddUserDialog from "@/components/AddUserDialog";
import ImportUsersDialog from "@/components/ImportUsersDialog";
import UserPermissionsDialog from "@/components/UserPermissionsDialog";
import type { RoleOption } from "@/components/AddUserDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";

const defaultPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false,
};

const normalizePermissions = (user: any) => {
  if (user.permissions && typeof user.permissions === "object") {
    return user.permissions;
  }

  const role = (user.role || "").toLowerCase();
  if (role === "admin" || role === "superadmin" || role === "super_admin") {
    return {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: true,
      configuration: true,
    };
  }

  if (role === "manager") {
    return {
      ...defaultPermissions,
      settings: true,
    };
  }

  return defaultPermissions;
};

export default function UserManagementPage() {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [permUser, setPermUser] = useState<any | null>(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = String(currentUser.role || "").toLowerCase() === "superadmin";

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api("/users");
      setAllUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await api("/roles");
      const visibleRoles = (data || []).filter((role: RoleOption) => isSuperAdmin || role.key !== "superadmin");
      setRoles(visibleRoles);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch roles");
    }
  };

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      
      const dbRole = u.role?.toLowerCase();
      const matchRole = roleFilter === "all" || dbRole === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allUsers, search, roleFilter]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: !currentStatus }),
      });
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: !currentStatus } : u));
      toast.success("User status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleAddUser = () => {
    fetchUsers();
    setAddOpen(false);
  };
  
  const handleImportUsers = () => {
    fetchUsers();
    setImportOpen(false);
  };
  
  const handleSavePermissions = (userId: string, permissions: any) => {
    api(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    })
      .then((updated) => {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: updated.permissions ?? permissions } : u));
        setPermUser(null);
        toast.success("Permissions updated");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "Failed to save permissions");
      });
  };

  const getRoleLabel = (role: string) => {
    if (!role) return "User";
    const match = roles.find(r => r.key === role);
    if (match) return match.label;
    const fallback: Record<string, string> = {
      admin: "Manager",
      superadmin: "Super Admin",
      manager: "Team Manager",
      user: "Sales Executive"
    };
    return fallback[role.toLowerCase()] || role;
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/export`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Failed to export users");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{allUsers.length} total users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Upload className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 text-sm" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role.key} value={role.key}>{role.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Last Login</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Permissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell id={`user-name-${user.id}`}>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                  </TableCell>
                  <TableCell id={`user-email-${user.id}`} className="text-sm">{user.email}</TableCell>
                  <TableCell id={`user-role-${user.id}`}>
                    <Badge variant="outline" className="text-xs">{getRoleLabel(user.role)}</Badge>
                  </TableCell>
                  <TableCell id={`user-status-cell-${user.id}`}>
                    <div className="flex items-center gap-2">
                      <Switch id={`user-status-${user.id}`} checked={user.status} onCheckedChange={() => toggleActive(user.id, user.status)} />
                      <span className={`text-xs font-medium ${user.status ? "text-success" : "text-muted-foreground"}`}>
                        {user.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell id={`user-login-${user.id}`} className="text-sm text-muted-foreground">{user.last_login || "-"}</TableCell>
                  <TableCell id={`user-actions-${user.id}`}>
                    <Button variant="ghost" size="sm" onClick={() => setPermUser(user)}>
                      <Shield className="w-4 h-4 mr-1" /> Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAddUser} roles={roles} />
      <ImportUsersDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportUsers} />
      <UserPermissionsDialog
        user={permUser ? { ...permUser, permissions: normalizePermissions(permUser) } : null}
        open={!!permUser}
        onClose={() => setPermUser(null)}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
