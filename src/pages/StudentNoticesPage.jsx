import useStore from "../store/useStore";
import Header from "../components/Header";

export default function StudentNoticesPage() {
  const notices = useStore((state) => state.notices) || [];
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students) || [];
  const setPage = useStore((state) => state.setPage);

  // Current logged in student
  const me = students.find((s) => s.id === user?.id) || {
    name: user?.name || "Student",
    id: user?.id,
    className: "Class",
    charged: 0,
    paid: 0,
  };

  const owing = Math.max(0, (me.charged || 0) - (me.paid || 0));

  // Collect other students' identifiers for strict privacy protection
  const otherStudents = students.filter((s) => s.id !== user?.id);
  const otherStudentIds = otherStudents.map((s) => s.id?.toLowerCase().trim()).filter(Boolean);
  const otherStudentNames = otherStudents.map((s) => s.name?.toLowerCase().trim()).filter(Boolean);

  // Filter notices so that a student NEVER sees another student's private information
  const filteredNotices = notices
    .filter((n) => {
      const titleLower = (n.title || "").toLowerCase();
      const textLower = (n.text || "").toLowerCase();
      const fullContent = `${titleLower} ${textLower}`;

      // 1. If notice is targeted specifically to a student ID, only show if it matches current student
      if (n.studentId && n.studentId !== user?.id) {
        return false;
      }

      // 2. If notice is internal administrative notice for school staff/admins, hide from students
      if (n.targetRole === "school" && n.studentId !== user?.id) {
        return false;
      }

      // 3. If notice is targeted to a specific class, only show if it matches student's class
      if (n.targetClass && n.targetClass !== "All" && me.className && n.targetClass !== me.className) {
        return false;
      }

      // 4. If notice is targeted to students who owe fees, only show if student currently owes fees
      if (n.target === "owing" && owing <= 0) {
        return false;
      }

      // 5. Privacy guard: check if notice mentions any other student's ID (e.g. STU-002, STU-014)
      const mentionsOtherStudentId = otherStudentIds.some((otherId) => fullContent.includes(otherId));
      if (mentionsOtherStudentId) {
        return false;
      }

      // 6. Privacy guard: check if notice mentions another student's full name
      const mentionsOtherStudentName = otherStudentNames.some(
        (otherName) => otherName.length > 3 && fullContent.includes(otherName)
      );
      if (mentionsOtherStudentName) {
        return false;
      }

      return true;
    })
    .map((n) => {
      // 7. Personalize fee notices so that they strictly reflect THIS student's own balance
      if (n.tag === "Fees") {
        if (owing > 0) {
          return {
            ...n,
            title: n.title || "Term Fees Notice",
            text: `Your outstanding fees balance is ₦${owing.toLocaleString()}. Please ensure payment is completed before the due date.`,
            button: "Pay fees now",
            goto: "studentFees",
          };
        } else {
          return {
            ...n,
            title: "Term Fees Cleared",
            text: "Your school fees have been paid in full for this term. Thank you!",
            button: "View Ledger",
            goto: "studentFees",
          };
        }
      }

      // 8. Personalize welcome/admissions notice if addressed to current student
      if (n.studentId === user?.id && n.tag === "Admissions") {
        return {
          ...n,
          title: `Welcome to ${me.className}, ${me.name}!`,
          text: `Welcome to the Rehoboth Academy family. Your official student portal credentials (${user?.id}) are active.`,
          button: "View Fees",
          goto: "studentFees",
        };
      }

      return n;
    });

  return (
    <div className="pg p-StudentNotices">
      <Header kind="student" active="studentNotices" />
      <div className="wrap">
        <div>
          <div style={{ marginBottom: "16px" }}>
            <h1 style={{ fontSize: "32px", margin: 0, color: "#17231f" }}>Student Notices</h1>
            <p className="m" style={{ margin: "6px 0 0", fontSize: "15.5px" }}>
              Official school announcements and personal updates for <b>{me.name}</b> ({user?.id} · {me.className}).
            </p>
          </div>

          <div className="card" style={{ padding: filteredNotices.length === 0 ? "36px 20px" : "16px 20px" }}>
            {filteredNotices.length === 0 ? (
              <div style={{ textAlign: "center", color: "#4a5d55" }}>
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                <h3 style={{ fontSize: "18px", margin: "0 0 6px", color: "#17231f" }}>No new notices for you</h3>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  When the school posts general announcements or updates for {me.className}, they will appear here.
                </p>
              </div>
            ) : (
              filteredNotices.map((n) => (
                <div
                  className="row"
                  key={n.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "16px 0",
                    borderBottom: "1px solid #e6ece8",
                  }}
                >
                  <div style={{ flex: "1 1 280px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span className={"tag " + (n.tag === "Fees" ? "a" : "g")}>{n.tag}</span>
                      {n.channels && (
                        <span style={{ fontSize: "12px", color: "#6b7e76" }}>
                          via {n.channels}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: "17.5px", margin: "0 0 4px", color: "#17231f" }}>{n.title}</h3>
                    <div className="m" style={{ fontSize: "14.5px", lineHeight: "1.4" }}>
                      {n.text}
                    </div>
                  </div>
                  {n.button && (
                    <a
                      className="btn o"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (n.goto) setPage(n.goto);
                      }}
                      style={{ flexShrink: 0 }}
                    >
                      {n.button}
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <aside>
          <div className="card">
            <h3 style={{ fontSize: "17px", marginBottom: "12px", color: "#0f5c47" }}>Notification Channels</h3>
            <p className="m" style={{ fontSize: "13px", margin: "0 0 14px" }}>
              How the school delivers your personal notices:
            </p>
            <label className="row" style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>WhatsApp Messages</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="row" style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>SMS Alerts</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label className="row" style={{ minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Email Summaries</span>
              <input type="checkbox" defaultChecked />
            </label>
            <p className="m" style={{ margin: "14px 0 0", fontSize: "12.5px", color: "#6b7e76" }}>
              🔒 Privacy Protected: You only receive messages intended for you and your class.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
