// src/services/store.js
import { BASE_LGUS, RAW_ARCHIVE, FLOOD_TIMELINE_EPISODES, BARANGAY_ALIASES } from "../data/sitrepArchive.js";

const STORAGE_KEY_EPISODES = "pdrrmo_tarlac_flood_episodes_v1";
const STORAGE_KEY_BASELINE = "pdrrmo_tarlac_flood_baseline_v1";
const LEGACY_EVENT_ID = "2026-sw-monsoon-luis-maymay";

export function parseReadingTimeMs(timeStr) {
  if (!timeStr) return 0;
  const cleaned = String(timeStr).replace(/\s+at\s+/i, " ").trim();
  const ms = Date.parse(cleaned);
  if (!Number.isNaN(ms)) return ms;
  const parts = cleaned.split(",");
  if (parts.length >= 2) {
    const fallbackMs = Date.parse(`${parts[0]}, ${parts[1]}`);
    if (!Number.isNaN(fallbackMs)) return fallbackMs;
  }
  return 0;
}

export function sortReadingsChronologicalDesc(readings) {
  return readings.slice().sort((a, b) => parseReadingTimeMs(b.time) - parseReadingTimeMs(a.time));
}

function buildSnapshot(key, raw, prevSnapshot) {
  const lguMap = raw.lguPop || {};
  const floodMap = raw.muniFloodCounts || {};

  const lguRows = BASE_LGUS.map(m => {
    const arr = lguMap[m.name] || [0, 0, 0, 0, 0, "-", 0, 0, 0, 0, 0];
    const prevRow = prevSnapshot ? prevSnapshot.lguRows.find(r => r.id === m.id) : null;

    const brgys = Number(arr[0] || 0);
    const famCum = Number(arr[1] || 0);
    const persCum = Number(arr[2] || 0);
    const servFam = Number(arr[3] || 0);
    const servPers = Number(arr[4] || 0);
    const ecState = String(arr[5] || "-");
    const ecCount = Number(arr[6] || 0);
    const ecFamCum = Number(arr[7] || 0);
    const ecFamNow = Number(arr[8] || 0);
    const ecPersCum = Number(arr[9] || 0);
    const ecPersNow = Number(arr[10] || 0);
    const activeFloods = Number(floodMap[m.name] || 0);

    let carriedOverSince = null;
    if (m.name === "Camiling" && Number(key) >= 10 && servFam === 130 && servPers === 393) {
      carriedOverSince = 3;
    }

    let figuresPending = false;
    if (prevRow && brgys > prevRow.brgys && famCum === prevRow.famCum && persCum === prevRow.persCum) {
      figuresPending = true;
    }

    return {
      ...m,
      brgys,
      famCum,
      persCum,
      servFam,
      servPers,
      ecState,
      ecCount,
      ecFamCum,
      ecFamNow,
      ecPersCum,
      ecPersNow,
      activeFloods,
      carriedOverSince,
      figuresPending
    };
  });

  const calcTotals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  lguRows.forEach(r => {
    calcTotals[0] += r.brgys;
    calcTotals[1] += r.famCum;
    calcTotals[2] += r.persCum;
    calcTotals[3] += r.servFam;
    calcTotals[4] += r.servPers;
    calcTotals[5] += r.ecCount;
    calcTotals[6] += r.ecFamCum;
    calcTotals[7] += r.ecFamNow;
    calcTotals[8] += r.ecPersCum;
    calcTotals[9] += r.ecPersNow;
  });

  return {
    key: String(key),
    updateNo: Number(raw.updateNo || key),
    dateStr: raw.dateStr || "Sep 14, 2026",
    cutoffTime: raw.cutoffTime || "6:00 PM",
    popSource: raw.popSource || `PSWDO / DSWD Disaster Monitoring Report (${raw.dateStr})`,
    floodSource: raw.floodSource || `LDRRMOs (${raw.dateStr})`,
    agriSource: raw.agriSource || `DA-OPA Damage Assessment Report (${raw.dateStr})`,
    popTotals: calcTotals,
    publishedTotals: raw.popTotals || calcTotals,
    lguRows,
    agriTotalPhp: Number(raw.agriTotalPhp || 0),
    infraTotalPhp: Number(raw.infraTotalPhp || 0),
    dead: Number(raw.dead || 0),
    injured: Number(raw.injured || 0),
    missing: Number(raw.missing || 0),
    housesTotally: Number(raw.housesTotally || 0),
    housesPartially: Number(raw.housesPartially || 0),
    assistTotalPhp: Number(raw.assistTotalPhp || 0),
    revised: Boolean(raw.revised),
    revisionNote: raw.revisionNote || ""
  };
}

