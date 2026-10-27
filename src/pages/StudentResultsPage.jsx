import useStore from "../store/useStore";
import Header from "../components/Header";
import html2canvas from "html2canvas";
import { grade, gradeClass, ordinal } from "../utils";
import { SUBJECTS } from "../data/data";

export default function StudentResultsPage() {
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const results = useStore((state) => state.results);
  const released = useStore((state) => state.released);
  const reportInfo = useStore((state) => state.reportInfo);

  // Current student details
  const currentStudent = students.find((s) => s.id === user?.id) || { name: "Student", className: "Primary 4" };
  const myClass = currentStudent.className;
  const classStudents = students.filter((s) => s.className === myClass);
  const subjects = SUBJECTS[myClass] || [];

  // Calculate scores and ranks for all students in this class
  const classRanks = classStudents.map((s) => {
    const sResults = results.filter((r) => r.studentId === s.id);
    const scored = sResults.filter((r) => r.ca !== "" && r.exam !== "" && r.ca !== null && r.exam !== null);
    const sTotal = scored.reduce((sum, r) => sum + Number(r.ca) + Number(r.exam), 0);
    const sAvg = scored.length ? Math.round(sTotal / scored.length) : null;
    return {
      id: s.id,
      name: s.name,
      total: sTotal,
      average: sAvg,
      scoredCount: scored.length,
      ready: scored.length === subjects.length,
    };
  });

  // Sort descending by average score
  const sortedRanks = [...classRanks].sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
  const myRankIdx = sortedRanks.findIndex((s) => s.id === user?.id);
  const myPosition = myRankIdx >= 0 && sortedRanks[myRankIdx].average !== null ? ordinal(myRankIdx + 1) : "—";
  const totalInClass = classStudents.length;

  // Class average
  const validAvgs = classRanks.filter((s) => s.average !== null);
  const classAverage = validAvgs.length ? Math.round(validAvgs.reduce((sum, s) => sum + s.average, 0) / validAvgs.length) : null;

  // Student's own results
  const myResults = results.filter((r) => r.studentId === user?.id);
  const myScored = myResults.filter((r) => r.ca !== "" && r.exam !== "" && r.ca !== null && r.exam !== null);
  const total = myScored.reduce((sum, r) => sum + Number(r.ca) + Number(r.exam), 0);
  const average = myScored.length ? Math.round(total / myScored.length) : 0;

  // Compute rank in each subject among peers in the class
  const myResultsWithPositions = myResults.map((r) => {
    const rTotal = Number(r.ca) + Number(r.exam);
    const subjectPeers = classStudents
      .map((s) => {
        const sr = results.find((res) => res.studentId === s.id && res.subject === r.subject);
        if (sr && sr.ca !== "" && sr.exam !== "" && sr.ca !== null && sr.exam !== null) {
          return { studentId: s.id, total: Number(sr.ca) + Number(sr.exam) };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b.total - a.total);

    const peerIdx = subjectPeers.findIndex((p) => p.studentId === user?.id);
    const subjectPosition = peerIdx >= 0 ? ordinal(peerIdx + 1) : "—";

    return {
      ...r,
      total: rTotal,
      position: subjectPosition,
    };
  });

  // Custom or auto remarks
  const customInfo = reportInfo[user?.id];
  const teacherRemark = customInfo?.teacher || (
    myRankIdx === 0
      ? "An outstanding and exceptionally diligent pupil. Maintained top academic excellence across all subjects."
      : myRankIdx <= 2
      ? "A very bright and focused student. Consistent effort and commendable work throughout the term."
      : average >= 60
      ? "Good performance with steady progress across core subjects. Capable of higher honors with extra study."
      : "Fair academic performance. Encouraged to devote more time to homework revision and class participation."
  );

  const headRemark = customInfo?.head || (
    myRankIdx === 0
      ? "Distinction standard! Ranked 1st in the class. A true role model for peers."
      : myRankIdx <= 2
      ? "Excellent result! With continued focus and determination, 1st position is well within reach next term."
      : average >= 60
      ? "Commendable academic standing. Keep aiming higher and maintain disciplined study habits."
      : "Promotion requires steady improvement. Parents are urged to monitor home study and revision."
  );

  const printPage = () => window.print();
  const downloadImage = () => {
    const el = document.querySelector(".wrap");
    if (!el) return;
    html2canvas(el).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = `report-card-${user?.id || "student"}.png`;
      link.click();
    });
  };

  if (!released) {
    return (
      <div className="pg p-StudentResults">
        <Header kind="student" active="studentResults" />
        <div className="wrap" style={{ display: "block", maxWidth: "800px", margin: "40px auto" }}>
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>🔒</div>
            <h2 style={{ fontSize: "26px", color: "#0f5c47", marginBottom: "10px" }}>Results Not Released Yet</h2>
            <p className="m" style={{ fontSize: "16px", maxWidth: "520px", margin: "0 auto 20px" }}>
              First term examination results and class positions have not yet been published by the school administration.
            </p>
            <p className="m" style={{ fontSize: "14px" }}>
              Once released by your teachers, your full score report, grades, class position, and printable report card will appear here automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg p-StudentResults">
      <Header kind="student" active="studentResults" />
      <div className="wrap">
        <div>
          <h1 style={{ fontSize: "32px", color: "#0f5c47" }}>First Term Report Card</h1>
          <p className="m" style={{ margin: "6px 0 16px" }}>
            {currentStudent.name} · {myClass} · Student ID: <b>{user?.id}</b>
          </p>
          <div
            style={{
              background: "#eef8f4",
              border: "1px solid #a3d9c7",
              borderRadius: "8px",
              padding: "10px 16px",
              marginBottom: "18px",
              fontSize: "14px",
              color: "#0b4a39",
            }}
          >
            ✓ <b>Results Released by School:</b> Official class positions and grades are published.
          </div>

          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className="n">CA (/40)</th>
                  <th className="n">Exam (/60)</th>
                  <th className="n">Total (/100)</th>
                  <th>Grade</th>
                  <th className="n">Subject Rank</th>
                </tr>
              </thead>
              <tbody>
                {myResultsWithPositions.map((r) => (
                  <tr key={r.subject}>
                    <td style={{ fontWeight: 600 }}>{r.subject}</td>
                    <td className="n">{r.ca !== "" ? r.ca : "—"}</td>
                    <td className="n">{r.exam !== "" ? r.exam : "—"}</td>
                    <td className="n">
                      <b>{r.ca !== "" && r.exam !== "" ? r.total : "—"}</b>
                    </td>
                    <td>
                      {r.ca !== "" && r.exam !== "" ? (
                        <span className={gradeClass(r.total)}>{grade(r.total)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="n">
                      <b style={{ color: "#0f5c47" }}>{r.position}</b>
                    </td>
                  </tr>
                ))}
                {myResultsWithPositions.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                      No subject scores uploaded yet for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="m" style={{ fontWeight: 600, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Official Class Position
            </div>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontSize: "44px", fontWeight: "700", color: "#0f5c47", margin: "4px 0" }}>
              {myPosition}
              {" "}
              <span className="m" style={{ fontSize: "18px", fontWeight: "400", color: "#4a5d55" }}>
                of {totalInClass} pupils
              </span>
            </div>
            <div className="m" style={{ margin: "6px 0 16px", fontSize: "14.5px" }}>
              Your Average: <b style={{ color: "#17231f" }}>{average}%</b>
              {classAverage !== null && (
                <span> · Class Avg: <b>{classAverage}%</b></span>
              )}
            </div>

            <button
              type="button"
              className="btn"
              style={{ display: "block", width: "100%", textAlign: "center", marginBottom: "10px" }}
              onClick={printPage}
            >
              🖨️ Download as PDF
            </button>
            <button
              type="button"
              className="btn o"
              style={{ display: "block", width: "100%", textAlign: "center" }}
              onClick={downloadImage}
            >
              🖼️ Download as Image
            </button>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "6px", color: "#0f5c47" }}>Class Teacher’s Remark</h3>
            <p className="m" style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: "1.4" }}>
              "{teacherRemark}"
            </p>
            <h3 style={{ fontSize: "16px", marginBottom: "6px", color: "#0f5c47" }}>Head Teacher’s Remark</h3>
            <p className="m" style={{ margin: "0", fontSize: "14px", lineHeight: "1.4" }}>
              "{headRemark}"
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
