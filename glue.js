// =====================
// 
// Manage the dom
// 
// =====================
const geo      = document.getElementById("geography");
const type     = document.getElementById("housetype");
const at       = document.getElementById("atemp");
const fl       = document.getElementById("flow");
const f2       = document.getElementById("foot2");
const f3       = document.getElementById("foot3");
const f4       = document.getElementById("foot4");
const f5       = document.getElementById("foot5");
const clear    	= document.getElementById("clear_button");
const copy     	= document.getElementById("copy_button");
const print       = document.getElementById("print_button");    
const form     	  = document.getElementById("houseForm");
const footnoteBox = document.getElementById("footnoteBox");
const foot2Lbl    = document.getElementById("lbl_foot2");
const foot3Lbl    = document.getElementById("lbl_foot3");
const foot4Lbl    = document.getElementById("lbl_foot4");
const foot5Lbl    = document.getElementById("lbl_foot5");
const heatEls  = window.heatEls, coolEls  = window.coolEls, watrEls  = window.watrEls, fastEls  = window.fastEls;
const outEP    = document.getElementById("ep_label"), limitsT  = document.getElementById("limitsTable");
const table = document.getElementById("energyTable");



const flowContainer = document.getElementById("flowContainer");

function detectLang() {
	const urlParams = new URLSearchParams(window.location.search);
	let lang = urlParams.get("lang") || "sv";
	if (!["sv","en","fi"].includes(lang)) lang = "sv";
	window.SELECTED_LANG = lang;
}


function registerListeners(){
	//language select

	document.querySelectorAll(".lang-button").forEach(btn => {
		btn.addEventListener("click", () => {
			// grab either the full permalink's query or the current page's
			const src = document.getElementById("permalink").value.split("?")[1] || location.search.slice(1);
			const q   = new URLSearchParams(src);
			q.set("lang", btn.dataset.lang);
			location.search = q;  // reloads preserving all other params + new lang
		});
	});




	type.addEventListener("change", updateFootnotes);
	form.addEventListener("input", calculate);

	//clear
	clear.addEventListener("click", clearUI);
	//print
	print.addEventListener("click",()=>{ window.location.href = `energyprint.html?ep=${calculate()}&housetype=${type.value}`; });
	//copy
	copy.addEventListener("click",()=>{
		const ta=document.getElementById("permalink");
		ta.select(); ta.setSelectionRange(0,99999);
		document.execCommand("copy");
		copy.textContent=getString("copy_button")+" ✔";
		setTimeout(()=>copy.textContent=getString("copy_button"),1500);
	});
}



function clearUI() {
	history.replaceState(null, "", location.pathname);
	prefillFromURL();
	updateFootnotes();
	calculate();
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

function setupHelp(iconId, boxId, key) {
	try {
		const icon = document.getElementById(iconId);
		const box  = document.getElementById(boxId);

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
		const icon = document.getElementById(iconId);
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
		const el = document.getElementById(key);
		if (!el) return;
		const str = getString(key) || "";

		if (key === "disclaimer") {
			el.innerHTML = str;
			el.style.display = str ? "block" : "none";
		} else {
			el.innerHTML = str;
		}
	});

	// 4) Attach help popups only for bases that had non‐empty help text
	helpBases.forEach(base => {
		setupHelp(
			`${base}_help_icon`,
			`${base}_help`,
			`${base}_help`
		);
	});
}

// =====================
// Populate elements
// =====================
function loadGeography() {
	const sel = document.getElementById("geography");
	sel.innerHTML = "";
	locations.forEach(loc => { sel.add(new Option(loc.name, loc.name)); });
}

function loadEnergyTable() {
	const table = document.getElementById("energyTable");
	table.innerHTML = "";

	// Prepare your per‐key element‐arrays dynamically
	const measureKeys = ["heat","cool","watr","fast"];
	const measureEls  = {};
	measureKeys.forEach(k => measureEls[k] = []);

	// Header
	const thead = table.createTHead();
	const hr    = thead.insertRow();
	hr.insertCell().textContent = "";
	E_name.forEach(name => hr.insertCell().textContent = name);

	const tbody = table.createTBody();
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
			icon.onclick = () => {
				const box = document.getElementById("energyRowHelpBox");
				if (box.innerHTML === helpText && box.style.display === "block") {
					box.style.display = "none";
				} else {
					box.innerHTML     = helpText;
					box.style.display = "block";
				}
			};
			cell.appendChild(icon);
		}

		//add cells
		for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
			const c = row.insertCell();
			const id = `${key}-${E_name[i].toLowerCase().replace(/\s+/g, "_")}`;
			const inp = Object.assign( document.createElement("input"), { type: "number", step: "any", id, name: id });
			if (LOCKED_COMBINATIONS.some(l => l.measureKey === key && l.sourceIndex === i)) { inp.disabled = true; }
			c.appendChild(inp);
			measureEls[key].push(inp);
		}
	});

	// Expose for later use on window if you still need the globals
	window.heatEls = measureEls.heat;
	window.coolEls = measureEls.cool;
	window.watrEls = measureEls.watr;
	window.fastEls = measureEls.fast;

	// hide the row‐help box initially
	document.getElementById("energyRowHelpBox").style.display = "none";
}
//expandable footnote additon box

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


