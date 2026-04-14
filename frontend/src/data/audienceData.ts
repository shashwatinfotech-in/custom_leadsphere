export interface AudienceContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface AudienceGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  contacts: AudienceContact[];
  createdAt: string;
}

export const defaultGroups: AudienceGroup[] = [
  {
    id: "grp-1",
    name: "Interested Parties",
    description: "Leads who showed interest in our products",
    color: "hsl(var(--primary))",
    contacts: [
      { id: "ac-1", name: "Anil Kumar", email: "anil@abcevents.com", phone: "+91 98765 43210", company: "ABC Events" },
      { id: "ac-2", name: "Meena Patel", email: "meena@brightfuture.edu", phone: "+91 98123 45678", company: "Bright Future School" },
      { id: "ac-3", name: "Vikram Singh", email: "vikram@technova.io", phone: "+91 99876 54321", company: "TechNova Solutions" },
    ],
    createdAt: "2026-02-20",
  },
  {
    id: "grp-2",
    name: "Reminder for Renew",
    description: "Customers due for subscription renewal",
    color: "hsl(var(--warning))",
    contacts: [
      { id: "ac-4", name: "Deepak Sharma", email: "deepak@urbanrealty.com", phone: "+91 99123 78654", company: "Urban Realty Group" },
      { id: "ac-5", name: "Rajesh Nair", email: "rajesh@spiceroute.in", phone: "+91 98234 56789", company: "Spice Route Restaurant" },
    ],
    createdAt: "2026-02-15",
  },
  {
    id: "grp-3",
    name: "Newsletter",
    description: "Subscribers for monthly newsletter",
    color: "hsl(var(--info))",
    contacts: [
      { id: "ac-6", name: "Sunita Rao", email: "sunita@greenearth.org", company: "Green Earth Foundation" },
      { id: "ac-7", name: "Kavita Joshi", email: "kavita@fitlife.in", company: "FitLife Gym" },
      { id: "ac-8", name: "Arjun Reddy", email: "arjun@cloudsync.tech", company: "CloudSync" },
      { id: "ac-9", name: "Priya Menon", email: "priya@designhub.co", company: "DesignHub" },
    ],
    createdAt: "2026-01-10",
  },
  {
    id: "grp-4",
    name: "Product Brief",
    description: "Contacts for product update announcements",
    color: "hsl(var(--success))",
    contacts: [
      { id: "ac-10", name: "Rohit Gupta", email: "rohit@startupx.io", company: "StartupX" },
      { id: "ac-11", name: "Neha Kapoor", email: "neha@mediaworks.in", company: "MediaWorks" },
    ],
    createdAt: "2026-02-01",
  },
];

export const AUDIENCE_CSV_TEMPLATE = `name,email,phone,company
"John Doe","john@example.com","+91 98765 43210","Acme Corp"
"Jane Smith","jane@example.com","+91 91234 56789","XYZ Inc"`;
