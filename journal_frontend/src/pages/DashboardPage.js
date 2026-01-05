import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EntryFormCard } from "../components/EntryFormCard";
import { StreakCard } from "../components/StreakCard";
import { getStreak, getTodayEntry, submitEntry } from "../services/api";

function normalizeStreak(payload) {
  if (payload == null) return null;
  if (typeof payload === "number") return payload;
  if (typeof payload?.streak === "number") return payload.streak;
  if (typeof payload?.count === "number") return payload.count;
  return null;
}

function normalizeEntry(payload) {
  if (!payload) return null;
  if (payload?.entry) return payload.entry;
  return payload;
}

function formatError(err) {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  return err.message || "Request failed";
}

// PUBLIC_INTERFACE
export function DashboardPage() {
  /** Main dashboard: streak + daily entry form. */
  const [streak, setStreak] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState("");

  const [todayEntry, setTodayEntry] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const refresh = useCallback(async () => {
    setSubmitSuccess(false);

    setStreakLoading(true);
    setStreakError("");
    setTodayLoading(true);
    setTodayError("");

    try {
      const [streakPayload, todayPayload] = await Promise.allSettled([
        getStreak(),
        getTodayEntry()
      ]);

      if (streakPayload.status === "fulfilled") {
        setStreak(normalizeStreak(streakPayload.value));
      } else {
        setStreakError(formatError(streakPayload.reason));
      }

      if (todayPayload.status === "fulfilled") {
        setTodayEntry(normalizeEntry(todayPayload.value));
      } else {
        // Some backends return 404 for no entry; treat as "none".
        const status = todayPayload.reason?.status;
        if (status === 404) {
          setTodayEntry(null);
        } else {
          setTodayError(formatError(todayPayload.reason));
        }
      }
    } finally {
      setStreakLoading(false);
      setTodayLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const combinedStreakError = useMemo(() => {
    if (streakError) return streakError;
    if (todayError) return todayError;
    return "";
  }, [streakError, todayError]);

  // PUBLIC_INTERFACE
  const handleSubmit = useCallback(
    async (content) => {
      setSubmitError("");
      setSubmitSuccess(false);

      const trimmed = String(content || "").trim();
      if (trimmed.length === 0) {
        setSubmitError("Please write something before submitting.");
        return;
      }
      if (trimmed.length > 1000) {
        setSubmitError("Entry is too long. Please keep it under 1000 characters.");
        return;
      }

      setSubmitting(true);
      try {
        await submitEntry(trimmed);
        setSubmitSuccess(true);
        await refresh();
      } catch (err) {
        // If backend indicates already submitted, surface a friendly message.
        if (err?.status === 409) {
          setSubmitError("You already submitted an entry for today.");
        } else {
          setSubmitError(formatError(err));
        }
      } finally {
        setSubmitting(false);
      }
    },
    [refresh]
  );

  return (
    <div className="mainGrid">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <EntryFormCard
          todayEntry={todayEntry}
          loadingToday={todayLoading}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <StreakCard
          streak={streak}
          loading={streakLoading || todayLoading}
          error={combinedStreakError}
        />

        <section className="card" aria-label="Tips">
          <div className="cardHeader">
            <div className="cardTitleRow">
              <h2 className="cardTitle">Quick prompts</h2>
              <span className="badge badgeSuccess">Optional</span>
            </div>
          </div>
          <div className="cardBody">
            <div className="helpText">
              If you’re stuck, answer one:
              <ul>
                <li>What went well today?</li>
                <li>What was challenging?</li>
                <li>What will I do differently tomorrow?</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
