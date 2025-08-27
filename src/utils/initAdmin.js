import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export const initializeAdmin = async (email) => {
  try {
    const adminEmail = email.toLowerCase();
    await setDoc(doc(db, "adminUsers", adminEmail), {
      createdAt: serverTimestamp(),
      addedBy: "system",
      isSuper: true
    });
    console.log(`Admin user ${adminEmail} initialized successfully`);
    return true;
  } catch (error) {
    console.error("Error initializing admin:", error);
    return false;
  }
};

// List of default admin emails
export const DEFAULT_ADMIN_EMAILS = [
  "admin@shammarinanas.com",
  "wasivoy749@aperiol.com"
];

export const initializeDefaultAdmins = async () => {
  try {
    const promises = DEFAULT_ADMIN_EMAILS.map(email => initializeAdmin(email));
    await Promise.all(promises);
    console.log("All default admins initialized");
  } catch (error) {
    console.error("Error initializing default admins:", error);
  }
};
