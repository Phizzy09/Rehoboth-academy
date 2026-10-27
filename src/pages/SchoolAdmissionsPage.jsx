import { useState, useMemo } from "react";
import useStore from "../store/useStore";
import Header from "../components/Header";
import EmailDispatchModal from "../components/EmailDispatchModal";

const classes = ["Primary 4", "Primary 5", "JSS 1", "JSS 2", "SS 1", "SS 2"];

const statusColors = {
  New: "new",
  "Under Review": "review",
  "Assessment Scheduled": "scheduled",
  "Offer Extended": "offer",
  Admitted: "admitted",
};

export default function SchoolAdmissionsPage() {
  const user = useStore((state) => state.user);
  const applications = useStore((state) => state.applications) || [];
  const updateApplication = useStore((state) => state.updateApplication);
  const deleteApplication = useStore((state) => state.deleteApplication);
  const admitStudentFromApplication = useStore((state) => state.admitStudentFromApplication);
  const latestDispatch = useStore((state) => state.latestDispatch);
  const clearLatestDispatch = useStore((state) => state.clearLatestDispatch);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected applicant for detailed modal view
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalScore, setModalScore] = useState("");
  const [modalNotes, setModalNotes] = useState("");

  // Toast notification state
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Open full details modal
  const openApplicantDetails = (app) => {
    setSelectedApplicant(app);
    setModalStatus(app.status || "New");
    setModalScore(app.score || "Pending Exam");
    setModalNotes(app.notes || "");
  };

  // Save changes from modal
  const handleSaveModalUpdates = () => {
    if (!selectedApplicant) return;
    if (modalStatus === "Admitted" && selectedApplicant.status !== "Admitted") {
      handleAdmitApplicant(selectedApplicant.id);
      setSelectedApplicant(null);
      return;
    }
    updateApplication(selectedApplicant.id, {
      status: modalStatus,
      score: modalScore,
      notes: modalNotes,
    });
    setSelectedApplicant((prev) => ({
      ...prev,
      status: modalStatus,
      score: modalScore,
      notes: modalNotes,
    }));
    showToast(`Applicant ${selectedApplicant.id} details updated.`);
  };

  // Admit applicant directly
  const handleAdmitApplicant = (appId) => {
    const app = applications.find((a) => a.id === appId);
    admitStudentFromApplication(appId);
    if (selectedApplicant && selectedApplicant.id === appId) {
      setSelectedApplicant((prev) => ({
        ...prev,
        status: "Admitted",
      }));
      setModalStatus("Admitted");
    }
    showToast(`🎉 Student admitted! Login ID & Password dispatched to ${app?.email || "applicant email"}.`);
  };

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        app.childName?.toLowerCase().includes(q) ||
        app.parentName?.toLowerCase().includes(q) ||
        app.id?.toLowerCase().includes(q) ||
        app.phone?.includes(q) ||
        app.prevSchool?.toLowerCase().includes(q);

      const matchClass = classFilter === "All" || app.className === classFilter;
      const matchStatus = statusFilter === "All" || app.status === statusFilter;

      return matchQuery && matchClass && matchStatus;
    });
  }, [applications, search, classFilter, statusFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = applications.length;
    const review = applications.filter((a) => a.status === "Under Review" || a.status === "New").length;
    const scheduled = applications.filter((a) => a.status === "Assessment Scheduled").length;
    const admitted = applications.filter((a) => a.status === "Admitted").length;
    return { total, review, scheduled, admitted };
  }, [applications]);

  // CSV Export
  const exportToCSV = () => {
    if (!applications.length) return;
    const headers = [
      "Application ID",
      "Date Applied",
      "Child Full Name",
      "Date of Birth",
      "Gender",
      "Class Applied",
      "Previous School",
      "Parent Name",
      "Relationship",
      "Phone",
      "Email",
      "Address",
      "Medical Info",
      "Status",
      "Assessment Score",
      "Notes",
    ];

    const rows = applications.map((a) => [
      `"${a.id || ""}"`,
      `"${a.date || ""}"`,
      `"${a.childName || ""}"`,
      `"${a.dob || ""}"`,
      `"${a.gender || ""}"`,
      `"${a.className || ""}"`,
      `"${a.prevSchool || ""}"`,
      `"${a.parentName || ""}"`,
      `"${a.relationship || ""}"`,
      `"${a.phone || ""}"`,
      `"${a.email || ""}"`,
      `"${(a.address || "").replace(/"/g, '""')}"`,
      `"${(a.medicalInfo || "").replace(/"/g, '""')}"`,
      `"${a.status || ""}"`,
      `"${a.score || ""}"`,
      `"${(a.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rehoboth_Academy_Applicants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Applicant details exported to CSV!");
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="pg p-Admissions">
      <Header kind="school" active="schoolAdmissions" />

      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      <div className="in">
        {/* Top Title & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "36px", color: "#0f5c47", letterSpacing: "-0.5px", margin: 0 }}>
                Admissions Management · Applied Students
              </h1>
              <span className="chip" style={{ background: "#dcfce7", color: "#15803d", fontWeight: 700, fontSize: "12px" }}>
                🔒 School Admin Only
              </span>
            </div>
            <p className="m" style={{ margin: "4px 0 0", fontSize: "15px" }}>
              Confidential registry of prospective student applications. Review submissions, inspect full records, enter assessment marks, and admit pupils.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn o"
              onClick={exportToCSV}
              style={{ fontSize: "14px", minHeight: "40px", padding: "8px 16px" }}
            >
              📥 Export All to CSV
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="st" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ color: "#4a5d55", fontSize: "13.5px", fontWeight: 600 }}>Total Applicants</div>
            <b className="big" style={{ color: "#0f5c47", fontSize: "32px", marginTop: "4px" }}>{stats.total}</b>
            <span className="m" style={{ fontSize: "13px" }}>Received to date</span>
          </div>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ color: "#4a5d55", fontSize: "13.5px", fontWeight: 600 }}>Awaiting Assessment</div>
            <b className="big" style={{ color: "#b45309", fontSize: "32px", marginTop: "4px" }}>{stats.review}</b>
            <span className="m" style={{ fontSize: "13px" }}>New or under review</span>
          </div>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ color: "#4a5d55", fontSize: "13.5px", fontWeight: 600 }}>Assessments Scheduled</div>
            <b className="big" style={{ color: "#0369a1", fontSize: "32px", marginTop: "4px" }}>{stats.scheduled}</b>
            <span className="m" style={{ fontSize: "13px" }}>Exam dates assigned</span>
          </div>
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ color: "#4a5d55", fontSize: "13.5px", fontWeight: 600 }}>Admitted & Enrolled</div>
            <b className="big" style={{ color: "#15803d", fontSize: "32px", marginTop: "4px" }}>{stats.admitted}</b>
            <span className="m" style={{ fontSize: "13px" }}>Issued Student IDs</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          className="card"
          style={{
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1, minWidth: "300px" }}>
            <input
              type="text"
              placeholder="🔍 Search applicant name, parent, phone, ref ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: "1 1 240px", minHeight: "40px" }}
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ flex: "0 1 150px", minHeight: "40px" }}
            >
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: "0 1 180px", minHeight: "40px" }}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Under Review">Under Review</option>
              <option value="Assessment Scheduled">Assessment Scheduled</option>
              <option value="Offer Extended">Offer Extended</option>
              <option value="Admitted">Admitted</option>
            </select>
          </div>

          <div style={{ fontSize: "13.5px", color: "#4a5d55", fontWeight: 600 }}>
            Showing {filteredApplicants.length} of {applications.length} applicants
          </div>
        </div>

        {/* Applied Students Data Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filteredApplicants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "#4a5d55" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📋</div>
              <h3 style={{ fontSize: "20px", margin: "0 0 6px", color: "#17231f" }}>No matching applications found</h3>
              <p style={{ fontSize: "14px", margin: "0 0 16px" }}>Try clearing search or filters to see all student applications.</p>
              <button
                type="button"
                className="btn o"
                onClick={() => { setSearch(""); setClassFilter("All"); setStatusFilter("All"); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Date</th>
                    <th>Child Full Name</th>
                    <th>Class</th>
                    <th>Parent / Contact</th>
                    <th>Status</th>
                    <th>Assessment</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, fontSize: "13px", color: "#0f5c47" }}>
                        <div>{app.id}</div>
                        <div style={{ marginTop: "3px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "99px",
                              background: app.feePaid !== false ? "#dcfce7" : "#fee2e2",
                              color: app.feePaid !== false ? "#15803d" : "#b91c1c",
                              border: `1px solid ${app.feePaid !== false ? "#86efac" : "#fca5a5"}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {app.feePaid !== false ? "✓ Fee Paid" : "Fee Unpaid"}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>
                        {app.date}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "#17231f", fontSize: "14.5px" }}>
                          {app.childName}
                        </div>
                        <div className="m" style={{ fontSize: "12px" }}>
                          {app.gender} · {app.dob ? `DOB: ${app.dob}` : "DOB not provided"}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, fontSize: "13.5px" }}>{app.className}</span>
                        {app.prevSchool && (
                          <div className="m" style={{ fontSize: "12px" }}>Ex: {app.prevSchool}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "13.5px" }}>{app.parentName}</div>
                        <div className="m" style={{ fontSize: "12px" }}>
                          📞 {app.phone} {app.email ? `· ✉️ ${app.email}` : ""}
                        </div>
                      </td>
                      <td>
                        <span className={`chip ${statusColors[app.status] || "new"}`}>
                          {app.status || "New"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>
                          {app.score || "Pending Exam"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => openApplicantDetails(app)}
                          style={{ marginRight: "12px", fontSize: "13.5px" }}
                        >
                          Inspect Details →
                        </button>
                        {app.status !== "Admitted" && (
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => handleAdmitApplicant(app.id)}
                            style={{ background: "#0b4a39", padding: "4px 10px", fontSize: "12px" }}
                            title="Auto-generate Student ID, create fee ledger & email credentials"
                          >
                            Admit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Full Applicant Details & Inspection */}
      {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ fontSize: "24px", color: "#0f5c47", margin: 0 }}>
                    {selectedApplicant.childName}
                  </h2>
                  <span className={`chip ${statusColors[modalStatus] || "new"}`}>
                    {modalStatus}
                  </span>
                </div>
                <span className="m" style={{ fontSize: "13.5px" }}>
                  Application Reference: <b>{selectedApplicant.id}</b> · Submitted: {selectedApplicant.date}
                </span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedApplicant(null)}
              >
                ✕
              </button>
            </div>

            {/* Applicant Profile Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                background: "#f9fbfa",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #d8e1dc",
                marginBottom: "20px",
                fontSize: "13.5px",
              }}
            >
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Class Applied For</div>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f5c47" }}>{selectedApplicant.className}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Date of Birth / Gender</div>
                <div style={{ fontWeight: 600 }}>{selectedApplicant.dob || "Not specified"} ({selectedApplicant.gender})</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>State of Origin</div>
                <div style={{ fontWeight: 600 }}>{selectedApplicant.stateOfOrigin || "Not specified"}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Previous School Attended</div>
                <div style={{ fontWeight: 600 }}>{selectedApplicant.prevSchool || "None / First School"}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Parent / Guardian Name</div>
                <div style={{ fontWeight: 700 }}>{selectedApplicant.parentName} ({selectedApplicant.relationship})</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Primary Phone</div>
                <div style={{ fontWeight: 700, color: "#0f5c47" }}>{selectedApplicant.phone}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Email Address</div>
                <div style={{ fontWeight: 600 }}>{selectedApplicant.email || "Not provided"}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Residential Address</div>
                <div style={{ fontWeight: 600 }}>{selectedApplicant.address || "Not provided"}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Emergency Contact</div>
                <div style={{ fontWeight: 600 }}>{selectedApplicant.emergencyContact || "Same as parent"}</div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Application Fee (₦5,000)</div>
                <div style={{ fontWeight: 700, color: selectedApplicant.feePaid !== false ? "#15803d" : "#b91c1c" }}>
                  {selectedApplicant.feePaid !== false
                    ? `✓ Paid (Ref: ${selectedApplicant.feeRef || "Verified"})`
                    : "⚠️ Not Paid"}
                </div>
              </div>
              <div>
                <div style={{ color: "#4a5d55", fontWeight: 600 }}>Medical Information</div>
                <div style={{ fontWeight: 600, color: selectedApplicant.medicalInfo && selectedApplicant.medicalInfo !== "None" ? "#b91c1c" : "#17231f" }}>
                  {selectedApplicant.medicalInfo || "None reported"}
                </div>
              </div>
            </div>

            {/* School Decision & Assessment Controls */}
            <div style={{ borderTop: "1px solid #d8e1dc", paddingTop: "18px", marginTop: "10px" }}>
              <h3 style={{ fontSize: "18px", color: "#0f5c47", margin: "0 0 12px" }}>
                Admission Assessment &amp; Processing
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <label>
                  Application Status
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assessment Scheduled">Assessment Scheduled</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Admitted">Admitted</option>
                  </select>
                </label>

                <label>
                  Entrance Assessment Score / Status
                  <input
                    type="text"
                    placeholder="e.g. 78% (Passed), Scheduled for Sat 9am"
                    value={modalScore}
                    onChange={(e) => setModalScore(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Administrative Notes &amp; Observations
                <textarea
                  rows={3}
                  placeholder="Internal observations, interview notes, fee payment agreement, etc."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn"
                  onClick={handleSaveModalUpdates}
                  style={{ background: "#0f5c47" }}
                >
                  Save Assessment Updates
                </button>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: "1px solid #e6ece8",
              }}
            >
              <button
                type="button"
                className="btn o"
                onClick={handlePrintSlip}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                🖨️ Print Application Slip
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                {modalStatus !== "Admitted" && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleAdmitApplicant(selectedApplicant.id)}
                    style={{ background: "#0b4a39" }}
                  >
                    ✅ Admit &amp; Enroll Student
                  </button>
                )}
                <button
                  type="button"
                  className="btn o"
                  onClick={() => setSelectedApplicant(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Email Dispatch Confirmation Slip upon Admitting Student */}
      {latestDispatch && (
        <EmailDispatchModal dispatch={latestDispatch} onClose={clearLatestDispatch} />
      )}
    </div>
  );
}
