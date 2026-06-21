"use client";

import { usePathname } from "next/navigation";
import { useApp } from "@/lib/appContext";
import { Navbar } from "@/components/Navbar";
import { DemoReadyBadge } from "@/components/DemoReadyBadge";
import { DeveloperSettingsPanel } from "@/components/DeveloperSettingsPanel";

export function NavbarWrapper() {
  const pathname = usePathname();
  const {
    demoMode,
    developerSettingsOpen,
    aiMode,
    apiStatus,
    presentationMode,
    themeChoice,
    hasApiKey,
    handleLogoClick,
    handleDemoModeChange,
    handleAiModeChange,
    applyTheme,
    handlePresentationModeChange,
    handleResetDemoFlow,
    setDeveloperSettingsOpen
  } = useApp();
  const hideNavbar = pathname === "/";

  return (
    <>
      {hideNavbar ? null : <Navbar onLogoClick={handleLogoClick} />}
      <DemoReadyBadge active={demoMode} />
      <DeveloperSettingsPanel
        open={developerSettingsOpen}
        demoMode={demoMode}
        aiMode={aiMode}
        apiStatus={apiStatus}
        presentationMode={presentationMode}
        themeChoice={themeChoice}
        liveAiAllowed={hasApiKey}
        onClose={() => setDeveloperSettingsOpen(false)}
        onDemoModeChange={handleDemoModeChange}
        onAiModeChange={handleAiModeChange}
        onThemeChange={applyTheme}
        onPresentationModeChange={handlePresentationModeChange}
        onResetDemoFlow={handleResetDemoFlow}
      />
    </>
  );
}
