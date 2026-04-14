import { useState } from "react";
import { Mail, Plus, Send, Users, Upload, ChevronRight, Eye, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignPerformance } from "@/data/sampleData";
import ComposeEmailDialog from "@/components/ComposeEmailDialog";
import AudienceManager from "@/components/AudienceManager";

interface SentCampaign {
  id: string;
  subject: string;
  groupName: string;
  recipientCount: number;
  sentAt: string;
  status: "sent" | "delivering" | "delivered";
}

export default function CampaignsPage() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [sentCampaigns, setSentCampaigns] = useState<SentCampaign[]>([
    { id: "sc-1", subject: "Spring Promo - Exclusive Offers Inside!", groupName: "Interested Parties", recipientCount: 3, sentAt: "2026-03-05 10:30", status: "delivered" },
    { id: "sc-2", subject: "Your Subscription is Expiring Soon", groupName: "Reminder for Renew", recipientCount: 2, sentAt: "2026-03-04 14:15", status: "delivered" },
    { id: "sc-3", subject: "March Newsletter - What's New", groupName: "Newsletter", recipientCount: 4, sentAt: "2026-03-03 09:00", status: "delivered" },
  ]);

  const handleCampaignSent = (campaign: SentCampaign) => {
    setSentCampaigns(prev => [campaign, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Create, manage, and send bulk email campaigns</p>
        </div>
        <Button size="sm" onClick={() => setComposeOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-1.5"><Mail className="w-3.5 h-3.5" /> Campaigns</TabsTrigger>
          <TabsTrigger value="audience" className="gap-1.5"><Users className="w-3.5 h-3.5" /> Audience Groups</TabsTrigger>
          <TabsTrigger value="inbox" className="gap-1.5"><Inbox className="w-3.5 h-3.5" /> Inbox</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Sent Campaigns */}
          {sentCampaigns.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sent Campaigns</h2>
              {sentCampaigns.map((c) => (
                <div key={c.id} className="glass-card rounded-xl p-5 flex items-center justify-between animate-fade-up">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Send className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{c.subject}</h3>
                      <p className="text-xs text-muted-foreground">To: {c.groupName} • {c.sentAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{c.recipientCount}</p>
                      <p className="text-xs text-muted-foreground">Recipients</p>
                    </div>
                    <Badge variant="outline" className="text-xs text-success border-success/20">
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Overview */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance Overview</h2>
            {campaignPerformance.map((campaign) => {
              const openRate = Math.round((campaign.opened / campaign.sent) * 100);
              const clickRate = Math.round((campaign.clicked / campaign.sent) * 100);
              return (
                <div key={campaign.name} className="glass-card rounded-xl p-5 flex items-center justify-between animate-fade-up">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{campaign.name}</h3>
                      <p className="text-xs text-muted-foreground">{campaign.sent} recipients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold">{openRate}%</p>
                      <p className="text-xs text-muted-foreground">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{clickRate}%</p>
                      <p className="text-xs text-muted-foreground">Click Rate</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Completed</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audience">
          <AudienceManager />
        </TabsContent>

        <TabsContent value="inbox" className="space-y-4">
          <div className="glass-card rounded-xl p-8 text-center">
            <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-lg">Mail Inbox</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Connect your email account to view and manage your inbox here.</p>
            <div className="space-y-3 max-w-md mx-auto">
              {[
                { from: "Anil Kumar", subject: "Re: Corporate Event Solutions", time: "2 hours ago", unread: true },
                { from: "Meena Patel", subject: "Admission Campaign - Follow up", time: "5 hours ago", unread: true },
                { from: "Vikram Singh", subject: "Re: SaaS Lead Tracking Demo", time: "1 day ago", unread: false },
                { from: "Deepak Sharma", subject: "Annual Plan - Invoice Request", time: "2 days ago", unread: false },
              ].map((email, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border text-left cursor-pointer hover:bg-muted/50 transition-colors ${email.unread ? 'bg-primary/5 border-primary/20' : 'border-border/50'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${email.unread ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${email.unread ? 'font-semibold' : ''}`}>{email.from}</p>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{email.time}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ComposeEmailDialog open={composeOpen} onClose={() => setComposeOpen(false)} onSent={handleCampaignSent} />
    </div>
  );
}
