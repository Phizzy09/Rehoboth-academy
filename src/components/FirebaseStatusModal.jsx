import { useState } from "react";
import useStore from "../store/useStore";
import { fbSeedAllData } from "../services/firebaseService";

export default function FirebaseStatusModal({ onClose }) {
  const firebaseStatus = useStore((state) => state.firebaseStatus);
  const retryFirebaseSync = useStore((state) => state.retryFirebaseSync);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");
  const [copied, setCopied] = useState(false);

  const rulesSnippet = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;

  const handleCopyRules = () => {
    navigator.clipboard?.writeText(rulesSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult("");
    try {
      await fbSeedAllData();
      await retryFirebaseSync();
      setSeedResult("✓ SUCCESS! All collections (applications, students, results, notices, payments) have been seeded to your Firebase Console!");
    } catch (err) {
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        setSeedResult("❌ Failed: Permission Denied. Please update your Firestore Rules in Firebase Console first (see instructions below) and click Publish.");
      } else {
        setSeedResult(`❌ Error: ${err.message}`);
      }
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "620px", padding: "26px", borderRadius: "14px" }}
      >
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>🔥</span>
            <div>
              <h2 style={{ fontSize: "20px", margin: 0, color: "#0f5c47", fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Firebase Cloud Firestore Connection
              </h2>
              <span className="m" style={{ fontSize: "12.5px" }}>Project: <b>schooldesk-40a3a</b></span>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Status Card */}
        <div
          style={{
            background: firebaseStatus === "connected" ? "#f0fdf4" : "#fef2f2",
            border: `1.5px solid ${firebaseStatus === "connected" ? "#86efac" : "#fca5a5"}`,
            borderRadius: "10px",
            padding: "14px 18px",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>{firebaseStatus === "connected" ? "✅" : "⚠️"}</span>
            <b style={{ color: firebaseStatus === "connected" ? "#15803d" : "#b91c1c", fontSize: "15px" }}>
              {firebaseStatus === "connected"
                ? "Connected & Live Sync Active!"
                : "Permission Denied: Firestore Security Rules are Blocking Access"}
            </b>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: firebaseStatus === "connected" ? "#166534" : "#7f1d1d", lineHeight: "1.4" }}>
            {firebaseStatus === "connected"
              ? "Your app is connected to Cloud Firestore. Changes to applications, students, results, and fees sync automatically in real time."
              : "Firebase requires you to set your Cloud Firestore Security Rules in the Firebase Console so the app can read and write data."}
          </p>
        </div>

        {/* 10-Second Fix Instructions if permission denied */}
        {firebaseStatus !== "connected" && (
          <div style={{ background: "#f8faf9", border: "1px solid #d8e1dc", borderRadius: "10px", padding: "16px", marginBottom: "18px", fontSize: "13.5px" }}>
            <b style={{ color: "#0f5c47", fontSize: "14px", display: "block", marginBottom: "8px" }}>
              How to fix in 3 quick steps in Firebase Console:
            </b>
            <ol style={{ margin: 0, paddingLeft: "20px", display: "grid", gap: "8px", lineHeight: "1.4" }}>
              <li>
                Open the Firebase Console:{" "}
                <a
                  href="https://console.firebase.google.com/project/schooldesk-40a3a/firestore/rules"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0f5c47", fontWeight: 700, textDecoration: "underline" }}
                >
                  Firestore Rules for schooldesk-40a3a ↗
                </a>
              </li>
              <li>
                Under the <b>Rules</b> tab, replace whatever is there with:
                <div style={{ position: "relative", marginTop: "6px" }}>
                  <pre style={{ background: "#1e293b", color: "#f8fafc", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", overflowX: "auto", margin: 0 }}>
                    {rulesSnippet}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopyRules}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "#334155",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11.5px",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Rule"}
                  </button>
                </div>
              </li>
              <li>
                Click the blue <b>"Publish"</b> button at the top of the Firebase Console.
              </li>
            </ol>
          </div>
        )}

        {/* Action feedback */}
        {seedResult && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "8px",
              background: seedResult.includes("SUCCESS") ? "#ecfdf5" : "#fef2f2",
              color: seedResult.includes("SUCCESS") ? "#047857" : "#b91c1c",
              border: `1px solid ${seedResult.includes("SUCCESS") ? "#a7f3d0" : "#fecaca"}`,
              fontSize: "13.5px",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            {seedResult}
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <button
            type="button"
            className="btn"
            onClick={handleSeed}
            disabled={seeding}
            style={{ background: "#0f5c47", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px" }}
          >
            {seeding ? "⏳ Writing to Firebase..." : "🚀 Test & Push All Data to Firebase"}
          </button>

          <button type="button" className="btn o" onClick={onClose} style={{ minHeight: "38px", padding: "8px 16px" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
