import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider, ToastContainer } from "./contexts/ToastContext";
import Routes from "./Routes";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;