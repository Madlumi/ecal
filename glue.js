

    // 1) Populate geography select
    function getTableoptions() {
      const geoSelect = document.getElementById('geography');
      if (!geoSelect) return;
      geoSelect.innerHTML = '';
      locations.forEach((loc) => {
        const opt = document.createElement('option');
        opt.value = loc.name;
        opt.textContent = loc.name;
        geoSelect.appendChild(opt);
      });
    }

    // 2) Build the energy‐use table dynamically
    function getEnergyTable() {
      const table = document.getElementById('energyTable');
      if (!table) return;
      table.innerHTML = '';

      // Header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const cornerTh = document.createElement('th');
      cornerTh.textContent = 'Mätning \\ Källa';
      headerRow.appendChild(cornerTh);

      for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
        const th = document.createElement('th');
        th.textContent = E_name[i];
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Body rows
      const tbody = document.createElement('tbody');
      const measures = [
        { key: 'heat', label: 'Värme' },
        { key: 'cool', label: 'Kylning' },
        { key: 'watr', label: 'Vatten' },
        { key: 'fast', label: 'Snabba' }
      ];

      window.heatEls = {};
      window.coolEls = {};
      window.watrEls = {};
      window.fastEls = {};

      measures.forEach((measureObj) => {
        const { key: mKey, label: mLabel } = measureObj;
        const tr = document.createElement('tr');

        const labelTd = document.createElement('td');
        labelTd.textContent = mLabel;
        tr.appendChild(labelTd);

        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
          const td = document.createElement('td');
          const input = document.createElement('input');
          input.type = 'number';
          input.step = 'any';
          const sourceKey = E_name[i].toLowerCase().replace(/\s+/g, '_');
          input.id = `${mKey}-${sourceKey}`;
          input.name = `${mKey}-${sourceKey}`;
          td.appendChild(input);
          tr.appendChild(td);

          if (mKey === 'heat')   window.heatEls[i] = input;
          if (mKey === 'cool')   window.coolEls[i] = input;
          if (mKey === 'watr')   window.watrEls[i] = input;
          if (mKey === 'fast')   window.fastEls[i] = input;
        }

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
    }

    document.addEventListener('DOMContentLoaded', () => {
      getTableoptions();
      getEnergyTable();

      // References to form fields
      const houseTypeEl   = document.getElementById("housetype");
      const footnoteBox   = document.getElementById("footnoteBox");
      const foot4El       = document.getElementById("foot4");
      const foot5El       = document.getElementById("foot5");
      const flowEl        = document.getElementById("flow");

      const geoInfoIcon   = document.getElementById("geoInfo");
      const geoHelpBox    = document.getElementById("geoHelp");
      const typeInfoIcon  = document.getElementById("typeInfo");
      const typeHelpBox   = document.getElementById("typeHelp");
      const foot4InfoIcon = document.getElementById("foot4Info");
      const foot4HelpBox  = document.getElementById("foot4Help");
      const foot5InfoIcon = document.getElementById("foot5Info");
      const foot5HelpBox  = document.getElementById("foot5Help");

      // Toggle help-box display on click (native title shows on hover)
      geoInfoIcon.addEventListener("click", () => {
        geoHelpBox.style.display = (geoHelpBox.style.display === "none") ? "block" : "none";
      });
      typeInfoIcon.addEventListener("click", () => {
        typeHelpBox.style.display = (typeHelpBox.style.display === "none") ? "block" : "none";
      });
      foot4InfoIcon.addEventListener("click", () => {
        foot4HelpBox.style.display = (foot4HelpBox.style.display === "none") ? "block" : "none";
      });
      foot5InfoIcon.addEventListener("click", () => {
        foot5HelpBox.style.display = (foot5HelpBox.style.display === "none") ? "block" : "none";
      });

      // Show/hide footnote box when hustyp changes
      houseTypeEl.addEventListener("change", () => {
        const type = houseTypeEl.value;
        if (type === "MULTI") {
          footnoteBox.style.display = "block";
        } else {
          footnoteBox.style.display = "none";
          foot4El.checked = false;
          foot5El.checked = false;
          flowEl.value = "";
        }
      });

      // Other form references
      const geographyEl  = document.getElementById("geography");
      const atempEl      = document.getElementById("atemp");
      const permalinkEl  = document.getElementById("permalink");
      const printedEPEl  = document.getElementById("printedEP");
      const limitsTableEl= document.getElementById("limitsTable");
      const formEl       = document.getElementById("houseForm");
      const clearBtn     = document.getElementById("clearBtn");

      // Main calculate function
      function calculate() {
        const locName = geographyEl.value;
        const locationObj = locations.find(loc => loc.name === locName);

        const typeStr = houseTypeEl.value;
        const typeNum = HouseType[typeStr];

        const atemp = parseInt(atempEl.value, 10) || 0;
        let flow  = parseFloat(flowEl.value) || 0;
        const qavg  = parseFloat(flowEl.value) || 0;

        const foot4 = foot4El.checked;
        const foot5 = foot5El.checked;

        const h = new House(typeNum, atemp, locationObj);
        h.flow   = flow;
        h.qavg   = qavg;
        h.foot4  = foot4;
        h.foot5  = foot5;

        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
          h.E.heat[i] = parseFloat(heatEls[i].value) || 0;
          h.E.cool[i] = parseFloat(coolEls[i].value) || 0;
          h.E.watr[i] = parseFloat(watrEls[i].value) || 0;
          h.E.fast[i] = parseFloat(fastEls[i].value) || 0;
        }

        const ep = EPpet(h);
        const lim = limit(h);

        // Show EPₚₑₜ prominently, and show a red warning icon if ep > lim.EP
        if (ep > lim.EP) {
          printedEPEl.innerHTML = `EP<sub>pet</sub>: ${ep} <span class="warning-icon" title="Överskrider gräns">⚠</span>`;
        } else {
          printedEPEl.innerHTML = `EP<sub>pet</sub>: ${ep}`;
        }

        // Populate limits table
        limitsTableEl.innerHTML = `
          <tr><th>EP<sub>pet</sub> (kWh/m²·år)</th><td>${lim.EP.toFixed(1)}</td></tr>
          <tr><th>EL (kW)</th><td>${lim.EL.toFixed(1)}</td></tr>
          <tr><th>U<sub>m</sub> (W/m²·K)</th><td>${lim.UM.toFixed(2)}</td></tr>
          <tr><th>Luftläckage (l/s·m²)</th><td>${lim.LL.toFixed(2)}</td></tr>
        `;

        // Build permalink
        const params = new URLSearchParams();
        params.set("geography", locName);
        params.set("housetype", typeStr);
        params.set("atemp", atemp);
        if (!isNaN(flow)) params.set("flow", flow);
        if (foot4) params.set("foot4", "1");
        if (foot5) params.set("foot5", "1");
        for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
          if (h.E.heat[i] !== 0)  params.set(`heat${i}`, h.E.heat[i]);
          if (h.E.cool[i] !== 0)  params.set(`cool${i}`, h.E.cool[i]);
          if (h.E.watr[i] !== 0)  params.set(`watr${i}`, h.E.watr[i]);
          if (h.E.fast[i] !== 0)  params.set(`fast${i}`, h.E.fast[i]);
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
        permalinkEl.value = newUrl;
      }

      // Auto-calc when any input changes
      formEl.addEventListener("input", calculate);

      // Pre-fill from URL on load
      const qs = new URLSearchParams(window.location.search);
      if (qs.has("geography")) {
        geographyEl.value = qs.get("geography");
      }
      if (qs.has("housetype")) {
        houseTypeEl.value = qs.get("housetype");
        houseTypeEl.dispatchEvent(new Event("change"));
      }
      if (qs.has("atemp")) {
        atempEl.value = qs.get("atemp");
      }
      if (qs.has("flow")) {
        flowEl.value = qs.get("flow");
      }
      if (qs.has("foot4")) {
        foot4El.checked = qs.get("foot4") === "1";
      }
      if (qs.has("foot5")) {
        foot5El.checked = qs.get("foot5") === "1";
      }
      for (let i = 0; i < EType.E_TYPE_COUNT; i++) {
        if (qs.has(`heat${i}`)) {
          heatEls[i].value = qs.get(`heat${i}`);
        }
        if (qs.has(`cool${i}`)) {
          coolEls[i].value = qs.get(`cool${i}`);
        }
        if (qs.has(`watr${i}`)) {
          watrEls[i].value = qs.get(`watr${i}`);
        }
        if (qs.has(`fast${i}`)) {
          fastEls[i].value = qs.get(`fast${i}`);
        }
      }

      if ([...qs.keys()].length > 0) {
        calculate();
      }

      // Clear button resets the form and results
      clearBtn.addEventListener("click", () => {
        formEl.reset();
        footnoteBox.style.display = "none";
        geoHelpBox.style.display = "none";
        typeHelpBox.style.display = "none";
        foot4HelpBox.style.display = "none";
        foot5HelpBox.style.display = "none";
        document.getElementById("energyTable").querySelectorAll("input").forEach(inp => inp.value = "");
        printedEPEl.textContent = "";
        limitsTableEl.innerHTML = "";
        permalinkEl.value = "";
        window.history.replaceState(null, "", window.location.pathname);
      });
    });
