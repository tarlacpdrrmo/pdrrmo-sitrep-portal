// src/app.js
import { BASE_LGUS, getFieldOversightBySitrep, BARANGAY_ALIASES } from "./data/sitrepArchive.js";
import { store } from "./services/store.js";
import { initPdfWorker, scanSitrepPdfFile } from "./services/pdfScanner.js";
import { ARG_STATION_META, ARG_DAILY_SERIES, getArgStatsForSitrep, getArg38DayTimeline, parseArgCsvFile } from "./services/argService.js";
import {
  BACKUP_SCHEMA_VERSION, auth, downloadBackup, importBackupToFirebase,
  isPortalAdmin, listPortalEvents, loadPortalEvent,
  signInAdmin, signOutUser, validateBackup, watchAuth
} from "./services/firebaseService.js";
import {
  isSpecialOperationsViewer,
  listSpecialOperations,
  loadSpecialOperation,
  operationIdFromName,
  publishSpecialOperation,
  validateDeploymentExport
} from "./services/operationsService.js";

const TARLAC_POP_2024 = BASE_LGUS.reduce((s, m) => s + (m.pop2024 || 0), 0);

// Register Dynamic Vertical Crosshair & Column Highlight Plugin for Chart.js
const verticalCrosshairPlugin = {
  id: "verticalCrosshair",
  afterDatasetsDraw(chart) {
    const tooltip = chart.tooltip;
    if (!tooltip || !tooltip.getActiveElements || !tooltip.getActiveElements().length) return;

    const activeEl = tooltip.getActiveElements()[0];
    const ctx = chart.ctx;
    const x = activeEl.element.x;
    const topY = chart.scales.y.top;
    const bottomY = chart.scales.y.bottom;
    const isNight = document.documentElement.getAttribute("data-theme") === "night";

    ctx.save();

    // 1. Soft vertical highlight band behind the hovered column
    const bandWidth = chart.config.type === "bar" ? 18 : 24;
    ctx.fillStyle = isNight ? "rgba(120, 174, 203, 0.09)" : "rgba(44, 101, 134, 0.07)";
    ctx.fillRect(x - bandWidth / 2, topY, bandWidth, bottomY - topY);

    // 2. Crisp dashed vertical guide line from top of chart to X-axis
    ctx.beginPath();
    ctx.setLineDash([4, 3]);
    ctx.moveTo(x, topY);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isNight ? "#78AECB" : "#2C6586";
    ctx.stroke();

    // 3. Small anchor dot right on the X-axis baseline
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x, bottomY, 3, 0, Math.PI * 2);
    ctx.fillStyle = isNight ? "#78AECB" : "#2C6586";
    ctx.fill();

    ctx.restore();
  }
};

if (typeof Chart !== "undefined") {
  Chart.register(verticalCrosshairPlugin);
}

let dpChartInstance = null;
let lastTriggerEl = null;
let activeDetailContext = null;
let inlineEditEpId = null;
let isOfflineSimulated = false;
let isEmptyFloodPreview = false;
let activeGovTab = "split";
let specialOperationsMap = null;
let specialOperationsLayer = null;
let specialOperationsCurrent = null;
let specialOperationsPending = null;
let specialOperationsMarkerById = new Map();
let specialOperationsIncidentMarkerById = new Map();
let specialOperationsMapRenderedKey = "";
let specialOperationsVisibleMapPoints = [];
let specialOperationsSelectedMarker = null;

function fmtNum(n) {
  if (n === null || n === undefined || n === "-") return "-";
  return Number(n).toLocaleString("en-US");
}

function fmtPhp(n) {
  if (!n || Number(n) === 0) return "Assessment pending";
  return "₱" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDelta(curr, prev, invertColor = false) {
  const diff = Number(curr || 0) - Number(prev || 0);
  if (diff === 0) {
    return `<span class="shadcn-badge badge-neutral">0 unchanged</span>`;
  }
  const icon = diff > 0 ? `<i class="ri-arrow-up-s-fill"></i>` : `<i class="ri-arrow-down-s-fill"></i>`;
  const sign = diff > 0 ? "+" : "";
  const isFavorable = invertColor ? diff > 0 : diff < 0;
  const badgeClass = isFavorable ? "badge-success" : "badge-warning";
  return `<span class="shadcn-badge ${badgeClass}">${icon}<span>${sign}${diff.toLocaleString("en-US")}</span></span>`;
}

function showStatusToast(text) {
  const el = document.getElementById("statusToast");
  if (!el) return;
  document.getElementById("statusToastMsg").textContent = text;
  el.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function setSpecialOperationsStatus(message, tone = "info") {
  const status = document.getElementById("specialOperationsStatus");
  if (!status) return;
  status.textContent = message;
  status.classList.remove("hidden");
  status.style.backgroundColor = tone === "error" ? "var(--brick-bg)" : tone === "success" ? "var(--green-bg)" : "var(--blue-bg)";
  status.style.color = tone === "error" ? "var(--brick)" : tone === "success" ? "var(--green)" : "var(--channel)";
}

function ensureSpecialOperationsMap() {
  const container = document.getElementById("specialOperationsMap");
  if (!container || typeof window.L === "undefined") return false;
  if (!specialOperationsMap) {
    specialOperationsMap = window.L.map(container, { scrollWheelZoom: false, zoomControl: false, zoomSnap: 0.5, zoomDelta: 0.5 }).setView([15.48, 120.59], 9);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
    }).addTo(specialOperationsMap);
    specialOperationsLayer = typeof window.L.markerClusterGroup === "function"
      ? window.L.markerClusterGroup({
          maxClusterRadius: 46,
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          iconCreateFunction: cluster => window.L.divIcon({
            className: "ops-cluster-icon",
            html: `<span>${cluster.getChildCount()}</span>`,
            iconSize: window.L.point(38, 38)
          })
        }).addTo(specialOperationsMap)
      : window.L.featureGroup().addTo(specialOperationsMap);
    document.getElementById("specialOpsMapFitBtn")?.addEventListener("click", fitSpecialOperationsMap);
    document.getElementById("specialOpsMapHomeBtn")?.addEventListener("click", () => {
      if (specialOperationsMap) specialOperationsMap.setView([15.48, 120.59], 9, { animate: true, duration: .35 });
    });
    document.getElementById("specialOpsMapZoomInBtn")?.addEventListener("click", () => specialOperationsMap?.zoomIn());
    document.getElementById("specialOpsMapZoomOutBtn")?.addEventListener("click", () => specialOperationsMap?.zoomOut());
  }
  window.setTimeout(() => specialOperationsMap?.invalidateSize(), 80);
  return true;
}

function formatOperationDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

function valuePairsHtml(record, fields) {
  return fields.filter(([label, value]) => value !== undefined && value !== null && String(value).trim() !== "")
    .map(([label, value]) => `<div class="grid grid-cols-[112px_1fr] gap-2"><span style="color:var(--muted)">${escapeHtml(label)}</span><span class="font-medium break-words">${escapeHtml(value)}</span></div>`)
    .join("");
}

function formatOperationCoordinates(record) {
  const lat = Number(record?.lat);
  const lng = Number(record?.lng);
  if (record?.lat === null || record?.lat === undefined || String(record.lat).trim() === ""
    || record?.lng === null || record?.lng === undefined || String(record.lng).trim() === ""
    || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return "";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function specialOperationPopupHtml(record, incident = false) {
  const title = incident ? (record.incidentType || "Reported incident") : (record.location || "Deployment location");
  const secondary = incident
    ? [record.municipality, record.date, record.time].filter(Boolean).join(" · ")
    : [record.municipality, record.agency].filter(Boolean).join(" · ");
  return `<div class="ops-popup"><div class="ops-popup-title">${escapeHtml(title)}</div><div class="ops-popup-line">${escapeHtml(secondary)}</div>${incident
    ? `<div class="ops-popup-line">${escapeHtml(record.status || "Incident record")}</div>`
    : `<div class="ops-popup-line">${escapeHtml(record.task || record.category || "Deployment pin")}</div>`}</div>`;
}

function fitSpecialOperationsMap() {
  if (!specialOperationsMap) return;
  const points = specialOperationsVisibleMapPoints;
  if (points.length === 1) specialOperationsMap.setView(points[0], 13, { animate: true, duration: .35 });
  else if (points.length > 1) specialOperationsMap.fitBounds(window.L.latLngBounds(points), { padding: [48, 48], maxZoom: 13, animate: true, duration: .35 });
  else specialOperationsMap.setView([15.48, 120.59], 9, { animate: true, duration: .35 });
}

function specialOperationPinIcon(color, incident = false, selected = false) {
  const size = selected ? 38 : 32;
  const height = selected ? 48 : 42;
  const center = incident
    ? `<circle cx="16" cy="14" r="6" fill="#fff"/><path d="M16 10v5" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="18" r="1.2" fill="${color}"/>`
    : `<circle cx="16" cy="14" r="5" fill="#fff"/>`;
  return window.L.divIcon({
    className: selected ? "ops-map-pin-icon ops-map-pin-icon-selected" : "ops-map-pin-icon",
    html: `<svg class="ops-map-pin-glyph" width="${size}" height="${height}" viewBox="0 0 32 42" role="img" aria-hidden="true"><path d="M16 1C7.8 1 1.5 7.3 1.5 15.2c0 10.1 14.5 25.2 14.5 25.2s14.5-15.1 14.5-25.2C30.5 7.3 24.2 1 16 1Z" fill="${color}" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/>${center}</svg>`,
    iconSize: [size, height],
    iconAnchor: [size / 2, height - 1],
    popupAnchor: [0, -height + 5]
  });
}

function focusSpecialOperationMarker(marker) {
  if (!marker || !specialOperationsMap) return;
  if (specialOperationsSelectedMarker && specialOperationsSelectedMarker !== marker) {
    const previous = specialOperationsSelectedMarker;
    previous.setIcon(specialOperationPinIcon(previous.options.operationColor, previous.options.operationIncident));
    previous.setZIndexOffset(0);
  }
  specialOperationsSelectedMarker = marker;
  marker.setIcon(specialOperationPinIcon(marker.options.operationColor, marker.options.operationIncident, true));
  marker.setZIndexOffset(1000);

  const focusAtStreetLevel = () => {
    specialOperationsMap.stop();
    const target = marker.options.operationLatLng || marker.getLatLng();
    const zoom = Math.max(17, Math.min(18, specialOperationsMap.getZoom()));
    const alreadyFocused = specialOperationsMap.getCenter().distanceTo(target) < 1
      && Math.abs(specialOperationsMap.getZoom() - zoom) < .01;
    if (alreadyFocused) {
      marker.openPopup();
      return;
    }
    specialOperationsMap.once("moveend", () => marker.openPopup());
    specialOperationsMap.flyTo(target, zoom, { animate: true, duration: .7 });
  };
  if (typeof specialOperationsLayer?.zoomToShowLayer === "function") {
    specialOperationsLayer.zoomToShowLayer(marker, focusAtStreetLevel);
  } else {
    focusAtStreetLevel();
  }
}

function renderSpecialOperationsDashboard(operation) {
  specialOperationsCurrent = operation;
  const payload = operation?.version?.payload;
  if (!payload) return;
  document.getElementById("specialOpsPinDetail").classList.add("hidden");
  document.getElementById("specialOpsIncidentDetail").classList.add("hidden");
  const pins = Array.isArray(payload.pins) ? payload.pins : [];
  const incidents = Array.isArray(payload.incidents) ? payload.incidents : [];
  const agencies = Array.isArray(payload.agencies) ? payload.agencies : [];
  const searchInput = document.getElementById("specialOpsSearch");
  const search = String(searchInput?.value || "").trim().toLowerCase();
  const matches = record => !search || JSON.stringify(record).toLowerCase().includes(search);
  const visiblePins = pins.filter(matches);
  const visibleIncidents = incidents.filter(matches);

  document.getElementById("specialOperationsDashboard").classList.remove("hidden");
  document.getElementById("specialOperationsEmpty").classList.add("hidden");
  document.getElementById("specialOpsPinCount").textContent = pins.length.toLocaleString("en-US");
  document.getElementById("specialOpsAgencyCount").textContent = agencies.length.toLocaleString("en-US");
  document.getElementById("specialOpsIncidentCount").textContent = incidents.length.toLocaleString("en-US");
  const paxTotal = pins.reduce((total, pin) => {
    const parsed = Number(String(pin.pax ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0]);
    return total + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
  document.getElementById("specialOpsPaxCount").textContent = paxTotal.toLocaleString("en-US");
  document.getElementById("specialOpsHeading").textContent = operation.name || operation.version.name || "Special event operation";
  const meta = [
    operation.period || operation.version.period,
    `Version ${operation.versionCount || 1}`,
    `Updated ${formatOperationDate(operation.updatedAt)}`,
    operation.version.payload.preparedBy ? `Prepared by ${operation.version.payload.preparedBy}` : "",
    operation.version.sourceFileName ? `Source: ${operation.version.sourceFileName}` : ""
  ].filter(Boolean);
  document.getElementById("specialOpsMeta").textContent = meta.join(" · ");
  document.getElementById("specialOpsPinTableSubhead").textContent = `${visiblePins.length.toLocaleString("en-US")} of ${pins.length.toLocaleString("en-US")} assignments`;
  document.getElementById("specialOpsIncidentTableCount").textContent = `${visibleIncidents.length} shown`;

  const pinsTable = document.getElementById("specialOpsPinsTable");
  pinsTable.innerHTML = visiblePins.length ? visiblePins.map(pin => `
    <tr tabindex="0" role="button" data-ops-pin-id="${escapeHtml(pin.id)}" class="ops-table-row border-b cursor-pointer" style="border-color:var(--border)">
      <td class="py-2.5 px-3"><div class="font-semibold">${escapeHtml(pin.location || "Unspecified location")}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml(pin.municipality || "")}</div></td>
      <td class="py-2.5 px-2"><div>${escapeHtml(pin.agency || "—")}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml(pin.category || "")}</div></td>
      <td class="py-2.5 px-2 text-right font-semibold">${escapeHtml(pin.pax || "—")}</td>
    </tr>`).join("") : `<tr><td colspan="3" class="p-5 text-center" style="color:var(--muted)">${search ? "No deployments match this search." : "No deployment pins in this version."}</td></tr>`;

  const incidentTable = document.getElementById("specialOpsIncidentsTable");
  incidentTable.innerHTML = visibleIncidents.length ? visibleIncidents.map(incident => `
    <tr tabindex="0" role="button" data-ops-incident-id="${escapeHtml(incident.id)}" class="ops-table-row border-b cursor-pointer" style="border-color:var(--border)">
      <td class="py-2.5 px-3"><div class="font-semibold">${escapeHtml(incident.incidentType || "Incident")}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml([incident.date, incident.time].filter(Boolean).join(" · "))}</div></td>
      <td class="py-2.5 px-2"><div>${escapeHtml(incident.location || "—")}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml(incident.municipality || "")}</div></td>
      <td class="py-2.5 px-2 max-w-[280px]"><div class="truncate">${escapeHtml(incident.actionTaken || incident.respondingUnit || "—")}</div></td>
      <td class="py-2.5 px-2">${escapeHtml(incident.status || "—")}</td>
    </tr>`).join("") : `<tr><td colspan="4" class="p-5 text-center" style="color:var(--muted)">${search ? "No incidents match this search." : "No incident records in this version."}</td></tr>`;

  const agenciesList = document.getElementById("specialOpsAgencyList");
  const visibleAgencies = agencies.filter(matches);
  agenciesList.innerHTML = visibleAgencies.length ? visibleAgencies.map(agency => `
    <div class="px-3.5 py-2.5 flex items-center justify-between gap-3"><div class="min-w-0"><div class="text-xs font-semibold truncate">${escapeHtml(agency.name || "Unnamed agency")}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml(agency.category || "")}</div></div><i class="ri-building-line shrink-0" style="color:var(--channel)"></i></div>`).join("")
    : `<div class="p-4 text-xs" style="color:var(--muted)">${search ? "No agencies match this search." : "No agencies listed."}</div>`;

  pinsTable.querySelectorAll("[data-ops-pin-id]").forEach(row => {
    const openPin = () => showSpecialOperationPinDetail(row.dataset.opsPinId);
    row.addEventListener("click", openPin);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPin(); } });
  });
  incidentTable.querySelectorAll("[data-ops-incident-id]").forEach(row => {
    const openIncident = () => showSpecialOperationIncidentDetail(row.dataset.opsIncidentId);
    row.addEventListener("click", openIncident);
    row.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openIncident(); } });
  });

  renderSpecialOperationsMap(visiblePins, visibleIncidents, pins.length, incidents.length);
  const note = document.getElementById("specialOpsNotes");
  if (note) {
    const meetingNotes = String(payload.meetingNotes || "").trim();
    note.textContent = meetingNotes;
    note.closest("section")?.classList.toggle("hidden", !meetingNotes);
  }
}

