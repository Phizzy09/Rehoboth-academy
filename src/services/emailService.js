import emailjs from "@emailjs/browser";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const EMAIL_CONFIG_KEY = "rehoboth_emailjs_config";

export const getEmailConfig = () => {
  try {
    const saved = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }

  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "",
  };
};

export const saveEmailConfig = (config) => {
  try {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    // ignore
  }
};

/**
 * Sends real email to the student's email address.
 * 1. Attempts via EmailJS if configured.
 * 2. Also records in Firebase Firestore `mail` collection (compatible with Firebase Trigger Email extension).
 */
export const sendAdmissionEmail = async (dispatch) => {
  const config = getEmailConfig();
  let emailjsResult = { attempted: false, success: false, error: null };

  // 1. If EmailJS is configured, send real email directly from client
  if (config.serviceId && config.templateId && config.publicKey) {
    emailjsResult.attempted = true;
    try {
      const templateParams = {
        to_email: dispatch.email,
        recipient_email: dispatch.email,
        student_name: dispatch.studentName,
        student_id: dispatch.studentId,
        password: dispatch.defaultPassword,
        class_name: dispatch.className,
        subject: dispatch.subject,
        message: dispatch.messageBody,
        portal_url: typeof window !== "undefined" ? window.location.origin : "https://rehoboth-academy.edu.ng",
      };

      const res = await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams,
        config.publicKey
      );

      console.log("✓ Real email sent via EmailJS:", res.status, res.text);
      emailjsResult.success = true;
    } catch (err) {
      console.warn("EmailJS sending error:", err);
      emailjsResult.error = err?.text || err?.message || "EmailJS failed to deliver";
    }
  }

  // 2. Also write to Firebase Firestore `mail` collection for Firebase Trigger Email extension
  try {
    await addDoc(collection(db, "mail"), {
      to: [dispatch.email],
      message: {
        subject: dispatch.subject,
        text: dispatch.messageBody,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d8e1dc; border-radius: 8px;">
            <h2 style="color: #0f5c47; margin-top: 0;">Rehoboth Academy · Official Admission</h2>
            <p>Dear <b>${dispatch.studentName}</b> &amp; Parents/Guardians,</p>
            <p>Congratulations! You have been officially admitted into <b>${dispatch.className}</b> at Rehoboth Academy.</p>
            
            <div style="background: #f0f7f4; border-left: 4px solid #0f5c47; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px; color: #0f5c47;">Your Student Portal Credentials</h3>
              <p style="margin: 5px 0;"><b>Student Login ID:</b> <span style="font-size: 18px; color: #0f5c47; font-weight: bold;">${dispatch.studentId}</span></p>
              <p style="margin: 5px 0;"><b>Default Password / PIN:</b> <span style="font-size: 18px; color: #0f5c47; font-weight: bold;">${dispatch.defaultPassword}</span></p>
              <p style="margin: 5px 0;"><b>Portal Link:</b> <a href="${typeof window !== "undefined" ? window.location.origin : ""}" style="color: #0f5c47; font-weight: bold;">Access Portal</a></p>
            </div>

            <p>Please log in to your portal account to access class assessments, term exam results, and fee payment receipts.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Rehoboth Academy Admissions Office, Ilorin, Kwara State, Nigeria.</p>
          </div>
        `,
      },
      createdAt: new Date().toISOString(),
    });
    console.log("✓ Recorded to Firebase 'mail' collection");
  } catch (fbErr) {
    console.warn("Firebase mail collection write error:", fbErr.message);
  }

  return emailjsResult;
};

/**
 * Builds direct Gmail web compose URL as instant 1-click fallback
 */
export const getGmailComposeUrl = (dispatch) => {
  const to = encodeURIComponent(dispatch.email);
  const su = encodeURIComponent(dispatch.subject || `Admission Confirmed - Rehoboth Academy (${dispatch.studentId})`);
  const body = encodeURIComponent(dispatch.messageBody || "");
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
};
