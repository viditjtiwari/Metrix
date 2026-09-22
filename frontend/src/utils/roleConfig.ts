import { UserRole } from "@/types";

export interface MenuItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  group: "main" | "operations" | "system" | "admin";
}

export const MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"], group: "main" },
  { label: "Instruments", href: "/instruments", icon: "Scale", roles: ["ADMIN", "LMO", "INSTRUMENT_OWNER"], group: "main" },
  { label: "Applications", href: "/applications", icon: "FileText", roles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"], group: "main" },
  { label: "Inspections", href: "/inspections", icon: "ClipboardCheck", roles: ["ADMIN", "LMO", "GATC"], group: "operations" },
  { label: "Certificates", href: "/certificates", icon: "Award", roles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"], group: "operations" },
  { label: "Search", href: "/search", icon: "Search", roles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"], group: "operations" },
  { label: "Reports", href: "/reports", icon: "Download", roles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"], group: "system" },
  { label: "Notifications", href: "/notifications", icon: "Bell", roles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"], group: "system" },
  { label: "Users", href: "/admin/users", icon: "Users", roles: ["ADMIN"], group: "admin" },
  { label: "System", href: "/admin/system", icon: "Server", roles: ["ADMIN"], group: "admin" },
];

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

export const GROUP_LABELS: Record<string, string> = {
  main: "Main",
  operations: "Operations",
  system: "System",
  admin: "Administration",
};
