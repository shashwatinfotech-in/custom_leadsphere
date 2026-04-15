import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCityContext } from "@/contexts/CityContext";

type City = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
};

export default function Cities() {
  const { refreshCities } = useCityContext();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const data = await api("/cities?include_inactive=true");
      setCities(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const resetForm = () => {
    setName("");
    setActive(true);
    setEditingCity(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("City name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingCity) {
        await api(`/cities/${editingCity.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: name.trim(), is_active: active }),
        });
        toast.success("City updated");
      } else {
        await api("/cities", {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), is_active: active }),
        });
        toast.success("City added");
      }

      await fetchCities();
      await refreshCities();
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save city");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setName(city.name);
    setActive(city.is_active);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this city?")) return;
    try {
      await api(`/cities/${id}`, { method: "DELETE" });
      toast.success("City deleted");
      await fetchCities();
      await refreshCities();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete city");
    }
  };

  const toggleActive = async (city: City, nextValue: boolean) => {
    try {
      await api(`/cities/${city.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: nextValue }),
      });
      toast.success(nextValue ? "City activated" : "City deactivated");
      await fetchCities();
      await refreshCities();
    } catch (err: any) {
      toast.error(err.message || "Failed to update city");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Cities Master</h2>
          <p className="text-sm text-muted-foreground">Manage the company city list and availability.</p>
        </div>
        <Badge variant="outline" className="text-xs">{cities.length} cities</Badge>
      </div>

      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="City name"
          />
          <div className="flex items-center gap-2 rounded-md border px-3">
            <Switch checked={active} onCheckedChange={setActive} />
            <span className="text-sm">{active ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCity ? "Update City" : "Add City"}
            </Button>
            {editingCity && (
              <Button variant="outline" onClick={resetForm} disabled={saving}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Created</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={city.is_active} onCheckedChange={(v) => toggleActive(city, Boolean(v))} />
                        <span className="text-sm">{city.is_active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {city.created_at ? new Date(city.created_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(city)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(city.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {cities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No cities found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
