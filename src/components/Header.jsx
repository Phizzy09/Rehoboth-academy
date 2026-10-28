import { useState, useEffect } from "react";
import useStore from "../store/useStore";

const siteLinks = [
  { name: "Home", page: "home" },
  { name: "About", page: "about" },
  { name: "Admissions", page: "admissions" },
  { name: "Contact", page: "contact" },
];
const studentLinks = [
  { name: "Fees", page: "studentFees" },
  { name: "Results", page: "studentResults" },
  { name: "Notices", page: "studentNotices" },
];
const schoolLinks = [
  { name: "Fees ledger", page: "schoolFees" },
  { name: "Results", page: "schoolResults" },
  { name: "Broadcast", page: "broadcast" },
  { name: "Applied Students", page: "schoolAdmissions" },
];
const teacherLinks = [
  { name: "Grade Sheet & Scores", page: "schoolResults" },
  { name: "Broadcast", page: "broadcast" },
];

export default function Header({ kind, active }) {
  const setPage = useStore((state) => state.setPage);
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (e, page) => {
    e.preventDefault();
    setMenuOpen(false);
    if (page) setPage(page);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    logout();
  };

  // Determine role links & badges
  let links = siteLinks;
  let chipText = "";

  if (kind !== "site") {
    if (user?.role === "teacher") {
      links = teacherLinks;
      chipText = `${user.name || "Teacher"} · Teacher (${user.id})`;
    } else if (kind === "student" || user?.role === "student") {
      links = studentLinks;
      const me = students.find((s) => user && s.id === user.id);
      chipText = `${me?.name || "Student"} · Student`;
    } else {
      links = schoolLinks;
      chipText = "School Administrator";
    }
  }

  return (
    <>
      <header className="top modern-header">
        {/* Brand */}
        <a
          href="#"
          className="brand"
          onClick={(e) => go(e, kind === "site" ? "home" : links[0]?.page || "home")}
          style={{ textDecoration: "none" }}
        >
          Rehoboth Academy
        </a>

        {/* Desktop Nav */}
        <nav className="nav-desktop">
          {links.map((link) => (
            <a
              key={link.name || link.page}
              className={active === link.page ? "l on" : "l"}
              href="#"
              onClick={(e) => go(e, link.page)}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions-desktop">
          {chipText && (
            <span className="header-chip" title={chipText}>
              {chipText}
            </span>
          )}

          {kind === "site" ? (
            <a className="btn o" href="#" onClick={(e) => go(e, "login")}>
              Portal sign in
            </a>
          ) : (
            <a className="btn o" href="#" onClick={handleLogout}>
              Log out
            </a>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={`hamburger-btn ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line top-line" />
          <span className="hamburger-line mid-line" />
          <span className="hamburger-line bot-line" />
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      <div className={`mobile-nav-drawer ${menuOpen ? "open" : ""}`}>
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <div className="mobile-nav-panel">
          <div className="mobile-nav-header">
            <div>
              <span className="mobile-nav-brand">Rehoboth Academy</span>
              {chipText && <div className="mobile-role-text">{chipText}</div>}
            </div>
            <button
              type="button"
              className="mobile-close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-nav-links">
            {links.map((link) => (
              <a
                key={link.name || link.page}
                className={`mobile-nav-link ${active === link.page ? "active" : ""}`}
                href="#"
                onClick={(e) => go(e, link.page)}
              >
                <span>{link.name}</span>
                {active === link.page && <span className="active-dot">•</span>}
              </a>
            ))}
          </div>

          <div className="mobile-nav-footer">
            {kind === "site" ? (
              <a
                className="btn"
                href="#"
                style={{ width: "100%", textAlign: "center", display: "flex", justifyContent: "center" }}
                onClick={(e) => go(e, "login")}
              >
                Portal sign in (Staff / Student)
              </a>
            ) : (
              <button
                type="button"
                className="btn o"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleLogout}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
