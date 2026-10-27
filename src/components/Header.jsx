import { useState } from "react";
import useStore from "../store/useStore";
import FirebaseStatusModal from "./FirebaseStatusModal";

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
const chipStyle = { padding: "4px 12px", borderRadius: 99, background: "#e1f0ea", color: "#0b4a39", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" };

// kind = "site", "student", "teacher", or "school". active = the page that is open now.
export default function Header({ kind, active }) {
  const setPage = useStore((state) => state.setPage);
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const firebaseStatus = useStore((state) => state.firebaseStatus);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  const go = (e, page) => {
    e.preventDefault();
    if (page) setPage(page);
  };

  if (kind === "site") {
    return (
      <header className="top">
        <span className="brand">Rehoboth Academy</span>
        <nav>
          {siteLinks.map((link) => (
            <a key={link.name} className={active === link.page ? "l on" : "l"} href="#" onClick={(e) => go(e, link.page)}>
              {link.name}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setShowFirebaseModal(true)}
            title="Click to check Firebase Cloud connection & rules"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: "99px",
              background: firebaseStatus === "connected" ? "#f0fdf4" : firebaseStatus === "permission-denied" ? "#fef2f2" : "#fff7ed",
              color: firebaseStatus === "connected" ? "#16a34a" : firebaseStatus === "permission-denied" ? "#dc2626" : "#ea580c",
              border: `1px solid ${firebaseStatus === "connected" ? "#86efac" : firebaseStatus === "permission-denied" ? "#fca5a5" : "#fed7aa"}`,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: firebaseStatus === "connected" ? "#16a34a" : firebaseStatus === "permission-denied" ? "#dc2626" : "#ea580c",
              }}
            />
            {firebaseStatus === "connected" ? "✓ Firebase Live" : firebaseStatus === "permission-denied" ? "⚠️ Firebase Blocked" : "🔥 Firebase"}
          </button>
          <a className="btn o" href="#" onClick={(e) => go(e, "login")}>Portal sign in (Staff / Student)</a>
        </div>
        {showFirebaseModal && <FirebaseStatusModal onClose={() => setShowFirebaseModal(false)} />}
      </header>
    );
  }

  // Determine role links & badges
  let links = schoolLinks;
  let chipText = "School ID · can edit";

  if (user?.role === "teacher") {
    links = teacherLinks;
    chipText = `${user.name || "Teacher"} · Teacher (${user.id})`;
  } else if (kind === "student" || user?.role === "student") {
    links = studentLinks;
    const me = students.find((s) => user && s.id === user.id);
    chipText = (me?.name || "Student") + " · Student · view only";
  }

  return (
    <header className="top">
      <span className="brand">Rehoboth Academy</span>
      <nav>
        {links.map((link) => (
          <a key={link.page} className={active === link.page ? "on" : ""} href="#" onClick={(e) => go(e, link.page)}>
            {link.name}
          </a>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          type="button"
          onClick={() => setShowFirebaseModal(true)}
          title="Click to check Firebase Cloud connection & rules"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "99px",
            background: firebaseStatus === "connected" ? "#f0fdf4" : firebaseStatus === "permission-denied" ? "#fef2f2" : "#fff7ed",
            color: firebaseStatus === "connected" ? "#16a34a" : firebaseStatus === "permission-denied" ? "#dc2626" : "#ea580c",
            border: `1px solid ${firebaseStatus === "connected" ? "#86efac" : firebaseStatus === "permission-denied" ? "#fca5a5" : "#fed7aa"}`,
            cursor: "pointer",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: firebaseStatus === "connected" ? "#16a34a" : firebaseStatus === "permission-denied" ? "#dc2626" : "#ea580c",
            }}
          />
          {firebaseStatus === "connected" ? "✓ Firebase Live" : firebaseStatus === "permission-denied" ? "⚠️ Firebase Blocked" : "🔥 Firebase"}
        </button>
        <span style={chipStyle}>{chipText}</span>
      </div>
      <a className="btn o" href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Log out</a>
      {showFirebaseModal && <FirebaseStatusModal onClose={() => setShowFirebaseModal(false)} />}
    </header>
  );
}
