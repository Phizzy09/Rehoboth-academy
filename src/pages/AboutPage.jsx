import useStore from "../store/useStore";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Same styles as the Home page, so it looks like the rest of the website.
const cards = [
  { title: "Nursery and primary", text: "Nursery 1 to Primary 6, for children aged 3 to 11." },
  { title: "Secondary", text: "JSS 1 to SS 3, with science, arts and commercial classes." },
  { title: "Term dates", text: "First term: 14 Sep to 11 Dec 2026. Second term: 11 Jan to 2 Apr 2027. Third term: 26 Apr to 23 Jul 2027." },
];

export default function AboutPage() {
  const setPage = useStore((state) => state.setPage);

  return (
    <div className="pg p-Home">
      <Header kind="site" active="about" />
      <section className="in">
        <h1 className="responsive-h1" style={{ fontSize: "44px" }}>About Rehoboth Academy</h1>
        <p className="m" style={{ fontSize: "19px", maxWidth: "640px", margin: "14px 0 32px" }}>
          Rehoboth Academy is a private school in Ilorin, Kwara State. We teach nursery, primary and secondary students.
          Parents pay fees, read results and get school news in one place, so nothing is left to chase.
        </p>
        <div className="g3">
          {cards.map((c) => (
            <div className="card" key={c.title}>
              <h3>{c.title}</h3>
              <p className="m">{c.text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "32px" }}>
          <a className="btn" href="#" onClick={(e) => { e.preventDefault(); setPage("admissions"); }}>Apply for admission</a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
