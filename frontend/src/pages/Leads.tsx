import { useEffect, useMemo, useState } from "react";
import { statusColors, LeadStatus } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import AddLeadDialog from "@/components/AddLeadDialog";
import ImportLeadsDialog from "@/components/ImportLeadsDialog";
import { Search, Plus, Download, Filter, Upload, Loader2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCityContext } from "@/contexts/CityContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const statuses: LeadStatus[] = ["New", "Contacted", "Interested", "Qualified", "Proposal", "Won", "Lost"];

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editLead, setEditLead] = useState<any | null>(null);
  const { cities, selectedCityId, setSelectedCityId, selectedCity } = useCityContext();

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, selectedCityId]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (selectedCityId !== "all") params.set("city_id", selectedCityId);
      const query = params.toString();
      const data = await api(`/leads${query ? `?${query}` : ""}`);
      setAllLeads(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return allLeads.filter(l => {
      const company = l.company || l.companyName || "";
      const name = l.name || l.contactPerson || "";
      const leadCity = String(l.city_name || l.city || l.cityName || "").toLowerCase();
      const selected = selectedCityId === "all" ? "" : String(cities.find(c => String(c.id) === selectedCityId)?.name || "").toLowerCase();
      const matchesSearch =
        !search ||
        company.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || l.status === statusFilter;
      const matchesCity = !selected || leadCity === selected;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [search, statusFilter, allLeads, selectedCityId, cities]);

  const handleAddLead = () => fetchLeads();
  const handleImportLeads = () => fetchLeads();

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (selectedCityId !== "all") params.set("city_id", selectedCityId);
      const query = params.toString();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/leads/export${query ? `?${query}` : ""}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Leads exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export leads");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {allLeads.length} leads
            {selectedCity !== "All Cities" && <span className="ml-1">in {selectedCity}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button size="sm" onClick={() => { setEditLead(null); setAddOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by company, contact, city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedCityId} onValueChange={setSelectedCityId}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.filter(city => city.is_active).map(city => (
              <SelectItem key={city.id} value={String(city.id)}>{city.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Company</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Contact</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">City</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Source</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <TableCell onClick={() => setSelectedLead(lead)}>
                    <div><p className="font-medium text-sm">{lead.company || lead.name}</p></div>
                  </TableCell>
                  <TableCell onClick={() => setSelectedLead(lead)}>
                    <div><p className="text-sm">{lead.name}</p><p className="text-xs text-muted-foreground">{lead.email}</p></div>
                  </TableCell>
                  <TableCell onClick={() => setSelectedLead(lead)} className="text-sm">{lead.city_name || "-"}</TableCell>
                  <TableCell onClick={() => setSelectedLead(lead)} className="text-sm">{lead.source}</TableCell>
                  <TableCell onClick={() => setSelectedLead(lead)}>
                    <Badge variant="outline" className={cn("text-xs border font-medium", statusColors[lead.status] || "bg-slate-100")}>{lead.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditLead(lead); setAddOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No leads found matching your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <LeadDetailDrawer lead={selectedLead} open={!!selectedLead} onClose={() => setSelectedLead(null)} />
      <AddLeadDialog open={addOpen} onClose={() => { setAddOpen(false); setEditLead(null); }} onSave={handleAddLead} editLead={editLead} />
      <ImportLeadsDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImportLeads} />
    </div>
  );
}
