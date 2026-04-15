import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import AddCustomFieldDialog from "@/components/AddCustomFieldDialog";
import AddLeadTemplateDialog from "@/components/AddLeadTemplateDialog";
import Cities from "@/components/configuration/Cities";
import Roles from "@/components/configuration/Roles";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { LeadTemplate, CustomField } from "@/data/customFieldsData";

const typeBadgeColors: Record<string, string> = {
  text: "bg-info/10 text-info border-info/20",
  number: "bg-warning/10 text-warning border-warning/20",
  integer: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  dropdown: "bg-accent/10 text-accent border-accent/20",
  dependent_dropdown: "bg-primary/10 text-primary border-primary/20",
};

export default function ConfigurationPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [templates, setTemplates] = useState<LeadTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canManageMasters = String(currentUser.role || "").toLowerCase() === "company_admin";

  const [addOpen, setAddOpen] = useState(false);
  const [editField, setEditField] = useState<CustomField | null>(null);
  const [tplOpen, setTplOpen] = useState(false);
  const [editTpl, setEditTpl] = useState<LeadTemplate | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fieldData, templateData] = await Promise.all([
        api("/custom-fields"),
        api("/lead-templates"),
      ]);
      setFields(fieldData || []);
      setTemplates(templateData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = () => fetchData();
  const handleSaveTpl = () => fetchData();

  const deleteField = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api(`/custom-fields/${id}`, { method: "DELETE" });
      fetchData();
      toast.success("Field deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const deleteTpl = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api(`/lead-templates/${id}`, { method: "DELETE" });
      fetchData();
      toast.success("Template deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage custom fields, templates, cities, and roles</p>
      </div>

      <Tabs defaultValue="fields">
        <TabsList>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="templates">Lead Templates</TabsTrigger>
          {canManageMasters && <TabsTrigger value="cities">Cities</TabsTrigger>}
          {canManageMasters && <TabsTrigger value="roles">Roles</TabsTrigger>}
        </TabsList>

        <TabsContent value="fields">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => { setEditField(null); setAddOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Field
            </Button>
          </div>
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Label</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-sm">{f.label || (f as any).field_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs border ${typeBadgeColors[f.type || (f as any).field_type] || ""}`}>
                        {(f.type || (f as any).field_type)?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditField(f); setAddOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteField(f.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground">No custom fields yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => { setEditTpl(null); setTplOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Create Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No lead templates yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map(tpl => (
                <div key={tpl.id} className="glass-card rounded-xl p-5 space-y-3 border hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-semibold text-sm">{tpl.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
                  </div>
                  <div className="flex gap-1 pt-1 border-t">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditTpl(tpl); setTplOpen(true); }}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deleteTpl(tpl.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {canManageMasters && (
          <TabsContent value="cities">
            <Cities />
          </TabsContent>
        )}

        {canManageMasters && (
          <TabsContent value="roles">
            <Roles />
          </TabsContent>
        )}
      </Tabs>

      <AddCustomFieldDialog
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditField(null); fetchData(); }}
        onSave={handleSave}
        existingFields={fields}
        editField={editField}
      />
      <AddLeadTemplateDialog
        open={tplOpen}
        onClose={() => { setTplOpen(false); setEditTpl(null); fetchData(); }}
        onSave={handleSaveTpl}
        editTemplate={editTpl}
      />
    </div>
  );
}
