import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lead, statusColors } from "@/data/sampleData";
import { Building2, Mail, Phone, MapPin, Tag, User, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function LeadDetailDrawer({ lead, open, onClose }: LeadDetailDrawerProps) {
  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">{lead.companyName}</SheetTitle>
              <p className="text-sm text-muted-foreground">{lead.id}</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-1">
          <Badge variant="outline" className={cn("text-xs font-medium border", statusColors[lead.status])}>
            {lead.status}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          <DetailRow icon={User} label="Contact Person" value={lead.contactPerson} />
          <DetailRow icon={Mail} label="Email" value={lead.email} />
          <DetailRow icon={Phone} label="Phone" value={lead.phone} />
          <DetailRow icon={Building2} label="Industry" value={lead.industry} />
          <DetailRow icon={MapPin} label="City" value={lead.city} />
          <DetailRow icon={Tag} label="Source" value={lead.source} />
          <DetailRow icon={User} label="Assigned To" value={lead.assignedTo} />
          <DetailRow icon={Calendar} label="Created" value={lead.createdAt} />
          <DetailRow icon={Clock} label="Last Activity" value={lead.lastActivity} />
        </div>

        <Separator className="my-4" />

        <div>
          <p className="text-xs text-muted-foreground mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {lead.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div>
          <p className="text-xs text-muted-foreground mb-2">Notes</p>
          <p className="text-sm bg-muted/50 rounded-lg p-3">{lead.notes}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
