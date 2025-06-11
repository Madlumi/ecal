
//============================
// Core logic for the app
//============================

//============================
//=Energy sources=============
//============================
const EType = {
  ELECTRIC:    0,
  FJARRVARME:  1,
  FJARRKYLA:   2,
  BIOBRANSLE:  3,
  FOSSIL_OLJA: 4,
  FOSSIL_GAS:  5,
  E_TYPE_COUNT: 6
};

const E_wght = [
  /* ELECTRIC   */ 1.8,
  /* FJARRVARME */ 0.7,
  /* FJARRKYLA  */ 0.6,
  /* BIOBRANSLE */ 0.6,
  /* FOSSIL_OLJA*/ 1.8,
  /* FOSSIL_GAS */ 1.8
];

const E_name = [
  /* ELECTRIC    */ "El",
  /* FJARRVARME  */ "Fjärrvärme",
  /* FJARRKYLA   */ "Fjärrkyla",
  /* BIOBRANSLE  */ "Biobränslen",
  /* FOSSIL_OLJA */ "Fossil olja",
  /* FOSSIL_GAS  */ "Fossil gas"
];

//============================
//=Location===================
//============================
class Location {
  constructor(name, F_geo) {
    this.name = name;
    this.F_geo = F_geo;
  }
}

const locations = [
  new Location("Åland",   1.1),
  new Location("none",    1.0)
];

//============================
//=House Type=================
//============================
const HouseType = {
  SMALL: 0,
  MULTI: 1,
  LOCAL: 2,
  HOUSE_TYPE_COUNT: 3
};

const HouseType_name = [
  /* SMALL */ "SMALL",
  /* MULTI */ "MULTI",
  /* LOCAL */ "LOCAL"
];

//============================
//=Energy Use=================
//============================
class Energy {
  constructor() {
    this.heat = Array(EType.E_TYPE_COUNT).fill(0);
    this.cool = Array(EType.E_TYPE_COUNT).fill(0);
    this.watr = Array(EType.E_TYPE_COUNT).fill(0);
    this.fast = Array(EType.E_TYPE_COUNT).fill(0);
  }
}

//============================
//=House======================
//============================
class House {
  constructor(type, Atemp, location) {
    this.type   = type;      // HouseType
    this.Atemp  = Atemp;     // Heated area in m²
    this.E      = new Energy(); // Energy uses
    this.L      = location;  // Location object
    this.flow   = 0.0;       // Instantaneous airflow (q) [l/s·m²]
    this.qavg   = 0.0;       // Average airflow (q_medel) [l/s·m²]
    this.foot2  = false;     // Footnote‐2 flag (LOCAL)
    this.foot3  = false;     // Footnote‐3 flag (LOCAL)
    this.foot4  = false;     // Footnote‐4 flag (MULTI)
    this.foot5  = false;     // Footnote‐5 flag (MULTI)
  }
}

//============================
//=Limits Struct==============
//============================
class LimitVals {
  constructor(EP = 0.0, EL = 0.0, UM = 0.0, LL = 0.0) {
    this.EP = EP; // Primärenergital
    this.EL = EL; // Installerad eleffekt
    this.UM = UM; // U-värde
    this.LL = LL; // Luftläckage
  }
}

//============================
//=Helper Functions============
//============================
const NoReq = 9999.0;
const seSec = -1.0;

function elBase(F_geo) {
  return (4.5 + 1.7 * (F_geo - 1.0));
}

function el1(F_geo, atemp) {
  // (0,025 + 0,02 × (F_geo − 1)) × (Atemp − 130) om Atemp > 130 m²
  if (atemp <= 130) { return 0; }
  return (0.025 + 0.02 * (F_geo - 1.0)) * (atemp - 130);
}

function ep2(qavg) {
  // 40 × (q_medel − 0,35) om q_medel > 0,35
  if (qavg <= 0.35) { return 0; }
  return 40 * (qavg - 0.35);
}

function el3(F_geo, flow, atemp) {
  // (0,022 + 0,02 × (F_geo − 1)) × (flow − 0,35) × Atemp om flow > 0,35 l/s·m²
  if (flow <= 0.35) { return 0; }
  return (0.022 + 0.02 * (F_geo - 1.0)) * (flow - 0.35) * atemp;
}

function ep4(F_geo, flow, qavg, atemp, Foot4) {
  qavg = flow; // treat instantaneous as average here
  // ... i flerbostadshus där Atemp är 50 m² eller större
  if (atemp < 50) { return 0; }
  // q_medel är uteluftsflödet i temperaturreglerade utrymmen överstiger 0,35 l/s·m²
  if (qavg <= 0.35) { return 0; }
  // Tillägget kan enbart användas på grund av krav på ventilation i särskilda utrymmen som badrum, toalett och kök
  if (!Foot4) { return 0; }
  // får högst tillgodoräknas upp till 0,6 l/s·m²
  if (qavg > 0.6) { qavg = 0.6; }
  return 40 * (qavg - 0.35);
}

function el5(F_geo, flow, atemp, Foot5) {
  // ... i flerbostadshus där Atemp är 50 m² eller större
  if (atemp < 50) { return 0; }
  // Tillägget kan enbart användas då det maximala uteluftsflödet vid DVUT ... överstiger 0,35 l/s·m²
  if (flow <= 0.35) { return 0; }
  // på grund av krav på ventilation i särskilda utrymmen som badrum, toalett och kök
  // och som till övervägande delen (>50 % Atemp) inrymmer lägenheter med en boarea om högst 35 m² vardera
  if (!Foot5) { return 0; }
  // Tillägg får göras med (0,022 + 0,02 × (F_geo − 1)) × (flow − 0,35) × Atemp
  return (0.022 + 0.02 * (F_geo - 1.0)) * (flow - 0.35) * atemp;
}

