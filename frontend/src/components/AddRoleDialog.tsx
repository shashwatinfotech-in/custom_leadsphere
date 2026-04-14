import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { RoleOption } from "@/components/AddUserDialog";

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

const defaultPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false,
};

interface AddRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { key?: string; label: string; permissions: Record<string, boolean>; id?: string }) => Promise<void> | void;
  editRole?: RoleOption | null;
}

export default function AddRoleDialog({ open, onClose, onSave, editRole }: AddRoleDialogProps) {
  const [label, setLabel] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>(defaultPermissions);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editRole) {
      setLabel("");
      setPermissions(defaultPermissions);
      return;
    }

    setLabel(editRole.label || "");
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
    if (!label.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: editRole?.id,
        key: editRole?.key,
        label: label.trim(),
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
            <Label htmlFor="roleLabel">Role Name *</Label>
            <Input
              id="roleLabel"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Account Executive"
              disabled={isEdit && editRole?.is_system}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {isEdit ? "Editing role defaults" : "Default permissions"}
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
          <Button onClick={handleSave} disabled={saving || !label.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Role" : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
