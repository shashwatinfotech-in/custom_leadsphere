import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type PermissionKey = "dashboard" | "leads" | "campaigns" | "whatsapp" | "settings" | "userManagement" | "configuration";

const modules: { key: PermissionKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leads", label: "Leads" },
  { key: "campaigns", label: "Campaigns" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "settings", label: "Settings" },
  { key: "userManagement", label: "User Management" },
  { key: "configuration", label: "Configuration" },
];

const defaultPermissions: Record<PermissionKey, boolean> = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false,
};

export type RoleOption = {
  id: string | number;
  name: string;
  is_active?: boolean;
  permissions?: Record<string, boolean>;
  created_at?: string;
};

interface AddRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { id?: string | number; name: string; is_active: boolean; permissions: Record<string, boolean> }) => Promise<void> | void;
  editRole?: RoleOption | null;
}

export default function AddRoleDialog({ open, onClose, onSave, editRole }: AddRoleDialogProps) {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(defaultPermissions);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editRole) {
      setName("");
      setIsActive(true);
      setPermissions(defaultPermissions);
      return;
    }

    setName(editRole.name || "");
    setIsActive(editRole.is_active ?? true);
    setPermissions({
      ...defaultPermissions,
      ...(editRole.permissions || {}),
    });
  }, [editRole, open]);

  const isEdit = useMemo(() => Boolean(editRole), [editRole]);

  const handleToggle = (key: PermissionKey) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: editRole?.id,
        name: name.trim(),
        is_active: isActive,
        permissions,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Add New Role"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="roleName">Role Name *</Label>
            <Input
              id="roleName"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Account Executive"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <Label className="text-sm font-medium">Active</Label>
              <p className="text-xs text-muted-foreground">Inactive roles stay available for history but are hidden in filters.</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Default permissions
            </Badge>
          </div>

          <div className="space-y-1">
            {modules.map(m => (
              <div key={m.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Label className="text-sm font-medium cursor-pointer">{m.label}</Label>
                <Checkbox checked={permissions[m.key]} onCheckedChange={() => handleToggle(m.key)} />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
