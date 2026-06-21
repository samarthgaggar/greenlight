"use client";

import { useApp } from "@/lib/appContext";
import { Navbar } from "@/components/Navbar";
import { DemoReadyBadge } from "@/components/DemoReadyBadge";
import { DeveloperSettingsPanel } from "@/components/DeveloperSettingsPanel";

export function NavbarWrapper() {
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

  return (
    <>
      <Navbar onLogoClick={handleLogoClick} />
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
