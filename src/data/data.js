// Sample data. Later, this will come from a real database.
const fees = (tuition) => [
  { name: "Tuition", charged: tuition },
  { name: "Books & Supplies", charged: 25000 },
  { name: "Development Levy", charged: 10000 },
  { name: "ICT Fee", charged: 8000 },
];

export const SUBJECTS = {
  "Primary 4": [
    "Mathematics", "English Language", "Basic Science", "Social Studies",
    "Civic Education", "Agricultural Science", "Christian Religious Studies",
    "Physical & Health Education", "Basic Technology",
  ],
  "Primary 5": [
    "Mathematics", "English Language", "Basic Science", "Social Studies",
    "Civic Education", "Agricultural Science", "Christian Religious Studies",
    "Physical & Health Education", "Basic Technology",
  ],
  "JSS 1": [
    "Mathematics", "English Language", "Basic Science", "Social Studies",
    "Civic Education", "Agricultural Science", "Christian Religious Studies",
    "Physical & Health Education", "Basic Technology", "French",
  ],
  "JSS 2": [
    "Mathematics", "English Language", "Basic Science", "Social Studies",
    "Civic Education", "Agricultural Science", "Christian Religious Studies",
    "Physical & Health Education", "Basic Technology", "French",
  ],
  "SS 1": [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Economics", "Government", "Christian Religious Studies",
    "Agricultural Science", "Geography",
  ],
  "SS 2": [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
    "Economics", "Government", "Christian Religious Studies",
    "Agricultural Science", "Geography",
  ],
};

export const teachers = [
  { id: "TCH-001", name: "Mrs. Ngozi Adeleke", subject: "Mathematics", className: "JSS 1", email: "n.adeleke@rehoboth.edu.ng" },
  { id: "TCH-002", name: "Mr. Babatunde Alabi", subject: "English Language", className: "Primary 4", email: "b.alabi@rehoboth.edu.ng" },
  { id: "TCH-003", name: "Dr. Emmanuel Okafor", subject: "Physics & Science", className: "SS 1", email: "e.okafor@rehoboth.edu.ng" },
  { id: "TCH-004", name: "Mrs. Folashade Bello", subject: "Social Studies & Civic Ed", className: "JSS 2", email: "f.bello@rehoboth.edu.ng" },
];

export const students = [
  // Primary 4
  { id: "STU-001", name: "Ifeoma Okon",   email: "ifeoma.okon@gmail.com",   className: "Primary 4", account: "9920011102", charged: 123000, paid: 60000,
    items: [{ name: "Tuition", charged: 80000 }, { name: "Books & Supplies", charged: 18000 }, { name: "Development Levy", charged: 10000 }, { name: "ICT Fee", charged: 15000 }] },
  { id: "STU-006", name: "Ngozi Adaeze",  email: "ngozi.adaeze@gmail.com",  className: "Primary 4", account: "9920011110", charged: 123000, paid: 123000, items: fees(80000) },
  { id: "STU-007", name: "Emeka Nwosu",   email: "emeka.nwosu@gmail.com",   className: "Primary 4", account: "9920011111", charged: 123000, paid: 0,      items: fees(80000) },

  // JSS 1
  { id: "STU-002", name: "Amaka Eze",     email: "amaka.eze@gmail.com",     className: "JSS 1",     account: "9920011104", charged: 155000, paid: 0,      items: fees(112000) },
  { id: "STU-004", name: "Tunde Bello",   email: "tunde.bello@gmail.com",   className: "JSS 1",     account: "9920011103", charged: 155000, paid: 155000, items: fees(112000) },
  { id: "STU-005", name: "Chinedu Obi",   email: "chinedu.obi@gmail.com",   className: "JSS 1",     account: "9920011109", charged: 155000, paid: 0,      items: fees(112000) },
  { id: "STU-008", name: "Fatima Aliyu",  email: "fatima.aliyu@gmail.com",  className: "JSS 1",     account: "9920011112", charged: 155000, paid: 80000,  items: fees(112000) },

  // JSS 2
  { id: "STU-009", name: "Kelvin Eze",    email: "kelvin.eze@gmail.com",    className: "JSS 2",     account: "9920011113", charged: 158000, paid: 158000, items: fees(115000) },
  { id: "STU-010", name: "Blessing Uche", email: "blessing.uche@gmail.com", className: "JSS 2",     account: "9920011114", charged: 158000, paid: 50000,  items: fees(115000) },

  // SS 1
  { id: "STU-011", name: "Chisom Okeke",  email: "chisom.okeke@gmail.com",  className: "SS 1",      account: "9920011115", charged: 185000, paid: 185000, items: fees(142000) },
  { id: "STU-012", name: "Uche Nnamdi",   email: "uche.nnamdi@gmail.com",   className: "SS 1",      account: "9920011116", charged: 185000, paid: 90000,  items: fees(142000) },

  // SS 2
  { id: "STU-003", name: "David Musa",    email: "david.musa@gmail.com",    className: "SS 2",      account: "9920011106", charged: 188000, paid: 50000,
    items: [{ name: "Tuition", charged: 145000 }, { name: "Books & Supplies", charged: 25000 }, { name: "Development Levy", charged: 10000 }, { name: "ICT Fee", charged: 8000 }] },
  { id: "STU-013", name: "Ada Igwe",      email: "ada.igwe@gmail.com",      className: "SS 2",      account: "9920011117", charged: 188000, paid: 0,      items: fees(145000) },
];

