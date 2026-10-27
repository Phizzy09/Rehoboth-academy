import { useState } from "react";
import useStore from "../store/useStore";
import CountUp from "../components/CountUp";
import Header from "../components/Header";
import { money, splitPayment } from "../utils";

// ─── constants ────────────────────────────────────────────────
const CLASSES    = ["All", "Primary 4", "JSS 1", "JSS 2", "SS 1", "SS 2"];
const METHODS    = ["Cash", "Transfer", "POS", "Payment link", "Cheque"];
const FEE_ITEMS  = ["Tuition", "Books & Supplies", "Development Levy", "ICT Fee"];

// Default fee structures per class (₦)
const DEFAULT_STRUCTURE = {
  "Primary 4": { "Tuition": 80000,  "Books & Supplies": 25000, "Development Levy": 10000, "ICT Fee": 8000 },
  "JSS 1":     { "Tuition": 112000, "Books & Supplies": 25000, "Development Levy": 10000, "ICT Fee": 8000 },
  "JSS 2":     { "Tuition": 115000, "Books & Supplies": 25000, "Development Levy": 10000, "ICT Fee": 8000 },
  "SS 1":      { "Tuition": 142000, "Books & Supplies": 25000, "Development Levy": 10000, "ICT Fee": 8000 },
  "SS 2":      { "Tuition": 145000, "Books & Supplies": 25000, "Development Levy": 10000, "ICT Fee": 8000 },
};

// ─── Fee Structure Panel ──────────────────────────────────────
function FeeStructurePanel({ students, setFeeItem, bulkSetTuitionByClass, showToast }) {
  const [feeClass, setFeeClass] = useState("JSS 1");
  // Local draft of the structure for the selected class
  // Pull current values from the first matching student's items
  const getStructure = (cls) => {
    const sample = students.find((s) => s.className === cls);
    if (!sample) return { ...DEFAULT_STRUCTURE[cls] };
    const obj = {};
    FEE_ITEMS.forEach((item) => {
      const found = sample.items.find((i) => i.name === item);
      obj[item] = found ? found.charged : DEFAULT_STRUCTURE[cls]?.[item] ?? 0;
    });
    return obj;
  };

  const [draft, setDraft] = useState(() => getStructure("JSS 1"));

  const handleClassChange = (cls) => {
    setFeeClass(cls);
    setDraft(getStructure(cls));
  };

  const update = (item, val) => {
    setDraft((prev) => ({ ...prev, [item]: Number(val) || 0 }));
  };

  const total = FEE_ITEMS.reduce((s, k) => s + (draft[k] || 0), 0);

  const handleApply = () => {
    // Apply each fee item to all students in the class
    FEE_ITEMS.forEach((item) => {
      // Use setFeeItem for each student directly (bulk)
      students.filter((s) => s.className === feeClass).forEach((s) => {
        setFeeItem(s.id, item, draft[item] || 0);
      });
    });
    showToast(`✓ Fee structure applied to all ${feeClass} students`);
  };

  const classCount = students.filter((s) => s.className === feeClass).length;

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div className="hd" style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "18px", margin: 0 }}>📋 Fee Structure</h3>
        <span className="m" style={{ fontSize: "13px" }}>Set once → applies to all students in the class</span>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "16px", flexWrap: "wrap" }}>
        <label style={{ flex: "0 0 auto" }}>
          <span style={{ fontWeight: "600", display: "block", marginBottom: "4px" }}>Class</span>
          <select
            value={feeClass}
            onChange={(e) => handleClassChange(e.target.value)}
            style={{ minWidth: "130px", minHeight: "40px", padding: "4px 10px", border: "1.5px solid #9fb0a8", borderRadius: "8px", font: "inherit", background: "#fff" }}
          >
            {CLASSES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <div className="m" style={{ fontSize: "13px", paddingBottom: "6px" }}>
          {classCount} student{classCount !== 1 ? "s" : ""} in this class
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #e6ece8", color: "#4a5d55" }}>Fee Item</th>
            <th style={{ textAlign: "right", padding: "8px", borderBottom: "2px solid #e6ece8", color: "#4a5d55" }}>Amount (₦)</th>
            <th style={{ textAlign: "right", padding: "8px", borderBottom: "2px solid #e6ece8", color: "#4a5d55" }}>Current</th>
          </tr>
        </thead>
        <tbody>
          {FEE_ITEMS.map((item) => {
            const current = getStructure(feeClass)[item] || 0;
            const changed = draft[item] !== current;
            return (
              <tr key={item} style={{ background: changed ? "#fffbf0" : "transparent" }}>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #e6ece8" }}>
                  {item}
                  {changed && <span style={{ marginLeft: "6px", fontSize: "11px", color: "#7a4b00", fontWeight: "700" }}>EDITED</span>}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #e6ece8", textAlign: "right" }}>
                  <input
                    type="number" min="0"
                    value={draft[item]}
                    style={{ width: "130px", minHeight: "36px", padding: "4px 10px", border: `1.5px solid ${changed ? "#f0a500" : "#9fb0a8"}`, borderRadius: "8px", font: "inherit", textAlign: "right", background: "#fff" }}
                    onChange={(e) => update(item, e.target.value)}
                  />
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "1px solid #e6ece8", textAlign: "right", color: "#4a5d55" }}>
                  {money(current)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ padding: "12px 8px", fontWeight: "700", fontFamily: "'Bricolage Grotesque',sans-serif" }}>Total</td>
            <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "18px" }}>{money(total)}</td>
            <td style={{ padding: "12px 8px", textAlign: "right", color: "#4a5d55" }}>{money(Object.values(getStructure(feeClass)).reduce((s, v) => s + v, 0))}</td>
          </tr>
        </tfoot>
      </table>

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button className="btn o" onClick={() => setDraft(getStructure(feeClass))}>Reset</button>
        <button className="btn" onClick={handleApply}>Apply to all {feeClass} students</button>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────
