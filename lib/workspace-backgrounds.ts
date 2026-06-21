/** Subtle nature backgrounds per workspace route (Unsplash) */
export const WORKSPACE_BACKGROUNDS: Record<string, string> = {
  "/map":
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80",
  "/analysis":
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80",
  "/ai":
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80",
  "/guardrails":
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=2400&q=80",
  "/data":
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2400&q=80",
  "/simulator":
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80"
};

const DEFAULT_BACKGROUND =
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2400&q=80";

export function getWorkspaceBackground(pathname: string): string {
  const route = pathname.replace(/\/$/, "") || "/";

  if (WORKSPACE_BACKGROUNDS[route]) {
    return WORKSPACE_BACKGROUNDS[route];
  }

  const match = Object.keys(WORKSPACE_BACKGROUNDS).find(
    (key) => key !== "/" && route.startsWith(`${key}/`)
  );

  return match ? WORKSPACE_BACKGROUNDS[match] : DEFAULT_BACKGROUND;
}