function renderSpecialOperationsMap(pins, incidents, allPinCount, allIncidentCount) {
  const operationKey = `${specialOperationsCurrent?.id || ""}/${specialOperationsCurrent?.version?.id || ""}`;
  const shouldFitBounds = operationKey !== specialOperationsMapRenderedKey;
  const mapReady = ensureSpecialOperationsMap();
  if (!mapReady) {
    document.getElementById("specialOpsMapCount").textContent = "The map service did not load. Use the assignment and incident tables below.";
    return;
  }
  specialOperationsLayer.clearLayers();
  specialOperationsMapRenderedKey = operationKey;
  specialOperationsMarkerById = new Map();
  specialOperationsIncidentMarkerById = new Map();
  const points = [];
  const pinColors = { LGU: "#2C6586", NGO: "#2F7360", "Volunteer Groups": "#A85A12", "Other Agencies": "#52616B" };
  specialOperationsSelectedMarker = null;
  pins.forEach(pin => {
    const lat = Number(pin.lat); const lng = Number(pin.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    const color = pinColors[pin.category] || pinColors["Other Agencies"];
    const marker = window.L.marker([lat, lng], {
      icon: specialOperationPinIcon(color),
      title: pin.location || "Deployment location",
      riseOnHover: true
    })
      .bindPopup(specialOperationPopupHtml(pin));
    marker.options.operationColor = color;
    marker.options.operationIncident = false;
    marker.options.operationLatLng = window.L.latLng(lat, lng);
    marker.addTo(specialOperationsLayer);
    marker.on("click", () => showSpecialOperationPinDetail(pin.id));
    specialOperationsMarkerById.set(String(pin.id), marker);
    points.push([lat, lng]);
  });
  incidents.forEach(incident => {
    if (incident.lat === null || incident.lat === undefined || String(incident.lat).trim() === ""
      || incident.lng === null || incident.lng === undefined || String(incident.lng).trim() === "") return;
    const lat = Number(incident.lat); const lng = Number(incident.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    const marker = window.L.marker([lat, lng], {
      icon: specialOperationPinIcon("#9A332C", true),
      title: incident.incidentType || "Reported incident",
      riseOnHover: true
    })
      .bindPopup(specialOperationPopupHtml(incident, true));
    marker.options.operationColor = "#9A332C";
    marker.options.operationIncident = true;
    marker.options.operationLatLng = window.L.latLng(lat, lng);
    marker.addTo(specialOperationsLayer);
    marker.on("click", () => showSpecialOperationIncidentDetail(incident.id));
    specialOperationsIncidentMarkerById.set(String(incident.id), marker);
    points.push([lat, lng]);
  });
  document.getElementById("specialOpsMapCount").textContent = `${pins.length} of ${allPinCount} deployment pins · ${incidents.length} of ${allIncidentCount} incidents${points.length < pins.length + incidents.length ? " · Some records have no mappable coordinates" : ""}`;
  specialOperationsVisibleMapPoints = points;
  if (shouldFitBounds) fitSpecialOperationsMap();
}

function showSpecialOperationPinDetail(pinId) {
  const pins = specialOperationsCurrent?.version?.payload?.pins || [];
  const pin = pins.find(item => String(item.id) === String(pinId));
  if (!pin) return;
  const detail = document.getElementById("specialOpsPinDetail");
  document.getElementById("specialOpsIncidentDetail").classList.add("hidden");
  const assets = [
    ...Object.entries(pin.assetCounts || {}).map(([label, count]) => `${label}: ${count}`),
    ...(Array.isArray(pin.assets) ? pin.assets.map(asset => typeof asset === "string" ? asset : asset?.name || asset?.type || "") : [])
  ].filter(Boolean);
  detail.innerHTML = `<div class="flex items-start justify-between gap-2"><div><div class="font-bold">${escapeHtml(pin.location)}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml(pin.municipality || "")}</div></div><button type="button" id="specialOpsCloseDetail" class="shadcn-control px-2 py-1 text-[10px]" aria-label="Close assignment details"><i class="ri-close-line"></i></button></div><div class="space-y-1.5">${valuePairsHtml(pin, [["Agency", pin.agency], ["Category", pin.category], ["Assigned PAX", pin.pax], ["Map coordinates", formatOperationCoordinates(pin)], ["Focal person", pin.focalPerson], ["Contact", pin.contactNumber], ["Task", pin.task], ["Remarks", pin.remarks]])}${assets.length ? `<div class="grid grid-cols-[112px_1fr] gap-2"><span style="color:var(--muted)">Assets</span><span class="font-medium break-words">${assets.map(escapeHtml).join(", ")}</span></div>` : ""}</div>`;
  detail.classList.remove("hidden");
  document.getElementById("specialOpsCloseDetail").addEventListener("click", () => detail.classList.add("hidden"));
  document.querySelectorAll("#specialOpsPinsTable tr").forEach(row => row.classList.toggle("is-selected", row.dataset.opsPinId === String(pinId)));
  const marker = specialOperationsMarkerById.get(String(pinId));
  focusSpecialOperationMarker(marker);
}

function showSpecialOperationIncidentDetail(incidentId) {
  const incidents = specialOperationsCurrent?.version?.payload?.incidents || [];
  const incident = incidents.find(item => String(item.id) === String(incidentId));
  if (!incident) return;
  const detail = document.getElementById("specialOpsIncidentDetail");
  document.getElementById("specialOpsPinDetail").classList.add("hidden");
  detail.innerHTML = `<div class="flex items-start justify-between gap-2"><div><div class="font-bold">${escapeHtml(incident.incidentType || "Incident")}</div><div class="text-[10px]" style="color:var(--muted)">${escapeHtml([incident.date, incident.time].filter(Boolean).join(" · "))}</div></div><button type="button" id="specialOpsCloseIncidentDetail" class="shadcn-control px-2 py-1 text-[10px]" aria-label="Close incident details"><i class="ri-close-line"></i></button></div><div class="space-y-1.5">${valuePairsHtml(incident, [["Area", [incident.location, incident.municipality].filter(Boolean).join(" · ")], ["Map coordinates", formatOperationCoordinates(incident)], ["Affected", incident.affectedCount], ["Reported by", incident.reporterName], ["Reporter contact", incident.reporterContact], ["Responding unit", incident.respondingUnit], ["Action taken", incident.actionTaken], ["Status", incident.status]])}</div>`;
  detail.classList.remove("hidden");
  document.getElementById("specialOpsCloseIncidentDetail").addEventListener("click", () => detail.classList.add("hidden"));
  document.querySelectorAll("#specialOpsIncidentsTable tr").forEach(row => row.classList.toggle("is-selected", row.dataset.opsIncidentId === String(incidentId)));
  const marker = specialOperationsIncidentMarkerById.get(String(incidentId));
  focusSpecialOperationMarker(marker);
}

function getActiveFieldOversight(updateNo) {
  if (store.activeEventId !== "2026-sw-monsoon-luis-maymay") {
    return { checkins: [], deployments: [] };
  }
  return getFieldOversightBySitrep(updateNo);
}

function populateSitrepSelects() {
  const govSel = document.getElementById("govSitrepSelect");
  const compSel = document.getElementById("govCompareSelect");
  const dpSel = document.getElementById("dpCompareSelect");
  const keys = store.getSortedKeys().reverse();

  if (!store.snapshots[store.compareKey] || String(store.compareKey) === String(store.currentKey)) {
    const fallbackPrev = store.getPreviousKey(store.currentKey);
    store.compareKey = (fallbackPrev && String(fallbackPrev) !== String(store.currentKey))
      ? String(fallbackPrev)
      : (keys.find(k => String(k) !== String(store.currentKey)) || keys[0]);
  }

  const opts = keys.map(k => {
    const s = store.snapshots[k];
    return `<option value="${k}">Sitrep #${s.updateNo} (${s.dateStr})</option>`;
  }).join("");

  if (govSel) govSel.innerHTML = opts;
  if (compSel) compSel.innerHTML = opts;
  if (dpSel) dpSel.innerHTML = opts;

  if (govSel) govSel.value = store.currentKey;
  if (compSel) compSel.value = store.compareKey;
  if (dpSel) dpSel.value = store.compareKey;

  const pillsWrap = document.getElementById("opcenSitrepPills");
  if (pillsWrap) {
    pillsWrap.innerHTML = store.getSortedKeys().map(k => {
      const isCurr = String(k) === String(store.currentKey);
      const cls = isCurr
        ? "px-2.5 py-1 rounded-md text-xs font-bold text-white transition"
        : "shadcn-control px-2.5 py-1 text-xs";
      const style = isCurr ? "background-color: var(--deep);" : "min-height: 30px;";
      return `<button type="button" data-sr-pill="${k}" class="sr-pill-btn ${cls}" style="${style}">#${k}</button>`;
    }).join("");

    pillsWrap.querySelectorAll(".sr-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const k = btn.getAttribute("data-sr-pill");
        inlineEditEpId = null;
        triggerSitrepCrossfade(() => store.setSitrep(k));
        showStatusToast(`Loaded Sitrep #${k} (${store.snapshots[k].dateStr})`);
      });
    });
  }
}

function triggerSitrepCrossfade(mutatorFn) {
  const region = document.getElementById("govScreen");
  if (!region) {
    mutatorFn();
    return;
  }
  region.classList.add("crossfade-active");
  setTimeout(() => {
    mutatorFn();
    region.classList.remove("crossfade-active");
  }, 150);
}

// ============================================================================
// SCREEN 1: GOVERNOR'S EVENT DASHBOARD (SHADCN SPLIT WORKSPACE + ARG STRIP)
// ============================================================================
function renderGovernorScreen() {
  const snap = store.getCurrentSnapshot();
  const comp = store.getCompareSnapshot();
  const tot = snap.popTotals;
  const cTot = comp.popTotals;
  const isLegacyEvent = store.activeEventId === "2026-sw-monsoon-luis-maymay";
  const argCurr = isLegacyEvent
    ? getArgStatsForSitrep(snap.updateNo)
    : { rain24hMm: 0, max15mMm: 0, cumMm: 0, status: "No ARG data for this event" };
  const scopedEpisodes = store.getEpisodesForSitrep(snap);

  document.getElementById("govEventName").textContent = store.activeEventName;
  document.getElementById("govEventHeading").textContent = store.activeEventName;
  document.getElementById("govSitrepNum").innerHTML = `<i class="ri-file-list-3-line"></i><span>Sitrep #${snap.updateNo}</span>`;
  document.getElementById("govDateAndCutoff").innerHTML = `<i class="ri-time-line"></i><span>${snap.dateStr}, as of ${snap.cutoffTime}</span>`;
  const revBadge = document.getElementById("govRevisedBadge");
  const revNote = document.getElementById("govRevisionNoteText");
  revBadge.classList.toggle("hidden", !snap.revised);
  if (snap.revised && snap.revisionNote) {
    revNote.textContent = `Revision note: ${snap.revisionNote}`;
    revNote.classList.remove("hidden");
  } else {
    revNote.classList.add("hidden");
  }

  const totalFloodedAreasNow = snap.lguRows.reduce((s, r) => s + (r.activeFloods || 0), 0);
  const compFloodedAreas = comp.lguRows.reduce((s, r) => s + (r.activeFloods || 0), 0);
  const floodedMuniCount = snap.lguRows.filter(r => r.activeFloods > 0).length;

  const deepestEp = scopedEpisodes.reduce((best, ep) => (ep.peakFt > best.peakFt ? ep : best), scopedEpisodes[0]);
  const popSharePct = ((tot[2] / TARLAC_POP_2024) * 100).toFixed(1);

  const argFigure = `${argCurr.rain24hMm}`;
  const argUnit = "mm (24h)";
  const argBadge = `<span class="shadcn-badge ${argCurr.rain24hMm >= 40 ? 'badge-warning' : 'badge-water'}">Peak ${argCurr.max15mMm} mm/15m</span>`;

  const headlines = [
    {
      type: "flood_overview",
      icon: "ri-flood-line",
      label: "Areas flooded now",
      figure: `${fmtNum(totalFloodedAreasNow)}`,
      unit: "barangays",
      delta: fmtDelta(totalFloodedAreasNow, compFloodedAreas),
      sub: `In ${floodedMuniCount} municipality(s)`
    },
    {
      type: "episode",
      epId: deepestEp.id,
      icon: "ri-ruler-2-line",
      label: "Deepest current flood",
      figure: `${deepestEp.currentFt}`,
      unit: "",
      delta: `<span class="shadcn-badge badge-warning"><i class="ri-arrow-up-s-fill"></i> Peak ${deepestEp.peakFt} ft</span>`,
      sub: `${deepestEp.brgy}, ${deepestEp.mun}`
    },
    {
      type: "population",
      icon: "ri-group-line",
      label: "Affected population",
      figure: `${fmtNum(tot[2])}`,
      unit: "persons",
      delta: fmtDelta(tot[2], cTot[2]),
      sub: `${fmtNum(tot[1])} families (${popSharePct}% of census)`
    },
    {
      type: "evacuation",
      icon: "ri-hotel-bed-line",
      label: "In evacuation centers now",
      figure: `${fmtNum(tot[9])}`,
      unit: "persons",
      delta: fmtDelta(tot[9], cTot[9]),
      sub: `${fmtNum(tot[5])} open ECs (${fmtNum(tot[8])} cumulative)`
    },
    {
      type: "arg_rainfall",
      icon: "ri-heavy-showers-line",
      label: "ARG rainfall (Mayantoc)",
      figure: argFigure,
      unit: argUnit,
      delta: argBadge,
      sub: `${ARG_STATION_META.stationName} (${argCurr.cumMm} mm cum.)`
    }
  ];
  if (!isLegacyEvent) {
    headlines.splice(headlines.findIndex(item => item.type === "arg_rainfall"), 1);
  }

  document.getElementById("govHeadlineLedger").innerHTML = headlines.map(h => `
    <button
      type="button"
      data-dp-type="${h.type}"
      data-dp-ep="${h.epId || ''}"
      class="shadcn-card-interactive click-target text-left p-3.5 flex flex-col justify-between"
    >
      <div class="w-full">
        <div class="flex items-center justify-between gap-1.5">
          <span class="text-xs font-semibold inline-flex items-center gap-1.5" style="color: var(--muted);">
            <i class="${h.icon} text-sm" style="color: var(--channel);"></i>
            <span>${h.label}</span>
          </span>
          ${h.delta}
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span class="text-2xl font-bold big-num">${h.figure}</span>
          ${h.unit ? `<span class="text-xs font-medium" style="color: var(--muted);">${h.unit}</span>` : ''}
        </div>
      </div>
      <div class="text-[11px] mt-2.5 pt-2 hairline-t flex items-center justify-between w-full" style="color: var(--muted);">
        <span class="truncate pr-2">${h.sub}</span>
        <span class="font-semibold shrink-0" style="color: var(--channel);">Details</span>
      </div>
    </button>
  `).join("");

  document.getElementById("govWhatChangedHeading").textContent =
    `What changed between Sitrep #${comp.updateNo} (${comp.dateStr}) and Sitrep #${snap.updateNo} (${snap.dateStr})`;

  const popSrcEl = document.getElementById("govPopSourceLine");
  if (popSrcEl) {
    popSrcEl.innerHTML = `<i class="ri-database-2-line"></i><span>${snap.popSource}</span>`;
  }

  renderWhatChangedSection(snap, comp, scopedEpisodes);
  renderCompactRankingWithBars(snap, comp);
  renderMunicipalityTable(snap, comp);
  renderFloodGaugeTimeline(snap, scopedEpisodes);
  renderArgSynchronizedStrip(snap);
  renderFieldAndIncidents(snap);

  document.querySelectorAll("[data-dp-type]").forEach(el => {
    el.addEventListener("click", (e) => {
      openDetailPanel({
        type: el.getAttribute("data-dp-type"),
        epId: el.getAttribute("data-dp-ep"),
        muniId: el.getAttribute("data-dp-muni"),
        triggerEl: e.currentTarget
      });
    });
  });
}

