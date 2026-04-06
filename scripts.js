/* ================================================================
   NJ FLOOD RISK — COUNTY FACT SHEET
   scripts.js  ·  CSV-driven Data + Rendering + PDF Export
   People-centered: displacement & risk metrics use population
   ================================================================ */

// ── GLOBAL STATE ──────────────────────────────────────────────────
let COUNTIES = {};   // populated from CSV
let FEMA = {};       // populated from CSV
let CSV_DATA = {};   // raw CSV rows keyed by county
let NONRENEWALS = {}; // populated from non-renewals CSV

// ── CONGRESSIONAL REPS (from NJ_Congress.geojson) ─────────────────
const CONGRESS = {
  "01": { name: "Donald Norcross", party: "D", phone: "(202) 225-6501" },
  "02": { name: "Jefferson Van Drew", party: "R", phone: "(202) 225-6572" },
  "03": { name: "Herbert Conaway", party: "D", phone: "(202) 225-4765" },
  "04": { name: "Christopher Smith", party: "R", phone: "(202) 225-3765" },
  "05": { name: "Josh Gottheimer", party: "D", phone: "(202) 225-4465" },
  "06": { name: "Frank Pallone", party: "D", phone: "(202) 225-4671" },
  "07": { name: "Thomas Kean", party: "R", phone: "(202) 225-5361" },
  "08": { name: "Robert Menendez", party: "D", phone: "(202) 225-7919" },
  "09": { name: "Nellie Pou", party: "D", phone: "(202) 225-5751" },
  "10": { name: "LaMonica McIver", party: "D", phone: "(202) 225-3436" },
  "11": { name: "Mikie Sherrill", party: "D", phone: "(202) 225-5034" },
  "12": { name: "Bonnie Watson Coleman", party: "D", phone: "(202) 225-5801" }
};

// ── STATE LEGISLATURE (from NJ_Senate.geojson + NJ_House.geojson) ─
const LEGISLATURE = {
  "1": { senator: "Michael L. Testa, Jr.", sparty: "R", a1: "Antwan L. McClellan", a1p: "R", a2: "Erik K. Simonsen", a2p: "R" },
  "2": { senator: "Vincent J. Polistina", sparty: "R", a1: "Donald A. Guardian", a1p: "R", a2: "Claire S. Swift", a2p: "R" },
  "3": { senator: "John J. Burzichelli", sparty: "D", a1: "David Bailey, Jr.", a1p: "D", a2: "Heather Simmons", a2p: "D" },
  "4": { senator: "Paul D. Moriarty", sparty: "D", a1: "Dan Hutchison", a1p: "D", a2: "Cody D. Miller", a2p: "D" },
  "5": { senator: "Nilsa I. Cruz-Perez", sparty: "D", a1: "William F. Moen, Jr.", a1p: "D", a2: "William W. Spearman", a2p: "D" },
  "6": { senator: "James Beach", sparty: "D", a1: "Louis D. Greenwald", a1p: "D", a2: "Melinda Kane", a2p: "D" },
  "7": { senator: "Troy Singleton", sparty: "D", a1: "Balvir Singh", a1p: "D", a2: "Carol A. Murphy", a2p: "D" },
  "8": { senator: "Latham Tiver", sparty: "R", a1: "Andrea Katz", a1p: "D", a2: "Michael Torrissi, Jr.", a2p: "R" },
  "9": { senator: "Carmen F. Amato, Jr.", sparty: "R", a1: "Gregory E. Myhre", a1p: "R", a2: "Brian E. Rumpf", a2p: "R" },
  "10": { senator: "James W. Holzapfel", sparty: "R", a1: "Paul Kanitra", a1p: "R", a2: "Gregory P. McGuckin", a2p: "R" },
  "11": { senator: "Vin Gopal", sparty: "D", a1: "Margie Donlon, M.D.", a1p: "D", a2: "Luanne M. Peterpaul, Esq.", a2p: "D" },
  "12": { senator: "Owen Henry", sparty: "R", a1: "Robert D. Clifton", a1p: "R", a2: "Alex Sauickie", a2p: "R" },
  "13": { senator: "Declan J. O'Scanlon, Jr.", sparty: "R", a1: "Victoria A. Flynn", a1p: "R", a2: "Gerry Scharfenberger", a2p: "R" },
  "14": { senator: "Linda R. Greenstein", sparty: "D", a1: "Wayne P. DeAngelo", a1p: "D", a2: "Tennille R. McCoy", a2p: "D" },
  "15": { senator: "Shirley K. Turner", sparty: "D", a1: "Verlina Reynolds-Jackson", a1p: "D", a2: "Anthony S. Verrelli", a2p: "D" },
  "16": { senator: "Andrew Zwicker", sparty: "D", a1: "Mitchelle Drulis", a1p: "D", a2: "Roy Freiman", a2p: "D" },
  "17": { senator: "Bob Smith", sparty: "D", a1: "Joe Danielsen", a1p: "D", a2: "Kevin P. Egan", a2p: "D" },
  "18": { senator: "Patrick J. Diegnan, Jr.", sparty: "D", a1: "Robert J. Karabinchak", a1p: "D", a2: "Sterley S. Stanley", a2p: "D" },
  "19": { senator: "Joseph F. Vitale", sparty: "D", a1: "Craig J. Coughlin", a1p: "D", a2: "Yvonne Lopez", a2p: "D" },
  "20": { senator: "Joseph P. Cryan", sparty: "D", a1: "Reginald W. Atkins", a1p: "D", a2: "Annette Quijano", a2p: "D" },
  "21": { senator: "Jon M. Bramnick", sparty: "R", a1: "Michele Matsikoudis", a1p: "R", a2: "Nancy F. Munoz", a2p: "R" },
  "22": { senator: "Nicholas P. Scutari", sparty: "D", a1: "Linda S. Carter", a1p: "D", a2: "James J. Kennedy", a2p: "D" },
  "23": { senator: "Douglas J. Steinhardt", sparty: "R", a1: "John DiMaio", a1p: "R", a2: "Erik Peterson", a2p: "R" },
  "24": { senator: "Parker Space", sparty: "R", a1: "Dawn Fantasia", a1p: "R", a2: "Michael Inganamort", a2p: "R" },
  "25": { senator: "Anthony M. Bucco", sparty: "R", a1: "Christian E. Barranco", a1p: "R", a2: "Aura K. Dunn", a2p: "R" },
  "26": { senator: "Joseph Pennacchio", sparty: "R", a1: "Brian Bergen", a1p: "R", a2: "Jay Webber", a2p: "R" },
  "27": { senator: "John F. McKeon", sparty: "D", a1: "Rosy Bagolie", a1p: "D", a2: "Alixon Collazos-Gill", a2p: "D" },
  "28": { senator: "Renee C. Burgess", sparty: "D", a1: "Garnet R. Hall", a1p: "D", a2: "Cleopatra G. Tucker", a2p: "D" },
  "29": { senator: "Teresa Ruiz", sparty: "D", a1: "Eliana Pintor Marin", a1p: "D", a2: "Shanique Speight", a2p: "D" },
  "30": { senator: "Robert W. Singer", sparty: "R", a1: "Sean T. Kean", a1p: "R", a2: 'Alexander "Avi" Schnall', a2p: "D" },
  "31": { senator: "Angela V. McKnight", sparty: "D", a1: "Barbara McCann Stamato", a1p: "D", a2: "William B. Sampson IV", a2p: "D" },
  "32": { senator: "Raj Mukherji", sparty: "D", a1: "John Allen", a1p: "D", a2: "Jessica Ramirez", a2p: "D" },
  "33": { senator: "Brian P. Stack", sparty: "D", a1: "Julio Marenco", a1p: "D", a2: "Gabriel Rodriguez", a2p: "D" },
  "34": { senator: "Britnee D. Timberlake", sparty: "D", a1: "Carmen Theresa Morales", a1p: "D", a2: "Michael Venezia", a2p: "D" },
  "35": { senator: "Benjie E. Wimberly", sparty: "D", a1: "Shavonda E. Sumter", a1p: "D", a2: "Al Abdelaziz", a2p: "D" },
  "36": { senator: "Paul A. Sarlo", sparty: "D", a1: "Clinton Calabrese", a1p: "D", a2: "Gary S. Schaer", a2p: "D" },
  "37": { senator: "Gordon M. Johnson", sparty: "D", a1: "Shama A. Haider", a1p: "D", a2: "Ellen J. Park", a2p: "D" },
  "38": { senator: "Joseph A. Lagana", sparty: "D", a1: "Lisa Swain", a1p: "D", a2: "Chris Tully", a2p: "D" },
  "39": { senator: "Holly T. Schepisi", sparty: "R", a1: "Robert Auth", a1p: "R", a2: "John V. Azzariti, Jr. M.D.", a2p: "R" },
  "40": { senator: "Kristin M. Corrado", sparty: "R", a1: "Al Barlas", a1p: "R", a2: "Christopher P. DePhillips", a2p: "R" }
};