//============================
//=EPpet Calculation===========
//============================
function EPpet(house) {
  let total = 0.0;
  const F_geo = house.L.F_geo;
  const Atemp = house.Atemp;

  for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
    const heat = house.E.heat[i];
    const cool = house.E.cool[i];
    const watr = house.E.watr[i];
    const fast = house.E.fast[i];
    total += ((heat / F_geo) + cool + watr + fast) * (E_wght[i] / Atemp);
  }
  return Math.floor(total);
}

//============================
//=Limits Calculation=========
//============================
function limit(house) {
  const l = new LimitVals();
  const atemp = house.Atemp;
  const F_geo = house.L.F_geo;
  let flow  = house.flow;
  const qavg = house.qavg;

  if (house.type === HouseType.SMALL) {
    if (atemp > 130) {
      l.EP = 90.0;
      l.EL = elBase(F_geo) + el1(F_geo, atemp);
      l.UM = 0.30;
      l.LL = seSec;
    } else if (atemp > 90) {
      l.EP = 95.0;
      l.EL = elBase(F_geo) + el1(F_geo, atemp);
      l.UM = 0.30;
      l.LL = seSec;
    } else if (atemp > 50) {
      l.EP = 100.0;
      l.EL = elBase(F_geo) + el1(F_geo, atemp);
      l.UM = 0.30;
      l.LL = seSec;
    } else /* atemp >= 0 */ {
      l.EP = NoReq;
      l.EL = NoReq;
      l.UM = 0.33;
      l.LL = 0.60;
    }
  }
  else if (house.type === HouseType.MULTI) {
    if (atemp >= 0) {
      l.EP = 75.0 + ep4(F_geo, flow, qavg, atemp, house.foot4);
      l.EL = elBase(F_geo)
             + el1(F_geo, atemp)
             + el5(F_geo, flow, atemp, house.foot5);
      l.UM = 0.40;
      l.LL = seSec;
    }
  }
  else if (house.type === HouseType.LOCAL) {
    if (atemp > 50) {
      // Only add ep2(qavg) if foot2 is checked
      const ep_add = house.foot2 ? ep2(qavg) : 0;
      // Only add el3(...) if foot3 is checked
      const el_add = house.foot3 ? el3(F_geo, flow, atemp) : 0;

      l.EP = 70.0 + ep_add;
      l.EL = elBase(F_geo)
             + el1(F_geo, atemp)
             + el_add;
      l.UM = 0.50;
      l.LL = seSec;
    } else /* atemp >= 0 */ {
      l.EP = NoReq;
      l.EL = NoReq;
      l.UM = 0.33;
      l.LL = 0.60;
    }
  }

  return l;
}

//============================
//=Print House Data===========
//============================
function printHouse(house) {
  console.log(`House type: ${HouseType_name[house.type]}`);
  console.log(`Atemp: ${house.Atemp} m²`);
  console.log(`Location: ${house.L.name} (F_geo = ${house.L.F_geo.toFixed(2)})`);
  console.log(`Flow (q): ${house.flow.toFixed(2)}   qavg (q_medel): ${house.qavg.toFixed(2)}`);
  console.log(`Foot2: ${house.foot2 ? "Yes" : "No"}   Foot3: ${house.foot3 ? "Yes" : "No"}   Foot4: ${house.foot4 ? "Yes" : "No"}   Foot5: ${house.foot5 ? "Yes" : "No"}`);
  console.log("Energy use:");
  for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
    let line = "";
    if (house.E.heat[i] !== 0.0) line += `  ${E_name[i]} heat: ${house.E.heat[i].toFixed(1)}  `;
    if (house.E.cool[i] !== 0.0) line += `  ${E_name[i]} cool: ${house.E.cool[i].toFixed(1)}  `;
    if (house.E.watr[i] !== 0.0) line += `  ${E_name[i]} watr: ${house.E.watr[i].toFixed(1)}  `;
    if (house.E.fast[i] !== 0.0) line += `  ${E_name[i]} fast: ${house.E.fast[i].toFixed(1)}  `;
    if (line) console.log(line);
  }
  const ep = EPpet(house);
  console.log(`Calculated EP: ${ep}`);
  const lim = limit(house);
  console.log(`Limits → EP: ${lim.EP.toFixed(1)}, EL: ${lim.EL.toFixed(1)}, UM: ${lim.UM.toFixed(2)}, LL: ${lim.LL.toFixed(2)}`);
}

//============================
//=Main (example)=============
//============================
(function main() {
  // Create a House (Åland, SMALL, Atemp = 100)

	/*
  // Example inputs:
  const h = new House(HouseType.SMALL, 100, locations[1]);
  h.E.heat[EType.ELECTRIC]   = 120.0;
  h.E.cool[EType.FJARRKYLA]  = 40.0;
  h.flow     = 0.5;    // example instantaneous airflow (q)
  h.qavg     = 0.4;    // example average airflow (q_medel)
  h.foot2    = true;   // footnote‐2 applies (LOCAL)
  h.foot3    = true;   // footnote‐3 applies (LOCAL)
  h.foot4    = true;   // footnote‐4 applies (MULTI)
  h.foot5    = true;   // footnote‐5 applies (MULTI)

  printHouse(h);*/
})();
