import useStore from "../store/useStore";
import { useState } from "react";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("1234");
  const login = useStore((state) => state.login);
  const loginError = useStore((state) => state.loginError);
  const setPage = useStore((state) => state.setPage);
  const teachers = useStore((state) => state.teachers) || [];
  const students = useStore((state) => state.students) || [];

  const handleQuickFill = (targetId, pin = "1234") => {
    setId(targetId);
    setPassword(pin);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    login(id, password);
  };

  return (
    <div className="pg p-Login">
      <section className="l">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="brand" style={{ fontSize: "26px", fontWeight: "700" }}>Rehoboth Academy</span>
          <button
            type="button"
            onClick={() => setPage("home")}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            ← Back to Website
          </button>
        </div>

        <div>
          <h1 style={{ fontSize: "40px", lineHeight: "1.15", margin: 0 }}>
            Unified Portal for School, Teachers &amp; Students
          </h1>
          <p style={{ fontSize: "17px", margin: "18px 0 0", maxWidth: "440px", lineHeight: "1.5", opacity: 0.95 }}>
            Sign in with your designated ID to access your tailored dashboard. Student IDs are auto-generated and emailed upon enrollment; teachers use their staff IDs.
          </p>

          <div
            style={{
              marginTop: "28px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "16px 20px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "13.5px",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "11.5px", opacity: 0.9 }}>
              Portal Role Structure:
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "6px", opacity: 0.95 }}>
              <li><b>Teachers (<code style={{ background: "rgba(0,0,0,0.2)", padding: "1px 5px", borderRadius: 4 }}>TCH-...</code>):</b> Grade sheets, score entries &amp; broadcasts.</li>
              <li><b>Students (<code style={{ background: "rgba(0,0,0,0.2)", padding: "1px 5px", borderRadius: 4 }}>STU-...</code>):</b> Term results, fee payments &amp; notices.</li>
              <li><b>School Admin (<code style={{ background: "rgba(0,0,0,0.2)", padding: "1px 5px", borderRadius: 4 }}>SCH-...</code>):</b> Full administrative &amp; fee control.</li>
            </ul>
          </div>
        </div>

        <span style={{ fontSize: "13.5px", opacity: 0.85 }}>
          Need assistance with your login ID? Contact the school ICT desk or your class teacher.
        </span>
      </section>

      <section className="r">
        <div className="box">
          <h2 style={{ fontSize: "30px", margin: "0 0 6px" }}>Portal Sign in</h2>
          <p className="m" style={{ margin: "0 0 20px", fontSize: "14.5px" }}>
            Enter your ID and default PIN (<b>1234</b>) or select a profile below:
          </p>

          {/* Quick-Pick ID Chips */}
          <div style={{ marginBottom: "20px", padding: "14px", background: "#ffffff", borderRadius: "10px", border: "1px solid #d8e1dc" }}>
            <span style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#566b62", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>
              Quick Demo Accounts (Default PIN: 1234)
            </span>

            {/* Teachers */}
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#0f5c47", display: "block", marginBottom: "4px" }}>
                👩‍🏫 Teacher Login IDs:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {teachers.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleQuickFill(t.id)}
                    style={{
                      background: id === t.id ? "#0f5c47" : "#e1f0ea",
                      color: id === t.id ? "#ffffff" : "#0b4a39",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    title={`${t.name} (${t.subject})`}
                  >
                    {t.id} · {t.name.split(" ")[1] || t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Students */}
            <div style={{ marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a4a80", display: "block", marginBottom: "4px" }}>
                🎓 Student Login IDs:
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {students.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleQuickFill(s.id)}
                    style={{
                      background: id === s.id ? "#1a4a80" : "#e0f2fe",
                      color: id === s.id ? "#ffffff" : "#0369a1",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    title={`${s.name} (${s.className})`}
                  >
                    {s.id} · {s.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin */}
            <div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#7a4b00", display: "block", marginBottom: "4px" }}>
                🏫 School Administrator:
              </span>
              <button
                type="button"
                onClick={() => handleQuickFill("SCH-001")}
                style={{
                  background: id === "SCH-001" ? "#7a4b00" : "#fef3c7",
                  color: id === "SCH-001" ? "#ffffff" : "#92400e",
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                SCH-001 · Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="id">Login ID (Teacher, Student or Admin)</label>
            <input
              id="id"
              type="text"
              placeholder="e.g. TCH-001, STU-001, SCH-001"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />

            <label htmlFor="pw">Password or PIN</label>
            <input
              id="pw"
              type="password"
              placeholder="Default PIN: 1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="btn" type="submit" style={{ cursor: "pointer", marginTop: "16px" }}>
              Sign in to Portal →
            </button>
          </form>

          {loginError && (
            <div
              style={{
                marginTop: "14px",
                background: "#fef2f2",
                border: "1px solid #f87171",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "#b91c1c",
                fontSize: "13.5px",
                fontWeight: 600,
              }}
            >
              ⚠ {loginError}
            </div>
          )}

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact the school administrative office or call +234 803 000 1122 to reset your portal password."); }} style={{ color: "#0f5c47", fontWeight: "600" }}>
              Forgot password?
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setPage("admissions"); }} style={{ color: "#0f5c47", fontWeight: "600" }}>
              Apply for Admission →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
