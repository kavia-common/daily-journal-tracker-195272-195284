import React, { useEffect, useMemo, useState } from "react";

// PUBLIC_INTERFACE
export function EntryFormCard({
  todayEntry,
  loadingToday,
  onSubmit,
  submitting,
  submitError,
  submitSuccess
}) {
  /** Form for submitting today's journal entry; enforces one per day via UI + backend. */
  const [content, setContent] = useState("");

  useEffect(() => {
    // If backend indicates an entry exists today, keep the textarea empty & disable submission.
    if (todayEntry?.content) {
      setContent("");
    }
  }, [todayEntry]);

  const hasToday = Boolean(todayEntry && (todayEntry.id || todayEntry.content));
  const canSubmit = !hasToday && !loadingToday && !submitting;

  const todayStatusBadge = useMemo(() => {
    if (loadingToday) return <span className="badge">Checking…</span>;
    if (hasToday) return <span className="badge badgeSuccess">Submitted</span>;
    return <span className="badge badgePrimary">Not yet</span>;
  }, [loadingToday, hasToday]);

  return (
    <section className="card" aria-label="Daily entry form">
      <div className="cardHeader">
        <div className="cardTitleRow">
          <h2 className="cardTitle">Today’s entry</h2>
          {todayStatusBadge}
        </div>
      </div>

      <div className="cardBody">
        {hasToday ? (
          <div className="alert alertSuccess" role="status">
            You’ve already submitted today’s entry. Come back tomorrow.
          </div>
        ) : (
          <div className="helpText">
            Write one short paragraph about your day. You can’t edit after submitting.
          </div>
        )}

        <div style={{ height: 12 }} />

        <div className="formField">
          <label className="helpText" htmlFor="entry-content">
            Your journal entry
          </label>

          <textarea
            id="entry-content"
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened today? What did you learn? What will you do tomorrow?"
            disabled={hasToday || loadingToday || submitting}
          />
        </div>

        <div className="formActions">
          <button
            className="button buttonPrimary"
            onClick={() => onSubmit(content)}
            disabled={!canSubmit || content.trim().length === 0}
          >
            {submitting ? "Submitting…" : "Submit entry"}
          </button>

          <div className="helpText">
            {content.trim().length}/1000
          </div>
        </div>

        {submitSuccess && (
          <div className="alert alertSuccess" role="status">
            Saved! Your streak is updated.
          </div>
        )}

        {submitError && (
          <div className="alert alertError" role="alert">
            {submitError}
          </div>
        )}
      </div>
    </section>
  );
}
