import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { defaultGroups } from "@/data/audienceData";

interface ComposeEmailDialogProps {
  open: boolean;
  onClose: () => void;
  onSent: (campaign: { id: string; subject: string; groupName: string; recipientCount: number; sentAt: string; status: "sent" | "delivering" | "delivered" }) => void;
}

export default function ComposeEmailDialog({ open, onClose, onSent }: ComposeEmailDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const group = defaultGroups.find(g => g.id === selectedGroup);

  const handleSend = () => {
    if (!selectedGroup || !subject.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Please select a group, add a subject and compose your email.", variant: "destructive" });
      return;
    }
    if (!group) return;

    const now = new Date();
    const sentAt = `${now.toISOString().split("T")[0]} ${now.toTimeString().slice(0, 5)}`;

    onSent({
      id: `sc-${Date.now()}`,
      subject: subject.trim(),
      groupName: group.name,
      recipientCount: group.contacts.length,
      sentAt,
      status: "sent",
    });

    toast({
      title: "Campaign sent!",
      description: `Email sent to ${group.contacts.length} contacts in "${group.name}". Each recipient receives a personalized greeting.`,
    });

    setSelectedGroup("");
    setSubject("");
    setBody("");
    setShowPreview(false);
    onClose();
  };

  const previewContact = group?.contacts[0];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Compose Bulk Email
          </DialogTitle>
          <DialogDescription>
            Each recipient will receive a personalized email with "Dear [Name]" greeting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Audience Group */}
          <div className="space-y-1.5">
            <Label>Target Audience Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Select audience group..." />
              </SelectTrigger>
              <SelectContent>
                {defaultGroups.map(g => (
                  <SelectItem key={g.id} value={g.id}>
                    <span className="flex items-center gap-2">
                      {g.name}
                      <Badge variant="secondary" className="text-[10px] ml-1">{g.contacts.length} contacts</Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {group && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {group.contacts.map(c => (
                  <Badge key={c.id} variant="outline" className="text-xs">
                    {c.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject Line</Label>
            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Exclusive Offer Just For You!" />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="body">Email Body</Label>
            <p className="text-xs text-muted-foreground">The greeting "Dear [Name]," will be automatically added for each recipient.</p>
            <Textarea
              id="body"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your email content here..."
              rows={8}
            />
          </div>

          {/* Preview */}
          {previewContact && subject && body && (
            <div className="space-y-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" /> {showPreview ? "Hide" : "Show"} Preview
              </Button>
              {showPreview && (
                <div className="border rounded-lg p-4 bg-muted/20 space-y-2">
                  <p className="text-xs text-muted-foreground">Preview for: {previewContact.name} ({previewContact.email})</p>
                  <div className="border-t pt-2">
                    <p className="font-semibold text-sm mb-2">{subject}</p>
                    <p className="text-sm whitespace-pre-wrap">
                      Dear {previewContact.name},
                      {"\n\n"}{body}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={!selectedGroup || !subject.trim() || !body.trim()}>
            <Send className="w-4 h-4 mr-2" /> Send to {group ? `${group.contacts.length} recipients` : "Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
