// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2025 Edvin svenblad

//========================
// DOM ELEMENT REFERENCES
//========================
const $ = id => document.getElementById(id);
const geo      = $("geography");
const type     = $("housetype");
const at       = $("atemp");
const rooms    = $("rooms");
const fl       = $("flow");
const tvvSel   = $("tvvType");
const atempError = $("atempError");
const flowError  = $("flowError");
const coolEnergyInput = $("coolEnergy");
const coolEnergyType  = $("coolEnergyType");
const fastEnergyInput = $("fastEnergy");
const fastEnergyType  = $("fastEnergyType");
const f2       = $("foot2");
const f3       = $("foot3");
const f4       = $("foot4");
const f5       = $("foot5");
const clear    	= $("clear_button");
const copy     	= $("copy_button");
const print       = $("print_button");    
const form     	  = $("houseForm");
const hourlyToggle = $("useHourly");
const hourlyContainer = $("hourlyToggleContainer");
const footnoteBox = $("footnoteBox");
const heatEnergyInput = $("heatEnergy");
const heatEnergyType = $("heatEnergyType");
const dedPersons = $("dedPersons");
const dedPersonHeat = $("dedPersonHeat");
const dedTimeHours = $("dedTimeHours");
const dedTimeDays = $("dedTimeDays");
const dedTimeWeeks = $("dedTimeWeeks");
const dedTimeLock = $("dedTimeLock");
let dedPersonsVB, dedPersonHeatVB, dedTimeHoursVB, dedTimeDaysVB, dedTimeWeeksVB;
const foot2Lbl    = $("lbl_foot2");
const foot3Lbl    = $("lbl_foot3");
const foot4Lbl    = $("lbl_foot4");
const foot5Lbl    = $("lbl_foot5");
const outEP    = $("ep_label"), limitsT  = $("limitsTable");
const epValue  = $("ep_value");
const epArrow  = $("ep_arrow");
const table = $("energyTable");

const MAX_ATEMP_INPUT = 100000; // reasonable upper limit for area
const MAX_FLOW_INPUT  = 5.0;    // l/s·m², beyond typical use

function requireConfigConst(name) {
  const val = CONFIG?.CONSTANTS?.[name];
  if (val === undefined) {
    throw new Error(`Missing CONFIG.CONSTANTS.${name}`);
  }
  return val;
}

const ROOMS_TO_PERSONS = requireConfigConst('ROOMS_TO_PERSONS');
const ARROW_LENGTH_IN = requireConfigConst('ARROW_LENGTH_IN');
const ARROW_LENGTH    = requireConfigConst('ARROW_LENGTH');
const NA_ARROW_COLOR  = requireConfigConst('NA_ARROW_COLOR');

// Lock improbable energy source combinations (none currently)
const LOCKED_COMBINATIONS = (typeof CONFIG !== 'undefined' && CONFIG.CONSTANTS && CONFIG.CONSTANTS.LOCKED_COMBINATIONS)
  ? CONFIG.CONSTANTS.LOCKED_COMBINATIONS
  : [];
window.LOCKED_COMBINATIONS = LOCKED_COMBINATIONS;

function personsFromRooms(n) {
    if (!n || n <= 0) return 0;
    if (n >= 5) return ROOMS_TO_PERSONS[4];
    return ROOMS_TO_PERSONS[n - 1];
}

function parseValidatedNumber(el, max, errorEl, errKey) {
    const num = parseFloat(el.value);
    if (isNaN(num) || num < 0 || num > max) {
        if (errorEl) {
            errorEl.textContent = getString(errKey);
            errorEl.style.display = 'block';
        }
        el.classList.add('invalid');
        return null;
    }
    if (errorEl) errorEl.style.display = 'none';
    el.classList.remove('invalid');
    return num;
}


