export const SITE_NAV_LINKS = [
  { label: "Map", href: "/map", match: (pathname: string) => pathname === "/map" },
  {
    label: "Analysis",
    href: "/analysis",
    match: (pathname: string) => pathname === "/analysis" || pathname === "/ai"
  },
  { label: "Guardrails", href: "/guardrails", match: (pathname: string) => pathname === "/guardrails" },
  { label: "Data", href: "/data", match: (pathname: string) => pathname === "/data" }
] as const;