export const results = [
  // Primary 4 - STU-001 Ifeoma Okon
  { studentId: "STU-001", subject: "Mathematics",               ca: 28, exam: 44 },
  { studentId: "STU-001", subject: "English Language",          ca: 22, exam: 38 },
  { studentId: "STU-001", subject: "Basic Science",             ca: 24, exam: 36 },
  { studentId: "STU-001", subject: "Social Studies",            ca: 26, exam: 40 },
  { studentId: "STU-001", subject: "Civic Education",           ca: 20, exam: 32 },
  { studentId: "STU-001", subject: "Agricultural Science",      ca: 25, exam: 38 },
  { studentId: "STU-001", subject: "Christian Religious Studies", ca: 27, exam: 42 },
  { studentId: "STU-001", subject: "Physical & Health Education", ca: 30, exam: 45 },
  { studentId: "STU-001", subject: "Basic Technology",          ca: 18, exam: 30 },

  // Primary 4 - STU-006 Ngozi Adaeze (high performer)
  { studentId: "STU-006", subject: "Mathematics",               ca: 38, exam: 58 },
  { studentId: "STU-006", subject: "English Language",          ca: 36, exam: 55 },
  { studentId: "STU-006", subject: "Basic Science",             ca: 37, exam: 57 },
  { studentId: "STU-006", subject: "Social Studies",            ca: 35, exam: 53 },
  { studentId: "STU-006", subject: "Civic Education",           ca: 33, exam: 50 },
  { studentId: "STU-006", subject: "Agricultural Science",      ca: 36, exam: 54 },
  { studentId: "STU-006", subject: "Christian Religious Studies", ca: 39, exam: 59 },
  { studentId: "STU-006", subject: "Physical & Health Education", ca: 34, exam: 52 },
  { studentId: "STU-006", subject: "Basic Technology",          ca: 35, exam: 53 },
  // STU-007 Emeka Nwosu — no scores yet

  // JSS 1 - STU-002 Amaka Eze (high)
  { studentId: "STU-002", subject: "Mathematics",               ca: 36, exam: 56 },
  { studentId: "STU-002", subject: "English Language",          ca: 34, exam: 52 },
  { studentId: "STU-002", subject: "Basic Science",             ca: 35, exam: 54 },
  { studentId: "STU-002", subject: "Social Studies",            ca: 33, exam: 50 },
  { studentId: "STU-002", subject: "Civic Education",           ca: 32, exam: 48 },
  { studentId: "STU-002", subject: "Agricultural Science",      ca: 34, exam: 51 },
  { studentId: "STU-002", subject: "Christian Religious Studies", ca: 37, exam: 57 },
  { studentId: "STU-002", subject: "Physical & Health Education", ca: 35, exam: 54 },
  { studentId: "STU-002", subject: "Basic Technology",          ca: 33, exam: 50 },
  { studentId: "STU-002", subject: "French",                    ca: 30, exam: 46 },

  // JSS 1 - STU-004 Tunde Bello (mid)
  { studentId: "STU-004", subject: "Mathematics",               ca: 28, exam: 44 },
  { studentId: "STU-004", subject: "English Language",          ca: 26, exam: 40 },
  { studentId: "STU-004", subject: "Basic Science",             ca: 27, exam: 42 },
  { studentId: "STU-004", subject: "Social Studies",            ca: 24, exam: 38 },
  { studentId: "STU-004", subject: "Civic Education",           ca: 22, exam: 34 },
  { studentId: "STU-004", subject: "Agricultural Science",      ca: 25, exam: 39 },
  { studentId: "STU-004", subject: "Christian Religious Studies", ca: 29, exam: 45 },
  { studentId: "STU-004", subject: "Physical & Health Education", ca: 30, exam: 46 },
  { studentId: "STU-004", subject: "Basic Technology",          ca: 20, exam: 32 },
  { studentId: "STU-004", subject: "French",                    ca: 18, exam: 28 },

  // JSS 1 - STU-005 Chinedu Obi (low)
  { studentId: "STU-005", subject: "Mathematics",               ca: 14, exam: 22 },
  { studentId: "STU-005", subject: "English Language",          ca: 12, exam: 20 },
  { studentId: "STU-005", subject: "Basic Science",             ca: 15, exam: 24 },
  { studentId: "STU-005", subject: "Social Studies",            ca: 13, exam: 21 },
  { studentId: "STU-005", subject: "Civic Education",           ca: 11, exam: 18 },
  { studentId: "STU-005", subject: "Agricultural Science",      ca: 14, exam: 22 },
  { studentId: "STU-005", subject: "Christian Religious Studies", ca: 16, exam: 25 },
  { studentId: "STU-005", subject: "Physical & Health Education", ca: 18, exam: 28 },
  { studentId: "STU-005", subject: "Basic Technology",          ca: 10, exam: 16 },
  { studentId: "STU-005", subject: "French",                    ca: 10, exam: 15 },

  // JSS 1 - STU-008 Fatima Aliyu (mid)
  { studentId: "STU-008", subject: "Mathematics",               ca: 25, exam: 38 },
  { studentId: "STU-008", subject: "English Language",          ca: 28, exam: 43 },
  { studentId: "STU-008", subject: "Basic Science",             ca: 26, exam: 40 },
  { studentId: "STU-008", subject: "Social Studies",            ca: 27, exam: 41 },
  { studentId: "STU-008", subject: "Civic Education",           ca: 23, exam: 35 },
  { studentId: "STU-008", subject: "Agricultural Science",      ca: 24, exam: 37 },
  { studentId: "STU-008", subject: "Christian Religious Studies", ca: 29, exam: 44 },
  { studentId: "STU-008", subject: "Physical & Health Education", ca: 32, exam: 49 },
  { studentId: "STU-008", subject: "Basic Technology",          ca: 21, exam: 33 },
  { studentId: "STU-008", subject: "French",                    ca: 19, exam: 30 },

  // JSS 2 - STU-009 Kelvin Eze (high)
  { studentId: "STU-009", subject: "Mathematics",               ca: 37, exam: 57 },
  { studentId: "STU-009", subject: "English Language",          ca: 35, exam: 53 },
  { studentId: "STU-009", subject: "Basic Science",             ca: 36, exam: 55 },
  { studentId: "STU-009", subject: "Social Studies",            ca: 33, exam: 51 },
  { studentId: "STU-009", subject: "Civic Education",           ca: 31, exam: 48 },
  { studentId: "STU-009", subject: "Agricultural Science",      ca: 34, exam: 52 },
  { studentId: "STU-009", subject: "Christian Religious Studies", ca: 38, exam: 58 },
  { studentId: "STU-009", subject: "Physical & Health Education", ca: 36, exam: 55 },
  { studentId: "STU-009", subject: "Basic Technology",          ca: 34, exam: 52 },
  { studentId: "STU-009", subject: "French",                    ca: 29, exam: 44 },

  // JSS 2 - STU-010 Blessing Uche (mid)
  { studentId: "STU-010", subject: "Mathematics",               ca: 24, exam: 37 },
  { studentId: "STU-010", subject: "English Language",          ca: 26, exam: 40 },
  { studentId: "STU-010", subject: "Basic Science",             ca: 25, exam: 38 },
  { studentId: "STU-010", subject: "Social Studies",            ca: 23, exam: 36 },
  { studentId: "STU-010", subject: "Civic Education",           ca: 21, exam: 33 },
  { studentId: "STU-010", subject: "Agricultural Science",      ca: 24, exam: 37 },
  { studentId: "STU-010", subject: "Christian Religious Studies", ca: 27, exam: 41 },
  { studentId: "STU-010", subject: "Physical & Health Education", ca: 29, exam: 44 },
  { studentId: "STU-010", subject: "Basic Technology",          ca: 20, exam: 31 },
  { studentId: "STU-010", subject: "French",                    ca: 18, exam: 28 },

  // SS 1 - STU-011 Chisom Okeke (high)
  { studentId: "STU-011", subject: "Mathematics",               ca: 38, exam: 57 },
  { studentId: "STU-011", subject: "English Language",          ca: 35, exam: 53 },
  { studentId: "STU-011", subject: "Physics",                   ca: 36, exam: 55 },
  { studentId: "STU-011", subject: "Chemistry",                 ca: 34, exam: 52 },
  { studentId: "STU-011", subject: "Biology",                   ca: 37, exam: 56 },
  { studentId: "STU-011", subject: "Economics",                 ca: 33, exam: 50 },
  { studentId: "STU-011", subject: "Government",                ca: 31, exam: 47 },
  { studentId: "STU-011", subject: "Christian Religious Studies", ca: 39, exam: 59 },
  { studentId: "STU-011", subject: "Agricultural Science",      ca: 34, exam: 52 },
  { studentId: "STU-011", subject: "Geography",                 ca: 32, exam: 49 },

  // SS 1 - STU-012 Uche Nnamdi (mid)
  { studentId: "STU-012", subject: "Mathematics",               ca: 26, exam: 40 },
  { studentId: "STU-012", subject: "English Language",          ca: 28, exam: 43 },
  { studentId: "STU-012", subject: "Physics",                   ca: 24, exam: 37 },
  { studentId: "STU-012", subject: "Chemistry",                 ca: 22, exam: 34 },
  { studentId: "STU-012", subject: "Biology",                   ca: 27, exam: 41 },
  { studentId: "STU-012", subject: "Economics",                 ca: 29, exam: 44 },
  { studentId: "STU-012", subject: "Government",                ca: 25, exam: 38 },
  { studentId: "STU-012", subject: "Christian Religious Studies", ca: 30, exam: 46 },
  { studentId: "STU-012", subject: "Agricultural Science",      ca: 23, exam: 36 },
  { studentId: "STU-012", subject: "Geography",                 ca: 21, exam: 32 },

  // SS 2 - STU-003 David Musa (mid)
  { studentId: "STU-003", subject: "Mathematics",               ca: 25, exam: 39 },
  { studentId: "STU-003", subject: "English Language",          ca: 27, exam: 42 },
  { studentId: "STU-003", subject: "Physics",                   ca: 23, exam: 36 },
  { studentId: "STU-003", subject: "Chemistry",                 ca: 21, exam: 33 },
  { studentId: "STU-003", subject: "Biology",                   ca: 26, exam: 40 },
  { studentId: "STU-003", subject: "Economics",                 ca: 28, exam: 43 },
  { studentId: "STU-003", subject: "Government",                ca: 24, exam: 37 },
  { studentId: "STU-003", subject: "Christian Religious Studies", ca: 29, exam: 44 },
  { studentId: "STU-003", subject: "Agricultural Science",      ca: 22, exam: 34 },
  { studentId: "STU-003", subject: "Geography",                 ca: 20, exam: 31 },
  // STU-013 Ada Igwe — no scores yet
];

