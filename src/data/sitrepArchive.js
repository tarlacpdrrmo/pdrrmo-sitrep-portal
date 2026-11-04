// src/data/sitrepArchive.js
// Strictly the 25 Official PDF SitReps from sitrep-report-pdf.zip:
// #3, #6, #7, #8, #9, #10, #12, #13, #14, #15, #16, #17, #18, #20, #21, #22, #23, #24, #25, #26, #27, #28, #29, #30, #31

export const BASE_LGUS = [
  { id: 1, name: "Anao", dist: 1, psgc: "036901000", pop2024: 12865 },
  { id: 2, name: "Camiling", dist: 1, psgc: "036902000", pop2024: 91400 },
  { id: 3, name: "Mayantoc", dist: 1, psgc: "036908000", pop2024: 33654 },
  { id: 4, name: "Moncada", dist: 1, psgc: "036909000", pop2024: 64955 },
  { id: 5, name: "Paniqui", dist: 1, psgc: "036910000", pop2024: 106190 },
  { id: 6, name: "Pura", dist: 1, psgc: "036911000", pop2024: 27017 },
  { id: 7, name: "Ramos", dist: 1, psgc: "036912000", pop2024: 23808 },
  { id: 8, name: "San Clemente", dist: 1, psgc: "036913000", pop2024: 13781 },
  { id: 9, name: "San Manuel", dist: 1, psgc: "036915000", pop2024: 29693 },
  { id: 10, name: "Sta. Ignacia", dist: 1, psgc: "036916000", pop2024: 53620 },
  { id: 11, name: "Gerona", dist: 2, psgc: "036906000", pop2024: 97275 },
  { id: 12, name: "San Jose", dist: 2, psgc: "036914000", pop2024: 43185 },
  { id: 13, name: "Tarlac City", dist: 2, psgc: "036917000", pop2024: 401892 },
  { id: 14, name: "Victoria", dist: 2, psgc: "036918000", pop2024: 71753 },
  { id: 15, name: "Bamban", dist: 3, psgc: "036903000", pop2024: 81680 },
  { id: 16, name: "Capas", dist: 3, psgc: "036904000", pop2024: 162724 },
  { id: 17, name: "Concepcion", dist: 3, psgc: "036905000", pop2024: 178549 },
  { id: 18, name: "La Paz", dist: 3, psgc: "036907000", pop2024: 70973 }
];

export const BARANGAY_ALIASES = {
  "matapitap": "Matalapitap",
  "sta lucia east": "Sta. Lucia East",
  "sta. lucia": "Sta. Lucia East",
  "calingcuan zone 1,2,4": "Calingcuan",
  "bantog": "Bantog-Caricutan"
};

export const FLOOD_TIMELINE_EPISODES = [
  {
    id: "ep_sta_monica",
    mun: "Concepcion",
    brgy: "Sta. Monica",
    scope: "Portions of barangay",
    sitios: "Purok 2 and Sitio Maligaya",
    peakFt: 6.0,
    currentFt: "5 to 6 ft",
    status: "Still Flooded",
    lastVerified: "Aug 24, 2026",
    needsVerification: true,
    firstSitrep: 3,
    segments: [{ startDay: 2, endDay: 38, peakFt: 6.0, label: "5 to 6 ft peak" }],
    readings: [
      { time: "Aug 24, 2026, 4:00 PM", depth: "5 to 6 ft", status: "Flooded", source: "Concepcion MDRRMO" },
      { time: "Aug 13, 2026, 6:00 PM", depth: "3 to 4 ft", status: "Receding", source: "Concepcion MDRRMO" },
      { time: "Aug 9, 2026, 11:00 AM", depth: "3 to 4 ft", status: "Flooded", source: "Concepcion MDRRMO" }
    ]
  },
  {
    id: "ep_sta_lucia",
    mun: "Moncada",
    brgy: "Sta. Lucia East",
    scope: "Portions of barangay",
    sitios: "Zones 1 to 3",
    peakFt: 3.5,
    currentFt: "1.5 to 2 ft",
    status: "Receding",
    lastVerified: "Sep 14, 2026",
    needsVerification: false,
    firstSitrep: 3,
    segments: [{ startDay: 1, endDay: 37, peakFt: 3.5, label: "3.5 ft peak" }],
    readings: [
      { time: "Sep 14, 2026, 5:00 PM", depth: "1.5 to 2 ft", status: "Receding", source: "Moncada MDRRMO" },
      { time: "Aug 31, 2026, 6:00 PM", depth: "3.5 ft", status: "Flooded", source: "Moncada MDRRMO" },
      { time: "Aug 17, 2026, 6:00 PM", depth: "1 to 2 ft", status: "Still Flooded", source: "Moncada MDRRMO" },
      { time: "Aug 8, 2026, 5:00 PM", depth: "1 to 2 ft", status: "Still Flooded", source: "Moncada MDRRMO" }
    ]
  },
  {
    id: "ep_salumague",
    mun: "Paniqui",
    brgy: "Salumague",
    scope: "Portions of barangay",
    sitios: "Sitio Bacao",
    peakFt: 4.0,
    currentFt: "2.5 to 3 ft",
    status: "Still Flooded",
    lastVerified: "Sep 14, 2026",
    needsVerification: false,
    firstSitrep: 9,
    segments: [{ startDay: 9, endDay: 38, peakFt: 4.0, label: "4.0 ft peak" }],
    readings: [
      { time: "Sep 14, 2026, 5:00 PM", depth: "2.5 to 3 ft", status: "Flooded", source: "Paniqui MDRRMO" },
      { time: "Aug 31, 2026, 6:00 PM", depth: "4.0 ft", status: "Rising", source: "Paniqui MDRRMO" },
      { time: "Aug 16, 2026, 5:00 AM", depth: "1.0 ft", status: "Flooded", source: "Paniqui MDRRMO" }
    ]
  },
  {
    id: "ep_matalapitap",
    mun: "Paniqui",
    brgy: "Matalapitap",
    scope: "Portions of barangay",
    sitios: "Purok 1 to 3 (logged as Matapitap in #3-#8)",
    peakFt: 3.0,
    currentFt: "1.5 to 2 ft",
    status: "Still Flooded",
    lastVerified: "Sep 14, 2026",
    needsVerification: false,
    firstSitrep: 3,
    segments: [
      { startDay: 2, endDay: 4, peakFt: 1.0, label: "Wave 1 (<1 ft)" },
      { startDay: 6, endDay: 38, peakFt: 3.0, label: "Wave 2 (3.0 ft)" }
    ],
    readings: [
      { time: "Sep 14, 2026, 5:00 PM", depth: "1.5 to 2 ft", status: "Flooded", source: "Paniqui MDRRMO" },
      { time: "Aug 13, 2026, 5:00 PM", depth: "<1 ft", status: "Flooded (2nd wave)", source: "Paniqui MDRRMO" },
      { time: "Aug 11, 2026, 5:00 PM", depth: "0 ft", status: "Subsided", source: "Paniqui MDRRMO" },
      { time: "Aug 9, 2026, 5:00 PM", depth: "<1 ft", status: "Flooded", source: "Paniqui MDRRMO" }
    ]
  },
  {
    id: "ep_pao_2nd",
    mun: "Camiling",
    brgy: "Pao 2nd",
    scope: "Portions of barangay",
    sitios: "Main highway approach",
    peakFt: 3.0,
    currentFt: "0 ft",
    status: "Subsided",
    lastVerified: "Sep 6, 2026",
    needsVerification: false,
    firstSitrep: 9,
    segments: [
      { startDay: 10, endDay: 14, peakFt: 2.0, label: "Wave 1 (1.5 to 2 ft)" },
      { startDay: 21, endDay: 30, peakFt: 3.0, label: "Wave 2 (3.0 ft)" }
    ],
    readings: [
      { time: "Sep 6, 2026, 4:00 PM", depth: "0 ft", status: "Subsided", source: "Camiling MDRRMO" },
      { time: "Aug 28, 2026, 5:00 PM", depth: "3.0 ft", status: "Flooded (2nd wave)", source: "Camiling MDRRMO" },
      { time: "Aug 17, 2026, 12:00 PM", depth: "1.5 to 2 ft", status: "Flooded", source: "Camiling MDRRMO" }
    ]
  },
  {
    id: "ep_san_isidro_lapaz",
    mun: "La Paz",
    brgy: "San Isidro",
    scope: "Portions of barangay",
    sitios: "Sitio Mait",
    peakFt: 4.2,
    currentFt: "0 ft",
    status: "Subsided",
    lastVerified: "Sep 3, 2026",
    needsVerification: false,
    firstSitrep: 3,
    segments: [
      { startDay: 2, endDay: 5, peakFt: 4.2, label: "4.2 ft (revised from 2 ft in #3)" },
      { startDay: 11, endDay: 15, peakFt: 2.5, label: "Wave 2 (2.5 ft)" },
      { startDay: 22, endDay: 27, peakFt: 2.0, label: "Wave 3 (2.0 ft)" }
    ],
    readings: [
      { time: "Sep 3, 2026, 5:00 PM", depth: "0 ft", status: "Subsided", source: "La Paz MDRRMO" },
      { time: "Aug 18, 2026, 5:00 PM", depth: "2.5 ft", status: "Flooded (2nd wave)", source: "La Paz MDRRMO" },
      { time: "Aug 12, 2026, 6:00 PM", depth: "0 ft", status: "Subsided", source: "La Paz MDRRMO" },
      { time: "Aug 9, 2026, 5:00 PM", depth: "4.2 ft", status: "Flooded (revised from 2 ft)", source: "La Paz MDRRMO" }
    ]
  },
  {
    id: "ep_sawat_camiling",
    mun: "Camiling",
    brgy: "Sawat",
    scope: "Portions of barangay",
    sitios: "Sitio Bilad approach",
    peakFt: 2.5,
    currentFt: "0 ft",
    status: "Subsided",
    lastVerified: "Sep 4, 2026",
    needsVerification: false,
    firstSitrep: 3,
    segments: [
      { startDay: 2, endDay: 3, peakFt: 1.0, label: "Wave 1 (<1 ft)" },
      { startDay: 10, endDay: 26, peakFt: 2.5, label: "Wave 2 (1.5 to 2.5 ft)" }
    ],
    readings: [
      { time: "Sep 4, 2026, 5:00 PM", depth: "0 ft", status: "Subsided", source: "Camiling MDRRMO" },
      { time: "Aug 17, 2026, 12:00 PM", depth: "1.5 to 2 ft", status: "Flooded (2nd wave)", source: "Camiling MDRRMO" },
      { time: "Aug 10, 2026, 12:00 AM", depth: "0 ft", status: "Subsided", source: "Camiling MDRRMO" },
      { time: "Aug 9, 2026, 5:00 PM", depth: "<1 ft", status: "Flooded", source: "Camiling MDRRMO" }
    ]
  },
  {
    id: "ep_sta_barbara_victoria",
    mun: "Victoria",
    brgy: "Sta. Barbara",
    scope: "Portions of barangay",
    sitios: "Sitio Gripo, Centro 1 and 2, Gawad Kalinga",
    peakFt: 4.0,
    currentFt: "0 ft",
    status: "Subsided",
    lastVerified: "Aug 13, 2026",
    needsVerification: true,
    firstSitrep: 6,
    segments: [{ startDay: 1, endDay: 23, peakFt: 4.0, label: "4.0 ft peak" }],
    readings: [
      { time: "Aug 13, 2026, 8:00 AM", depth: "2 to 4 ft", status: "Receding (last verified Aug 13)", source: "Victoria MDRRMO" },
      { time: "Aug 7, 2026, 5:00 PM", depth: "4.0 ft", status: "Flooded", source: "Victoria MDRRMO" }
    ]
  }
];

