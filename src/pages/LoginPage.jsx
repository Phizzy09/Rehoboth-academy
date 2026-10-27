import useStore from "../store/useStore";
import { useState } from "react";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const login = useStore((state) => state.login);
  const loginError = useStore((state) => state.loginError);
  const setPage = useStore((state) => state.setPage);

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
            One place for fees, results and school news.
          </h1>
          <p style={{ fontSize: "17px", margin: "18px 0 0", maxWidth: "440px", lineHeight: "1.5", opacity: 0.95 }}>
            Staff, parents and students all sign in here. Your ID takes you to the right page.
          </p>
        </div>

        <span style={{ fontSize: "13.5px", opacity: 0.85 }}>
          Need assistance with your login ID? Contact the school ICT desk or your class teacher.
        </span>
      </section>

      <section className="r">
        <div className="box">
          <h2 style={{ fontSize: "30px", margin: "0 0 6px" }}>Portal Sign in</h2>
          <p className="m" style={{ margin: "0 0 20px", fontSize: "14.5px" }}>
            Use the ID and password assigned to you by the school.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="id">Login ID</label>
            <input
              id="id"
              type="text"
              placeholder="Enter your ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              autoFocus
            />

            <label htmlFor="pw">Password or PIN</label>
            <input
              id="pw"
              type="password"
              placeholder="Enter your password or PIN"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="btn" type="submit" style={{ cursor: "pointer", marginTop: "18px" }}>
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

          <div style={{ marginTop: "22px", display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert("Please contact the school administrative office or call 09160854127 to reset your portal password.");
              }}
              style={{ color: "#0f5c47", fontWeight: "600" }}
            >
              Forgot password?
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("admissions");
              }}
              style={{ color: "#0f5c47", fontWeight: "600" }}
            >
              Apply for Admission →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
