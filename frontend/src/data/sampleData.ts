export type LeadStatus = "New" | "Contacted" | "Interested" | "Qualified" | "Proposal" | "Won" | "Lost";

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  city: string;
  source: string;
  status: LeadStatus;
  assignedTo: string;
  notes: string;
  tags: string[];
  createdAt: string;
  lastActivity: string;
}

export interface UserPermissions {
  leads: boolean;
  campaigns: boolean;
  whatsapp: boolean;
  settings: boolean;
  dashboard: boolean;
  userManagement: boolean;
  configuration: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "Super Admin" | "Manager" | "Sales Executive";
  avatar?: string;
  isActive: boolean;
  permissions: UserPermissions;
  lastLogin?: string;
}

const allPerms: UserPermissions = { leads: true, campaigns: true, whatsapp: true, settings: true, dashboard: true, userManagement: true, configuration: true };
const basicPerms: UserPermissions = { leads: true, campaigns: true, whatsapp: true, settings: false, dashboard: true, userManagement: false, configuration: false };

export const users: User[] = [
  { id: "1", name: "Yogesh Doshi", email: "yogesh@leadsphere.io", role: "Super Admin", isActive: true, permissions: allPerms, lastLogin: "2026-03-06" },
  { id: "2", name: "Priya Shah", email: "priya@leadsphere.io", role: "Manager", isActive: true, permissions: { ...allPerms, userManagement: false }, lastLogin: "2026-03-05" },
  { id: "3", name: "Rahul Mehta", email: "rahul@leadsphere.io", role: "Sales Executive", isActive: true, permissions: basicPerms, lastLogin: "2026-03-07" },
];

export const leads: Lead[] = [
  {
    id: "LS-001", companyName: "ABC Events Pvt Ltd", contactPerson: "Anil Kumar",
    email: "anil@abcevents.com", phone: "+91 98765 43210", industry: "Event Management",
    city: "Mumbai", source: "Website", status: "New", assignedTo: "Rahul Mehta",
    notes: "Interested in corporate event solutions", tags: ["enterprise", "events"],
    createdAt: "2026-02-28", lastActivity: "2026-03-02",
  },
  {
    id: "LS-002", companyName: "Bright Future School", contactPerson: "Meena Patel",
    email: "meena@brightfuture.edu", phone: "+91 98123 45678", industry: "Education",
    city: "Ahmedabad", source: "Referral", status: "Interested", assignedTo: "Priya Shah",
    notes: "Looking for admission campaign tools", tags: ["education", "campaigns"],
    createdAt: "2026-02-25", lastActivity: "2026-03-01",
  },
  {
    id: "LS-003", companyName: "TechNova Solutions", contactPerson: "Vikram Singh",
    email: "vikram@technova.io", phone: "+91 99876 54321", industry: "IT Services",
    city: "Pune", source: "LinkedIn", status: "Contacted", assignedTo: "Rahul Mehta",
    notes: "Needs lead tracking for SaaS sales", tags: ["saas", "tech"],
    createdAt: "2026-02-20", lastActivity: "2026-02-28",
  },
  {
    id: "LS-004", companyName: "Green Earth Foundation", contactPerson: "Sunita Rao",
    email: "sunita@greenearth.org", phone: "+91 97654 32100", industry: "Non-Profit",
    city: "Bangalore", source: "Event", status: "Qualified", assignedTo: "Priya Shah",
    notes: "Wants WhatsApp campaigns for donor outreach", tags: ["ngo", "whatsapp"],
    createdAt: "2026-02-15", lastActivity: "2026-03-02",
  },
  {
    id: "LS-005", companyName: "Spice Route Restaurant", contactPerson: "Rajesh Nair",
    email: "rajesh@spiceroute.in", phone: "+91 98234 56789", industry: "Hospitality",
    city: "Kochi", source: "Google Ads", status: "Proposal", assignedTo: "Yogesh Doshi",
    notes: "Email marketing for seasonal offers", tags: ["hospitality", "email"],
    createdAt: "2026-02-10", lastActivity: "2026-03-03",
  },
  {
    id: "LS-006", companyName: "Urban Realty Group", contactPerson: "Deepak Sharma",
    email: "deepak@urbanrealty.com", phone: "+91 99123 78654", industry: "Real Estate",
    city: "Delhi", source: "Cold Call", status: "Won", assignedTo: "Rahul Mehta",
    notes: "Signed up for annual plan", tags: ["realestate", "premium"],
    createdAt: "2026-01-15", lastActivity: "2026-02-20",
  },
  {
    id: "LS-007", companyName: "FitLife Gym Chain", contactPerson: "Kavita Joshi",
    email: "kavita@fitlife.in", phone: "+91 98765 11223", industry: "Fitness",
    city: "Hyderabad", source: "Website", status: "New", assignedTo: "Priya Shah",
    notes: "Interested in member acquisition campaigns", tags: ["fitness", "campaigns"],
    createdAt: "2026-03-01", lastActivity: "2026-03-03",
  },
  {
    id: "LS-008", companyName: "CloudSync Technologies", contactPerson: "Arjun Reddy",
    email: "arjun@cloudsync.tech", phone: "+91 97654 99887", industry: "IT Services",
    city: "Chennai", source: "LinkedIn", status: "Lost", assignedTo: "Yogesh Doshi",
    notes: "Went with competitor", tags: ["tech", "lost"],
    createdAt: "2026-01-20", lastActivity: "2026-02-15",
  },
];

export const statusColors: Record<LeadStatus, string> = {
  New: "bg-info/10 text-info border-info/20",
  Contacted: "bg-warning/10 text-warning border-warning/20",
  Interested: "bg-accent/10 text-accent border-accent/20",
  Qualified: "bg-primary/10 text-primary border-primary/20",
  Proposal: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Won: "bg-success/10 text-success border-success/20",
  Lost: "bg-destructive/10 text-destructive border-destructive/20",
};

export const kpiData = {
  totalLeads: 248,
  conversionRate: 18.5,
  emailsSent: 1420,
  whatsappSent: 890,
  totalLeadsChange: 12.3,
  conversionChange: 2.1,
  emailsChange: -5.2,
  whatsappChange: 24.6,
};

export const monthlyGrowth = [
  { month: "Sep", leads: 32, conversions: 5 },
  { month: "Oct", leads: 45, conversions: 8 },
  { month: "Nov", leads: 38, conversions: 7 },
  { month: "Dec", leads: 52, conversions: 11 },
  { month: "Jan", leads: 48, conversions: 9 },
  { month: "Feb", leads: 61, conversions: 14 },
];

export const leadSources = [
  { name: "Website", value: 35, fill: "hsl(var(--chart-1))" },
  { name: "LinkedIn", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "Referral", value: 20, fill: "hsl(var(--chart-3))" },
  { name: "Google Ads", value: 12, fill: "hsl(var(--chart-4))" },
  { name: "Events", value: 8, fill: "hsl(var(--chart-5))" },
];

export const campaignPerformance = [
  { name: "Spring Promo", sent: 450, opened: 280, clicked: 85 },
  { name: "Product Launch", sent: 320, opened: 210, clicked: 95 },
  { name: "Newsletter", sent: 380, opened: 190, clicked: 45 },
  { name: "Event Invite", sent: 270, opened: 180, clicked: 120 },
];
