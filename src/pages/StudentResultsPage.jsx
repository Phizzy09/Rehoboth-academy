import useStore from "../store/useStore";
import Header from "../components/Header";
import html2canvas from "html2canvas";
import { grade, gradeClass } from "../utils";

export default function StudentResultsPage() {
  const user = useStore((state) => state.user);
  const results = useStore((state) => state.results);
  const released = useStore((state) => state.released);
  const reportInfo = useStore((state) => state.reportInfo);
  const myResults = results.filter((r) => r.studentId === user.id); // only my results
  const info = reportInfo[user.id] || { position: "-", outOf: 32, teacher: "", head: "" };
  const total = myResults.reduce((sum, r) => sum + r.ca + r.exam, 0);
  const average = myResults.length ? Math.round(total / myResults.length) : 0;

  const printPage = () => window.print(); // choose "Save as PDF"
  const downloadImage = () => {
    html2canvas(document.querySelector(".wrap")).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = "report-card.png";
      link.click();
    });
  };

  if (!released) {
    return (
      <div className="pg p-StudentResults">
        <Header kind="student" active="studentResults" />
        <div className="wrap">
          <div className="card">Your results have not been released yet.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg p-StudentResults">
      <Header kind="student" active="studentResults" />
      <div className="wrap">
        <div>
          <h1 style={{ fontSize: "32px" }}>First Term Results</h1>
          <p className="m" style={{ margin: "6px 0 20px" }}>Released by the school on 12 Dec. Report cards are ready to download.</p>
          <p className="m" style={{ margin: "0 0 16px" }}>
            <b>Private to you.</b>
            {" "}
            Other students’ results are hidden, and you cannot change these.
          </p>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className="n">CA</th>
                  <th className="n">Exam</th>
                  <th className="n">Total</th>
                  <th>Grade</th>
                  <th className="n">Position</th>
                </tr>
              </thead>
              <tbody>
                {myResults.map((r) => (
                <tr key={r.subject}>
                  <td>{r.subject}</td>
                  <td className="n">{r.ca}</td>
                  <td className="n">{r.exam}</td>
                  <td className="n">
                    <b>{r.ca + r.exam}</b>
                  </td>
                  <td>
                    <span className={gradeClass(r.ca + r.exam)}>{grade(r.ca + r.exam)}</span>
                  </td>
                  <td className="n">{r.position}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <aside>
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="m">Class position</div>
            <div style={{ fontFamily: "'Bricolage Grotesque'", fontSize: "40px", fontWeight: "700" }}>
              {info.position}
              {" "}
              <span className="m" style={{ fontSize: "18px" }}>of {info.outOf}</span>
            </div>
            <div className="m" style={{ margin: "6px 0 16px" }}>Average: {average}%</div>
            <a className="btn" href="#" style={{ display: "block", textAlign: "center" }} onClick={printPage}>Download as PDF</a>
            <a className="btn o" href="#" style={{ display: "block", textAlign: "center", marginTop: "10px" }} onClick={downloadImage}>Download as image</a>
          </div>
          <div className="card">
            <h3 style={{ fontSize: "17px", marginBottom: "8px" }}>Teacher’s remark</h3>
            <p className="m" style={{ margin: "0" }}>{info.teacher}</p>
            <h3 style={{ fontSize: "17px", margin: "16px 0 8px" }}>Head teacher’s remark</h3>
            <p className="m" style={{ margin: "0" }}>{info.head}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