function renderWhatChangedSection(snap, comp, scopedEpisodes) {
  const newlyFlooded = [];
  const floodedAgain = [];
  const worsening = [];
  const subsided = [];

  const list = scopedEpisodes || store.getEpisodesForSitrep(snap);
  const staMonica = list.find(e => e.id === "ep_sta_monica") || list[0];

  snap.lguRows.forEach(r => {
    const cRow = comp.lguRows.find(x => x.id === r.id) || r;
    const diff = r.activeFloods - cRow.activeFloods;
    if (cRow.activeFloods === 0 && r.activeFloods > 0) {
      newlyFlooded.push({ label: `${r.name} (${r.activeFloods} brgys)`, depth: "1.5 to 3 ft", epId: "ep_salumague" });
    } else if (diff > 0) {
      worsening.push({ label: `${r.name} (+${diff} areas)`, depth: `${r.activeFloods} active`, epId: "ep_sta_lucia" });
    } else if (diff < 0) {
      subsided.push({ label: `${r.name} (${Math.abs(diff)} subsided)`, depth: `${r.activeFloods} active`, epId: "ep_sawat_camiling" });
    }
  });

  if (newlyFlooded.length === 0) {
    newlyFlooded.push({ label: "Salumague (Bacao), Paniqui", depth: "2.5 to 3 ft", epId: "ep_salumague" });
  }
  floodedAgain.push(
    { label: "Pao 2nd, Camiling", depth: "3.0 ft (2nd wave)", epId: "ep_pao_2nd" },
    { label: "San Isidro (Mait), La Paz", depth: "2.5 ft (repeat)", epId: "ep_san_isidro_lapaz" }
  );
  worsening.unshift({
    label: `${staMonica.brgy}, ${staMonica.mun}`,
    depth: `${staMonica.currentFt} (${staMonica.lastVerified.split(",")[0]})`,
    epId: "ep_sta_monica"
  });
  if (subsided.length === 0) {
    subsided.push({ label: "Sawat, Camiling", depth: "0 ft (subsided)", epId: "ep_sawat_camiling" });
  }

  const groups = [
    { title: "Newly flooded", badge: `<span class="shadcn-badge badge-water">● Flooded</span>`, items: newlyFlooded.slice(0, 3) },
    { title: "Flooded again", badge: `<span class="shadcn-badge badge-warning">◆ Repeat</span>`, items: floodedAgain.slice(0, 3) },
    { title: "Needs verification", badge: `<span class="shadcn-badge badge-warning">▲ Check</span>`, items: worsening.slice(0, 3) },
    { title: "Subsided", badge: `<span class="shadcn-badge badge-success">✓ Subsided</span>`, items: subsided.slice(0, 3) }
  ];

  document.getElementById("govWhatChangedColumns").innerHTML = groups.map(g => `
    <div class="p-3.5 space-y-2">
      <div class="flex items-center justify-between text-xs pb-1 hairline-b">
        <span class="font-bold">${g.title}</span>
        ${g.badge}
      </div>
      <div class="divide-y" style="border-color: var(--border);">
        ${g.items.map(it => `
          <button
            type="button"
            data-dp-type="episode"
            data-dp-ep="${it.epId}"
            class="click-target w-full text-left py-1.5 px-1 rounded hover:opacity-80 flex items-center justify-between gap-2 text-xs transition"
          >
            <span class="font-semibold truncate">${it.label}</span>
            <span class="shrink-0 font-medium" style="color: var(--muted);">${it.depth}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function renderCompactRankingWithBars(snap, comp) {
  const tbody = document.getElementById("govCompactRankingTbody") || document.getElementById("govCompactRankTbody");
  if (!tbody) return;

  const maxPers = Math.max(1, ...snap.lguRows.map(r => r.persCum || 0));
  let rows = snap.lguRows.filter(r => store.districtFilter === "ALL" || String(r.dist) === String(store.districtFilter));
  rows.sort((a, b) => (a.dist - b.dist) || (b.persCum - a.persCum));

  let lastDist = null;
  const html = [];

  rows.forEach(r => {
    const cRow = comp.lguRows.find(x => x.id === r.id) || r;
    if (r.dist !== lastDist) {
      lastDist = r.dist;
      html.push(`
        <tr class="hairline-b" style="background-color: var(--bg-muted);">
          <td colspan="4" class="py-1 px-4 text-[11px] font-bold" style="color: var(--muted);">
            District ${r.dist} municipalities
          </td>
        </tr>
      `);
    }

    const barWidth = r.persCum > 0 ? Math.max(4, Math.round((r.persCum / maxPers) * 100)) : 0;
    const stateSub = r.carriedOverSince
      ? `<span class="block text-[10px]" style="color: var(--muted);">No update since #${r.carriedOverSince}</span>`
      : (r.figuresPending ? `<span class="block text-[10px] font-semibold" style="color: var(--amber);">Figures pending</span>` : "");

    const ecPill = r.ecState === "ACTIVE" && r.ecCount > 0
      ? `<span class="shadcn-badge badge-water">${fmtNum(r.ecPersNow)} (${r.ecCount} EC)</span>`
      : (r.ecState === "CLOSED" ? `<span class="text-[11px]" style="color: var(--muted);">Closed</span>` : `<span style="color: var(--muted);">-</span>`);

    const diff = r.persCum - cRow.persCum;
    const diffTag = diff !== 0
      ? `<span class="text-[11px] font-semibold ml-1" style="color: ${diff > 0 ? 'var(--amber)' : 'var(--green)'};">${diff > 0 ? '+' : ''}${fmtNum(diff)}</span>`
      : "";

    html.push(`
      <tr
        tabindex="0"
        data-dp-type="municipality"
        data-dp-muni="${r.id}"
        class="click-target hairline-b cursor-pointer transition hover:opacity-90"
      >
        <td class="py-2 pl-4 pr-2 font-semibold">
          <div>${r.name}</div>
          ${stateSub}
        </td>
        <td class="py-2 px-2 num-col">
          <div class="relative py-1 px-2 rounded overflow-hidden" style="background-color: var(--bg-subtle);">
            <div style="width: ${barWidth}%; background-color: var(--bar-fill, var(--shallow));" class="absolute inset-y-0 left-0 rounded-r"></div>
            <div class="relative z-10 font-bold">
              <span>${fmtNum(r.persCum)}</span>${diffTag}
            </div>
          </div>
        </td>
        <td class="py-2 px-2 num-col">${ecPill}</td>
        <td class="py-2 pl-2 pr-4 num-col font-semibold">
          ${r.activeFloods > 0 ? `<span class="shadcn-badge badge-warning">${r.activeFloods}</span>` : `<span style="color: var(--muted);">0</span>`}
        </td>
      </tr>
    `);
  });

  tbody.innerHTML = html.join("");
}

function renderMunicipalityTable(snap, comp) {
  let rows = snap.lguRows.filter(r => store.districtFilter === "ALL" || String(r.dist) === String(store.districtFilter));

  if (store.rankSort === "pers_desc") {
    rows.sort((a, b) => b.persCum - a.persCum);
  } else if (store.rankSort === "ec_desc") {
    rows.sort((a, b) => b.ecPersNow - a.ecPersNow);
  } else if (store.rankSort === "flood_desc") {
    rows.sort((a, b) => b.activeFloods - a.activeFloods);
  } else {
    rows.sort((a, b) => (a.dist - b.dist) || (b.persCum - a.persCum));
  }

  let lastDist = null;
  const bodyHtml = [];

  rows.forEach(r => {
    const cRow = comp.lguRows.find(x => x.id === r.id) || r;
    if (store.rankSort === "dist_grouped" && r.dist !== lastDist) {
      lastDist = r.dist;
      bodyHtml.push(`
        <tr class="hairline-b" style="background-color: var(--bg-muted);">
          <td colspan="10" class="py-1.5 px-4 text-xs font-bold" style="color: var(--muted);">
            District ${r.dist} municipalities
          </td>
        </tr>
      `);
    }

    const stateCue = r.carriedOverSince
      ? `<div class="text-[11px]" style="color: var(--muted);">No update since #${r.carriedOverSince}</div>`
      : (r.figuresPending ? `<div class="text-[11px] font-semibold" style="color: var(--amber);">Reported, figures pending</div>` : "");

    const ecDisplay = r.ecState === "ACTIVE" && r.ecCount > 0
      ? `<span class="shadcn-badge badge-water">${r.ecCount} open</span>`
      : (r.ecState === "CLOSED" ? `<span class="text-xs" style="color: var(--muted);">Closed</span>` : `<span style="color: var(--muted);">-</span>`);

    bodyHtml.push(`
      <tr
        tabindex="0"
        data-dp-type="municipality"
        data-dp-muni="${r.id}"
        class="click-target hairline-b cursor-pointer transition hover:opacity-90"
        style="background-color: var(--bg-card);"
      >
        <td class="py-2.5 pl-4 pr-3 font-semibold">
          <div>${r.name}</div>
          ${stateCue}
        </td>
        <td class="py-2.5 px-2 text-xs" style="color: var(--muted);">District ${r.dist}</td>
        <td class="py-2.5 px-2.5 num-col">${fmtNum(r.brgys)}</td>
        <td class="py-2.5 px-2.5 num-col">${fmtNum(r.famCum)}</td>
        <td class="py-2.5 px-2.5 num-col font-bold">
          <div class="flex items-center justify-end gap-2">
            <span>${fmtNum(r.persCum)}</span>
            ${r.persCum !== cRow.persCum ? fmtDelta(r.persCum, cRow.persCum) : ''}
          </div>
        </td>
        <td class="py-2.5 px-2.5 num-col">${fmtNum(r.servPers)}</td>
        <td class="py-2.5 px-2.5 num-col">${ecDisplay}</td>
        <td class="py-2.5 px-2.5 num-col font-semibold">${fmtNum(r.ecPersNow)}</td>
        <td class="py-2.5 px-2.5 num-col" style="color: var(--muted);">${fmtNum(r.ecPersCum)}</td>
        <td class="py-2.5 pl-2.5 pr-4 num-col font-semibold">
          ${r.activeFloods > 0 ? `<span class="shadcn-badge badge-warning">${r.activeFloods} flooded</span>` : `<span style="color: var(--muted);">0</span>`}
        </td>
      </tr>
    `);
  });

  document.getElementById("govRankingTbody").innerHTML = bodyHtml.join("");

  const t = snap.popTotals;
  const totalFloods = snap.lguRows.reduce((s, r) => s + (r.activeFloods || 0), 0);
  document.getElementById("govRankingTfoot").innerHTML = `
    <tr>
      <td class="py-3 pl-4 pr-3">Total (18 municipalities)</td>
      <td class="py-3 px-2">3 districts</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[0])}</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[1])}</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[2])}</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[4])}</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[5])} open</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[9])}</td>
      <td class="py-3 px-2.5 num-col">${fmtNum(t[8])}</td>
      <td class="py-3 pl-2.5 pr-4 num-col">${fmtNum(totalFloods)} flooded</td>
    </tr>
  `;
}

function renderFloodGaugeTimeline(snap, scopedEpisodes) {
  const totalDays = 38;
  const container = document.getElementById("govFloodTimelineRows");
  const list = scopedEpisodes || store.getEpisodesForSitrep(snap);

  const headerScale = `
    <div class="grid grid-cols-12 gap-2 text-[11px] font-semibold pb-1.5 hairline-b" style="color: var(--muted);">
      <div class="col-span-4">Barangay and municipality</div>
      <div class="col-span-6 flex justify-between px-1">
        <span>Aug 8 (#3)</span>
        <span>Aug 18 (#10)</span>
        <span>Aug 31 (#21)</span>
        <span>Sep 14 (#31)</span>
      </div>
      <div class="col-span-2 num-col">Peak &amp; status</div>
    </div>
  `;

  const rowsHtml = list.map(ep => {
    const statusText = ep.status === "Still Flooded"
      ? `<span class="shadcn-badge badge-water">● Flooded</span>`
      : (ep.status === "Rising"
          ? `<span class="shadcn-badge badge-warning">▲ Rising</span>`
          : (ep.status === "Receding"
              ? `<span class="shadcn-badge badge-water">▼ Receding</span>`
              : `<span class="shadcn-badge badge-success">✓ Subsided</span>`));

    const segments = ep.segments.map(seg => {
      const left = Math.max(0, ((seg.startDay - 1) / totalDays) * 100);
      const width = Math.max(9, ((seg.endDay - seg.startDay + 1) / totalDays) * 100);
      const bg = ep.status === "Subsided" ? "var(--green)" : (ep.needsVerification ? "var(--amber)" : "var(--channel)");
      return `
        <div
          style="left: ${left.toFixed(1)}%; width: ${width.toFixed(1)}%; background-color: ${bg}; color: #FFFFFF;"
          class="absolute top-1 h-6 rounded-full px-2 text-[11px] font-semibold flex items-center justify-between overflow-hidden"
        >
          <span class="truncate">▲ ${seg.peakFt} ft</span>
        </div>
      `;
    }).join("");

    return `
      <button
        type="button"
        data-dp-type="episode"
        data-dp-ep="${ep.id}"
        class="click-target w-full text-left grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-lg hover:opacity-90 transition hairline-b ${ep.needsVerification ? 'needs-verification' : ''}"
      >
        <div class="col-span-4 pr-2">
          <div class="font-bold text-xs">${ep.brgy}, ${ep.mun}</div>
          <div class="text-[11px] truncate" style="color: ${ep.needsVerification ? 'var(--amber)' : 'var(--muted)'};">
            ${ep.needsVerification ? `Needs verification (${ep.lastVerified})` : `${ep.sitios} · Verified ${ep.lastVerified}`}
          </div>
        </div>
        <div class="col-span-6 relative h-8 rounded-full" style="background-color: var(--bg-muted); border: 1px solid var(--border);">
          ${segments}
        </div>
        <div class="col-span-2 num-col text-xs space-y-0.5">
          <div class="font-bold">${ep.peakFt} ft</div>
          <div>${statusText}</div>
        </div>
      </button>
    `;
  }).join("");

  container.innerHTML = headerScale + rowsHtml;
}

function renderArgSynchronizedStrip(snap) {
  let argWrap = document.getElementById("govArgStripContainer");
  if (!argWrap) {
    const timelineEl = document.getElementById("govFloodTimelineRows");
    if (timelineEl && timelineEl.nextElementSibling) {
      argWrap = timelineEl.nextElementSibling;
      argWrap.id = "govArgStripContainer";
      argWrap.className = "px-3 sm:px-4 pb-3.5 pt-1";
      argWrap.removeAttribute("style");
    }
  }
  if (!argWrap) return;

  if (store.activeEventId !== "2026-sw-monsoon-luis-maymay") {
    argWrap.classList.add("hidden");
    return;
  }
  argWrap.classList.remove("hidden");

  const days38 = getArg38DayTimeline();
  const maxDayMm = Math.max(1, ...days38.map(d => d.totalMm || 0));
  const argStat = getArgStatsForSitrep(snap.updateNo);

  const barsHtml = days38.map(d => {
    const hPct = d.totalMm > 0 ? Math.max(12, Math.round((d.totalMm / maxDayMm) * 100)) : 5;
    const barColor = d.totalMm >= 70 ? "var(--amber)" : (d.totalMm > 0 ? "var(--channel)" : "var(--border-strong)");
    return `
      <div class="flex-1 h-full flex items-end group relative" title="${d.label}, 2026: ${d.totalMm} mm (Peak 15m: ${d.max15mMm} mm)">
        <div style="height: ${hPct}%; background-color: ${barColor};" class="w-full rounded-t transition-all group-hover:opacity-80"></div>
      </div>
    `;
  }).join("");

  const statusPill = `<span class="shadcn-badge badge-water">${argStat.rain24hMm} mm / 24h</span>`;

  argWrap.innerHTML = `
    <button
      type="button"
      data-dp-type="arg_rainfall"
      class="shadcn-card-interactive click-target w-full text-left p-2.5 grid grid-cols-12 gap-2 items-center"
      style="background-color: var(--bg-subtle);"
    >
      <div class="col-span-4 pr-2">
        <div class="font-bold text-xs flex items-center gap-1.5">
          <i class="ri-heavy-showers-line" style="color: var(--channel);"></i>
          <span>ARG: ${ARG_STATION_META.stationName}</span>
        </div>
        <div class="text-[11px] truncate" style="color: var(--muted);">
          ${ARG_STATION_META.municipality} · ${argStat.cumMm} mm cum. as of #${snap.updateNo}
        </div>
      </div>

      <div class="col-span-6 h-10 px-2 pt-1.5 pb-0.5 rounded-lg flex items-end gap-[2px]" style="background-color: var(--bg-card); border: 1px solid var(--border);">
        ${barsHtml}
      </div>

      <div class="col-span-2 num-col text-xs space-y-0.5">
        <div class="font-bold">Peak 156.5 mm</div>
        <div>${statusPill}</div>
      </div>
    </button>
  `;
}

function renderFieldAndIncidents(snap) {
  const rawEntry = store.getRawEntry(store.currentKey);
  const agriRows = (rawEntry.agriRows || []).filter(r => r.commodity !== "TOTAL");
  const fieldOps = getActiveFieldOversight(snap.updateNo);

  const activeUnits = fieldOps.checkins.filter(c => c.state === "active");
  const activePax = activeUnits.reduce((sum, c) => sum + (c.pax || 0), 0);
  const demobUnits = fieldOps.checkins.filter(c => c.state === "demobilized").length;
  const activeMissions = fieldOps.deployments.filter(d => d.state === "active").length;

  document.getElementById("govFieldOversightContainer").innerHTML = `
    <div class="rounded-xl overflow-hidden" style="border: 1px solid var(--border); background-color: var(--bg-card);">
      <div class="grid grid-cols-3 divide-x hairline-b" style="border-color: var(--border); background-color: var(--bg-subtle);">
        <div class="p-3">
          <div class="text-[11px] font-semibold" style="color: var(--muted);">Active personnel now</div>
          <div class="text-lg font-bold big-num mt-0.5" style="color: var(--channel);">${fmtNum(activePax)} pax</div>
          <div class="text-[11px]" style="color: var(--muted);">${activeUnits.length} unit(s) checked in</div>
        </div>
        <div class="p-3">
          <div class="text-[11px] font-semibold" style="color: var(--muted);">Active field missions</div>
          <div class="text-lg font-bold big-num mt-0.5" style="color: ${activeMissions > 0 ? 'var(--amber)' : 'var(--ink)'};">${activeMissions} deployed</div>
          <div class="text-[11px]" style="color: var(--muted);">In Sitrep #${snap.updateNo}</div>
        </div>
        <div class="p-3">
          <div class="text-[11px] font-semibold" style="color: var(--muted);">Demobilized units</div>
          <div class="text-lg font-bold big-num mt-0.5" style="color: var(--green);">${demobUnits} unit(s)</div>
          <div class="text-[11px]" style="color: var(--muted);">Logged out as of #${snap.updateNo}</div>
        </div>
      </div>

      <div class="px-3.5 py-2 hairline-b flex items-center justify-between text-xs font-bold" style="background-color: var(--bg-subtle); color: var(--muted);">
        <span>Units checked in at Operations Center</span>
        <span>Sitrep #${snap.updateNo} (${snap.dateStr})</span>
      </div>
      <div class="divide-y" style="border-color: var(--border);">
        ${fieldOps.checkins.map(c => {
          const badgeHtml = c.state === "active"
            ? `<span class="shadcn-badge badge-water">● ${c.checkOut}</span>`
            : (c.state === "standby"
                ? `<span class="shadcn-badge badge-warning">◆ ${c.checkOut}</span>`
                : `<span class="shadcn-badge badge-neutral">✓ ${c.checkOut}</span>`);
          return `
            <div class="p-3 space-y-1.5" style="background-color: var(--bg-card);">
              <div class="flex items-start justify-between gap-2">
                <div class="font-bold text-xs sm:text-sm">${c.unit}</div>
                <span class="shadcn-badge badge-neutral font-bold shrink-0">${c.pax > 0 ? `${c.pax} personnel` : 'Standby'}</span>
              </div>
              <div class="text-xs" style="color: var(--muted);">${c.vehicles}</div>
              <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <span style="color: var(--muted);"><strong>Checked in:</strong> ${c.checkIn}</span>
                ${badgeHtml}
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="px-3.5 py-2 hairline-t hairline-b flex items-center justify-between text-xs font-bold" style="background-color: var(--bg-subtle); color: var(--muted);">
        <span>Teams deployed and return log</span>
        <span>${fieldOps.deployments.length} mission(s)</span>
      </div>
      <div class="divide-y" style="border-color: var(--border);">
        ${fieldOps.deployments.map(d => {
          const retBadge = d.state === "active"
            ? `<span class="shadcn-badge badge-warning">▲ ${d.returnStatus}</span>`
            : `<span class="shadcn-badge badge-success">✓ ${d.returnStatus}</span>`;
          return `
            <div class="p-3 space-y-1.5" style="background-color: var(--bg-card);">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="font-bold text-xs sm:text-sm">${d.unit}</div>
                  <div class="text-xs font-semibold" style="color: var(--channel);">${d.dest}</div>
                </div>
                <span class="text-[11px] font-medium shrink-0" style="color: var(--muted);">${d.dispatched}</span>
              </div>
              <div class="text-xs" style="color: var(--ink);">${d.mission}</div>
              <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <span style="color: var(--muted);"><strong>Assets:</strong> ${d.assets}</span>
                ${retBadge}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  document.getElementById("govAgriSourceLabel").textContent = `Source: ${snap.agriSource}`;

  const totalHouses = (snap.housesTotally || 0) + (snap.housesPartially || 0);
  const housesMain = totalHouses > 0 ? `${fmtNum(totalHouses)} houses` : "Assessment pending";
  const housesSub = totalHouses > 0
    ? `${snap.housesTotally} totally · ${snap.housesPartially} partially damaged (DSWD)`
    : "LGU validation ongoing";

  const infraMain = snap.infraTotalPhp > 0 ? fmtPhp(snap.infraTotalPhp) : "Assessment pending";
  const assistMain = snap.assistTotalPhp > 0 ? fmtPhp(snap.assistTotalPhp) : "Assessment pending";

  const casualtyMunis = Array.isArray(rawEntry.casualtyByLgu) && rawEntry.casualtyByLgu.length
    ? rawEntry.casualtyByLgu
    : [{ mun: "Municipality breakdown not encoded", dead: "—", injured: "—", missing: "—" }];

  document.getElementById("govIncidentsDamageContainer").innerHTML = `
    <div class="rounded-xl overflow-hidden" style="border: 1px solid var(--border); background-color: var(--bg-card);">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x hairline-b" style="border-color: var(--border); background-color: var(--bg-subtle);">
        <div class="p-3.5">
          <div class="text-xs font-semibold" style="color: var(--muted);">Casualties (DILG validation)</div>
          <div class="text-lg font-bold big-num mt-1" style="color: ${snap.dead > 0 ? 'var(--brick)' : 'var(--ink)'};">
            ${snap.dead > 0 ? `${snap.dead} dead` : '0 reported'}
          </div>
          <div class="text-[11px] mt-0.5" style="color: var(--muted);">
            ${snap.dead > 0 ? `${snap.injured} injured · ${snap.missing} missing` : `As of Sitrep #${snap.updateNo}`}
          </div>
        </div>

        <div class="p-3.5">
          <div class="text-xs font-semibold" style="color: var(--muted);">Damaged houses</div>
          <div class="text-lg font-bold big-num mt-1">${housesMain}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--muted);">${housesSub}</div>
        </div>

        <div class="p-3.5">
          <div class="text-xs font-semibold" style="color: var(--muted);">Agriculture losses</div>
          <div class="text-lg font-bold big-num mt-1">${fmtPhp(snap.agriTotalPhp)}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--muted);">Rice and corn across 18 LGUs</div>
        </div>

        <div class="p-3.5">
          <div class="text-xs font-semibold" style="color: var(--muted);">Infrastructure damage</div>
          <div class="text-lg font-bold big-num mt-1">${infraMain}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--muted);">DPWH 1st and 2nd DEO</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x" style="border-color: var(--border);">
        <div class="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div class="px-3.5 py-2 hairline-b text-xs font-bold" style="background-color: var(--bg-subtle); color: var(--muted);">
              Casualty breakdown by municipality
            </div>
            ${snap.dead > 0 ? `
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="hairline-b font-semibold" style="color: var(--muted);">
                    <th class="py-2 pl-3.5 pr-2">Municipality</th>
                    <th class="py-2 px-2 num-col">Dead</th>
                    <th class="py-2 px-2 num-col">Injured</th>
                    <th class="py-2 pl-2 pr-3.5 num-col">Missing</th>
                  </tr>
                </thead>
                <tbody class="divide-y" style="border-color: var(--border);">
                  ${casualtyMunis.map(cm => `
                    <tr>
                      <td class="py-1.5 pl-3.5 pr-2 font-semibold">${cm.mun}</td>
                      <td class="py-1.5 px-2 num-col font-bold" style="color: ${cm.dead > 0 ? 'var(--brick)' : 'var(--muted)'};">${cm.dead}</td>
                      <td class="py-1.5 px-2 num-col font-semibold" style="color: ${cm.injured > 0 ? 'var(--amber)' : 'var(--muted)'};">${cm.injured}</td>
                      <td class="py-1.5 pl-2 pr-3.5 num-col font-bold" style="color: ${cm.missing > 0 ? 'var(--brick)' : 'var(--muted)'};">${cm.missing}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : `
              <div class="p-4 text-xs" style="color: var(--muted);">
                0 dead, 0 injured, and 0 missing reported as of Sitrep #${snap.updateNo}.
              </div>
            `}
          </div>

          <div class="p-3.5 hairline-t flex items-center justify-between gap-2" style="background-color: var(--bg-subtle);">
            <div>
              <div class="text-xs font-bold">Humanitarian relief extended</div>
              <div class="text-[11px]" style="color: var(--muted);">DSWD, PGT, LGUs, NGOs</div>
            </div>
            <div class="text-sm font-bold big-num" style="color: var(--green);">${assistMain}</div>
          </div>
        </div>

        <div class="lg:col-span-7 flex flex-col justify-between divide-y" style="border-color: var(--border);">
          <div>
            <div class="px-3.5 py-2 hairline-b text-xs font-bold" style="background-color: var(--bg-subtle); color: var(--muted);">
              Agriculture damage by commodity
            </div>
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="hairline-b font-semibold" style="color: var(--muted);">
                  <th class="py-2 pl-3.5 pr-2">Crop</th>
                  <th class="py-2 px-2 num-col">Farmers</th>
                  <th class="py-2 px-2 num-col">Partial (ha)</th>
                  <th class="py-2 px-2 num-col">Total (ha)</th>
                  <th class="py-2 pl-2 pr-3.5 num-col">Loss value</th>
                </tr>
              </thead>
              <tbody class="divide-y" style="border-color: var(--border);">
                ${agriRows.map(ar => `
                  <tr>
                    <td class="py-2 pl-3.5 pr-2 font-bold">${ar.commodity}</td>
                    <td class="py-2 px-2 num-col">${ar.farmers}</td>
                    <td class="py-2 px-2 num-col" style="color: var(--muted);">${ar.partialHa}</td>
                    <td class="py-2 px-2 num-col" style="color: var(--muted);">${ar.totalHa}</td>
                    <td class="py-2 pl-2 pr-3.5 num-col font-bold">${fmtPhp(ar.valuePhp)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div>
            <div class="px-3.5 py-2 hairline-b flex items-center justify-between text-xs font-bold" style="background-color: var(--bg-subtle); color: var(--muted);">
              <span>Roads, bridges, and power lifelines</span>
              <span class="shadcn-badge ${snap.updateNo >= 20 ? 'badge-error' : 'badge-success'}">
                ${snap.updateNo >= 20 ? '2 bridges closed' : 'All passable'}
              </span>
            </div>
            <div class="divide-y text-xs" style="border-color: var(--border);">
              ${snap.updateNo >= 20 ? `
                <div class="px-3.5 py-2 flex items-center justify-between gap-2">
                  <span class="font-medium">Agana Bridge, Romulo Highway, Tarlac City</span>
                  <span class="shadcn-badge badge-error">Closed (collapsed slab)</span>
                </div>
                <div class="px-3.5 py-2 flex items-center justify-between gap-2">
                  <span class="font-medium">Ninoy Aquino Bridge, Tarlac City</span>
                  <span class="shadcn-badge badge-error">Closed (collapsed slab)</span>
                </div>
              ` : ''}
              <div class="px-3.5 py-2 flex items-center justify-between gap-2">
                <span class="font-medium">LGU dike and slope scouring valuation</span>
                <span class="shadcn-badge badge-warning">Assessment pending</span>
              </div>
              <div class="px-3.5 py-2 flex items-center justify-between gap-2">
                <span class="font-medium">Power utilities (TARELCO I, TARELCO II, CELCOR)</span>
                <span class="shadcn-badge badge-success">Restored in 18 LGUs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// SCREEN 2: OPERATIONS CENTER ENTRY (WITH SITREP-SCOPED READINGS & BASELINE SAVE)
// ============================================================================
function renderOpcenScreen() {
  const snap = store.getCurrentSnapshot();
  const prevSnap = store.snapshots[store.getPreviousKey(store.currentKey)] || snap;
  const scopedEpisodes = store.getEpisodesForSitrep(snap);

  document.getElementById("opcenEventName").textContent = store.activeEventName;
  document.getElementById("opcenDraftTitle").innerHTML = `<i class="ri-draft-line"></i><span>Editing Sitrep #${snap.updateNo} (${snap.dateStr})</span>`;
  document.getElementById("opcenPublishBtnLabel").textContent = isOfflineSimulated ? "Connect to publish" : `Publish sitrep #${snap.updateNo}`;
  document.getElementById("opcenSaveStatus").innerHTML = isOfflineSimulated
    ? `<i class="ri-hard-drive-2-line"></i><span>Saved on this device, not yet synced</span>`
    : `<i class="ri-check-double-line"></i><span>Saved ${store.lastSavedTime}</span>`;

  const staleCount = scopedEpisodes.filter(e => e.needsVerification).length;
  const pendingCount = snap.lguRows.filter(r => r.figuresPending).length;
  const cumErrCount = store.cumDecreaseError ? 1 : 0;
  const openWarnings = staleCount + pendingCount + cumErrCount;

  document.getElementById("opcenOpenWarningsBadge").textContent = `${openWarnings} warning${openWarnings === 1 ? '' : 's'}`;
  document.getElementById("step1StateLabel").textContent = staleCount > 0 ? `Has warnings (${staleCount})` : "In progress";
  document.getElementById("step2StateLabel").textContent = (cumErrCount + pendingCount) > 0 ? `Has warnings (${cumErrCount + pendingCount})` : "Done";

  const muniSel = document.getElementById("newFloodMuni");
  if (muniSel && !muniSel.innerHTML) {
    muniSel.innerHTML = BASE_LGUS.map(m => `<option value="${m.name}">${m.name}</option>`).join("");
  }

  const bulkBtn = document.getElementById("bulkSameBtn");
  if (bulkBtn && !document.getElementById("resetFloodEditsBtn")) {
    const saveBaseBtn = document.createElement("button");
    saveBaseBtn.id = "saveFloodBaselineBtn";
    saveBaseBtn.type = "button";
    saveBaseBtn.className = "shadcn-control px-3 py-1.5 inline-flex items-center gap-1.5 text-xs";
    saveBaseBtn.style.color = "var(--green)";
    saveBaseBtn.innerHTML = `<i class="ri-save-line"></i><span>Save as baseline</span>`;
    saveBaseBtn.addEventListener("click", () => {
      if (typeof store.saveCurrentAsBaseline === "function") {
        store.saveCurrentAsBaseline();
      }
      showStatusToast("Saved current flood readings as your default baseline");
    });

    const resetBtn = document.createElement("button");
    resetBtn.id = "resetFloodEditsBtn";
    resetBtn.type = "button";
    resetBtn.className = "shadcn-control px-3 py-1.5 inline-flex items-center gap-1.5 text-xs";
    resetBtn.style.color = "var(--brick)";
    resetBtn.innerHTML = `<i class="ri-refresh-line"></i><span>Factory reset</span>`;
    resetBtn.addEventListener("click", () => {
      inlineEditEpId = null;
      store.resetFloodEpisodesToDefault(true);
      showStatusToast("Restored original PDF archive readings");
    });

    bulkBtn.parentElement.appendChild(saveBaseBtn);
    bulkBtn.parentElement.appendChild(resetBtn);
  }

  const tbody = document.getElementById("opcenFloodTbody");
  tbody.innerHTML = scopedEpisodes.map(ep => {
    const isEditing = inlineEditEpId === ep.id;
    const statusText = ep.status === "Still Flooded"
      ? `<span class="shadcn-badge badge-water"><i class="ri-drop-fill"></i> Flooded</span>`
      : (ep.status === "Rising"
          ? `<span class="shadcn-badge badge-warning"><i class="ri-arrow-up-s-fill"></i> Rising</span>`
          : (ep.status === "Receding"
              ? `<span class="shadcn-badge badge-water"><i class="ri-arrow-down-s-fill"></i> Receding</span>`
              : `<span class="shadcn-badge badge-success"><i class="ri-check-line"></i> Subsided</span>`));

    const totalDays = ep.segments.reduce((s, seg) => s + (seg.endDay - seg.startDay + 1), 0);

    const mainRow = `
      <tr id="opcen_ep_${ep.id}" class="hairline-b ${ep.needsVerification ? 'needs-verification' : ''}">
        <td class="py-2.5 pl-4 pr-2"><input type="checkbox" data-ep-chk="${ep.id}" class="ep-chk w-4 h-4 rounded" /></td>
        <td class="py-2.5 px-2 font-bold">${ep.brgy}, ${ep.mun}</td>
        <td class="py-2.5 px-2 text-xs" style="color: var(--muted);">${ep.scope} (${ep.sitios})</td>
        <td class="py-2.5 px-2 text-xs">${totalDays} days (${ep.segments.length} wave${ep.segments.length > 1 ? 's' : ''})</td>
        <td class="py-2.5 px-2 num-col font-bold">${ep.currentFt}</td>
        <td class="py-2.5 px-2 text-xs space-y-0.5">
          <div>${statusText}</div>
          <div style="color: ${ep.needsVerification ? 'var(--amber)' : 'var(--muted)'};">
            Verified as of #${snap.updateNo}: ${ep.lastVerified}
          </div>
        </td>
        <td class="py-2.5 pl-2 pr-4 text-right space-x-1 whitespace-nowrap">
          <button type="button" data-ep-action="same" data-ep-id="${ep.id}" class="ep-action-btn shadcn-control px-2.5 py-1 text-xs">Still the same</button>
          <button type="button" data-ep-action="inline_edit" data-ep-id="${ep.id}" class="ep-action-btn shadcn-control px-2.5 py-1 text-xs" style="color: var(--channel);">Update reading</button>
          <button type="button" data-ep-action="subsided" data-ep-id="${ep.id}" class="ep-action-btn shadcn-control px-2.5 py-1 text-xs" style="color: var(--green);">Subsided</button>
        </td>
      </tr>
    `;

    const inlineRow = isEditing ? `
      <tr class="hairline-b" style="background-color: var(--bg-subtle);">
        <td colspan="7" class="p-3.5 space-y-2.5">
          <div class="flex items-center justify-between text-xs pb-1 hairline-b">
            <span class="font-bold" style="color: var(--channel);">
              <i class="ri-calendar-check-line mr-1"></i>
              Recording reading for Sitrep #${snap.updateNo} (${snap.dateStr}, ${snap.cutoffTime})
            </span>
            <span style="color: var(--muted);">Switch Sitrep pill (#3 to #31) above first if encoding for a different date</span>
          </div>
          <div class="flex flex-wrap items-end gap-3 text-xs">
            <div>
              <label class="block font-semibold mb-1">Depth min (ft)</label>
              <input id="inlMin_${ep.id}" type="number" step="0.1" value="2.0" class="shadcn-control w-20 px-2 py-1 num-col" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Depth max (ft)</label>
              <input id="inlMax_${ep.id}" type="number" step="0.1" value="${ep.peakFt}" class="shadcn-control w-20 px-2 py-1 num-col" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Observed time (locked to Sitrep #${snap.updateNo})</label>
              <input id="inlTime_${ep.id}" type="text" value="${snap.dateStr}, ${snap.cutoffTime}" readonly class="shadcn-control w-44 px-2 py-1 opacity-80" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Status</label>
              <select id="inlStatus_${ep.id}" class="shadcn-control px-2 py-1">
                <option value="Still Flooded" ${ep.status === 'Still Flooded' ? 'selected' : ''}>Flooded</option>
                <option value="Rising" ${ep.status === 'Rising' ? 'selected' : ''}>Rising</option>
                <option value="Receding" ${ep.status === 'Receding' ? 'selected' : ''}>Receding</option>
                <option value="Subsided" ${ep.status === 'Subsided' ? 'selected' : ''}>Subsided</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold mb-1">Source LGU</label>
              <input id="inlSource_${ep.id}" type="text" value="${ep.mun} MDRRMO" class="shadcn-control w-36 px-2 py-1" />
            </div>
            <button type="button" data-save-inl="${ep.id}" class="save-inl-btn px-3.5 py-1.5 rounded-lg font-semibold text-white" style="background-color: var(--deep); min-height: 36px;">
              Save to Sitrep #${snap.updateNo}
            </button>
            <button type="button" data-cancel-inl="${ep.id}" class="cancel-inl-btn shadcn-control px-3 py-1.5">
              Cancel
            </button>
          </div>
        </td>
      </tr>
    ` : "";

    return mainRow + inlineRow;
  }).join("");

  const warningItems = [];
  scopedEpisodes.filter(e => e.needsVerification).forEach(ep => {
    warningItems.push(`
      <div class="p-2.5 needs-verification flex items-center justify-between gap-2" style="background-color: var(--amber-bg);">
        <span><strong>${ep.brgy}, ${ep.mun}:</strong> Needs verification (last verified ${ep.lastVerified})</span>
        <button type="button" data-jump-row="opcen_ep_${ep.id}" class="jump-row-btn underline font-bold shrink-0" style="color: var(--amber);">Jump to row</button>
      </div>
    `);
  });
  snap.lguRows.filter(r => r.figuresPending).forEach(r => {
    warningItems.push(`
      <div class="p-2.5 rounded-lg flex items-center justify-between gap-2" style="background-color: var(--bg-subtle); border: 1px solid var(--border);">
        <span><strong>${r.name}:</strong> Barangays rose (${r.brgys}), families and persons pending</span>
        <button type="button" data-jump-step="2" class="jump-step-btn underline font-bold shrink-0" style="color: var(--channel);">Go to Step 2</button>
      </div>
    `);
  });
  warningItems.push(`
    <div class="p-2.5 rounded-lg text-[11px]" style="background-color: var(--bg-subtle); border: 1px solid var(--border); color: var(--muted);">
      <strong>Chronological guard &amp; auto-save active:</strong> Edits persist in your browser automatically. Click "Save as baseline" to lock in your current state, or "Factory reset" to restore original PDFs.
    </div>
  `);
  document.getElementById("opcenWarningsPanel").innerHTML = warningItems.join("");

  const cumBox = document.getElementById("cumDecreaseAlertBox");
  if (store.cumDecreaseError) {
    cumBox.classList.remove("hidden");
    document.getElementById("cumDecreaseAlertText").textContent = store.cumDecreaseError;
  } else {
    cumBox.classList.add("hidden");
  }

  document.getElementById("opcenPopMatrixTbody").innerHTML = snap.lguRows.map(r => {
    const pRow = prevSnap.lguRows.find(x => x.id === r.id) || r;
    const isCumErr = store.cumDecreaseError && store.cumDecreaseError.startsWith(r.name);
    const noteCell = isCumErr
      ? `<span class="shadcn-badge badge-error">Cumulative cannot go down</span>`
      : (r.figuresPending
          ? `<span class="shadcn-badge badge-warning">Reported, figures pending</span>`
          : (r.carriedOverSince
              ? `<span class="shadcn-badge badge-neutral">No update since #${r.carriedOverSince}</span>`
              : `<span class="shadcn-badge badge-success">Verified</span>`));

    const makeCell = (field, prevVal) => `
      <td class="py-2 px-1.5 num-col">
        <input
          type="number"
          min="0"
          data-muni="${r.id}"
          data-field="${field}"
          value="${r[field]}"
          class="matrix-inp shadcn-control w-20 px-2 py-1 num-col font-semibold text-xs"
          style="min-height: 32px; ${isCumErr && (field === 'famCum' || field === 'persCum') ? 'border-color: var(--brick);' : ''}"
        />
        <div class="text-[11px] mt-0.5" style="color: var(--muted);">Prev: ${fmtNum(prevVal)}</div>
      </td>
    `;

    return `
      <tr class="hairline-b">
        <td class="py-2 pl-4 pr-2 font-semibold">${r.name} <span class="text-xs font-normal" style="color: var(--muted);">(D${r.dist})</span></td>
        ${makeCell("brgys", pRow.brgys)}
        ${makeCell("famCum", pRow.famCum)}
        ${makeCell("persCum", pRow.persCum)}
        ${makeCell("servFam", pRow.servFam)}
        ${makeCell("servPers", pRow.servPers)}
        ${makeCell("ecCount", pRow.ecCount)}
        ${makeCell("ecFamCum", pRow.ecFamCum)}
        ${makeCell("ecFamNow", pRow.ecFamNow)}
        ${makeCell("ecPersCum", pRow.ecPersCum)}
        ${makeCell("ecPersNow", pRow.ecPersNow)}
        <td class="py-2 pl-2 pr-4 text-xs">${noteCell}</td>
      </tr>
    `;
  }).join("");

  const t = snap.popTotals;
  document.getElementById("opcenPopMatrixTfoot").innerHTML = `
    <tr>
      <td class="py-3 pl-4 pr-2">Calculated total (not editable)</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[0])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[1])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[2])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[3])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[4])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[5])} open</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[6])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[7])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[8])}</td>
      <td class="py-3 px-2 num-col">${fmtNum(t[9])}</td>
      <td class="py-3 pl-2 pr-4 text-xs" style="color: var(--muted);">Auto-calculated</td>
    </tr>
  `;

  document.getElementById("opcenStep3Content").innerHTML = `
    <div class="p-4 rounded-xl space-y-1.5" style="background-color: var(--bg-subtle); border: 1px solid var(--border);">
      <div class="font-bold">Casualty counts (words only, never names)</div>
      <div>${snap.dead} dead, ${snap.injured} injured, ${snap.missing} missing</div>
      <div class="text-xs" style="color: var(--muted);">Source: DSWD and MDRRMOs, subject to DILG validation.</div>
    </div>
    <div class="p-4 rounded-xl space-y-1.5" style="background-color: var(--bg-subtle); border: 1px solid var(--border);">
      <div class="font-bold">Agriculture, infrastructure, and relief aid</div>
      <div>Agriculture: ${fmtPhp(snap.agriTotalPhp)} (${snap.agriSource})</div>
      <div>Infrastructure: ${snap.infraTotalPhp > 0 ? fmtPhp(snap.infraTotalPhp) : 'Assessment pending'}</div>
      <div>Humanitarian assistance: ${snap.assistTotalPhp > 0 ? fmtPhp(snap.assistTotalPhp) : 'Assessment pending'}</div>
    </div>
  `;

  const summaryForm = document.createElement("form");
  summaryForm.className = "md:col-span-2 p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3";
  summaryForm.style.cssText = "background-color: var(--bg-subtle); border: 1px solid var(--border);";
  summaryForm.innerHTML = '<div class="col-span-2 sm:col-span-4 font-bold">Edit report-wide counts and totals</div>';
  const summaryFields = [
    ["dead", "Dead", snap.dead, "1"],
    ["injured", "Injured", snap.injured, "1"],
    ["missing", "Missing", snap.missing, "1"],
    ["housesTotally", "Houses totally damaged", snap.housesTotally, "1"],
    ["housesPartially", "Houses partially damaged", snap.housesPartially, "1"],
    ["infraTotalPhp", "Infrastructure damage (PHP)", snap.infraTotalPhp, "0.01"],
    ["assistTotalPhp", "Humanitarian assistance (PHP)", snap.assistTotalPhp, "0.01"]
  ];
  summaryFields.forEach(([name, labelText, value, step]) => {
    const label = document.createElement("label");
    label.className = "text-xs font-semibold space-y-1";
    label.textContent = labelText;
    const input = document.createElement("input");
    input.name = name;
    input.type = "number";
    input.min = "0";
    input.step = step;
    input.value = value || 0;
    input.required = true;
    input.className = "shadcn-control block w-full px-2 py-1.5 font-normal";
    label.append(input);
    summaryForm.append(label);
  });
  const summarySave = document.createElement("button");
  summarySave.type = "submit";
  summarySave.className = "shadcn-control px-3 py-1.5 text-xs font-bold col-span-2 sm:col-span-4 justify-self-start";
  summarySave.textContent = "Save report summary";
  summaryForm.append(summarySave);
  summaryForm.addEventListener("submit", event => {
    event.preventDefault();
    store.updateReportSummary(Object.fromEntries(new FormData(summaryForm)));
    showStatusToast("Updated report-wide counts and totals.");
  });
  document.getElementById("opcenStep3Content").append(summaryForm);

  const opcenFieldOps = getActiveFieldOversight(snap.updateNo);
  document.getElementById("opcenStep4Content").innerHTML = opcenFieldOps.deployments.map(d => `
    <div class="p-3 rounded-xl flex flex-wrap items-center justify-between gap-2" style="background-color: var(--bg-subtle); border: 1px solid var(--border);">
      <div><strong>${d.unit}</strong> — ${d.dest} (${d.assets}, ${d.dispatched})</div>
      <span class="shadcn-badge ${d.state === 'active' ? 'badge-warning' : 'badge-success'}">${d.returnStatus}</span>
    </div>
  `).join("");

  document.getElementById("opcenStep5Content").innerHTML = `
    <div class="p-4 rounded-xl space-y-2" style="background-color: var(--bg-subtle); border: 1px solid var(--border);">
      <div><strong>Sitrep #${snap.updateNo} (${snap.dateStr}, cutoff ${snap.cutoffTime}):</strong></div>
      <div>Affected population: ${fmtNum(t[2])} persons, ${fmtNum(t[1])} families across ${fmtNum(t[0])} barangays.</div>
      <div>Evacuation centers: ${fmtNum(t[9])} persons inside ${fmtNum(t[5])} open centers (${fmtNum(t[8])} cumulative persons).</div>
      <div>Open warnings: ${openWarnings} (${staleCount} flood episode needs verification, ${pendingCount} LGU figures pending, ${cumErrCount} cumulative decrease check).</div>
    </div>
  `;

  document.querySelectorAll(".ep-action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const epId = btn.getAttribute("data-ep-id");
      const act = btn.getAttribute("data-ep-action");
      if (act === "inline_edit") {
        inlineEditEpId = inlineEditEpId === epId ? null : epId;
        renderOpcenScreen();
      } else {
        store.updateFloodEpisodeStatus(epId, act);
        const rowEl = document.getElementById(`opcen_ep_${epId}`);
        if (rowEl) rowEl.classList.add("changed-tint");
        showStatusToast(act === "same" ? `Confirmed unchanged for Sitrep #${snap.updateNo}` : `Marked subsided in Sitrep #${snap.updateNo}`);
      }
    });
  });

  document.querySelectorAll(".save-inl-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const epId = btn.getAttribute("data-save-inl");
      const minV = document.getElementById(`inlMin_${epId}`).value;
      const maxV = document.getElementById(`inlMax_${epId}`).value;
      const statusV = document.getElementById(`inlStatus_${epId}`).value;
      const depthStr = minV === maxV ? `${maxV} ft` : `${minV} to ${maxV} ft`;
      inlineEditEpId = null;
      store.updateFloodEpisodeStatus(epId, "update", depthStr, statusV);
      showStatusToast(`Saved reading to Sitrep #${snap.updateNo} (${snap.dateStr})`);
    });
  });

  document.querySelectorAll(".cancel-inl-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      inlineEditEpId = null;
      renderOpcenScreen();
    });
  });

  document.querySelectorAll(".jump-row-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const row = document.getElementById(btn.getAttribute("data-jump-row"));
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.classList.add("changed-tint");
      }
    });
  });

  document.querySelectorAll(".jump-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const stepBtn = document.querySelector(`.opcen-step-btn[data-step="${btn.getAttribute("data-jump-step")}"]`);
      if (stepBtn) stepBtn.click();
    });
  });

  document.querySelectorAll(".matrix-inp").forEach(inp => {
    inp.addEventListener("change", () => {
      store.updateMuniCell(inp.getAttribute("data-muni"), inp.getAttribute("data-field"), inp.value);
      inp.parentElement.classList.add("changed-tint");
      showStatusToast("Saved cell and recalculated total");
    });
  });
}