class SitrepStore {
  constructor() {
    this.listeners = [];
    this.activeEventId = LEGACY_EVENT_ID;
    this.activeEventName = "Enhanced Southwest Monsoon and Tropical Cyclones Luis and Maymay (2026)";
    this.activeEventStatus = "closed";
    this.activeEventVisibility = "public";
    this.draftReportKeys = [];
    this.baseFloodEpisodes = JSON.parse(JSON.stringify(FLOOD_TIMELINE_EPISODES));
    this.rawArchive = RAW_ARCHIVE;
    this.snapshots = {};
    this.initSnapshots();
    const keys = this.getSortedKeys();
    this.currentKey = keys[keys.length - 1] || "31";
    this.compareKey = keys.length > 1 ? keys[keys.length - 2] : this.currentKey;
    this.districtFilter = "ALL";
    this.rankSort = "dist_grouped";
    this.activeStep = 1;
    this.floodEpisodes = this.loadSavedEpisodes();
    this.cumDecreaseError = null;
    this.lastSavedTime = "5:42 PM";
  }

  loadSavedEpisodes() {
    try {
      const suffix = this.activeEventId === LEGACY_EVENT_ID ? "" : `_${this.activeEventId}`;
      const saved = localStorage.getItem(`${STORAGE_KEY_EPISODES}${suffix}`);
      if (saved) return JSON.parse(saved);
      const customBase = localStorage.getItem(`${STORAGE_KEY_BASELINE}${suffix}`);
      if (customBase) return JSON.parse(customBase);
    } catch (e) {
      // ignore storage errors
    }
    return JSON.parse(JSON.stringify(FLOOD_TIMELINE_EPISODES));
  }

  persistEpisodes() {
    try {
      const suffix = this.activeEventId === LEGACY_EVENT_ID ? "" : `_${this.activeEventId}`;
      localStorage.setItem(`${STORAGE_KEY_EPISODES}${suffix}`, JSON.stringify(this.floodEpisodes));
    } catch (e) {
      // ignore storage errors
    }
  }

  // Saves current state as the new baseline so "Reset edits" returns to THIS state
  saveCurrentAsBaseline() {
    try {
      const suffix = this.activeEventId === LEGACY_EVENT_ID ? "" : `_${this.activeEventId}`;
      localStorage.setItem(`${STORAGE_KEY_BASELINE}${suffix}`, JSON.stringify(this.floodEpisodes));
      localStorage.setItem(`${STORAGE_KEY_EPISODES}${suffix}`, JSON.stringify(this.floodEpisodes));
    } catch (e) {
      // ignore
    }
    this.touchSaved();
    this.notify();
  }

  // Resets to your saved baseline (or factory archive if no custom baseline was saved)
  resetFloodEpisodesToDefault(forceFactory = false) {
    if (forceFactory) {
      try {
        const suffix = this.activeEventId === LEGACY_EVENT_ID ? "" : `_${this.activeEventId}`;
        localStorage.removeItem(`${STORAGE_KEY_EPISODES}${suffix}`);
        localStorage.removeItem(`${STORAGE_KEY_BASELINE}${suffix}`);
      } catch (e) {}
      this.floodEpisodes = JSON.parse(JSON.stringify(this.baseFloodEpisodes));
    } else {
      let base = null;
      try {
        const suffix = this.activeEventId === LEGACY_EVENT_ID ? "" : `_${this.activeEventId}`;
        const customBase = localStorage.getItem(`${STORAGE_KEY_BASELINE}${suffix}`);
        if (customBase) base = JSON.parse(customBase);
      } catch (e) {}
      this.floodEpisodes = base || JSON.parse(JSON.stringify(this.baseFloodEpisodes));
      this.persistEpisodes();
    }
    this.cumDecreaseError = null;
    this.touchSaved();
    this.notify();
  }

