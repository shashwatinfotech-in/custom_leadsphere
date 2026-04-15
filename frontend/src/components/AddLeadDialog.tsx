import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { LeadStatus } from "@/data/sampleData";
import { users } from "@/data/sampleData";
import { sampleCustomFields, sampleLeadTemplates, CustomField, LeadTemplateField } from "@/data/customFieldsData";
import { useCityContext } from "@/contexts/CityContext";
import { FileText, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const industries = ["IT Services", "Education", "Event Management", "Real Estate", "Hospitality", "Fitness", "Non-Profit", "Healthcare", "Retail", "Other"];
const sources = ["Website", "LinkedIn", "Referral", "Google Ads", "Cold Call", "Event", "Other"];
const statuses: LeadStatus[] = ["New", "Contacted", "Interested", "Qualified", "Proposal", "Won", "Lost"];

interface AddLeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead?: any) => void;
  editLead?: any | null;
}

export default function AddLeadDialog({ open, onClose, onSave, editLead }: AddLeadDialogProps) {
  const { cities } = useCityContext();
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    city_id: "",
    source: "",
    status: "New" as LeadStatus,
    assignedTo: users[0]?.name || "",
    notes: "",
    tags: "",
  });

  useEffect(() => {
    if (editLead) {
      setForm({
        companyName: editLead.company || "",
        contactPerson: editLead.name || "",
        email: editLead.email || "",
        phone: editLead.phone || "",
        industry: editLead.industry || "",
        city_id: editLead.city_id ? String(editLead.city_id) : "",
        source: editLead.source || "",
        status: editLead.status || "New",
        assignedTo: editLead.assignedTo || "",
        notes: editLead.notes || "",
        tags: editLead.tags?.join(", ") || "",
      });
    } else {
      resetForm();
    }
  }, [editLead, open]);

  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [activeTemplates, setActiveTemplates] = useState<any[]>([]);
  const [activeFields, setActiveFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const [templateData, fieldData] = await Promise.all([
          api("/lead-templates"),
          api("/custom-fields"),
        ]);
        setActiveTemplates(templateData || sampleLeadTemplates);
        setActiveFields(fieldData || sampleCustomFields);
      } catch (err) {
        console.error("Failed to load templates", err);
        setActiveTemplates(sampleLeadTemplates);
        setActiveFields(sampleCustomFields);
      }
    };
    if (open) loadTemplates();
  }, [open]);

  const selectedTemplate = activeTemplates.find(t => t.id === selectedTemplateId);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const updateCustom = (id: string, value: string) => setCustomValues(prev => ({ ...prev, [id]: value }));
  const updateTemplateField = (fieldId: string, value: string) => setTemplateValues(prev => ({ ...prev, [fieldId]: value }));

  const handleTemplateChange = (tplId: string) => {
    if (tplId === "none") {
      setSelectedTemplateId("");
      setTemplateValues({});
      return;
    }

    setSelectedTemplateId(tplId);
    setTemplateValues({});
    const tpl = activeTemplates.find(t => t.id === tplId);
    if (tpl) {
      const defaults: Record<string, string> = {};
      tpl.fields.forEach(f => {
        if (f.defaultValue) defaults[f.fieldId] = f.defaultValue;
      });
      setTemplateValues(defaults);
    }
  };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.contactPerson.trim() || !form.email.trim()) {
      toast({ title: "Missing fields", description: "Company, Contact Person, and Email are required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const url = editLead ? `/leads/${editLead.id}` : "/leads";
      const method = editLead ? "PUT" : "POST";

      await api(url, {
        method,
        body: JSON.stringify({
          name: form.contactPerson.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          company: form.companyName.trim(),
          source: form.source,
          status: form.status,
          notes: form.notes,
          city_id: form.city_id || null,
        }),
      });

      toast({ title: editLead ? "Lead updated" : "Lead created", description: `${form.companyName} has been saved.` });
      onSave();
      resetForm();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      industry: "",
      city_id: "",
      source: "",
      status: "New",
      assignedTo: users[0]?.name || "",
      notes: "",
      tags: "",
    });
    setCustomValues({});
    setTemplateValues({});
    setSelectedTemplateId("");
  };

  const renderCustomField = (field: CustomField) => {
    if (field.type === "text" || field.type === "number" || field.type === "integer") {
      return (
        <div key={field.id} className="space-y-1.5">
          <Label>{field.label} {field.required && "*"}</Label>
          <Input type={field.type === "text" ? "text" : "number"} value={customValues[field.id] || ""} onChange={e => updateCustom(field.id, e.target.value)} placeholder={field.label} />
        </div>
      );
    }
    if (field.type === "dropdown") {
      return (
        <div key={field.id} className="space-y-1.5">
          <Label>{field.label} {field.required && "*"}</Label>
          <Select value={customValues[field.id] || ""} onValueChange={v => updateCustom(field.id, v)}>
            <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
            <SelectContent>{field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      );
    }
    if (field.type === "dependent_dropdown") {
      const parentValue = field.parentFieldId === "cf-city" ? form.city_id : customValues[field.parentFieldId || ""];
      const opts = parentValue && field.dependentOptions ? field.dependentOptions[parentValue] || [] : [];
      return (
        <div key={field.id} className="space-y-1.5">
          <Label>{field.label} {field.required && "*"}</Label>
          <Select value={customValues[field.id] || ""} onValueChange={v => updateCustom(field.id, v)} disabled={opts.length === 0}>
            <SelectTrigger><SelectValue placeholder={opts.length === 0 ? "Select parent first" : `Select ${field.label}`} /></SelectTrigger>
            <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  const renderTemplateField = (field: LeadTemplateField) => {
    if (field.type === "text" || field.type === "number" || field.type === "integer") {
      return (
        <div key={field.fieldId} className="space-y-1.5">
          <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          <Input type={field.type === "text" ? "text" : "number"} value={templateValues[field.fieldId] || ""} onChange={e => updateTemplateField(field.fieldId, e.target.value)} placeholder={field.label} />
        </div>
      );
    }
    if (field.type === "dropdown") {
      return (
        <div key={field.fieldId} className="space-y-1.5">
          <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
          <Select value={templateValues[field.fieldId] || ""} onValueChange={v => updateTemplateField(field.fieldId, v)}>
            <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
            <SelectContent>{field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      );
    }
    return null;
  };

  const cityOptions = cities.filter(city => city.is_active);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {activeTemplates.length > 0 && (
            <div className="space-y-1.5 p-3 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-primary" />
                <Label className="font-semibold text-sm">Lead Template</Label>
              </div>
              <Select value={selectedTemplateId || "none"} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template</SelectItem>
                  {activeTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.fields?.length || 0} fields
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground mt-1">{selectedTemplate.description}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input id="companyName" value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPerson">Contact Person *</Label>
              <Input id="contactPerson" value={form.contactPerson} onChange={e => update("contactPerson", e.target.value)} placeholder="e.g. John Doe" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@acme.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Select value={form.industry} onValueChange={v => update("industry", v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Select City</Label>
              <Select value={form.city_id || "none"} onValueChange={v => update("city_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No City</SelectItem>
                  {cityOptions.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={v => update("source", v)}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => update("status", v as LeadStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Assigned To</Label>
              <Select value={form.assignedTo} onValueChange={v => update("assignedTo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={form.tags} onChange={e => update("tags", e.target.value)} placeholder="comma separated" />
            </div>
          </div>

          {selectedTemplate && selectedTemplate.fields.length > 0 && (
            <>
              <div className="border-t pt-3 mt-1">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">{selectedTemplate.name} Fields</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedTemplate.fields.map(renderTemplateField)}
              </div>
            </>
          )}

          {activeFields.length > 0 && (
            <>
              <div className="border-t pt-3 mt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custom Fields</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {activeFields.map(renderCustomField)}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Any additional notes..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
