import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and integrations</p>
      </div>
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <Settings className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <h3 className="font-semibold text-lg">Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          User management, API integrations, WhatsApp Business setup, and SMTP configuration will be available here.
        </p>
      </div>
    </div>
  );
}