  initSnapshots() {
    const sortedKeys = Object.keys(this.rawArchive).sort((a, b) => Number(a) - Number(b));
    let prev = null;
    sortedKeys.forEach(k => {
      const snap = buildSnapshot(k, this.rawArchive[k], prev);
      this.snapshots[k] = snap;
      prev = snap;
    });
  }

  getSortedKeys() {
    return Object.keys(this.snapshots).sort((a, b) => Number(a) - Number(b));
  }

  getRawEntry(key = this.currentKey) {
    return this.rawArchive[String(key)] || {};
  }

  setEventArchive(event) {
    if (!event?.id || !event.reports || typeof event.reports !== "object") {
      throw new Error("The event does not contain a valid report archive.");
    }
    const reportKeys = Object.keys(event.reports);
    if (!reportKeys.length) throw new Error("The event has no SITREP records.");
    this.activeEventId = String(event.id);
    this.activeEventName = event.name || String(event.id);
    this.activeEventStatus = event.status || "active";
    this.activeEventVisibility = event.visibility || "public";
    this.draftReportKeys = Array.isArray(event.draftReportKeys) ? [...event.draftReportKeys].map(String) : [];
    this.rawArchive = event.reports;
    this.baseFloodEpisodes = JSON.parse(JSON.stringify(event.floodEpisodes || []));
    this.snapshots = {};
    this.initSnapshots();
    const keys = this.getSortedKeys();
    this.currentKey = keys[keys.length - 1];
    this.compareKey = keys.length > 1 ? keys[keys.length - 2] : this.currentKey;
    this.floodEpisodes = Array.isArray(event.floodEpisodes)
      ? JSON.parse(JSON.stringify(event.floodEpisodes))
      : [];
    this.cumDecreaseError = null;
    this.notify();
  }

  exportEventData() {
    const reports = JSON.parse(JSON.stringify(this.rawArchive));
    Object.keys(this.snapshots).forEach(key => {
      const snap = this.snapshots[key];
      const raw = reports[key] || {};
      raw.lguPop = Object.fromEntries(snap.lguRows.map(row => [row.name, [
        row.brgys, row.famCum, row.persCum, row.servFam, row.servPers,
        row.ecState, row.ecCount, row.ecFamCum, row.ecFamNow, row.ecPersCum, row.ecPersNow
      ]]));
      raw.popTotals = snap.popTotals;
      raw.revised = snap.revised;
      raw.revisionNote = snap.revisionNote;
      reports[key] = raw;
    });
    return {
      id: this.activeEventId,
      name: this.activeEventName,
      status: this.activeEventStatus,
      visibility: this.activeEventVisibility,
      draftReportKeys: [...this.draftReportKeys],
      reports,
      floodEpisodes: JSON.parse(JSON.stringify(this.floodEpisodes))
    };
  }

  createNewEvent(name, dateStr) {
    const slug = String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
    const eventId = slug + "-" + Date.now().toString(36);
    const emptyRow = [0, 0, 0, 0, 0, "-", 0, 0, 0, 0, 0];
    const blankReport = {
      updateNo: 1,
      dateStr,
      cutoffTime: "6:00 PM",
      popSource: "PSWDO Disaster Monitoring Report as of " + dateStr,
      floodSource: "LDRRMOs as of " + dateStr,
      agriSource: "DA-OPA Damage Assessment Report as of " + dateStr,
      popTotals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      lguPop: Object.fromEntries(BASE_LGUS.map(m => [m.name, [...emptyRow]])),
      muniFloodCounts: {},
      agriRows: [
        { commodity: "RICE", lgus: "0", farmers: "0", partialHa: "0", totalHa: "0", valuePhp: 0 },
        { commodity: "CORN", lgus: "0", farmers: "0", partialHa: "0", totalHa: "0", valuePhp: 0 },
        { commodity: "TOTAL", lgus: "0", farmers: "0", partialHa: "0", totalHa: "0", valuePhp: 0 }
      ],
      agriTotalPhp: 0,
      infraTotalPhp: 0,
      dead: 0,
      injured: 0,
      missing: 0,
      housesTotally: 0,
      housesPartially: 0,
      assistCols: [0, 0, 0, 0, 0, 0],
      assistTotalPhp: 0,
      assistByLgu: {}
    };
    const event = {
      id: eventId,
      name: name.trim(),
      status: "draft",
      visibility: "private",
      draftReportKeys: ["1"],
      reports: { "1": blankReport },
      floodEpisodes: []
    };
    this.setEventArchive(event);
    return event;
  }

