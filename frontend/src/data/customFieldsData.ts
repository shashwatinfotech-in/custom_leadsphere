export type CustomFieldType = "text" | "number" | "integer" | "dropdown" | "dependent_dropdown";

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  parentFieldId?: string;
  dependentOptions?: Record<string, string[]>;
  required: boolean;
  isActive: boolean;
}

export const sampleCustomFields: CustomField[] = [
  {
    id: "cf-1",
    label: "Region",
    type: "dropdown",
    options: ["North", "South", "East", "West", "Central"],
    required: false,
    isActive: true,
  },
  {
    id: "cf-2",
    label: "Budget Range",
    type: "dropdown",
    options: ["< ₹1L", "₹1L - ₹5L", "₹5L - ₹10L", "₹10L+"],
    required: false,
    isActive: true,
  },
  {
    id: "cf-3",
    label: "Employee Count",
    type: "number",
    required: false,
    isActive: true,
  },
  {
    id: "cf-4",
    label: "Area",
    type: "dependent_dropdown",
    parentFieldId: "cf-city",
    dependentOptions: {
      Mumbai: ["Andheri", "Bandra", "Worli", "Dadar", "Juhu", "Powai"],
      Ahmedabad: ["Navrangpura", "Satellite", "SG Highway", "Maninagar", "Bopal"],
      Delhi: ["Connaught Place", "Dwarka", "Saket", "Karol Bagh", "Rohini"],
      Pune: ["Koregaon Park", "Hinjewadi", "Kharadi", "Viman Nagar", "Baner"],
      Bangalore: ["Koramangala", "Whitefield", "Indiranagar", "HSR Layout", "Electronic City"],
    },
    required: false,
    isActive: true,
  },
  {
    id: "cf-5",
    label: "Priority Score",
    type: "integer",
    required: false,
    isActive: false,
  },
];

export interface LeadTemplateField {
  fieldId: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  parentFieldId?: string;
  dependentOptions?: Record<string, string[]>;
  required: boolean;
  defaultValue?: string;
}

export interface LeadTemplate {
  id: string;
  name: string;
  description: string;
  fields: LeadTemplateField[];
  isActive: boolean;
}

export const sampleLeadTemplates: LeadTemplate[] = [
  {
    id: "tpl-1",
    name: "Real Estate Lead",
    description: "Template for real estate property inquiries",
    isActive: true,
    fields: [
      { fieldId: "tpl-f-1", label: "Property Type", type: "dropdown", options: ["Apartment", "Villa", "Plot", "Commercial", "Office Space"], required: true },
      { fieldId: "tpl-f-2", label: "Budget (₹)", type: "number", required: true },
      { fieldId: "tpl-f-3", label: "Preferred Location", type: "text", required: false },
      { fieldId: "tpl-f-4", label: "Carpet Area (sq ft)", type: "integer", required: false },
    ],
  },
  {
    id: "tpl-2",
    name: "IT Services Lead",
    description: "Template for IT/software service inquiries",
    isActive: true,
    fields: [
      { fieldId: "tpl-f-5", label: "Service Type", type: "dropdown", options: ["Web Development", "Mobile App", "Cloud Infra", "DevOps", "AI/ML", "Consulting"], required: true },
      { fieldId: "tpl-f-6", label: "Project Timeline", type: "dropdown", options: ["< 1 Month", "1-3 Months", "3-6 Months", "6+ Months"], required: false },
      { fieldId: "tpl-f-7", label: "Team Size Needed", type: "integer", required: false },
      { fieldId: "tpl-f-8", label: "Tech Stack", type: "text", required: false },
    ],
  },
  {
    id: "tpl-3",
    name: "Event Management Lead",
    description: "Template for event planning and management",
    isActive: true,
    fields: [
      { fieldId: "tpl-f-9", label: "Event Type", type: "dropdown", options: ["Wedding", "Corporate", "Birthday", "Conference", "Exhibition"], required: true },
      { fieldId: "tpl-f-10", label: "Guest Count", type: "integer", required: true },
      { fieldId: "tpl-f-11", label: "Venue Preference", type: "text", required: false },
      { fieldId: "tpl-f-12", label: "Estimated Budget (₹)", type: "number", required: false },
    ],
  },
];
