"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import {
  serializeBackup,
  parseBackup,
  backupFilename,
  BackupError,
} from "@/lib/backup";
import { getApiKey, setApiKey } from "@/lib/aiClient";

type Feedback = { tone: "ok" | "error"; message: string } | null;

export default function SettingsPage() {
  const { subscriptions, ready, replaceAll, clear, reset } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [apiKey, setApiKeyInput] = useState("");
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  useEffect(() => setApiKeyInput(getApiKey()), []);

  function saveKey() {
    setApiKey(apiKey);
    setKeyStatus(
      apiKey.trim()
        ? "Saved — live AI is now on in the AI Advisor."
        : "Cleared — the Advisor uses the offline assistant.",
    );
  }

  const counts = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active").length;
    return { total: subscriptions.length, active };
  }, [subscriptions]);

  function handleExport() {
    const json = serializeBackup(subscriptions);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setFeedback({
      tone: "ok",
      message: `Exported ${counts.total} subscription${counts.total === 1 ? "" : "s"}.`,
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(serializeBackup(subscriptions));
      setFeedback({ tone: "ok", message: "Backup copied to clipboard." });
    } catch {
      setFeedback({
        tone: "error",
        message: "Couldn't access the clipboard — use Download instead.",
      });
    }
  }

  function applyImport(raw: string) {
    try {
      const subs = parseBackup(raw);
      replaceAll(subs);
      setImportText("");
      if (fileInput.current) fileInput.current.value = "";
      setFeedback({
        tone: "ok",
        message: `Imported ${subs.length} subscription${subs.length === 1 ? "" : "s"}. Your previous data was replaced.`,
      });
    } catch (err) {
      setFeedback({
        tone: "error",
        message: err instanceof BackupError ? err.message : "Import failed.",
      });
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyImport(String(reader.result ?? ""));
    reader.onerror = () =>
      setFeedback({ tone: "error", message: "Couldn't read that file." });
    reader.readAsText(file);
  }

  function handleReset() {
    if (
      confirm(
        "Reset to the demo portfolio? This replaces your current data with the sample household.",
      )
    ) {
      reset();
      setFeedback({ tone: "ok", message: "Restored the demo portfolio." });
    }
  }

  function handleClear() {
    if (
      confirm(
        "Delete all subscriptions? This can't be undone — export a backup first if you might want it back.",
      )
    ) {
      clear();
      setFeedback({ tone: "ok", message: "All subscriptions removed." });
    }
  }

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-2xl bg-ink-100" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Settings</h1>
        <p className="mt-1 text-ink-500">
          Your portfolio lives only in this browser. Back it up, move it, or start
          fresh.
        </p>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.tone === "ok"
              ? "border-brand-200 bg-brand-50 text-brand-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Your data */}
      <section className="card p-5">
        <h2 className="font-semibold text-ink-900">Your data</h2>
        <div className="mt-3 flex flex-wrap gap-6">
          <Stat label="Subscriptions" value={counts.total} />
          <Stat label="Active" value={counts.active} />
          <Stat label="Stored" value="This browser" />
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Nothing is sent to a server. Clearing your browser storage removes it —
          keep a backup.
        </p>
      </section>

      {/* Export */}
      <section className="card p-5">
        <h2 className="font-semibold text-ink-900">Back up</h2>
        <p className="mt-1 text-sm text-ink-500">
          Download a JSON copy of everything you track, or copy it to paste
          elsewhere.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={handleExport} disabled={counts.total === 0}>
            <span aria-hidden>⬇️</span> Download backup
          </button>
          <button className="btn-ghost" onClick={handleCopy} disabled={counts.total === 0}>
            <span aria-hidden>📋</span> Copy JSON
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="card p-5">
        <h2 className="font-semibold text-ink-900">Restore</h2>
        <p className="mt-1 text-sm text-ink-500">
          Import an okna backup file, or paste its JSON below. This{" "}
          <strong className="text-ink-700">replaces</strong> your current
          portfolio.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label" htmlFor="backup-file">
              From a file
            </label>
            <input
              id="backup-file"
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              onChange={handleFile}
              className="block w-full text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-ink-800"
            />
          </div>
          <div>
            <label className="label" htmlFor="backup-json">
              Or paste JSON
            </label>
            <textarea
              id="backup-json"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={5}
              placeholder='{"app":"okna","version":1,"subscriptions":[ ... ]}'
              className="input font-mono text-xs"
            />
            <button
              className="btn-ghost mt-3"
              onClick={() => applyImport(importText)}
              disabled={importText.trim() === ""}
            >
              Import pasted JSON
            </button>
          </div>
        </div>
      </section>

      {/* AI Advisor */}
      <section className="card p-5">
        <h2 className="font-semibold text-ink-900">AI Advisor</h2>
        <p className="mt-1 text-sm text-ink-500">
          The AI Advisor works offline out of the box. Add an Anthropic API key to
          upgrade its chat to live Claude, grounded in your portfolio.
        </p>
        {process.env.NEXT_PUBLIC_ADVISOR_API_URL ? (
          <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
            ⚡ Live AI is already on for everyone via your backend — the key below
            is optional (only used as a fallback on this device).
          </p>
        ) : null}
        <div className="mt-4">
          <label className="label" htmlFor="api-key">
            Anthropic API key
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="api-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="input flex-1"
            />
            <button className="btn-primary shrink-0" onClick={saveKey}>
              Save
            </button>
          </div>
          {keyStatus && <p className="mt-2 text-xs text-brand-700">{keyStatus}</p>}
          <p className="mt-2 text-xs text-ink-400">
            Stored only on this device and sent directly to Anthropic from your
            browser. For distributing to end customers, route the key through a
            backend proxy instead of shipping it on-device.
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-rose-200 bg-white p-5">
        <h2 className="font-semibold text-rose-800">Danger zone</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink-900">Reset to demo</p>
            <p className="text-xs text-ink-500">
              Replace your data with the sample Indian-household portfolio.
            </p>
          </div>
          <button className="btn-ghost shrink-0" onClick={handleReset}>
            Reset to demo
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4 border-t border-ink-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink-900">Clear everything</p>
            <p className="text-xs text-ink-500">
              Remove all subscriptions. Export a backup first if unsure.
            </p>
          </div>
          <button
            className="btn shrink-0 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
            onClick={handleClear}
            disabled={counts.total === 0}
          >
            Delete all
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
        {label}
      </p>
    </div>
  );
}