  addNextSitrep(dateStr, cutoffTime = "6:00 PM") {
    const keys = this.getSortedKeys();
    const previousKey = keys[keys.length - 1];
    const previous = this.rawArchive[previousKey];
    const nextNo = Math.max(...keys.map(key => Number(this.rawArchive[key]?.updateNo || key))) + 1;
    const raw = JSON.parse(JSON.stringify(previous));
    raw.updateNo = nextNo;
    raw.dateStr = dateStr;
    raw.cutoffTime = cutoffTime;
    raw.popSource = "PSWDO / DSWD Disaster Monitoring Report as of " + dateStr;
    raw.floodSource = "LDRRMOs as of " + dateStr;
    raw.agriSource = "DA-OPA Damage Assessment Report as of " + dateStr;
    raw.revised = false;
    raw.revisionNote = "";
    this.rawArchive = { ...this.rawArchive, [String(nextNo)]: raw };
    this.draftReportKeys = [...new Set([...this.draftReportKeys, String(nextNo)])];
    this.snapshots = {};
    this.initSnapshots();
    this.currentKey = String(nextNo);
    this.compareKey = previousKey;
    this.notify();
    return nextNo;
  }

  markCurrentSitrepPublished() {
    this.draftReportKeys = this.draftReportKeys.filter(key => key !== String(this.currentKey));
    if (this.activeEventStatus === "draft") this.activeEventStatus = "active";
    this.activeEventVisibility = "public";
  }

  updateReportSummary(values) {
    const raw = this.rawArchive[String(this.currentKey)];
    const snap = this.getCurrentSnapshot();
    if (!raw || !snap) return;
    ["dead", "injured", "missing", "housesTotally", "housesPartially", "infraTotalPhp", "assistTotalPhp"]
      .forEach(field => {
        const value = Number(values[field]);
        if (!Number.isFinite(value) || value < 0) return;
        raw[field] = value;
        snap[field] = value;
      });
    this.touchSaved();
    this.notify();
  }

  getCurrentSnapshot() {
    return this.snapshots[this.currentKey];
  }

  getCompareSnapshot() {
    return this.snapshots[this.compareKey] || this.getCurrentSnapshot();
  }

  getPreviousKey(key) {
    const keys = this.getSortedKeys();
    const idx = keys.indexOf(String(key));
    return idx > 0 ? keys[idx - 1] : keys[0];
  }

  // Evaluates flood episodes strictly up to the selected SitRep cutoff date
  getEpisodesForSitrep(sitrepSnap) {
    const snap = sitrepSnap || this.getCurrentSnapshot();
    const cutoffMs = parseReadingTimeMs(`${snap.dateStr}, 11:59 PM`);

    return this.floodEpisodes.map(ep => {
      const sortedAll = sortReadingsChronologicalDesc(ep.readings);
      const validReadings = cutoffMs > 0
        ? sortedAll.filter(r => parseReadingTimeMs(r.time) <= cutoffMs)
        : sortedAll;

      const effectiveReadings = validReadings.length > 0 ? validReadings : sortedAll.slice(-1);
      const latest = effectiveReadings[0];
      const latestDateParts = latest ? latest.time.split(",") : [];
      const latestDateOnly = latestDateParts.length >= 2
        ? `${latestDateParts[0].trim()}, ${latestDateParts[1].trim()}`
        : ep.lastVerified;

      let maxFt = 0;
      effectiveReadings.forEach(r => {
        const matches = String(r.depth).match(/(\d+(\.\d+)?)/g);
        if (matches) {
          const rMax = Math.max(...matches.map(Number));
          if (rMax > maxFt) maxFt = rMax;
        }
      });
      if (maxFt === 0) maxFt = ep.peakFt;

      // If a reading was logged on the current SitRep date, it is verified!
      const verifiedOnOrAfterAug25 = parseReadingTimeMs(latestDateOnly) > parseReadingTimeMs("Aug 24, 2026");

      return {
        ...ep,
        currentFt: latest ? latest.depth : ep.currentFt,
        status: latest ? (latest.status === "Flooded" ? "Still Flooded" : latest.status) : ep.status,
        lastVerified: latestDateOnly,
        needsVerification: verifiedOnOrAfterAug25 ? false : ep.needsVerification,
        peakFt: maxFt,
        readings: effectiveReadings,
        allReadingsCount: sortedAll.length
      };
    });
  }

