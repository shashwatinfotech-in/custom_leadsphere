import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export interface RoleOption {
  id?: string;
  key: string;
  label: string;
  permissions?: Record<string, boolean>;
  is_system?: boolean;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  roles: RoleOption[];
}

export default function AddUserDialog({ open, onClose, onSave, roles }: AddUserDialogProps) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roles.length === 0) return;
    setForm(prev => prev.role ? prev : { ...prev, role: roles[0].key });
  }, [roles]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Name, Email, and Password are required.");
      return;
    }
    
    setLoading(true);
    try {
      await api("/users", {
        method: "POST",
        body: JSON.stringify(form)
      });
      
      toast.success(`${form.name} has been added.`);
      onSave();
      setForm({ name: "", email: "", password: "", role: "Sales Executive" });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="userName">Full Name *</Label>
            <Input id="userName" value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="userEmail">Email *</Label>
            <Input id="userEmail" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@company.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="userPassword">Password *</Label>
            <Input id="userPassword" type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min 8 characters" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={v => update("role", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map(r => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
