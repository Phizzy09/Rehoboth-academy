import useStore from "../store/useStore";

const siteLinks = [
  { name: "Home", page: "home" },
  { name: "About", page: "about" },
  { name: "Admissions", page: "admissions" },
  { name: "Contact", page: "contact" },
];
const studentLinks = [
  { name: "Fees", page: "studentFees" },
  { name: "Results", page: "studentResults" },
  { name: "Notices", page: "studentNotices" },
];
const schoolLinks = [
  { name: "Fees ledger", page: "schoolFees" },
  { name: "Results", page: "schoolResults" },
  { name: "Broadcast", page: "broadcast" },
  { name: "Admissions", page: "admissions" },
];
const chipStyle = { padding: "4px 12px", borderRadius: 99, background: "#e1f0ea", color: "#0b4a39", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" };

// kind = "site", "student" or "school". active = the page that is open now.
export default function Header({ kind, active }) {
  const setPage = useStore((state) => state.setPage);
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);

  const go = (e, page) => {
    e.preventDefault();
    if (page) setPage(page);
  };

  if (kind === "site") {
    return (
      <header className="top">
        <span className="brand">Rehoboth Academy</span>
        <nav>
          {siteLinks.map((link) => (
            <a key={link.name} className={active === link.page ? "l on" : "l"} href="#" onClick={(e) => go(e, link.page)}>
              {link.name}
            </a>
          ))}
        </nav>
        <a className="btn o" href="#" onClick={(e) => go(e, "login")}>Parent and student login</a>
      </header>
    );
  }

  const links = kind === "student" ? studentLinks : schoolLinks;
  const me = students.find((s) => user && s.id === user.id);
  const chipText = kind === "student" ? me.name + " · Student · view only" : "School ID · can edit";

  return (
    <header className="top">
      <span className="brand">Rehoboth Academy</span>
      <nav>
        {links.map((link) => (
          <a key={link.page} className={active === link.page ? "on" : ""} href="#" onClick={(e) => go(e, link.page)}>
            {link.name}
          </a>
        ))}
      </nav>
      <span style={chipStyle}>{chipText}</span>
      <a className="btn o" href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Log out</a>
    </header>
  );
}
