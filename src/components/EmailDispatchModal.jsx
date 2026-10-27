import { useState } from "react";
import useStore from "../store/useStore";

export default function EmailDispatchModal({ dispatch, onClose }) {
  const [copied, setCopied] = useState(false);
  const login = useStore((state) => state.login);

  if (!dispatch) return null;

  const handleCopy = () => {
    const text = `Rehoboth Academy Student Portal Credentials:\nStudent Name: ${dispatch.studentName}\nStudent ID: ${dispatch.studentId}\nDefault PIN/Password: ${dispatch.defaultPassword}\nClass: ${dispatch.className}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectLogin = () => {
    login(dispatch.studentId, dispatch.defaultPassword);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "560px",
          padding: "24px 28px",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(15, 92, 71, 0.25)",
        }}
      >
        {/* Header Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "99px",
              background: "#dcfce7",
              color: "#15803d",
              fontSize: "12.5px",
              fontWeight: "700",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block" }}></span>
            Auto-Generated &amp; Dispatched to Email
          </span>
          <button type="button" className="modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <h2 style={{ fontSize: "22px", color: "#0f5c47", margin: "0 0 6px", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          Student ID &amp; Credentials Dispatched ✉️
        </h2>
        <p className="m" style={{ margin: "0 0 18px", fontSize: "14.5px", lineHeight: "1.45" }}>
          The system generated a unique Student ID and delivered the portal login credentials directly to the student/parent email address.
        </p>

        {/* Simulated Email Envelope Card */}
        <div
          style={{
            background: "#f8faf9",
            border: "1.5px solid #d1ded8",
            borderRadius: "12px",
            padding: "16px 18px",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "grid", gap: "6px", borderBottom: "1px solid #e2ece7", paddingBottom: "12px", marginBottom: "12px", fontSize: "13.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>From:</span>
              <span style={{ color: "#17231f", fontWeight: 600 }}>Rehoboth Academy &lt;admissions@rehoboth.edu.ng&gt;</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>To (Recipient):</span>
              <span style={{ color: "#0f5c47", fontWeight: 700 }}>{dispatch.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>Subject:</span>
              <span style={{ color: "#17231f", fontWeight: 600 }}>{dispatch.subject}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>Timestamp:</span>
              <span style={{ color: "#74887f" }}>{dispatch.timestamp}</span>
            </div>
          </div>

          {/* Email Body & Credentials Highlight */}
          <div style={{ background: "#ffffff", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e1ebe6" }}>
            <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#17231f" }}>
              Dear <b>{dispatch.studentName}</b> &amp; Parents/Guardians,
            </p>
            <p style={{ margin: "0 0 12px", fontSize: "13.5px", color: "#42544c", lineHeight: "1.4" }}>
              Welcome to Rehoboth Academy! Your official student portal account has been created for <b>{dispatch.className}</b>. You can now log in to view term examination results, class positions, and school fee records.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                background: "#f0f7f4",
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px dashed #0f5c47",
              }}
            >
              <div>
                <span style={{ display: "block", fontSize: "11.5px", color: "#4e635a", textTransform: "uppercase", fontWeight: 700 }}>
                  Auto-Generated Student ID
                </span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f5c47", letterSpacing: "0.5px" }}>
                  {dispatch.studentId}
                </span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "11.5px", color: "#4e635a", textTransform: "uppercase", fontWeight: 700 }}>
                  Default Password / PIN
                </span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#0f5c47", letterSpacing: "0.5px" }}>
                  {dispatch.defaultPassword}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn o"
            onClick={handleCopy}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", padding: "8px 14px", minHeight: "40px" }}
          >
            {copied ? "✓ Copied to Clipboard!" : "📋 Copy Login Details"}
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn o"
              onClick={handleDirectLogin}
              style={{ fontSize: "13.5px", padding: "8px 14px", minHeight: "40px", borderColor: "#0f5c47" }}
              title="Test log in with this student's ID immediately"
            >
              🔑 Test Login as Student
            </button>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ background: "#0f5c47", fontSize: "14px", padding: "8px 18px", minHeight: "40px" }}
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
