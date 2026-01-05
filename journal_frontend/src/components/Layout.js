import React from "react";
import { NavLink } from "react-router-dom";
import { getApiInfo } from "../services/api";

// PUBLIC_INTERFACE
export function Layout({ children }) {
  /** App shell with top navigation. */
  const api = getApiInfo();

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="container topbarInner">
          <div className="brand">
            <div className="brandTitle">Daily Journal Tracker</div>
            <div className="brandSub">API: {api.baseUrl}</div>
          </div>

          <nav className="nav" aria-label="Primary navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navLink ${isActive ? "navLinkActive" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `navLink ${isActive ? "navLinkActive" : ""}`
              }
            >
              History / Review
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer className="container footer">
        One entry per day • Built with React • Errors are shown inline
      </footer>
    </div>
  );
}
