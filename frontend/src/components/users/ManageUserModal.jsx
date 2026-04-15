import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const modules = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leads", label: "Leads" },
  { key: "campaigns", label: "Campaigns" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "settings", label: "Settings" },
  { key: "userManagement", label: "User Management" },
  { key: "configuration", label: "Configuration" },
];

const defaultPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false,
};

export default function ManageUserModal({ user, open, onClose, onSaved, roles, cities }) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(defaultPermissions);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentRole = useMemo(() => roles.find(role => String(role.id) === String(selectedRoleId)), [roles, selectedRoleId]);

  useEffect(() => {
    if (!user) return;

    setSelectedRoleId(user.role_id ? String(user.role_id) : "");
    setSelectedCityId(user.city_id ? String(user.city_id) : "");
    setSelectedPermissions({
      ...defaultPermissions,
      ...(user.permissions || {}),
    });
    setIsActive(user.status ?? user.is_active ?? true);
  }, [user, open]);

  useEffect(() => {
    if (!currentRole || !currentRole.permissions) return;
    setSelectedPermissions(prev => ({
      ...defaultPermissions,
      ...currentRole.permissions,
      ...prev,
    }));
  }, [currentRole]);

  if (!user) return null;

  const togglePermission = (permission) => {
    setSelectedPermissions(prev =>
      prev[permission]
        ? { ...prev, [permission]: false }
        : { ...prev, [permission]: true }
    );
  };

  const handleSaveUser = async () => {
    setSaving(true);
    try {
      const response = await api(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          role_id: selectedRoleId || null,
          city_id: selectedCityId || null,
          permissions: selectedPermissions,
          is_active: isActive,
        }),
      });

      toast.success("User updated");
      onSaved(response);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Manage User - {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{user.role_name || user.role || "User"}</Badge>
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.is_active !== false).map(role => (
                    <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No City</SelectItem>
                  {cities.filter(city => city.is_active).map(city => (
                    <SelectItem key={city.id} value={String(city.id)}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <Label className="text-sm font-medium">Account status</Label>
              <p className="text-xs text-muted-foreground">Toggle whether this user can sign in.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Permissions</Label>
            <div className="space-y-1">
              {modules.map(module => (
                <div key={module.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Label className="text-sm font-medium cursor-pointer">{module.label}</Label>
                  <Checkbox checked={Boolean(selectedPermissions[module.key])} onCheckedChange={() => togglePermission(module.key)} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSaveUser} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