function PaymentModal({ students, onSave, onClose }) {
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [amount, setAmount]       = useState("");
  const [method, setMethod]       = useState("Cash");
  const [err, setErr]             = useState("");

  const student = students.find((s) => s.id === studentId);
  const owing   = student ? student.charged - student.paid : 0;

  const handleSave = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { setErr("Enter a valid amount."); return; }
    if (amt > owing + 1)  { setErr(`Amount exceeds balance owing (${money(owing)}).`); return; }
    onSave(studentId, amt, method);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: "20px" }}>Record a payment</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <label>
            Student
            <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setErr(""); setAmount(""); }}>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.className}</option>
              ))}
            </select>
          </label>
          {student && (
            <div style={{ background: "#f2f7f4", borderRadius: "8px", padding: "10px 14px", fontSize: "14px" }}>
              Charged: <b>{money(student.charged)}</b> · Paid: <b>{money(student.paid)}</b> · Owing: <b style={{ color: owing > 0 ? "#7a4b00" : "#0f5c47" }}>{money(owing)}</b>
              {/* Mini progress */}
              <div style={{ height: "6px", background: "#dfe7e3", borderRadius: "4px", marginTop: "8px" }}>
                <div style={{ width: `${Math.round((student.paid / student.charged) * 100)}%`, height: "100%", background: "#0f5c47", borderRadius: "4px" }} />
              </div>
            </div>
          )}
          <label>
            Amount (₦)
            <input type="number" min="0" value={amount} placeholder="e.g. 50000"
              onChange={(e) => { setAmount(e.target.value); setErr(""); }} />
          </label>
          <label>
            Payment method
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          {err && <div style={{ color: "#c0392b", fontSize: "14px" }}>{err}</div>}
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button className="btn o" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={handleSave}>Save payment</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Fees Modal (per-student override) ───────────────────
function EditFeesModal({ student, onSave, onClose }) {
  const [items, setItems] = useState(student.items.map((i) => ({ ...i })));
  const update = (idx, val) => {
    const next = [...items];
    next[idx] = { ...next[idx], charged: Number(val) || 0 };
    setItems(next);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: "20px" }}>Override fees — {student.name}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="m" style={{ margin: "0 0 14px" }}>These amounts override the class fee structure for this student only.</p>
        <table>
          <thead><tr><th>Item</th><th className="n">Amount (₦)</th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td className="n">
                  <input type="number" min="0" value={item.charged} style={{ width: "120px" }}
                    onChange={(e) => update(i, e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><b>Total</b></td>
              <td className="n"><b>{money(items.reduce((s, i) => s + i.charged, 0))}</b></td>
            </tr>
          </tfoot>
        </table>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button className="btn o" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={() => { onSave(student.id, items); onClose(); }}>Save override</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function SchoolFeesPage() {
  const students              = useStore((s) => s.students);
  const payments              = useStore((s) => s.payments);
  const recordPayment         = useStore((s) => s.recordPayment);
  const setFeeItem            = useStore((s) => s.setFeeItem);
  const bulkSetTuitionByClass = useStore((s) => s.bulkSetTuitionByClass);
  const addNotice             = useStore((s) => s.addNotice);

  const [filterClass, setFilterClass]   = useState("All");
  const [showPayModal, setShowPayModal] = useState(false);
  const [editStudent, setEditStudent]   = useState(null);
  const [activeTab, setActiveTab]       = useState("structure"); // structure | ledger | history
  const [toast, setToast]               = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3200); };

  const filtered = filterClass === "All" ? students : students.filter((s) => s.className === filterClass);
  const totalCharged = filtered.reduce((sum, s) => sum + s.charged, 0);
  const totalPaid    = filtered.reduce((sum, s) => sum + s.paid, 0);
  const totalOwing   = totalCharged - totalPaid;

  const handleRecordPayment = (studentId, amount, method) => {
    recordPayment(studentId, amount, method);
    showToast("✓ Payment recorded");
  };

  const handleSaveFees = (studentId, items) => {
    items.forEach((item) => setFeeItem(studentId, item.name, item.charged));
    showToast("✓ Override saved");
  };

  const sendReminder = (student) => {
    const owing = student.charged - student.paid;
    addNotice({ id: Date.now(), tag: "Fees", title: `Fee reminder — ${student.name}`,
      text: `${student.name} owes ${money(owing)}. Please pay before 30 Oct.`,
      button: "Pay now", goto: "studentFees", channels: "WhatsApp, SMS" });
    showToast(`✓ Reminder sent to ${student.name}`);
  };

  const allPayments = [...payments].reverse();

  const TABS = [
    { key: "structure", label: "Fee Structure" },
    { key: "ledger",    label: "Fee Ledger" },
    { key: "history",   label: "Payment History" },
  ];

  return (
    <div className="pg p-SchoolFees">
      <Header kind="school" active="schoolFees" />
      {toast && <div className="toast">{toast}</div>}
      <div className="wrap">
        <div>
          {/* Title + actions */}
          <div className="hd">
            <h1 style={{ fontSize: "32px" }}>Fees</h1>
            <button className="btn" type="button" onClick={() => setShowPayModal(true)}>+ Record payment</button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", marginTop: "18px", borderBottom: "2px solid #e6ece8" }}>
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  background: "none", border: "none", padding: "8px 18px", cursor: "pointer",
                  fontWeight: "600", fontSize: "15px",
                  color: activeTab === tab.key ? "#0f5c47" : "#6b7e76",
                  borderBottom: activeTab === tab.key ? "2px solid #0f5c47" : "2px solid transparent",
                  marginBottom: "-2px",
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          <div className="st" style={{ marginTop: "16px" }}>
            <div className="card" style={{ margin: "0" }}>
              <span className="m">Charged</span>
              <span className="big"><CountUp value={totalCharged} /></span>
            </div>
            <div className="card" style={{ margin: "0" }}>
              <span className="m">Paid</span>
              <span className="big"><CountUp value={totalPaid} /></span>
            </div>
            <div className="card" style={{ margin: "0" }}>
              <span className="m">Owing</span>
              <span className="big" style={{ color: totalOwing > 0 ? "#7a4b00" : "#0f5c47" }}>
                <CountUp value={totalOwing} />
              </span>
            </div>
          </div>

          {/* Class filter (shared by ledger + history) */}
          {activeTab !== "structure" && (
            <div style={{ marginTop: "14px", marginBottom: "8px" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontWeight: "600" }}>
                Class
                <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} style={{ minWidth: "130px", minHeight: "40px", padding: "4px 10px", border: "1.5px solid #9fb0a8", borderRadius: "8px", font: "inherit", background: "#fff" }}>
                  {CLASSES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
          )}

          {/* ── STRUCTURE TAB ── */}
          {activeTab === "structure" && (
            <div style={{ marginTop: "20px" }}>
              <FeeStructurePanel
                students={students}
                setFeeItem={setFeeItem}
                bulkSetTuitionByClass={bulkSetTuitionByClass}
                showToast={showToast}
              />
              <div className="card" style={{ background: "#f2f7f4", border: "none" }}>
                <p className="m" style={{ margin: 0, fontSize: "14px" }}>
                  💡 <b>How it works:</b> Set the fee amounts per class above and click <b>Apply</b>. Every student in that class will immediately show the new charged amount in the Ledger tab. Use <b>Override fees</b> in the Ledger to adjust individual students differently.
                </p>
              </div>
            </div>
          )}

          {/* ── LEDGER TAB ── */}
          {activeTab === "ledger" && (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th className="n">Charged</th>
                    <th className="n">Paid</th>
                    <th className="n">Owing</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const owing = s.charged - s.paid;
                    const pct   = s.charged > 0 ? Math.round((s.paid / s.charged) * 100) : 0;
                    const statusLabel = owing === 0 ? "Paid" : s.paid > 0 ? "Part paid" : "Unpaid";
                    const chipCls     = owing === 0 ? "chip" : s.paid > 0 ? "chip b" : "chip a";
                    return (
                      <tr key={s.id}>
                        <td>
                          <div>{s.name}</div>
                          <div style={{ height: "4px", background: "#e6ece8", borderRadius: "4px", marginTop: "4px", width: "100px" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#0f5c47", borderRadius: "4px" }} />
                          </div>
                        </td>
                        <td>{s.className}</td>
                        <td className="n">{money(s.charged)}</td>
                        <td className="n">{money(s.paid)}</td>
                        <td className="n"><b>{money(owing)}</b></td>
                        <td><span className={chipCls}>{statusLabel}</span></td>
                        <td className="n" style={{ whiteSpace: "nowrap" }}>
                          <button className="link-btn" onClick={() => setEditStudent(s)}>Override</button>
                          {owing > 0 && <> · <button className="link-btn" onClick={() => sendReminder(s)}>Remind</button></>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Student</th><th>Class</th><th>Date</th><th>Method</th><th className="n">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments
                    .filter((p) => {
                      if (filterClass === "All") return true;
                      return students.find((s) => s.id === p.studentId)?.className === filterClass;
                    })
                    .map((p) => {
                      const s = students.find((st) => st.id === p.studentId);
                      return (
                        <tr key={p.id}>
                          <td>{s?.name || p.studentId}</td>
                          <td>{s?.className || "—"}</td>
                          <td>{p.date}</td>
                          <td>{p.method}</td>
                          <td className="n"><b>{money(p.amount)}</b></td>
                        </tr>
                      );
                    })}
                  {!allPayments.length && (
                    <tr><td colSpan={5} className="m" style={{ textAlign: "center", padding: "20px" }}>No payments recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aside */}
        <aside>
          <div className="card">
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Quick stats</h3>
            <div style={{ fontSize: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="hd"><span className="m">Total students</span><b>{filtered.length}</b></div>
              <div className="hd"><span className="m">Fully paid</span><b style={{ color: "#0f5c47" }}>{filtered.filter((s) => s.charged === s.paid).length}</b></div>
              <div className="hd"><span className="m">Part paid</span><b>{filtered.filter((s) => s.paid > 0 && s.paid < s.charged).length}</b></div>
              <div className="hd"><span className="m">Unpaid</span><b style={{ color: "#7a4b00" }}>{filtered.filter((s) => s.paid === 0).length}</b></div>
              <div className="hd"><span className="m">Collection rate</span>
                <b style={{ color: "#0f5c47" }}>{totalCharged > 0 ? Math.round((totalPaid / totalCharged) * 100) : 0}%</b>
              </div>
            </div>
            {/* Mini collection bar */}
            <div style={{ height: "8px", background: "#e6ece8", borderRadius: "4px", marginTop: "12px" }}>
              <div style={{ width: `${totalCharged > 0 ? Math.round((totalPaid / totalCharged) * 100) : 0}%`, height: "100%", background: "#0f5c47", borderRadius: "4px", transition: "width 0.6s ease" }} />
            </div>
          </div>
          <div className="card" style={{ marginTop: "16px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Workflow</h3>
            <ol style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              <li className="m"><b style={{ color: "#17231f" }}>Set fee structure</b> per class in the Fee Structure tab</li>
              <li className="m"><b style={{ color: "#17231f" }}>Override</b> individual students if needed (Ledger tab)</li>
              <li className="m"><b style={{ color: "#17231f" }}>Record payments</b> as they come in</li>
              <li className="m"><b style={{ color: "#17231f" }}>Send reminders</b> to students with a balance</li>
            </ol>
          </div>
        </aside>
      </div>

      {showPayModal && (
        <PaymentModal students={students} onSave={handleRecordPayment} onClose={() => setShowPayModal(false)} />
      )}
      {editStudent && (
        <EditFeesModal student={editStudent} onSave={handleSaveFees} onClose={() => setEditStudent(null)} />
      )}
    </div>
  );
}
