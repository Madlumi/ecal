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
const epArrow  = $("ep_arrow");
const table = $("energyTable");
const ROOMS_TO_PERSONS = [1.42, 1.63, 2.18, 2.79, 3.51];

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
// LOCALIZATION
//========================
function detectLang() {
	const urlParams = new URLSearchParams(window.location.search);
	let lang = urlParams.get("lang") || "sv";
	if (!["sv","en","fi"].includes(lang)) lang = "sv";
	window.SELECTED_LANG = lang;
}

function getString(key) {
        if (typeof STRINGS === "undefined" || !STRINGS.hasOwnProperty(key)) { return "[no string found]"; }
        const entry = STRINGS[key];
        if (typeof entry === "string") { return entry; }
        const val = entry[window.SELECTED_LANG];
        if (val !== undefined) { return val; }
        if (entry.sv !== undefined) { return entry.sv; }
        return "";
}

function getPrintUiString(key) {
        if (typeof PRINT_UI_STRINGS === "undefined" || !PRINT_UI_STRINGS.hasOwnProperty(key)) { return "[no string found]"; }
        const entry = PRINT_UI_STRINGS[key];
        if (typeof entry === "string") { return entry; }
        const val = entry[window.SELECTED_LANG];
        if (val !== undefined) { return val; }
        if (entry.sv !== undefined) { return entry.sv; }
        return "";
}

function getPrintString(key) {
        if (typeof PRINT_STRINGS === "undefined" || !PRINT_STRINGS.hasOwnProperty(key)) { return "[no string found]"; }
        const entry = PRINT_STRINGS[key];
        if (typeof entry === "string") { return entry; }
        const val = entry[window.SELECTED_LANG];
        if (val !== undefined) { return val; }
        if (entry.sv !== undefined) { return entry.sv; }
        return "";
}

function setupHelp(iconId, boxId, key) {
	try {
		const icon = $(iconId);
		const box  = $(boxId);

		// Bail out if either element is missing
		if (!icon || !box) {
			console.warn(`setupHelp: missing element`, { iconId, boxId });
			return;
		}

		const txt = getString(key) || "";
		if (!txt) {
			// No help text → hide the icon
			icon.style.display = "none";
			return;
		}

		// We have help text: wire it up
		icon.textContent = getString("info_icon");
		icon.title = "";  // clear any old tooltip
		icon.onclick = () => {
			box.innerHTML = txt;
			box.style.display = box.style.display === "block" ? "none" : "block";
		};
	} catch (err) {
		console.error(`setupHelp(${iconId}, ${boxId}, ${key}) failed:`, err);
		// don't rethrow—just leave the icon hidden
		const icon = $(iconId);
		if (icon) icon.style.display = "none";
	}
}