export const RAW_ARCHIVE = {
  "3": {
    updateNo: 3,
    dateStr: "Aug 9, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 9, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 9, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 9:00 AM, Aug 8, 2026",
    popTotals: [15, 1928, 6557, 180, 541, 5, 97, 80, 347, 315],
    lguPop: {
      "Camiling": [3, 204, 563, 130, 393, "ACTIVE", 4, 56, 56, 223, 223],
      "Paniqui": [1, 15, 37, 15, 37, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [3, 16, 70, 0, 0, "CLOSED", 0, 5, 0, 12, 0],
      "Victoria": [2, 176, 647, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [4, 1517, 5240, 35, 111, "ACTIVE", 1, 36, 24, 112, 92]
    },
    muniFloodCounts: { "Moncada": 1, "Paniqui": 3, "San Manuel": 1, "Tarlac City": 1, "Capas": 1, "Concepcion": 4, "La Paz": 11 },
    agriRows: [
      { commodity: "RICE", lgus: "3", farmers: "592", partialHa: "592.79", totalHa: "-", valuePhp: 24025950.95 },
      { commodity: "TOTAL", lgus: "3", farmers: "592", partialHa: "592.79", totalHa: "-", valuePhp: 24025950.95 }
    ],
    agriTotalPhp: 24025950.95,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 0, 0, 0, 0],
    assistTotalPhp: 0,
    assistByLgu: {}
  },
  "6": {
    updateNo: 6,
    dateStr: "Aug 12, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 12, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 12, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 12, 2026",
    popTotals: [88, 13964, 48102, 223, 675, 5, 291, 104, 1009, 335],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [19, 2349, 8082, 130, 393, "CLOSED", 0, 75, 0, 283, 0],
      "Moncada": [5, 237, 1137, 34, 96, "ACTIVE", 2, 46, 46, 136, 136],
      "Paniqui": [4, 215, 633, 15, 37, "ACTIVE", 1, 20, 3, 48, 8],
      "Ramos": [4, 159, 617, 9, 38, "ACTIVE", 1, 12, 10, 45, 40],
      "Sta. Ignacia": [9, 218, 757, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [11, 62, 222, 0, 0, "CLOSED", 0, 16, 0, 47, 0],
      "Victoria": [4, 583, 1941, 0, 0, "-", 0, 0, 0, 0, 0],
      "Bamban": [2, 215, 996, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [3, 2515, 7135, 0, 0, "-", 0, 0, 0, 0, 0],
      "Concepcion": [12, 3056, 11148, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [14, 4354, 15431, 35, 111, "ACTIVE", 1, 50, 45, 169, 151]
    },
    muniFloodCounts: { "Moncada": 5, "Ramos": 2, "Tarlac City": 1, "Victoria": 4, "Concepcion": 6 },
    agriRows: [
      { commodity: "RICE", lgus: "16", farmers: "2,667", partialHa: "2,956.58", totalHa: "253.05", valuePhp: 132170092.41 },
      { commodity: "TOTAL", lgus: "16", farmers: "2,667", partialHa: "2,956.58", totalHa: "253.05", valuePhp: 132170092.41 }
    ],
    agriTotalPhp: 132170092.41,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 1109682.4, 11500.0, 680589.0, 612964.0],
    assistTotalPhp: 2414735.4,
    assistByLgu: {}
  },
  "7": {
    updateNo: 7,
    dateStr: "Aug 13, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 13, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 13, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 13, 2026",
    popTotals: [89, 14390, 49341, 223, 675, 4, 291, 104, 1009, 335],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [19, 2349, 8082, 130, 393, "CLOSED", 0, 75, 0, 283, 0],
      "Moncada": [5, 237, 1137, 34, 96, "ACTIVE", 2, 46, 46, 136, 136],
      "Paniqui": [4, 215, 633, 15, 37, "CLOSED", 0, 20, 3, 48, 8],
      "Ramos": [4, 159, 617, 9, 38, "ACTIVE", 1, 12, 10, 45, 40],
      "Sta. Ignacia": [9, 218, 757, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [11, 62, 222, 0, 0, "CLOSED", 0, 16, 0, 47, 0],
      "Victoria": [4, 583, 1941, 0, 0, "-", 0, 0, 0, 0, 0],
      "Bamban": [2, 215, 996, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [3, 2515, 7135, 0, 0, "-", 0, 0, 0, 0, 0],
      "Concepcion": [12, 3056, 11148, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 4628, 16208, 35, 111, "ACTIVE", 1, 50, 45, 169, 151]
    },
    muniFloodCounts: { "Moncada": 5, "Paniqui": 1, "Ramos": 2, "Victoria": 3, "Concepcion": 6 },
    agriRows: [
      { commodity: "RICE", lgus: "16", farmers: "2,948", partialHa: "3,332.11", totalHa: "338.55", valuePhp: 133582937.91 },
      { commodity: "TOTAL", lgus: "16", farmers: "2,948", partialHa: "3,332.11", totalHa: "338.55", valuePhp: 133582937.91 }
    ],
    agriTotalPhp: 133582937.91,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 1109682.4, 11500.0, 680589.0, 612964.0],
    assistTotalPhp: 2414735.4,
    assistByLgu: {}
  },
  "8": {
    updateNo: 8,
    dateStr: "Aug 14, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 14, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 14, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 13, 2026",
    popTotals: [89, 14585, 49784, 223, 675, 5, 309, 116, 1073, 374],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [19, 2349, 8082, 130, 393, "CLOSED", 0, 78, 0, 294, 0],
      "Moncada": [5, 405, 1241, 34, 96, "ACTIVE", 2, 61, 61, 186, 186],
      "Paniqui": [4, 215, 633, 15, 37, "ACTIVE", 1, 20, 3, 48, 8],
      "Ramos": [4, 169, 651, 9, 38, "ACTIVE", 1, 12, 11, 45, 41],
      "Sta. Ignacia": [9, 218, 757, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [11, 62, 222, 0, 0, "CLOSED", 0, 16, 0, 47, 0],
      "Victoria": [4, 583, 1941, 0, 0, "-", 0, 0, 0, 0, 0],
      "Bamban": [2, 215, 996, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [3, 2515, 7135, 0, 0, "-", 0, 0, 0, 0, 0],
      "Concepcion": [12, 3056, 11148, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 4797, 16975, 35, 111, "ACTIVE", 1, 50, 41, 172, 139]
    },
    muniFloodCounts: { "Moncada": 5, "Paniqui": 1, "Ramos": 2, "Victoria": 3, "Concepcion": 6 },
    agriRows: [
      { commodity: "RICE", lgus: "16", farmers: "2,948", partialHa: "3,332.11", totalHa: "338.55", valuePhp: 133582937.91 },
      { commodity: "TOTAL", lgus: "16", farmers: "2,948", partialHa: "3,332.11", totalHa: "338.55", valuePhp: 133582937.91 }
    ],
    agriTotalPhp: 133582937.91,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 1470129.6, 11500.0, 743945.0, 612964.0],
    assistTotalPhp: 2838538.6,
    assistByLgu: {}
  },
  "9": {
    updateNo: 9,
    dateStr: "Aug 17, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 14, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 17, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 17, 2026",
    popTotals: [89, 14585, 49784, 223, 675, 5, 309, 116, 1073, 374],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [19, 2349, 8082, 130, 393, "CLOSED", 0, 78, 0, 294, 0],
      "Moncada": [5, 405, 1241, 34, 96, "ACTIVE", 2, 61, 61, 186, 186],
      "Paniqui": [4, 215, 633, 15, 37, "ACTIVE", 1, 20, 3, 48, 8],
      "Ramos": [4, 169, 651, 9, 38, "ACTIVE", 1, 12, 11, 45, 41],
      "Sta. Ignacia": [9, 218, 757, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [11, 62, 222, 0, 0, "CLOSED", 0, 16, 0, 47, 0],
      "Victoria": [4, 583, 1941, 0, 0, "-", 0, 0, 0, 0, 0],
      "Bamban": [2, 215, 996, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [3, 2515, 7135, 0, 0, "-", 0, 0, 0, 0, 0],
      "Concepcion": [12, 3056, 11148, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 4797, 16975, 35, 111, "ACTIVE", 1, 50, 41, 172, 139]
    },
    muniFloodCounts: { "Camiling": 3, "Moncada": 7, "Paniqui": 5, "Pura": 1, "Ramos": 3, "San Clemente": 1, "Tarlac City": 4, "Victoria": 3, "Concepcion": 6 },
    agriRows: [
      { commodity: "RICE", lgus: "16", farmers: "3,283", partialHa: "3,594.44", totalHa: "481.40", valuePhp: 177964260.56 },
      { commodity: "TOTAL", lgus: "16", farmers: "3,283", partialHa: "3,594.44", totalHa: "481.40", valuePhp: 177964260.56 }
    ],
    agriTotalPhp: 177964260.56,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 1470129.6, 11500.0, 743945.0, 612964.0],
    assistTotalPhp: 2838538.6,
    assistByLgu: {}
  },
  "10": {
    updateNo: 10,
    dateStr: "Aug 18, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 18, 2026",
    floodSource: "LDRRMOs as of 5:00 PM, Aug 18, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 18, 2026",
    popTotals: [109, 17275, 58470, 223, 675, 14, 549, 350, 1873, 1111],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [27, 2782, 9595, 130, 393, "ACTIVE", 4, 78, 32, 294, 94],
      "Moncada": [8, 1126, 3865, 34, 96, "ACTIVE", 2, 103, 103, 340, 340],
      "Paniqui": [7, 500, 1546, 15, 37, "ACTIVE", 5, 160, 157, 445, 434],
      "Ramos": [5, 220, 849, 9, 38, "ACTIVE", 1, 12, 11, 45, 41],
      "Sta. Ignacia": [10, 221, 768, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [11, 62, 222, 0, 0, "CLOSED", 0, 16, 0, 47, 0],
      "Victoria": [5, 612, 2047, 0, 0, "-", 0, 0, 0, 0, 0],
      "Bamban": [2, 215, 996, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [5, 2573, 7384, 0, 0, "ACTIVE", 2, 58, 47, 249, 202],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 4797, 16975, 35, 111, "CLOSED", 0, 50, 0, 172, 0]
    },
    muniFloodCounts: { "Moncada": 8, "Paniqui": 6, "Pura": 2, "Ramos": 3, "San Manuel": 4, "Gerona": 1, "Tarlac City": 1, "Victoria": 3, "Capas": 2, "Concepcion": 11, "La Paz": 6 },
    agriRows: [
      { commodity: "RICE", lgus: "17", farmers: "3,660", partialHa: "3,834.30", totalHa: "582.55", valuePhp: 185833965.61 },
      { commodity: "TOTAL", lgus: "17", farmers: "3,660", partialHa: "3,834.30", totalHa: "582.55", valuePhp: 185833965.61 }
    ],
    agriTotalPhp: 185833965.61,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 1470129.6, 11500.0, 743945.0, 612964.0],
    assistTotalPhp: 2838538.6,
    assistByLgu: {}
  },
  "12": {
    updateNo: 12,
    dateStr: "Aug 19, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 19, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 19, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 10:30 AM, Aug 19, 2026",
    popTotals: [109, 21412, 73209, 223, 675, 20, 833, 590, 2877, 1870],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [27, 3494, 11897, 130, 393, "ACTIVE", 3, 78, 49, 294, 184],
      "Moncada": [8, 1431, 4928, 34, 96, "ACTIVE", 3, 145, 145, 475, 475],
      "Paniqui": [7, 828, 2719, 15, 37, "ACTIVE", 10, 355, 352, 1134, 1123],
      "Ramos": [5, 354, 1387, 9, 38, "ACTIVE", 3, 28, 27, 72, 70],
      "Sta. Ignacia": [10, 275, 921, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [11, 2108, 7444, 0, 0, "CLOSED", 0, 47, 0, 159, 0],
      "Victoria": [5, 626, 2113, 0, 0, "-", 0, 0, 0, 0, 0],
      "Bamban": [2, 510, 2229, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [5, 2816, 8315, 0, 0, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 4807, 17016, 35, 111, "ACTIVE", 1, 50, 17, 213, 18]
    },
    muniFloodCounts: { "Anao": 2, "Camiling": 7, "Moncada": 10, "Paniqui": 11, "Ramos": 3, "San Manuel": 8, "Sta. Ignacia": 1, "Gerona": 1, "Tarlac City": 1, "Victoria": 3, "Capas": 2, "Concepcion": 11, "La Paz": 9 },
    agriRows: [
      { commodity: "RICE", lgus: "17", farmers: "3,660", partialHa: "3,618.64", totalHa: "828.18", valuePhp: 192780868.9 },
      { commodity: "TOTAL", lgus: "17", farmers: "3,743", partialHa: "3,618.64", totalHa: "828.18", valuePhp: 192780868.9 }
    ],
    agriTotalPhp: 192780868.9,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [0, 0, 1721851.6, 16100.0, 2020466.6, 612964.0],
    assistTotalPhp: 4371382.2,
    assistByLgu: {},
    revised: true,
    revisionNote: "Corrected DA-OPA rice loss total (₱192,780,868.90 vs published ₱190,780,868.90 typo)"
  },
  "13": {
    updateNo: 13,
    dateStr: "Aug 20, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Aug 20, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 20, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 4:00 PM, Aug 20, 2026",
    popTotals: [176, 33390, 113807, 1371, 4446, 26, 1369, 1089, 4347, 3304],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [33, 3494, 11897, 130, 393, "ACTIVE", 4, 78, 13, 294, 42],
      "Moncada": [11, 1795, 6256, 227, 860, "ACTIVE", 5, 277, 277, 860, 860],
      "Paniqui": [14, 2664, 8214, 718, 2097, "ACTIVE", 11, 718, 701, 2097, 2057],
      "Ramos": [6, 424, 1682, 38, 135, "ACTIVE", 3, 38, 37, 135, 133],
      "Sta. Ignacia": [14, 376, 1323, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [50, 11315, 38732, 47, 159, "ACTIVE", 1, 47, 31, 159, 112],
      "Victoria": [7, 648, 2171, 8, 23, "ACTIVE", 1, 8, 8, 23, 23],
      "Bamban": [4, 510, 2229, 0, 0, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [8, 2816, 8315, 0, 0, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 5181, 18765, 73, 249, "ACTIVE", 1, 73, 22, 249, 77]
    },
    muniFloodCounts: { "Anao": 3, "Moncada": 12, "Paniqui": 11, "Ramos": 4, "San Manuel": 10, "Gerona": 1, "Tarlac City": 1, "Victoria": 8, "Capas": 2, "Concepcion": 11, "La Paz": 14 },
    agriRows: [
      { commodity: "RICE", lgus: "17", farmers: "3,915", partialHa: "3,822.47", totalHa: "865.88", valuePhp: 201300910.43 },
      { commodity: "TOTAL", lgus: "17", farmers: "3,915", partialHa: "3,822.47", totalHa: "865.88", valuePhp: 201300910.43 }
    ],
    agriTotalPhp: 201300910.43,
    infraTotalPhp: 0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [3395860.0, 26000.0, 1875401.6, 35000.0, 2037315.0, 612964.0],
    assistTotalPhp: 7982540.6,
    assistByLgu: {}
  },
  "14": {
    updateNo: 14,
    dateStr: "Aug 23, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 22, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 23, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 10:00 AM, Aug 23, 2026",
    popTotals: [191, 38884, 131968, 1371, 4446, 21, 1893, 1311, 6265, 4273],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [34, 3649, 12486, 130, 393, "ACTIVE", 1, 78, 7, 294, 20],
      "Moncada": [13, 2451, 8705, 227, 860, "ACTIVE", 8, 432, 432, 1319, 1319],
      "Paniqui": [18, 5934, 18514, 718, 2097, "ACTIVE", 7, 1073, 790, 3515, 2648],
      "Pura": [5, 27, 131, 0, 0, "-", 0, 0, 0, 0, 0],
      "Ramos": [6, 765, 2992, 38, 135, "ACTIVE", 3, 42, 41, 149, 147],
      "Sta. Ignacia": [14, 376, 1323, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [52, 12217, 41496, 47, 159, "ACTIVE", 1, 47, 31, 159, 112],
      "Victoria": [8, 653, 2186, 8, 23, "CLOSED", 0, 8, 0, 23, 0],
      "Bamban": [4, 510, 2229, 72, 281, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [8, 2816, 8315, 88, 249, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 5319, 19368, 73, 249, "ACTIVE", 1, 83, 10, 276, 27]
    },
    muniFloodCounts: { "Anao": 5, "Moncada": 13, "Paniqui": 5, "Pura": 2, "Ramos": 4, "Gerona": 1, "San Jose": 2, "Victoria": 9, "Concepcion": 10 },
    agriRows: [
      { commodity: "RICE", lgus: "17", farmers: "4,038", partialHa: "3,990.16", totalHa: "879.88", valuePhp: 208598203.57 },
      { commodity: "TOTAL", lgus: "17", farmers: "4,038", partialHa: "3,990.16", totalHa: "879.88", valuePhp: 208598203.57 }
    ],
    agriTotalPhp: 208598203.57,
    infraTotalPhp: 371000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 2419501.6, 55000.0, 3792714.0, 612964.0],
    assistTotalPhp: 17028132.6,
    assistByLgu: {}
  },
  "15": {
    updateNo: 15,
    dateStr: "Aug 24, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Aug 24, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 24, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 2:30 PM, Aug 24, 2026",
    popTotals: [192, 39334, 133453, 1371, 4446, 19, 1975, 1357, 6519, 4373],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [34, 3649, 12486, 130, 393, "CLOSED", 0, 78, 0, 294, 0],
      "Moncada": [13, 2491, 8849, 227, 860, "ACTIVE", 8, 472, 472, 1463, 1463],
      "Paniqui": [18, 5999, 18675, 718, 2097, "ACTIVE", 6, 1124, 833, 3647, 2731],
      "Pura": [5, 29, 144, 0, 0, "ACTIVE", 1, 1, 1, 5, 5],
      "Ramos": [6, 804, 3129, 38, 135, "ACTIVE", 3, 42, 41, 149, 147],
      "Sta. Ignacia": [15, 376, 1323, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [52, 12342, 41885, 47, 159, "CLOSED", 0, 47, 0, 159, 0],
      "Victoria": [8, 653, 2186, 8, 23, "CLOSED", 0, 8, 0, 23, 0],
      "Bamban": [4, 510, 2229, 72, 281, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [8, 2816, 8315, 88, 249, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [15, 5498, 20009, 73, 249, "ACTIVE", 1, 73, 10, 249, 27]
    },
    muniFloodCounts: { "Moncada": 14, "Paniqui": 5, "Pura": 2, "Ramos": 4, "Gerona": 1, "Victoria": 3, "Concepcion": 11 },
    agriRows: [
      { commodity: "RICE", lgus: "17", farmers: "4,804", partialHa: "4,841.60", totalHa: "982.98", valuePhp: 239242861.99 },
      { commodity: "TOTAL", lgus: "17", farmers: "4,804", partialHa: "4,841.60", totalHa: "982.98", valuePhp: 239242861.99 }
    ],
    agriTotalPhp: 239242861.99,
    infraTotalPhp: 371000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 2902676.4, 75000.0, 4016014.0, 612964.0],
    assistTotalPhp: 17754607.4,
    assistByLgu: {}
  },
  "16": {
    updateNo: 16,
    dateStr: "Aug 25, 2026",
    cutoffTime: "5:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 6:00 PM, Aug 25, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 26, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 2:30 PM, Aug 25, 2026",
    popTotals: [192, 39616, 134445, 1371, 4446, 16, 1976, 1313, 6527, 4210],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [34, 3649, 12486, 130, 393, "CLOSED", 0, 78, 0, 294, 0],
      "Moncada": [13, 2751, 9762, 227, 860, "ACTIVE", 8, 473, 473, 1471, 1471],
      "Paniqui": [18, 6021, 18754, 718, 2097, "ACTIVE", 5, 1124, 824, 3647, 2688],
      "Pura": [5, 29, 144, 0, 0, "ACTIVE", 1, 1, 1, 5, 5],
      "Ramos": [6, 804, 3129, 38, 135, "ACTIVE", 1, 42, 5, 149, 19],
      "Sta. Ignacia": [14, 376, 1323, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [52, 12342, 41885, 47, 159, "CLOSED", 0, 47, 0, 159, 0],
      "Victoria": [8, 653, 2186, 8, 23, "CLOSED", 0, 8, 0, 23, 0],
      "Bamban": [4, 510, 2229, 72, 281, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [8, 2816, 8315, 88, 249, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [16, 5498, 20009, 73, 249, "ACTIVE", 1, 73, 10, 249, 27]
    },
    muniFloodCounts: { "Moncada": 9, "Paniqui": 5, "Pura": 2, "Ramos": 4, "Victoria": 3, "Concepcion": 11 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "5,040", partialHa: "5,063.74", totalHa: "1,095.87", valuePhp: 253541770.2 },
      { commodity: "TOTAL", lgus: "18", farmers: "5,040", partialHa: "5,063.74", totalHa: "1,095.87", valuePhp: 253541770.2 }
    ],
    agriTotalPhp: 253541770.2,
    infraTotalPhp: 371000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 2902676.4, 75000.0, 4016014.0, 612964.0],
    assistTotalPhp: 17754607.4,
    assistByLgu: {}
  },
  "17": {
    updateNo: 17,
    dateStr: "Aug 27, 2026",
    cutoffTime: "5:00 PM",
    popSource: "DSWD Disaster Monitoring Report as of 5:00 PM, Aug 27, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 27, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 27, 2026",
    popTotals: [193, 39616, 134761, 1982, 6564, 16, 1976, 1309, 6527, 4196],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [34, 3649, 12486, 130, 393, "CLOSED", 0, 78, 0, 294, 0],
      "Moncada": [14, 2751, 10078, 473, 1471, "ACTIVE", 8, 473, 473, 1471, 1471],
      "Paniqui": [18, 6021, 18754, 718, 2097, "ACTIVE", 5, 1124, 821, 3647, 2675],
      "Pura": [5, 29, 144, 0, 0, "ACTIVE", 1, 1, 1, 5, 5],
      "Ramos": [6, 804, 3129, 38, 135, "ACTIVE", 1, 42, 4, 149, 18],
      "Sta. Ignacia": [14, 376, 1323, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [52, 12342, 41885, 47, 159, "CLOSED", 0, 47, 0, 159, 0],
      "Victoria": [8, 653, 2186, 8, 23, "CLOSED", 0, 8, 0, 23, 0],
      "Bamban": [4, 510, 2229, 72, 281, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [8, 2816, 8315, 88, 249, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4166, 14220, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [16, 5498, 20009, 73, 249, "ACTIVE", 1, 73, 10, 249, 27]
    },
    muniFloodCounts: { "Moncada": 6, "Paniqui": 5, "Pura": 2, "Ramos": 1, "Victoria": 3, "Concepcion": 11 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "5,061", partialHa: "5,101.64", totalHa: "1,095.87", valuePhp: 254590801.45 },
      { commodity: "TOTAL", lgus: "18", farmers: "5,061", partialHa: "5,101.64", totalHa: "1,095.87", valuePhp: 254590801.45 }
    ],
    agriTotalPhp: 254590801.45,
    infraTotalPhp: 371000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 2902676.4, 75000.0, 4016014.0, 612964.0],
    assistTotalPhp: 17754607.4,
    assistByLgu: {}
  },
  "18": {
    updateNo: 18,
    dateStr: "Aug 28, 2026",
    cutoffTime: "6:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Aug 28, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Aug 28, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 28, 2026",
    popTotals: [193, 39879, 135694, 1371, 4446, 16, 1976, 1309, 6527, 4196],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [34, 3649, 12486, 130, 393, "CLOSED", 0, 78, 0, 294, 0],
      "Moncada": [14, 2751, 10078, 227, 860, "ACTIVE", 8, 473, 473, 1471, 1471],
      "Paniqui": [18, 6021, 18754, 718, 2097, "ACTIVE", 5, 1124, 821, 3647, 2675],
      "Pura": [5, 29, 144, 0, 0, "ACTIVE", 1, 1, 1, 5, 5],
      "Ramos": [6, 804, 3129, 38, 135, "ACTIVE", 1, 42, 4, 149, 18],
      "Sta. Ignacia": [14, 376, 1323, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [52, 12342, 41885, 47, 159, "CLOSED", 0, 47, 0, 159, 0],
      "Victoria": [8, 653, 2186, 8, 23, "CLOSED", 0, 8, 0, 23, 0],
      "Bamban": [4, 510, 2229, 72, 281, "CLOSED", 0, 72, 0, 281, 0],
      "Capas": [8, 2816, 8315, 88, 249, "CLOSED", 0, 58, 0, 249, 0],
      "Concepcion": [13, 4429, 15153, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [16, 5498, 20009, 73, 249, "ACTIVE", 1, 73, 10, 249, 27]
    },
    muniFloodCounts: { "Camiling": 2, "Moncada": 5, "Paniqui": 5, "Pura": 2, "Ramos": 1, "Victoria": 3, "Concepcion": 11 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "5,110", partialHa: "5,144.94", totalHa: "1,107.87", valuePhp: 256746375.15 },
      { commodity: "TOTAL", lgus: "18", farmers: "5,110", partialHa: "5,144.94", totalHa: "1,107.87", valuePhp: 256746375.15 }
    ],
    agriTotalPhp: 256746375.15,
    infraTotalPhp: 1787000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 3924552.04, 200000.0, 4499253.0, 612964.0],
    assistTotalPhp: 19384722.04,
    assistByLgu: {}
  },
  "20": {
    updateNo: 20,
    dateStr: "Aug 30, 2026",
    cutoffTime: "7:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 4:00 PM, Aug 30, 2026",
    floodSource: "LDRRMOs as of 7:00 PM, Aug 30, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 1:00 PM, Aug 30, 2026",
    popTotals: [250, 52459, 180247, 1371, 4446, 45, 2374, 1748, 7863, 5731],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [41, 5432, 18667, 130, 393, "ACTIVE", 10, 159, 155, 575, 560],
      "Moncada": [19, 3712, 14053, 227, 860, "ACTIVE", 6, 473, 473, 1471, 1344],
      "Paniqui": [22, 9772, 31381, 718, 2097, "ACTIVE", 14, 1376, 1036, 4482, 3404],
      "Pura": [8, 38, 191, 0, 0, "ACTIVE", 2, 4, 4, 20, 20],
      "Ramos": [6, 813, 3149, 38, 135, "ACTIVE", 2, 44, 37, 170, 143],
      "San Clemente": [3, 97, 362, 0, 0, "ACTIVE", 3, 5, 5, 18, 18],
      "Sta. Ignacia": [15, 855, 2913, 0, 0, "ACTIVE", 2, 28, 28, 70, 70],
      "San Jose": [3, 107, 613, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [60, 14005, 47660, 47, 159, "ACTIVE", 3, 50, 3, 180, 21],
      "Victoria": [15, 859, 3025, 8, 23, "ACTIVE", 1, 10, 9, 36, 19],
      "Bamban": [5, 510, 2232, 72, 281, "ACTIVE", 1, 72, 18, 284, 62],
      "Capas": [8, 2832, 8374, 58, 249, "ACTIVE", 1, 74, 16, 308, 59],
      "Concepcion": [26, 6791, 23155, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [18, 6635, 24469, 73, 249, "CLOSED", 0, 79, 0, 249, 0]
    },
    muniFloodCounts: { "Camiling": 14, "Moncada": 28, "Paniqui": 18, "Pura": 7, "Ramos": 3, "San Clemente": 2, "San Manuel": 8, "Sta. Ignacia": 7, "Gerona": 3, "San Jose": 6, "Victoria": 15, "Capas": 6, "Concepcion": 11, "La Paz": 46 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "8,602", partialHa: "10,355.53", totalHa: "1,211.27", valuePhp: 322201184.14 },
      { commodity: "TOTAL", lgus: "18", farmers: "8,602", partialHa: "10,355.53", totalHa: "1,211.27", valuePhp: 322201184.14 }
    ],
    agriTotalPhp: 322201184.14,
    infraTotalPhp: 2582000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 3940757.04, 200000.0, 4499253.0, 612964.0],
    assistTotalPhp: 19400927.04,
    assistByLgu: {}
  },
  "21": {
    updateNo: 21,
    dateStr: "Aug 31, 2026",
    cutoffTime: "9:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 9:00 PM, Aug 31, 2026",
    floodSource: "LDRRMOs as of 7:00 PM, Aug 31, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Aug 31, 2026",
    popTotals: [301, 72252, 250651, 1371, 4446, 72, 3022, 2554, 10165, 8258],
    lguPop: {
      "Anao": [1, 1, 3, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11507, 38538, 130, 393, "ACTIVE", 17, 209, 207, 727, 719],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [23, 7354, 29478, 227, 860, "ACTIVE", 15, 771, 771, 2574, 2574],
      "Paniqui": [24, 11291, 35942, 718, 2097, "ACTIVE", 15, 1530, 1286, 4940, 4046],
      "Pura": [8, 77, 353, 0, 0, "ACTIVE", 2, 5, 5, 27, 27],
      "Ramos": [7, 880, 3445, 38, 135, "ACTIVE", 4, 64, 60, 248, 230],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [9, 347, 932, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [1, 384, 1461, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [61, 14346, 49005, 47, 159, "ACTIVE", 6, 75, 28, 273, 114],
      "Victoria": [23, 2036, 7358, 8, 23, "ACTIVE", 1, 10, 10, 38, 34],
      "Bamban": [6, 641, 2771, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [11, 2901, 8686, 58, 249, "ACTIVE", 5, 124, 81, 535, 286],
      "Concepcion": [31, 8755, 29550, 0, 0, "-", 0, 0, 0, 0, 0],
      "La Paz": [18, 9924, 36359, 73, 249, "ACTIVE", 5, 129, 78, 434, 161]
    },
    muniFloodCounts: { "Anao": 1, "Camiling": 18, "Moncada": 31, "Paniqui": 18, "Pura": 7, "Ramos": 3, "San Clemente": 2, "San Manuel": 8, "Sta. Ignacia": 7, "Gerona": 4, "San Jose": 7, "Victoria": 22, "Capas": 9, "Concepcion": 11, "La Paz": 24 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "8,745", partialHa: "10,550.98", totalHa: "1,327.27", valuePhp: 329485647.47 },
      { commodity: "TOTAL", lgus: "18", farmers: "8,745", partialHa: "10,550.98", totalHa: "1,327.27", valuePhp: 329485647.47 }
    ],
    agriTotalPhp: 329485647.47,
    infraTotalPhp: 2582000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 0, housesPartially: 0,
    assistCols: [10121953.0, 26000.0, 3924552.04, 200000.0, 4499253.0, 612964.0],
    assistTotalPhp: 19384722.04,
    assistByLgu: {}
  },
  "22": {
    updateNo: 22,
    dateStr: "Sep 3, 2026",
    cutoffTime: "9:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Sep 3, 2026",
    floodSource: "LDRRMOs as of 7:00 PM, Sep 3, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 3, 2026",
    popTotals: [341, 79625, 276908, 1371, 4446, 40, 3344, 2043, 11172, 6221],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39753, 130, 393, "ACTIVE", 2, 217, 13, 687, 35],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [28, 8159, 32545, 227, 860, "ACTIVE", 13, 842, 815, 2806, 2686],
      "Paniqui": [26, 12271, 39184, 718, 2097, "ACTIVE", 13, 1755, 1047, 5709, 2935],
      "Pura": [11, 115, 519, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "ACTIVE", 4, 67, 63, 256, 238],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [6, 384, 1461, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [64, 15109, 51820, 47, 159, "CLOSED", 0, 75, 0, 273, 0],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "ACTIVE", 1, 133, 50, 556, 156],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "ACTIVE", 2, 132, 20, 439, 70]
    },
    muniFloodCounts: { "Anao": 6, "Moncada": 19, "Paniqui": 8, "Pura": 2, "Ramos": 2, "Gerona": 2 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "10,120", partialHa: "11,173.31", totalHa: "2,197.46", valuePhp: 397900724.19 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "10,136", partialHa: "11,189.14", totalHa: "2,213.29", valuePhp: 399018424.19 }
    ],
    agriTotalPhp: 399018424.19,
    infraTotalPhp: 2582000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 34, housesPartially: 19,
    assistCols: [10121953.0, 375934.83, 6349484.64, 280000.0, 4597853.0, 612964.0],
    assistTotalPhp: 22338189.47,
    assistByLgu: {}
  },
  "23": {
    updateNo: 23,
    dateStr: "Sep 4, 2026",
    cutoffTime: "7:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Sep 4, 2026",
    floodSource: "LDRRMOs as of 7:00 PM, Sep 4, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 4, 2026",
    popTotals: [344, 79669, 277050, 1371, 4446, 36, 3362, 2003, 11246, 6056],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "ACTIVE", 2, 217, 8, 689, 16],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [30, 8185, 32614, 227, 860, "ACTIVE", 12, 842, 812, 2806, 2674],
      "Paniqui": [26, 12271, 39184, 718, 2097, "ACTIVE", 11, 1755, 1017, 5710, 2800],
      "Pura": [12, 115, 519, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "ACTIVE", 4, 67, 63, 256, 238],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [6, 384, 1461, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [64, 15127, 51891, 47, 159, "ACTIVE", 1, 93, 18, 344, 71],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "ACTIVE", 1, 133, 50, 556, 156],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 15, "Paniqui": 6, "Pura": 1, "Ramos": 2, "Gerona": 3, "Concepcion": 1 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "11,074", partialHa: "10,792.78", totalHa: "2,859.40", valuePhp: 420337698.96 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "11,090", partialHa: "10,808.61", totalHa: "2,875.23", valuePhp: 421455398.96 }
    ],
    agriTotalPhp: 421455398.96,
    infraTotalPhp: 2582000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 35, housesPartially: 40,
    assistCols: [13647289.0, 375934.83, 6524264.64, 280000.0, 4802853.0, 612964.0],
    assistTotalPhp: 26243305.47,
    assistByLgu: {}
  },
  "24": {
    updateNo: 24,
    dateStr: "Sep 5, 2026",
    cutoffTime: "7:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Sep 5, 2026",
    floodSource: "LDRRMOs as of 7:00 PM, Sep 5, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 4, 2026",
    popTotals: [348, 79599, 278420, 1371, 4446, 33, 3361, 1684, 11248, 5082],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "ACTIVE", 2, 217, 8, 689, 16],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8430, 33785, 227, 860, "ACTIVE", 11, 843, 717, 2808, 2381],
      "Paniqui": [26, 12271, 39184, 718, 2097, "ACTIVE", 9, 1755, 813, 5710, 2209],
      "Pura": [12, 115, 519, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "ACTIVE", 4, 67, 39, 256, 148],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [64, 15125, 51891, 47, 159, "ACTIVE", 1, 93, 16, 344, 71],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "ACTIVE", 1, 133, 50, 556, 156],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 12, "Paniqui": 8, "Ramos": 2, "Gerona": 3, "Concepcion": 1 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "11,074", partialHa: "10,792.78", totalHa: "2,859.40", valuePhp: 420337698.96 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "11,090", partialHa: "10,808.61", totalHa: "2,875.23", valuePhp: 421455398.96 }
    ],
    agriTotalPhp: 421455398.96,
    infraTotalPhp: 2582000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 35, housesPartially: 40,
    assistCols: [13647289.0, 489111.93, 6890714.64, 280000.0, 4802853.0, 612964.0],
    assistTotalPhp: 26722932.57,
    assistByLgu: {}
  },
  "25": {
    updateNo: 25,
    dateStr: "Sep 6, 2026",
    cutoffTime: "7:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 5:00 PM, Sep 5, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Sep 6, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 5, 2026",
    popTotals: [348, 79599, 278420, 1371, 4446, 33, 3361, 1684, 11248, 5082],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "ACTIVE", 2, 217, 8, 689, 16],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8430, 33785, 227, 860, "ACTIVE", 11, 843, 717, 2808, 2381],
      "Paniqui": [26, 12271, 39184, 718, 2097, "ACTIVE", 9, 1755, 813, 5710, 2209],
      "Pura": [12, 115, 519, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "ACTIVE", 4, 67, 39, 256, 148],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [64, 15125, 51891, 47, 159, "ACTIVE", 1, 93, 16, 344, 71],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "ACTIVE", 1, 133, 50, 556, 156],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 12, "Paniqui": 6, "Ramos": 1, "Gerona": 1, "Concepcion": 1 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "11,074", partialHa: "10,792.78", totalHa: "2,859.40", valuePhp: 420337698.96 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "11,090", partialHa: "10,808.61", totalHa: "2,875.23", valuePhp: 421455398.96 }
    ],
    agriTotalPhp: 421455398.96,
    infraTotalPhp: 2582000000.0,
    dead: 0, injured: 0, missing: 0,
    housesTotally: 35, housesPartially: 40,
    assistCols: [13647289.0, 489111.93, 6890714.64, 280000.0, 4802853.0, 612964.0],
    assistTotalPhp: 26722932.57,
    assistByLgu: {}
  },
  "26": {
    updateNo: 26,
    dateStr: "Sep 7, 2026",
    cutoffTime: "7:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 7:00 PM, Sep 7, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Sep 7, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 7, 2026",
    popTotals: [348, 80564, 280279, 1371, 4446, 20, 3365, 1034, 11256, 3077],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "CLOSED", 0, 217, 0, 689, 0],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8433, 33787, 227, 860, "ACTIVE", 8, 845, 561, 2808, 1784],
      "Paniqui": [26, 12273, 39189, 718, 2097, "ACTIVE", 4, 1757, 370, 5715, 962],
      "Pura": [12, 115, 519, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "ACTIVE", 1, 67, 1, 256, 2],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [64, 15725, 53743, 47, 159, "ACTIVE", 1, 91, 17, 347, 74],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "ACTIVE", 1, 133, 50, 556, 156],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 9, "Paniqui": 4, "Gerona": 1, "Concepcion": 1 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "11,474", partialHa: "10,958.15", totalHa: "3,006.50", valuePhp: 438048577.0 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "11,490", partialHa: "10,973.98", totalHa: "3,022.33", valuePhp: 439166277.0 }
    ],
    agriTotalPhp: 439166277.0,
    infraTotalPhp: 2582000000.0,
    dead: 8, injured: 1, missing: 1,
    housesTotally: 35, housesPartially: 40,
    assistCols: [13647289.0, 488613.43, 7912503.39, 610000.0, 4862853.0, 612964.0],
    assistTotalPhp: 28134222.82,
    assistByLgu: {}
  },
  "27": {
    updateNo: 27,
    dateStr: "Sep 8, 2026",
    cutoffTime: "7:00 PM",
    popSource: "PSWDO Disaster Monitoring Report as of 7:00 PM, Sep 8, 2026",
    floodSource: "LDRRMOs as of 6:00 PM, Sep 8, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 8, 2026",
    popTotals: [349, 80564, 280279, 1371, 4446, 18, 3365, 863, 11256, 2593],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "CLOSED", 0, 217, 0, 689, 0],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8433, 33787, 227, 860, "ACTIVE", 7, 845, 470, 2808, 1443],
      "Paniqui": [26, 12273, 39189, 718, 2097, "ACTIVE", 4, 1757, 291, 5715, 819],
      "Pura": [12, 115, 519, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "CLOSED", 0, 67, 0, 256, 0],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "ACTIVE", 2, 28, 28, 67, 67],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [65, 15725, 53743, 47, 159, "ACTIVE", 1, 91, 17, 347, 74],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "ACTIVE", 1, 133, 50, 556, 156],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 8, "Paniqui": 4, "Concepcion": 1 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "10,419", partialHa: "10,878.41", totalHa: "3,048.11", valuePhp: 439183290.52 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "10,435", partialHa: "10,894.24", totalHa: "3,063.94", valuePhp: 440300990.52 }
    ],
    agriTotalPhp: 440300990.52,
    infraTotalPhp: 2582000000.0,
    dead: 8, injured: 1, missing: 1,
    housesTotally: 35, housesPartially: 40,
    assistCols: [13647289.0, 488613.43, 7912503.39, 610000.0, 4862853.0, 612964.0],
    assistTotalPhp: 28134222.82,
    assistByLgu: {}
  },
  "28": {
    updateNo: 28,
    dateStr: "Sep 9, 2026",
    cutoffTime: "7:00 PM",
    popSource: "DSWD Disaster Monitoring Report as of 7:00 PM, Sep 9, 2026",
    floodSource: "LDRRMOs as of 5:00 PM, Sep 9, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 9, 2026",
    popTotals: [349, 80573, 280301, 1371, 4446, 15, 3380, 698, 11327, 2183],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "CLOSED", 0, 217, 0, 689, 0],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8442, 33809, 227, 860, "ACTIVE", 7, 845, 383, 2808, 1231],
      "Paniqui": [26, 12273, 39189, 718, 2097, "ACTIVE", 4, 1757, 284, 5715, 803],
      "Pura": [12, 115, 519, 0, 0, "ACTIVE", 3, 14, 14, 75, 75],
      "Ramos": [8, 955, 3742, 38, 135, "CLOSED", 0, 67, 0, 256, 0],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 11, 0, 43, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "CLOSED", 0, 28, 0, 67, 0],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [65, 15725, 53743, 47, 159, "ACTIVE", 1, 93, 17, 352, 74],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "CLOSED", 0, 133, 0, 556, 0],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 6, "Paniqui": 4 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "10,597", partialHa: "11,186.26", totalHa: "3,050.36", valuePhp: 459867384.35 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "10,613", partialHa: "11,202.09", totalHa: "3,066.19", valuePhp: 460985084.35 }
    ],
    agriTotalPhp: 460985084.35,
    infraTotalPhp: 2582000000.0,
    dead: 8, injured: 1, missing: 1,
    housesTotally: 35, housesPartially: 40,
    assistCols: [13647289.0, 488613.43, 7912503.39, 610000.0, 4862853.0, 612964.0],
    assistTotalPhp: 28134222.82,
    assistByLgu: {}
  },
  "29": {
    updateNo: 29,
    dateStr: "Sep 10, 2026",
    cutoffTime: "7:00 PM",
    popSource: "DSWD Disaster Monitoring Report as of 7:00 PM, Sep 10, 2026",
    floodSource: "LDRRMOs as of 5:00 PM, Sep 10, 2026 (See Annex)",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 10, 2026",
    popTotals: [350, 80588, 280374, 1371, 4446, 15, 3366, 691, 11256, 2142],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "CLOSED", 0, 217, 0, 689, 0],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8442, 33809, 227, 860, "ACTIVE", 7, 845, 383, 2808, 1231],
      "Paniqui": [26, 12273, 39189, 718, 2097, "ACTIVE", 4, 1757, 284, 5715, 803],
      "Pura": [13, 130, 592, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "CLOSED", 0, 67, 0, 256, 0],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "CLOSED", 0, 28, 0, 67, 0],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [65, 15725, 53743, 47, 159, "ACTIVE", 1, 92, 17, 347, 74],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "CLOSED", 0, 133, 0, 556, 0],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 3, "Paniqui": 4 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "10,621", partialHa: "11,222.86", totalHa: "3,050.36", valuePhp: 459335324.35 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "10,637", partialHa: "11,238.69", totalHa: "3,066.19", valuePhp: 460453024.35 }
    ],
    agriTotalPhp: 460453024.35,
    infraTotalPhp: 2582000000.0,
    dead: 8, injured: 1, missing: 1,
    housesTotally: 35, housesPartially: 40,
    assistCols: [14222184.0, 488614.43, 7920269.59, 610000.0, 4870553.0, 612964.0],
    assistTotalPhp: 28724585.02,
    assistByLgu: {}
  },
  "30": {
    updateNo: 30,
    dateStr: "Sep 11, 2026",
    cutoffTime: "7:00 PM",
    popSource: "DSWD Disaster Monitoring Report as of 7:00 PM, Sep 11, 2026",
    floodSource: "LDRRMOs as of 5:00 PM, Sep 11, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 10, 2026",
    popTotals: [351, 80603, 280422, 1371, 4446, 15, 3366, 670, 11256, 2082],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "CLOSED", 0, 217, 0, 689, 0],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8442, 33809, 227, 860, "ACTIVE", 7, 845, 375, 2808, 1203],
      "Paniqui": [27, 12288, 39237, 718, 2097, "ACTIVE", 4, 1757, 271, 5715, 771],
      "Pura": [13, 130, 592, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "CLOSED", 0, 67, 0, 256, 0],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "CLOSED", 0, 28, 0, 67, 0],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [65, 15725, 53743, 47, 159, "ACTIVE", 1, 92, 17, 347, 74],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "CLOSED", 0, 133, 0, 556, 0],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Moncada": 3, "Paniqui": 4 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "10,621", partialHa: "11,222.86", totalHa: "3,050.36", valuePhp: 459335324.35 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "10,637", partialHa: "11,238.69", totalHa: "3,066.19", valuePhp: 460453024.35 }
    ],
    agriTotalPhp: 460453024.35,
    infraTotalPhp: 2582000000.0,
    dead: 8, injured: 1, missing: 1,
    housesTotally: 35, housesPartially: 40,
    assistCols: [14222184.0, 488614.43, 8487882.99, 747000.0, 5020553.0, 612964.0],
    assistTotalPhp: 29579198.42,
    assistByLgu: {}
  },
  "31": {
    updateNo: 31,
    dateStr: "Sep 14, 2026",
    cutoffTime: "6:00 PM",
    popSource: "DSWD Disaster Monitoring Report as of 5:00 PM, Sep 14, 2026",
    floodSource: "LDRRMOs as of 5:00 PM, Sep 14, 2026",
    agriSource: "DA-OPA Damage Assessment Report as of 3:00 PM, Sep 10, 2026",
    popTotals: [353, 83169, 288832, 1371, 4446, 13, 3366, 557, 11257, 1801],
    lguPop: {
      "Anao": [11, 38, 140, 0, 0, "-", 0, 0, 0, 0, 0],
      "Camiling": [49, 11956, 39755, 130, 393, "CLOSED", 0, 217, 0, 689, 0],
      "Mayantoc": [6, 621, 2427, 0, 0, "-", 0, 0, 0, 0, 0],
      "Moncada": [31, 8442, 33809, 227, 860, "ACTIVE", 7, 845, 375, 2808, 1203],
      "Paniqui": [28, 12302, 39304, 718, 2097, "ACTIVE", 2, 1757, 157, 5715, 489],
      "Pura": [13, 130, 592, 0, 0, "ACTIVE", 3, 7, 7, 34, 34],
      "Ramos": [8, 955, 3742, 38, 135, "CLOSED", 0, 67, 0, 256, 0],
      "San Clemente": [5, 155, 558, 0, 0, "CLOSED", 0, 5, 0, 18, 0],
      "San Manuel": [10, 387, 1103, 0, 0, "-", 0, 0, 0, 0, 0],
      "Sta. Ignacia": [15, 907, 3109, 0, 0, "CLOSED", 0, 28, 0, 67, 0],
      "Gerona": [9, 431, 1660, 0, 0, "-", 0, 0, 0, 0, 0],
      "San Jose": [3, 125, 676, 0, 0, "-", 0, 0, 0, 0, 0],
      "Tarlac City": [66, 18277, 62086, 47, 159, "ACTIVE", 1, 93, 18, 348, 75],
      "Victoria": [24, 2519, 9311, 8, 23, "CLOSED", 0, 10, 0, 38, 0],
      "Bamban": [7, 745, 3103, 72, 281, "CLOSED", 0, 72, 0, 284, 0],
      "Capas": [12, 3566, 11383, 58, 249, "CLOSED", 0, 133, 0, 556, 0],
      "Concepcion": [35, 10465, 34814, 0, 0, "CLOSED", 0, 1, 0, 5, 0],
      "La Paz": [21, 11148, 41260, 73, 249, "CLOSED", 0, 132, 0, 439, 0]
    },
    muniFloodCounts: { "Paniqui": 2 },
    agriRows: [
      { commodity: "RICE", lgus: "18", farmers: "10,621", partialHa: "11,222.86", totalHa: "3,050.36", valuePhp: 459335324.35 },
      { commodity: "CORN", lgus: "2", farmers: "16", partialHa: "15.83", totalHa: "15.83", valuePhp: 1117700.0 },
      { commodity: "TOTAL", lgus: "18", farmers: "10,637", partialHa: "11,238.69", totalHa: "3,066.19", valuePhp: 460453024.35 }
    ],
    agriTotalPhp: 460453024.35,
    infraTotalPhp: 2582000000.0,
    dead: 8, injured: 1, missing: 1,
    housesTotally: 35, housesPartially: 40,
    assistCols: [14222184.0, 488614.43, 8549832.99, 792000.0, 5020553.0, 612964.0],
    assistTotalPhp: 29686148.42,
    assistByLgu: {}
  }
};

