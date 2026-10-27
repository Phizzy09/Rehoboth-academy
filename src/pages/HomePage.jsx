import useStore from "../store/useStore";
import Header from "../components/Header";

const features = [
  { title: "Pay school fees", text: "Each child has their own account number. Pay by transfer in instalments and the balance updates straight away. No proof of payment needed." },
  { title: "See and download results", text: "Report cards appear the day the school releases them. Download as a PDF or an image. Only you can see your child’s results." },
  { title: "Hear from the school", text: "Resumption dates, fee reminders and result notices arrive by WhatsApp, SMS or email, and stay on your Notices page." },
];


export default function HomePage() {
  const setPage = useStore((state) => state.setPage);
  const go = (e, page) => {
    e.preventDefault();
    setPage(page);
  };
  return (
    <div className="pg p-Home">
      <Header kind="site" active="home" />
      <section className="in hero-section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", alignItems: "center" }}>
        <div>
          <h1 className="responsive-hero-h1" style={{ fontSize: "52px", lineHeight: "1.1" }}>A private school in Ilorin, with nothing left to chase.</h1>
          <p className="m" style={{ fontSize: "18px", margin: "16px 0 24px" }}>
            Rehoboth Academy teaches nursery, primary and secondary students. Parents pay fees, read results and get school news in one place.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a className="btn" href="#" onClick={(e) => go(e, 'admissions')}>Apply for admission</a>
            <a className="btn o" href="#" onClick={(e) => go(e, 'login')}>Parent and student login</a>
          </div>
        </div>
        <div className="ph">Rehoboth Academy, Ilorin</div>
      </section>
      <section style={{ background: "#fff", borderTop: "1px solid #d8e1dc", borderBottom: "1px solid #d8e1dc" }}>
        <div className="in">
          <h2 style={{ fontSize: "34px" }}>What parents can do online</h2>
          <p className="m" style={{ margin: "8px 0 28px" }}>
            Three things used to mean queues, paper and long waits. Now they take a minute.
          </p>
          <div className="g3">
            {features.map((f) => (
            <div className="card" key={f.title}>
              <h3 style={{ fontSize: "22px" }}>{f.title}</h3>
              <p className="m">{f.text}</p>
            </div>
            ))}
          </div>
        </div>
      </section>
      <section className="in">
        <h2 style={{ fontSize: "34px", marginBottom: "24px" }}>Our school</h2>
        <div className="g3">
          <div className="card">
            <h3>Primary</h3>
            <p className="m">Nursery 1 to Primary 6, for children aged 3 to 11.</p>
          </div>
          <div className="card">
            <h3>Secondary</h3>
            <p className="m">JSS 1 to SS 3, with science, arts and commercial classes.</p>
          </div>
          <div className="card">
            <h3>Term dates</h3>
            <p className="m">
              First term: 14 Sep to 11 Dec 2026
              <br />
              Second term: 11 Jan to 2 Apr 2027
              <br />
              Third term: 26 Apr to 23 Jul 2027
            </p>
          </div>
        </div>
      </section>
      <section style={{ background: "#e1f0ea" }}>
        <div className="in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "30px" }}>Ready to join Rehoboth Academy?</h2>
            <p className="m" style={{ margin: "6px 0 0" }}>Applications for the 2027/2028 session are open.</p>
          </div>
          <a className="btn" href="#" onClick={(e) => go(e, 'admissions')}>Apply for admission</a>
        </div>
      </section>
      <footer className="ft">
        <div className="g3">
          <div>
            <b style={{ fontSize: "20px" }}>Rehoboth Academy</b>
            <div>14 School Road, Ilorin, Kwara State</div>
          </div>
          <div>
            Phone: 09160854127, 07026039107
            <br />
            Email: info@rehobothacademy.ng
            <br />
            Office hours: Monday to Friday, 8:00 am to 4:00 pm
          </div>
          <div>
            <a href="#" onClick={(e) => go(e, 'login')}>Parent and student login</a>
            <br />
            <a href="#" onClick={(e) => go(e, 'admissions')}>Apply for admission</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
