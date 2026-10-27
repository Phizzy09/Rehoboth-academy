import { useState } from "react";
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

export default function AdmissionsPage() {
  const addApplication = useStore((state) => state.addApplication);
  const applications = useStore((state) => state.applications) || [];

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
    const year = new Date().getFullYear();
    const appRef = `APP-${year}-${String(applications.length + 1).padStart(3, "0")}`;

    const submittedRecord = {
      ...formData,
      id: appRef,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };

    setLastSubmitted(submittedRecord);

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

  return (
    <div className="pg p-Admissions">
      <Header kind="site" active="admissions" />

      <div className="in">
        {/* Top Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "38px", color: "#0f5c47", letterSpacing: "-0.5px", margin: 0 }}>
            Admissions
          </h1>
          <p className="m" style={{ margin: "6px 0 0", fontSize: "16px" }}>
            Four steps from online application to your child’s first day at Rehoboth Academy.
          </p>
        </div>

        {/* Submission Confirmation Banner for this applicant */}
        {lastSubmitted && (
          <div
            style={{
              background: "#dcfce7",
              border: "1.5px solid #86efac",
              borderRadius: "12px",
              padding: "20px 24px",
              marginBottom: "28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>🎉</span>
                <b style={{ color: "#14532d", fontSize: "18px" }}>
                  Application Received for {lastSubmitted.childName}!
                </b>
              </div>
              <p style={{ margin: "6px 0 0", color: "#166534", fontSize: "14.5px", lineHeight: "1.4" }}>
                Application Reference: <b>{lastSubmitted.id}</b> · Class: <b>{lastSubmitted.className}</b>.<br />
                Thank you for applying! Our admissions office will contact you on <b>{lastSubmitted.phone}</b> to schedule your child's entrance assessment.
              </p>
            </div>
            <button
              type="button"
              className="btn o"
              onClick={() => setLastSubmitted(null)}
              style={{ background: "#ffffff", borderColor: "#16a34a", color: "#15803d" }}
            >
              Done / Dismiss
            </button>
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
              <b style={{ color: "#0f5c47" }}>1. Submit Online Application</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                Fill out the student and parent details on this form. An application reference ID is instantly created for you.
              </div>
            </div>

            <div className="card" style={{ marginBottom: "14px" }}>
              <b style={{ color: "#0f5c47" }}>2. Entrance Assessment</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                A short assessment in Mathematics and English Language, followed by a friendly interaction with parents.
              </div>
            </div>

            <div className="card" style={{ marginBottom: "14px" }}>
              <b style={{ color: "#0f5c47" }}>3. Offer of Admission &amp; Fees</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                Review class fee breakdowns, select flexible instalment options, and accept your child's placement.
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px" }}>
              <b style={{ color: "#0f5c47" }}>4. Official Student ID</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "14px" }}>
                Your child is issued their official auto-generated Student ID and default PIN (delivered by email) to access the student portal.
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
              <div className="m" style={{ marginTop: "8px", fontSize: "13.5px", color: "#3d574e", lineHeight: "1.4" }}>
                Includes Tuition (₦{classFees[formData.className]?.tuition.toLocaleString()}), Books &amp; Supplies (₦25,000), Development Levy (₦10,000), and ICT Fee (₦8,000). Flexible instalment payments permitted.
              </div>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ marginBottom: "16px", borderBottom: "1px solid #e6ece8", paddingBottom: "12px" }}>
              <h2 style={{ fontSize: "24px", margin: 0, color: "#0f5c47" }}>Student Application Form</h2>
              <span className="m" style={{ fontSize: "13.5px" }}>
                Submit your child’s details to begin the admissions process for the upcoming academic session.
              </span>
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
                      placeholder="e.g. Adaobi Chidera Nwosu"
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
                        placeholder="e.g. Kwara, Oyo, Anambra"
                        value={formData.stateOfOrigin}
                        onChange={(e) => handleInputChange("stateOfOrigin", e.target.value)}
                      />
                    </label>
                  </div>

                  <label>
                    Previous School Attended (if any)
                    <input
                      type="text"
                      placeholder="e.g. St. Jude Nursery & Primary School"
                      value={formData.prevSchool}
                      onChange={(e) => handleInputChange("prevSchool", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Subsection 2: Parent / Guardian Information */}
              <div style={{ borderTop: "1px solid #e6ece8", paddingTop: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#0f5c47", marginBottom: "10px" }}>
                  Parent / Guardian Details
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                    <label>
                      Parent / Guardian Name *
                      <input
                        type="text"
                        placeholder="e.g. Mr. Emmanuel Nwosu"
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
                        <option value="Guardian">Guardian</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label>
                      Primary Phone Number *
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
                        placeholder="e.g. nwosu.family@gmail.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </label>
                  </div>

                  <label>
                    Residential Address
                    <input
                      type="text"
                      placeholder="e.g. 14 Unity Road, GRA, Ilorin"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Subsection 3: Health & Emergency Contact */}
              <div style={{ borderTop: "1px solid #e6ece8", paddingTop: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "#0f5c47", marginBottom: "10px" }}>
                  Medical &amp; Additional Information
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  <label>
                    Any Known Medical Conditions or Allergies
                    <input
                      type="text"
                      placeholder="e.g. Asthmatic, Penicillin allergy (or 'None')"
                      value={formData.medicalInfo}
                      onChange={(e) => handleInputChange("medicalInfo", e.target.value)}
                    />
                  </label>

                  <label>
                    Emergency Contact Number (if different)
                    <input
                      type="tel"
                      placeholder="e.g. 0802 987 6543"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e6ece8", paddingTop: "16px", marginTop: "8px" }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ width: "100%", minHeight: "48px", fontSize: "16px", cursor: "pointer" }}
                >
                  Submit Application →
                </button>
                <p className="m" style={{ fontSize: "12.5px", textAlign: "center", margin: "10px 0 0" }}>
                  By submitting, you agree to Rehoboth Academy admissions policy and communication by phone and email.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
