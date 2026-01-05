import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EntryModal } from "../components/EntryModal";
import { HistoryList } from "../components/HistoryList";
import { getEntryById, listEntries } from "../services/api";

function normalizeEntries(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.entries)) return payload.entries;
  return [];
}

function formatError(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  return err.message || "Request failed";
}

// PUBLIC_INTERFACE
export function HistoryPage() {
  /** History list + review modal. */
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await listEntries();
      setEntries(normalizeEntries(payload));
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const selectedTitle = useMemo(() => {
    if (!selected) return "";
    return `Entry — ${selected.date || "Unknown date"}`;
  }, [selected]);

  // PUBLIC_INTERFACE
  const handleSelectEntry = useCallback(async (entry) => {
    setSelected(entry);
    setDetailError("");
    // If entry already includes full content, no need to refetch.
    if (!entry?.id) return;

    setDetailLoading(true);
    try {
      const payload = await getEntryById(entry.id);
      const normalized = payload?.entry || payload;
      setSelected((prev) => ({ ...(prev || {}), ...(normalized || {}) }));
    } catch (err) {
      setDetailError(formatError(err));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  return (
    <div className="mainGrid">
      <section className="card" aria-label="History list">
        <div className="cardHeader">
          <div className="cardTitleRow">
            <h2 className="cardTitle">History</h2>
            <button className="button" onClick={fetchHistory} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
        <div className="cardBody">
          <HistoryList
            entries={entries}
            loading={loading}
            error={error}
            onSelectEntry={handleSelectEntry}
          />
        </div>
      </section>

      <section className="card" aria-label="Review help">
        <div className="cardHeader">
          <div className="cardTitleRow">
            <h2 className="cardTitle">Review</h2>
            <span className="badge badgePrimary">Browse</span>
          </div>
        </div>
        <div className="cardBody">
          <div className="helpText">
            Click an entry to open it. Reviewing past entries helps reinforce habits and maintain your streak.
          </div>
          <div style={{ height: 12 }} />
          <div className="emptyState">
            Tip: If you want faster browsing, keep entries concise—history previews are truncated.
          </div>
        </div>
      </section>

      <EntryModal
        open={Boolean(selected)}
        title={selectedTitle}
        onClose={() => {
          setSelected(null);
          setDetailError("");
        }}
      >
        {detailError && (
          <div className="alert alertError" role="alert">
            {detailError}
          </div>
        )}
        {detailLoading && (
          <div className="alert" role="status">
            Loading entry…
          </div>
        )}
        {!detailLoading && selected && (
          <div className="entryContent">{selected.content || "No content available."}</div>
        )}
      </EntryModal>
    </div>
  );
}
