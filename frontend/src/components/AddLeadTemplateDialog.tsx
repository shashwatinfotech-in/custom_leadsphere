import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical, Settings2 } from "lucide-react";
import { toast } from "sonner";
import type { LeadTemplate, LeadTemplateField, CustomFieldType, CustomField } from "@/data/customFieldsData";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

const fieldTypes: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "integer", label: "Integer" },
  { value: "dropdown", label: "Dropdown" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (template: LeadTemplate) => void;
  editTemplate?: LeadTemplate | null;
}

export default function AddLeadTemplateDialog({ open, onClose, onSave, editTemplate }: Props) {
  const [name, setName] = useState(editTemplate?.name || "");
  const [description, setDescription] = useState(editTemplate?.description || "");
  const [fields, setFields] = useState<LeadTemplateField[]>(editTemplate?.fields || []);
  const [isActive, setIsActive] = useState(editTemplate?.isActive ?? true);
  const [availableCustomFields, setAvailableCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const data = await api("/custom-fields");
        setAvailableCustomFields(data);
      } catch (err) {
        console.error("Failed to fetch custom fields", err);
      }
    };
    if (open) fetchCustomFields();
  }, [open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setFields([]);
    setIsActive(true);
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setName(editTemplate?.name || "");
      setDescription(editTemplate?.description || "");
      setFields(editTemplate?.fields || []);
      setIsActive(editTemplate?.isActive ?? true);
    }
    if (!isOpen) onClose();
  };

  const addField = () => {
    setFields(prev => [
      ...prev,
      { fieldId: `tpl-f-${Date.now()}`, label: "", type: "text", required: false },
    ]);
  };

  const updateField = (idx: number, updates: Partial<LeadTemplateField>) => {
    setFields(prev => prev.map((f, i) => (i === idx ? { ...f, ...updates } : f)));
  };

  const removeField = (idx: number) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLinkCustomField = (idx: number, customFieldId: string) => {
    const cf = availableCustomFields.find(f => f.id === customFieldId);
    if (cf) {
      updateField(idx, {
        label: cf.label || (cf as any).field_name,
        type: (cf.type || (cf as any).field_type) as CustomFieldType,
      });
    }
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (fields.length === 0) {
      toast.error("Add at least one field");
      return;
    }
    const emptyLabels = fields.some(f => !f.label.trim());
    if (emptyLabels) {
      toast.error("All fields must have a label");
      return;
    }

    setLoading(true);
    try {
      const url = editTemplate ? `/lead-templates/${editTemplate.id}` : "/lead-templates";
      const method = editTemplate ? "PUT" : "POST";

      const result = await api(url, {
        method,
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          fields,
          isActive,
        }),
      });
      
      toast.success(editTemplate ? "Template updated" : "Template created");
      onSave(result);
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTemplate ? "Edit" : "Create"} Lead Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Template Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Real Estate Lead" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label className="text-sm">Active</Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this template..." rows={2} />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Dynamic Fields</p>
              <Button variant="outline" size="sm" onClick={addField}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Field
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-center py-6 text-muted-foreground text-sm">No fields added yet. Click "Add Field" to start.</p>
            )}

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.fieldId} className="border rounded-lg p-4 space-y-3 bg-muted/20 relative">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">Field {idx + 1}</span>
                    
                    {/* Choose from Custom Fields */}
                    <div className="flex-1 flex justify-center">
                      <div className="flex items-center gap-2 bg-background/50 p-1 px-2 rounded-md border border-dashed border-primary/30">
                        <Settings2 className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-medium text-primary uppercase pt-0.5">Use Custom Field:</span>
                        <Select onValueChange={(v) => handleLinkCustomField(idx, v)}>
                          <SelectTrigger className="h-6 w-[150px] text-[10px] bg-transparent border-none">
                            <SelectValue placeholder="Pick a field..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCustomFields.map(cf => (
                              <SelectItem key={cf.id} value={cf.id} className="text-xs">
                                {cf.label || (cf as any).field_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={field.required}
                          onCheckedChange={v => updateField(idx, { required: v })}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">Required</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeField(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] uppercase text-muted-foreground font-bold">Field Label</Label>
                      <Input
                        placeholder="e.g. Budget Range"
                        value={field.label}
                        onChange={e => updateField(idx, { label: e.target.value })}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] uppercase text-muted-foreground font-bold">Field Type</Label>
                      <Select value={field.type} onValueChange={v => updateField(idx, { type: v as CustomFieldType, options: v === "dropdown" ? [] : undefined })}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {field.type === "dropdown" && (
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-semibold">Options (comma-separated)</Label>
                      <Input
                        placeholder="Option 1, Option 2, Option 3"
                        value={field.options?.join(", ") || ""}
                        onChange={e => updateField(idx, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                        className="h-9 text-sm"
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.options?.map((opt, oi) => (
                          <Badge key={oi} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px]">{opt}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="px-8">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editTemplate ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