//========================
// CLASS: ValueBox
//========================
class ValueBox {
  constructor(box, but, locked = true, allowToggle = true) {
    this.box = box;
    this.but = but;
    this.locked = locked;
    this.allowToggle = allowToggle;
    this.valueCalc = "";
    this.valueInp = "";
    if (this.allowToggle) {
      this.but.addEventListener("click", () => this.toggleLock());
    } else {
      this.but.style.display = "none";
      this.box.disabled = true;
    }
    this.updateVisual();
  }
  updateVisual() {
    if (this.allowToggle) {
      this.box.disabled = this.locked;
    } else {
      this.box.disabled = true;
    }
    if (this.locked) {
      this.box.classList.add("locked");
    } else {
      this.box.classList.remove("locked");
    }
    // show an icon on toggleable buttons
    if (this.allowToggle) {
      this.but.textContent = this.locked ? getString("calc_icon") : getString("pen_icon");
      const tip = this.locked ? getString("calc_tooltip") : getString("pen_tooltip");
      this.but.title = tip;
      this.but.setAttribute("aria-label", tip);
    }
  }
  setCalc(v) {
    this.valueCalc = v;
    if (this.locked) this.box.value = v;
  }
  toggleLock() {
    if (!this.allowToggle) return;
    if (this.locked) {
      this.valueCalc = this.box.value;
    } else {
      this.valueInp = this.box.value;
      this.box.value = this.valueCalc;
    }
    this.locked = !this.locked;
    this.updateVisual();
    calculate();
  }
  getValue() {
    return this.locked ? this.valueCalc : this.box.value;
  }
}




const flowContainer = $("flowContainer");

//========================
// INIT FUNCTIONS
//========================
function registerListeners(){
	//language select

	document.querySelectorAll(".lang-button").forEach(btn => {
		btn.addEventListener("click", () => {
			// grab either the full permalink's query or the current page's
			const src = $("permalink").value.split("?")[1] || location.search.slice(1);
			const q   = new URLSearchParams(src);
			q.set("lang", btn.dataset.lang);
			location.search = q;  // reloads preserving all other params + new lang
		});
	});




        type.addEventListener("change", update);
        if (tvvSel) tvvSel.addEventListener("change", update);
        form.addEventListener("input", update);
    if (heatEnergyInput) heatEnergyInput.addEventListener("input", update);
    if (heatEnergyType) heatEnergyType.addEventListener("change", update);
    if (coolEnergyInput) coolEnergyInput.addEventListener("input", update);
    if (coolEnergyType) coolEnergyType.addEventListener("change", update);
    if (fastEnergyInput) fastEnergyInput.addEventListener("input", update);
    if (fastEnergyType) fastEnergyType.addEventListener("change", update);
    [dedPersons,dedPersonHeat,dedTimeHours,dedTimeDays,dedTimeWeeks].forEach(el=>{ if(el) el.addEventListener("input", update);});
    if (hourlyToggle) hourlyToggle.addEventListener("change", update);
    if (rooms) rooms.addEventListener("input", hookRooms);

	//clear
	clear.addEventListener("click", clearUI);
	//print
        print.addEventListener("click", hookPrint);
	//copy
        copy.addEventListener("click", hookCopy);
}

function hookRooms() {
        const r = parseInt(rooms.value, 10);
        if (dedPersonsVB) dedPersonsVB.setCalc(personsFromRooms(r).toFixed(2));
        update();
}

function hookPrint() {
        const epv = calculate();
        const eplim = window.last_eplim || 0;
        window.location.href = `energyprint_new.html?ep=${epv}&housetype=${type.value}&eplim=${eplim}`;
}

