import React, { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider, ToastContainer } from "./contexts/ToastContext";
import Routes from "./Routes";
import Header from './components/layout/Header';
import Canonical from "./components/seo/Canonical";
import OGMeta from './components/seo/OGMeta';
import settingsService from "./utils/settingsService";
import DevOtpBanner from "./components/auth/DevOtpBanner";
import CommandPalette from "./components/CommandPalette";

function App() {
  const [toastDuration, setToastDuration] = useState(3500);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await settingsService.getSettings();
      if (mounted && res.success) {
        const ms = res.data?.ui_settings?.toast_duration_ms;
        if (typeof ms === 'number' && ms >= 0) setToastDuration(ms);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
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
  );
}

export default App;