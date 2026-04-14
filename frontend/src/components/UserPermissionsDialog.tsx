import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/data/sampleData";

const modules: { key: keyof User["permissions"]; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leads", label: "Leads" },
  { key: "campaigns", label: "Campaigns" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "settings", label: "Settings" },
  { key: "userManagement", label: "User Management" },
  { key: "configuration", label: "Configuration" },
];

interface UserPermissionsDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (userId: string, permissions: User["permissions"]) => void;
}

const defaultPermissions: User["permissions"] = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false,
};

export default function UserPermissionsDialog({ user, open, onClose, onSave }: UserPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<User["permissions"]>(defaultPermissions);

  useEffect(() => {
    if (!user) return;
    setPermissions(user.permissions || defaultPermissions);
  }, [user]);

  if (!user) return null;

  const handleToggle = (key: keyof User["permissions"]) => {
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    onSave(user.id, updated);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Permissions — {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">{user.role}</Badge>
            <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {modules.map(m => (
            <div key={m.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              <Label className="text-sm font-medium cursor-pointer">{m.label}</Label>
              <Checkbox
                checked={permissions[m.key] ?? false}
                onCheckedChange={() => handleToggle(m.key)}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
