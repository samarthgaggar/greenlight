import type { ReactNode } from "react";
import { WorkspaceBackdrop } from "@/components/WorkspaceBackdrop";

type WorkspacePageProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  headerExtra?: ReactNode;
};

export function WorkspacePage({ eyebrow, title, children, headerExtra }: WorkspacePageProps) {
  return (
    <main className="workspace-shell">
      <WorkspaceBackdrop />
      <section className="workspace-section">
        <div className="site-frame">
          <header className="workspace-header">
            <div>
              {eyebrow ? <p className="workspace-eyebrow">{eyebrow}</p> : null}
              <h1 className="workspace-title">{title}</h1>
            </div>
            {headerExtra ? <div className="workspace-header-extra">{headerExtra}</div> : null}
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
