import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { initialApplications, students as defaultStudents, results as defaultResults, notices as defaultNotices, payments as defaultPayments } from "../data/data";

// Collections
const APPS_COL = "applications";
const STUDENTS_COL = "students";
const RESULTS_COL = "results";
const PAYMENTS_COL = "payments";
const NOTICES_COL = "notices";
const SETTINGS_COL = "settings";
const DISPATCHES_COL = "emailDispatches";

// ─── 1. Applications ──────────────────────────────────────────
export const fbSaveApplication = async (app) => {
  try {
    const ref = doc(db, APPS_COL, app.id);
    await setDoc(ref, { ...app, updatedAt: new Date().toISOString() }, { merge: true });
    console.log("✓ Saved application to Firebase:", app.id);
  } catch (err) {
    console.warn("Firebase save application error:", err.code || err.message);
    throw err;
  }
};

export const fbUpdateApplication = async (id, updates) => {
  try {
    const ref = doc(db, APPS_COL, id);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    console.log("✓ Updated application in Firebase:", id);
  } catch (err) {
    console.warn("Firebase update application error:", err.code || err.message);
  }
};

export const fbDeleteApplication = async (id) => {
  try {
    const ref = doc(db, APPS_COL, id);
    await deleteDoc(ref);
    console.log("✓ Deleted application from Firebase:", id);
  } catch (err) {
    console.warn("Firebase delete application error:", err.code || err.message);
  }
};

// ─── 2. Students ──────────────────────────────────────────────
export const fbSaveStudent = async (student) => {
  try {
    const ref = doc(db, STUDENTS_COL, student.id);
    await setDoc(ref, { ...student, updatedAt: new Date().toISOString() }, { merge: true });
    console.log("✓ Saved student to Firebase:", student.id);
  } catch (err) {
    console.warn("Firebase save student error:", err.code || err.message);
  }
};

export const fbUpdateStudent = async (studentId, updates) => {
  try {
    const ref = doc(db, STUDENTS_COL, studentId);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("Firebase update student error:", err.code || err.message);
  }
};

