import { useState, useEffect } from "react";
import useStore from "../store/useStore";
import CountUp from "../components/CountUp";
import Header from "../components/Header";
import { money, splitPayment } from "../utils";

export default function StudentFeesPage() {
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const payments = useStore((state) => state.payments);
  const pay = useStore((state) => state.pay);
  const me = students.find((s) => s.id === user.id) || { charged: 0, paid: 0, items: [], account: "" }; // only my own record
  const owing = Math.max(0, me.charged - me.paid);
  const isPaidInFull = owing <= 0;
  const rows = splitPayment(me.items || [], me.paid);
  const myPayments = payments.filter((p) => p.studentId === me.id);
  const barPercent = me.charged > 0 ? Math.min(100, Math.round((me.paid / me.charged) * 100)) : 100;
  const barStyle = { width: `${barPercent}%` };

  // Partial payment state
  const [payAmount, setPayAmount] = useState(owing > 0 ? String(owing) : "");
  const [payError, setPayError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Sync default pay amount if owing updates and entered amount exceeds new owing
  useEffect(() => {
    if (owing <= 0) {
      setPayAmount("");
      setPayError("");
    } else if (!payAmount || Number(payAmount) > owing) {
      setPayAmount(String(owing));
    }
  }, [owing]);

  const numToPay = Number(payAmount);
  const isValidAmount = !isNaN(numToPay) && numToPay > 0 && numToPay <= owing;

  const handlePay = (e) => {
    e.preventDefault();
    if (isPaidInFull || owing <= 0) return;

    if (isNaN(numToPay) || numToPay <= 0) {
      setPayError("Please enter an amount greater than ₦0");
      return;
    }
    if (numToPay > owing) {
      setPayError(`Amount cannot exceed the total balance of ${money(owing)}`);
      return;
    }

    setPayError("");
    pay(me.id, numToPay);
    showToast(`✓ Payment of ${money(numToPay)} successful!`);
  };

  return (
    <div className="pg p-StudentFees">
      <Header kind="student" active="studentFees" />
      {toast && <div className="toast">{toast}</div>}

      <div className="wrap">
        <div>
          <h1 style={{ fontSize: "32px" }}>My fees · First Term</h1>
          <div className="st">
            <div className="card" style={{ margin: "0" }}>
              <span className="m">Total fees</span>
              <span className="big"><CountUp value={me.charged} /></span>
            </div>
            <div className="card" style={{ margin: "0" }}>
              <span className="m">Paid</span>
              <span className="big"><CountUp value={me.paid} /></span>
            </div>
            <div className="card" style={{ margin: "0" }}>
              <span className="m">I owe</span>
              <span className="big" style={{ color: isPaidInFull ? "#0f5c47" : "#7a4b00" }}>
                {isPaidInFull ? "₦0" : <CountUp value={owing} />}
              </span>
            </div>
          </div>
          <div className="card">
            <div className="hd">
              <h3 style={{ fontSize: "18px" }}>Fee breakdown</h3>
              <span className="m">Set by the school. You cannot change these.</span>
            </div>
            <div className="bar">
              <i style={barStyle} />
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="n">Charged</th>
                  <th className="n">Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="n">{money(r.charged)}</td>
                    <td className="n">{money(r.paid)}</td>
                    <td>
                      <span className={r.chipClass}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>Payment history</h3>
            {myPayments.length === 0 ? (
              <p className="m" style={{ margin: "6px 0" }}>No payments recorded yet.</p>
            ) : (
              myPayments.map((p) => (
                <div className="hd" key={p.id}>
                  <span>{p.date} · {p.method}</span>
                  <span>
                    <b>{money(p.amount)}</b>
                    {" "}
                    <a href="#" style={{ color: "#0f5c47" }}>Receipt</a>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <aside>
          <div
            className="card"
            style={{
              background: isPaidInFull ? "#f0f8f5" : "#fff",
              border: isPaidInFull ? "1.5px solid #a3d9c7" : "1px solid #d8e1dc",
            }}
          >
            <h3 style={{ fontSize: "18px", color: isPaidInFull ? "#0f5c47" : "#17231f", margin: "0 0 8px" }}>
              {isPaidInFull ? "✓ Fees Paid in Full" : "Make a payment"}
            </h3>

            {isPaidInFull ? (
              <>
                <div
                  style={{
                    margin: "10px 0 16px",
                    padding: "12px",
                    background: "#e1f0ea",
                    borderRadius: "8px",
                    color: "#0b4a39",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    lineHeight: "1.4",
                  }}
                >
                  🎉 All fees have been paid in full for this term! Your outstanding balance is <b>₦0</b>.
                </div>
                <button
                  type="button"
                  className="btn"
                  disabled
                  style={{
                    width: "100%",
                    display: "block",
                    textAlign: "center",
                    background: "#9fb0a8",
                    cursor: "not-allowed",
                    opacity: 0.65,
                    pointerEvents: "none",
                  }}
                >
                  ✓ Paid in Full (₦0 Owed)
                </button>
              </>
            ) : (
              <form onSubmit={handlePay}>
                <p className="m" style={{ margin: "0 0 14px", fontSize: "13.5px" }}>
                  Pay in full or make flexible partial payments in instalments.
                </p>

                {/* Amount input for custom / partial payment */}
                <label style={{ display: "block", marginBottom: "10px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#17231f", display: "block", marginBottom: "4px" }}>
                    Amount to pay now (₦)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={owing}
                    value={payAmount}
                    onChange={(e) => {
                      setPayAmount(e.target.value);
                      setPayError("");
                    }}
                    placeholder={`e.g. ${Math.round(owing / 2)}`}
                    style={{
                      width: "100%",
                      minHeight: "44px",
                      padding: "8px 12px",
                      fontSize: "16px",
                      fontWeight: "700",
                      border: payError ? "1.5px solid #e11d48" : "1.5px solid #9fb0a8",
                      borderRadius: "8px",
                      fontFamily: "inherit",
                      background: "#fff",
                    }}
                  />
                  {payError && (
                    <span style={{ color: "#e11d48", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {payError}
                    </span>
                  )}
                  {isValidAmount && (
                    <span style={{ fontSize: "12px", color: "#4a5d55", display: "block", marginTop: "4px" }}>
                      Remaining after payment: <b>{money(Math.max(0, owing - numToPay))}</b>
                    </span>
                  )}
                </label>

                {/* Quick-Pick Installment Presets */}
                <div style={{ marginBottom: "14px" }}>
                  <span style={{ fontSize: "12px", color: "#61756d", display: "block", marginBottom: "6px" }}>
                    Quick instalment amounts:
                  </span>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => { setPayAmount(String(owing)); setPayError(""); }}
                      style={{
                        padding: "3px 8px",
                        background: Number(payAmount) === owing ? "#e1f0ea" : "#f0f4f2",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#0f5c47",
                        fontWeight: 600,
                      }}
                    >
                      Full ({money(owing)})
                    </button>
                    {owing >= 10000 && (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => { setPayAmount(String(Math.round(owing / 2))); setPayError(""); }}
                        style={{
                          padding: "3px 8px",
                          background: Number(payAmount) === Math.round(owing / 2) ? "#e1f0ea" : "#f0f4f2",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "#0f5c47",
                          fontWeight: 600,
                        }}
                      >
                        50% ({money(Math.round(owing / 2))})
                      </button>
                    )}
                    {owing >= 20000 && (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => { setPayAmount(String(Math.round(owing / 4))); setPayError(""); }}
                        style={{
                          padding: "3px 8px",
                          background: Number(payAmount) === Math.round(owing / 4) ? "#e1f0ea" : "#f0f4f2",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "#0f5c47",
                          fontWeight: 600,
                        }}
                      >
                        25% ({money(Math.round(owing / 4))})
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn"
                  disabled={!isValidAmount}
                  style={{
                    width: "100%",
                    display: "block",
                    textAlign: "center",
                    cursor: isValidAmount ? "pointer" : "not-allowed",
                    opacity: isValidAmount ? 1 : 0.6,
                  }}
                >
                  Pay {isValidAmount ? money(numToPay) : "Now"}
                </button>

                <p className="m" style={{ margin: "16px 0 4px" }}>
                  Or transfer to your dedicated virtual account
                </p>
                <b style={{ fontSize: "20px" }}>{me.account}</b>
                <div className="m">Wema Bank · Rehoboth Academy</div>
              </form>
            )}
          </div>
          <div className="card">
            <b>Private to you.</b>
            {" "}
            <span className="m">Other students’ fees are hidden.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