// ── COUNTY → DISTRICT MAPPING (5% area overlap threshold from geojson spatial analysis) ─
const COUNTY_REPS = {
  "Atlantic": { congress: ["02"], senate: ["1", "2", "4", "8"] },
  "Bergen": { congress: ["05", "09"], senate: ["36", "37", "38", "39", "40"] },
  "Burlington": { congress: ["03"], senate: ["7", "8"] },
  "Camden": { congress: ["01"], senate: ["4", "5", "6"] },
  "Cape May": { congress: ["02"], senate: ["1"] },
  "Cumberland": { congress: ["02"], senate: ["1", "3"] },
  "Essex": { congress: ["10", "11"], senate: ["27", "28", "29", "34", "40"] },
  "Gloucester": { congress: ["01", "02"], senate: ["3", "4", "5"] },
  "Hudson": { congress: ["08", "09", "10"], senate: ["31", "32", "33"] },
  "Hunterdon": { congress: ["07"], senate: ["15", "16", "23"] },
  "Mercer": { congress: ["03", "12"], senate: ["14", "15", "16"] },
  "Middlesex": { congress: ["06", "12"], senate: ["12", "14", "16", "17", "18", "19"] },
  "Monmouth": { congress: ["03", "04", "06"], senate: ["11", "12", "13", "30"] },
  "Morris": { congress: ["07", "11"], senate: ["24", "25", "26"] },
  "Ocean": { congress: ["02", "04"], senate: ["9", "10", "12"] },
  "Passaic": { congress: ["05", "09", "11"], senate: ["25", "26", "27", "35", "40"] },
  "Salem": { congress: ["02"], senate: ["3"] },
  "Somerset": { congress: ["07", "12"], senate: ["16", "17", "21", "23"] },
  "Sussex": { congress: ["05", "07"], senate: ["24"] },
  "Union": { congress: ["07", "08", "10", "12"], senate: ["20", "21", "22"] },
  "Warren": { congress: ["07"], senate: ["23", "24"] }
};

// ── ASSET LABELS ────────────────────────────────────────────────
const ASSET_META = {
  airports: { label: "Airports", source: "USDOT" },
  hospitals: { label: "Hospitals", source: "NJ Office of GIS" },
  contaminated: { label: "Contaminated Sites", source: "NJDEP" },
  libraries: { label: "Libraries", source: "NJDCA GIS" },
  parks: { label: "Parks", source: "Trust for Public Land" },
  powerplants: { label: "Power Plants", source: "US EIA" },
  schools: { label: "Schools", source: "NJ Office of GIS" },
  hazwaste: { label: "Hazardous Waste Sites", source: "NJDEP" },
  landfills: { label: "Solid Waste Landfills", source: "NJDEP" },
  superfund: { label: "Superfund Sites", source: "EPA" },
  wastewater: { label: "Wastewater Treatments", source: "EPA" },
  police: { label: "Police Stations", source: "NJ Office of GIS" },
  fire: { label: "Fire Departments", source: "NJ Office of GIS" }
};

