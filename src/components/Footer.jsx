import useStore from "../store/useStore";

export default function Footer() {
  const setPage = useStore((state) => state.setPage);
  const go = (e, page) => {
    e.preventDefault();
    setPage(page);
  };

  return (
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
          <a href="#" onClick={(e) => go(e, "login")}>Parent and student login</a>
          <br />
          <a href="#" onClick={(e) => go(e, "admissions")}>Apply for admission</a>
        </div>
      </div>
    </footer>
  );
}
