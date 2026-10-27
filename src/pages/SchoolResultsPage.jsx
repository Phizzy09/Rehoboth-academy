import { useState, useMemo, useCallback } from "react";
import useStore from "../store/useStore";
import Header from "../components/Header";
import EmailDispatchModal from "../components/EmailDispatchModal";
import { ordinal, grade, chipGradeClass } from "../utils";
import { SUBJECTS } from "../data/data";

const CLASSES = ["Primary 4", "Primary 5", "JSS 1", "JSS 2", "SS 1", "SS 2"];

function clamp(val, max) {
  const n = Number(val);
  if (isNaN(n) || val === "") return "";
  return Math.max(0, Math.min(max, Math.round(n)));
}

function getRemark(score) {
  if (score === null || score === undefined || score === "") return "—";
  const n = Number(score);
  if (n >= 75) return "Excellent";
  if (n >= 65) return "Very Good";
  if (n >= 50) return "Credit Pass";
  if (n >= 40) return "Pass";
  return "Needs Improvement";
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div className="modal-head">
          <h2 style={{ fontSize: "22px", color: "#0f5c47", margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Add Student to Class
          </h2>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="m" style={{ margin: "0 0 16px", fontSize: "14px" }}>
          Register a new student. Their <b>Student ID is auto-generated</b> and portal credentials (PIN <b>1234</b>) will be dispatched to their email.
        </p>

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
            <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#456155", textTransform: "uppercase" }}>
              Next Auto-Generated Student ID
            </span>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f5c47" }}>
              {nextSuggestedId}
            </span>
          </div>
          <span style={{ padding: "4px 10px", borderRadius: "99px", background: "#dcfce7", color: "#15803d", fontSize: "12px", fontWeight: 700 }}>
            ✨ Auto-Assigned
          </span>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #f87171", borderRadius: "8px", padding: "10px", marginBottom: "14px", color: "#b91c1c", fontSize: "13.5px" }}>
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
          </label>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="button" className="btn o" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" style={{ background: "#0f5c47" }}>
              ➕ Register &amp; Send Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Single Student Quick Edit Modal ──────────────────────────
function StudentScoreModal({ student, subjects, currentResults, onSave, onClose }) {
  const [localScores, setLocalScores] = useState(() => {
    const map = {};
    subjects.forEach((sub) => {
      const match = currentResults.find((r) => r.studentId === student.id && r.subject === sub);
      map[sub] = { ca: match?.ca ?? "", exam: match?.exam ?? "" };
    });
    return map;
  });

  const handleChange = (sub, field, rawVal) => {
    const max = field === "ca" ? 40 : 60;
    const clamped = rawVal === "" ? "" : clamp(rawVal, max);
    setLocalScores((prev) => ({
      ...prev,
      [sub]: { ...prev[sub], [field]: clamped },
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const rows = [];
    Object.entries(localScores).forEach(([sub, { ca, exam }]) => {
      if (ca !== "" && exam !== "") {
        rows.push({ studentId: student.id, subject: sub, ca: Number(ca), exam: Number(exam) });
      }
    });
    onSave(rows);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="modal-head">
          <div>
            <h2 style={{ fontSize: "22px", color: "#0f5c47", margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Edit Scores: {student.name}
            </h2>
            <span className="m" style={{ fontSize: "13px" }}>ID: <b>{student.id}</b> · Class: <b>{student.className}</b></span>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: "grid", gap: "10px", margin: "16px 0" }}>
            {subjects.map((sub) => {
              const ca = localScores[sub]?.ca ?? "";
              const exam = localScores[sub]?.exam ?? "";
              const total = ca !== "" && exam !== "" ? Number(ca) + Number(exam) : null;
              return (
                <div
                  key={sub}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 90px 90px 80px",
                    gap: "12px",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#f9fbfa",
                    border: "1px solid #e2ece7",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{sub}</div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#4a5d55", margin: 0 }}>CA (/40)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={ca}
                      placeholder="—"
                      className="clean-score-input"
                      style={{ width: "100%", height: "36px" }}
                      onChange={(e) => handleChange(sub, "ca", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "#4a5d55", margin: 0 }}>Exam (/60)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={exam}
                      placeholder="—"
                      className="clean-score-input"
                      style={{ width: "100%", height: "36px" }}
                      onChange={(e) => handleChange(sub, "exam", e.target.value)}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <label style={{ fontSize: "11px", color: "#4a5d55", margin: 0 }}>Total</label>
                    <div style={{ fontWeight: 800, fontSize: "15px", color: total !== null && total >= 50 ? "#0f5c47" : "#c0392b" }}>
                      {total !== null ? `${total}%` : "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", borderTop: "1px solid #e2ece7", paddingTop: "14px" }}>
            <button type="button" className="btn o" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" style={{ background: "#0f5c47" }}>Save Student Scores</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Student Official Report Slip Modal ───────────────────────
function StudentReportModal({ student, rank, totalPupils, subjects, currentResults, classAvg, onClose }) {
  const scored = subjects.map((sub) => {
    const r = currentResults.find((x) => x.studentId === student.id && x.subject === sub);
    const ca = r?.ca ?? "";
    const exam = r?.exam ?? "";
    const total = ca !== "" && exam !== "" ? Number(ca) + Number(exam) : null;
    return { subject: sub, ca, exam, total, grade: total !== null ? grade(total) : "—", remark: getRemark(total) };
  });

  const validScores = scored.filter((s) => s.total !== null);
  const totalScore = validScores.reduce((s, it) => s + it.total, 0);
  const avg = validScores.length ? Math.round(totalScore / validScores.length) : null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "2px solid #0f5c47", paddingBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#0f5c47", margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Rehoboth Academy
            </h2>
            <span style={{ fontSize: "13px", color: "#4a5d55", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
              First Term Official Student Report Card
            </span>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Student Metadata Card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", background: "#f8faf9", padding: "12px 16px", borderRadius: "8px", border: "1px solid #d8e1dc", marginBottom: "16px", fontSize: "13.5px" }}>
          <div><span style={{ color: "#566b62", display: "block", fontSize: "11px" }}>STUDENT NAME</span><b>{student.name}</b></div>
          <div><span style={{ color: "#566b62", display: "block", fontSize: "11px" }}>STUDENT ID</span><b>{student.id}</b></div>
          <div><span style={{ color: "#566b62", display: "block", fontSize: "11px" }}>CLASS</span><b>{student.className}</b></div>
          <div><span style={{ color: "#566b62", display: "block", fontSize: "11px" }}>CLASS POSITION</span><b style={{ color: "#0f5c47", fontSize: "15px" }}>{ordinal(rank)} of {totalPupils}</b></div>
          <div><span style={{ color: "#566b62", display: "block", fontSize: "11px" }}>PUPIL AVERAGE</span><b style={{ color: "#0f5c47", fontSize: "15px" }}>{avg !== null ? `${avg}%` : "—"}</b></div>
        </div>

        {/* Subject Score Table */}
        <table className="clean-table" style={{ marginBottom: "16px" }}>
          <thead>
            <tr>
              <th>Subject</th>
              <th style={{ textAlign: "center" }}>CA (/40)</th>
              <th style={{ textAlign: "center" }}>Exam (/60)</th>
              <th style={{ textAlign: "center" }}>Total (/100)</th>
              <th style={{ textAlign: "center" }}>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {scored.map((item) => (
              <tr key={item.subject}>
                <td style={{ fontWeight: 600 }}>{item.subject}</td>
                <td style={{ textAlign: "center" }}>{item.ca !== "" ? item.ca : "—"}</td>
                <td style={{ textAlign: "center" }}>{item.exam !== "" ? item.exam : "—"}</td>
                <td style={{ textAlign: "center", fontWeight: 700 }}>{item.total !== null ? item.total : "—"}</td>
                <td style={{ textAlign: "center" }}>
                  {item.grade !== "—" ? <span className={`grade-pill grade-${item.grade}`}>{item.grade}</span> : "—"}
                </td>
                <td style={{ fontSize: "13px", color: "#4a5d55" }}>{item.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Remarks */}
        <div style={{ background: "#f0f7f4", borderRadius: "8px", padding: "12px 16px", border: "1px solid #c7e5d8", marginBottom: "16px", fontSize: "13.5px" }}>
          <b>Teacher Recommendation:</b> {avg && avg >= 70 ? "Excellent academic performance! Consistent hard work demonstrated across all subjects." : avg && avg >= 55 ? "Good progress made this term. Continued practice in core subjects recommended." : "More attention needed in weak areas. Improvement expected next term."}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button type="button" className="btn o" onClick={() => window.print()}>
            🖨️ Print Report Slip
          </button>
          <button type="button" className="btn" onClick={onClose} style={{ background: "#0f5c47" }}>
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dispatch History Modal ───────────────────────────────────
function DispatchHistoryModal({ dispatches, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
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
          <p className="m" style={{ textAlign: "center", padding: "30px 0" }}>No email credentials dispatched yet in this session.</p>
        ) : (
          <div style={{ maxHeight: "360px", overflowY: "auto", border: "1px solid #d8e1dc", borderRadius: "8px" }}>
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th style={{ textAlign: "center" }}>PIN</th>
                  <th style={{ textAlign: "right" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dispatches.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.studentName}</td>
                    <td>
                      <code style={{ background: "#e1f0ea", color: "#0b4a39", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        {d.studentId}
                      </code>
                    </td>
                    <td style={{ color: "#4a5d55" }}>{d.email}</td>
                    <td style={{ textAlign: "center" }}><b>{d.defaultPassword}</b></td>
                    <td style={{ textAlign: "right", color: "#15803d", fontWeight: 600 }}>✓ Delivered</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <button type="button" className="btn" onClick={onClose} style={{ background: "#0f5c47" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV Modal ────────────────────────────────────────────────
function CsvModal({ className, onImport, onClose }) {
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [rows, setRows] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
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
        const parts = lines[i].split(",").map((s) => s.trim());
        if (parts.length < 4 || !parts[idCol]) continue;
        const ca = clamp(parts[caCol], 40);
        const exam = clamp(parts[exCol], 60);
        if (ca !== "" && exam !== "") {
          parsed.push({ studentId: parts[idCol], subject: parts[subCol], ca: Number(ca), exam: Number(exam) });
        }
      }
      if (!parsed.length) { setErrMsg("No valid score rows found."); setStatus("error"); return; }
      setRows(parsed);
      setStatus("preview");
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: "20px" }}>Upload CSV — {className}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="m" style={{ margin: "0 0 12px" }}>
          File must have columns: <b>studentId</b>, <b>subject</b>, <b>ca</b>, <b>exam</b>
        </p>
        <div style={{ border: "2px dashed #c8ddd3", borderRadius: "10px", padding: "24px", textAlign: "center", marginBottom: "16px" }}>
          <input type="file" accept=".csv,.txt" style={{ display: "none" }} id="csv-input" onChange={handleFile} />
          <label htmlFor="csv-input" className="btn o" style={{ cursor: "pointer" }}>Choose CSV file</label>
        </div>
        {status === "error" && (
          <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", padding: "12px", marginBottom: "12px", color: "#7a4b00" }}>⚠ {errMsg}</div>
        )}
        {status === "preview" && (
          <>
            <p className="m" style={{ marginBottom: "8px" }}>Ready to import {rows.length} score rows</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn o" onClick={() => setStatus("idle")}>Re-upload</button>
              <button className="btn" onClick={() => { onImport(rows); onClose(); }}>Confirm &amp; Import</button>
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

// ─── Main Redesigned Page ─────────────────────────────────────
export default function SchoolResultsPage() {
  const user = useStore((s) => s.user);
  const students = useStore((s) => s.students) || [];
  const results = useStore((s) => s.results) || [];
  const released = useStore((s) => s.released);
  const releaseResults = useStore((s) => s.releaseResults);
  const unreleaseResults = useStore((s) => s.unreleaseResults);
  const setScore = useStore((s) => s.setScore);
  const bulkImportScores = useStore((s) => s.bulkImportScores);
  const addStudent = useStore((s) => s.addStudent);
  const latestDispatch = useStore((s) => s.latestDispatch);
  const clearLatestDispatch = useStore((s) => s.clearLatestDispatch);
  const emailDispatches = useStore((s) => s.emailDispatches) || [];

  // Active view: "subject" (clean score entry) vs "broadsheet" (class ranking overview)
  const [viewMode, setViewMode] = useState("subject");

  // Selection states
  const [selectedClass, setSelectedClass] = useState("JSS 1");
  const availableSubjects = SUBJECTS[selectedClass] || [];
  
  // Default to teacher's subject if assigned
  const [selectedSubject, setSelectedSubject] = useState(() => {
    return availableSubjects[0] || "Mathematics";
  });

  // Modal triggers
  const [showCsv, setShowCsv] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showDispatchHistory, setShowDispatchHistory] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [toast, setToast] = useState("");

  // Draft edits for the active subject entry table: { "STU-001|ca": 30, "STU-001|exam": 50 }
  const [drafts, setDrafts] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Next suggested student ID (STU-014, STU-015...)
  const nextSuggestedId = useMemo(() => {
    const existingNums = students
      .map((s) => {
        const m = s.id?.match(/STU-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length ? Math.max(...existingNums) + 1 : 14;
    return `STU-${String(nextNum).padStart(3, "0")}`;
  }, [students]);

  // Class students
  const classStudents = useMemo(() => {
    return students.filter((s) => s.className === selectedClass);
  }, [students, selectedClass]);

  // Handle adding student
  const handleAddStudent = (newStudentData) => {
    addStudent(newStudentData);
    if (newStudentData.className !== selectedClass) {
      setSelectedClass(newStudentData.className);
    }
    showToast(`✓ Added ${newStudentData.name} (${newStudentData.id}) to ${newStudentData.className}`);
  };

  // Switch class cleanly
  const handleClassChange = (newClass) => {
    setSelectedClass(newClass);
    setDrafts({});
    const subs = SUBJECTS[newClass] || [];
    if (!subs.includes(selectedSubject)) {
      setSelectedSubject(subs[0] || "Mathematics");
    }
  };

  // Subject change cleanly
  const handleSubjectChange = (newSub) => {
    setSelectedSubject(newSub);
    setDrafts({});
  };

  // Handle inline changes in Subject Entry view
  const handleScoreChange = (studentId, field, rawVal) => {
    const max = field === "ca" ? 40 : 60;
    const clamped = rawVal === "" ? "" : clamp(rawVal, max);
    setDrafts((prev) => ({
      ...prev,
      [`${studentId}|${field}`]: clamped,
    }));
  };

  const hasDrafts = Object.keys(drafts).length > 0;

  // Save all drafts for the active subject
  const handleSaveDrafts = () => {
    const studentIds = [...new Set(Object.keys(drafts).map((k) => k.split("|")[0]))];
    studentIds.forEach((sId) => {
      const caKey = `${sId}|ca`;
      const exKey = `${sId}|exam`;
      const existing = results.find((r) => r.studentId === sId && r.subject === selectedSubject);
      const caVal = caKey in drafts ? drafts[caKey] : existing?.ca;
      const exVal = exKey in drafts ? drafts[exKey] : existing?.exam;

      if (caVal !== undefined && caVal !== "" && exVal !== undefined && exVal !== "") {
        setScore(sId, selectedSubject, Number(caVal), Number(exVal));
      }
    });
    setDrafts({});
    showToast(`✓ Saved ${selectedSubject} scores for ${selectedClass}`);
  };

  const handleDiscardDrafts = () => {
    setDrafts({});
    showToast("Changes discarded");
  };

  // Quick edit bulk save
  const handleQuickEditSave = (rows) => {
    bulkImportScores(rows);
    showToast(`✓ Updated scores for pupil`);
  };

  // Broadsheet computed data: ranks and totals across all subjects
  const broadSheetRows = useMemo(() => {
    const subs = SUBJECTS[selectedClass] || [];
    const rows = classStudents.map((s) => {
      const subjectScores = subs.map((sub) => {
        const r = results.find((res) => res.studentId === s.id && res.subject === sub);
        const ca = r?.ca ?? "";
        const exam = r?.exam ?? "";
        const total = ca !== "" && exam !== "" ? Number(ca) + Number(exam) : null;
        return { subject: sub, ca, exam, total };
      });

      const scored = subjectScores.filter((sc) => sc.total !== null);
      const totalScore = scored.reduce((sum, sc) => sum + sc.total, 0);
      const average = scored.length ? Math.round(totalScore / scored.length) : null;
      return {
        id: s.id,
        name: s.name,
        className: s.className,
        scores: subjectScores,
        totalScore: scored.length ? totalScore : null,
        average,
        isComplete: scored.length === subs.length,
      };
    });

    // Rank descending
    const ranked = [...rows].sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
    return ranked.map((row, idx) => ({
      ...row,
      position: row.average !== null ? idx + 1 : null,
    }));
  }, [classStudents, results, selectedClass]);

  // Stats for the active class
  const completeCount = broadSheetRows.filter((r) => r.isComplete).length;
  const scoredRows = broadSheetRows.filter((r) => r.average !== null);
  const classAvg = scoredRows.length
    ? Math.round(scoredRows.reduce((sum, r) => sum + r.average, 0) / scoredRows.length)
    : null;

  return (
    <div className="pg p-SchoolResults">
      <Header kind={user?.role === "teacher" ? "teacher" : "school"} active="schoolResults" />
      {toast && <div className="toast">{toast}</div>}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 32px" }}>
        {/* ── Top Header Banner ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "22px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "32px", color: "#0f5c47", margin: 0, letterSpacing: "-0.5px" }}>
                Results &amp; Grade Sheet
              </h1>
              {released ? (
                <span className="chip" style={{ background: "#dcfce7", color: "#15803d", fontWeight: 700 }}>
                  ✓ Live on Student Portals
                </span>
              ) : (
                <span className="chip a" style={{ background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
                  ⏳ Draft / Unreleased
                </span>
              )}
            </div>
            <p className="m" style={{ margin: "4px 0 0", fontSize: "15px" }}>
              First Term · 2026/2027 Academic Session · {user?.role === "teacher" ? `Teacher Portal (${user.name})` : "School Portal"}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="btn"
              onClick={() => setShowAddStudent(true)}
              style={{ background: "#0f5c47" }}
            >
              ➕ Add Student
            </button>
            <button type="button" className="btn o" onClick={() => setShowCsv(true)}>
              ↑ Upload CSV
            </button>
            {emailDispatches.length > 0 && (
              <button
                type="button"
                className="btn o"
                onClick={() => setShowDispatchHistory(true)}
                title="View log of dispatched credential emails"
              >
                📨 Sent Emails ({emailDispatches.length})
              </button>
            )}
            {released ? (
              <button
                type="button"
                className="btn o"
                onClick={() => { unreleaseResults(); showToast("Results hidden from student portals"); }}
                style={{ borderColor: "#c0392b", color: "#c0392b" }}
              >
                Hide from Students
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => { releaseResults(); showToast("✓ Results and positions released to students!"); }}
                style={{ background: "#0f5c47" }}
              >
                📢 Release Results
              </button>
            )}
          </div>
        </div>

        {/* ── Metric Summary Strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "22px" }}>
          <div className="card" style={{ padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ color: "#4a5d55", fontSize: "12.5px", fontWeight: 600 }}>Enrolled in {selectedClass}</div>
            <b style={{ color: "#0f5c47", fontSize: "24px", display: "block", marginTop: "2px" }}>{classStudents.length} Pupils</b>
          </div>
          <div className="card" style={{ padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ color: "#4a5d55", fontSize: "12.5px", fontWeight: 600 }}>Scores Completed</div>
            <b style={{ color: "#0b4a39", fontSize: "24px", display: "block", marginTop: "2px" }}>{completeCount} of {classStudents.length}</b>
          </div>
          <div className="card" style={{ padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ color: "#4a5d55", fontSize: "12.5px", fontWeight: 600 }}>Class Overall Average</div>
            <b style={{ color: "#1a4a80", fontSize: "24px", display: "block", marginTop: "2px" }}>{classAvg !== null ? `${classAvg}%` : "—"}</b>
          </div>
          <div className="card" style={{ padding: "14px 18px", borderRadius: "10px" }}>
            <div style={{ color: "#4a5d55", fontSize: "12.5px", fontWeight: 600 }}>Class Leader (1st Pos)</div>
            <b style={{ color: "#0f5c47", fontSize: "20px", display: "block", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {broadSheetRows[0]?.average !== null ? `🥇 ${broadSheetRows[0]?.name}` : "—"}
            </b>
          </div>
        </div>

        {/* ── Navigation Controls: Class Selector & View Switcher ── */}
        <div
          className="card"
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Class Select Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#4a5d55", marginRight: "6px" }}>Class:</span>
            {CLASSES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleClassChange(c)}
                style={{
                  background: selectedClass === c ? "#0f5c47" : "#f0f4f2",
                  color: selectedClass === c ? "#ffffff" : "#2f453c",
                  border: "none",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <div style={{ display: "flex", background: "#e5ece8", padding: "4px", borderRadius: "10px", gap: "4px" }}>
            <button
              type="button"
              onClick={() => setViewMode("subject")}
              style={{
                border: "none",
                padding: "8px 16px",
                borderRadius: "7px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "subject" ? "#0f5c47" : "transparent",
                color: viewMode === "subject" ? "#ffffff" : "#2d443a",
                transition: "all 0.15s ease",
              }}
            >
              🎯 Score Entry by Subject
            </button>
            <button
              type="button"
              onClick={() => setViewMode("broadsheet")}
              style={{
                border: "none",
                padding: "8px 16px",
                borderRadius: "7px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "broadsheet" ? "#0f5c47" : "transparent",
                color: viewMode === "broadsheet" ? "#ffffff" : "#2d443a",
                transition: "all 0.15s ease",
              }}
            >
              🏆 Broadsheet &amp; Positions
            </button>
          </div>
        </div>

        {/* ── Unsaved Drafts Notification Strip ── */}
        {hasDrafts && (
          <div
            style={{
              background: "#fffbeb",
              border: "1.5px solid #fcd34d",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ color: "#92400e", fontSize: "14px", fontWeight: 600 }}>
              ✏️ You have unsaved score edits. Click save to store them.
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn o"
                onClick={handleDiscardDrafts}
                style={{ borderColor: "#c0392b", color: "#c0392b", minHeight: "34px", padding: "6px 14px", fontSize: "13px" }}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleSaveDrafts}
                style={{ background: "#0f5c47", minHeight: "34px", padding: "6px 16px", fontSize: "13px" }}
              >
                Save All Changes
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 1: SCORE ENTRY BY SUBJECT (Clean, Simple, Ideal for Teachers)
            ===================================================================== */}
        {viewMode === "subject" && (
          <div>
            {/* Subject Selector Bar */}
            <div
              className="card"
              style={{
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                overflowX: "auto",
              }}
            >
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#4a5d55", whiteSpace: "nowrap" }}>
                Select Subject:
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {availableSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubjectChange(sub)}
                    style={{
                      border: selectedSubject === sub ? "1.5px solid #0f5c47" : "1px solid #d1ddd7",
                      background: selectedSubject === sub ? "#e8f4ef" : "#ffffff",
                      color: selectedSubject === sub ? "#0f5c47" : "#3b5247",
                      fontWeight: selectedSubject === sub ? 700 : 500,
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Student Score Entry Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: "12px", border: "1px solid #d8e1dc" }}>
              <div style={{ padding: "16px 20px", background: "#fafcfb", borderBottom: "1px solid #e6ece8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f5c47" }}>
                    {selectedClass} · {selectedSubject}
                  </h3>
                  <span className="m" style={{ fontSize: "13px" }}>
                    CA: Continuous Assessment (max 40) · Exam: Term Exam (max 60) · Total: 100
                  </span>
                </div>
                <span className="chip" style={{ background: "#e8f3ff", color: "#1a4a80" }}>
                  {classStudents.length} Students in class
                </span>
              </div>

              {classStudents.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  No students in {selectedClass} yet. Click <b>➕ Add Student</b> above to enroll students.
                </div>
              ) : (
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th style={{ width: "45px", textAlign: "center" }}>#</th>
                      <th>Student</th>
                      <th style={{ width: "120px", textAlign: "center" }}>CA (/40)</th>
                      <th style={{ width: "120px", textAlign: "center" }}>Exam (/60)</th>
                      <th style={{ width: "120px", textAlign: "center" }}>Total (/100)</th>
                      <th style={{ width: "80px", textAlign: "center" }}>Grade</th>
                      <th style={{ width: "160px" }}>Remarks</th>
                      <th style={{ width: "90px", textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s, idx) => {
                      const matched = results.find((r) => r.studentId === s.id && r.subject === selectedSubject);
                      const caKey = `${s.id}|ca`;
                      const exKey = `${s.id}|exam`;
                      const caVal = caKey in drafts ? drafts[caKey] : (matched?.ca ?? "");
                      const exVal = exKey in drafts ? drafts[exKey] : (matched?.exam ?? "");
                      const isDraft = caKey in drafts || exKey in drafts;
                      const total = (caVal !== "" && exVal !== "") ? Number(caVal) + Number(exVal) : null;
                      const studentGrade = total !== null ? grade(total) : "—";
                      const studentRemark = getRemark(total);

                      return (
                        <tr key={s.id} style={{ background: isDraft ? "#fffdf5" : "transparent" }}>
                          <td style={{ textAlign: "center", color: "#8b9c94", fontWeight: 600 }}>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 700, color: "#17231f", fontSize: "14.5px" }}>{s.name}</div>
                            <code style={{ fontSize: "12px", color: "#0f5c47", background: "#e1f0ea", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                              {s.id}
                            </code>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="number"
                              min="0"
                              max="40"
                              value={caVal}
                              placeholder="—"
                              className={`clean-score-input${isDraft ? " draft-input" : ""}`}
                              onChange={(e) => handleScoreChange(s.id, "ca", e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              value={exVal}
                              placeholder="—"
                              className={`clean-score-input${isDraft ? " draft-input" : ""}`}
                              onChange={(e) => handleScoreChange(s.id, "exam", e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {total !== null ? (
                              <b style={{ fontSize: "16px", color: total >= 50 ? "#0f5c47" : "#c0392b" }}>
                                {total}
                              </b>
                            ) : (
                              <span style={{ color: "#a5b8b0" }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {studentGrade !== "—" ? (
                              <span className={`grade-pill grade-${studentGrade}`}>{studentGrade}</span>
                            ) : (
                              <span style={{ color: "#a5b8b0" }}>—</span>
                            )}
                          </td>
                          <td style={{ fontSize: "13px", color: "#4a5d55" }}>
                            {studentRemark}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {isDraft ? (
                              <span style={{ color: "#d97706", fontSize: "12px", fontWeight: 700 }}>✏️ Draft</span>
                            ) : total !== null ? (
                              <span style={{ color: "#15803d", fontSize: "12px", fontWeight: 600 }}>✓ Saved</span>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "12px" }}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
            VIEW 2: MASTER BROADSHEET & POSITIONS (Clean Overview & Class Rankings)
            ===================================================================== */}
        {viewMode === "broadsheet" && (
          <div className="card" style={{ padding: 0, overflow: "hidden", borderRadius: "12px", border: "1px solid #d8e1dc" }}>
            <div style={{ padding: "16px 20px", background: "#fafcfb", borderBottom: "1px solid #e6ece8", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f5c47" }}>
                  Class Broadsheet &amp; Official Positions · {selectedClass}
                </h3>
                <span className="m" style={{ fontSize: "13px" }}>
                  Students are ranked automatically by overall term average.
                </span>
              </div>
              <span className="chip" style={{ background: "#e1f0ea", color: "#0b4a39", fontWeight: 700 }}>
                {broadSheetRows.length} Pupils Ranked
              </span>
            </div>

            {broadSheetRows.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                No pupils registered in {selectedClass} yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th style={{ width: "90px", textAlign: "center" }}>Position</th>
                      <th>Student</th>
                      <th style={{ textAlign: "center" }}>Scored Subjects</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Total Score</th>
                      <th style={{ width: "110px", textAlign: "center" }}>Average</th>
                      <th style={{ width: "80px", textAlign: "center" }}>Grade</th>
                      <th style={{ width: "200px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {broadSheetRows.map((row) => {
                      const medal = row.position === 1 ? "🥇 1st" : row.position === 2 ? "🥈 2nd" : row.position === 3 ? "🥉 3rd" : ordinal(row.position);
                      const pupilGrade = row.average !== null ? grade(row.average) : "—";
                      const scoredCount = row.scores.filter((sc) => sc.total !== null).length;

                      return (
                        <tr key={row.id}>
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                background: row.position === 1 ? "#fef3c7" : row.position === 2 ? "#f1f5f9" : row.position === 3 ? "#ffedd5" : "#f8faf9",
                                color: row.position === 1 ? "#92400e" : row.position === 2 ? "#334155" : row.position === 3 ? "#9a3412" : "#17231f",
                                fontWeight: 800,
                                fontSize: "14px",
                              }}
                            >
                              {medal}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: "14.5px", color: "#17231f" }}>{row.name}</div>
                            <code style={{ fontSize: "12px", color: "#0f5c47", background: "#e1f0ea", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                              {row.id}
                            </code>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ fontSize: "13.5px", color: row.isComplete ? "#15803d" : "#b45309", fontWeight: 600 }}>
                              {scoredCount} of {availableSubjects.length} {row.isComplete ? "✓" : "pending"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", fontWeight: 700, fontSize: "15px" }}>
                            {row.totalScore !== null ? row.totalScore : "—"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {row.average !== null ? (
                              <b style={{ color: "#0f5c47", fontSize: "16px" }}>{row.average}%</b>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {pupilGrade !== "—" ? (
                              <span className={`grade-pill grade-${pupilGrade}`}>{pupilGrade}</span>
                            ) : (
                              <span style={{ color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <button
                              type="button"
                              className="link-btn"
                              onClick={() => setSelectedStudentForEdit(row)}
                              style={{ marginRight: "12px", fontSize: "13.5px" }}
                            >
                              ✏️ Edit Scores
                            </button>
                            <button
                              type="button"
                              className="btn o"
                              onClick={() => setSelectedStudentForReport(row)}
                              style={{ padding: "4px 10px", fontSize: "12.5px", minHeight: "30px" }}
                            >
                              📄 Report Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddStudent && (
        <AddStudentModal
          defaultClass={selectedClass}
          nextSuggestedId={nextSuggestedId}
          onAdd={handleAddStudent}
          onClose={() => setShowAddStudent(false)}
        />
      )}

      {selectedStudentForEdit && (
        <StudentScoreModal
          student={selectedStudentForEdit}
          subjects={availableSubjects}
          currentResults={results}
          onSave={handleQuickEditSave}
          onClose={() => setSelectedStudentForEdit(null)}
        />
      )}

      {selectedStudentForReport && (
        <StudentReportModal
          student={selectedStudentForReport}
          rank={selectedStudentForReport.position}
          totalPupils={classStudents.length}
          subjects={availableSubjects}
          currentResults={results}
          classAvg={classAvg}
          onClose={() => setSelectedStudentForReport(null)}
        />
      )}

      {showCsv && (
        <CsvModal className={selectedClass} onImport={(rows) => { bulkImportScores(rows); showToast(`✓ Imported ${rows.length} rows`); }} onClose={() => setShowCsv(false)} />
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
