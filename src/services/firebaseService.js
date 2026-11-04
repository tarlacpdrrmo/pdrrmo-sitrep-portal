import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Firebase's browser config is public by design. Firestore Security Rules,
// not this config, must protect writes and administrative data.
const firebaseConfig = {
  apiKey: "AIzaSyB2FYaa4set7V99zEGxYjICdo2knMw1WgU",
  authDomain: "pdrrmo-sitrep-portal.firebaseapp.com",
  projectId: "pdrrmo-sitrep-portal",
  storageBucket: "pdrrmo-sitrep-portal.firebasestorage.app",
  messagingSenderId: "324002555166",
  appId: "1:324002555166:web:9c417a1c90a848c3ad550f"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const LEGACY_EVENT_ID = "2026-sw-monsoon-luis-maymay";
export const BACKUP_SCHEMA_VERSION = 1;

export const watchAuth = callback => onAuthStateChanged(auth, callback);
export const signInAdmin = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signOutUser = () => signOut(auth);

export async function isPortalAdmin(user = auth.currentUser) {
  if (!user) return false;
  const role = await getDoc(doc(db, "admins", user.uid));
  return role.exists() && role.data().enabled === true;
}

export function validateBackup(value) {
  if (!value || value.schemaVersion !== BACKUP_SCHEMA_VERSION || !Array.isArray(value.events)) {
    throw new Error("This is not a supported SITREP backup file.");
  }
  if (!value.events.length) throw new Error("The backup contains no events.");
  for (const event of value.events) {
    if (!event || typeof event.id !== "string" || !event.id.trim()) {
      throw new Error("Each event must have an ID.");
    }
    if (!event.reports || typeof event.reports !== "object" || Array.isArray(event.reports)) {
      throw new Error(`Event ${event.id} has no valid report archive.`);
    }
    if (!Array.isArray(event.floodEpisodes)) {
      throw new Error(`Event ${event.id} has no valid flood episode list.`);
    }
  }
  return value;
}

export function downloadBackup(backup, filename = "pdrrmo-sitrep-backup.json") {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function listPortalEvents(admin = false) {
  const eventQuery = admin
    ? collection(db, "events")
    : query(collection(db, "events"), where("visibility", "==", "public"));
  const result = await getDocs(eventQuery);
  return result.docs.map(item => ({ id: item.id, ...item.data() }));
}

export async function loadPortalEvent(eventId, admin = false) {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) throw new Error("That event is not in Firebase.");
  const event = { id: eventSnap.id, ...eventSnap.data() };
  const reportsQuery = admin
    ? collection(db, "events", eventId, "reports")
    : query(collection(db, "events", eventId, "reports"), where("published", "==", true));
  const reportDocs = await getDocs(reportsQuery);
  const reports = Object.fromEntries(reportDocs.docs.map(item => [item.id, item.data().report]));
  const stateSnap = await getDoc(doc(db, "events", eventId, "state", "current"));
  const floodEpisodes = stateSnap.exists() ? stateSnap.data().floodEpisodes || [] : [];
  return { ...event, reports, floodEpisodes };
}

export async function importBackupToFirebase(backup) {
  const validated = validateBackup(backup);
  const user = auth.currentUser;
  if (!(await isPortalAdmin(user))) throw new Error("Sign in with an enabled portal administrator account first.");

  for (const event of validated.events) {
    const eventRef = doc(db, "events", event.id);
    await setDoc(eventRef, {
      name: event.name || event.id,
      status: event.status || "active",
      visibility: event.visibility === "public" ? "public" : "private",
      schemaVersion: BACKUP_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      reportCount: Object.keys(event.reports).length,
      draftReportKeys: Array.isArray(event.draftReportKeys) ? event.draftReportKeys.map(String) : []
    }, { merge: true });

    const entries = Object.entries(event.reports);
    for (let offset = 0; offset < entries.length; offset += 450) {
      const batch = writeBatch(db);
      entries.slice(offset, offset + 450).forEach(([key, report]) => {
        const draftKeys = new Set((event.draftReportKeys || []).map(String));
        const published = !draftKeys.has(String(key))
          && (event.status === "closed" || event.status === "active" || event.visibility === "public");
        batch.set(doc(db, "events", event.id, "reports", String(key)), {
          report,
          published,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    }
    await setDoc(doc(db, "events", event.id, "state", "current"), {
      floodEpisodes: event.floodEpisodes,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
  return validated.events.length;
}
