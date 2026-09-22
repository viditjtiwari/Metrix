import { useAppSelector } from "@/store/hooks";
import { UserRole } from "@/types";

export function useRoleAccess() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const role = user?.role;

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(role);
    }
    return role === roles;
  };

  return {
    user,
    role,
    isAuthenticated,
    isAdmin: role === "ADMIN",
    isLMO: role === "LMO",
    isGATC: role === "GATC",
    isOwner: role === "INSTRUMENT_OWNER",
    canVerify: role === "LMO" || role === "GATC" || role === "ADMIN",
    canSchedule: role === "LMO" || role === "ADMIN",
    canIssueCertificate: role === "LMO" || role === "ADMIN",
    canRegisterInstrument: role === "INSTRUMENT_OWNER" || role === "ADMIN",
    canCreateApplication: role === "INSTRUMENT_OWNER" || role === "ADMIN",
    hasRole,
  };
}