// ─── 3. Results / Scores ──────────────────────────────────────
export const fbSaveScore = async (studentId, subject, ca, exam) => {
  try {
    const docId = `${studentId}_${subject.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const ref = doc(db, RESULTS_COL, docId);
    await setDoc(ref, { studentId, subject, ca, exam, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firebase save score error:", err.code || err.message);
  }
};

export const fbBulkSaveScores = async (scoreRows) => {
  try {
    const promises = scoreRows.map(({ studentId, subject, ca, exam }) => {
      const docId = `${studentId}_${subject.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const ref = doc(db, RESULTS_COL, docId);
      return setDoc(ref, { studentId, subject, ca, exam, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await Promise.all(promises);
    console.log(`✓ Bulk saved ${scoreRows.length} scores to Firebase`);
  } catch (err) {
    console.warn("Firebase bulk save scores error:", err.code || err.message);
  }
};

export const fbSaveReleaseStatus = async (released) => {
  try {
    const ref = doc(db, SETTINGS_COL, "resultsRelease");
    await setDoc(ref, { released, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn("Firebase save release status error:", err.code || err.message);
  }
};

// ─── 4. Payments ──────────────────────────────────────────────
export const fbSavePayment = async (payment) => {
  try {
    const ref = doc(db, PAYMENTS_COL, String(payment.id));
    await setDoc(ref, { ...payment, createdAt: new Date().toISOString() });
    console.log("✓ Saved payment record to Firebase:", payment.id);
  } catch (err) {
    console.warn("Firebase save payment error:", err.code || err.message);
  }
};

// ─── 5. Notices / Broadcasts ──────────────────────────────────
export const fbSaveNotice = async (notice) => {
  try {
    const ref = doc(db, NOTICES_COL, String(notice.id));
    await setDoc(ref, { ...notice, createdAt: new Date().toISOString() });
    console.log("✓ Saved broadcast notice to Firebase:", notice.id);
  } catch (err) {
    console.warn("Firebase save notice error:", err.code || err.message);
  }
};

// ─── 6. Email Dispatches ──────────────────────────────────────
export const fbSaveEmailDispatch = async (dispatch) => {
  try {
    const ref = doc(db, DISPATCHES_COL, String(dispatch.id));
    await setDoc(ref, { ...dispatch, createdAt: new Date().toISOString() });
    console.log("✓ Saved email dispatch record to Firebase:", dispatch.id);
  } catch (err) {
    console.warn("Firebase save email dispatch error:", err.code || err.message);
  }
};

// ─── 7. Direct Seed All Demo Data to Firebase ─────────────────
export const fbSeedAllData = async () => {
  console.log("Starting full database seed to Firebase Firestore...");
  // 1. Applications
  for (const app of initialApplications) {
    await setDoc(doc(db, APPS_COL, app.id), { ...app, updatedAt: new Date().toISOString() });
  }
  // 2. Students
  for (const st of defaultStudents) {
    await setDoc(doc(db, STUDENTS_COL, st.id), { ...st, updatedAt: new Date().toISOString() });
  }
  // 3. Results
  for (const r of defaultResults) {
    const docId = `${r.studentId}_${r.subject.replace(/[^a-zA-Z0-9]/g, "_")}`;
    await setDoc(doc(db, RESULTS_COL, docId), { ...r, updatedAt: new Date().toISOString() });
  }
  // 4. Notices
  for (const n of defaultNotices) {
    await setDoc(doc(db, NOTICES_COL, String(n.id)), { ...n, createdAt: new Date().toISOString() });
  }
  // 5. Payments
  for (const p of defaultPayments) {
    await setDoc(doc(db, PAYMENTS_COL, String(p.id)), { ...p, createdAt: new Date().toISOString() });
  }
  // 6. Settings
  await setDoc(doc(db, SETTINGS_COL, "resultsRelease"), { released: false, updatedAt: new Date().toISOString() });
  console.log("✓ Full database seed to Firebase Firestore complete!");
  return true;
};

// ─── 8. Seed Initial Data & Live Sync ─────────────────────────
export const initFirebaseSync = async (set, get) => {
  set({ firebaseStatus: "connecting" });

  try {
    // Test write/read permissions
    const testDocRef = doc(db, SETTINGS_COL, "healthCheck");
    await setDoc(testDocRef, { lastPing: new Date().toISOString(), app: "Rehoboth Academy" }, { merge: true })
      .then(() => {
        set({ firebaseStatus: "connected", firebaseError: "" });
        console.log("🔥 Firebase Firestore connection VERIFIED!");
      })
      .catch((err) => {
        if (err.code === "permission-denied" || err.message?.includes("permissions")) {
          set({
            firebaseStatus: "permission-denied",
            firebaseError: "Cloud Firestore Security Rules are blocking access (Missing or insufficient permissions).",
          });
          console.error("🔥 Firebase Firestore Permission Denied! Update your Firestore rules in Firebase Console.");
        } else {
          set({
            firebaseStatus: "error",
            firebaseError: err.message,
          });
        }
      });

    // A. Sync Applications
    const appsSnap = await getDocs(collection(db, APPS_COL)).catch((err) => {
      if (err.code === "permission-denied") {
        set({ firebaseStatus: "permission-denied", firebaseError: "Permission Denied: Update Firestore Security Rules in Firebase Console." });
      }
      return null;
    });

    if (appsSnap && !appsSnap.empty) {
      const fbApps = appsSnap.docs.map((d) => d.data());
      set({ applications: fbApps });
      console.log(`✓ Loaded ${fbApps.length} applications from Firebase`);
    } else if (appsSnap && appsSnap.empty) {
      console.log("Seeding initial applications to Firebase...");
      initialApplications.forEach((app) => fbSaveApplication(app));
    }

    // Live listener for Applications
    onSnapshot(collection(db, APPS_COL), (snapshot) => {
      if (!snapshot.empty) {
        const liveApps = snapshot.docs.map((d) => d.data());
        liveApps.sort((a, b) => (b.id > a.id ? 1 : -1));
        set({ applications: liveApps, firebaseStatus: "connected" });
      }
    }, (err) => {
      if (err.code === "permission-denied") {
        set({ firebaseStatus: "permission-denied" });
      }
    });

    // B. Sync Students
    const studentsSnap = await getDocs(collection(db, STUDENTS_COL)).catch(() => null);
    if (studentsSnap && !studentsSnap.empty) {
      const fbStudents = studentsSnap.docs.map((d) => d.data());
      set({ students: fbStudents });
    } else if (studentsSnap && studentsSnap.empty) {
      defaultStudents.forEach((st) => fbSaveStudent(st));
    }

    onSnapshot(collection(db, STUDENTS_COL), (snapshot) => {
      if (!snapshot.empty) {
        const liveStudents = snapshot.docs.map((d) => d.data());
        set({ students: liveStudents, firebaseStatus: "connected" });
      }
    }, (err) => {
      if (err.code === "permission-denied") {
        set({ firebaseStatus: "permission-denied" });
      }
    });

    // C. Sync Results
    const resultsSnap = await getDocs(collection(db, RESULTS_COL)).catch(() => null);
    if (resultsSnap && !resultsSnap.empty) {
      const fbResults = resultsSnap.docs.map((d) => d.data());
      set({ results: fbResults });
    } else if (resultsSnap && resultsSnap.empty) {
      defaultResults.forEach((r) => fbSaveScore(r.studentId, r.subject, r.ca, r.exam));
    }

    onSnapshot(collection(db, RESULTS_COL), (snapshot) => {
      if (!snapshot.empty) {
        const liveResults = snapshot.docs.map((d) => d.data());
        set({ results: liveResults, firebaseStatus: "connected" });
      }
    }, (err) => {
      if (err.code === "permission-denied") {
        set({ firebaseStatus: "permission-denied" });
      }
    });

    // D. Release status
    onSnapshot(doc(db, SETTINGS_COL, "resultsRelease"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.released === "boolean") {
          set({ released: data.released });
        }
      }
    }, () => {});

    // E. Payments
    onSnapshot(collection(db, PAYMENTS_COL), (snapshot) => {
      if (!snapshot.empty) {
        const livePayments = snapshot.docs.map((d) => d.data());
        set({ payments: livePayments });
      }
    }, () => {});

    // F. Notices
    onSnapshot(collection(db, NOTICES_COL), (snapshot) => {
      if (!snapshot.empty) {
        const liveNotices = snapshot.docs.map((d) => d.data());
        set({ notices: liveNotices });
      }
    }, () => {});
  } catch (error) {
    console.warn("Firebase sync initialization:", error.message);
  }
};