  setSitrep(key) {
    if (!this.snapshots[key]) return;
    this.currentKey = String(key);
    this.compareKey = this.getPreviousKey(this.currentKey);
    this.notify();
  }

  setCompareSitrep(key) {
    if (!this.snapshots[key]) return;
    this.compareKey = String(key);
    this.notify();
  }

  updateMuniCell(muniId, field, value) {
    const snap = this.getCurrentSnapshot();
    const prevKey = this.getPreviousKey(this.currentKey);
    const prevSnap = this.snapshots[prevKey];
    const row = snap.lguRows.find(r => r.id === Number(muniId));
    if (!row) return;

    const numVal = Math.max(0, Number(value || 0));
    const prevRow = prevSnap ? prevSnap.lguRows.find(r => r.id === Number(muniId)) : null;

    if (prevRow && (field === "famCum" || field === "persCum" || field === "ecFamCum" || field === "ecPersCum")) {
      if (numVal < prevRow[field]) {
        this.cumDecreaseError = `${row.name}: Cumulative cannot go down (${numVal.toLocaleString()} is lower than Sitrep #${prevSnap.updateNo}'s ${prevRow[field].toLocaleString()}). Check this entry.`;
      } else {
        this.cumDecreaseError = null;
      }
    }

    row[field] = numVal;
    row.ecState = row.ecCount > 0 ? "ACTIVE" : (row.ecPersCum > 0 ? "CLOSED" : "-");

    const calcTotals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    snap.lguRows.forEach(r => {
      calcTotals[0] += r.brgys;
      calcTotals[1] += r.famCum;
      calcTotals[2] += r.persCum;
      calcTotals[3] += r.servFam;
      calcTotals[4] += r.servPers;
      calcTotals[5] += r.ecCount;
      calcTotals[6] += r.ecFamCum;
      calcTotals[7] += r.ecFamNow;
      calcTotals[8] += r.ecPersCum;
      calcTotals[9] += r.ecPersNow;
    });
    snap.popTotals = calcTotals;
    this.touchSaved();
    this.notify();
  }

  updateFloodEpisodeStatus(epId, action, newDepthStr = null, newStatusStr = null) {
    const ep = this.floodEpisodes.find(e => e.id === epId);
    if (!ep) return;
    const snap = this.getCurrentSnapshot();
    const targetTimeStr = `${snap.dateStr}, ${snap.cutoffTime}`;

    const scopedEp = this.getEpisodesForSitrep(snap).find(e => e.id === epId) || ep;
    let statusLabel = scopedEp.status;
    let depthLabel = scopedEp.currentFt;

    if (action === "same") {
      ep.needsVerification = false;
      ep.lastVerified = snap.dateStr;
      statusLabel = scopedEp.status === "Still Flooded" ? "Flooded" : scopedEp.status;
      depthLabel = scopedEp.currentFt;
    } else if (action === "subsided") {
      ep.status = "Subsided";
      ep.currentFt = "0 ft";
      ep.needsVerification = false;
      ep.lastVerified = snap.dateStr;
      statusLabel = "Subsided";
      depthLabel = "0 ft";
    } else if (action === "update" && newDepthStr) {
      ep.currentFt = newDepthStr;
      if (newStatusStr) ep.status = newStatusStr;
      const matches = newDepthStr.match(/(\d+(\.\d+)?)/g);
      if (matches) {
        const maxEntered = Math.max(...matches.map(Number));
        if (maxEntered > ep.peakFt) ep.peakFt = maxEntered;
      }
      ep.needsVerification = false;
      ep.lastVerified = snap.dateStr;
      statusLabel = ep.status === "Still Flooded" ? "Flooded" : ep.status;
      depthLabel = newDepthStr;
    }

    // Sync flooded municipality count on the current SitRep snapshot when status changes
    const muniRow = snap.lguRows.find(r => r.name === ep.mun);
    if (muniRow) {
      if (statusLabel === "Subsided" && scopedEp.status !== "Subsided") {
        muniRow.activeFloods = Math.max(0, (muniRow.activeFloods || 1) - 1);
      } else if (statusLabel !== "Subsided" && scopedEp.status === "Subsided") {
        muniRow.activeFloods = (muniRow.activeFloods || 0) + 1;
      }
    }

    const existingIdx = ep.readings.findIndex(r => r.time.startsWith(snap.dateStr));
    const readingObj = {
      time: targetTimeStr,
      depth: depthLabel,
      status: statusLabel,
      source: `${ep.mun} MDRRMO`
    };

    if (existingIdx !== -1) {
      ep.readings[existingIdx] = readingObj;
    } else {
      ep.readings.push(readingObj);
    }

    ep.readings = sortReadingsChronologicalDesc(ep.readings);
    this.persistEpisodes();
    this.touchSaved();
    this.notify();
  }