function hookCopy() {
        const ta = $("permalink");
        const text = ta.value;
        const done = () => {
                copy.textContent = getString("copy_button") + " ✔";
                setTimeout(() => copy.textContent = getString("copy_button"), 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(() => {
                        ta.select(); ta.setSelectionRange(0, 99999);
                        document.execCommand("copy");
                        done();
                });
        } else {
                ta.select(); ta.setSelectionRange(0, 99999);
                document.execCommand("copy");
                done();
        }
}



function clearUI() {
        history.replaceState(null, "", location.pathname);
        prefillFromURL();
        update();
}





//========================
// INIT HELPERS
//========================
function loadGeography() {
        const sel = $("geography");
        sel.innerHTML = "";
        locations.forEach(loc => { sel.add(new Option(loc.name, loc.name)); });
}

function loadTvvDropdown() {
        if (!tvvSel) return;
        tvvSel.innerHTML = "";
        tvvFactors.forEach((f, idx) => { tvvSel.add(new Option(f.name, idx)); });
}
function loadEnergyTypeDropdown(sel) {
    if (!sel) return;
    sel.innerHTML = "";
    E_name.forEach((n, i) => { sel.add(new Option(n, i)); });
}


function loadEnergyTable() {
        const table = $("energyTable");
        table.innerHTML = "";

        // Prepare per-key arrays of ValueBox objects
        const measureKeys = ["heat","cool","watr","fast"];
        const measureBoxes  = {};
        measureKeys.forEach(k => measureBoxes[k] = []);

	// Header
	const thead = table.createTHead();
	const hr    = thead.insertRow();
        hr.insertCell().textContent = "";
        E_name.forEach(name => hr.insertCell().textContent = name);
        const calcCell = hr.insertCell();
        const calcSpan = document.createElement("span");
        calcSpan.id = "calc";
        calcSpan.textContent = getString("calc_icon");
        calcCell.appendChild(calcSpan);
        calcCell.title = getString("calc_help");

	const tbody = table.createTBody();
        const rowLocks = {};
        measureKeys.forEach(key => {
                const labelKey = `energy_row_${key}`;
                const helpKey  = `${labelKey}_help`;
                const row      = tbody.insertRow();
                const cell     = row.insertCell();

		// Row label
		cell.textContent = getString(labelKey);

		// Generate help
		const helpText = getString(helpKey).trim();
		if (helpText) {
                        const icon = document.createElement("span");
                        icon.className   = "info-icon";
                        icon.textContent = getString("info_icon");
                        icon.setAttribute("aria-label", getString("help_icon_label"));
                        icon.setAttribute("role", "button");
                        icon.tabIndex = 0;
                        const toggle = () => {
                                const box = $("energyRowHelpBox");
                                if (box.innerHTML === helpText && box.style.display === "block") {
                                        box.style.display = "none";
                                } else {
                                        box.innerHTML     = helpText;
                                        box.style.display = "block";
                                }
                        };
                        icon.onclick = toggle;
                        icon.addEventListener("keydown", ev => {
                                if (ev.key === "Enter" || ev.key === " ") {
                                        ev.preventDefault();
                                        toggle();
                                }
                        });
                        cell.appendChild(icon);
		}

                // add cells
                const lockRow = true;
                const rowBoxes = [];
                for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
                        const c = row.insertCell();
                        const id = `${key}-${E_name[i].toLowerCase().replace(/\s+/g, "_")}`;

                        const inp = Object.assign(document.createElement("input"), {
                                type: "number",
                                step: "any",
                                id,
                                name: id
                        });
                        const but = document.createElement("button"); // hidden button to satisfy ValueBox
                        const span = document.createElement("span");
                        span.className = "value-box";
                        span.appendChild(inp);
                        // button not shown for row-wise lock
                        const noToggle = LOCKED_COMBINATIONS.some(l => l.measureKey === key && l.sourceIndex === i);
                        const vb = new ValueBox(inp, but, lockRow || noToggle, !noToggle);
                        c.appendChild(span);
                        rowBoxes.push(vb);
                }
                const lockCell = row.insertCell();
                const chk = Object.assign(document.createElement("input"), {type:"checkbox", checked: lockRow});
                chk.addEventListener("change", () => {
                        rowBoxes.forEach(vb => {
                                if (!vb.allowToggle) return;
                                if (chk.checked) {
                                        vb.valueInp = vb.box.value;
                                        vb.box.value = vb.valueCalc;
                                } else {
                                        vb.valueCalc = vb.box.value;
                                }
                                vb.locked = chk.checked;
                                vb.updateVisual();
                        });
                        calculate();
                });
                lockCell.appendChild(chk);
                measureBoxes[key] = rowBoxes;
                rowLocks[key] = chk;
        });

        // Expose arrays on window
        window.heatEls = measureBoxes.heat;
        window.coolEls = measureBoxes.cool;
        window.watrEls = measureBoxes.watr;
        window.fastEls = measureBoxes.fast;
        window.rowLocks = rowLocks;

	// hide the row‐help box initially
        $("energyRowHelpBox").style.display = "none";
}

function initDeductions() {
    if (dedPersons) {
        const btn = dedPersons.parentElement.querySelector("button");
        dedPersonsVB = new ValueBox(dedPersons, btn, true, true);
    }
    if (dedPersonHeat) {
        const btn = dedPersonHeat.parentElement.querySelector("button");
        dedPersonHeatVB = new ValueBox(dedPersonHeat, btn, true, true);
    }
    if (dedTimeLock && dedTimeHours) {
        dedTimeHoursVB = new ValueBox(dedTimeHours, dedTimeLock, true, true);
    }
    if (dedTimeLock && dedTimeDays) {
        dedTimeDaysVB = new ValueBox(dedTimeDays, dedTimeLock, true, true);
    }
    if (dedTimeLock && dedTimeWeeks) {
        dedTimeWeeksVB = new ValueBox(dedTimeWeeks, dedTimeLock, true, true);
    }
}