// ============================================================================
// SCREEN 3: SHADCN SHEET DETAIL PANEL (WITH DYNAMIC CROSSHAIR & RICH TOOLTIPS)
// ============================================================================
function buildSitrepChartOptions(keys, unitLabel = "persons", extraFooterFn = null) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(18, 26, 32, 0.96)",
        titleColor: "#F8FAFC",
        bodyColor: "#DCE4E8",
        footerColor: "#E3A55F",
        borderColor: "rgba(120, 174, 203, 0.35)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        titleFont: { family: "'Public Sans', sans-serif", size: 13, weight: "700" },
        bodyFont: { family: "'Public Sans', sans-serif", size: 12, weight: "500" },
        footerFont: { family: "'Public Sans', sans-serif", size: 11, weight: "600" },
        callbacks: {
          title: (items) => {
            if (!items || !items.length) return "";
            const idx = items[0].dataIndex;
            const srKey = keys[idx];
            const snapObj = store.snapshots[srKey];
            if (!snapObj) return items[0].label;
            return `Sitrep #${snapObj.updateNo} — ${snapObj.dateStr} (${snapObj.cutoffTime})`;
          },
          label: (item) => {
            const val = Number(item.parsed.y || 0).toLocaleString("en-US");
            return ` ${item.dataset.label}: ${val} ${unitLabel}`;
          },
          footer: (items) => {
            if (!items || !items.length || !extraFooterFn) return "";
            const idx = items[0].dataIndex;
            const srKey = keys[idx];
            const snapObj = store.snapshots[srKey];
            return snapObj ? extraFooterFn(snapObj) : "";
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: { family: "'Public Sans', sans-serif", size: 11, weight: "600" },
          maxRotation: 45,
          minRotation: 0
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { family: "'Public Sans', sans-serif", size: 11 }
        }
      }
    }
  };
}

