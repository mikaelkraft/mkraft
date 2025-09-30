import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("init"); // init | ready | error | done
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Exchange recovery token for a session if present in URL
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );
        if (error) {
          console.error("exchangeCodeForSession error:", error);
          if (mounted) {
            setStatus("error");
            setError(
              "Invalid or expired reset link. Please request a new one.",
            );
          }
          return;
        }
        if (mounted) setStatus("ready");
      } catch {
        if (mounted) {
          setStatus("error");
          setError("Something went wrong initializing password reset.");
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message || "Failed to update password.");
        return;
      }
      setStatus("done");
      setTimeout(() => navigate("/admin-dashboard-content-management"), 1500);
    } catch {
      setError("Unexpected error while updating password.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-border-accent/20 rounded-lg p-6 shadow-glow-primary">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Reset Password
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Set a new password for your account.
          </p>
        </div>

        {status === "init" && (
          <div className="text-center text-text-secondary text-sm">
            Preparing reset…
          </div>
        )}

        {status === "error" && (
          <div className="text-error text-sm mb-4">{error}</div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-error text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Update Password
            </Button>
          </form>
        )}

        {status === "done" && (
          <div className="text-success text-center text-sm">
            Password updated. Redirecting…
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
