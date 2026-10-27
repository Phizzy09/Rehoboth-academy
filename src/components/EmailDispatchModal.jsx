import { useState, useEffect } from "react";
import useStore from "../store/useStore";
import {
  sendAdmissionEmail,
  getEmailConfig,
  saveEmailConfig,
  getGmailComposeUrl,
} from "../services/emailService";

export default function EmailDispatchModal({ dispatch, onClose }) {
  const [copiedText, setCopiedText] = useState("");
  const [emailStatus, setEmailStatus] = useState("sending"); // "sending" | "sent" | "unconfigured" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(getEmailConfig());

  const login = useStore((state) => state.login);

  // Attempt sending on open
  useEffect(() => {
    if (!dispatch) return;

    let mounted = true;
    const triggerSend = async () => {
      setEmailStatus("sending");
      const res = await sendAdmissionEmail(dispatch);
      if (!mounted) return;

      if (res.attempted && res.success) {
        setEmailStatus("sent");
      } else if (res.attempted && !res.success) {
        setEmailStatus("error");
        setErrorMessage(res.error || "Email delivery failed.");
      } else {
        // Not configured with EmailJS API keys yet
        setEmailStatus("unconfigured");
      }
    };

    triggerSend();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (!dispatch) return null;

  const handleCopyCredentials = () => {
    const text = `Rehoboth Academy Student Portal Login:
Student Name: ${dispatch.studentName}
Student ID: ${dispatch.studentId}
Default Password / PIN: ${dispatch.defaultPassword}
Class: ${dispatch.className}
Portal URL: ${window.location.origin}`;
    navigator.clipboard?.writeText(text);
    setCopiedText("creds");
    setTimeout(() => setCopiedText(""), 2500);
  };

  const handleCopyFullLetter = () => {
    navigator.clipboard?.writeText(dispatch.messageBody || "");
    setCopiedText("letter");
    setTimeout(() => setCopiedText(""), 2500);
  };

  const handleOpenGmail = () => {
    const url = getGmailComposeUrl(dispatch);
    window.open(url, "_blank");
  };

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(
      dispatch.subject ||
        `Admission Confirmed - Rehoboth Academy Login Credentials (${dispatch.studentId})`
    );
    const body = encodeURIComponent(dispatch.messageBody || "");
    window.location.href = `mailto:${dispatch.email}?subject=${subject}&body=${body}`;
  };

  const handleDirectLogin = () => {
    login(dispatch.studentId, dispatch.defaultPassword);
    onClose();
  };

  const handleSaveConfigAndRetry = async (e) => {
    e.preventDefault();
    saveEmailConfig(config);
    setEmailStatus("sending");
    const res = await sendAdmissionEmail(dispatch);
    if (res.attempted && res.success) {
      setEmailStatus("sent");
      setShowConfig(false);
    } else {
      setEmailStatus("error");
      setErrorMessage(res.error || "Failed with provided credentials.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "640px",
          padding: "26px 30px",
          borderRadius: "16px",
          boxShadow: "0 25px 60px rgba(15, 92, 71, 0.25)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Header Badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          {emailStatus === "sent" ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "99px",
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "12.5px",
                fontWeight: "700",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#16a34a",
                  display: "inline-block",
                }}
              ></span>
              ✓ Real Email Sent to Student's Inbox
            </span>
          ) : emailStatus === "sending" ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "99px",
                background: "#fef9c3",
                color: "#854d0e",
                fontSize: "12.5px",
                fontWeight: "700",
              }}
            >
              ⏳ Contacting Mail Service...
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "99px",
                background: "#f1f5f9",
                color: "#475569",
                fontSize: "12.5px",
                fontWeight: "700",
              }}
            >
              ✉️ Credentials Ready for Delivery
            </span>
          )}

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <h2
          style={{
            fontSize: "24px",
            color: "#0f5c47",
            margin: "0 0 6px",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}
        >
          Admission Notification &amp; Credentials ✉️
        </h2>
        <p
          className="m"
          style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.45" }}
        >
          Student admitted successfully. Send their official <b>Student Login ID</b> and <b>Default Password</b> to the email address they provided during application.
        </p>

        {/* Real Email Delivery Action Bar if API not configured */}
        {emailStatus !== "sent" && (
          <div
            style={{
              background: "#eff6ff",
              border: "1.5px solid #bfdbfe",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <div>
                <b style={{ color: "#1e40af", fontSize: "14px" }}>
                  Instant Email Delivery:
                </b>
                <p style={{ margin: "4px 0 10px", fontSize: "13px", color: "#334155", lineHeight: "1.4" }}>
                  Send this credential email directly to <b>{dispatch.email}</b> using 1-Click Gmail Web or your device mail app:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0f5c47",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                  whiteSpace: "nowrap",
                }}
              >
                {showConfig ? "Hide API Setup" : "⚙️ Email API Settings"}
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn"
                onClick={handleOpenGmail}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: "13.5px",
                  padding: "8px 16px",
                  minHeight: "38px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 700,
                }}
              >
                📧 Send via Gmail Web (1-Click)
              </button>
              <button
                type="button"
                className="btn o"
                onClick={handleOpenMailClient}
                style={{
                  fontSize: "13px",
                  padding: "8px 14px",
                  minHeight: "38px",
                  background: "#fff",
                }}
              >
                ✉️ Open in Default Mail App
              </button>
            </div>
          </div>
        )}

        {/* EmailJS Setup Form Modal Toggle */}
        {showConfig && (
          <form
            onSubmit={handleSaveConfigAndRetry}
            style={{
              background: "#f8faf9",
              border: "1.5px dashed #0f5c47",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
              fontSize: "13px",
            }}
          >
            <b style={{ color: "#0f5c47", fontSize: "14px", display: "block", marginBottom: "6px" }}>
              ⚙️ Connect Automated Background Email (EmailJS)
            </b>
            <p style={{ margin: "0 0 12px", color: "#4a5d55" }}>
              Enter your free EmailJS credentials (from <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" style={{ color: "#0f5c47", fontWeight: 700 }}>emailjs.com</a>) to automatically dispatch emails silently in the background:
            </p>
            <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Service ID (e.g. service_xxxxxxx)"
                value={config.serviceId}
                onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
                style={{ minHeight: "36px", fontSize: "13px" }}
              />
              <input
                type="text"
                placeholder="Template ID (e.g. template_xxxxxxx)"
                value={config.templateId}
                onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
                style={{ minHeight: "36px", fontSize: "13px" }}
              />
              <input
                type="text"
                placeholder="Public Key (e.g. user_xxxxxxx / xxxxxxxxxx)"
                value={config.publicKey}
                onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                style={{ minHeight: "36px", fontSize: "13px" }}
              />
            </div>
            {errorMessage && (
              <span style={{ color: "#b91c1c", display: "block", marginBottom: "8px" }}>
                ⚠️ {errorMessage}
              </span>
            )}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn o sm"
                onClick={() => setShowConfig(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn sm"
                style={{ background: "#0f5c47" }}
              >
                Save &amp; Send Real Email Now
              </button>
            </div>
          </form>
        )}

        {/* Email Metadata Card */}
        <div
          style={{
            background: "#f8faf9",
            border: "1.5px solid #d1ded8",
            borderRadius: "12px",
            padding: "16px 18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "8px",
              borderBottom: "1px solid #e2ece7",
              paddingBottom: "12px",
              marginBottom: "14px",
              fontSize: "13.5px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>
                Recipient (Student/Parent Email):
              </span>
              <span
                style={{
                  color: "#0f5c47",
                  fontWeight: 800,
                  fontSize: "14.5px",
                  background: "#dcfce7",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {dispatch.email}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "6px",
              }}
            >
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>Subject:</span>
              <span style={{ color: "#17231f", fontWeight: 700 }}>
                {dispatch.subject}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>
                Firebase Sync:
              </span>
              <span style={{ color: "#15803d", fontWeight: 700 }}>
                ✓ Synced to Cloud Database
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#5a6e65", fontWeight: 600 }}>
                Timestamp:
              </span>
              <span style={{ color: "#74887f" }}>{dispatch.timestamp}</span>
            </div>
          </div>

          {/* Prominent Login Credentials Box */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              background: "#ffffff",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "2px solid #0f5c47",
              marginBottom: "14px",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#4e635a",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                🔑 Student Login ID
              </span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#0f5c47",
                  letterSpacing: "0.5px",
                }}
              >
                {dispatch.studentId}
              </span>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#4e635a",
                  textTransform: "uppercase",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                🔒 Default Password / PIN
              </span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#0f5c47",
                  letterSpacing: "0.5px",
                }}
              >
                {dispatch.defaultPassword}
              </span>
            </div>
          </div>

          {/* Full Message Preview */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#4e635a",
                  letterSpacing: "0.4px",
                }}
              >
                Message Text:
              </span>
              <button
                type="button"
                onClick={handleCopyFullLetter}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0f5c47",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                {copiedText === "letter"
                  ? "✓ Message Copied!"
                  : "📋 Copy Full Email"}
              </button>
            </div>
            <pre
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                padding: "12px 14px",
                border: "1px solid #e1ebe6",
                fontSize: "12.5px",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                color: "#2d3748",
                margin: 0,
                maxHeight: "160px",
                overflowY: "auto",
              }}
            >
              {dispatch.messageBody}
            </pre>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="btn o"
            onClick={handleCopyCredentials}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13.5px",
              padding: "8px 12px",
              minHeight: "38px",
            }}
          >
            {copiedText === "creds"
              ? "✓ Credentials Copied!"
              : "📋 Copy ID & PIN"}
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn o"
              onClick={handleDirectLogin}
              style={{
                fontSize: "13.5px",
                padding: "8px 14px",
                minHeight: "38px",
                borderColor: "#0f5c47",
              }}
              title="Test log in with this student's ID immediately"
            >
              🔑 Test Login as Student
            </button>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{
                background: "#0f5c47",
                fontSize: "14px",
                padding: "8px 18px",
                minHeight: "38px",
              }}
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
