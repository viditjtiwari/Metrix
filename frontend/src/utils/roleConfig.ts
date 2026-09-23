import { UserRole } from "@/types";

export interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  group: string;
}

/** Role-specific portal metadata */
export const ROLE_PORTAL: Record<UserRole, {
  portalName: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}> = {
  INSTRUMENT_OWNER: {
    portalName: "Business Portal",
    accentColor: "emerald",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    accentText: "text-emerald-700",
  },
  LMO: {
    portalName: "Officer Portal",
    accentColor: "blue",
    accentBg: "bg-blue-50",
    accentBorder: "border-blue-200",
    accentText: "text-blue-700",
  },
  GATC: {
    portalName: "Lab Portal",
    accentColor: "violet",
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-200",
    accentText: "text-violet-700",
  },
  ADMIN: {
    portalName: "Admin Console",
    accentColor: "amber",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-700",
  },
};

/**
 * Menu items defined per-role. Each role sees ONLY items listed
 * under their groups. Modeled after India's eMaap Legal Metrology
 * portal and OIML-CS international certification standards.
 */
export const MENU_ITEMS: MenuItem[] = [
  // ── Instrument Owner (Business Portal) ──
  { label: "Dashboard",        href: "/dashboard",     icon: "LayoutDashboard", roles: ["INSTRUMENT_OWNER"], group: "overview" },
  { label: "My Instruments",   href: "/instruments",   icon: "Scale",           roles: ["INSTRUMENT_OWNER"], group: "services" },
  { label: "My Applications",  href: "/applications",  icon: "FileText",        roles: ["INSTRUMENT_OWNER"], group: "services" },
  { label: "My Certificates",  href: "/certificates",  icon: "Award",           roles: ["INSTRUMENT_OWNER"], group: "services" },
  { label: "Notifications",    href: "/notifications", icon: "Bell",            roles: ["INSTRUMENT_OWNER"], group: "alerts" },

  // ── LMO (Officer Portal) ──
  { label: "Dashboard",        href: "/dashboard",     icon: "LayoutDashboard", roles: ["LMO"], group: "overview" },
  { label: "Review Queue",     href: "/applications",  icon: "FileText",        roles: ["LMO"], group: "operations" },
  { label: "My Inspections",   href: "/inspections",   icon: "ClipboardCheck",  roles: ["LMO"], group: "operations" },
  { label: "Certificates",     href: "/certificates",  icon: "Award",           roles: ["LMO"], group: "operations" },
  { label: "Search",           href: "/search",        icon: "Search",          roles: ["LMO"], group: "tools" },
  { label: "Reports",          href: "/reports",       icon: "Download",        roles: ["LMO"], group: "tools" },
  { label: "Notifications",    href: "/notifications", icon: "Bell",            roles: ["LMO"], group: "alerts" },

  // ── GATC (Lab Portal) ──
  { label: "Dashboard",           href: "/dashboard",     icon: "LayoutDashboard", roles: ["GATC"], group: "overview" },
  { label: "Assigned Inspections", href: "/inspections",  icon: "ClipboardCheck",  roles: ["GATC"], group: "lab" },
  { label: "Certificates",        href: "/certificates",  icon: "Award",           roles: ["GATC"], group: "lab" },
  { label: "Notifications",       href: "/notifications", icon: "Bell",            roles: ["GATC"], group: "alerts" },

  // ── Admin (Admin Console) ──
  { label: "Dashboard",        href: "/dashboard",      icon: "LayoutDashboard", roles: ["ADMIN"], group: "overview" },
  { label: "User Management",  href: "/admin/users",    icon: "Users",           roles: ["ADMIN"], group: "admin" },
  { label: "All Applications", href: "/applications",   icon: "FileText",        roles: ["ADMIN"], group: "management" },
  { label: "All Instruments",  href: "/instruments",    icon: "Scale",           roles: ["ADMIN"], group: "management" },
  { label: "All Certificates", href: "/certificates",   icon: "Award",           roles: ["ADMIN"], group: "management" },
  { label: "Inspections",      href: "/inspections",    icon: "ClipboardCheck",  roles: ["ADMIN"], group: "management" },
  { label: "Reports",          href: "/reports",        icon: "Download",        roles: ["ADMIN"], group: "tools" },
  { label: "Notices",          href: "/admin/notices",  icon: "Megaphone",       roles: ["ADMIN"], group: "admin" },
  { label: "System",           href: "/admin/system",   icon: "Server",          roles: ["ADMIN"], group: "admin" },
  { label: "Notifications",    href: "/notifications",  icon: "Bell",            roles: ["ADMIN"], group: "alerts" },
];

/** Group display labels per role context */
export const GROUP_LABELS: Record<string, string> = {
  overview:   "Overview",
  services:   "My Services",
  operations: "Operations",
  lab:        "Lab Work",
  tools:      "Tools",
  management: "Management",
  admin:      "Administration",
  alerts:     "Alerts",
};

export function getMenuForRole(role: UserRole): MenuItem[] {
  return MENU_ITEMS.filter((item) => item.roles.includes(role));
}

export function getMenuGroups(role: UserRole) {
  const items = getMenuForRole(role);
  const groups: Record<string, MenuItem[]> = {};
  for (const item of items) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  return groups;
}
