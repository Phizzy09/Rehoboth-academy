import useStore from "../store/useStore";
import Header from "../components/Header";

export default function StudentNoticesPage() {
  const notices = useStore((state) => state.notices);
  const setPage = useStore((state) => state.setPage);
  return (
    <div className="pg p-StudentNotices">
      <Header kind="student" active="studentNotices" />
      <div className="wrap">
        <div>
          <h1 style={{ fontSize: "32px" }}>Notices</h1>
          <p className="m" style={{ margin: "6px 0 20px" }}>Everything the school sends you, in one place, with the date.</p>
          <div className="card">
            {notices.map((n) => (
            <div className="row" key={n.id}>
              <div>
                <span className={'tag ' + (n.tag === 'Fees' ? 'a' : 'g')}>{n.tag}</span>
                <h3 style={{ fontSize: "17px", marginTop: "6px" }}>{n.title}</h3>
                <span className="m">{n.text}</span>
              </div>
              {n.button && (
              <a className="btn o" href="#" onClick={(e) => { e.preventDefault(); setPage(n.goto); }}>{n.button}</a>
              )}
            </div>
            ))}
          </div>
        </div>
        <aside>
          <div className="card">
            <h3 style={{ fontSize: "17px", marginBottom: "12px" }}>How we reach you</h3>
            <label className="row" style={{ minHeight: "44px" }}>
              <span>WhatsApp</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="row" style={{ minHeight: "44px" }}>
              <span>SMS</span>
              <input type="checkbox" />
            </label>
            <p className="m" style={{ margin: "12px 0 0" }}>SMS is used only if WhatsApp cannot be delivered.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