//========================
// UPDATE FUNCTIONS
//========================

function updateFootnotes() {
  const t = type.value; // SMALL, MULTI or LOCAL

  if (t === "MULTI" || t === "LOCAL") {
    footnoteBox.style.display     = "block";
    flowContainer.style.display   = "block";

    // show 2 & 3 only for LOCAL
    foot2Lbl.style.display = t === "LOCAL" ? "inline-block" : "none";
    foot3Lbl.style.display = t === "LOCAL" ? "inline-block" : "none";

    // show 4 & 5 only for MULTI
    foot4Lbl.style.display = t === "MULTI" ? "inline-block" : "none";
    foot5Lbl.style.display = t === "MULTI" ? "inline-block" : "none";
  } else {
    footnoteBox.style.display   = "none";
    flowContainer.style.display = "none";
  }
}

function updateTvvRow() {
  if (!window.watrEls || !tvvSel) return;
  const htNum = HouseType[type.value];
  const atv   = parseInt(at.value,10) || 0;
  const idx   = parseInt(tvvSel.value,10) || 0;
  const entry = tvvFactors[idx] || tvvFactors[0];
  const val   = atv ? (TvvMult[htNum] * atv / entry.factor) : 0;
  for (let i=0;i<EType.E_TYPE_COUNT;i++) {
    const vb = window.watrEls[i];
    if (!vb) continue;
    if (i === entry.etype) {
      vb.setCalc(val ? val.toFixed(1) : "");
    } else {
      vb.setCalc("");
    }
  }
}
function updateDeductions() {
    if (!window.heatEls) return;
    const energy = parseFloat(heatEnergyInput.value) || 0;
    const idx = parseInt(heatEnergyType.value, 10) || 0;
    const persons = parseFloat(dedPersonsVB?.getValue()) || 0;
    const perHeat = parseFloat(dedPersonHeatVB?.getValue()) || 0;
    const hours = parseFloat(dedTimeHoursVB?.getValue()) || 0;
    const days = parseFloat(dedTimeDaysVB?.getValue()) || 0;
    const weeks = parseFloat(dedTimeWeeksVB?.getValue()) || 0;
    const ded = persons * perHeat * hours * days * weeks / 1000;
    const res = energy - ded;

    for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
        const vb = window.heatEls[i];
        if (!vb) continue;
        if (i === idx) {
            vb.setCalc(res ? res.toFixed(1) : "");
        } else if (window.rowLocks?.heat?.checked) {
            // clear previous source when row is locked
            vb.setCalc("");
        }
    }

    if (coolEnergyInput && coolEnergyType && window.coolEls) {
        const ce = parseFloat(coolEnergyInput.value) || 0;
        const ci = parseInt(coolEnergyType.value, 10) || 0;
        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
            const cvb = window.coolEls[i];
            if (!cvb) continue;
            if (i === ci) {
                cvb.setCalc(ce ? ce.toFixed(1) : "");
            } else if (window.rowLocks?.cool?.checked) {
                cvb.setCalc("");
            }
        }
    }

    if (fastEnergyInput && fastEnergyType && window.fastEls) {
        const fe = parseFloat(fastEnergyInput.value) || 0;
        const fi = parseInt(fastEnergyType.value, 10) || 0;
        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
            const fvb = window.fastEls[i];
            if (!fvb) continue;
            if (i === fi) {
                fvb.setCalc(fe ? fe.toFixed(1) : "");
            } else if (window.rowLocks?.fast?.checked) {
                fvb.setCalc("");
            }
        }
    }
}

// Convenience wrapper that refreshes all computed values
function update() {
    updateFootnotes();
    updateDeductions();
    calculate();
}



