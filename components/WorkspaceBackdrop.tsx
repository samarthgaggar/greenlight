"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getWorkspaceBackground } from "@/lib/workspace-backgrounds";

export function WorkspaceBackdrop() {
  const pathname = usePathname();
  const image = getWorkspaceBackground(pathname);

  useEffect(() => {
    const img = new Image();
    img.src = image;
  }, [image]);

  return (
    <div className="workspace-backdrop" aria-hidden="true">
      <div
        key={image}
        className="workspace-backdrop-image"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div className="workspace-backdrop-scrim" />
      <div className="noise-overlay workspace-backdrop-noise" />
    </div>
  );
}
