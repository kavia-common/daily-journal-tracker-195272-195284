import React from "react";

// PUBLIC_INTERFACE
export function StreakCard({ streak, loading, error }) {
  /** Displays current streak prominently. */
  return (
    <section className="card" aria-label="Streak overview">
      <div className="cardHeader">
        <div className="cardTitleRow">
          <h2 className="cardTitle">Streak</h2>
          <span className="badge badgePrimary" title="Consecutive days with an entry">
            Current
          </span>
        </div>
      </div>
      <div className="cardBody">
        <div className="kpiRow">
          <div className="kpi">
            <div className="kpiLabel">Current streak</div>
            <div className="kpiValue">
              {loading ? <div className="skeleton" style={{ height: 24 }} /> : streak ?? "—"}
            </div>
            <div className="kpiHint">Keep writing daily to maintain it.</div>
          </div>

          <div className="kpi">
            <div className="kpiLabel">Status</div>
            <div className="kpiValue" style={{ fontSize: 14, marginTop: 10 }}>
              {loading && <span className="badge">Loading…</span>}
              {!loading && !error && <span className="badge badgeSuccess">Online</span>}
              {!loading && error && <span className="badge badgeError">Backend error</span>}
            </div>
            <div className="kpiHint">
              {error ? error : "Connected and ready."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