//Connect to energy.js and display output, and build the perma link
function calculate() {
        updateTvvRow();
        const locObj = locations.find(l=>l.name===geo.value);
        const htNum  = HouseType[type.value];
        const atv    = parseValidatedNumber(at, MAX_ATEMP_INPUT, atempError, 'atemp_error') ?? 0;
        const fv     = parseValidatedNumber(fl, MAX_FLOW_INPUT, flowError, 'flow_error') ?? 0;
        const tvvIdx = parseInt(tvvSel.value,10) || 0;
        const h      = new House(htNum, atv, locObj, tvvFactors[tvvIdx]);
	h.flow = fv; h.qavg = fv;
	h.foot2 = f2.checked; h.foot3 = f3.checked;
	h.foot4 = f4.checked; h.foot5 = f5.checked;



        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
                h.E.heat[i] = parseFloat( window.heatEls[i]?.getValue() ) || 0;
                h.E.cool[i] = parseFloat( window.coolEls[i]?.getValue() ) || 0;
                h.E.watr[i] = parseFloat( window.watrEls[i]?.getValue() ) || 0;
                h.E.fast[i] = parseFloat( window.fastEls[i]?.getValue() ) || 0;
        }

        const useHourly = hourlyToggle && hourlyToggle.checked;
        const epRaw = useHourly && typeof hourlyEPpet === 'function' ? hourlyEPpet(h) : EPpet(h);
        const epv = epRaw | 0;
        const lim = limit(h);
        window.last_eplim = lim.EP;

        outEP.innerHTML = getString("ep_label");
        if (epv > lim.EP) {
                epValue.innerHTML = `${epv} <span class="warning-icon" title="${getString("warning_tooltip")}">⚠</span>`;
        } else {
                epValue.textContent = epv;
        }

        epArrow.innerHTML = "";
        const noReqArrow = CONFIG.FEATURES.NOREQ_NACLASS &&
                           lim.EP >= CONFIG.CONSTANTS.NOREQ_VALUE;
        if (noReqArrow) {
                const arrow = document.createElement("div");
                arrow.className = "ep-arrow";
                arrow.style.backgroundColor = NA_ARROW_COLOR;
                arrow.style.width = ARROW_LENGTH;
                arrow.textContent = getString("na_label");
                const tri = document.createElement("div");
                tri.className = "triangle";
                tri.style.borderRightColor = NA_ARROW_COLOR;
                arrow.appendChild(tri);
                epArrow.appendChild(arrow);
        } else {
                const cls = window.EPClass.classify(epv, lim.EP);
                if (cls) {
                        const color = window.EPClass.data[cls].colour;
                        const arrow = document.createElement("div");
                        arrow.className = "ep-arrow";
                        arrow.style.backgroundColor = color;
                        arrow.style.width = ARROW_LENGTH;
                        arrow.textContent = `${cls}(${epv}/${Math.round(lim.EP)})`;
                        const tri = document.createElement("div");
                        tri.className = "triangle";
                        tri.style.borderRightColor = color;
                        arrow.appendChild(tri);
                        epArrow.appendChild(arrow);
                }
        }


	// --- populate limits table ---
        let epLimitDisp = (lim.EP === CONFIG.CONSTANTS.NOREQ_VALUE) ?
                getString("no_requirement") : lim.EP.toFixed(1);
        let elLimitDisp = (lim.EL === CONFIG.CONSTANTS.NOREQ_VALUE) ?
                getString("no_requirement") : lim.EL.toFixed(1);
	let umLimitDisp = lim.UM.toFixed(2);

	// LL: dash + toggle if -1, else the number
	let llCellHtml;
	if (lim.LL === -1) {
                llCellHtml = `– <span class="info-icon" id="llIcon" aria-label="${getString("help_icon_label")}" role="button" tabindex="0">${getString("info_icon")}</span>`;
        } else {
                llCellHtml = lim.LL.toFixed(2);
        }

	limitsTable.innerHTML = `
  <tr><th>${getString("limit_ep")}</th><td>${epLimitDisp}</td></tr>
  <tr><th>${getString("limit_el")}</th><td>${elLimitDisp}</td></tr>
  <tr><th>${getString("limit_um")}</th><td>${umLimitDisp}</td></tr>
  <tr><th>${getString("limit_ll")}</th><td>${llCellHtml}</td></tr>
`;

	// If LL was –1, hook up the help-box toggle
	if (lim.LL === -1) {
		// remove old help-box if present
		const old = $("limitLLHelp");
		if (old) old.remove();

		// insert new help-box right after the table
		const helpDiv = document.createElement("div");
		helpDiv.id = "limitLLHelp";
		helpDiv.className = "help-box";
		helpDiv.style.marginTop = "0.5rem";
		helpDiv.innerHTML = getString("limit_ll_help");
		limitsTable.parentNode.insertBefore(helpDiv, limitsTable.nextSibling);

		// toggle visibility when “?” clicked
                const llIconEl = $("llIcon");
                const toggle = () => {
                        const hb = $("limitLLHelp");
                        hb.style.display = hb.style.display === "block" ? "none" : "block";
                };
                llIconEl.addEventListener("click", toggle);
                llIconEl.addEventListener("keydown", ev => {
                        if (ev.key === "Enter" || ev.key === " ") {
                                ev.preventDefault();
                                toggle();
                        }
                });

	}
	// --- end populate limits table ---

        const newUrl = buildPermalink(h);
        $("permalink").value = newUrl;
        history.replaceState(null, "", newUrl);
        return epv;
}

