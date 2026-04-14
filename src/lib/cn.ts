/**
 * Tiny classnames helper — joins truthy string parts with a space.
 * Usage: cn("base", condition && "extra", "always")
 */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