// ── CSV LOADER ────────────────────────────────────────────────────
function loadCSV(url) {
  return fetch(url)
    .then(r => r.text())
    .then(text => {
      const rows = [];
      const lines = text.split('\n');
      const headers = parseCSVLine(lines[0]);
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
        rows.push(row);
      }
      return rows;
    });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function buildDataFromCSV(rows) {
  rows.forEach(r => {
    const name = r['County'];
    if (!name) return;

    CSV_DATA[name] = r;

    const totalPop = num(r['Disp_Total_Population']);
    const atlasPop = num(r['Atlas_2024_Population']);
    const crisisPop = num(r['Disp_Crisis_Population']);
    const emigratingPop = num(r['Disp_Emigrating_Population']);
    const destinationPop = num(r['Disp_Destination_Population']);
    const stablePop = num(r['Disp_Stable_Population']);

    COUNTIES[name] = {
      geoid: r['GEOID'],
      totalParcels: num(r['Disp_Total_Parcels']),
      totalPopulation: totalPop,
      atlasPop: atlasPop,
      equalizationRatio: num(r['Disp_Equalization_Ratio']),
      pctRisk2024: num(r['Disp_2024_Share_At_Risk']),
      pctRisk2050: num(r['Disp_2050_Share_At_Risk']),
      marketValue2024: num(r['Disp_2024_Market_Value']),
      marketValue2050: num(r['Disp_2050_Market_Value']),
      taxRisk2024: num(r['Disp_2024_Property_Tax']),
      taxRisk2050: num(r['Disp_2050_Property_Tax']),
      crisisPop: crisisPop,
      emigratingPop: emigratingPop,
      destinationPop: destinationPop,
      stablePop: stablePop,
      crisisPct: totalPop > 0 ? crisisPop / totalPop : 0,
      emigratingPct: totalPop > 0 ? emigratingPop / totalPop : 0,
      destinationPct: totalPop > 0 ? destinationPop / totalPop : 0,
      stablePct: totalPop > 0 ? stablePop / totalPop : 0,
      pctChange: num(r['Disp_Pct_Change_2018_2023']),
      blueAcresParcels: num(r['BlueAcres_Parcels']),
      blueAcresAcres: num(r['BlueAcres_Acres']),
      assets: {
        airports: [num(r['Infra_Airports_Total']), num(r['Infra_Airports_In_Floodplain_2025']), num(r['Infra_Airports_In_Floodplain_2050'])],
        hospitals: [num(r['Infra_Hospitals_Total']), num(r['Infra_Hospitals_In_Floodplain_2025']), num(r['Infra_Hospitals_In_Floodplain_2050'])],
        contaminated: [num(r['Infra_Contaminated_Sites_Total']), num(r['Infra_Contaminated_Sites_In_Floodplain_2025']), num(r['Infra_Contaminated_Sites_In_Floodplain_2050'])],
        libraries: [num(r['Infra_Libraries_Total']), num(r['Infra_Libraries_In_Floodplain_2025']), num(r['Infra_Libraries_In_Floodplain_2050'])],
        parks: [num(r['Infra_Parks_Total']), num(r['Infra_Parks_In_Floodplain_2025']), num(r['Infra_Parks_In_Floodplain_2050'])],
        powerplants: [num(r['Infra_Power_Plants_Total']), num(r['Infra_Power_Plants_In_Floodplain_2025']), num(r['Infra_Power_Plants_In_Floodplain_2050'])],
        schools: [num(r['Infra_Schools_Total']), num(r['Infra_Schools_In_Floodplain_2025']), num(r['Infra_Schools_In_Floodplain_2050'])],
        hazwaste: [num(r['Infra_Hazardous_Waste_Total']), num(r['Infra_Hazardous_Waste_In_Floodplain_2025']), num(r['Infra_Hazardous_Waste_In_Floodplain_2050'])],
        landfills: [num(r['Infra_Landfills_Total']), num(r['Infra_Landfills_In_Floodplain_2025']), num(r['Infra_Landfills_In_Floodplain_2050'])],
        superfund: [num(r['Infra_Superfund_Sites_Total']), num(r['Infra_Superfund_Sites_In_Floodplain_2025']), num(r['Infra_Superfund_Sites_In_Floodplain_2050'])],
        wastewater: [num(r['Infra_Wastewater_Treatment_Total']), num(r['Infra_Wastewater_Treatment_In_Floodplain_2025']), num(r['Infra_Wastewater_Treatment_In_Floodplain_2050'])],
        police: [num(r['Infra_Police_Stations_Total']), num(r['Infra_Police_Stations_In_Floodplain_2025']), num(r['Infra_Police_Stations_In_Floodplain_2050'])],
        fire: [num(r['Infra_Fire_Departments_Total']), num(r['Infra_Fire_Departments_In_Floodplain_2025']), num(r['Infra_Fire_Departments_In_Floodplain_2050'])]
      }
    };

    FEMA[name] = {
      disasters: num(r['Atlas_Total_Disaster_Declarations']),
      totalFEMA: num(r['Atlas_Total_FEMA_PA_HM_Funding']),
      pop: atlasPop,
      perCapita: num(r['Atlas_Per_Capita_Funding']),
      svi: num(r['Atlas_CDC_SVI_2022'])
    };
  });
}

// ── HELPERS ─────────────────────────────────────────────────────
function fmt(n) { return n.toLocaleString('en-US'); }
function fmtDecimal(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }); }
function fmtDollar(n) {
  if (n >= 1e9) return '$' + fmtDecimal(n / 1e9) + 'B';
  if (n >= 1e6) return '$' + fmtDecimal(n / 1e6) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K';
  return '$' + fmt(n);
}
function fmtPctValue(v) { return fmtDecimal(v) + '%'; }
function pct(v) { return fmtPctValue(v * 100); }
function growthClass(g) {
  if (g >= 100) return 'high';
  if (g >= 40) return 'med';
  return 'low';
}
function sviLabel(v) {
  if (v >= 0.75) return 'Very High';
  if (v >= 0.5) return 'High';
  if (v >= 0.25) return 'Moderate';
  return 'Low';
}

// ── SVG MAP RENDERING ───────────────────────────────────────────
let COUNTY_PATHS = null;
let NJ_MAP_BBOX = null;