export const reportInfo = {};

export const payments = [
  { id: 1, studentId: "STU-001", date: "14 Sep", method: "Transfer",     amount: 60000 },
  { id: 2, studentId: "STU-003", date: "9 Oct",  method: "Transfer",     amount: 50000 },
  { id: 3, studentId: "STU-004", date: "20 Sep", method: "Payment link", amount: 155000 },
  { id: 4, studentId: "STU-006", date: "2 Sep",  method: "Cash",         amount: 123000 },
  { id: 5, studentId: "STU-008", date: "5 Oct",  method: "POS",          amount: 80000 },
  { id: 6, studentId: "STU-009", date: "1 Sep",  method: "Transfer",     amount: 158000 },
  { id: 7, studentId: "STU-011", date: "3 Sep",  method: "Transfer",     amount: 185000 },
  { id: 8, studentId: "STU-012", date: "10 Oct", method: "Cash",         amount: 90000 },
];

export const notices = [
  { id: 1, tag: "Fees",       title: "Second instalment due 30 Oct",          text: "Outstanding termly fees should be paid before 30 October.", button: "Pay now", goto: "studentFees",    channels: "WhatsApp, SMS" },
  { id: 2, tag: "Results",    title: "First term results are ready",           text: "View or download the report card for each child.",        button: "View",     goto: "studentResults", channels: "WhatsApp" },
  { id: 3, tag: "Term dates", title: "Second term resumes Monday 11 Jan 2027", text: "School fees for the new term will appear here before resumption.", button: null, goto: null, channels: "WhatsApp" },
];

