(function(){
  const EPClass = {
    data: {
      A: { range: [0, 0.5], colour: '#2ac02c', width: '20%' },
      B: { range: [0.5, 0.75], colour: '#6cc04a', width: '30%' },
      C: { range: [0.75, 1.0], colour: '#dbdb29', width: '40%' },
      D: { range: [1.0, 1.35], colour: '#f0b928', width: '50%' },
      E: { range: [1.35, 1.8], colour: '#f08d1c', width: '60%' },
      F: { range: [1.8, 2.35], colour: '#e65400', width: '70%' },
      G: { range: [2.35, Infinity], colour: '#d90000', width: '80%' }
    },
    values(eplim){
      const out = {};
      for(const [k,v] of Object.entries(this.data)){
        out[k] = {
          min: v.range[0]*eplim,
          max: v.range[1] === Infinity ? Infinity : v.range[1]*eplim,
          color: v.colour,
          width: v.width
        };
      }
      return out;
    },
    classify(ep,eplim){
      for(const [k,v] of Object.entries(this.data)){
        const lo = v.range[0]*eplim;
        const hi = v.range[1] === Infinity ? Infinity : v.range[1]*eplim;
        if(ep >= lo && ep <= hi) return k;
      }
      return '';
    }
  };

  function build(){
    const params = new URLSearchParams(window.location.search);
    const ep = parseFloat(params.get('ep')) || 0;
    const housetype = (params.get('housetype')||'').toUpperCase();
    const eplim = parseFloat(params.get('eplim')) || 0;

    const names = {SMALL:'Sm\u00e5hus', MULTI:'Flerbostadshus', LOCAL:'Lokalbyggnad'};
    const displayType = names[housetype] || 'Ok\u00e4nd typ';

    document.getElementById('ep-value').textContent = ep;
    document.getElementById('byggnadType').value = displayType;
    document.getElementById('housetype-label').textContent =
      'Skala f\u00f6r klassificering av energiprestanda: ' + displayType;

    const eptable = EPClass.values(eplim);
    const table = document.getElementById('ep-table');
    for(const [key,val] of Object.entries(eptable)){
      const tr = document.createElement('tr');

      const td1 = document.createElement('td');
      td1.textContent = val.max === Infinity ?
        `${Math.round(val.min)} \u2013` : `${Math.round(val.min)} \u2013 ${Math.round(val.max)}`;
      td1.style.textAlign = 'center';

      const td2 = document.createElement('td');
      td2.style.position = 'relative';
      td2.style.padding = '0';

      const bar = document.createElement('div');
      bar.classList.add('bar');
      bar.style.width = val.width;
      bar.style.backgroundColor = val.color;
      bar.textContent = key;

      const tri = document.createElement('div');
      tri.classList.add('triangle');
      tri.style.borderLeftColor = val.color;

      bar.appendChild(tri);
      td2.appendChild(bar);

      const td3 = document.createElement('td');
      td3.style.textAlign = 'center';
      td3.style.position = 'relative';
      if(ep >= val.min && ep <= val.max){
        const arrow = document.createElement('div');
        arrow.classList.add('selected-arrow');
        arrow.style.width = '100%';
        arrow.textContent = key;
        const triSel = document.createElement('div');
        triSel.classList.add('triangle-sel');
        arrow.appendChild(triSel);
        td3.appendChild(arrow);
      }

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      table.appendChild(tr);
    }

    const footer = document.createElement('tr');
    footer.innerHTML = `<td></td><td class="footer-cell" style="text-align:center;">H\u00f6g f\u00f6rbrukning</td><td></td>`;
    table.appendChild(footer);
  }

  if(typeof window !== 'undefined'){
    window.EPClass = EPClass;
    window.addEventListener('DOMContentLoaded', build);
  }

  if(typeof module !== 'undefined' && module.exports){
    module.exports = {EPClass};
  }
})();
