import useStore from "../store/useStore";
import Header from "../components/Header";
import { useState } from "react";

const channelOptions = ["WhatsApp", "SMS", "Email"];
const emptyParent = { name: "", child: "", phone: "", email: "" };

export default function BroadcastPage() {
  const notices = useStore((state) => state.notices);
  const addNotice = useStore((state) => state.addNotice);
  const addParent = useStore((state) => state.addParent);
  const [text, setText] = useState("Second term resumes on 11 January 2027.");
  const [channels, setChannels] = useState(["WhatsApp"]);
  const [parent, setParent] = useState(emptyParent);
  const recent = notices.slice(0, 4);

  const toggleChannel = (c) => {
    if (channels.includes(c)) setChannels(channels.filter((x) => x !== c));
    else setChannels([...channels, c]);
  };
  const send = () => {
    addNotice({ id: Date.now(), tag: "Broadcast", title: text.slice(0, 40), text: text, channels: channels.join(", "), button: null, goto: null });
    setText("");
  };
  const saveParent = () => {
    addParent(parent);
    setParent(emptyParent);
  };
  return (
    <div className="pg p-Broadcast">
      <Header kind="school" active="broadcast" />
      <div className="wrap">
        <div>
          <div className="hd">
            <h1 style={{ fontSize: "32px" }}>Broadcast a message</h1>
            <a className="btn o" href="#parents">Add parent details</a>
          </div>
          <div className="card" style={{ marginTop: "16px" }}>
            <label>
              Send to
              <select>
                <option>All students and parents</option>
                <option>One class</option>
                <option>Students who owe fees</option>
              </select>
            </label>
            <fieldset style={{ border: "0", padding: "0", margin: "14px 0 0" }}>
              <legend style={{ fontWeight: "600", marginBottom: "4px" }}>Send through</legend>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {channelOptions.map((c) => (
                <label className="c" key={c}>
                  <input type="checkbox" checked={channels.includes(c)} onChange={() => toggleChannel(c)} />
                  {c}
                </label>
                ))}
              </div>
            </fieldset>
            <label style={{ display: "block", marginTop: "8px" }}>
              Message
              <textarea rows="5" style={{ resize: "vertical" }} value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button className="btn" type="button" onClick={send}>Send now</button>
              <button className="btn o" type="button">Schedule</button>
            </div>
          </div>
          <div className="card" id="parents">
            <div className="hd" style={{ marginBottom: "12px" }}>
              <h3 style={{ fontSize: "18px" }}>Add a parent</h3>
              <button className="btn o" type="button">Import list (CSV)</button>
            </div>
            <p className="m" style={{ margin: "0 0 14px" }}>Broadcasts reach a parent only through the details saved here.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label>
                Parent name
                <input type="text" placeholder="e.g. Mr. Okon" value={parent.name} onChange={(e) => setParent({ ...parent, name: e.target.value })} />
              </label>
              <label>
                Child’s name
                <input type="text" placeholder="e.g. Ifeoma Okon" value={parent.child} onChange={(e) => setParent({ ...parent, child: e.target.value })} />
              </label>
              <label>
                Child’s class
                <select>
                  <option>Primary 4</option>
                </select>
              </label>
              <label>
                Phone number (WhatsApp and SMS)
                <input type="tel" placeholder="e.g. 0803 000 0000" value={parent.phone} onChange={(e) => setParent({ ...parent, phone: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Email (optional)
                <input type="email" placeholder="e.g. name@email.com" value={parent.email} onChange={(e) => setParent({ ...parent, email: e.target.value })} />
              </label>
            </div>
            <div style={{ marginTop: "16px" }}>
              <button className="btn" type="button" onClick={saveParent}>Save parent</button>
            </div>
          </div>
        </div>
        <aside>
          <div className="card">
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Also on Notices</h3>
            <p className="m" style={{ margin: "0" }}>Every broadcast is saved on each student’s Notices page too.</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Recent</h3>
            {recent.map((n) => (
            <div key={n.id} style={{ padding: "8px 0", borderBottom: "1px solid #e6ece8" }}>
              <b>{n.title}</b>
              <div className="m">{n.channels} · Delivered</div>
            </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