export const initialApplications = [
  {
    id: "APP-2026-001",
    date: "22 Oct 2026",
    childName: "Somtochukwu Daniel Adeleke",
    dob: "2014-06-15",
    gender: "Male",
    className: "JSS 1",
    prevSchool: "Grace Children School, Gbagada, Lagos",
    lastClassPassed: "Primary 6",
    parentName: "Dr. & Mrs. Babatunde Adeleke",
    relationship: "Father",
    phone: "08034567890",
    email: "babatunde.adeleke@gmail.com",
    address: "14 Admiralty Way, Lekki Phase 1, Lagos",
    stateOfOrigin: "Ogun State",
    medicalInfo: "Mild asthma (inhaler kept in school bag). No food allergies.",
    emergencyContact: "Mrs. Folashade Adeleke (08023334455)",
    status: "Under Review",
    score: "Pending Exam",
    notes: "Entrance assessment scheduled for Friday 31st Oct. Parents inquired about school bus route to Lekki Phase 1."
  },
  {
    id: "APP-2026-002",
    date: "24 Oct 2026",
    childName: "Zainab Amina Mohammed",
    dob: "2016-03-21",
    gender: "Female",
    className: "Primary 4",
    prevSchool: "Corona School, Victoria Island, Lagos",
    lastClassPassed: "Primary 3",
    parentName: "Alhaji Ibrahim Mohammed",
    relationship: "Father",
    phone: "08182345678",
    email: "i.mohammed@investcorp.ng",
    address: "8 Bourdillon Road, Ikoyi, Lagos",
    stateOfOrigin: "Kano State",
    medicalInfo: "Peanut allergy. Carries EpiPen.",
    emergencyContact: "Mrs. Amina Mohammed (08031112233)",
    status: "Assessment Scheduled",
    score: "92%",
    notes: "Completed written assessment with high marks (92%). Meeting with Head of Primary on Tuesday 10:00 AM."
  },
  {
    id: "APP-2026-003",
    date: "25 Oct 2026",
    childName: "Kelechi Praise Okafor",
    dob: "2011-11-08",
    gender: "Male",
    className: "SS 1",
    prevSchool: "Kings College, Lagos",
    lastClassPassed: "JSS 3 (BECE 8 Distinctions)",
    parentName: "Engr. Emeka Okafor",
    relationship: "Father",
    phone: "08059876543",
    email: "emeka.okafor@shell.com",
    address: "Block 4, Flat 12, Parkview Estate, Ikoyi",
    stateOfOrigin: "Anambra State",
    medicalInfo: "None. Fit for all sports and activities.",
    emergencyContact: "Chiamaka Okafor (08075556677)",
    status: "Admitted",
    score: "95%",
    notes: "Admitted into SS 1 Science department. Registration documents verified and fee paid."
  }
];

