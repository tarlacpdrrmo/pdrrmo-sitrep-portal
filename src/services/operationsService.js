import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { auth, db, isPortalAdmin } from "./firebaseService.js";

const MAX_UPLOAD_BYTES = 750_000;
const MAX_AGENCIES = 500;
const MAX_PINS = 1_500;
const MAX_INCIDENTS = 3_000;

const isRecord = value => value && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string" ? value.trim() : "";

export function operationIdFromName(name) {
  const slug = text(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  if (!slug) throw new Error("Enter an operation name before publishing.");
  return slug;
}

export function validateDeploymentExport(value) {
  if (!isRecord(value)) throw new Error("The selected file must contain a JSON object.");
  const serialized = JSON.stringify(value);
  if (new Blob([serialized]).size > MAX_UPLOAD_BYTES) {
    throw new Error("This JSON is larger than the supported upload size (750 KB).");
  }
  if (!Array.isArray(value.agencies) || !Array.isArray(value.pins) || !Array.isArray(value.incidents)) {
    throw new Error("Choose the full Deployment Database JSON from the desktop app. An incidents-only report does not include the map assignments.");
  }
  if (!value.pins.length) throw new Error("This export has no deployment pins to show.");
  if (value.agencies.length > MAX_AGENCIES || value.pins.length > MAX_PINS || value.incidents.length > MAX_INCIDENTS) {
    throw new Error("This file exceeds the supported record limits. Keep the original JSON and ask for a format review.");
  }

  const assertUniqueIds = (items, label) => {
    const ids = new Set();
    items.forEach((item, index) => {
      if (!isRecord(item) || !text(item.id)) throw new Error(`${label} record ${index + 1} is missing its ID.`);
      const id = text(item.id);
      if (id.length > 160 || ids.has(id)) throw new Error(`${label} records contain a duplicate or invalid ID.`);
      ids.add(id);
    });
  };
  assertUniqueIds(value.agencies, "Agency");
  assertUniqueIds(value.pins, "Deployment pin");
  assertUniqueIds(value.incidents, "Incident");

  value.pins.forEach((pin, index) => {
    const lat = Number(pin.lat);
    const lng = Number(pin.lng);
    if (pin.lat === null || pin.lat === undefined || String(pin.lat).trim() === ""
      || pin.lng === null || pin.lng === undefined || String(pin.lng).trim() === ""
      || !text(pin.location) || !text(pin.agency) || !Number.isFinite(lat) || !Number.isFinite(lng)
      || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error(`Deployment pin ${index + 1} needs a location, agency, and valid coordinates.`);
    }
  });
  value.incidents.forEach((incident, index) => {
    if (!text(incident.location) || !text(incident.incidentType)) {
      throw new Error(`Incident ${index + 1} needs a location and incident type.`);
    }
  });

  return JSON.parse(serialized);
}

export async function isSpecialOperationsViewer(user = auth.currentUser, adminAlreadyChecked = false) {
  if (!user) return false;
  if (adminAlreadyChecked || await isPortalAdmin(user)) return true;
  const viewer = await getDoc(doc(db, "operationViewers", user.uid));
  return viewer.exists() && viewer.data().enabled === true;
}

export async function listSpecialOperations(admin = false) {
  const base = collection(db, "specialOperations");
  const operationQuery = admin
    ? query(base, limit(100))
    : query(base, where("status", "==", "published"), limit(100));
  const result = await getDocs(operationQuery);
  return result.docs
    .map(snapshot => ({ id: snapshot.id, ...snapshot.data() }))
    .filter(operation => admin || operation.status === "published")
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

export async function loadSpecialOperation(operationId) {
  const operationRef = doc(db, "specialOperations", operationId);
  const operationSnap = await getDoc(operationRef);
  if (!operationSnap.exists()) throw new Error("This operation is not available in Firebase.");
  const operation = { id: operationSnap.id, ...operationSnap.data() };
  if (operation.status !== "published" || !operation.currentVersionId) {
    throw new Error("This operation does not have a published version yet.");
  }
  const versionSnap = await getDoc(doc(db, "specialOperations", operationId, "versions", operation.currentVersionId));
  if (!versionSnap.exists()) throw new Error("The latest published version could not be loaded.");
  return { ...operation, version: { id: versionSnap.id, ...versionSnap.data() } };
}

export async function publishSpecialOperation({ operationId, name, period, sourceFileName, payload }) {
  if (!(await isPortalAdmin())) throw new Error("Sign in with an approved administrator account to publish.");
  const cleanPayload = validateDeploymentExport(payload);
  const cleanName = text(name);
  if (!cleanName || cleanName.length > 120) throw new Error("Operation name must be between 1 and 120 characters.");
  if (text(operationId) !== operationIdFromName(cleanName)) throw new Error("Operation ID does not match its name.");

  const operationRef = doc(db, "specialOperations", operationId);
  const current = await getDoc(operationRef);
  const previousCount = current.exists() ? Number(current.data().versionCount || 0) : 0;
  const versionId = `v-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const version = {
    name: cleanName,
    period: text(period).slice(0, 120),
    sourceFileName: text(sourceFileName).slice(0, 180),
    exportedAt: text(cleanPayload.exportedAt).slice(0, 60),
    uploadedAt: now,
    uploadedBy: auth.currentUser?.email || "Portal administrator",
    agencyCount: cleanPayload.agencies.length,
    pinCount: cleanPayload.pins.length,
    incidentCount: cleanPayload.incidents.length,
    payload: cleanPayload
  };

  await setDoc(doc(db, "specialOperations", operationId, "versions", versionId), version);
  await setDoc(operationRef, {
    name: cleanName,
    period: version.period,
    status: "published",
    currentVersionId: versionId,
    versionCount: previousCount + 1,
    agencyCount: version.agencyCount,
    pinCount: version.pinCount,
    incidentCount: version.incidentCount,
    updatedAt: now
  });
  return { operationId, versionId, versionCount: previousCount + 1 };
}