function applyLanguage() {
	// Language‐selector opacity
	document.querySelectorAll(".lang-button").forEach(btn => { btn.style.opacity = btn.dataset.lang === window.SELECTED_LANG ? "1" : "0.5"; });

	const keys = [];
	const helpBases = []; 




	Object.keys(STRINGS).forEach(k => {
		const txt = getString(k).trim();  // strip whitespace
		if (k.endsWith("_help")) {
			// only register help if there's real content
			if (txt !== "") {
				helpBases.push(k.slice(0, -5)); // e.g. "geography_help" → "geography"
			}
		} else {
			// register every non-help key for UI rendering, even if empty
			keys.push(k);
		}
	});

	// 3) Apply all non‐help keys
        keys.forEach(key => {
                const el = $(key);
                if (!el) return;
                const str = getString(key) || "";

                // Some strings (for example EP\u2004labels) contain markup like
                // <sub>. We use innerHTML so those elements render correctly.
                // Be cautious about inserting untrusted text here as it would be
                // interpreted as HTML and could open an XSS vector.
                if (key === "disclaimer") {
                        el.innerHTML = str;
                        el.style.display = str ? "block" : "none";
                } else {
                        el.innerHTML = str;
                }
        });

        // 4) Ensure each help base has its icon & box, then hook them up
        helpBases.forEach(base => {
                const iconId = `${base}_help_icon`;
                const boxId  = `${base}_help`;

                let icon = $(iconId);
                let box  = $(boxId);

                // Insert missing elements after the label container if present,
                // otherwise after the base element itself
                const ref = $(`lbl_${base}`) ||
                            $(base);
                if (!ref) return; // nothing to attach to

                if (!icon) {
                        icon = document.createElement("span");
                        icon.className = "info-icon";
                        icon.id = iconId;
                        icon.setAttribute("aria-label", "Show help");
                        ref.parentNode.insertBefore(icon, ref.nextSibling);
                }

                if (!box) {
                        box = document.createElement("div");
                        box.className = "help-box";
                        box.id = boxId;
                        icon.parentNode.insertBefore(box, icon.nextSibling);
                }

                setupHelp(iconId, boxId, `${base}_help`);
        });
}

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
    if (rooms) rooms.addEventListener("input", () => {
        const r = parseInt(rooms.value, 10);
        if (dedPersonsVB) dedPersonsVB.setCalc(personsFromRooms(r).toFixed(2));
        update();
    });

	//clear
	clear.addEventListener("click", clearUI);
	//print
        print.addEventListener("click",()=>{
            const epv = calculate();
            const eplim = window.last_eplim || 0;
            window.location.href = `energyprint_new.html?ep=${epv}&housetype=${type.value}&eplim=${eplim}`;
        });
	//copy
        copy.addEventListener("click", () => {
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
        });
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
                        icon.setAttribute("aria-label", "Show help");
                        icon.onclick = () => {
				const box = $("energyRowHelpBox");
				if (box.innerHTML === helpText && box.style.display === "block") {
					box.style.display = "none";
				} else {
					box.innerHTML     = helpText;
					box.style.display = "block";
				}
			};
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
        const atv    = parseInt(at.value,10)||0;
        const fv     = parseFloat(fl.value)||0;
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

        const epv = EPpet(h) | 0;
        const lim = limit(h);
        window.last_eplim = lim.EP;

        if (epv > lim.EP) {
                outEP.innerHTML = `${getString("ep_label")} ${epv} <span class="warning-icon" title="${getString("warning_tooltip")}">⚠</span>`;
        } else {
                outEP.innerHTML = `${getString("ep_label")} ${epv}`;
        }

        epArrow.innerHTML = "";
        const cls = window.EPClass.classify(epv, lim.EP);
        if(cls){
                const color = window.EPClass.data[cls].colour;
                const arrow = document.createElement("div");
                arrow.className = "ep-arrow";
                arrow.style.backgroundColor = color;
                arrow.textContent = cls;
                const tri = document.createElement("div");
                tri.className = "triangle";
                tri.style.borderRightColor = color;
                arrow.appendChild(tri);
                epArrow.appendChild(arrow);
        }


	// --- populate limits table ---
	let epLimitDisp = (lim.EP === 999999999) ? getString("no_requirement") : lim.EP.toFixed(1);
	let elLimitDisp = (lim.EL === 999999999) ? getString("no_requirement") : lim.EL.toFixed(1);
	let umLimitDisp = lim.UM.toFixed(2);

	// LL: dash + toggle if -1, else the number
	let llCellHtml;
	if (lim.LL === -1) {
                llCellHtml = `– <span class="info-icon" id="llIcon" aria-label="Show help">${getString("info_icon")}</span>`;
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
		$("llIcon").addEventListener("click", () => {
			const hb = $("limitLLHelp");
			hb.style.display = hb.style.display === "block" ? "none" : "block";
		});
	}
	// --- end populate limits table ---

	// Build permalink
	const ps = new URLSearchParams();
	ps.set("geography",geo.value);
	ps.set("housetype",type.value);
        ps.set("atemp",atv);
        ps.set("tvv", tvvIdx);
	if(!isNaN(fv))ps.set("flow",fv);
	if(f2.checked)ps.set("foot2","1");
	if(f3.checked)ps.set("foot3","1");
	if(f4.checked)ps.set("foot4","1");
	if(f5.checked)ps.set("foot5","1");
	for (let i=0;i<EType.E_TYPE_COUNT;i++){
		if(h.E.heat[i])ps.set(`heat${i}`, h.E.heat[i]);
		if(h.E.cool[i])ps.set(`cool${i}`, h.E.cool[i]);
		if(h.E.watr[i])ps.set(`watr${i}`, h.E.watr[i]);
		if(h.E.fast[i])ps.set(`fast${i}`, h.E.fast[i]);
	}
        const newUrl = window.location.pathname + "?" + ps.toString();
        $("permalink").value = newUrl;
        history.replaceState(null, "", newUrl);
        return epv;
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
	prefillFromURL();

        registerListeners();

        update();
}

document.addEventListener("DOMContentLoaded", main);
