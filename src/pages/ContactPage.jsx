import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const textareaStyle = { width: "100%", padding: "8px 12px", border: "1.5px solid #9fb0a8", borderRadius: "8px", font: "inherit" };

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="pg p-Home">
      <Header kind="site" active="contact" />
      <section className="in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
        <div>
          <h1 className="responsive-h1" style={{ fontSize: "44px" }}>Contact us</h1>
          <p className="m" style={{ margin: "10px 0 24px" }}>Call, email or visit the school office.</p>
          <div className="card">
            <p style={{ margin: "0 0 10px" }}><b>Address</b><br />14 School Road, Ilorin, Kwara State</p>
            <p style={{ margin: "0 0 10px" }}><b>Phone</b><br />09160854127, 07026039107</p>
            <p style={{ margin: "0 0 10px" }}><b>Email</b><br />info@rehobothacademy.ng</p>
            <p style={{ margin: 0 }}><b>Office hours</b><br />Monday to Friday, 8:00 am to 4:00 pm</p>
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: "26px", marginBottom: "16px" }}>Send us a message</h2>
          {sent && <p style={{ color: "#0f5c47", fontWeight: 600 }}>Thank you. The school will call you on {phone}.</p>}
          <div style={{ display: "grid", gap: "14px" }}>
            <label>Your name<input type="text" value={name} onChange={(e) => setName(e.target.value)} /></label>
            <label>Phone number (WhatsApp)<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <label>Message<textarea rows="4" style={textareaStyle} value={message} onChange={(e) => setMessage(e.target.value)} /></label>
            <button className="btn" type="button" onClick={() => setSent(true)}>Send message</button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