function loadCountyBoundaries() {
  return fetch('data/NJ_FEMA_County.geojson')
    .then(r => r.json())
    .then(data => {
      COUNTY_PATHS = {};
      NJ_MAP_BBOX = null;
      data.features.forEach(feat => {
        const name = (feat.properties.COUNTY_NAM || feat.properties.NAMELSAD || '').replace(' County', '');
        COUNTY_PATHS[name] = feat.geometry;
      });
      return COUNTY_PATHS;
    })
    .catch(() => null);
}

function geoToSVG(lon, lat, bbox, w, h, pad, cosLat) {
  const lonRange = (bbox[2] - bbox[0]) * cosLat;
  const latRange = bbox[3] - bbox[1];
  const mapAspect = lonRange / latRange;
  const boxAspect = (w - 2 * pad) / (h - 2 * pad);
  let drawW = w - 2 * pad, drawH = h - 2 * pad;
  let offX = pad, offY = pad;
  if (mapAspect < boxAspect) {
    drawW = drawH * mapAspect;
    offX = pad + ((w - 2 * pad) - drawW) / 2;
  } else {
    drawH = drawW / mapAspect;
    offY = pad + ((h - 2 * pad) - drawH) / 2;
  }
  const x = offX + ((lon - bbox[0]) * cosLat / lonRange) * drawW;
  const y = offY + ((bbox[3] - lat) / latRange) * drawH;
  return [x, y];
}

function ringToPath(ring, bbox, w, h, pad, cosLat) {
  return ring.map((pt, i) => {
    const [x, y] = geoToSVG(pt[0], pt[1], bbox, w, h, pad, cosLat);
    return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ') + ' Z';
}

function geomToPath(geometry, bbox, w, h, pad, cosLat) {
  let d = '';
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(ring => { d += ringToPath(ring, bbox, w, h, pad, cosLat) + ' '; });
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => {
      poly.forEach(ring => { d += ringToPath(ring, bbox, w, h, pad, cosLat) + ' '; });
    });
  }
  return d;
}

function updateBBoxFromRing(ring, bbox) {
  ring.forEach(([lon, lat]) => {
    if (lon < bbox[0]) bbox[0] = lon;
    if (lat < bbox[1]) bbox[1] = lat;
    if (lon > bbox[2]) bbox[2] = lon;
    if (lat > bbox[3]) bbox[3] = lat;
  });
}

function getGeometryBBox(geometry) {
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(ring => updateBBoxFromRing(ring, bbox));
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => {
      poly.forEach(ring => updateBBoxFromRing(ring, bbox));
    });
  }
  return bbox;
}

function getNJMapBBox() {
  if (NJ_MAP_BBOX) return NJ_MAP_BBOX;

  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  Object.values(COUNTY_PATHS || {}).forEach(geometry => {
    const geomBBox = getGeometryBBox(geometry);
    if (geomBBox[0] < bbox[0]) bbox[0] = geomBBox[0];
    if (geomBBox[1] < bbox[1]) bbox[1] = geomBBox[1];
    if (geomBBox[2] > bbox[2]) bbox[2] = geomBBox[2];
    if (geomBBox[3] > bbox[3]) bbox[3] = geomBBox[3];
  });

  const lonPad = (bbox[2] - bbox[0]) * 0.015;
  const latPad = (bbox[3] - bbox[1]) * 0.015;
  NJ_MAP_BBOX = [bbox[0] - lonPad, bbox[1] - latPad, bbox[2] + lonPad, bbox[3] + latPad];
  return NJ_MAP_BBOX;
}

