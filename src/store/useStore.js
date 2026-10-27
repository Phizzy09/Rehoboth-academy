import { create } from "zustand";
import { students, results, reportInfo, notices, payments, initialApplications } from "../data/data";

const loadApplications = () => {
  try {
    const saved = localStorage.getItem("rehoboth_applications");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return initialApplications;
};

const saveApplications = (apps) => {
  try {
    localStorage.setItem("rehoboth_applications", JSON.stringify(apps));
  } catch (e) {
    // ignore
  }
};

const tuitionByClass = {
  "Primary 4": 80000,
  "Primary 5": 80000,
  "JSS 1": 112000,
  "JSS 2": 115000,
  "SS 1": 142000,
  "SS 2": 145000,
};

// One store = one place that remembers everything the website needs.
const useStore = create((set, get) => ({
  // ---- things we remember ----
  page: "home",
  user: null, // { role: "school" or "student", id: "STU-001" }
  loginError: "",
  students: students,
  results: results,
  reportInfo: reportInfo,
  notices: notices,
  payments: payments,
  parents: [],
  applications: loadApplications(),
  released: false, // students see results only after the school releases them

  // ---- things we can do ----
  setPage: (page) => set({ page: page }),

  login: (id, password) =>
    set((state) => {
      const upperId = id.trim().toUpperCase();
      if (password !== "1234") return { loginError: "Wrong ID or password" };
      if (upperId.startsWith("SCH")) {
        return { user: { role: "school", id: upperId }, page: "schoolFees", loginError: "" };
      }
      if (state.students.find((s) => s.id === upperId)) {
        return { user: { role: "student", id: upperId }, page: "studentFees", loginError: "" };
      }
      return { loginError: "Wrong ID or password" };
    }),

  logout: () => set({ user: null, page: "home" }),

  // ---------- FEES ACTIONS ----------

  // The school changes what a student is charged for a specific fee item.
  setFeeItem: (studentId, itemName, amount) =>
    set((state) => ({
      students: state.students.map((s) => {
        if (s.id !== studentId) return s;
        const items = s.items.map((item) =>
          item.name === itemName ? { ...item, charged: amount } : item
        );
        const charged = items.reduce((sum, item) => sum + item.charged, 0);
        return { ...s, items, charged };
      }),
    })),

  // Bulk: set tuition for every student in a class.
  bulkSetTuitionByClass: (className, tuition) =>
    set((state) => ({
      students: state.students.map((s) => {
        if (s.className !== className) return s;
        const items = s.items.map((item) =>
          item.name === "Tuition" ? { ...item, charged: tuition } : item
        );
        const charged = items.reduce((sum, item) => sum + item.charged, 0);
        return { ...s, items, charged };
      }),
    })),

  // Record a payment against a student (school side: cash/POS/transfer).
  recordPayment: (studentId, amount, method) =>
    set((state) => {
      const student = state.students.find((s) => s.id === studentId);
      if (!student) return {};
      const newPaid = student.paid + amount;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return {
        students: state.students.map((s) =>
          s.id === studentId ? { ...s, paid: newPaid } : s
        ),
        payments: [
          ...state.payments,
          { id: Date.now(), studentId, date, method, amount },
        ],
      };
    }),

  // A student pays from their own portal (always full-balance transfer).
  pay: (id, amount) =>
    set((state) => {
      const student = state.students.find((s) => s.id === id);
      const newPaid = student.paid + amount;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return {
        students: state.students.map((s) =>
          s.id === id ? { ...s, paid: newPaid } : s
        ),
        payments: [
          ...state.payments,
          { id: Date.now(), studentId: id, date, method: "Transfer", amount },
        ],
      };
    }),

  // ---------- RESULTS ACTIONS ----------

  // Save scores for one student in one subject.
  setScore: (studentId, subject, ca, exam) =>
    set((state) => {
      const existing = state.results.find(
        (r) => r.studentId === studentId && r.subject === subject
      );
      if (existing) {
        return {
          results: state.results.map((r) =>
            r.studentId === studentId && r.subject === subject
              ? { ...r, ca, exam }
              : r
          ),
        };
      }
      return {
        results: [
          ...state.results,
          { studentId, subject, ca, exam },
        ],
      };
    }),

  // Bulk-import scores parsed from a CSV/Excel (array of {studentId,subject,ca,exam}).
  bulkImportScores: (rows) =>
    set((state) => {
      let results = [...state.results];
      rows.forEach(({ studentId, subject, ca, exam }) => {
        const idx = results.findIndex(
          (r) => r.studentId === studentId && r.subject === subject
        );
        if (idx >= 0) {
          results[idx] = { ...results[idx], ca, exam };
        } else {
          results.push({ studentId, subject, ca, exam });
        }
      });
      return { results };
    }),

  releaseResults: () => set({ released: true }),
  addNotice: (notice) => set((state) => ({ notices: [notice, ...state.notices] })),
  addParent: (parent) => set((state) => ({ parents: [...state.parents, parent] })),

  // ---------- ADMISSIONS ACTIONS ----------
  addApplication: (appData) =>
    set((state) => {
      const year = new Date().getFullYear();
      const count = state.applications.length + 1;
      const id = `APP-${year}-${String(count).padStart(3, "0")}`;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const newApp = {
        id,
        date,
        status: "New",
        score: "Pending Exam",
        notes: "",
        ...appData,
      };
      const updated = [newApp, ...state.applications];
      saveApplications(updated);
      return { applications: updated };
    }),

  updateApplication: (id, updates) =>
    set((state) => {
      const updated = state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      );
      saveApplications(updated);
      return { applications: updated };
    }),

  deleteApplication: (id) =>
    set((state) => {
      const updated = state.applications.filter((app) => app.id !== id);
      saveApplications(updated);
      return { applications: updated };
    }),

  admitStudentFromApplication: (applicationId) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === applicationId);
      if (!app) return {};

      // Determine next student ID
      const existingNums = state.students
        .map((s) => {
          const m = s.id.match(/STU-(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const nextNum = existingNums.length ? Math.max(...existingNums) + 1 : 14;
      const newId = `STU-${String(nextNum).padStart(3, "0")}`;

      const tuition = tuitionByClass[app.className] || 100000;
      const items = [
        { name: "Tuition", charged: tuition },
        { name: "Books & Supplies", charged: 25000 },
        { name: "Development Levy", charged: 10000 },
        { name: "ICT Fee", charged: 8000 },
      ];
      const charged = items.reduce((s, it) => s + it.charged, 0);
      const randomAcct = `992001${1100 + nextNum}`;

      const newStudent = {
        id: newId,
        name: app.childName,
        className: app.className,
        account: randomAcct,
        charged,
        paid: 0,
        items,
        parentName: app.parentName,
        phone: app.phone,
        email: app.email,
        address: app.address,
      };

      const updatedApps = state.applications.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: "Admitted",
              notes: (a.notes ? a.notes + " " : "") + `Enrolled with Student ID: ${newId}.`,
            }
          : a
      );
      saveApplications(updatedApps);

      const welcomeNotice = {
        id: Date.now(),
        tag: "Admissions",
        title: `Welcome ${app.childName} (${newId})`,
        text: `${app.childName} has been admitted to ${app.className}. Student portal credentials have been generated.`,
        button: "View Fees",
        goto: "schoolFees",
        channels: "WhatsApp, SMS",
      };

      return {
        students: [...state.students, newStudent],
        applications: updatedApps,
        notices: [welcomeNotice, ...state.notices],
      };
    }),
}));

export default useStore;
