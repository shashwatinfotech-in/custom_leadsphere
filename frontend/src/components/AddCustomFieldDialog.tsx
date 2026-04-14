import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { CustomField, CustomFieldType } from "@/data/customFieldsData";
import { api } from "@/lib/api";

const fieldTypes: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text (String)" },
  { value: "number", label: "Number" },
  { value: "integer", label: "Integer" },
  { value: "dropdown", label: "Dropdown" },
  { value: "dependent_dropdown", label: "Dependent Dropdown" },
];

interface AddCustomFieldDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: CustomField) => void;
  existingFields: CustomField[];
  editField?: CustomField | null;
}

export default function AddCustomFieldDialog({ open, onClose, onSave, existingFields, editField }: AddCustomFieldDialogProps) {
  const [label, setLabel] = useState(editField?.label || "");
  const [type, setType] = useState<CustomFieldType>(editField?.type || "text");
  const [required, setRequired] = useState(editField?.required || false);
  const [options, setOptions] = useState<string[]>(editField?.options || [""]);
  const [parentFieldId, setParentFieldId] = useState(editField?.parentFieldId || "");
  const [depOptions, setDepOptions] = useState<Record<string, string[]>>(editField?.dependentOptions || {});
  const [depKey, setDepKey] = useState("");
  const [depValues, setDepValues] = useState("");

  const dropdownFields = existingFields.filter(f => f.type === "dropdown" || (f as any).field_type === "dropdown");
  const parentField = dropdownFields.find(f => f.id === parentFieldId);

  useEffect(() => {
    if (editField) {
      setLabel(editField.label || (editField as any).field_name || "");
      setType((editField.type || (editField as any).field_type) as CustomFieldType || "text");
      setRequired(editField.required || false);
    } else {
      setLabel("");
      setType("text");
      setRequired(false);
    }
  }, [editField, open]);

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) {
      toast.error("Label required");
      return;
    }
    
    setLoading(true);
    try {
      const url = editField ? `/custom-fields/${editField.id}` : "/custom-fields";
      const method = editField ? "PUT" : "POST";

      await api(url, {
        method,
        body: JSON.stringify({
          field_name: label.trim(),
          field_type: type,
        }),
      });
      
      toast.success(editField ? "Field updated" : "Field created");
      onSave({} as any);
      resetAndClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save field");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setLabel(""); setType("text"); setRequired(false); setOptions([""]); setParentFieldId(""); setDepOptions({}); setDepKey(""); setDepValues("");
    onClose();
  };

  const addDepMapping = () => {
    if (!depKey.trim() || !depValues.trim()) return;
    setDepOptions(prev => ({ ...prev, [depKey.trim()]: depValues.split(",").map(v => v.trim()).filter(Boolean) }));
    setDepKey(""); setDepValues("");
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && resetAndClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editField ? "Edit" : "Add"} Custom Field</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label>Field Label *</Label>
            <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Budget Range" />
          </div>
          <div className="space-y-1.5">
            <Label>Field Type</Label>
            <Select value={type} onValueChange={v => setType(v as CustomFieldType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {fieldTypes.map(ft => <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Required</Label>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>

          {type === "dropdown" && (
            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                    placeholder={`Option ${i + 1}`}
                    className="text-sm"
                  />
                  {options.length > 1 && (
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setOptions(options.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setOptions([...options, ""])}>
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            </div>
          )}

          {type === "dependent_dropdown" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Parent Field</Label>
                <Select value={parentFieldId} onValueChange={setParentFieldId}>
                  <SelectTrigger><SelectValue placeholder="Select parent dropdown" /></SelectTrigger>
                  <SelectContent>
                    {dropdownFields.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
                    <SelectItem value="cf-city">City (Built-in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {parentFieldId && (
                <div className="space-y-2">
                  <Label>Dependent Options Mapping</Label>
                  <p className="text-xs text-muted-foreground">Map each parent value to a comma-separated list of child options.</p>

                  {parentField && parentField.options?.map(pv => (
                    <div key={pv} className="text-xs p-2 bg-muted/50 rounded">
                      <span className="font-medium">{pv}:</span> {depOptions[pv]?.join(", ") || <span className="text-muted-foreground">not mapped</span>}
                    </div>
                  ))}

                  {Object.entries(depOptions).map(([k, v]) => (
                    <div key={k} className="text-xs p-2 bg-muted/50 rounded flex justify-between items-center">
                      <span><span className="font-medium">{k}:</span> {v.join(", ")}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { const d = { ...depOptions }; delete d[k]; setDepOptions(d); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input value={depKey} onChange={e => setDepKey(e.target.value)} placeholder="Parent value" className="text-sm" />
                    <Input value={depValues} onChange={e => setDepValues(e.target.value)} placeholder="Child options (comma sep)" className="text-sm" />
                    <Button variant="outline" size="sm" className="shrink-0" onClick={addDepMapping}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editField ? "Update" : "Create"} Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