function buildNJMapSVG(activeCounty) {
  if (!COUNTY_PATHS) return '<div style="width:180px;height:190px;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:0.7rem">Loading map…</div>';
  const w = 180, h = 190, pad = 3;
  const bbox = getNJMapBBox();
  const midLat = (bbox[1] + bbox[3]) / 2;
  const cosLat = Math.cos(midLat * Math.PI / 180);
  let paths = '';
  Object.entries(COUNTY_PATHS).forEach(([name, geom]) => {
    const cls = name === activeCounty ? 'nj-county active' : 'nj-county';
    const d = geomToPath(geom, bbox, w, h, pad, cosLat);
    paths += `<path class="${cls}" d="${d}"/>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

// ── NON-RENEWALS DATA BUILDER ──────────────────────────────────
function buildNonrenewalsFromCSV(rows) {
  rows.forEach(r => {
    const name = r['County'];
    if (!name) return;
    NONRENEWALS[name] = {
      rate2023: num(r['2023 Nonrenewal Rate']),
      pctChange: num(r['PCTent Change, 2018-2023'])
    };
  });
}

// ── POPULATE SELECTOR & LOAD DATA ───────────────────────────────
(function init() {
  const sel = document.getElementById('county-select');

  Promise.all([
    loadCSV('data/nj-county-findings.csv'),
    loadCSV('data/nj-nonrenewals.csv'),
    loadCountyBoundaries()
  ]).then(([csvRows, nonrenewRows]) => {
    buildDataFromCSV(csvRows);
    buildNonrenewalsFromCSV(nonrenewRows);

    Object.keys(COUNTIES).sort().forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name + ' County';
      sel.appendChild(opt);
    });

    if (sel.value) renderCounty(sel.value);
  });
})();

// ── BUILD TWO-COLUMN ASSET TABLE ─────────────────────────────────
function buildAssetTwoCol(assetArr, totals) {
  const mid = Math.ceil(assetArr.length / 2);
  const left = assetArr.slice(0, mid);
  const right = assetArr.slice(mid);

  function buildHalf(items, appendTotals) {
    let rows = '';
    items.forEach(a => {
      const m = ASSET_META[a.key];
      const gc = growthClass(a.growth);
      const growthLabel = a.growth >= 999 ? 'New' : (a.growth > 0 ? '+' + Math.round(a.growth) + '%' : (a.growth === 0 ? '—' : Math.round(a.growth) + '%'));
      rows += `<tr>
        <td>${m.label}</td>
        <td class="asset-num">${fmt(a.total)}</td>
        <td class="asset-num"><span class="tbl-pct y2025">${fmtPctValue(a.p25)}</span> <span class="tbl-count">(${fmt(a.r25)})</span></td>
        <td class="asset-num"><span class="tbl-pct y2050">${fmtPctValue(a.p50)}</span> <span class="tbl-count">(${fmt(a.r50)})</span></td>
        <td class="asset-num"><span class="growth-badge ${gc}">${growthLabel}</span></td>
      </tr>`;
    });
    if (appendTotals && totals) {
      const tGrowth = totals.r25 > 0 ? ((totals.r50 - totals.r25) / totals.r25 * 100) : 0;
      const tGrowthLabel = tGrowth > 0 ? '+' + Math.round(tGrowth) + '%' : (tGrowth === 0 ? '—' : Math.round(tGrowth) + '%');
      const tGc = growthClass(tGrowth);
      rows += `<tr class="asset-total-row">
        <td><strong>All Infrastructure</strong></td>
        <td class="asset-num"><strong>${fmt(totals.total)}</strong></td>
        <td class="asset-num"><span class="tbl-pct y2025">${fmtPctValue(totals.total ? totals.r25 / totals.total * 100 : 0)}</span> <span class="tbl-count">(${fmt(totals.r25)})</span></td>
        <td class="asset-num"><span class="tbl-pct y2050">${fmtPctValue(totals.total ? totals.r50 / totals.total * 100 : 0)}</span> <span class="tbl-count">(${fmt(totals.r50)})</span></td>
        <td class="asset-num"><span class="growth-badge ${tGc}">${tGrowthLabel}</span></td>
      </tr>`;
    }
    return `<table class="asset-tbl">
      <thead><tr>
        <th>Infrastructure Type</th><th>Total</th><th>2025</th><th>2050</th><th>Growth</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  return `<div class="asset-col">${buildHalf(left, false)}</div><div class="asset-col">${buildHalf(right, true)}</div>`;
}

// ── RENDER COUNTY FACT SHEET ────────────────────────────────────
function renderCounty(name) {
  const container = document.getElementById('fact-sheet-container');
  const btn = document.getElementById('btn-export');

  if (!name) {
    container.innerHTML = `<div class="empty-state">
      <h2>New Jersey County Fact Sheets</h2>
      <p>Select a county above to view flood risk data, population impact, public infrastructure exposure, and FEMA disaster history.</p>
    </div>`;
    btn.disabled = true;
    return;
  }

  btn.disabled = false;
  const c = COUNTIES[name];
  const f = FEMA[name];
  const nr = NONRENEWALS[name] || { rate2023: 0, pctChange: 0 };
  if (!c || !f) {
    container.innerHTML = `<div class="empty-state"><p>No data available for ${name} County.</p></div>`;
    return;
  }

  // Compute asset totals
  let totalAssets = 0, risk2025 = 0, risk2050 = 0;
  Object.values(c.assets).forEach(([t, r25, r50]) => {
    totalAssets += t; risk2025 += r25; risk2050 += r50;
  });

  // Estimate people at risk
  const peopleAtRisk2024 = Math.round(c.pctRisk2024 * c.atlasPop);
  const peopleAtRisk2050 = Math.round(c.pctRisk2050 * c.atlasPop);

  // Build asset data array
  const assetKeys = Object.keys(ASSET_META);
  const assetArr = assetKeys.map(k => {
    const [total, r25, r50] = c.assets[k];
    const p25 = total ? (r25 / total * 100) : 0;
    const p50 = total ? (r50 / total * 100) : 0;
    const growth = r25 > 0 ? ((r50 - r25) / r25 * 100) : (r50 > 0 ? 999 : 0);
    return { key: k, total, r25, r50, p25, p50, growth };
  }).sort((a, b) => b.p50 - a.p50);

  // Compute high flood risk totals (crisis + emigrating)
  const highFloodRiskPop = c.crisisPop + c.emigratingPop;
  const highFloodRiskLowerIncomePop = c.crisisPop;
  const highFloodRiskLowerIncomePct = highFloodRiskPop > 0 ? (highFloodRiskLowerIncomePop / highFloodRiskPop * 100) : 0;

  // Compute resilient infrastructure stats
  const mvGrowth = c.marketValue2050 - c.marketValue2024;
  const taxGrowth = c.taxRisk2050 - c.taxRisk2024;
  const assetGrowthN = risk2050 - risk2025;
  const peopleGrowth = peopleAtRisk2050 - peopleAtRisk2024;
  const pctPeopleGrowth = peopleAtRisk2024 > 0 ? ((peopleAtRisk2050 - peopleAtRisk2024) / peopleAtRisk2024 * 100) : 0;

  // Build map SVG
  const mapSVG = buildNJMapSVG(name);

  container.innerHTML = `
  <div class="fact-sheet" id="fact-sheet">
    <!-- HEADER -->
    <div class="fs-header">
      <div class="fs-header-top">
        <img class="fs-logo" src="RBD-logo.png" alt="Rebuild by Design">
        <img class="fs-header-banner" src="nj-banner.png" alt="New Jersey Cannot Afford to Wait">
      </div>
      <div class="fs-county-name">${name} County, New Jersey</div>
      <div class="fs-subtitle">Atlas of Disaster: NJ &nbsp;·&nbsp; NJ Flood Risk = Financial Risk &nbsp;·&nbsp; NJ Underwater: Public Infrastructure at Risk</div>
    </div>

    <!-- MAP + RESILIENT INFRASTRUCTURE -->
    <div class="map-bond-section no-break">
      <div class="county-map-wrap">
        ${mapSVG}
      </div>
      <div class="bond-act-callout">
        <div class="bond-act-header">
          <span class="bond-act-title">The Case for Dedicated Funding in ${name} County</span>
        </div>
        <div class="bond-stats-row">
          <div class="bond-stat">
            <div class="bond-stat-label">More People at Risk</div>
            <div class="bond-stat-value crisis">+${fmt(peopleGrowth)}</div>
            <div class="bond-stat-sub">additional residents by 2050</div>
          </div>
          <div class="bond-stat">
            <div class="bond-stat-label">Added Tax Revenue at Risk</div>
            <div class="bond-stat-value emigrating">+${fmtDollar(taxGrowth)}</div>
            <div class="bond-stat-sub">annual loss by 2050</div>
          </div>
          <div class="bond-stat">
            <div class="bond-stat-label">More Assets Exposed</div>
            <div class="bond-stat-value flood50">+${fmt(assetGrowthN)}</div>
            <div class="bond-stat-sub">additional by 2050</div>
          </div>
        </div>
        <div class="bond-message">
          <ul class="bond-message-list">
            <li><strong>${name} County</strong> has experienced <strong>${f.disasters} federal disaster declarations</strong> since 2011, with <strong>${fmtDollar(f.totalFEMA)}</strong> in FEMA obligations.</li>
            <li>By 2050, <strong>${fmt(peopleAtRisk2050)} residents</strong> (${pct(c.pctRisk2050)}) will live in flood-risk areas, with <strong>${fmt(peopleGrowth)} more</strong> residents exposed than today.</li>
            <li><strong>93% of NJ voters</strong> want investments to reduce weather damage and <strong>77%</strong> are worried about extreme weather across party lines <a class="citation-link" href="https://www.fdu.edu/news/fdu-poll-finds-3-in-4-nj-voters-worried-about-damage-from-extreme-weather/" target="_blank" rel="noopener noreferrer">(Fairleigh Dickinson University, 2024)</a>.</li>
            <li>NJ needs a dedicated resilient infrastructure funding source.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- KEY METRICS -->
    <div class="section-title">County Overview</div>
    <div class="metrics-strip">
      <div class="metric-cell">
        <div class="risk-card-title">FEMA Disasters</div>
        <div class="metric-value crisis">${f.disasters}</div>
        <div class="metric-sub">2011 – 2024</div>
      </div>
      <div class="metric-cell">
        <div class="risk-card-title">Total FEMA (PA+HM)</div>
        <div class="metric-value emigrating">${fmtDollar(f.totalFEMA)}</div>
        <div class="metric-sub">${fmtDollar(f.perCapita)}/capita</div>
      </div>
      <div class="metric-cell">
        <div class="risk-card-title">Population</div>
        <div class="metric-value">${fmt(c.atlasPop)}</div>
        <div class="metric-sub">2024 US Census</div>
      </div>
      <div class="metric-cell">
        <div class="risk-card-title">Social Vulnerability</div>
        <div class="metric-value purple">${f.svi.toFixed(2)}</div>
        <div class="metric-sub">${sviLabel(f.svi)}</div>
      </div>
      <div class="metric-cell">
        <div class="risk-card-title">Insurance Non-Renewals</div>
        <div class="metric-value crisis">+${nr.pctChange.toFixed(0)}%</div>
        <div class="metric-sub">change from 2018–2023</div>
      </div>
    </div>

    <!-- FLOOD RISK -->
    <div class="section-title">FLOOD RISK = FINANCIAL RISK</div>
    <div class="risk-grid risk-grid-3">
      <div class="risk-card">
        <div class="risk-card-title">Market Value at Risk</div>
        <div class="risk-row">
          <span class="risk-year-label y2024">2024</span>
          <div class="risk-bar-track"><div class="risk-bar-fill y2024" style="width:${Math.min(c.marketValue2024 / c.marketValue2050 * 100, 100)}%"></div></div>
          <span class="risk-value y2024">${fmtDollar(c.marketValue2024)}</span>
        </div>
        <div class="risk-row">
          <span class="risk-year-label y2050">2050</span>
          <div class="risk-bar-track"><div class="risk-bar-fill y2050" style="width:100%"></div></div>
          <span class="risk-value y2050">${fmtDollar(c.marketValue2050)}</span>
        </div>
      </div>
      <div class="risk-card">
        <div class="risk-card-title">Annual Property Taxes at Risk</div>
        <div class="risk-row">
          <span class="risk-year-label y2024">2024</span>
          <div class="risk-bar-track"><div class="risk-bar-fill y2024" style="width:${Math.min(c.taxRisk2024 / c.taxRisk2050 * 100, 100)}%"></div></div>
          <span class="risk-value y2024">${fmtDollar(c.taxRisk2024)}</span>
        </div>
        <div class="risk-row">
          <span class="risk-year-label y2050">2050</span>
          <div class="risk-bar-track"><div class="risk-bar-fill y2050" style="width:100%"></div></div>
          <span class="risk-value y2050">${fmtDollar(c.taxRisk2050)}</span>
        </div>
      </div>
      <div class="risk-card">
        <div class="risk-card-title">Public Infrastructure at Risk</div>
        <div class="risk-row">
          <span class="risk-year-label y2024">2025</span>
          <div class="risk-bar-track"><div class="risk-bar-fill y2024" style="width:${totalAssets ? risk2025 / totalAssets * 100 : 0}%"></div></div>
          <span class="risk-value y2024">${fmt(risk2025)} <span style="font-size:0.72rem;font-weight:400">(${fmtPctValue(totalAssets ? risk2025 / totalAssets * 100 : 0)})</span></span>
        </div>
        <div class="risk-row">
          <span class="risk-year-label y2050">2050</span>
          <div class="risk-bar-track"><div class="risk-bar-fill y2050" style="width:${totalAssets ? risk2050 / totalAssets * 100 : 0}%"></div></div>
          <span class="risk-value y2050">${fmt(risk2050)} <span style="font-size:0.72rem;font-weight:400">(${fmtPctValue(totalAssets ? risk2050 / totalAssets * 100 : 0)})</span></span>
        </div>
      </div>
    </div>

    <!-- DISPLACEMENT — POPULATION -->
    <div class="section-title">Populations at Risk of Displacement</div>
    <div class="insights-split">
      <div class="displacement-panel">
        <div class="displacement-total">${fmt(highFloodRiskPop)} people face displacement risk</div>
        <div class="displacement-callout">Of those, <strong>${fmt(highFloodRiskLowerIncomePop)}</strong> (${highFloodRiskLowerIncomePct.toFixed(0)}%) are lower income and may not have the resources to relocate.</div>
        <div class="displacement-bar" aria-hidden="true">
          <div class="displacement-bar-segment crisis" style="width:${pct(c.crisisPct)}"></div>
          <div class="displacement-bar-segment emigrating" style="width:${pct(c.emigratingPct)}"></div>
          <div class="displacement-bar-segment destination" style="width:${pct(c.destinationPct)}"></div>
          <div class="displacement-bar-segment stable" style="width:${pct(c.stablePct)}"></div>
        </div>
        <div class="displacement-table">
          <div class="disp-head label">Group</div>
          <div class="disp-head count">People</div>
          <div class="disp-head pct">%</div>

          <div class="disp-row-label crisis"><span class="disp-swatch crisis"></span>High Flood Risk, Lower Income</div>
          <div class="disp-row-value count crisis">${fmt(c.crisisPop)}</div>
          <div class="disp-row-value pct crisis">${pct(c.crisisPct)}</div>

          <div class="disp-row-label emigrating"><span class="disp-swatch emigrating"></span>High Flood Risk, Higher Income</div>
          <div class="disp-row-value count emigrating">${fmt(c.emigratingPop)}</div>
          <div class="disp-row-value pct emigrating">${pct(c.emigratingPct)}</div>

          <div class="disp-row-label destination"><span class="disp-swatch destination"></span>Low Flood Risk, Lower Income</div>
          <div class="disp-row-value count destination">${fmt(c.destinationPop)}</div>
          <div class="disp-row-value pct destination">${pct(c.destinationPct)}</div>

          <div class="disp-row-label stable"><span class="disp-swatch stable"></span>Low Flood Risk, Higher Income</div>
          <div class="disp-row-value count stable">${fmt(c.stablePop)}</div>
          <div class="disp-row-value pct stable">${pct(c.stablePct)}</div>
        </div>
      </div>
      <div class="blue-acres-panel">
        <div class="blue-acres-kicker">Property Buyouts through the NJ Blue Acres Program</div>
        <div class="blue-acres-stats">
          <div class="blue-acres-stat">
            <div class="blue-acres-value">${fmt(c.blueAcresParcels)}</div>
            <div class="blue-acres-label">County Buyout Parcels</div>
          </div>
          <div class="blue-acres-stat">
            <div class="blue-acres-value">${fmtDecimal(c.blueAcresAcres)}</div>
            <div class="blue-acres-label">Acres in Blue Acres</div>
          </div>
        </div>
        <div class="blue-acres-note">
          Displacement is already underway, with <strong>${fmt(c.blueAcresParcels)} flood-damaged properties</strong> already acquired through the State's voluntary home buyout program, Blue Acres, in ${name} County, totaling <strong>${fmtDecimal(c.blueAcresAcres)} acres</strong> and representing part of <strong>1,677 statewide buyouts since 1987</strong>.
        </div>
      </div>
    </div>

    <!-- ASSET TABLE -->
    <div class="section-title">Public Infrastructure In the Flood Zones</div>
    <div class="asset-two-col">${buildAssetTwoCol(assetArr, { total: totalAssets, r25: risk2025, r50: risk2050 })}</div>

   <!-- FOOTER -->
    <div class="fs-footer">
      <div>
        <div class="fs-footer-title">Methodology &amp; Notes</div>
        <ul class="fs-footer-list">
          <li>This fact sheet draws from three Rebuild by Design research products: the <strong>Atlas of Disaster</strong> (county-level disaster declarations and federal spending, 2011–2024), <strong>NJ Flood Risk = Financial Risk</strong> (parcel-level displacement and financial analysis of all 3.4 million NJ properties), and <strong>NJ Underwater: Public Infrastructure at Risk</strong> (exposure analysis of 18,959 public assets under 2025 and 2050 flood conditions).</li>
<li><strong>Data Sources:</strong> CDC/ATSDR 2022, EPA, FEMA, NJ Office of GIS, NJDEP, Rutgers University, Senate Budget Office, Trust for Public Land, US EIA, USDOT.</li>
        </ul>
      </div>
      <div>
        <div class="fs-footer-title">Join the NJ Movement</div>
        <ul class="fs-footer-list">
          <li>Visit <a href="https://rebuildbydesign.org/new-jersey" target="_blank">rebuildbydesign.org/new-jersey</a> for reports, tools, and upcoming events.</li>
          <li>For more information, contact <a href="mailto:info@rebuildbydesign.org">info@rebuildbydesign.org</a></li>
        </ul>
      </div>
    </div>

  </div><!-- end .fact-sheet -->
`;
}

// ── PDF EXPORT ──────────────────────────────────────────────────
const PDF_EXPORT = {
  marginInches: 0.3,
  widthInches: 8.5,
  heightInches: 14,
  pxPerInch: 96
};

function preparePDFExport(container) {
  document.body.classList.add('exporting-pdf');
  const maxWidthPx = (PDF_EXPORT.widthInches - PDF_EXPORT.marginInches * 2) * PDF_EXPORT.pxPerInch;
  const maxHeightPx = (PDF_EXPORT.heightInches - PDF_EXPORT.marginInches * 2) * PDF_EXPORT.pxPerInch;
  const widthScale = maxWidthPx / container.scrollWidth;
  const heightScale = maxHeightPx / container.scrollHeight;
  const exportScale = Math.min(1, widthScale, heightScale);

  container.style.setProperty('--pdf-export-scale', exportScale.toFixed(4));

  return () => {
    document.body.classList.remove('exporting-pdf');
    container.style.removeProperty('--pdf-export-scale');
  };
}

function rasterizeSVGs(container) {
  const svgs = container.querySelectorAll('.county-map-wrap svg');
  const promises = [];
  svgs.forEach(svg => {
    // Save the original SVG markup before any modifications
    const origSVGMarkup = svg.outerHTML;

    // Bake computed styles into path elements for serialization
    const paths = svg.querySelectorAll('path');
    paths.forEach(path => {
      const computed = window.getComputedStyle(path);
      path.setAttribute('style',
        `fill:${computed.fill};stroke:${computed.stroke};stroke-width:${computed.strokeWidth};opacity:${computed.opacity}`
      );
    });

    // Get container (visible/clipped) dimensions and SVG (overflowed) dimensions
    const wrap = svg.closest('.county-map-wrap');
    const wrapRect = wrap.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const drawW = wrapRect.width;
    const drawH = wrapRect.height;

    // Calculate the visible portion of the viewBox
    // CSS does width:165%; height:165% + overflow:hidden + flex center = zoomed crop
    const vb = svg.viewBox.baseVal;
    const zoomX = drawW / svgRect.width;   // ~0.606 (container/svg)
    const zoomY = drawH / svgRect.height;  // ~0.606
    const cropW = vb.width * zoomX;
    const cropH = vb.height * zoomY;
    const cropX = vb.x + (vb.width - cropW) / 2;
    const cropY = vb.y + (vb.height - cropH) / 2;

    // Temporarily modify the SVG for export: set cropped viewBox + explicit size
    const origViewBox = svg.getAttribute('viewBox');
    svg.setAttribute('viewBox', `${cropX.toFixed(2)} ${cropY.toFixed(2)} ${cropW.toFixed(2)} ${cropH.toFixed(2)}`);
    svg.setAttribute('width', drawW);
    svg.setAttribute('height', drawH);

    const svgData = new XMLSerializer().serializeToString(svg);

    // Restore original SVG state
    svg.setAttribute('viewBox', origViewBox);
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    paths.forEach(path => path.removeAttribute('style'));

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    const p = new Promise((resolve) => {
      img.onload = () => {
        const scale = 3;
        const canvas = document.createElement('canvas');
        canvas.width = drawW * scale;
        canvas.height = drawH * scale;
        canvas.style.width = drawW + 'px';
        canvas.style.height = drawH + 'px';
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        // Draw the cropped SVG at exact container size — no offset needed
        ctx.drawImage(img, 0, 0, drawW, drawH);

        URL.revokeObjectURL(url);
        svg.parentNode.replaceChild(canvas, svg);
        canvas._origSVG = origSVGMarkup;
        resolve(canvas);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
    });
    img.src = url;
    promises.push(p);
  });
  return Promise.all(promises);
}

function restoreSVGs(container, canvases) {
  canvases.forEach(canvas => {
    if (canvas && canvas._origSVG && canvas.parentNode) {
      const tmp = document.createElement('div');
      tmp.innerHTML = canvas._origSVG;
      const svg = tmp.firstElementChild;
      canvas.parentNode.replaceChild(svg, canvas);
    }
  });
}

function waitForNextFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

// Fix images with object-fit before html2canvas (which doesn't support object-fit)
function fixObjectFitImages(container) {
  const images = container.querySelectorAll('img[class*="banner"], .fs-header-banner');
  const originals = [];
  images.forEach(img => {
    if (!img.complete || !img.naturalWidth) return;
    const style = window.getComputedStyle(img);
    const objFit = style.objectFit;
    if (objFit === 'contain' || objFit === 'cover') {
      const containerW = img.clientWidth;
      const containerH = img.clientHeight;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      // Calculate contained dimensions
      const ratio = Math.min(containerW / natW, containerH / natH);
      const drawW = natW * ratio;
      const drawH = natH * ratio;

      originals.push({
        el: img,
        width: img.style.width,
        height: img.style.height,
        maxWidth: img.style.maxWidth,
        objectFit: img.style.objectFit
      });

      // Set explicit dimensions and remove object-fit
      img.style.width = Math.round(drawW) + 'px';
      img.style.height = Math.round(drawH) + 'px';
      img.style.maxWidth = 'none';
      img.style.objectFit = 'fill';
    }
  });
  return originals;
}

function restoreObjectFitImages(originals) {
  originals.forEach(o => {
    o.el.style.width = o.width;
    o.el.style.height = o.height;
    o.el.style.maxWidth = o.maxWidth;
    o.el.style.objectFit = o.objectFit;
  });
}

async function exportPDF() {
  const el = document.getElementById('fact-sheet');
  if (!el) return;

  const countyName = document.getElementById('county-select').value;
  const btn = document.getElementById('btn-export');
  btn.disabled = true;
  btn.textContent = 'Generating…';

  // Scroll to top before capture
  window.scrollTo(0, 0);

  let canvases = [];
  let imgOriginals = [];

  try {
    await waitForNextFrame();
    await waitForNextFrame();

    canvases = await rasterizeSVGs(el);
    imgOriginals = fixObjectFitImages(el);

    await waitForNextFrame();

    // Capture the fact sheet as a high-res canvas (same approach as working PNG export)
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      width: el.scrollWidth,
      height: el.scrollHeight
    });

    // Legal paper: 8.5 x 14 inches, small margins
    const margin = 0.25;

    // Pass the already-captured canvas directly to html2pdf
    // This skips html2pdf's internal html2canvas (which was causing clipping)
    // and goes straight to jsPDF image placement with scale-to-fit
    await window.html2pdf().set({
      margin: [margin, margin, margin, margin],
      filename: `NJUnderwater_${countyName}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      jsPDF: { unit: 'in', format: 'legal', orientation: 'portrait' },
      pagebreak: { mode: [] }
    }).from(canvas, 'canvas').toPdf().save();
  } catch (err) {
    console.error('PDF export failed', err);
  } finally {
    restoreObjectFitImages(imgOriginals);
    restoreSVGs(el, canvases);
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export PDF`;
  }
}

// ── PNG EXPORT ──────────────────────────────────────────────────
async function exportPNG() {
  const el = document.getElementById('fact-sheet');
  if (!el) return;

  const countyName = document.getElementById('county-select').value;
  const btn = document.getElementById('btn-export-png');
  btn.disabled = true;
  btn.textContent = 'Generating…';

  window.scrollTo(0, 0);

  let canvases = [];
  let imgOriginals = [];

  try {
    await waitForNextFrame();
    await waitForNextFrame();

    canvases = await rasterizeSVGs(el);
    imgOriginals = fixObjectFitImages(el);

    await waitForNextFrame();

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#ffffff',
      width: el.scrollWidth,
      height: el.scrollHeight
    });

    // Convert to blob and download
    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${countyName}_County_Flood_Risk_Fact_Sheet.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (err) {
    console.error('PNG export failed', err);
  } finally {
    restoreObjectFitImages(imgOriginals);
    restoreSVGs(el, canvases);
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> Export PNG`;
  }
}
