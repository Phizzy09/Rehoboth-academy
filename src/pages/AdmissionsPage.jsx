import { useState, useMemo } from "react";
import useStore from "../store/useStore";
import Header from "../components/Header";

const classes = ["Primary 4", "Primary 5", "JSS 1", "JSS 2", "SS 1", "SS 2"];

const classFees = {
  "Primary 4": { total: 123000, tuition: 80000 },
  "Primary 5": { total: 125000, tuition: 82000 },
  "JSS 1": { total: 155000, tuition: 112000 },
  "JSS 2": { total: 158000, tuition: 115000 },
  "SS 1": { total: 185000, tuition: 142000 },
  "SS 2": { total: 188000, tuition: 145000 },
};

const statusColors = {
  New: "new",
  "Under Review": "review",
  "Assessment Scheduled": "scheduled",
  "Offer Extended": "offer",
  Admitted: "admitted",
};

export default function AdmissionsPage() {
  const user = useStore((state) => state.user);
  const setPage = useStore((state) => state.setPage);
  const applications = useStore((state) => state.applications) || [];
  const addApplication = useStore((state) => state.addApplication);
  const updateApplication = useStore((state) => state.updateApplication);
  const admitStudentFromApplication = useStore((state) => state.admitStudentFromApplication);

  // Active view: "apply" (form) or "records" (registry where you get student details)
  const [tab, setTab] = useState(user?.role === "school" ? "records" : "apply");

  // Search & Filters for the records view
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

  // Form input fields
  const [formData, setFormData] = useState({
    childName: "",
    dob: "",
    gender: "Female",
    className: classes[0],
    prevSchool: "",
    lastClassPassed: "",
    stateOfOrigin: "",
    parentName: "",
    relationship: "Father",
    phone: "",
    email: "",
    address: "",
    medicalInfo: "None",
    emergencyContact: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [lastSubmitted, setLastSubmitted] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.childName.trim()) errors.childName = "Child full name is required";
    if (!formData.parentName.trim()) errors.parentName = "Parent/Guardian name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addApplication(formData);
    // Grab the newly created ID (year + count)
    const year = new Date().getFullYear();
    const appRef = `APP-${year}-${String(applications.length + 1).padStart(3, "0")}`;

    const submittedRecord = {
      ...formData,
      id: appRef,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      status: "New",
      score: "Pending Exam",
    };

    setLastSubmitted(submittedRecord);
    showToast(`Application ${appRef} submitted successfully!`);

    // Reset form
    setFormData({
      childName: "",
      dob: "",
      gender: "Female",
      className: classes[0],
      prevSchool: "",
      lastClassPassed: "",
      stateOfOrigin: "",
      parentName: "",
      relationship: "Father",
      phone: "",
      email: "",
      address: "",
      medicalInfo: "None",
      emergencyContact: "",
    });
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
    admitStudentFromApplication(appId);
    if (selectedApplicant && selectedApplicant.id === appId) {
      setSelectedApplicant((prev) => ({
        ...prev,
        status: "Admitted",
      }));
      setModalStatus("Admitted");
    }
    showToast("Student successfully admitted & enrolled into school records!");
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

  // Print slip
  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="pg p-Admissions">
      <Header kind={user?.role === "school" ? "school" : "site"} active="admissions" />

      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      <div className="in">
        {/* Page Top Header with Title and Mode Switcher */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "38px", color: "#0f5c47", letterSpacing: "-0.5px" }}>Admissions Portal</h1>
            <p className="m" style={{ margin: "6px 0 0", fontSize: "16px" }}>
              Submit new pupil applications or inspect comprehensive details of all students that apply.
            </p>
          </div>

          {/* Primary View Switcher: Apply vs Registry */}
          <div style={{ display: "flex", gap: "8px", background: "#e5ece8", padding: "5px", borderRadius: "10px" }}>
            <button
              type="button"
              onClick={() => setTab("apply")}
              style={{
                padding: "9px 18px",
                borderRadius: "7px",
                border: "none",
                fontSize: "14.5px",
                fontWeight: 600,
                cursor: "pointer",
                background: tab === "apply" ? "#0f5c47" : "transparent",
                color: tab === "apply" ? "#fff" : "#374d44",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span>📝</span> Apply for Admission
            </button>
            <button
              type="button"
              onClick={() => setTab("records")}
              style={{
                padding: "9px 18px",
                borderRadius: "7px",
                border: "none",
                fontSize: "14.5px",
                fontWeight: 600,
                cursor: "pointer",
                background: tab === "records" ? "#0f5c47" : "transparent",
                color: tab === "records" ? "#fff" : "#374d44",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <span>📋</span> Applied Students & Details
              <span
                style={{
                  background: tab === "records" ? "rgba(255,255,255,0.25)" : "#0f5c47",
                  color: "#fff",
                  fontSize: "12px",
                  padding: "1px 7px",
                  borderRadius: "99px",
                  fontWeight: 700,
                }}
              >
                {applications.length}
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: APPLIED STUDENTS & DETAILS REGISTRY (Where user gets details)
            ========================================================================= */}
        {tab === "records" && (
          <div>
            {/* Quick Metrics Bar */}
            <div className="st">
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ color: "#4a5d55", fontSize: "14px", fontWeight: 600 }}>Total Applicants</div>
                <b className="big" style={{ color: "#0f5c47", marginTop: "4px" }}>{stats.total}</b>
                <span className="m" style={{ fontSize: "13px" }}>Received to date</span>
              </div>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ color: "#4a5d55", fontSize: "14px", fontWeight: 600 }}>Awaiting Assessment</div>
                <b className="big" style={{ color: "#b45309", marginTop: "4px" }}>{stats.review}</b>
                <span className="m" style={{ fontSize: "13px" }}>New or under review</span>
              </div>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ color: "#4a5d55", fontSize: "14px", fontWeight: 600 }}>Assessment Scheduled</div>
                <b className="big" style={{ color: "#0284c7", marginTop: "4px" }}>{stats.scheduled}</b>
                <span className="m" style={{ fontSize: "13px" }}>Interview & test booked</span>
              </div>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ color: "#4a5d55", fontSize: "14px", fontWeight: 600 }}>Admitted & Enrolled</div>
                <b className="big" style={{ color: "#0f5c47", marginTop: "4px" }}>{stats.admitted}</b>
                <span className="m" style={{ fontSize: "13px" }}>Registered in school</span>
              </div>
            </div>

            {/* Controls Bar: Search, Filters, CSV Export */}
            <div
              className="card"
              style={{
                marginBottom: "20px",
                padding: "18px 22px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", flex: "1 1 320px", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <input
                    type="text"
                    placeholder="Search by student name, parent, ID or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ minHeight: "42px" }}
                  />
                </div>
                <div style={{ width: "160px" }}>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    style={{ minHeight: "42px" }}
                  >
                    <option value="All">All Classes</option>
                    {classes.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ width: "170px" }}>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ minHeight: "42px" }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assessment Scheduled">Assessment Scheduled</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Admitted">Admitted</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn o"
                  onClick={exportToCSV}
                  title="Download CSV spreadsheet of all applicant details"
                  style={{ minHeight: "42px", padding: "8px 16px", fontSize: "14px" }}
                >
                  📥 Export CSV
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setTab("apply")}
                  style={{ minHeight: "42px", padding: "8px 16px", fontSize: "14px" }}
                >
                  ➕ New Application
                </button>
              </div>
            </div>

            {/* Applicant Records Table */}
            <div className="card" style={{ padding: "0", overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid #e6ece8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "18px", color: "#17231f" }}>
                  Applicant Records ({filteredApplicants.length})
                </h3>
                <span className="m" style={{ fontSize: "13px" }}>
                  Click <b>View Details</b> on any pupil to inspect full bio, parent info, and admissions notes.
                </span>
              </div>

              {filteredApplicants.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "#61756d" }}>
                  <p style={{ fontSize: "17px", fontWeight: 600, margin: "0 0 8px" }}>No applicant records match your criteria.</p>
                  <p style={{ fontSize: "14px", margin: "0 0 16px" }}>Try clearing search or filters to see all student applications.</p>
                  <button
                    type="button"
                    className="btn o"
                    onClick={() => { setSearch(""); setClassFilter("All"); setStatusFilter("All"); }}
                    style={{ minHeight: "38px" }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Application Ref</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Parent / Contact</th>
                        <th>Assessment</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <b style={{ color: "#0f5c47", fontFamily: "Bricolage Grotesque", fontSize: "14px" }}>
                              {app.id}
                            </b>
                            <div className="m" style={{ fontSize: "12px", marginTop: "2px" }}>{app.date}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: "15px", color: "#17231f" }}>
                              {app.childName}
                            </div>
                            <div className="m" style={{ fontSize: "12.5px", marginTop: "2px" }}>
                              {app.gender || "Child"} {app.dob ? `· DOB: ${app.dob}` : ""}
                              {app.prevSchool ? ` · Ex: ${app.prevSchool.slice(0, 24)}...` : ""}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: "#17231f", fontSize: "14px" }}>
                              {app.className}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500, fontSize: "14px" }}>{app.parentName}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                              <a
                                href={`tel:${app.phone}`}
                                style={{ color: "#0f5c47", textDecoration: "none", fontSize: "13px" }}
                              >
                                {app.phone}
                              </a>
                              {app.phone && (
                                <a
                                  href={`https://wa.me/234${app.phone.replace(/^0/, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat on WhatsApp"
                                  style={{
                                    fontSize: "11px",
                                    padding: "1px 6px",
                                    background: "#25D366",
                                    color: "#fff",
                                    borderRadius: "4px",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                  }}
                                >
                                  WA
                                </a>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: app.score && app.score !== "Pending Exam" ? "#0f5c47" : "#7a4b00" }}>
                              {app.score || "Pending Exam"}
                            </span>
                          </td>
                          <td>
                            <span className={`chip ${statusColors[app.status] || "new"}`}>
                              {app.status || "New"}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                className="btn sm"
                                onClick={() => openApplicantDetails(app)}
                                title="Inspect all details of this student"
                              >
                                🔍 View Details
                              </button>
                              {app.status !== "Admitted" && (
                                <button
                                  type="button"
                                  className="btn o sm"
                                  onClick={() => handleAdmitApplicant(app.id)}
                                  title="Enroll student directly into school records"
                                  style={{ borderColor: "#0f5c47" }}
                                >
                                  Admit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: APPLICATION FORM (Where parents or admissions staff apply)
            ========================================================================= */}
        {tab === "apply" && (
          <div>
            {/* Banner if an application was recently submitted */}
            {lastSubmitted && (
              <div
                className="card"
                style={{
                  marginBottom: "24px",
                  background: "#eef8f4",
                  border: "1.5px solid #a3d9c7",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>🎉</span>
                    <b style={{ color: "#0f5c47", fontSize: "18px" }}>
                      Application Received for {lastSubmitted.childName}!
                    </b>
                  </div>
                  <p style={{ margin: "4px 0 0", color: "#234e40", fontSize: "14.5px" }}>
                    Reference ID: <b>{lastSubmitted.id}</b> · Class: <b>{lastSubmitted.className}</b> · Parent Phone: <b>{lastSubmitted.phone}</b>.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setTab("records");
                      const found = applications.find((a) => a.id === lastSubmitted.id) || lastSubmitted;
                      openApplicantDetails(found);
                    }}
                  >
                    👉 View Applicant Details Now
                  </button>
                  <button
                    type="button"
                    className="btn o"
                    onClick={() => setLastSubmitted(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))", gap: "32px" }}>
              {/* Left Column: Guidance, Steps & Class Fees */}
              <div>
                <h2 style={{ fontSize: "28px", color: "#17231f", marginBottom: "8px" }}>
                  Simple 4-Step Admission
                </h2>
                <p className="m" style={{ margin: "0 0 20px", fontSize: "15px" }}>
                  We are excited to welcome your child into the Rehoboth Academy family.
                </p>

                <div className="card" style={{ marginBottom: "14px" }}>
                  <b style={{ color: "#0f5c47" }}>1. Submit Online Details</b>
                  <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                    Fill out the student and parent details on this form. An application reference is instantly created.
                  </div>
                </div>

                <div className="card" style={{ marginBottom: "14px" }}>
                  <b style={{ color: "#0f5c47" }}>2. Entrance Assessment</b>
                  <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                    Short assessment in Mathematics and English Language, followed by an informal meeting with parents.
                  </div>
                </div>

                <div className="card" style={{ marginBottom: "14px" }}>
                  <b style={{ color: "#0f5c47" }}>3. Offer of Admission & Fees</b>
                  <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                    Review class breakdown fees, choose flexible instalment options, and accept your child's placement.
                  </div>
                </div>

                <div className="card" style={{ marginBottom: "20px" }}>
                  <b style={{ color: "#0f5c47" }}>4. Official Student ID</b>
                  <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                    Your child receives their official Student ID (e.g. STU-001) for results, fees ledger and announcements.
                  </div>
                </div>

                {/* Live Class Fee Preview Card */}
                <div className="card" style={{ background: "#f0f7f4", border: "1.5px solid #c7e5d8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b style={{ color: "#0b4a39", fontSize: "16px" }}>
                      Estimated Fees: {formData.className}
                    </b>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f5c47", fontFamily: "Bricolage Grotesque" }}>
                      ₦{classFees[formData.className]?.total.toLocaleString()} / term
                    </span>
                  </div>
                  <div className="m" style={{ marginTop: "8px", fontSize: "13.5px", color: "#3d574e" }}>
                    Includes Tuition (₦{classFees[formData.className]?.tuition.toLocaleString()}), Books & Supplies (₦25,000), Development Levy (₦10,000), and ICT Fee (₦8,000). Flexible instalments permitted.
                  </div>
                </div>
              </div>

              {/* Right Column: Application Form */}
              <div className="card" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e6ece8", paddingBottom: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "24px", margin: 0, color: "#0f5c47" }}>Student Application Form</h2>
                    <span className="m" style={{ fontSize: "13.5px" }}>All applied details are saved and immediately retrievable.</span>
                  </div>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setTab("records")}
                    style={{ fontSize: "13.5px" }}
                  >
                    View All Applicants ({applications.length}) →
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                  {/* Subsection 1: Student Details */}
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#0f5c47", marginBottom: "10px" }}>
                      Pupil Information
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <label>
                        Child's Full Name *
                        <input
                          type="text"
                          placeholder="e.g. Chinelo Mary Adeleke"
                          value={formData.childName}
                          onChange={(e) => handleInputChange("childName", e.target.value)}
                        />
                        {formErrors.childName && (
                          <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                            {formErrors.childName}
                          </span>
                        )}
                      </label>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <label>
                          Date of Birth
                          <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleInputChange("dob", e.target.value)}
                          />
                        </label>
                        <label>
                          Gender
                          <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange("gender", e.target.value)}
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                          </select>
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <label>
                          Class Applying For *
                          <select
                            value={formData.className}
                            onChange={(e) => handleInputChange("className", e.target.value)}
                          >
                            {classes.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          State of Origin
                          <input
                            type="text"
                            placeholder="e.g. Ogun State"
                            value={formData.stateOfOrigin}
                            onChange={(e) => handleInputChange("stateOfOrigin", e.target.value)}
                          />
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                        <label>
                          Previous School Attended
                          <input
                            type="text"
                            placeholder="e.g. Grace Children School, Lagos"
                            value={formData.prevSchool}
                            onChange={(e) => handleInputChange("prevSchool", e.target.value)}
                          />
                        </label>
                        <label>
                          Last Class Passed
                          <input
                            type="text"
                            placeholder="e.g. Primary 3"
                            value={formData.lastClassPassed}
                            onChange={(e) => handleInputChange("lastClassPassed", e.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Subsection 2: Parent / Guardian Details */}
                  <div style={{ marginTop: "10px", borderTop: "1px solid #e6ece8", paddingTop: "14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#0f5c47", marginBottom: "10px" }}>
                      Parent / Guardian Information
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                        <label>
                          Parent / Guardian Name *
                          <input
                            type="text"
                            placeholder="e.g. Mr. & Mrs. Adeleke"
                            value={formData.parentName}
                            onChange={(e) => handleInputChange("parentName", e.target.value)}
                          />
                          {formErrors.parentName && (
                            <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                              {formErrors.parentName}
                            </span>
                          )}
                        </label>
                        <label>
                          Relationship
                          <select
                            value={formData.relationship}
                            onChange={(e) => handleInputChange("relationship", e.target.value)}
                          >
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Legal Guardian">Guardian</option>
                          </select>
                        </label>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <label>
                          Phone Number (WhatsApp) *
                          <input
                            type="tel"
                            placeholder="e.g. 0803 123 4567"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                          />
                          {formErrors.phone && (
                            <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                              {formErrors.phone}
                            </span>
                          )}
                        </label>
                        <label>
                          Email Address
                          <input
                            type="email"
                            placeholder="e.g. parent@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                          />
                        </label>
                      </div>

                      <label>
                        Residential Home Address
                        <input
                          type="text"
                          placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Subsection 3: Health & Emergency Contact */}
                  <div style={{ marginTop: "10px", borderTop: "1px solid #e6ece8", paddingTop: "14px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#0f5c47", marginBottom: "10px" }}>
                      Medical & Emergency Contact
                    </div>

                    <div style={{ display: "grid", gap: "12px" }}>
                      <label>
                        Medical Notes or Allergies (or type "None")
                        <input
                          type="text"
                          placeholder="e.g. Asthmatic, peanut allergy, or None"
                          value={formData.medicalInfo}
                          onChange={(e) => handleInputChange("medicalInfo", e.target.value)}
                        />
                      </label>

                      <label>
                        Emergency Contact (Name & Phone)
                        <input
                          type="text"
                          placeholder="e.g. Mrs. Folashade Adeleke (0802 333 4455)"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div style={{ marginTop: "14px" }}>
                    <button
                      className="btn"
                      type="submit"
                      style={{ width: "100%", minHeight: "48px", fontSize: "16px" }}
                    >
                      🚀 Submit Application & Register Details
                    </button>
                    <p className="m" style={{ textAlign: "center", fontSize: "12.5px", marginTop: "10px" }}>
                      Submitted student details are immediately stored and viewable in the Admissions Registry.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: FULL STUDENT APPLICANT DETAILS (Inspect, Update, Print & Admit)
          ========================================================================= */}
      {selectedApplicant && (
        <div className="modal-overlay" onClick={() => setSelectedApplicant(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "760px", maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Modal Header */}
            <div className="modal-head">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "24px", color: "#0f5c47", margin: 0 }}>
                    {selectedApplicant.childName}
                  </h2>
                  <span className={`chip ${statusColors[modalStatus] || "new"}`}>
                    {modalStatus}
                  </span>
                </div>
                <div className="m" style={{ fontSize: "13px", marginTop: "4px" }}>
                  Application ID: <b>{selectedApplicant.id}</b> · Date Applied: <b>{selectedApplicant.date}</b>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedApplicant(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Organized Detail Tabs/Blocks */}
            <div style={{ display: "grid", gap: "20px", marginTop: "12px" }}>
              {/* Block 1: Pupil Academic & Personal Bio */}
              <div style={{ background: "#f8faf9", border: "1px solid #e1ebe6", borderRadius: "10px", padding: "16px" }}>
                <b style={{ color: "#0f5c47", fontSize: "15px", display: "block", marginBottom: "10px" }}>
                  🎓 Student Profile
                </b>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", fontSize: "14px" }}>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Class Applying For:</span>
                    <b style={{ color: "#17231f" }}>{selectedApplicant.className}</b>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Date of Birth:</span>
                    <span>{selectedApplicant.dob || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Gender:</span>
                    <span>{selectedApplicant.gender || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>State of Origin:</span>
                    <span>{selectedApplicant.stateOfOrigin || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Previous School:</span>
                    <span>{selectedApplicant.prevSchool || "None recorded"}</span>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Last Class Passed:</span>
                    <span>{selectedApplicant.lastClassPassed || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Block 2: Parent & Contact Details */}
              <div style={{ background: "#f8faf9", border: "1px solid #e1ebe6", borderRadius: "10px", padding: "16px" }}>
                <b style={{ color: "#0f5c47", fontSize: "15px", display: "block", marginBottom: "10px" }}>
                  👨‍👩‍👧 Parent / Guardian Contact Details
                </b>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", fontSize: "14px" }}>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Parent Name:</span>
                    <b style={{ color: "#17231f" }}>{selectedApplicant.parentName}</b>
                    <span className="m" style={{ fontSize: "12px" }}> ({selectedApplicant.relationship || "Guardian"})</span>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Phone Number:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <a href={`tel:${selectedApplicant.phone}`} style={{ color: "#0f5c47", fontWeight: 600 }}>
                        {selectedApplicant.phone}
                      </a>
                      {selectedApplicant.phone && (
                        <a
                          href={`https://wa.me/234${selectedApplicant.phone.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            background: "#25D366",
                            color: "#fff",
                            borderRadius: "4px",
                            textDecoration: "none",
                            fontWeight: 700,
                          }}
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Email:</span>
                    {selectedApplicant.email ? (
                      <a href={`mailto:${selectedApplicant.email}`} style={{ color: "#0f5c47" }}>
                        {selectedApplicant.email}
                      </a>
                    ) : (
                      <span className="m">Not provided</span>
                    )}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Home Address:</span>
                    <span>{selectedApplicant.address || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Block 3: Medical & Emergency */}
              <div style={{ background: "#f8faf9", border: "1px solid #e1ebe6", borderRadius: "10px", padding: "16px" }}>
                <b style={{ color: "#0f5c47", fontSize: "15px", display: "block", marginBottom: "10px" }}>
                  🏥 Health & Emergency Info
                </b>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Medical Notes / Allergies:</span>
                    <span style={{ color: selectedApplicant.medicalInfo && selectedApplicant.medicalInfo !== "None" ? "#b45309" : "#17231f", fontWeight: 500 }}>
                      {selectedApplicant.medicalInfo || "None"}
                    </span>
                  </div>
                  <div>
                    <span className="m" style={{ display: "block", fontSize: "12px" }}>Emergency Contact:</span>
                    <span>{selectedApplicant.emergencyContact || "Same as primary parent"}</span>
                  </div>
                </div>
              </div>

              {/* Block 4: Admissions Review, Status & Internal Notes */}
              <div style={{ background: "#fff", border: "1.5px solid #c8ddd3", borderRadius: "10px", padding: "16px" }}>
                <b style={{ color: "#0f5c47", fontSize: "15px", display: "block", marginBottom: "10px" }}>
                  ⚙️ Admissions Management & Assessment
                </b>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "12px" }}>
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
                    Assessment / Exam Score
                    <input
                      type="text"
                      placeholder="e.g. 92% or Pending Exam"
                      value={modalScore}
                      onChange={(e) => setModalScore(e.target.value)}
                    />
                  </label>
                </div>

                <label>
                  Admissions Office Remarks / Assessment Notes
                  <textarea
                    rows="3"
                    placeholder="Enter interview notes, entrance exam feedback, parent meeting outcome..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                  />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleSaveModalUpdates}
                    style={{ minHeight: "40px", padding: "8px 18px", fontSize: "14px" }}
                  >
                    💾 Save Notes & Status
                  </button>
                </div>
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
                    ✅ Admit & Enroll Student
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
    </div>
  );
}
