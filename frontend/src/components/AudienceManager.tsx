import { useState, useRef } from "react";
import { Users, Plus, Upload, Download, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { defaultGroups, AUDIENCE_CSV_TEMPLATE, type AudienceGroup, type AudienceContact } from "@/data/audienceData";

export default function AudienceManager() {
  const [groups, setGroups] = useState<AudienceGroup[]>(defaultGroups);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importTargetGroup, setImportTargetGroup] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const newGroup: AudienceGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      color: "hsl(var(--primary))",
      contacts: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName("");
    setNewGroupDesc("");
    setCreateOpen(false);
    toast({ title: "Group created", description: `"${newGroup.name}" has been created.` });
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    toast({ title: "Group deleted" });
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([AUDIENCE_CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audience_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        toast({ title: "Empty file", variant: "destructive" });
        return;
      }
      const header = lines[0].toLowerCase().replace(/"/g, "").split(",").map(h => h.trim());
      const nameIdx = header.indexOf("name");
      const emailIdx = header.indexOf("email");
      if (nameIdx === -1 || emailIdx === -1) {
        toast({ title: "Invalid format", description: "CSV must have 'name' and 'email' columns.", variant: "destructive" });
        return;
      }
      const phoneIdx = header.indexOf("phone");
      const companyIdx = header.indexOf("company");

      const contacts: AudienceContact[] = lines.slice(1).map((line, i) => {
        const cols = line.replace(/"/g, "").split(",").map(c => c.trim());
        return {
          id: `ac-imp-${Date.now()}-${i}`,
          name: cols[nameIdx] || "",
          email: cols[emailIdx] || "",
          phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
          company: companyIdx >= 0 ? cols[companyIdx] : undefined,
        };
      }).filter(c => c.name && c.email);

      setGroups(prev => prev.map(g =>
        g.id === importTargetGroup
          ? { ...g, contacts: [...g.contacts, ...contacts] }
          : g
      ));
      toast({ title: "Contacts imported", description: `${contacts.length} contacts added.` });
      setImportOpen(false);
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(f);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Audience Groups</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Template
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Group
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <div key={group.id} className="glass-card rounded-xl overflow-hidden animate-fade-up">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            >
              <div className="flex items-center gap-3">
                {expandedGroup === group.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                <div>
                  <h3 className="font-semibold text-sm">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">{group.contacts.length} contacts</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); setImportTargetGroup(group.id); setImportOpen(true); }}
                >
                  <Upload className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            {expandedGroup === group.id && group.contacts.length > 0 && (
              <div className="border-t px-4 py-3">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-2 font-semibold">Name</th>
                        <th className="text-left p-2 font-semibold">Email</th>
                        <th className="text-left p-2 font-semibold">Company</th>
                        <th className="text-left p-2 font-semibold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.contacts.map(c => (
                        <tr key={c.id} className="border-t border-border/50">
                          <td className="p-2">{c.name}</td>
                          <td className="p-2 text-muted-foreground">{c.email}</td>
                          <td className="p-2">{c.company || "—"}</td>
                          <td className="p-2 text-muted-foreground">{c.phone || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createOpen} onOpenChange={v => !v && setCreateOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Create Audience Group</DialogTitle>
            <DialogDescription>Create a new group to organize your contacts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Group Name</Label>
              <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g. VIP Customers" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} placeholder="Brief description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={importOpen} onOpenChange={v => !v && setImportOpen(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Import Contacts via CSV</DialogTitle>
            <DialogDescription>Upload a CSV file with name and email columns.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div
              className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
              <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-medium">Click to upload CSV</p>
              <p className="text-xs text-muted-foreground mt-1">Required columns: name, email</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
