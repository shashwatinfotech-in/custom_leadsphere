import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import AddRoleDialog from "@/components/AddRoleDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [open, setOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canManage = String(currentUser.role || "").toLowerCase() === "company_admin";

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await api("/roles?include_inactive=true");
      setRoles(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSave = async (payload) => {
    if (!canManage) {
      toast.error("Only company admins can manage roles");
      return;
    }

    try {
      if (payload.id) {
        await api(`/roles/${payload.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: payload.name,
            is_active: payload.is_active,
            permissions: payload.permissions,
          }),
        });
        toast.success("Role updated");
      } else {
        await api("/roles", {
          method: "POST",
          body: JSON.stringify({
            name: payload.name,
            is_active: payload.is_active,
            permissions: payload.permissions,
          }),
        });
        toast.success("Role created");
      }
      setOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.message || "Failed to save role");
    }
  };

  const toggleActive = async (role, nextValue) => {
    try {
      await api(`/roles/${role.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: nextValue }),
      });
      toast.success(nextValue ? "Role activated" : "Role deactivated");
      fetchRoles();
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const handleDelete = async (role) => {
    if (!confirm("Delete this role?")) return;
    try {
      await api(`/roles/${role.id}`, { method: "DELETE" });
      toast.success("Role deleted");
      fetchRoles();
    } catch (err) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Roles Master</h2>
          <p className="text-sm text-muted-foreground">Manage default permissions for each role.</p>
        </div>
        {canManage && (
          <Button onClick={() => { setEditingRole(null); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Role
          </Button>
        )}
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
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Permissions</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-sm">{role.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={role.is_active} onCheckedChange={(v) => toggleActive(role, Boolean(v))} disabled={!canManage} />
                      <span className="text-sm">{role.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {Object.values(role.permissions || {}).filter(Boolean).length} enabled
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingRole(role); setOpen(true); }} disabled={!canManage}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(role)} disabled={!canManage}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No roles found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AddRoleDialog
        open={open}
        onClose={() => { setOpen(false); setEditingRole(null); }}
        onSave={handleSave}
        editRole={editingRole}
      />
    </div>
  );
}
