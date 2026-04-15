import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserForm({ form, onChange, roles, cities }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="userName">Full Name *</Label>
        <Input id="userName" value={form.name} onChange={e => onChange("name", e.target.value)} placeholder="e.g. John Doe" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="userEmail">Email *</Label>
        <Input id="userEmail" type="email" value={form.email} onChange={e => onChange("email", e.target.value)} placeholder="john@company.com" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="userPassword">Password *</Label>
        <Input id="userPassword" type="password" value={form.password} onChange={e => onChange("password", e.target.value)} placeholder="Min 8 characters" />
      </div>
      <div className="space-y-1.5">
        <Label>Select Role</Label>
        <Select value={form.role_id} onValueChange={v => onChange("role_id", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.filter(role => role.is_active !== false).map(role => (
              <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Select City</Label>
        <Select value={form.city_id} onValueChange={v => onChange("city_id", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No City</SelectItem>
            {cities.filter(city => city.is_active).map(city => (
              <SelectItem key={city.id} value={String(city.id)}>{city.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
