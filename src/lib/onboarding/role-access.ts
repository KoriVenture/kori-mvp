export type KoriRole = "investor" | "founder" | "admin";

export function hasRole(
  roles: unknown,
  required: Exclude<KoriRole, "admin">,
): boolean {
  return Array.isArray(roles) && roles.includes(required);
}