  deleteFloodReadingByTime(epId, timeStr) {
    const ep = this.floodEpisodes.find(e => e.id === epId);
    if (!ep || ep.readings.length <= 1) return false;
    const idx = ep.readings.findIndex(r => r.time === timeStr);
    if (idx === -1) return false;
    ep.readings.splice(idx, 1);
    ep.readings = sortReadingsChronologicalDesc(ep.readings);
    const latest = ep.readings[0];
    if (latest) {
      ep.currentFt = latest.depth;
      ep.status = latest.status === "Flooded" ? "Still Flooded" : latest.status;
      const p = latest.time.split(",");
      ep.lastVerified = p.length >= 2 ? `${p[0].trim()}, ${p[1].trim()}` : latest.time;
    }
    this.persistEpisodes();
    this.touchSaved();
    this.notify();
    return true;
  }

  addFloodEpisode({ mun, brgy, scope, sitios, depth, status }) {
    const snap = this.getCurrentSnapshot();
    const normalizedKey = brgy.trim().toLowerCase();
    const canonicalBrgy = BARANGAY_ALIASES[normalizedKey] || brgy.trim();

    let existing = this.floodEpisodes.find(
      e => e.mun === mun && e.brgy.toLowerCase() === canonicalBrgy.toLowerCase()
    );

    const numMatches = String(depth).match(/(\d+(\.\d+)?)/g);
    const maxFt = numMatches ? Math.max(...numMatches.map(Number)) : 1.5;

    if (existing) {
      existing.status = status || "Still Flooded";
      existing.currentFt = depth;
      existing.peakFt = Math.max(existing.peakFt, maxFt);
      existing.lastVerified = snap.dateStr;
      existing.needsVerification = false;
      existing.segments.push({ startDay: 32, endDay: 38, peakFt: maxFt, label: `New wave (${maxFt} ft)` });
      this.updateFloodEpisodeStatus(existing.id, "update", depth, status || "Still Flooded");
    } else {
      this.floodEpisodes.unshift({
        id: "ep_" + Date.now(),
        mun,
        brgy: canonicalBrgy,
        scope: scope || "Portions of barangay",
        sitios: sitios || "Purok 1",
        peakFt: maxFt,
        currentFt: depth,
        status: status || "Still Flooded",
        lastVerified: snap.dateStr,
        needsVerification: false,
        firstSitrep: snap.updateNo,
        segments: [{ startDay: 34, endDay: 38, peakFt: maxFt, label: `${maxFt} ft peak` }],
        readings: [
          { time: `${snap.dateStr}, ${snap.cutoffTime}`, depth, status: status || "Flooded", source: `${mun} MDRRMO` }
        ]
      });
      this.persistEpisodes();
      this.touchSaved();
      this.notify();
    }
  }

  markRevised(note) {
    const snap = this.getCurrentSnapshot();
    snap.revised = true;
    snap.revisionNote = note;
    this.touchSaved();
    this.notify();
  }

  touchSaved() {
    const now = new Date();
    this.lastSavedTime = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }
}

export const store = new SitrepStore();