export function getFieldOversightBySitrep(updateNo) {
  const sr = Number(updateNo) || 31;

  if (sr <= 7) {
    return {
      asOfNote: `As of Sitrep #${sr} cutoff`,
      checkins: [
        {
          unit: "PDRRMO Tarlac",
          checkIn: "Aug 8, 2026, 8:00 AM",
          checkOut: sr === 3 ? "Active at OpCen" : "Checked in at OpCen",
          state: "active",
          pax: 20,
          vehicles: "3 ambulances, 2 rescue trucks, 2 fire engines, 1 military truck, 1 ref truck, 1 self-loading truck, 3 ERVs"
        },
        {
          unit: "PGT-PEPO",
          checkIn: "Aug 9, 2026, 12:10 PM",
          checkOut: "Checked in at OpCen",
          state: "active",
          pax: 7,
          vehicles: "6 dump trucks, 2 cargo trucks"
        },
        {
          unit: "31st Mech Inf Co, 3rd Mech Inf Bn, PA",
          checkIn: "Aug 9, 2026, 9:15 AM",
          checkOut: sr >= 6 ? "Demobilized Aug 11, 2026, 7:12 AM" : "Checked in at OpCen",
          state: sr >= 6 ? "demobilized" : "active",
          pax: 10,
          vehicles: "1 KM 450 tactical truck"
        },
        {
          unit: "7th Civil Military Operations (GWAPO) Bn, PA",
          checkIn: "Aug 9, 2026, 3:40 PM",
          checkOut: sr >= 6 ? "Demobilized Aug 10, 2026, 10:15 AM" : "Checked in at OpCen",
          state: sr >= 6 ? "demobilized" : "active",
          pax: 5,
          vehicles: "1 KM 450 tactical truck"
        },
        {
          unit: "522nd Engineer Construction Bn, PA & TOG3-PAF",
          checkIn: "Aug 8, 2026",
          checkOut: "SRR teams on standby at respective HQ",
          state: "standby",
          pax: 0,
          vehicles: "Search and rescue teams on standby"
        }
      ],
      deployments: [
        ...(sr >= 7 ? [{
          unit: "PDRRMO SAR Team",
          dest: "Lucung River, Brgy. Cubcub, Capas",
          mission: "Site assessment and SAR survey for drowning incident with Capas MDRRMO",
          dispatched: "Aug 13, 2026, 4:50 PM",
          returnStatus: "Return not logged: active SAR operation on site",
          state: "active",
          assets: "2 ERVs, 1 rubber boat with OBM, 1 fiber boat"
        }] : []),
        ...(sr >= 6 ? [
          {
            unit: "PDRRMO",
            dest: "Tarlac-Sta. Rosa Road, Maliwalo, Tarlac City",
            mission: "Clearing of uprooted mango tree with PNP",
            dispatched: "Aug 11, 2026, 9:45 PM",
            returnStatus: "Completed one-day clearing run",
            state: "completed",
            assets: "1 ERV, 3 personnel"
          },
          {
            unit: "PDRRMO",
            dest: "Parua River, Concepcion & DSWD R3 Warehouse",
            mission: "Delivered 3,000 sacks for sandbagging; hauled FFPs for Tarlac City",
            dispatched: "Aug 11, 2026, 8:30 AM & 5:58 PM",
            returnStatus: "Completed logistics run",
            state: "completed",
            assets: "1 refrigerated truck, 2 personnel"
          },
          {
            unit: "PGT-PEPO & PDRRMO",
            dest: "Brgy. Poblacion A, Camiling",
            mission: "Delivered 1 truckload of sand and 500 sacks for sandbagging",
            dispatched: "Aug 10, 2026, 11:41 AM",
            returnStatus: "Completed sandbagging augmentation",
            state: "completed",
            assets: "1 dump truck, 2 personnel"
          }
        ] : []),
        {
          unit: "3rd Mechanized Infantry Battalion, PA",
          dest: "Camiling MDRRM Operations Center",
          mission: "Pre-positioned SRR team for flood response",
          dispatched: "Aug 8, 2026, 10:30 PM",
          returnStatus: sr >= 6 ? "Demobilized Aug 10, 2026, 6:00 PM" : "Return not logged: pre-positioned for the event",
          state: sr >= 6 ? "completed" : "active",
          assets: "1 KM 450 truck, 9 personnel"
        },
        {
          unit: "PDRRMO & 7th CMO Battalion, PA",
          dest: "Provincewide (Camiling & low-lying LGUs)",
          mission: "Roving inspection and flood monitoring",
          dispatched: "Aug 9, 2026, 4:50 PM",
          returnStatus: "Return not logged: one-day roving run",
          state: "completed",
          assets: "3 ERVs, 1 KM 450 truck, 14 personnel"
        }
      ]
    };
  }

  if (sr === 8) {
    return {
      asOfNote: "As of Sitrep #8 (Aug 14, 2026, 6:00 PM)",
      checkins: [
        {
          unit: "PDRRMO Tarlac",
          checkIn: "Aug 8, 2026, 8:00 AM",
          checkOut: "Checked in at OpCen",
          state: "active",
          pax: 20,
          vehicles: "3 ambulances, 2 rescue trucks, 2 fire engines, 1 military truck, 1 ref truck, 3 ERVs"
        },
        {
          unit: "522nd Engineer Construction Battalion, PA",
          checkIn: "Aug 14, 2026, 6:00 AM",
          checkOut: "Checked in at Capas MDRRM",
          state: "active",
          pax: 9,
          vehicles: "1 KM 450 truck, 1 rubber boat"
        },
        {
          unit: "Tactical Operations Group 3 (TOG3), PAF",
          checkIn: "Aug 14, 2026, 6:00 AM",
          checkOut: "Checked in at Capas MDRRM",
          state: "active",
          pax: 9,
          vehicles: "1 KM 450 truck, 1 rubber boat"
        },
        {
          unit: "PGT-PEPO",
          checkIn: "Aug 9, 2026, 12:10 PM",
          checkOut: "Checked in at OpCen",
          state: "active",
          pax: 7,
          vehicles: "6 dump trucks, 2 cargo trucks"
        },
        {
          unit: "31st Mech Inf Co, 3rd Mech Inf Bn, PA",
          checkIn: "Aug 9, 2026, 9:15 AM",
          checkOut: "Demobilized Aug 11, 2026, 7:12 AM",
          state: "demobilized",
          pax: 10,
          vehicles: "1 KM 450 tactical truck"
        },
        {
          unit: "7th Civil Military Operations (GWAPO) Bn, PA",
          checkIn: "Aug 9, 2026, 3:40 PM",
          checkOut: "Demobilized Aug 10, 2026, 10:15 AM",
          state: "demobilized",
          pax: 5,
          vehicles: "1 KM 450 tactical truck"
        }
      ],
      deployments: [
        {
          unit: "PDRRMO, 3rd Mech Inf Bn, BFP SRU & Paniqui/Moncada MDRRMOs",
          dest: "Pantol River, Brgy. Nancamarinan, Paniqui",
          mission: "Joint SAR operation for missing 55-year-old male",
          dispatched: "Aug 14, 2026, 1:26 PM",
          returnStatus: "Return not logged: active SAR operation on site",
          state: "active",
          assets: "2 ERVs, 1 KM 450, 1 fiber boat with OBM, 12 personnel"
        },
        {
          unit: "PDRRMO, TOG3-PAF, 522nd ECB & Capas/Concepcion MDRRMOs",
          dest: "Lucung River, Brgy. Cubcub, Capas",
          mission: "Joint SAR operation for missing 17-year-old drowning victim",
          dispatched: "Aug 14, 2026, 6:00 AM",
          returnStatus: "Return not logged: active SAR operation on site",
          state: "active",
          assets: "2 ERVs, 2 KM 450 trucks, 3 rubber/fiber boats, 25 personnel"
        },
        {
          unit: "PDRRMO",
          dest: "Lucung and Parua Rivers, Concepcion",
          mission: "Delivered additional 3,000 sacks for sandbagging (6,000 total)",
          dispatched: "Aug 14, 2026, 2:00 PM",
          returnStatus: "Completed logistics run",
          state: "completed",
          assets: "1 ERV, 2 personnel"
        },
        {
          unit: "PDRRMO",
          dest: "Caramutan Evacuation Center, La Paz",
          mission: "Hauled blankets from PSWDO to La Paz EC",
          dispatched: "Aug 14, 2026, 7:48 AM",
          returnStatus: "Completed relief delivery",
          state: "completed",
          assets: "1 ERV, 1 personnel"
        }
      ]
    };
  }

  if (sr <= 18) {
    return {
      asOfNote: `As of Sitrep #${sr} cutoff`,
      checkins: [
        {
          unit: "PDRRMO Tarlac",
          checkIn: "Aug 8, 2026, 8:00 AM",
          checkOut: "Checked in at OpCen",
          state: "active",
          pax: 20,
          vehicles: "3 ambulances, 2 rescue trucks, 2 fire engines, 1 military truck, 1 ref truck, 3 ERVs"
        },
        {
          unit: "PGT-PEPO",
          checkIn: "Aug 9, 2026, 12:10 PM",
          checkOut: "Checked in at OpCen",
          state: "active",
          pax: 7,
          vehicles: "6 dump trucks, 2 cargo trucks"
        },
        {
          unit: "522nd Engineer Construction Battalion, PA",
          checkIn: "Aug 14, 2026, 6:00 AM",
          checkOut: "Demobilized Aug 15, 2026 (SAR completed)",
          state: "demobilized",
          pax: 9,
          vehicles: "1 KM 450 truck, 1 rubber boat"
        },
        {
          unit: "Tactical Operations Group 3 (TOG3), PAF",
          checkIn: "Aug 14, 2026, 6:00 AM",
          checkOut: "Demobilized Aug 15, 2026 (SAR completed)",
          state: "demobilized",
          pax: 9,
          vehicles: "1 KM 450 truck, 1 rubber boat"
        },
        {
          unit: "31st Mech Inf Co, 3rd Mech Inf Bn, PA",
          checkIn: "Aug 9, 2026, 9:15 AM",
          checkOut: "Demobilized Aug 11, 2026, 7:12 AM",
          state: "demobilized",
          pax: 10,
          vehicles: "1 KM 450 tactical truck"
        }
      ],
      deployments: [
        {
          unit: "PDRRMO, Tarlac CDRRMC & DPWH 1st DEO",
          dest: "Tarlac River Slope Dike, Brgy. San Isidro, Tarlac City",
          mission: "Joint sandbagging and rope/equipment augmentation for collapsed slope dike",
          dispatched: "Aug 17, 2026, 5:19 AM",
          returnStatus: sr <= 10 ? "Return not logged: active sandbagging on site" : "Completed sandbagging augmentation",
          state: sr <= 10 ? "active" : "completed",
          assets: "ERVs, 2,800+ sacks, rope & sandbagging teams"
        },
        {
          unit: "PDRRMO, 3rd Mech Inf Bn & Paniqui/Moncada MDRRMOs",
          dest: "Pantol River, Brgy. Nancamarinan, Paniqui",
          mission: "SAR operation (body retrieved Aug 15, 2026)",
          dispatched: "Aug 14, 2026, 1:26 PM",
          returnStatus: "Demobilized Aug 15, 2026",
          state: "completed",
          assets: "2 ERVs, 1 KM 450, 1 fiber boat, 12 personnel"
        },
        {
          unit: "PDRRMO, TOG3-PAF, 522nd ECB & Capas MDRRMO",
          dest: "Lucung River, Brgy. Cubcub, Capas",
          mission: "SAR operation (body retrieved Aug 15, 2026, 12:30 PM)",
          dispatched: "Aug 14, 2026, 6:00 AM",
          returnStatus: "Demobilized Aug 15, 2026",
          state: "completed",
          assets: "2 ERVs, 2 KM 450 trucks, 2 rubber boats, 25 personnel"
        },
        {
          unit: "3rd Mechanized Infantry Battalion, PA",
          dest: "Camiling MDRRM Operations Center",
          mission: "Pre-positioned SRR team",
          dispatched: "Aug 8, 2026, 10:30 PM",
          returnStatus: "Demobilized Aug 10, 2026, 6:00 PM",
          state: "completed",
          assets: "1 KM 450 truck, 9 personnel"
        }
      ]
    };
  }

  const is522Demob = sr >= 27;
  return {
    asOfNote: `As of Sitrep #${sr} cutoff`,
    checkins: [
      {
        unit: "PDRRMO Tarlac",
        checkIn: "Aug 8, 2026, 8:00 AM",
        checkOut: "Checked in at OpCen",
        state: "active",
        pax: 20,
        vehicles: "3 ambulances, 2 rescue trucks, 2 fire engines, 3 ERVs"
      },
      {
        unit: "PGT-PEPO",
        checkIn: "Aug 9, 2026, 12:10 PM",
        checkOut: "Checked in at OpCen",
        state: "active",
        pax: 27,
        vehicles: "26 dump trucks, 2 cargo trucks, 1 loader, 1 backhoe, 1 bulldozer"
      },
      {
        unit: "3rd Mechanized Infantry Battalion, PA",
        checkIn: "Aug 29, 2026, 8:00 AM",
        checkOut: "Checked in at OpCen",
        state: "active",
        pax: 13,
        vehicles: "1 KM 450 tactical truck"
      },
      {
        unit: "Tactical Operations Group 3 (TOG3), PAF",
        checkIn: "Aug 29, 2026, 9:00 AM",
        checkOut: "Checked in at OpCen",
        state: "active",
        pax: 11,
        vehicles: "1 KM 450 truck, 1 rubber boat with OBM"
      },
      {
        unit: "522nd Engineer Construction Battalion, PA",
        checkIn: "Aug 29, 2026, 9:00 AM",
        checkOut: is522Demob ? "Demobilized Sep 8, 2026" : "Checked in at OpCen",
        state: is522Demob ? "demobilized" : "active",
        pax: 14,
        vehicles: "1 KM 450 truck, 1 rubber boat"
      }
    ],
    deployments: [
      ...(sr >= 31 ? [{
        unit: "PDRRMO",
        dest: "Agana Bridge, Romulo Highway, Tarlac City",
        mission: "Site safety monitoring at collapsed bridge approach",
        dispatched: "Sep 14, 2026, 9:00 AM",
        returnStatus: "Return not logged: still deployed on site",
        state: "active",
        assets: "1 ERV, 3 personnel"
      }] : []),
      ...(sr >= 25 ? [{
        unit: "PGT-PEPO",
        dest: "Agana Bridge, Romulo Highway, Tarlac City",
        mission: "Heavy equipment pre-positioning and embankment works",
        dispatched: "Sep 6, 2026, 8:00 AM",
        returnStatus: "Return not logged: pre-positioned for the event",
        state: "active",
        assets: "1 bulldozer, 1 backhoe, 3 dump trucks"
      }] : []),
      ...(sr >= 30 ? [
        {
          unit: "PDRRMO",
          dest: "Provincial Evacuation Center, Tarlac City",
          mission: "Water supply and sanitation support run",
          dispatched: "Sep 12, 2026, 10:00 AM",
          returnStatus: "Return not logged: one-day roving run",
          state: "completed",
          assets: "1 fire engine, 2 personnel"
        },
        {
          unit: "3rd Mechanized Infantry Battalion, PA",
          dest: "PGT Warehouse, Tarlac City",
          mission: "Hauling and stockpiling of relief family food packs",
          dispatched: "Sep 11, 2026, 8:30 AM",
          returnStatus: "Return not logged: one-day roving run",
          state: "completed",
          assets: "10 personnel"
        }
      ] : []),
      ...(sr < 25 ? [
        {
          unit: "PDRRMO, 3rd Mech Inf Bn, TOG3-PAF & 522nd ECB",
          dest: "Paniqui, Moncada, Camiling, and La Paz flood zones",
          mission: "Pre-emptive evacuation and high-water rescue augmentation",
          dispatched: "Aug 30, 2026, 6:00 AM",
          returnStatus: "Return not logged: pre-positioned for the event",
          state: "active",
          assets: "3 KM 450 trucks, 2 rubber boats, 3 ERVs"
        }
      ] : [])
    ]
  };
}

export const FIELD_CHECKINS = getFieldOversightBySitrep(31).checkins;
export const FIELD_DEPLOYMENTS = getFieldOversightBySitrep(31).deployments;