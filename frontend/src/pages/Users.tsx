import { useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Upload, Shield, Loader2 } from "lucide-react";
import AddUserDialog, { RoleOption } from "@/components/AddUserDialog";
import ImportUsersDialog from "@/components/ImportUsersDialog";
import ManageUserModal from "@/components/users/ManageUserModal";
import { useCityContext } from "@/contexts/CityContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function UsersPage() {
  const { cities, refreshCities } = useCityContext();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [manageUser, setManageUser] = useState<any | null>(null);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canManage = String(currentUser.role || "").toLowerCase() === "company_admin";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role_id", roleFilter);
      if (cityFilter !== "all") params.set("city_id", cityFilter);
      const query = params.toString();
      const data = await api(`/users${query ? `?${query}` : ""}`);
      setAllUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await api("/roles?include_inactive=true");
      setRoles(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchRoles();
    refreshCities();
  }, [refreshCities]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, cityFilter]);

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      const matchSearch =
        !search ||
        String(u.name || "").toLowerCase().includes(search.toLowerCase()) ||
        String(u.email || "").toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [allUsers, search]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: !currentStatus, is_active: !currentStatus } : u));
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

  const handleUserSaved = (updated: any) => {
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setManageUser(null);
    fetchUsers();
  };

  const getRoleLabel = (user: any) => {
    if (user.role_name) return user.role_name;
    if (user.role) return user.role;
    const match = roles.find(r => String(r.id) === String(user.role_id));
    return match?.name || "User";
  };

  const getCityName = (user: any) => {
    if (user.city_name) return user.city_name;
    if (!user.city_id) return "-";
    const match = cities.find(city => String(city.id) === String(user.city_id));
    return match?.name || "-";
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/export`, {
        headers: {
          Authorization: `Bearer ${token}`
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
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{allUsers.length} total users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Upload className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)} disabled={!canManage}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 text-sm" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.filter(role => role.is_active !== false).map(role => (
              <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.filter(city => city.is_active).map(city => (
              <SelectItem key={city.id} value={String(city.id)}>{city.name}</SelectItem>
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
                <TableHead className="text-xs font-semibold uppercase tracking-wider">City</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user.id}>
                  <TableCell id={`user-name-${user.id}`}>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{String(user.id).slice(0, 8)}...</p>
                  </TableCell>
                  <TableCell id={`user-email-${user.id}`} className="text-sm">{user.email}</TableCell>
                  <TableCell id={`user-role-${user.id}`}>
                    <Badge variant="outline" className="text-xs">{getRoleLabel(user)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm" id={`user-city-${user.id}`}>
                    {getCityName(user)}
                  </TableCell>
                  <TableCell id={`user-actions-${user.id}`}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`user-status-${user.id}`}
                          checked={Boolean(user.status ?? user.is_active)}
                          onCheckedChange={() => toggleActive(user.id, Boolean(user.status ?? user.is_active))}
                        />
                        <span className={`text-xs font-medium ${user.status ?? user.is_active ? "text-success" : "text-muted-foreground"}`}>
                          {user.status ?? user.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setManageUser(user)} disabled={!canManage}>
                        <Shield className="w-4 h-4 mr-1" /> Manage
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AddUserDialog open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAddUser} roles={roles} />
      <ImportUsersDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportUsers} />
      <ManageUserModal
        user={manageUser}
        open={!!manageUser}
        onClose={() => setManageUser(null)}
        onSaved={handleUserSaved}
        roles={roles}
        cities={cities}
      />
    </div>
  );
}
