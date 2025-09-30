import React, { useEffect, useState } from "react";
import settingsService from "./utils/settingsService";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider, ToastContainer } from "./contexts/ToastContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Routes from "./Routes.jsx";
import OGMeta from "./components/seo/OGMeta.jsx";
import Canonical from "./components/seo/Canonical.jsx";
import DevOtpBanner from "./components/auth/DevOtpBanner.jsx";
import Header from "./components/layout/Header.jsx";
import { isSupabaseNoop } from "./utils/supabase.js";
// CommandPalette may not exist; guard its import dynamically if missing
// If CommandPalette component exists, it will be tree-shaken in future refactor; placeholder now
const CommandPalette = () => null;

function App() {
  const [toastDuration, setToastDuration] = useState(3500);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await settingsService.getSettings();
      if (mounted && res.success) {
        const ms = res.data?.ui_settings?.toast_duration_ms;
        if (typeof ms === "number" && ms >= 0) setToastDuration(ms);
      }
      if (mounted && isSupabaseNoop && process.env.NODE_ENV !== "production") {
        // Show a one-time toast to clarify environment state
        // ToastProvider context not yet accessible here? We can defer via setTimeout
        setTimeout(() => {
          try {
            const evt = new CustomEvent("app:toast", {
              detail: {
                type: "info",
                message: "Supabase disabled (no-op mode).",
              },
            });
            window.dispatchEvent(evt);
          } catch {
            /* noop */
          }
        }, 50);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <HelmetProvider>
      <ToastProvider defaultDuration={toastDuration}>
        <AuthProvider>
          <Header />
          <OGMeta />
          <Routes />
          <Canonical />
          <ToastContainer />
          <DevOtpBanner />
          <CommandPalette />
        </AuthProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;

// Fallback reference to appease potential false positive unused-import tooling (tree-shaken in prod)
void React;