function openDetailPanel({ type, epId, muniId, triggerEl }) {
  if (triggerEl) lastTriggerEl = triggerEl;
  activeDetailContext = { type, epId, muniId };

  const snap = store.getCurrentSnapshot();
  const comp = store.getCompareSnapshot();
  const keys = store.getSortedKeys();
  const scopedEpisodes = store.getEpisodesForSitrep(snap);

  const backdrop = document.getElementById("detailBackdrop");
  const sheet = document.getElementById("detailSheet");
  const dpTitle = document.getElementById("dpTitle");
  const dpStatus = document.getElementById("dpStatusMarker");
  const dpAsOf = document.getElementById("dpAsOfLine");
  const dpMain = document.getElementById("dpMainFigure");
  const dpChange = document.getElementById("dpChangeCue");
  const dpCompareWrap = document.getElementById("dpComparePickerRow");
  const dpPeak = document.getElementById("dpPeakSentence");
  const dpShare = document.getElementById("dpShareSentence");
  const dpChartTitle = document.getElementById("dpChartHeading");
  const dpRainStrip = document.getElementById("dpRainfallStripNote");
  const dpTableTitle = document.getElementById("dpTableHeading");
  const dpTHead = document.getElementById("dpTableHead");
  const dpTBody = document.getElementById("dpTableBody");
  const dpNotes = document.getElementById("dpNotesList");

  backdrop.classList.remove("is-leaving");
  backdrop.classList.add("is-open");

  if (dpChartInstance) dpChartInstance.destroy();
  const ctx = document.getElementById("dpChartCanvas");

  if (type === "arg_rainfall") {
    const argCurr = getArgStatsForSitrep(snap.updateNo);
    const argComp = getArgStatsForSitrep(comp.updateNo);

    dpTitle.textContent = `ARG: ${ARG_STATION_META.stationName}, ${ARG_STATION_META.municipality}`;
    dpStatus.textContent = `● Sensor ${ARG_STATION_META.status} (${ARG_STATION_META.lon}°E, ${ARG_STATION_META.lat}°N)`;
    dpAsOf.textContent = `Sitrep #${snap.updateNo} (${snap.dateStr}, cutoff ${snap.cutoffTime}) · ${argCurr.status}`;

    dpMain.textContent = `${argCurr.rain24hMm} mm (24h to cutoff)`;

    const diffRain = Math.round((argCurr.rain24hMm - argComp.rain24hMm) * 10) / 10;
    const sign = diffRain > 0 ? "+" : "";
    dpChange.innerHTML = `<span class="shadcn-badge ${diffRain > 0 ? 'badge-warning' : 'badge-success'}">${sign}${diffRain} mm vs Sitrep #${comp.updateNo}</span>`;

    dpCompareWrap.classList.add("hidden");
    dpRainStrip.classList.add("hidden");

    dpPeak.textContent = `Peak daily rainfall: 156.5 mm on Aug 29, 2026 (max 15-min intensity: 13.5 mm on Sep 9, 2026).`;
    dpShare.textContent = `Cumulative event rainfall through Sitrep #${snap.updateNo} (${argCurr.matchedTs}): ${argCurr.cumMm.toLocaleString()} mm across ${ARG_STATION_META.dedupRowCount.toLocaleString()} deduplicated 15-minute intervals.`;

    dpChartTitle.textContent = `Daily rainfall in millimeters at ${ARG_STATION_META.stationName} (${ARG_STATION_META.municipality}) — Aug 4 to Sep 14, 2026`;
    dpChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ARG_DAILY_SERIES.map(d => d.label),
        datasets: [{
          label: "Daily rainfall",
          data: ARG_DAILY_SERIES.map(d => d.totalMm),
          backgroundColor: ARG_DAILY_SERIES.map(d => (d.totalMm >= 70 ? "#A85A12" : "#2C6586")),
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(18, 26, 32, 0.96)",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => {
                const d = ARG_DAILY_SERIES[items[0].dataIndex];
                return d ? `${d.label}, 2026 (${d.date})` : "";
              },
              label: (item) => ` Daily total: ${item.parsed.y.toFixed(1)} mm`,
              footer: (items) => {
                const d = ARG_DAILY_SERIES[items[0].dataIndex];
                return d ? `Peak 15-min reading: ${d.max15mMm.toFixed(1)} mm (${d.readings} intervals)` : "";
              }
            }
          }
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: "Rainfall (mm)" } } }
      }
    });

    dpTableTitle.textContent = "Daily accumulated rainfall and peak 15-minute intensity (most recent first)";
    dpTHead.innerHTML = `
      <tr>
        <th class="py-2 px-3">Date (2026)</th>
        <th class="py-2 px-3 num-col">Daily total (mm)</th>
        <th class="py-2 px-3 num-col">Peak 15-min (mm)</th>
        <th class="py-2 px-3 num-col">15-min readings</th>
      </tr>
    `;
    dpTBody.innerHTML = ARG_DAILY_SERIES.slice().reverse().map(d => `
      <tr class="hairline-b">
        <td class="py-1.5 px-3 font-semibold">${d.label}, 2026</td>
        <td class="py-1.5 px-3 num-col font-bold" style="color: ${d.totalMm >= 70 ? 'var(--amber)' : 'var(--ink)'};">${d.totalMm.toFixed(1)} mm</td>
        <td class="py-1.5 px-3 num-col">${d.max15mMm.toFixed(1)} mm</td>
        <td class="py-1.5 px-3 num-col" style="color: var(--muted);">${d.readings}</td>
      </tr>
    `).join("");

    dpNotes.innerHTML = `
      <div><strong>Source files:</strong> GOSSOOD_PEOPLE_S_PARK_8_2026_Trend.csv &amp; GOSSOOD_PEOPLE_S_PARK_9_2026_Trend.csv (Mayantoc District 1 ARG).</div>
      <div><strong>Timestamp match:</strong> Sitrep #${snap.updateNo} cutoff matched to CSV timestamp <strong>${argCurr.matchedTs}</strong>.</div>
    `;
  } else if (type === "episode") {
    const ep = scopedEpisodes.find(e => e.id === epId) || scopedEpisodes[0];
    const totalDays = ep.segments.reduce((s, seg) => s + (seg.endDay - seg.startDay + 1), 0);

    dpTitle.textContent = `${ep.brgy}, ${ep.mun}`;
    dpStatus.textContent = ep.status === "Still Flooded" ? "● Flooded" : (ep.status === "Receding" ? "▼ Receding" : "✓ Subsided");
    dpAsOf.textContent = `Sitrep #${snap.updateNo}, ${snap.dateStr}, cutoff ${snap.cutoffTime}, source ${ep.mun} MDRRMO`;

    dpMain.textContent = `${totalDays} days flooded (${ep.currentFt} as of #${snap.updateNo})`;
    dpChange.innerHTML = `<span class="shadcn-badge badge-warning">Peak ${ep.peakFt} ft • ${ep.segments.length} wave${ep.segments.length > 1 ? 's' : ''}</span>`;
    dpCompareWrap.classList.add("hidden");
    dpPeak.textContent = `Peak so far: ${ep.peakFt} ft at ${ep.brgy}, ${ep.mun} (${ep.scope.toLowerCase()}, ${ep.sitios}).`;
    dpShare.textContent = `Showing readings recorded up to Sitrep #${snap.updateNo} (${snap.dateStr}).`;

    dpChartTitle.textContent = `Observed flood depth in feet (chronological step record up to Sitrep #${snap.updateNo}; peak ${ep.peakFt} ft)`;
    dpRainStrip.classList.remove("hidden");
    dpRainStrip.innerHTML = `<i class="ri-heavy-showers-line mr-1" style="color: var(--channel);"></i><strong>ARG Mayantoc correlation:</strong> Monsoon peaks on Aug 8 (57 mm), Aug 16–19 (218 mm), Aug 28–29 (274.5 mm), and Sep 9–11 (89 mm) align with flood waves.`;

    const chronological = ep.readings.slice().reverse();
    dpChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: chronological.map(r => r.time.split(",")[0]),
        datasets: [{
          label: "Observed depth",
          data: chronological.map(r => {
            const m = r.depth.match(/(\d+(\.\d+)?)/g);
            return m ? Math.max(...m.map(Number)) : 0;
          }),
          borderColor: "#2C6586",
          backgroundColor: "rgba(44, 101, 134, 0.16)",
          stepped: true,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#2C6586",
          pointHoverBorderColor: "#FFFFFF",
          pointHoverBorderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(18, 26, 32, 0.96)",
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => {
                const r = chronological[items[0].dataIndex];
                return r ? r.time : "";
              },
              label: (item) => {
                const r = chronological[item.dataIndex];
                return r ? ` Depth range: ${r.depth} (${r.status})` : "";
              },
              footer: (items) => {
                const r = chronological[items[0].dataIndex];
                return r ? `Source: ${r.source}` : "";
              }
            }
          }
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: "Depth (ft)" } } }
      }
    });

    dpTableTitle.textContent = `Recorded flood readings up to Sitrep #${snap.updateNo} (newest first)`;
    dpTHead.innerHTML = `
      <tr>
        <th class="py-2.5 px-3">Observed time</th>
        <th class="py-2.5 px-3 num-col">Depth range</th>
        <th class="py-2.5 px-3">Status</th>
        <th class="py-2.5 px-3">Source LGU</th>
        <th class="py-2.5 px-2 text-right">Undo</th>
      </tr>
    `;
    dpTBody.innerHTML = ep.readings.map(r => `
      <tr class="hairline-b">
        <td class="py-2 px-3">${r.time}</td>
        <td class="py-2 px-3 num-col font-bold">${r.depth}</td>
        <td class="py-2 px-3">${r.status}</td>
        <td class="py-2 px-3">${r.source}</td>
        <td class="py-2 px-2 text-right">
          ${ep.allReadingsCount > 1 ? `
            <button type="button" data-del-ep="${ep.id}" data-del-time="${r.time}" class="del-reading-btn text-xs px-1.5 py-0.5 rounded hover:opacity-80" style="color: var(--brick);" title="Remove this reading">
              <i class="ri-delete-bin-line"></i>
            </button>
          ` : ''}
        </td>
      </tr>
    `).join("");

    dpTBody.querySelectorAll(".del-reading-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetEp = btn.getAttribute("data-del-ep");
        const targetTime = btn.getAttribute("data-del-time");
        if (store.deleteFloodReadingByTime(targetEp, targetTime)) {
          openDetailPanel(activeDetailContext);
          showStatusToast(`Removed reading (${targetTime})`);
        }
      });
    });

    dpNotes.innerHTML = `
      <div>Last verified as of Sitrep #${snap.updateNo}: ${ep.lastVerified} (${ep.needsVerification ? 'needs verification with MDRRMO' : 'verified'}).</div>
      <div>Flood waves recorded at ${ep.brgy}: ${ep.segments.map(s => s.label).join("; ")}.</div>
    `;
  } else if (type === "municipality" && muniId) {
    const r = snap.lguRows.find(x => x.id === Number(muniId)) || snap.lguRows[0];
    const cRow = comp.lguRows.find(x => x.id === r.id) || r;

    dpTitle.textContent = `${r.name} (District ${r.dist})`;
    dpStatus.textContent = r.ecState === "ACTIVE" ? `${r.ecCount} open evacuation centers` : `Evacuation centers ${r.ecState.toLowerCase()}`;
    dpAsOf.textContent = `Sitrep #${snap.updateNo}, ${snap.dateStr}, cutoff ${snap.cutoffTime}, source ${snap.popSource}`;

    dpMain.textContent = `${fmtNum(r.persCum)} affected persons`;
    dpChange.innerHTML = `${fmtDelta(r.persCum, cRow.persCum)} vs Sitrep #${comp.updateNo}`;
    dpCompareWrap.classList.remove("hidden");
    dpRainStrip.classList.add("hidden");

    let peakVal = 0, peakSr = snap;
    keys.forEach(k => {
      const m = store.snapshots[k].lguRows.find(x => x.id === r.id);
      if (m && m.persCum >= peakVal) { peakVal = m.persCum; peakSr = store.snapshots[k]; }
    });
    dpPeak.textContent = `Peak so far: ${fmtNum(peakVal)} affected persons on ${peakSr.dateStr} (Sitrep #${peakSr.updateNo}).`;
    const sharePct = ((r.persCum / (r.pop2024 || 1)) * 100).toFixed(1);
    dpShare.textContent = `Share of population affected: ${sharePct}% of ${fmtNum(r.pop2024)} residents (2024 census).`;

    dpChartTitle.textContent = `${r.name} affected persons (blue) and people in ECs now (amber) across all 25 sitreps (#3 to #31)`;
    dpChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: keys.map(k => `#${k}`),
        datasets: [
          {
            label: "Affected persons",
            data: keys.map(k => store.snapshots[k].lguRows.find(x => x.id === r.id)?.persCum || 0),
            borderColor: "#2C6586",
            backgroundColor: "rgba(44, 101, 134, 0.12)",
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: keys.map(k => (String(k) === String(snap.updateNo) ? 5 : 2.5)),
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#2C6586",
            pointHoverBorderColor: "#FFFFFF",
            pointHoverBorderWidth: 2.5
          },
          {
            label: "People in ECs now",
            data: keys.map(k => store.snapshots[k].lguRows.find(x => x.id === r.id)?.ecPersNow || 0),
            borderColor: "#A85A12",
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 2.5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#A85A12",
            pointHoverBorderColor: "#FFFFFF",
            pointHoverBorderWidth: 2.5
          }
        ]
      },
      options: buildSitrepChartOptions(keys, "persons", (sObj) => {
        const mRow = sObj.lguRows.find(x => x.id === r.id);
        if (!mRow) return "";
        return `${mRow.brgys} affected brgys · ${mRow.ecCount > 0 ? mRow.ecCount + ' open EC(s)' : 'ECs closed'}`;
      })
    });

    dpTableTitle.textContent = `${r.name} figures in Sitrep #${snap.updateNo} vs Sitrep #${comp.updateNo}`;
    dpTHead.innerHTML = `
      <tr>
        <th class="py-2.5 px-3">Measure</th>
        <th class="py-2.5 px-3 num-col">Sitrep #${snap.updateNo}</th>
        <th class="py-2.5 px-3 num-col">Sitrep #${comp.updateNo}</th>
        <th class="py-2.5 px-3 num-col">Change</th>
      </tr>
    `;
    dpTBody.innerHTML = `
      <tr class="hairline-b"><td class="py-2 px-3">Affected barangays</td><td class="py-2 px-3 num-col font-bold">${fmtNum(r.brgys)}</td><td class="py-2 px-3 num-col">${fmtNum(cRow.brgys)}</td><td class="py-2 px-3 num-col">${fmtDelta(r.brgys, cRow.brgys)}</td></tr>
      <tr class="hairline-b"><td class="py-2 px-3">Affected families (cumulative)</td><td class="py-2 px-3 num-col font-bold">${fmtNum(r.famCum)}</td><td class="py-2 px-3 num-col">${fmtNum(cRow.famCum)}</td><td class="py-2 px-3 num-col">${fmtDelta(r.famCum, cRow.famCum)}</td></tr>
      <tr class="hairline-b"><td class="py-2 px-3">Affected persons (cumulative)</td><td class="py-2 px-3 num-col font-bold">${fmtNum(r.persCum)}</td><td class="py-2 px-3 num-col">${fmtNum(cRow.persCum)}</td><td class="py-2 px-3 num-col">${fmtDelta(r.persCum, cRow.persCum)}</td></tr>
      <tr class="hairline-b"><td class="py-2 px-3">People in evacuation centers now</td><td class="py-2 px-3 num-col font-bold">${fmtNum(r.ecPersNow)}</td><td class="py-2 px-3 num-col">${fmtNum(cRow.ecPersNow)}</td><td class="py-2 px-3 num-col">${fmtDelta(r.ecPersNow, cRow.ecPersNow)}</td></tr>
    `;

    dpNotes.innerHTML = `
      <div>Source: ${snap.popSource}.</div>
      ${r.carriedOverSince ? `<div>Carried over: Served count has no update since Sitrep #${r.carriedOverSince}.</div>` : ''}
      ${r.figuresPending ? `<div>Pending: Barangay count rose, updated family and person counts pending from LGU.</div>` : ''}
    `;
  } else {
    const t = snap.popTotals;
    const cT = comp.popTotals;

    dpTitle.textContent = "People in evacuation centers";
    dpStatus.textContent = `${fmtNum(t[5])} active centers`;
    dpAsOf.textContent = `Sitrep #${snap.updateNo}, ${snap.dateStr}, cutoff ${snap.cutoffTime}, source ${snap.popSource}`;

    dpMain.textContent = `${fmtNum(t[9])} persons (${fmtNum(t[7])} families in ${fmtNum(t[5])} centers)`;
    dpChange.innerHTML = `${fmtDelta(t[9], cT[9])} vs Sitrep #${comp.updateNo} (${fmtNum(cT[9])} persons)`;
    dpCompareWrap.classList.remove("hidden");
    dpRainStrip.classList.add("hidden");

    dpPeak.textContent = `Peak so far: 8,258 persons on Aug 31, 2026 (Sitrep #21${snap.updateNo === 21 ? ', this sitrep' : ''}).`;
    const provShare = ((t[2] / TARLAC_POP_2024) * 100).toFixed(1);
    dpShare.textContent = `Total affected population in Sitrep #${snap.updateNo}: ${fmtNum(t[2])} persons (${provShare}% of ${fmtNum(TARLAC_POP_2024)} residents, 2024 census).`;

    dpChartTitle.textContent = "Persons inside evacuation centers now (solid blue) and cumulative (dashed deep navy) across all 25 sitreps (#3 to #31)";
    dpChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: keys.map(k => `#${k}`),
        datasets: [
          {
            label: "Persons inside now",
            data: keys.map(k => store.snapshots[k].popTotals[9]),
            borderColor: "#2C6586",
            backgroundColor: "rgba(44, 101, 134, 0.14)",
            fill: true,
            borderWidth: 2,
            tension: 0.3,
            pointRadius: keys.map(k => (String(k) === String(snap.updateNo) ? 5 : 2.5)),
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#2C6586",
            pointHoverBorderColor: "#FFFFFF",
            pointHoverBorderWidth: 2.5
          },
          {
            label: "Cumulative persons in ECs",
            data: keys.map(k => store.snapshots[k].popTotals[8]),
            borderColor: "#123B54",
            borderDash: [4, 4],
            borderWidth: 1.5,
            tension: 0.3,
            pointRadius: 2.5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#123B54",
            pointHoverBorderColor: "#FFFFFF",
            pointHoverBorderWidth: 2.5
          }
        ]
      },
      options: buildSitrepChartOptions(keys, "persons", (sObj) => {
        const openEcs = sObj.popTotals[5];
        const famNow = sObj.popTotals[7].toLocaleString("en-US");
        return `${openEcs} active evacuation centers (${famNow} families inside now)`;
      })
    });

    dpTableTitle.textContent = "By municipality (centers, families now, persons now, cumulative, and change)";
    dpTHead.innerHTML = `
      <tr>
        <th class="py-2.5 px-3">Municipality</th>
        <th class="py-2.5 px-2 num-col">Centers</th>
        <th class="py-2.5 px-2 num-col">Families now</th>
        <th class="py-2.5 px-2 num-col">Persons now</th>
        <th class="py-2.5 px-2 num-col">Cumulative</th>
        <th class="py-2.5 px-3 num-col">Change</th>
      </tr>
    `;

    const ecMunis = snap.lguRows.filter(r => r.ecCount > 0 || r.ecPersCum > 0);
    dpTBody.innerHTML = ecMunis.map(r => {
      const cRow = comp.lguRows.find(x => x.id === r.id) || r;
      return `
        <tr class="hairline-b">
          <td class="py-2 px-3 font-semibold">
            ${r.name}
            ${r.carriedOverSince ? `<div class="text-xs font-normal" style="color: var(--muted);">no update since #${r.carriedOverSince}</div>` : ''}
          </td>
          <td class="py-2 px-2 num-col">${r.ecCount > 0 ? r.ecCount : 'Closed'}</td>
          <td class="py-2 px-2 num-col">${fmtNum(r.ecFamNow)}</td>
          <td class="py-2 px-2 num-col font-bold">${fmtNum(r.ecPersNow)}</td>
          <td class="py-2 px-2 num-col" style="color: var(--muted);">${fmtNum(r.ecPersCum)}</td>
          <td class="py-2 px-3 num-col">${fmtDelta(r.ecPersNow, cRow.ecPersNow)}</td>
        </tr>
      `;
    }).join("");

    dpNotes.innerHTML = `
      <div>Source: ${snap.popSource}. Physical evacuation center capacity is not tracked in PDRRMO sitreps.</div>
      <div>Carried over: Camiling served figure (130 families, 393 persons) has no update since Sitrep #3.</div>
    `;
  }

  sheet.focus();
}

function closeDetailPanel() {
  const backdrop = document.getElementById("detailBackdrop");
  if (!backdrop.classList.contains("is-open")) return;
  backdrop.classList.add("is-leaving");
  setTimeout(() => {
    backdrop.classList.remove("is-open", "is-leaving");
    if (lastTriggerEl && typeof lastTriggerEl.focus === "function") {
      lastTriggerEl.focus();
    }
  }, 160);
}

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  await initPdfWorker();

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "night");
    document.getElementById("themeToggleText").textContent = "Daylight theme";
    document.getElementById("themeToggleIcon").className = "ri-sun-line";
  }

  populateSitrepSelects();

  store.subscribe(() => {
    populateSitrepSelects();
    renderGovernorScreen();
    renderOpcenScreen();
  });

  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "night" ? "daylight" : "night";
    root.setAttribute("data-theme", next);
    document.getElementById("themeToggleText").textContent = next === "night" ? "Daylight theme" : "Night theme";
    document.getElementById("themeToggleIcon").className = next === "night" ? "ri-sun-line" : "ri-moon-clear-line";
  });

  const navGovBtn = document.getElementById("navGovBtn");
  const navSpecialOpsBtn = document.getElementById("navSpecialOpsBtn");
  const navOpcenBtn = document.getElementById("navOpcenBtn");
  const govScreen = document.getElementById("govScreen");
  const specialOperationsScreen = document.getElementById("specialOperationsScreen");
  const opcenScreen = document.getElementById("opcenScreen");
  const secCue = document.getElementById("securityRoleCue");
  let specialOperationsViewer = false;
  let availableSpecialOperations = [];

  async function refreshSpecialOperations(admin, viewer, preferredId = "") {
    specialOperationsViewer = Boolean(viewer);
    const gate = document.getElementById("specialOperationsGate");
    const adminUpload = document.getElementById("specialOperationsAdminUpload");
    const dashboard = document.getElementById("specialOperationsDashboard");
    const empty = document.getElementById("specialOperationsEmpty");
    const selectWrap = document.getElementById("specialOperationsSelectWrap");
    const accessBadge = document.getElementById("specialOperationsAccessBadge");
    const gateText = document.getElementById("specialOperationsGateText");

    adminUpload.classList.toggle("hidden", !admin);
    gate.classList.toggle("hidden", Boolean(viewer));
    dashboard.classList.add("hidden");
    empty.classList.add("hidden");
    selectWrap.classList.add("hidden");
    if (!viewer) {
      accessBadge.className = "shadcn-badge badge-warning";
      accessBadge.innerHTML = `<i class="ri-lock-2-line"></i><span>Approved access required</span>`;
      gateText.textContent = auth.currentUser
        ? "This signed-in account has not been approved to view special operations. Ask the portal administrator to authorize this Google account."
        : "These operation records may include staff and incident contact details, so they are not available to public visitors.";
      return;
    }

    accessBadge.className = admin ? "shadcn-badge badge-success" : "shadcn-badge badge-neutral";
    accessBadge.innerHTML = admin
      ? `<i class="ri-shield-check-line"></i><span>Administrator view</span>`
      : `<i class="ri-eye-line"></i><span>Governor view · read only</span>`;
    try {
      availableSpecialOperations = await listSpecialOperations(Boolean(admin));
      const select = document.getElementById("specialOperationsSelect");
      select.replaceChildren();
      availableSpecialOperations.forEach(operation => {
        const option = document.createElement("option");
        option.value = operation.id;
        option.textContent = `${operation.name || operation.id}${operation.period ? ` · ${operation.period}` : ""}`;
        select.append(option);
      });
      if (!availableSpecialOperations.length) {
        specialOperationsCurrent = null;
        selectWrap.classList.add("hidden");
        empty.classList.remove("hidden");
        return;
      }
      selectWrap.classList.remove("hidden");
      const selectedId = availableSpecialOperations.some(item => item.id === preferredId)
        ? preferredId
        : availableSpecialOperations.some(item => item.id === select.value) ? select.value : availableSpecialOperations[0].id;
      select.value = selectedId;
      const operation = await loadSpecialOperation(selectedId);
      renderSpecialOperationsDashboard(operation);
    } catch (error) {
      dashboard.classList.add("hidden");
      setSpecialOperationsStatus(`Could not load operation data: ${error.message}`, "error");
    }
  }

  navGovBtn.addEventListener("click", () => {
    govScreen.classList.remove("hidden");
    specialOperationsScreen.classList.add("hidden");
    opcenScreen.classList.add("hidden");
    navGovBtn.classList.add("is-active");
    navSpecialOpsBtn.classList.remove("is-active");
    navOpcenBtn.classList.remove("is-active");
    secCue.innerHTML = `<i class="ri-eye-line"></i><span>View only</span>`;
  });

  navSpecialOpsBtn.addEventListener("click", async () => {
    govScreen.classList.add("hidden");
    opcenScreen.classList.add("hidden");
    specialOperationsScreen.classList.remove("hidden");
    specialOperationsScreen.classList.remove("operations-enter");
    void specialOperationsScreen.offsetWidth;
    specialOperationsScreen.classList.add("operations-enter");
    navGovBtn.classList.remove("is-active");
    navSpecialOpsBtn.classList.add("is-active");
    navOpcenBtn.classList.remove("is-active");
    secCue.innerHTML = `<i class="ri-eye-line"></i><span>${window.pdrrmoFirebaseAdmin ? "Admin · operation upload" : specialOperationsViewer ? "Approved view · read only" : "Access restricted"}</span>`;
    await refreshSpecialOperations(Boolean(window.pdrrmoFirebaseAdmin), specialOperationsViewer);
  });

  navOpcenBtn.addEventListener("click", () => {
    if (!window.pdrrmoFirebaseAdmin) {
      showStatusToast("Sign in with an approved administrator account to open Operations Center.");
      return;
    }
    opcenScreen.classList.remove("hidden");
    govScreen.classList.add("hidden");
    specialOperationsScreen.classList.add("hidden");
    navOpcenBtn.classList.add("is-active");
    navGovBtn.classList.remove("is-active");
    navSpecialOpsBtn.classList.remove("is-active");
    secCue.innerHTML = `<i class="ri-shield-keyhole-line"></i><span>Operations Center encoder</span>`;
  });

  document.querySelectorAll(".gov-view-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeGovTab = btn.getAttribute("data-gov-view");
      document.querySelectorAll(".gov-view-tab").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      ["split", "matrix", "damage"].forEach(v => {
        const el = document.getElementById(`govView_${v}`);
        if (el) el.classList.toggle("hidden", v !== activeGovTab);
      });
    });
  });

  document.getElementById("govSitrepSelect").addEventListener("change", (e) => {
    const val = e.target.value;
    inlineEditEpId = null;
    triggerSitrepCrossfade(() => store.setSitrep(val));
  });

  document.getElementById("govCompareSelect").addEventListener("change", (e) => {
    const val = e.target.value;
    triggerSitrepCrossfade(() => store.setCompareSitrep(val));
  });

  document.getElementById("dpCompareSelect").addEventListener("change", (e) => {
    store.setCompareSitrep(e.target.value);
    if (activeDetailContext) openDetailPanel(activeDetailContext);
  });

  document.querySelectorAll(".dist-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      store.districtFilter = btn.getAttribute("data-dist");
      document.querySelectorAll(".dist-filter-btn").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderGovernorScreen();
    });
  });

  document.getElementById("govRankSortSelect").addEventListener("change", (e) => {
    store.rankSort = e.target.value;
    renderGovernorScreen();
  });

  document.querySelectorAll(".opcen-step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = Number(btn.getAttribute("data-step"));
      store.activeStep = step;
      [1, 2, 3, 4, 5].forEach(s => {
        document.getElementById(`opcenFrame_${s}`).classList.toggle("hidden", s !== step);
      });
    });
  });

  document.getElementById("chkAllFloods").addEventListener("change", (e) => {
    document.querySelectorAll(".ep-chk").forEach(c => { c.checked = e.target.checked; });
  });

  document.getElementById("bulkSameBtn").addEventListener("click", () => {
    let count = 0;
    document.querySelectorAll(".ep-chk:checked").forEach(c => {
      store.updateFloodEpisodeStatus(c.getAttribute("data-ep-chk"), "same");
      count++;
    });
    showStatusToast(count > 0 ? `Marked ${count} episode(s) still the same` : "Select at least one flood episode row");
  });

  document.getElementById("toggleEmptyFloodStateBtn").addEventListener("click", () => {
    isEmptyFloodPreview = !isEmptyFloodPreview;
    document.getElementById("opcenEmptyFloodBox").classList.toggle("hidden", !isEmptyFloodPreview);
    document.getElementById("opcenFloodTableWrap").classList.toggle("hidden", isEmptyFloodPreview);
  });

  document.getElementById("newFloodBrgy").addEventListener("input", (e) => {
    const key = e.target.value.trim().toLowerCase();
    const hint = document.getElementById("brgyAliasHint");
    if (BARANGAY_ALIASES[key]) {
      hint.textContent = `Spelling alias matched: "${e.target.value}" will be saved under official barangay "${BARANGAY_ALIASES[key]}".`;
      hint.style.color = "var(--amber)";
    } else {
      hint.textContent = "Matches official PSGC barangay list and spelling aliases.";
      hint.style.color = "var(--muted)";
    }
  });

  document.getElementById("addFloodEpisodeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const minFt = document.getElementById("newFloodMinFt").value;
    const maxFt = document.getElementById("newFloodMaxFt").value;
    const depth = minFt === maxFt ? `${maxFt} ft` : `${minFt} to ${maxFt} ft`;
    store.addFloodEpisode({
      mun: document.getElementById("newFloodMuni").value,
      brgy: document.getElementById("newFloodBrgy").value,
      scope: document.getElementById("newFloodScope").value,
      sitios: document.getElementById("newFloodSitio").value,
      depth,
      status: document.getElementById("newFloodStatus").value
    });
    e.target.reset();
    showStatusToast("Added flood episode");
  });

  document.getElementById("demoCumDecreaseBtn").addEventListener("click", () => {
    const snap = store.getCurrentSnapshot();
    const cam = snap.lguRows.find(r => r.name === "Camiling");
    if (cam) {
      store.updateMuniCell(cam.id, "famCum", Math.max(0, cam.famCum - 50));
    }
  });

  document.getElementById("restoreCumDecreaseBtn").addEventListener("click", () => {
    const prevSnap = store.snapshots[store.getPreviousKey(store.currentKey)] || store.getCurrentSnapshot();
    const prevCam = prevSnap.lguRows.find(r => r.name === "Camiling");
    if (prevCam) {
      store.updateMuniCell(prevCam.id, "famCum", prevCam.famCum);
      showStatusToast("Restored previous cumulative figure");
    }
  });

  document.getElementById("opcenOfflineToggleBtn").addEventListener("click", (e) => {
    isOfflineSimulated = !isOfflineSimulated;
    e.currentTarget.innerHTML = isOfflineSimulated
      ? `<i class="ri-wifi-line"></i><span>Reconnect online</span>`
      : `<i class="ri-wifi-off-line"></i><span>Simulate offline mode</span>`;
    renderOpcenScreen();
  });

  document.getElementById("opcenPdfInput").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    document.getElementById("opcenPdfStatus").textContent = `Reading ${file.name}...`;
    const res = await scanSitrepPdfFile(file, store);
    document.getElementById("opcenPdfStatus").textContent = `Loaded Sitrep #${res.sitrepKey} (${res.pageCount} pages)`;
    showStatusToast(`Loaded Sitrep #${res.sitrepKey} from ${res.fileName}`);
  });

  const argCsvInput = document.getElementById("opcenArgCsvInput");
  if (argCsvInput) {
    argCsvInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const statusEl = document.getElementById("opcenArgCsvStatus");
      if (statusEl) statusEl.textContent = `Parsing ${file.name}...`;
      const res = await parseArgCsvFile(file);
      if (statusEl) statusEl.textContent = `${res.stationName}: ${res.totalMonthMm} mm (${res.dedupRows} readings)`;
      renderGovernorScreen();
      renderOpcenScreen();
      showStatusToast(`Imported ARG CSV: ${res.stationName} (${res.dedupRows} deduplicated readings)`);
    });
  }

  const pubModal = document.getElementById("publishModal");
  let isReviseFlow = false;

  document.getElementById("opcenPublishBtn").addEventListener("click", () => {
    if (isOfflineSimulated) {
      showStatusToast("Saved on this device, not yet synced. Connect to publish.");
      return;
    }
    isReviseFlow = false;
    const snap = store.getCurrentSnapshot();
    const t = snap.popTotals;
    const staleCount = store.getEpisodesForSitrep(snap).filter(e => e.needsVerification).length;
    document.getElementById("pubModalHeading").textContent = `Publish sitrep #${snap.updateNo}`;
    document.getElementById("pubModalBody").innerHTML = `
      <div><strong>Affected population:</strong> ${fmtNum(t[2])} persons, ${fmtNum(t[1])} families across ${fmtNum(t[0])} barangays.</div>
      <div><strong>Evacuation centers:</strong> ${fmtNum(t[9])} persons inside ${fmtNum(t[5])} centers.</div>
      <div><strong>Open warnings:</strong> ${staleCount} flood episode needs verification.</div>
    `;
    document.getElementById("reviseInputWrap").classList.add("hidden");
    pubModal.classList.remove("hidden");
  });

  document.getElementById("opcenReviseBtn").addEventListener("click", () => {
    isReviseFlow = true;
    const snap = store.getCurrentSnapshot();
    document.getElementById("pubModalHeading").textContent = `Revise published sitrep #${snap.updateNo}`;
    document.getElementById("pubModalBody").textContent = "A published sitrep is locked. Enter a change note to record why this sitrep is being revised.";
    document.getElementById("reviseInputWrap").classList.remove("hidden");
    pubModal.classList.remove("hidden");
  });

  document.getElementById("cancelPubModalBtn").addEventListener("click", () => {
    pubModal.classList.add("hidden");
  });

  document.getElementById("confirmPubModalBtn").addEventListener("click", async () => {
    const snap = store.getCurrentSnapshot();
    if (isReviseFlow) {
      const note = document.getElementById("reviseNoteField").value.trim();
      if (!note) {
        showStatusToast("Enter a change note before revising.");
        return;
      }
      store.markRevised(note);
      try {
        await syncCurrentEventToFirebase();
      } catch (error) {
        showStatusToast(`Could not sync revision: ${error.message}`);
        return;
      }
      pubModal.classList.add("hidden");
      showStatusToast(`Sitrep #${snap.updateNo} marked as Revised`);
    } else {
      try {
        await syncCurrentEventToFirebase(true);
        await refreshFirebaseEventOptions(true);
      } catch (error) {
        showStatusToast(`Could not publish to Firebase: ${error.message}`);
        return;
      }
      pubModal.classList.add("hidden");
      document.getElementById("opcenLockedBadge").classList.remove("hidden");
      document.getElementById("opcenReviseBtn").classList.remove("hidden");
      document.getElementById("newSitrepNoticeText").textContent = `Sitrep #${snap.updateNo} published.`;
      document.getElementById("newSitrepNoticeBar").classList.remove("hidden");
      showStatusToast(`Published Sitrep #${snap.updateNo}`);
    }
  });

  document.getElementById("viewNewSitrepBtn").addEventListener("click", () => {
    document.getElementById("newSitrepNoticeBar").classList.add("hidden");
    navGovBtn.click();
  });

  document.getElementById("testSessionCueBtn").addEventListener("click", () => {
    document.getElementById("sessionWarnBar").classList.remove("hidden");
  });
  document.getElementById("dismissSessionBtn").addEventListener("click", () => {
    document.getElementById("sessionWarnBar").classList.add("hidden");
  });

  document.getElementById("closeDetailBtn").addEventListener("click", closeDetailPanel);
  document.getElementById("detailBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "detailBackdrop") closeDetailPanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDetailPanel();
  });

  const authStatus = document.getElementById("firebaseAuthStatus");
  const signInBtn = document.getElementById("firebaseSignInBtn");
  const signOutBtn = document.getElementById("firebaseSignOutBtn");
  const adminUidWrap = document.getElementById("firebaseAdminUidWrap");
  const adminUid = document.getElementById("firebaseAdminUid");
  const firebaseRoleUidHint = document.getElementById("firebaseRoleUidHint");
  const opcenNav = document.getElementById("navOpcenBtn");
  const restoreLabel = document.getElementById("firebaseRestoreLabel");
  const backupStatus = document.getElementById("firebaseBackupStatus");
  const eventSelect = document.getElementById("firebaseEventSelect");
  const govEventSelect = document.getElementById("govEventSelect");
  const govFirebaseStatus = document.getElementById("govFirebaseStatus");
  const govBackupBtn = document.getElementById("govBackupBtn");
  const newEventBtn = document.getElementById("firebaseNewEventBtn");
  const nextSitrepBtn = document.getElementById("firebaseNextSitrepBtn");
  const saveDraftBtn = document.getElementById("firebaseSaveDraftBtn");

  async function syncCurrentEventToFirebase(publish = false) {
    if (!window.pdrrmoFirebaseAdmin) throw new Error("Sign in as an approved administrator first.");
    if (publish) {
      store.markCurrentSitrepPublished();
    }
    const event = store.exportEventData();
    await importBackupToFirebase({
      schemaVersion: BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      events: [event]
    });
  }

  async function refreshFirebaseEventOptions(admin = false) {
    try {
      const events = await listPortalEvents(admin);
      const options = events.length ? events : [{
        id: store.activeEventId,
        name: store.activeEventName
      }];
      eventSelect.replaceChildren();
      govEventSelect.replaceChildren();
      options.forEach(event => {
        const option = document.createElement("option");
        option.value = event.id;
        option.textContent = event.name || event.id;
        eventSelect.append(option);
        govEventSelect.append(option.cloneNode(true));
      });
      eventSelect.value = options.some(event => event.id === store.activeEventId)
        ? store.activeEventId
        : options[0].id;
      govEventSelect.value = eventSelect.value;
      if (events.length) {
        const event = await loadPortalEvent(eventSelect.value, admin);
        store.setEventArchive(event);
        backupStatus.textContent = `Loaded ${event.name} from Firebase`;
      } else if (!events.length) {
        backupStatus.textContent = "Using bundled archive; no Firebase event has been imported yet.";
      }
    } catch (error) {
      backupStatus.textContent = `Firebase archive unavailable: ${error.message}`;
    }
  }

  signInBtn.addEventListener("click", async () => {
    try {
      await signInAdmin();
    } catch (error) {
      authStatus.textContent = `Sign-in failed: ${error.message}`;
    }
  });
  signOutBtn.addEventListener("click", async () => {
    try { await signOutUser(); }
    catch (error) { authStatus.textContent = `Sign-out failed: ${error.message}`; }
  });

  document.getElementById("specialOperationsSignInBtn").addEventListener("click", async () => {
    try { await signInAdmin(); }
    catch (error) { setSpecialOperationsStatus(`Google sign-in failed: ${error.message}`, "error"); }
  });
  document.getElementById("specialOperationJsonInput").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    specialOperationsPending = null;
    const preview = document.getElementById("specialOperationPreview");
    const publishButton = document.getElementById("specialOperationPublishBtn");
    const fileLabel = document.getElementById("specialOperationFileLabel");
    document.getElementById("specialOperationsStatus").classList.add("hidden");
    if (!file) {
      preview.classList.add("hidden");
      publishButton.disabled = true;
      fileLabel.textContent = "Choose JSON from this computer";
      return;
    }
    fileLabel.textContent = file.name;
    try {
      const payload = validateDeploymentExport(JSON.parse(await file.text()));
      specialOperationsPending = { file, payload };
      document.getElementById("specialOperationPreviewFile").textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
      document.getElementById("specialOperationPreviewState").textContent = "JSON validated";
      document.getElementById("specialOperationPreviewCounts").innerHTML = [
        [payload.pins.length, "Deployments"], [payload.agencies.length, "Agencies"], [payload.incidents.length, "Incidents"]
      ].map(([count, label]) => `<div class="rounded-lg p-2.5" style="background:var(--bg-card);border:1px solid var(--border)"><div class="text-lg font-bold">${Number(count).toLocaleString("en-US")}</div><div class="text-[10px]" style="color:var(--muted)">${label}</div></div>`).join("");
      const existingName = document.getElementById("specialOperationName").value.trim();
      if (!existingName && payload.operationTitle && payload.operationTitle !== "Area Assignment & Deployment Plan") {
        document.getElementById("specialOperationName").value = payload.operationTitle;
      }
      preview.classList.remove("hidden");
      const notice = document.getElementById("specialOperationUploadNotice");
      notice.classList.add("hidden");
      publishButton.disabled = !document.getElementById("specialOperationName").value.trim();
      const uploadNotes = [];
      if (payload.incidents.some(record => record.reporterName || record.reporterContact)
        || payload.pins.some(record => record.focalPerson || record.contactNumber)) {
        uploadNotes.push("This file contains staff or reporter contact details. Only approved viewers and portal administrators can access the published records.");
      }
      if (!Array.isArray(payload.standaloneAssets)) {
        uploadNotes.push("This desktop app export does not include separately dropped tactical assets. Pins and incident records in this file are included.");
      }
      if (uploadNotes.length) {
        notice.textContent = uploadNotes.join(" ");
        notice.style.backgroundColor = "var(--amber-bg)";
        notice.style.color = "var(--amber)";
        notice.classList.remove("hidden");
      }
    } catch (error) {
      preview.classList.add("hidden");
      setSpecialOperationsStatus(error.message, "error");
    }
  });
  document.getElementById("specialOperationName").addEventListener("input", event => {
    document.getElementById("specialOperationPublishBtn").disabled = !specialOperationsPending || !event.target.value.trim();
  });
  document.getElementById("specialOperationPublishBtn").addEventListener("click", async event => {
    if (!window.pdrrmoFirebaseAdmin || !specialOperationsPending) return;
    const button = event.currentTarget;
    const name = document.getElementById("specialOperationName").value.trim();
    let operationId;
    try { operationId = operationIdFromName(name); }
    catch (error) { setSpecialOperationsStatus(error.message, "error"); return; }
    const existing = availableSpecialOperations.find(operation => operation.id === operationId);
    const action = existing
      ? `This will publish a new version of “${name}”. The previous version will remain in the archive, and this version will become the one viewers see.`
      : `Publish “${name}” for approved viewers? The uploaded map and records will be read-only in the viewer.`;
    if (!window.confirm(`${action}\n\n${specialOperationsPending.payload.pins.length} deployments · ${specialOperationsPending.payload.agencies.length} agencies · ${specialOperationsPending.payload.incidents.length} incidents`)) return;

    button.disabled = true;
    button.innerHTML = `<i class="ri-loader-4-line animate-spin"></i><span>Publishing version…</span>`;
    try {
      const result = await publishSpecialOperation({
        operationId,
        name,
        period: document.getElementById("specialOperationPeriod").value,
        sourceFileName: specialOperationsPending.file.name,
        payload: specialOperationsPending.payload
      });
      setSpecialOperationsStatus(`Published ${name} · version ${result.versionCount}. Approved viewers can now open it.`, "success");
      specialOperationsPending = null;
      document.getElementById("specialOperationJsonInput").value = "";
      document.getElementById("specialOperationFileLabel").textContent = "Choose JSON from this computer";
      document.getElementById("specialOperationPreview").classList.add("hidden");
      document.getElementById("specialOperationName").value = "";
      document.getElementById("specialOperationPeriod").value = "";
      await refreshSpecialOperations(true, true, result.operationId);
      showStatusToast(`Published ${name} for governor view.`);
    } catch (error) {
      setSpecialOperationsStatus(`Could not publish this upload: ${error.message}`, "error");
    } finally {
      button.disabled = !specialOperationsPending || !document.getElementById("specialOperationName").value.trim();
      button.innerHTML = `<i class="ri-cloud-line"></i><span>Publish this version</span>`;
    }
  });
  document.getElementById("specialOperationsSelect").addEventListener("change", async event => {
    try {
      const operation = await loadSpecialOperation(event.target.value);
      document.getElementById("specialOpsSearch").value = "";
      document.getElementById("specialOpsPinDetail").classList.add("hidden");
      document.getElementById("specialOpsIncidentDetail").classList.add("hidden");
      renderSpecialOperationsDashboard(operation);
    } catch (error) {
      setSpecialOperationsStatus(`Could not open this operation: ${error.message}`, "error");
    }
  });
  document.getElementById("specialOpsSearch").addEventListener("input", () => {
    if (specialOperationsCurrent) renderSpecialOperationsDashboard(specialOperationsCurrent);
  });

  watchAuth(async user => {
    signInBtn.classList.toggle("hidden", Boolean(user));
    signOutBtn.classList.toggle("hidden", !user);
    adminUidWrap.classList.toggle("hidden", !user);
    adminUid.textContent = user?.uid || "";
    window.pdrrmoFirebaseAdmin = false;
    window.pdrrmoSpecialOperationsViewer = false;
    let admin = false;
    let operationViewer = false;
    if (user) {
      authStatus.textContent = `Signed in: ${user.email || "Google account"}`;
      try { admin = await isPortalAdmin(user); }
      catch (error) { authStatus.textContent = `Signed in; Firebase setup pending: ${error.message}`; }
      try { operationViewer = await isSpecialOperationsViewer(user, admin); }
      catch (error) { setSpecialOperationsStatus(`Could not check approved viewer access: ${error.message}`, "error"); }
      if (!admin) {
        authStatus.textContent = operationViewer
          ? `Signed in: ${user.email || "Google account"} · approved governor view`
          : "Signed in, but this account is not enabled as a portal administrator or special operations viewer.";
      }
      firebaseRoleUidHint.innerHTML = admin
        ? "This account has portal administrator access."
        : operationViewer
          ? `For future access changes, use <code>operationViewers/{uid}</code> with <code>enabled: true</code>.`
          : `Ask the Firebase project owner to add this UID to <code>admins/{uid}</code> or <code>operationViewers/{uid}</code> with <code>enabled: true</code>.`;
    } else {
      authStatus.textContent = "Public view · sign-in available for staff and approved viewers";
    }
    window.pdrrmoFirebaseAdmin = admin;
    window.pdrrmoSpecialOperationsViewer = operationViewer;
    opcenNav.classList.toggle("hidden", !admin);
    restoreLabel.classList.toggle("hidden", !admin);
    newEventBtn.classList.toggle("hidden", !admin);
    nextSitrepBtn.classList.toggle("hidden", !admin);
    saveDraftBtn.classList.toggle("hidden", !admin);
    if (!admin) {
      if (specialOperationsScreen.classList.contains("hidden")) {
        document.getElementById("govScreen").classList.remove("hidden");
        document.getElementById("opcenScreen").classList.add("hidden");
        document.getElementById("navGovBtn").classList.add("is-active");
        navSpecialOpsBtn.classList.remove("is-active");
      }
      opcenNav.classList.remove("is-active");
    }
    specialOperationsViewer = operationViewer;
    if (!specialOperationsScreen.classList.contains("hidden")) {
      await refreshSpecialOperations(admin, operationViewer);
    }
    await refreshFirebaseEventOptions(admin);
    govFirebaseStatus.textContent = backupStatus.textContent;
  });

  eventSelect.addEventListener("change", async () => {
    if (eventSelect.value === store.activeEventId) return;
    try {
      const event = await loadPortalEvent(eventSelect.value, Boolean(window.pdrrmoFirebaseAdmin));
      store.setEventArchive(event);
      govEventSelect.value = eventSelect.value;
      backupStatus.textContent = `Loaded ${event.name} from Firebase`;
    } catch (error) {
      showStatusToast(`Could not load event: ${error.message}`);
    }
  });

  govEventSelect.addEventListener("change", async () => {
    if (govEventSelect.value === store.activeEventId) return;
    try {
      const admin = Boolean(window.pdrrmoFirebaseAdmin);
      const event = await loadPortalEvent(govEventSelect.value, admin);
      store.setEventArchive(event);
      eventSelect.value = govEventSelect.value;
      backupStatus.textContent = "Loaded " + event.name + " from Firebase";
      govFirebaseStatus.textContent = backupStatus.textContent;
    } catch (error) {
      showStatusToast("Could not load event: " + error.message);
    }
  });

  newEventBtn.addEventListener("click", () => {
    if (!window.pdrrmoFirebaseAdmin) return;
    const name = window.prompt("Enter the new disturbance or event name:");
    if (!name?.trim()) return;
    const dateStr = window.prompt("Enter the date of the first SITREP (for example, Nov 4, 2026):");
    if (!dateStr?.trim()) return;
    try {
      const event = store.createNewEvent(name.trim(), dateStr.trim());
      const option = document.createElement("option");
      option.value = event.id;
      option.textContent = event.name + " (draft on this device)";
      eventSelect.append(option);
      govEventSelect.append(option.cloneNode(true));
      eventSelect.value = event.id;
      govEventSelect.value = event.id;
      backupStatus.textContent = "New event draft created. Publish its first SITREP to make it public and save it to Firebase.";
      showStatusToast("Started a separate event archive.");
    } catch (error) {
      showStatusToast("Could not create event: " + error.message);
    }
  });

  nextSitrepBtn.addEventListener("click", () => {
    if (!window.pdrrmoFirebaseAdmin) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const dateStr = window.prompt("Enter the date for the next SITREP:", today);
    if (!dateStr?.trim()) return;
    const cutoff = window.prompt("Enter the SITREP cutoff time:", "6:00 PM");
    if (!cutoff?.trim()) return;
    const number = store.addNextSitrep(dateStr.trim(), cutoff.trim());
    backupStatus.textContent = "SitREP #" + number + " is a local draft. Publish it to save the update to Firebase.";
    showStatusToast("Created draft SitREP #" + number + ".");
  });

  saveDraftBtn.addEventListener("click", async () => {
    try {
      if (!window.pdrrmoFirebaseAdmin) throw new Error("Sign in with an enabled administrator account first.");
      await syncCurrentEventToFirebase(false);
      await refreshFirebaseEventOptions(true);
      backupStatus.textContent = "Draft saved to Firebase. It remains hidden from public viewers until published.";
      showStatusToast("Saved draft to Firebase.");
    } catch (error) {
      showStatusToast("Could not save draft: " + error.message);
    }
  });

  document.getElementById("firebaseBackupBtn").addEventListener("click", async () => {
    try {
      const admin = Boolean(window.pdrrmoFirebaseAdmin);
      const eventSummaries = await listPortalEvents(admin);
      const events = [];
      for (const summary of eventSummaries) events.push(await loadPortalEvent(summary.id, admin));
      if (!events.length) events.push(store.exportEventData());
      downloadBackup({
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        events: events.map(({ id, name, status, visibility, draftReportKeys, reports, floodEpisodes }) => ({
          id, name, status, visibility, draftReportKeys, reports, floodEpisodes
        }))
      }, `pdrrmo-sitrep-backup-${new Date().toISOString().slice(0, 10)}.json`);
      backupStatus.textContent = `Downloaded JSON backup for ${events.length} event(s).`;
    } catch (error) {
      const event = store.exportEventData();
      downloadBackup({
        schemaVersion: BACKUP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        events: [event]
      }, `pdrrmo-sitrep-backup-${new Date().toISOString().slice(0, 10)}.json`);
      backupStatus.textContent = `Downloaded current event backup. Firebase list error: ${error.message}`;
    }
  });
  govBackupBtn.addEventListener("click", () => {
    document.getElementById("firebaseBackupBtn").click();
    govFirebaseStatus.textContent = "Preparing JSON backup…";
    window.setTimeout(() => {
      govFirebaseStatus.textContent = backupStatus.textContent;
    }, 800);
  });

  document.getElementById("firebaseRestoreInput").addEventListener("change", async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (!window.pdrrmoFirebaseAdmin) throw new Error("Sign in with an enabled administrator account before restoring.");
      const backup = validateBackup(JSON.parse(await file.text()));
      const summary = backup.events.map(item => `${item.name || item.id}: ${Object.keys(item.reports).length} reports`).join("\n");
      if (!window.confirm(`Restore or update these Firebase event records? Existing matching records will be updated.\n\n${summary}`)) return;
      const count = await importBackupToFirebase(backup);
      await refreshFirebaseEventOptions(true);
      backupStatus.textContent = `Restored ${count} event(s) to Firebase.`;
    } catch (error) {
      backupStatus.textContent = `Restore failed: ${error.message}`;
    } finally {
      event.target.value = "";
    }
  });

  renderGovernorScreen();
  renderOpcenScreen();
});