// Build the permalink URL from current inputs
function buildPermalink(house) {
        const atv = parseValidatedNumber(at, MAX_ATEMP_INPUT, atempError, 'atemp_error') ?? 0;
        const fv = parseValidatedNumber(fl, MAX_FLOW_INPUT, flowError, 'flow_error') ?? 0;
        const tvvIdx = parseInt(tvvSel.value, 10) || 0;

        const ps = new URLSearchParams();
        ps.set("geography", geo.value);
        ps.set("housetype", type.value);
        ps.set("atemp", atv);
        ps.set("tvv", tvvIdx);
        if (!isNaN(fv)) ps.set("flow", fv);
        if (f2.checked) ps.set("foot2", "1");
        if (f3.checked) ps.set("foot3", "1");
        if (f4.checked) ps.set("foot4", "1");
        if (f5.checked) ps.set("foot5", "1");
        if (hourlyToggle && hourlyToggle.checked) ps.set("hourly", "1");
        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
                if (house.E.heat[i]) ps.set(`heat${i}`, house.E.heat[i]);
                if (house.E.cool[i]) ps.set(`cool${i}`, house.E.cool[i]);
                if (house.E.watr[i]) ps.set(`watr${i}`, house.E.watr[i]);
                if (house.E.fast[i]) ps.set(`fast${i}`, house.E.fast[i]);
        }
        return window.location.pathname + "?" + ps.toString();
}



//========================
// URL PREFILL
//========================
function prefillFromURL() {
        const params = new URLSearchParams(window.location.search);

        geo.value = params.get("geography") || "Åland";
        type.value = params.get("housetype") || "SMALL";
        at.value = params.get("atemp") || "";
        rooms.value = params.get("rooms") || "0";
        const r = parseInt(rooms.value, 10) || 0;
        if (dedPersonsVB) dedPersonsVB.setCalc(personsFromRooms(r).toFixed(2));
        fl.value = params.get("flow") || "";
        if (tvvSel) tvvSel.value = params.get("tvv") || "0";

        // deduction defaults
        const perHeatDef = params.get("perheat") ||
          (typeof CONFIG !== 'undefined' && CONFIG.CONSTANTS ? CONFIG.CONSTANTS.PERSON_HEAT : "");
        if (dedPersonHeatVB) dedPersonHeatVB.setCalc(perHeatDef);
        if (dedTimeHoursVB) dedTimeHoursVB.setCalc(dedTimeHours.value);
        if (dedTimeDaysVB) dedTimeDaysVB.setCalc(dedTimeDays.value);
        if (dedTimeWeeksVB) dedTimeWeeksVB.setCalc(dedTimeWeeks.value);

	// foot2–foot5 checkboxes: default false if no "1"
        [f2, f3, f4, f5].forEach((el, idx) => { el.checked = params.get(`foot${idx + 2}`) === "1"; });

        if (hourlyToggle) hourlyToggle.checked = params.get("hourly") === "1";

	// energy inputs: heat0, heat1, … cool0, … etc.
        ["heat","cool","watr","fast"].forEach(key => {
                for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
                        const paramName = `${key}${i}`;
                        const val = params.get(paramName);
                        const vb = window[`${key}Els`]?.[i];
                        if (!vb) continue;
                        vb.box.value = val !== null ? val : "";
                }
        });
}

//========================
// ENTRY POINT
//========================
function main(){
        detectLang()
        applyLanguage();

    loadGeography();
        loadEnergyTable();
    initDeductions();
        applyLanguage(); // add help icons for dynamically created elements
        loadTvvDropdown();

    loadEnergyTypeDropdown(heatEnergyType);
    loadEnergyTypeDropdown(coolEnergyType);
    loadEnergyTypeDropdown(fastEnergyType);
    if (hourlyContainer) {
        const hasFeature = typeof CONFIG !== 'undefined' && CONFIG.FEATURES && CONFIG.FEATURES.HOURLY_MODEL;
        hourlyContainer.style.display = hasFeature ? "block" : "none";
        if (hasFeature && typeof validateHourlyModel === 'function') {
            console.log('Hourly model validation', validateHourlyModel());
        }
    }
    prefillFromURL();

        registerListeners();

        update();
}

document.addEventListener("DOMContentLoaded", main);
