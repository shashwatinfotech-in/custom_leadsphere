import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const industries = ["IT Services", "Education", "Event Management", "Real Estate", "Hospitality", "Fitness", "Non-Profit", "Healthcare", "Retail", "Other"];
const sources = ["Website", "LinkedIn", "Referral", "Google Ads", "Cold Call", "Event", "Other"];
const statuses = ["New", "Contacted", "Interested", "Qualified", "Proposal", "Won", "Lost"];

export default function LeadForm({ form, onChange, cities }) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input id="companyName" value={form.companyName} onChange={e => onChange("companyName", e.target.value)} placeholder="e.g. Acme Corp" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactPerson">Contact Person *</Label>
          <Input id="contactPerson" value={form.contactPerson} onChange={e => onChange("contactPerson", e.target.value)} placeholder="e.g. John Doe" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" value={form.email} onChange={e => onChange("email", e.target.value)} placeholder="john@acme.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={e => onChange("phone", e.target.value)} placeholder="+91 98765 43210" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Industry</Label>
          <Select value={form.industry} onValueChange={v => onChange("industry", v)}>
            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Select City</Label>
          <Select value={form.city_id} onValueChange={v => onChange("city_id", v)}>
            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No City</SelectItem>
              {cities.filter(city => city.is_active).map(city => (
                <SelectItem key={city.id} value={String(city.id)}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Source</Label>
          <Select value={form.source} onValueChange={v => onChange("source", v)}>
            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => onChange("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={form.notes} onChange={e => onChange("notes", e.target.value)} placeholder="Any additional notes..." rows={3} />
      </div>
    </div>
  );
}
