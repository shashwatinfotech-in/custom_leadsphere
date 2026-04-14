import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "@/data/sampleData";
import { api } from "@/lib/api";

interface ImportLeadsDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: () => void;
}

const CSV_TEMPLATE = `name,email,phone,company,source
"John Doe","john@abc.com","+91 98765 43210","ABC Corp","Website"
"Jane Smith","jane@xyz.edu","+91 91234 56789","XYZ School","Referral"`;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  for (const line of lines) {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

const validStatuses: LeadStatus[] = ["New", "Contacted", "Interested", "Qualified", "Proposal", "Won", "Lost"];

export default function ImportLeadsDialog({ open, onClose, onImport }: ImportLeadsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setErrors(["File is empty or has no data rows."]);
        setPreview([]);
        return;
      }
      const header = rows[0].map(h => h.toLowerCase().replace(/\s+/g, ""));
      const dataRows = rows.slice(1);
      const errs: string[] = [];
      const leads: any[] = [];

      const getIdx = (name: string) => header.indexOf(name.toLowerCase());
      const nameIdx = getIdx("name") !== -1 ? getIdx("name") : getIdx("contactperson");
      const emailIdx = getIdx("email");

      if (nameIdx === -1 || emailIdx === -1) {
        setErrors(["CSV must have columns: name (or contactPerson), email"]);
        setPreview([]);
        return;
      }

      dataRows.forEach((row, i) => {
        const name = row[nameIdx]?.trim();
        const email = row[emailIdx]?.trim();
        if (!name || !email) {
          errs.push(`Row ${i + 2}: Missing required fields`);
          return;
        }

        leads.push({
          name,
          email,
          phone: row[getIdx("phone")]?.trim() || "",
          company: row[getIdx("company")]?.trim() || row[getIdx("companyname")]?.trim() || "",
          source: row[getIdx("source")]?.trim() || "CSV Import",
        });
      });

      setErrors(errs);
      setPreview(leads);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using fetch directly because 'api' helper handles JSON body by default
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/imports`, {
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
      toast.success(result.message || "Leads imported successfully");
      onImport();
      handleReset();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to import leads");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setErrors([]);
    setIsImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { handleReset(); onClose(); } }}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Import Leads from CSV
          </DialogTitle>
          <DialogDescription>Upload a CSV file to bulk import leads into the system.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Download Template */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="w-4 h-4" />
              <span>Need the right format?</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Template
            </Button>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            {file ? (
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-sm">Click to upload CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files</p>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {e}
                </p>
              ))}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle className="w-4 h-4" /> {preview.length} leads ready to import
              </div>
              <div className="rounded-lg border overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-semibold">Company</th>
                      <th className="text-left p-2 font-semibold">Contact</th>
                      <th className="text-left p-2 font-semibold">Email</th>
                      <th className="text-left p-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((l, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="p-2">{l.company}</td>
                        <td className="p-2">{l.name}</td>
                        <td className="p-2 text-muted-foreground">{l.email}</td>
                        <td className="p-2">New</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { handleReset(); onClose(); }} disabled={isImporting}>Cancel</Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import {preview.length > 0 ? `${preview.length} Leads` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
