import useStore from "./store/useStore";
import useScrollReveal from "./hooks/useScrollReveal";
import HomePage from "./pages/HomePage";
import AdmissionsPage from "./pages/AdmissionsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import StudentFeesPage from "./pages/StudentFeesPage";
import StudentResultsPage from "./pages/StudentResultsPage";
import StudentNoticesPage from "./pages/StudentNoticesPage";
import SchoolFeesPage from "./pages/SchoolFeesPage";
import SchoolResultsPage from "./pages/SchoolResultsPage";
import BroadcastPage from "./pages/BroadcastPage";
import SchoolAdmissionsPage from "./pages/SchoolAdmissionsPage";

// Each page name points to one page file.
const pages = {
  home: HomePage,
  about: AboutPage,
  admissions: AdmissionsPage,
  contact: ContactPage,
  login: LoginPage,
  studentFees: StudentFeesPage,
  studentResults: StudentResultsPage,
  studentNotices: StudentNoticesPage,
  schoolFees: SchoolFeesPage,
  schoolResults: SchoolResultsPage,
  broadcast: BroadcastPage,
  schoolAdmissions: SchoolAdmissionsPage,
};

const studentPages = ["studentFees", "studentResults", "studentNotices"];
const schoolPages = ["schoolFees", "schoolResults", "broadcast", "schoolAdmissions"];

export default function App() {
  const page = useStore((state) => state.page);
  const user = useStore((state) => state.user);
  useScrollReveal(page);

  let Page = pages[page];
  // Not signed in with the right ID? Send them to the login page.
  if (studentPages.includes(page) && (!user || user.role !== "student")) Page = LoginPage;
  if (schoolPages.includes(page)) {
    if (!user) {
      Page = LoginPage;
    } else if (user.role === "teacher") {
      // Teachers can access results and broadcast; redirect fees & admissions to results
      if (page === "schoolFees" || page === "schoolAdmissions") Page = SchoolResultsPage;
    } else if (user.role !== "school") {
      Page = LoginPage;
    }
  }

  // key={page} makes the page animate in again every time it changes
  return (
    <div key={page} className="page-enter">
      <Page />
    </div>
  );
}