//Connect to energy.js and display output, and build the perma link
function calculate() {
	const locObj = locations.find(l=>l.name===geo.value);
	const htNum  = HouseType[type.value];
	const atv    = parseInt(at.value,10)||0;
	const fv     = parseFloat(fl.value)||0;
	const h      = new House(htNum, atv, locObj);
	h.flow = fv; h.qavg = fv;
	h.foot2 = f2.checked; h.foot3 = f3.checked;
	h.foot4 = f4.checked; h.foot5 = f5.checked;



	for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
		h.E.heat[i] = parseFloat( window.heatEls[i]?.value ) || 0;
		h.E.cool[i] = parseFloat( window.coolEls[i]?.value ) || 0;
		h.E.watr[i] = parseFloat( window.watrEls[i]?.value ) || 0;
		h.E.fast[i] = parseFloat( window.fastEls[i]?.value ) || 0;
	}

	const epv = EPpet(h) | 0;
	const lim = limit(h);

	if (epv > lim.EP) {
		outEP.innerHTML = `${getString("ep_label")} ${epv} <span class="warning-icon" title="${getString("warning_tooltip")}">⚠</span>`;
	} else {
		outEP.innerHTML = `${getString("ep_label")} ${epv}`;
	}


	// --- populate limits table ---
	let epLimitDisp = (lim.EP === 9999) ? getString("no_requirement") : lim.EP.toFixed(1);
	let elLimitDisp = (lim.EL === 9999) ? getString("no_requirement") : lim.EL.toFixed(1);
	let umLimitDisp = lim.UM.toFixed(2);

	// LL: dash + toggle if -1, else the number
	let llCellHtml;
	if (lim.LL === -1) {
		llCellHtml = `– <span class="info-icon" id="llIcon">${getString("info_icon")}</span>`;
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
		const old = document.getElementById("limitLLHelp");
		if (old) old.remove();

		// insert new help-box right after the table
		const helpDiv = document.createElement("div");
		helpDiv.id = "limitLLHelp";
		helpDiv.className = "help-box";
		helpDiv.style.marginTop = "0.5rem";
		helpDiv.innerHTML = getString("limit_ll_help");
		limitsTable.parentNode.insertBefore(helpDiv, limitsTable.nextSibling);

		// toggle visibility when “?” clicked
		document.getElementById("llIcon").addEventListener("click", () => {
			const hb = document.getElementById("limitLLHelp");
			hb.style.display = hb.style.display === "block" ? "none" : "block";
		});
	}
	// --- end populate limits table ---

	// Build permalink
	const ps = new URLSearchParams();
	ps.set("geography",geo.value);
	ps.set("housetype",type.value);
	ps.set("atemp",atv);
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
	document.getElementById("permalink").value = window.location.pathname + "?" + ps;
	return epv;
}






// 
function prefillFromURL() {
	const params = new URLSearchParams(window.location.search);

	geo.value = params.get("geography") || "Åland";
	type.value = params.get("housetype") || "SMALL";
	at.value = params.get("atemp") || "";
	fl.value = params.get("flow") || "";

	// foot2–foot5 checkboxes: default false if no "1"
	[f2, f3, f4, f5].forEach((el, idx) => { el.checked = params.get(`foot${idx + 2}`) === "1"; });

	// energy inputs: heat0, heat1, … cool0, … etc.
	["heat","cool","watr","fast"].forEach(key => {
		for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
			const paramName = `${key}${i}`;
			const val = params.get(paramName);
			// build the same id you used in getEnergyTable()
			const id = `${key}-${E_name[i].toLowerCase().replace(/\s+/g,"_")}`;
			const inp = document.getElementById(id);
			if (!inp) continue;
			inp.value = val !== null ? val : "";
		}
	});
}



function main(){
	detectLang()
	applyLanguage();

    loadGeography();
	loadEnergyTable();

	prefillFromURL();

	registerListeners();

	updateFootnotes();
	calculate();
}

document.addEventListener("DOMContentLoaded", main);
