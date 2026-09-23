import { ApplicationStatus, CertificateStatus, InstrumentType } from "@/types";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function formatInstrumentType(type: InstrumentType): string {
  const labels: Record<InstrumentType, string> = {
    WEIGHING_SCALE: "Weighing Scale",
    ELECTRONIC_BALANCE: "Electronic Balance",
    PETROL_DISPENSER: "Petrol Dispenser",
    FLOW_METER: "Flow Meter",
    LENGTH_MEASURE: "Length Measure",
    OTHER: "Other",
  };
  return labels[type] || type;
}

export function getStatusColor(status: ApplicationStatus | CertificateStatus | string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    UNDER_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
    SCHEDULED: "bg-cyan-50 text-cyan-700 border-cyan-200",
    INSPECTION_IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
    INSPECTION_COMPLETED: "bg-teal-50 text-teal-700 border-teal-200",
    VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CERTIFICATE_ISSUED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    EXPIRED: "bg-red-50 text-red-700 border-red-200",
  };
  return colors[status] || "bg-slate-100 text-slate-600 border-slate-200";
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
    LMO: "bg-blue-50 text-blue-700 border-blue-200",
    GATC: "bg-teal-50 text-teal-700 border-teal-200",
    INSTRUMENT_OWNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return colors[role] || "bg-slate-100 text-slate-600 border-slate-200";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: "Administrator",
    LMO: "Legal Metrology Officer",
    GATC: "Govt. Approved Test Centre",
    INSTRUMENT_OWNER: "Instrument Owner",
  };
  return labels[role] || role;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "http://localhost:8000";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function parseImageUrls(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
      }
      return [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return [];
}

