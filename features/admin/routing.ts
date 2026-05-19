import type { Role } from "./api";

export function dashboardPathForRole(role?: Role | string | null) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANDOR":
      return "/mandor/dashboard";
    case "BURUH":
      return "/buruh/dashboard";
    case "SUPIR":
      return "/supir/dashboard";
    default:
      return "/dashboard";
  }
}
