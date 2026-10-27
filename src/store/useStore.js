import { create } from "zustand";
import { students, results, reportInfo, notices, payments, initialApplications, teachers } from "../data/data";
import {
  fbSaveApplication,
  fbUpdateApplication,
  fbDeleteApplication,
  fbSaveStudent,
  fbSaveScore,
  fbBulkSaveScores,
  fbSavePayment,
  fbSaveNotice,
  fbSaveEmailDispatch,
  fbSaveReleaseStatus,
  initFirebaseSync,
} from "../services/firebaseService";

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

// Auto-generate next Student ID
export const getNextStudentId = (studentsList) => {
  const existingNums = studentsList
    .map((s) => {
      const m = s.id?.match(/STU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const nextNum = existingNums.length ? Math.max(...existingNums) + 1 : 14;
  return `STU-${String(nextNum).padStart(3, "0")}`;
};

// One store = one place that remembers everything the website needs.
const useStore = create((set, get) => ({
  // ---- things we remember ----
  page: "home",
  user: null, // { role: "school" | "teacher" | "student", id: "SCH-001" }
  loginError: "",
  students: students,
  teachers: teachers,
  results: results,
  reportInfo: reportInfo,
  notices: notices,
  payments: payments,
  parents: [],
  applications: loadApplications(),
  emailDispatches: [],
  latestDispatch: null, // Used for displaying instant credential dispatch alert
  released: false, // students see results only after the school releases them

  // ---- things we can do ----
  setPage: (page) => set({ page: page }),
  clearLatestDispatch: () => set({ latestDispatch: null }),

  login: (id, password) =>
    set((state) => {
      const upperId = id.trim().toUpperCase();
      if (password !== "1234") return { loginError: "Wrong ID or password (default PIN is 1234)" };

      // 1. School Admin (SCH-...)
      if (upperId.startsWith("SCH")) {
        return { user: { role: "school", id: upperId, name: "School Administrator" }, page: "schoolFees", loginError: "" };
      }

      // 2. Teachers (TCH-...)
      const matchedTeacher = state.teachers.find((t) => t.id === upperId);
      if (matchedTeacher || upperId.startsWith("TCH")) {
        const teacherObj = matchedTeacher || { id: upperId, name: "Teacher", subject: "All Subjects", className: "All Classes" };
        return {
          user: { role: "teacher", id: upperId, name: teacherObj.name, subject: teacherObj.subject, className: teacherObj.className },
          page: "schoolResults",
          loginError: "",
        };
      }

      // 3. Students (STU-...)
      const student = state.students.find((s) => s.id === upperId);
      if (student) {
        return { user: { role: "student", id: upperId, name: student.name }, page: "studentFees", loginError: "" };
      }

      return { loginError: "Wrong ID or password. Use SCH-001, TCH-001, or STU-001" };
    }),

  logout: () => set({ user: null, page: "home" }),

  // ---------- FEES ACTIONS ----------

  // The school changes what a student is charged for a specific fee item.
  setFeeItem: (studentId, itemName, amount) =>
    set((state) => {
      let updatedStudent = null;
      const updatedStudents = state.students.map((s) => {
        if (s.id !== studentId) return s;
        const items = s.items.map((item) =>
          item.name === itemName ? { ...item, charged: amount } : item
        );
        const charged = items.reduce((sum, item) => sum + item.charged, 0);
        updatedStudent = { ...s, items, charged };
        return updatedStudent;
      });
      if (updatedStudent) fbSaveStudent(updatedStudent);
      return { students: updatedStudents };
    }),

  // Bulk: set tuition for every student in a class.
  bulkSetTuitionByClass: (className, tuition) =>
    set((state) => {
      const updatedStudents = state.students.map((s) => {
        if (s.className !== className) return s;
        const items = s.items.map((item) =>
          item.name === "Tuition" ? { ...item, charged: tuition } : item
        );
        const charged = items.reduce((sum, item) => sum + item.charged, 0);
        const updated = { ...s, items, charged };
        fbSaveStudent(updated);
        return updated;
      });
      return { students: updatedStudents };
    }),

  // Record a payment against a student (school side: cash/POS/transfer).
  recordPayment: (studentId, amount, method) =>
    set((state) => {
      const student = state.students.find((s) => s.id === studentId);
      if (!student) return {};
      const newPaid = student.paid + amount;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const updatedStudent = { ...student, paid: newPaid };
      const paymentObj = { id: Date.now(), studentId, date, method, amount };

      fbSaveStudent(updatedStudent);
      fbSavePayment(paymentObj);

      return {
        students: state.students.map((s) =>
          s.id === studentId ? updatedStudent : s
        ),
        payments: [...state.payments, paymentObj],
      };
    }),

  // A student pays from their own portal (partial or full).
  pay: (id, amount) =>
    set((state) => {
      const student = state.students.find((s) => s.id === id);
      if (!student) return {};
      const remainingOwing = Math.max(0, student.charged - student.paid);
      if (remainingOwing <= 0) return {}; // Already paid in full
      const paymentAmount = Math.min(amount, remainingOwing);
      if (paymentAmount <= 0) return {};
      const newPaid = student.paid + paymentAmount;
      const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const updatedStudent = { ...student, paid: newPaid };
      const paymentObj = { id: Date.now(), studentId: id, date, method: "Transfer", amount: paymentAmount };

      fbSaveStudent(updatedStudent);
      fbSavePayment(paymentObj);

      return {
        students: state.students.map((s) =>
          s.id === id ? updatedStudent : s
        ),
        payments: [...state.payments, paymentObj],
      };
    }),

  // ---------- RESULTS ACTIONS ----------

  // Save scores for one student in one subject.
  setScore: (studentId, subject, ca, exam) =>
    set((state) => {
      fbSaveScore(studentId, subject, ca, exam);
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

  // Bulk-import scores (array of {studentId,subject,ca,exam}).
  bulkImportScores: (rows) =>
    set((state) => {
      fbBulkSaveScores(rows);
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

  releaseResults: () =>
    set((state) => {
      fbSaveReleaseStatus(true);
      const notice = {
        id: Date.now(),
        tag: "Results",
        title: "First term results are ready",
        text: "Official report cards and class positions have been released by the school.",
        button: "View",
        goto: "studentResults",
        channels: "WhatsApp, SMS",
      };
      fbSaveNotice(notice);
      return {
        released: true,
        notices: [notice, ...state.notices.filter((n) => n.title !== "First term results are ready")],
      };
    }),

  unreleaseResults: () => {
    fbSaveReleaseStatus(false);
    return set({ released: false });
  },

  addStudent: (data) =>
    set((state) => {
      const newId = getNextStudentId(state.students);
      const tuition = tuitionByClass[data.className] || 100000;
      const items = data.items || [
        { name: "Tuition", charged: tuition },
        { name: "Books & Supplies", charged: 25000 },
        { name: "Development Levy", charged: 10000 },
        { name: "ICT Fee", charged: 8000 },
      ];
      const charged = data.charged !== undefined ? data.charged : items.reduce((sum, it) => sum + it.charged, 0);
      const studentNum = parseInt(newId.replace(/\D/g, ""), 10) || 50;
      const account = data.account || `992001${1100 + studentNum}`;
      const email = data.email || (data.name ? `${data.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@gmail.com` : `${newId.toLowerCase()}@rehoboth.edu.ng`);

      const newStudent = {
        id: newId,
        name: data.name,
        className: data.className,
        email,
        phone: data.phone || "08030000000",
        account,
        charged,
        paid: data.paid || 0,
        items,
        ...data,
      };

      const emailDispatch = {
        id: Date.now(),
        timestamp: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        studentName: newStudent.name,
        studentId: newId,
        email: newStudent.email,
        defaultPassword: "1234",
        className: newStudent.className,
        subject: `Welcome to Rehoboth Academy! Your Student ID & Portal Login Credentials (${newId})`,
        status: "Sent & Delivered",
      };

      // Save student and dispatch log to Firebase Cloud Firestore
      fbSaveStudent(newStudent);
      fbSaveEmailDispatch(emailDispatch);

      return {
        students: [...state.students, newStudent],
        emailDispatches: [emailDispatch, ...(state.emailDispatches || [])],
        latestDispatch: emailDispatch,
      };
    }),

  addNotice: (notice) => {
    fbSaveNotice(notice);
    return set((state) => ({ notices: [notice, ...state.notices] }));
  },

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

      // Save to Firebase Cloud Firestore
      fbSaveApplication(newApp);

      const updated = [newApp, ...state.applications];
      saveApplications(updated);
      return { applications: updated };
    }),

  updateApplication: (id, updates) =>
    set((state) => {
      fbUpdateApplication(id, updates);
      const updated = state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      );
      saveApplications(updated);
      return { applications: updated };
    }),

  deleteApplication: (id) =>
    set((state) => {
      fbDeleteApplication(id);
      const updated = state.applications.filter((app) => app.id !== id);
      saveApplications(updated);
      return { applications: updated };
    }),

  admitStudentFromApplication: (applicationId) =>
    set((state) => {
      const app = state.applications.find((a) => a.id === applicationId);
      if (!app) return {};

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

      const emailRecipient = app.email || (app.childName ? `${app.childName.toLowerCase().replace(/[^a-z0-9]/g, "")}@gmail.com` : `${newId.toLowerCase()}@rehoboth.edu.ng`);
      const emailDispatch = {
        id: Date.now(),
        timestamp: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        studentName: app.childName,
        studentId: newId,
        email: emailRecipient,
        defaultPassword: "1234",
        className: app.className,
        subject: `Welcome to Rehoboth Academy! Your Student ID & Portal Login Credentials (${newId})`,
        status: "Sent & Delivered",
      };

      // Sync all 4 actions to Firebase
      fbSaveStudent(newStudent);
      fbUpdateApplication(applicationId, { status: "Admitted", notes: `Enrolled with Student ID: ${newId}.` });
      fbSaveNotice(welcomeNotice);
      fbSaveEmailDispatch(emailDispatch);

      return {
        students: [...state.students, newStudent],
        applications: updatedApps,
        notices: [welcomeNotice, ...state.notices],
        emailDispatches: [emailDispatch, ...(state.emailDispatches || [])],
        latestDispatch: emailDispatch,
      };
    }),
}));

// Initialize Firebase Cloud sync on app startup
if (typeof window !== "undefined") {
  setTimeout(() => {
    initFirebaseSync(useStore.setState, useStore.getState);
  }, 300);
}

export default useStore;
