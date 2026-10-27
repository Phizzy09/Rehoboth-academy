import useStore from "../store/useStore";
import { useState } from "react";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const login = useStore((state) => state.login);
  const loginError = useStore((state) => state.loginError);
  return (
    <div className="pg p-Login">
      <section className="l">
        <span className="brand" style={{ fontSize: "26px", fontWeight: "700" }}>Rehoboth Academy</span>
        <div>
          <h1 style={{ fontSize: "44px", lineHeight: "1.1" }}>One place for fees, results and school news.</h1>
          <p style={{ fontSize: "18px", margin: "16px 0 0", maxWidth: "420px" }}>
            Staff, parents and students all sign in here. Your ID takes you to the right page.
          </p>
        </div>
        <span style={{ fontSize: "14px" }}>Need help signing in? Ask the school office.</span>
      </section>
      <section className="r">
        <div className="box">
          <h2 style={{ fontSize: "30px" }}>Sign in</h2>
          <p className="m" style={{ margin: "6px 0 0" }}>Use the ID the school gave you.</p>
          <label htmlFor="id">School ID</label>
          <input id="id" type="text" placeholder="enter your ID" value={id} onChange={(e) => setId(e.target.value)} />
          <label htmlFor="pw">Password or PIN</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" type="button" onClick={() => login(id, password)}>Sign in</button>
          <p style={{ margin: "12px 0 0", color: "#a52a2a" }}>{loginError}</p>
          <p className="m" style={{ margin: "4px 0 0" }}></p>
          <p style={{ margin: "14px 0 0" }}>
            <a href="#" style={{ color: "#0f5c47", fontWeight: "600", display: "inline-block", minHeight: "44px", paddingTop: "10px" }}>Forgot your password?</a>
          </p>
        </div>
      </section>
    </div>
  );
}
