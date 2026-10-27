import { useState, useCallback } from "react";
import useStore from "../store/useStore";
import Header from "../components/Header";
import EmailDispatchModal from "../components/EmailDispatchModal";
import { ordinal, grade, chipGradeClass } from "../utils";
import { SUBJECTS } from "../data/data";

// ─── constants ────────────────────────────────────────────────
const CLASSES = ["Primary 4", "Primary 5", "JSS 1", "JSS 2", "SS 1", "SS 2"];

// ─── helpers ──────────────────────────────────────────────────
function clamp(val, max) {
  const n = Number(val);
  if (isNaN(n) || val === "") return "";
  return Math.max(0, Math.min(max, Math.round(n)));
}

// ─── Add Student Modal ────────────────────────────────────────
function AddStudentModal({ defaultClass, onAdd, onClose, nextSuggestedId }) {
  const [name, setName] = useState("");
  const [className, setClassName] = useState(defaultClass || CLASSES[0]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Student full name is required.");
      return;
    }
    const cleanEmail = email.trim() || `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, "")}@gmail.com`;
    onAdd({
      name: name.trim(),
      className,
      email: cleanEmail,
      id: nextSuggestedId,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-head">
          <h2 style={{ fontSize: "22px", color: "#0f5c47", margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Add Student &amp; Auto-Generate ID
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="m" style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.45" }}>
          Register a new student. Their <b>Student ID is auto-generated</b> and portal credentials (with default password <b>1234</b>) will be automatically dispatched to their email.
        </p>

        {/* Auto-Generated ID Banner */}
        <div
          style={{
            background: "#f0f7f4",
            border: "1.5px solid #a3cfbb",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#456155", textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Next Auto-Generated Student ID
            </span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f5c47", letterSpacing: "0.5px" }}>
              {nextSuggestedId}
            </span>
          </div>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "99px",
              background: "#dcfce7",
              color: "#15803d",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            ✨ System Auto-Generated
          </span>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #f87171", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", color: "#b91c1c", fontSize: "14px" }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <label>
            Student Full Name *
            <input
              type="text"
              placeholder="e.g. Adaobi Chidera Nwosu"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
                if (!email && e.target.value) {
                  setEmail(`${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")}@gmail.com`);
                }
              }}
              autoFocus
              required
            />
          </label>

          <label>
            Class *
            <select value={className} onChange={(e) => setClassName(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            Student / Parent Email Address *
            <input
              type="email"
              placeholder="e.g. parent.nwosu@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="m" style={{ fontSize: "12px", marginTop: "4px", display: "block" }}>
              📨 Student ID (<b>{nextSuggestedId}</b>) and default password (<b>1234</b>) will be delivered here.
            </span>
          </label>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "14px" }}>
            <button type="button" className="btn o" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" style={{ background: "#0f5c47" }}>
              ➕ Register &amp; Send Credentials Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Dispatch History Modal ───────────────────────────────────
function DispatchHistoryModal({ dispatches, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1150 }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
        <div className="modal-head">
          <h2 style={{ fontSize: "22px", color: "#0f5c47", margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Dispatched Student Credentials Log
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="m" style={{ margin: "0 0 16px", fontSize: "14px" }}>
          Log of auto-generated Student IDs and default credentials sent to students/parents via email.
        </p>

        {dispatches.length === 0 ? (
          <p className="m" style={{ textAlign: "center", padding: "30px 0" }}>No email credentials dispatched in this session yet.</p>
        ) : (
          <div style={{ maxHeight: "380px", overflowY: "auto", border: "1px solid #d8e1dc", borderRadius: "8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
              <thead style={{ background: "#f5f7f5", position: "sticky", top: 0 }}>
                <tr>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Student</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Student ID</th>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Recipient Email</th>
                  <th style={{ padding: "10px 12px", textAlign: "center" }}>Default PIN</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #e6ece8" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{d.studentName}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <code style={{ background: "#e1f0ea", color: "#0b4a39", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        {d.studentId}
                      </code>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#4a5d55" }}>{d.email}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}><b>{d.defaultPassword}</b></td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <span style={{ color: "#15803d", fontWeight: 600, fontSize: "12px" }}>✓ Delivered</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <button type="button" className="btn" onClick={onClose} style={{ background: "#0f5c47" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Build the grade-sheet grid: rows = students, computed totals/positions
function buildSheet(students, results, className) {
  const subjects = SUBJECTS[className] || [];
  const classStudents = students.filter((s) => s.className === className);

  const rows = classStudents.map((s) => {
    const subjectScores = subjects.map((sub) => {
      const r = results.find((r) => r.studentId === s.id && r.subject === sub);
      return { subject: sub, ca: r?.ca ?? "", exam: r?.exam ?? "" };
    });
    const scored = subjectScores.filter((sc) => sc.ca !== "" && sc.exam !== "");
    const totalScore = scored.reduce((sum, sc) => sum + Number(sc.ca) + Number(sc.exam), 0);
    const average = scored.length ? Math.round(totalScore / scored.length) : null;
    return { id: s.id, name: s.name, scores: subjectScores, average, ready: scored.length === subjects.length };
  });

  // Rank by average descending
  const ranked = [...rows].sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
  ranked.forEach((r, i) => (r.position = r.ready ? ordinal(i + 1) : "—"));

  // Merge position back by id
  const posMap = Object.fromEntries(ranked.map((r) => [r.id, r.position]));
  rows.forEach((r) => (r.position = posMap[r.id]));

  return { subjects, rows };
}

// ─── CSV Upload modal ─────────────────────────────────────────
function CsvModal({ className, onImport, onClose }) {
  const [status, setStatus] = useState("idle");
  const [rows, setRows] = useState([]);
  const [errMsg, setErrMsg] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split(/\r?\n/);
      if (lines.length < 2) { setErrMsg("File is empty."); setStatus("error"); return; }
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idCol = header.findIndex((h) => h.includes("id") || h.includes("student"));
      const subCol = header.findIndex((h) => h.includes("subject"));
      const caCol = header.findIndex((h) => h === "ca" || h.includes("continuous"));
      const exCol = header.findIndex((h) => h === "exam" || h.includes("examination"));
      if ([idCol, subCol, caCol, exCol].some((c) => c < 0)) {
        setErrMsg("Need columns: studentId, subject, ca, exam"); setStatus("error"); return;
      }
      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (!cols[idCol]) continue;
        parsed.push({ studentId: cols[idCol].toUpperCase(), subject: cols[subCol], ca: Number(cols[caCol]), exam: Number(cols[exCol]) });
      }
      if (!parsed.length) { setErrMsg("No data rows found."); setStatus("error"); return; }
      setRows(parsed); setStatus("preview");
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: "20px" }}>Upload CSV — {className}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="m" style={{ margin: "0 0 12px" }}>
          File must have columns: <b>studentId</b>, <b>subject</b>, <b>ca</b>, <b>exam</b>
        </p>
        <div style={{ border: "2px dashed #c8ddd3", borderRadius: "10px", padding: "28px", textAlign: "center", marginBottom: "16px" }}>
          <input type="file" accept=".csv,.txt" style={{ display: "none" }} id="csv-input" onChange={handleFile} />
          <label htmlFor="csv-input" className="btn o" style={{ cursor: "pointer" }}>Choose file</label>
          <p className="m" style={{ margin: "8px 0 0" }}>CSV or plain-text</p>
        </div>
        {status === "error" && (
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "#7a4b00" }}>⚠ {errMsg}</div>
        )}
        {status === "preview" && (
          <>
            <p className="m" style={{ marginBottom: "8px" }}>Preview — {rows.length} rows</p>
            <div style={{ overflowY: "auto", maxHeight: "200px", marginBottom: "16px" }}>
              <table>
                <thead><tr><th>Student ID</th><th>Subject</th><th className="n">CA</th><th className="n">Exam</th></tr></thead>
                <tbody>
                  {rows.slice(0, 15).map((r, i) => (
                    <tr key={i}><td>{r.studentId}</td><td>{r.subject}</td><td className="n">{r.ca}</td><td className="n">{r.exam}</td></tr>
                  ))}
                  {rows.length > 15 && <tr><td colSpan={4} className="m">…and {rows.length - 15} more</td></tr>}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn o" onClick={() => setStatus("idle")}>Re-upload</button>
              <button className="btn" onClick={() => { onImport(rows); onClose(); }}>Import {rows.length} rows</button>
            </div>
          </>
        )}
        {status !== "preview" && (
          <div style={{ textAlign: "right" }}>
            <button className="btn o" onClick={onClose}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function SchoolResultsPage() {
  const students = useStore((s) => s.students);
  const results = useStore((s) => s.results);
  const released = useStore((s) => s.released);
  const releaseResults = useStore((s) => s.releaseResults);
  const unreleaseResults = useStore((s) => s.unreleaseResults);
  const setScore = useStore((s) => s.setScore);
  const bulkImportScores = useStore((s) => s.bulkImportScores);
  const addStudent = useStore((s) => s.addStudent);
  const latestDispatch = useStore((s) => s.latestDispatch);
  const clearLatestDispatch = useStore((s) => s.clearLatestDispatch);
  const emailDispatches = useStore((s) => s.emailDispatches) || [];

  const [selectedClass, setSelectedClass] = useState("JSS 1");
  const [showCsv, setShowCsv] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDispatchHistory, setShowDispatchHistory] = useState(false);
  const [toast, setToast] = useState("");
  // local draft edits: { "STU-001|Mathematics|ca": 28, ... }
  const [drafts, setDrafts] = useState({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Calculate next suggested student ID (e.g. STU-014)
  const existingNums = students
    .map((s) => {
      const m = s.id?.match(/STU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const nextNum = existingNums.length ? Math.max(...existingNums) + 1 : 14;
  const nextSuggestedId = `STU-${String(nextNum).padStart(3, "0")}`;

  const handleAddStudent = (newStudentData) => {
    addStudent(newStudentData);
    if (newStudentData.className !== selectedClass) {
      setSelectedClass(newStudentData.className);
    }
    showToast(`✓ Added ${newStudentData.name} to ${newStudentData.className}`);
  };

  // Build the live sheet, merging saved results with unsaved drafts
  const draftsAsResults = Object.entries(drafts).map(([key, val]) => {
    const [studentId, subject, field] = key.split("|");
    return { studentId, subject, field, val };
  });

  // Merge: start with DB results then apply drafts on top
  const mergedResults = results.map((r) => {
    const caKey = `${r.studentId}|${r.subject}|ca`;
    const examKey = `${r.studentId}|${r.subject}|exam`;
    return {
      ...r,
      ca: caKey in drafts ? drafts[caKey] : r.ca,
      exam: examKey in drafts ? drafts[examKey] : r.exam,
    };
  });
  // Add rows from drafts that don't exist in results yet
  draftsAsResults.forEach(({ studentId, subject, field, val }) => {
    if (!mergedResults.find((r) => r.studentId === studentId && r.subject === subject)) {
      mergedResults.push({ studentId, subject, ca: field === "ca" ? val : "", exam: field === "exam" ? val : "" });
    }
  });

  const { subjects, rows } = buildSheet(students, mergedResults, selectedClass);

  const hasDrafts = Object.keys(drafts).length > 0;

  // Called on every keystroke
  const handleChange = useCallback((studentId, subject, field, rawVal) => {
    const max = field === "ca" ? 40 : 60;
    const clamped = rawVal === "" ? "" : clamp(rawVal, max);
    setDrafts((prev) => ({ ...prev, [`${studentId}|${subject}|${field}`]: clamped }));
  }, []);

  // Save all drafts to the store at once
  const handleSaveAll = () => {
    // Group drafts by (studentId, subject)
    const grouped = {};
    Object.entries(drafts).forEach(([key, val]) => {
      const [studentId, subject, field] = key.split("|");
      const k = `${studentId}|${subject}`;
      grouped[k] = grouped[k] || { studentId, subject };
      grouped[k][field] = val;
    });
    Object.values(grouped).forEach(({ studentId, subject, ca, exam }) => {
      // Only save if both fields have a value (don't overwrite good data with blank)
      const savedCa = ca !== undefined ? ca : results.find((r) => r.studentId === studentId && r.subject === subject)?.ca;
      const savedExam = exam !== undefined ? exam : results.find((r) => r.studentId === studentId && r.subject === subject)?.exam;
      if (savedCa !== undefined && savedCa !== "" && savedExam !== undefined && savedExam !== "") {
        setScore(studentId, subject, Number(savedCa), Number(savedExam));
      }
    });
    setDrafts({});
    showToast(`✓ All scores saved for ${selectedClass}`);
  };

  const handleDiscard = () => { setDrafts({}); showToast("Changes discarded"); };

  const handleImport = (importedRows) => {
    bulkImportScores(importedRows);
    setDrafts({});
    showToast(`✓ Imported ${importedRows.length} score rows`);
  };

  // Stats
  const ready = rows.filter((r) => r.ready).length;
  const missing = rows.length - ready;
  const classAvg = rows.filter((r) => r.average !== null).length
    ? Math.round(rows.filter((r) => r.average !== null).reduce((s, r) => s + r.average, 0) / rows.filter((r) => r.average !== null).length)
    : null;

  return (
    <div className="pg p-SchoolResults">
      <Header kind="school" active="schoolResults" />
      {toast && <div className="toast">{toast}</div>}

      <div className="gs-wrap">
        {/* ── Top bar ── */}
        <div className="gs-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: "26px", margin: 0 }}>Grade Sheet · First Term</h1>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
              Class:
              <select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setDrafts({}); }}
                style={{ minWidth: "120px", minHeight: "38px", padding: "4px 10px", border: "1.5px solid #9fb0a8", borderRadius: "8px", font: "inherit", background: "#fff" }}
              >
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>

            {/* Live stats */}
            <span className="chip">{ready}/{rows.length} complete</span>
            {missing > 0 && <span className="chip a">{missing} pending</span>}
            {classAvg !== null && <span className="chip" style={{ background: "#e8f3ff", color: "#1a4a80" }}>Class avg: {classAvg}%</span>}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              className="btn"
              onClick={() => setShowAddStudent(true)}
              style={{ background: "#0f5c47" }}
              title="Add a new pupil to this class"
            >
              ➕ Add Student
            </button>
            {emailDispatches.length > 0 && (
              <button
                type="button"
                className="btn o"
                onClick={() => setShowDispatchHistory(true)}
                title="View log of auto-generated Student IDs sent to student emails"
                style={{ borderColor: "#0f5c47", color: "#0f5c47" }}
              >
                📨 Dispatched Credentials ({emailDispatches.length})
              </button>
            )}
            <button className="btn o" onClick={() => setShowCsv(true)}>↑ Upload CSV</button>
            <a
              className="btn o"
              href={`data:text/csv;charset=utf-8,studentId,subject,ca,exam\n${students.filter((s) => s.className === selectedClass)
                  .flatMap((s) => (SUBJECTS[selectedClass] || []).map((sub) => `${s.id},${sub},,`))
                  .join("\n")
                }`}
              download={`${selectedClass.replace(/ /g, "-")}-template.csv`}
            >
              ↓ Template
            </a>
            {hasDrafts && (
              <>
                <button className="btn o" onClick={handleDiscard} style={{ borderColor: "#c0392b", color: "#c0392b" }}>Discard</button>
                <button className="btn" onClick={handleSaveAll}>Save all changes</button>
              </>
            )}

            {released ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="chip" style={{ background: "#e1f0ea", color: "#0b4a39", fontWeight: 700, padding: "8px 14px" }}>
                  ✓ Released to Students
                </span>
                <button
                  type="button"
                  className="btn o"
                  style={{ padding: "6px 10px", fontSize: "12px", minHeight: "36px", color: "#666", borderColor: "#ccc" }}
                  onClick={() => { unreleaseResults(); showToast("Results unreleased (hidden from students)"); }}
                  title="Hide results from students"
                >
                  Unrelease
                </button>
              </div>
            ) : (
              <button
                className="btn"
                onClick={() => { releaseResults(); showToast("✓ Results and positions released to students!"); }}
                style={{ background: "#0f5c47" }}
              >
                📢 Release to students
              </button>
            )}
          </div>
        </div>

        {released && (
          <div style={{ background: "#eef8f4", border: "1px solid #a3d9c7", borderRadius: "8px", padding: "10px 16px", marginBottom: "12px", fontSize: "14px", color: "#0b4a39" }}>
            📢 <b>Results & Class Positions are Live:</b> Positions and report cards are currently visible to students on their portal.
          </div>
        )}

        {hasDrafts && (
          <div className="gs-unsaved-banner">
            ✏ You have unsaved changes — click <b>Save all changes</b> to commit them.
          </div>
        )}

        {/* ── Grade-sheet table ── */}
        <div className="gs-scroll">
          <table className="gs-table">
            <thead>
              <tr>
                <th className="gs-sticky gs-th-name">Student</th>
                {subjects.map((sub) => (
                  <th key={sub} colSpan={2} className="gs-th-sub">{sub}</th>
                ))}
                <th className="gs-th-summary">Total</th>
                <th className="gs-th-summary">Avg</th>
                <th className="gs-th-summary">Grade</th>
                <th className="gs-th-summary">Pos</th>
              </tr>
              <tr className="gs-sub-header">
                <th className="gs-sticky gs-th-name" />
                {subjects.map((sub) => (
                  <><th key={`${sub}-ca`} className="gs-sub-label">CA<span>/40</span></th>
                    <th key={`${sub}-ex`} className="gs-sub-label">Exam<span>/60</span></th></>
                ))}
                <th /><th /><th /><th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const scoredSubjects = row.scores.filter((sc) => sc.ca !== "" && sc.exam !== "");
                const totalScore = scoredSubjects.reduce((s, sc) => s + Number(sc.ca) + Number(sc.exam), 0);
                const avg = scoredSubjects.length ? Math.round(totalScore / scoredSubjects.length) : null;
                return (
                  <tr key={row.id} className={row.ready ? "" : "gs-row-missing"}>
                    <td className="gs-sticky gs-td-name">
                      <div className="gs-student-name">{row.name}</div>
                      {!row.ready && <div className="gs-missing-label">scores pending</div>}
                    </td>
                    {row.scores.map((sc) => {
                      const caKey = `${row.id}|${sc.subject}|ca`;
                      const examKey = `${row.id}|${sc.subject}|exam`;
                      const caVal = caKey in drafts ? drafts[caKey] : sc.ca;
                      const examVal = examKey in drafts ? drafts[examKey] : sc.exam;
                      const subTotal = (caVal !== "" && examVal !== "") ? Number(caVal) + Number(examVal) : null;
                      return (
                        <>
                          <td key={`${row.id}-${sc.subject}-ca`} className="gs-score-cell">
                            <input
                              type="number" min="0" max="40"
                              value={caVal}
                              placeholder="—"
                              className={`gs-input${caKey in drafts ? " gs-draft" : ""}`}
                              onChange={(e) => handleChange(row.id, sc.subject, "ca", e.target.value)}
                            />
                            {subTotal !== null && (
                              <div className="gs-sub-total" style={{ color: subTotal >= 50 ? "#0f5c47" : "#c0392b" }}>
                                {subTotal}
                              </div>
                            )}
                          </td>
                          <td key={`${row.id}-${sc.subject}-exam`} className="gs-score-cell">
                            <input
                              type="number" min="0" max="60"
                              value={examVal}
                              placeholder="—"
                              className={`gs-input${examKey in drafts ? " gs-draft" : ""}`}
                              onChange={(e) => handleChange(row.id, sc.subject, "exam", e.target.value)}
                            />
                          </td>
                        </>
                      );
                    })}
                    <td className="gs-summary-cell"><b>{scoredSubjects.length > 0 ? totalScore : "—"}</b></td>
                    <td className="gs-summary-cell">{avg !== null ? `${avg}%` : "—"}</td>
                    <td className="gs-summary-cell">
                      {avg !== null && <span className={chipGradeClass(avg)}>{grade(avg)}</span>}
                    </td>
                    <td className="gs-summary-cell gs-position">{row.position}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={subjects.length * 2 + 5} style={{ padding: "12px 16px", background: "#f8faf9", borderTop: "1.5px solid #d8e1dc" }}>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setShowAddStudent(true)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700 }}
                  >
                    ➕ Add another pupil to {selectedClass}
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── Footer legend ── */}
        <div className="gs-footer">
          <span className="m">CA max 40 · Exam max 60 · Total 100 · Grade: A ≥70, B ≥60, C ≥50, D &lt;50</span>
          <span className="m">Positions update live as you type. Click <b>Save all changes</b> to commit.</span>
        </div>
      </div>

      {showCsv && (
        <CsvModal className={selectedClass} onImport={handleImport} onClose={() => setShowCsv(false)} />
      )}

      {showAddStudent && (
        <AddStudentModal
          defaultClass={selectedClass}
          nextSuggestedId={nextSuggestedId}
          onAdd={handleAddStudent}
          onClose={() => setShowAddStudent(false)}
        />
      )}

      {latestDispatch && (
        <EmailDispatchModal dispatch={latestDispatch} onClose={clearLatestDispatch} />
      )}

      {showDispatchHistory && (
        <DispatchHistoryModal dispatches={emailDispatches} onClose={() => setShowDispatchHistory(false)} />
      )}
    </div>
  );
}
