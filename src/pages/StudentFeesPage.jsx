import useStore from "../store/useStore";
import CountUp from "../components/CountUp";
import Header from "../components/Header";
import { money, splitPayment } from "../utils";

export default function StudentFeesPage() {
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const payments = useStore((state) => state.payments);
  const pay = useStore((state) => state.pay);
  const me = students.find((s) => s.id === user.id); // only my own record
  const owing = me.charged - me.paid;
  const rows = splitPayment(me.items, me.paid);
  const myPayments = payments.filter((p) => p.studentId === me.id);
  const barStyle = { width: Math.round((me.paid / me.charged) * 100) + "%" };
  return (
    <div className="pg p-StudentFees">
      <Header kind="student" active="studentFees" />
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
              <span className="big" style={{ color: "#7a4b00" }}><CountUp value={owing} /></span>
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
            {myPayments.map((p) => (
            <div className="hd" key={p.id}>
              <span>{p.date} · {p.method}</span>
              <span>
                <b>{money(p.amount)}</b>
                {" "}
                <a href="#" style={{ color: "#0f5c47" }}>Receipt</a>
              </span>
            </div>
            ))}
          </div>
        </div>
        <aside>
          <div className="card">
            <h3 style={{ fontSize: "18px" }}>Pay now</h3>
            <p className="m" style={{ margin: "6px 0 14px" }}>Pay any amount. Your balance updates straight away.</p>
            <a className="btn" href="#" onClick={(e) => { e.preventDefault(); pay(me.id, owing); }}>Pay {money(owing)}</a>
            <p className="m" style={{ margin: "16px 0 4px" }}>Or transfer to your own account number</p>
            <b style={{ fontSize: "20px" }}>{me.account}</b>
            <div className="m">Wema Bank</div>
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
