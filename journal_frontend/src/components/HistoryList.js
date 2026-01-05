import React from "react";

function truncate(text, maxLen) {
  if (!text) return "";
  const trimmed = String(text).trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}…`;
}

// PUBLIC_INTERFACE
export function HistoryList({ entries, loading, error, onSelectEntry }) {
  /** List of past entries; click to open review. */

  if (loading) {
    return (
      <div className="list" aria-busy="true" aria-label="History loading">
        <div className="listItem">
          <div className="skeleton" />
          <div style={{ height: 10 }} />
          <div className="skeleton" style={{ width: "70%" }} />
        </div>
        <div className="listItem">
          <div className="skeleton" />
          <div style={{ height: 10 }} />
          <div className="skeleton" style={{ width: "60%" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alertError" role="alert">
        {error}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <div className="emptyState">No past entries yet. Submit your first entry on the Dashboard.</div>;
  }

  return (
    <div className="list" aria-label="Journal history list">
      {entries.map((entry) => (
        <div
          key={entry.id ?? `${entry.date}-${entry.content?.slice(0, 12)}`}
          className="listItem"
          role="button"
          tabIndex={0}
          onClick={() => onSelectEntry(entry)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectEntry(entry);
            }
          }}
          aria-label={`Open entry from ${entry.date || "unknown date"}`}
        >
          <div className="listTop">
            <div className="listDate">{entry.date || "Unknown date"}</div>
            <span className="badge">View</span>
          </div>
          <div className="listPreview">{truncate(entry.content, 140)}</div>
        </div>
      ))}
    </div>
  );
}
