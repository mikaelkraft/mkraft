import { useEffect, useState } from "react";
import settingsService from "./utils/settingsService";

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
