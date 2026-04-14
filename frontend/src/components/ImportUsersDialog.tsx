import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";

interface ImportUsersDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: () => void;
}

const CSV_TEMPLATE = `name,email,role,password
"John Doe","john@company.com","Sales Executive","password123"
"Jane Smith","jane@company.com","Manager","password456"`;

function parseCSV(text: string): string[][] {
  return text.trim().split("\n").map(row => row.split(",").map(c => c.trim().replace(/^"|"$/g, "")));
}

export default function ImportUsersDialog({ open, onClose, onImport }: ImportUsersDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) { setErrors(["CSV must have a header + at least 1 row"]); return; }
      const header = rows[0].map(h => h.toLowerCase());
      const nameIdx = header.indexOf("name");
      const emailIdx = header.indexOf("email");

      if (nameIdx < 0 || emailIdx < 0) { setErrors(["CSV must have Name and Email columns"]); return; }

      const errs: string[] = [];
      const parsed: any[] = [];
      rows.slice(1).forEach((row, i) => {
        const name = row[nameIdx]?.trim();
        const email = row[emailIdx]?.trim();
        if (!name || !email) { errs.push(`Row ${i + 2}: missing name/email`); return; }
        parsed.push({ name, email, role: row[header.indexOf("role")] || "Sales Executive" });
      });
      setErrors(errs);
      setPreview(parsed);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/import`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Import failed');
      }

      const result = await response.json();
      toast.success(result.message || "Users imported successfully");
      onImport();
      handleReset();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to import users");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { handleReset(); onClose(); } }}>
      <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Users from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4 mr-2" /> Download Template
          </Button>

          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload CSV file</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {e}
                </p>
              ))}
            </div>
          )}

          {preview.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-2">{preview.length} users ready to import</p>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Role</th></tr></thead>
                  <tbody>
                    {preview.slice(0, 10).map(u => (
                      <tr key={u.id} className="border-b"><td className="p-2">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2">{u.role}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { handleReset(); onClose(); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import {preview.length} Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
