import { useEffect, useState } from "react";
import useFeature, { resetAllFeatureOverrides } from "hooks/useFeature";

export default function FeatureFlagsPage() {
  const adminGateEnabled = useFeature("feature_flags_admin", true); // always true until gated separately
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null); // flag key currently saving
  const [creating, setCreating] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: "", note: "", enabled: true });
  const [editingNoteKey, setEditingNoteKey] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [overrideKeys, setOverrideKeys] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("featureFlagOverrides:v1");
      if (!raw) return [];
      return Object.keys(JSON.parse(raw));
    } catch {
      return [];
    }
  });

  function refreshOverrideKeys() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("featureFlagOverrides:v1");
      setOverrideKeys(raw ? Object.keys(JSON.parse(raw)) : []);
    } catch {
      /* ignore */
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE_URL || "/api") + "/settings/features",
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFlags(data);
      refreshOverrideKeys();
    } catch (e) {
      setError(e.message || "Failed to load flags");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function upsertFlag({ key, enabled, note }) {
    setSaving(key);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE_URL || "/api") + "/settings/features",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flag_key: key, enabled, note }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setFlags((f) => {
        const exists = f.some((ff) => ff.flagKey === updated.flagKey);
        return exists
          ? f.map((ff) => (ff.flagKey === updated.flagKey ? updated : ff))
          : [...f, updated];
      });
      return updated;
    } catch (e) {
      alert("Update failed: " + e.message);
    } finally {
      setSaving(null);
    }
  }

  async function toggleFlag(key, current) {
    await upsertFlag({ key, enabled: !current });
  }

  async function createFlag(e) {
    e.preventDefault();
    if (!newFlag.key.trim()) return;
    await upsertFlag({
      key: newFlag.key.trim(),
      enabled: newFlag.enabled,
      note: newFlag.note || null,
    });
    setNewFlag({ key: "", note: "", enabled: true });
    setCreating(false);
  }

  function startEditNote(flag) {
    setEditingNoteKey(flag.flagKey);
    setNoteDraft(flag.note || "");
  }
  async function saveNote(flag) {
    await upsertFlag({
      key: flag.flagKey,
      enabled: flag.enabled,
      note: noteDraft,
    });
    setEditingNoteKey(null);
  }

  function overrideBadge(flagKey) {
    const overridden = overrideKeys.includes(flagKey);
    if (!overridden) return null;
    return (
      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
        overridden
      </span>
    );
  }

  function resetOverrides() {
    resetAllFeatureOverrides();
    refreshOverrideKeys();
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation />
      <main className="max-w-5xl mx-auto pt-28 px-6 pb-24">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Feature Flags</h1>
            <p className="text-text-secondary/80 text-sm mt-1">
              Runtime‑fetch flags with local overrides via
              ?ff=flag:on,other:off. Overrides persist locally.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {overrideKeys.length > 0 && (
              <button
                onClick={resetOverrides}
                className="text-xs px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400"
              >
                Reset Overrides ({overrideKeys.length})
              </button>
            )}
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="text-xs px-3 py-1.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary"
              >
                New Flag
              </button>
            )}
          </div>
        </div>
        {!adminGateEnabled && (
          <p className="text-text-secondary">Access disabled.</p>
        )}
        {adminGateEnabled && (
          <>
            {creating && (
              <form
                onSubmit={createFlag}
                className="mb-6 p-4 border border-border-accent/30 rounded-lg bg-surface space-y-3"
              >
                <div className="flex gap-4 flex-wrap">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[11px] uppercase tracking-wide text-text-secondary mb-1">
                      Key
                    </label>
                    <input
                      value={newFlag.key}
                      onChange={(e) =>
                        setNewFlag((f) => ({ ...f, key: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 rounded border border-border-accent/40 bg-background"
                      placeholder="e.g. search_snippets"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-[11px] uppercase tracking-wide text-text-secondary mb-1">
                      Default
                    </label>
                    <select
                      value={newFlag.enabled ? "on" : "off"}
                      onChange={(e) =>
                        setNewFlag((f) => ({
                          ...f,
                          enabled: e.target.value === "on",
                        }))
                      }
                      className="w-full px-2 py-1.5 rounded border border-border-accent/40 bg-background"
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[11px] uppercase tracking-wide text-text-secondary mb-1">
                      Note
                    </label>
                    <input
                      value={newFlag.note}
                      onChange={(e) =>
                        setNewFlag((f) => ({ ...f, note: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 rounded border border-border-accent/40 bg-background"
                      placeholder="Purpose / context"
                    />
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <button
                    type="submit"
                    disabled={!newFlag.key.trim()}
                    className="px-3 py-1.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/40 text-primary disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setNewFlag({ key: "", note: "", enabled: true });
                    }}
                    className="px-3 py-1.5 rounded border border-border-accent/40 hover:bg-border-accent/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {loading && <p className="text-sm text-text-secondary">Loading…</p>}
            {error && <p className="text-error text-sm">{error}</p>}
            <div className="overflow-x-auto border border-border-accent/20 rounded-lg shadow-sm bg-surface">
              <table className="w-full text-sm">
                <thead className="bg-border-accent/10 text-text-secondary">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Flag</th>
                    <th className="text-left px-4 py-2 font-medium">Enabled</th>
                    <th className="text-left px-4 py-2 font-medium">Note</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr
                      key={f.flagKey}
                      className="border-t border-border-accent/10"
                    >
                      <td className="px-4 py-2 font-mono text-xs flex items-center">
                        {f.flagKey}
                        {overrideBadge(f.flagKey)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          disabled={saving === f.flagKey}
                          onClick={() => toggleFlag(f.flagKey, f.enabled)}
                          className={`text-[10px] px-2 py-1 rounded border transition-colors ${f.enabled ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20" : "bg-border-accent/20 text-text-secondary border-border-accent/40 hover:bg-border-accent/30"} disabled:opacity-50`}
                        >
                          {saving === f.flagKey
                            ? "…"
                            : f.enabled
                              ? "On"
                              : "Off"}
                        </button>
                      </td>
                      <td className="px-4 py-2 text-text-secondary/80 max-w-[320px]">
                        {editingNoteKey === f.flagKey ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              className="flex-1 px-2 py-1 rounded border border-border-accent/40 bg-background text-xs"
                            />
                            <button
                              onClick={() => saveNote(f)}
                              className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/30"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNoteKey(null)}
                              className="text-[10px] px-2 py-1 rounded border border-border-accent/40"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span
                              title={f.note || ""}
                              className="truncate text-xs"
                            >
                              {f.note || "—"}
                            </span>
                            <button
                              onClick={() => startEditNote(f)}
                              className="text-[10px] px-2 py-0.5 rounded border border-border-accent/30 hover:bg-border-accent/10"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] text-text-secondary/70">
              Changes propagate to clients within ~30s (stale-while-revalidate
              loop & focus re-fetch). URL overrides via{" "}
              <code>?ff=myFlag:on,otherFlag:off</code>.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
