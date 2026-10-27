import { useState } from "react";
import useStore from "../store/useStore";
import Header from "../components/Header";
import PaystackButton from "../components/PaystackButton";

const classes = ["Primary 4", "Primary 5", "JSS 1", "JSS 2", "SS 1", "SS 2"];

const classFees = {
  "Primary 4": { total: 123000, tuition: 80000 },
  "Primary 5": { total: 125000, tuition: 82000 },
  "JSS 1": { total: 155000, tuition: 112000 },
  "JSS 2": { total: 158000, tuition: 115000 },
  "SS 1": { total: 185000, tuition: 142000 },
  "SS 2": { total: 188000, tuition: 145000 },
};

const APPLICATION_FEE_NAIRA = 5000;
const APPLICATION_FEE_KOBO = 500000;

export default function AdmissionsPage() {
  const addApplication = useStore((state) => state.addApplication);
  const applications = useStore((state) => state.applications) || [];

  // Fee payment state: must be paid first before applying
  const [feePaid, setFeePaid] = useState(false);
  const [feeRef, setFeeRef] = useState("");
  const [manualRefInput, setManualRefInput] = useState("");
  const [showManualRef, setShowManualRef] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  // Step 1: Payer & Basic Pupil info required for fee payment
  const [payerData, setPayerData] = useState({
    childName: "",
    className: classes[0],
    parentName: "",
    email: "",
    phone: "",
  });

  const [payerErrors, setPayerErrors] = useState({});

  // Step 2: Full Application Form fields
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

  // Sync basic payer data to formData when payer data changes
  const handlePayerChange = (field, value) => {
    setPayerData((prev) => ({ ...prev, [field]: value }));
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (payerErrors[field]) {
      setPayerErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Validate basic details before allowing Paystack checkout
  const validatePayerInfo = () => {
    const errors = {};
    if (!payerData.childName.trim()) errors.childName = "Child full name is required";
    if (!payerData.parentName.trim()) errors.parentName = "Parent/Guardian name is required";
    if (!payerData.phone.trim()) errors.phone = "Phone number is required";
    if (!payerData.email.trim()) {
      errors.email = "Email address is required for payment confirmation";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setPayerErrors(errors);
      return false;
    }
    return true;
  };

  // When Paystack confirms payment of ₦5,000
  const handlePaystackSuccess = (response) => {
    const reference = response.reference || `PAY-${Date.now()}`;
    setFeePaid(true);
    setFeeRef(reference);
    setPaymentNotice(`Payment of ₦${APPLICATION_FEE_NAIRA.toLocaleString()} confirmed! Ref: ${reference}. Application form is now unlocked.`);
    // Ensure form data has payer fields
    setFormData((prev) => ({
      ...prev,
      childName: payerData.childName,
      className: payerData.className,
      parentName: payerData.parentName,
      email: payerData.email,
      phone: payerData.phone,
    }));
  };

  // Manual payment verification (bank transfer / school bursary receipt)
  const handleVerifyManualRef = (e) => {
    e.preventDefault();
    if (!manualRefInput.trim()) {
      alert("Please enter your bank transfer reference or school bursary receipt number.");
      return;
    }
    if (!validatePayerInfo()) return;

    const ref = manualRefInput.trim().toUpperCase();
    setFeePaid(true);
    setFeeRef(ref);
    setPaymentNotice(`Payment reference "${ref}" verified! Application form is now unlocked.`);
    setFormData((prev) => ({
      ...prev,
      childName: payerData.childName,
      className: payerData.className,
      parentName: payerData.parentName,
      email: payerData.email,
      phone: payerData.phone,
    }));
  };

  // Final Form Submission
  const handleSubmitApplication = (e) => {
    e.preventDefault();

    if (!feePaid) {
      alert("Please pay the ₦5,000 application processing fee in Step 1 before submitting your application.");
      return;
    }

    const errors = {};
    if (!formData.childName.trim()) errors.childName = "Child full name is required";
    if (!formData.parentName.trim()) errors.parentName = "Parent/Guardian name is required";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required for portal credential dispatch";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const year = new Date().getFullYear();
    const appRef = `APP-${year}-${String(applications.length + 1).padStart(3, "0")}`;
    const dateFormatted = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const applicationRecord = {
      ...formData,
      feePaid: true,
      feeRef: feeRef || `PAY-${Date.now()}`,
      feeAmount: APPLICATION_FEE_NAIRA,
      feePaidDate: dateFormatted,
    };

    // Save into Zustand store & Firebase
    addApplication(applicationRecord);

    const submittedRecord = {
      ...applicationRecord,
      id: appRef,
      date: dateFormatted,
    };

    setLastSubmitted(submittedRecord);

    // Reset form & payment state for another entry if needed
    setFeePaid(false);
    setFeeRef("");
    setManualRefInput("");
    setPaymentNotice("");
    setPayerData({
      childName: "",
      className: classes[0],
      parentName: "",
      email: "",
      phone: "",
    });
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
        <div style={{ marginBottom: "24px" }}>
          <h1 className="responsive-h1" style={{ color: "#0f5c47", letterSpacing: "-0.5px", margin: 0 }}>
            Admission Application
          </h1>
          <p className="m" style={{ margin: "8px 0 0", fontSize: "16px" }}>
            Official admissions for Rehoboth Academy. Complete the 2-step online procedure below.
          </p>
        </div>

        {/* Admissions Stepper Progress */}
        <div className="admissions-stepper-container">
          <div className={`step-item ${feePaid ? "completed" : "active"}`}>
            <div className="step-circle">{feePaid ? "✓" : "1"}</div>
            <div className="step-content">
              <span className="step-label">Step 1</span>
              <span className="step-name">Pay Application Fee (₦5,000)</span>
            </div>
          </div>
          <div className="step-divider" />
          <div className={`step-item ${feePaid ? "active" : "locked"}`}>
            <div className="step-circle">{feePaid ? "2" : "🔒"}</div>
            <div className="step-content">
              <span className="step-label">Step 2</span>
              <span className="step-name">Complete Pupil Form</span>
            </div>
          </div>
          <div className="step-divider" />
          <div className="step-item upcoming">
            <div className="step-circle">3</div>
            <div className="step-content">
              <span className="step-label">Step 3</span>
              <span className="step-name">Entrance Assessment</span>
            </div>
          </div>
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
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>🎉</span>
                  <b style={{ color: "#14532d", fontSize: "18px" }}>
                    Application Successfully Submitted for {lastSubmitted.childName}!
                  </b>
                </div>
                <p style={{ margin: "8px 0 0", color: "#166534", fontSize: "14.5px", lineHeight: "1.5" }}>
                  Application Reference: <b style={{ color: "#0f5c47" }}>{lastSubmitted.id}</b> · Class: <b>{lastSubmitted.className}</b>.<br />
                  Application Processing Fee (₦5,000): <span style={{ background: "#bbf7d0", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>PAID · Ref: {lastSubmitted.feeRef}</span>.<br />
                  Our admissions board will contact you on <b>{lastSubmitted.phone}</b> to schedule the entrance assessment and interview.
                </p>
              </div>
              <button
                type="button"
                className="btn o"
                onClick={() => setLastSubmitted(null)}
                style={{ background: "#ffffff", borderColor: "#16a34a", color: "#15803d", flexShrink: 0 }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="responsive-split-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
          {/* Left Column: Guidance & Class Fees */}
          <div>
            <h2 style={{ fontSize: "26px", color: "#17231f", marginBottom: "8px" }}>
              Admission Requirements
            </h2>
            <p className="m" style={{ margin: "0 0 20px", fontSize: "15px" }}>
              In line with school policy, candidates must pay the ₦5,000 application fee to unlock and submit the official form.
            </p>

            <div className="card" style={{ marginBottom: "14px", borderLeft: "4px solid #0f5c47" }}>
              <b style={{ color: "#0f5c47", fontSize: "15.5px" }}>Step 1: Application Fee (₦5,000)</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                Paid securely via Paystack (card, bank transfer, or USSD) or verified using school bursary receipt. This confirms your intent to sit the assessment.
              </div>
            </div>

            <div className="card" style={{ marginBottom: "14px", borderLeft: "4px solid #0f5c47" }}>
              <b style={{ color: "#0f5c47", fontSize: "15.5px" }}>Step 2: Pupil &amp; Guardian Biodata</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                Unlocks immediately upon payment confirmation. Submit pupil's medical history, emergency contacts, and previous academic background.
              </div>
            </div>

            <div className="card" style={{ marginBottom: "14px", borderLeft: "4px solid #0f5c47" }}>
              <b style={{ color: "#0f5c47", fontSize: "15.5px" }}>Step 3: Assessment &amp; Parent Interview</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                Pupil takes a friendly placement test in Mathematics and English Language to identify their strengths.
              </div>
            </div>

            <div className="card" style={{ marginBottom: "20px", borderLeft: "4px solid #0f5c47" }}>
              <b style={{ color: "#0f5c47", fontSize: "15.5px" }}>Step 4: Admission Letter &amp; Student ID</b>
              <div className="m" style={{ marginTop: "4px", fontSize: "13.5px" }}>
                Upon admission offer, an official Student ID (e.g. STU-015) and portal default password (1234) are automatically dispatched to your email.
              </div>
            </div>

            {/* Live Class Fee Preview Card */}
            <div className="card" style={{ background: "#f0f7f4", border: "1.5px solid #c7e5d8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <b style={{ color: "#0b4a39", fontSize: "15px" }}>
                  Estimated Class Fees: {payerData.className}
                </b>
                <span style={{ fontSize: "17px", fontWeight: 700, color: "#0f5c47", fontFamily: "Bricolage Grotesque" }}>
                  ₦{classFees[payerData.className]?.total.toLocaleString()} / term
                </span>
              </div>
              <div className="m" style={{ marginTop: "8px", fontSize: "13px", color: "#3d574e", lineHeight: "1.4" }}>
                Includes Tuition (₦{classFees[payerData.className]?.tuition.toLocaleString()}), Books &amp; Supplies (₦25,000), Development Levy (₦10,000), and ICT Fee (₦8,000). Flexible termly instalments allowed.
              </div>
            </div>
          </div>

          {/* Right Column: Step 1 (Payment) & Step 2 (Form) */}
          <div style={{ display: "grid", gap: "24px" }}>
            {/* STEP 1: Fee Payment Section */}
            <div className="card" style={{ padding: "24px", border: feePaid ? "2px solid #86efac" : "1.5px solid #9fb0a8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: feePaid ? "#16a34a" : "#0f5c47",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      {feePaid ? "✓" : "1"}
                    </span>
                    <h2 style={{ fontSize: "20px", margin: 0, color: "#0f5c47" }}>
                      Step 1: Pay Application Fee (₦5,000)
                    </h2>
                  </div>
                  <p className="m" style={{ margin: "4px 0 0 36px", fontSize: "13.5px" }}>
                    {feePaid
                      ? "Fee payment verified. Application form is unlocked below."
                      : "Required first before applying. Pay online via Paystack or enter bursary reference."}
                  </p>
                </div>

                {feePaid && (
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      border: "1px solid #86efac",
                      padding: "4px 12px",
                      borderRadius: "99px",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    ✓ Fee Paid
                  </span>
                )}
              </div>

              {/* Notice if paid */}
              {feePaid && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    marginTop: "12px",
                  }}
                >
                  <b style={{ color: "#166534", fontSize: "14.5px" }}>✅ Application Fee Confirmed!</b>
                  <p style={{ margin: "4px 0 0", color: "#15803d", fontSize: "13.5px" }}>
                    Payment Reference: <code>{feeRef}</code> · Amount: <b>₦5,000</b>.<br />
                    Step 2 is unlocked below. Please complete pupil information and submit.
                  </p>
                </div>
              )}

              {/* Payment inputs when not paid yet */}
              {!feePaid && (
                <div style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
                  <label>
                    Pupil Full Name *
                    <input
                      type="text"
                      placeholder="e.g. Adaobi Chidera Nwosu"
                      value={payerData.childName}
                      onChange={(e) => handlePayerChange("childName", e.target.value)}
                    />
                    {payerErrors.childName && (
                      <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                        {payerErrors.childName}
                      </span>
                    )}
                  </label>

                  <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label>
                      Class Applying For *
                      <select
                        value={payerData.className}
                        onChange={(e) => handlePayerChange("className", e.target.value)}
                      >
                        {classes.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Parent / Guardian Name *
                      <input
                        type="text"
                        placeholder="e.g. Mr. Emmanuel Nwosu"
                        value={payerData.parentName}
                        onChange={(e) => handlePayerChange("parentName", e.target.value)}
                      />
                      {payerErrors.parentName && (
                        <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                          {payerErrors.parentName}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label>
                      Parent Email Address *
                      <input
                        type="email"
                        placeholder="e.g. nwosu.family@gmail.com"
                        value={payerData.email}
                        onChange={(e) => handlePayerChange("email", e.target.value)}
                      />
                      {payerErrors.email && (
                        <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                          {payerErrors.email}
                        </span>
                      )}
                    </label>

                    <label>
                      Parent Phone Number *
                      <input
                        type="tel"
                        placeholder="e.g. 0803 123 4567"
                        value={payerData.phone}
                        onChange={(e) => handlePayerChange("phone", e.target.value)}
                      />
                      {payerErrors.phone && (
                        <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                          {payerErrors.phone}
                        </span>
                      )}
                    </label>
                  </div>

                  {/* Fee Summary Banner */}
                  <div
                    style={{
                      background: "#f8faf9",
                      border: "1.5px solid #d8e1dc",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "#6b7e76" }}>
                        Application Processing Fee
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "#0f5c47", fontFamily: "Bricolage Grotesque" }}>
                        ₦5,000.00
                      </div>
                    </div>

                    <PaystackButton
                      email={payerData.email}
                      amountKobo={APPLICATION_FEE_KOBO}
                      reference={`RA-APP-${Date.now()}`}
                      metadata={{
                        childName: payerData.childName,
                        className: payerData.className,
                        parentName: payerData.parentName,
                        phone: payerData.phone,
                        type: "admission_application_fee",
                      }}
                      label="Pay ₦5,000 via Paystack"
                      style={{
                        padding: "12px 20px",
                        fontSize: "15px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                      onSuccess={handlePaystackSuccess}
                      onClose={() => {}}
                    />
                  </div>

                  {/* Toggle manual bank transfer / bursary receipt */}
                  <div style={{ textAlign: "center", marginTop: "4px" }}>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setShowManualRef(!showManualRef)}
                      style={{ fontSize: "13.5px" }}
                    >
                      {showManualRef
                        ? "▲ Hide bank transfer verification"
                        : "▼ Paid at bursary or via bank transfer? Verify Reference"}
                    </button>
                  </div>

                  {showManualRef && (
                    <div
                      style={{
                        padding: "14px",
                        background: "#f0f7f4",
                        border: "1px dashed #0f5c47",
                        borderRadius: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <b style={{ color: "#0f5c47", fontSize: "13.5px", display: "block", marginBottom: "6px" }}>
                        Verify School Bursary Receipt or Bank Transfer
                      </b>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="e.g. RA-BURSARY-001 or Transfer Ref"
                          value={manualRefInput}
                          onChange={(e) => setManualRefInput(e.target.value)}
                          style={{ flex: 1, minHeight: "40px" }}
                        />
                        <button
                          type="button"
                          className="btn"
                          onClick={handleVerifyManualRef}
                          style={{ minHeight: "40px", padding: "8px 16px" }}
                        >
                          Verify &amp; Unlock
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: Application Biodata Form */}
            <div
              className="card"
              style={{
                padding: "24px",
                position: "relative",
                opacity: feePaid ? 1 : 0.65,
                transition: "opacity 0.25s",
              }}
            >
              {/* If fee not paid, lock overlay */}
              {!feePaid && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(245, 247, 245, 0.75)",
                    backdropFilter: "blur(2px)",
                    borderRadius: "10px",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "#e1f0ea",
                      color: "#0f5c47",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      marginBottom: "12px",
                    }}
                  >
                    🔒
                  </div>
                  <b style={{ fontSize: "18px", color: "#17231f", marginBottom: "6px" }}>
                    Application Form Locked
                  </b>
                  <p style={{ maxWidth: "380px", margin: "0 0 16px", fontSize: "14px", color: "#4a5d55" }}>
                    In accordance with Rehoboth Academy admissions policy, the <b>₦5,000 application fee</b> must be paid in Step 1 before this form can be filled and submitted.
                  </p>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      const el = document.querySelector(".p-Admissions");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    ↑ Go to Step 1: Pay ₦5,000
                  </button>
                </div>
              )}

              <div style={{ marginBottom: "16px", borderBottom: "1px solid #e6ece8", paddingBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#0f5c47",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    2
                  </span>
                  <h2 style={{ fontSize: "20px", margin: 0, color: "#0f5c47" }}>
                    Step 2: Pupil Biodata &amp; Application Form
                  </h2>
                </div>
                <span className="m" style={{ fontSize: "13.5px", marginLeft: "36px", display: "block", marginTop: "2px" }}>
                  Please complete the remaining pupil and guardian details for enrolment.
                </span>
              </div>

              <form onSubmit={handleSubmitApplication} style={{ display: "grid", gap: "16px" }}>
                {/* Subsection 1: Pupil Details */}
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
                        disabled={!feePaid}
                      />
                      {formErrors.childName && (
                        <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                          {formErrors.childName}
                        </span>
                      )}
                    </label>

                    <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <label>
                        Date of Birth
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          disabled={!feePaid}
                        />
                      </label>

                      <label>
                        Gender
                        <select
                          value={formData.gender}
                          onChange={(e) => handleInputChange("gender", e.target.value)}
                          disabled={!feePaid}
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </select>
                      </label>
                    </div>

                    <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <label>
                        Class Applying For *
                        <select
                          value={formData.className}
                          onChange={(e) => handleInputChange("className", e.target.value)}
                          disabled={!feePaid}
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
                          disabled={!feePaid}
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
                        disabled={!feePaid}
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
                    <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                      <label>
                        Parent / Guardian Name *
                        <input
                          type="text"
                          placeholder="e.g. Mr. Emmanuel Nwosu"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange("parentName", e.target.value)}
                          disabled={!feePaid}
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
                          disabled={!feePaid}
                        >
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                      </label>
                    </div>

                    <div className="responsive-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <label>
                        Primary Phone Number *
                        <input
                          type="tel"
                          placeholder="e.g. 0803 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={!feePaid}
                        />
                        {formErrors.phone && (
                          <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                            {formErrors.phone}
                          </span>
                        )}
                      </label>

                      <label>
                        Email Address *
                        <input
                          type="email"
                          placeholder="e.g. nwosu.family@gmail.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!feePaid}
                        />
                        {formErrors.email ? (
                          <span style={{ color: "#b91c1c", fontSize: "12px", marginTop: "2px", display: "block" }}>
                            {formErrors.email}
                          </span>
                        ) : (
                          <span style={{ color: "#0f5c47", fontSize: "11.5px", marginTop: "3px", display: "block" }}>
                            ✉️ Student ID &amp; portal password will be sent here upon admission
                          </span>
                        )}
                      </label>
                    </div>

                    <label>
                      Residential Address
                      <input
                        type="text"
                        placeholder="e.g. 14 Unity Road, GRA, Ilorin"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        disabled={!feePaid}
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
                        disabled={!feePaid}
                      />
                    </label>

                    <label>
                      Emergency Contact Number (if different)
                      <input
                        type="tel"
                        placeholder="e.g. 0802 987 6543"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        disabled={!feePaid}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #e6ece8", paddingTop: "16px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={!feePaid}
                    style={{
                      width: "100%",
                      minHeight: "48px",
                      fontSize: "16px",
                      cursor: feePaid ? "pointer" : "not-allowed",
                      background: feePaid ? "#0f5c47" : "#9fb0a8",
                    }}
                  >
                    {feePaid
                      ? `Submit Official Application (Fee Paid: ₦${APPLICATION_FEE_NAIRA.toLocaleString()}) →`
                      : "🔒 Pay ₦5,000 Application Fee Above to Submit Application"}
                  </button>
                  <p className="m" style={{ fontSize: "12.5px", textAlign: "center", margin: "10px 0 0" }}>
                    By submitting, you agree to Rehoboth Academy admissions regulations and communications.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
