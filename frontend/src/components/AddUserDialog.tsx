import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useCityContext } from "@/contexts/CityContext";
import UserForm from "@/components/users/UserForm";

export interface RoleOption {
  id: string | number;
  name: string;
  is_active?: boolean;
  permissions?: Record<string, boolean>;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  roles: RoleOption[];
}

export default function AddUserDialog({ open, onClose, onSave, roles }: AddUserDialogProps) {
  const { cities } = useCityContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
    city_id: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roles.length === 0) return;
    setForm(prev => prev.role_id ? prev : { ...prev, role_id: String(roles.find(role => role.is_active !== false)?.id || roles[0].id) });
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
        body: JSON.stringify({
          ...form,
          role_id: form.role_id || null,
          city_id: form.city_id || null,
        })
      });

      toast.success(`${form.name} has been added.`);
      onSave();
      setForm({ name: "", email: "", password: "", role_id: String(roles[0]?.id || ""), city_id: "" });
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

        <UserForm form={form} onChange={update} roles={roles} cities={cities} />

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
